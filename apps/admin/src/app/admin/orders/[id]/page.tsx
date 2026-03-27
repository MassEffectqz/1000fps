'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ordersApi } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface OrderCustomer {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface OrderShippingAddress {
  name: string;
  city: string;
  street: string;
  building: string;
  apartment?: string;
  zipCode?: string;
}

interface OrderItem {
  id: number;
  productId: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
}

interface Order {
  id: number;
  orderNumber: string;
  createdAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'ASSEMBLING' | 'SHIPPED' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED' | 'FAILED';
  customer: OrderCustomer;
  shippingAddress: OrderShippingAddress;
  shippingMethod: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  bonusPointsEarned: number;
  comment?: string;
}

const statusOptions = [
  { value: 'PENDING', label: 'Ожидает', color: 'yellow' },
  { value: 'CONFIRMED', label: 'Подтверждён', color: 'blue' },
  { value: 'PAID', label: 'Оплачен', color: 'green' },
  { value: 'ASSEMBLING', label: 'Комплектуется', color: 'purple' },
  { value: 'SHIPPED', label: 'Отправлен', color: 'blue' },
  { value: 'DELIVERING', label: 'В доставке', color: 'green' },
  { value: 'DELIVERED', label: 'Доставлен', color: 'gray' },
  { value: 'CANCELLED', label: 'Отменён', color: 'red' },
];

const paymentStatusOptions = [
  { value: 'UNPAID', label: 'Не оплачен', color: 'red' },
  { value: 'PAID', label: 'Оплачен', color: 'green' },
  { value: 'PARTIALLY_PAID', label: 'Частично', color: 'yellow' },
  { value: 'REFUNDED', label: 'Возврат', color: 'gray' },
  { value: 'FAILED', label: 'Ошибка', color: 'red' },
];

const colorClasses: Record<string, string> = {
  yellow: 'bg-yellow-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  gray: 'bg-gray-500',
  red: 'bg-red-500',
};

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = Number(params.id);
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const { data: orderData, isLoading } = useQuery<Order>({
    queryKey: ['admin-order', orderId],
    queryFn: async () => {
      const result = await ordersApi.get(orderId);
      return result as unknown as Order;
    },
    enabled: !isNaN(orderId),
  });

  const order = orderData || null;
  const [status, setStatus] = useState(order?.status || 'PENDING');
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || 'UNPAID');

  const handleUpdateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      setStatus(newStatus as Order['status']);
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setShowStatusModal(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statusValue: string) => {
    const option = statusOptions.find((o) => o.value === statusValue);
    return option?.color || 'gray';
  };

  const getPaymentStatusColor = (statusValue: string) => {
    const option = paymentStatusOptions.find((o) => o.value === statusValue);
    return option?.color || 'gray';
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
        Загрузка заказа...
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-3)' }}>
        Заказ не найден
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Link href="/admin/orders" className="hover:text-white transition">
              Заказы
            </Link>
            <span>/</span>
            <span className="text-white">{order.orderNumber}</span>
          </div>
          <h1 className="text-2xl font-bold text-white uppercase font-display">
            Заказ {order.orderNumber}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-[var(--black2)] border border-[var(--gray1)] rounded text-sm font-medium text-gray-400 hover:text-white transition inline-flex items-center gap-2"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4"
            >
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Печать
          </button>
          <button
            onClick={() => setShowStatusModal(true)}
            disabled={loading}
            className="px-6 py-2 bg-[var(--orange)] hover:bg-[var(--orange2)] disabled:bg-gray-600 text-white text-sm font-display font-bold uppercase tracking-wide rounded transition"
          >
            Изменить статус
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--black2)] border border-[var(--gray1)] rounded p-5">
          <p className="text-xs text-gray-400 uppercase mb-2">Статус заказа</p>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${colorClasses[getStatusColor(status)]}`} />
            <span className="text-lg font-bold text-white">
              {statusOptions.find((o) => o.value === status)?.label || status}
            </span>
          </div>
        </div>

        <div className="bg-[var(--black2)] border border-[var(--gray1)] rounded p-5">
          <p className="text-xs text-gray-400 uppercase mb-2">Статус оплаты</p>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${colorClasses[getPaymentStatusColor(paymentStatus)]}`}
            />
            <span className="text-lg font-bold text-white">
              {paymentStatusOptions.find((o) => o.value === paymentStatus)?.label || paymentStatus}
            </span>
          </div>
        </div>

        <div className="bg-[var(--black2)] border border-[var(--gray1)] rounded p-5">
          <p className="text-xs text-gray-400 uppercase mb-2">Дата создания</p>
          <p className="text-lg font-bold text-white">
            {new Date(order.createdAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-[var(--black2)] border border-[var(--gray1)] rounded p-5">
          <h3 className="text-sm font-medium text-gray-400 uppercase mb-4">Клиент</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Имя</p>
              <p className="text-white font-medium">{order.customer.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-white font-medium">{order.customer.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Телефон</p>
              <p className="text-white font-medium">{order.customer.phone}</p>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-[var(--black2)] border border-[var(--gray1)] rounded p-5">
          <h3 className="text-sm font-medium text-gray-400 uppercase mb-4">Адрес доставки</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Получатель</p>
              <p className="text-white font-medium">{order.shippingAddress.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Адрес</p>
              <p className="text-white font-medium">
                {order.shippingAddress.city}, {order.shippingAddress.street},{' '}
                {order.shippingAddress.building}
                {order.shippingAddress.apartment && ` (${order.shippingAddress.apartment})`}
              </p>
            </div>
            {order.shippingAddress.zipCode && (
              <div>
                <p className="text-xs text-gray-500">Индекс</p>
                <p className="text-white font-medium">{order.shippingAddress.zipCode}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">Способ доставки</p>
              <p className="text-white font-medium capitalize">
                {order.shippingMethod === 'delivery' ? 'Курьер' : 'Самовывоз'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-[var(--black2)] border border-[var(--gray1)] rounded overflow-hidden">
        <div className="p-5 border-b border-[var(--gray1)]">
          <h3 className="text-sm font-medium text-gray-400 uppercase">Товары</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--black3)]">
              <tr>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase text-left">
                  Товар
                </th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase text-center">
                  Кол-во
                </th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase text-right">
                  Цена
                </th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase text-right">
                  Сумма
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--gray1)]">
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--black3)] transition">
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-white">{item.name}</p>
                      <p className="text-xs text-gray-500 font-mono">Арт: {item.sku}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-sm text-gray-300">{item.quantity}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm text-gray-300">
                      {item.price.toLocaleString('ru-RU')} ₽
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-bold text-white font-display">
                      {item.total.toLocaleString('ru-RU')} ₽
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-[var(--black2)] border border-[var(--gray1)] rounded p-5">
        <div className="space-y-3 max-w-md ml-auto">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Подытог:</span>
            <span className="text-white font-medium">
              {order.subtotal.toLocaleString('ru-RU')} ₽
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Скидка:</span>
              <span className="text-green-500 font-medium">
                -{order.discount.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Доставка:</span>
            <span className="text-white font-medium">
              {order.shippingCost === 0
                ? 'Бесплатно'
                : `${order.shippingCost.toLocaleString('ru-RU')} ₽`}
            </span>
          </div>
          <div className="flex justify-between pt-3 border-t border-[var(--gray1)]">
            <span className="text-base font-medium text-white">Итого:</span>
            <span className="text-xl font-bold text-white font-display">
              {order.total.toLocaleString('ru-RU')} ₽
            </span>
          </div>
          {order.bonusPointsEarned > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Начислено бонусов:</span>
              <span className="text-orange-500 font-medium">+{order.bonusPointsEarned} ₽</span>
            </div>
          )}
        </div>
      </div>

      {/* Comment */}
      {order.comment && (
        <div className="bg-[var(--black2)] border border-[var(--gray1)] rounded p-5">
          <h3 className="text-sm font-medium text-gray-400 uppercase mb-2">Комментарий к заказу</h3>
          <p className="text-sm text-gray-300">{order.comment}</p>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--black2)] border border-[var(--gray1)] rounded p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white uppercase font-display mb-4">
              Изменить статус
            </h3>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleUpdateStatus(option.value)}
                  disabled={loading}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded transition ${
                    status === option.value
                      ? 'bg-[var(--orange)] text-white'
                      : 'bg-[var(--black3)] text-gray-300 hover:bg-[var(--black4)]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${colorClasses[option.color]}`} />
                  {option.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowStatusModal(false)}
              disabled={loading}
              className="w-full mt-4 px-4 py-3 bg-[var(--gray1)] hover:bg-[var(--gray2)] text-white rounded transition"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
