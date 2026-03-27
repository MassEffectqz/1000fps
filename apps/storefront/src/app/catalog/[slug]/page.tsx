'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCategories, useProducts } from '@/hooks/useApi';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300000]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'newest' | 'rating'>('popular');
  const [currentPage, setCurrentPage] = useState(1);

  // Запрос категорий
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

  // Запрос товаров для категории
  const { data: productsData, isLoading: productsLoading } = useProducts({
    category: slug || undefined,
    minPrice: priceRange[0] || undefined,
    maxPrice: priceRange[1] || undefined,
    sort: sortBy,
    page: currentPage,
    limit: 24,
  });

  const categories = categoriesData?.data || [];
  const products = productsData?.data || [];
  const pagination = productsData?.pagination;

  // Находим текущую категорию
  const findCategory = (slug: string, cats: any[] = categories): any | null => {
    for (const cat of cats) {
      if (cat.slug === slug) return cat;
      if (cat.children) {
        const found = findCategory(slug, cat.children);
        if (found) return found;
      }
    }
    return null;
  };

  const currentCategory = findCategory(slug);

  const breadcrumbs = [
    { name: 'Главная', href: '/' },
    { name: 'Каталог', href: '/catalog' },
    { name: currentCategory?.name || slug },
  ];

  return (
    <div className="catalog-layout">
      {/* Breadcrumb */}
      <div style={{ background: 'var(--black2)', borderBottom: '1px solid var(--gray1)' }}>
        <div className="container">
          <div
            className="breadcrumb"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '14px 0',
              fontSize: '12px',
              color: 'var(--gray3)',
            }}
          >
            {breadcrumbs.map((crumb, idx) => (
              <span
                key={`${crumb.href}-${idx}`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {idx < breadcrumbs.length - 1 ? (
                  <Link
                    href={crumb.href as string}
                    style={{
                      color: 'var(--gray3)',
                      transition: 'color var(--tr)',
                      textDecoration: 'none',
                    }}
                  >
                    {crumb.name}
                  </Link>
                ) : (
                  <span style={{ color: 'var(--white)' }}>{crumb.name}</span>
                )}
                {idx < breadcrumbs.length - 1 && (
                  <span className="breadcrumb__sep" style={{ color: 'var(--gray2)' }}>
                    /
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '0 20px 40px' }}>
        <div
          className="catalog-content"
          style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 0, alignItems: 'start' }}
        >
          {/* Sidebar */}
          <aside
            className="sidebar"
            style={{
              borderRight: '1px solid var(--gray1)',
              position: 'sticky',
              top: '132px',
              maxHeight: 'calc(100vh - 142px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              paddingRight: '20px',
              paddingBottom: '20px',
              minWidth: 0,
            }}
          >
            {/* Category tree */}
            <div className="cat-tree" style={{ borderBottom: '1px solid var(--gray1)' }}>
              <div
                className="cat-tree__head"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--orange)',
                  borderBottom: '1px solid var(--gray1)',
                }}
              >
                Категория
              </div>
              <Link
                href="/catalog"
                className={`cat-tree__item ${!slug ? 'is-active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 16px',
                  fontSize: '13px',
                  color: !slug ? 'var(--orange)' : 'var(--gray4)',
                  background: !slug ? 'var(--black3)' : 'transparent',
                  borderLeft: !slug ? '2px solid var(--orange)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background var(--tr), color var(--tr)',
                  width: '100%',
                  textAlign: 'left',
                  textDecoration: 'none',
                }}
              >
                Все товары{' '}
                <span
                  className="cat-tree__count"
                  style={{ fontSize: '10px', color: 'var(--gray3)' }}
                >
                  {pagination?.totalItems || '...'}
                </span>
              </Link>
              {categoriesLoading ? (
                <div style={{ padding: '16px', color: 'var(--gray3)', fontSize: '13px' }}>
                  Загрузка...
                </div>
              ) : (
                categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/catalog/${cat.slug}`}
                    className={`cat-tree__item ${slug === cat.slug ? 'is-active' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 16px',
                      fontSize: '13px',
                      color: slug === cat.slug ? 'var(--orange)' : 'var(--gray4)',
                      background: slug === cat.slug ? 'var(--black3)' : 'transparent',
                      borderLeft:
                        slug === cat.slug ? '2px solid var(--orange)' : 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background var(--tr), color var(--tr)',
                      width: '100%',
                      textAlign: 'left',
                      textDecoration: 'none',
                    }}
                  >
                    {cat.name}{' '}
                    <span
                      className="cat-tree__count"
                      style={{ fontSize: '10px', color: 'var(--gray3)' }}
                    >
                      {cat._count?.products || 0}
                    </span>
                  </Link>
                ))
              )}
            </div>

            {/* Price filter */}
            <div className="filter-block" style={{ borderBottom: '1px solid var(--gray1)' }}>
              <div
                className="filter-block__head"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '13px 16px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--white2)',
                }}
              >
                Цена, руб.
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ width: '14px', height: '14px', color: 'var(--gray3)' }}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
              <div className="filter-block__body" style={{ padding: '0 16px 14px' }}>
                <div
                  className="range-inputs"
                  style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px' }}
                >
                  <input
                    type="number"
                    className="range-input"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    placeholder="От"
                    style={{
                      flex: 1,
                      background: 'var(--black3)',
                      border: '1px solid var(--gray1)',
                      borderRadius: 'var(--radius)',
                      padding: '7px 10px',
                      color: 'var(--white)',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <span className="range-sep" style={{ color: 'var(--gray3)', fontSize: '13px' }}>
                    —
                  </span>
                  <input
                    type="number"
                    className="range-input"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    placeholder="До"
                    style={{
                      flex: 1,
                      background: 'var(--black3)',
                      border: '1px solid var(--gray1)',
                      borderRadius: 'var(--radius)',
                      padding: '7px 10px',
                      color: 'var(--white)',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ padding: '14px 16px' }}>
              <button
                onClick={() => setCurrentPage(1)}
                className="btn btn-primary btn-block"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  padding: '10px 22px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  borderRadius: 'var(--radius)',
                  background: 'var(--orange)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Применить фильтры
              </button>
            </div>
          </aside>

          {/* Content */}
          <div className="catalog-content">
            {/* Page title */}
            <div
              style={{
                padding: '16px 16px 0',
                borderBottom: '1px solid var(--gray1)',
                background: 'var(--black2)',
              }}
            >
              <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', marginBottom: '4px' }}>
                {currentCategory?.name || slug}
              </h1>
              <p style={{ fontSize: '12px', color: 'var(--gray3)', paddingBottom: '14px' }}>
                {pagination?.totalItems || '...'} товаров в наличии. Официальная гарантия. Доставка
                по всей России.
              </p>
            </div>

            {/* Toolbar */}
            <div
              className="toolbar"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderBottom: '1px solid var(--gray1)',
                background: 'var(--black2)',
                flexWrap: 'wrap',
              }}
            >
              <span className="toolbar__count" style={{ fontSize: '13px', color: 'var(--gray3)' }}>
                Показано <strong style={{ color: 'var(--white)' }}>{products.length}</strong> из{' '}
                {pagination?.totalItems || '...'}
              </span>
              <div
                className="toolbar__sort"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}
              >
                <span
                  className="toolbar__sort-label"
                  style={{ fontSize: '12px', color: 'var(--gray3)', whiteSpace: 'nowrap' }}
                >
                  Сортировать:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as 'popular' | 'price_asc' | 'price_desc' | 'newest' | 'rating');
                    setCurrentPage(1);
                  }}
                  className="toolbar__select"
                  style={{
                    background: 'var(--black3)',
                    border: '1px solid var(--gray1)',
                    borderRadius: 'var(--radius)',
                    padding: '6px 28px 6px 10px',
                    color: 'var(--white)',
                    fontSize: '13px',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center',
                    backgroundSize: '14px',
                  }}
                >
                  <option value="popular">По популярности</option>
                  <option value="price_asc">Сначала дешевле</option>
                  <option value="price_desc">Сначала дороже</option>
                  <option value="newest">По новизне</option>
                  <option value="rating">По рейтингу</option>
                </select>
              </div>
              <div className="toolbar__view" style={{ display: 'flex', gap: '2px' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`view-btn ${viewMode === 'grid' ? 'is-active' : ''}`}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: viewMode === 'grid' ? 'var(--orange)' : 'var(--black3)',
                    border: '1px solid var(--gray1)',
                    borderRadius: 'var(--radius)',
                    color: viewMode === 'grid' ? '#fff' : 'var(--gray3)',
                    cursor: 'pointer',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: '15px', height: '15px' }}
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`view-btn ${viewMode === 'list' ? 'is-active' : ''}`}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: viewMode === 'list' ? 'var(--orange)' : 'var(--black3)',
                    border: '1px solid var(--gray1)',
                    borderRadius: 'var(--radius)',
                    color: viewMode === 'list' ? '#fff' : 'var(--gray3)',
                    cursor: 'pointer',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: '15px', height: '15px' }}
                  >
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

            {/* Products grid/list */}
            {productsLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray3)' }}>
                Загрузка товаров...
              </div>
            ) : products.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray3)' }}>
                Товары не найдены
              </div>
            ) : viewMode === 'grid' ? (
              <>
                <div
                  className="products-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '1px',
                    background: 'var(--gray1)',
                    borderLeft: '1px solid var(--gray1)',
                  }}
                >
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      className="product-card"
                      style={{
                        background: 'var(--black2)',
                        border: '1px solid var(--gray1)',
                        borderRadius: 'var(--radius)',
                        display: 'grid',
                        gridTemplateRows: 'auto 1fr auto',
                        position: 'relative',
                        transition: 'border-color var(--tr), transform var(--tr)',
                        overflow: 'hidden',
                        textDecoration: 'none',
                      }}
                    >
                      <div
                        className="product-card__badges"
                        style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          zIndex: 2,
                        }}
                      >
                        {product.discountPercent && (
                          <span
                            className="badge badge-orange"
                            style={{
                              display: 'inline-block',
                              padding: '2px 7px',
                              fontFamily: 'var(--font-display)',
                              fontSize: '10px',
                              fontWeight: 700,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              borderRadius: 'var(--radius)',
                              background: 'var(--orange)',
                              color: '#fff',
                            }}
                          >
                            -{product.discountPercent}%
                          </span>
                        )}
                      </div>
                      <div
                        className="product-card__img"
                        style={{
                          aspectRatio: '4/3',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--black3)',
                          padding: '16px',
                          borderBottom: '1px solid var(--gray1)',
                        }}
                      >
                        {product.mainImageUrl ? (
                          <img
                            src={product.mainImageUrl}
                            alt={product.name}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                        ) : (
                          <svg
                            className="cico"
                            viewBox="0 0 120 90"
                            fill="none"
                            style={{ width: '110px', height: '82px' }}
                          >
                            <rect
                              x="10"
                              y="22"
                              width="100"
                              height="54"
                              rx="2"
                              stroke="var(--gray2)"
                              strokeWidth="2"
                            />
                            <rect
                              x="20"
                              y="29"
                              width="28"
                              height="38"
                              rx="1"
                              stroke="var(--orange)"
                              strokeWidth="1.5"
                            />
                          </svg>
                        )}
                      </div>
                      <div
                        className="product-card__body"
                        style={{
                          padding: '11px 13px 9px',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <div
                          className="stars"
                          style={{ fontSize: '11px', marginBottom: '5px', color: 'var(--orange)' }}
                        >
                          {product.rating}{' '}
                          <span
                            className="rating-count"
                            style={{ color: 'var(--gray3)', fontSize: '11px', marginLeft: '4px' }}
                          >
                            ({product.reviewsCount})
                          </span>
                        </div>
                        <div
                          className="product-card__name"
                          style={{
                            fontSize: '12px',
                            lineHeight: 1.4,
                            color: 'var(--white)',
                            flex: 1,
                            marginBottom: '5px',
                          }}
                        >
                          {product.name}
                        </div>
                        <p
                          className="product-card__spec"
                          style={{ fontSize: '11px', color: 'var(--gray3)', lineHeight: 1.35 }}
                        >
                          {product.brand?.name || ''}
                        </p>
                      </div>
                      <div
                        className="product-card__footer"
                        style={{
                          padding: '8px 13px 10px',
                          borderTop: '1px solid var(--gray1)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '7px',
                        }}
                      >
                        <div
                          className="product-card__price-row"
                          style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}
                        >
                          <span
                            className="price"
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontWeight: 800,
                              fontSize: '18px',
                              color: 'var(--white2)',
                              whiteSpace: 'nowrap',
                              lineHeight: 1,
                            }}
                          >
                            {product.price.toLocaleString('ru-RU')} ₽
                          </span>
                          {product.oldPrice && (
                            <span
                              className="price-old"
                              style={{
                                fontSize: '11px',
                                color: 'var(--gray3)',
                                textDecoration: 'line-through',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {product.oldPrice.toLocaleString('ru-RU')} ₽
                            </span>
                          )}
                        </div>
                        <div
                          className="product-card__actions"
                          style={{ display: 'flex', gap: '4px', pointerEvents: 'none' }}
                        >
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            style={{
                              flex: 1,
                              justifyContent: 'center',
                              padding: '6px 8px',
                              fontSize: '11px',
                              background: 'var(--orange)',
                              color: '#fff',
                              borderRadius: 'var(--radius)',
                              display: 'flex',
                              alignItems: 'center',
                              fontFamily: 'var(--font-display)',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              pointerEvents: 'auto',
                              cursor: 'pointer',
                            }}
                          >
                            Купить
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div
                    className="pagination"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '24px 0',
                    }}
                  >
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.hasPrevPage}
                      style={{
                        padding: '8px 16px',
                        background: 'var(--black2)',
                        border: '1px solid var(--gray1)',
                        borderRadius: 'var(--radius)',
                        color: pagination.hasPrevPage ? 'var(--white)' : 'var(--gray3)',
                        cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed',
                        fontFamily: 'var(--font-display)',
                        fontSize: '13px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      Назад
                    </button>
                    <span style={{ color: 'var(--gray3)', fontSize: '13px' }}>
                      Страница {pagination.currentPage} из {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={!pagination.hasNextPage}
                      style={{
                        padding: '8px 16px',
                        background: 'var(--black2)',
                        border: '1px solid var(--gray1)',
                        borderRadius: 'var(--radius)',
                        color: pagination.hasNextPage ? 'var(--white)' : 'var(--gray3)',
                        cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed',
                        fontFamily: 'var(--font-display)',
                        fontSize: '13px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      Вперёд
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="products-list" style={{ display: 'flex', flexDirection: 'column' }}>
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="product-row"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '140px 1fr auto',
                      alignItems: 'start',
                      gap: '16px',
                      padding: '16px',
                      background: 'var(--black2)',
                      borderBottom: '1px solid var(--gray1)',
                      transition: 'background var(--tr)',
                      textDecoration: 'none',
                    }}
                  >
                    <div
                      className="product-row__img"
                      style={{
                        width: '140px',
                        height: '100px',
                        background: 'var(--black3)',
                        border: '1px solid var(--gray1)',
                        borderRadius: 'var(--radius)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {product.mainImageUrl ? (
                        <img
                          src={product.mainImageUrl}
                          alt={product.name}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <svg viewBox="0 0 140 100" fill="none" style={{ width: '100px', height: '70px' }}>
                          <rect x="10" y="15" width="120" height="70" rx="2" stroke="var(--gray2)" strokeWidth="2" />
                        </svg>
                      )}
                    </div>
                    <div className="product-row__body" style={{ flex: 1, minWidth: 0 }}>
                      <div className="product-row__name" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--white)', marginBottom: '4px' }}>
                        {product.name}
                      </div>
                      <div className="product-row__brand" style={{ fontSize: '12px', color: 'var(--gray3)', marginBottom: '8px' }}>
                        {product.brand?.name || ''}
                      </div>
                      <div className="product-row__rating" style={{ fontSize: '12px', color: 'var(--orange)', marginBottom: '8px' }}>
                        {product.rating} ({product.reviewsCount} отзывов)
                      </div>
                    </div>
                    <div className="product-row__footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                      <div className="product-row__price" style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--white2)' }}>
                        {product.price.toLocaleString('ru-RU')} ₽
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="btn btn-primary"
                        style={{
                          padding: '8px 16px',
                          fontSize: '12px',
                          background: 'var(--orange)',
                          color: '#fff',
                          borderRadius: 'var(--radius)',
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                        }}
                      >
                        В корзину
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
