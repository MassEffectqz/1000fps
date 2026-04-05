// Моковые данные для демо-режима (Netlify deployment без БД)

export interface MockProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fullDescription: string | null;
  sku: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  rating: number;
  reviewCount: number;
  salesCount: number;
  isFeatured: boolean;
  isNew: boolean;
  isHit: boolean;
  isActive: boolean;
  categoryId: string;
  brandId: string | null;
  createdAt: string;
  updatedAt: string;
  discountType: string;
  discountValue: number;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  warrantyPeriod: number;
  warrantyType: string;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  category?: MockCategory;
  brand?: MockBrand;
  images: MockProductImage[];
  specs: MockProductSpecification[];
}

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  order: number;
  isActive: boolean;
}

export interface MockBrand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  isActive: boolean;
}

export interface MockProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string | null;
  order: number;
  isMain: boolean;
}

export interface MockProductSpecification {
  id: string;
  productId: string;
  name: string;
  value: string;
  unit: string | null;
  order: number;
}

export interface MockWarehouse {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  isActive: boolean;
}

// ==================== КАТЕГОРИИ ====================

export const mockCategories: MockCategory[] = [
  {
    id: 'cat-1',
    name: 'Видеокарты',
    slug: 'video-cards',
    description: 'Мощные видеокарты для игр и работы',
    image: null,
    parentId: null,
    order: 1,
    isActive: true,
  },
  {
    id: 'cat-2',
    name: 'Процессоры',
    slug: 'processors',
    description: 'Процессоры для любых задач',
    image: null,
    parentId: null,
    order: 2,
    isActive: true,
  },
  {
    id: 'cat-3',
    name: 'Материнские платы',
    slug: 'motherboards',
    description: 'Надежные материнские платы',
    image: null,
    parentId: null,
    order: 3,
    isActive: true,
  },
  {
    id: 'cat-4',
    name: 'Оперативная память',
    slug: 'ram',
    description: 'Быстрая память DDR4 и DDR5',
    image: null,
    parentId: null,
    order: 4,
    isActive: true,
  },
  {
    id: 'cat-5',
    name: 'SSD накопители',
    slug: 'ssd',
    description: 'Скоростные SSD для вашего ПК',
    image: null,
    parentId: null,
    order: 5,
    isActive: true,
  },
  {
    id: 'cat-6',
    name: 'Мониторы',
    slug: 'monitors',
    description: 'Игровые и офисальные мониторы',
    image: null,
    parentId: null,
    order: 6,
    isActive: true,
  },
];

// ==================== БРЕНДЫ ====================

export const mockBrands: MockBrand[] = [
  {
    id: 'brand-1',
    name: 'NVIDIA',
    slug: 'nvidia',
    description: 'Лидер в производстве GPU',
    logo: null,
    isActive: true,
  },
  {
    id: 'brand-2',
    name: 'AMD',
    slug: 'amd',
    description: 'Процессоры и графика',
    logo: null,
    isActive: true,
  },
  {
    id: 'brand-3',
    name: 'Intel',
    slug: 'intel',
    description: 'Процессоры и компоненты',
    logo: null,
    isActive: true,
  },
  {
    id: 'brand-4',
    name: 'ASUS',
    slug: 'asus',
    description: 'Игровое оборудование',
    logo: null,
    isActive: true,
  },
  {
    id: 'brand-5',
    name: 'MSI',
    slug: 'msi',
    description: 'Игровые решения',
    logo: null,
    isActive: true,
  },
  {
    id: 'brand-6',
    name: 'GIGABYTE',
    slug: 'gigabyte',
    description: 'Комплектующие для ПК',
    logo: null,
    isActive: true,
  },
];

// ==================== ТОВАРЫ ====================

export const mockProducts: MockProduct[] = [
  {
    id: 'prod-1',
    name: 'NVIDIA GeForce RTX 5090 32GB',
    slug: 'nvidia-rtx-5090-32gb',
    description: 'Флагманская видеокарта нового поколения',
    fullDescription: 'NVIDIA GeForce RTX 5090 — это абсолютный флагман для энтузиастов игр и создателей контента. 32 ГБ памяти GDDR7, трассировка лучей четвертого поколения и DLSS 4.0 обеспечивают непревзойденную производительность.',
    sku: 'GPU-RTX5090-001',
    price: 189990,
    oldPrice: 219990,
    stock: 15,
    rating: 4.9,
    reviewCount: 42,
    salesCount: 128,
    isFeatured: true,
    isNew: true,
    isHit: true,
    isActive: true,
    categoryId: 'cat-1',
    brandId: 'brand-1',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-04-01T14:30:00Z',
    discountType: 'PERCENT',
    discountValue: 15,
    metaTitle: 'NVIDIA RTX 5090 32GB - купить видеокарту',
    metaDescription: 'Флагманская видеокарта RTX 5090 с 32GB памяти',
    metaKeywords: 'rtx 5090, nvidia, видеокарта',
    warrantyPeriod: 36,
    warrantyType: 'MANUFACTURER',
    weight: 2.2,
    length: 33.6,
    width: 14,
    height: 7.5,
    category: mockCategories[0],
    brand: mockBrands[0],
    images: [
      {
        id: 'img-1-1',
        productId: 'prod-1',
        url: '/images/mock/rtx5090-main.jpg',
        alt: 'RTX 5090 вид спереди',
        order: 1,
        isMain: true,
      },
    ],
    specs: [
      { id: 'spec-1-1', productId: 'prod-1', name: 'Объем памяти', value: '32', unit: 'ГБ', order: 1 },
      { id: 'spec-1-2', productId: 'prod-1', name: 'Тип памяти', value: 'GDDR7', unit: '', order: 2 },
      { id: 'spec-1-3', productId: 'prod-1', name: 'Частота ядра', value: '2500', unit: 'МГц', order: 3 },
      { id: 'spec-1-4', productId: 'prod-1', name: 'TDP', value: '575', unit: 'Вт', order: 4 },
      { id: 'spec-1-5', productId: 'prod-1', name: 'Разъем питания', value: '16-pin', unit: '', order: 5 },
    ],
  },
  {
    id: 'prod-2',
    name: 'AMD Radeon RX 9070 XT 16GB',
    slug: 'amd-rx-9070-xt-16gb',
    description: 'Мощная видеокарта для 4K гейминга',
    fullDescription: 'AMD Radeon RX 9070 XT предлагает отличную производительность в играх при разрешении 4K. Архитектура RDNA 4, 16 ГБ GDDR6, поддержка FSR 4.0.',
    sku: 'GPU-RX9070XT-001',
    price: 74990,
    oldPrice: 84990,
    stock: 28,
    rating: 4.7,
    reviewCount: 35,
    salesCount: 215,
    isFeatured: true,
    isNew: true,
    isHit: true,
    isActive: true,
    categoryId: 'cat-1',
    brandId: 'brand-2',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-03-28T14:30:00Z',
    discountType: 'PERCENT',
    discountValue: 12,
    metaTitle: 'AMD RX 9070 XT 16GB - видеокарта для игр',
    metaDescription: 'Мощная видеокарта RX 9070 XT для 4K гейминга',
    metaKeywords: 'rx 9070 xt, amd, видеокарта',
    warrantyPeriod: 36,
    warrantyType: 'MANUFACTURER',
    weight: 1.8,
    length: 30,
    width: 12.5,
    height: 5.5,
    category: mockCategories[0],
    brand: mockBrands[1],
    images: [
      {
        id: 'img-2-1',
        productId: 'prod-2',
        url: '/images/mock/rx9070xt-main.jpg',
        alt: 'RX 9070 XT вид спереди',
        order: 1,
        isMain: true,
      },
    ],
    specs: [
      { id: 'spec-2-1', productId: 'prod-2', name: 'Объем памяти', value: '16', unit: 'ГБ', order: 1 },
      { id: 'spec-2-2', productId: 'prod-2', name: 'Тип памяти', value: 'GDDR6', unit: '', order: 2 },
      { id: 'spec-2-3', productId: 'prod-2', name: 'Частота ядра', value: '2400', unit: 'МГц', order: 3 },
      { id: 'spec-2-4', productId: 'prod-2', name: 'TDP', value: '300', unit: 'Вт', order: 4 },
    ],
  },
  {
    id: 'prod-3',
    name: 'AMD Ryzen 9 9950X',
    slug: 'amd-ryzen-9-9950x',
    description: '16-ядерный процессор для профессионалов',
    fullDescription: 'AMD Ryzen 9 9950X — 16 ядер, 32 потока, частота до 5.7 ГГц. Идеален для рендеринга, компиляции кода и стриминга.',
    sku: 'CPU-R99950X-001',
    price: 62990,
    oldPrice: 69990,
    stock: 42,
    rating: 4.95,
    reviewCount: 87,
    salesCount: 356,
    isFeatured: true,
    isNew: false,
    isHit: true,
    isActive: true,
    categoryId: 'cat-2',
    brandId: 'brand-2',
    createdAt: '2025-11-10T10:00:00Z',
    updatedAt: '2026-03-30T14:30:00Z',
    discountType: 'PERCENT',
    discountValue: 10,
    metaTitle: 'AMD Ryzen 9 9950X - процессор 16 ядер',
    metaDescription: 'Мощный 16-ядерный процессор для профессиональных задач',
    metaKeywords: 'ryzen 9 9950x, amd, процессор',
    warrantyPeriod: 36,
    warrantyType: 'MANUFACTURER',
    weight: 0.15,
    length: 4,
    width: 4,
    height: 1,
    category: mockCategories[1],
    brand: mockBrands[1],
    images: [
      {
        id: 'img-3-1',
        productId: 'prod-3',
        url: '/images/mock/ryzen9950x-main.jpg',
        alt: 'Ryzen 9 9950X',
        order: 1,
        isMain: true,
      },
    ],
    specs: [
      { id: 'spec-3-1', productId: 'prod-3', name: 'Количество ядер', value: '16', unit: '', order: 1 },
      { id: 'spec-3-2', productId: 'prod-3', name: 'Потоки', value: '32', unit: '', order: 2 },
      { id: 'spec-3-3', productId: 'prod-3', name: 'Базовая частота', value: '4.3', unit: 'ГГц', order: 3 },
      { id: 'spec-3-4', productId: 'prod-3', name: 'Макс. частота', value: '5.7', unit: 'ГГц', order: 4 },
      { id: 'spec-3-5', productId: 'prod-3', name: 'TDP', value: '170', unit: 'Вт', order: 5 },
      { id: 'spec-3-6', productId: 'prod-3', name: 'Сокет', value: 'AM5', unit: '', order: 6 },
    ],
  },
  {
    id: 'prod-4',
    name: 'Intel Core Ultra 9 285K',
    slug: 'intel-core-ultra-9-285k',
    description: 'Флагманский процессор Intel нового поколения',
    fullDescription: 'Intel Core Ultra 9 285K с гибридной архитектурой: 8 производительных + 16 эффективных ядер. Частота до 5.6 ГГц, поддержка DDR5 и PCIe 5.0.',
    sku: 'CPU-U9285K-001',
    price: 58990,
    oldPrice: null,
    stock: 35,
    rating: 4.8,
    reviewCount: 54,
    salesCount: 198,
    isFeatured: true,
    isNew: true,
    isHit: false,
    isActive: true,
    categoryId: 'cat-2',
    brandId: 'brand-3',
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-04-02T14:30:00Z',
    discountType: 'PERCENT',
    discountValue: 0,
    metaTitle: 'Intel Core Ultra 9 285K - процессор',
    metaDescription: 'Флагманский процессор Intel Core Ultra 9 285K',
    metaKeywords: 'intel, core ultra 9 285k, процессор',
    warrantyPeriod: 36,
    warrantyType: 'MANUFACTURER',
    weight: 0.12,
    length: 3.75,
    width: 3.75,
    height: 0.8,
    category: mockCategories[1],
    brand: mockBrands[2],
    images: [
      {
        id: 'img-4-1',
        productId: 'prod-4',
        url: '/images/mock/coreultra9285k-main.jpg',
        alt: 'Intel Core Ultra 9 285K',
        order: 1,
        isMain: true,
      },
    ],
    specs: [
      { id: 'spec-4-1', productId: 'prod-4', name: 'P-ядра', value: '8', unit: '', order: 1 },
      { id: 'spec-4-2', productId: 'prod-4', name: 'E-ядра', value: '16', unit: '', order: 2 },
      { id: 'spec-4-3', productId: 'prod-4', name: 'Потоки', value: '32', unit: '', order: 3 },
      { id: 'spec-4-4', productId: 'prod-4', name: 'Макс. частота', value: '5.6', unit: 'ГГц', order: 4 },
      { id: 'spec-4-5', productId: 'prod-4', name: 'TDP', value: '125', unit: 'Вт', order: 5 },
      { id: 'spec-4-6', productId: 'prod-4', name: 'Сокет', value: 'LGA 1851', unit: '', order: 6 },
    ],
  },
  {
    id: 'prod-5',
    name: 'ASUS ROG Strix Z890-E Gaming',
    slug: 'asus-rog-strix-z890-e-gaming',
    description: 'Топовая материнская плата для Intel 15-го поколения',
    fullDescription: 'Материнская плата ASUS ROG Strix Z890-E Gaming с поддержкой DDR5-8000+, PCIe 5.0, Wi-Fi 7 и Thunderbolt 4. Идеальная основа для игрового ПК.',
    sku: 'MB-Z890E-001',
    price: 42990,
    oldPrice: 47990,
    stock: 18,
    rating: 4.85,
    reviewCount: 28,
    salesCount: 89,
    isFeatured: true,
    isNew: true,
    isHit: false,
    isActive: true,
    categoryId: 'cat-3',
    brandId: 'brand-4',
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-04-01T14:30:00Z',
    discountType: 'PERCENT',
    discountValue: 10,
    metaTitle: 'ASUS ROG Strix Z890-E Gaming - материнская плата',
    metaDescription: 'Топовая материнская плата ASUS для Intel 15-го поколения',
    metaKeywords: 'asus, z890, rog strix, материнская плата',
    warrantyPeriod: 36,
    warrantyType: 'MANUFACTURER',
    weight: 1.2,
    length: 30.5,
    width: 24.4,
    height: 5,
    category: mockCategories[2],
    brand: mockBrands[3],
    images: [
      {
        id: 'img-5-1',
        productId: 'prod-5',
        url: '/images/mock/z890e-main.jpg',
        alt: 'ASUS ROG Strix Z890-E',
        order: 1,
        isMain: true,
      },
    ],
    specs: [
      { id: 'spec-5-1', productId: 'prod-5', name: 'Сокет', value: 'LGA 1851', unit: '', order: 1 },
      { id: 'spec-5-2', productId: 'prod-5', name: 'Чипсет', value: 'Z890', unit: '', order: 2 },
      { id: 'spec-5-3', productId: 'prod-5', name: 'Форм-фактор', value: 'ATX', unit: '', order: 3 },
      { id: 'spec-5-4', productId: 'prod-5', name: 'DDR5', value: 'до 8000', unit: 'МГц', order: 4 },
      { id: 'spec-5-5', productId: 'prod-5', name: 'Wi-Fi', value: '7', unit: '', order: 5 },
    ],
  },
  {
    id: 'prod-6',
    name: 'G.Skill Trident Z5 RGB DDR5 32GB (2x16) 6400MHz',
    slug: 'gskill-trident-z5-rgb-32gb-6400',
    description: 'Высокоскоростная память с RGB подсветкой',
    fullDescription: 'Комплект памяти G.Skill Trident Z5 RGB: 32 ГБ (2x16 ГБ) DDR5-6400 с низкими таймингами и стильной RGB подсветкой.',
    sku: 'RAM-TZ5-326400',
    price: 12990,
    oldPrice: 14990,
    stock: 65,
    rating: 4.75,
    reviewCount: 112,
    salesCount: 523,
    isFeatured: false,
    isNew: false,
    isHit: true,
    isActive: true,
    categoryId: 'cat-4',
    brandId: 'brand-6',
    createdAt: '2025-10-05T10:00:00Z',
    updatedAt: '2026-03-25T14:30:00Z',
    discountType: 'PERCENT',
    discountValue: 13,
    metaTitle: 'G.Skill Trident Z5 RGB DDR5 32GB 6400MHz',
    metaDescription: 'Быстрая память DDR5 с RGB подсветкой',
    metaKeywords: 'g.skill, trident z5, ddr5, память',
    warrantyPeriod: 120,
    warrantyType: 'MANUFACTURER',
    weight: 0.15,
    length: 13.3,
    width: 4,
    height: 4.5,
    category: mockCategories[3],
    brand: mockBrands[5],
    images: [
      {
        id: 'img-6-1',
        productId: 'prod-6',
        url: '/images/mock/tridentz5-main.jpg',
        alt: 'G.Skill Trident Z5 RGB',
        order: 1,
        isMain: true,
      },
    ],
    specs: [
      { id: 'spec-6-1', productId: 'prod-6', name: 'Объем', value: '32', unit: 'ГБ', order: 1 },
      { id: 'spec-6-2', productId: 'prod-6', name: 'Конфигурация', value: '2x16', unit: 'ГБ', order: 2 },
      { id: 'spec-6-3', productId: 'prod-6', name: 'Частота', value: '6400', unit: 'МГц', order: 3 },
      { id: 'spec-6-4', productId: 'prod-6', name: 'Тайминги', value: '32-39-39-102', unit: '', order: 4 },
      { id: 'spec-6-5', productId: 'prod-6', name: 'Напряжение', value: '1.35', unit: 'В', order: 5 },
    ],
  },
  {
    id: 'prod-7',
    name: 'Samsung 990 EVO Plus 2TB',
    slug: 'samsung-990-evo-plus-2tb',
    description: 'Скоростной NVMe SSD с PCIe 5.0',
    fullDescription: 'Samsung 990 EVO Plus — NVMe SSD объемом 2 ТБ с интерфейсом PCIe 5.0. Скорость чтения до 7450 МБ/с, идеален для игр и работы.',
    sku: 'SSD-990EVO-2TB',
    price: 16990,
    oldPrice: 19990,
    stock: 88,
    rating: 4.8,
    reviewCount: 156,
    salesCount: 742,
    isFeatured: false,
    isNew: true,
    isHit: true,
    isActive: true,
    categoryId: 'cat-5',
    brandId: 'brand-4',
    createdAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-04-01T14:30:00Z',
    discountType: 'PERCENT',
    discountValue: 15,
    metaTitle: 'Samsung 990 EVO Plus 2TB NVMe SSD',
    metaDescription: 'Скоростной SSD Samsung 990 EVO Plus 2TB',
    metaKeywords: 'samsung, 990 evo plus, ssd, nvme',
    warrantyPeriod: 60,
    warrantyType: 'MANUFACTURER',
    weight: 0.008,
    length: 8,
    width: 2.2,
    height: 0.23,
    category: mockCategories[4],
    brand: mockBrands[3],
    images: [
      {
        id: 'img-7-1',
        productId: 'prod-7',
        url: '/images/mock/samsung990evo-main.jpg',
        alt: 'Samsung 990 EVO Plus',
        order: 1,
        isMain: true,
      },
    ],
    specs: [
      { id: 'spec-7-1', productId: 'prod-7', name: 'Объем', value: '2', unit: 'ТБ', order: 1 },
      { id: 'spec-7-2', productId: 'prod-7', name: 'Интерфейс', value: 'PCIe 5.0', unit: '', order: 2 },
      { id: 'spec-7-3', productId: 'prod-7', name: 'Чтение', value: '7450', unit: 'МБ/с', order: 3 },
      { id: 'spec-7-4', productId: 'prod-7', name: 'Запись', value: '6900', unit: 'МБ/с', order: 4 },
    ],
  },
  {
    id: 'prod-8',
    name: 'ASUS ROG Swift OLED PG27AQDM 27" 4K 240Hz',
    slug: 'asus-rog-swift-oled-pg27aqdm',
    description: 'Игровой OLED монитор 4K 240Гц',
    fullDescription: '27-дюймовый OLED монитор ASUS ROG Swift с разрешением 4K и частотой обновления 240 Гц. Время отклика 0.03 мс, поддержка HDR и G-Sync.',
    sku: 'MON-PG27AQDM',
    price: 89990,
    oldPrice: 99990,
    stock: 12,
    rating: 4.92,
    reviewCount: 67,
    salesCount: 145,
    isFeatured: true,
    isNew: true,
    isHit: true,
    isActive: true,
    categoryId: 'cat-6',
    brandId: 'brand-4',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-04-03T14:30:00Z',
    discountType: 'PERCENT',
    discountValue: 10,
    metaTitle: 'ASUS ROG Swift OLED PG27AQDM 27" 4K 240Hz',
    metaDescription: 'Игровой OLED монитор ASUS 4K 240Гц',
    metaKeywords: 'asus, rog swift, oled, монитор, 4k, 240hz',
    warrantyPeriod: 36,
    warrantyType: 'MANUFACTURER',
    weight: 5.5,
    length: 61.4,
    width: 22,
    height: 38.5,
    category: mockCategories[5],
    brand: mockBrands[3],
    images: [
      {
        id: 'img-8-1',
        productId: 'prod-8',
        url: '/images/mock/pg27aqdm-main.jpg',
        alt: 'ASUS ROG Swift OLED PG27AQDM',
        order: 1,
        isMain: true,
      },
    ],
    specs: [
      { id: 'spec-8-1', productId: 'prod-8', name: 'Диагональ', value: '27', unit: '"', order: 1 },
      { id: 'spec-8-2', productId: 'prod-8', name: 'Разрешение', value: '3840x2160', unit: '', order: 2 },
      { id: 'spec-8-3', productId: 'prod-8', name: 'Частота', value: '240', unit: 'Гц', order: 3 },
      { id: 'spec-8-4', productId: 'prod-8', name: 'Тип матрицы', value: 'OLED', unit: '', order: 4 },
      { id: 'spec-8-5', productId: 'prod-8', name: 'Время отклика', value: '0.03', unit: 'мс', order: 5 },
    ],
  },
  {
    id: 'prod-9',
    name: 'MSI RTX 4070 Ti SUPER VENTUS 3X 16GB',
    slug: 'msi-rtx-4070-ti-super-ventus-16gb',
    description: 'Отличная видеокарта для 1440p гейминга',
    fullDescription: 'MSI RTX 4070 Ti SUPER VENTUS 3X — оптимальный выбор для игр в 1440p. 16 ГБ GDDR6X, трассировка лучей, DLSS 3.5.',
    sku: 'GPU-4070TIS-001',
    price: 64990,
    oldPrice: 72990,
    stock: 22,
    rating: 4.78,
    reviewCount: 93,
    salesCount: 287,
    isFeatured: false,
    isNew: false,
    isHit: true,
    isActive: true,
    categoryId: 'cat-1',
    brandId: 'brand-5',
    createdAt: '2025-12-10T10:00:00Z',
    updatedAt: '2026-03-29T14:30:00Z',
    discountType: 'PERCENT',
    discountValue: 11,
    metaTitle: 'MSI RTX 4070 Ti SUPER 16GB',
    metaDescription: 'Видеокарта MSI RTX 4070 Ti SUPER для 1440p',
    metaKeywords: 'msi, rtx 4070 ti super, видеокарта',
    warrantyPeriod: 36,
    warrantyType: 'MANUFACTURER',
    weight: 1.5,
    length: 30.5,
    width: 12,
    height: 5,
    category: mockCategories[0],
    brand: mockBrands[4],
    images: [
      {
        id: 'img-9-1',
        productId: 'prod-9',
        url: '/images/mock/rtx4070tis-main.jpg',
        alt: 'MSI RTX 4070 Ti SUPER',
        order: 1,
        isMain: true,
      },
    ],
    specs: [
      { id: 'spec-9-1', productId: 'prod-9', name: 'Объем памяти', value: '16', unit: 'ГБ', order: 1 },
      { id: 'spec-9-2', productId: 'prod-9', name: 'Тип памяти', value: 'GDDR6X', unit: '', order: 2 },
      { id: 'spec-9-3', productId: 'prod-9', name: 'Частота ядра', value: '2610', unit: 'МГц', order: 3 },
      { id: 'spec-9-4', productId: 'prod-9', name: 'TDP', value: '285', unit: 'Вт', order: 4 },
    ],
  },
  {
    id: 'prod-10',
    name: 'AMD Ryzen 7 9800X3D',
    slug: 'amd-ryzen-7-9800x3d',
    description: 'Лучший игровой процессор с технологией 3D V-Cache',
    fullDescription: 'AMD Ryzen 7 9800X3D — 8 ядер, 16 потоков, увеличенный кэш L3 96 МБ благодаря 3D V-Cache. Лучший выбор для игр.',
    sku: 'CPU-R79800X3D-001',
    price: 42990,
    oldPrice: 46990,
    stock: 38,
    rating: 4.93,
    reviewCount: 178,
    salesCount: 612,
    isFeatured: true,
    isNew: false,
    isHit: true,
    isActive: true,
    categoryId: 'cat-2',
    brandId: 'brand-2',
    createdAt: '2025-11-20T10:00:00Z',
    updatedAt: '2026-04-02T14:30:00Z',
    discountType: 'PERCENT',
    discountValue: 8,
    metaTitle: 'AMD Ryzen 7 9800X3D - игровой процессор',
    metaDescription: 'Лучший процессор для игр с 3D V-Cache',
    metaKeywords: 'ryzen 7 9800x3d, amd, игровой процессор',
    warrantyPeriod: 36,
    warrantyType: 'MANUFACTURER',
    weight: 0.15,
    length: 4,
    width: 4,
    height: 1,
    category: mockCategories[1],
    brand: mockBrands[1],
    images: [
      {
        id: 'img-10-1',
        productId: 'prod-10',
        url: '/images/mock/ryzen79800x3d-main.jpg',
        alt: 'AMD Ryzen 7 9800X3D',
        order: 1,
        isMain: true,
      },
    ],
    specs: [
      { id: 'spec-10-1', productId: 'prod-10', name: 'Количество ядер', value: '8', unit: '', order: 1 },
      { id: 'spec-10-2', productId: 'prod-10', name: 'Потоки', value: '16', unit: '', order: 2 },
      { id: 'spec-10-3', productId: 'prod-10', name: 'Базовая частота', value: '4.7', unit: 'ГГц', order: 3 },
      { id: 'spec-10-4', productId: 'prod-10', name: 'Макс. частота', value: '5.2', unit: 'ГГц', order: 4 },
      { id: 'spec-10-5', productId: 'prod-10', name: 'Кэш L3', value: '96', unit: 'МБ', order: 5 },
      { id: 'spec-10-6', productId: 'prod-10', name: 'TDP', value: '120', unit: 'Вт', order: 6 },
      { id: 'spec-10-7', productId: 'prod-10', name: 'Сокет', value: 'AM5', unit: '', order: 7 },
    ],
  },
];

// ==================== СКЛАДЫ ====================

export const mockWarehouses: MockWarehouse[] = [
  {
    id: 'wh-1',
    name: '1000FPS Волгоград',
    address: 'ул. Маршала Жукова, 35',
    city: 'Волгоград',
    phone: '+7 (8442) 123-456',
    isActive: true,
  },
  {
    id: 'wh-2',
    name: '1000FPS Волжский',
    address: 'пр. Ленина, 120',
    city: 'Волжский',
    phone: '+7 (8443) 789-012',
    isActive: true,
  },
];

// ==================== ХЕЛПЕРЫ ====================

export function getMockProductBySlug(slug: string): MockProduct | undefined {
  return mockProducts.find((p) => p.slug === slug);
}

export function getMockProductsByCategory(categorySlug: string): MockProduct[] {
  const category = mockCategories.find((c) => c.slug === categorySlug);
  if (!category) return mockProducts;
  return mockProducts.filter((p) => p.categoryId === category.id);
}

export function getMockCategoriesWithCount(): Array<MockCategory & { count: number; children: Array<{ id: string; name: string; slug: string; count: number }> }> {
  return mockCategories.map((cat) => ({
    ...cat,
    count: mockProducts.filter((p) => p.categoryId === cat.id).length,
    children: [], // В демо-режиме нет дочерних категорий
  }));
}

export function getMockBrands(): MockBrand[] {
  return mockBrands;
}

export function getMockWarehouses(): MockWarehouse[] {
  return mockWarehouses;
}

export function searchMockProducts(query: string): MockProduct[] {
  const lowerQuery = query.toLowerCase();
  return mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery) ||
      p.sku.toLowerCase().includes(lowerQuery)
  );
}

export function filterMockProducts(options?: {
  categoryId?: string;
  brandId?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  sort?: string;
}): MockProduct[] {
  let result = [...mockProducts];

  if (options?.categoryId) {
    result = result.filter((p) => p.categoryId === options.categoryId);
  }

  if (options?.brandId) {
    result = result.filter((p) => p.brandId === options.brandId);
  }

  if (options?.priceMin !== undefined) {
    result = result.filter((p) => p.price >= options.priceMin!);
  }

  if (options?.priceMax !== undefined) {
    result = result.filter((p) => p.price <= options.priceMax!);
  }

  if (options?.inStock) {
    result = result.filter((p) => p.stock > 0);
  }

  // Сортировка
  switch (options?.sort) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'popular':
      result.sort((a, b) => b.salesCount - a.salesCount);
      break;
    case 'new':
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  return result;
}
