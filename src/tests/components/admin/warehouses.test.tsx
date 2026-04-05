import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminWarehousesPage from '@/app/admin/warehouses/page';

// Мок для fetch
global.fetch = vi.fn();

describe('AdminWarehousesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен показывать состояние загрузки', () => {
    (fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));

    render(<AdminWarehousesPage />);

    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('должен показывать список складов', async () => {
    const mockWarehouses = [
      {
        id: '1',
        name: 'Основной склад',
        city: 'Москва',
        address: 'ул. Складская, 1',
        phone: '+7 (495) 123-45-67',
        isActive: true,
        _count: { stock: 100 },
      },
    ];

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ warehouses: mockWarehouses, total: 1, page: 1, totalPages: 1 }),
    });

    render(<AdminWarehousesPage />);

    // Ждём загрузки данных
    await vi.waitFor(() => {
      expect(screen.getByText('Основной склад')).toBeInTheDocument();
    });

    // Используем getAllByText чтобы избежать конфликта с select
    expect(screen.getAllByText('Москва')[1]).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('должен показывать пустое состояние когда складов нет', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ warehouses: [], total: 0, page: 1, totalPages: 1 }),
    });

    render(<AdminWarehousesPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('Складов нет')).toBeInTheDocument();
    });
  });
});
