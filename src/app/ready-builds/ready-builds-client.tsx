'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { AddToCartButton } from '@/components/layout';
import { cn } from '@/lib/utils';

interface ReadyBuild {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  image: string | null;
  description: string | null;
  specs: Array<{ name: string; value: string }>;
  badge: string | null;
  inStock: boolean;
  stockCount: number;
}

interface ReadyBuildsClientProps {
  builds: ReadyBuild[];
}

const filters = [
  { id: 'all', label: 'Все сборки' },
  { id: 'gaming', label: 'Игровые' },
  { id: 'office', label: 'Офисные' },
  { id: 'pro', label: 'Профессиональные' },
  { id: 'budget', label: 'Бюджетные' },
];

export function ReadyBuildsClient({ builds }: ReadyBuildsClientProps) {
  const [activeFilter, setActiveFilter] = useState('all');

  // TODO: добавить фильтрацию когда будут категории
  const filteredBuilds = builds;

  return (
    <div className="min-h-screen bg-[var(--color-black)]">
      {/* Hero */}
      <div className="bg-gradient-to-b from-orange/10 to-transparent border-b border-[var(--color-gray1)]">
        <div className="container py-8 sm:py-12">
          <h1 className="font-display text-[clamp(24px,4vw,36px)] font-extrabold text-white2 mb-3">
            Готовые сборки ПК
          </h1>
          <p className="text-[14px] sm:text-[15px] text-gray3 max-w-2xl leading-relaxed">
            Собраны и протестированы нашими специалистами. Полностью совместимые комплектующие, 
            профессиональная сборка кабелей и гарантия на каждый компьютер.
          </p>
        </div>
      </div>

      <div className="container py-6 sm:py-8">
        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                'px-4 py-2 rounded-[var(--radius)] text-[13px] font-semibold whitespace-nowrap transition-colors',
                activeFilter === filter.id
                  ? 'bg-orange text-white'
                  : 'bg-[var(--color-black2)] border border-[var(--color-gray1)] text-gray4 hover:text-white hover:border-orange'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Builds Grid */}
        {filteredBuilds.length === 0 ? (
          <div className="text-center py-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-gray2 mx-auto mb-4">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            <h3 className="text-[16px] font-semibold text-white2 mb-2">Готовые сборки скоро появятся</h3>
            <p className="text-[14px] text-gray3">Мы работаем над этим. Следите за обновлениями!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredBuilds.map((build) => (
              <div
                key={build.id}
                className="group bg-[var(--color-black2)] border border-[var(--color-gray1)] rounded-[var(--radius)] overflow-hidden transition-colors hover:border-orange"
              >
                {/* Image */}
                <Link href={`/product/${build.slug}`} className="block relative aspect-[4/3] bg-[var(--color-black3)] p-4 border-b border-[var(--color-gray1)]">
                  {build.image ? (
                    <Image
                      src={build.image}
                      alt={build.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-gray2">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <path d="M8 21h8M12 17v4" />
                      </svg>
                    </div>
                  )}
                  {build.badge && (
                    <div className="absolute top-3 left-3">
                      <span className={cn(
                        'px-2 py-1 rounded text-[10px] font-bold uppercase',
                        build.badge === 'new' ? 'bg-green text-white' : 'bg-orange text-white'
                      )}>
                        {build.badge === 'new' ? 'Новинка' : 'Хит'}
                      </span>
                    </div>
                  )}
                  {!build.inStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-red text-white px-3 py-1.5 rounded text-[12px] font-bold">Нет в наличии</span>
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="p-4">
                  <Link href={`/product/${build.slug}`} className="block">
                    <h3 className="text-[14px] font-semibold text-white mb-3 line-clamp-2 group-hover:text-orange transition-colors">
                      {build.name}
                    </h3>
                  </Link>

                  {/* Specs */}
                  {build.specs.length > 0 && (
                    <div className="space-y-1.5 mb-4">
                      {build.specs.slice(0, 4).map((spec, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px]">
                          <span className="text-gray3">{spec.name}</span>
                          <span className="text-white2 font-medium truncate ml-2">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Price + Actions */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--color-gray1)]">
                    <div>
                      <div className="font-display text-[18px] font-extrabold text-white2 whitespace-nowrap">
                        {build.price.toLocaleString('ru-RU')} ₽
                      </div>
                      {build.oldPrice && (
                        <div className="text-[11px] text-gray3 line-through">
                          {build.oldPrice.toLocaleString('ru-RU')} ₽
                        </div>
                      )}
                    </div>
                    <AddToCartButton
                      productId={build.id}
                      variant="primary"
                      size="sm"
                      inStock={build.inStock}
                      className="h-9 px-4 text-[11px] font-bold"
                    >
                      В корзину
                    </AddToCartButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--color-black2)] border border-[var(--color-gray1)] rounded-[var(--radius)] p-6">
            <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-orange">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h4 className="text-[14px] font-semibold text-white2 mb-1">Проверка совместимости</h4>
            <p className="text-[12px] text-gray3">Каждая сборка проходит тщательную проверку совместимости комплектующих</p>
          </div>
          <div className="bg-[var(--color-black2)] border border-[var(--color-gray1)] rounded-[var(--radius)] p-6">
            <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-orange">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h4 className="text-[14px] font-semibold text-white2 mb-1">Гарантия 2 года</h4>
            <p className="text-[12px] text-gray3">Расширенная гарантия на все компоненты и качество сборки</p>
          </div>
          <div className="bg-[var(--color-black2)] border border-[var(--color-gray1)] rounded-[var(--radius)] p-6">
            <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-orange">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <h4 className="text-[14px] font-semibold text-white2 mb-1">Бесплатная доставка</h4>
            <p className="text-[12px] text-gray3">Бесплатная доставка по Волгограду при заказе от 50 000 ₽</p>
          </div>
        </div>
      </div>
    </div>
  );
}
