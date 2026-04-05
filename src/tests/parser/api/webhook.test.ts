/**
 * Integration тесты для Webhook endpoint: POST /api/admin/parser/webhook
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Импортируем настоящий Decimal для использования в моках
const { Decimal } = await import('@prisma/client/runtime/library');

// ==================== MOCKS ====================

const mockPrisma = {
  product: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  parseJob: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  productSupplier: {
    upsert: vi.fn(),
  },
  priceHistory: {
    create: vi.fn(),
  },
  $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => {
    const txMock = {
      product: {
        findUnique: mockPrisma.product.findUnique,
        update: mockPrisma.product.update,
      },
      parseJob: {
        findFirst: mockPrisma.parseJob.findFirst,
        create: mockPrisma.parseJob.create,
        update: mockPrisma.parseJob.update,
      },
      productSupplier: {
        upsert: mockPrisma.productSupplier.upsert,
      },
      priceHistory: {
        create: mockPrisma.priceHistory.create,
      },
    };
    return fn(txMock);
  }),
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Мокаем Prisma.DbNull
vi.mock('@prisma/client', () => ({
  Prisma: {
    DbNull: Symbol('DbNull'),
    JsonNull: Symbol('JsonNull'),
  },
}));

describe('Webhook API — POST /api/admin/parser/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function callWebhook(body: Record<string, unknown>) {
    const { POST } = await import('@/app/api/admin/parser/webhook/route');
    const request = new NextRequest('http://localhost:3000/api/admin/parser/webhook', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return POST(request);
  }

  describe('OPTIONS', () => {
    it('должен вернуть 204 для CORS preflight', async () => {
      const { OPTIONS } = await import('@/app/api/admin/parser/webhook/route');
      const response = await OPTIONS();
      expect(response.status).toBe(204);
    });
  });

  describe('Validation', () => {
    it('должен вернуть 400 для невалидного payload', async () => {
      const response = await callWebhook({ status: 'INVALID_STATUS' });
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('должен вернуть 400 если productId отсутствует и это не batch', async () => {
      const response = await callWebhook({
        jobId: 'job_123',
        status: 'COMPLETED',
      });
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('productId');
    });
  });

  describe('Batch processing (productId = __BATCH__)', () => {
    it('должен обработать batch completed с N+1 fix (single findMany)', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);

      const response = await callWebhook({
        jobId: 'batch_job_1',
        productId: '__BATCH__',
        status: 'COMPLETED',
        result: {
          parsedData: { results: [] },
          sources: ['https://example.com/1'],
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      // N+1 fix: findMany вызывается один раз для всех товаров
      expect(mockPrisma.product.findMany).toHaveBeenCalledTimes(1);
    });

    it('должен обработать batch FAILED статус', async () => {
      mockPrisma.parseJob.updateMany.mockResolvedValue({ count: 0 });

      const response = await callWebhook({
        jobId: 'batch_job_2',
        productId: '__BATCH__',
        status: 'FAILED',
        error: 'Parser error',
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Single product webhook', () => {
    it('должен вернуть 404 если товар не найден', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      const response = await callWebhook({
        jobId: 'job_123',
        productId: 'nonexistent',
        status: 'COMPLETED',
      });

      expect(response.status).toBe(404);
    });

    it('должен создать ParseJob если jobId новый', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod_1',
        useParserPrice: false,
        parserSources: [],
        name: 'Тест',
        price: new Decimal(1000),
      });
      mockPrisma.parseJob.findFirst.mockResolvedValue(null);
      mockPrisma.parseJob.create.mockResolvedValue({
        id: 'parsejob_1',
        jobId: 'job_123',
        productId: 'prod_1',
        status: 'COMPLETED',
      });

      const response = await callWebhook({
        jobId: 'job_123',
        productId: 'prod_1',
        status: 'COMPLETED',
        result: [{ source: 'https://example.com/1' }],
      });

      expect(response.status).toBe(200);
      expect(mockPrisma.parseJob.create).toHaveBeenCalled();
    });

    it('должен обновить ParseJob если jobId существует', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod_1',
        useParserPrice: false,
        parserSources: [],
        name: 'Тест',
        price: new Decimal(1000),
      });
      mockPrisma.parseJob.findFirst.mockResolvedValue({ id: 'parsejob_1', jobId: 'job_update_123' });
      mockPrisma.parseJob.update.mockResolvedValue({
        id: 'parsejob_1',
        status: 'PROCESSING',
      });

      const response = await callWebhook({
        jobId: 'job_update_123',
        productId: 'prod_1',
        status: 'PROCESSING',
      });

      expect(response.status).toBe(200);
      expect(mockPrisma.parseJob.update).toHaveBeenCalled();
    });

    it('должен записать price history при изменении цены (oldPrice vs newPrice)', async () => {
      mockPrisma.product.findUnique
        .mockResolvedValueOnce({
          id: 'prod_1',
          useParserPrice: true,
          parserSources: [{ url: 'https://example.com/1', priority: 0, isActive: true }],
          name: 'Тест',
          price: new Decimal(1000),
        })
        .mockResolvedValueOnce({
          id: 'prod_1',
          price: new Decimal(1000),
        });
      mockPrisma.parseJob.findFirst.mockResolvedValue(null);
      mockPrisma.parseJob.create.mockResolvedValue({ id: 'parsejob_1' });
      mockPrisma.productSupplier.upsert.mockResolvedValue({});
      mockPrisma.product.update.mockResolvedValue({});

      const response = await callWebhook({
        jobId: 'job_price',
        productId: 'prod_1',
        status: 'COMPLETED',
        result: [
          {
            success: true,
            source: 'https://example.com/1',
            data: {
              price: 800,
              oldPrice: 1200,
              inStock: true,
            },
          },
        ],
      });

      expect(response.status).toBe(200);
      expect(mockPrisma.priceHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            oldPrice: expect.any(Decimal),
            newPrice: expect.any(Decimal),
            reason: 'parser_auto',
          }),
        })
      );
    });

    it('должен обработать transaction rollback при ошибке', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod_1',
        useParserPrice: true,
        parserSources: [{ url: 'https://example.com/1', priority: 0, isActive: true }],
        name: 'Тест',
        price: new Decimal(1000),
      });
      mockPrisma.parseJob.findFirst.mockResolvedValue(null);
      mockPrisma.parseJob.create.mockResolvedValue({ id: 'parsejob_1' });

      mockPrisma.$transaction.mockRejectedValueOnce(new Error('DB constraint error'));

      const response = await callWebhook({
        jobId: 'job_tx_fail',
        productId: 'prod_1',
        status: 'COMPLETED',
        result: [
          {
            success: true,
            source: 'https://example.com/1',
            data: { price: 500, inStock: true },
          },
        ],
      });

      expect(response.status).toBe(200);
      expect(mockPrisma.parseJob.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'FAILED',
            error: expect.stringContaining('DB constraint error'),
          }),
        })
      );
    });
  });

  describe('Rate limiting (duplicate webhook)', () => {
    it('должен вернуть cached response для дубликата webhook', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod_1',
        useParserPrice: false,
        parserSources: [],
        name: 'Тест',
        price: new Decimal(1000),
      });
      mockPrisma.parseJob.findFirst.mockResolvedValue(null);
      mockPrisma.parseJob.create.mockResolvedValue({ id: 'parsejob_1' });

      const response1 = await callWebhook({
        jobId: 'job_dup',
        productId: 'prod_1',
        status: 'COMPLETED',
      });

      const response2 = await callWebhook({
        jobId: 'job_dup',
        productId: 'prod_1',
        status: 'COMPLETED',
      });

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });
  });

  describe('Error handling', () => {
    it('должен вернуть 500 при неожиданной ошибке', async () => {
      mockPrisma.product.findUnique.mockRejectedValueOnce(new Error('DB connection failed'));

      const response = await callWebhook({
        jobId: 'job_err',
        productId: 'prod_1',
        status: 'COMPLETED',
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });
});
