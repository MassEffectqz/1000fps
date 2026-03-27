'use client';

import { useState, useMemo } from 'react';
import { ordersApi } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  itemsCount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'ASSEMBLING' | 'SHIPPED' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  createdAt: string;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  PENDING: { label: 'Ожидает', class: 'yellow' },
  CONFIRMED: { label: 'Подтверждён', class: 'blue' },
  PAID: { label: 'Оплачен', class: 'green' },
  ASSEMBLING: { label: 'Комплектуется', class: 'orange' },
  SHIPPED: { label: 'Отправлен', class: 'blue' },
  DELIVERING: { label: 'В доставке', class: 'green' },
  DELIVERED: { label: 'Доставлен', class: 'muted' },
  CANCELLED: { label: 'Отменён', class: 'red' },
};

const paymentConfig: Record<string, { label: string; class: string }> = {
  UNPAID: { label: 'Не оплачен', class: 'red' },
  PAID: { label: 'Оплачен', class: 'green' },
  REFUNDED: { label: 'Возврат', class: 'muted' },
};

export default function OrdersPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 15;
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery<{ data: Order[] }>({
    queryKey: ['orders', page, limit, selectedStatus, selectedPayment],
    queryFn: async () => {
      const result = await ordersApi.list({ 
        page, 
        limit, 
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        paymentStatus: selectedPayment === 'all' ? undefined : selectedPayment,
      });
      return result as unknown as { data: Order[] };
    },
  });

  const orders: Order[] = ordersData?.data || [];
  const totalItems = orders.length;

  const filteredOrders = useMemo(() => {
    return orders.filter((order: Order) => {
      const matchesSearch =
        order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [orders, searchQuery]);

  const stats = useMemo(() => ({
    total: totalItems,
    pending: orders.filter((o: Order) => o.status === 'PENDING').length,
    shipping: orders.filter((o: Order) => o.status === 'SHIPPED' || o.status === 'DELIVERING').length,
    delivered: orders.filter((o: Order) => o.status === 'DELIVERED').length,
    cancelled: orders.filter((o: Order) => o.status === 'CANCELLED').length,
  }), [orders]);

  const updateStatus = (orderId: number, newStatus: string) => {
    ordersApi.updateStatus(orderId, newStatus).then(() => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });
  };

  if (isLoading) {
    return (
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
        Загрузка заказов...
      </div>
    );
  }

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-c gap-10 mb-16" style={{ justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            Заказы
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>Управление заказами клиентов</p>
        </div>
        <div className="flex flex-c gap-8">
          <button className="btn btn--ghost">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="14"
              height="14"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m7-5v10l5-5-5-5z" />
            </svg>
            Экспорт
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid mb-16" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-val" style={{ fontSize: '20px' }}>
            {stats.total}
          </div>
          <div className="stat-label">Всего</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ fontSize: '20px', color: 'var(--yellow)' }}>
            {stats.pending}
          </div>
          <div className="stat-label">Ожидают</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ fontSize: '20px', color: 'var(--blue)' }}>
            {stats.shipping}
          </div>
          <div className="stat-label">В доставке</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ fontSize: '20px', color: 'var(--green)' }}>
            {stats.delivered}
          </div>
          <div className="stat-label">Доставлены</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ fontSize: '20px', color: 'var(--red)' }}>
            {stats.cancelled}
          </div>
          <div className="stat-label">Отменены</div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card mb-16">
        <div className="card__body" style={{ padding: '14px 18px' }}>
          <div className="flex flex-c gap-10" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div className="header-search" style={{ width: '100%' }}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ width: '13px', height: '13px' }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Поиск по номеру, клиенту, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div style={{ width: '180px' }}>
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Все статусы</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ width: '150px' }}>
              <select
                className="form-select"
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
              >
                <option value="all">Все оплаты</option>
                {Object.entries(paymentConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="card__head">
          <span className="card__title">Заказы ({filteredOrders.length})</span>
        </div>
        <div className="card__body card__body--flush">
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-3)' }}>
              {orders.length === 0 ? 'Нет заказов' : 'Нет заказов по выбранным фильтрам'}
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Заказ</th>
                  <th>Клиент</th>
                  <th>Дата</th>
                  <th style={{ textAlign: 'right' }}>Сумма</th>
                  <th>Статус</th>
                  <th>Оплата</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="mono f11 text-white fw700">{order.orderNumber || `ORD-${order.id}`}</td>
                    <td>
                      <div className="text-white">{order.customerName}</div>
                      <div className="f11 text-muted">{order.customerEmail}</div>
                    </td>
                    <td className="mono f11">{new Date(order.createdAt).toLocaleString('ru-RU')}</td>
                    <td className="text-right text-white fw700">{order.total.toLocaleString('ru-RU')} ₽</td>
                    <td>
                      <span className={`badge badge--${statusConfig[order.status].class}`}>
                        <span className="badge-dot" />
                        {statusConfig[order.status].label}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge--${paymentConfig[order.paymentStatus].class}`}>
                        {paymentConfig[order.paymentStatus].label}
                      </span>
                    </td>
                    <td>
                      <div className="tbl-actions">
                        <button className="tbl-btn" title="Подробнее">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                            <path d="M1 4v6h6M3.51 15a2.121 2.121 0 003 3L15 9.5l-3-3L3.51 15z" />
                          </svg>
                        </button>
                        <select
                          className="form-select"
                          style={{ padding: '4px 8px', fontSize: '11px', width: 'auto' }}
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                        >
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <option key={key} value={key}>
                              {config.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* PAGINATION */}
      {totalItems > limit && (
        <div className="flex flex-c gap-8" style={{ justifyContent: 'center', marginTop: '24px' }}>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Назад
          </button>
          <span className="f12 text-muted" style={{ padding: '8px 16px' }}>
            Страница {page}
          </span>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setPage(p => p + 1)}
            disabled={filteredOrders.length < limit}
          >
            Вперёд
          </button>
        </div>
      )}
    </>
  );
}
