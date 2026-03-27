'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useOrders } from '@/hooks/useApi';
import { useAuthStore } from '@/store';

export default function OrdersPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { data: ordersData, isLoading } = useOrders();

  const orderId = params.id as string;
  const success = searchParams.get('success');

  const orders = ordersData?.orders || [];
  const currentOrder = orderId ? orders.find((o) => o.id === Number(orderId)) : null;

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--white2)' }}>
          Мои заказы
        </h1>
        <p style={{ color: 'var(--gray3)', marginBottom: '24px' }}>
          Войдите чтобы просмотреть историю заказов
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

  // Order detail view
  if (currentOrder) {
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
              <Link href="/profile" style={{ color: 'var(--gray3)', textDecoration: 'none' }}>
                Профиль
              </Link>
              <span className="breadcrumb__sep" style={{ color: 'var(--gray2)' }}>
                /
              </span>
              <Link href="/orders" style={{ color: 'var(--gray3)', textDecoration: 'none' }}>
                Заказы
              </Link>
              <span className="breadcrumb__sep" style={{ color: 'var(--gray2)' }}>
                /
              </span>
              <span style={{ color: 'var(--white)' }}>{currentOrder.orderNumber}</span>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '0 20px 40px' }}>
          {success && (
            <div
              style={{
                background: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid #4caf50',
                borderRadius: 'var(--radius)',
                padding: '16px 20px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4caf50"
                strokeWidth="2"
                style={{ width: '20px', height: '20px' }}
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#4caf50' }}>
                  Заказ успешно оформлен!
                </div>
                <div style={{ fontSize: '12px', color: 'var(--gray3)' }}>
                  Номер заказа: {currentOrder.orderNumber}
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 'clamp(20px, 2.5vw, 28px)',
                  color: 'var(--white2)',
                  marginBottom: '8px',
                }}
              >
                Заказ {currentOrder.orderNumber}
              </h1>
              <div style={{ fontSize: '13px', color: 'var(--gray3)' }}>
                от {new Date(currentOrder.createdAt).toLocaleDateString('ru-RU')}
              </div>
            </div>
            <Link
              href="/orders"
              className="btn btn-ghost"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                fontSize: '12px',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                borderRadius: 'var(--radius)',
                background: 'transparent',
                color: 'var(--gray4)',
                border: '1px solid var(--gray1)',
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
                <path d="m15 18-6-6 6-6" />
              </svg>
              Назад к заказам
            </Link>
          </div>

          <div
            className="order-detail"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 340px',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* Order Items */}
            <div
              className="order-section"
              style={{
                background: 'var(--black2)',
                border: '1px solid var(--gray1)',
                borderRadius: 'var(--radius)',
                padding: '20px',
              }}
            >
              <h2 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--white2)' }}>
                Товары
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentOrder.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr auto',
                      gap: '16px',
                      alignItems: 'center',
                      padding: '12px',
                      background: 'var(--black3)',
                      borderRadius: 'var(--radius)',
                    }}
                  >
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        background: 'var(--black2)',
                        border: '1px solid var(--gray1)',
                        borderRadius: 'var(--radius)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.product?.images?.[0]?.url || item.product?.mainImageUrl ? (
                        <img
                          src={item.product.images?.[0]?.url || item.product?.mainImageUrl}
                          alt={item.name}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <svg
                          viewBox="0 0 80 80"
                          fill="none"
                          style={{ width: '50px', height: '50px' }}
                        >
                          <rect
                            x="10"
                            y="20"
                            width="60"
                            height="40"
                            rx="2"
                            stroke="var(--gray2)"
                            strokeWidth="2"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/product/${item.product?.slug}`}
                        style={{
                          fontSize: '13px',
                          color: 'var(--white)',
                          fontWeight: 500,
                          marginBottom: '4px',
                          display: 'block',
                          textDecoration: 'none',
                        }}
                      >
                        {item.name}
                      </Link>
                      <div style={{ fontSize: '11px', color: 'var(--gray3)' }}>
                        Артикул: {item.sku}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--gray3)', marginTop: '4px' }}>
                        {item.quantity} шт. × {item.price.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: '16px',
                          fontWeight: 700,
                          color: 'var(--white2)',
                          fontFamily: 'var(--font-display)',
                        }}
                      >
                        {item.total.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Status */}
              <div
                className="order-section"
                style={{
                  background: 'var(--black2)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  padding: '20px',
                }}
              >
                <h2 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--white2)' }}>
                  Статус
                </h2>
                <div
                  className={`status-badge status-badge--${currentOrder.status.toLowerCase()}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: getStatusColor(currentOrder.status),
                    borderRadius: 'var(--radius)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#fff',
                    textTransform: 'uppercase',
                  }}
                >
                  {currentOrder.status}
                </div>
              </div>

              {/* Shipping Info */}
              <div
                className="order-section"
                style={{
                  background: 'var(--black2)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  padding: '20px',
                }}
              >
                <h2 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--white2)' }}>
                  Доставка
                </h2>
                <div style={{ fontSize: '13px', color: 'var(--gray4)', lineHeight: 1.6 }}>
                  <div>
                    <strong style={{ color: 'var(--white)' }}>Адрес:</strong>
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    {(currentOrder.shippingAddress as { city?: string })?.city}, {(currentOrder.shippingAddress as { street?: string })?.street}, д.{' '}
                    {(currentOrder.shippingAddress as { building?: string })?.building}
                    {(currentOrder.shippingAddress as { apartment?: string })?.apartment &&
                      `, кв. ${(currentOrder.shippingAddress as { apartment?: string })?.apartment}`}
                  </div>
                  {currentOrder.shippingMethod && (
                    <div style={{ marginTop: '8px' }}>
                      <strong style={{ color: 'var(--white)' }}>Способ:</strong>{' '}
                      {currentOrder.shippingMethod === 'pickup' ? 'Самовывоз' : 'Курьер'}
                    </div>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div
                className="order-section"
                style={{
                  background: 'var(--black2)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  padding: '20px',
                }}
              >
                <h2 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--white2)' }}>
                  Итого
                </h2>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    fontSize: '13px',
                    color: 'var(--gray4)',
                  }}
                >
                  <span>Подытог:</span>
                  <span>{currentOrder.subtotal.toLocaleString('ru-RU')} ₽</span>
                </div>
                {currentOrder.discount > 0 && (
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
                    <span>-{currentOrder.discount.toLocaleString('ru-RU')} ₽</span>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    fontSize: '13px',
                    color: 'var(--gray4)',
                  }}
                >
                  <span>Доставка:</span>
                  <span>
                    {currentOrder.shippingCost === 0
                      ? 'Бесплатно'
                      : `${currentOrder.shippingCost} ₽`}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--gray1)',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--white2)',
                  }}
                >
                  <span>Всего:</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px' }}>
                    {currentOrder.total.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Orders list view
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
            <Link href="/profile" style={{ color: 'var(--gray3)', textDecoration: 'none' }}>
              Профиль
            </Link>
            <span className="breadcrumb__sep" style={{ color: 'var(--gray2)' }}>
              /
            </span>
            <span style={{ color: 'var(--white)' }}>Заказы</span>
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
          Мои заказы
        </h1>

        {orders.length === 0 ? (
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
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <h2 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--white2)' }}>
              У вас пока нет заказов
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--gray3)', marginBottom: '24px' }}>
              Оформите первый заказ в нашем магазине
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
            className="orders-list"
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {orders.map((order) => (
              <div
                key={order.id}
                className="order-card"
                style={{
                  background: 'var(--black2)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  padding: '20px',
                  transition: 'border-color var(--tr)',
                }}
              >
                <div
                  className="order-card__header"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid var(--gray1)',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--white2)',
                        marginBottom: '4px',
                      }}
                    >
                      Заказ {order.orderNumber}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray3)' }}>
                      от{' '}
                      {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div
                    className={`status-badge status-badge--${order.status.toLowerCase()}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: getStatusColor(order.status),
                      borderRadius: 'var(--radius)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#fff',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {order.status}
                  </div>
                </div>

                <div className="order-card__items" style={{ marginBottom: '16px' }}>
                  {order.items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        padding: '8px 0',
                      }}
                    >
                      <div
                        style={{
                          width: '50px',
                          height: '50px',
                          background: 'var(--black3)',
                          border: '1px solid var(--gray1)',
                          borderRadius: 'var(--radius)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {item.product?.images?.[0]?.url || item.product?.mainImageUrl ? (
                          <img
                            src={item.product.images?.[0]?.url || item.product?.mainImageUrl}
                            alt={item.name}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                        ) : (
                          <svg
                            viewBox="0 0 50 50"
                            fill="none"
                            style={{ width: '30px', height: '30px' }}
                          >
                            <rect
                              x="8"
                              y="15"
                              width="34"
                              height="20"
                              rx="2"
                              stroke="var(--gray2)"
                              strokeWidth="2"
                            />
                          </svg>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '12px',
                            color: 'var(--white)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--gray3)' }}>
                          {item.quantity} шт.
                        </div>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div style={{ fontSize: '12px', color: 'var(--gray3)', padding: '4px 0' }}>
                      + ещё {order.items.length - 3}{' '}
                      {getDeclension(order.items.length - 3, ['товар', 'товара', 'товаров'])}
                    </div>
                  )}
                </div>

                <div
                  className="order-card__footer"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--gray1)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--gray3)', marginBottom: '4px' }}>
                      Сумма заказа:
                    </div>
                    <div
                      style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: 'var(--white2)',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {order.total.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="btn btn-outline"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 20px',
                      fontSize: '12px',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      borderRadius: 'var(--radius)',
                      background: 'transparent',
                      color: 'var(--orange)',
                      border: '1px solid var(--orange)',
                      textDecoration: 'none',
                    }}
                  >
                    Подробнее
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: '#ff9800',
    CONFIRMED: '#2196f3',
    PAYING: '#9c27b0',
    PAID: '#4caf50',
    ASSEMBLING: '#ff9800',
    SHIPPED: '#2196f3',
    DELIVERING: '#4caf50',
    DELIVERED: '#4caf50',
    CANCELLED: '#f44336',
    REFUNDED: '#f44336',
  };
  return colors[status] || '#888';
}

function getDeclension(number: number, titles: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[
    number % 100 > 4 && number % 100 < 20 ? 2 : cases[number % 10 < 5 ? number % 10 : 5]
  ];
}
