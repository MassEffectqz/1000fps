import { Suspense } from 'react';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { getProducts, getCategoriesWithCount } from '@/lib/actions/catalog';
import { CatalogContent } from './catalog-content';
import { CatalogSidebar } from './catalog-sidebar';
import { CatalogFilterInit } from './catalog-filter-init';

interface CatalogPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    categoryId?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    sortBy?: string;
    inStock?: string;
  }>;
}

import { prisma } from '@/lib/prisma';

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  const page = parseInt(params.page || '1');
  const limit = parseInt(params.limit || '20');
  const categorySlug = params.category;
  let categoryId = params.categoryId;

  // Если передан category slug - получаем id
  if (categorySlug && !categoryId) {
    const cat = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true },
    });
    if (cat) {
      categoryId = cat.id;
    }
  }

  const minPrice = params.minPrice ? parseInt(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseInt(params.maxPrice) : undefined;
  const search = params.search;
  const sortBy = params.sortBy || 'popular';
  const inStock = params.inStock === 'true';

  // Загружаем данные параллельно
  const [productsData, categoriesData] = await Promise.all([
    getProducts({
      page,
      limit,
      categoryId,
      minPrice,
      maxPrice,
      search,
      isInStock: inStock,
      sortBy: (sortBy === 'price' ? 'price-asc' : sortBy === 'default' ? 'popular' : sortBy) as 'price-asc' | 'price-desc' | 'newest' | 'rating' | 'popular' | 'sales',
    }),
    getCategoriesWithCount(),
  ]);

  // Форматируем категории для дерева
  const categoriesTree = [
    { name: 'Все комплектующие', href: '/catalog', count: categoriesData.reduce((sum, cat) => sum + cat.count, 0) },
    ...categoriesData.flatMap((cat) => [
      {
        name: cat.name,
        href: `/catalog?categoryId=${cat.id}`,
        count: cat.count,
        active: categoryId === cat.id,
      },
      ...cat.children.map((child) => ({
        name: child.name,
        href: `/catalog?categoryId=${child.id}`,
        count: child.count,
        child: true,
        active: categoryId === child.id,
      })),
    ]),
  ];

  // Получаем текущую категорию
  const currentCategory = categoryId
    ? categoriesData.find(cat => cat.id === categoryId) ||
      categoriesData.flatMap(cat => cat.children).find(child => child.id === categoryId)
    : null;

  // Считаем активные фильтры
  const activeFiltersCount = [categoryId, minPrice, maxPrice, inStock].filter(Boolean).length;

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-black2 border-b border-gray1">
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: currentCategory?.name || 'Каталог', href: currentCategory ? '/catalog' : undefined },
            ].filter(Boolean)}
          />
        </div>
      </div>

      <div className="container" style={{ paddingTop: 0, paddingBottom: 40 }}>
        {/* Mobile filter bar */}
        <div className="lg:hidden mb-4">
          <CatalogMobileFilterBar
            categories={categoriesTree}
            currentCategoryId={categoryId}
            minPrice={minPrice}
            maxPrice={maxPrice}
            inStock={inStock}
            activeFiltersCount={activeFiltersCount}
          />
          <CatalogFilterInit
            categories={categoriesTree}
            currentCategoryId={categoryId}
            minPrice={minPrice}
            maxPrice={maxPrice}
            inStock={inStock}
            activeFiltersCount={activeFiltersCount}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-0 items-start min-h-[calc(100vh-200px)]">
          {/* Sidebar — hidden on mobile, visible on lg+ */}
          <div className="hidden lg:block">
            <CatalogSidebar
              categories={categoriesTree}
              currentCategoryId={categoryId}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStock={inStock}
            />
          </div>

          {/* Content */}
          <Suspense fallback={<CatalogLoading />}>
            <CatalogContent
              productsData={productsData}
              categories={categoriesTree}
              currentCategory={currentCategory}
              page={page}
              limit={limit}
              sortBy={sortBy}
            />
          </Suspense>
        </div>
      </div>
    </>
  );
}

// Мобильная панель фильтров с кнопкой открытия drawer
function CatalogMobileFilterBar({
  categories,
  currentCategoryId,
  minPrice,
  inStock,
  activeFiltersCount,
}: {
  categories: Array<{ name: string; href: string; count?: number; active?: boolean; child?: boolean }>;
  currentCategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  activeFiltersCount: number;
}) {
  return (
    <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-3 flex items-center gap-3">
      <button
        id="mobile-filter-btn"
        className="flex-1 flex items-center justify-center gap-2 bg-black3 border border-gray1 rounded-[var(--radius)] px-4 py-2.5 text-[14px] text-white2 active:bg-gray1"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        Фильтры
        {activeFiltersCount > 0 && (
          <span className="bg-orange text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Active filters preview */}
      {currentCategoryId && (
        <span className="px-2.5 py-1 bg-black3 border border-gray1 rounded-full text-[11px] text-orange flex-shrink-0">
          {categories.find(c => c.href.includes(currentCategoryId))?.name || 'Категория'}
        </span>
      )}
      {minPrice !== undefined && (
        <span className="px-2.5 py-1 bg-black3 border border-gray1 rounded-full text-[11px] text-gray4 flex-shrink-0">
          от {minPrice.toLocaleString('ru-RU')}₽
        </span>
      )}
      {inStock && (
        <span className="px-2.5 py-1 bg-black3 border border-gray1 rounded-full text-[11px] text-gray4 flex-shrink-0">
          В наличии
        </span>
      )}
    </div>
  );
}

// Компонент загрузки
function CatalogLoading() {
  return (
    <div className="min-w-0">
      <div className="px-4 pt-4 pb-[14px] border-b border-gray1 bg-black2">
        <div className="h-8 w-48 bg-gray1 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 max-w-full bg-gray1 rounded animate-pulse" />
      </div>
      <div className="flex items-center gap-2 flex-wrap px-4 py-3 border-b border-gray1 bg-black2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-7 w-20 bg-gray1 rounded-full animate-pulse" />
        ))}
      </div>
      {/* Responsive loading skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-gray1 border-l border-gray1 p-px">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-black2 p-4">
            <div className="aspect-[4/3] bg-gray1 rounded animate-pulse mb-4" />
            <div className="h-4 bg-gray1 rounded animate-pulse mb-2" />
            <div className="h-4 w-2/3 bg-gray1 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
