import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Мок для prisma
const mockPrisma = {
  warehouse: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn(async (fn) => fn(mockPrisma)),
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Warehouses API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/admin/warehouses', () => {
    it('должен возвращать список складов', async () => {
      const mockWarehouses = [
        { id: '1', name: 'Склад 1', city: 'Москва', isActive: true },
      ];

      mockPrisma.warehouse.findMany.mockResolvedValue(mockWarehouses);
      mockPrisma.warehouse.count.mockResolvedValue(1);

      const { GET } = await import('@/app/api/admin/warehouses/route');
      
      const request = new NextRequest('http://localhost:3000/api/admin/warehouses?page=1&limit=20');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.warehouses).toEqual(mockWarehouses);
      expect(data.total).toBe(1);
    });

    it('должен фильтровать по city', async () => {
      const mockWarehouses = [
        { id: '1', name: 'Склад 1', city: 'Москва', isActive: true },
      ];

      mockPrisma.warehouse.findMany.mockResolvedValue(mockWarehouses);
      mockPrisma.warehouse.count.mockResolvedValue(1);

      const { GET } = await import('@/app/api/admin/warehouses/route');
      
      const request = new NextRequest('http://localhost:3000/api/admin/warehouses?city=Москва');
      await GET(request);

      expect(mockPrisma.warehouse.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            city: 'Москва',
          }),
        })
      );
    });

    it('должен фильтровать по isActive', async () => {
      const mockWarehouses = [
        { id: '1', name: 'Склад 1', city: 'Москва', isActive: true },
      ];

      mockPrisma.warehouse.findMany.mockResolvedValue(mockWarehouses);
      mockPrisma.warehouse.count.mockResolvedValue(1);

      const { GET } = await import('@/app/api/admin/warehouses/route');
      
      const request = new NextRequest('http://localhost:3000/api/admin/warehouses?isActive=true');
      await GET(request);

      expect(mockPrisma.warehouse.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });
  });

  describe('POST /api/admin/warehouses', () => {
    it('должен создавать новый склад', async () => {
      const mockWarehouse = {
        id: '1',
        name: 'Новый склад',
        city: 'Москва',
        address: 'ул. Test',
        isActive: true,
      };

      mockPrisma.warehouse.create.mockResolvedValue(mockWarehouse);

      const { POST } = await import('@/app/api/admin/warehouses/route');
      
      const request = new NextRequest('http://localhost:3000/api/admin/warehouses', {
        method: 'POST',
        body: JSON.stringify(mockWarehouse),
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(mockWarehouse);
    });

    it('должен возвращать ошибку при невалидных данных', async () => {
      const { POST } = await import('@/app/api/admin/warehouses/route');
      
      const request = new NextRequest('http://localhost:3000/api/admin/warehouses', {
        method: 'POST',
        body: JSON.stringify({ name: '' }), // пустое название
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Некорректные данные');
    });
  });

  describe('GET /api/admin/warehouses/[id]', () => {
    it('должен возвращать склад по ID', async () => {
      const mockWarehouse = {
        id: '1',
        name: 'Склад 1',
        city: 'Москва',
        _count: { stock: 100 },
      };

      mockPrisma.warehouse.findUnique.mockResolvedValue(mockWarehouse);

      const { GET } = await import('@/app/api/admin/warehouses/[id]/route');
      
      const request = new NextRequest('http://localhost:3000/api/admin/warehouses/1');
      const response = await GET(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockWarehouse);
    });

    it('должен возвращать 404 если склад не найден', async () => {
      mockPrisma.warehouse.findUnique.mockResolvedValue(null);

      const { GET } = await import('@/app/api/admin/warehouses/[id]/route');
      
      const request = new NextRequest('http://localhost:3000/api/admin/warehouses/1');
      const response = await GET(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/admin/warehouses/[id]', () => {
    it('должен удалять склад без товаров', async () => {
      mockPrisma.warehouse.findUnique.mockResolvedValue({ 
        id: '1', 
        name: 'Склад',
        _count: { stock: 0 } // Нет товаров
      });
      mockPrisma.warehouse.delete.mockResolvedValue({});

      const { DELETE } = await import('@/app/api/admin/warehouses/[id]/route');

      const request = new NextRequest('http://localhost:3000/api/admin/warehouses/1');
      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('должен возвращать ошибку при удалении склада с товарами', async () => {
      mockPrisma.warehouse.findUnique.mockResolvedValue({ 
        id: '1', 
        name: 'Склад',
        _count: { stock: 5 } // Есть товары
      });

      const { DELETE } = await import('@/app/api/admin/warehouses/[id]/route');

      const request = new NextRequest('http://localhost:3000/api/admin/warehouses/1');
      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) });

      // Ожидаем ошибку (склад не может быть удалён если есть товары)
      expect(response.status).toBe(400);
    });
  });
});
