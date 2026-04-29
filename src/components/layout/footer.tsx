import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-black2 pt-14">
      <div className="container">
        {/* TOP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[260px_repeat(4,1fr)] gap-8 sm:gap-10 pb-12 border-b border-gray1">
          {/* Brand */}
          <div className="footer__brand">
            <Link href="/" className="flex items-center gap-[10px] mb-4">
              <span className="font-display text-[28px] font-extrabold uppercase text-white2">
                1000<span className="text-orange">fps</span>
              </span>
            </Link>
            <p className="text-[13px] text-gray3 leading-[1.6] mb-5">
              Интернет-магазин компьютерной техники. Более 50 000 товаров в наличии, доставка по всей России.
            </p>
            <div className="flex flex-col gap-2">
              <a href="tel:89026500511" className="font-display text-[18px] font-bold text-white2 hover:text-orange">
                8-902-650-05-11
              </a>
              <span className="text-[12px] text-gray3">Пн–Вс: 8:00–22:00</span>
              <a href="mailto:support@1000fps.ru" className="flex items-center gap-2 text-[13px] text-gray4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[14px] h-[14px] text-orange flex-shrink-0">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                support@1000fps.ru
              </a>
            </div>
          </div>

          {/* Каталог */}
          <div>
            <h4 className="text-[12px] font-bold tracking-wider uppercase text-white2 mb-4 pb-[10px] border-b border-gray1 relative after:absolute after:bottom-[-1px] after:left-0 after:w-7 after:h-px after:bg-orange">
              Каталог
            </h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/ready-builds" className="text-[13px] text-gray3 flex items-center gap-[6px] hover:text-orange transition-colors">
                  Готовые сборки
                </Link>
              </li>
              <li>
                <Link href="/catalog?categoryId=video-karty" className="text-[13px] text-gray3 flex items-center gap-[6px] hover:text-orange transition-colors">
                  Видеокарты
                </Link>
              </li>
              <li>
                <Link href="/catalog?categoryId=processory" className="text-[13px] text-gray3 flex items-center gap-[6px] hover:text-orange transition-colors">
                  Процессоры
                </Link>
              </li>
              <li>
                <Link href="/catalog?categoryId=materinskie-platy" className="text-[13px] text-gray3 flex items-center gap-[6px] hover:text-orange transition-colors">
                  Материнские платы
                </Link>
              </li>
              <li>
                <Link href="/catalog?categoryId=operativnaya-pamyat" className="text-[13px] text-gray3 flex items-center gap-[6px] hover:text-orange transition-colors">
                  Оперативная память
                </Link>
              </li>
              <li>
                <Link href="/catalog?categoryId=nakopiteli" className="text-[13px] text-gray3 flex items-center gap-[6px] hover:text-orange transition-colors">
                  Накопители
                </Link>
              </li>
              <li>
                <Link href="/catalog?categoryId=monitory" className="text-[13px] text-gray3 flex items-center gap-[6px] hover:text-orange transition-colors">
                  Мониторы
                </Link>
              </li>
              <li>
                <Link href="/catalog?categoryId=noutbuki" className="text-[13px] text-gray3 flex items-center gap-[6px] hover:text-orange transition-colors">
                  Ноутбуки
                </Link>
              </li>
              <li>
                <Link href="/catalog?categoryId=ohlazhdenie" className="text-[13px] text-gray3 flex items-center gap-[6px] hover:text-orange transition-colors">
                  Охлаждение
                </Link>
              </li>
              <li>
                <Link href="/catalog?categoryId=bloki-pitaniya" className="text-[13px] text-gray3 flex items-center gap-[6px] hover:text-orange transition-colors">
                  Блоки питания
                </Link>
              </li>
              <li>
                <Link href="/catalog?categoryId=periferiya" className="text-[13px] text-gray3 flex items-center gap-[6px] hover:text-orange transition-colors">
                  Периферия
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-[13px] text-orange font-bold hover:text-orange3 transition-colors">
                  Весь каталог
                </Link>
              </li>
            </ul>
          </div>

          {/* Покупателям */}
          <div>
            <h4 className="text-[12px] font-bold tracking-wider uppercase text-white2 mb-4 pb-[10px] border-b border-gray1 relative after:absolute after:bottom-[-1px] after:left-0 after:w-7 after:h-px after:bg-orange">
              Покупателям
            </h4>
            <ul className="flex flex-col gap-2">
              {['Как оформить заказ', 'Способы оплаты', 'Доставка и самовывоз', 'Возврат и обмен', 'Гарантия и ремонт', 'Рассрочка 0%', 'Трейд-ин', 'Корпоративным клиентам', 'Партнёрская программа', 'FAQ'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-[13px] text-gray3 flex items-center gap-[6px] hover:text-orange transition-colors">
                    {item}
                    {item === 'Трейд-ин' && (
                      <span className="ml-auto bg-orange text-white text-[10px] font-bold px-[7px] py-[2px] rounded-[var(--radius)] uppercase tracking-wider">
                        NEW
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Сервисы */}
          <div>
            <h4 className="text-[12px] font-bold tracking-wider uppercase text-white2 mb-4 pb-[10px] border-b border-gray1 relative after:absolute after:bottom-[-1px] after:left-0 after:w-7 after:h-px after:bg-orange">
              Сервисы
            </h4>
            <ul className="flex flex-col gap-2">
              {[
                { name: 'Конфигуратор ПК', href: '/configurator' },
                { name: 'Готовые сборки', href: '/ready-builds' },
                { name: 'Сравнение товаров', href: '/compare' },
                { name: 'Список желаемого', href: '/wishlist' },
                { name: 'Пункты выдачи', href: '/warehouses' },
                { name: 'Акции и скидки', href: '/catalog?onSale=true', hot: true },
                { name: 'Новинки', href: '/catalog?isNew=true' },
                { name: 'Б/У техника', href: '/used' },
                { name: 'FAQ', href: '/faq' },
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href || '#'} className="text-[13px] text-gray3 flex items-center gap-[6px] hover:text-orange transition-colors">
                    {item.name}
                    {item.hot && (
                      <span className="ml-auto bg-orange text-white text-[10px] font-bold px-[7px] py-[2px] rounded-[var(--radius)] uppercase tracking-wider">
                        HOT
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* О компании */}
          <div>
            <h4 className="text-[12px] font-bold tracking-wider uppercase text-white2 mb-4 pb-[10px] border-b border-gray1 relative after:absolute after:bottom-[-1px] after:left-0 after:w-7 after:h-px after:bg-orange">
              О компании
            </h4>
            <ul className="flex flex-col gap-2">
              {['О нас', 'Вакансии', 'Контакты', 'Реквизиты', 'Отзывы о магазине', 'Пресс-центр'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-[13px] text-gray3 flex items-center gap-[6px] hover:text-orange transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="mt-5">
              <div className="text-[11px] font-bold tracking-wider uppercase text-orange mb-[10px]">
                Мы в соцсетях
              </div>
              <div className="flex gap-2">
                {/* VK */}
                <a href="https://vk.com/shop1000fps" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray3 transition-colors hover:border-orange hover:text-orange hover:bg-black2">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14C20.67 22 22 20.67 22 15.07V8.93C22 3.33 20.67 2 15.07 2zm3.08 13.5h-1.52c-.57 0-.75-.46-1.78-1.5-.9-.88-1.3-.99-1.52-.99-.31 0-.4.09-.4.52v1.37c0 .37-.12.59-1.1.59-1.62 0-3.41-.98-4.67-2.81-1.9-2.66-2.42-4.66-2.42-5.07 0-.22.09-.43.52-.43h1.52c.39 0 .53.18.68.6.75 2.16 2 4.06 2.52 4.06.19 0 .28-.09.28-.59V9.3c-.06-1.06-.62-1.15-.62-1.52 0-.19.15-.37.4-.37h2.4c.33 0 .44.17.44.55v2.97c0 .33.15.44.24.44.19 0 .37-.11.74-.48 1.15-1.29 1.97-3.27 1.97-3.27.11-.22.28-.43.67-.43h1.52c.46 0 .56.24.46.55-.19.87-2.04 3.5-2.04 3.5-.16.26-.22.37 0 .66.16.22.68.68 1.02 1.09.64.73 1.12 1.34 1.25 1.76.11.4-.09.6-.5.6z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE: addresses — side by side with space-between */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-8 border-b border-gray1 gap-6">
          <div className="flex items-start gap-[14px]">
            <div className="w-10 h-10 flex-shrink-0 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px] text-orange">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h5 className="text-[13px] font-semibold text-white2 mb-[3px] font-body">
                Волгоград
              </h5>
              <p className="text-[12px] text-gray3">
                ул. Еременко, 126<br />
                <a href="tel:89026500511" className="text-orange hover:text-orange2">8-902-650-05-11</a>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-[14px]">
            <div className="w-10 h-10 flex-shrink-0 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px] text-orange">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h5 className="text-[13px] font-semibold text-white2 mb-[3px] font-body">
                Волжский
              </h5>
              <p className="text-[12px] text-gray3">
                пр. Ленина, 14<br />
                <a href="tel:89616792184" className="text-orange hover:text-orange2">8-961-679-21-84</a>
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="flex items-center justify-between py-5 gap-6 flex-wrap">
          <div className="text-[12px] text-gray3">
            2026 &copy; 1000FPS — интернет-магазин компьютерной техники.<br />
            Все цены указаны в рублях. <Link href="#" className="text-gray3 underline">Пользовательское соглашение</Link>.
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex gap-5">
              <Link href="/privacy" className="text-[12px] text-gray3 transition-colors hover:text-white">
                Политика конфиденциальности
              </Link>
              <Link href="/offer" className="text-[12px] text-gray3 transition-colors hover:text-white">
                Оферта
              </Link>
              <Link href="/requisites" className="text-[12px] text-gray3 transition-colors hover:text-white">
                Реквизиты
              </Link>
              <Link href="/sitemap" className="text-[12px] text-gray3 transition-colors hover:text-white">
                Карта сайта
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
