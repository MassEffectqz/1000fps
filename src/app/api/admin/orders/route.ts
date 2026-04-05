import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ordersQuerySchema } from '@/lib/validations/order';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';

// GET /api/admin/orders - получить список заказов
// (защищено middleware — только ADMIN/MANAGER)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Парсим и валидируем query параметры
    const queryParams = ordersQuerySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      status: searchParams.get('status') || undefined,
      paymentStatus: searchParams.get('paymentStatus') || undefined,
      search: searchParams.get('search') || undefined,
      userId: searchParams.get('userId') || undefined,
    });

    const page = parseInt(queryParams.page);
    const limit = parseInt(queryParams.limit);
    const skip = (page - 1) * limit;

    // Формируем where условие
    const where: Record<string, unknown> = {};

    // Фильтр по статусу
    if (queryParams.status) {
      where.status = queryParams.status;
    }

    // Фильтр по платежному статусу
    if (queryParams.paymentStatus) {
      where.paymentStatus = queryParams.paymentStatus;
    }

    // Фильтр по userId
    if (queryParams.userId) {
      where.userId = queryParams.userId;
    }

    // Поиск по orderNumber или email пользователя
    if (queryParams.search) {
      const searchValue = queryParams.search;
      where.OR = [
        { orderNumber: { contains: searchValue, mode: 'insensitive' } },
        { user: { email: { contains: searchValue, mode: 'insensitive' } } },
        { user: { name: { contains: searchValue, mode: 'insensitive' } } },
      ];
    }

    // Получаем заказы и общее количество
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/admin/orders - создать заказ
// (защищено middleware — только ADMIN/MANAGER)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId,
      items,
      deliveryAddress,
      deliveryMethod,
      paymentMethod,
      notes,
      deliveryCost = 0,
      discount = 0,
    } = body;

    // Валидация обязательных полей
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'items are required and must not be empty' },
        { status: 400 }
      );
    }

    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Проверяем товары и считаем subtotal
    let subtotal = 0;
    const validatedItems: { productId: string; quantity: number; price: number; total: number }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        );
      }

      if (!product.isActive) {
        return NextResponse.json(
          { error: `Product is not active: ${product.name}` },
          { status: 400 }
        );
      }

      const itemTotal = Number(product.price) * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price.toNumber(),
        total: itemTotal,
      });
    }

    // Генерируем номер заказа
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Рассчитываем итоговую сумму
    const total = subtotal + Number(deliveryCost) - Number(discount);

    // Создаем заказ в транзакции
    const order = await prisma.$transaction(async (tx) => {
      // Создаем заказ
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          deliveryMethod,
          paymentMethod,
          deliveryAddress,
          deliveryCost: new Decimal(deliveryCost),
          subtotal: new Decimal(subtotal),
          discount: new Decimal(discount),
          total: new Decimal(total),
          notes,
          items: {
            create: validatedItems,
          },
        },
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

      // Уменьшаем остатки на складах (упрощенно - общий stock)
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            salesCount: { increment: item.quantity },
          },
        });
      }

      // Логируем действие
      await tx.activityLog.create({
        data: {
          action: 'ORDER_CREATED',
          entity: 'Order',
          entityId: newOrder.id,
          details: {
            orderNumber: newOrder.orderNumber,
            total: newOrder.total,
            items: validatedItems.length,
          },
        },
      });

      return newOrder;
    });

    // Реинвалидация кэша
    revalidatePath('/admin/orders');
    revalidatePath('/admin/dashboard');

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
