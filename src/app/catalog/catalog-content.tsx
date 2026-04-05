'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/ui/product-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductsData {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    oldPrice: number | null;
    discountedPrice: number;
    rating: number;
    reviewCount: number;
    salesCount: number;
    stock: number;
    specs: string;
    badges: Array<{ text: string; variant: 'orange' | 'green' | 'blue' | 'gray' | 'yellow' }>;
    category: { id: string; name: string; slug: string };
    brand: { id: string; name: string; slug: string } | null;
    image: string | null;
    href: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CatalogContentProps {
  productsData: ProductsData;
  categories: Array<{ name: string; href: string; count?: number; active?: boolean; child?: boolean }>;
  currentCategory: { name: string; slug: string } | null | undefined;
  page: number;
  limit: number;
  sortBy: string;
}

export function CatalogContent({
  productsData,
  currentCategory,
  page,
  sortBy,
}: CatalogContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [localSortBy, setLocalSortBy] = useState(sortBy);

  const { products, pagination } = productsData;

  // Обработчик изменения сортировки
  const handleSortChange = (value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(window.location.search);
      params.set('sortBy', value);
      router.push(`/catalog?${params.toString()}`);
    });
  };

  // Обработчик изменения страницы
  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(window.location.search);
      params.set('page', String(newPage));
      router.push(`/catalog?${params.toString()}`);
    });
  };

  // Популярные теги (можно вынести в отдельный API)
  const popularTags = [
    'RTX 4070 Ti',
    'RTX 4090',
    'RTX 4060',
    'RX 7900 XTX',
    'До 50 000 руб.',
    '16 ГБ',
  ];

  return (
    <div className="min-w-0">
      {/* Page title */}
      <div className="px-4 pt-4 pb-[14px] border-b border-gray1 bg-black2">
        <h1 className="text-[clamp(20px,2.5vw,28px)] mb-1">
          {currentCategory?.name || 'Каталог товаров'}
        </h1>
        <p className="text-[12px] text-gray3 pb-[14px]">
          {pagination.total} товаров в наличии. Официальная гарантия. Доставка по всей России.
        </p>
      </div>

      {/* Tags strip */}
      <div className="flex items-center gap-2 flex-wrap px-4 py-3 border-b border-gray1 bg-black2">
        <span className="text-[11px] text-gray3 flex-shrink-0">Популярное:</span>
        {popularTags.map((tag) => (
          <Link
            key={tag}
            href={`/catalog?search=${encodeURIComponent(tag)}`}
            className="px-3 py-1 bg-black3 border border-gray1 rounded-full text-[12px] text-gray4 cursor-pointer transition-colors hover:border-orange hover:text-orange"
          >
            {tag}
          </Link>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 border-b border-gray1 bg-black2">
        <span className="text-[13px] text-gray3">
          Показано <strong className="text-white">{products.length} из {pagination.total}</strong> товаров
        </span>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <span className="text-[12px] text-gray3 whitespace-nowrap">Сортировать:</span>
          <select
            value={localSortBy}
            onChange={(e) => {
              setLocalSortBy(e.target.value);
              handleSortChange(e.target.value);
            }}
            disabled={isPending}
            className="flex-1 sm:flex-none bg-black3 border border-gray1 rounded-[var(--radius)] px-[10px] py-[6px] text-white text-[13px] outline-none cursor-pointer transition-colors focus:border-orange appearance-none pr-7 disabled:opacity-50"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '14px',
            }}
          >
            <option value="popular">По популярности</option>
            <option value="price-asc">Сначала дешевле</option>
            <option value="price-desc">Сначала дороже</option>
            <option value="newest">По новинкам</option>
            <option value="rating">По рейтингу</option>
          </select>
          <div className="flex gap-[2px] ml-auto sm:ml-0">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'w-9 h-9 flex items-center justify-center bg-black3 border border-gray1 rounded-[var(--radius)] text-gray3 cursor-pointer transition-colors hover:text-white',
                viewMode === 'grid' && 'border-orange text-orange'
              )}
              aria-label="Сетка"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px]">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'w-9 h-9 flex items-center justify-center bg-black3 border border-gray1 rounded-[var(--radius)] text-gray3 cursor-pointer transition-colors hover:text-white',
                viewMode === 'list' && 'border-orange text-orange'
              )}
              aria-label="Список"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px]">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Products grid/list */}
      {isPending ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-px bg-gray1 border-l border-gray1 p-px">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-black2 p-4">
              <div className="aspect-[4/3] bg-gray1 rounded animate-pulse mb-4" />
              <div className="h-4 bg-gray1 rounded animate-pulse mb-2" />
              <div className="h-4 w-2/3 bg-gray1 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-px bg-gray1 border-l border-gray1">
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
                inStock={product.stock > 0}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-gray3 mb-4">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <path d="M11 8v6M8 11h6" />
            </svg>
            <h3 className="text-[18px] font-display font-bold text-white mb-2">
              Ничего не найдено
            </h3>
            <p className="text-[14px] text-gray3 mb-4">
              Попробуйте изменить параметры поиска или фильтры
            </p>
            <Button onClick={() => router.push('/catalog')}>
              Сбросить фильтры
            </Button>
          </div>
        )
      ) : (
        <div className="flex flex-col">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 bg-black2 border-b border-gray1 transition-colors hover:bg-black3"
            >
              <div className="w-full sm:w-[140px] sm:h-[100px] h-[140px] bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={140}
                    height={100}
                    className="w-full h-full object-contain p-2"
                    unoptimized
                  />
                ) : (
                  <svg viewBox="0 0 120 90" fill="none" className="w-full h-full p-2">
                    <rect x="10" y="22" width="100" height="54" rx="2" stroke="var(--gray2)" strokeWidth="2" />
                    <rect x="20" y="29" width="28" height="38" rx="1" stroke="var(--orange)" strokeWidth="1.5" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={product.href} className="text-[14px] text-white2 font-semibold mb-[6px] block hover:text-orange truncate">
                  {product.name}
                </Link>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-[10px]">
                  <span className="text-[11px] text-gray3 truncate">{product.specs}</span>
                </div>
                <div className="text-orange text-[12px]">
                  {'★'.repeat(Math.floor(product.rating))}
                  {'☆'.repeat(5 - Math.floor(product.rating))}
                  <span className="text-gray3"> ({product.reviewCount})</span>
                </div>
              </div>
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-[10px] flex-shrink-0">
                <div className="text-right">
                  <div className="font-display text-[16px] sm:text-[18px] font-extrabold text-white2 leading-none">
                    {product.discountedPrice.toLocaleString('ru-RU')} руб.
                  </div>
                  {product.oldPrice && (
                    <div className="text-[11px] text-gray3 line-through">
                      {product.oldPrice.toLocaleString('ru-RU')} руб.
                    </div>
                  )}
                </div>
                <Button size="sm">В корзину</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-wrap items-center gap-1 pt-4 pb-4 border-t border-gray1 bg-black2 px-3 sm:px-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="min-w-[36px] h-9 flex items-center justify-center bg-black3 border border-gray1 rounded-[var(--radius)] text-[13px] text-gray4 cursor-pointer transition-colors hover:border-gray2 hover:text-white font-display font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ←
          </button>

          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            let pageNum;
            if (pagination.totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= pagination.totalPages - 2) {
              pageNum = pagination.totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={cn(
                  'min-w-[36px] h-9 flex items-center justify-center bg-black3 border border-gray1 rounded-[var(--radius)] text-[13px] cursor-pointer transition-colors hover:border-gray2 hover:text-white font-display font-semibold',
                  page === pageNum && 'bg-orange border-orange text-white'
                )}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === pagination.totalPages}
            className="min-w-[36px] h-9 flex items-center justify-center bg-black3 border border-gray1 rounded-[var(--radius)] text-gray3 cursor-pointer transition-colors hover:border-gray2 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[14px] h-[14px]">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          <span className="w-full text-center sm:w-auto sm:ml-auto text-[12px] text-gray3 mt-1 sm:mt-0">
            Страница <strong className="text-white">{page} из {pagination.totalPages}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
