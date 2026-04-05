'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ParserStatusData {
  status: 'idle' | 'parsing' | 'success' | 'error' | 'not_found';
  lastParsedAt?: Date | null;
  source?: string | null;
  errorMessage?: string | null;
  parsedData?: {
    name?: string;
    price?: number;
    oldPrice?: number;
    brand?: string;
    rating?: number;
    reviews?: number;
  };
}

interface ParserStatusProps {
  status: ParserStatusData;
  onRefresh?: () => void;
  isLoading?: boolean;
  /** Прогресс парсинга: обработано/всего источников */
  progress?: { processed: number; total: number } | null;
  /** Доступно ли расширение */
  extensionAvailable?: boolean | null;
}

export const ParserStatus: React.FC<ParserStatusProps> = ({
  status,
  onRefresh,
  isLoading = false,
  progress = null,
  extensionAvailable = null,
}) => {
  const getStatusConfig = () => {
    switch (status.status) {
      case 'parsing':
        return {
          bg: 'from-blue-500/10 to-blue-500/5',
          border: 'border-blue-500/20',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-blue-500 animate-spin">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
            </svg>
          ),
          title: 'Парсинг...',
          description: progress
            ? `Обработано ${progress.processed} из ${progress.total} источников`
            : 'Получение данных из источников',
        };
      case 'success':
        return {
          bg: 'from-green-500/10 to-green-500/5',
          border: 'border-green-500/20',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-green-500">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ),
          title: 'Данные получены',
          description: status.lastParsedAt
            ? `Обновлено: ${new Date(status.lastParsedAt).toLocaleString('ru-RU')}`
            : 'Успешно',
        };
      case 'error':
        return {
          bg: 'from-red-500/10 to-red-500/5',
          border: 'border-red-500/20',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-red-500">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          ),
          title: 'Ошибка парсинга',
          description: status.errorMessage || 'Не удалось получить данные',
        };
      case 'not_found':
        return {
          bg: 'from-gray-500/10 to-gray-500/5',
          border: 'border-gray-500/20',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-500">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ),
          title: 'Нет данных',
          description: 'Данные парсинга отсутствуют',
        };
      default:
        return {
          bg: 'from-gray-500/10 to-gray-500/5',
          border: 'border-gray-500/20',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-500">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ),
          title: 'Парсинг не выполнялся',
          description: 'Запустите парсинг для получения данных',
        };
    }
  };

  const config = getStatusConfig();

  // Вычисляем процент прогресса
  const progressPercent = progress && progress.total > 0
    ? Math.round((progress.processed / progress.total) * 100)
    : 0;

  return (
    <div className={cn(
      'p-4 rounded-[var(--radius)] bg-gradient-to-br border transition-colors',
      config.bg,
      config.border
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-white mb-1">
              {config.title}
            </div>
            <div className="text-[11px] text-gray4">
              {config.description}
            </div>

            {/* Прогресс-бар парсинга */}
            {progress && status.status === 'parsing' && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] text-gray4 mb-1">
                  <span>Прогресс</span>
                  <span className="text-white font-semibold">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-black3/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray4 mt-1">
                  <span>{progress.processed} обработано</span>
                  <span>{progress.total - progress.processed} осталось</span>
                </div>
              </div>
            )}

            {/* Индикатор доступности расширения (скрыт по умолчанию) */}
            {false && extensionAvailable === false && status.status !== 'parsing' && (
              <div className="mt-3 flex items-center gap-2 text-[10px] text-orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>Расширение WB Parser не обнаружено</span>
              </div>
            )}

            {/* Распарсенные данные */}
            {status.parsedData && status.status === 'success' && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {status.parsedData.price && (
                  <div className="bg-black3/50 rounded-[var(--radius-sm)] p-2">
                    <div className="text-[9px] text-gray4 uppercase">Цена</div>
                    <div className="text-[13px] font-bold text-orange">
                      {status.parsedData.price.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                )}
                {status.parsedData.oldPrice && (
                  <div className="bg-black3/50 rounded-[var(--radius-sm)] p-2">
                    <div className="text-[9px] text-gray4 uppercase">Старая цена</div>
                    <div className="text-[13px] font-bold text-gray4 line-through">
                      {status.parsedData.oldPrice.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                )}
                {status.parsedData.brand && (
                  <div className="bg-black3/50 rounded-[var(--radius-sm)] p-2">
                    <div className="text-[9px] text-gray4 uppercase">Бренд</div>
                    <div className="text-[12px] font-semibold text-white truncate">
                      {status.parsedData.brand}
                    </div>
                  </div>
                )}
                {status.parsedData.rating && (
                  <div className="bg-black3/50 rounded-[var(--radius-sm)] p-2">
                    <div className="text-[9px] text-gray4 uppercase">Рейтинг</div>
                    <div className="flex items-center gap-1">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-yellow-500">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-[12px] font-semibold text-white">
                        {status.parsedData.rating}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {onRefresh && status.status !== 'parsing' && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex-shrink-0 w-8 h-8 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray4 hover:text-orange hover:border-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Обновить данные"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cn(
              'w-4 h-4',
              isLoading && 'animate-spin'
            )}>
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ParserStatus;
