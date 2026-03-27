'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSearch } from '@/hooks/useApi';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const searchQuery = searchParams.get('q') || '';
  const { data, isLoading } = useSearch(searchQuery, 50);

  const products = data?.data || [];
  const suggestions = data?.suggestions || [];

  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

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
            <span style={{ color: 'var(--white)' }}>Поиск</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '0 20px 40px' }}>
        {/* Search form */}
        <div style={{ marginTop: '24px', marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: 'clamp(24px, 3vw, 34px)',
              marginBottom: '16px',
              color: 'var(--white2)',
            }}
          >
            Поиск товаров
          </h1>
          <form
            onSubmit={handleSearch}
            style={{
              display: 'flex',
              gap: '12px',
              maxWidth: '600px',
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Что вы ищете?"
              style={{
                flex: 1,
                padding: '14px 20px',
                background: 'var(--black2)',
                border: '1px solid var(--gray1)',
                borderRadius: 'var(--radius)',
                color: 'var(--white)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 32px',
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
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ width: '16px', height: '16px' }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Найти
            </button>
          </form>
        </div>

        {/* Results */}
        {searchQuery && (
          <>
            {isLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray3)' }}>
                Поиск...
              </div>
            ) : products.length === 0 ? (
              <div
                style={{
                  background: 'var(--black2)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  padding: '60px 20px',
                  textAlign: 'center',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{
                    width: '64px',
                    height: '64px',
                    color: 'var(--gray2)',
                    margin: '0 auto 16px',
                  }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <h2 style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--white2)' }}>
                  Ничего не найдено
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--gray3)', marginBottom: '24px' }}>
                  По запросу "{searchQuery}" нет результатов
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  {suggestions.length > 0 && (
                    <>
                      <span
                        style={{ fontSize: '13px', color: 'var(--gray3)', alignSelf: 'center' }}
                      >
                        Возможно, вы искали:
                      </span>
                      {suggestions.slice(0, 5).map((suggestion, idx) => (
                        <Link
                          key={idx}
                          href={`/search?q=${encodeURIComponent(suggestion)}`}
                          style={{
                            display: 'inline-block',
                            padding: '6px 12px',
                            background: 'var(--black3)',
                            border: '1px solid var(--gray1)',
                            borderRadius: 'var(--radius)',
                            fontSize: '13px',
                            color: 'var(--orange)',
                            textDecoration: 'none',
                            transition: 'var(--tr)',
                          }}
                        >
                          {suggestion}
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--gray3)' }}>
                    Найдено <strong style={{ color: 'var(--white2)' }}>{products.length}</strong>{' '}
                    товаров
                  </span>
                  {searchQuery && (
                    <span style={{ fontSize: '14px', color: 'var(--gray3)' }}>
                      {' '}
                      по запросу " <strong style={{ color: 'var(--orange)' }}>
                        {searchQuery}
                      </strong>{' '}
                      "
                    </span>
                  )}
                </div>

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
                        <div
                          className="product-card__actions"
                          style={{ display: 'flex', gap: '4px' }}
                        >
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
              </>
            )}
          </>
        )}

        {/* Popular searches (when no query) */}
        {!searchQuery && (
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--white2)' }}>
              Популярные запросы
            </h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                'RTX 4090',
                'RTX 4080 Super',
                'AMD Ryzen 7 7800X3D',
                'Intel Core i7-14700K',
                'DDR5 32GB',
                'SSD M.2 2TB',
                'Материнская плата AM5',
                'Блок питания 850W',
              ].map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  style={{
                    display: 'inline-block',
                    padding: '10px 18px',
                    background: 'var(--black2)',
                    border: '1px solid var(--gray1)',
                    borderRadius: 'var(--radius)',
                    fontSize: '13px',
                    color: 'var(--gray4)',
                    textDecoration: 'none',
                    transition: 'var(--tr)',
                  }}
                  className="search-chip"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
