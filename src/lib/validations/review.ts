import { z } from 'zod';

/**
 * Схема для создания отзыва
 */
export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Некорректный ID товара'),
  rating: z.number()
    .min(1, 'Минимальный рейтинг 1')
    .max(5, 'Максимальный рейтинг 5'),
  title: z.string()
    .min(5, 'Заголовок должен быть не менее 5 символов')
    .max(100, 'Заголовок не более 100 символов')
    .optional()
    .or(z.literal('')),
  text: z.string()
    .min(10, 'Текст отзыва должен быть не менее 10 символов')
    .max(2000, 'Текст отзыва не более 2000 символов'),
  pros: z.string()
    .max(500, 'Преимущества не более 500 символов')
    .optional()
    .or(z.literal('')),
  cons: z.string()
    .max(500, 'Недостатки не более 500 символов')
    .optional()
    .or(z.literal('')),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

/**
 * Схема для обновления отзыва
 */
export const updateReviewSchema = z.object({
  reviewId: z.string().cuid('Некорректный ID отзыва'),
  rating: z.number()
    .min(1, 'Минимальный рейтинг 1')
    .max(5, 'Максимальный рейтинг 5')
    .optional(),
  title: z.string()
    .min(5, 'Заголовок должен быть не менее 5 символов')
    .max(100, 'Заголовок не более 100 символов')
    .optional()
    .or(z.literal('')),
  text: z.string()
    .min(10, 'Текст отзыва должен быть не менее 10 символов')
    .max(2000, 'Текст отзыва не более 2000 символов')
    .optional(),
  pros: z.string()
    .max(500, 'Преимущества не более 500 символов')
    .optional()
    .or(z.literal('')),
  cons: z.string()
    .max(500, 'Недостатки не более 500 символов')
    .optional()
    .or(z.literal('')),
});

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

/**
 * Схема для голосования за отзыв (полезный/бесполезный)
 */
export const voteReviewSchema = z.object({
  reviewId: z.string().cuid('Некорректный ID отзыва'),
  voteType: z.enum(['helpful', 'unhelpful'], 'Тип голоса должен быть helpful или unhelpful'),
});

export type VoteReviewInput = z.infer<typeof voteReviewSchema>;

/**
 * Схема для модерации отзыва (админ)
 */
export const moderateReviewSchema = z.object({
  reviewId: z.string().cuid('Некорректный ID отзыва'),
  isApproved: z.boolean(),
  rejectionReason: z.string()
    .max(500, 'Причина отказа не более 500 символов')
    .optional()
    .or(z.literal('')),
});

export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;

/**
 * Схема для получения отзывов с пагинацией и фильтрами
 */
export const getReviewsSchema = z.object({
  productId: z.string().min(1, 'Некорректный ID товара').optional(),
  page: z.number().int().positive('Номер страницы должен быть положительным').default(1),
  limit: z.number().int().min(1).max(50).default(10),
  rating: z.number().int().min(1).max(5).optional(),
  sortBy: z.enum(['newest', 'oldest', 'highest', 'lowest', 'helpful']).default('newest'),
  isApproved: z.boolean().default(true),
});

export type GetReviewsInput = z.infer<typeof getReviewsSchema>;
