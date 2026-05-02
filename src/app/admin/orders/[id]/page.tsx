'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  discount: number;
  deliveryCost: number;
  deliveryAddress?: string | null;
  deliveryMethod?: string | null;
  paymentMethod?: string | null;
  trackingNumber?: string | null;
  notes?: string | null;
  source?: string | null;
  createdAt: string;
  paidAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  user: {
    id: string;
    name?: string | null;
    email: string;
    phone?: string | null;
    role: string;
  };
  warehouse?: {
    id: string;
    name: string;
    city: string;
    address?: string | null;
  } | null;
  supplier?: {
    id: string;
    name: string;
    url?: string | null;
    price: unknown;
    oldPrice?: unknown | null;
    deliveryTime?: string | null;
    inStock: boolean;
    rating?: number | null;
    reviewsCount?: number | null;
  } | null;
  items: {
    id: string;
    quantity: number;
    price: number;
    total: number;
    product: {
      id: string;
      name: string;
      slug: string;
      sku: string;
      price: number;
      images: { url: string }[];
    };
  }[];
}

const statusConfig: Record<string, { label: string; class: string }> = {
  PENDING: { label: 'Новый', class: 'bg-blue-500/10 text-blue-500 border border-blue-500/20' },
  CONFIRMED: { label: 'Подтверждён', class: 'bg-blue-500/10 text-blue-500 border border-blue-500/20' },
  PAID: { label: 'Оплачен', class: 'bg-green-500/10 text-green-500 border border-green-500/20' },
  SHIPPING: { label: 'Доставляется', class: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' },
  DELIVERED: { label: 'Выполнен', class: 'bg-gray-500/10 text-gray-400 border border-gray-500/20' },
  CANCELLED: { label: 'Отменён', class: 'bg-red-500/10 text-red-500 border border-red-500/20' },
  REFUNDED: { label: 'Возврат', class: 'bg-red-500/10 text-red-500 border border-red-500/20' },
};

const paymentStatusConfig: Record<string, { label: string; class: string }> = {
  PENDING: { label: 'Ожидается', class: 'bg-blue-500/10 text-blue-500' },
  PAID: { label: 'Оплачен', class: 'bg-green-500/10 text-green-500' },
  FAILED: { label: 'Ошибка', class: 'bg-red-500/10 text-red-500' },
  REFUNDED: { label: 'Возврат', class: 'bg-yellow-500/10 text-yellow-500' },
};

interface AdminOrderPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderPage({ params }: AdminOrderPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState('');
  const [editedPaymentStatus, setEditedPaymentStatus] = useState('');

  const loadOrder = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/orders/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setEditedStatus(data.order.status);
        setEditedPaymentStatus(data.order.paymentStatus);
      } else {
        toast.error('Заказ не найден');
        router.push('/admin/orders');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Ошибка загрузки заказа');
    } finally {
      setIsLoading(false);
    }
  }, [resolvedParams.id, router]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editedStatus,
          paymentStatus: editedPaymentStatus,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setIsEditing(false);
        toast.success('Статус заказа обновлён');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка обновления');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Произошла ошибка при обновлении');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить этот заказ? Это действие нельзя отменить.')) return;

    try {
      const response = await fetch(`/api/admin/orders/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Заказ удалён');
        router.push('/admin/orders');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка удаления');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Произошла ошибка при удалении');
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

  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-12 text-center">
          <div className="text-[16px] font-semibold text-white mb-2">Заказ не найден</div>
          <Link href="/admin/orders" className="text-orange hover:underline">
            ← Вернуться к списку
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg = statusConfig[order.status] || statusConfig.PENDING;
  const paymentStatusCfg = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.PENDING;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin/orders" className="text-gray4 hover:text-orange transition-colors">
              ← Назад
            </Link>
            <h1 className="font-display text-[20px] font-bold text-white">Заказ {order.orderNumber}</h1>
          </div>
          <p className="text-[13px] text-gray4">Детали заказа</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-[8px] bg-black3 border border-gray1 rounded-[var(--radius)] text-[13px] text-white font-semibold hover:border-orange transition-colors"
          >
            {isEditing ? 'Отмена' : 'Изменить статус'}
          </button>
          {isEditing && (
            <button
              onClick={handleUpdateStatus}
              className="px-4 py-[8px] bg-orange rounded-[var(--radius)] text-[13px] text-white font-semibold hover:bg-orange2 transition-colors"
            >
              Сохранить
            </button>
          )}
          <button
            onClick={handleDelete}
            className="px-4 py-[8px] bg-black3 border border-gray1 rounded-[var(--radius)] text-[13px] text-red-500 font-semibold hover:border-red-500 transition-colors"
          >
            Удалить
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="col-span-2 space-y-6">
          {/* Статусы */}
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
            <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
              Статусы
            </h2>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-gray3 uppercase tracking-wider mb-2">
                    Статус заказа
                  </label>
                  <select
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value)}
                    className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-[13px] text-white outline-none focus:border-orange"
                  >
                    {Object.entries(statusConfig).map(([value, { label }]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-gray3 uppercase tracking-wider mb-2">
                    Статус оплаты
                  </label>
                  <select
                    value={editedPaymentStatus}
                    onChange={(e) => setEditedPaymentStatus(e.target.value)}
                    className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-[13px] text-white outline-none focus:border-orange"
                  >
                    {Object.entries(paymentStatusConfig).map(([value, { label }]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className={cn('text-[10px] font-bold px-[8px] py-[3px] rounded-[var(--radius)]', statusCfg.class)}>
                  {statusCfg.label}
                </span>
                <span className={cn('text-[10px] font-bold px-[8px] py-[3px] rounded-[var(--radius)]', paymentStatusCfg.class)}>
                  {paymentStatusCfg.label}
                </span>
                {order.source && (
                  <span className={cn(
                    'text-[10px] font-bold px-[8px] py-[3px] rounded-[var(--radius)]',
                    order.source === 'WAREHOUSE' 
                      ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                      : 'bg-orange/10 text-orange border border-orange/20'
                  )}>
                    {order.source === 'WAREHOUSE' ? 'Со склада' : 'От поставщика'}
                  </span>
                )}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-gray1 grid grid-cols-3 gap-4">
              <div>
                <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Дата создания</div>
                <div className="text-[13px] text-white font-semibold">
                  {new Date(order.createdAt).toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              {order.paidAt && (
                <div>
                  <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Оплачен</div>
                  <div className="text-[13px] text-white font-semibold">
                    {new Date(order.paidAt).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              )}
              {order.shippedAt && (
                <div>
                  <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Отправлен</div>
                  <div className="text-[13px] text-white font-semibold">
                    {new Date(order.shippedAt).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              )}
              {order.deliveredAt && (
                <div>
                  <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Доставлен</div>
                  <div className="text-[13px] text-white font-semibold">
                    {new Date(order.deliveredAt).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Товары */}
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
            <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
              Товары в заказе
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-black3 rounded-[var(--radius)]">
                  {item.product.images[0] && (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-[var(--radius)]"
                    />
                  )}
                  <div className="flex-1">
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="text-[14px] font-bold text-white hover:text-orange transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <div className="text-[11px] text-gray4 mt-1">Артикул: {item.product.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-bold text-white">{item.price.toLocaleString('ru-RU')} ₽</div>
                    <div className="text-[12px] text-gray4">× {item.quantity} = {(item.price * item.quantity).toLocaleString('ru-RU')} ₽</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Заметки */}
          {order.notes && (
            <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
              <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-2">
                Заметки к заказу
              </h2>
              <p className="text-[13px] text-gray4 whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Клиент */}
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
            <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
              Клиент
            </h2>
            <div className="space-y-3">
              <div>
                <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Имя</div>
                <div className="text-[13px] text-white font-semibold">{order.user.name || 'Не указано'}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Email</div>
                <div className="text-[13px] text-white">{order.user.email}</div>
              </div>
              {order.user.phone && (
                <div>
                  <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Телефон</div>
                  <div className="text-[13px] text-white">{order.user.phone}</div>
                </div>
              )}
              <div>
                <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Роль</div>
                <div className="text-[13px] text-gray4 uppercase">{order.user.role}</div>
              </div>
            </div>
          </div>

          {/* Доставка */}
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
            <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
              Доставка
            </h2>
            {order.warehouse && (
              <div className="mb-3">
                <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Склад / ПВЗ</div>
                <div className="text-[13px] text-white">
                  {order.warehouse.city} — {order.warehouse.name}
                  {order.warehouse.address && <span className="text-gray4"> ({order.warehouse.address})</span>}
                </div>
              </div>
            )}
            {order.supplier && (
              <div className="mb-3">
                <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Поставщик</div>
                <div className="text-[13px] text-orange font-semibold">{order.supplier.name}</div>
                {order.supplier.url && (
                  <a 
                    href={order.supplier.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    {order.supplier.url}
                  </a>
                )}
                <div className="flex flex-wrap gap-3 mt-2 text-[12px]">
                  <div className="bg-black3 px-2 py-1 rounded">
                    <span className="text-gray4">Цена: </span>
                    <span className="text-white font-semibold">{Number(order.supplier.price).toLocaleString('ru-RU')} ₽</span>
                    {order.supplier.oldPrice && Number(order.supplier.oldPrice) > Number(order.supplier.price) ? (
                      <span className="text-gray4 line-through ml-2">{Number(String(order.supplier.oldPrice)).toLocaleString('ru-RU')} ₽</span>
                    ) : null}
                  </div>
                  {order.supplier.deliveryTime && (
                    <div className="bg-black3 px-2 py-1 rounded">
                      <span className="text-gray4">Срок: </span>
                      <span className="text-white">{order.supplier.deliveryTime}</span>
                    </div>
                  )}
                  <div className={`px-2 py-1 rounded ${order.supplier.inStock ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    <span className={order.supplier.inStock ? 'text-green-400' : 'text-red-400'}>
                      {order.supplier.inStock ? 'В наличии' : 'Нет в наличии'}
                    </span>
                  </div>
                  {order.supplier.rating && (
                    <div className="bg-black3 px-2 py-1 rounded">
                      <span className="text-gray4">Рейтинг: </span>
                      <span className="text-yellow-400">★ {order.supplier.rating.toFixed(1)}</span>
                      {order.supplier.reviewsCount && (
                        <span className="text-gray4"> ({order.supplier.reviewsCount} отзывов)</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {order.deliveryMethod && (
              <div className="mb-3">
                <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Способ доставки</div>
                <div className="text-[13px] text-white">{order.deliveryMethod}</div>
              </div>
            )}
            {order.deliveryAddress && (
              <div className="mb-3">
                <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Адрес доставки</div>
                <div className="text-[13px] text-white">{order.deliveryAddress}</div>
              </div>
            )}
            {order.trackingNumber && (
              <div>
                <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Трекинг номер</div>
                <div className="text-[13px] text-white font-mono">{order.trackingNumber}</div>
              </div>
            )}
          </div>

          {/* Итого */}
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
            <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
              Суммы
            </h2>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between text-gray4">
                <span>Подытог:</span>
                <span>{order.subtotal.toLocaleString('ru-RU')} ₽</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>Скидка:</span>
                  <span>-{order.discount.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}
              {order.deliveryCost > 0 && (
                <div className="flex justify-between text-gray4">
                  <span>Доставка:</span>
                  <span>{order.deliveryCost.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-[16px] pt-2 border-t border-gray1 mt-2">
                <span>Итого:</span>
                <span>{order.total.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </div>

          {/* Оплата */}
          {order.paymentMethod && (
            <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
              <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
                Оплата
              </h2>
              <div>
                <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Способ оплаты</div>
                <div className="text-[13px] text-white">{order.paymentMethod}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
