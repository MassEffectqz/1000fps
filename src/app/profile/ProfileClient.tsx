'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Breadcrumbs, Button, Input, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Типы
interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  role: 'CUSTOMER' | 'ADMIN' | 'MANAGER';
  level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: { url: string }[];
  };
}

interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    oldPrice?: number | null;
    images: { url: string }[];
  };
}

interface Address {
  id: string;
  name: string | null;
  city: string;
  street: string;
  building: string;
  apartment: string | null;
  postalCode: string | null;
  phone: string | null;
  isDefault: boolean;
}

interface ConfigItem {
  id: string;
  categoryId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    images: { url: string }[];
  };
}

interface Configuration {
  id: string;
  name: string | null;
  isPreset: boolean;
  presetType?: string | null;
  total: number;
  power: number;
  isPublic: boolean;
  shareCode?: string | null;
  items: ConfigItem[];
  createdAt: string;
  updatedAt: string;
}

type TabId = 'overview' | 'orders' | 'wishlist' | 'configs' | 'addresses' | 'settings';

interface ProfileClientProps {
  initialUser: User;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Обзор' },
  { id: 'orders', label: 'Заказы' },
  { id: 'wishlist', label: 'Избранное' },
  { id: 'configs', label: 'Сборки' },
  { id: 'addresses', label: 'Адреса' },
  { id: 'settings', label: 'Настройки' },
];

const LEVEL_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  BRONZE: { color: 'text-orange-400', bg: 'bg-orange-400/10', label: 'Bronze' },
  SILVER: { color: 'text-gray-300', bg: 'bg-gray-300/10', label: 'Silver' },
  GOLD: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Gold' },
  PLATINUM: { color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Platinum' },
};

export default function ProfileClient({ initialUser }: ProfileClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Данные
  const [user, setUser] = useState<User>(initialUser);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [configs, setConfigs] = useState<Configuration[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Состояния для форм
  const [profileForm, setProfileForm] = useState({
    name: initialUser.name || '',
    phone: initialUser.phone || '',
    avatar: initialUser.avatar || '',
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [addressForm, setAddressForm] = useState<Partial<Address>>({});
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Синхронизация формы с initialUser при изменении
  useEffect(() => {
    setProfileForm({
      name: initialUser.name || '',
      phone: initialUser.phone || '',
      avatar: initialUser.avatar || '',
    });
  }, [initialUser]);

  // Загрузка заказов
  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/profile/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Load orders error:', error);
    }
  }, []);

  // Загрузка вишлиста
  const loadWishlist = useCallback(async () => {
    try {
      const res = await fetch('/api/profile/wishlist');
      if (res.ok) {
        const data = await res.json();
        setWishlistItems(data.items || []);
      }
    } catch (error) {
      console.error('Load wishlist error:', error);
    }
  }, []);

  // Загрузка сборок
  const loadConfigs = useCallback(async () => {
    try {
      const res = await fetch('/api/profile/configs');
      if (res.ok) {
        const data = await res.json();
        setConfigs(data.configs || []);
      }
    } catch (error) {
      console.error('Load configs error:', error);
    }
  }, []);

  // Загрузка адресов
  const loadAddresses = useCallback(async () => {
    try {
      const res = await fetch('/api/profile/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error('Load addresses error:', error);
    }
  }, []);

  // Загрузка данных при смене вкладки
  useEffect(() => {
    if (activeTab === 'orders') loadOrders();
    if (activeTab === 'wishlist') loadWishlist();
    if (activeTab === 'configs') loadConfigs();
    if (activeTab === 'addresses') loadAddresses();
  }, [activeTab, loadOrders, loadWishlist, loadConfigs, loadAddresses]);

  // Logout
  const handleLogout = async () => {
    startTransition(async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        toast.success('Выход выполнен');
        window.location.href = '/';
      } catch {
        toast.error('Ошибка при выходе');
      }
    });
  };

  // Обновление профиля
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileForm),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Ошибка обновления');
        }

        const data = await res.json();
        setUser(data.user);
        toast.success('Профиль обновлён');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Ошибка обновления профиля';
        toast.error(message);
      }
    });
  };

  // Смена пароля
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/profile/change-password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Ошибка смены пароля');
        }

        toast.success('Пароль изменён');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Ошибка смены пароля';
        toast.error(message);
      }
    });
  };

  // Сохранение адреса
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const method = editingAddressId ? 'PUT' : 'POST';
        const url = editingAddressId
          ? `/api/profile/addresses/${editingAddressId}`
          : '/api/profile/addresses';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addressForm),
        });

        if (!res.ok) throw new Error('Ошибка сохранения адреса');

        await loadAddresses();
        setAddressForm({});
        setEditingAddressId(null);
        toast.success(editingAddressId ? 'Адрес обновлён' : 'Адрес добавлен');
      } catch {
        toast.error('Ошибка сохранения адреса');
      }
    });
  };

  // Удаление адреса
  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/profile/addresses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Ошибка удаления');
      await loadAddresses();
      toast.success('Адрес удалён');
    } catch {
      toast.error('Ошибка удаления адреса');
    }
  };

  // Удаление из вишлиста
  const handleRemoveFromWishlist = async (id: string) => {
    try {
      const res = await fetch(`/api/profile/wishlist/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Ошибка удаления');
      setWishlistItems((prev) => prev.filter((item) => item.id !== id));
      toast.success('Удалено из избранного');
    } catch {
      toast.error('Ошибка удаления из избранного');
    }
  };

  // Удаление сборки
  const handleDeleteConfig = async (id: string) => {
    try {
      const res = await fetch(`/api/profile/configs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Ошибка удаления');
      setConfigs((prev) => prev.filter((c) => c.id !== id));
      toast.success('Сборка удалена');
    } catch {
      toast.error('Ошибка удаления сборки');
    }
  };

  // Удаление аккаунта
  const handleDeleteAccount = async () => {
    if (!confirm('Вы уверены? Это действие нельзя отменить.')) return;

    startTransition(async () => {
      try {
        const res = await fetch('/api/profile', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ confirm: true }),
        });

        if (!res.ok) throw new Error('Ошибка удаления');

        toast.success('Аккаунт удалён');
        router.push('/');
        router.refresh();
      } catch {
        toast.error('Ошибка удаления аккаунта');
      }
    });
  };

  const levelInfo = LEVEL_CONFIG[user.level] || LEVEL_CONFIG.BRONZE;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Профиль' }]} />

      <div className="mt-6 flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gray1 flex items-center justify-center mb-3">
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name || ''} width={80} height={80} className="rounded-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-gray3">{(user.name || user.email)[0].toUpperCase()}</span>
                )}
              </div>
              <h2 className="font-display text-[18px] font-bold uppercase text-white2 truncate">{user.name || 'Пользователь'}</h2>
              <p className="text-gray3 text-[12px] truncate">{user.email}</p>
              <Badge className={cn('mt-2', levelInfo.bg, levelInfo.color)}>{levelInfo.label}</Badge>
            </div>

            <nav className="flex flex-col gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-3 py-2 rounded-[var(--radius)] text-left text-[13px] font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-orange/10 text-orange'
                      : 'text-gray3 hover:text-white2 hover:bg-gray1'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={handleLogout}>
              Выйти
            </Button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h1 className="font-display text-[24px] font-extrabold uppercase text-white2">Обзор</h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Заказы', value: orders.length.toString(), tab: 'orders' as TabId },
                  { label: 'Избранное', value: wishlistItems.length.toString(), tab: 'wishlist' as TabId },
                  { label: 'Сборки', value: configs.length.toString(), tab: 'configs' as TabId },
                  { label: 'Адреса', value: addresses.length.toString(), tab: 'addresses' as TabId },
                ].map((stat) => (
                  <button
                    key={stat.label}
                    onClick={() => setActiveTab(stat.tab)}
                    className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4 text-left hover:border-orange/30 transition-colors"
                  >
                    <p className="text-gray3 text-[12px] uppercase tracking-wider">{stat.label}</p>
                    <p className="font-display text-[28px] font-bold text-white2 mt-1">{stat.value}</p>
                  </button>
                ))}
              </div>

              <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6">
                <h3 className="font-display text-[16px] font-bold uppercase text-white2 mb-4">Информация об аккаунте</h3>
                <dl className="space-y-3 text-[13px]">
                  <div className="flex justify-between">
                    <dt className="text-gray3">Email</dt>
                    <dd className="text-white2">{user.email}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray3">Имя</dt>
                    <dd className="text-white2">{user.name || '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray3">Телефон</dt>
                    <dd className="text-white2">{user.phone || '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray3">Уровень</dt>
                    <dd className={levelInfo.color}>{levelInfo.label}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray3">Дата регистрации</dt>
                    <dd className="text-white2">{new Date(user.createdAt).toLocaleDateString('ru-RU')}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h1 className="font-display text-[24px] font-extrabold uppercase text-white2">Заказы</h1>
              {orders.length === 0 ? (
                <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-8 text-center">
                  <p className="text-gray3 text-[14px]">У вас пока нет заказов</p>
                  <Link href="/catalog">
                    <Button size="lg" className="mt-4">Перейти в каталог</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-white2 font-medium">Заказ #{order.orderNumber}</p>
                          <p className="text-gray3 text-[12px]">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
                        </div>
                        <Badge variant={order.status === 'DELIVERED' ? 'green' : order.status === 'CANCELLED' ? 'red' : 'blue'}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray3 text-[13px]">{order.items.length} товар(ов)</p>
                        <p className="text-white2 font-bold">{order.total.toLocaleString('ru-RU')} ₽</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h1 className="font-display text-[24px] font-extrabold uppercase text-white2">Избранное</h1>
              {wishlistItems.length === 0 ? (
                <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-8 text-center">
                  <p className="text-gray3 text-[14px]">Список избранного пуст</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4 flex items-center justify-between">
                      <Link href={`/product/${item.product.slug}`} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray1 rounded-[var(--radius)] flex items-center justify-center flex-shrink-0">
                          {item.product.images?.[0]?.url ? (
                            <Image src={item.product.images[0].url} alt={item.product.name} width={64} height={64} className="object-contain rounded-[var(--radius)]" />
                          ) : (
                            <span className="text-gray3 text-[10px]">Нет фото</span>
                          )}
                        </div>
                        <div>
                          <p className="text-white2 text-[14px] font-medium">{item.product.name}</p>
                          <p className="text-orange font-bold">{item.product.price.toLocaleString('ru-RU')} ₽</p>
                        </div>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveFromWishlist(item.id)}>Удалить</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Configs */}
          {activeTab === 'configs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-[24px] font-extrabold uppercase text-white2">Сборки</h1>
                <Link href="/configurator">
                  <Button size="sm">Создать сборку</Button>
                </Link>
              </div>
              {configs.length === 0 ? (
                <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-8 text-center">
                  <p className="text-gray3 text-[14px]">У вас пока нет сборок</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {configs.map((config) => (
                    <div key={config.id} className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white2 font-medium">{config.name || `Сборка ${config.id.slice(0, 8)}`}</p>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteConfig(config.id)}>Удалить</Button>
                      </div>
                      <div className="flex items-center gap-4 text-[13px] text-gray3">
                        <span>{config.items.length} компонент(ов)</span>
                        <span className="text-orange font-bold">{config.total.toLocaleString('ru-RU')} ₽</span>
                        {config.isPublic && <Badge>Публичная</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <h1 className="font-display text-[24px] font-extrabold uppercase text-white2">Адреса доставки</h1>

              {/* Address form */}
              <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6">
                <h3 className="font-display text-[16px] font-bold uppercase text-white2 mb-4">
                  {editingAddressId ? 'Редактировать адрес' : 'Добавить адрес'}
                </h3>
                <form onSubmit={handleSaveAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">Город</label>
                    <Input
                      value={addressForm.city || ''}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">Улица</label>
                    <Input
                      value={addressForm.street || ''}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, street: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">Дом</label>
                    <Input
                      value={addressForm.building || ''}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, building: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">Квартира</label>
                    <Input
                      value={addressForm.apartment || ''}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, apartment: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">Индекс</label>
                    <Input
                      value={addressForm.postalCode || ''}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, postalCode: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">Телефон</label>
                    <Input
                      value={addressForm.phone || ''}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={addressForm.isDefault || false}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                      className="w-4 h-4 accent-orange"
                    />
                    <label htmlFor="isDefault" className="text-[13px] text-gray3">Основной адрес</label>
                  </div>
                  <div className="sm:col-span-2 flex gap-2">
                    <Button type="submit" size="sm" disabled={isPending}>
                      {editingAddressId ? 'Сохранить' : 'Добавить'}
                    </Button>
                    {editingAddressId && (
                      <Button type="button" variant="outline" size="sm" onClick={() => { setEditingAddressId(null); setAddressForm({}); }}>
                        Отмена
                      </Button>
                    )}
                  </div>
                </form>
              </div>

              {/* Address list */}
              {addresses.length > 0 && (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white2 font-medium">
                              {addr.city}, {addr.street} {addr.building}
                              {addr.apartment && `, кв. ${addr.apartment}`}
                            </p>
                            {addr.isDefault && <Badge>Основной</Badge>}
                          </div>
                          {addr.postalCode && <p className="text-gray3 text-[12px] mt-1">{addr.postalCode}</p>}
                          {addr.phone && <p className="text-gray3 text-[12px]">{addr.phone}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setEditingAddressId(addr.id); setAddressForm(addr); }}
                          >
                            Изменить
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteAddress(addr.id)}>Удалить</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h1 className="font-display text-[24px] font-extrabold uppercase text-white2">Настройки</h1>

              {/* Profile form */}
              <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6">
                <h3 className="font-display text-[16px] font-bold uppercase text-white2 mb-4">Профиль</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">Email</label>
                    <Input value={user.email} disabled />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">Имя</label>
                    <Input
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">Телефон</label>
                    <Input
                      value={profileForm.phone || ''}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">URL аватара</label>
                    <Input
                      value={profileForm.avatar || ''}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, avatar: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  <Button type="submit" size="sm" disabled={isPending}>
                    {isPending ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                </form>
              </div>

              {/* Password form */}
              <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6">
                <h3 className="font-display text-[16px] font-bold uppercase text-white2 mb-4">Смена пароля</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">Текущий пароль</label>
                    <Input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">Новый пароль</label>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">Подтверждение пароля</label>
                    <Input
                      type="password"
                      value={passwordForm.confirmNewPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmNewPassword: e.target.value }))}
                    />
                  </div>
                  <Button type="submit" size="sm" disabled={isPending}>
                    {isPending ? 'Изменение...' : 'Изменить пароль'}
                  </Button>
                </form>
              </div>

              {/* Delete account */}
              <div className="bg-red-500/5 border border-red-500/20 rounded-[var(--radius)] p-6">
                <h3 className="font-display text-[16px] font-bold uppercase text-red-500 mb-2">Опасная зона</h3>
                <p className="text-gray3 text-[13px] mb-4">Удаление аккаунта необратимо. Все данные будут потеряны.</p>
                <Button variant="danger" size="sm" onClick={handleDeleteAccount}>
                  Удалить аккаунт
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
