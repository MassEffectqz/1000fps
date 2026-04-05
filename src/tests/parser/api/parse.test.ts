/**
 * Integration тесты для Parse endpoint: POST /api/admin/parser/parse
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ==================== MOCKS ====================

const mockPrisma = {
  parseJob: {
    create: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Parse API — POST /api/admin/parser/parse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PARSER_URL = 'http://localhost:3005';
  });

  async function callParse(body: Record<string, unknown>) {
    const { POST } = await import('@/app/api/admin/parser/parse/route');
    const request = new NextRequest('http://localhost:3000/api/admin/parser/parse', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return POST(request);
  }

  describe('OPTIONS', () => {
    it('должен вернуть 204 для CORS preflight', async () => {
      const { OPTIONS } = await import('@/app/api/admin/parser/parse/route');
      const response = await OPTIONS();
      expect(response.status).toBe(204);
    });
  });

  describe('Validation', () => {
    it('должен вернуть 400 если sources отсутствует', async () => {
      const response = await callParse({ productId: 'prod_1' });
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('sources');
    });

    it('должен вернуть 400 если sources пустой массив', async () => {
      const response = await callParse({ productId: 'prod_1', sources: [] });
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('sources');
    });

    it('должен вернуть 400 если sources не массив', async () => {
      const response = await callParse({ productId: 'prod_1', sources: 'not-array' });
      expect(response.status).toBe(400);
    });
  });

  describe('Create parse job', () => {
    it('должен создать задачу в БД', async () => {
      mockPrisma.parseJob.create.mockResolvedValue({ id: 'parsejob_1' });
      mockPrisma.parseJob.update.mockResolvedValue({ id: 'parsejob_1' });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jobId: 'server_job_1', estimatedTime: '30-60 секунд' }),
      });

      const response = await callParse({
        productId: 'prod_1',
        sources: ['https://example.com/1'],
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.jobId).toBe('parsejob_1');
      expect(data.serverJobId).toBe('server_job_1');

      // Проверяем что задача создана в БД
      expect(mockPrisma.parseJob.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            productId: 'prod_1',
            sources: ['https://example.com/1'],
            status: 'PENDING',
          }),
        })
      );
    });

    it('должен вызвать внешний parser сервер', async () => {
      mockPrisma.parseJob.create.mockResolvedValue({ id: 'parsejob_1' });
      mockPrisma.parseJob.update.mockResolvedValue({ id: 'parsejob_1' });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jobId: 'server_job_1' }),
      });

      await callParse({
        productId: 'prod_1',
        sources: ['https://example.com/1', 'https://example.com/2'],
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3005/api/parse',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: 'prod_1',
            sources: ['https://example.com/1', 'https://example.com/2'],
          }),
        })
      );
    });

    it('должен сохранить server jobId в БД', async () => {
      mockPrisma.parseJob.create.mockResolvedValue({ id: 'parsejob_1' });
      mockPrisma.parseJob.update.mockResolvedValue({ id: 'parsejob_1' });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jobId: 'job_xyz' }),
      });

      await callParse({
        productId: 'prod_1',
        sources: ['https://example.com/1'],
      });

      expect(mockPrisma.parseJob.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'parsejob_1' },
          data: { jobId: 'job_xyz' },
        })
      );
    });
  });

  describe('External parser fails', () => {
    it('долен вернуть FAILED статус если parser сервер вернул ошибку', async () => {
      mockPrisma.parseJob.create.mockResolvedValue({ id: 'parsejob_1' });
      mockPrisma.parseJob.update.mockResolvedValue({ id: 'parsejob_1' });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Parser internal error' }),
      });

      const response = await callParse({
        productId: 'prod_1',
        sources: ['https://example.com/1'],
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Parser internal error');

      // Задача должна быть обновлена как FAILED
      expect(mockPrisma.parseJob.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'parsejob_1' },
          data: { status: 'FAILED', error: 'Parser internal error' },
        })
      );
    });

    it('должен вернуть 500 если parser сервер недоступен (ECONNREFUSED)', async () => {
      mockPrisma.parseJob.create.mockResolvedValue({ id: 'parsejob_1' });

      const networkError = new TypeError('fetch failed');
      (networkError as Error & { cause?: { code?: string } }).cause = { code: 'ECONNREFUSED' };
      mockFetch.mockRejectedValueOnce(networkError);

      const response = await callParse({
        productId: 'prod_1',
        sources: ['https://example.com/1'],
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain('Сервер парсинга не запущен');
    });

    it('должен вернуть 500 при общей ошибке', async () => {
      mockPrisma.parseJob.create.mockRejectedValueOnce(new Error('DB connection failed'));

      const response = await callParse({
        productId: 'prod_1',
        sources: ['https://example.com/1'],
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to start parse job');
    });
  });

  describe('Job persisted in DB', () => {
    it('должен создать запись parseJob до отправки запроса на parser', async () => {
      const createOrder: string[] = [];

      mockPrisma.parseJob.create.mockImplementation(async () => {
        createOrder.push('create');
        return { id: 'parsejob_1' };
      });
      mockPrisma.parseJob.update.mockImplementation(async () => {
        createOrder.push('update');
        return { id: 'parsejob_1' };
      });

      mockFetch.mockImplementation(async () => {
        createOrder.push('fetch');
        return {
          ok: true,
          json: async () => ({ jobId: 'server_job_1' }),
        };
      });

      await callParse({
        productId: 'prod_1',
        sources: ['https://example.com/1'],
      });

      // create должен быть вызван до fetch
      expect(createOrder[0]).toBe('create');
      expect(createOrder[1]).toBe('fetch');
    });
  });
});
