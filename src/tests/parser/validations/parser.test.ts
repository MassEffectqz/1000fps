/**
 * Unit тесты для Zod схем валидации парсера
 */
import { describe, it, expect } from 'vitest';
import {
  parsedDataSchema,
  parserResultSchema,
  webhookPayloadSchema,
  ParsedDataSchema,
  ParserResultSchema,
  WebhookPayloadSchema,
} from '@/lib/validations/parser';

describe('parsedDataSchema', () => {
  it('должен проходить с валидными данными', () => {
    const valid = {
      price: 1500,
      oldPrice: 2000,
      name: 'Товар',
      inStock: true,
      deliveryDate: '2026-04-10',
      rating: { value: 4.5 },
      reviewsCount: { value: 100 },
    };
    const result = parsedDataSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('должен отклонять отрицательную цену', () => {
    const result = parsedDataSchema.safeParse({ price: -100 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].code).toBe('too_small');
    }
  });

  it('должен отклонять цену равную нулю', () => {
    const result = parsedDataSchema.safeParse({ price: 0 });
    expect(result.success).toBe(false);
  });

  it('должен отклонять отрицательную oldPrice', () => {
    const result = parsedDataSchema.safeParse({ oldPrice: -50 });
    expect(result.success).toBe(false);
  });

  it('должен позволять отсутствовать price (optional)', () => {
    const result = parsedDataSchema.safeParse({ name: 'Товар без цены' });
    expect(result.success).toBe(true);
  });

  it('должен позволять отсутствовать всем полям (все optional)', () => {
    const result = parsedDataSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('должен валидировать deliveryDate как строку', () => {
    const result = parsedDataSchema.safeParse({ deliveryDate: 'Завтра' });
    expect(result.success).toBe(true);
  });

  it('должен валидировать deliveryDate как объект', () => {
    const result = parsedDataSchema.safeParse({ deliveryDate: { value: '10 апреля' } });
    expect(result.success).toBe(true);
  });

  it('должен валидировать rating как объект', () => {
    const result = parsedDataSchema.safeParse({ rating: { value: 5 } });
    expect(result.success).toBe(true);
  });

  it('должен валидировать reviewsCount как объект с int', () => {
    const result = parsedDataSchema.safeParse({ reviewsCount: { value: 42 } });
    expect(result.success).toBe(true);
  });

  it('должен отклонять пустое имя name', () => {
    const result = parsedDataSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('должен принимать boolean inStock', () => {
    const result = parsedDataSchema.safeParse({ inStock: false });
    expect(result.success).toBe(true);
  });
});

describe('parserResultSchema', () => {
  it('должен проходить с полными данными', () => {
    const valid = {
      success: true,
      source: 'https://www.wildberries.ru/catalog/123456/detail.aspx',
      nmId: '123456',
      name: 'Товар WB',
      price: 3500,
      oldPrice: 5000,
      brand: 'BrandName',
      rating: 4.8,
      reviews: 200,
      inStock: true,
      imageUrl: 'https://example.com/image.jpg',
      sourceUrl: 'https://example.com/source',
      parsedAt: new Date(),
    };
    const result = parserResultSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('должен отклонять невалидный source URL', () => {
    const result = parserResultSchema.safeParse({ source: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('должен отклонять невалидный imageUrl', () => {
    const result = parserResultSchema.safeParse({ imageUrl: 'not-a-url-at-all' });
    expect(result.success).toBe(false);
  });

  it('должен принимать ftp:// как валидный URL (zod v4)', () => {
    // Zod v4 .url() проверяет только формат, не протокол
    const result = parserResultSchema.safeParse({ imageUrl: 'ftp://example.com/file' });
    expect(result.success).toBe(true);
  });

  it('должен отклонять negative price', () => {
    const result = parserResultSchema.safeParse({ price: -1 });
    expect(result.success).toBe(false);
  });

  it('должен отклонять не-int reviews', () => {
    const result = parserResultSchema.safeParse({ reviews: 3.14 });
    expect(result.success).toBe(false);
  });

  it('должен отклонять слишком короткий nmId (< 6 символов)', () => {
    const result = parserResultSchema.safeParse({ nmId: '123' });
    expect(result.success).toBe(false);
  });

  it('должен принимать валидный nmId (6+ символов)', () => {
    const result = parserResultSchema.safeParse({ nmId: '123456' });
    expect(result.success).toBe(true);
  });

  it('должен позволять пустой объект (все поля optional)', () => {
    const result = parserResultSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('должен принимать вложенную data структуру', () => {
    const valid = {
      data: {
        price: 100,
        name: 'Test',
        inStock: true,
      },
    };
    const result = parserResultSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});

describe('webhookPayloadSchema', () => {
  it('должен проходить с валидным payload', () => {
    const valid = {
      jobId: 'job_123',
      productId: 'prod_456',
      sources: ['https://example.com/1', 'https://example.com/2'],
      status: 'COMPLETED',
      result: { price: 1500, name: 'Товар' },
      error: null,
    };
    const result = webhookPayloadSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('должен отклонять невалидный status', () => {
    const result = webhookPayloadSchema.safeParse({ status: 'UNKNOWN' });
    expect(result.success).toBe(false);
  });

  it('должен принимать допустимые статусы', () => {
    const statuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'];
    for (const status of statuses) {
      const result = webhookPayloadSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });

  it('должен отклонять не-URL в sources массиве', () => {
    const result = webhookPayloadSchema.safeParse({
      sources: ['https://valid.com', 'not-a-url'],
    });
    expect(result.success).toBe(false);
  });

  it('должен позволять result быть null', () => {
    const result = webhookPayloadSchema.safeParse({ result: null });
    expect(result.success).toBe(true);
  });

  it('должен позволять result быть undefined', () => {
    const result = webhookPayloadSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('должен принимать массивный result', () => {
    const result = webhookPayloadSchema.safeParse({
      result: [{ price: 100 }, { price: 200 }],
    });
    expect(result.success).toBe(true);
  });

  it('должен принимать error как string', () => {
    const result = webhookPayloadSchema.safeParse({ error: 'Some error occurred' });
    expect(result.success).toBe(true);
  });

  it('должен принимать error как null', () => {
    const result = webhookPayloadSchema.safeParse({ error: null });
    expect(result.success).toBe(true);
  });

  it('должен отклонять error как number', () => {
    const result = webhookPayloadSchema.safeParse({ error: 500 });
    expect(result.success).toBe(false);
  });
});

describe('Pascal-case экспорты', () => {
  it('ParsedDataSchema должен быть тем же объектом что и parsedDataSchema', () => {
    expect(ParsedDataSchema).toBe(parsedDataSchema);
  });

  it('ParserResultSchema должен быть тем же объектом что и parserResultSchema', () => {
    expect(ParserResultSchema).toBe(parserResultSchema);
  });

  it('WebhookPayloadSchema должен быть тем же объектом что и webhookPayloadSchema', () => {
    expect(WebhookPayloadSchema).toBe(webhookPayloadSchema);
  });
});
