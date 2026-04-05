/**
 * Component тесты для ProductParserConfig
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ProductParserConfig } from '@/components/ui/product-parser-config';

// Мокаем ParserStatus (подкомпонент)
vi.mock('@/components/ui/parser-status', () => ({
  ParserStatus: ({ status, onRefresh, isLoading, progress }: { status: { status: string }; onRefresh?: () => void; isLoading?: boolean; progress?: { processed: number; total: number } | null; extensionAvailable?: boolean | null }) => (
    <div data-testid="parser-status">
      <span data-testid="status-value">{status.status}</span>
      {progress && <span data-testid="progress">{progress.processed}/{progress.total}</span>}
      {onRefresh && <button onClick={onRefresh} disabled={isLoading}>Refresh</button>}
    </div>
  ),
}));

// Мокаем cn
vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' '),
}));

describe('ProductParserConfig', () => {
  const defaultProps = {
    productId: 'prod_1',
    useParserPrice: false,
    parseSources: [] as Array<{ url: string; priority: number; isActive: boolean }>,
    parserStatus: { status: 'idle' as const },
    isParsing: false,
    parseProgress: null as { processed: number; total: number } | null,
    extensionAvailable: null as boolean | null,
    onToggleParserPrice: vi.fn(),
    onUpdateSources: vi.fn(),
    onParse: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Render sources list', () => {
    it('должен рендерить источники парсинга', () => {
      const props = {
        ...defaultProps,
        parseSources: [
          { url: 'https://example.com/1', priority: 0, isActive: true },
          { url: 'https://example.com/2', priority: 1, isActive: false },
        ],
      };
      render(<ProductParserConfig {...props} />);

      expect(screen.getByText('https://example.com/1')).toBeInTheDocument();
      expect(screen.getByText('https://example.com/2')).toBeInTheDocument();
    });

    it('должен показать "Активен" / "Откл" для каждого источника', () => {
      const props = {
        ...defaultProps,
        parseSources: [
          { url: 'https://example.com/1', priority: 0, isActive: true },
          { url: 'https://example.com/2', priority: 1, isActive: false },
        ],
      };
      render(<ProductParserConfig {...props} />);

      expect(screen.getByText('Активен')).toBeInTheDocument();
      expect(screen.getByText('Откл')).toBeInTheDocument();
    });

    it('должен показать номера приоритетов', () => {
      const props = {
        ...defaultProps,
        parseSources: [
          { url: 'https://example.com/1', priority: 0, isActive: true },
          { url: 'https://example.com/2', priority: 1, isActive: true },
        ],
      };
      render(<ProductParserConfig {...props} />);

      // Приоритеты отображаются как "1" и "2" (index + 1)
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Add source', () => {
    it('должен добавить новый источник', async () => {
      const user = userEvent.setup();
      const props = {
        ...defaultProps,
        parseSources: [],
      };
      render(<ProductParserConfig {...props} />);

      const input = screen.getByPlaceholderText(/https:\/\/www.wildberries.ru/);
      await user.type(input, 'https://example.com/new');
      await user.click(screen.getByText('Добавить'));

      expect(props.onUpdateSources).toHaveBeenCalledWith([
        expect.objectContaining({
          url: 'https://example.com/new',
          priority: 0,
          isActive: true,
        }),
      ]);
    });
  });

  describe('Remove source', () => {
    it('должен удалить источник при клике на кнопку удаления', async () => {
      const user = userEvent.setup();
      const props = {
        ...defaultProps,
        parseSources: [
          { url: 'https://example.com/remove', priority: 0, isActive: true },
        ],
      };
      render(<ProductParserConfig {...props} />);

      // Находим кнопку удаления (SVG с line внутри button)
      const removeButtons = screen.getAllByRole('button');
      const removeBtn = removeButtons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg?.innerHTML.includes('x1="18" y1="6" x2="6" y2="18"');
      });

      expect(removeBtn).toBeDefined();
      if (removeBtn) {
        await user.click(removeBtn);
      }

      expect(props.onUpdateSources).toHaveBeenCalledWith([]);
    });
  });

  describe('URL validation', () => {
    it('должен показать ошибку при пустом URL', async () => {
      const user = userEvent.setup();
      render(<ProductParserConfig {...defaultProps} />);

      await user.click(screen.getByText('Добавить'));
      expect(screen.getByText('Введите URL')).toBeInTheDocument();
    });

    it('должен показать ошибку при невалидном URL', async () => {
      const user = userEvent.setup();
      render(<ProductParserConfig {...defaultProps} />);

      const input = screen.getByPlaceholderText(/https:\/\/www.wildberries.ru/);
      await user.type(input, 'not-a-url');
      await user.click(screen.getByText('Добавить'));

      expect(screen.getByText('Некорректный URL')).toBeInTheDocument();
    });

    it('должен показать ошибку для не-http протокола', async () => {
      const user = userEvent.setup();
      render(<ProductParserConfig {...defaultProps} />);

      const input = screen.getByPlaceholderText(/https:\/\/www.wildberries.ru/);
      await user.type(input, 'ftp://example.com');
      await user.click(screen.getByText('Добавить'));

      expect(screen.getByText(/Поддерживаются только http/)).toBeInTheDocument();
    });

    it('должен очистить ошибку при вводе', async () => {
      const user = userEvent.setup();
      render(<ProductParserConfig {...defaultProps} />);

      const input = screen.getByPlaceholderText(/https:\/\/www.wildberries.ru/);
      // Сначала вызываем ошибку
      await user.click(screen.getByText('Добавить'));
      expect(screen.getByText('Введите URL')).toBeInTheDocument();

      // Затем вводим значение
      await user.type(input, 'https://example.com');
      expect(screen.queryByText('Введите URL')).not.toBeInTheDocument();
    });
  });

  describe('Parse button', () => {
    it('должен быть disabled когда нет источников', () => {
      render(<ProductParserConfig {...defaultProps} />);
      const button = screen.getByRole('button', { name: /запустить парсинг/i });
      expect(button).toBeDisabled();
    });

    it('должен быть enabled когда есть источники', () => {
      const props = {
        ...defaultProps,
        parseSources: [{ url: 'https://example.com/1', priority: 0, isActive: true }],
      };
      render(<ProductParserConfig {...props} />);
      const button = screen.getByRole('button', { name: /запустить парсинг/i });
      expect(button).not.toBeDisabled();
    });

    it('должен быть disabled когда isParsing = true', () => {
      const props = {
        ...defaultProps,
        parseSources: [{ url: 'https://example.com/1', priority: 0, isActive: true }],
        isParsing: true,
      };
      render(<ProductParserConfig {...props} />);
      const button = screen.getByRole('button', { name: /парсинг/i });
      expect(button).toBeDisabled();
    });

    it('должен показать "Парсинг..." когда isParsing = true', () => {
      const props = {
        ...defaultProps,
        parseSources: [{ url: 'https://example.com/1', priority: 0, isActive: true }],
        isParsing: true,
      };
      render(<ProductParserConfig {...props} />);
      expect(screen.getByText('Парсинг...')).toBeInTheDocument();
    });

    it('должен вызвать onParse при клике', async () => {
      const user = userEvent.setup();
      const props = {
        ...defaultProps,
        parseSources: [{ url: 'https://example.com/1', priority: 0, isActive: true }],
      };
      render(<ProductParserConfig {...props} />);

      const button = screen.getByRole('button', { name: /запустить парсинг/i });
      await user.click(button);

      expect(props.onParse).toHaveBeenCalledTimes(1);
    });
  });

  describe('Parser price toggle', () => {
    it('должен вызвать onToggleParserPrice при клике на toggle', async () => {
      const user = userEvent.setup();
      const props = {
        ...defaultProps,
        useParserPrice: false,
      };
      render(<ProductParserConfig {...props} />);

      // Toggle button — это первый button в компоненте (до "Добавить" и "Запустить парсинг")
      const allButtons = screen.getAllByRole('button');
      // Первый button — это toggle (без текста, но с role="button")
      const toggleBtn = allButtons[0];

      await user.click(toggleBtn);
      expect(props.onToggleParserPrice).toHaveBeenCalledWith(true);
    });

    it('должен показать сообщение о автообновлении когда useParserPrice = true', () => {
      const props = {
        ...defaultProps,
        useParserPrice: true,
      };
      render(<ProductParserConfig {...props} />);
      expect(screen.getByText('Цены обновляются автоматически при парсинге')).toBeInTheDocument();
    });
  });
});
