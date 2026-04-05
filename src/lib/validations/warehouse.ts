import { z } from 'zod';

// Основная схема валидации склада
export const warehouseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Название склада обязательно').max(255, 'Название не должно превышать 255 символов'),
  address: z.string().min(1, 'Адрес обязателен').max(500, 'Адрес не должен превышать 500 символов'),
  city: z.string().min(1, 'Город обязателен').max(100, 'Город не должен превышать 100 символов'),
  phone: z.string().max(20, 'Телефон не должен превышать 20 символов').optional().nullable(),
  isActive: z.boolean().default(true),
});

// Схема для создания склада
export const createWarehouseSchema = warehouseSchema.omit({ id: true });

// Схема для обновления склада (все поля опциональны)
export const updateWarehouseSchema = warehouseSchema.partial();

// Схема для параметров запроса (query params)
export const warehouseQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  city: z.string().optional(),
  isActive: z
    .string()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    })
    .optional(),
  search: z.string().optional(),
});

// Схема для параметров маршрута (route params)
export const warehouseParamsSchema = z.object({
  id: z.string().min(1, 'ID склада обязателен'),
});

// Типы для экспорта
export type WarehouseInput = z.infer<typeof warehouseSchema>;
export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>;
export type WarehouseQuery = z.infer<typeof warehouseQuerySchema>;
export type WarehouseParams = z.infer<typeof warehouseParamsSchema>;
