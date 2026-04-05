'use client';

import { Breadcrumbs, Button } from '@/components/ui';
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('number');

  return (
    <>
      <div className="bg-black2 border-b border-gray1">
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Корзина', href: '/cart' },
              { label: 'Оформление заказа', href: '/checkout' },
              { label: 'Заказ оформлен' },
            ]}
          />
        </div>
      </div>

      <div className="container py-20">
        <div className="max-w-lg mx-auto text-center">
          {/* Иконка успеха */}
          <div className="w-24 h-24 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-12 h-12 text-green-500"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>

          <h1 className="font-display text-[32px] font-bold text-white2 mb-3">
            Заказ оформлен!
          </h1>

          {orderNumber && (
            <p className="text-[18px] text-orange font-display font-bold mb-2">
              № {orderNumber}
            </p>
          )}

          <p className="text-gray3 mb-8 max-w-md mx-auto">
            Спасибо за заказ! Мы уже начали его обработку. Вы получите уведомление на email, когда
            заказ будет готов к отправке.
          </p>

          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6 mb-8 text-left">
            <h3 className="font-display text-[16px] font-bold text-white2 mb-4">
              Что дальше?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange/20 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] text-orange font-bold">
                  1
                </span>
                <p className="text-[14px] text-gray3">
                  Мы проверим наличие товаров и подтвердим заказ
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange/20 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] text-orange font-bold">
                  2
                </span>
                <p className="text-[14px] text-gray3">
                  Вы получите email с подтверждением и деталями заказа
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange/20 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] text-orange font-bold">
                  3
                </span>
                <p className="text-[14px] text-gray3">
                  После оплаты заказ будет передан в доставку
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/profile">
              <Button variant="primary" size="lg">
                Мои заказы
              </Button>
            </Link>
            <Link href="/catalog">
              <Button variant="secondary" size="lg">
                Продолжить покупки
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="container py-20">
      <div className="max-w-lg mx-auto text-center">
        <div className="animate-pulse">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray1 rounded-full" />
          <div className="h-8 bg-gray1 rounded w-48 mx-auto mb-3" />
          <div className="h-4 bg-gray1 rounded w-32 mx-auto mb-8" />
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
