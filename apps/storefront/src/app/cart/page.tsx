'use client';

import Link from 'next/link';
import { useCart, useUpdateCartItem, useRemoveFromCart } from '@/hooks/useApi';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product?: {
    name: string;
    slug: string;
    mainImageUrl?: string;
  };
}

export default function CartPage() {
  const { data: cartData, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();

  const cart = cartData?.cart;
  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce(
    (sum: number, item: CartItem) => sum + item.price * item.quantity,
    0
  );
  const discount = cart?.discount || 0;
  const total = subtotal - discount;

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) {
      await handleRemoveItem(itemId);
      return;
    }
    try {
      await updateItem.mutateAsync({ itemId, quantity });
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeItem.mutateAsync(itemId);
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  // Loading state
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

  if (cartItems.length === 0) {
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
                padding: '14px 0',
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
              <span style={{ color: 'var(--white)' }}>Корзина</span>
            </div>
          </div>
        </div>

        {/* Empty cart */}
        <div className="container" style={{ padding: '0 20px 40px' }}>
          <div
            style={{
              background: 'var(--black2)',
              border: '1px solid var(--gray1)',
              borderRadius: 'var(--radius)',
              padding: '60px 20px',
              textAlign: 'center',
              marginTop: '40px',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{
                width: '80px',
                height: '80px',
                color: 'var(--gray2)',
                margin: '0 auto 16px',
              }}
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <h1 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--white2)' }}>
              Корзина пуста
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--gray3)', marginBottom: '24px' }}>
              Добавьте товары для оформления заказа
            </p>
            <Link
              href="/catalog"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                padding: '14px 32px',
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
        </div>
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
              padding: '14px 0',
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
            <span style={{ color: 'var(--white)' }}>Корзина</span>
          </div>
        </div>
      </div>

      {/* Cart content */}
      <div className="container" style={{ padding: '0 20px 40px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 3vw, 34px)',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'var(--white2)',
            marginBottom: '24px',
          }}
        >
          Корзина
        </h1>

        <div
          className="cart-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Cart items */}
          <div className="cart-items">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="cart-item"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr auto',
                  gap: '16px',
                  padding: '16px',
                  background: 'var(--black2)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  marginBottom: '12px',
                  transition: 'background var(--tr)',
                }}
              >
                <div
                  className="cart-item__img"
                  style={{
                    width: '120px',
                    height: '90px',
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
                  {item.product?.mainImageUrl ? (
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
                      style={{ width: '80px', height: '60px' }}
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
                <div className="cart-item__info">
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="cart-item__name"
                    style={{
                      fontSize: '14px',
                      color: 'var(--white2)',
                      fontWeight: 600,
                      marginBottom: '6px',
                      display: 'block',
                      textDecoration: 'none',
                      lineHeight: 1.4,
                    }}
                  >
                    {item.product.name}
                  </Link>
                  <div
                    className="cart-item__spec"
                    style={{ fontSize: '12px', color: 'var(--gray3)', marginBottom: '12px' }}
                  >
                    {item.product.brand?.name && <span>{item.product.brand.name} • </span>}
                    <span>Арт: {item.product.sku}</span>
                  </div>
                  <div
                    className="cart-item__actions"
                    style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                  >
                    <div
                      className="qty-selector"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid var(--gray1)',
                        borderRadius: 'var(--radius)',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'var(--black3)',
                          border: 'none',
                          color: 'var(--white)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'var(--tr)',
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{ width: '14px', height: '14px' }}
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                      <span
                        style={{
                          minWidth: '40px',
                          textAlign: 'center',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--white)',
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'var(--black3)',
                          border: 'none',
                          color: 'var(--white)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'var(--tr)',
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{ width: '14px', height: '14px' }}
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="cart-item__remove"
                      style={{
                        fontSize: '12px',
                        color: 'var(--gray3)',
                        textDecoration: 'underline',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'var(--tr)',
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
                <div className="cart-item__price" style={{ textAlign: 'right' }}>
                  <div
                    className="cart-item__total"
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: 'var(--white2)',
                      fontFamily: 'var(--font-display)',
                      marginBottom: '4px',
                    }}
                  >
                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                  </div>
                  <div
                    className="cart-item__unit"
                    style={{ fontSize: '12px', color: 'var(--gray3)' }}
                  >
                    {item.price.toLocaleString('ru-RU')} ₽/шт
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div
            className="cart-summary"
            style={{
              background: 'var(--black2)',
              border: '1px solid var(--gray1)',
              borderRadius: 'var(--radius)',
              padding: '20px',
              position: 'sticky',
              top: '16px',
            }}
          >
            <h2 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--white2)' }}>
              Ваш заказ
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '13px',
                  color: 'var(--gray4)',
                }}
              >
                <span>Товары ({cartItems.length} шт.):</span>
                <span>{subtotal.toLocaleString('ru-RU')} ₽</span>
              </div>
              {discount > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    fontSize: '13px',
                    color: '#4caf50',
                  }}
                >
                  <span>Скидка:</span>
                  <span>-{discount.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}
            </div>

            <div
              style={{
                paddingTop: '16px',
                borderTop: '1px solid var(--gray1)',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: 'var(--gray4)',
                }}
              >
                <span>Доставка:</span>
                <span style={{ color: '#4caf50' }}>Бесплатно</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--white2)',
                }}
              >
                <span>Итого:</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px' }}>
                  {total.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="btn btn-primary btn-block"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '14px 24px',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                borderRadius: 'var(--radius)',
                background: 'var(--orange)',
                color: '#fff',
                textDecoration: 'none',
                marginBottom: '12px',
              }}
            >
              Оформить заказ
            </Link>

            <p
              style={{
                fontSize: '11px',
                color: 'var(--gray3)',
                textAlign: 'center',
                lineHeight: 1.4,
              }}
            >
              Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных
            </p>

            {/* Promo code */}
            <div
              style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--gray1)' }}
            >
              <div style={{ fontSize: '12px', color: 'var(--gray3)', marginBottom: '8px' }}>
                Промокод
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Введите код"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: 'var(--black3)',
                    border: '1px solid var(--gray1)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--white)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <button
                  style={{
                    padding: '10px 16px',
                    background: 'var(--gray1)',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    color: 'var(--white)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'var(--tr)',
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
