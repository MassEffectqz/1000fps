'use client';

import { useState, useTransition, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { toast } from 'sonner';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const callbackUrl = searchParams.get('callbackUrl') || '/profile';

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (!res.ok) return;

        const data = await res.json();

        if (data?.user) {
          router.replace(callbackUrl);
          router.refresh();
        }
      } catch {
      }
    };

    checkSession();
  }, [router, callbackUrl]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: formData.email.toLowerCase(),
            password: formData.password,
            remember: formData.remember,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Ошибка при входе');
        }

        toast.success('Вход выполнен успешно!');
        router.replace(callbackUrl);
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Ошибка при входе';
        setErrors({ general: message });
        toast.error(message);
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <span className="font-display text-[28px] font-extrabold uppercase text-white2">
              1000<span className="text-orange">fps</span>
            </span>
          </Link>
          <h1 className="font-display text-[24px] font-extrabold uppercase text-white2 mb-2">
            Вход в аккаунт
          </h1>
          <p className="text-gray3 text-[14px]">Введите данные для входа</p>
        </div>

        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">
                Email
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@mail.ru"
                error={!!errors.email}
                disabled={isPending}
              />
              {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">
                Пароль
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={!!errors.password}
                disabled={isPending}
              />
              {errors.password && <p className="text-red-500 text-[11px] mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between text-[12px]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="w-4 h-4 accent-orange"
                  disabled={isPending}
                />
                <span className="text-gray3">Запомнить меня</span>
              </label>

              <Link href="#" className="text-orange hover:text-orange3">
                Забыли пароль?
              </Link>
            </div>

            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-[var(--radius)] p-3 text-[12px] text-red-500">
                {errors.general}
              </div>
            )}

            <Button type="submit" size="lg" fullWidth disabled={isPending}>
              {isPending ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          <div className="mt-6 text-center text-[13px] text-gray3">
            Нет аккаунта?{' '}
            <Link href="/register" className="text-orange hover:text-orange3 font-medium">
              Зарегистрироваться
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-[11px] text-gray3">
          <Link href="/" className="hover:text-orange">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-orange">Загрузка...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}