// ============================================
// Zustand Stores для 1000FPS Storefront
// Best practices:
// - Используем persist для client-side state
// - Избегаем localStorage в server components
// - Правильная обработка ошибок
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { api } from '@/lib/api';
import { getAuthToken } from '@/lib/tokenUtils';

// ============================================
// Auth Store
// ============================================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set, _get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hasHydrated: true,

  setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.auth.login({ email, password });
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Unknown error', isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.auth.register(data);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Unknown error', isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    set({ user: null, isAuthenticated: false, hasHydrated: false });
  },

  fetchUser: async () => {
    try {
      const user = await api.auth.me();
      set({ user, isAuthenticated: true });
    } catch (err) {
      set({ user: null, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),

  setUser: (user) => set({ user, isAuthenticated: !!user, hasHydrated: true }),
}));

// ============================================
// Cart Store (только UI state)
// ============================================

interface CartState {
  isOpen: boolean;

  // Actions
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>()((set) => ({
  isOpen: false,

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
}));

// ============================================
// Wishlist Store (только UI state)
// ============================================

interface WishlistState {
  isOpen: boolean;

  // Actions
  toggleWishlist: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()((set) => ({
  isOpen: false,

  toggleWishlist: () => set((state) => ({ isOpen: !state.isOpen })),
  openWishlist: () => set({ isOpen: true }),
  closeWishlist: () => set({ isOpen: false }),
}));

// ============================================
// Configurator Store
// ============================================

import type { Product, PcConfig } from '@/types';

interface LocalConfigItem {
  partType: string;
  productId: number;
  product: Product;
  price: number;
}

interface ConfiguratorState {
  currentConfig: {
    id?: number;
    userId?: number;
    name?: string;
    items: LocalConfigItem[];
    totalPrice?: number;
    isCompatible?: boolean;
    isPublic?: boolean;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  savedConfigs: PcConfig[];
  isLoading: boolean;

  // Actions
  setPart: (partType: string, productId: number, product: Product) => void;
  removePart: (partType: string) => void;
  clearConfig: () => void;
  saveConfig: (name?: string) => Promise<void>;
  loadConfig: (id: number) => Promise<void>;
  fetchConfigs: () => Promise<void>;
  deleteConfig: (id: number) => Promise<void>;
}

export const useConfiguratorStore = create<ConfiguratorState>()(
  persist(
    (set, _get) => ({
      currentConfig: null,
      savedConfigs: [],
      isLoading: false,

      setPart: (partType, productId, product) => {
        set((state) => ({
          currentConfig: {
            ...state.currentConfig,
            items: [
              ...(state.currentConfig?.items || []).filter(
                (item: LocalConfigItem) => item.partType !== partType
              ),
              { partType, productId, product, price: product.price },
            ],
          },
        }));
      },

      removePart: (partType) => {
        set((state) => ({
          currentConfig: {
            ...state.currentConfig,
            items: (state.currentConfig?.items || []).filter(
              (item: LocalConfigItem) => item.partType !== partType
            ),
          },
        }));
      },

      clearConfig: () => {
        set({ currentConfig: null });
      },

      saveConfig: async (name) => {
        const { currentConfig } = _get();
        if (!currentConfig) return;

        set({ isLoading: true });
        try {
          const parts: Record<string, number> = {};
          (currentConfig.items || []).forEach((item: LocalConfigItem) => {
            parts[item.partType] = item.productId;
          });

          const config = await api.configurator.createConfig({
            name: name || 'Моя сборка',
            parts,
          });

          set((state) => ({
            savedConfigs: [...state.savedConfigs, config],
            currentConfig: null,
            isLoading: false,
          }));
        } catch (err) {
          console.error('Failed to save config:', err);
          set({ isLoading: false });
          throw err;
        }
      },

      loadConfig: async (id) => {
        set({ isLoading: true });
        try {
          const config = await api.configurator.getConfig(id);
          set({ currentConfig: config, isLoading: false });
        } catch (err) {
          console.error('Failed to load config:', err);
          set({ isLoading: false });
          throw err;
        }
      },

      fetchConfigs: async () => {
        set({ isLoading: true });
        try {
          const response = await api.configurator.getConfigs();
          set({ savedConfigs: response.configs, isLoading: false });
        } catch (err) {
          console.error('Failed to fetch configs:', err);
          set({ savedConfigs: [], isLoading: false });
        }
      },

      deleteConfig: async (id) => {
        set({ isLoading: true });
        try {
          await api.configurator.deleteConfig(id);
          set((state) => ({
            savedConfigs: state.savedConfigs.filter((c) => c.id !== id),
            isLoading: false,
          }));
        } catch (err) {
          console.error('Failed to delete config:', err);
          set({ isLoading: false });
          throw err;
        }
      },
    }),
    {
      name: 'configurator-storage',
      partialize: (state) => ({
        currentConfig: state.currentConfig,
        savedConfigs: state.savedConfigs,
      }),
    }
  )
);

// ============================================
// UI Store (для общих UI состояний)
// ============================================

interface UIState {
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  searchQuery: string;

  // Actions
  toggleMobileMenu: () => void;
  toggleSearch: () => void;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  mobileMenuOpen: false,
  searchOpen: false,
  searchQuery: '',

  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
