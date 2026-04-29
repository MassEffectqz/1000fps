'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CartButton, CartDrawer, MobileDrawer, CompareButton, WishlistButton } from '@/components/layout';

const categories = [
  {
    id: 'gpu',
    name: 'Видеокарты',
    count: 247,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="7" width="20" height="12" rx="1" />
        <path d="M7 7V5M12 7V5M17 7V5" />
        <path d="M7 19v2M12 19v2M17 19v2" />
      </svg>
    ),
    panels: [
      {
        title: 'По производителю',
        items: ['NVIDIA GeForce RTX 40xx', 'NVIDIA GeForce RTX 30xx', 'AMD Radeon RX 7000', 'AMD Radeon RX 6000', 'Intel Arc', 'Профессиональные'],
      },
      {
        title: 'По сегменту',
        items: ['Флагманские (от 80 000 руб.)', 'Высокий класс (40–80 тыс.)', 'Средний класс (20–40 тыс.)', 'Бюджетные (до 20 000 руб.)'],
      },
      {
        title: 'Партнёры NVIDIA',
        items: ['ASUS ROG / TUF', 'MSI Gaming', 'Gigabyte AORUS', 'ZOTAC Gaming', 'Palit / GamingPro', 'Все бренды'],
      },
    ],
  },
  {
    id: 'cpu',
    name: 'Процессоры',
    count: 183,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
      </svg>
    ),
    panels: [
      {
        title: 'Intel Core',
        items: ['Intel Core Ultra (серия 200)', 'Intel Core 14-го поколения', 'Intel Core 13-го поколения', 'Intel Core 12-го поколения'],
      },
      {
        title: 'AMD Ryzen',
        items: ['AMD Ryzen 9000 (AM5)', 'AMD Ryzen 7000 (AM5)', 'AMD Ryzen 5000 (AM4)', 'AMD Ryzen 3000 (AM4)'],
      },
      {
        title: 'Сегмент',
        items: ['Для геймеров', 'Для рендеринга', 'Офисные', 'С интегрированной графикой'],
      },
    ],
  },
  {
    id: 'mb',
    name: 'Материнские платы',
    count: 312,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <path d="M6 6h4v4H6zM14 6h4v4h-4zM6 14h4v4H6z" />
        <path d="M14 16h4M14 14v4" />
      </svg>
    ),
    panels: [
      {
        title: 'Сокет AM5',
        items: ['AMD X870E', 'AMD X870', 'AMD B650E', 'AMD B650'],
      },
      {
        title: 'Сокет LGA1851',
        items: ['Intel Z890', 'Intel B860', 'Intel H810'],
      },
      {
        title: 'Форм-фактор',
        items: ['ATX', 'Micro-ATX', 'Mini-ITX'],
      },
    ],
  },
  {
    id: 'ram',
    name: 'Оперативная память',
    count: 156,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="8" width="20" height="8" rx="1" />
        <path d="M6 8V6M10 8V6M14 8V6M18 8V6M6 16v2M10 16v2M14 16v2M18 16v2" />
      </svg>
    ),
    panels: [
      {
        title: 'DDR5',
        items: ['16 GB', '32 GB', '64 GB', '96 GB'],
      },
      {
        title: 'DDR4',
        items: ['16 GB', '32 GB', '64 GB'],
      },
      {
        title: 'По частоте',
        items: ['4800-5200 МГц', '5600-6000 МГц', '6400+ МГц'],
      },
    ],
  },
  {
    id: 'storage',
    name: 'Накопители',
    count: 289,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 12H2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    panels: [
      {
        title: 'SSD M.2 NVMe',
        items: ['256-512 GB', '1 TB', '2 TB', '4+ TB'],
      },
      {
        title: 'SSD 2.5"',
        items: ['500 GB - 1 TB', '2 TB', '4+ TB'],
      },
      {
        title: 'HDD',
        items: ['3.5" для ПК', '2.5" для ноутбуков', 'Внешние HDD'],
      },
    ],
  },
  {
    id: 'cooling',
    name: 'Охлаждение',
    count: 198,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    panels: [
      {
        title: 'Кулеры для процессора',
        items: ['Башенные', 'Топ-даун', 'Системы жидкостного охлаждения'],
      },
      {
        title: 'Вентиляторы',
        items: ['120 мм', '140 мм', 'Наборы'],
      },
      {
        title: 'Термопаста',
        items: ['В шприце', 'В комплекте'],
      },
    ],
  },
  {
    id: 'psu',
    name: 'Блоки питания',
    count: 124,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    panels: [
      {
        title: 'По мощности',
        items: ['До 500 Вт', '500-700 Вт', '700-850 Вт', '850+ Вт'],
      },
      {
        title: 'Сертификация',
        items: ['80 Plus', '80 Plus Bronze', '80 Plus Gold', '80 Plus Platinum'],
      },
      {
        title: 'Модульность',
        items: ['Немодульные', 'Полумодульные', 'Модульные'],
      },
    ],
  },
  {
    id: 'monitors',
    name: 'Мониторы',
    count: 211,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    panels: [
      {
        title: 'По диагонали',
        items: ['24-25"', '27"', '32"+'],
      },
      {
        title: 'По назначению',
        items: ['Игровые', 'Офисные', 'Профессиональные'],
      },
      {
        title: 'По матрице',
        items: ['IPS', 'VA', 'OLED', 'TN'],
      },
    ],
  },
  {
    id: 'periph',
    name: 'Периферия',
    count: 445,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="6" y="2" width="12" height="20" rx="2" />
        <circle cx="12" cy="16" r="1" />
      </svg>
    ),
    panels: [
      {
        title: 'Клавиатуры',
        items: ['Механические', 'Мембранные', 'Беспроводные'],
      },
      {
        title: 'Мыши',
        items: ['Игровые', 'Офисные', 'Беспроводные'],
      },
      {
        title: 'Гарнитуры',
        items: ['Игровые', 'Офисные', 'Беспроводные'],
      },
    ],
  },
  {
    id: 'cases',
    name: 'Корпуса',
    count: 167,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 12h6M12 9v6" />
      </svg>
    ),
    panels: [
      {
        title: 'Форм-фактор',
        items: ['Full-Tower', 'Mid-Tower', 'Mini-Tower', 'Slim'],
      },
      {
        title: 'По размеру',
        items: ['Для ATX', 'Для Micro-ATX', 'Для Mini-ITX'],
      },
      {
        title: 'Особенности',
        items: ['С окном', 'С подсветкой', 'Бесшумные'],
      },
    ],
  },
  {
    id: 'laptops',
    name: 'Ноутбуки',
    count: 334,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M0 20h24" />
      </svg>
    ),
    panels: [
      {
        title: 'Игровые',
        items: ['Бюджетные', 'Средний класс', 'Флагманские'],
      },
      {
        title: 'Офисные',
        items: ['Ультрабоки', 'Трансформеры', 'Классические'],
      },
      {
        title: 'Профессиональные',
        items: ['Для дизайна', 'Для разработки', 'Для видеомонтажа'],
      },
    ],
  },
];

export function Header() {
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; slug: string; price?: number; image?: string }>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('gpu');
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string }>({ id: '', name: 'Все категории' });
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Фокус на мобильный поиск при открытии
  useEffect(() => {
    if (mobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  // Загрузка результатов поиска
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const params = new URLSearchParams({ q: searchQuery, limit: '8' });
        const res = await fetch(`/api/products?${params}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Закрытие category dropdown при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        const catalogBtn = document.querySelector('.nav__catalog-btn');
        if (catalogBtn && !catalogBtn.contains(event.target as Node)) {
          setMegaMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [megaMenuOpen]);

  // Загрузка сохранённой темы
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <>
      {/* MOBILE SEARCH OVERLAY */}
      {mobileSearchOpen && (
        <div className="mobile-search-overlay">
          <div className="mobile-search-overlay__inner">
            <button
              onClick={() => { setMobileSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
              className="mobile-search-overlay__close"
              aria-label="Закрыть поиск"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="mobile-search-overlay__input-wrap">
              <svg className="mobile-search-overlay__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={mobileSearchInputRef}
                type="text"
                className="mobile-search-overlay__input"
                placeholder="Поиск по товарам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    const params = new URLSearchParams({ q: searchQuery });
                    if (selectedCategory.id) params.set('categoryId', selectedCategory.id);
                    router.push(`/catalog?${params.toString()}`);
                  }
                }}
              />
              {searchLoading && (
                <div className="mobile-search-overlay__spinner">
                  <div className="w-5 h-5 border-2 border-orange border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Mobile search results */}
            {searchQuery.length >= 2 && searchResults.length > 0 && (
              <div className="mobile-search-overlay__results">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="mobile-search-result"
                    onClick={() => setMobileSearchOpen(false)}
                  >
                    <div className="mobile-search-result__img">
                      {product.image ? (
                        <img src={product.image} alt="" className="w-10 h-10 object-contain" />
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-gray3">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      )}
                    </div>
                    <div className="mobile-search-result__info">
                      <div className="text-[14px] text-white truncate">{product.name}</div>
                      {product.price && (
                        <div className="text-[13px] text-orange font-bold">{product.price.toLocaleString('ru-RU')} ₽</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Popular searches */}
            {searchQuery.length === 0 && (
              <div className="mobile-search-overlay__popular">
                <div className="mobile-search-overlay__label">Популярные запросы</div>
                <div className="mobile-search-overlay__tags">
                  {['RTX 4070 Ti', 'Ryzen 7 7800X3D', 'Игровые мониторы', 'DDR5 32GB', 'SSD 1TB'].map((q) => (
                    <button
                      key={q}
                      onClick={() => setSearchQuery(q)}
                      className="mobile-search-tag"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOP BAR — desktop only */}
      <div className="topbar">
        <div className="container">
          <div className="topbar__inner">
            <div className="topbar__left">
              <span className="topbar__city">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                Волгоград, Волжский
              </span>
              <span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.19 11.9 19.79 19.79 0 0 1 1.12 3.29 2 2 0 0 1 3.09 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z" />
                </svg>
                <a href="tel:89026500511">8-902-650-05-11</a>
              </span>
              <span>Пн–Вс: 8:00–22:00</span>
            </div>
            <div className="topbar__right">
              <button
                onClick={toggleTheme}
                className="topbar__theme-btn"
                title="Переключить тему"
              >
                {theme === 'dark' ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                    Свет
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                    Тьма
                  </>
                )}
              </button>
              <Link href="/admin">Админка</Link>
              <Link href="/delivery">Доставка</Link>
              <Link href="/warranty">Гарантия</Link>
              <Link href="/installment">Кредит и рассрочка</Link>
              <Link href="/contacts">Контакты</Link>
              <Link href="/b2b">Корп. клиентам</Link>
            </div>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="header sticky top-0 z-40 bg-[var(--color-black)] border-b border-[var(--color-gray1)]">
        <div className="container">
          <div className="header__inner">
            {/* HAMBURGER — mobile only */}
            <button
              className="md:hidden header__hamburger"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Открыть меню"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* LOGO */}
            <Link href="/" className="logo">
              <span className="logo__text">
                1000<span>fps</span>
              </span>
            </Link>

            {/* SEARCH — desktop full, mobile icon-only */}
            <div className="search-wrap">
              {/* Desktop search */}
              <div className="hidden md:block relative">
                {/* Search icon */}
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>

                {/* Search input */}
                <input
                  ref={searchInputRef}
                  type="text"
                  className="search-input"
                  placeholder="Поиск по товарам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      const params = new URLSearchParams({ q: searchQuery });
                      if (selectedCategory.id) params.set('categoryId', selectedCategory.id);
                      router.push(`/catalog?${params.toString()}`);
                    }
                  }}
                />

                {/* Category dropdown — right side */}
                <div className="absolute right-0 top-0 h-full flex items-center" ref={categoryDropdownRef}>
                  <button
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    className="h-full flex items-center gap-1.5 px-3 bg-[var(--color-gray1)]/50 border-l border-[var(--color-gray1)] text-[12px] text-[var(--color-gray4)] hover:text-[var(--color-orange)] transition-colors rounded-r-[var(--radius)]"
                  >
                    {selectedCategory.name}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {categoryDropdownOpen && (
                    <div className="absolute top-full right-0 mt-1 w-56 bg-[var(--color-black2)] border border-[var(--color-gray1)] rounded-[var(--radius)] shadow-2xl z-[9999] max-h-80 overflow-y-auto">
                      <button
                        onClick={() => { setSelectedCategory({ id: '', name: 'Все категории' }); setCategoryDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--color-gray4)] hover:bg-[var(--color-black3)] hover:text-white transition-colors first:rounded-t-[var(--radius)]"
                      >
                        Все категории
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => { setSelectedCategory({ id: cat.id, name: cat.name }); setCategoryDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--color-gray4)] hover:bg-[var(--color-black3)] hover:text-white transition-colors flex items-center justify-between"
                        >
                          <span>{cat.name}</span>
                          <span className="text-[11px] text-[var(--color-gray3)]">{cat.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  onClick={() => {
                    if (searchQuery.trim()) {
                      const params = new URLSearchParams({ q: searchQuery });
                      if (selectedCategory.id) params.set('categoryId', selectedCategory.id);
                      router.push(`/catalog?${params.toString()}`);
                    }
                  }}
                  className="absolute right-[110px] top-0 h-full px-4 flex items-center justify-center text-[var(--color-gray4)] hover:text-[var(--color-orange)] transition-colors"
                  aria-label="Поиск"
                >
                  {searchLoading ? (
                    <div className="w-4 h-4 border-2 border-[var(--color-orange)] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="m21 21-4.35-4.35" />
                      <circle cx="11" cy="11" r="8" />
                    </svg>
                  )}
                </button>

                {/* Search Dropdown (desktop) */}
                {searchFocused && (searchQuery.length >= 2 || searchResults.length > 0) && (
                  <div className="search-dropdown">
                    {searchLoading ? (
                      <div className="p-6 text-center text-[var(--color-gray3)] text-[13px]">
                        <div className="w-6 h-6 border-2 border-[var(--color-orange)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        Поиск...
                      </div>
                    ) : searchResults.length > 0 ? (
                      <>
                        <div className="search-dropdown__section">
                          <div className="search-dropdown__label">Результаты поиска</div>
                          <div className="flex flex-col gap-1">
                            {searchResults.map((product) => (
                              <Link
                                key={product.id}
                                href={`/product/${product.slug}`}
                                className="search-dropdown__product"
                                onMouseDown={() => setSearchFocused(false)}
                              >
                                <div className="w-10 h-10 bg-[var(--color-black3)] border border-[var(--color-gray1)] rounded flex items-center justify-center flex-shrink-0">
                                  {product.image ? (
                                    <img src={product.image} alt="" className="w-8 h-8 object-contain" />
                                  ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[var(--color-gray3)]">
                                      <rect x="3" y="3" width="18" height="18" rx="2" />
                                      <circle cx="8.5" cy="8.5" r="1.5" />
                                      <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[13px] text-white truncate">{product.name}</div>
                                  <div className="text-[12px] text-[var(--color-orange)] font-bold">{product.price?.toLocaleString('ru-RU')} ₽</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                        <div className="px-4 pb-3">
                          <button
                            onMouseDown={() => {
                              const params = new URLSearchParams({ q: searchQuery });
                              if (selectedCategory.id) params.set('categoryId', selectedCategory.id);
                              router.push(`/catalog?${params.toString()}`);
                            }}
                            className="w-full py-2 bg-[var(--color-orange)] text-white text-[12px] font-bold rounded-[var(--radius)] hover:bg-[var(--color-orange)]/90 transition-colors"
                          >
                            Все результаты →
                          </button>
                        </div>
                      </>
                    ) : searchQuery.length >= 2 ? (
                      <div className="p-6 text-center text-[var(--color-gray3)] text-[13px]">
                        Ничего не найдено по запросу «{searchQuery}»
                      </div>
                    ) : (
                      <>
                        <div className="search-dropdown__section">
                          <div className="search-dropdown__label">Популярные запросы</div>
                          <div className="search-dropdown__items">
                            {['RTX 4070 Ti', 'Ryzen 7 7800X3D', 'Игровые мониторы 144Hz'].map((q) => (
                              <button
                                key={q}
                                onMouseDown={() => { setSearchQuery(q); searchInputRef.current?.focus(); }}
                                className="search-dropdown__item"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="11" cy="11" r="8" />
                                  <path d="m21 21-4.35-4.35" />
                                </svg>
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile search button (icon only) */}
              <button
                className="md:hidden header__search-btn"
                onClick={() => setMobileSearchOpen(true)}
                aria-label="Открыть поиск"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </div>

            {/* ACTIONS */}
            <div className="header__actions">
              {/* Профиль — только десктоп */}
              <Link href="/profile" className="hidden md:flex hbtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="hbtn__label">Профиль</span>
              </Link>

              <div className="header-divider hidden md:block" />

              {/* Сравнение — только десктоп */}
              <div className="hidden md:block">
                <CompareButton />
              </div>

              {/* Вишлист */}
              <WishlistButton />

              <div className="header-divider hidden md:block" />

              {/* Корзина */}
              <CartButton />
            </div>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* NAV */}
      <div
        className="site-nav-wrap"
      >
        <nav className="nav">
          <div className="container">
            <div className="nav__inner">
              <button
                className="nav__catalog-btn hidden md:flex"
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                Каталог товаров
              </button>
              <div className="nav__links">
                <Link href="/catalog" className="nav__link">Каталог</Link>
                <Link href="#" className="nav__link nav__link--hot">Акции</Link>
                <Link href="#" className="nav__link">Новинки</Link>
                <Link href="/configurator" className="nav__link">Конфигуратор ПК</Link>
                <Link href="/ready-builds" className="nav__link">Готовые сборки</Link>
                <Link href="/brands" className="nav__link">Бренды</Link>
                <Link href="/used" className="nav__link">Б/У техника</Link>
                
              </div>
              <div className="nav__extras">
                <Link href="/warehouses" className="nav__extra">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Пункты выдачи
                </Link>
<Link href="/faq" className="nav__extra">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  Помощь
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* MEGA MENU */}
        <div
          ref={menuRef}
          className={`mega-menu${megaMenuOpen ? ' is-open' : ''}`}
        >
          <div className="container" style={{ display: 'flex', width: '100%', padding: 0 }}>
            {/* Close button */}
            <button
              onClick={() => setMegaMenuOpen(false)}
              style={{
                position: 'absolute',
                right: '20px',
                top: '20px',
                background: 'var(--color-black3)',
                border: '1px solid var(--color-gray1)',
                borderRadius: 'var(--radius)',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--color-white)',
                zIndex: '100',
              }}
              title="Закрыть меню"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '16px', height: '16px' }}>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            {/* CATEGORIES LIST */}
            <div className="mega-menu__cats">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`mega-cat${activeCategory === cat.id ? ' is-active' : ''}`}
                  onMouseEnter={() => setActiveCategory(cat.id)}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <div className="mega-cat__icon">{cat.icon}</div>
                  <span className="mega-cat__name">{cat.name}</span>
                  <span className="mega-cat__count">{cat.count}</span>
                </div>
              ))}
            </div>

            {/* PANELS */}
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`mega-menu__panel${activeCategory === cat.id ? ' is-active' : ''}`}
              >
                {cat.panels.map((panel, idx) => (
                  <div key={idx} className="mega-panel__group">
                    <h4>{panel.title}</h4>
                    <ul>
                      {panel.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <Link href="#">{item}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        {megaMenuOpen && <div className="mega-menu__overlay" onClick={() => setMegaMenuOpen(false)} />}
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
