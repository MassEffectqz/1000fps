'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

// Типы
export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  finalPrice: number;
  image: string | null;
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
  inStock: boolean;
  availableQuantity: number;
  warehouse?: {
    id: string;
    name: string;
    address: string;
    city: string;
    phone: string | null;
  } | null;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  warehouseId?: string | null;
  product: CartProduct;
}

export interface Cart {
  id: string | null;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  finalPrice: number;
  oldPrice: number | null;
  discountValue: number | null;
  discountType: string;
  rating: number;
  reviewCount: number;
  image: string | null;
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
  inStock: boolean;
  totalStock: number;
  badges: Array<{
    text: string;
    variant: 'orange' | 'green' | 'blue' | 'gray' | 'yellow';
  }>;
}

export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: WishlistProduct;
}

export interface Wishlist {
  id: string | null;
  items: WishlistItem[];
  totalItems: number;
}

interface CartContextType {
  cart: Cart;
  wishlist: Wishlist;
  isLoading: boolean;
  isCartDrawerOpen: boolean;
  isUpdatingItem: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  addToCart: (productId: string, quantity?: number, warehouseId?: string, supplierId?: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartItem: (itemId: string, quantity?: number, warehouseId?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  wishlistToCart: (itemIds?: string[]) => Promise<void>;
  isInCart: (productId: string) => boolean;
  isInWishlist: (productId: string) => boolean;
  getCartQuantity: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Гостевая корзина в localStorage
const GUEST_CART_KEY = 'guest_cart';
const GUEST_WISHLIST_KEY = 'guest_wishlist';

function getGuestCart(): Cart {
  if (typeof window === 'undefined') {
    return { id: null, items: [], totalItems: 0, totalPrice: 0 };
  }
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading guest cart:', e);
  }
  return { id: null, items: [], totalItems: 0, totalPrice: 0 };
}

function saveGuestCart(cart: Cart) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Error saving guest cart:', e);
  }
}

function getGuestWishlist(): Wishlist {
  if (typeof window === 'undefined') {
    return { id: null, items: [], totalItems: 0 };
  }
  try {
    const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading guest wishlist:', e);
  }
  return { id: null, items: [], totalItems: 0 };
}

function saveGuestWishlist(wishlist: Wishlist) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(wishlist));
  } catch (e) {
    console.error('Error saving guest wishlist:', e);
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({ id: null, items: [], totalItems: 0, totalPrice: 0 });
  const [wishlist, setWishlist] = useState<Wishlist>({ id: null, items: [], totalItems: 0 });
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
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

  // Синхронизация гостевой корзины с сервером
  const syncGuestCart = useCallback(async (guestCart: Cart) => {
    if (guestCart.items.length === 0) return;
    
    try {
      const items = guestCart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        warehouseId: item.warehouseId,
      }));

      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (response.ok) {
        localStorage.removeItem(GUEST_CART_KEY);
      }
    } catch (error) {
      console.error('Error syncing guest cart:', error);
    }
  }, []);

  // Загрузка корзины
  const refreshCart = useCallback(async () => {
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();
      
      if (data.cart) {
        const serverCart = data.cart;
        setCart(serverCart);
        
        if (isAuthenticated === true) {
          // Синхронизируем гостевую корзину с сервером
          const guestCart = getGuestCart();
          if (guestCart.items.length > 0) {
            await syncGuestCart(guestCart);
          }
        }
      } else if (isAuthenticated === false) {
        // Используем гостевую корзину
        const guestCart = getGuestCart();
        setCart(guestCart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      if (isAuthenticated === false) {
        const guestCart = getGuestCart();
        setCart(guestCart);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, syncGuestCart]);

  // Загрузка вишлиста
  const refreshWishlist = useCallback(async () => {
    try {
      const response = await fetch('/api/wishlist');
      const data = await response.json();
      
      if (data.wishlist) {
        setWishlist(data.wishlist);
        if (isAuthenticated === true) {
          localStorage.removeItem(GUEST_WISHLIST_KEY);
        }
      } else if (isAuthenticated === false) {
        const guestWishlist = getGuestWishlist();
        setWishlist(guestWishlist);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      if (isAuthenticated === false) {
        const guestWishlist = getGuestWishlist();
        setWishlist(guestWishlist);
      }
    }
  }, [isAuthenticated]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated !== null) {
      refreshCart();
      refreshWishlist();
    }
  }, [isAuthenticated, refreshCart, refreshWishlist]);

  // Добавить в корзину
  const handleAddToCart = useCallback(async (productId: string, quantity: number = 1, warehouseId?: string, supplierId?: string) => {
    console.log('[CartContext] handleAddToCart called:', productId, quantity, warehouseId, supplierId);
    const optimisticItemId = `temp_${Date.now()}`;
    
    // Оптимистичное обновление
    setCart(prev => {
      const existingItem = prev.items.find(item => item.productId === productId);
      let newItems: CartItem[];
      
      if (existingItem) {
        newItems = prev.items.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Для гостевой корзины создаем временный элемент
        const tempProduct: CartProduct = {
          id: productId,
          name: 'Загрузка...',
          slug: '',
          sku: '',
          price: 0,
          finalPrice: 0,
          image: null,
          inStock: true,
          availableQuantity: 0,
        };
        
        newItems = [
          ...prev.items,
          {
            id: optimisticItemId,
            productId,
            quantity,
            warehouseId,
            product: tempProduct,
          },
        ];
      }
      
      const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      return { ...prev, items: newItems, totalItems: newTotalItems };
    });

    setIsCartDrawerOpen(true);

    console.log('[CartContext] Sending POST to /api/cart', { productId, quantity, warehouseId, supplierId });
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, warehouseId, supplierId }),
      });

      const data = await response.json();
      console.log('[CartContext] Response:', response.status, data);

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при добавлении в корзину');
      }

      // Обновляем корзину с серверными данными
      await refreshCart();
      toast.success('Товар добавлен в корзину');
    } catch (error) {
      console.error('[CartContext] Error adding to cart:', error);
      // Откат оптимистичного обновления
      await refreshCart();
      
      if (isAuthenticated === false) {
        // Для гостевой корзины получаем данные о товаре
        try {
          const productResponse = await fetch(`/api/products/${productId}`);
          
          let productData: CartProduct | null = null;
          
          if (productResponse.ok) {
            const productJson = await productResponse.json();
            productData = {
              id: productJson.id,
              name: productJson.name,
              slug: productJson.slug,
              sku: productJson.sku,
              price: productJson.price,
              finalPrice: productJson.finalPrice,
              image: productJson.image,
              inStock: productJson.inStock,
              availableQuantity: productJson.availableQuantity,
              category: productJson.category || null,
              brand: productJson.brand || null,
              warehouse: null,
            };
          }
          
          const guestCart = getGuestCart();
          const existingItem = guestCart.items.find(item => item.productId === productId);
          
          if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            guestCart.items.push({
              id: optimisticItemId,
              productId,
              quantity,
              warehouseId,
              product: productData || {
                id: productId,
                name: 'Товар',
                slug: '',
                sku: '',
                price: 0,
                finalPrice: 0,
                image: null,
                inStock: true,
                availableQuantity: 0,
              },
            });
          }
          
          guestCart.totalItems = guestCart.items.reduce((sum, item) => sum + item.quantity, 0);
          guestCart.totalPrice = guestCart.items.reduce((sum, item) => sum + (item.product.finalPrice || 0) * item.quantity, 0);
          saveGuestCart(guestCart);
          setCart(guestCart);
          toast.success('Товар добавлен в корзину');
        } catch {
          // Если не удалось получить данные о товаре, создаем пустой элемент
          const guestCart = getGuestCart();
          const existingItem = guestCart.items.find(item => item.productId === productId);
          
          if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            guestCart.items.push({
              id: optimisticItemId,
              productId,
              quantity,
              warehouseId,
              product: {
                id: productId,
                name: 'Товар',
                slug: '',
                sku: '',
                price: 0,
                finalPrice: 0,
                image: null,
                inStock: true,
                availableQuantity: 0,
              },
            });
          }
          
          guestCart.totalItems = guestCart.items.reduce((sum, item) => sum + item.quantity, 0);
          saveGuestCart(guestCart);
          setCart(guestCart);
          toast.success('Товар добавлен в корзину (данные загружаются)');
        }
      } else {
        toast.error('Ошибка при добавлении в корзину. Требуется авторизация.');
      }
    }
  }, [refreshCart, isAuthenticated]);

  // Удалить из корзины
  const handleRemoveFromCart = useCallback(async (itemId: string) => {
    // Проверяем, есть ли элемент в корзине
    const itemExists = cart.items.some(item => item.id === itemId);
    
    if (!itemExists) {
      console.warn('Item not found in cart:', itemId);
      // Обновляем корзину с сервера
      await refreshCart();
      return;
    }
    
    // Оптимистичное обновление
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
      totalItems: prev.items.filter(item => item.id !== itemId).reduce((sum, item) => sum + item.quantity, 0),
    }));

    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      });

      // Если 404 - элемент уже удалён, это нормально
      if (response.status === 404) {
        await refreshCart();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при удалении из корзины');
      }

      await refreshCart();
      toast.success('Товар удален из корзины');
    } catch (error) {
      console.error('Error removing from cart:', error);
      await refreshCart();
      toast.error('Ошибка при удалении из корзины');
    }
  }, [refreshCart, cart.items]);

  // Обновить элемент корзины
  const handleUpdateCartItem = useCallback(async (itemId: string, quantity?: number, warehouseId?: string) => {
    // Блокируем повторные запросы
    if (isUpdatingItem) return;
    
    setIsUpdatingItem(true);
    
    // Оптимистичное обновление
    setCart(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId
          ? { ...item, quantity: quantity ?? item.quantity, warehouseId: warehouseId ?? item.warehouseId }
          : item
      ),
    }));

    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, warehouseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при обновлении корзины');
      }

      await refreshCart();
    } catch (error) {
      console.error('Error updating cart item:', error);
      await refreshCart();
      toast.error('Ошибка при обновлении корзины');
    } finally {
      // Снимаем блокировку через небольшую задержку
      setTimeout(() => setIsUpdatingItem(false), 300);
    }
  }, [refreshCart, isUpdatingItem]);

  // Очистить корзину
  const handleClearCart = useCallback(async () => {
    setCart({ id: null, items: [], totalItems: 0, totalPrice: 0 });

    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при очистке корзины');
      }

      await refreshCart();
      toast.success('Корзина очищена');
    } catch (error) {
      console.error('Error clearing cart:', error);
      await refreshCart();
      toast.error('Ошибка при очистке корзины');
    }
  }, [refreshCart]);

  // Добавить в вишлист
  const handleAddToWishlist = useCallback(async (productId: string) => {
    // Оптимистичное обновление
    setWishlist(prev => {
      // Проверяем, нет ли уже такого товара
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
            createdAt: new Date().toISOString(),
            product: {
              id: productId,
              name: 'Загрузка...',
              slug: '',
              sku: '',
              price: 0,
              finalPrice: 0,
              oldPrice: null,
              discountValue: null,
              discountType: 'PERCENT',
              rating: 0,
              reviewCount: 0,
              image: null,
              inStock: true,
              totalStock: 0,
              badges: [],
            },
          },
        ],
        totalItems: prev.items.length + 1,
      };
    });

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при добавлении в вишлист');
      }

      await refreshWishlist();
      toast.success('Товар добавлен в вишлист');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      await refreshWishlist();

      // Гостевой режим (или демо) — сохраняем в localStorage
      if (isAuthenticated !== true) {
        const guestWishlist = getGuestWishlist();

        if (!guestWishlist.items.some(item => item.productId === productId)) {
          guestWishlist.items.push({
            id: `temp_${Date.now()}`,
            productId,
            createdAt: new Date().toISOString(),
            product: {
              id: productId,
              name: 'Товар',
              slug: '',
              sku: '',
              price: 0,
              finalPrice: 0,
              oldPrice: null,
              discountValue: null,
              discountType: 'PERCENT',
              rating: 0,
              reviewCount: 0,
              image: null,
              inStock: true,
              totalStock: 0,
              badges: [],
            },
          });
          guestWishlist.totalItems = guestWishlist.items.length;
          saveGuestWishlist(guestWishlist);
          setWishlist(guestWishlist);
        }

        toast.success('Товар добавлен в вишлист');
      } else {
        toast.error('Ошибка при добавлении в вишлист');
      }
    }
  }, [refreshWishlist, isAuthenticated]);

  // Удалить из вишлиста
  const handleRemoveFromWishlist = useCallback(async (itemId: string) => {
    // Оптимистичное обновление
    setWishlist(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
      totalItems: prev.items.filter(item => item.id !== itemId).length,
    }));

    try {
      // Для гостевых пользователей просто обновляем localStorage
      if (isAuthenticated === false) {
        const guestWishlist = getGuestWishlist();
        guestWishlist.items = guestWishlist.items.filter(item => item.id !== itemId);
        localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(guestWishlist));
        await refreshWishlist();
        return;
      }

      const response = await fetch(`/api/wishlist/items/${itemId}`, {
        method: 'DELETE',
      });

      // Если 401 или 404 - это нормально для неавторизованных
      if (response.status === 401 || response.status === 404) {
        await refreshWishlist();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при удалении из вишлиста');
      }

      await refreshWishlist();
      toast.success('Товар удален из вишлиста');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      await refreshWishlist();
      toast.error('Ошибка при удалении из вишлиста');
    }
  }, [refreshWishlist, isAuthenticated]);

  // Перенести из вишлиста в корзину
  const handleWishlistToCart = useCallback(async (itemIds?: string[]) => {
    try {
      const response = await fetch('/api/wishlist/add-to-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при переносе товаров');
      }

      await refreshCart();
      await refreshWishlist();
      toast.success(data.message || 'Товары перенесены в корзину');
      setIsCartDrawerOpen(true);
    } catch (error) {
      console.error('Error moving wishlist to cart:', error);
      toast.error('Ошибка при переносе товаров в корзину');
    }
  }, [refreshCart, refreshWishlist]);

  // Проверить, есть ли товар в корзине
  const isInCart = useCallback((productId: string) => {
    return cart.items.some(item => item.productId === productId);
  }, [cart.items]);

  // Проверить, есть ли товар в вишлисте
  const isInWishlist = useCallback((productId: string) => {
    return wishlist.items.some(item => item.productId === productId);
  }, [wishlist.items]);

  // Получить общее количество товаров в корзине
  const getCartQuantity = useCallback(() => {
    return cart.totalItems;
  }, [cart.totalItems]);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        isLoading,
        isUpdatingItem,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        refreshCart,
        refreshWishlist,
        addToCart: handleAddToCart,
        removeFromCart: handleRemoveFromCart,
        updateCartItem: handleUpdateCartItem,
        clearCart: handleClearCart,
        addToWishlist: handleAddToWishlist,
        removeFromWishlist: handleRemoveFromWishlist,
        wishlistToCart: handleWishlistToCart,
        isInCart,
        isInWishlist,
        getCartQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
