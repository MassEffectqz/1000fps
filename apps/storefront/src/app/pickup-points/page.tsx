'use client';

import Link from 'next/link';

export default function PickupPointsPage() {
  const pickupPoints = [
    {
      id: 1,
      city: 'Волгоград',
      address: 'ул. Еременко, 126',
      phone: '8-902-650-05-11',
      hours: 'С 10 до 19ч',
      mapUrl: 'https://yandex.ru/maps/-/CDu~Kqwg',
      coordinates: { lat: 48.708, lng: 44.539 },
      features: ['Примерка', 'Проверка товара', 'Оплата картой', 'Парковка'],
    },
    {
      id: 2,
      city: 'Волжский',
      address: 'проспект Ленина, 14',
      phone: '8-961-679-21-84',
      hours: 'С 10 до 19ч',
      mapUrl: 'https://yandex.ru/maps/-/CDu~Kqxh',
      coordinates: { lat: 48.789, lng: 44.764 },
      features: ['Примерка', 'Проверка товара', 'Оплата картой', 'Парковка'],
    },
  ];

  const breadcrumbs = [
    { name: 'Главная', href: '/' },
    { name: 'Пункты выдачи', href: '/pickup-points' },
  ];

  return (
    <div className="pickup-points-page">
      {/* Breadcrumb */}
      <div style={{ background: 'var(--black2)', borderBottom: '1px solid var(--gray1)' }}>
        <div className="container">
          <div
            className="breadcrumb"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '14px 0',
              fontSize: '12px',
              color: 'var(--gray3)',
            }}
          >
            {breadcrumbs.map((crumb, idx) => (
              <span
                key={`${crumb.href}-${idx}`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {idx < breadcrumbs.length - 1 ? (
                  <Link
                    href={crumb.href as string}
                    style={{
                      color: 'var(--gray3)',
                      transition: 'color var(--tr)',
                      textDecoration: 'none',
                    }}
                  >
                    {crumb.name}
                  </Link>
                ) : (
                  <span style={{ color: 'var(--white)' }}>{crumb.name}</span>
                )}
                {idx < breadcrumbs.length - 1 && (
                  <span className="breadcrumb__sep" style={{ color: 'var(--gray2)' }}>
                    /
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="container" style={{ padding: '28px 20px 20px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 3vw, 32px)',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'var(--white2)',
            marginBottom: '8px',
          }}
        >
          Пункты выдачи заказов
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--gray3)', maxWidth: '680px' }}>
          Выберите удобный пункт выдачи для получения заказа. Все наши магазины оборудованы 
          зонами примерки и проверки товара.
        </p>
      </div>

      {/* Pickup Points List */}
      <div className="container" style={{ padding: '20px 20px 60px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px',
          }}
        >
          {pickupPoints.map((point) => (
            <div
              key={point.id}
              className="pickup-card"
              style={{
                background: 'var(--black2)',
                border: '1px solid var(--gray1)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                transition: 'border-color var(--tr)',
              }}
            >
              {/* Map Placeholder */}
              <div
                style={{
                  height: '240px',
                  background: 'var(--black3)',
                  borderBottom: '1px solid var(--gray1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    textAlign: 'center',
                    color: 'var(--gray3)',
                    padding: '20px',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: '48px', height: '48px', margin: '0 auto 12px', color: 'var(--orange)' }}
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  <p style={{ fontSize: '13px', marginBottom: '12px' }}>
                    {point.city}, {point.address}
                  </p>
                  <a
                    href={point.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: 'var(--orange)',
                      textDecoration: 'none',
                      padding: '6px 12px',
                      background: 'rgba(255,106,0,0.1)',
                      borderRadius: 'var(--radius)',
                      transition: 'background var(--tr)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,106,0,0.2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,106,0,0.1)')}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ width: '14px', height: '14px' }}
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Открыть на карте
                  </a>
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '20px' }}>
                {/* City Badge */}
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    background: 'var(--orange)',
                    color: '#fff',
                    fontSize: '11px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    borderRadius: 'var(--radius)',
                    marginBottom: '12px',
                  }}
                >
                  {point.city}
                </span>

                {/* Info Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      fontSize: '14px',
                      color: 'var(--gray4)',
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ width: '18px', height: '18px', color: 'var(--gray3)', flexShrink: 0, marginTop: '2px' }}
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--gray3)', marginBottom: '2px' }}>Адрес:</div>
                      <div style={{ color: 'var(--white)' }}>{point.address}</div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      fontSize: '14px',
                      color: 'var(--gray4)',
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ width: '18px', height: '18px', color: 'var(--gray3)', flexShrink: 0, marginTop: '2px' }}
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.19 11.9 19.79 19.79 0 0 1 1.12 3.29 2 2 0 0 1 3.09 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z" />
                    </svg>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--gray3)', marginBottom: '2px' }}>Телефон:</div>
                      <a
                        href={`tel:${point.phone.replace(/[^0-9]/g, '')}`}
                        style={{ color: 'var(--orange)', textDecoration: 'none', transition: 'color var(--tr)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--orange2)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--orange)')}
                      >
                        {point.phone}
                      </a>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      fontSize: '14px',
                      color: 'var(--gray4)',
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ width: '18px', height: '18px', color: 'var(--gray3)', flexShrink: 0, marginTop: '2px' }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--gray3)', marginBottom: '2px' }}>Режим работы:</div>
                      <div style={{ color: 'var(--white)' }}>{point.hours}</div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div
                  style={{
                    paddingTop: '16px',
                    borderTop: '1px solid var(--gray1)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--gray3)', marginBottom: '10px' }}>
                    Услуги:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {point.features.map((feature) => (
                      <span
                        key={feature}
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          background: 'var(--black3)',
                          border: '1px solid var(--gray1)',
                          borderRadius: 'var(--radius)',
                          fontSize: '11px',
                          color: 'var(--gray4)',
                        }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div
          style={{
            marginTop: '40px',
            padding: '24px',
            background: 'var(--black2)',
            border: '1px solid var(--gray1)',
            borderRadius: 'var(--radius)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'var(--white2)',
              marginBottom: '16px',
            }}
          >
            Как получить заказ в пункте выдачи
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', gap: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--orange)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>1</span>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white)', marginBottom: '4px' }}>
                  Оформите заказ на сайте
                </div>
                <div style={{ fontSize: '12px', color: 'var(--gray3)' }}>
                  Выберите товары и укажите пункт выдачи при оформлении
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--orange)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>2</span>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white)', marginBottom: '4px' }}>
                  Дождитесь уведомления
                </div>
                <div style={{ fontSize: '12px', color: 'var(--gray3)' }}>
                  Мы сообщим о поступлении заказа в пункт выдачи
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--orange)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>3</span>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white)', marginBottom: '4px' }}>
                  Получите заказ
                </div>
                <div style={{ fontSize: '12px', color: 'var(--gray3)' }}>
                  Приходите в пункт выдачи с паспортом и номером заказа
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
