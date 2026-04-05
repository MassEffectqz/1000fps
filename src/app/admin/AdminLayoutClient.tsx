'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { id: 'dashboard', label: 'Дашборд', href: '/admin', icon: 'grid' },
  { id: 'products', label: 'Товары', href: '/admin/products', icon: 'tag' },
  { id: 'categories', label: 'Категории', href: '/admin/categories', icon: 'folder' },
  { id: 'warehouses', label: 'Склады', href: '/admin/warehouses', icon: 'warehouse' },
  { id: 'orders', label: 'Заказы', href: '/admin/orders', icon: 'cart' },
  { id: 'reviews', label: 'Отзывы', href: '/admin/reviews', icon: 'star' },
  { id: 'parser', label: 'Парсинг', href: '/admin/parser/logs', icon: 'parser' },
  { id: 'analytics', label: 'Аналитика', href: '/admin/analytics', icon: 'chart' },
  { id: 'users', label: 'Пользователи', href: '/admin/users', icon: 'users' },
  { id: 'settings', label: 'Настройки', href: '/admin/settings', icon: 'settings' },
];

// Компонент для рендеринга иконок
const NavIcon = ({ name, active }: { name: string; active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cn('w-4 h-4', active ? 'opacity-100' : 'opacity-70')}>
    {name === 'grid' && <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>}
    {name === 'tag' && <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />}
    {name === 'folder' && <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />}
    {name === 'warehouse' && <path d="M3 21v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8M3 13V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8M13 13V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8" />}
    {name === 'cart' && <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></>}
    {name === 'chart' && <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>}
    {name === 'users' && <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>}
    {name === 'star' && <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />}
    {name === 'parser' && <><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></>}
    {name === 'settings' && <><circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>}
  </svg>
);

export default function AdminLayoutClient({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [user] = useState({ name: 'Admin', role: 'Суперпользователь' });
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const isDragging = useRef(false);

  // Блокировка скролла при открытом sidebar
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  // Закрытие по Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileSidebarOpen) setMobileSidebarOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileSidebarOpen]);

  // Swipe-to-close
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = touchStartX.current;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = touchStartX.current - touchCurrentX.current;
    if (diff > 80) {
      setMobileSidebarOpen(false);
    }
  };

  // Загружаем тему при монтировании
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Определяем активный пункт по pathname
  const getActiveId = () => {
    if (pathname === '/admin') return 'dashboard';
    const segment = pathname?.split('/')[2];
    return segment || 'dashboard';
  };

  const activeId = getActiveId();

  return (
    <div className="flex min-h-screen bg-black">
      {/* Overlay для мобильного sidebar */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 lg:hidden ${
          mobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`w-[240px] bg-black2 border-r border-gray1 flex flex-col fixed h-full z-50 transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-5 border-b border-gray1 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-orange/6 to-transparent pointer-events-none" />
          <div className="w-9 h-9 bg-orange rounded-[var(--radius)] flex items-center justify-center flex-shrink-0 relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-white">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="font-display text-[18px] font-extrabold text-white relative">1000<span className="text-orange">fps</span></span>
          {/* Close button — mobile only */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-[var(--radius)] text-gray4 hover:text-white hover:bg-black3 transition-colors"
            aria-label="Закрыть меню"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto" onClick={() => setMobileSidebarOpen(false)}>
          <div className="px-5 py-4 text-[10px] font-bold tracking-widest uppercase text-gray3">Основное</div>
          {navItems.slice(0, 3).map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'w-full flex items-center gap-[10px] px-5 py-[10px] text-[13px] font-semibold transition-colors relative',
                activeId === item.id ? 'text-white bg-orange/8' : 'text-gray4 hover:text-white hover:bg-black3'
              )}
            >
              {activeId === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-orange" />}
              <NavIcon name={item.icon} active={activeId === item.id} />
              {item.label}
            </Link>
          ))}

          <div className="px-5 py-4 mt-2 text-[10px] font-bold tracking-widest uppercase text-gray3">Продажи</div>
          {navItems.slice(3, 7).map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'w-full flex items-center gap-[10px] px-5 py-[10px] text-[13px] font-semibold transition-colors relative',
                activeId === item.id ? 'text-white bg-orange/8' : 'text-gray4 hover:text-white hover:bg-black3'
              )}
            >
              {activeId === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-orange" />}
              <NavIcon name={item.icon} active={activeId === item.id} />
              {item.label}
            </Link>
          ))}

          <div className="px-5 py-4 mt-2 text-[10px] font-bold tracking-widest uppercase text-gray3">Управление</div>
          {navItems.slice(7).map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'w-full flex items-center gap-[10px] px-5 py-[10px] text-[13px] font-semibold transition-colors relative',
                activeId === item.id ? 'text-white bg-orange/8' : 'text-gray4 hover:text-white hover:bg-black3'
              )}
            >
              {activeId === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-orange" />}
              <NavIcon name={item.icon} active={activeId === item.id} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-gray1">
          <div className="flex items-center gap-3 p-[10px] border border-gray1 rounded-[var(--radius)] cursor-pointer hover:border-gray2 transition-colors mb-3">
            <div className="w-8 h-8 rounded-full bg-orange flex items-center justify-center font-display text-[12px] font-bold text-white flex-shrink-0">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-gray3 uppercase tracking-wider">{user.role}</div>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center gap-2 w-full p-[10px] bg-black3 border border-gray1 rounded-[var(--radius)] text-[12px] text-gray4 font-semibold hover:text-white hover:border-gray2 transition-colors mb-3"
          >
            {theme === 'dark' ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
                Светлая тема
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
                Тёмная тема
              </>
            )}
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full p-[10px] bg-black3 border border-gray1 rounded-[var(--radius)] text-[12px] text-gray4 font-semibold hover:text-white hover:border-gray2 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            На сайт
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-[240px] flex-1 flex flex-col min-h-screen w-full">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-black border-b border-gray1 px-4 h-[52px] flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="w-11 h-11 flex items-center justify-center rounded-[var(--radius)] text-gray4 hover:text-white hover:bg-black3 transition-colors flex-shrink-0"
            aria-label="Открыть меню"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange rounded-[var(--radius)] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-white">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="font-display text-[15px] font-extrabold text-white leading-none">
              1000<span className="text-orange">fps</span>
            </span>
            <span className="text-[11px] text-gray3 ml-1">Админка</span>
          </div>
        </div>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
              fontSize: '13px',
            },
          }}
        />
      </main>
    </div>
  );
}
