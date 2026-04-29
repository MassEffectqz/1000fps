'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { toast } from 'sonner';

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  agree?: string;
  general?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agree: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

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
          router.replace('/profile');
          router.refresh();
        }
      } catch {
      }
    };

    checkSession();
  }, [router]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Имя должно быть не менее 2 символов';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (!formData.agree) {
      newErrors.agree = 'Необходимо согласие на обработку данных';
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
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: formData.name,
            email: formData.email.toLowerCase(),
            phone: formData.phone || null,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Ошибка при регистрации');
        }

        toast.success('Регистрация успешна!');
        router.replace('/profile');
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Ошибка при регистрации';
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
            Регистрация
          </h1>
          <p className="text-gray3 text-[14px]">Создайте аккаунт для покупок</p>
        </div>

        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">
                Имя
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Иван"
                error={!!errors.name}
                disabled={isPending}
              />
              {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
            </div>

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
                Телефон (необязательно)
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+7 (999) 000-00-00"
                error={!!errors.phone}
                disabled={isPending}
              />
              {errors.phone && <p className="text-red-500 text-[11px] mt-1">{errors.phone}</p>}
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

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">
                Подтверждение пароля
              </label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                error={!!errors.confirmPassword}
                disabled={isPending}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-[11px] mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="text-[11px] text-gray3">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="agree"
                  checked={formData.agree}
                  onChange={handleChange}
                  className="w-4 h-4 accent-orange mt-0.5"
                  disabled={isPending}
                />
                <span>
                  Я согласен с{' '}
                  <Link href="#" className="text-orange underline">
                    условиями обработки персональных данных
                  </Link>
                </span>
              </label>
              {errors.agree && <p className="text-red-500 text-[11px] mt-1">{errors.agree}</p>}
            </div>

            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-[var(--radius)] p-3 text-[12px] text-red-500">
                {errors.general}
              </div>
            )}

            <Button type="submit" size="lg" fullWidth disabled={isPending}>
              {isPending ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </form>

          <div className="mt-6 text-center text-[13px] text-gray3">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-orange hover:text-orange3 font-medium">
              Войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}