'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ParserStatus, type ParserStatusData } from '@/components/ui/parser-status';

interface ParserSource {
  url: string;
  priority: number;
  isActive: boolean;
}

interface ProductParserConfigProps {
  productId: string;
  useParserPrice: boolean;
  parseSources: ParserSource[];
  parserStatus: ParserStatusData;
  isParsing: boolean;
  /** Прогресс парсинга */
  parseProgress?: { processed: number; total: number } | null;
  /** Доступно ли расширение */
  extensionAvailable?: boolean | null;
  onToggleParserPrice: (enabled: boolean) => void;
  onUpdateSources: (sources: ParserSource[]) => void;
  onParse: () => void;
}

export const ProductParserConfig: React.FC<ProductParserConfigProps> = ({
  useParserPrice,
  parseSources,
  parserStatus,
  isParsing,
  parseProgress = null,
  extensionAvailable = null,
  onToggleParserPrice,
  onUpdateSources,
  onParse,
}) => {
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState('');

  // Добавить источник
  const handleAddSource = useCallback(() => {
    if (!newUrl.trim()) {
      setError('Введите URL');
      return;
    }

    // Валидация URL
    try {
      const parsedUrl = new URL(newUrl.trim());
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        setError('Поддерживаются только http:// и https:// ссылки');
        return;
      }
    } catch {
      setError('Некорректный URL');
      return;
    }

    const newSource: ParserSource = {
      url: newUrl.trim(),
      priority: parseSources.length,
      isActive: true,
    };

    onUpdateSources([...parseSources, newSource]);
    setNewUrl('');
    setError('');
  }, [newUrl, parseSources, onUpdateSources]);

  // Удалить источник
  const handleRemoveSource = useCallback((url: string) => {
    const currentSources = [...parseSources]; // Копируем текущий массив
    const filtered = currentSources.filter(s => s.url !== url);
    // Пересчитываем приоритеты, создаем новые объекты
    const updated = filtered.map((s, i) => ({
      ...s,
      priority: i,
    }));
    console.log('[Parser] Remove source:', url, 'Result:', updated);
    onUpdateSources(updated);
  }, [parseSources, onUpdateSources]);

  // Изменить приоритет (вверх/вниз)
  const handleMoveSource = useCallback((url: string, direction: 'up' | 'down') => {
    const index = parseSources.findIndex(s => s.url === url);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= parseSources.length) return;

    const updated = [...parseSources];
    // Меняем местами приоритеты
    const tempPriority = updated[index].priority;
    updated[index].priority = updated[newIndex].priority;
    updated[newIndex].priority = tempPriority;
    // Сортируем
    updated.sort((a, b) => a.priority - b.priority);
    onUpdateSources(updated);
  }, [parseSources, onUpdateSources]);

  // Переключить активность источника
  const handleToggleSource = useCallback((url: string) => {
    const updated = parseSources.map(s =>
      s.url === url ? { ...s, isActive: !s.isActive } : s
    );
    onUpdateSources(updated);
  }, [parseSources, onUpdateSources]);

  return (
    <div className="space-y-6">
      {/* Toggle использования цен парсера */}
      <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-semibold text-white mb-1">
              Использовать цены с парсера
            </div>
            <div className="text-[11px] text-gray4">
              Автоматическое обновление цен из источников по приоритету
            </div>
          </div>
          <button
            type="button"
            onClick={() => onToggleParserPrice(!useParserPrice)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              useParserPrice ? 'bg-orange' : 'bg-gray1'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                useParserPrice ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {useParserPrice && (
          <div className="mt-3 pt-3 border-t border-gray1">
            <div className="flex items-center gap-2 text-[11px]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-green">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="text-green">
                Цены обновляются автоматически при парсинге
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Статус парсера */}
      <ParserStatus
        status={parserStatus}
        onRefresh={onParse}
        isLoading={isParsing}
        progress={parseProgress}
        extensionAvailable={extensionAvailable}
      />

      {/* Источники парсинга */}
      <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4">
        <div className="text-[13px] font-semibold text-white mb-3">
          Источники парсинга
        </div>
        <div className="text-[11px] text-gray4 mb-4">
          Добавьте ссылки на товары Wildberries. Цена будет браться из первого доступного источника.
        </div>

        {/* Список источников */}
        {parseSources.length > 0 && (
          <div className="space-y-2 mb-4">
            {parseSources.map((source, index) => (
              <div
                key={source.url}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-[var(--radius-sm)] border transition-colors',
                  source.isActive
                    ? 'bg-black3 border-gray1'
                    : 'bg-black1 border-gray1 opacity-50'
                )}
              >
                {/* Приоритет */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleMoveSource(source.url, 'up')}
                    disabled={index === 0}
                    className="text-gray4 hover:text-orange disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSource(source.url, 'down')}
                    disabled={index === parseSources.length - 1}
                    className="text-gray4 hover:text-orange disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>

                {/* Номер приоритета */}
                <div className="w-5 h-5 rounded-full bg-orange/20 text-orange text-[10px] font-bold flex items-center justify-center">
                  {index + 1}
                </div>

                {/* URL */}
                <div className="flex-1 min-w-0">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline truncate block"
                    title={source.url}
                  >
                    {source.url}
                  </a>
                </div>

                {/* Toggle активности */}
                <button
                  type="button"
                  onClick={() => handleToggleSource(source.url)}
                  className={cn(
                    'text-[10px] px-2 py-1 rounded transition-colors',
                    source.isActive
                      ? 'bg-green/20 text-green'
                      : 'bg-gray1 text-gray4'
                  )}
                >
                  {source.isActive ? 'Активен' : 'Откл'}
                </button>

                {/* Удалить */}
                <button
                  type="button"
                  onClick={() => handleRemoveSource(source.url)}
                  className="text-gray4 hover:text-red transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Добавить новый источник */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newUrl}
            onChange={(e) => {
              setNewUrl(e.target.value);
              if (error) setError('');
            }}
            placeholder="https://www.wildberries.ru/catalog/..."
            className="flex-1 bg-black3 border border-gray1 rounded-[var(--radius-sm)] px-3 py-2 text-[11px] text-white outline-none focus:border-orange transition-colors"
          />
          <button
            type="button"
            onClick={handleAddSource}
            className="px-4 py-2 bg-orange text-white text-[11px] font-semibold rounded-[var(--radius-sm)] hover:bg-orange/80 transition-colors"
          >
            Добавить
          </button>
        </div>
        {error && (
          <div className="mt-2 text-[11px] text-red">{error}</div>
        )}
      </div>

      {/* Кнопка запуска */}
      <button
        type="button"
        onClick={onParse}
        disabled={parseSources.length === 0 || isParsing}
        className={cn(
          'w-full py-3 rounded-[var(--radius)] text-[12px] font-semibold uppercase tracking-wider transition-colors',
          parseSources.length > 0 && !isParsing
            ? 'bg-orange text-white hover:bg-orange/80'
            : 'bg-gray1 text-gray4 cursor-not-allowed'
        )}
      >
        {isParsing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Парсинг...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Запустить парсинг сейчас
          </span>
        )}
      </button>
    </div>
  );
};

export default ProductParserConfig;
