import { z } from 'zod';

// Enum схемы для статусов
export const orderStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'PAID',
  'SHIPPING',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]);

export const paymentStatusSchema = z.enum([
  'PENDING',
  'PAID',
  'FAILED',
  'REFUNDED',
]);

export const paymentMethodSchema = z.enum([
  'CARD',
  'SBP',
  'CASH',
  'CREDIT',
]);

export const deliveryMethodSchema = z.enum([
  'COURIER',
  'PICKUP',
  'CDEK',
  'BOXBERRY',
  'POST',
]);

// Схема для элемента заказа (OrderItem)
export const orderItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string(),
  quantity: z.number().int().positive('Количество должно быть больше 0'),
  price: z.number().positive('Цена должна быть больше 0'),
  total: z.number().positive(),
});

// Схема для обновления статуса заказа
export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
});

// Схема для обновления платежного статуса
export const updatePaymentStatusSchema = z.object({
  paymentStatus: paymentStatusSchema,
});

// Основная схема для обновления заказа
export const updateOrderSchema = z.object({
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  deliveryAddress: z.string().min(1, 'Адрес доставки обязателен').max(500).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  deliveryMethod: deliveryMethodSchema.optional(),
  paymentMethod: paymentMethodSchema.optional(),
  deliveryCost: z.number().min(0).optional(),
  trackingNumber: z.string().max(100).optional().nullable(),
  discount: z.number().min(0).optional(),
});

// Схема для query параметров GET запроса
export const ordersQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  search: z.string().optional(),
  userId: z.string().optional(),
});

// Типы для экспорта
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type DeliveryMethod = z.infer<typeof deliveryMethodSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type OrdersQueryInput = z.infer<typeof ordersQuerySchema>;
