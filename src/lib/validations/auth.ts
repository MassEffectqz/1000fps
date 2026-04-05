import { z } from 'zod';

// Схема для регистрации пользователя
export const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
  name: z.string().min(1, 'Имя обязательно').max(100),
  phone: z.string().optional().nullable(),
});

// Схема для входа пользователя
export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Пароль обязателен'),
  remember: z.boolean().optional().default(false),
});

// Схема для запроса сброса пароля
export const forgotPasswordSchema = z.object({
  email: z.string().email('Некорректный email'),
});

// Схема для сброса пароля с токеном
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Токен обязателен'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

// Схема для обновления профиля
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Имя обязательно').max(100).optional(),
  phone: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
});

// Схема для смены пароля
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Текущий пароль обязателен'),
  newPassword: z.string().min(6, 'Новый пароль должен быть не менее 6 символов'),
});

// Схема для адреса
export const addressSchema = z.object({
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

// Схема для добавления товара в вишлист
export const wishlistItemSchema = z.object({
  productId: z.string().min(1, 'ID товара обязателен'),
});

// Схема для конфигурации (сборки)
export const configItemSchema = z.object({
  categoryId: z.string().min(1, 'ID категории обязателен'),
  productId: z.string().min(1, 'ID товара обязателен'),
  quantity: z.number().int().positive().default(1),
  price: z.number().positive(),
});

export const configurationSchema = z.object({
  name: z.string().optional().nullable(),
  isPreset: z.boolean().default(false),
  presetType: z.enum(['OFFICE', 'GAMING', 'PRO', 'STREAM', 'WORKSTATION']).optional().nullable(),
  total: z.number().positive(),
  power: z.number().int().positive(),
  isPublic: z.boolean().default(false),
  items: z.array(configItemSchema).default([]),
});

// Типы для экспорта
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type WishlistItemInput = z.infer<typeof wishlistItemSchema>;
export type ConfigurationInput = z.infer<typeof configurationSchema>;
export type ConfigItemInput = z.infer<typeof configItemSchema>;
