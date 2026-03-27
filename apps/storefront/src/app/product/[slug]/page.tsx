'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useProduct, useAddToCart, useAddToWishlist, useCart } from '@/hooks/useApi';
import { useCartStore } from '@/store';

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [activeImage, setActiveImage] = useState(0);
  const { data: product, isLoading, error } = useProduct(slug);
  const { data: cartData } = useCart();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const { openCart } = useCartStore();

  if (isLoading) {
    return (
      <div
        className="container"
        style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--gray3)' }}
      >
        Загрузка...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        className="container"
        style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--gray3)' }}
      >
        Товар не найден
      </div>
    );
  }

  const images = product.images?.length ? product.images : [{ url: product.mainImageUrl }];

  const handleAddToCart = async () => {
    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity: 1,
      });
      openCart();
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      await addToWishlist.mutateAsync(product.id);
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
    }
  };

  const specs = (product.specifications as Record<string, unknown>) || {};

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
            <Link
              href="/"
              style={{
                color: 'var(--gray3)',
                transition: 'color var(--tr)',
                textDecoration: 'none',
              }}
            >
              Главная
            </Link>
            <span className="breadcrumb__sep" style={{ color: 'var(--gray2)' }}>
              /
            </span>
            <Link
              href="/catalog"
              style={{
                color: 'var(--gray3)',
                transition: 'color var(--tr)',
                textDecoration: 'none',
              }}
            >
              Каталог
            </Link>
            <span className="breadcrumb__sep" style={{ color: 'var(--gray2)' }}>
              /
            </span>
            <Link
              href={`/catalog/${product.category?.slug}`}
              style={{
                color: 'var(--gray3)',
                transition: 'color var(--tr)',
                textDecoration: 'none',
              }}
            >
              {product.category?.name}
            </Link>
            <span className="breadcrumb__sep" style={{ color: 'var(--gray2)' }}>
              /
            </span>
            <span style={{ color: 'var(--white)' }}>{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product layout */}
      <div className="container" style={{ padding: '0 20px 40px' }}>
        <div
          className="product-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '520px 1fr',
            gap: '32px',
            padding: '28px 0',
            alignItems: 'start',
          }}
        >
          {/* Gallery */}
          <div className="gallery" style={{ position: 'sticky', top: '16px' }}>
            <div
              className="gallery__main"
              style={{
                background: 'var(--black2)',
                border: '1px solid var(--gray1)',
                borderRadius: 'var(--radius)',
                aspectRatio: '4/3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                className="gallery__badges"
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
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
                className="gallery__main-img"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '32px',
                }}
              >
                {images[activeImage]?.url ? (
                  <img
                    src={images[activeImage].url}
                    alt={product.name}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <svg
                    viewBox="0 0 400 300"
                    fill="none"
                    style={{ width: '100%', maxWidth: '380px' }}
                  >
                    <rect
                      x="20"
                      y="60"
                      width="360"
                      height="180"
                      rx="4"
                      stroke="var(--gray2)"
                      strokeWidth="2"
                    />
                    <rect
                      x="40"
                      y="80"
                      width="100"
                      height="140"
                      rx="2"
                      stroke="var(--orange)"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </div>
              <button
                className="gallery__zoom"
                style={{
                  position: 'absolute',
                  bottom: '14px',
                  right: '14px',
                  width: '36px',
                  height: '36px',
                  background: 'var(--black3)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gray3)',
                  cursor: 'pointer',
                  transition: 'var(--tr)',
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
                  <path d="M11 8v6M8 11h6" />
                </svg>
              </button>
            </div>
            {images.length > 1 && (
              <div className="gallery__thumbs" style={{ display: 'flex', gap: '8px' }}>
                {images.slice(0, 5).map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`gallery__thumb ${activeImage === idx ? 'is-active' : ''}`}
                    style={{
                      width: '80px',
                      height: '60px',
                      flexShrink: 0,
                      background: 'var(--black2)',
                      border:
                        activeImage === idx ? '1px solid var(--orange)' : '1px solid var(--gray1)',
                      borderRadius: 'var(--radius)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'border-color var(--tr)',
                      padding: '6px',
                      overflow: 'hidden',
                    }}
                  >
                    {img?.url ? (
                      <img
                        src={img.url}
                        alt=""
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <svg
                        viewBox="0 0 80 60"
                        fill="none"
                        style={{ width: '60px', height: '40px' }}
                      >
                        <rect
                          x="4"
                          y="8"
                          width="72"
                          height="44"
                          rx="2"
                          stroke={activeImage === idx ? 'var(--orange)' : 'var(--gray2)'}
                          strokeWidth="1.5"
                        />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info">
            <div
              className="product-info__vendor"
              style={{
                fontSize: '11px',
                color: 'var(--gray3)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              Бренд:{' '}
              <Link
                href={`/brands/${product.brand?.slug}`}
                style={{ color: 'var(--orange)', textDecoration: 'none' }}
              >
                {product.brand?.name}
              </Link>
            </div>

            <h1
              className="product-info__title"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(18px, 2vw, 24px)',
                fontWeight: 800,
                textTransform: 'uppercase',
                lineHeight: 1.15,
                color: 'var(--white2)',
                marginBottom: '12px',
              }}
            >
              {product.name}
            </h1>

            <div
              className="product-info__meta"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div
                className="product-info__rating"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span className="stars" style={{ color: 'var(--orange)' }}>
                  {product.rating}
                </span>
                <span
                  className="product-info__reviews"
                  style={{
                    fontSize: '12px',
                    color: 'var(--orange)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {product.reviewsCount} отзыва
                </span>
              </div>
              <span
                className="product-info__sku"
                style={{ fontSize: '12px', color: 'var(--gray3)' }}
              >
                Арт: <span style={{ color: 'var(--gray4)' }}>{product.sku}</span>
              </span>
              <span
                className={`product-info__avail ${product.available ? 'product-info__avail--yes' : 'product-info__avail--no'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: product.available ? '#4caf50' : '#f44336',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    background: product.available ? '#4caf50' : '#f44336',
                    borderRadius: '50%',
                    display: 'inline-block',
                  }}
                />
                {product.available ? `В наличии (${product.stock} шт.)` : 'Нет в наличии'}
              </span>
            </div>

            {/* Price */}
            <div
              className="price-block"
              style={{
                background: 'var(--black2)',
                border: '1px solid var(--gray1)',
                borderRadius: 'var(--radius)',
                padding: '18px 20px',
                marginBottom: '16px',
              }}
            >
              <div
                className="price-block__row"
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '12px',
                  marginBottom: '4px',
                }}
              >
                <span
                  className="price-block__current"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '36px',
                    fontWeight: 800,
                    color: 'var(--white2)',
                    lineHeight: 1,
                  }}
                >
                  {product.price.toLocaleString('ru-RU')} ₽
                </span>
                {product.oldPrice && (
                  <>
                    <span
                      className="price-block__old"
                      style={{
                        fontSize: '16px',
                        color: 'var(--gray3)',
                        textDecoration: 'line-through',
                      }}
                    >
                      {product.oldPrice.toLocaleString('ru-RU')} ₽
                    </span>
                    <span
                      className="price-block__save"
                      style={{
                        fontSize: '12px',
                        color: 'var(--orange)',
                        fontWeight: 700,
                        background: 'rgba(255,106,0,0.1)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>
              <div
                className="price-block__note"
                style={{ fontSize: '11px', color: 'var(--gray3)', marginTop: '6px' }}
              >
                Цена действительна при заказе на сайте
              </div>
              <div
                className="price-block__credit"
                style={{
                  marginTop: '10px',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--gray1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: 'var(--gray4)',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ width: '16px', height: '16px', color: 'var(--orange)' }}
                >
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Рассрочка от{' '}
                <strong
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '15px',
                    color: 'var(--white2)',
                  }}
                >
                  {Math.round(product.price / 24)} руб./мес
                </strong>
                <Link
                  href="/credit"
                  style={{
                    color: 'var(--orange)',
                    marginLeft: 'auto',
                    fontSize: '11px',
                    textDecoration: 'none',
                  }}
                >
                  Подробнее
                </Link>
              </div>
            </div>

            {/* CTA */}
            <div
              className="product-cta"
              style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}
            >
              <div className="product-cta__main" style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleAddToCart}
                  disabled={!product.available}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '13px 22px',
                    fontFamily: 'var(--font-display)',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    borderRadius: 'var(--radius)',
                    background: product.available ? 'var(--orange)' : 'var(--gray2)',
                    color: '#fff',
                    border: 'none',
                    cursor: product.available ? 'pointer' : 'not-allowed',
                    opacity: product.available ? 1 : 0.6,
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{ width: '16px', height: '16px' }}
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  {product.available ? 'В корзину' : 'Нет в наличии'}
                </button>
                <button
                  className="btn btn-outline"
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '13px 22px',
                    fontFamily: 'var(--font-display)',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    borderRadius: 'var(--radius)',
                    background: 'transparent',
                    color: 'var(--orange)',
                    border: '1px solid var(--orange)',
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
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Купить в 1 клик
                </button>
              </div>
              <div className="product-cta__secondary" style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleAddToWishlist}
                  className="btn btn-ghost"
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 14px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    borderRadius: 'var(--radius)',
                    background: 'transparent',
                    color: 'var(--gray4)',
                    border: '1px solid var(--gray1)',
                    cursor: 'pointer',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: '14px', height: '14px' }}
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  В вишлист
                </button>
                <button
                  className="btn btn-ghost"
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 14px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    borderRadius: 'var(--radius)',
                    background: 'transparent',
                    color: 'var(--gray4)',
                    border: '1px solid var(--gray1)',
                    cursor: 'pointer',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: '14px', height: '14px' }}
                  >
                    <path d="M18 20V10M12 20V4M6 20v-6" />
                  </svg>
                  Сравнить
                </button>
              </div>
            </div>

            {/* Quick specs */}
            {Object.keys(specs).length > 0 && (
              <div
                className="quick-specs"
                style={{
                  background: 'var(--black2)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  marginBottom: '16px',
                }}
              >
                <div
                  className="quick-specs__head"
                  style={{
                    padding: '10px 16px',
                    borderBottom: '1px solid var(--gray1)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--orange)',
                  }}
                >
                  Краткие характеристики
                </div>
                {Object.entries(specs)
                  .slice(0, 5)
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="quick-spec"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 16px',
                        borderBottom: '1px solid var(--gray1)',
                        fontSize: '12px',
                      }}
                    >
                      <span
                        className="quick-spec__name"
                        style={{ color: 'var(--gray3)', width: '160px', flexShrink: 0 }}
                      >
                        {key}
                      </span>
                      <span
                        className="quick-spec__val"
                        style={{ color: 'var(--white2)', fontWeight: 500 }}
                      >
                        {String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div
                className="product-description"
                style={{
                  background: 'var(--black2)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  padding: '16px 20px',
                }}
              >
                <h3 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--white2)' }}>
                  Описание
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--gray4)', lineHeight: 1.6 }}>
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div
          className="product-tabs"
          style={{
            borderTop: '1px solid var(--gray1)',
            paddingTop: '32px',
          }}
        >
          <div
            className="tabs-header"
            style={{
              display: 'flex',
              gap: '32px',
              borderBottom: '1px solid var(--gray1)',
              marginBottom: '24px',
            }}
          >
            <button
              className="tab-btn is-active"
              style={{
                padding: '12px 0',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                textTransform: 'uppercase',
                color: 'var(--orange)',
                borderBottom: '2px solid var(--orange)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Описание
            </button>
            <button
              className="tab-btn"
              style={{
                padding: '12px 0',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                textTransform: 'uppercase',
                color: 'var(--gray3)',
                borderBottom: '2px solid transparent',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Характеристики
            </button>
            <button
              className="tab-btn"
              style={{
                padding: '12px 0',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                textTransform: 'uppercase',
                color: 'var(--gray3)',
                borderBottom: '2px solid transparent',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Отзывы ({product.reviewsCount})
            </button>
          </div>
          <div className="tabs-content">
            {product.fullDescription && (
              <div
                className="tab-panel"
                style={{ fontSize: '14px', color: 'var(--gray4)', lineHeight: 1.7 }}
              >
                <div dangerouslySetInnerHTML={{ __html: product.fullDescription }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
