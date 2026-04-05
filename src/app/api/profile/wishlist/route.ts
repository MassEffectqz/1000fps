import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

/**
 * GET /api/profile/wishlist
 * Получить список товаров в вишлисте
 */
export async function GET(request: NextRequest) {
  try {
    // Получаем токен из cookies
    const token = request.cookies.get('session')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Требуется аутентификация' },
        { status: 401 }
      );
    }

    // Проверяем сессию
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { error: 'Невалидная сессия' },
        { status: 401 }
      );
    }

    // Получаем вишлист пользователя
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
                price: true,
                oldPrice: true,
                discountType: true,
                discountValue: true,
                stock: true,
                rating: true,
                reviewCount: true,
                isFeatured: true,
                isNew: true,
                isHit: true,
                isActive: true,
                brand: {
                  select: { id: true, name: true, slug: true },
                },
                category: {
                  select: { id: true, name: true, slug: true },
                },
                images: {
                  where: { isMain: true },
                  select: { url: true },
                  take: 1,
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Если вишлиста нет, создаем пустой
    if (!wishlist) {
      return NextResponse.json({
        success: true,
        items: [],
      });
    }

    return NextResponse.json({
      success: true,
      items: wishlist.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        createdAt: item.createdAt,
        product: item.product,
      })),
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении вишлиста' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile/wishlist
 * Добавить товар в вишлист
 *
 * Body: { productId }
 */
export async function POST(request: NextRequest) {
  try {
    // Получаем токен из cookies
    const token = request.cookies.get('session')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Требуется аутентификация' },
        { status: 401 }
      );
    }

    // Проверяем сессию
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { error: 'Невалидная сессия' },
        { status: 401 }
      );
    }

    // Получаем тело запроса
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'productId обязателен' },
        { status: 400 }
      );
    }

    // Проверяем существование товара
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    // Получаем или создаем вишлист
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

    // Проверяем, есть ли уже товар в вишлисте
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
        { error: 'Товар уже в вишлисте', item: existingItem },
        { status: 409 }
      );
    }

    // Добавляем товар в вишлист
    const item = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        userId: session.userId,
        productId,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            oldPrice: true,
            images: {
              where: { isMain: true },
              select: { url: true },
              take: 1,
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      item,
      message: 'Товар добавлен в вишлист',
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return NextResponse.json(
      { error: 'Ошибка при добавлении в вишлист' },
      { status: 500 }
    );
  }
}
