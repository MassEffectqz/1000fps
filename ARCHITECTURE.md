# Архитектура проекта 1000fps

## Обзор

Проект построен на **Next.js 15** с использованием **App Router**, **TypeScript** (strict mode), **Tailwind CSS 4**, и **Prisma 7** для работы с базой данных.

## Стек технологий

| Технология | Версия | Назначение |
|------------|--------|------------|
| Next.js | 15.x | React фреймворк с App Router |
| TypeScript | 5.x | Типизация JavaScript |
| Tailwind CSS | 4.x | Утилитарные стили |
| Prisma | 7.x | ORM для базы данных |
| Zod | latest | Валидация схем |
| React | 19.x | UI библиотека |

## Структура проекта

```
1000fps-backup/
├── src/                          # Исходный код приложения
│   ├── app/                      # Страницы (App Router)
│   │   ├── layout.tsx            # Корневой layout
│   │   ├── page.tsx              # Главная страница
│   │   ├── catalog/              # Каталог товаров
│   │   ├── product/[slug]/       # Страница товара
│   │   ├── configurator/         # Конфигуратор ПК
│   │   ├── profile/              # Профиль пользователя
│   │   ├── admin/                # Админ-панель
│   │   ├── cart/                 # Корзина
│   │   ├── login/                # Вход
│   │   └── register/             # Регистрация
│   ├── components/               # React компоненты
│   │   ├── layout/               # Layout компоненты
│   │   │   ├── header.tsx
│   │   │   └── footer.tsx
│   │   ├── sections/             # Секции страниц
│   │   │   ├── hero.tsx
│   │   │   ├── category-strip.tsx
│   │   │   ├── promo-blocks.tsx
│   │   │   ├── hot-products.tsx
│   │   │   ├── brands.tsx
│   │   │   ├── features.tsx
│   │   │   └── articles.tsx
│   │   ├── catalog/              # Компоненты каталога
│   │   │   └── filters.tsx
│   │   └── ui/                   # Базовые UI компоненты
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── badge.tsx
│   │       ├── breadcrumbs.tsx
│   │       └── product-card.tsx
│   ├── lib/                      # Утилиты и хелперы
│   │   ├── prisma.ts             # Singleton Prisma клиент
│   │   ├── actions/              # Server Actions
│   │   └── validations/          # Zod схемы валидации
│   └── types/                    # TypeScript типы
├── maket/                        # HTML макеты (исходники)
│   ├── index.html
│   ├── catalog.html
│   ├── product.html
│   ├── configurator.html
│   ├── profile.html
│   ├── admin.html
│   ├── header.html
│   └── footer.html
├── prisma/                       # Prisma конфигурация
│   ├── schema.prisma             # Схема базы данных
│   └── migrations/               # Миграции БД
├── public/                       # Статические файлы
├── .env.local                    # Переменные окружения
├── next.config.ts                # Конфигурация Next.js
├── tailwind.config.ts            # Конфигурация Tailwind
├── tsconfig.json                 # Конфигурация TypeScript
└── package.json                  # Зависимости проекта
```

## Path Aliases

В `tsconfig.json` настроены алиасы для удобного импорта:

```typescript
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { User } from "@/types";
```

## Дизайн-токены

В `globals.css` определены CSS переменные для консистентного дизайна:

### Цвета
- `--background` / `--foreground` - основные цвета фона и текста
- `--primary` / `--primary-hover` - акцентный цвет (синий)
- `--secondary` - вторичный цвет
- `--success`, `--warning`, `--error`, `--info` - цвета состояний
- `--border` - цвет границ

### Шрифты
- `--font-sans` - системный шрифт
- `--font-mono` - моноширинный шрифт

### Размеры
- `--text-xs` ... `--text-4xl` - размеры шрифтов
- `--radius-sm` ... `--radius-full` - радиусы скругления
- `--shadow-sm` ... `--shadow-xl` - тени

## База данных

### Модели Prisma

- **User** — пользователи (email, password, name, phone, role, bonusPoints, level)
- **Product** — товары (name, slug, price, oldPrice, discount, stock, rating, categoryId, brandId)
- **Category** — категории (name, slug, parentId, order)
- **Brand** — бренды (name, slug, logo)
- **Order** — заказы (userId, status, paymentStatus, total, deliveryAddress)
- **OrderItem** — элементы заказа (orderId, productId, quantity, price)
- **Cart** / **CartItem** — корзина
- **Wishlist** / **WishlistItem** — вишлист
- **Review** — отзывы (productId, userId, rating, text)
- **Configuration** / **ConfigItem** — конфигуратор ПК

### Команды Prisma

```bash
# Применить миграции
npx prisma migrate dev

# Применить изменения без миграций
npx prisma db push

# Открыть Prisma Studio
npx prisma studio

# Перегенерировать клиент
npx prisma generate
```

## Server Actions

Server Actions размещаются в `lib/actions/` и используются для обработки форм:

```typescript
"use server";

import { revalidatePath } from "next/cache";

export async function createOrder(data: OrderInput) {
  // Валидация
  // Логика
  revalidatePath("/orders");
  return { success: true };
}
```

## Валидация

Zod схемы в `lib/validations/`:

```typescript
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});

export type ProductInput = z.infer<typeof productSchema>;
```

## Переменные окружения

Файл `.env.local`:

```env
DATABASE_URL="postgresql://danya:пароль@localhost:5432/fps1000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## Скрипты

```bash
npm run dev      # Запуск dev сервера
npm run build    # Продакшен сборка
npm run start    # Запуск продакшен сервера
npm run lint     # ESLint проверка
```

## Безопасность

В `next.config.ts` настроены заголовки безопасности:
- Strict-Transport-Security
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

## Расширение проекта

### Добавление новой страницы

1. Создайте файл в `app/` (например, `app/about/page.tsx`)
2. Экспортируйте React компонент

### Добавление нового компонента

1. Создайте файл в `components/ui/`
2. Используйте Tailwind классы для стилизации

### Добавление новой модели

1. Добавьте модель в `prisma/schema.prisma`
2. Выполните `npx prisma migrate dev`
3. Добавьте тип в `types/index.ts`

## Примечания

- Все компоненты должны быть типизированы с TypeScript
- Используйте Server Components по умолчанию
- Client Components помечайте `"use client"` директивой
- Следуйте принципам доступности (a11y)
