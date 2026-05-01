import { z } from 'zod';

/**
 * Схема для добавления товара в корзину
 * Принимает: CUID (product.id), числовой ID (supplierId артикул WB), или supplierId (productSupplier.id)
 */
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'ID товара обязателен'),
  quantity: z.number().int().min(1, 'Количество должно быть не менее 1').max(999, 'Количество должно быть не более 999'),
  warehouseId: z.string().min(1, 'ID склада обязателен').optional().or(z.literal('')),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;

/**
 * Схема для обновления элемента корзины
 */
export const updateCartItemSchema = z.object({
  itemId: z.string().min(1, 'ID элемента корзины обязателен'),
  quantity: z.number().int().min(1, 'Количество должно быть не менее 1').max(999, 'Количество должно быть не более 999').optional(),
  warehouseId: z.string().min(1, 'ID склада обязателен').optional().or(z.literal('')),
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
 * Схема для добавления товара в вишлист
 */
export const addToWishlistSchema = z.object({
  productId: z.string().min(1, 'ID товара обязателен'),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;

/**
 * Схема для удаления товара из вишлиста
 */
export const removeFromWishlistSchema = z.object({
  itemId: z.string().min(1, 'ID элемента вишлиста обязателен'),
});

export type RemoveFromWishlistInput = z.infer<typeof removeFromWishlistSchema>;

/**
 * Схема для переноса товаров из вишлиста в корзину
 */
export const wishlistToCartSchema = z.object({
  itemIds: z.array(z.string().min(1)).optional(),
});

export type WishlistToCartInput = z.infer<typeof wishlistToCartSchema>;
