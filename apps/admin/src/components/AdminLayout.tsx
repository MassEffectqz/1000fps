'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavItem {
  section: string;
  items: Array<{
    name: string;
    panel: string;
    icon: string;
    badge?: number;
  }>;
}

const navigation: NavItem[] = [
  {
    section: 'Основное',
    items: [
      {
        name: 'Дашборд',
        panel: 'dashboard',
        icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
      },
    ],
  },
  {
    section: 'Товары',
    items: [
      {
        name: 'Товары',
        panel: 'products',
        icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
        badge: 247,
      },
      {
        name: 'Категории',
        panel: 'categories',
        icon: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
      },
      { name: 'Галерея', panel: 'gallery', icon: 'M3 3h18v18H3zM8.5 8.5l1.5-1.5M16 16l-4-4-6 6' },
    ],
  },
  {
    section: 'Продажи',
    items: [
      {
        name: 'Заказы',
        panel: 'orders',
        icon: 'M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0',
        badge: 12,
      },
      { name: 'Аналитика', panel: 'analytics', icon: 'M18 20V10M12 20V4M6 20v-6' },
      { name: 'История цен', panel: 'price-history', icon: 'M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6' },
    ],
  },
  {
    section: 'Управление',
    items: [
      { name: 'Склады', panel: 'warehouses', icon: 'M3 21h18M5 21V7l8-4 8 4v14M8 21v-4h8v4' },
      {
        name: 'Конфигурация',
        panel: 'configuration',
        icon: 'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
      },
    ],
  },
  {
    section: 'Дополнительно',
    items: [
      {
        name: 'Пользователи',
        panel: 'users',
        icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
      },
      {
        name: 'Логи',
        panel: 'logs',
        icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
      },
    ],
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  activePanel: string;
  onPanelChange: (panel: string) => void;
}

export default function AdminLayout({ children, activePanel, onPanelChange }: AdminLayoutProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser] = useState({ name: 'Admin', email: 'admin@1000fps.ru', role: 'admin' });

  const handleLogout = () => {
    router.push('/admin/login');
  };

  const handleNavClick = (panel: string) => {
    onPanelChange(panel);
  };

  // Обновляем заголовок страницы
  const panelTitles: Record<string, string> = {
    dashboard: 'Дашборд',
    products: 'Товары',
    categories: 'Категории',
    gallery: 'Галерея',
    orders: 'Заказы',
    analytics: 'Аналитика',
    'price-history': 'История цен',
    warehouses: 'Склады',
    configuration: 'Конфигурация',
    users: 'Пользователи',
    logs: 'Логи',
  };

  const pageTitle = panelTitles[activePanel] || 'Панель управления';

  return (
    <div className="layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="logo-text">
            1000<span>fps</span>
          </span>
        </div>

        <nav className="nav">
          {navigation.map((section, idx) => (
            <div key={idx}>
              <div className="nav-section">{section.section}</div>
              {section.items.map((item) => (
                <a
                  key={item.panel}
                  href="#"
                  className={`nav-item ${activePanel === item.panel ? 'is-active' : ''}`}
                  data-panel={item.panel}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.panel);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={item.icon} />
                  </svg>
                  {item.name}
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </a>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-ava">A</div>
            <div>
              <div className="user-name">{currentUser.name}</div>
              <div className="user-role">{currentUser.role}</div>
            </div>
            <button onClick={handleLogout} style={{ marginLeft: 'auto', color: 'var(--text-3)' }}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="16"
                height="16"
              >
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        {/* HEADER */}
        <header className="header">
          <div className="header-left">
            <h1 className="page-title">{pageTitle}</h1>
          </div>

          <div className="header-right">
            <div className="header-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="hbtn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <span className="hbtn-badge">3</span>
            </button>

            <button className="hbtn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </button>

            <button className="hbtn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* CONTENT */}
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
