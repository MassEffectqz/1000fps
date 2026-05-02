'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs, Card } from '@/components/ui';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  product: {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  deliveryMethod: string | null;
  deliveryAddress: string | null;
  deliveryCost: number;
  subtotal: number;
  discount: number;
  total: number;
  trackingNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  warehouse: { id: string; name: string; address: string } | null;
  supplier: { id: string; name: string } | null;
  items: OrderItem[];
}

const statusLabels: Record<string, string> = {
  PENDING: 'Ожидает',
  CONFIRMED: 'Подтверждён',
  PROCESSING: 'В обработке',
  SHIPPED: 'Отправлен',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
};

const paymentStatusLabels: Record<string, string> = {
  PENDING: 'Ожидает оплаты',
  PAID: 'Оплачен',
  REFUNDED: 'Возвращён',
};

const paymentMethodLabels: Record<string, string> = {
  CASH: 'Наличными',
  CARD: 'Картой',
  ONLINE: 'Онлайн',
};

const deliveryMethodLabels: Record<string, string> = {
  PICKUP: 'Самовывоз',
  DELIVERY: 'Доставка',
  COURIER: 'Курьер',
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/orders?id=${params.id}`)
      .then(res => {
        if (res.status === 401) {
          router.push('/login?callbackUrl=/profile/orders');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data?.order) {
          setOrder(data.order);
        } else if (data?.error) {
          setError(data.error);
        }
      })
      .catch(() => setError('Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading) {
    return (
      <>
        <div className="bg-black2 border-b border-gray1">
          <div className="container">
            <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Профиль', href: '/profile' }, { label: 'Заказы', href: '/profile/orders' }, { label: 'Загрузка...' }]} />
          </div>
        </div>
        <div className="container py-10">
          <div className="h-8 w-48 bg-gray1 rounded animate-pulse mb-6" />
          <div className="h-64 bg-gray1 rounded-[var(--radius)] animate-pulse" />
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <div className="bg-black2 border-b border-gray1">
          <div className="container">
            <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Профиль', href: '/profile' }, { label: 'Заказы', href: '/profile/orders' }, { label: 'Ошибка' }]} />
          </div>
        </div>
        <div className="container py-10">
          <div className="text-center py-12">
            <p className="text-red text-lg mb-4">{error || 'Заказ не найден'}</p>
            <Link href="/profile/orders" className="text-orange hover:underline">
              Вернуться к списку заказов
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-black2 border-b border-gray1">
        <div className="container">
          <Breadcrumbs items={[
            { label: 'Главная', href: '/' },
            { label: 'Профиль', href: '/profile' },
            { label: 'Заказы', href: '/profile/orders' },
            { label: order.orderNumber },
          ]} />
        </div>
      </div>

      <div className="container py-4 sm:py-10">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/profile/orders" className="text-gray3 hover:text-orange transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="font-display text-[22px] sm:text-[28px] font-bold uppercase text-white2">
            Заказ {order.orderNumber}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-4 sm:p-6">
              <h2 className="font-display font-bold text-white2 text-lg mb-4">Товары</h2>
              <div className="space-y-4">
                {order.items.map(item => (
                  <Link
                    key={item.id}
                    href={`/product/${item.product.slug}`}
                    className="flex gap-4 p-3 -mx-3 rounded-[var(--radius)] hover:bg-black3 transition-colors"
                  >
                    <div className="w-16 h-16 bg-black3 rounded flex items-center justify-center flex-shrink-0">
                      {item.product.image ? (
                        <img src={item.product.image} alt="" className="w-12 h-12 object-contain" />
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-gray3">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm line-clamp-2">{item.product.name}</p>
                      <p className="text-gray3 text-xs mt-1">Арт: {item.product.id}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white text-sm">{item.quantity} × {item.price.toLocaleString('ru-RU')} ₽</p>
                      <p className="text-orange font-bold text-sm mt-1">{item.total.toLocaleString('ru-RU')} ₽</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-4 sm:p-6">
              <h2 className="font-display font-bold text-white2 text-lg mb-4">Статус</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray3">Заказ</span>
                  <span className="text-white font-medium">{statusLabels[order.status] || order.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray3">Оплата</span>
                  <span className="text-white font-medium">{paymentStatusLabels[order.paymentStatus] || order.paymentStatus}</span>
                </div>
                {order.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-gray3">Способ оплаты</span>
                    <span className="text-white">{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</span>
                  </div>
                )}
                {order.deliveryMethod && (
                  <div className="flex justify-between">
                    <span className="text-gray3">Доставка</span>
                    <span className="text-white">{deliveryMethodLabels[order.deliveryMethod] || order.deliveryMethod}</span>
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray3">Трек-номер</span>
                    <span className="text-orange font-mono">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <h2 className="font-display font-bold text-white2 text-lg mb-4">Контактные данные</h2>
              <div className="space-y-2 text-sm">
                {order.customerName && (
                  <p className="text-white"><span className="text-gray3">Имя: </span>{order.customerName}</p>
                )}
                {order.customerPhone && (
                  <p className="text-white"><span className="text-gray3">Телефон: </span>{order.customerPhone}</p>
                )}
                {order.customerEmail && (
                  <p className="text-white"><span className="text-gray3">Email: </span>{order.customerEmail}</p>
                )}
                {order.warehouse && (
                  <p className="text-white"><span className="text-gray3">Пункт выдачи: </span>{order.warehouse.name}</p>
                )}
                {order.supplier && (
                  <p className="text-white"><span className="text-gray3">Поставщик: </span>{order.supplier.name}</p>
                )}
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <h2 className="font-display font-bold text-white2 text-lg mb-4">Итого</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray3">Товары</span>
                  <span className="text-white">{order.subtotal.toLocaleString('ru-RU')} ₽</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray3">Скидка</span>
                    <span className="text-green">-{order.discount.toLocaleString('ru-RU')} ₽</span>
                  </div>
                )}
                {order.deliveryCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray3">Доставка</span>
                    <span className="text-white">{order.deliveryCost.toLocaleString('ru-RU')} ₽</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray1">
                  <span className="text-white font-bold">Итого</span>
                  <span className="text-orange font-bold text-lg">{order.total.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <h2 className="font-display font-bold text-white2 text-lg mb-4">Даты</h2>
              <div className="space-y-2 text-sm">
                <p className="text-white"><span className="text-gray3">Создан: </span>{new Date(order.createdAt).toLocaleString('ru-RU')}</p>
                {order.paidAt && (
                  <p className="text-white"><span className="text-gray3">Оплачен: </span>{new Date(order.paidAt).toLocaleString('ru-RU')}</p>
                )}
                {order.shippedAt && (
                  <p className="text-white"><span className="text-gray3">Отправлен: </span>{new Date(order.shippedAt).toLocaleString('ru-RU')}</p>
                )}
                {order.deliveredAt && (
                  <p className="text-white"><span className="text-gray3">Доставлен: </span>{new Date(order.deliveredAt).toLocaleString('ru-RU')}</p>
                )}
              </div>
            </Card>

            {order.notes && (
              <Card className="p-4 sm:p-6">
                <h2 className="font-display font-bold text-white2 text-lg mb-4">Комментарий</h2>
                <p className="text-white text-sm">{order.notes}</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}