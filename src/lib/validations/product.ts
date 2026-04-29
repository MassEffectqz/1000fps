import { z } from 'zod';

// Типы скидок и гарантии
export const discountTypeSchema = z.enum(['PERCENT', 'FIXED']);
export const warrantyTypeSchema = z.enum(['MANUFACTURER', 'SELLER']);

// Схема для изображения товара
export const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().refine(
    (val) => {
      return val.startsWith('http://') ||
             val.startsWith('https://') ||
             val.startsWith('/uploads/') ||
             val.startsWith('blob:') ||
             val === '';
    },
    { message: 'Некорректный URL изображения' }
  ),
  alt: z.string().optional(),
  order: z.number().int().min(0).default(0),
  isMain: z.boolean().default(false),
});

// Схема для характеристики товара
export const productSpecificationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Название характеристики обязательно'),
  value: z.string().min(1, 'Значение характеристики обязательно'),
  unit: z.string().optional(),
  isVariant: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

// Схема для варианта товара
export const productVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Название варианта обязательно'),
  value: z.string().optional().default(''),
  priceMod: z.number().default(0),
  stock: z.number().int().min(0).default(0),
  sku: z.string().optional(),
  order: z.number().int().min(0).default(0),
});

// Схема для тега товара
export const productTagSchema = z.object({
  id: z.string().optional(),
  tagId: z.string(),
  name: z.string().optional(),
  slug: z.string().optional(),
  color: z.string().optional(),
});

// Схема для складских остатков
export const warehouseStockSchema = z.object({
  id: z.string().optional(),
  warehouseId: z.string(),
  warehouseName: z.string().optional(),
  quantity: z.number().int().min(0).default(0),
  reserved: z.number().int().min(0).default(0),
});

// Основная схема валидации товара
export const productSchema = z.object({
  id: z.string().optional(),

  // Основные поля
  name: z.string().min(1, 'Название товара обязательно').max(255),
  slug: z.string().min(1, 'Slug обязателен').max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Некорректный формат slug'),
  sku: z.string().min(1, 'Артикул обязателен').max(100),
  categoryId: z.string().min(1, 'Категория обязательна'),
  brandId: z.string().optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  fullDescription: z.string().optional().nullable(),

  // Цена и скидки
  price: z.number().positive('Цена должна быть больше 0'),
  oldPrice: z.number().positive().optional().nullable(),
  discountType: discountTypeSchema.default('PERCENT'),
  discountValue: z.number().min(0).default(0),

  // Габариты и вес
  weight: z.number().positive().optional().nullable(),
  length: z.number().positive().optional().nullable(),
  width: z.number().positive().optional().nullable(),
  height: z.number().positive().optional().nullable(),

  // Гарантия
  warrantyPeriod: z.number().int().min(0).default(0),
  warrantyType: warrantyTypeSchema.default('MANUFACTURER'),
  
  // Статусы
  isActive: z.boolean().default(true),
  isDraft: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isHit: z.boolean().default(false),
  isUsed: z.boolean().default(false),
  
  // SEO
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  
  // Связанные данные
  images: z.array(productImageSchema).default([]),
  specifications: z.array(productSpecificationSchema).default([]),
  variants: z.array(productVariantSchema).default([]),
  tags: z.array(productTagSchema).default([]),
  warehouseStocks: z.array(warehouseStockSchema).default([]),
});

// Схема для создания товара
export const createProductSchema = productSchema.omit({ id: true });

// Схема для обновления товара
export const updateProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(255).optional().nullable(),
  slug: z.string().min(1).max(255).optional().nullable(),
  sku: z.string().min(1).max(100).optional().nullable(),
  categoryId: z.string().min(1).optional().nullable(),
  brandId: z.string().optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  fullDescription: z.string().optional().nullable(),
  price: z.number().positive().optional().nullable(),
  oldPrice: z.number().positive().optional().nullable(),
  discountType: discountTypeSchema.optional(),
  discountValue: z.number().min(0).optional(),
  weight: z.number().optional().nullable(),
  length: z.number().optional().nullable(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  warrantyPeriod: z.number().int().min(0).optional(),
  warrantyType: warrantyTypeSchema.optional(),
  isActive: z.boolean().optional(),
  isDraft: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isHit: z.boolean().optional(),
  isUsed: z.boolean().optional(),
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  images: z.array(productImageSchema).optional().nullable(),
  specifications: z.array(productSpecificationSchema).optional().nullable(),
  variants: z.array(productVariantSchema).optional().nullable(),
  tags: z.array(productTagSchema).optional().nullable(),
  warehouseStocks: z.array(warehouseStockSchema).optional().nullable(),
  parseSources: z.array(z.string()).optional(),
  warehouses: z.array(z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().optional().nullable(),
    inStock: z.boolean().optional(),
    quantity: z.number().optional(),
    price: z.number().optional(),
    formattedPrice: z.string().optional(),
  })).optional().nullable(),
});

// Схема для динамических характеристик по категориям
export const categorySpecificationsSchema = z.object({
  categoryId: z.string(),
  specifications: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
});

// Специфичные схемы для категорий
export const gpuSpecsSchema = z.object({
  vram: z.string().optional(),
  memoryType: z.string().optional(),
  gpuClock: z.string().optional(),
  tdp: z.string().optional(),
  connectors: z.string().optional(),
});

export const cpuSpecsSchema = z.object({
  socket: z.string().optional(),
  cores: z.number().int().positive().optional(),
  threads: z.number().int().positive().optional(),
  clockSpeed: z.string().optional(),
  tdp: z.string().optional(),
  cache: z.string().optional(),
});

export const ramSpecsSchema = z.object({
  capacity: z.string().optional(),
  type: z.enum(['DDR4', 'DDR5']).optional(),
  clockSpeed: z.string().optional(),
  formFactor: z.string().optional(),
});

export const ssdSpecsSchema = z.object({
  capacity: z.string().optional(),
  interface: z.enum(['NVMe', 'SATA', 'SATA III', 'M.2']).optional(),
  readSpeed: z.string().optional(),
  writeSpeed: z.string().optional(),
});

export const monitorSpecsSchema = z.object({
  diagonal: z.string().optional(),
  resolution: z.string().optional(),
  refreshRate: z.string().optional(),
  panelType: z.enum(['IPS', 'VA', 'TN', 'OLED']).optional(),
});

// Типы для экспорта
export type ProductInput = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductImage = z.infer<typeof productImageSchema>;
export type ProductSpecification = z.infer<typeof productSpecificationSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type ProductTag = z.infer<typeof productTagSchema>;
export type WarehouseStock = z.infer<typeof warehouseStockSchema>;
