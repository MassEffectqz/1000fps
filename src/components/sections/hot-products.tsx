'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/ui/product-card';

interface HotProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  oldPrice: number | null;
  discountedPrice: number;
  rating: number;
  reviewCount: number;
  specs: string;
  badges: Array<{ text: string; variant: 'orange' | 'green' | 'blue' | 'gray' | 'yellow' }>;
  image: string | null;
  href: string;
}

export function HotProducts() {
  const [products, setProducts] = useState<HotProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 42, seconds: 18 });

  // Загрузка товаров
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?sortBy=sales&limit=5');
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Failed to fetch hot products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Таймер обратного отсчета
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNum = (num: number) => num.toString().padStart(2, '0');

  return (
    <section className="py-4 sm:py-6 lg:py-10">
      <div className="container">
        {/* Countdown bar */}
        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-3 sm:p-5 mb-4 sm:mb-5">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <span className="font-display text-[14px] font-bold tracking-wide uppercase text-white2">
              Горячие предложения
            </span>
            <div className="flex items-center gap-[5px]">
              <div className="flex flex-col items-center min-w-[36px] sm:min-w-[44px]">
                <div className="font-display text-[18px] sm:text-[24px] font-extrabold text-orange bg-black3 border border-gray1 px-1.5 sm:px-2 py-[3px] rounded-[var(--radius)] min-w-[36px] sm:min-w-[44px] text-center leading-none">
                  {formatNum(timeLeft.hours)}
                </div>
                <span className="text-[8px] sm:text-[9px] text-gray3 mt-[3px] uppercase tracking-wider">Часов</span>
              </div>
              <span className="font-display text-[16px] sm:text-[20px] font-extrabold text-gray2 mb-[14px]">:</span>
              <div className="flex flex-col items-center min-w-[36px] sm:min-w-[44px]">
                <div className="font-display text-[18px] sm:text-[24px] font-extrabold text-orange bg-black3 border border-gray1 px-1.5 sm:px-2 py-[3px] rounded-[var(--radius)] min-w-[36px] sm:min-w-[44px] text-center leading-none">
                  {formatNum(timeLeft.minutes)}
                </div>
                <span className="text-[8px] sm:text-[9px] text-gray3 mt-[3px] uppercase tracking-wider">Минут</span>
              </div>
              <span className="font-display text-[16px] sm:text-[20px] font-extrabold text-gray2 mb-[14px]">:</span>
              <div className="flex flex-col items-center min-w-[36px] sm:min-w-[44px]">
                <div className="font-display text-[18px] sm:text-[24px] font-extrabold text-orange bg-black3 border border-gray1 px-1.5 sm:px-2 py-[3px] rounded-[var(--radius)] min-w-[36px] sm:min-w-[44px] text-center leading-none">
                  {formatNum(timeLeft.seconds)}
                </div>
                <span className="text-[8px] sm:text-[9px] text-gray3 mt-[3px] uppercase tracking-wider">Секунд</span>
              </div>
            </div>
            <Link
              href="/catalog"
              className="ml-auto text-[12px] text-gray4 border border-transparent hover:text-white transition-colors"
            >
              Все акции
            </Link>
          </div>
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-black2 border border-gray1 rounded-[var(--radius)] overflow-hidden">
                <div className="aspect-[4/3] bg-gray1 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray1 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray1 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.discountedPrice}
                oldPrice={product.oldPrice || undefined}
                image={product.image || undefined}
                rating={product.rating}
                reviewCount={product.reviewCount}
                specs={product.specs}
                badges={product.badges}
                href={product.href}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-black2 border border-gray1 rounded-[var(--radius)]">
            <p className="text-gray3 text-[14px]">
              Горячие товары скоро появятся
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
