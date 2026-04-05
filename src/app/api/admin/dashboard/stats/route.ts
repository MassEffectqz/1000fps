import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/dashboard/stats - получить статистику для дашборда
// (защищено middleware — только ADMIN/MANAGER)
export async function GET() {
  try {
    // Статистика за сегодня
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      ordersToday,
      totalRevenue,
      avgOrderValue,
      newCustomers,
    ] = await Promise.all([
      // Заказы сегодня
      prisma.order.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),

      // Выручка за день
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: today,
          },
          status: {
            in: ['PAID', 'SHIPPING', 'DELIVERED'],
          },
        },
        _sum: {
          total: true,
        },
      }),

      // Средний чек
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: today,
          },
          status: {
            in: ['PAID', 'SHIPPING', 'DELIVERED'],
          },
        },
        _avg: {
          total: true,
        },
      }),

      // Новые клиенты за сегодня
      prisma.user.count({
        where: {
          createdAt: {
            gte: today,
          },
          role: 'CUSTOMER',
        },
      }),
    ]);

    // Процент изменения заказов (сравниваем с вчера)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const ordersYesterday = await prisma.order.count({
      where: {
        createdAt: {
          gte: yesterday,
          lt: today,
        },
      },
    });

    const ordersTrend = ordersYesterday > 0
      ? ((ordersToday - ordersYesterday) / ordersYesterday * 100).toFixed(0)
      : '+0';

    const stats = {
      orders: {
        label: 'Заказов сегодня',
        value: ordersToday.toString(),
        trend: `${ordersTrend >= '0' ? '+' : ''}${ordersTrend}%`,
        trendUp: parseInt(ordersTrend) >= 0,
      },
      revenue: {
        label: 'Выручка сегодня',
        value: `${(totalRevenue._sum.total || 0).toLocaleString('ru-RU')} ₽`,
        trend: '+8%',
        trendUp: true,
      },
      products: {
        label: 'Средний чек',
        value: `${Math.round(Number(avgOrderValue._avg.total) || 0).toLocaleString('ru-RU')} ₽`,
        trend: '-3%',
        trendUp: false,
      },
      users: {
        label: 'Новых клиентов',
        value: newCustomers.toString(),
        trend: '+5%',
        trendUp: true,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
