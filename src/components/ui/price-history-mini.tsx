'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface PriceHistoryPoint {
  price: number;
  oldPrice?: number | null;
  date: Date | string;
  source?: string;
}

interface PriceHistoryMiniProps {
  history: PriceHistoryPoint[];
  className?: string;
}

export const PriceHistoryMini: React.FC<PriceHistoryMiniProps> = ({
  history,
  className,
}) => {
  const chartData = useMemo(() => {
    if (history.length === 0) return null;

    const sorted = [...history].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const prices = sorted.map(h => h.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Нормализуем цены для отображения (0-100%)
    const normalizedPrices = prices.map(price => {
      if (priceRange === 0) return 50;
      return 100 - ((price - minPrice) / priceRange) * 80 - 10;
    });

    // Создаём SVG path для графика
    const width = 100;
    const height = 40;
    const points = normalizedPrices.map((normY, index) => {
      const x = (index / (normalizedPrices.length - 1 || 1)) * width;
      const y = (normY / 100) * height;
      return `${x},${y}`;
    }).join(' ');

    // Вычисляем тренд
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const change = lastPrice - firstPrice;
    const changePercent = firstPrice > 0 ? (change / firstPrice) * 100 : 0;

    return {
      points,
      minPrice,
      maxPrice,
      currentPrice: lastPrice,
      change,
      changePercent,
      sorted,
    };
  }, [history]);

  if (history.length === 0 || !chartData) {
    return (
      <div className={cn('text-center py-6', className)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 mx-auto mb-2 text-gray4 opacity-50">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        <div className="text-[11px] text-gray4">Нет истории изменений</div>
      </div>
    );
  }

  const { points, minPrice, maxPrice, currentPrice, change, changePercent, sorted } = chartData;
  const isPositive = change <= 0; // Положительно когда цена снижается

  return (
    <div className={cn('space-y-3', className)}>
      {/* Заголовок с текущей ценой */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[9px] text-gray4 uppercase tracking-wider mb-1">
            Текущая цена
          </div>
          <div className="font-display text-[20px] font-extrabold text-orange">
            {currentPrice.toLocaleString('ru-RU')} ₽
          </div>
        </div>
        <div className={cn(
          'px-2 py-1 rounded-[var(--radius-sm)] text-[10px] font-bold',
          isPositive 
            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
            : 'bg-red-500/10 text-red-500 border border-red-500/20'
        )}>
          {change > 0 ? '+' : ''}{changePercent.toFixed(1)}%
        </div>
      </div>

      {/* График */}
      <div className="relative h-10 bg-black3 rounded-[var(--radius-sm)] overflow-hidden">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
          {/* Градиент */}
          <defs>
            <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-orange)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--color-orange)" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Область под графиком */}
          <polygon
            points={`0,40 ${points} 100,40`}
            fill="url(#priceGradient)"
          />
          
          {/* Линия графика */}
          <polyline
            points={points}
            fill="none"
            stroke="var(--color-orange)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Точки */}
          {sorted.map((point, index) => {
            const x = (index / (sorted.length - 1 || 1)) * 100;
            const price = point.price;
            const normY = 100 - ((price - minPrice) / (maxPrice - minPrice || 1)) * 80 - 10;
            const y = (normY / 100) * 40;
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1.5"
                fill="var(--color-black2)"
                stroke="var(--color-orange)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
      </div>

      {/* Мин/Макс цены */}
      <div className="flex items-center justify-between text-[9px] text-gray4">
        <div>
          <span className="text-gray5">Мин: </span>
          <span className="text-green-500 font-semibold">{minPrice.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div>
          <span className="text-gray5">Макс: </span>
          <span className="text-red-500 font-semibold">{maxPrice.toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>

      {/* Последнее обновление */}
      {sorted.length > 0 && (
        <div className="text-[9px] text-gray5 text-center">
          Последнее обновление: {new Date(sorted[sorted.length - 1].date).toLocaleString('ru-RU')}
        </div>
      )}
    </div>
  );
};

export default PriceHistoryMini;
