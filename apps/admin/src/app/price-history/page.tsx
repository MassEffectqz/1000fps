'use client';

import { useState, useMemo } from 'react';
import { usePriceHistory } from '@/hooks/useApi';

interface PriceHistoryEntry {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
  changedAt: string;
  changedBy: string;
}

export default function PriceHistoryPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'increase' | 'decrease'>('all');
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data: historyData, isLoading } = usePriceHistory({ page, limit });
  const priceHistory = ((historyData as unknown as { data?: PriceHistoryEntry[] })?.data) || [];

  const filteredHistory = useMemo(() => {
    return priceHistory.filter((item) => {
      const matchesSearch =
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.productSku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        selectedType === 'all' ||
        (selectedType === 'increase' && item.newPrice > item.oldPrice) ||
        (selectedType === 'decrease' && item.newPrice < item.oldPrice);
      return matchesSearch && matchesType;
    });
  }, [priceHistory, searchQuery, selectedType]);

  const stats = useMemo(() => ({
    decrease: priceHistory.filter(item => item.newPrice < item.oldPrice).length,
    increase: priceHistory.filter(item => item.newPrice > item.oldPrice).length,
    total: priceHistory.length,
  }), [priceHistory]);

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
        Загрузка истории цен...
      </div>
    );
  }

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-c gap-10 mb-16" style={{ justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            История цен
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>
            Отслеживание изменений цен товаров
          </p>
        </div>
        <button className="btn btn--ghost">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="14"
            height="14"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m7-5v10l5-5-5-5z" />
          </svg>
          Экспорт
        </button>
      </div>

      {/* STATS */}
      <div className="stats-grid mb-16" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-val" style={{ fontSize: '20px', color: 'var(--green)' }}>
            {stats.decrease}
          </div>
          <div className="stat-label">Снижений</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ fontSize: '20px', color: 'var(--red)' }}>
            {stats.increase}
          </div>
          <div className="stat-label">Повышений</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ fontSize: '20px', color: 'var(--blue)' }}>
            {stats.total}
          </div>
          <div className="stat-label">Всего изменений</div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card mb-16">
        <div className="card__body" style={{ padding: '14px 18px' }}>
          <div className="flex flex-c gap-10" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div className="header-search" style={{ width: '100%' }}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ width: '13px', height: '13px' }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Поиск по названию или SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div style={{ width: '200px' }}>
              <select
                className="form-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as 'all' | 'increase' | 'decrease')}
              >
                <option value="all">Все изменения</option>
                <option value="increase">Повышения</option>
                <option value="decrease">Снижения</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="card__head">
          <span className="card__title">Изменения цен ({filteredHistory.length})</span>
        </div>
        <div className="card__body card__body--flush">
          <table className="tbl">
            <thead>
              <tr>
                <th>Товар</th>
                <th>SKU</th>
                <th style={{ textAlign: 'right' }}>Старая цена</th>
                <th style={{ textAlign: 'right' }}>Новая цена</th>
                <th style={{ textAlign: 'right' }}>Изменение</th>
                <th>Дата</th>
                <th>Кем изменено</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-3)' }}>
                    {priceHistory.length === 0 ? 'Нет записей' : 'Нет записей по выбранным фильтрам'}
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => {
                  const change = item.newPrice - item.oldPrice;
                  const isIncrease = change > 0;
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="text-white fw700">{item.productName}</div>
                      </td>
                      <td className="mono f11">{item.productSku}</td>
                      <td className="text-right text-muted">
                        {item.oldPrice.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="text-right text-white fw700">
                        {item.newPrice.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="text-right">
                        <span
                          className={`badge badge--${isIncrease ? 'red' : 'green'}`}
                          style={{ minWidth: '80px', justifyContent: 'flex-end' }}
                        >
                          {isIncrease ? '+' : ''}
                          {change.toLocaleString('ru-RU')} ₽ ({isIncrease ? '+' : ''}
                          {item.changePercent}%)
                        </span>
                      </td>
                      <td className="mono f11">{new Date(item.changedAt).toLocaleString('ru-RU')}</td>
                      <td>{item.changedBy}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
