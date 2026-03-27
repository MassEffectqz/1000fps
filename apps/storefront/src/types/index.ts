// ============================================
// Типы для 1000FPS Storefront
// ============================================

// ─── КАТАЛОГ ────────────────────────────────────────

export interface Category {
  id: number;
  slug: string;
  name: string;
  description?: string;
  parentId?: number;
  imageUrl?: string;
  position: number;
  _count?: {
    products: number;
  };
}

export interface Brand {
  id: number;
  slug: string;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: number;
  slug: string;
  sku: string;
  name: string;
  description?: string;
  fullDescription?: string;
  categoryId: number;
  category: Category;
  brandId?: number;
  brand?: Brand;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  stock: number;
  reserved: number;
  available: boolean;
  images: ProductImage[];
  mainImageUrl?: string;
  specifications?: Record<string, unknown>;
  metaTitle?: string;
  metaDescription?: string;
  rating: number;
  reviewsCount: number;
  source: 'MANUAL' | 'PARSER_WB' | 'PARSER_OZON' | 'PARSER_OTHER' | 'IMPORT_1C';
  externalId?: string;
  externalUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: number;
  productId: number;
  url: string;
  alt?: string;
  position: number;
  createdAt: string;
}

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  phone?: string;
  isActive: boolean;
}

export interface WarehouseStock {
  id: number;
  warehouseId: number;
  productId: number;
  quantity: number;
  reserved: number;
  warehouse: Warehouse;
}

export interface ProductWithStock extends Product {
  warehouseStock?: WarehouseStock[];
}

export interface Review {
  id: number;
  productId: number;
  userId?: number;
  user?: {
    firstName?: string;
    lastName?: string;
  };
  rating: number;
  title?: string;
  text?: string;
  pros?: string;
  cons?: string;
  isVerified: boolean;
  isApproved: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

// ─── ПОЛЬЗОВАТЕЛИ ───────────────────────────────────

export type Role = 'CUSTOMER' | 'ADMIN' | 'MANAGER' | 'WAREHOUSE';
export type LoyaltyLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  role: Role;
  bonusPoints: number;
  loyaltyLevel: LoyaltyLevel;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: number;
  userId: number;
  isDefault: boolean;
  name?: string;
  city: string;
  street: string;
  building: string;
  apartment?: string;
  zipCode?: string;
  phone?: string;
  comment?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── КОРЗИНА ────────────────────────────────────────

export interface Cart {
  id: number;
  userId?: number;
  sessionId?: string;
  items: CartItem[];
  promoCode?: string;
  discount: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
}

// ─── ВИШЛИСТ ────────────────────────────────────────

export interface Wishlist {
  id: number;
  userId: number;
  user: User;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: number;
  wishlistId: number;
  productId: number;
  product: Product;
  createdAt: string;
}

// ─── ЗАКАЗЫ ─────────────────────────────────────────

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PAYING'
  | 'PAID'
  | 'ASSEMBLING'
  | 'SHIPPED'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED' | 'FAILED';

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  user: User;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Record<string, unknown>;
  shippingMethod: string;
  shippingCost: number;
  estimatedDelivery?: string;
  trackingNumber?: string;
  paymentMethod?: string;
  paidAt?: string;
  subtotal: number;
  discount: number;
  total: number;
  bonusPointsEarned: number;
  bonusPointsSpent: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product?: Product;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
}

// ─── КОНФИГУРАТОР ───────────────────────────────────

export interface PartType {
  id: string;
  name: string;
  icon?: string;
  isRequired: boolean;
  position: number;
}

export interface PcConfig {
  id: number;
  userId?: number;
  name: string;
  isPublic: boolean;
  items: ConfigItem[];
  totalPrice: number;
  isCompatible: boolean;
  compatIssues?: Record<string, unknown>;
  powerConsumption?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigItem {
  id: number;
  configId: number;
  partType: string;
  productId: number;
  product: Product;
  price: number;
}

export interface CompatibilityResult {
  isCompatible: boolean;
  issues: CompatibilityIssue[];
  warnings: CompatibilityIssue[];
}

export interface CompatibilityIssue {
  partType: string;
  message: string;
  severity: 'error' | 'warning';
}

// ─── API ОТВЕТЫ ─────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SearchResponse {
  data: Product[];
  suggestions: string[];
  pagination: {
    total: number;
    limit: number;
  };
}

// ─── FILTERS ────────────────────────────────────────

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: 'popular' | 'price_asc' | 'price_desc' | 'newest' | 'rating';
}
