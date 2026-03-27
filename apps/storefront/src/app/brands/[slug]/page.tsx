'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBrands, useProducts } from '@/hooks/useApi';

export default function BrandPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [currentPage, setCurrentPage] = useState(1);

  const { data: brandsData } = useBrands();
  const { data: productsData, isLoading } = useProducts({
    brand: slug,
    page: currentPage,
    limit: 24,
  });

  const brands = brandsData?.data || [];
  const currentBrand = brands.find((b) => b.slug === slug);
  const products = productsData?.data || [];
  const pagination = productsData?.pagination;

  if (!currentBrand && brands.length > 0) {
    return (
      <div
        className="container"
        style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--gray3)' }}
      >
        Бренд не найден
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ background: 'var(--black2)', borderBottom: '1px solid var(--gray1)' }}>
        <div className="container">
          <div
            className="breadcrumb"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 0',
              fontSize: '12px',
              color: 'var(--gray3)',
            }}
          >
            <Link href="/" style={{ color: 'var(--gray3)', textDecoration: 'none' }}>
              Главная
            </Link>
            <span className="breadcrumb__sep" style={{ color: 'var(--gray2)' }}>
              /
            </span>
            <Link href="/catalog" style={{ color: 'var(--gray3)', textDecoration: 'none' }}>
              Каталог
            </Link>
            <span className="breadcrumb__sep" style={{ color: 'var(--gray2)' }}>
              /
            </span>
            <span style={{ color: 'var(--white)' }}>{currentBrand?.name || 'Бренд'}</span>
          </div>
        </div>
      </div>

      {/* Brand Header */}
      <div
        className="brand-header"
        style={{
          background: 'var(--black2)',
          borderBottom: '1px solid var(--gray1)',
          padding: '32px 0',
          marginBottom: '24px',
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
            {currentBrand?.logoUrl ? (
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  background: 'var(--black3)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                <img
                  src={currentBrand.logoUrl}
                  alt={currentBrand.name}
                  style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  background: 'var(--black3)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg viewBox="0 0 120 120" fill="none" style={{ width: '80px', height: '80px' }}>
                  <rect
                    x="20"
                    y="30"
                    width="80"
                    height="60"
                    rx="4"
                    stroke="var(--gray2)"
                    strokeWidth="2"
                  />
                  <text
                    x="60"
                    y="70"
                    textAnchor="middle"
                    fill="var(--gray3)"
                    fontSize="24"
                    fontWeight="700"
                  >
                    {currentBrand?.name?.[0] || 'B'}
                  </text>
                </svg>
              </div>
            )}
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h1
                style={{
                  fontSize: 'clamp(24px, 3vw, 36px)',
                  marginBottom: '12px',
                  color: 'var(--white2)',
                }}
              >
                {currentBrand?.name}
              </h1>
              {currentBrand?.description && (
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--gray4)',
                    lineHeight: 1.6,
                    marginBottom: '12px',
                  }}
                >
                  {currentBrand.description}
                </p>
              )}
              {currentBrand?.website && (
                <a
                  href={currentBrand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '13px',
                    color: 'var(--orange)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  Официальный сайт
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: '14px', height: '14px' }}
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              )}
            </div>
            <div style={{ textAlign: 'center', minWidth: '100px' }}>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 800,
                  color: 'var(--orange)',
                  fontFamily: 'var(--font-display)',
                  lineHeight: 1,
                }}
              >
                {currentBrand?._count?.products || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gray3)', textTransform: 'uppercase' }}>
                товаров
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '0 20px 40px' }}>
        {/* All brands strip */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--gray3)',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Все бренды
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className={`brand-chip ${brand.slug === slug ? 'is-active' : ''}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  background: brand.slug === slug ? 'var(--orange)' : 'var(--black2)',
                  border: `1px solid ${brand.slug === slug ? 'var(--orange)' : 'var(--gray1)'}`,
                  borderRadius: 'var(--radius)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: brand.slug === slug ? '#fff' : 'var(--gray4)',
                  textDecoration: 'none',
                  transition: 'var(--tr)',
                }}
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Products */}
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--white2)' }}>
            Товары {currentBrand?.name}
          </h2>
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray3)' }}>
            Загрузка...
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'var(--black2)',
              border: '1px solid var(--gray1)',
              borderRadius: 'var(--radius)',
            }}
          >
            <p style={{ fontSize: '14px', color: 'var(--gray3)' }}>
              Товары этого бренда пока не доступны
            </p>
          </div>
        ) : (
          <>
            <div
              className="products-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1px',
                background: 'var(--gray1)',
                border: '1px solid var(--gray1)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
              }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
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
                    style={{ padding: '11px 13px 9px', display: 'flex', flexDirection: 'column' }}
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
                    <Link
                      href={`/product/${product.slug}`}
                      className="product-card__name"
                      style={{
                        fontSize: '12px',
                        lineHeight: 1.4,
                        color: 'var(--white)',
                        flex: 1,
                        marginBottom: '5px',
                        textDecoration: 'none',
                      }}
                    >
                      {product.name}
                    </Link>
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
                    <div className="product-card__actions" style={{ display: 'flex', gap: '4px' }}>
                      <Link
                        href={`/product/${product.slug}`}
                        className="btn-buy"
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
                          textDecoration: 'none',
                        }}
                      >
                        Купить
                      </Link>
                    </div>
                  </div>
                </div>
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
        )}
      </div>
    </div>
  );
}
