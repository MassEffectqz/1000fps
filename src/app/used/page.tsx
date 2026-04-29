'use client';

import { Suspense } from 'react';
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

async function getUsedProducts() {
  try {
    const res = await fetch('/api/catalog?isUsed=true&limit=50');
    if (!res.ok) return { products: [] };
    return await res.json();
  } catch {
    return { products: [] };
  }
}

async function UsedProducts() {
  const data = await getUsedProducts();
  const products: Product[] = data.products || [];

  if (products.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function UsedPage() {
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

        <Suspense fallback={
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-black2 border border-gray1 rounded-[var(--radius)] h-[350px] animate-pulse" />
            ))}
          </div>
        }>
          <UsedProducts />
        </Suspense>
      </div>
    </div>
  );
}