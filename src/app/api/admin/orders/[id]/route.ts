import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateOrderSchema } from '@/lib/validations/order';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';

// GET /api/admin/orders/[id] - получить детали заказа
// (защищено middleware — только ADMIN/MANAGER)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
            url: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
                price: true,
                images: {
                  where: { isMain: true },
                  select: { url: true },
                  take: 1,
                },
              },
            },
          },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/orders/[id] - обновить заказ
// (защищено middleware — только ADMIN/MANAGER)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  try {
    // Валидация входных данных
    const validatedData = updateOrderSchema.parse(body);

    // Проверяем существование заказа
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Проверяем, можно ли изменять заказ
    if (existingOrder.status === 'DELIVERED' || existingOrder.status === 'CANCELLED') {
      // Разрешаем только добавление заметок для завершенных заказов
      const hasOnlyNotes = Object.keys(validatedData).every(key => 
        key === 'notes' || key === 'trackingNumber'
      );
      
      if (!hasOnlyNotes) {
        return NextResponse.json(
          { error: 'Cannot modify completed or cancelled order' },
          { status: 400 }
        );
      }
    }

    // Пересчитываем total если изменились discount или deliveryCost
    const updateData: Record<string, unknown> = {};

    if (validatedData.discount !== undefined) {
      updateData.discount = new Decimal(validatedData.discount);
    }

    if (validatedData.deliveryCost !== undefined) {
      updateData.deliveryCost = new Decimal(validatedData.deliveryCost);
    }

    // Если изменились финансовые поля, пересчитываем total
    if (validatedData.discount !== undefined || validatedData.deliveryCost !== undefined) {
      const newTotal = existingOrder.subtotal
        .plus(validatedData.deliveryCost !== undefined ? validatedData.deliveryCost : Number(existingOrder.deliveryCost))
        .minus(validatedData.discount !== undefined ? validatedData.discount : Number(existingOrder.discount));
      updateData.total = new Decimal(newTotal);
    }

    // Добавляем остальные поля
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
      
      // Устанавливаем timestamp в зависимости от статуса
      if (validatedData.status === 'PAID') {
        updateData.paidAt = new Date();
      } else if (validatedData.status === 'SHIPPING') {
        updateData.shippedAt = new Date();
      } else if (validatedData.status === 'DELIVERED') {
        updateData.deliveredAt = new Date();
      } else if (validatedData.status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
      }
    }

    if (validatedData.paymentStatus !== undefined) {
      updateData.paymentStatus = validatedData.paymentStatus;
      
      if (validatedData.paymentStatus === 'PAID') {
        updateData.paidAt = new Date();
      } else if (validatedData.paymentStatus === 'REFUNDED') {
        updateData.paidAt = null; // Сбрасываем дату оплаты при возврате
      }
    }

    if (validatedData.deliveryAddress !== undefined) {
      updateData.deliveryAddress = validatedData.deliveryAddress;
    }

    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes;
    }

    if (validatedData.deliveryMethod !== undefined) {
      updateData.deliveryMethod = validatedData.deliveryMethod;
    }

    if (validatedData.paymentMethod !== undefined) {
      updateData.paymentMethod = validatedData.paymentMethod;
    }

    if (validatedData.trackingNumber !== undefined) {
      updateData.trackingNumber = validatedData.trackingNumber;
    }

    // Обновляем заказ в транзакции
    const order = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  sku: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      // Логируем изменение статуса
      if (validatedData.status !== undefined && validatedData.status !== existingOrder.status) {
        await tx.activityLog.create({
          data: {
            action: 'ORDER_STATUS_CHANGED',
            entity: 'Order',
            entityId: id,
            details: {
              orderNumber: existingOrder.orderNumber,
              oldStatus: existingOrder.status,
              newStatus: validatedData.status,
            },
          },
        });
      }

      // Логируем изменение платежного статуса
      if (validatedData.paymentStatus !== undefined && validatedData.paymentStatus !== existingOrder.paymentStatus) {
        await tx.activityLog.create({
          data: {
            action: 'ORDER_PAYMENT_STATUS_CHANGED',
            entity: 'Order',
            entityId: id,
            details: {
              orderNumber: existingOrder.orderNumber,
              oldPaymentStatus: existingOrder.paymentStatus,
              newPaymentStatus: validatedData.paymentStatus,
            },
          },
        });
      }

      return updatedOrder;
    });

    // Реинвалидация кэша
    revalidatePath('/admin/orders');
    revalidatePath('/admin/dashboard');
    revalidatePath(`/admin/orders/${id}`);

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error updating order:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/orders/[id] - удалить заказ
// (защищено middleware — только ADMIN/MANAGER)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Проверяем существование заказа
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Проверка: нельзя удалить заказ со статусом DELIVERED или REFUNDED
    if (existingOrder.status === 'DELIVERED' || existingOrder.status === 'REFUNDED') {
      return NextResponse.json(
        { 
          error: 'Cannot delete order with status DELIVERED or REFUNDED',
          message: 'Заказы со статусом "Доставлен" или "Возвращен" нельзя удалить'
        },
        { status: 400 }
      );
    }

    // Удаляем заказ в транзакции
    await prisma.$transaction(async (tx) => {
      // Возвращаем товары на склад
      for (const item of existingOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            salesCount: { decrement: item.quantity },
          },
        });
      }

      // Удаляем заказ (каскадно удалит OrderItem)
      await tx.order.delete({
        where: { id },
      });

      // Логируем удаление
      await tx.activityLog.create({
        data: {
          action: 'ORDER_DELETED',
          entity: 'Order',
          entityId: id,
          details: {
            orderNumber: existingOrder.orderNumber,
            reason: 'Deleted by admin',
          },
        },
      });
    });

    // Реинвалидация кэша
    revalidatePath('/admin/orders');
    revalidatePath('/admin/dashboard');

    return NextResponse.json({ 
      success: true, 
      message: 'Order deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
