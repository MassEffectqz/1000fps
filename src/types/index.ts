// Основные типы проекта

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role?: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  category?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
