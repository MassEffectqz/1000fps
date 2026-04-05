'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

// Типы
export interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  oldPrice: number | null;
  image: string | null;
  rating: number;
  reviewCount: number;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  brand?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  specs: Array<{
    id: string;
    name: string;
    value: string;
    unit: string | null;
  }>;
  inStock: boolean;
}

export interface CompareItem {
  id: string;
  productId: string;
  product: CompareProduct;
}

export interface Comparison {
  id: string | null;
  items: CompareItem[];
  totalItems: number;
}

interface CompareContextType {
  comparison: Comparison;
  isLoading: boolean;
  refreshComparison: () => Promise<void>;
  addToCompare: (productId: string) => Promise<void>;
  removeFromCompare: (itemId: string) => Promise<void>;
  clearComparison: () => Promise<void>;
  isInCompare: (productId: string) => boolean;
  getCompareCount: () => number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const GUEST_COMPARE_KEY = 'guest_compare';

function getGuestCompare(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const stored = localStorage.getItem(GUEST_COMPARE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading guest compare:', e);
  }
  return [];
}

function saveGuestCompare(productIds: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_COMPARE_KEY, JSON.stringify(productIds));
  } catch (e) {
    console.error('Error saving guest compare:', e);
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [comparison, setComparison] = useState<Comparison>({
    id: null,
    items: [],
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Проверка аутентификации
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setIsAuthenticated(!!data.user);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Загрузка сравнения
  const refreshComparison = useCallback(async () => {
    try {
      let url = '/api/compare';
      if (!isAuthenticated) {
        const guestIds = getGuestCompare();
        if (guestIds.length > 0) {
          url = `/api/compare?products=${guestIds.join(',')}`;
        }
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.comparison) {
        // Маппим images -> image для совместимости
        const mapped = {
          ...data.comparison,
          items: data.comparison.items.map((item: { product: { images?: Array<{ url?: string }>; image?: string | null } }) => ({
            ...item,
            product: {
              ...item.product,
              image: item.product.images?.[0]?.url || item.product.image || null,
            },
          })),
        };
        setComparison(mapped);
      }
    } catch (error) {
      console.error('Error loading comparison:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated !== null) {
      refreshComparison();
    }
  }, [isAuthenticated, refreshComparison]);

  // Добавить в сравнение
  const handleAddToCompare = useCallback(async (productId: string) => {
    // Оптимистичное обновление
    setComparison(prev => {
      if (prev.items.some(item => item.productId === productId)) {
        return prev;
      }

      return {
        ...prev,
        items: [
          ...prev.items,
          {
            id: `temp_${Date.now()}`,
            productId,
            product: {
              id: productId,
              name: 'Загрузка...',
              slug: '',
              sku: '',
              price: 0,
              oldPrice: null,
              image: null,
              rating: 0,
              reviewCount: 0,
              specs: [],
              inStock: true,
            } as CompareProduct,
          },
        ],
        totalItems: prev.items.length + 1,
      };
    });

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при добавлении в сравнение');
      }

      // Для гостей сохраняем в localStorage
      if (isAuthenticated === false) {
        const guestIds = getGuestCompare();
        if (!guestIds.includes(productId)) {
          guestIds.push(productId);
          saveGuestCompare(guestIds);
        }
      }

      await refreshComparison();
      toast.success('Товар добавлен в сравнение');
    } catch (error) {
      console.error('Error adding to comparison:', error);
      await refreshComparison();
      toast.error('Ошибка при добавлении в сравнение');
    }
  }, [refreshComparison, isAuthenticated]);

  // Удалить из сравнения
  const handleRemoveFromCompare = useCallback(async (itemId: string) => {
    // Оптимистичное обновление
    setComparison(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
      totalItems: prev.items.filter(item => item.id !== itemId).length,
    }));

    try {
      // Для гостей просто обновляем localStorage
      if (isAuthenticated === false) {
        const guestIds = getGuestCompare();
        const item = comparison.items.find(i => i.id === itemId);
        if (item) {
          const updatedIds = guestIds.filter(id => id !== item.productId);
          saveGuestCompare(updatedIds);
        }
        await refreshComparison();
        return;
      }

      const response = await fetch(`/api/compare/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении из сравнения');
      }

      await refreshComparison();
      toast.success('Товар удален из сравнения');
    } catch (error) {
      console.error('Error removing from comparison:', error);
      await refreshComparison();
      toast.error('Ошибка при удалении из сравнения');
    }
  }, [refreshComparison, isAuthenticated, comparison.items]);

  // Очистить сравнение
  const handleClearComparison = useCallback(async () => {
    setComparison({ id: null, items: [], totalItems: 0 });

    try {
      const response = await fetch('/api/compare', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при очистке сравнения');
      }

      // Для гостей очищаем localStorage
      if (isAuthenticated === false) {
        localStorage.removeItem(GUEST_COMPARE_KEY);
      }

      await refreshComparison();
      toast.success('Сравнение очищено');
    } catch (error) {
      console.error('Error clearing comparison:', error);
      await refreshComparison();
      toast.error('Ошибка при очистке сравнения');
    }
  }, [refreshComparison, isAuthenticated]);

  // Проверить, есть ли товар в сравнении
  const isInCompare = useCallback((productId: string) => {
    return comparison.items.some(item => item.productId === productId);
  }, [comparison.items]);

  // Получить количество товаров в сравнении
  const getCompareCount = useCallback(() => {
    return comparison.totalItems;
  }, [comparison.totalItems]);

  return (
    <CompareContext.Provider
      value={{
        comparison,
        isLoading,
        refreshComparison,
        addToCompare: handleAddToCompare,
        removeFromCompare: handleRemoveFromCompare,
        clearComparison: handleClearComparison,
        isInCompare,
        getCompareCount,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
