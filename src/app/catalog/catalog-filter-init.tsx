'use client';

import { useEffect, useState } from 'react';
import { MobileFilterDrawer } from '@/components/catalog/mobile-filters';

interface CatalogFilterInitProps {
  categories: Array<{ name: string; href: string; count?: number; active?: boolean; child?: boolean }>;
  currentCategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  activeFiltersCount: number;
}

export function CatalogFilterInit({
  categories,
  currentCategoryId,
  minPrice,
  maxPrice,
  inStock,
  activeFiltersCount,
}: CatalogFilterInitProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const btn = document.getElementById('mobile-filter-btn');
    if (btn) {
      btn.addEventListener('click', () => setIsOpen(true));
    }
    return () => {
      btn?.removeEventListener('click', () => setIsOpen(true));
    };
  }, []);

  return (
    <MobileFilterDrawer
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      categories={categories}
      currentCategoryId={currentCategoryId}
      minPrice={minPrice}
      maxPrice={maxPrice}
      inStock={inStock}
      activeFiltersCount={activeFiltersCount}
    />
  );
}
