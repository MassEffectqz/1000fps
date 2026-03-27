'use client';

import AdminLayout from '@/components/AdminLayout';
import ProductsPanel from './products/page';
import CategoriesPanel from './categories/page';
import OrdersPanel from './orders/page';
import GalleryPanel from './gallery/page';
import WarehousesPanel from './warehouses/page';
import ConfigurationPanel from './configuration/page';
import AnalyticsPanel from './analytics/page';
import PriceHistoryPanel from './price-history/page';
import UsersPanel from './users/page';
import LogsPanel from './logs/page';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'ASSEMBLING' | 'SHIPPED' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'yellow',
  CONFIRMED: 'blue',
  PAID: 'green',
  ASSEMBLING: 'orange',
  SHIPPED: 'blue',
  DELIVERING: 'green',
  DELIVERED: 'muted',
  CANCELLED: 'red',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Ожидает',
  CONFIRMED: 'Подтверждён',
  PAID: 'Оплачен',
  ASSEMBLING: 'Комплектуется',
  SHIPPED: 'Отправлен',
  DELIVERING: 'В доставке',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
};

function DashboardPanel() {
  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ data: Order[] }>({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const result = await ordersApi.list({ limit: 5, sort: 'newest' });
      return result as unknown as { data: Order[] };
    },
  });

  const recentOrders: Order[] = ordersData?.data || [];
  
  // Заглушка для статистики - будет заменено на реальный API endpoint
  const stats = {
    products: 247,
    orders: recentOrders.length > 0 ? recentOrders.length : 89,
    revenue: 1847290,
    users: 342,
  };
  
  const isLoading = ordersLoading;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__head">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="trend trend--up">↑ 12%</span>
          </div>
          <div className="stat-val">{stats.products}</div>
          <div className="stat-label">Товаров</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__head">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <span className="trend trend--up">↑ 8%</span>
          </div>
          <div className="stat-val">{stats.orders}</div>
          <div className="stat-label">Заказов</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__head">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            </div>
            <span className="trend trend--up">↑ 24%</span>
          </div>
          <div className="stat-val">{(stats.revenue / 1000000).toFixed(2)}M ₽</div>
          <div className="stat-label">Выручка</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__head">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <span className="trend trend--down">↓ 3%</span>
          </div>
          <div className="stat-val">{stats.users}</div>
          <div className="stat-label">Пользователей</div>
        </div>
      </div>

      <div className="card">
        <div className="card__head">
          <span className="card__title">Последние заказы</span>
          <button className="btn btn--ghost btn--sm">
            Все заказы
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="card__body card__body--flush">
          <table className="tbl">
            <thead>
              <tr>
                <th>Заказ</th>
                <th>Клиент</th>
                <th>Дата</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-3)' }}>
                    Нет заказов
                  </td>
                </tr>
              ) : (
                recentOrders.map((order: Order) => (
                  <tr key={order.id}>
                    <td className="mono f11 text-white fw700">{order.orderNumber || `ORD-${order.id}`}</td>
                    <td>{order.customerName || order.customerEmail}</td>
                    <td className="mono f11">{new Date(order.createdAt).toLocaleString('ru-RU')}</td>
                    <td className="text-white fw700">{order.total.toLocaleString('ru-RU')} ₽</td>
                    <td>
                      <span className={`badge badge--${statusColors[order.status]}`}>
                        <span className="badge-dot" />
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td>
                      <div className="tbl-actions">
                        <button className="tbl-btn">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 4v6h6M3.51 15a2.121 2.121 0 003 3L15 9.5l-3-3L3.51 15z" />
                          </svg>
                        </button>
                        <button className="tbl-btn">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 01-8 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function _PlaceholderPanel({ title }: { title: string }) {
  return (
    <div className="card">
      <div className="card__head">
        <span className="card__title">{title}</span>
      </div>
      <div className="card__body" style={{ textAlign: 'center', padding: '48px' }}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ width: '64px', height: '64px', color: 'var(--text-3)', margin: '0 auto 16px' }}
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <p style={{ fontSize: '14px', color: 'var(--text-2)', marginBottom: '8px' }}>
          Панель <strong className="text-white">{title}</strong> в разработке
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>
          Функционал будет добавлен в ближайшее время
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activePanel, setActivePanel] = useState('dashboard');

  const renderPanel = () => {
    switch (activePanel) {
      case 'dashboard':
        return <DashboardPanel key="dashboard" />;
      case 'products':
        return <ProductsPanel key="products" />;
      case 'categories':
        return <CategoriesPanel key="categories" />;
      case 'gallery':
        return <GalleryPanel key="gallery" />;
      case 'orders':
        return <OrdersPanel key="orders" />;
      case 'warehouses':
        return <WarehousesPanel key="warehouses" />;
      case 'configuration':
        return <ConfigurationPanel key="configuration" />;
      case 'analytics':
        return <AnalyticsPanel key="analytics" />;
      case 'price-history':
        return <PriceHistoryPanel key="price-history" />;
      case 'users':
        return <UsersPanel key="users" />;
      case 'logs':
        return <LogsPanel key="logs" />;
      default:
        return <DashboardPanel />;
    }
  };

  return (
    <AdminLayout activePanel={activePanel} onPanelChange={setActivePanel} key={activePanel}>
      {renderPanel()}
    </AdminLayout>
  );
}
