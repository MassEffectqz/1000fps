'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useProducts, useCategories } from '@/hooks/useApi';
import { promoBlocks, brands, articles, features } from '@/data/mockData';

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ h: 7, m: 42, s: 18 });

  // Загружаем реальные данные из API
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: hotProductsData, isLoading: hotProductsLoading } = useProducts({ limit: 5 });
  const { data: newProductsData, isLoading: newProductsLoading } = useProducts({ limit: 5, page: 2 });

  const categories = categoriesData?.data || [];
  const hotProducts = hotProductsData?.data || [];
  const newProducts = newProductsData?.data || [];

  // Иконки для категорий (сопоставляем по slug)
  const categoryIcons: Record<string, string> = {
    components: 'M2 7h20v12H2z M7 7V5m5 0v2m5-2v2M7 19v2m5-2v2m5-2v2',
    gpu: 'M2 7h20v12H2z M7 7V5m5 0v2m5-2v2M7 19v2m5-2v2m5-2v2',
    cpu: 'M4 4h16v16H4z M9 9h6v6H9z M9 2v2m6-2v2M9 20v2m6-2v2M2 9h2m16 0h2M2 15h2m16 0h2',
    motherboard: 'M2 2h20v20H2z M6 6h4v4H6z M14 6h4v4h-4z M6 14h4v4H6z M14 16h4m0-4v4',
    ram: 'M2 8h20v8H2z M6 8V6m4 0v2m4-2v2m4-2v2M6 16v2m4-2v2m4-2v2m4-2v2',
    storage: 'M22 12H2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    monitors: 'M2 3h20v14H2z M8 21h8m-4-4v4',
    laptops: 'M2 4h20v13H2z M0 20h24',
    cooling: 'M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m16 0h2M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    psu: 'm13 2-10 12h9l-1 8 10-12h-9l1-8z',
    periph: 'M6 2h12v20H6z M9 7h6m0 4h6',
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Countdown timer
  useEffect(() => {
    const end = Date.now() + (7 * 3600 + 42 * 60 + 18) * 1000;
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.round((end - Date.now()) / 1000));
      setTimeLeft({
        h: Math.floor(diff / 3600),
        m: Math.floor((diff % 3600) / 60),
        s: diff % 60,
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <section
        className="hero"
        style={{
          background: 'var(--black2)',
          borderBottom: '1px solid var(--gray1)',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', minHeight: '420px' }}>
          {/* Main slider */}
          <div
            style={{
              position: 'relative',
              borderRight: '1px solid var(--gray1)',
              minHeight: '420px',
              overflow: 'hidden',
              background: 'var(--black2)',
            }}
          >
            {/* Dots */}
            <div
              className="hero__dots"
              style={{
                position: 'absolute',
                left: '48px',
                top: '24px',
                display: 'flex',
                gap: '6px',
                zIndex: 10,
              }}
            >
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`hero__dot ${activeSlide === idx ? 'is-active' : ''}`}
                  style={{
                    width: activeSlide === idx ? '40px' : '24px',
                    height: '3px',
                    background: activeSlide === idx ? 'var(--orange)' : 'var(--gray1)',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    border: 'none',
                    padding: 0,
                    transition: 'background var(--tr), width var(--tr)',
                  }}
                />
              ))}
            </div>

            {/* Slides */}
            {[
              {
                bg: 'slide-bg-1',
                badge: 'Хит продаж',
                title: 'NVIDIA GeForce',
                highlight: 'RTX 4090',
                subtitle: 'Абсолютный лидер производительности. 24 ГБ GDDR6X, 4K без компромиссов',
                price: '169 990 руб.',
                oldPrice: '189 990 руб.',
                save: '-20 000 руб.',
              },
              {
                bg: 'slide-bg-2',
                badge: 'Новинка',
                title: 'AMD Ryzen 9',
                highlight: '9950X',
                subtitle: '16 ядер / 32 потока. Zen 5 архитектура. Покоряет многопоток',
                price: '74 990 руб.',
              },
              {
                bg: 'slide-bg-3',
                badge: 'Акция',
                title: 'Мониторы',
                highlight: '360 Hz',
                subtitle: 'QD-OLED панели для киберспорта. ASUS, MSI, Gigabyte — от 55 990 руб.',
                price: 'от 55 990 руб.',
              },
            ].map((slide, idx) => (
              <div
                key={idx}
                className={`hero__slide ${activeSlide === idx ? 'is-active' : ''}`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '48px',
                  opacity: activeSlide === idx ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                  pointerEvents: activeSlide === idx ? 'auto' : 'none',
                  zIndex: activeSlide === idx ? 5 : 1,
                }}
              >
                <div
                  className={`hero__slide-bg ${slide.bg}`}
                  style={{ position: 'absolute', inset: 0 }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 39px,var(--gray1) 39px,var(--gray1) 40px),repeating-linear-gradient(90deg,transparent,transparent 79px,var(--gray1) 79px,var(--gray1) 80px)`,
                      opacity: 0.1,
                    }}
                  />
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <span
                    className="htag"
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '3px 10px',
                      background: 'var(--orange)',
                      fontFamily: 'var(--font-display)',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#fff',
                      borderRadius: 'var(--radius)',
                      marginBottom: '14px',
                      width: 'fit-content',
                    }}
                  >
                    {slide.badge}
                  </span>

                  <h1
                    className="htitle"
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      fontSize: 'clamp(28px, 3.5vw, 50px)',
                      color: 'var(--white2)',
                      marginBottom: '8px',
                      maxWidth: '520px',
                    }}
                  >
                    {slide.title} <span style={{ color: 'var(--orange)' }}>{slide.highlight}</span>
                  </h1>

                  <p
                    className="hsub"
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      fontSize: '14px',
                      color: 'var(--gray4)',
                      marginBottom: '20px',
                      maxWidth: '420px',
                    }}
                  >
                    {slide.subtitle}
                  </p>

                  <div
                    className="hprice-row"
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '12px',
                      marginBottom: '22px',
                    }}
                  >
                    <span
                      className="hprice"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '36px',
                        fontWeight: 800,
                        color: 'var(--white2)',
                      }}
                    >
                      {slide.price}
                    </span>
                    {slide.oldPrice && (
                      <>
                        <span
                          className="hprice-old"
                          style={{
                            fontSize: '18px',
                            color: 'var(--gray3)',
                            textDecoration: 'line-through',
                          }}
                        >
                          {slide.oldPrice}
                        </span>
                        <span
                          className="hprice-save"
                          style={{
                            fontSize: '12px',
                            color: 'var(--orange)',
                            fontWeight: 700,
                            background: 'rgba(255,106,0,0.1)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius)',
                          }}
                        >
                          {slide.save}
                        </span>
                      </>
                    )}
                  </div>

                  <div
                    className="hactions"
                    style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '10px' }}
                  >
                    <Link
                      href="/catalog/gpu"
                      className="btn btn-primary btn-lg"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '14px 32px',
                        fontFamily: 'var(--font-display)',
                        fontSize: '15px',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        borderRadius: 'var(--radius)',
                        transition: 'var(--tr)',
                        background: 'var(--orange)',
                        color: '#fff',
                        textDecoration: 'none',
                      }}
                    >
                      В корзину
                    </Link>
                    <Link
                      href="/catalog"
                      className="btn btn-ghost btn-lg"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '14px 32px',
                        fontFamily: 'var(--font-display)',
                        fontSize: '15px',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        borderRadius: 'var(--radius)',
                        transition: 'var(--tr)',
                        background: 'transparent',
                        color: 'var(--gray4)',
                        border: '1px solid var(--gray1)',
                        textDecoration: 'none',
                      }}
                    >
                      Подробнее
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Side banners */}
          <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--black2)' }}>
            {[
              { label: 'Конфигуратор', title: 'Собери свой\nидеальный ПК', href: '/configurator' },
              { label: 'Рассрочка 0%', title: 'До 24 мес.\nбез переплат', href: '/credit' },
              { label: 'Трейд-ин', title: 'Сдай старое —\nкупи новое', href: '/trade-in' },
            ].map((banner, idx) => (
              <Link
                key={idx}
                href={banner.href}
                className="hbanner"
                style={{
                  flex: 1,
                  position: 'relative',
                  padding: '22px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  borderBottom: idx < 2 ? '1px solid var(--gray1)' : 'none',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'background var(--tr)',
                }}
              >
                <div
                  className="hbanner-bg"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#0d0d0d',
                    transition: 'background var(--tr)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    background: 'var(--orange)',
                    opacity: 0,
                    transition: 'opacity var(--tr)',
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <span
                    className="hbanner-label"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--orange)',
                      marginBottom: '4px',
                    }}
                  >
                    {banner.label}
                  </span>
                  <p
                    className="hbanner-title"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '16px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: 'var(--white2)',
                      lineHeight: 1.2,
                      marginBottom: '10px',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {banner.title}
                  </p>
                  <span
                    className="hbanner-link"
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      color: 'var(--gray3)',
                      transition: 'color var(--tr)',
                      textDecoration: 'none',
                    }}
                  >
                    Узнать условия
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ width: '12px', height: '12px' }}
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES STRIP */}
      <section
        className="cat-strip"
        style={{ padding: '28px 0', borderBottom: '1px solid var(--gray1)' }}
      >
        <div className="container">
          <div
            className="cat-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '8px' }}
          >
            {categories.map((cat) => {
              const iconPath = categoryIcons[cat.slug] || categoryIcons.components;
              return (
              <Link
                key={cat.id}
                href={`/catalog/${cat.slug}`}
                className="cat-item"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 8px',
                  background: 'var(--black2)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  transition: 'border-color var(--tr), background var(--tr)',
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  style={{
                    width: '26px',
                    height: '26px',
                    color: 'var(--gray4)',
                    transition: 'color var(--tr)',
                  }}
                >
                  {iconPath.split(' ').map((d, i) => (d.match(/[MLHVQC]/) ? <path key={i} d={d} /> : null))}
                </svg>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--gray4)',
                    lineHeight: 1.3,
                    transition: 'color var(--tr)',
                  }}
                >
                  {cat.name}
                </span>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROMO BLOCKS */}
      <section
        className="promo-blocks"
        style={{ padding: '28px 0', borderBottom: '1px solid var(--gray1)' }}
      >
        <div className="container">
          <div
            className="promo-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}
          >
            {promoBlocks.map((block, idx) => (
              <div
                key={idx}
                className="pblock"
                style={{
                  padding: '22px',
                  background: 'var(--black2)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color var(--tr)',
                }}
              >
                <div className="pblock-tag" style={{ marginBottom: '10px' }}>
                  <span
                    className={`badge ${block.badgeClass}`}
                    style={{
                      display: 'inline-block',
                      padding: '2px 7px',
                      fontFamily: 'var(--font-display)',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      borderRadius: 'var(--radius)',
                      background:
                        block.badgeClass === 'badge-orange'
                          ? 'var(--orange)'
                          : block.badgeClass === 'badge-white'
                            ? 'var(--white)'
                            : 'var(--gray1)',
                      color: block.badgeClass === 'badge-white' ? 'var(--black)' : '#fff',
                    }}
                  >
                    {block.badge}
                  </span>
                </div>
                <h3
                  className="pblock-title"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '16px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: 'var(--white2)',
                    marginBottom: '6px',
                    lineHeight: 1.2,
                  }}
                >
                  {block.title}
                  <br />
                  {block.sub}
                </h3>
                <p
                  className="pblock-sub"
                  style={{ fontSize: '12px', color: 'var(--gray3)', marginBottom: '16px' }}
                >
                  {block.subtext}
                </p>
                <Link
                  href="/catalog"
                  className="btn btn-outline btn-sm"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 14px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    borderRadius: 'var(--radius)',
                    background: 'transparent',
                    color: 'var(--orange)',
                    border: '1px solid var(--orange)',
                    textDecoration: 'none',
                    transition: 'var(--tr)',
                  }}
                >
                  Смотреть
                </Link>
                <span
                  className="pblock-decor"
                  style={{
                    position: 'absolute',
                    right: '-8px',
                    bottom: '-12px',
                    fontFamily: 'var(--font-display)',
                    fontSize: '72px',
                    fontWeight: 800,
                    color: 'var(--gray1)',
                    lineHeight: 1,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    opacity: 0.35,
                  }}
                >
                  {block.decor}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOT DEALS with countdown */}
      <section
        className="psection"
        style={{ padding: '36px 0', borderBottom: '1px solid var(--gray1)' }}
      >
        <div className="container">
          <div
            className="cbar"
            style={{
              background: 'var(--black2)',
              border: '1px solid var(--gray1)',
              borderRadius: 'var(--radius)',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            <span
              className="cbar-label"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--white2)',
                flexShrink: 0,
              }}
            >
              Горячие предложения
            </span>
            <div className="cdwn" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div
                className="cdwn-unit"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '44px',
                }}
              >
                <span
                  className="cdwn-num"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    fontWeight: 800,
                    color: 'var(--orange)',
                    background: 'var(--black3)',
                    border: '1px solid var(--gray1)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius)',
                    minWidth: '44px',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  {String(timeLeft.h).padStart(2, '0')}
                </span>
                <span
                  className="cdwn-lbl"
                  style={{
                    fontSize: '9px',
                    color: 'var(--gray3)',
                    marginTop: '3px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Часов
                </span>
              </div>
              <span
                className="cdwn-sep"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 800,
                  color: 'var(--gray2)',
                  marginBottom: '14px',
                }}
              >
                :
              </span>
              <div
                className="cdwn-unit"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '44px',
                }}
              >
                <span
                  className="cdwn-num"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    fontWeight: 800,
                    color: 'var(--orange)',
                    background: 'var(--black3)',
                    border: '1px solid var(--gray1)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius)',
                    minWidth: '44px',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  {String(timeLeft.m).padStart(2, '0')}
                </span>
                <span
                  className="cdwn-lbl"
                  style={{
                    fontSize: '9px',
                    color: 'var(--gray3)',
                    marginTop: '3px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Минут
                </span>
              </div>
              <span
                className="cdwn-sep"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 800,
                  color: 'var(--gray2)',
                  marginBottom: '14px',
                }}
              >
                :
              </span>
              <div
                className="cdwn-unit"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '44px',
                }}
              >
                <span
                  className="cdwn-num"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    fontWeight: 800,
                    color: 'var(--orange)',
                    background: 'var(--black3)',
                    border: '1px solid var(--gray1)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius)',
                    minWidth: '44px',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  {String(timeLeft.s).padStart(2, '0')}
                </span>
                <span
                  className="cdwn-lbl"
                  style={{
                    fontSize: '9px',
                    color: 'var(--gray3)',
                    marginTop: '3px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Секунд
                </span>
              </div>
            </div>
            <Link
              href="/catalog"
              className="btn btn-ghost btn-sm"
              style={{
                marginLeft: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 14px',
                fontSize: '11px',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                borderRadius: 'var(--radius)',
                background: 'transparent',
                color: 'var(--gray4)',
                border: '1px solid var(--gray1)',
                textDecoration: 'none',
                transition: 'var(--tr)',
              }}
            >
              Все акции
            </Link>
          </div>

          {/* Products grid */}
          <div
            className="pgrid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '1px',
              background: 'var(--gray1)',
              border: '1px solid var(--gray1)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}
          >
            {hotProductsLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray3)', gridColumn: '1 / -1' }}>
                Загрузка товаров...
              </div>
            ) : hotProducts.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray3)', gridColumn: '1 / -1' }}>
                Товары не найдены
              </div>
            ) : hotProducts.map((product) => {
              // Вычисляем скидку
              const discountPercent = product.discountPercent || (product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0);
              const badge = discountPercent > 0 ? `-${discountPercent}%` : product.available ? 'В наличии' : 'Нет в наличии';

              return (
              <div
                key={product.id}
                className="product-card"
                style={{
                  background: 'var(--black2)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  display: 'grid',
                  gridTemplateRows: 'auto 1fr auto',
                  position: 'relative',
                  transition: 'border-color var(--tr), transform var(--tr)',
                  overflow: 'hidden',
                }}
              >
                <div
                  className="product-card__badges"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    zIndex: 2,
                  }}
                >
                  <span
                    className={`badge ${badge.startsWith('-') ? 'badge-orange' : 'badge-gray'}`}
                    style={{
                      display: 'inline-block',
                      padding: '2px 7px',
                      fontFamily: 'var(--font-display)',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      borderRadius: 'var(--radius)',
                      background: badge.startsWith('-') ? 'var(--orange)' : 'var(--gray1)',
                      color: '#fff',
                    }}
                  >
                    {badge}
                  </span>
                </div>
                <div
                  className="product-card__img"
                  style={{
                    aspectRatio: '4/3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--black3)',
                    padding: '16px',
                    borderBottom: '1px solid var(--gray1)',
                  }}
                >
                  {product.mainImageUrl ? (
                    <img
                      src={product.mainImageUrl}
                      alt={product.name}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <svg
                      className="cico"
                      viewBox="0 0 120 90"
                      fill="none"
                      style={{ width: '110px', height: '82px' }}
                    >
                      <rect
                        x="10"
                        y="22"
                        width="100"
                        height="54"
                        rx="2"
                        stroke="var(--gray2)"
                        strokeWidth="2"
                      />
                      <rect
                        x="20"
                        y="29"
                        width="28"
                        height="38"
                        rx="1"
                        stroke="var(--orange)"
                        strokeWidth="1.5"
                      />
                    </svg>
                  )}
                </div>
                <div
                  className="product-card__body"
                  style={{ padding: '11px 13px 9px', display: 'flex', flexDirection: 'column' }}
                >
                  <div
                    className="stars"
                    style={{
                      fontSize: '11px',
                      marginBottom: '5px',
                      flexShrink: 0,
                      color: 'var(--orange)',
                    }}
                  >
                    {'★'.repeat(Math.round(product.rating))}{' '}
                    <span
                      className="rating-count"
                      style={{ color: 'var(--gray3)', fontSize: '11px', marginLeft: '4px' }}
                    >
                      ({product.reviewsCount})
                    </span>
                  </div>
                  <Link
                    href={`/product/${product.slug}`}
                    className="product-card__name"
                    style={{
                      fontSize: '12px',
                      lineHeight: 1.4,
                      color: 'var(--white)',
                      flex: 1,
                      marginBottom: '5px',
                      textDecoration: 'none',
                    }}
                  >
                    {product.name}
                  </Link>
                  <p
                    className="product-card__spec"
                    style={{
                      fontSize: '11px',
                      color: 'var(--gray3)',
                      lineHeight: 1.35,
                      flexShrink: 0,
                    }}
                  >
                    {product.brand?.name || ''}
                  </p>
                </div>
                <div
                  className="product-card__footer"
                  style={{
                    padding: '8px 13px 10px',
                    borderTop: '1px solid var(--gray1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '7px',
                  }}
                >
                  <div
                    className="product-card__price-row"
                    style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}
                  >
                    <span
                      className="price"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: '18px',
                        color: 'var(--white2)',
                        whiteSpace: 'nowrap',
                        lineHeight: 1,
                      }}
                    >
                      {product.price.toLocaleString('ru-RU')} ₽
                    </span>
                    {product.oldPrice && (
                      <span
                        className="price-old"
                        style={{
                          fontSize: '11px',
                          color: 'var(--gray3)',
                          textDecoration: 'line-through',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {product.oldPrice.toLocaleString('ru-RU')} ₽
                      </span>
                    )}
                  </div>
                  <div
                    className="product-card__actions"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Link
                      href={`/product/${product.slug || '#'}`}
                      className="btn-buy"
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        padding: '6px 8px',
                        fontSize: '11px',
                        letterSpacing: '0.06em',
                        background: 'var(--orange)',
                        color: '#fff',
                        borderRadius: 'var(--radius)',
                        display: 'flex',
                        alignItems: 'center',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        transition: 'var(--tr)',
                        textDecoration: 'none',
                      }}
                    >
                      Купить
                    </Link>
                    <button
                      className="card-icon-btn card-icon-btn--wish"
                      data-tip="В вишлист"
                      style={{
                        width: '28px',
                        height: '28px',
                        flexShrink: 0,
                        background: 'var(--black3)',
                        border: '1px solid var(--gray1)',
                        borderRadius: 'var(--radius)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--gray3)',
                        cursor: 'pointer',
                        transition: 'var(--tr)',
                        position: 'relative',
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ width: '13px', height: '13px' }}
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                    <button
                      className="card-icon-btn card-icon-btn--compare"
                      data-tip="Сравнить"
                      style={{
                        width: '28px',
                        height: '28px',
                        flexShrink: 0,
                        background: 'var(--black3)',
                        border: '1px solid var(--gray1)',
                        borderRadius: 'var(--radius)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--gray3)',
                        cursor: 'pointer',
                        transition: 'var(--tr)',
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ width: '13px', height: '13px' }}
                      >
                        <path d="M18 20V10M12 20V4M6 20v-6" />
                      </svg>
                    </button>
                    <button
                      className="card-icon-btn card-icon-btn--config"
                      data-tip="В конфигуратор"
                      style={{
                        width: '28px',
                        height: '28px',
                        flexShrink: 0,
                        background: 'var(--black3)',
                        border: '1px solid var(--gray1)',
                        borderRadius: 'var(--radius)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--gray3)',
                        cursor: 'pointer',
                        transition: 'var(--tr)',
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ width: '13px', height: '13px' }}
                      >
                        <rect x="2" y="7" width="20" height="14" rx="2" />
                        <path d="M16 3h-3a1 1 0 0 0-1 1v3M8 3h3m0 0V3m0 0H8m5 0h3" />
                        <path d="M9 12h6M12 9v6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      </section>

      {/* NEW PRODUCTS */}
      <section
        className="psection"
        style={{
          padding: '36px 0',
          borderTop: '1px solid var(--gray1)',
          borderBottom: '1px solid var(--gray1)',
        }}
      >
        <div className="container">
          <div
            className="section-title"
            style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '24px' }}
          >
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 34px)' }}>Новинки</h2>
            <Link
              href="/catalog"
              style={{
                fontSize: '12px',
                color: 'var(--orange)',
                marginLeft: 'auto',
                textDecoration: 'none',
              }}
            >
              Все новинки →
            </Link>
          </div>
          <div
            className="ptabs"
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--gray1)',
              marginBottom: '20px',
            }}
          >
            {['Видеокарты', 'Процессоры', 'Мониторы', 'Ноутбуки', 'Периферия'].map((tab, idx) => (
              <button
                key={tab}
                className={`ptab ${idx === 0 ? 'is-active' : ''}`}
                style={{
                  padding: '9px 18px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: idx === 0 ? 'var(--orange)' : 'var(--gray3)',
                  background: 'none',
                  border: 'none',
                  borderBottom: idx === 0 ? '2px solid var(--orange)' : '2px solid transparent',
                  marginBottom: '-1px',
                  cursor: 'pointer',
                  transition: 'color var(--tr), border-color var(--tr)',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div
            className="pgrid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '1px',
              background: 'var(--gray1)',
              border: '1px solid var(--gray1)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}
          >
            {newProductsLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray3)', gridColumn: '1 / -1' }}>
                Загрузка товаров...
              </div>
            ) : newProducts.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray3)', gridColumn: '1 / -1' }}>
                Товары не найдены
              </div>
            ) : newProducts.map((product) => (
              <div
                key={product.id}
                className="product-card"
                style={{
                  background: 'var(--black2)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  position: 'relative',
                  transition: 'outline var(--tr)',
                }}
              >
                <div
                  className="product-card__badges"
                  style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2 }}
                >
                  <span
                    className="badge badge-orange"
                    style={{
                      display: 'inline-block',
                      padding: '2px 7px',
                      fontFamily: 'var(--font-display)',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      borderRadius: 'var(--radius)',
                      background: 'var(--orange)',
                      color: '#fff',
                    }}
                  >
                    NEW
                  </span>
                </div>
                <div
                  className="product-card__img"
                  style={{
                    aspectRatio: '4/3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--black3)',
                    padding: '16px',
                    borderBottom: '1px solid var(--gray1)',
                  }}
                >
                  {product.mainImageUrl ? (
                    <img
                      src={product.mainImageUrl}
                      alt={product.name}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <svg
                      className="cico"
                      viewBox="0 0 120 90"
                      fill="none"
                      style={{ width: '110px', height: '82px' }}
                    >
                      <rect
                        x="10"
                        y="22"
                        width="100"
                        height="54"
                        rx="2"
                        stroke="var(--gray2)"
                        strokeWidth="2"
                      />
                      <rect
                        x="20"
                        y="29"
                        width="28"
                        height="38"
                        rx="1"
                        stroke="var(--orange)"
                        strokeWidth="1.5"
                      />
                    </svg>
                  )}
                </div>
                <div
                  className="product-card__body"
                  style={{ padding: '11px 13px 9px', display: 'flex', flexDirection: 'column' }}
                >
                  <div
                    className="stars"
                    style={{ fontSize: '11px', marginBottom: '5px', color: 'var(--orange)' }}
                  >
                    {'★'.repeat(Math.round(product.rating))}{' '}
                    <span
                      className="rating-count"
                      style={{ color: 'var(--gray3)', fontSize: '11px', marginLeft: '4px' }}
                    >
                      ({product.reviewsCount})
                    </span>
                  </div>
                  <Link
                    href={`/product/${product.slug}`}
                    className="product-card__name"
                    style={{
                      fontSize: '12px',
                      lineHeight: 1.4,
                      color: 'var(--white)',
                      flex: 1,
                      marginBottom: '5px',
                      textDecoration: 'none',
                    }}
                  >
                    {product.name}
                  </Link>
                  <p
                    className="product-card__spec"
                    style={{ fontSize: '11px', color: 'var(--gray3)', lineHeight: 1.35 }}
                  >
                    {product.brand?.name || ''}
                  </p>
                </div>
                <div
                  className="product-card__footer"
                  style={{
                    padding: '8px 13px 10px',
                    borderTop: '1px solid var(--gray1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '7px',
                  }}
                >
                  <div
                    className="product-card__price-row"
                    style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}
                  >
                    <span
                      className="price"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: '18px',
                        color: 'var(--white2)',
                        whiteSpace: 'nowrap',
                        lineHeight: 1,
                      }}
                    >
                      {product.price.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                  <div className="product-card__actions" style={{ display: 'flex', gap: '4px' }}>
                    <Link
                      href={`/product/${product.slug}`}
                      className="btn-buy"
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        padding: '6px 8px',
                        fontSize: '11px',
                        background: 'var(--orange)',
                        color: '#fff',
                        borderRadius: 'var(--radius)',
                        display: 'flex',
                        alignItems: 'center',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                      }}
                    >
                      Купить
                    </Link>
                    <button
                      className="card-icon-btn"
                      style={{
                        width: '28px',
                        height: '28px',
                        background: 'var(--black3)',
                        border: '1px solid var(--gray1)',
                        borderRadius: 'var(--radius)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--gray3)',
                        cursor: 'pointer',
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ width: '13px', height: '13px' }}
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                    <button
                      className="card-icon-btn"
                      style={{
                        width: '28px',
                        height: '28px',
                        background: 'var(--black3)',
                        border: '1px solid var(--gray1)',
                        borderRadius: 'var(--radius)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--gray3)',
                        cursor: 'pointer',
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ width: '13px', height: '13px' }}
                      >
                        <path d="M18 20V10M12 20V4M6 20v-6" />
                      </svg>
                    </button>
                    <button
                      className="card-icon-btn"
                      style={{
                        width: '28px',
                        height: '28px',
                        background: 'var(--black3)',
                        border: '1px solid var(--gray1)',
                        borderRadius: 'var(--radius)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--gray3)',
                        cursor: 'pointer',
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ width: '13px', height: '13px' }}
                      >
                        <rect x="2" y="7" width="20" height="14" rx="2" />
                        <path d="M9 12h6M12 9v6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
            )}
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section
        className="brands-section"
        style={{ padding: '36px 0', borderBottom: '1px solid var(--gray1)' }}
      >
        <div className="container">
          <div
            className="section-title"
            style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '24px' }}
          >
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 34px)' }}>Бренды</h2>
            <Link
              href="/brands"
              style={{
                fontSize: '12px',
                color: 'var(--orange)',
                marginLeft: 'auto',
                textDecoration: 'none',
              }}
            >
              Все бренды →
            </Link>
          </div>
          <div
            className="brands-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px' }}
          >
            {brands.map((brand) => (
              <div
                key={brand}
                className="brand-item"
                style={{
                  height: '58px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--black2)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--gray3)',
                  cursor: 'pointer',
                  transition: 'border-color var(--tr), color var(--tr)',
                }}
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        className="feat-section"
        style={{ padding: '36px 0', borderBottom: '1px solid var(--gray1)' }}
      >
        <div className="container">
          <div
            className="feat-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1px',
              background: 'var(--gray1)',
              border: '1px solid var(--gray1)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}
          >
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="feat"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '24px 20px',
                  background: 'var(--black2)',
                  transition: 'background var(--tr)',
                }}
              >
                <div
                  className="feat-icon"
                  style={{
                    width: '40px',
                    height: '40px',
                    flexShrink: 0,
                    background: 'var(--black3)',
                    border: '1px solid var(--gray1)',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    style={{ width: '18px', height: '18px', color: 'var(--orange)' }}
                  >
                    <path d={feat.icon} />
                  </svg>
                </div>
                <div>
                  <h4
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      fontWeight: 600,
                      textTransform: 'none',
                      letterSpacing: 0,
                      color: 'var(--white2)',
                      marginBottom: '4px',
                    }}
                  >
                    {feat.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--gray3)', lineHeight: 1.5 }}>
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG / ARTICLES */}
      <section className="art-section" style={{ padding: '36px 0' }}>
        <div className="container">
          <div
            className="section-title"
            style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '24px' }}
          >
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 34px)' }}>Блог и обзоры</h2>
            <Link
              href="/blog"
              style={{
                fontSize: '12px',
                color: 'var(--orange)',
                marginLeft: 'auto',
                textDecoration: 'none',
              }}
            >
              Все статьи →
            </Link>
          </div>
          <div
            className="art-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}
          >
            {articles.map((art, idx) => (
              <div
                key={idx}
                className="art-card"
                style={{
                  background: 'var(--black2)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                  transition: 'border-color var(--tr)',
                }}
              >
                <div
                  className="art-img"
                  style={{
                    height: '160px',
                    background: 'var(--black3)',
                    borderBottom: '1px solid var(--gray1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontSize: '52px',
                    fontWeight: 800,
                    color: 'var(--gray2)',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {articles[idx].title.charAt(0)}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.015) 10px, rgba(255,255,255,0.015) 11px)',
                    }}
                  />
                </div>
                <div className="art-body" style={{ padding: '18px' }}>
                  <div
                    className="art-meta"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      className="art-cat"
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--orange)',
                      }}
                    >
                      Статья
                    </span>
                    <span className="art-date" style={{ fontSize: '11px', color: 'var(--gray3)' }}>
                      {art.date}
                    </span>
                  </div>
                  <Link
                    href="/blog"
                    className="art-title"
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-display)',
                      fontSize: '15px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: 'var(--white2)',
                      lineHeight: 1.3,
                      marginBottom: '8px',
                      textDecoration: 'none',
                    }}
                  >
                    {art.title}
                  </Link>
                  <p
                    className="art-desc"
                    style={{ fontSize: '12px', color: 'var(--gray3)', lineHeight: 1.5 }}
                  >
                    {art.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
