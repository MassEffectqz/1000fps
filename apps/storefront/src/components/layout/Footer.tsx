'use client';

import Link from 'next/link';
import { footerLinks, contacts, socials, payments } from '@/data/mockData';

export function Footer() {
  return (
    <footer
      className="footer"
      style={{
        background: 'var(--black2)',
        padding: '56px 0 0',
      }}
    >
      <div className="container">
        {/* TOP */}
        <div
          className="footer__top"
          style={{
            display: 'grid',
            gridTemplateColumns: '260px repeat(4, 1fr)',
            gap: '40px',
            paddingBottom: '48px',
            borderBottom: '1px solid var(--gray1)',
          }}
        >
          {/* Brand */}
          <div className="footer__brand">
            <Link
              href="/"
              className="footer__logo"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
                textDecoration: 'none',
              }}
            >
              <div
                className="footer__logo-mark"
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'var(--orange)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius)',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  style={{ width: '20px', height: '20px', color: '#fff' }}
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <span
                className="footer__logo-text"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: 'var(--white2)',
                }}
              >
                1000<span style={{ color: 'var(--orange)' }}>fps</span>
              </span>
            </Link>
            <p
              className="footer__desc"
              style={{
                fontSize: '13px',
                color: 'var(--gray3)',
                lineHeight: 1.6,
                marginBottom: '20px',
              }}
            >
              Интернет-магазин компьютерной техники. Более 50 000 товаров в наличии, доставка по
              всей России.
            </p>
            <div
              className="footer__contacts"
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <Link
                href={`tel:${contacts.phone.replace(/[^0-9]/g, '')}`}
                className="footer__phone"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--white2)',
                  marginTop: '4px',
                  textDecoration: 'none',
                }}
              >
                {contacts.phone}
              </Link>
              <span
                className="footer__schedule"
                style={{ fontSize: '12px', color: 'var(--gray3)' }}
              >
                {contacts.schedule}
              </span>
              <div
                className="footer__contact"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: 'var(--gray4)',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ width: '14px', height: '14px', color: 'var(--orange)', flexShrink: 0 }}
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {contacts.email}
              </div>
            </div>
          </div>

          {/* Каталог */}
          <div className="footer__col">
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--white2)',
                marginBottom: '16px',
                paddingBottom: '10px',
                borderBottom: '1px solid var(--gray1)',
                position: 'relative',
              }}
            >
              Каталог
              <span
                style={{
                  content: "''",
                  position: 'absolute',
                  bottom: '-1px',
                  left: 0,
                  width: '28px',
                  height: '1px',
                  background: 'var(--orange)',
                }}
              />
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {footerLinks.catalog.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: '13px',
                      color: link.badge ? 'var(--orange)' : 'var(--gray3)',
                      transition: 'color var(--tr)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: link.badge ? 700 : 400,
                      textDecoration: 'none',
                    }}
                  >
                    {link.label}
                    {link.badge && (
                      <span
                        className="badge badge-orange"
                        style={{
                          marginLeft: 'auto',
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
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Покупателям */}
          <div className="footer__col">
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--white2)',
                marginBottom: '16px',
                paddingBottom: '10px',
                borderBottom: '1px solid var(--gray1)',
                position: 'relative',
              }}
            >
              Покупателям
              <span
                style={{
                  content: "''",
                  position: 'absolute',
                  bottom: '-1px',
                  left: 0,
                  width: '28px',
                  height: '1px',
                  background: 'var(--orange)',
                }}
              />
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {footerLinks.customers.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: '13px',
                      color: 'var(--gray3)',
                      transition: 'color var(--tr)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      textDecoration: 'none',
                    }}
                  >
                    {link.label}
                    {link.badge && (
                      <span
                        className="badge badge-orange"
                        style={{
                          marginLeft: 'auto',
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
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Сервисы */}
          <div className="footer__col">
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--white2)',
                marginBottom: '16px',
                paddingBottom: '10px',
                borderBottom: '1px solid var(--gray1)',
                position: 'relative',
              }}
            >
              Сервисы
              <span
                style={{
                  content: "''",
                  position: 'absolute',
                  bottom: '-1px',
                  left: 0,
                  width: '28px',
                  height: '1px',
                  background: 'var(--orange)',
                }}
              />
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: '13px',
                      color: 'var(--gray3)',
                      transition: 'color var(--tr)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      textDecoration: 'none',
                    }}
                  >
                    {link.label}
                    {link.badge && (
                      <span
                        className="badge badge-orange"
                        style={{
                          marginLeft: 'auto',
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
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* О компании */}
          <div className="footer__col">
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--white2)',
                marginBottom: '16px',
                paddingBottom: '10px',
                borderBottom: '1px solid var(--gray1)',
                position: 'relative',
              }}
            >
              О компании
              <span
                style={{
                  content: "''",
                  position: 'absolute',
                  bottom: '-1px',
                  left: 0,
                  width: '28px',
                  height: '1px',
                  background: 'var(--orange)',
                }}
              />
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: '13px',
                      color: 'var(--gray3)',
                      transition: 'color var(--tr)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      textDecoration: 'none',
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: '20px' }}>
              <div
                className="label-caps"
                style={{
                  marginBottom: '10px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--orange)',
                }}
              >
                Мы в соцсетях
              </div>
              <div className="footer__socials" style={{ display: 'flex', gap: '8px' }}>
                {socials.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="social-btn"
                    data-tip={social.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: '36px',
                      height: '36px',
                      background: 'var(--black3)',
                      border: '1px solid var(--gray1)',
                      borderRadius: 'var(--radius)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gray3)',
                      transition: 'var(--tr)',
                      cursor: 'pointer',
                      textDecoration: 'none',
                    }}
                  >
                    {social.icon === 'vk' && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{ width: '16px', height: '16px' }}
                      >
                        <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14C20.67 22 22 20.67 22 15.07V8.93C22 3.33 20.67 2 15.07 2zm3.08 13.5h-1.52c-.57 0-.75-.46-1.78-1.5-.9-.88-1.3-.99-1.52-.99-.31 0-.4.09-.4.52v1.37c0 .37-.12.59-1.1.59-1.62 0-3.41-.98-4.67-2.81-1.9-2.66-2.42-4.66-2.42-5.07 0-.22.09-.43.52-.43h1.52c.39 0 .53.18.68.6.75 2.16 2 4.06 2.52 4.06.19 0 .28-.09.28-.59V9.3c-.06-1.06-.62-1.15-.62-1.52 0-.19.15-.37.4-.37h2.4c.33 0 .44.17.44.55v2.97c0 .33.15.44.24.44.19 0 .37-.11.74-.48 1.15-1.29 1.97-3.27 1.97-3.27.11-.22.28-.43.67-.43h1.52c.46 0 .56.24.46.55-.19.87-2.04 3.5-2.04 3.5-.16.26-.22.37 0 .66.16.22.68.68 1.02 1.09.64.73 1.12 1.34 1.25 1.76.11.4-.09.6-.5.6z" />
                      </svg>
                    )}
                    {social.icon === 'telegram' && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{ width: '16px', height: '16px' }}
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.69 7.97c-.12.57-.46.7-.93.44l-2.57-1.89-1.24 1.19c-.14.14-.26.26-.52.26l.19-2.63 4.83-4.36c.21-.19-.05-.29-.32-.1L7.67 14.4l-2.52-.79c-.55-.17-.56-.55.12-.82l9.84-3.79c.46-.17.86.11.53.8z" />
                      </svg>
                    )}
                    {social.icon === 'youtube' && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{ width: '16px', height: '16px' }}
                      >
                        <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.5v-7l6.25 3.5-6.25 3.5z" />
                      </svg>
                    )}
                    {social.icon === 'dzen' && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{ width: '16px', height: '16px' }}
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2v3h3c1.1 0 2 .9 2 2s-.9 2-2 2h-3v3c0 1.1-.9 2-2 2s-2-.9-2-2v-3H7c-1.1 0-2-.9-2-2s.9-2 2-2h3V8c0-1.1.9-2 2-2z" />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE: advantages */}
        <div
          className="footer__middle"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
            padding: '32px 0',
            borderBottom: '1px solid var(--gray1)',
          }}
        >
          <div
            className="footer__advantage"
            style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}
          >
            <div
              className="footer__adv-icon"
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
                <rect x="1" y="3" width="15" height="13" rx="1" />
                <path d="M16 8h4l3 5v3h-7V8zM5.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM18.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
              </svg>
            </div>
            <div className="footer__adv-text">
              <h5
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  textTransform: 'none',
                  letterSpacing: 0,
                  color: 'var(--white2)',
                  marginBottom: '3px',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Доставка по всей России
              </h5>
              <p style={{ fontSize: '12px', color: 'var(--gray3)' }}>
                СДЭК, Boxberry, Почта России, курьером. Экспресс-доставка за 2 часа по Москве.
              </p>
            </div>
          </div>
          <div
            className="footer__advantage"
            style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}
          >
            <div
              className="footer__adv-icon"
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="footer__adv-text">
              <h5
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  textTransform: 'none',
                  letterSpacing: 0,
                  color: 'var(--white2)',
                  marginBottom: '3px',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Официальная гарантия
              </h5>
              <p style={{ fontSize: '12px', color: 'var(--gray3)' }}>
                До 3 лет на всю технику. Собственный сервисный центр в Москве.
              </p>
            </div>
          </div>
          <div
            className="footer__advantage"
            style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}
          >
            <div
              className="footer__adv-icon"
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
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <div className="footer__adv-text">
              <h5
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  textTransform: 'none',
                  letterSpacing: 0,
                  color: 'var(--white2)',
                  marginBottom: '3px',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Рассрочка 0%
              </h5>
              <p style={{ fontSize: '12px', color: 'var(--gray3)' }}>
                До 24 месяцев без переплат. Одобрение за 2 минуты. Тинькофф, Сбер, ВТБ.
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div
          className="footer__bottom"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 0',
            gap: '24px',
            flexWrap: 'wrap',
          }}
        >
          <div className="footer__copy" style={{ fontSize: '12px', color: 'var(--gray3)' }}>
            {new Date().getFullYear()} &copy; 1000FPS — интернет-магазин компьютерной техники.
            <br />
            ООО «Тысяча ФПС», ОГРН 1234567890123, ИНН 7701234567.
            <br />
            Все цены указаны в рублях.{' '}
            <Link href="/agreement" style={{ color: 'var(--gray3)', textDecoration: 'underline' }}>
              Пользовательское соглашение
            </Link>
            .
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '12px',
            }}
          >
            <div
              className="footer__payments"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {payments.map((payment) => (
                <div
                  key={payment.name}
                  className="payment-icon"
                  style={{
                    height: '24px',
                    padding: '0 8px',
                    background: 'var(--black3)',
                    border: '1px solid var(--gray1)',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    color: 'var(--gray4)',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {payment.icon}
                </div>
              ))}
            </div>
            <div className="footer__legal" style={{ display: 'flex', gap: '20px' }}>
              <Link
                href="/privacy"
                style={{
                  fontSize: '12px',
                  color: 'var(--gray3)',
                  transition: 'color var(--tr)',
                  textDecoration: 'none',
                }}
              >
                Политика конфиденциальности
              </Link>
              <Link
                href="/offer"
                style={{
                  fontSize: '12px',
                  color: 'var(--gray3)',
                  transition: 'color var(--tr)',
                  textDecoration: 'none',
                }}
              >
                Оферта
              </Link>
              <Link
                href="/details"
                style={{
                  fontSize: '12px',
                  color: 'var(--gray3)',
                  transition: 'color var(--tr)',
                  textDecoration: 'none',
                }}
              >
                Реквизиты
              </Link>
              <Link
                href="/sitemap"
                style={{
                  fontSize: '12px',
                  color: 'var(--gray3)',
                  transition: 'color var(--tr)',
                  textDecoration: 'none',
                }}
              >
                Карта сайта
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function FooterWrapper({ children }: { children?: React.ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
