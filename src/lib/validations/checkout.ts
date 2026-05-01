import { z } from 'zod';

// Схема для создания заказа (клиентская)
// Оплата только при получением, доставка только самовывоз или поставщик
export const createOrderSchema = z.object({
  // Контактные данные
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(100),
  email: z.string().email('Некорректный email'),
  phone: z.string().min(5, 'Укажите номер телефона').max(20),

  // Склад самовывоза
  warehouseId: z.string().uuid('Некорректный склад').optional().nullable(),

  // Поставщик
  supplierId: z.string().uuid('Некорректный поставщик').optional().nullable(),

  // Комментарий к заказу
  notes: z.string().max(1000, 'Комментарий не более 1000 символов').optional().nullable(),
}).refine(data => data.warehouseId || data.supplierId, {
  message: 'Выберите склад или поставщика',
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// Схема для обновления профиля пользователя
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(100),
  email: z.string().email('Некорректный email'),
  phone: z.string().min(5, 'Укажите номер телефона').max(20).optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
