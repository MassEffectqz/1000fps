'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

// ─── SVG Icon Components ───────────────────────────────────────────────

function Icon({ name, className = 'w-5 h-5' }: { name: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    // Quick Actions
    profile: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    orders: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
      </svg>
    ),
    heart: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    compare: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
    // Navigation
    grid: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    fire: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M12 2c.5 2.5 2 4.5 2 7a4 4 0 1 1-8 0c0-2.5 2-4.5 3-7 1 2.5 3 4.5 3 7" />
      </svg>
    ),
    sparkle: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
        <path d="M18 14l.75 2.25L21 17l-2.25.75L18 20l-.75-2.25L15 17l2.25-.75L18 14z" />
      </svg>
    ),
    tools: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    desktop: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    recycle: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
        <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
        <path d="m14 16-3 3 3 3" />
        <path d="M8.293 13.596 4.875 7.97l4.303-2.483" />
        <path d="m10 4 4 2.5-4 2.5" />
        <path d="m15.707 10.404 3.418 5.626-4.303 2.484" />
      </svg>
    ),
    help: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    // Info
    mapPin: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
    truck: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M1 3h15v13H1z" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    creditCard: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    mail: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    building: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <rect x="4" y="2" width="16" height="20" rx="1" />
        <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
      </svg>
    ),
    // Catalog
    gpu: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <rect x="2" y="7" width="20" height="12" rx="1" />
        <path d="M7 7V5M12 7V5M17 7V5" />
        <path d="M7 19v2M12 19v2M17 19v2" />
      </svg>
    ),
    cpu: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
      </svg>
    ),
    motherboard: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <path d="M6 6h4v4H6zM14 6h4v4h-4zM6 14h4v4H6z" />
        <path d="M14 16h4M14 14v4" />
      </svg>
    ),
    memory: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <rect x="2" y="8" width="20" height="8" rx="1" />
        <path d="M6 8V6M10 8V6M14 8V6M18 8V6M6 16v2M10 16v2M14 16v2M18 16v2" />
      </svg>
    ),
    storage: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M22 12H2" />
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    fan: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M12 12c-1.5-3-4-5-4-8a4 4 0 1 1 8 0c0 3-2.5 5-4 8z" />
        <path d="M12 12c3-1.5 5-4 8-4a4 4 0 1 1 0 8c-3 0-5-2.5-8-4z" />
        <path d="M12 12c1.5 3 4 5 4 8a4 4 0 1 1-8 0c0-3 2.5-5 4-8z" />
        <path d="M12 12c-3 1.5-5 4-8 4a4 4 0 1 1 0-8c3 0 5 2.5 8 4z" />
        <circle cx="12" cy="12" r="1.5" />
      </svg>
    ),
    power: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    monitor: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    mouse: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <rect x="6" y="2" width="12" height="20" rx="6" />
        <line x1="12" y1="6" x2="12" y2="10" />
      </svg>
    ),
    case: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <circle cx="12" cy="14" r="3" />
        <path d="M8 6h8" />
      </svg>
    ),
    laptop: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M0 20h24" />
      </svg>
    ),
    // Utility
    phone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.19 11.9 19.79 19.79 0 0 1 1.12 3.29 2 2 0 0 1 3.09 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z" />
      </svg>
    ),
    sun: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
    moon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
    search: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    chevronRight: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="m9 18 6-6-6-6" />
      </svg>
    ),
    x: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    ),
    bolt: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  };

  return <>{icons[name] || null}</>;
}

// ─── Data ──────────────────────────────────────────────────────────────

const catalogCategories = [
  { id: 'gpu', name: 'Видеокарты', icon: 'gpu' },
  { id: 'cpu', name: 'Процессоры', icon: 'cpu' },
  { id: 'mb', name: 'Мат. платы', icon: 'motherboard' },
  { id: 'ram', name: 'Память', icon: 'memory' },
  { id: 'storage', name: 'Накопители', icon: 'storage' },
  { id: 'cooling', name: 'Охлаждение', icon: 'fan' },
  { id: 'psu', name: 'Блоки питания', icon: 'power' },
  { id: 'monitors', name: 'Мониторы', icon: 'monitor' },
  { id: 'periph', name: 'Периферия', icon: 'mouse' },
  { id: 'cases', name: 'Корпуса', icon: 'case' },
  { id: 'laptops', name: 'Ноутбуки', icon: 'laptop' },
];

const navLinks = [
  { href: '/catalog', label: 'Каталог', icon: 'grid' },
  { href: '#', label: 'Акции', icon: 'fire', hot: true },
  { href: '#', label: 'Новинки', icon: 'sparkle' },
  { href: '/configurator', label: 'Конфигуратор ПК', icon: 'tools' },
  { href: '#', label: 'Готовые сборки', icon: 'desktop' },
  { href: '#', label: 'Б/У техника', icon: 'recycle' },
  { href: '/faq', label: 'FAQ', icon: 'help' },
];

const infoLinks = [
  { href: '/warehouses', label: 'Пункты выдачи', icon: 'mapPin' },
  { href: '#', label: 'Доставка', icon: 'truck' },
  { href: '#', label: 'Гарантия', icon: 'shield' },
  { href: '#', label: 'Кредит и рассрочка', icon: 'creditCard' },
  { href: '#', label: 'Контакты', icon: 'mail' },
  { href: '#', label: 'Корп. клиентам', icon: 'building' },
];

const quickLinks = [
  { href: '/profile', label: 'Профиль', icon: 'profile' },
  { href: '/profile/orders', label: 'Заказы', icon: 'orders' },
  { href: '/profile/wishlist', label: 'Избранное', icon: 'heart' },
  { href: '/compare', label: 'Сравнение', icon: 'compare' },
];

// ─── Component ─────────────────────────────────────────────────────────

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'menu' | 'catalog'>('menu');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const isDragging = useRef(false);

  // Init theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setActiveTab('menu');
      setSearchQuery('');
    }
  }, [open]);

  // Блокировка скролла
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

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
    if (touchStartX.current - touchCurrentX.current > 80) onClose();
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onClose();
      router.push(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCatClick = (catId: string) => {
    onClose();
    router.push(`/catalog?categoryId=${catId}`);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 left-0 bottom-0 z-[10000] w-[320px] max-w-[90vw] bg-[var(--color-black)] border-r border-[var(--color-gray1)] shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label="Мобильное меню"
      >
        {/* ═══ HEADER ═══ */}
        <div className="flex items-center justify-between px-5 h-[56px] border-b border-[var(--color-gray1)] flex-shrink-0">
          <Link href="/" onClick={onClose} className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 bg-[var(--color-orange)] rounded-lg flex items-center justify-center">
              <Icon name="bolt" className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-[18px] font-extrabold text-white leading-none uppercase tracking-tight">
              1000<span className="text-[var(--color-orange)]">fps</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-[var(--color-gray3)] hover:text-white hover:bg-[var(--color-black3)] transition-colors"
            aria-label="Закрыть"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* ═══ TABS ═══ */}
        <div className="flex border-b border-[var(--color-gray1)] flex-shrink-0">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-3 text-[12px] font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === 'menu'
                ? 'text-[var(--color-orange)]'
                : 'text-[var(--color-gray3)] hover:text-white'
            }`}
          >
            Меню
            {activeTab === 'menu' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-orange)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 py-3 text-[12px] font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === 'catalog'
                ? 'text-[var(--color-orange)]'
                : 'text-[var(--color-gray3)] hover:text-white'
            }`}
          >
            Каталог
            {activeTab === 'catalog' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-orange)]" />
            )}
          </button>
        </div>

        {/* ═══ SEARCH ═══ */}
        <div className="px-4 py-3 border-b border-[var(--color-gray1)] flex-shrink-0">
          <div className="flex items-center gap-2.5 bg-[var(--color-black3)] border border-[var(--color-gray1)] rounded-lg px-3 py-2.5 transition-colors focus-within:border-[var(--color-orange)]/50">
            <Icon name="search" className="w-4 h-4 text-[var(--color-gray3)] flex-shrink-0" />
            <input
              type="text"
              className="flex-1 bg-transparent text-[14px] text-white outline-none placeholder-[var(--color-gray3)]"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ fontSize: '16px' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[var(--color-gray3)] hover:text-white flex-shrink-0 transition-colors"
                aria-label="Очистить"
              >
                <Icon name="x" className="w-4 h-4" />
              </button>
            )}
            {searchQuery && (
              <button
                onClick={handleSearch}
                className="text-[var(--color-orange)] font-bold text-[11px] uppercase tracking-wider flex-shrink-0 hover:text-orange/80 transition-colors"
              >
                Найти
              </button>
            )}
          </div>
        </div>

        {/* ═══ CONTENT ═══ */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {activeTab === 'menu' ? (
            <>
              {/* Quick Actions 2x2 */}
              <div className="grid grid-cols-4 gap-1 px-4 py-4 border-b border-[var(--color-gray1)]">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg hover:bg-[var(--color-black3)] transition-colors no-underline"
                  >
                    <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-[var(--color-black3)] border border-[var(--color-gray1)] text-[var(--color-gray4)] group-hover:text-white transition-colors">
                      <Icon name={link.icon} className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-[var(--color-gray3)] text-center leading-tight">{link.label}</span>
                  </Link>
                ))}
              </div>

              {/* Phone */}
              <a
                href="tel:89026500511"
                className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-gray1)] hover:bg-[var(--color-black3)] transition-colors no-underline"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--color-orange)]/10 text-[var(--color-orange)] flex-shrink-0">
                  <Icon name="phone" className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-white">8-902-650-05-11</div>
                  <div className="text-[11px] text-[var(--color-gray3)]">Пн–Вс: 8:00–22:00</div>
                </div>
              </a>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-gray1)] hover:bg-[var(--color-black3)] transition-colors text-left"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--color-black3)] border border-[var(--color-gray1)] text-[var(--color-gray4)] flex-shrink-0">
                  <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[14px] font-medium text-white">Тема оформления</div>
                  <div className="text-[11px] text-[var(--color-gray3)]">{theme === 'dark' ? 'Тёмная' : 'Светлая'}</div>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-10 h-5 bg-[var(--color-gray2)] rounded-full relative transition-colors">
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        theme === 'dark' ? 'left-0.5' : 'left-[22px]'
                      }`}
                    />
                  </div>
                </div>
              </button>

              {/* Navigation */}
              <div className="py-2">
                <div className="px-5 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--color-gray3)]">
                  Навигация
                </div>
                {navLinks.map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-5 py-3 text-[14px] transition-colors no-underline ${
                      link.hot
                        ? 'text-[var(--color-orange)] font-medium'
                        : 'text-[var(--color-gray4)] hover:text-white hover:bg-[var(--color-black3)]'
                    }`}
                  >
                    <span className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${link.hot ? 'text-[var(--color-orange)]' : 'text-[var(--color-gray4)]'}`}>
                      <Icon name={link.icon} className="w-4 h-4" />
                    </span>
                    <span className="flex-1">{link.label}</span>
                    <Icon name="chevronRight" className="w-4 h-4 text-[var(--color-gray2)]" />
                  </Link>
                ))}
              </div>

              {/* Information */}
              <div className="py-2 border-t border-[var(--color-gray1)]">
                <div className="px-5 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--color-gray3)]">
                  Информация
                </div>
                {infoLinks.map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-5 py-3 text-[14px] text-[var(--color-gray4)] hover:text-white hover:bg-[var(--color-black3)] transition-colors no-underline"
                  >
                    <span className="w-5 h-5 flex items-center justify-center text-[var(--color-gray4)] flex-shrink-0">
                      <Icon name={link.icon} className="w-4 h-4" />
                    </span>
                    <span className="flex-1">{link.label}</span>
                    <Icon name="chevronRight" className="w-4 h-4 text-[var(--color-gray2)]" />
                  </Link>
                ))}
              </div>

              {/* Admin (only if admin — placeholder link) */}
              <div className="border-t border-[var(--color-gray1)] py-2">
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="flex items-center gap-3 px-5 py-3 text-[13px] text-[var(--color-gray3)] hover:text-[var(--color-orange)] hover:bg-[var(--color-black3)] transition-colors no-underline"
                >
                  <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </span>
                  <span>Админ-панель</span>
                </Link>
              </div>
            </>
          ) : (
            /* ═══ CATALOG TAB ═══ */
            <div className="py-2">
              {catalogCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCatClick(cat.id)}
                  className="w-full flex items-center gap-3 px-5 py-3 text-[14px] text-[var(--color-gray4)] hover:text-white hover:bg-[var(--color-black3)] transition-colors text-left"
                >
                  <span className="w-5 h-5 flex items-center justify-center text-[var(--color-gray4)] flex-shrink-0">
                    <Icon name={cat.icon} className="w-4 h-4" />
                  </span>
                  <span className="flex-1">{cat.name}</span>
                  <Icon name="chevronRight" className="w-4 h-4 text-[var(--color-gray2)]" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ═══ FOOTER ═══ */}
        <div className="flex-shrink-0 border-t border-[var(--color-gray1)] px-5 py-3.5 bg-[var(--color-black2)]">
          <div className="text-[11px] text-[var(--color-gray3)] text-center">
            © 2026 1000FPS
          </div>
        </div>
      </div>
    </>
  );
}
