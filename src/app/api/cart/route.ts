import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-helpers';
import { addToCartSchema } from '@/lib/validations/cart';

/**
 * GET /api/cart - получить корзину текущего пользователя
 */
export async function GET() {
  try {
    const session = await getSession();
    
    // Для авторизованных пользователей
    if (session?.userId) {
      const cart = await prisma.cart.findUnique({
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
                    include: {
                      warehouse: {
                        select: {
                          id: true,
                          name: true,
                          address: true,
                          city: true,
                          phone: true,
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

      if (!cart) {
        return NextResponse.json({
          cart: {
            id: null,
            items: [],
            totalItems: 0,
            totalPrice: 0,
          },
        });
      }

      // Форматируем элементы корзины
      const formattedItems = cart.items.map((item) => {
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
        
        // Находим наличие на выбранном складе или берем первое доступное
        const warehouseStock = item.warehouseId 
          ? product.warehouseStocks.find(ws => ws.warehouseId === item.warehouseId)
          : product.warehouseStocks[0];

        return {
          id: item.id,
          productId: product.id,
          quantity: item.quantity,
          warehouseId: item.warehouseId,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            price: Math.round(price),
            finalPrice: Math.round(finalPrice),
            image: mainImage?.url || null,
            category: product.category,
            brand: product.brand,
            inStock: (warehouseStock?.quantity || 0) > 0,
            availableQuantity: warehouseStock?.quantity || 0,
            warehouse: warehouseStock?.warehouse || null,
          },
        };
      });

      const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = cart.items.reduce((sum, item) => {
        const price = Number(item.product.price);
        const discountValue = Number(item.product.discountValue);
        let finalPrice = price;

        if (discountValue > 0) {
          if (item.product.discountType === 'PERCENT') {
            finalPrice = price * (1 - discountValue / 100);
          } else {
            finalPrice = Math.max(0, price - discountValue);
          }
        }

        return sum + finalPrice * item.quantity;
      }, 0);

      return NextResponse.json({
        cart: {
          id: cart.id,
          items: formattedItems,
          totalItems,
          totalPrice: Math.round(totalPrice),
        },
      });
    }

    // Для неавторизованных пользователей (гостевая корзина)
    // Возвращаем пустую корзину - данные будут в localStorage на клиенте
    return NextResponse.json({
      cart: {
        id: null,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart/items - добавить товар в корзину
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
    const validation = addToCartSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Некорректные данные' },
        { status: 400 }
      );
    }

    const { productId, quantity, warehouseId } = validation.data;

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

    // Проверяем наличие на складе, если указан warehouseId
    if (warehouseId) {
      const warehouseStock = await prisma.warehouseStock.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId,
            productId,
          },
        },
      });

      if (!warehouseStock || warehouseStock.quantity < quantity) {
        return NextResponse.json(
          { error: 'Недостаточно товара на выбранном складе' },
          { status: 400 }
        );
      }
    }

    // Находим или создаем корзину пользователя
    let cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: session.userId,
        },
      });
    }

    // Проверяем, есть ли уже такой товар в корзине
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    let cartItem;

    if (existingItem) {
      // Обновляем количество
      const newQuantity = existingItem.quantity + quantity;

      // Проверяем наличие на складе при обновлении
      const stockWarehouseId = warehouseId || existingItem.warehouseId;
      if (stockWarehouseId) {
        const warehouseStock = await prisma.warehouseStock.findUnique({
          where: {
            warehouseId_productId: {
              warehouseId: stockWarehouseId,
              productId,
            },
          },
        });

        if (!warehouseStock || warehouseStock.quantity < newQuantity) {
          return NextResponse.json(
            { error: 'Недостаточно товара на складе для обновления количества' },
            { status: 400 }
          );
        }
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          warehouseId: warehouseId || existingItem.warehouseId,
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
    } else {
      // Создаем новый элемент
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          userId: session.userId,
          productId,
          quantity,
          warehouseId,
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
    }

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
        id: cartItem.id,
        productId: cartItem.product.id,
        quantity: cartItem.quantity,
        warehouseId: cartItem.warehouseId,
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
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart - очистить корзину
 */
export async function DELETE() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    // Удаляем все элементы корзины
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          userId: session.userId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Корзина очищена',
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
