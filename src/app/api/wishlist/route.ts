import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { addToWishlistSchema } from '@/lib/validations/cart';

/**
 * GET /api/wishlist - получить вишлист текущего пользователя
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      // Для неавторизованных пользователей возвращаем пустой вишлист
      return NextResponse.json({
        wishlist: {
          id: null,
          items: [],
          totalItems: 0,
        },
      });
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isMain: true },
                  take: 1,
                  orderBy: { order: 'asc' },
                },
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
                brand: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
                warehouseStocks: {
                  take: 1,
                  include: {
                    warehouse: {
                      select: {
                        id: true,
                        name: true,
                        city: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!wishlist) {
      return NextResponse.json({
        wishlist: {
          id: null,
          items: [],
          totalItems: 0,
        },
      });
    }

    // Форматируем элементы вишлиста
    const formattedItems = wishlist.items.map((item) => {
      const product = item.product;
      const price = Number(product.price);
      const discountValue = Number(product.discountValue);
      let finalPrice = price;

      if (discountValue > 0) {
        if (product.discountType === 'PERCENT') {
          finalPrice = price * (1 - discountValue / 100);
        } else {
          finalPrice = Math.max(0, price - discountValue);
        }
      }

      const mainImage = product.images.find(img => img.isMain) || product.images[0];
      const totalStock = product.warehouseStocks.reduce((sum, ws) => sum + ws.quantity, 0);

      // Определяем бейджи
      const badges: Array<{ text: string; variant: 'orange' | 'green' | 'blue' | 'gray' | 'yellow' }> = [];

      if (discountValue > 0) {
        const discountPercent = product.discountType === 'PERCENT'
          ? discountValue
          : Math.round((discountValue / price) * 100);
        badges.push({ text: `-${discountPercent}%`, variant: 'orange' });
      }

      if (product.isHit) {
        badges.push({ text: 'Хит', variant: 'gray' });
      }

      if (product.isNew) {
        badges.push({ text: 'NEW', variant: 'orange' });
      }

      if (totalStock > 0) {
        badges.push({ text: 'В наличии', variant: 'green' });
      }

      return {
        id: item.id,
        productId: product.id,
        createdAt: item.createdAt.toISOString(),
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price: Math.round(price),
          finalPrice: Math.round(finalPrice),
          oldPrice: finalPrice !== price ? Math.round(price) : null,
          discountValue: discountValue > 0 ? discountValue : null,
          discountType: product.discountType,
          rating: product.rating,
          reviewCount: product.reviewCount,
          image: mainImage?.url || null,
          category: product.category,
          brand: product.brand,
          inStock: totalStock > 0,
          totalStock,
          badges,
        },
      };
    });

    return NextResponse.json({
      wishlist: {
        id: wishlist.id,
        items: formattedItems,
        totalItems: formattedItems.length,
      },
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wishlist/items - добавить товар в вишлист
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = addToWishlistSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Некорректные данные' },
        { status: 400 }
      );
    }

    const { productId } = validation.data;

    // Проверяем существование товара
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true, isDraft: false },
      include: {
        images: {
          where: { isMain: true },
          take: 1,
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    // Находим или создаем вишлист пользователя
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.userId },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: {
          userId: session.userId,
        },
      });
    }

    // Проверяем, есть ли уже такой товар в вишлисте
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: 'Товар уже в вишлисте' },
        { status: 400 }
      );
    }

    // Создаем новый элемент вишлиста
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        userId: session.userId,
        productId,
      },
      include: {
        product: {
          include: {
            images: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
      },
    });

    // Вычисляем цену товара
    const price = Number(product.price);
    const discountValue = Number(product.discountValue);
    let finalPrice = price;

    if (discountValue > 0) {
      if (product.discountType === 'PERCENT') {
        finalPrice = price * (1 - discountValue / 100);
      } else {
        finalPrice = Math.max(0, price - discountValue);
      }
    }

    const mainImage = product.images[0];

    return NextResponse.json({
      success: true,
      item: {
        id: wishlistItem.id,
        productId: wishlistItem.product.id,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price: Math.round(price),
          finalPrice: Math.round(finalPrice),
          image: mainImage?.url || null,
        },
      },
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}
