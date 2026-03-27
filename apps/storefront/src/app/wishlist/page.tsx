'use client';

import Link from 'next/link';
import { useWishlist, useRemoveFromWishlist, useAddToCart } from '@/hooks/useApi';
import { useAuthStore } from '@/store';

export default function WishlistPage() {
  const { isAuthenticated } = useAuthStore();
  const { data: wishlistData, isLoading, refetch } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();

  const wishlist = wishlistData?.wishlist;
  const items = wishlist?.items || [];

  const handleRemove = async (itemId: number) => {
    try {
      await removeFromWishlist.mutateAsync(itemId);
      refetch();
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart.mutateAsync({ productId, quantity: 1 });
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--white2)' }}>
          Избранное
        </h1>
        <p style={{ color: 'var(--gray3)', marginBottom: '24px' }}>
          Войдите чтобы сохранить избранные товары
        </p>
        <Link
          href="/auth/login"
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            padding: '12px 32px',
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            borderRadius: 'var(--radius)',
            background: 'var(--orange)',
            color: '#fff',
            textDecoration: 'none',
          }}
        >
          Войти
        </Link>
      </div>
    );
  }

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
            <span style={{ color: 'var(--white)' }}>Избранное</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '0 20px 40px' }}>
        <h1
          style={{
            fontSize: 'clamp(20px, 2.5vw, 28px)',
            margin: '28px 0 24px',
            color: 'var(--white2)',
          }}
        >
          Избранное
        </h1>

        {items.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'var(--black2)',
              border: '1px solid var(--gray1)',
              borderRadius: 'var(--radius)',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ width: '64px', height: '64px', color: 'var(--gray2)', marginBottom: '16px' }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h2 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--white2)' }}>
              Список избранного пуст
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--gray3)', marginBottom: '24px' }}>
              Добавьте товары, которые хотите сохранить на потом
            </p>
            <Link
              href="/catalog"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                padding: '12px 32px',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                borderRadius: 'var(--radius)',
                background: 'var(--orange)',
                color: '#fff',
                textDecoration: 'none',
              }}
            >
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div
            className="wishlist-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '16px',
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
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
                  className="product-card__remove"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '28px',
                    height: '28px',
                    background: 'var(--black3)',
                    border: '1px solid var(--gray1)',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gray3)',
                    cursor: 'pointer',
                    zIndex: 2,
                    transition: 'var(--tr)',
                  }}
                  onClick={() => handleRemove(item.id)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: '14px', height: '14px' }}
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
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
                  {item.product.mainImageUrl ? (
                    <img
                      src={item.product.mainImageUrl}
                      alt={item.product.name}
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
                    {item.product.rating}{' '}
                    <span
                      className="rating-count"
                      style={{ color: 'var(--gray3)', fontSize: '11px', marginLeft: '4px' }}
                    >
                      ({item.product.reviewsCount})
                    </span>
                  </div>
                  <Link
                    href={`/product/${item.product.slug}`}
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
                    {item.product.name}
                  </Link>
                  <p
                    className="product-card__spec"
                    style={{ fontSize: '11px', color: 'var(--gray3)', lineHeight: 1.35 }}
                  >
                    {item.product.brand?.name || ''}
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
                      {item.product.price.toLocaleString('ru-RU')} ₽
                    </span>
                    {item.product.oldPrice && (
                      <span
                        className="price-old"
                        style={{
                          fontSize: '11px',
                          color: 'var(--gray3)',
                          textDecoration: 'line-through',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.product.oldPrice.toLocaleString('ru-RU')} ₽
                      </span>
                    )}
                  </div>
                  <div className="product-card__actions" style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleAddToCart(item.product.id)}
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
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      В корзину
                    </button>
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="btn-ghost"
                      style={{
                        width: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--black3)',
                        border: '1px solid var(--gray1)',
                        borderRadius: 'var(--radius)',
                        color: 'var(--gray4)',
                        textDecoration: 'none',
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ width: '14px', height: '14px' }}
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
