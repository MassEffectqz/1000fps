import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-helpers';
import { createOrderSchema } from '@/lib/validations/checkout';

/**
 * POST /api/orders - создать заказ
 * Body: { name, email, phone, notes? }
 * Оплата: при получении (CASH), Доставка: самовывоз (PICKUP)
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
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Некорректные данные' },
        { status: 400 }
      );
    }

    const {
      notes,
    } = validation.data;

    // Получаем корзину пользователя
    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Корзина пуста' },
        { status: 400 }
      );
    }

    // Проверяем наличие товаров
    for (const item of cart.items) {
      if (item.product.stock <= 0) {
        return NextResponse.json(
          { error: `Товар "${item.product.name}" отсутствует в наличии` },
          { status: 400 }
        );
      }
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Недостаточное количество товара "${item.product.name}"` },
          { status: 400 }
        );
      }
    }

    // Рассчитываем стоимость
    let subtotal = 0;
    for (const item of cart.items) {
      subtotal += Number(item.product.price) * item.quantity;
    }

    const deliveryCost = 0;
    const total = subtotal + deliveryCost;

    // Генерируем номер заказа
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Создаём заказ в транзакции
    const order = await prisma.$transaction(async (tx) => {
      // Создаём заказ
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.userId,
          paymentMethod: 'CASH',
          deliveryMethod: 'PICKUP',
          notes: notes || null,
          deliveryCost,
          subtotal,
          total,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
              total: Number(item.product.price) * item.quantity,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      // Уменьшаем остатки на складе
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            salesCount: { increment: item.quantity },
          },
        });
      }

      // Очищаем корзину
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // Логируем активность
      await tx.activityLog.create({
        data: {
          userId: session.userId,
          action: 'ORDER_CREATED',
          entity: 'Order',
          entityId: newOrder.id,
          details: { orderNumber, total: Number(total) },
        },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: Number(order.total),
        status: order.status,
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании заказа' },
      { status: 500 }
    );
  }
}
