'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  categories: Array<{ name: string; href: string; count?: number; active?: boolean; child?: boolean }>;
  currentCategoryId?: string;
  activeFiltersCount: number;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  minPrice,
  maxPrice,
  inStock,
  categories,
  currentCategoryId,
  activeFiltersCount,
}: MobileFilterDrawerProps) {
  const router = useRouter();
  const [localMinPrice, setLocalMinPrice] = useState(minPrice?.toString() || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice?.toString() || '');
  const [localInStock, setLocalInStock] = useState(inStock || false);
  const [localCategory, setLocalCategory] = useState(currentCategoryId || '');

  const handleApply = () => {
    const params = new URLSearchParams();
    if (localMinPrice) params.set('minPrice', localMinPrice);
    if (localMaxPrice) params.set('maxPrice', localMaxPrice);
    if (localInStock) params.set('inStock', 'true');
    if (localCategory) params.set('categoryId', localCategory);

    onClose();
    router.push(`/catalog${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleReset = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalInStock(false);
    setLocalCategory('');
    onClose();
    router.push('/catalog');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-black2 border-t border-gray1 rounded-t-2xl max-h-[85vh] overflow-y-auto transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Фильтры"
      >
        {/* Handle */}
        <div className="sticky top-0 bg-black2 border-b border-gray1 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-[16px] font-bold uppercase text-white2">Фильтры</h2>
              {activeFiltersCount > 0 && (
                <span className="bg-orange/20 text-orange text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray3 hover:text-white"
              aria-label="Закрыть"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="pb-4">
          {/* Category */}
          <div className="border-b border-gray1">
            <div className="px-4 py-3 font-display text-[12px] font-bold uppercase tracking-wider text-orange">
              Категория
            </div>
            <div className="px-4 pb-3">
              <select
                value={localCategory}
                onChange={(e) => setLocalCategory(e.target.value)}
                className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-2.5 text-[14px] text-white2 outline-none focus:border-orange appearance-none"
              >
                <option value="">Все комплектующие</option>
                {categories.filter(c => !c.child).map((cat, i) => (
                  <option key={i} value={cat.href.includes('categoryId=') ? cat.href.split('categoryId=')[1] || '' : ''}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price */}
          <div className="border-b border-gray1">
            <div className="px-4 py-3 font-display text-[12px] font-bold uppercase tracking-wider text-orange">
              Цена, руб.
            </div>
            <div className="px-4 pb-3 flex gap-3">
              <div className="flex-1">
                <label className="block text-[11px] text-gray3 mb-1">От</label>
                <input
                  type="number"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  placeholder="0"
                  className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-2.5 text-[14px] text-white2 outline-none focus:border-orange"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] text-gray3 mb-1">До</label>
                <input
                  type="number"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  placeholder="999999"
                  className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-2.5 text-[14px] text-white2 outline-none focus:border-orange"
                />
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="border-b border-gray1">
            <div className="px-4 py-3 font-display text-[12px] font-bold uppercase tracking-wider text-orange">
              Наличие
            </div>
            <div className="px-4 pb-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={localInStock}
                    onChange={(e) => setLocalInStock(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={cn(
                    'w-11 h-6 rounded-full transition-colors',
                    localInStock ? 'bg-orange' : 'bg-gray1'
                  )}>
                    <div className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                      localInStock && 'translate-x-5'
                    )} />
                  </div>
                </div>
                <span className="text-[14px] text-white2">Есть в наличии</span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-4 pt-4 flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handleReset}
              className="flex-1"
            >
              Сбросить
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleApply}
              className="flex-1"
            >
              Применить
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
