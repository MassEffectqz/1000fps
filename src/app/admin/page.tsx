'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Stat {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  total: string;
  status: string;
  date: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Record<string, Stat>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/dashboard/orders'),
      ]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      if (ordersRes.ok) {
        setOrders(await ordersRes.json());
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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

  const getStatIcon = (key: string) => {
    const icons: Record<string, React.ReactNode> = {
      orders: (
        <>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </>
      ),
      revenue: (
        <>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </>
      ),
      users: (
        <>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      ),
      products: (
        <>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </>
      ),
    };
    return icons[key] || <circle cx="12" cy="12" r="10" />;
  };

  const getStatusConfig = (status: string) => {
    const config = {
      pending: { class: 'bg-blue-500/10 text-blue-500 border border-blue-500/20', label: 'Новый' },
      confirmed: { class: 'bg-blue-500/10 text-blue-500 border border-blue-500/20', label: 'Подтверждён' },
      paid: { class: 'bg-green-500/10 text-green-500 border border-green-500/20', label: 'Оплачен' },
      shipping: { class: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20', label: 'Доставляется' },
      delivered: { class: 'bg-gray-500/10 text-gray-400 border border-gray-500/20', label: 'Выполнен' },
      cancelled: { class: 'bg-red-500/10 text-red-500 border border-red-500/20', label: 'Отменён' },
      refunded: { class: 'bg-red-500/10 text-red-500 border border-red-500/20', label: 'Возврат' },
    };
    return config[status as keyof typeof config] || config.pending;
  };

  return (
    <>
      {/* Header */}
      <header className="h-[56px] bg-black2 border-b border-gray1 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-5">
          <h1 className="font-display text-[14px] font-bold uppercase tracking-wider text-white">
            <span className="text-orange opacity-60 mr-2 font-mono">/</span>
            Дашборд
          </h1>
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-gray3">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Поиск..."
              className="w-[240px] h-[34px] bg-black3 border border-gray1 rounded-[var(--radius)] pl-9 pr-3 text-[13px] text-white outline-none transition-colors focus:border-orange placeholder:text-gray3"
            />
          </div>
        </div>
        <div className="flex items-center gap-[10px]">
          <button className="w-[34px] h-[34px] bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray4 transition-colors hover:border-orange hover:text-orange relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-black2">3</span>
          </button>
          <button className="w-[34px] h-[34px] bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray4 transition-colors hover:border-orange hover:text-orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {Object.entries(stats).map(([key, stat]) => (
            <div key={key} className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5 relative overflow-hidden group hover:border-gray2 transition-colors">
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start justify-between mb-[14px]">
                <div className="w-10 h-10 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] text-orange">
                    {getStatIcon(key)}
                  </svg>
                </div>
                <span className={cn(
                  'text-[10px] font-bold px-2 py-[3px] rounded-[var(--radius)]',
                  stat.trendUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                )}>
                  {stat.trend}
                </span>
              </div>
              <div className="font-display text-[28px] font-extrabold text-white tracking-tight">{stat.value}</div>
              <div className="text-[11px] text-gray4 uppercase tracking-wider font-display font-bold mt-[6px]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] mb-6">
          <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-gray1">
            <div className="font-display text-[11px] font-bold tracking-wider uppercase text-white">Последние заказы</div>
            <Link href="/admin/orders" className="text-[11px] text-orange hover:text-orange3">Все заказы &rarr;</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray1">
                  <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Заказ</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Клиент</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Сумма</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Статус</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Дата</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Действия</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <tr key={order.id} className="border-b border-gray1 last:border-b-0 hover:bg-black3 transition-colors">
                        <td className="px-4 py-3 text-[13px] font-bold text-orange">{order.orderNumber}</td>
                        <td className="px-4 py-3 text-[13px] text-gray4">{order.customer}</td>
                        <td className="px-4 py-3 text-[13px] font-bold text-white">{order.total} ₽</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'text-[10px] font-bold px-[8px] py-[3px] rounded-[var(--radius)] inline-flex items-center gap-1',
                            statusConfig.class
                          )}>
                            <span className="w-1 h-1 rounded-full bg-current" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray4">{order.date}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-[6px]">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="w-7 h-7 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray4 transition-colors hover:border-orange hover:text-orange"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[13px] h-[13px]">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </Link>
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="w-7 h-7 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray4 transition-colors hover:border-orange hover:text-orange"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[13px] h-[13px]">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray4">
                      <div>Заказов за сегодня нет</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
