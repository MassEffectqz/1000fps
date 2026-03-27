'use client';

import { useState } from 'react';
import { useUsers, useDeleteUser } from '@/hooks/useApi';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'CUSTOMER';
  status: 'active' | 'inactive' | 'blocked';
  lastLogin: string;
}

const mockUsers: User[] = [
  {
    id: 1,
    name: 'Admin Adminov',
    email: 'admin@1000fps.ru',
    role: 'ADMIN',
    status: 'active',
    lastLogin: '2026-03-23 14:30',
  },
  {
    id: 2,
    name: 'Manager Managerov',
    email: 'manager@1000fps.ru',
    role: 'MANAGER',
    status: 'active',
    lastLogin: '2026-03-23 13:15',
  },
  {
    id: 3,
    name: 'Иван Петров',
    email: 'ivan@example.com',
    role: 'CUSTOMER',
    status: 'active',
    lastLogin: '2026-03-23 12:45',
  },
  {
    id: 4,
    name: 'Анна Смирнова',
    email: 'anna@example.com',
    role: 'CUSTOMER',
    status: 'active',
    lastLogin: '2026-03-23 11:20',
  },
  {
    id: 5,
    name: 'Дмитрий Козлов',
    email: 'dmitry@example.com',
    role: 'CUSTOMER',
    status: 'blocked',
    lastLogin: '2026-03-22 18:30',
  },
];

const roleConfig: Record<string, { label: string; class: string }> = {
  ADMIN: { label: 'Администратор', class: 'red' },
  MANAGER: { label: 'Менеджер', class: 'blue' },
  CUSTOMER: { label: 'Покупатель', class: 'muted' },
};

const statusConfig: Record<string, { label: string; class: string }> = {
  active: { label: 'Активен', class: 'green' },
  inactive: { label: 'Неактивен', class: 'muted' },
  blocked: { label: 'Заблокирован', class: 'red' },
};

export default function UsersPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // API hooks
  const { data: usersData, isLoading: usersLoading } = useUsers();
  const deleteUser = useDeleteUser();

  const users: User[] = (usersData as unknown as { users?: User[] })?.users || mockUsers;

  const filteredUsers = users.filter((user: User) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const openCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Удалить пользователя?')) {
      deleteUser.mutate(id);
    }
  };

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-c gap-10 mb-16" style={{ justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            Пользователи
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>
            Управление пользователями и ролями
          </p>
        </div>
        <button className="btn btn--primary" onClick={openCreate}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="14"
            height="14"
          >
            <path d="M12 4v16m8-8H4" />
          </svg>
          Добавить пользователя
        </button>
      </div>

      {/* STATS */}
      <div className="stats-grid mb-16" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-val" style={{ fontSize: '20px' }}>
            {users.length}
          </div>
          <div className="stat-label">Всего</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ fontSize: '20px', color: 'var(--green)' }}>
            {users.filter((u) => (u.status as string) === 'active').length}
          </div>
          <div className="stat-label">Активны</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ fontSize: '20px', color: 'var(--blue)' }}>
            {users.filter((u) => (u.role as string) === 'ADMIN' || (u.role as string) === 'MANAGER').length}
          </div>
          <div className="stat-label">Персонал</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ fontSize: '20px', color: 'var(--red)' }}>
            {users.filter((u) => (u.status as string) === 'blocked').length}
          </div>
          <div className="stat-label">Заблокированы</div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card mb-16">
        <div className="card__body" style={{ padding: '14px 18px' }}>
          <div className="flex flex-c gap-10" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div className="header-search" style={{ width: '100%' }}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ width: '13px', height: '13px' }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Поиск по имени или email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div style={{ width: '200px' }}>
              <select
                className="form-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">Все роли</option>
                <option value="ADMIN">Администраторы</option>
                <option value="MANAGER">Менеджеры</option>
                <option value="CUSTOMER">Покупатели</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="card__head">
          <span className="card__title">Пользователи ({filteredUsers.length})</span>
        </div>
        <div className="card__body card__body--flush">
          {usersLoading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-3)' }}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  width: '32px',
                  height: '32px',
                  margin: '0 auto 16px',
                  animation: 'spin 1s linear infinite',
                }}
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              Загрузка...
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Пользователь</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Статус</th>
                  <th>Последний вход</th>
                  <th style={{ width: '80px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex flex-c gap-10">
                        <div
                          className="user-ava"
                          style={{ width: '32px', height: '32px', fontSize: '12px' }}
                        >
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div className="text-white fw700">{user.name}</div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge badge--${roleConfig[user.role].class}`}>
                        {roleConfig[user.role].label}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge--${statusConfig[user.status].class}`}>
                        <span className="badge-dot" />
                        {statusConfig[user.status].label}
                      </span>
                    </td>
                    <td className="mono f11">{user.lastLogin}</td>
                    <td>
                      <div className="flex gap-6">
                        <button className="tbl-btn" onClick={() => openEdit(user)}>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            width="12"
                            height="12"
                          >
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="tbl-btn tbl-btn--danger"
                          onClick={() => handleDelete(user.id)}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            width="12"
                            height="12"
                          >
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
