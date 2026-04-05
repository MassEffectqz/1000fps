import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

/**
 * GET /api/profile/orders
 * Получить список заказов пользователя
 *
 * Query: { page?, limit?, status? }
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

    // Парсим query параметры
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    // Формируем where условие
    const where: { userId: string; status?: 'PENDING' | 'CONFIRMED' | 'PAID' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED' } = { userId: session.userId };
    if (status && ['PENDING', 'CONFIRMED', 'PAID', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(status)) {
      where.status = status as 'PENDING' | 'CONFIRMED' | 'PAID' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
    }

    // Получаем заказы с пагинацией
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: {
                    where: { isMain: true },
                    select: { url: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении заказов' },
      { status: 500 }
    );
  }
}
