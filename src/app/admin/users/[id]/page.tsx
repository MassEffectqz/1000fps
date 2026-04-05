'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  avatar?: string | null;
  role: string;
  level: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  addresses: {
    id: string;
    name?: string | null;
    city: string;
    street: string;
    building: string;
    apartment?: string | null;
    postalCode?: string | null;
    phone?: string | null;
    isDefault: boolean;
  }[];
  orders: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
  reviews: {
    id: string;
    rating: number;
    text: string;
    createdAt: string;
    product: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
}

const roleOptions = [
  { value: 'CUSTOMER', label: 'Клиент' },
  { value: 'MANAGER', label: 'Менеджер' },
  { value: 'ADMIN', label: 'Админ' },
];

const levelOptions = [
  { value: 'BRONZE', label: 'Бронзовый' },
  { value: 'SILVER', label: 'Серебряный' },
  { value: 'GOLD', label: 'Золотой' },
  { value: 'PLATINUM', label: 'Платиновый' },
];

interface AdminUserPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminUserPage({ params }: AdminUserPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: '',
    phone: '',
    role: '',
    level: '',
    emailVerified: false,
  });

  const loadUser = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/users/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setEditedData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          role: data.user.role,
          level: data.user.level,
          emailVerified: data.user.emailVerified,
        });
      } else {
        toast.error('Пользователь не найден');
        router.push('/admin/users');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      toast.error('Ошибка загрузки пользователя');
    } finally {
      setIsLoading(false);
    }
  }, [resolvedParams.id, router]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/admin/users/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsEditing(false);
        toast.success('Данные пользователя обновлены');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка обновления');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Произошла ошибка при обновлении');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Удалить пользователя ${user?.email}? Это действие нельзя отменить.`)) return;

    try {
      const response = await fetch(`/api/admin/users/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Пользователь удалён');
        router.push('/admin/users');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка удаления');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Произошла ошибка при удалении');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center text-gray4">
          <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div>Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-12 text-center">
          <div className="text-[16px] font-semibold text-white mb-2">Пользователь не найден</div>
          <Link href="/admin/users" className="text-orange hover:underline">
            ← Вернуться к списку
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin/users" className="text-gray4 hover:text-orange transition-colors">
              ← Назад
            </Link>
            <h1 className="font-display text-[20px] font-bold text-white">{user.name || 'Без имени'}</h1>
          </div>
          <p className="text-[13px] text-gray4">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-[8px] bg-black3 border border-gray1 rounded-[var(--radius)] text-[13px] text-white font-semibold hover:border-orange transition-colors"
          >
            {isEditing ? 'Отмена' : 'Редактировать'}
          </button>
          {isEditing && (
            <button
              onClick={handleUpdate}
              className="px-4 py-[8px] bg-orange rounded-[var(--radius)] text-[13px] text-white font-semibold hover:bg-orange2 transition-colors"
            >
              Сохранить
            </button>
          )}
          <button
            onClick={handleDelete}
            className="px-4 py-[8px] bg-black3 border border-gray1 rounded-[var(--radius)] text-[13px] text-red-500 font-semibold hover:border-red-500 transition-colors"
          >
            Удалить
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="col-span-2 space-y-6">
          {/* Профиль */}
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
            <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
              Профиль
            </h2>
            <div className="flex items-start gap-6">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name || ''}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-orange flex items-center justify-center font-display text-[28px] font-bold text-white">
                  {(user.name || user.email)[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 space-y-3">
                <div>
                  <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Имя</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.name}
                      onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                      className="w-full max-w-md bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                    />
                  ) : (
                    <div className="text-[13px] text-white font-semibold">{user.name || 'Не указано'}</div>
                  )}
                </div>
                <div>
                  <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Email</div>
                  <div className="text-[13px] text-white">
                    {user.email}
                    {user.emailVerified && (
                      <span className="ml-2 text-[9px] text-green-500">✓ Подтверждён</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Телефон</div>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedData.phone}
                      onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                      className="w-full max-w-md bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                    />
                  ) : (
                    <div className="text-[13px] text-white">{user.phone || 'Не указан'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Адреса */}
          {user.addresses.length > 0 && (
            <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
              <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
                Адреса ({user.addresses.length})
              </h2>
              <div className="space-y-3">
                {user.addresses.map((address) => (
                  <div key={address.id} className="p-4 bg-black3 rounded-[var(--radius)]">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[13px] text-white font-semibold mb-1">
                          {address.name || 'Адрес'}
                          {address.isDefault && (
                            <span className="ml-2 text-[9px] bg-orange/20 text-orange px-2 py-[2px] rounded">
                              Основной
                            </span>
                          )}
                        </div>
                        <div className="text-[12px] text-gray4">
                          {address.city}, {address.street}, {address.building}
                          {address.apartment && `, ${address.apartment}`}
                          {address.postalCode && `, ${address.postalCode}`}
                        </div>
                        {address.phone && (
                          <div className="text-[12px] text-gray4 mt-1">{address.phone}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Отзывы */}
          {user.reviews.length > 0 && (
            <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
              <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
                Отзывы ({user.reviews.length})
              </h2>
              <div className="space-y-3">
                {user.reviews.map((review) => (
                  <div key={review.id} className="p-4 bg-black3 rounded-[var(--radius)]">
                    <div className="flex items-start justify-between mb-2">
                      <Link
                        href={`/product/${review.product.slug}`}
                        className="text-[13px] text-white font-semibold hover:text-orange transition-colors"
                      >
                        {review.product.name}
                      </Link>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            viewBox="0 0 24 24"
                            fill={i < review.rating ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="2"
                            className={cn('w-4 h-4', i < review.rating ? 'text-yellow-500' : 'text-gray-600')}
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <div className="text-[12px] text-gray4 mb-2">{review.text}</div>
                    <div className="text-[10px] text-gray5">
                      {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Статус */}
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
            <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
              Статус
            </h2>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Роль</div>
                {isEditing ? (
                  <select
                    value={editedData.role}
                    onChange={(e) => setEditedData({ ...editedData, role: e.target.value })}
                    className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-[13px] text-white font-semibold">{user.role}</div>
                )}
              </div>
              <div>
                <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Уровень</div>
                {isEditing ? (
                  <select
                    value={editedData.level}
                    onChange={(e) => setEditedData({ ...editedData, level: e.target.value })}
                    className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                  >
                    {levelOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-[13px] text-white font-semibold">{user.level}</div>
                )}
              </div>
              <div>
                <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Email подтверждён</div>
                {isEditing ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedData.emailVerified}
                      onChange={(e) => setEditedData({ ...editedData, emailVerified: e.target.checked })}
                      className="w-4 h-4 accent-orange"
                    />
                    <span className="text-[13px] text-white">Да</span>
                  </label>
                ) : (
                  <div className={cn('text-[13px]', user.emailVerified ? 'text-green-500' : 'text-gray-400')}>
                    {user.emailVerified ? 'Да' : 'Нет'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Заказы */}
          {user.orders.length > 0 && (
            <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
              <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
                Последние заказы
              </h2>
              <div className="space-y-2">
                {user.orders.slice(0, 5).map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="block p-3 bg-black3 rounded-[var(--radius)] hover:bg-black4 transition-colors"
                  >
                    <div className="text-[12px] text-orange font-bold mb-1">{order.orderNumber}</div>
                    <div className="flex items-center justify-between text-[11px] text-gray4">
                      <span>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                      <span>{order.total.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  </Link>
                ))}
              </div>
              {user.orders.length > 5 && (
                <div className="text-[11px] text-gray4 mt-3 pt-3 border-t border-gray1">
                  + ещё {user.orders.length - 5} заказов
                </div>
              )}
            </div>
          )}

          {/* Информация */}
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
            <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
              Информация
            </h2>
            <div className="space-y-3 text-[12px]">
              <div>
                <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Создан</div>
                <div className="text-white">
                  {new Date(user.createdAt).toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray3 uppercase tracking-wider mb-1">Обновлён</div>
                <div className="text-white">
                  {new Date(user.updatedAt).toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
