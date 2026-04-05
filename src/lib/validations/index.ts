// Экспорт всех схем валидации из отдельных файлов

// Products
export * from './product';

// Orders
export * from './order';

// Warehouses
export * from './warehouse';

// Auth
export * from './auth';

// Cart & Wishlist
export * from './cart';

// Users (экспортируем только то, что не конфликтует)
export {
  userRoleSchema,
  userLevelSchema,
  userAddressSchema,
  userOrderSchema,
  userReviewSchema,
  userSchema,
  createUserSchema,
  updateUserSchema,
} from './user';

// Legacy exports (для обратной совместимости)
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

export type LoginInput = z.infer<typeof loginSchema>;
