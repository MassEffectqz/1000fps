'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ParseSourceInputProps {
  sources: string[];
  onChange: (sources: string[]) => void;
  disabled?: boolean;
}

/**
 * Компонент ввода ссылок/артикулов для парсинга с приоритетами
 * Приоритет определяется порядком в списке (первый - самый важный)
 */
export const ParseSourceInput: React.FC<ParseSourceInputProps> = ({
  sources,
  onChange,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddSource = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Проверяем что это ссылка или артикул
    const isValid = trimmed.includes('wildberries.ru') || /^\d+$/.test(trimmed);
    
    if (!isValid) {
      alert('Введите ссылку на WB или артикул (только цифры)');
      return;
    }

    onChange([...sources, trimmed]);
    setInputValue('');
  }, [inputValue, sources, onChange]);

  const handleRemoveSource = useCallback((index: number) => {
    onChange(sources.filter((_, i) => i !== index));
  }, [sources, onChange]);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    const newSources = [...sources];
    [newSources[index - 1], newSources[index]] = [newSources[index], newSources[index - 1]];
    onChange(newSources);
  }, [sources, onChange]);

  const handleMoveDown = useCallback((index: number) => {
    if (index === sources.length - 1) return;
    const newSources = [...sources];
    [newSources[index], newSources[index + 1]] = [newSources[index + 1], newSources[index]];
    onChange(newSources);
  }, [sources, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSource();
    }
  }, [handleAddSource]);

  const getPriorityLabel = (index: number) => {
    if (index === 0) return 'Основной';
    if (index === 1) return 'Резервный 1';
    if (index === 2) return 'Резервный 2';
    return `Резервный ${index}`;
  };

  const extractArticle = (source: string) => {
    if (source.includes('wildberries.ru')) {
      const match = source.match(/catalog\/(\d+)\.aspx/);
      return match ? match[1] : source;
    }
    return source;
  };

  return (
    <div className="space-y-4">
      {/* Поле ввода */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ссылка на WB или артикул (например: 12345678)"
            disabled={disabled}
            className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-4 py-[8px] text-white text-[13px] outline-none focus:border-orange transition-colors disabled:opacity-50"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray4">
            Enter для добавления
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddSource}
          disabled={disabled || !inputValue.trim()}
          className="px-4 py-[8px] bg-orange text-white rounded-[var(--radius)] text-[13px] font-semibold hover:bg-orange2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M12 8v8M8 12h8" />
          </svg>
        </button>
      </div>

      {/* Подсказка */}
      <div className="text-[11px] text-gray4">
        <span className="text-orange">•</span> Приоритет определяется порядком. 
        Система попробует спарсить первую ссылку, если ошибка — вторую и т.д.
      </div>

      {/* Список источников */}
      {sources.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] text-gray3 uppercase tracking-wider">
            <span>Источники ({sources.length})</span>
            <span>Приоритет</span>
          </div>
          
          {sources.map((source, index) => (
            <div
              key={`${source}-${index}`}
              className={cn(
                'flex items-center gap-3 p-3 bg-black3 border rounded-[var(--radius)] transition-colors',
                index === 0 ? 'border-orange/50' : 'border-gray1'
              )}
            >
              {/* Индикатор приоритета */}
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                index === 0 ? 'bg-orange text-white' : 'bg-gray-600 text-gray-300'
              )}>
                {index + 1}
              </div>

              {/* Информация */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-orange uppercase">
                    {getPriorityLabel(index)}
                  </span>
                  {index === 0 && (
                    <span className="text-[9px] bg-orange/20 text-orange px-2 py-[1px] rounded">
                      Основной
                    </span>
                  )}
                </div>
                <div className="text-[12px] text-gray4 truncate font-mono">
                  {extractArticle(source)}
                </div>
                <div className="text-[10px] text-gray5 truncate">
                  {source}
                </div>
              </div>

              {/* Кнопки управления */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0 || disabled}
                  className="w-7 h-7 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray4 transition-colors hover:border-orange hover:text-orange disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Выше (выше приоритет)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === sources.length - 1 || disabled}
                  className="w-7 h-7 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray4 transition-colors hover:border-orange hover:text-orange disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Ниже (ниже приоритет)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveSource(index)}
                  disabled={disabled}
                  className="w-7 h-7 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray4 transition-colors hover:border-red-500 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Удалить"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Пустое состояние */}
      {sources.length === 0 && (
        <div className="text-center py-8 bg-black3 border border-gray1 rounded-[var(--radius)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mx-auto mb-3 text-gray4 opacity-50">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <div className="text-[13px] text-gray4 mb-1">Нет источников для парсинга</div>
          <div className="text-[11px] text-gray5">Добавьте ссылку или артикул WB</div>
        </div>
      )}
    </div>
  );
};

export default ParseSourceInput;
