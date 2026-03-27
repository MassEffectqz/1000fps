'use client';

import { useState } from 'react';
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

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery<{ data: Order[] }>({
    queryKey: ['admin-orders', page, limit],
    queryFn: async () => {
      const result = await ordersApi.list({ page, limit });
      return result as unknown as { data: Order[] };
    },
  });

  const orders: Order[] = ordersData?.data || [];

  const updateStatus = (orderId: number, newStatus: string) => {
    ordersApi.updateStatus(orderId, newStatus).then(() => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
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
    <div className="card">
      <div className="card__head">
        <span className="card__title">Заказы ({orders.length})</span>
      </div>
      <div className="card__body card__body--flush">
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-3)' }}>
            Нет заказов
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
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="mono f11 text-white fw700">{order.orderNumber || `ORD-${order.id}`}</td>
                  <td>
                    <div className="text-white">{order.customerName}</div>
                    <div className="f11 text-muted">{order.customerEmail}</div>
                  </td>
                  <td className="mono f11">{new Date(order.createdAt).toLocaleString('ru-RU')}</td>
                  <td className="text-right text-white fw700">{order.total.toLocaleString('ru-RU')} ₽</td>
                  <td>
                    <span className={`badge badge--${statusColors[order.status]}`}>
                      <span className="badge-dot" />
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge--${order.paymentStatus === 'PAID' ? 'green' : order.paymentStatus === 'UNPAID' ? 'red' : 'muted'}`}>
                      {order.paymentStatus === 'PAID' ? 'Оплачен' : order.paymentStatus === 'UNPAID' ? 'Не оплачен' : 'Возврат'}
                    </span>
                  </td>
                  <td>
                    <div className="tbl-actions">
                      <select
                        className="form-select"
                        style={{ padding: '4px 8px', fontSize: '11px', width: 'auto' }}
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                      >
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
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

      {/* PAGINATION */}
      {orders.length >= limit && (
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
            disabled={orders.length < limit}
          >
            Вперёд
          </button>
        </div>
      )}
    </div>
  );
}
