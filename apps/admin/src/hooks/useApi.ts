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

// ============================================
// Users Hooks
// ============================================

export function useUsers(params?: { page?: number; limit?: number; role?: string }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.list(params),
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
  });
}

export function useAnalyticsProducts() {
  return useQuery({
    queryKey: ['analytics', 'products'],
    queryFn: () => analyticsApi.products(),
  });
}

export function useAnalyticsCustomers() {
  return useQuery({
    queryKey: ['analytics', 'customers'],
    queryFn: () => analyticsApi.customers(),
  });
}

// ============================================
// Warehouses Hooks
// ============================================

export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehousesApi.list(),
  });
}

export function useWarehouse(id: number) {
  return useQuery({
    queryKey: ['warehouse', id],
    queryFn: () => warehousesApi.get(id),
    enabled: !!id,
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
  });
}

export function useParserLogs(params?: { source?: string; limit?: number }) {
  return useQuery({
    queryKey: ['parser-logs', params],
    queryFn: () => logsApi.parserLogs(params),
  });
}

// ============================================
// Media Hooks
// ============================================

export function useMedia() {
  return useQuery({
    queryKey: ['media'],
    queryFn: () => mediaApi.list(),
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => mediaApi.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
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
  });
}
