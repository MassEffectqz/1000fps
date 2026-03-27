'use client';

import { useState } from 'react';
import { useWarehouses } from '@/hooks/useApi';

interface Warehouse {
  id: number;
  name: string;
  address: string;
  phone?: string;
  totalProducts: number;
  reservedProducts: number;
  availableProducts: number;
}

export default function WarehousesPanel() {
  const [_showModal, _setShowModal] = useState(false);

  const { data: warehousesData, isLoading } = useWarehouses();
  const warehouses = ((warehousesData as unknown as { data?: Warehouse[] })?.data) || [];

  if (isLoading) {
    return (
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
        Загрузка складов...
      </div>
    );
  }

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-c gap-10 mb-16" style={{ justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            Склады
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>
            Управление складами и остатками
          </p>
        </div>
        <button className="btn btn--primary">
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
          Добавить склад
        </button>
      </div>

      {/* WAREHOUSE GRID */}
      <div className="warehouse-grid">
        {warehouses.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-3)' }}>
            Нет складов
          </div>
        ) : (
          warehouses.map((wh) => (
            <div key={wh.id} className="wh-card">
              <div className="wh-card__top">
                <div>
                  <div className="wh-name">{wh.name}</div>
                  <div className="wh-addr">{wh.address}</div>
                  {wh.phone && <div className="wh-phone f12 text-muted" style={{ marginTop: '4px' }}>{wh.phone}</div>}
                </div>
                <button className="btn btn--ghost btn--sm">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    width="14"
                    height="14"
                  >
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
              <div className="wh-stats">
                <div className="wh-stat">
                  <div className="wh-stat__val">{wh.totalProducts}</div>
                  <div className="wh-stat__lbl">Всего</div>
                </div>
                <div className="wh-stat">
                  <div className="wh-stat__val" style={{ color: 'var(--yellow)' }}>
                    {wh.reservedProducts}
                  </div>
                  <div className="wh-stat__lbl">Зарез.</div>
                </div>
                <div className="wh-stat">
                  <div className="wh-stat__val" style={{ color: 'var(--green)' }}>
                    {wh.availableProducts}
                  </div>
                  <div className="wh-stat__lbl">Доступно</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* STOCK MOVEMENT - Placeholder */}
      <div className="card mt-24">
        <div className="card__head">
          <span className="card__title">Последние перемещения</span>
        </div>
        <div className="card__body" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-3)' }}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ width: '48px', height: '48px', margin: '0 auto 12px', opacity: 0.5 }}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <p style={{ fontSize: '14px', marginBottom: '4px' }}>Функционал перемещений в разработке</p>
          <p style={{ fontSize: '12px' }}>Скоро будет добавлен</p>
        </div>
      </div>
    </>
  );
}
