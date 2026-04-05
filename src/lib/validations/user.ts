import { z } from 'zod';

// Enum схемы для роли и уровня пользователя
export const userRoleSchema = z.enum(['CUSTOMER', 'ADMIN', 'MANAGER']);
export const userLevelSchema = z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']);

// Схема для адреса пользователя
export const userAddressSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional().nullable(),
  city: z.string().min(1, 'Город обязателен'),
  street: z.string().min(1, 'Улица обязательна'),
  building: z.string().min(1, 'Дом обязателен'),
  apartment: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  isDefault: z.boolean().default(false),
});

// Схема для заказа (краткая информация)
export const userOrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  status: z.string(),
  total: z.number(),
  createdAt: z.date(),
});

// Схема для отзыва
export const userReviewSchema = z.object({
  id: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional().nullable(),
  text: z.string(),
  createdAt: z.date(),
  product: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
});

// Основная схема пользователя (для создания/обновления)
export const userSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
  name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  role: userRoleSchema.default('CUSTOMER'),
  level: userLevelSchema.default('BRONZE'),
  emailVerified: z.boolean().default(false),
});

// Схема для создания пользователя
export const createUserSchema = userSchema.extend({
  id: z.string().optional(),
});

// Схема для обновления пользователя (админ)
// Можно менять: name, phone, role, level, emailVerified
// Нельзя менять: email, password
export const updateUserSchema = userSchema.partial().extend({
  email: z.never().optional(),
  password: z.never().optional(),
}).pick({
  name: true,
  phone: true,
  role: true,
  level: true,
  emailVerified: true,
  avatar: true,
});

// Схема для сброса пароля
export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Пароль должен быть не менее 6 символов').optional(),
  generateRandom: z.boolean().default(true),
});

// Схема для query параметров (список пользователей)
export const usersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  role: userRoleSchema.optional().nullable(),
  level: userLevelSchema.optional().nullable(),
  search: z.string().optional().nullable(),
});

// Типы для экспорта
export type UserInput = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UsersQueryInput = z.infer<typeof usersQuerySchema>;
export type UserAddress = z.infer<typeof userAddressSchema>;
export type UserOrder = z.infer<typeof userOrderSchema>;
export type UserReview = z.infer<typeof userReviewSchema>;
