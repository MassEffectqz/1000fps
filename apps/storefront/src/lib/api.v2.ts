// ============================================
// API Client для 1000FPS Storefront (v2 with refresh token)
// ============================================

import type {
  Product,
  Category,
  Brand,
  User,
  Address,
  Cart,
  Wishlist,
  Order,
  PcConfig,
  PaginatedResponse,
  AuthResponse,
  SearchResponse,
  ProductFilters,
  Review,
} from '@/types';
import {
  getAuthToken,
  setAuthToken,
  setRefreshToken,
  removeAuthToken,
  subscribeTokenRefresh,
  refreshAccessToken,
  isTokenRefreshing,
  setTokenRefreshing,
  handleQueueRefresh,
} from './tokenUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// ============================================
// Базовый fetch с refresh token logic
// ============================================

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  useAuth: boolean = true,
  retryCount: number = 0
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

  // Handle 401 Unauthorized - try to refresh token
  if (response.status === 401 && useAuth && retryCount < 2) {
    if (!isTokenRefreshing()) {
      setTokenRefreshing(true);
      try {
        const newToken = await refreshAccessToken();
        setTokenRefreshing(false);
        handleQueueRefresh(newToken);

        // Retry original request with new token
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
        };
        const retryResponse = await fetch(url, config);

        if (!retryResponse.ok) {
          const error = await retryResponse.json().catch(() => ({ message: 'Ошибка сети' }));
          throw new Error(error.message || `HTTP ${retryResponse.status}`);
        }

        return retryResponse.json();
      } catch (error) {
        setTokenRefreshing(false);
        removeAuthToken();
        throw error;
      }
    } else {
      // Wait for token refresh to complete
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          };
          fetch(url, config)
            .then((res) => res.json())
            .then((data) => resolve(data));
        });
      });
    }
  }

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
  register: async (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<AuthResponse> => {
    const response = await fetchApi<AuthResponse>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      false
    );

    setAuthToken(response.accessToken);
    setRefreshToken(response.refreshToken);

    return response;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await fetchApi<AuthResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      false
    );

    setAuthToken(response.accessToken);
    setRefreshToken(response.refreshToken);

    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } finally {
      removeAuthToken();
    }
  },

  me: async (): Promise<User> => {
    return fetchApi<User>('/auth/me');
  },
};

// ============================================
// Products API
// ============================================

export const productsApi = {
  list: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.brand) params.append('brand', filters.brand);
    if (filters?.minPrice) params.append('minPrice', String(filters.minPrice));
    if (filters?.maxPrice) params.append('maxPrice', String(filters.maxPrice));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.sort) params.append('sort', filters.sort);

    return fetchApi<PaginatedResponse<Product>>(`/products?${params.toString()}`, {}, false);
  },

  get: async (slug: string): Promise<Product> => {
    return fetchApi<Product>(`/products/${slug}`, {}, false);
  },

  create: async (data: Partial<Product>): Promise<Product> => {
    return fetchApi<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    return fetchApi<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi(`/products/${id}`, { method: 'DELETE' });
  },
};

// ============================================
// Categories API
// ============================================

export const categoriesApi = {
  list: async (): Promise<{ data: Category[] }> => {
    return fetchApi<{ data: Category[] }>('/categories', {}, false);
  },

  get: async (slug: string): Promise<Category> => {
    return fetchApi<Category>(`/categories/${slug}`, {}, false);
  },
};

// ============================================
// Brands API
// ============================================

export const brandsApi = {
  list: async (): Promise<{ data: Brand[] }> => {
    return fetchApi<{ data: Brand[] }>('/brands', {}, false);
  },

  get: async (slug: string): Promise<Brand> => {
    return fetchApi<Brand>(`/brands/${slug}`, {}, false);
  },
};

// ============================================
// Cart API
// ============================================

export const cartApi = {
  get: async (): Promise<{ cart: Cart | null }> => {
    return fetchApi<{ cart: Cart | null }>('/cart');
  },

  addItem: async (productId: number, quantity: number = 1): Promise<{ cart: Cart }> => {
    return fetchApi<{ cart: Cart }>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  updateItem: async (itemId: number, quantity: number): Promise<{ cart: Cart }> => {
    return fetchApi<{ cart: Cart }>(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  },

  removeItem: async (itemId: number): Promise<void> => {
    return fetchApi(`/cart/items/${itemId}`, { method: 'DELETE' });
  },

  clear: async (): Promise<void> => {
    return fetchApi('/cart', { method: 'DELETE' });
  },

  applyPromo: async (code: string): Promise<{ cart: Cart }> => {
    return fetchApi<{ cart: Cart }>('/cart/promo', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },
};

// ============================================
// Wishlist API
// ============================================

export const wishlistApi = {
  get: async (): Promise<{ wishlist: Wishlist | null }> => {
    return fetchApi<{ wishlist: Wishlist | null }>('/wishlist');
  },

  addItem: async (productId: number): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>('/wishlist/items', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  removeItem: async (itemId: number): Promise<void> => {
    return fetchApi(`/wishlist/items/${itemId}`, { method: 'DELETE' });
  },
};

// ============================================
// Orders API
// ============================================

export const ordersApi = {
  list: async (): Promise<{ orders: Order[] }> => {
    return fetchApi<{ orders: Order[] }>('/orders');
  },

  get: async (id: number): Promise<Order> => {
    return fetchApi<Order>(`/orders/${id}`);
  },

  create: async (data: {
    shippingAddress: Record<string, unknown>;
    shippingMethod: string;
    paymentMethod: string;
    comment?: string;
  }): Promise<Order> => {
    return fetchApi<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  cancel: async (id: number): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>(`/orders/${id}/cancel`, { method: 'POST' });
  },
};

// ============================================
// User API
// ============================================

export const userApi = {
  get: async (): Promise<{ user: User }> => {
    return fetchApi<{ user: User }>('/user/profile');
  },

  update: async (data: Partial<User>): Promise<{ user: User }> => {
    return fetchApi<{ user: User }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getAddresses: async (): Promise<{ addresses: Address[] }> => {
    return fetchApi<{ addresses: Address[] }>('/user/addresses');
  },

  addAddress: async (data: Partial<Address>): Promise<{ address: Address }> => {
    return fetchApi<{ address: Address }>('/user/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAddress: async (id: number, data: Partial<Address>): Promise<{ address: Address }> => {
    return fetchApi<{ address: Address }>(`/user/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteAddress: async (id: number): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>(`/user/addresses/${id}`, { method: 'DELETE' });
  },

  getBonuses: async (): Promise<{ bonusPoints: number; loyaltyLevel: string }> => {
    return fetchApi<{ bonusPoints: number; loyaltyLevel: string }>('/user/bonuses');
  },
};

// ============================================
// Configurator API
// ============================================

export const configuratorApi = {
  getPartsByType: async (type: string): Promise<{ data: Product[] }> => {
    return fetchApi<{ data: Product[] }>(`/configurator/parts/${type}`, {}, false);
  },

  checkCompatibility: async (
    parts: Record<string, number>
  ): Promise<{
    isCompatible: boolean;
    issues: { partType: string; message: string; severity: string }[];
    warnings: { partType: string; message: string; severity: string }[];
  }> => {
    return fetchApi('/configurator/compatibility', {
      method: 'POST',
      body: JSON.stringify({ parts }),
    });
  },

  getConfigs: async (): Promise<{ configs: PcConfig[] }> => {
    return fetchApi<{ configs: PcConfig[] }>('/configs');
  },

  getConfig: async (id: number): Promise<PcConfig> => {
    return fetchApi<PcConfig>(`/configs/${id}`);
  },

  createConfig: async (data: { name?: string; parts: Record<string, number> }): Promise<PcConfig> => {
    return fetchApi<PcConfig>('/configs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateConfig: async (id: number, data: Partial<PcConfig>): Promise<PcConfig> => {
    return fetchApi<PcConfig>(`/configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteConfig: async (id: number): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>(`/configs/${id}`, { method: 'DELETE' });
  },

  addToCart: async (configId: number): Promise<{ message: string; cart: Cart }> => {
    return fetchApi<{ message: string; cart: Cart }>(`/configs/${configId}/add-to-cart`, {
      method: 'POST',
    });
  },
};

// ============================================
// Search API
// ============================================

export const searchApi = {
  search: async (query: string, limit: number = 20): Promise<SearchResponse> => {
    return fetchApi<SearchResponse>(
      `/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      {},
      false
    );
  },

  suggestions: async (query: string): Promise<string[]> => {
    return fetchApi<string[]>(`/search/suggestions?q=${encodeURIComponent(query)}`, {}, false);
  },
};

// ============================================
// Parser API
// ============================================

export const parserApi = {
  import: async (data: {
    article: string;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    category: string;
    description?: string;
    images?: string[];
    specifications?: Record<string, unknown>;
    url?: string;
    source?: string;
  }): Promise<{ success: boolean; productId?: number }> => {
    return fetchApi('/parser/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getStatus: async (): Promise<{ status: string; isRunning: boolean }> => {
    return fetchApi('/parser/status', {}, false);
  },

  getLogs: async (source?: string, limit?: number): Promise<{ logs: string[] }> => {
    const params = new URLSearchParams();
    if (source) params.append('source', source);
    if (limit) params.append('limit', String(limit));
    return fetchApi(`/parser/logs?${params.toString()}`, {}, false);
  },
};

// ============================================
// Reviews API
// ============================================

export const reviewsApi = {
  list: async (productId: number): Promise<Review[]> => {
    return fetchApi<Review[]>(`/products/${productId}/reviews`, {}, false);
  },

  create: async (
    productId: number,
    data: {
      rating: number;
      title?: string;
      text?: string;
      pros?: string;
      cons?: string;
    }
  ): Promise<Review> => {
    return fetchApi<Review>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// Export
// ============================================

export const api = {
  auth: authApi,
  products: productsApi,
  categories: categoriesApi,
  brands: brandsApi,
  cart: cartApi,
  wishlist: wishlistApi,
  orders: ordersApi,
  user: userApi,
  configurator: configuratorApi,
  search: searchApi,
  parser: parserApi,
  reviews: reviewsApi,
};

export default api;
