import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-helpers';

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
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Нет товаров для переноса',
        addedCount: 0,
      });
    }

    // Находим или создаем корзину пользователя
    let cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.userId },
      });
    }

    let addedCount = 0;
    const errors: string[] = [];

    // Переносим каждый товар
    for (const item of items) {
      const { productId, quantity, warehouseId } = item;

      if (!productId || !quantity) {
        errors.push(`Некорректные данные товара`);
        continue;
      }

      // Проверяем, что товар существует и активен
      const product = await prisma.product.findUnique({
        where: { id: productId, isActive: true, isDraft: false },
      });

      if (!product) {
        errors.push(`Товар ${productId} не найден или недоступен`);
        continue;
      }

      // Проверяем наличие на складе
      if (warehouseId) {
        const stock = await prisma.warehouseStock.findUnique({
          where: { warehouseId_productId: { warehouseId, productId } },
        });
        if (!stock || stock.quantity < quantity) {
          errors.push(`Недостаточно товара ${product.name} на складе`);
          continue;
        }
      }

      // Проверяем, есть ли уже такой товар в корзине
      const existingItem = await prisma.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId } },
      });

      if (existingItem) {
        // Обновляем количество
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        });
      } else {
        // Создаем новый элемент
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            userId: session.userId,
            productId,
            quantity,
            warehouseId,
          },
        });
      }

      addedCount++;
    }

    return NextResponse.json({
      success: true,
      message: errors.length > 0 
        ? `Перенесено ${addedCount} товаров, ${errors.length} ошибок`
        : `Перенесено ${addedCount} товаров`,
      addedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error syncing cart:', error);
    return NextResponse.json(
      { error: 'Failed to sync cart' },
      { status: 500 }
    );
  }
}