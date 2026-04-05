import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AdminAnalyticsPage from '@/app/admin/analytics/page';

global.fetch = vi.fn();

describe('AdminAnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAnalyticsData = {
    overview: {
      totalUsers: 1000,
      totalProducts: 500,
      totalOrders: 250,
      totalRevenue: 1500000,
    },
    today: {
      orders: 15,
      revenue: 75000,
      newUsers: 5,
    },
    week: {
      orders: 80,
      revenue: 400000,
      newUsers: 25,
    },
    month: {
      orders: 300,
      revenue: 1200000,
      newUsers: 100,
    },
    orderStatuses: {
      PENDING: 10,
      CONFIRMED: 20,
      PAID: 100,
      SHIPPING: 50,
      DELIVERED: 60,
      CANCELLED: 10,
    },
    topProducts: [
      {
        id: '1',
        name: 'Видеокарта RTX 4090',
        slug: 'rtx-4090',
        sku: 'GPU-001',
        price: 150000,
        salesCount: 50,
        stock: 10,
        category: { name: 'Видеокарты' },
      },
    ],
    categoryStats: [
      { id: '1', name: 'Видеокарты', slug: 'video-cards', _count: { products: 100 } },
    ],
    lowStockProducts: 5,
    warehouseStats: [
      { id: '1', name: 'Основной', city: 'Москва', _count: { stock: 500 } },
    ],
  };

  it('должен показывать состояние загрузки', () => {
    (fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));

    render(<AdminAnalyticsPage />);

    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('должен показывать основную статистику', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalyticsData,
    });

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('1 000')).toBeInTheDocument();
    });

    expect(screen.getByText('500')).toBeInTheDocument();
    // Проверяем текст "250 всего" в карточке заказов
    expect(screen.getByText(/250\s*всего/)).toBeInTheDocument();
    // Проверяем выручку с форматированием
    expect(screen.getByText(/1\s*500\s*000\s*₽\s*всего/)).toBeInTheDocument();
  });

  it('должен показывать ошибку при неудачной загрузке', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('Ошибка загрузки данных')).toBeInTheDocument();
    });
  });
});
