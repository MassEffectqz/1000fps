// ============================================
// React Query Hooks для Admin Panel
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  usersApi,
  analyticsApi,
  warehousesApi,
  settingsApi,
  priceHistoryApi,
  logsApi,
  mediaApi,
} from '@/lib/api';

// Конфигурация для всех query hooks
const DEFAULT_QUERY_OPTIONS = {
  retry: 2,
  staleTime: 5 * 60 * 1000, // 5 минут
};

// ============================================
// Users Hooks
// ============================================

export function useUsers(params?: { page?: number; limit?: number; role?: string }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.list(params),
    ...DEFAULT_QUERY_OPTIONS,
    retry: 1,
    onError: (error) => {
      if (error instanceof Response && error.status === 404) {
        return;
      }
      console.error('Failed to fetch users:', error);
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// ============================================
// Analytics Hooks
// ============================================

export function useAnalyticsSales(period: 'day' | 'week' | 'month' | 'year') {
  return useQuery({
    queryKey: ['analytics', 'sales', period],
    queryFn: () => analyticsApi.sales(period),
    ...DEFAULT_QUERY_OPTIONS,
    retry: 1, // Меньше попыток для analytics
    onError: (error) => {
      // Игнорируем 404 ошибки для analytics (endpoint ещё не реализован)
      if (error instanceof Response && error.status === 404) {
        return;
      }
      console.error('Failed to fetch analytics sales:', error);
    },
  });
}

export function useAnalyticsProducts() {
  return useQuery({
    queryKey: ['analytics', 'products'],
    queryFn: () => analyticsApi.products(),
    ...DEFAULT_QUERY_OPTIONS,
    retry: 1,
    onError: (error) => {
      if (error instanceof Response && error.status === 404) {
        return;
      }
      console.error('Failed to fetch analytics products:', error);
    },
  });
}

export function useAnalyticsCustomers() {
  return useQuery({
    queryKey: ['analytics', 'customers'],
    queryFn: () => analyticsApi.customers(),
    ...DEFAULT_QUERY_OPTIONS,
    retry: 1,
    onError: (error) => {
      if (error instanceof Response && error.status === 404) {
        return;
      }
      console.error('Failed to fetch analytics customers:', error);
    },
  });
}

// ============================================
// Warehouses Hooks
// ============================================

export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehousesApi.list(),
    ...DEFAULT_QUERY_OPTIONS,
    onError: (error) => {
      console.error('Failed to fetch warehouses:', error);
    },
  });
}

export function useWarehouse(id: number) {
  return useQuery({
    queryKey: ['warehouse', id],
    queryFn: () => warehousesApi.get(id),
    ...DEFAULT_QUERY_OPTIONS,
    enabled: !!id,
    onError: (error) => {
      console.error('Failed to fetch warehouse:', error);
    },
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => warehousesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });
}

export function useUpdateWarehouse(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => warehousesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse', id] });
    },
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => warehousesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });
}

// ============================================
// Settings Hooks
// ============================================

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get(),
    ...DEFAULT_QUERY_OPTIONS,
    retry: 1,
    onError: (error) => {
      if (error instanceof Response && error.status === 404) {
        return;
      }
      console.error('Failed to fetch settings:', error);
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => settingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

// ============================================
// Price History Hooks
// ============================================

export function usePriceHistory(params?: { productId?: number; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['price-history', params],
    queryFn: () => priceHistoryApi.list(params),
    ...DEFAULT_QUERY_OPTIONS,
    retry: 1,
    onError: (error) => {
      if (error instanceof Response && error.status === 404) {
        return;
      }
      console.error('Failed to fetch price history:', error);
    },
  });
}

// ============================================
// Logs Hooks
// ============================================

export function useLogs(params?: {
  source?: string;
  level?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['logs', params],
    queryFn: () => logsApi.list(params),
    ...DEFAULT_QUERY_OPTIONS,
    retry: 1,
    onError: (error) => {
      if (error instanceof Response && error.status === 404) {
        return;
      }
      console.error('Failed to fetch logs:', error);
    },
  });
}

export function useParserLogs(params?: { source?: string; limit?: number }) {
  return useQuery({
    queryKey: ['parser-logs', params],
    queryFn: () => logsApi.parserLogs(params),
    ...DEFAULT_QUERY_OPTIONS,
    onError: (error) => {
      console.error('Failed to fetch parser logs:', error);
    },
  });
}

// ============================================
// Media Hooks
// ============================================

export function useMedia() {
  return useQuery({
    queryKey: ['media'],
    queryFn: () => mediaApi.list(),
    ...DEFAULT_QUERY_OPTIONS,
    retry: 1,
    onError: (error) => {
      if (error instanceof Response && error.status === 404) {
        return;
      }
      console.error('Failed to fetch media:', error);
    },
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => mediaApi.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (error) => {
      console.error('Failed to upload media:', error);
      alert('Ошибка при загрузке файла');
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => mediaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (error) => {
      console.error('Failed to delete media:', error);
      alert('Ошибка при удалении файла');
    },
  });
}
