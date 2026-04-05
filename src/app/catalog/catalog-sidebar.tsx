'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function CatalogSidebar({
  categories,
  currentCategoryId,
  minPrice,
  maxPrice,
  inStock,
}: {
  categories: Array<{ name: string; href: string; count?: number; active?: boolean; child?: boolean }>;
  currentCategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}) {
  const [priceFrom, setPriceFrom] = useState(minPrice?.toString() || '');
  const [priceTo, setPriceTo] = useState(maxPrice?.toString() || '');
  const [stock, setStock] = useState(inStock || false);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (currentCategoryId) params.set('categoryId', currentCategoryId);
    if (priceFrom) params.set('minPrice', priceFrom);
    if (priceTo) params.set('maxPrice', priceTo);
    if (stock) params.set('inStock', 'true');
    window.location.href = `/catalog${params.toString() ? `?${params.toString()}` : ''}`;
  };

  // Активные фильтры для отображения
  const activeFilters: Array<{ name: string; href: string }> = [];

  if (currentCategoryId) {
    const cat = categories.find(c => c.href.includes(currentCategoryId));
    if (cat) activeFilters.push({ name: cat.name, href: '/catalog' });
  }

  if (minPrice !== undefined) {
    const params = new URLSearchParams(window.location.search);
    params.delete('minPrice');
    activeFilters.push({ name: `от ${minPrice.toLocaleString('ru-RU')} руб.`, href: `/catalog?${params.toString()}` });
  }

  if (maxPrice !== undefined) {
    const params = new URLSearchParams(window.location.search);
    params.delete('maxPrice');
    activeFilters.push({ name: `до ${maxPrice.toLocaleString('ru-RU')} руб.`, href: `/catalog?${params.toString()}` });
  }

  if (inStock) {
    const params = new URLSearchParams(window.location.search);
    params.delete('inStock');
    activeFilters.push({ name: 'В наличии', href: `/catalog?${params.toString()}` });
  }

  return (
    <aside className="border-r border-gray1 sticky top-[140px] max-h-[calc(100vh-140px)] overflow-y-auto">
      {/* Category tree */}
      <div className="border-b border-gray1">
        <div className="flex items-center justify-between px-4 py-[14px] font-display text-[11px] font-bold tracking-wider uppercase text-orange border-b border-gray1">
          Категория
        </div>
        {categories.map((cat, index) => (
          <a
            key={index}
            href={cat.href}
            className={cn(
              'flex items-center justify-between px-4 py-[9px] text-[13px] text-gray4 border-b border-transparent cursor-pointer transition-colors hover:bg-black3 hover:text-white',
              cat.active && 'bg-black3 text-orange border-l-2 border-orange',
              cat.child && 'pl-7'
            )}
          >
            {cat.name}
            {cat.count !== undefined && (
              <span className="text-[10px] text-gray3">{cat.count}</span>
            )}
          </a>
        ))}
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="px-4 py-[10px] border-b border-gray1">
          <div className="flex items-center justify-between text-[11px] text-gray3 mb-[6px]">
            <span>Применены фильтры</span>
            <a href="/catalog" className="text-orange hover:text-orange3">Сбросить все</a>
          </div>
          <div className="flex flex-wrap gap-[4px]">
            {activeFilters.map((filter, i) => (
              <a
                key={i}
                href={filter.href}
                className="flex items-center gap-1 px-2 py-[3px] bg-black3 border border-gray1 rounded-[var(--radius)] text-[11px] text-gray4 hover:border-orange hover:text-orange transition-colors"
              >
                {filter.name}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[10px] h-[10px]">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Price filter */}
      <div className="border-b border-gray1">
        <div className="px-4 py-[14px] font-display text-[11px] font-bold tracking-wider uppercase text-orange border-b border-gray1">
          Цена, руб.
        </div>
        <div className="px-4 py-3 space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="От"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[6px] text-[12px] outline-none focus:border-orange"
            />
            <input
              type="number"
              placeholder="До"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[6px] text-[12px] outline-none focus:border-orange"
            />
          </div>
          <Button variant="primary" fullWidth size="sm" onClick={handleApplyFilters}>
            Применить
          </Button>
        </div>
      </div>

      {/* Availability filter */}
      <div className="border-b border-gray1">
        <div className="px-4 py-[14px] font-display text-[11px] font-bold tracking-wider uppercase text-orange border-b border-gray1">
          Наличие
        </div>
        <div className="px-4 py-3">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={stock}
              onChange={(e) => setStock(e.target.checked)}
              className="w-4 h-4 rounded border-gray1 bg-black3 text-orange focus:ring-orange focus:ring-offset-0"
            />
            <span className="text-[13px] text-gray4 group-hover:text-white transition-colors">Есть в наличии</span>
          </label>
        </div>
      </div>
    </aside>
  );
}
