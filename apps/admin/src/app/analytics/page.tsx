'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAnalyticsSales, useAnalyticsProducts, useAnalyticsCustomers } from '@/hooks/useApi';

interface SalesData {
  date: string;
  amount: number;
  orders: number;
}

interface TopProduct {
  id: number;
  name: string;
  sales: number;
  revenue: number;
}

interface TopCategory {
  id: number;
  name: string;
  sales: number;
  revenue: number;
}

export default function AnalyticsPanel() {
  const [activePanel, setActivePanel] = useState('analytics');
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

  // API hooks
  const { data: salesData, isLoading: salesLoading } = useAnalyticsSales(period);
  const { data: productsData, isLoading: productsLoading } = useAnalyticsProducts();
  const { data: customersData, isLoading: customersLoading } = useAnalyticsCustomers();

  const isLoading = salesLoading || productsLoading || customersLoading;

  const onPanelChange = (panel: string) => {
    setActivePanel(panel);
  };

  // Извлекаем данные из ответа API
  const salesList = (salesData as unknown as { data?: SalesData[] })?.data || [];
  const topProducts = ((productsData as unknown as { data?: { topProducts?: TopProduct[] } })?.data?.topProducts) || [];
  const topCategories = ((customersData as unknown as { data?: { topCategories?: TopCategory[] } })?.data?.topCategories) || [];

  const totalRevenue = salesList.reduce((sum, d) => sum + d.amount, 0);
  const totalOrders = salesList.reduce((sum, d) => sum + d.orders, 0);
  const avgCheck = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  if (isLoading) {
    return (
      <AdminLayout activePanel={activePanel} onPanelChange={onPanelChange}>
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-3)' }}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              width: '32px',
              height: '32px',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite',
            }}
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          Загрузка аналитики...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePanel={activePanel} onPanelChange={onPanelChange}>
      {/* HEADER */}
      <div className="flex flex-c gap-10 mb-16" style={{ justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            Аналитика
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>Статистика продаж и показатели</p>
        </div>
        <div
          className="flex"
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
          }}
        >
          <button
            className={`btn btn--ghost btn--sm ${period === 'week' ? 'btn--primary' : ''}`}
            onClick={() => setPeriod('week')}
          >
            Неделя
          </button>
          <button
            className={`btn btn--ghost btn--sm ${period === 'month' ? 'btn--primary' : ''}`}
            onClick={() => setPeriod('month')}
          >
            Месяц
          </button>
          <button
            className={`btn btn--ghost btn--sm ${period === 'year' ? 'btn--primary' : ''}`}
            onClick={() => setPeriod('year')}
          >
            Год
          </button>
        </div>
      </div>

      {/* KEY METRICS */}
      <div className="stats-grid mb-16" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__head">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            </div>
            <span className="trend trend--up">↑ 12.5%</span>
          </div>
          <div className="stat-val">{(totalRevenue / 1000000).toFixed(2)}M ₽</div>
          <div className="stat-label">Выручка</div>
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
            <span className="trend trend--up">↑ 8.3%</span>
          </div>
          <div className="stat-val">{totalOrders}</div>
          <div className="stat-label">Заказы</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__head">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            </div>
            <span className="trend trend--down">↓ 2.1%</span>
          </div>
          <div className="stat-val">{avgCheck.toLocaleString('ru-RU')} ₽</div>
          <div className="stat-label">Средний чек</div>
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
            <span className="trend trend--up">↑ 5.7%</span>
          </div>
          <div className="stat-val">1,247</div>
          <div className="stat-label">Посетители</div>
        </div>
      </div>

      {/* SALES CHART */}
      <div className="g2 mb-16">
        <div className="card">
          <div className="card__head">
            <span className="card__title">Продажи по дням</span>
          </div>
          <div className="card__body">
            <div
              style={{
                height: '200px',
                display: 'flex',
                alignItems: 'flex-end',
                gap: '8px',
                justifyContent: 'space-between',
              }}
            >
              {salesList.length === 0 ? (
                <div style={{ width: '100%', textAlign: 'center', padding: '48px', color: 'var(--text-3)' }}>
                  Нет данных о продажах
                </div>
              ) : (
                (() => {
                  const maxValue = Math.max(...salesList.map((d) => d.amount));
                  return salesList.map((day, idx) => {
                    const maxHeight = 200;
                    const height = maxValue > 0 ? (day.amount / maxValue) * maxHeight : 0;
                    return (
                      <div
                        key={idx}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: `${height}px`,
                            background: 'var(--accent)',
                            borderRadius: 'var(--radius) var(--radius) 0 0',
                            opacity: 0.8,
                            transition: 'height 0.3s ease',
                          }}
                        />
                        <span
                          className="f10 text-muted"
                          style={{ transform: 'rotate(-45deg)', textAlign: 'center' }}
                        >
                          {new Date(day.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    );
                  });
                })()
              )}
            </div>
          </div>
        </div>

        {/* TOP PRODUCTS */}
        <div className="card">
          <div className="card__head">
            <span className="card__title">Топ товаров</span>
            <button className="btn btn--ghost btn--sm">
              Все товары
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="14"
                height="14"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="card__body card__body--flush">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Товар</th>
                  <th style={{ textAlign: 'center' }}>Продажи</th>
                  <th style={{ textAlign: 'right' }}>Выручка</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-3)' }}>
                      Нет данных
                    </td>
                  </tr>
                ) : (
                  topProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="text-white fw700">{product.name}</div>
                      </td>
                      <td className="text-center">{product.sales}</td>
                      <td className="text-right text-white fw700">
                        {product.revenue.toLocaleString('ru-RU')} ₽
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* TOP CATEGORIES */}
      <div className="card">
        <div className="card__head">
          <span className="card__title">Топ категорий</span>
        </div>
        <div className="card__body card__body--flush">
          <table className="tbl">
            <thead>
              <tr>
                <th>Категория</th>
                <th style={{ textAlign: 'center' }}>Продажи</th>
                <th style={{ textAlign: 'right' }}>Выручка</th>
                <th style={{ textAlign: 'right' }}>% от общей</th>
              </tr>
            </thead>
            <tbody>
              {topCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-3)' }}>
                    Нет данных
                  </td>
                </tr>
              ) : (
                topCategories.map((cat) => {
                  const percent = totalRevenue > 0 ? ((cat.revenue / totalRevenue) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={cat.id}>
                      <td>
                        <div className="text-white fw700">{cat.name}</div>
                      </td>
                      <td className="text-center">{cat.sales}</td>
                      <td className="text-right text-white fw700">
                        {cat.revenue.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="text-right">
                        <span className="badge badge--blue">{percent}%</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
