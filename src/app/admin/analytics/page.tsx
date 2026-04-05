'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
  };
  today: {
    orders: number;
    revenue: number;
    newUsers: number;
  };
  week: {
    orders: number;
    revenue: number;
    newUsers: number;
  };
  month: {
    orders: number;
    revenue: number;
    newUsers: number;
  };
  orderStatuses: Record<string, number>;
  topProducts: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    salesCount: number;
    stock: number;
    category?: { name: string } | null;
  }[];
  categoryStats: {
    id: string;
    name: string;
    slug: string;
    _count: { products: number };
  }[];
  lowStockProducts: number;
  warehouseStats: {
    id: string;
    name: string;
    city: string;
    _count: { stock: number };
  }[];
}

const statusConfig: Record<string, { label: string; class: string }> = {
  PENDING: { label: 'Новые', class: 'bg-blue-500' },
  CONFIRMED: { label: 'Подтверждены', class: 'bg-blue-600' },
  PAID: { label: 'Оплачены', class: 'bg-green-500' },
  SHIPPING: { label: 'Доставляются', class: 'bg-yellow-500' },
  DELIVERED: { label: 'Выполнены', class: 'bg-gray-500' },
  CANCELLED: { label: 'Отменены', class: 'bg-red-500' },
  REFUNDED: { label: 'Возвраты', class: 'bg-red-600' },
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/admin/analytics/stats');
      if (response.ok) {
        setData(await response.json());
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center text-gray4">
          <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div>Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-12 text-center">
          <div className="text-[16px] font-semibold text-white mb-2">Ошибка загрузки данных</div>
          <button onClick={loadData} className="text-orange hover:underline">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const currentData = data[timeRange];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-[20px] font-bold text-white mb-1">Аналитика</h1>
          <p className="text-[13px] text-gray4">Статистика и отчёты по продажам</p>
        </div>
        <div className="flex items-center gap-2 bg-black2 border border-gray1 rounded-[var(--radius)] p-1">
          <button
            onClick={() => setTimeRange('today')}
            className={cn(
              'px-4 py-[6px] text-[12px] font-semibold rounded-[calc(var(--radius)-2px)] transition-colors',
              timeRange === 'today' ? 'bg-orange text-white' : 'text-gray4 hover:text-white'
            )}
          >
            Сегодня
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={cn(
              'px-4 py-[6px] text-[12px] font-semibold rounded-[calc(var(--radius)-2px)] transition-colors',
              timeRange === 'week' ? 'bg-orange text-white' : 'text-gray4 hover:text-white'
            )}
          >
            Неделя
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={cn(
              'px-4 py-[6px] text-[12px] font-semibold rounded-[calc(var(--radius)-2px)] transition-colors',
              timeRange === 'month' ? 'bg-orange text-white' : 'text-gray4 hover:text-white'
            )}
          >
            Месяц
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-[var(--radius)] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-blue-500">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="text-[10px] text-gray3 uppercase tracking-wider">Всего клиентов</div>
          </div>
          <div className="font-display text-[28px] font-extrabold text-white tracking-tight">
            {data.overview.totalUsers.toLocaleString('ru-RU')}
          </div>
          <div className="text-[11px] text-green-500 mt-1">
            +{currentData.newUsers} за {timeRange === 'today' ? 'сегодня' : timeRange === 'week' ? 'неделю' : 'месяц'}
          </div>
        </div>

        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-[var(--radius)] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-green-500">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div className="text-[10px] text-gray3 uppercase tracking-wider">Заказов</div>
          </div>
          <div className="font-display text-[28px] font-extrabold text-white tracking-tight">
            {currentData.orders.toLocaleString('ru-RU')}
          </div>
          <div className="text-[11px] text-gray4 mt-1">
            {data.overview.totalOrders.toLocaleString('ru-RU')} всего
          </div>
        </div>

        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-[var(--radius)] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-orange-500">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="text-[10px] text-gray3 uppercase tracking-wider">Выручка</div>
          </div>
          <div className="font-display text-[28px] font-extrabold text-white tracking-tight">
            {currentData.revenue.toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-[11px] text-gray4 mt-1">
            {data.overview.totalRevenue.toLocaleString('ru-RU')} ₽ всего
          </div>
        </div>

        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-[var(--radius)] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-purple-500">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div className="text-[10px] text-gray3 uppercase tracking-wider">Товаров</div>
          </div>
          <div className="font-display text-[28px] font-extrabold text-white tracking-tight">
            {data.overview.totalProducts.toLocaleString('ru-RU')}
          </div>
          <div className="text-[11px] text-red-500 mt-1">
            {data.lowStockProducts} с низким остатком
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Статусы заказов */}
        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
          <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
            Статусы заказов
          </h2>
          <div className="space-y-3">
            {Object.entries(data.orderStatuses).map(([status, count]) => {
              const config = statusConfig[status] || { label: status, class: 'bg-gray-500' };
              const percentage = data.overview.totalOrders > 0
                ? Math.round((count / data.overview.totalOrders) * 100)
                : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-gray4">{config.label}</span>
                    <span className="text-[12px] text-white font-semibold">{count}</span>
                  </div>
                  <div className="w-full h-2 bg-black3 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', config.class)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Категории */}
        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
          <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
            Категории
          </h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {data.categoryStats.map((category) => (
              <div key={category.id} className="flex items-center justify-between py-2 border-b border-gray1 last:border-b-0">
                <span className="text-[13px] text-white">{category.name}</span>
                <span className="text-[12px] text-gray4">{category._count.products} товаров</span>
              </div>
            ))}
          </div>
        </div>

        {/* Склады */}
        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
          <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
            Склады
          </h2>
          <div className="space-y-3">
            {data.warehouseStats.map((warehouse) => (
              <div key={warehouse.id} className="p-3 bg-black3 rounded-[var(--radius)]">
                <div className="text-[13px] text-white font-semibold mb-1">{warehouse.name}</div>
                <div className="text-[11px] text-gray4">{warehouse.city}</div>
                <div className="text-[12px] text-orange mt-2">
                  {warehouse._count.stock} товаров
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Топ товаров */}
      <div className="mt-6 bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
        <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
          Топ товаров по продажам
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray1">
                <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">
                  Товар
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">
                  Артикул
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">
                  Категория
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">
                  Цена
                </th>
                <th className="text-center px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">
                  Продано
                </th>
                <th className="text-center px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">
                  Остаток
                </th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((product, index) => (
                <tr key={product.id} className="border-b border-gray1 last:border-b-0 hover:bg-black3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-orange/20 rounded-full flex items-center justify-center text-[10px] font-bold text-orange">
                        {index + 1}
                      </div>
                      <span className="text-[13px] text-white font-semibold">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-gray4 font-mono">{product.sku}</td>
                  <td className="px-4 py-3 text-[13px] text-gray4">{product.category?.name || '—'}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-bold text-white">
                    {product.price.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-[13px] font-bold text-green-500">{product.salesCount}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      'text-[13px] font-bold',
                      product.stock > 20 ? 'text-green-500' : product.stock > 5 ? 'text-yellow-500' : 'text-red-500'
                    )}>
                      {product.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
