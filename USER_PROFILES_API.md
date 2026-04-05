# Профили пользователей — Документация API

Полная система профилей пользователя для Next.js 15 e-commerce проекта.

## 📋 Оглавление

- [Аутентификация](#аутентификация)
- [Профиль пользователя](#профиль-пользователя)
- [Заказы](#заказы)
- [Вишлист](#вишлист)
- [Адреса](#адреса)
- [Сборки](#сборки)
- [Тестовые данные](#тестовые-данные)

---

## 🔐 Аутентификация

### POST `/api/auth/register`
Регистрация нового пользователя.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Иван Иванов",
  "phone": "+7 (999) 000-00-00"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "Иван Иванов",
    "phone": "+7 (999) 000-00-00",
    "role": "CUSTOMER",
    "level": "BRONZE",
    "bonusPoints": 0
  },
  "token": "eyJhbGc..."
}
```

---

### POST `/api/auth/login`
Вход пользователя по email/password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "remember": false
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "Иван Иванов",
    "role": "CUSTOMER",
    "level": "GOLD",
    "bonusPoints": 6200
  },
  "token": "eyJhbGc..."
}
```

---

### POST `/api/auth/logout`
Выход пользователя (очистка сессии).

**Response (200):**
```json
{
  "success": true,
  "message": "Вы успешно вышли из системы"
}
```

---

### POST `/api/auth/forgot-password`
Запрос на сброс пароля.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Если пользователь с таким email существует, вы получите инструкцию по сбросу пароля"
}
```

> ⚠️ **Примечание:** Для полноценной работы требуется настройка email-сервиса и таблицы токенов.

---

### POST `/api/auth/reset-password`
Установка нового пароля с токеном.

**Request Body:**
```json
{
  "token": "abc123...",
  "password": "newpassword123"
}
```

> ⚠️ **Примечание:** Требует реализации таблицы `PasswordReset` и email-сервиса.

---

## 👤 Профиль пользователя

### GET `/api/profile`
Получить данные текущего пользователя.

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "Иван Иванов",
    "phone": "+7 (999) 000-00-00",
    "avatar": "https://...",
    "role": "CUSTOMER",
    "bonusPoints": 6200,
    "level": "GOLD",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### PUT `/api/profile`
Обновить профиль пользователя.

**Request Body:**
```json
{
  "name": "Новое Имя",
  "phone": "+7 (999) 111-22-33",
  "avatar": "https://..."
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "Новое Имя",
    "phone": "+7 (999) 111-22-33",
    "avatar": "https://...",
    "role": "CUSTOMER",
    "bonusPoints": 6200,
    "level": "GOLD"
  },
  "message": "Профиль успешно обновлен"
}
```

---

### DELETE `/api/profile`
Удалить аккаунт пользователя.

**Request Body:**
```json
{
  "confirm": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Аккаунт успешно удален"
}
```

---

### PUT `/api/profile/change-password`
Смена пароля.

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Пароль успешно изменен"
}
```

---

## 📦 Заказы

### GET `/api/profile/orders`
Получить список заказов пользователя.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `status` (optional: PENDING, CONFIRMED, PAID, SHIPPING, DELIVERED, CANCELLED, REFUNDED)

**Response (200):**
```json
{
  "success": true,
  "orders": [
    {
      "id": "clxxx...",
      "orderNumber": "001234",
      "userId": "clxxx...",
      "status": "DELIVERED",
      "paymentStatus": "PAID",
      "total": 114980,
      "createdAt": "2024-01-01T00:00:00Z",
      "items": [
        {
          "id": "clxxx...",
          "quantity": 1,
          "price": 79990,
          "product": {
            "id": "clxxx...",
            "name": "ASUS TUF Gaming GeForce RTX 4070 Ti Super",
            "slug": "asus-tuf-rtx-4070-ti-super-oc-16gb",
            "images": [{ "url": "/images/..." }]
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

---

### GET `/api/profile/orders/[id]`
Получить детали заказа по ID.

**Response (200):**
```json
{
  "success": true,
  "order": {
    "id": "clxxx...",
    "orderNumber": "001234",
    "status": "DELIVERED",
    "total": 114980,
    "items": [...]
  }
}
```

---

## ❤️ Вишлист

### GET `/api/profile/wishlist`
Получить список товаров в вишлисте.

**Response (200):**
```json
{
  "success": true,
  "items": [
    {
      "id": "clxxx...",
      "productId": "clxxx...",
      "createdAt": "2024-01-01T00:00:00Z",
      "product": {
        "id": "clxxx...",
        "name": "ASUS TUF Gaming GeForce RTX 4070 Ti Super",
        "slug": "asus-tuf-rtx-4070-ti-super-oc-16gb",
        "price": 79990,
        "oldPrice": 97500,
        "images": [{ "url": "/images/..." }]
      }
    }
  ]
}
```

---

### POST `/api/profile/wishlist`
Добавить товар в вишлист.

**Request Body:**
```json
{
  "productId": "clxxx..."
}
```

**Response (201):**
```json
{
  "success": true,
  "item": {
    "id": "clxxx...",
    "productId": "clxxx...",
    "product": { ... }
  },
  "message": "Товар добавлен в вишлист"
}
```

---

### DELETE `/api/profile/wishlist/[id]`
Удалить товар из вишлиста.

**Response (200):**
```json
{
  "success": true,
  "message": "Товар удален из вишлиста"
}
```

---

## 📍 Адреса

### GET `/api/profile/addresses`
Получить список адресов пользователя.

**Response (200):**
```json
{
  "success": true,
  "addresses": [
    {
      "id": "clxxx...",
      "userId": "clxxx...",
      "name": "Дом",
      "city": "Волгоград",
      "street": "ул. Ленина",
      "building": "10",
      "apartment": "100",
      "postalCode": "400000",
      "phone": "+7 (999) 000-00-02",
      "isDefault": true
    }
  ]
}
```

---

### POST `/api/profile/addresses`
Добавить новый адрес.

**Request Body:**
```json
{
  "name": "Дом",
  "city": "Волгоград",
  "street": "ул. Ленина",
  "building": "10",
  "apartment": "100",
  "postalCode": "400000",
  "phone": "+7 (999) 000-00-00",
  "isDefault": true
}
```

**Response (201):**
```json
{
  "success": true,
  "address": { ... },
  "message": "Адрес успешно добавлен"
}
```

---

### PUT `/api/profile/addresses/[id]`
Обновить адрес.

**Request Body:**
```json
{
  "city": "Новый город",
  "isDefault": true
}
```

**Response (200):**
```json
{
  "success": true,
  "address": { ... },
  "message": "Адрес успешно обновлен"
}
```

---

### DELETE `/api/profile/addresses/[id]`
Удалить адрес.

**Response (200):**
```json
{
  "success": true,
  "message": "Адрес успешно удален"
}
```

---

## 🖥️ Сборки

### GET `/api/profile/configs`
Получить список сборок пользователя.

**Response (200):**
```json
{
  "success": true,
  "configs": [
    {
      "id": "clxxx...",
      "userId": "clxxx...",
      "name": "Игровой ПК 2024",
      "isPreset": false,
      "total": 180000,
      "power": 750,
      "isPublic": false,
      "shareCode": null,
      "items": [
        {
          "id": "clxxx...",
          "categoryId": "clxxx...",
          "productId": "clxxx...",
          "quantity": 1,
          "price": 79990,
          "product": {
            "id": "clxxx...",
            "name": "ASUS TUF Gaming GeForce RTX 4070 Ti Super",
            "images": [{ "url": "/images/..." }]
          }
        }
      ]
    }
  ]
}
```

---

### POST `/api/profile/configs`
Сохранить новую сборку.

**Request Body:**
```json
{
  "name": "Игровой ПК 2024",
  "isPreset": false,
  "total": 180000,
  "power": 750,
  "isPublic": false,
  "items": [
    {
      "categoryId": "clxxx...",
      "productId": "clxxx...",
      "quantity": 1,
      "price": 79990
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "config": { ... },
  "message": "Сборка успешно сохранена"
}
```

---

### DELETE `/api/profile/configs/[id]`
Удалить сборку.

**Response (200):**
```json
{
  "success": true,
  "message": "Сборка успешно удалена"
}
```

---

## 🧪 Тестовые данные

После выполнения `npm run db:seed` создаются:

### Пользователи
| Роль | Email | Пароль |
|------|-------|--------|
| Admin | `admin@1000fps.ru` | `password123` |
| User | `user@1000fps.ru` | `password123` |

### Тестовые данные пользователя
- **3 заказа** (DELIVERED, SHIPPING, PENDING)
- **1 адрес** (Волгоград, ул. Ленина, 10-100)
- **2 товара в вишлисте** (RTX 4070 Ti, Ryzen 7 7800X3D)
- **1 сборка** (Игровой ПК 2024)

---

## 🔒 Безопасность

### JWT Сессии
- Токены хранятся в httpOnly cookies
- Время жизни: 24 часа
- Автоматическое продление при истечении < 2 часов
- Секретный ключ: `JWT_SECRET` (настраивается в `.env`)

### Хеширование паролей
- Алгоритм: bcryptjs (salt rounds: 10)
- Пароли никогда не возвращаются в API ответах

### Middleware защита
- `/profile/*` — только авторизованные
- `/api/profile/*` — только авторизованные (401 для неавторизованных)
- `/admin/*` — только ADMIN/MANAGER

---

## 📁 Структура файлов

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── forgot-password/route.ts
│   │   │   └── reset-password/route.ts
│   │   └── profile/
│   │       ├── route.ts
│   │       ├── change-password/route.ts
│   │       ├── orders/route.ts
│   │       ├── orders/[id]/route.ts
│   │       ├── wishlist/route.ts
│   │       ├── wishlist/[id]/route.ts
│   │       ├── addresses/route.ts
│   │       ├── addresses/[id]/route.ts
│   │       ├── configs/route.ts
│   │       └── configs/[id]/route.ts
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── profile/page.tsx
├── lib/
│   ├── auth-helpers.ts
│   ├── prisma.ts
│   ├── session.ts
│   └── validations/
│       ├── auth.ts
│       └── index.ts
middleware.ts
prisma/
└── seed.ts
```

---

## 🚀 Запуск

1. **Установка зависимостей:**
   ```bash
   npm install
   ```

2. **Настройка переменных окружения:**
   ```env
   DATABASE_URL="postgresql://..."
   JWT_SECRET="your-secret-key-change-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Миграция БД и seed:**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Запуск dev-сервера:**
   ```bash
   npm run dev
   ```

---

## 🛠️ Технологии

- **Next.js 15.5.14** (App Router)
- **Prisma 6.19.2** (PostgreSQL)
- **Zod** (валидация)
- **bcryptjs** (хеширование паролей)
- **jose** (JWT)
- **sonner** (toast-уведомления)
