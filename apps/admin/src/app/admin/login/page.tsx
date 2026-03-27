'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Ошибка входа');
      }

      const data = await response.json();

      if (data.user.role !== 'ADMIN' && data.user.role !== 'MANAGER') {
        throw new Error('Недостаточно прав для доступа к админ-панели');
      }

      localStorage.setItem('admin_token', data.accessToken);
      localStorage.setItem('admin_user', JSON.stringify(data.user));

      router.push('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
        }}
      >
        {/* Logo */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'var(--accent)',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ width: '24px', height: '24px', color: '#fff' }}
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '18px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#fff',
              marginBottom: '8px',
            }}
          >
            1000<span style={{ color: 'var(--accent)' }}>fps</span> Admin
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-2)' }}>Панель управления</p>
        </div>

        {/* Login Form */}
        <div
          style={{
            background: 'var(--bg-1)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '32px',
          }}
        >
          {error && (
            <div className="alert alert--info" style={{ marginBottom: '20px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <div className="alert__title">Ошибка</div>
                <div className="alert__sub">{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Email
                <span className="req">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                placeholder="admin@1000fps.ru"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Пароль
                <span className="req">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                placeholder="••••••••"
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: 'var(--text-2)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: 'var(--accent)',
                    cursor: 'pointer',
                  }}
                />
                Запомнить меня
              </label>
              <button
                type="button"
                style={{
                  fontSize: '12px',
                  color: 'var(--accent)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Забыли пароль?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn--primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '10px 20px',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      width: '14px',
                      height: '14px',
                      animation: 'spin 1s linear infinite',
                    }}
                  >
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Вход...
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: '14px', height: '14px' }}
                  >
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
                  </svg>
                  Войти
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials */}
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            background: 'var(--bg-1)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-3)',
              marginBottom: '12px',
            }}
          >
            Тестовые данные:
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-2)', marginBottom: '4px' }}>
            Email: <span className="mono text-white">admin@1000fps.ru</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>
            Пароль: <span className="mono text-white">Admin123!</span>
          </div>
        </div>

        {/* Back to Site */}
        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
          }}
        >
          <a
            href="/"
            style={{
              fontSize: '12px',
              color: 'var(--text-3)',
              transition: 'color var(--tr)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ width: '14px', height: '14px' }}
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Вернуться на сайт
          </a>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
