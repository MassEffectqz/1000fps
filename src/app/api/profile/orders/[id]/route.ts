import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

/**
 * GET /api/profile/orders/[id]
 * Получить детали заказа по ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Получаем ID заказа
    const { id } = await params;

    // Получаем заказ
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: session.userId, // Только свои заказы
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
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
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order details error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении деталей заказа' },
      { status: 500 }
    );
  }
}
