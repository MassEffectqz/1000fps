'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useDebouncedCallback } from 'use-debounce';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useSearchSuggestions, useCategories, useCart, useWishlist } from '@/hooks/useApi';

// ============================================
// TopBar Component
// ============================================

export function TopBar() {
  return (
    <div
      className="topbar"
      style={{
        background: 'var(--black2)',
        borderBottom: '1px solid var(--gray1)',
        fontSize: '12px',
        color: 'var(--gray3)',
      }}
    >
      <div className="container">
        <div
          className="topbar__inner"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '34px',
            gap: '24px',
          }}
        >
          <div
            className="topbar__left"
            style={{ display: 'flex', alignItems: 'center', gap: '20px' }}
          >
            <span
              className="topbar__city"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--gray3)',
                cursor: 'pointer',
                borderBottom: '1px dashed var(--gray2)',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ width: '12px', height: '12px' }}
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              Волгоград, Еременко 126
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ width: '12px', height: '12px', color: 'var(--orange)' }}
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.19 11.9 19.79 19.79 0 0 1 1.12 3.29 2 2 0 0 1 3.09 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z" />
              </svg>
              8-902-650-05-11
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ width: '12px', height: '12px' }}
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              Волжский, пр. Ленина 14
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ width: '12px', height: '12px', color: 'var(--orange)' }}
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.19 11.9 19.79 19.79 0 0 1 1.12 3.29 2 2 0 0 1 3.09 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z" />
              </svg>
              8-961-679-21-84
            </span>
            <span>С 10 до 19ч</span>
          </div>
          <div
            className="topbar__right"
            style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <Link
              href="/help/delivery"
              style={{ color: 'var(--gray3)', transition: 'color var(--tr)' }}
            >
              Доставка
            </Link>
            <Link
              href="/help/warranty"
              style={{ color: 'var(--gray3)', transition: 'color var(--tr)' }}
            >
              Гарантия
            </Link>
            <Link
              href="/help/credit"
              style={{ color: 'var(--gray3)', transition: 'color var(--tr)' }}
            >
              Кредит и рассрочка
            </Link>
            <Link href="/contacts" style={{ color: 'var(--gray3)', transition: 'color var(--tr)' }}>
              Контакты
            </Link>
            <Link
              href="/corporate"
              style={{ color: 'var(--gray3)', transition: 'color var(--tr)' }}
            >
              Корп. клиентам
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Search Component with Debounce
// ============================================

interface SearchProps {
  onSearchNavigate: (query: string) => void;
}

function Search({ onSearchNavigate }: SearchProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { data: suggestions } = useSearchSuggestions(query);
  const { data: categoriesData } = useCategories();

  const categories = categoriesData?.data || [];

  // Debounced search
  const debouncedSearch = useDebouncedCallback((value: string) => {
    if (value.length >= 2) {
      // Trigger search query
    }
  }, 300);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearchNavigate(query);
      setShowDropdown(false);
    }
  };

  const handleSelect = (suggestion: string) => {
    setQuery(suggestion);
    onSearchNavigate(suggestion);
    setShowDropdown(false);
  };

  return (
    <form onSubmit={handleSubmit} className="search-wrap" style={{ position: 'relative', flex: 1 }}>
      <svg
        className="search-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '16px',
          height: '16px',
          color: 'var(--gray3)',
          pointerEvents: 'none',
        }}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        className="search-input"
        placeholder="Поиск по товарам, брендам, артикулам..."
        value={query}
        onChange={handleChange}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        style={{
          width: '100%',
          height: '42px',
          background: 'var(--black3)',
          border: '1px solid var(--gray1)',
          borderRadius: 'var(--radius)',
          padding: '0 160px 0 40px',
          color: 'var(--white)',
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color var(--tr)',
        }}
      />
      <button
        type="submit"
        className="search-btn"
        style={{
          position: 'absolute',
          right: '148px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'var(--orange)',
          border: 'none',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: 'var(--radius)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          transition: 'background var(--tr)',
          whiteSpace: 'nowrap',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ width: '14px', height: '14px' }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        Найти
      </button>
      <button
        type="button"
        className="search-cat"
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          height: '100%',
          width: '140px',
          background: 'var(--gray1)',
          border: 'none',
          borderLeft: '1px solid var(--gray1)',
          color: 'var(--gray4)',
          fontSize: '12px',
          padding: '0 14px',
          borderRadius: '0 var(--radius) var(--radius) 0',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          whiteSpace: 'nowrap',
          transition: 'background var(--tr)',
        }}
      >
        Все категории
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ width: '12px', height: '12px' }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Search Dropdown */}
      {showDropdown && (query || suggestions?.length) && (
        <div
          className="search-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--black2)',
            border: '1px solid var(--gray1)',
            borderRadius: 'var(--radius)',
            zIndex: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          {query && suggestions && suggestions.length > 0 && (
            <div className="search-dropdown__section" style={{ padding: '12px 16px' }}>
              <div
                className="search-dropdown__label"
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--gray3)',
                  marginBottom: '8px',
                }}
              >
                Подсказки
              </div>
              <div className="search-dropdown__items">
                {suggestions.slice(0, 5).map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(suggestion)}
                    className="search-dropdown__item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius)',
                      fontSize: '13px',
                      color: 'var(--gray4)',
                      cursor: 'pointer',
                      transition: 'background var(--tr)',
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ width: '14px', height: '14px', color: 'var(--gray3)' }}
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!query && categories.length > 0 && (
            <>
              <div className="search-dropdown__section" style={{ padding: '12px 16px' }}>
                <div
                  className="search-dropdown__label"
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--gray3)',
                    marginBottom: '8px',
                  }}
                >
                  Популярные запросы
                </div>
                <div
                  className="search-dropdown__items"
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}
                >
                  {['RTX 4070 Ti', 'Ryzen 7 7800X3D', 'Игровые мониторы', 'DDR5 32GB'].map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleSelect(item)}
                        style={{
                          padding: '4px 10px',
                          background: 'var(--black3)',
                          border: '1px solid var(--gray1)',
                          borderRadius: 'var(--radius)',
                          fontSize: '12px',
                          color: 'var(--gray4)',
                          cursor: 'pointer',
                          transition: 'var(--tr)',
                        }}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div
                className="search-dropdown__divider"
                style={{ height: '1px', background: 'var(--gray1)', margin: '0 16px' }}
              />
            </>
          )}

          {categories.length > 0 && (
            <div className="search-dropdown__section" style={{ padding: '12px 16px' }}>
              <div
                className="search-dropdown__label"
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--gray3)',
                  marginBottom: '8px',
                }}
              >
                Категории
              </div>
              <div
                className="search-dropdown__cats"
                style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}
              >
                {categories.slice(0, 10).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/catalog/${cat.slug}`}
                    onClick={() => setShowDropdown(false)}
                    style={{
                      padding: '4px 10px',
                      background: 'var(--black3)',
                      border: '1px solid var(--gray1)',
                      borderRadius: 'var(--radius)',
                      fontSize: '12px',
                      color: 'var(--gray4)',
                      transition: 'var(--tr)',
                      textDecoration: 'none',
                    }}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </form>
  );
}

// ============================================
// Header Actions Component
// ============================================

function HeaderActions() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { data: cartData } = useCart();
  const { data: wishlistData } = useWishlist();
  const [compareCount] = useState(2); // TODO: implement compare store
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false);

  const cart = cartData?.cart;
  const wishlist = wishlistData?.wishlist;

  const cartItemsCount =
    cart?.items?.reduce((sum: number, item) => sum + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.items?.length || 0;

  const handleCartClick = () => {
    router.push('/cart');
  };

  const handleWishlistClick = () => {
    if (isAuthenticated) {
      router.push('/wishlist');
    } else {
      router.push('/auth');
    }
  };

  const handleProfileClick = () => {
    if (isAuthenticated && user) {
      router.push('/profile');
    } else {
      router.push('/auth');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutDropdown(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showLogoutDropdown) {
        setShowLogoutDropdown(false);
      }
    };

    if (showLogoutDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showLogoutDropdown]);

  return (
    <div className="header__actions" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {/* Сравнение */}
      <button
        className="hbtn"
        title="Сравнение"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          padding: '6px 12px',
          borderRadius: 'var(--radius)',
          color: 'var(--gray4)',
          transition: 'var(--tr)',
          position: 'relative',
          minWidth: '52px',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ width: '20px', height: '20px' }}
        >
          <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
        <span
          className="hbtn__label"
          style={{
            fontSize: '10px',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Сравнить
        </span>
        {compareCount > 0 && (
          <span
            className="hbtn__badge"
            style={{
              position: 'absolute',
              top: '2px',
              right: '6px',
              background: 'var(--orange)',
              color: '#fff',
              fontSize: '9px',
              fontWeight: 700,
              lineHeight: 1,
              minWidth: '16px',
              height: '16px',
              padding: '0 4px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
            }}
          >
            {compareCount}
          </span>
        )}
      </button>

      {/* Избранное */}
      <button
        className="hbtn"
        onClick={handleWishlistClick}
        title="Избранное"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          padding: '6px 12px',
          borderRadius: 'var(--radius)',
          color: 'var(--gray4)',
          transition: 'var(--tr)',
          position: 'relative',
          minWidth: '52px',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ width: '20px', height: '20px' }}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span
          className="hbtn__label"
          style={{
            fontSize: '10px',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Вишлист
        </span>
        {wishlistCount > 0 && (
          <span
            className="hbtn__badge"
            style={{
              position: 'absolute',
              top: '2px',
              right: '6px',
              background: 'var(--orange)',
              color: '#fff',
              fontSize: '9px',
              fontWeight: 700,
              lineHeight: 1,
              minWidth: '16px',
              height: '16px',
              padding: '0 4px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
            }}
          >
            {wishlistCount}
          </span>
        )}
      </button>

      <div
        className="header-divider"
        style={{ width: '1px', height: '32px', background: 'var(--gray1)', margin: '0 4px' }}
      />

      {/* Аккаунт */}
      <div style={{ position: 'relative' }}>
        <button
          className="hbtn"
          onClick={(e) => {
            e.stopPropagation();
            if (isAuthenticated && user) {
              setShowLogoutDropdown(!showLogoutDropdown);
            } else {
              handleProfileClick();
            }
          }}
          title={isAuthenticated && user ? user.firstName || 'Профиль' : 'Войти'}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            padding: '6px 12px',
            borderRadius: 'var(--radius)',
            color: 'var(--gray4)',
            transition: 'var(--tr)',
            position: 'relative',
            minWidth: '52px',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ width: '20px', height: '20px' }}
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span
            className="hbtn__label"
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {isAuthenticated && user ? user.firstName || 'Профиль' : 'Войти'}
          </span>
        </button>
        {showLogoutDropdown && isAuthenticated && user && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: 'var(--black2)',
              border: '1px solid var(--gray1)',
              borderRadius: 'var(--radius)',
              padding: '8px 16px',
              zIndex: 300,
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--orange)',
              whiteSpace: 'nowrap',
            }}
          >
            Выйти
          </button>
        )}
      </div>

      {/* Корзина */}
      <button
        className="hbtn hbtn--cart"
        onClick={handleCartClick}
        title="Корзина"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          padding: '6px 12px',
          borderRadius: 'var(--radius)',
          background: cartItemsCount > 0 ? 'var(--orange)' : 'transparent',
          color: cartItemsCount > 0 ? '#fff' : 'var(--gray4)',
          transition: 'var(--tr)',
          position: 'relative',
          minWidth: '52px',
          cursor: 'pointer',
          border: 'none',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ width: '20px', height: '20px' }}
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        <span
          className="hbtn__label"
          style={{
            fontSize: '10px',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Корзина
        </span>
        {cartItemsCount > 0 && (
          <span
            className="hbtn__badge"
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: 'var(--white2)',
              color: 'var(--orange)',
              fontSize: '9px',
              fontWeight: 700,
              lineHeight: 1,
              minWidth: '16px',
              height: '16px',
              padding: '0 4px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
            }}
          >
            {cartItemsCount}
          </span>
        )}
      </button>

      {/* Переключатель темы */}
      <ThemeToggle />
    </div>
  );
}

// ============================================
// Main Header Component
// ============================================

export function Header() {
  const router = useRouter();

  const handleSearchNavigate = useCallback(
    (query: string) => {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    },
    [router]
  );

  return (
    <header
      className="header"
      style={{
        background: 'var(--black)',
        borderBottom: '2px solid var(--orange)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div className="container">
        <div
          className="header__inner"
          style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr auto',
            alignItems: 'center',
            height: '64px',
            gap: '24px',
          }}
        >
          {/* LOGO */}
          <Link
            href="/"
            className="logo"
            style={{ display: 'flex', alignItems: 'center', gap: 0, textDecoration: 'none' }}
          >
            <div
              className="logo__mark"
              style={{
                width: '36px',
                height: '36px',
                background: 'var(--orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius)',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{ width: '20px', height: '20px', color: '#fff' }}
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span
              className="logo__text"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '22px',
                fontWeight: 800,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                color: 'var(--white2)',
                marginLeft: '10px',
              }}
            >
              1000<span style={{ color: 'var(--orange)' }}>fps</span>
            </span>
          </Link>

          {/* SEARCH */}
          <Search onSearchNavigate={handleSearchNavigate} />

          {/* ACTIONS */}
          <HeaderActions />
        </div>
      </div>
    </header>
  );
}

// ============================================
// Navigation Component
// ============================================

export function Nav() {
  const { data: categoriesData, isLoading } = useCategories();
  const [showCatalogMenu, setShowCatalogMenu] = useState(false);

  const categories = categoriesData?.data || [];

  const navLinks = [
    { name: 'Главная', href: '/' },
    { name: 'Каталог', href: '/catalog' },
    { name: 'Акции', href: '/promotions', hot: true },
    { name: 'Конфигуратор ПК', href: '/configurator' },
    { name: 'Оплата', href: '/help/payment' },
    { name: 'Гарантия', href: '/help/warranty' },
  ];

  const handleCatalogClick = () => {
    setShowCatalogMenu(!showCatalogMenu);
  };

  return (
    <div className="site-nav-wrap" style={{ position: 'relative' }}>
      <nav
        className="nav"
        style={{
          background: 'var(--black2)',
          borderBottom: '1px solid var(--gray1)',
        }}
      >
        <div className="container">
          <div
            className="nav__inner"
            style={{
              display: 'flex',
              alignItems: 'stretch',
              height: '44px',
            }}
          >
            <button
              className="nav__catalog-btn"
              onClick={handleCatalogClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0 20px',
                background: showCatalogMenu ? 'var(--orange2)' : 'var(--orange)',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                border: 'none',
                cursor: 'pointer',
                borderRight: '1px solid var(--orange2)',
                flexShrink: 0,
                transition: 'background var(--tr)',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{ width: '18px', height: '18px' }}
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              Каталог товаров
              {isLoading && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }}
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              )}
            </button>
            <div className="nav__links" style={{ display: 'flex', alignItems: 'stretch' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`nav__link ${link.hot ? 'nav__link--hot' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: link.hot ? 'var(--orange)' : 'var(--gray4)',
                    borderRight: '1px solid var(--gray1)',
                    transition: 'color var(--tr), background var(--tr)',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div
              className="nav__extras"
              style={{ marginLeft: 'auto', display: 'flex', alignItems: 'stretch' }}
            >
              <Link
                href="/pickup-points"
                className="nav__extra"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0 16px',
                  fontSize: '12px',
                  color: 'var(--gray3)',
                  borderLeft: '1px solid var(--gray1)',
                  transition: 'color var(--tr)',
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
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Пункты выдачи
              </Link>
              <Link
                href="/help"
                className="nav__extra"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0 16px',
                  fontSize: '12px',
                  color: 'var(--gray3)',
                  borderLeft: '1px solid var(--gray1)',
                  transition: 'color var(--tr)',
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
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Помощь
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Catalog Dropdown Menu */}
      {showCatalogMenu && (
        <div
          className="catalog-menu"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--black2)',
            border: '1px solid var(--gray1)',
            borderTop: 'none',
            zIndex: 150,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}
          onMouseLeave={() => setShowCatalogMenu(false)}
        >
          <div className="container">
            {isLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray3)' }}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    width: '24px',
                    height: '24px',
                    margin: '0 auto 12px',
                    animation: 'spin 1s linear infinite',
                  }}
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                Загрузка категорий...
              </div>
            ) : categories.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '24px',
                  padding: '20px',
                }}
              >
                {categories.slice(0, 10).map((cat) => (
                  <div key={cat.id}>
                    <Link
                      href={`/catalog/${cat.slug}`}
                      onClick={() => setShowCatalogMenu(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--white2)',
                        marginBottom: '12px',
                        textDecoration: 'none',
                        transition: 'color var(--tr)',
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ width: '18px', height: '18px', color: 'var(--orange)' }}
                      >
                        {cat.slug === 'gpu' && <path d="M2 7h20v12H2z M7 7V5m5 0v2m5-2v2M7 19v2m5-2v2m5-2v2" />}
                        {cat.slug === 'cpu' && <path d="M4 4h16v16H4z M9 9h6v6H9z M9 2v2m6-2v2M9 20v2m6-2v2M2 9h2m16 0h2M2 15h2m16 0h2" />}
                        {cat.slug === 'motherboard' && <path d="M2 2h20v20H2z M6 6h4v4H6z M14 6h4v4h-4z M6 14h4v4H6z M14 16h4m0-4v4" />}
                        {cat.slug === 'ram' && <path d="M2 8h20v8H2z M6 8V6m4 0v2m4-2v2m4-2v2M6 16v2m4-2v2m4-2v2m4-2v2" />}
                        {cat.slug === 'storage' && <path d="M22 12H2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />}
                        {cat.slug === 'monitors' && <path d="M2 3h20v14H2z M8 21h8m-4-4v4" />}
                        {cat.slug === 'laptops' && <path d="M2 4h20v13H2z M0 20h24" />}
                        {cat.slug === 'cooling' && <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m16 0h2M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />}
                        {cat.slug === 'psu' && <path d="m13 2-10 12h9l-1 8 10-12h-9l1-8z" />}
                        {cat.slug === 'periph' && <path d="M6 2h12v20H6z M9 7h6m0 4h6" />}
                        {/* Default icon for unknown categories */}
                        {!['gpu', 'cpu', 'motherboard', 'ram', 'storage', 'monitors', 'laptops', 'cooling', 'psu', 'periph'].includes(cat.slug) && (
                          <path d="M20 7h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zm-2 10h-4v-4h4v4z M4 9h8v12H4a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2zm0-2V5a2 2 0 0 1 2-2h8v4H6z" />
                        )}
                      </svg>
                      {cat.name}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray3)' }}>
                Категории не найдены
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Header Wrapper
// ============================================

export function HeaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* PROMO STRIP */}
      <div
        className="promo-strip"
        style={{
          background: 'var(--orange)',
          color: '#fff',
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          padding: '7px 20px',
          position: 'relative',
        }}
      >
        Бесплатная доставка от 5 000 руб. — только до конца недели
        <button
          style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            opacity: 0.7,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ width: '16px', height: '16px' }}
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <TopBar />
      <Header />
      <Nav />
      {children}
    </>
  );
}
