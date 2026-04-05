import { z } from 'zod';

// Схема для распарсенных данных товара
export const parsedDataSchema = z.object({
  price: z.number().positive().optional(),
  oldPrice: z.number().positive().optional(),
  name: z.string().min(1).optional(),
  inStock: z.boolean().optional(),
  deliveryDate: z.union([z.string(), z.object({ value: z.string().optional() }).passthrough()]).optional(),
  rating: z.object({ value: z.number().optional() }).passthrough().optional(),
  reviewsCount: z.object({ value: z.number().int().optional() }).passthrough().optional(),
});

// Схема для результатов парсинга (обёртка с мета-данными)
export const parserResultSchema = z.object({
  success: z.boolean().optional(),
  source: z.string().url().optional(),
  data: parsedDataSchema.optional(),
  // Для обратной совместимости — плоская структура
  nmId: z.string().min(6).optional(),
  name: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  oldPrice: z.number().positive().optional(),
  brand: z.string().optional(),
  rating: z.number().optional(),
  reviews: z.number().int().optional(),
  inStock: z.boolean().optional(),
  imageUrl: z.string().url().optional(),
  sourceUrl: z.string().url().optional(),
  parsedAt: z.date().optional(),
});

// Схема для webhook payload
export const webhookPayloadSchema = z.object({
  jobId: z.string().optional(),
  productId: z.string().optional(),
  sources: z.array(z.string().url()).optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
  result: z.record(z.string(), z.unknown()).or(z.array(z.unknown())).nullish(),
  error: z.string().nullable().optional(),
});

// Экспорты с PascalCase для совместимости
export const ParsedDataSchema = parsedDataSchema;
export const ParserResultSchema = parserResultSchema;
export const WebhookPayloadSchema = webhookPayloadSchema;
