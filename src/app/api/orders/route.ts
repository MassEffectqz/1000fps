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
      name,
      email,
      phone,
      notes,
    } = validation.data;

    // Получаем корзину пользователя с товарами
    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                warehouseStocks: true,
              },
            },
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

    // Проверяем наличие и активность товаров
    for (const item of cart.items) {
      // Проверка активности товара
      if (!item.product.isActive || item.product.isDraft) {
        return NextResponse.json(
          { error: `Товар "${item.product.name}" недоступен для заказа` },
          { status: 400 }
        );
      }

      // Проверка остатков на конкретном складе
      const warehouseId = item.warehouseId;
      if (warehouseId) {
        const stock = item.product.warehouseStocks.find(s => s.warehouseId === warehouseId);
        if (!stock || stock.quantity < item.quantity) {
          return NextResponse.json(
            { error: `Недостаточное количество товара "${item.product.name}" на выбранном складе` },
            { status: 400 }
          );
        }
      } else {
        // Если склад не указан - проверяем общий остаток
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
    }

    // Рассчитываем стоимость (актуальные цены из БД)
    let subtotal = 0;
    for (const item of cart.items) {
      const price = Number(item.product.price);
      const discountValue = Number(item.product.discountValue || 0);
      let finalPrice = price;

      if (discountValue > 0) {
        if (item.product.discountType === 'PERCENT') {
          finalPrice = price * (1 - discountValue / 100);
        } else {
          finalPrice = Math.max(0, price - discountValue);
        }
      }

      subtotal += finalPrice * item.quantity;
    }

    const deliveryCost = 0;
    const total = subtotal + deliveryCost;

    // Генерируем номер заказа
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Создаём заказ в транзакции
    const order = await prisma.$transaction(async (tx) => {
      // Создаём заказ с данными покупателя
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.userId,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          paymentMethod: 'CASH',
          deliveryMethod: 'PICKUP',
          notes: notes || null,
          deliveryCost,
          subtotal,
          total,
          items: {
            create: cart.items.map((item) => {
              const price = Number(item.product.price);
              const discountValue = Number(item.product.discountValue || 0);
              let finalPrice = price;

              if (discountValue > 0) {
                if (item.product.discountType === 'PERCENT') {
                  finalPrice = price * (1 - discountValue / 100);
                } else {
                  finalPrice = Math.max(0, price - discountValue);
                }
              }

              return {
                productId: item.productId,
                quantity: item.quantity,
                price: finalPrice,
                total: finalPrice * item.quantity,
              };
            }),
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

      // Списываем остатки с складов
      for (const item of cart.items) {
        const warehouseId = item.warehouseId;
        
        if (warehouseId) {
          // Списываем с конкретного склада
          await tx.warehouseStock.update({
            where: {
              warehouseId_productId: {
                warehouseId,
                productId: item.productId,
              },
            },
            data: {
              quantity: { decrement: item.quantity },
            },
          });
        }

        // Также уменьшаем общий остаток товара
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
