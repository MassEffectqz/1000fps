import { z } from 'zod';

/**
 * Схема для добавления товара в корзину
 */
export const addToCartSchema = z.object({
  productId: z.string().cuid('Некорректный ID товара'),
  quantity: z.number().int().min(1, 'Количество должно быть не менее 1').max(999, 'Количество должно быть не более 999'),
  warehouseId: z.string().cuid('Некорректный ID склада').optional(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;

/**
 * Схема для обновления элемента корзины
 */
export const updateCartItemSchema = z.object({
  itemId: z.string().cuid('Некорректный ID элемента корзины'),
  quantity: z.number().int().min(1, 'Количество должно быть не менее 1').max(999, 'Количество должно быть не более 999').optional(),
  warehouseId: z.string().cuid('Некорректный ID склада').optional(),
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

/**
 * Схема для удаления элемента из корзины
 */
export const removeFromCartSchema = z.object({
  itemId: z.string().cuid('Некорректный ID элемента корзины'),
});

export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;

/**
 * Схема для добавления товара в вишлист
 */
export const addToWishlistSchema = z.object({
  productId: z.string().cuid('Некорректный ID товара'),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;

/**
 * Схема для удаления товара из вишлиста
 */
export const removeFromWishlistSchema = z.object({
  itemId: z.string().cuid('Некорректный ID элемента вишлиста'),
});

export type RemoveFromWishlistInput = z.infer<typeof removeFromWishlistSchema>;

/**
 * Схема для переноса товаров из вишлиста в корзину
 */
export const wishlistToCartSchema = z.object({
  itemIds: z.array(z.string().cuid()).optional(),
});

export type WishlistToCartInput = z.infer<typeof wishlistToCartSchema>;
