'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs, Button, Card } from '@/components/ui';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  itemsCount: number;
}

export default function ProfileOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/orders')
      .then(res => {
        if (res.status === 401) {
          router.push('/login?callbackUrl=/profile/orders');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data?.orders) {
          setOrders(data.orders);
        }
      })
      .catch(() => setError('Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <>
        <div className="bg-black2 border-b border-gray1">
          <div className="container">
            <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Профиль', href: '/profile' }, { label: 'Заказы' }]} />
          </div>
        </div>
        <div className="container py-6 sm:py-10">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-gray1 rounded-[var(--radius)] animate-pulse" />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (orders.length === 0) {
    return (
      <>
        <div className="bg-black2 border-b border-gray1">
          <div className="container">
            <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Профиль', href: '/profile' }, { label: 'Заказы' }]} />
          </div>
        </div>
        <div className="container py-10 sm:py-16">
          <div className="text-center py-12 sm:py-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 text-gray2">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h1 className="font-display text-[22px] sm:text-[28px] font-extrabold uppercase text-white2 mb-2 sm:mb-3">
              Заказов пока нет
            </h1>
            <p className="text-gray3 text-sm mb-6 sm:mb-8 max-w-md mx-auto px-4">
              После оформления заказа они появятся здесь.
            </p>
            <Button size="lg" onClick={() => router.push('/catalog')}>
              Перейти в каталог
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-black2 border-b border-gray1">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Профиль', href: '/profile' }, { label: 'Заказы' }]} />
        </div>
      </div>

      <div className="container py-4 sm:py-10">
        <h1 className="font-display text-[22px] sm:text-[28px] font-bold uppercase text-white2 mb-4 sm:mb-6">
          Мои заказы
        </h1>

        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order.id} href={`/profile/orders/${order.id}`}>
              <Card className="p-4 hover:border-orange/50 transition-colors cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-display font-bold text-white2">{order.orderNumber}</p>
                    <p className="text-sm text-gray3">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
                    <p className="text-sm text-gray3 mt-1">{order.itemsCount} товар(ов)</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-orange">{order.total.toLocaleString('ru-RU')} ₽</p>
                    <p className="text-sm text-gray3">{order.status}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}