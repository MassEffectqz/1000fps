import { z } from 'zod';

// Схема для создания заказа (клиентская)
// Оплата только при получением, доставка только самовывоз или поставщик
export const createOrderSchema = z.object({
  // Контактные данные
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(100),
  email: z.string().email('Некорректный email'),
  phone: z.string().min(5, 'Укажите номер телефона').max(20),

  // Склад самовывоза - для товаров без warehouseId в корзине
  warehouseId: z.string().optional().nullable(),

  // Поставщик - для товаров без supplierId в корзине
  supplierId: z.string().optional().nullable(),

  // Комментарий к заказу
  notes: z.string().max(1000, 'Комментарий не более 1000 символов').optional().nullable(),
}).refine(data => (data.warehouseId && data.warehouseId.trim()) || (data.supplierId && data.supplierId.trim()), {
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
