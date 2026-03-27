'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLogin, useRegister } from '@/hooks/useApi';
import { useAuthStore } from '@/store';

type AuthMode = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const login = useLogin();
  const register = useRegister();
  const { isAuthenticated } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Проверка авторизации в useEffect
  useEffect(() => {
    if (isAuthenticated) {
      setShouldRedirect(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/profile');
    }
  }, [shouldRedirect, router]);

  if (shouldRedirect) {
    return null;
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Введите email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен быть не менее 8 символов';
    }

    if (mode === 'register') {
      if (!formData.firstName) newErrors.firstName = 'Введите имя';
      if (!formData.lastName) newErrors.lastName = 'Введите фамилию';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Пароли не совпадают';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      if (mode === 'login') {
        await login.mutateAsync({ email: formData.email, password: formData.password });
      } else {
        await register.mutateAsync({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        });
      }
      router.push('/profile');
    } catch (err: unknown) {
      setErrors({ form: err instanceof Error ? err.message : 'Произошла ошибка' });
    }
  };

  return (
    <div
      className="auth-page"
      style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        className="auth-container"
        style={{
          width: '100%',
          maxWidth: '440px',
        }}
      >
        {/* Tabs */}
        <div
          className="auth-tabs"
          style={{
            display: 'flex',
            marginBottom: '24px',
            background: 'var(--black2)',
            border: '1px solid var(--gray1)',
            borderRadius: 'var(--radius)',
            padding: '4px',
          }}
        >
          <button
            onClick={() => setMode('login')}
            className={`auth-tab ${mode === 'login' ? 'is-active' : ''}`}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              textTransform: 'uppercase',
              borderRadius: 'var(--radius)',
              background: mode === 'login' ? 'var(--orange)' : 'transparent',
              color: mode === 'login' ? '#fff' : 'var(--gray4)',
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--tr)',
            }}
          >
            Вход
          </button>
          <button
            onClick={() => setMode('register')}
            className={`auth-tab ${mode === 'register' ? 'is-active' : ''}`}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              textTransform: 'uppercase',
              borderRadius: 'var(--radius)',
              background: mode === 'register' ? 'var(--orange)' : 'transparent',
              color: mode === 'register' ? '#fff' : 'var(--gray4)',
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--tr)',
            }}
          >
            Регистрация
          </button>
        </div>

        {/* Form */}
        <div
          className="auth-form"
          style={{
            background: 'var(--black2)',
            border: '1px solid var(--gray1)',
            borderRadius: 'var(--radius)',
            padding: '32px',
          }}
        >
          <h1
            style={{
              fontSize: '24px',
              marginBottom: '24px',
              color: 'var(--white2)',
              textAlign: 'center',
            }}
          >
            {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
          </h1>

          {errors.form && (
            <div
              style={{
                background: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid #f44336',
                borderRadius: 'var(--radius)',
                padding: '12px 16px',
                marginBottom: '20px',
                fontSize: '13px',
                color: '#f44336',
              }}
            >
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      color: 'var(--gray3)',
                      marginBottom: '6px',
                    }}
                  >
                    Имя *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={`input ${errors.firstName ? 'input--error' : ''}`}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'var(--black3)',
                      border: `1px solid ${errors.firstName ? 'var(--orange)' : 'var(--gray1)'}`,
                      borderRadius: 'var(--radius)',
                      color: 'var(--white)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                  {errors.firstName && (
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--orange)',
                        marginTop: '4px',
                        display: 'block',
                      }}
                    >
                      {errors.firstName}
                    </span>
                  )}
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      color: 'var(--gray3)',
                      marginBottom: '6px',
                    }}
                  >
                    Фамилия *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={`input ${errors.lastName ? 'input--error' : ''}`}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'var(--black3)',
                      border: `1px solid ${errors.lastName ? 'var(--orange)' : 'var(--gray1)'}`,
                      borderRadius: 'var(--radius)',
                      color: 'var(--white)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                  {errors.lastName && (
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--orange)',
                        marginTop: '4px',
                        display: 'block',
                      }}
                    >
                      {errors.lastName}
                    </span>
                  )}
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    color: 'var(--gray3)',
                    marginBottom: '6px',
                  }}
                >
                  Телефон
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+7 (___) ___-__-__"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'var(--black3)',
                    border: '1px solid var(--gray1)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--white)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: 'var(--gray3)',
                  marginBottom: '6px',
                }}
              >
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`input ${errors.email ? 'input--error' : ''}`}
                placeholder="example@mail.ru"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--black3)',
                  border: `1px solid ${errors.email ? 'var(--orange)' : 'var(--gray1)'}`,
                  borderRadius: 'var(--radius)',
                  color: 'var(--white)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              {errors.email && (
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--orange)',
                    marginTop: '4px',
                    display: 'block',
                  }}
                >
                  {errors.email}
                </span>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: 'var(--gray3)',
                  marginBottom: '6px',
                }}
              >
                Пароль *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`input ${errors.password ? 'input--error' : ''}`}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--black3)',
                  border: `1px solid ${errors.password ? 'var(--orange)' : 'var(--gray1)'}`,
                  borderRadius: 'var(--radius)',
                  color: 'var(--white)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              {errors.password && (
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--orange)',
                    marginTop: '4px',
                    display: 'block',
                  }}
                >
                  {errors.password}
                </span>
              )}
            </div>

            {mode === 'register' && (
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    color: 'var(--gray3)',
                    marginBottom: '6px',
                  }}
                >
                  Подтверждение пароля *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`input ${errors.confirmPassword ? 'input--error' : ''}`}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'var(--black3)',
                    border: `1px solid ${errors.confirmPassword ? 'var(--orange)' : 'var(--gray1)'}`,
                    borderRadius: 'var(--radius)',
                    color: 'var(--white)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                {errors.confirmPassword && (
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--orange)',
                      marginTop: '4px',
                      display: 'block',
                    }}
                  >
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            )}

            {mode === 'login' && (
              <div
                style={{
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <label
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <input type="checkbox" style={{ accentColor: 'var(--orange)' }} />
                  <span style={{ fontSize: '13px', color: 'var(--gray4)' }}>Запомнить меня</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  style={{ fontSize: '13px', color: 'var(--orange)', textDecoration: 'none' }}
                >
                  Забыли пароль?
                </Link>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={login.isPending || register.isPending}
              style={{
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
                border: 'none',
                cursor: login.isPending || register.isPending ? 'not-allowed' : 'pointer',
                opacity: login.isPending || register.isPending ? 0.7 : 1,
              }}
            >
              {login.isPending || register.isPending
                ? 'Загрузка...'
                : mode === 'login'
                  ? 'Войти'
                  : 'Зарегистрироваться'}
            </button>
          </form>

          <div
            style={{
              marginTop: '24px',
              textAlign: 'center',
              fontSize: '13px',
              color: 'var(--gray3)',
            }}
          >
            {mode === 'login' ? (
              <>
                Нет аккаунта?{' '}
                <button
                  onClick={() => setMode('register')}
                  style={{
                    color: 'var(--orange)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 'inherit',
                  }}
                >
                  Зарегистрироваться
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{' '}
                <button
                  onClick={() => setMode('login')}
                  style={{
                    color: 'var(--orange)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 'inherit',
                  }}
                >
                  Войти
                </button>
              </>
            )}
          </div>
        </div>

        {/* Social login */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'var(--gray3)', marginBottom: '16px' }}>
            Или войдите через соцсети
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              style={{
                width: '44px',
                height: '44px',
                background: 'var(--black2)',
                border: '1px solid var(--gray1)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gray4)',
                cursor: 'pointer',
                transition: 'var(--tr)',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ width: '20px', height: '20px' }}
              >
                <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.544-6.033-5.701s2.701-5.701 6.033-5.701c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.795-1.674-4.175-2.701-6.735-2.701-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-0.581z" />
              </svg>
            </button>
            <button
              style={{
                width: '44px',
                height: '44px',
                background: 'var(--black2)',
                border: '1px solid var(--gray1)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gray4)',
                cursor: 'pointer',
                transition: 'var(--tr)',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ width: '20px', height: '20px' }}
              >
                <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23 0.19 2.23 0.19v2.47h-1.26c-1.24 0-1.63 0.77-1.63 1.56v1.88h2.78l-0.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
              </svg>
            </button>
            <button
              style={{
                width: '44px',
                height: '44px',
                background: 'var(--black2)',
                border: '1px solid var(--gray1)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gray4)',
                cursor: 'pointer',
                transition: 'var(--tr)',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ width: '20px', height: '20px' }}
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-0.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h0.046c0.477-0.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-0.926-2.063-2.065 0-1.138 0.92-2.063 2.063-2.063 1.14 0 2.064 0.925 2.064 2.063 0 1.139-0.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C0.792 0 0 0.774 0 1.729v20.542C0 23.227 0.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 0.774 23.2 0 22.222 0h0.003z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
