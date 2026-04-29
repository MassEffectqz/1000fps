'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ProductCard } from '@/components/ui/product-card';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  images: { url: string }[];
  category: { name: string };
  brand: { name: string } | null;
  isHit: boolean;
  isNew: boolean;
  isFeatured: boolean;
}

export default function UsedPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/catalog?isUsed=true&limit=50')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setProducts(data.products || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Б/У техника' },
          ]}
          className="mb-6"
        />

        <div className="mb-8">
          <h1 className="font-display text-[32px] font-extrabold uppercase text-white2 mb-3">
            Б/У техника
          </h1>
          <p className="text-gray3 text-[14px] max-w-2xl">
            Мы предлагаем качественную б/у технику с гарантией. Все товары проходят проверку и тестирование перед продажей.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
            <div className="text-orange text-[24px] mb-2">✓</div>
            <div className="text-[14px] font-medium text-white2 mb-1">Гарантия</div>
            <div className="text-[12px] text-gray3">На все товары б/у от 14 дней до 6 месяцев</div>
          </div>
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
            <div className="text-orange text-[24px] mb-2">✓</div>
            <div className="text-[14px] font-medium text-white2 mb-1">Проверка</div>
            <div className="text-[12px] text-gray3">Каждый товар проходит полную диагностику</div>
          </div>
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
            <div className="text-orange text-[24px] mb-2">✓</div>
            <div className="text-[14px] font-medium text-white2 mb-1">Экономия</div>
            <div className="text-[12px] text-gray3">Цены до 50% ниже чем на новую технику</div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-black2 border border-gray1 rounded-[var(--radius)] h-[350px] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray3 text-[14px] mb-4">
              Товары б/у скоро появятся
            </div>
            <Link 
              href="/catalog" 
              className="inline-flex items-center justify-center gap-2 font-display font-bold uppercase tracking-wider rounded-[var(--radius)] transition-all duration-[180ms] ease bg-orange text-white hover:bg-orange2 px-[22px] py-[10px] text-[13px]"
            >
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                oldPrice={product.oldPrice || undefined}
                image={product.images?.[0]?.url || undefined}
                href={`/product/${product.slug}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}