'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useOrders, useLogout, useCart, useWishlist } from '@/hooks/useApi';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hasHydrated } = useAuthStore();
  const { data: cartData } = useCart();
  const { data: wishlistData } = useWishlist();
  const { data: ordersData } = useOrders();
  const logout = useLogout();

  const [activeTab, setActiveTab] = useState('overview');
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const cart = cartData?.cart;
  const wishlist = wishlistData?.wishlist;
  const orders = ordersData?.orders || [];
  const cartItemsCount =
    cart?.items?.reduce((sum: number, item) => sum + item.quantity, 0) || 0;
  const wishlistItemsCount = wishlist?.items?.length || 0;

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push('/');
  };

  // Проверка авторизации в useEffect
  useEffect(() => {
    // Ждём гидратации перед проверкой авторизации
    if (!hasHydrated) return;
    
    if (!isAuthenticated) {
      setShouldRedirect(true);
    }
  }, [isAuthenticated, hasHydrated]);

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/auth');
    }
  }, [shouldRedirect, router]);

  // Показываем загрузку пока не гидратировались или идёт редирект
  if (!hasHydrated || isLoading || shouldRedirect) {
    return (
      <div
        className="container"
        style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--gray3)' }}
      >
        Загрузка...
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Обзор', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
    {
      id: 'orders',
      name: 'Заказы',
      icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9h6m-6-4h4',
      count: orders.length,
    },
    {
      id: 'wishlist',
      name: 'Вишлист',
      icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
      count: wishlistItemsCount,
    },
    { id: 'addresses', name: 'Адреса', icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' },
    {
      id: 'bonuses',
      name: 'Бонусы',
      icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: '#ff9800',
      CONFIRMED: '#2196f3',
      PAID: '#4caf50',
      SHIPPED: '#2196f3',
      DELIVERED: '#4caf50',
      CANCELLED: '#f44336',
    };
    return colors[status] || '#888';
  };

  const getLoyaltyColor = (level: string) => {
    const colors: Record<string, string> = {
      BRONZE: '#cd7f32',
      SILVER: '#c0c0c0',
      GOLD: '#ffd700',
      PLATINUM: '#e5e4e2',
    };
    return colors[level] || '#888';
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
            <span style={{ color: 'var(--white)' }}>Личный кабинет</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '0 20px 40px' }}>
        <div
          className="profile-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gap: '24px',
            marginTop: '24px',
          }}
        >
          {/* Sidebar */}
          <aside className="profile-sidebar">
            {/* User Card */}
            <div
              style={{
                background: 'var(--black2)',
                border: '1px solid var(--gray1)',
                borderRadius: 'var(--radius)',
                padding: '24px',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'var(--black3)',
                  border: `2px solid ${getLoyaltyColor(user?.loyaltyLevel || 'BRONZE')}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '32px',
                    fontWeight: 800,
                    color: getLoyaltyColor(user?.loyaltyLevel || 'BRONZE'),
                  }}
                >
                  {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                </span>
              </div>
              <h2 style={{ fontSize: '18px', marginBottom: '4px', color: 'var(--white2)' }}>
                {user?.firstName || 'Пользователь'}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--gray3)', marginBottom: '12px' }}>
                {user?.email}
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  background: getLoyaltyColor(user?.loyaltyLevel || 'BRONZE'),
                  borderRadius: 'var(--radius)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#000',
                  textTransform: 'uppercase',
                }}
              >
                {user?.loyaltyLevel || 'BRONZE'}
              </div>
            </div>

            {/* Navigation */}
            <nav
              style={{
                background: 'var(--black2)',
                border: '1px solid var(--gray1)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
              }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`profile-nav-item ${activeTab === tab.id ? 'is-active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '14px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: activeTab === tab.id ? 'var(--orange)' : 'var(--gray4)',
                    background: activeTab === tab.id ? 'var(--black3)' : 'transparent',
                    border: 'none',
                    borderLeft:
                      activeTab === tab.id ? '3px solid var(--orange)' : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'var(--tr)',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ width: '18px', height: '18px' }}
                    >
                      <path d={tab.icon} />
                    </svg>
                    {tab.name}
                  </span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      style={{
                        minWidth: '20px',
                        height: '20px',
                        padding: '0 6px',
                        background: 'var(--orange)',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--gray4)',
                  background: 'transparent',
                  border: 'none',
                  borderLeft: '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'var(--tr)',
                  textAlign: 'left',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ width: '18px', height: '18px' }}
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Выйти
              </button>
            </nav>

            {/* Quick stats */}
            <div
              style={{
                background: 'var(--black2)',
                border: '1px solid var(--gray1)',
                borderRadius: 'var(--radius)',
                padding: '16px',
                marginTop: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--gray3)',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                }}
              >
                Быстрая статистика
              </div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}
              >
                <span style={{ fontSize: '13px', color: 'var(--gray4)' }}>Бонусы:</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--orange)' }}>
                  {user?.bonusPoints || 0} ₽
                </span>
              </div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}
              >
                <span style={{ fontSize: '13px', color: 'var(--gray4)' }}>Корзина:</span>
                <Link
                  href="/cart"
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--white2)',
                    textDecoration: 'none',
                  }}
                >
                  {cartItemsCount} тов.
                </Link>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--gray4)' }}>Вишлист:</span>
                <Link
                  href="/wishlist"
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--white2)',
                    textDecoration: 'none',
                  }}
                >
                  {wishlistItemsCount} тов.
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="profile-content">
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Welcome */}
                <div
                  style={{
                    background: 'var(--black2)',
                    border: '1px solid var(--gray1)',
                    borderRadius: 'var(--radius)',
                    padding: '24px',
                  }}
                >
                  <h1 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--white2)' }}>
                    Добро пожаловать, {user?.firstName || 'Пользователь'}!
                  </h1>
                  <p style={{ fontSize: '14px', color: 'var(--gray3)' }}>
                    Это ваш личный кабинет. Здесь вы можете управлять заказами, вишлистом и
                    настройками аккаунта.
                  </p>
                </div>

                {/* Recent Orders */}
                <div
                  style={{
                    background: 'var(--black2)',
                    border: '1px solid var(--gray1)',
                    borderRadius: 'var(--radius)',
                    padding: '24px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <h2 style={{ fontSize: '18px', color: 'var(--white2)' }}>Последние заказы</h2>
                    <Link
                      href="/orders"
                      style={{ fontSize: '13px', color: 'var(--orange)', textDecoration: 'none' }}
                    >
                      Все заказы →
                    </Link>
                  </div>
                  {orders.length === 0 ? (
                    <p
                      style={{
                        fontSize: '14px',
                        color: 'var(--gray3)',
                        textAlign: 'center',
                        padding: '20px',
                      }}
                    >
                      У вас пока нет заказов
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {orders.slice(0, 3).map((order) => (
                        <Link
                          key={order.id}
                          href={`/orders/${order.id}`}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                            background: 'var(--black3)',
                            borderRadius: 'var(--radius)',
                            textDecoration: 'none',
                            transition: 'var(--tr)',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: 'var(--white2)',
                                marginBottom: '4px',
                              }}
                            >
                              {order.orderNumber}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--gray3)' }}>
                              {new Date(order.createdAt).toLocaleDateString('ru-RU')} •{' '}
                              {order.items.length} тов.
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div
                              style={{
                                display: 'inline-flex',
                                padding: '4px 10px',
                                background: getStatusColor(order.status),
                                borderRadius: 'var(--radius)',
                                fontSize: '10px',
                                fontWeight: 700,
                                color: '#fff',
                                textTransform: 'uppercase',
                                marginBottom: '4px',
                              }}
                            >
                              {order.status}
                            </div>
                            <div
                              style={{
                                fontSize: '16px',
                                fontWeight: 700,
                                color: 'var(--white2)',
                                fontFamily: 'var(--font-display)',
                              }}
                            >
                              {order.total.toLocaleString('ru-RU')} ₽
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bonus Card */}
                <div
                  style={{
                    background: `linear-gradient(135deg, ${getLoyaltyColor(user?.loyaltyLevel || 'BRONZE')}22, ${getLoyaltyColor(user?.loyaltyLevel || 'BRONZE')}44)`,
                    border: `1px solid ${getLoyaltyColor(user?.loyaltyLevel || 'BRONZE')}`,
                    borderRadius: 'var(--radius)',
                    padding: '24px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--gray3)', marginBottom: '8px' }}>
                        Ваш бонусный счёт
                      </div>
                      <div
                        style={{
                          fontSize: '36px',
                          fontWeight: 800,
                          color: 'var(--orange)',
                          fontFamily: 'var(--font-display)',
                        }}
                      >
                        {user?.bonusPoints || 0} ₽
                      </div>
                    </div>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={getLoyaltyColor(user?.loyaltyLevel || 'BRONZE')}
                      strokeWidth="1.5"
                      style={{ width: '80px', height: '80px' }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h1 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--white2)' }}>
                  Мои заказы
                </h1>
                {orders.length === 0 ? (
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
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {orders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        style={{
                          background: 'var(--black2)',
                          border: '1px solid var(--gray1)',
                          borderRadius: 'var(--radius)',
                          padding: '20px',
                          textDecoration: 'none',
                          transition: 'var(--tr)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px',
                            paddingBottom: '16px',
                            borderBottom: '1px solid var(--gray1)',
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
                              {order.orderNumber}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--gray3)' }}>
                              {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                            </div>
                          </div>
                          <div
                            style={{
                              padding: '6px 12px',
                              background: getStatusColor(order.status),
                              borderRadius: 'var(--radius)',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#fff',
                              textTransform: 'uppercase',
                            }}
                          >
                            {order.status}
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div style={{ fontSize: '13px', color: 'var(--gray4)' }}>
                            {order.items.length} тов. • {order.total.toLocaleString('ru-RU')} ₽
                          </div>
                          <span
                            style={{
                              fontSize: '13px',
                              color: 'var(--orange)',
                              textDecoration: 'none',
                            }}
                          >
                            Подробнее →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h1 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--white2)' }}>
                  Избранное
                </h1>
                {wishlistItemsCount === 0 ? (
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
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <p style={{ fontSize: '14px', color: 'var(--gray3)' }}>
                      Список избранного пуст
                    </p>
                  </div>
                ) : (
                  <p style={{ fontSize: '14px', color: 'var(--gray3)' }}>
                    Перейдите на страницу{' '}
                    <Link href="/wishlist" style={{ color: 'var(--orange)' }}>
                      вишлиста
                    </Link>{' '}
                    для управления избранным
                  </p>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div>
                <h1 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--white2)' }}>
                  Мои адреса
                </h1>
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
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <p style={{ fontSize: '14px', color: 'var(--gray3)' }}>
                    Адреса пока не добавлены
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'bonuses' && (
              <div>
                <h1 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--white2)' }}>
                  Бонусная программа
                </h1>
                <div
                  style={{
                    background: `linear-gradient(135deg, ${getLoyaltyColor(user?.loyaltyLevel || 'BRONZE')}22, ${getLoyaltyColor(user?.loyaltyLevel || 'BRONZE')}44)`,
                    border: `1px solid ${getLoyaltyColor(user?.loyaltyLevel || 'BRONZE')}`,
                    borderRadius: 'var(--radius)',
                    padding: '32px',
                    marginBottom: '24px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '24px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--gray3)', marginBottom: '8px' }}>
                        Текущий уровень
                      </div>
                      <div
                        style={{
                          fontSize: '28px',
                          fontWeight: 800,
                          color: getLoyaltyColor(user?.loyaltyLevel || 'BRONZE'),
                          textTransform: 'uppercase',
                        }}
                      >
                        {user?.loyaltyLevel || 'BRONZE'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', color: 'var(--gray3)', marginBottom: '8px' }}>
                        Бонусный счёт
                      </div>
                      <div
                        style={{
                          fontSize: '36px',
                          fontWeight: 800,
                          color: 'var(--orange)',
                          fontFamily: 'var(--font-display)',
                        }}
                      >
                        {user?.bonusPoints || 0} ₽
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'var(--black3)',
                      borderRadius: 'var(--radius)',
                      padding: '16px',
                    }}
                  >
                    <div style={{ fontSize: '13px', color: 'var(--gray4)', marginBottom: '12px' }}>
                      Следующий уровень:{' '}
                      <strong style={{ color: 'var(--white2)' }}>
                        {user?.loyaltyLevel === 'BRONZE'
                          ? 'SILVER'
                          : user?.loyaltyLevel === 'SILVER'
                            ? 'GOLD'
                            : user?.loyaltyLevel === 'GOLD'
                              ? 'PLATINUM'
                              : 'MAX'}
                      </strong>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        background: 'var(--gray1)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width:
                            user?.loyaltyLevel === 'BRONZE'
                              ? '25%'
                              : user?.loyaltyLevel === 'SILVER'
                                ? '50%'
                                : user?.loyaltyLevel === 'GOLD'
                                  ? '75%'
                                  : '100%',
                          height: '100%',
                          background: getLoyaltyColor(
                            user?.loyaltyLevel === 'PLATINUM'
                              ? 'PLATINUM'
                              : user?.loyaltyLevel || 'BRONZE'
                          ),
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
