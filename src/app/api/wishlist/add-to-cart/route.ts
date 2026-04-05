import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-helpers';

/**
 * POST /api/wishlist/add-to-cart - перенести товары из вишлиста в корзину
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
    const itemIds = body.itemIds as string[] | undefined;

    // Получаем элементы вишлиста
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        id: itemIds ? { in: itemIds } : undefined,
        userId: session.userId,
      },
      include: {
        product: {
          include: {
            warehouseStocks: {
              include: {
                warehouse: true,
              },
            },
          },
        },
      },
    });

    if (wishlistItems.length === 0) {
      return NextResponse.json(
        { error: 'Нет товаров для переноса' },
        { status: 400 }
      );
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

    // Переносим товары в корзину
    const addedItems = [];

    for (const wishlistItem of wishlistItems) {
      const product = wishlistItem.product;
      
      // Проверяем наличие на складе
      const firstWarehouseStock = product.warehouseStocks.find(ws => ws.quantity > 0);
      
      // Проверяем, есть ли уже такой товар в корзине
      const existingCartItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart!.id,
            productId: product.id,
          },
        },
      });

      if (existingCartItem) {
        // Обновляем количество
        await prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: {
            quantity: existingCartItem.quantity + 1,
          },
        });
      } else {
        // Создаем новый элемент корзины
        const cartItem = await prisma.cartItem.create({
          data: {
            cartId: cart!.id,
            userId: session.userId,
            productId: product.id,
            quantity: 1,
            warehouseId: firstWarehouseStock?.warehouseId,
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

        addedItems.push(cartItem);
      }
    }

    // Удаляем перенесенные товары из вишлиста
    await prisma.wishlistItem.deleteMany({
      where: {
        id: {
          in: wishlistItems.map(item => item.id),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Перенесено ${addedItems.length} товаров в корзину`,
      addedCount: addedItems.length,
    });
  } catch (error) {
    console.error('Error moving wishlist to cart:', error);
    return NextResponse.json(
      { error: 'Failed to move wishlist to cart' },
      { status: 500 }
    );
  }
}
