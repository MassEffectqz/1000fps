'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="not-found-page"
      style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div className="container" style={{ textAlign: 'center' }}>
        {/* 404 Number */}
        <div
          style={{
            fontSize: 'clamp(120px, 20vw, 280px)',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            color: 'var(--gray1)',
            lineHeight: 1,
            marginBottom: '24px',
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'var(--orange)',
              opacity: 0.3,
            }}
          >
            404
          </span>
          <span style={{ color: 'var(--gray1)' }}>404</span>
        </div>

        {/* Message */}
        <h1
          style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            marginBottom: '12px',
            color: 'var(--white2)',
            textTransform: 'uppercase',
          }}
        >
          Страница не найдена
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--gray3)',
            marginBottom: '32px',
            maxWidth: '480px',
            margin: '0 auto 32px',
          }}
        >
          Страница, которую вы ищете, не существует или была перемещена
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
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
              textDecoration: 'none',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ width: '16px', height: '16px' }}
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            На главную
          </Link>
          <Link
            href="/catalog"
            className="btn btn-outline"
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
              background: 'transparent',
              color: 'var(--orange)',
              border: '1px solid var(--orange)',
              textDecoration: 'none',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ width: '16px', height: '16px' }}
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Каталог
          </Link>
        </div>

        {/* Quick links */}
        <div
          style={{
            marginTop: '48px',
            paddingTop: '32px',
            borderTop: '1px solid var(--gray1)',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: 'var(--gray3)',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Популярные разделы
          </div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/catalog"
              style={{
                fontSize: '13px',
                color: 'var(--gray4)',
                textDecoration: 'none',
                transition: 'var(--tr)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--orange)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--gray4)')}
            >
              Каталог
            </Link>
            <Link
              href="/configurator"
              style={{
                fontSize: '13px',
                color: 'var(--gray4)',
                textDecoration: 'none',
                transition: 'var(--tr)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--orange)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--gray4)')}
            >
              Конфигуратор ПК
            </Link>
            <Link
              href="/profile"
              style={{
                fontSize: '13px',
                color: 'var(--gray4)',
                textDecoration: 'none',
                transition: 'var(--tr)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--orange)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--gray4)')}
            >
              Личный кабинет
            </Link>
            <Link
              href="/auth"
              style={{
                fontSize: '13px',
                color: 'var(--gray4)',
                textDecoration: 'none',
                transition: 'var(--tr)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--orange)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--gray4)')}
            >
              Вход и регистрация
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
