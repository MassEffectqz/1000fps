import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/dashboard/orders - получить последние заказы
// (защищено middleware — только ADMIN/MANAGER)
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.user?.name || order.user?.email || 'Аноним',
      total: Number(order.total).toLocaleString('ru-RU'),
      status: order.status.toLowerCase(),
      date: order.createdAt.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching dashboard orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard orders' },
      { status: 500 }
    );
  }
}
