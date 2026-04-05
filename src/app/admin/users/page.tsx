'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';

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
  _count: {
    orders: number;
  };
  addresses?: {
    id: string;
    city: string;
    street: string;
    building: string;
    isDefault: boolean;
  }[];
}

const roleConfig: Record<string, { label: string; class: string }> = {
  CUSTOMER: { label: 'Клиент', class: 'bg-gray-500/10 text-gray-400' },
  ADMIN: { label: 'Админ', class: 'bg-red-500/10 text-red-500' },
  MANAGER: { label: 'Менеджер', class: 'bg-blue-500/10 text-blue-500' },
};

const levelConfig: Record<string, { label: string; class: string }> = {
  BRONZE: { label: 'Бронзовый', class: 'bg-amber-700/20 text-amber-600' },
  SILVER: { label: 'Серебряный', class: 'bg-gray-400/20 text-gray-400' },
  GOLD: { label: 'Золотой', class: 'bg-yellow-500/20 text-yellow-500' },
  PLATINUM: { label: 'Платиновый', class: 'bg-cyan-400/20 text-cyan-400' },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadUsers(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, roleFilter, levelFilter]);

  const loadUsers = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(roleFilter && { role: roleFilter }),
        ...(levelFilter && { level: levelFilter }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
        setTotalUsers(data.total || 0);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadUsers(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setRoleFilter('');
    setLevelFilter('');
    setCurrentPage(1);
    loadUsers(1);
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Удалить пользователя ${email}? Это действие нельзя отменить.`)) return;

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Пользователь удалён');
        loadUsers(currentPage);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка удаления');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Произошла ошибка при удалении');
    }
  };

  const handleResetPassword = async (id: string, email: string) => {
    if (!confirm(`Сбросить пароль для ${email}? Временный пароль будет показан в уведомлении.`)) return;

    try {
      const response = await fetch(`/api/admin/users/${id}/reset-password`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Временный пароль: ${data.temporaryPassword}`, {
          duration: 10000,
        });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка сброса пароля');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Произошла ошибка при сбросе пароля');
    }
  };

  const activeFiltersCount = [roleFilter, levelFilter].filter(Boolean).length;

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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-[20px] font-bold text-white mb-1">Пользователи</h1>
          <p className="text-[13px] text-gray4">Управление клиентами и правами доступа</p>
        </div>
        <div className="text-[13px] text-gray4">
          Всего: <span className="text-white font-bold">{totalUsers}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
              Поиск
            </label>
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray3">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Email, имя, телефон"
                className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] pl-10 pr-4 py-[8px] text-white text-[13px] outline-none focus:border-orange transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
              Роль
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange min-w-[140px]"
            >
              <option value="">Все роли</option>
              <option value="CUSTOMER">Клиент</option>
              <option value="MANAGER">Менеджер</option>
              <option value="ADMIN">Админ</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
              Уровень
            </label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange min-w-[140px]"
            >
              <option value="">Все уровни</option>
              <option value="BRONZE">Бронзовый</option>
              <option value="SILVER">Серебряный</option>
              <option value="GOLD">Золотой</option>
              <option value="PLATINUM">Платиновый</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="px-4 py-[8px] bg-orange rounded-[var(--radius)] text-[13px] text-white font-semibold hover:bg-orange2 transition-colors"
            >
              Найти
            </button>
            <button
              onClick={handleResetFilters}
              className="px-4 py-[8px] bg-black3 border border-gray1 rounded-[var(--radius)] text-[13px] text-gray4 font-semibold hover:text-white hover:border-gray2 transition-colors relative"
            >
              Сбросить
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-black2 border border-gray1 rounded-[var(--radius)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray1">
                <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Клиент</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Роль</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Уровень</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Заказы</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Email</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Телефон</th>
                <th className="text-right px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray1 last:border-b-0 hover:bg-black3 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name || ''}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-orange flex items-center justify-center font-display text-[12px] font-bold text-white">
                            {(user.name || user.email)[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="text-[13px] font-bold text-white hover:text-orange transition-colors"
                          >
                            {user.name || 'Без имени'}
                          </Link>
                          <div className="text-[10px] text-gray4">
                            {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-[10px] font-bold px-[8px] py-[3px] rounded-[var(--radius)]',
                        roleConfig[user.role]?.class || roleConfig.CUSTOMER.class
                      )}>
                        {roleConfig[user.role]?.label || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-[10px] font-bold px-[8px] py-[3px] rounded-[var(--radius)]',
                        levelConfig[user.level]?.class || levelConfig.BRONZE.class
                      )}>
                        {levelConfig[user.level]?.label || user.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[13px] text-gray4">{user._count.orders}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[13px] text-gray4">{user.email}</div>
                      {user.emailVerified && (
                        <span className="text-[9px] text-green-500">✓ Подтверждён</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[13px] text-gray4">{user.phone || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-[6px]">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="w-7 h-7 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray4 transition-colors hover:border-orange hover:text-orange"
                          title="Просмотр"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[13px] h-[13px]">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleResetPassword(user.id, user.email)}
                          className="w-7 h-7 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray4 transition-colors hover:border-yellow-500 hover:text-yellow-500"
                          title="Сбросить пароль"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[13px] h-[13px]">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.email)}
                          className="w-7 h-7 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray4 transition-colors hover:border-red-500 hover:text-red-500"
                          title="Удалить"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[13px] h-[13px]">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 mx-auto mb-3 opacity-50">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <div>Пользователей не найдено</div>
                    <div className="text-[12px] mt-1">Измените параметры поиска или фильтры</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
