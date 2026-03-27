# 📐 Best Practices — 1000FPS Storefront

Руководство по написанию чистого и поддерживаемого кода

---

## 🎯 Общие принципы

### 1. Структура проекта

```
apps/storefront/
├── src/
│   ├── app/              # Next.js App Router страницы
│   ├── components/       # React компоненты
│   ├── lib/              # Утилиты и API client
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript типы
│   └── styles/           # Глобальные стили
```

### 2. Именование

- **Файлы**: kebab-case (`product-card.tsx`)
- **Компоненты**: PascalCase (`ProductCard`)
- **Хуки**: camelCase с префиксом `use` (`useCart`)
- **Типы**: PascalCase (`Product`, `CartItem`)
- **Константы**: UPPER_SNAKE_CASE (`API_URL`)

---

## ⚛️ React Best Practices

### 1. Client vs Server Components

```tsx
// ✅ Server Component (по умолчанию)
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  return <div>{product.name}</div>;
}

// ✅ Client Component (когда нужен интерактив)
('use client');

export default function ProductCard({ product }: { product: Product }) {
  const [count, setCount] = useState(0);
  return <div>{product.name}</div>;
}
```

### 2. Хуки и состояния

```tsx
// ✅ Правильно: выносим логику в custom hooks
function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.products.get(slug),
    enabled: !!slug,
  });
}

// ✅ Правильно: используем функциональные обновления
setCount((prev) => prev + 1);

// ❌ Неправильно: прямое изменение состояния
count++;
```

### 3. Эффекты

```tsx
// ✅ Правильно: cleanup function
useEffect(() => {
  const timer = setInterval(() => {...}, 1000);
  return () => clearInterval(timer);
}, []);

// ✅ Правильно: зависимости
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ❌ Неправильно: missing dependencies
useEffect(() => {
  fetchData(userId); // userId не в зависимостях
}, []);
```

---

## 🔄 State Management

### 1. Zustand для global state

```tsx
// ✅ Правильно: создаём store
interface CartState {
  cart: Cart | null;
  addItem: (productId: number) => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: null,
      addItem: async (productId) => {
        const response = await api.cart.addItem(productId);
        set({ cart: response.cart });
      },
    }),
    { name: 'cart-storage' }
  )
);

// ✅ Правильно: используем в компоненте
const { cart, addItem } = useCartStore();
```

### 2. React Query для server state

```tsx
// ✅ Правильно: используем React Query
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.products.list(filters),
    staleTime: 60 * 1000,
  });
}

// ✅ Использование в компоненте
const { data, isLoading, error } = useProducts({ category: 'gpu' });
```

---

## 🌐 API Client

### 1. Типизация

```tsx
// ✅ Правильно: строгая типизация
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  useAuth: boolean = true
): Promise<T> {
  // ...
}

// ✅ Использование
const products = await fetchApi<PaginatedResponse<Product>>('/products');
```

### 2. Обработка ошибок

```tsx
// ✅ Правильно: централизованная обработка
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка сети' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}
```

### 3. Авторизация

```tsx
// ✅ Правильно: токены через cookies для SSR
async function getAuthToken(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    return (
      document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1] || null
    );
  }
  return null;
}
```

---

## 🎨 Компоненты

### 1. Пропсы

```tsx
// ✅ Правильно: типизация пропсов
interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: number) => void;
  className?: string;
}

export function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  return <div className={className}>...</div>;
}

// ❌ Неправильно: any в пропсах
function ProductCard({ product }: { product: any }) {}
```

### 2. Декомпозиция

```tsx
// ✅ Правильно: маленькие компоненты
export function ProductCard({ product }: ProductCardProps) {
  return (
    <div>
      <ProductImage src={product.image} />
      <ProductInfo product={product} />
      <ProductActions onAddToCart={() => onAddToCart?.(product.id)} />
    </div>
  );
}

// ❌ Неправильно: огромный компонент
export function ProductCard({ product }: ProductCardProps) {
  // 200 строк кода...
}
```

---

## 📁 Файлы

### 1. Экспорты

```tsx
// ✅ Правильно: именованные экспорты
export function ProductCard() {}
export function ProductList() {}

// ✅ Для страниц: default export
export default function CatalogPage() {}
```

### 2. Импорты

```tsx
// ✅ Правильно: группировка импортов
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useProducts } from '@/hooks';
import { ProductCard } from '@/components';
import type { Product } from '@/types';
```

---

## 🐛 Обработка ошибок

### 1. Try-catch

```tsx
// ✅ Правильно: обработка ошибок
const handleAddToCart = async () => {
  try {
    await addToCart.mutateAsync(productId);
  } catch (err: any) {
    console.error('Failed to add to cart:', err.message);
    // Показать уведомление пользователю
  }
};
```

### 2. Error Boundaries

```tsx
// ✅ Правильно: error boundary для критических секций
<ErrorBoundary fallback={<ErrorFallback />}>
  <CriticalComponent />
</ErrorBoundary>
```

---

## 🚀 Производительность

### 1. Оптимизация рендеров

```tsx
// ✅ Правильно: мемоизация
const ProductCard = memo(({ product }: ProductCardProps) => {
  const handleClick = useCallback(() => {
    onAddToCart?.(product.id);
  }, [product.id, onAddToCart]);

  return <div onClick={handleClick}>...</div>;
});

// ✅ Правильно: useMemo для вычислений
const totalPrice = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}, [items]);
```

### 2. Lazy loading

```tsx
// ✅ Правильно: ленивая загрузка
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false,
});
```

---

## ♿ Доступность

### 1. ARIA атрибуты

```tsx
// ✅ Правильно: доступные кнопки
<button
  aria-label="Добавить в корзину"
  disabled={!available}
>
  В корзину
</button>

// ✅ Правильно: alt для изображений
<img src={product.image} alt={product.name} />
```

### 2. Клавиатурная навигация

```tsx
// ✅ Правильно: обработка Enter и Space
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Кнопка
</button>
```

---

## 📝 Checklist перед коммитом

- [ ] TypeScript типы для всех пропсов и данных
- [ ] Обработка ошибок в async функциях
- [ ] Cleanup в useEffect
- [ ] Зависимости в хуках
- [ ] Accessibility (aria, alt, labels)
- [ ] Нет console.log в production коде
- [ ] Код отформатирован (Prettier)
- [ ] Нет предупреждений ESLint

---

**Версия:** 1.0.0  
**Последнее обновление:** Март 2026
