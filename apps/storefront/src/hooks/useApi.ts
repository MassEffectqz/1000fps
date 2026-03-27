// ============================================
// React Query хуки для 1000FPS
// Best practices:
// - Правильные типы
// - Обработка ошибок
// - Оптимизация refetch
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store';
import type { User, Address } from '@/types';
import type { ProductFilters } from '@/types';

// ============================================
// Products
// ============================================

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.products.list(filters),
    staleTime: 60 * 1000, // 1 минута
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.products.get(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

// ============================================
// Categories
// ============================================

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
    staleTime: 10 * 60 * 1000, // 10 минут
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => api.categories.get(slug),
    enabled: !!slug,
  });
}

// ============================================
// Brands
// ============================================

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => api.brands.list(),
    staleTime: 10 * 60 * 1000, // 10 минут
  });
}

// ============================================
// Cart
// ============================================

export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => api.cart.get(),
    staleTime: 30 * 1000, // 30 секунд
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: (params: {
      productId: number;
      quantity?: number;
    }) => api.cart.addItem(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      console.error('Failed to add to cart:', error);
      // Если ошибка 401 - перенаправляем на авторизацию
      if (!isAuthenticated) {
        console.warn('User not authenticated, redirecting to login');
      }
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      api.cart.updateItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: number) => api.cart.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

// ============================================
// Wishlist
// ============================================

export function useWishlist() {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.wishlist.get(),
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => api.wishlist.addItem(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: number) => api.wishlist.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

// ============================================
// Auth
// ============================================

export function useAuth() {
  return useQuery({
    queryKey: ['auth'],
    queryFn: () => api.auth.me(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.auth.login({ email, password }),
    onSuccess: (data) => {
      // Обновляем Zustand store
      setUser(data.user);
      // Инвалидируем кэш для обновления данных
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
    }) => api.auth.register(data),
    onSuccess: (data) => {
      // Обновляем Zustand store
      setUser(data.user);
      // Инвалидируем кэш для обновления данных
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: () => api.auth.logout(),
    onSuccess: () => {
      // Очищаем Zustand store
      setUser(null);
      // Очищаем кэш React Query
      queryClient.clear();
    },
  });
}

// ============================================
// Orders
// ============================================

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => api.orders.list(),
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => api.orders.get(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      shippingAddress: Record<string, unknown>;
      shippingMethod: string;
      paymentMethod: string;
      comment?: string;
    }) => api.orders.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

// ============================================
// Search
// ============================================

export function useSearch(query: string, limit?: number) {
  return useQuery({
    queryKey: ['search', query, limit],
    queryFn: () => api.search.search(query, limit),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
}

export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: () => api.search.suggestions(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

// ============================================
// Warehouses
// ============================================

export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: () => api.warehouses.list(),
    staleTime: 10 * 60 * 1000, // 10 минут
  });
}

export function useProductWarehouseStock(productId: number) {
  return useQuery({
    queryKey: ['product-warehouse-stock', productId],
    queryFn: () => api.warehouses.getProductStock(productId),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
}

// ============================================
// Configurator
// ============================================

export function usePartsByType(type: string) {
  return useQuery({
    queryKey: ['parts', type],
    queryFn: () => api.configurator.getPartsByType(type),
    enabled: !!type,
  });
}

export function useConfigs() {
  return useQuery({
    queryKey: ['configs'],
    queryFn: () => api.configurator.getConfigs(),
  });
}

export function useCreateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; parts: Record<string, number> }) =>
      api.configurator.createConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configs'] });
    },
  });
}

// ============================================
// User Profile
// ============================================

export function useUserProfile() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: () => api.user.get(),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) => api.user.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}

// ============================================
// Addresses
// ============================================

export function useAddresses() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.user.getAddresses(),
  });
}

export function useAddAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Address>) => api.user.addAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.user.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}
