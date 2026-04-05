import { z } from 'zod';

/**
 * Валидация входящих данных от парсера (webhook)
 */
export const webhookPayloadSchema = z.object({
  jobId: z.string().min(1, 'jobId обязателен'),
  productId: z.string().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']),
  result: z
    .object({
      parsedData: z
        .object({
          results: z.array(z.any()).optional(),
        })
        .optional(),
      results: z.array(z.any()).optional(),
      sources: z.array(z.string()).optional(),
    })
    .optional()
    .nullable(),
  error: z.string().optional().nullable(),
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

/**
 * Валидация отдельного результата парсинга
 */
export const parserResultSchema = z.object({
  success: z.boolean().optional(),
  source: z.string().optional(),
  data: z
    .object({
      price: z.number().optional(),
      oldPrice: z.number().optional(),
      deliveryDate: z
        .union([z.string(), z.object({ value: z.string().optional() }).passthrough()])
        .optional()
        .nullable(),
      inStock: z.boolean().optional(),
      rating: z.object({ value: z.number().optional() }).passthrough().optional().nullable(),
      reviewsCount: z.object({ value: z.number().optional() }).passthrough().optional().nullable(),
      name: z.string().optional(),
    })
    .optional()
    .nullable(),
});

export type ParserResult = z.infer<typeof parserResultSchema>;
