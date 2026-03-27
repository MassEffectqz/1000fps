# 📐 Code Style Guide

Руководство по стилю кода для проекта 1000FPS

---

## 📋 Оглавление

1. [TypeScript](#typescript)
2. [React](#react)
3. [CSS/Tailwind](#csstailwind)
4. [Именование](#именование)
5. [Комментарии](#комментарии)
6. [Организация файлов](#организация-файлов)
7. [Инструменты](#инструменты)

---

## TypeScript

### Базовые правила

```typescript
// ✅ Используйте интерфейсы для объектов
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

// ✅ Используйте type для объединений и кортежей
type Status = "pending" | "approved" | "rejected";
type Coordinates = [number, number];

// ✅ Избегайте any, используйте unknown
function parseJSON(str: string): unknown {
  return JSON.parse(str);
}

// ✅ Явно указывайте типы возвращений
function getUser(id: number): Promise<User> {
  return api.get(`/users/${id}`);
}
```

### Типы vs Интерфейсы

```typescript
// ✅ Используйте interface для объектов
interface Product {
  id: number;
  name: string;
  price: number;
}

// ✅ Используйте type для union types
type PaymentMethod = "card" | "sbp" | "cash";

// ✅ type для mapped types
type PartialProduct = Partial<Product>;
type ReadonlyProduct = Readonly<Product>;

// ❌ Избегайте смешивания
interface Product {
  id: number;
}

type Product = {
  // ❌ Переопределение
  name: string;
};
```

### Null и Undefined

```typescript
// ✅ Используйте optional chaining
const userName = user?.profile?.name;

// ✅ Используйте nullish coalescing
const count = items?.length ?? 0;

// ✅ Избегайте не-null assertions
const element = document.getElementById("my-id"); // ✅
const element = document.getElementById("my-id")!; // ❌ Только если уверены

// ✅ Используйте type guards
function isProduct(item: unknown): item is Product {
  return (
    typeof item === "object" && item !== null && "id" in item && "name" in item
  );
}
```

### Generics

```typescript
// ✅ Используйте дженерики для переиспользуемых функций
function filterById<T extends { id: number }>(items: T[], id: number): T[] {
  return items.filter((item) => item.id === id);
}

// ✅ Ограничивайте дженерики
function getFirst<T>(items: T[]): T | undefined {
  return items[0];
}

// ✅ Именуйте дженерики осмысленно
interface Repository<T extends Entity> {
  findById(id: number): Promise<T | null>;
  findAll(): Promise<T[]>;
}
```

---

## React

### Компоненты

```typescript
// ✅ Используйте функциональные компоненты с TypeScript
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart
}) => {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>{product.price} ₽</p>
      <button onClick={() => onAddToCart(product.id)}>
        В корзину
      </button>
    </div>
  );
};

// ✅ Или без FC (предпочтительно)
interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="product-card">
      {/* ... */}
    </div>
  );
}
```

### Props

```typescript
// ✅ Выносите типы props в отдельные интерфейсы
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

// ✅ Используйте деструктуризацию в параметрах
export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick
}: ButtonProps) {
  return (
    <button className={`btn btn-${variant} btn-${size}`} onClick={onClick}>
      {children}
    </button>
  );
}

// ✅ Для children используйте React.ReactNode
interface CardProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

### Hooks

```typescript
// ✅ Соблюдайте правила хуков
function UserProfile({ userId }: { userId: number }) {
  // ✅ Все хуки в начале
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Логика эффекта
  }, [userId]);

  // ❌ Не вызывайте хуки в условиях
  if (loading) {
    return null;
  }

  return <div>{user?.name}</div>;
}

// ✅ Создавайте кастомные хуки для переиспользуемой логики
function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product) => {
    setItems(prev => [...prev, { product, quantity: 1 }]);
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [items]);

  return { items, addItem, removeItem, total };
}
```

### Обработка событий

```typescript
// ✅ Типизируйте обработчики событий
interface ButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}

// ✅ Используйте меморизацию для функций
const ProductList: React.FC = () => {
  const handleAddToCart = useCallback((productId: number) => {
    // Логика
  }, []);

  return (
    <div>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  );
};
```

---

## CSS/Tailwind

### Классы

```typescript
// ✅ Используйте шаблонные строки для динамических классов
function Button({ variant = 'primary' }: ButtonProps) {
  return (
    <button className={`
      px-4 py-2 rounded font-medium
      transition-colors duration-200
      ${variant === 'primary'
        ? 'bg-orange-500 text-white hover:bg-orange-600'
        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
    `}>
      Click me
    </button>
  );
}

// ✅ Используйте clsx или classnames для сложных условий
import clsx from 'clsx';

function Card({ isActive, hasError }: CardProps) {
  return (
    <div className={clsx(
      'p-4 rounded border',
      isActive && 'border-orange-500 bg-orange-50',
      hasError && 'border-red-500 bg-red-50'
    )}>
      {/* ... */}
    </div>
  );
}
```

### Организация классов

```typescript
// ✅ Группируйте классы по назначению
<button className={`
  // Layout
  flex items-center justify-center

  // Sizing
  h-10 px-4

  // Visual
  bg-orange-500 text-white
  rounded-md

  // Interactive
  hover:bg-orange-600
  focus:outline-none focus:ring-2 focus:ring-orange-500

  // Animation
  transition-colors duration-200
`}>
  Button
</button>
```

### Адаптивность

```typescript
// ✅ Mobile-first подход
<div className={`
  // Mobile (default)
  w-full px-4

  // Tablet
  md:w-1/2 md:px-6

  // Desktop
  lg:w-1/3 lg:px-8

  // Large desktop
  xl:w-1/4
`}>
  {/* ... */}
</div>
```

---

## Именование

### Переменные и функции

```typescript
// ✅ Используйте camelCase для переменных и функций
const userName = "John";
function getUserById(id: number) {
  /* ... */
}

// ✅ Используйте PascalCase для компонентов и типов
interface UserProfile {
  /* ... */
}
const UserProfile: React.FC = () => {
  /* ... */
};

// ✅ Используйте UPPER_CASE для констант
const MAX_CART_ITEMS = 100;
const API_BASE_URL = "https://api.1000fps.ru";

// ✅ Булевы переменные начинайте с is/has/can/should
const isActive = true;
const hasPermission = false;
const canSubmit = true;
const shouldUpdate = false;
```

### Файлы

```typescript
// ✅ Компоненты: PascalCase.tsx
ProductCard.tsx;
UserProfile.tsx;

// ✅ Хуки: useSomething.ts
useCart.ts;
useAuth.ts;

// ✅ Утилиты: camelCase.ts
formatPrice.ts;
validateEmail.ts;

// ✅ Типы: types.ts или *.types.ts
types / product.ts;
user.types.ts;

// ✅ Тесты: *.test.ts или *.spec.ts
ProductCard.test.tsx;
auth.spec.ts;
```

### Папки

```
components/           # Переиспользуемые компоненты
features/             # Фичи (feature-sliced)
hooks/                # Кастомные хуки
lib/                  # Библиотеки и утилиты
store/                # State management
types/                # Типы
styles/               # Стили
utils/                # Утилиты
```

---

## Комментарии

### Когда использовать

```typescript
// ✅ Объясняйте "почему", а не "что"
// ❌ Плохо
// Увеличиваем счетчик на 1
count++;

// ✅ Хорошо
// Компенсируем оффбай-ошибку в API (возвращает на 1 меньше)
count++;

// ✅ Используйте JSDoc для публичных API
/**
 * Вычисляет итоговую стоимость корзины
 * @param items - Элементы корзины
 * @param discount - Скидка в процентах (0-100)
 * @returns Итоговая сумма с учётом скидки
 */
function calculateTotal(items: CartItem[], discount: number): number {
  // ...
}

// ✅ Используйте TODO для будущих улучшений
// TODO: Добавить кэширование для этого запроса
// TODO(issue-123): Исправить после обновления API
```

### Формат комментариев

```typescript
// ✅ Однострочные комментарии
const price = product.price; // Цена в рублях

// ✅ Многострочные комментарии
/**
 * Конфигурация для инициализации платежного шлюза
 *
 * @example
 * const config = {
 *   apiKey: '...',
 *   environment: 'production'
 * };
 */
interface PaymentConfig {
  apiKey: string;
  environment: "test" | "production";
}
```

---

## Организация файлов

### Структура компонента

```typescript
// ✅ Рекомендуемый порядок
import React, { useState, useEffect } from 'react';  // 1. React
import { useRouter } from 'next/router';              // 2. Next.js
import { useCart } from '@/hooks/useCart';            // 3. Хуки
import { Product } from '@/types';                    // 4. Типы
import { formatPrice } from '@/utils';                // 5. Утилиты
import { Button } from '@/components/ui';             // 6. Компоненты

interface ProductCardProps {                          // 7. Типы props
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // 8. Хуки
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCart();

  // 9. Обработчики
  const handleAddToCart = () => {
    addItem(product);
  };

  // 10. Рендер
  return (
    <div>
      {/* ... */}
    </div>
  );
};
```

### Экспорты

```typescript
// ✅ Именованные экспорты (предпочтительно)
export const ProductCard = () => {
  /* ... */
};
export const ProductList = () => {
  /* ... */
};

// ✅ Дефолтный экспорт для основных компонентов
export default ProductCard;

// ✅ Группировка экспортов в index.ts
export { ProductCard } from "./ProductCard";
export { ProductList } from "./ProductList";
export type { ProductCardProps } from "./types";
```

---

## Инструменты

### ESLint конфигурация

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
};
```

### Prettier конфигурация

```javascript
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

### Команды

```bash
# Проверка линтером
pnpm lint

# Автофикс
pnpm lint:fix

# Форматирование
pnpm format

# Проверка типов
pnpm type-check
```

---

## Примеры

### Хороший код

```typescript
// features/cart/components/CartItem.tsx
import React, { memo, useCallback } from 'react';
import { CartItem as CartItemType } from '../types';
import { formatPrice } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { useCart } from '../hooks/useCart';

interface CartItemProps {
  item: CartItemType;
}

/**
 * Компонент элемента корзины
 *
 * @param item - Элемент корзины
 */
export const CartItem: React.FC<CartItemProps> = memo(({ item }) => {
  const { updateQuantity, removeItem } = useCart();

  const handleIncrement = useCallback(() => {
    updateQuantity(item.product.id, item.quantity + 1);
  }, [item.product.id, item.quantity, updateQuantity]);

  const handleDecrement = useCallback(() => {
    if (item.quantity > 1) {
      updateQuantity(item.product.id, item.quantity - 1);
    }
  }, [item.product.id, item.quantity, updateQuantity]);

  const handleRemove = useCallback(() => {
    removeItem(item.product.id);
  }, [item.product.id, removeItem]);

  return (
    <div className="flex items-center gap-4 py-4 border-b">
      <img
        src={item.product.imageUrl}
        alt={item.product.name}
        className="w-20 h-20 object-cover rounded"
      />

      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
        <p className="text-sm text-gray-500">{item.product.sku}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrement}
          disabled={item.quantity === 1}
        >
          −
        </Button>
        <span className="w-8 text-center">{item.quantity}</span>
        <Button variant="outline" size="sm" onClick={handleIncrement}>
          +
        </Button>
      </div>

      <div className="w-24 text-right font-medium">
        {formatPrice(item.product.price * item.quantity)}
      </div>

      <button
        onClick={handleRemove}
        className="text-gray-400 hover:text-red-500 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
});

CartItem.displayName = 'CartItem';
```

---

_Версия: 1.0.0 | Последнее обновление: Март 2026_
