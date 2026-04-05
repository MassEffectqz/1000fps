import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/analytics/stats - получить расширенную статистику
// (защищено middleware — только ADMIN/MANAGER)
export async function GET() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Основная статистика
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      // За сегодня
      ordersToday,
      revenueToday,
      newUsersToday,
      // За неделю
      ordersWeek,
      revenueWeek,
      newUsersWeek,
      // За месяц
      ordersMonth,
      revenueMonth,
      newUsersMonth,
    ] = await Promise.all([
      // Всего пользователей
      prisma.user.count({
        where: { role: 'CUSTOMER' },
      }),
      // Всего товаров
      prisma.product.count({
        where: { isActive: true },
      }),
      // Всего заказов
      prisma.order.count(),
      // Общая выручка
      prisma.order.aggregate({
        where: {
          status: { in: ['PAID', 'SHIPPING', 'DELIVERED'] },
        },
        _sum: { total: true },
      }),
      // За сегодня
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: today },
          status: { in: ['PAID', 'SHIPPING', 'DELIVERED'] },
        },
        _sum: { total: true },
      }),
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: today },
        },
      }),
      // За неделю
      prisma.order.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: weekAgo },
          status: { in: ['PAID', 'SHIPPING', 'DELIVERED'] },
        },
        _sum: { total: true },
      }),
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: weekAgo },
        },
      }),
      // За месяц
      prisma.order.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: monthAgo },
          status: { in: ['PAID', 'SHIPPING', 'DELIVERED'] },
        },
        _sum: { total: true },
      }),
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: monthAgo },
        },
      }),
    ]);

    // Статусы заказов
    const orderStatuses = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Топ товаров по продажам
    const topProducts = await prisma.product.findMany({
      take: 10,
      orderBy: { salesCount: 'desc' },
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
        salesCount: true,
        stock: true,
        category: {
          select: { name: true },
        },
      },
    });

    // Статистика по категориям
    const categoryStats = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Низкий остаток товаров
    const lowStockProducts = await prisma.product.count({
      where: {
        isActive: true,
        stock: { lte: 5 },
      },
    });

    // Статистика по складам
    const warehouseStats = await prisma.warehouse.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        _count: {
          select: { stock: true },
        },
      },
    });

    return NextResponse.json({
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: Number(totalRevenue._sum.total) || 0,
      },
      today: {
        orders: ordersToday,
        revenue: Number(revenueToday._sum.total) || 0,
        newUsers: newUsersToday,
      },
      week: {
        orders: ordersWeek,
        revenue: Number(revenueWeek._sum.total) || 0,
        newUsers: newUsersWeek,
      },
      month: {
        orders: ordersMonth,
        revenue: Number(revenueMonth._sum.total) || 0,
        newUsers: newUsersMonth,
      },
      orderStatuses: orderStatuses.reduce(
        (acc, status) => {
          acc[status.status] = status._count.id;
          return acc;
        },
        {} as Record<string, number>
      ),
      topProducts,
      categoryStats,
      lowStockProducts,
      warehouseStats,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
