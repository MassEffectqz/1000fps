// :)
import Link from 'next/link';
import React from 'react';

const categories = [
  { name: 'Видеокарты', slug: 'video-karty' },
  { name: 'Процессоры', slug: 'processory' },
  { name: 'Материнские платы', slug: 'materinskie-platy' },
  { name: 'Оперативная память', slug: 'operativnaya-pamyat' },
  { name: 'Накопители', slug: 'nakopiteli' },
  { name: 'Мониторы', slug: 'monitory' },
  { name: 'Ноутбуки', slug: 'noutbuki' },
  { name: 'Охлаждение', slug: 'ohlazhdenie' },
  { name: 'Блоки питания', slug: 'bloki-pitaniya' },
  { name: 'Периферия', slug: 'periferiya' },
];

const categoryIcons: Record<string, React.ReactNode> = {
  'video-karty': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="7" width="20" height="12" rx="1" />
      <path d="M7 7V5M12 7V5M17 7V5" />
      <path d="M7 19v2M12 19v2M17 19v2" />
    </svg>
  ),
  processory: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
    </svg>
  ),
  'materinskie-platy': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <path d="M6 6h4v4H6zM14 6h4v4h-4zM6 14h4v4H6z" />
      <path d="M14 16h4M14 14v4" />
    </svg>
  ),
  'operativnaya-pamyat': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="8" width="20" height="8" rx="1" />
      <path d="M6 8V6M10 8V6M14 8V6M18 8V6M6 16v2M10 16v2M14 16v2M18 16v2" />
    </svg>
  ),
  nakopiteli: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 12H2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  monitory: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  noutbuki: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M0 20h24" />
    </svg>
  ),
  ohlazhdenie: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  'bloki-pitaniya': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  periferiya: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="15" y2="11" />
      <circle cx="12" cy="16" r="1" />
    </svg>
  ),
};

export function CategoryStrip() {
  return (
    <section className="py-4 sm:py-6 lg:py-8 border-y border-gray1">
      <div className="container">
        {/* Mobile: horizontal scroll with snap */}
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:grid sm:grid-cols-5 lg:grid-cols-10 sm:gap-4 sm:overflow-visible sm:p-0 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/catalog?category=${cat.slug}`}
              className="flex flex-col items-center gap-2 px-3 py-3 bg-black2 border border-gray1 rounded-[var(--radius)] text-center transition-colors hover:border-orange hover:bg-black3 snap-center flex-shrink-0 sm:flex-shrink sm:snap-none"
            >
              <div className="w-[26px] h-[26px] text-gray4 transition-colors hover:text-orange">
                {categoryIcons[cat.slug as keyof typeof categoryIcons]}
              </div>
              <span className="text-[11px] text-gray4 leading-[1.3] transition-colors hover:text-white whitespace-nowrap">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
