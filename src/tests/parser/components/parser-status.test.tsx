/**
 * Component тесты для ParserStatus
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ParserStatus } from '@/components/ui/parser-status';
import type { ParserStatusData } from '@/components/ui/parser-status';

// Мокаем cn
vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' '),
}));

describe('ParserStatus', () => {
  const defaultStatus: ParserStatusData = {
    status: 'idle',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderStatus(overrides: Partial<ParserStatusData> = {}, extraProps = {}) {
    const status: ParserStatusData = { ...defaultStatus, ...overrides };
    return render(
      <ParserStatus
        status={status}
        onRefresh={vi.fn()}
        isLoading={false}
        progress={null}
        extensionAvailable={null}
        {...extraProps}
      />
    );
  }

  describe('Idle state', () => {
    it('должен показать "Парсинг не выполнялся"', () => {
      renderStatus({ status: 'idle' });
      expect(screen.getByText('Парсинг не выполнялся')).toBeInTheDocument();
    });

    it('должен показать описание по умолчанию', () => {
      renderStatus({ status: 'idle' });
      expect(screen.getByText('Запустите парсинг для получения данных')).toBeInTheDocument();
    });
  });

  describe('Parsing state', () => {
    it('должен показать "Парсинг..."', () => {
      renderStatus({ status: 'parsing' });
      expect(screen.getByText('Парсинг...')).toBeInTheDocument();
    });

    it('должен показать описание по умолчанию', () => {
      renderStatus({ status: 'parsing' });
      expect(screen.getByText('Получение данных из источников')).toBeInTheDocument();
    });
  });

  describe('Success state with data', () => {
    it('должен показать "Данные получены"', () => {
      renderStatus({ status: 'success' });
      expect(screen.getByText('Данные получены')).toBeInTheDocument();
    });

    it('должен показать lastParsedAt', () => {
      const lastParsedAt = new Date('2026-04-01T12:00:00Z');
      renderStatus({ status: 'success', lastParsedAt });
      expect(screen.getByText(/Обновлено:/)).toBeInTheDocument();
    });

    it('должен показать распарсенные данные (price, oldPrice, brand, rating)', () => {
      renderStatus(
        {
          status: 'success',
          parsedData: {
            price: 15000,
            oldPrice: 20000,
            brand: 'TestBrand',
            rating: 4.5,
          },
        }
      );

      expect(screen.getByText('Цена')).toBeInTheDocument();
      // Текст "15 000 ₽" разбит на 2 элемента (число и символ валюты), используем regex
      expect(screen.getByText(/15.*000/)).toBeInTheDocument();
      expect(screen.getByText('Старая цена')).toBeInTheDocument();
      expect(screen.getByText(/20.*000/)).toBeInTheDocument();
      expect(screen.getByText('Бренд')).toBeInTheDocument();
      expect(screen.getByText('TestBrand')).toBeInTheDocument();
      expect(screen.getByText('Рейтинг')).toBeInTheDocument();
    });

    it('должен показать "Успешно" если нет lastParsedAt', () => {
      renderStatus({ status: 'success', lastParsedAt: null });
      expect(screen.getByText('Успешно')).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('должен показать "Ошибка парсинга"', () => {
      renderStatus({ status: 'error' });
      expect(screen.getByText('Ошибка парсинга')).toBeInTheDocument();
    });

    it('должен показать errorMessage', () => {
      renderStatus({
        status: 'error',
        errorMessage: 'Таймаут соединения',
      });
      expect(screen.getByText('Таймаут соединения')).toBeInTheDocument();
    });

    it('должен показать дефолтное сообщение если нет errorMessage', () => {
      renderStatus({ status: 'error', errorMessage: null });
      expect(screen.getByText('Не удалось получить данные')).toBeInTheDocument();
    });
  });

  describe('not_found state', () => {
    it('должен показать "Нет данных"', () => {
      renderStatus({ status: 'not_found' });
      expect(screen.getByText('Нет данных')).toBeInTheDocument();
    });

    it('должен показать "Данные парсинга отсутствуют"', () => {
      renderStatus({ status: 'not_found' });
      expect(screen.getByText('Данные парсинга отсутствуют')).toBeInTheDocument();
    });
  });

  describe('Progress bar', () => {
    it('должен показать прогресс-бар в состоянии parsing с progress', () => {
      renderStatus(
        { status: 'parsing' },
        { progress: { processed: 3, total: 5 } }
      );

      expect(screen.getByText('Прогресс')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('3 обработано')).toBeInTheDocument();
      expect(screen.getByText('2 осталось')).toBeInTheDocument();
    });

    it('не должен показать прогресс-бар без progress', () => {
      renderStatus({ status: 'parsing' });
      expect(screen.queryByText('Прогресс')).not.toBeInTheDocument();
    });

    it('не должен показать прогресс-бар в состоянии success', () => {
      renderStatus(
        { status: 'success' },
        { progress: { processed: 5, total: 5 } }
      );
      expect(screen.queryByText('Прогресс')).not.toBeInTheDocument();
    });

    it('должен показать 0% когда processed = 0', () => {
      renderStatus(
        { status: 'parsing' },
        { progress: { processed: 0, total: 10 } }
      );
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('должен показать 100% когда processed = total', () => {
      renderStatus(
        { status: 'parsing' },
        { progress: { processed: 10, total: 10 } }
      );
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('Extension availability warning', () => {
    it('должен показать предупреждение если extensionAvailable = false', () => {
      renderStatus(
        { status: 'idle' },
        { extensionAvailable: false }
      );
      expect(screen.getByText('Расширение WB Parser не обнаружено')).toBeInTheDocument();
    });

    it('не должен показать предупреждение если extensionAvailable = true', () => {
      renderStatus(
        { status: 'idle' },
        { extensionAvailable: true }
      );
      expect(screen.queryByText('Расширение WB Parser не обнаружено')).not.toBeInTheDocument();
    });

    it('не должен показать предупреждение если extensionAvailable = null', () => {
      renderStatus(
        { status: 'idle' },
        { extensionAvailable: null }
      );
      expect(screen.queryByText('Расширение WB Parser не обнаружено')).not.toBeInTheDocument();
    });

    it('не должен показать предупреждение в состоянии parsing', () => {
      renderStatus(
        { status: 'parsing' },
        { extensionAvailable: false }
      );
      expect(screen.queryByText('Расширение WB Parser не обнаружено')).not.toBeInTheDocument();
    });
  });

  describe('Refresh button', () => {
    it('должен вызвать onRefresh при клике', async () => {
      const user = userEvent.setup();
      const onRefresh = vi.fn();
      render(
        <ParserStatus
          status={defaultStatus}
          onRefresh={onRefresh}
          isLoading={false}
        />
      );

      const refreshBtn = screen.getByTitle('Обновить данные');
      await user.click(refreshBtn);

      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    it('не должен показать refresh button в состоянии parsing', () => {
      renderStatus({ status: 'parsing' });
      const refreshBtn = screen.queryByTitle('Обновить данные');
      expect(refreshBtn).not.toBeInTheDocument();
    });

    it('должен disabled refresh button когда isLoading = true', async () => {
      const onRefresh = vi.fn();
      render(
        <ParserStatus
          status={defaultStatus}
          onRefresh={onRefresh}
          isLoading={true}
        />
      );

      const refreshBtn = screen.getByTitle('Обновить данные');
      expect(refreshBtn).toBeDisabled();
    });

    it('не должен показать refresh button если onRefresh не передан', () => {
      render(
        <ParserStatus
          status={defaultStatus}
        />
      );
      const refreshBtn = screen.queryByTitle('Обновить данные');
      expect(refreshBtn).not.toBeInTheDocument();
    });
  });
});
