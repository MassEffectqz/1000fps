import { z } from 'zod';

/**
 * Вспомогательная функция для обработки пустых строк из форм
 * Превращает "" в undefined для корректной работы с Prisma
 */
const emptyToUndefined = z.preprocess(
  (val) => (val === '' ? undefined : val),
  z.string().optional()
);

/**
 * Схема для добавления товара в корзину
 */
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'ID товара обязателен'),
  quantity: z
    .number()
    .int()
    .min(1, 'Количество должно быть не менее 1')
    .max(999, 'Количество должно быть не более 999'),
  // Используем препроцессор, чтобы Prisma не ругалась на пустые строки
  warehouseId: emptyToUndefined,
  supplierId: emptyToUndefined,
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;

/**
 * Схема для обновления элемента корзины
 */
export const updateCartItemSchema = z.object({
  itemId: z.string().min(1, 'ID элемента корзины обязателен'),
  quantity: z
    .number()
    .int()
    .min(1, 'Количество должно быть не менее 1')
    .max(999, 'Количество должно быть не более 999')
    .optional(),
  // Добавляем возможность смены склада/ПВЗ при обновлении
  warehouseId: emptyToUndefined,
  supplierId: emptyToUndefined,
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

/**
 * Схема для удаления элемента из корзины
 */
export const removeFromCartSchema = z.object({
  itemId: z.string().min(1, 'ID элемента корзины обязателен'),
});

export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;

/**
 * Схемы для вишлиста (без изменений, так как там нет складов/поставщиков)
 */
export const addToWishlistSchema = z.object({
  productId: z.string().min(1, 'ID товара обязателен'),
});

export const removeFromWishlistSchema = z.object({
  itemId: z.string().min(1, 'ID элемента вишлиста обязателен'),
});

export const wishlistToCartSchema = z.object({
  itemIds: z.array(z.string().min(1)).optional(),
});