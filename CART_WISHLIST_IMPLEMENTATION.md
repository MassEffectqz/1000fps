# Система корзины и вишлистов — документация

## Обзор

Полная система корзины и вишлистов для Next.js 15 e-commerce проекта с поддержкой:
- Авторизованных пользователей (хранение в БД)
- Guest users (хранение в localStorage)
- Учёт складов (warehouseId) для каждого товара
- Оптимистичные обновления UI
- Toast уведомления

## Структура файлов

### API Endpoints

#### Корзина (`/api/cart`)
- **GET `/api/cart`** — получить корзину текущего пользователя
- **POST `/api/cart/items`** — добавить товар в корзину (productId, quantity, warehouseId)
- **PUT `/api/cart/items/[id]`** — обновить количество или склад
- **DELETE `/api/cart/items/[id]`** — удалить товар из корзины
- **DELETE `/api/cart`** — очистить корзину

#### Вишлист (`/api/wishlist`)
- **GET `/api/wishlist`** — получить вишлист текущего пользователя
- **POST `/api/wishlist/items`** — добавить товар в вишлист (productId)
- **DELETE `/api/wishlist/items/[id]`** — удалить товар из вишлиста
- **POST `/api/wishlist/add-to-cart`** — перенести товары из вишлиста в корзину

### Server Actions

Файл: `src/lib/actions/cart.ts`
- `addToCart(productId, quantity, warehouseId)` — добавить в корзину
- `removeFromCart(itemId)` — удалить из корзины
- `updateCartItem(itemId, quantity, warehouseId)` — обновить элемент корзины
- `clearCart()` — очистить корзину

Файл: `src/lib/actions/wishlist.ts`
- `addToWishlist(productId)` — добавить в вишлист
- `removeFromWishlist(itemId)` — удалить из вишлиста
- `wishlistToCart(itemIds?)` — перенести всё из вишлиста в корзину
- `clearWishlist()` — очистить вишлист

### Валидация (Zod)

Файл: `src/lib/validations/cart.ts`
- `addToCartSchema` — валидация добавления в корзину
- `updateCartItemSchema` — валидация обновления корзины
- `removeFromCartSchema` — валидация удаления из корзины
- `addToWishlistSchema` — валидация добавления в вишлист
- `removeFromWishlistSchema` — валидация удаления из вишлиста
- `wishlistToCartSchema` — валидация переноса в корзину

### React Context

Файл: `src/lib/context/cart-context.tsx`

Предоставляет:
- `cart` — текущее состояние корзины
- `wishlist` — текущее состояние вишлиста
- `isLoading` — индикатор загрузки
- `isCartDrawerOpen` — состояние выезжающей панели
- `setIsCartDrawerOpen(open)` — управление панелью
- `refreshCart()` — обновить корзину
- `refreshWishlist()` — обновить вишлист
- `addToCart(productId, quantity?, warehouseId?)` — добавить в корзину
- `removeFromCart(itemId)` — удалить из корзины
- `updateCartItem(itemId, quantity?, warehouseId?)` — обновить элемент
- `clearCart()` — очистить корзину
- `addToWishlist(productId)` — добавить в вишлист
- `removeFromWishlist(itemId)` — удалить из вишлиста
- `wishlistToCart(itemIds?)` — перенести в корзину
- `isInCart(productId)` — проверка наличия в корзине
- `isInWishlist(productId)` — проверка наличия в вишлисте
- `getCartQuantity()` — общее количество товаров

### UI Компоненты

#### Layout компоненты
- `CartButton` — кнопка корзины в хедере с badge
- `WishlistButton` — кнопка вишлиста в хедере с badge
- `CartDrawer` — выезжающая панель корзины
- `AddToCartButton` — универсальная кнопка "В корзину"
- `AddToWishlistButton` — универсальная кнопка "В вишлист"

#### Обновлённые компоненты
- `ProductCard` — интегрированы кнопки корзины и вишлиста

### Страницы

- `/cart` — страница корзины с управлением количеством и складами
- `/wishlist` — страница вишлиста с кнопками "В корзину", "Удалить"

### Схема базы данных

Обновлена модель `CartItem` (prisma/schema.prisma):
```prisma
model CartItem {
  id          String   @id @default(cuid())
  cartId      String
  userId      String?
  productId   String
  quantity    Int      @default(1)
  warehouseId String?  // NEW: поле для склада
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  // ... relations
}
```

Миграция: `20260402150428_add_warehouse_to_cart`

## Особенности реализации

### 1. Гостевая корзина (localStorage)
- Для неавторизованных пользователей данные хранятся в localStorage
- Ключи: `guest_cart`, `guest_wishlist`
- При авторизации происходит синхронизация с сервером
- Гостевая корзина очищается после загрузки авторизованной корзины

### 2. Учёт складов
- Каждый элемент корзины может иметь `warehouseId`
- При добавлении проверяется наличие на складе
- При обновлении количества проверяется доступное количество
- На странице товара отображается наличие по складам

### 3. Оптимистичные обновления
- UI обновляется мгновенно до ответа сервера
- При ошибке происходит откат к предыдущему состоянию
- Toast уведомления об успехе/ошибке

### 4. Валидация
- Все входные данные валидируются через Zod
- Серверная валидация в API routes
- Валидация в Server Actions

### 5. Обработка ошибок
- Try/catch блоки во всех API endpoints
- Try/catch блоки во всех Server Actions
- Информативные сообщения об ошибках

## Интеграция

### В layout.tsx
```tsx
import { CartProvider } from '@/lib/context/cart-context';

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
        <Toaster />
      </body>
    </html>
  );
}
```

### В header.tsx
```tsx
import { CartButton, WishlistButton, CartDrawer } from '@/components/layout';

// В JSX:
<WishlistButton />
<CartButton />
<CartDrawer />
```

### В ProductCard
```tsx
import { AddToCartButton, AddToWishlistButton } from '@/components/layout';

// Автоматически интегрировано в компонент ProductCard
```

### На странице товара
```tsx
import { AddToCartButton, AddToWishlistButton } from '@/components/layout';

<AddToCartButton
  productId={product.id}
  variant="primary"
  size="md"
  fullWidth
  inStock={product.stock > 0}
>
  В корзину
</AddToCartButton>

<AddToWishlistButton
  productId={product.id}
  variant="button"
  size="md"
/>
```

## API примеры

### Добавить в корзину
```typescript
const response = await fetch('/api/cart/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'xxx',
    quantity: 2,
    warehouseId: 'yyy' // опционально
  })
});
```

### Обновить элемент корзины
```typescript
const response = await fetch(`/api/cart/items/${itemId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    quantity: 5,
    warehouseId: 'yyy' // опционально
  })
});
```

### Перенести из вишлиста в корзину
```typescript
const response = await fetch('/api/wishlist/add-to-cart', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    itemIds: ['id1', 'id2'] // опционально, если не указано — все товары
  })
});
```

## Тестирование

1. Запустите dev сервер: `npm run dev`
2. Проверьте добавление товаров в корзину из каталога
3. Проверьте добавление товаров в вишлист
4. Проверьте работу выезжающей панели корзины
5. Проверьте страницу `/cart` с изменением количества
6. Проверьте страницу `/wishlist` с переносом в корзину
7. Проверьте badge в хедере с количеством товаров
8. Проверьте работу для guest users (без авторизации)
9. Проверьте синхронизацию после авторизации

## Стек технологий

- **Next.js 15.5.14** — App Router, Server Actions
- **TypeScript** — strict mode
- **Prisma 6.19.2** — ORM для работы с БД
- **PostgreSQL** — база данных
- **Zod v4** — валидация данных
- **React Context** — управление состоянием
- **Sonner** — toast уведомления
- **localStorage** — гостевая корзина

## Миграции БД

После изменений выполните:
```bash
npx prisma generate
npx prisma migrate dev --name add_warehouse_to_cart
```

## Замечания

- Некоторые ESLint предупреждения существуют в проекте (не связаны с этой реализацией)
- Для production рекомендуется настроить синхронизацию гостевой корзины при логине
- Возможно расширение функционала: купоны, бонусные баллы, отложенные товары
