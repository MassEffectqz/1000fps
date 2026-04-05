/**
 * Integration тесты для Jobs API
 * - GET /api/admin/parser/jobs (список задач)
 * - GET /api/admin/parser/jobs/[jobId] (статус одной задачи)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';

// ==================== MOCKS ====================

const mockPrisma = {
  parseJob: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  product: {
    findMany: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Jobs API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PARSER_URL = 'http://localhost:3005';
  });

  describe('GET /api/admin/parser/jobs — список задач', () => {
    async function callJobs(query = '') {
      const { GET } = await import('@/app/api/admin/parser/jobs/route');
      const request = new NextRequest(`http://localhost:3000/api/admin/parser/jobs${query}`);
      return GET(request);
    }

    it('должен вернуть список задач с пагинацией', async () => {
      const mockJobs = [
        { id: 'job_1', productId: 'prod_1', status: 'COMPLETED', sources: ['https://example.com/1'], result: null, error: null, createdAt: new Date(), completedAt: new Date(), jobId: 'srv_1' },
        { id: 'job_2', productId: 'prod_2', status: 'PROCESSING', sources: ['https://example.com/2'], result: null, error: null, createdAt: new Date(), completedAt: null, jobId: 'srv_2' },
      ];
      mockPrisma.parseJob.findMany.mockResolvedValue(mockJobs);
      mockPrisma.parseJob.count.mockResolvedValue(2);
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'prod_1', name: 'Товар 1', slug: 'tovar-1', price: new Decimal(1000) },
        { id: 'prod_2', name: 'Товар 2', slug: 'tovar-2', price: new Decimal(2000) },
      ]);

      const response = await callJobs();
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.jobs).toHaveLength(2);
      expect(data.total).toBe(2);
      expect(data.page).toBe(1);
      expect(data.totalPages).toBe(1);
    });

    it('должен присоединить products к задачам', async () => {
      const mockJobs = [
        { id: 'job_1', productId: 'prod_1', status: 'COMPLETED', sources: [], result: null, error: null, createdAt: new Date(), completedAt: new Date(), jobId: 'srv_1' },
      ];
      mockPrisma.parseJob.findMany.mockResolvedValue(mockJobs);
      mockPrisma.parseJob.count.mockResolvedValue(1);
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'prod_1', name: 'Товар 1', slug: 'tovar-1', price: new Decimal(1000) },
      ]);

      const response = await callJobs();
      const data = await response.json();
      expect(data.jobs[0].product).toBeDefined();
      expect(data.jobs[0].product.name).toBe('Товар 1');
    });

    it('должен фильтровать по status', async () => {
      mockPrisma.parseJob.findMany.mockResolvedValue([]);
      mockPrisma.parseJob.count.mockResolvedValue(0);

      await callJobs('?status=COMPLETED');

      expect(mockPrisma.parseJob.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'COMPLETED' },
        })
      );
    });

    it('должен применять pagination limit', async () => {
      mockPrisma.parseJob.findMany.mockResolvedValue([]);
      mockPrisma.parseJob.count.mockResolvedValue(0);

      await callJobs('?limit=5&page=2');

      expect(mockPrisma.parseJob.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (page-1) * limit = (2-1) * 5
          take: 5,
        })
      );
    });

    it('должен вернуть totalPages корректно', async () => {
      mockPrisma.parseJob.findMany.mockResolvedValue([]);
      mockPrisma.parseJob.count.mockResolvedValue(50);

      const response = await callJobs('?limit=10');
      const data = await response.json();
      expect(data.totalPages).toBe(5);
    });

    it('должен вернуть product: null если productId отсутствует', async () => {
      const mockJobs = [
        { id: 'job_1', productId: null, status: 'COMPLETED', sources: [], result: null, error: null, createdAt: new Date(), completedAt: new Date(), jobId: 'srv_1' },
      ];
      mockPrisma.parseJob.findMany.mockResolvedValue(mockJobs);
      mockPrisma.parseJob.count.mockResolvedValue(1);

      const response = await callJobs();
      const data = await response.json();
      expect(data.jobs[0].product).toBeNull();
    });

    it('должен вернуть 500 при ошибке БД', async () => {
      mockPrisma.parseJob.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await callJobs();
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch parser jobs');
    });
  });

  describe('GET /api/admin/parser/jobs/[jobId] — статус задачи', () => {
    async function callJobDetail(jobId: string) {
      const { GET } = await import('@/app/api/admin/parser/jobs/[jobId]/route');
      const request = new NextRequest(`http://localhost:3000/api/admin/parser/jobs/${jobId}`);
      return GET(request, { params: Promise.resolve({ jobId }) });
    }

    it('должен вернуть статус задачи', async () => {
      const mockJob = {
        id: 'job_1',
        jobId: 'srv_job_1',
        productId: 'prod_1',
        status: 'COMPLETED',
        sources: ['https://example.com/1'],
        result: { price: 1500 },
        error: null,
        createdAt: new Date(),
        completedAt: new Date(),
      };
      mockPrisma.parseJob.findUnique.mockResolvedValue(mockJob);

      const response = await callJobDetail('job_1');
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.jobId).toBe('srv_job_1');
      expect(data.status).toBe('COMPLETED');
      expect(data.sources).toEqual(['https://example.com/1']);
    });

    it('должен вернуть 404 если задача не найдена', async () => {
      mockPrisma.parseJob.findUnique.mockResolvedValue(null);

      const response = await callJobDetail('nonexistent');
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Задача не найдена');
    });

    it('должен вернуть progress для PROCESSING задачи', async () => {
      const mockJob = {
        id: 'job_1',
        jobId: 'srv_job_1',
        productId: 'prod_1',
        status: 'PROCESSING',
        sources: ['https://example.com/1', 'https://example.com/2', 'https://example.com/3'],
        result: { processedCount: 2 },
        error: null,
        createdAt: new Date(),
        completedAt: null,
      };
      mockPrisma.parseJob.findUnique.mockResolvedValue(mockJob);

      const response = await callJobDetail('job_1');
      const data = await response.json();
      expect(data.progress).toEqual({ processed: 2, total: 3 });
    });

    it('должен вернуть progress = {processed, total} для COMPLETED', async () => {
      const mockJob = {
        id: 'job_1',
        jobId: 'srv_job_1',
        productId: 'prod_1',
        status: 'COMPLETED',
        sources: ['https://example.com/1', 'https://example.com/2'],
        result: null,
        error: null,
        createdAt: new Date(),
        completedAt: new Date(),
      };
      mockPrisma.parseJob.findUnique.mockResolvedValue(mockJob);

      const response = await callJobDetail('job_1');
      const data = await response.json();
      // Для completed: processed = total
      expect(data.progress).toEqual({ processed: 2, total: 2 });
    });

    it('должен вернуть null progress для FAILED', async () => {
      const mockJob = {
        id: 'job_1',
        jobId: 'srv_job_1',
        productId: 'prod_1',
        status: 'FAILED',
        sources: ['https://example.com/1'],
        result: null,
        error: 'Some error',
        createdAt: new Date(),
        completedAt: new Date(),
      };
      mockPrisma.parseJob.findUnique.mockResolvedValue(mockJob);

      const response = await callJobDetail('job_1');
      const data = await response.json();
      expect(data.progress).toBeNull();
    });

    it('должен опросить внешний parser для PENDING/PROCESSING задач', async () => {
      const mockJob = {
        id: 'job_1',
        jobId: 'srv_job_1',
        productId: 'prod_1',
        status: 'PROCESSING',
        sources: ['https://example.com/1'],
        result: null,
        error: null,
        createdAt: new Date(),
        completedAt: null,
      };
      mockPrisma.parseJob.findUnique.mockResolvedValue(mockJob);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'completed',
          result: [{ price: 1500 }],
          completedAt: new Date().toISOString(),
        }),
      });
      mockPrisma.parseJob.update.mockResolvedValue({});

      const response = await callJobDetail('job_1');
      expect(response.status).toBe(200);

      // Проверяем что был вызов к внешнему парсеру
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3005/api/parse/srv_job_1',
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });

    it('не должен опрашивать внешний parser если нет jobId', async () => {
      const mockJob = {
        id: 'job_1',
        jobId: null, // Нет jobId от сервера
        productId: 'prod_1',
        status: 'PROCESSING',
        sources: ['https://example.com/1'],
        result: null,
        error: null,
        createdAt: new Date(),
        completedAt: null,
      };
      mockPrisma.parseJob.findUnique.mockResolvedValue(mockJob);

      await callJobDetail('job_1');

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('должен игнорировать ошибки внешнего парсера и вернуть данные из БД', async () => {
      const mockJob = {
        id: 'job_1',
        jobId: 'srv_job_1',
        productId: 'prod_1',
        status: 'PROCESSING',
        sources: ['https://example.com/1'],
        result: null,
        error: null,
        createdAt: new Date(),
        completedAt: null,
      };
      mockPrisma.parseJob.findUnique.mockResolvedValue(mockJob);
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const response = await callJobDetail('job_1');
      // Должен вернуть данные из БД, не упав
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('PROCESSING');
    });

    it('должен вернуть 500 при ошибке БД', async () => {
      mockPrisma.parseJob.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await callJobDetail('job_1');
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch parse job');
    });
  });
});
