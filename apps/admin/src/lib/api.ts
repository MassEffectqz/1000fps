// ============================================
// API Client для 1000FPS Admin
// ============================================

import { getAuthToken, setAuthToken, removeAuthToken } from '@/lib/tokenUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// ============================================
// Базовый fetch с обработкой ошибок
// ============================================

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  useAuth: boolean = true
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  };

  // Добавить токен авторизации если нужно
  if (useAuth) {
    const token = getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка сети' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============================================
// Auth API
// ============================================

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetchApi<{
      user: { id: number; email: string; role: string; firstName?: string; lastName?: string };
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      false
    );

    setAuthToken(response.accessToken);
    return response;
  },

  logout: async () => {
    await fetchApi('/auth/logout', { method: 'POST' });
    removeAuthToken();
  },

  me: async () => {
    return fetchApi('/auth/me');
  },
};

// ============================================
// Products API
// ============================================

export const productsApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.category) queryParams.append('category', params.category);
    if (params?.brand) queryParams.append('brand', params.brand);
    if (params?.minPrice) queryParams.append('minPrice', String(params.minPrice));
    if (params?.maxPrice) queryParams.append('maxPrice', String(params.maxPrice));
    if (params?.sort) queryParams.append('sort', params.sort);

    return fetchApi(`/products?${queryParams.toString()}`);
  },

  get: async (id: number) => {
    return fetchApi(`/products/${id}`);
  },

  create: async (data: Record<string, unknown>) => {
    return fetchApi('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Record<string, unknown>) => {
    return fetchApi(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return fetchApi(`/products/${id}`, { method: 'DELETE' });
  },

  bulkDelete: async (ids: number[]) => {
    return fetchApi('/products/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },

  uploadImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const url = `${API_URL}/products/upload-images`;
    const token = getAuthToken();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Ошибка сети' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },
};

// ============================================
// Categories API
// ============================================

export const categoriesApi = {
  list: async () => {
    return fetchApi('/categories');
  },

  get: async (slug: string) => {
    return fetchApi(`/categories/${slug}`);
  },

  create: async (data: Record<string, unknown>) => {
    return fetchApi('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (slug: string, data: Record<string, unknown>) => {
    return fetchApi(`/categories/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (slug: string) => {
    return fetchApi(`/categories/${slug}`, { method: 'DELETE' });
  },

  reorder: async (categories: Array<{ id: number; position: number }>) => {
    return fetchApi('/categories/reorder', {
      method: 'PUT',
      body: JSON.stringify({ categories }),
    });
  },
};

// ============================================
// Orders API
// ============================================

export const ordersApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    sort?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.status) queryParams.append('status', params.status);
    if (params?.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
    if (params?.sort) queryParams.append('sort', params.sort);

    return fetchApi(`/orders?${queryParams.toString()}`);
  },

  get: async (id: number) => {
    return fetchApi(`/orders/${id}`);
  },

  updateStatus: async (id: number, status: string) => {
    return fetchApi(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  update: async (id: number, data: Record<string, unknown>) => {
    return fetchApi(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  cancel: async (id: number) => {
    return fetchApi(`/orders/${id}/cancel`, { method: 'POST' });
  },

  getInvoice: async (id: number) => {
    return fetchApi(`/orders/${id}/invoice`);
  },
};

// ============================================
// Brands API
// ============================================

export const brandsApi = {
  list: async () => {
    return fetchApi('/brands');
  },

  get: async (slug: string) => {
    return fetchApi(`/brands/${slug}`);
  },

  create: async (data: Record<string, unknown>) => {
    return fetchApi('/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// Users API
// ============================================

export const usersApi = {
  list: async (params?: { page?: number; limit?: number; role?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.role) queryParams.append('role', params.role);

    return fetchApi(`/users?${queryParams.toString()}`);
  },

  get: async (id: number) => {
    return fetchApi(`/users/${id}`);
  },

  create: async (data: Record<string, unknown>) => {
    return fetchApi('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Record<string, unknown>) => {
    return fetchApi(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return fetchApi(`/users/${id}`, { method: 'DELETE' });
  },

  updateRole: async (id: number, role: string) => {
    return fetchApi(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },
};

// ============================================
// Analytics API
// ============================================

export const analyticsApi = {
  sales: async (period: 'day' | 'week' | 'month' | 'year') => {
    return fetchApi(`/analytics/sales?period=${period}`);
  },

  products: async () => {
    return fetchApi('/analytics/products');
  },

  customers: async () => {
    return fetchApi('/analytics/customers');
  },

  conversion: async () => {
    return fetchApi('/analytics/conversion');
  },
};

// ============================================
// Warehouses API
// ============================================

export const warehousesApi = {
  list: async () => {
    return fetchApi('/warehouses');
  },

  get: async (id: number) => {
    return fetchApi(`/warehouses/${id}`);
  },

  create: async (data: Record<string, unknown>) => {
    return fetchApi('/warehouses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Record<string, unknown>) => {
    return fetchApi(`/warehouses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return fetchApi(`/warehouses/${id}`, { method: 'DELETE' });
  },

  getStock: async (id: number) => {
    return fetchApi(`/warehouses/${id}/stock`);
  },

  transfer: async (data: { fromId: number; toId: number; productId: number; quantity: number }) => {
    return fetchApi('/warehouses/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// Settings API
// ============================================

export const settingsApi = {
  get: async () => {
    return fetchApi('/settings');
  },

  update: async (data: Record<string, unknown>) => {
    return fetchApi('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// Price History API
// ============================================

export const priceHistoryApi = {
  list: async (params?: { productId?: number; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.productId) queryParams.append('productId', String(params.productId));
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));

    return fetchApi(`/price-history?${queryParams.toString()}`);
  },
};

// ============================================
// Logs API
// ============================================

export const logsApi = {
  list: async (params?: { source?: string; level?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.source) queryParams.append('source', params.source);
    if (params?.level) queryParams.append('level', params.level);
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));

    return fetchApi(`/logs?${queryParams.toString()}`);
  },

  parserLogs: async (params?: { source?: string; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.source) queryParams.append('source', params.source);
    if (params?.limit) queryParams.append('limit', String(params.limit));

    return fetchApi(`/parser/logs?${queryParams.toString()}`);
  },
};

// ============================================
// Media API
// ============================================

export const mediaApi = {
  list: async () => {
    return fetchApi('/media');
  },

  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return fetchApi('/media/upload', {
      method: 'POST',
      body: formData,
    });
  },

  delete: async (id: number) => {
    return fetchApi(`/media/${id}`, { method: 'DELETE' });
  },
};

// ============================================
// Export
// ============================================

export const adminApi = {
  auth: authApi,
  products: productsApi,
  categories: categoriesApi,
  brands: brandsApi,
  orders: ordersApi,
  users: usersApi,
  analytics: analyticsApi,
  warehouses: warehousesApi,
  settings: settingsApi,
  priceHistory: priceHistoryApi,
  logs: logsApi,
  media: mediaApi,
};

export default adminApi;
