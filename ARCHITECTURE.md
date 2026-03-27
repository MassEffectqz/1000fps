# 🏗️ Архитектура проекта 1000FPS

Интернет-магазин компьютерной техники с конфигуратором ПК

---

## 📁 Структура проекта

```
1000fps/
├── apps/
│   ├── storefront/          # Next.js — витрина магазина
│   │   ├── app/
│   │   │   ├── (shop)/      # Группа роутов: каталог, товар, корзина
│   │   │   │   ├── catalog/
│   │   │   │   │   ├── [category]/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── product/
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── cart/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── checkout/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── (account)/   # Группа роутов: личный кабинет
│   │   │   │   ├── profile/
│   │   │   │   │   ├── orders/
│   │   │   │   │   ├── wishlist/
│   │   │   │   │   ├── configs/
│   │   │   │   │   ├── bonuses/
│   │   │   │   │   ├── addresses/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── auth/
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── register/
│   │   │   │   │   └── forgot-password/
│   │   │   │   └── layout.tsx
│   │   │   ├── (configurator)/ # Конфигуратор ПК
│   │   │   │   ├── configurator/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── api/         # API routes (BFF)
│   │   │   │   ├── cart/
│   │   │   │   ├── wishlist/
│   │   │   │   ├── compare/
│   │   │   │   └── search/
│   │   │   ├── components/  # Shared UI компоненты
│   │   │   │   ├── ui/      # Базовые компоненты (Button, Input...)
│   │   │   │   ├── layout/  # Header, Footer, Nav
│   │   │   │   ├── product/ # ProductCard, ProductGallery...
│   │   │   │   ├── catalog/ # Filters, Sort, Pagination
│   │   │   │   ├── cart/    # CartDrawer, CartItem...
│   │   │   │   └── configurator/ # PartSelector, CompatChecker...
│   │   │   ├── lib/
│   │   │   │   ├── api.ts   # API client
│   │   │   │   ├── utils.ts
│   │   │   │   └── constants.ts
│   │   │   ├── store/       # Zustand stores
│   │   │   │   ├── cart.ts
│   │   │   │   ├── wishlist.ts
│   │   │   │   ├── compare.ts
│   │   │   │   └── configurator.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useCart.ts
│   │   │   │   ├── useProduct.ts
│   │   │   │   └── useCompatibility.ts
│   │   │   ├── types/
│   │   │   │   ├── product.ts
│   │   │   │   ├── order.ts
│   │   │   │   └── user.ts
│   │   │   ├── styles/
│   │   │   │   └── globals.css
│   │   │   ├── middleware.ts
│   │   │   └── page.tsx     # Главная страница
│   │   ├── public/
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── admin/               # Next.js — админ-панель
│       ├── app/
│       │   ├── (dashboard)/
│       │   │   ├── products/
│       │   │   ├── orders/
│       │   │   ├── categories/
│       │   │   ├── warehouses/
│       │   │   ├── analytics/
│       │   │   └── page.tsx   # Дашборд
│       │   ├── auth/
│       │   └── layout.tsx
│       ├── components/
│       │   ├── ui/
│       │   ├── products/
│       │   ├── orders/
│       │   └── charts/
│       ├── lib/
│       ├── store/
│       └── package.json
│
├── packages/
│   ├── api/                 # NestJS — backend API
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── modules/
│   │   │   │   ├── products/
│   │   │   │   │   ├── products.controller.ts
│   │   │   │   │   ├── products.service.ts
│   │   │   │   │   ├── products.module.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   ├── product.entity.ts
│   │   │   │   │   │   ├── category.entity.ts
│   │   │   │   │   │   └── brand.entity.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── products.filter.ts
│   │   │   │   ├── orders/
│   │   │   │   │   ├── orders.controller.ts
│   │   │   │   │   ├── orders.service.ts
│   │   │   │   │   ├── orders.module.ts
│   │   │   │   │   └── entities/
│   │   │   │   │       ├── order.entity.ts
│   │   │   │   │       └── order-item.entity.ts
│   │   │   │   ├── users/
│   │   │   │   │   ├── users.controller.ts
│   │   │   │   │   ├── users.service.ts
│   │   │   │   │   ├── users.module.ts
│   │   │   │   │   └── entities/
│   │   │   │   │       ├── user.entity.ts
│   │   │   │   │       └── address.entity.ts
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── strategies/
│   │   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   │   └── local.strategy.ts
│   │   │   │   │   └── guards/
│   │   │   │   │       └── jwt-auth.guard.ts
│   │   │   │   ├── cart/
│   │   │   │   ├── wishlist/
│   │   │   │   ├── configurator/
│   │   │   │   │   ├── configurator.controller.ts
│   │   │   │   │   ├── configurator.service.ts
│   │   │   │   │   ├── compatibility.service.ts
│   │   │   │   │   └── entities/
│   │   │   │   │       ├── config.entity.ts
│   │   │   │   │       └── compatibility-rules.entity.ts
│   │   │   │   ├── warehouses/
│   │   │   │   ├── analytics/
│   │   │   │   ├── search/
│   │   │   │   │   ├── search.controller.ts
│   │   │   │   │   ├── search.service.ts
│   │   │   │   │   └── search.module.ts
│   │   │   │   └── uploads/
│   │   │   ├── common/
│   │   │   │   ├── decorators/
│   │   │   │   ├── filters/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   └── pipes/
│   │   │   ├── config/
│   │   │   └── database/
│   │   │       └── migrations/
│   │   ├── test/
│   │   ├── nest-cli.json
│   │   └── package.json
│   │
│   ├── shared-types/        # Общие TypeScript типы
│   │   ├── src/
│   │   │   ├── product.ts
│   │   │   ├── order.ts
│   │   │   ├── user.ts
│   │   │   ├── configurator.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── ui-kit/              # Shared UI компоненты (опционально)
│       ├── src/
│       │   ├── Button/
│       │   ├── Input/
│       │   ├── Modal/
│       │   └── index.ts
│       └── package.json
│
├── infra/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.prod.yml
│   │   ├── postgres/
│   │   ├── redis/
│   │   └── nginx/
│   ├── k8s/                 # Kubernetes манифесты (опционально)
│   └── scripts/
│       ├── seed.ts          # Seed данные
│       └── migrate.ts
│
├── docs/
│   ├── api/                 # API документация
│   ├── architecture/
│   └── decisions/           # ADR
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── .env.example
├── .gitignore
├── package.json             # Root package.json (Turbo Repo)
├── turbo.json
└── README.md
```

---

## 🗄️ Схема базы данных

```prisma
// packages/api/src/database/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── КАТАЛОГ ────────────────────────────────────────

model Category {
  id          Int       @id @default(autoincrement())
  slug        String    @unique
  name        String
  description String?
  parentId    Int?
  parent      Category? @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  products    Product[]
  imageUrl    String?
  position    Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([slug])
  @@index([parentId])
}

model Brand {
  id          Int       @id @default(autoincrement())
  slug        String    @unique
  name        String
  description String?
  logoUrl     String?
  website     String?
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([slug])
}

model Product {
  id              Int             @id @default(autoincrement())
  slug            String          @unique
  sku             String          @unique
  name            String
  description     String?
  fullDescription String?         @db.Text
  categoryId      Int
  category        Category        @relation(fields: [categoryId], references: [id])
  brandId         Int?
  brand           Brand?          @relation(fields: [brandId], references: [id])

  // Цена
  price           Decimal         @db.Decimal(10, 2)
  oldPrice        Decimal?        @db.Decimal(10, 2)
  discountPercent Int?

  // Наличие
  stock           Int             @default(0)
  reserved        Int             @default(0)
  available       Bool            @default(true)

  // Изображения
  images          ProductImage[]
  mainImageUrl    String?

  // Характеристики (JSON для гибкости)
  specifications  Json?           // { "socket": "AM5", "cores": 8, ... }

  // SEO
  metaTitle       String?
  metaDescription String?

  // Рейтинги
  rating          Float           @default(0)
  reviewsCount    Int             @default(0)

  // Связи
  orderItems      OrderItem[]
  wishlistItems   WishlistItem[]
  cartItems       CartItem[]
  configItems     ConfigItem[]
  reviews         Review[]

  // Совместимость (для конфигуратора)
  compatRules     CompatibilityRule[]

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([slug])
  @@index([sku])
  @@index([categoryId])
  @@index([brandId])
  @@index([price])
  @@index([available])
}

model ProductImage {
  id        Int      @id @default(autoincrement())
  productId Int
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  alt       String?
  position  Int      @default(0)
  createdAt DateTime @default(now())

  @@index([productId])
}

model Review {
  id        Int      @id @default(autoincrement())
  productId Int
  product   Product  @relation(fields: [productId], references: [id])
  userId    Int?
  user      User?    @relation(fields: [userId], references: [id])
  rating    Int
  title     String?
  text      String?  @db.Text
  pros      String?  @db.Text
  cons      String?  @db.Text
  isVerified Bool    @default(false)
  isApproved Bool    @default(false)
  helpful   Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([productId])
  @@index([userId])
}

// ─── КОНФИГУРАТОР ───────────────────────────────────

model PartType {
  id          String   @id // cpu, gpu, motherboard, ram, storage, psu, case, cooling
  name        String
  icon        String?
  isRequired  Bool     @default(false)
  position    Int      @default(0)
  configs     Config[]
  compatRules CompatibilityRule[]

  @@unique([name])
}

model CompatibilityRule {
  id              Int      @id @default(autoincrement())
  partTypeId      String
  partType        PartType @relation(fields: [partTypeId], references: [id])
  productId       Int?
  product         Product? @relation(fields: [productId], references: [id])

  // Правила совместимости (JSON)
  // Пример: { "socket": ["AM5", "LGA1700"], "maxTdp": 125, "minWattage": 650 }
  compatibleWith  Json
  incompatibleWith Json?

  createdAt       DateTime @default(now())

  @@index([partTypeId])
  @@index([productId])
}

model Config {
  id          Int      @id @default(autoincrement())
  userId      Int?
  user        User?    @relation(fields: [userId], references: [id])
  name        String   @default("Моя сборка")
  isPublic    Bool     @default(false)

  // Выбранные компоненты
  items       ConfigItem[]

  // Итоговая стоимость
  totalPrice  Decimal  @db.Decimal(10, 2)

  // Проверка совместимости
  isCompatible Bool    @default(true)
  compatIssues Json?    // [{ partType: "psu", issue: "Недостаточная мощность" }]

  // Потребляемая мощность (Вт)
  powerConsumption Int?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

model ConfigItem {
  id        Int      @id @default(autoincrement())
  configId  Int
  config    Config   @relation(fields: [configId], references: [id], onDelete: Cascade)
  partType  String   // cpu, gpu, motherboard...
  productId Int
  product   Product  @relation(fields: [productId], references: [id])
  price     Decimal  @db.Decimal(10, 2) // Цена на момент добавления

  @@unique([configId, partType])
  @@index([configId])
  @@index([productId])
}

// ─── ПОЛЬЗОВАТЕЛИ ───────────────────────────────────

model User {
  id            Int      @id @default(autoincrement())
  email         String   @unique
  password      String   // Hash
  firstName     String?
  lastName      String?
  phone         String?
  avatarUrl     String?

  // Роль
  role          Role     @default(CUSTOMER)

  // Бонусы
  bonusPoints   Int      @default(0)
  loyaltyLevel  LoyaltyLevel @default(BRONZE)

  // Контакты
  addresses     Address[]
  orders        Order[]
  configs       Config[]
  wishlist      WishlistItem[]
  cart          Cart?
  reviews       Review[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([email])
}

enum Role {
  CUSTOMER
  ADMIN
  MANAGER
  WAREHOUSE
}

enum LoyaltyLevel {
  BRONZE
  SILVER
  GOLD
  PLATINUM
}

model Address {
  id         Int     @id @default(autoincrement())
  userId     Int
  user       User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  isDefault  Bool    @default(false)
  name       String? // "Дом", "Работа"
  city       String
  street     String
  building   String
  apartment  String?
  zipCode    String?
  phone      String?
  comment    String?

  // Координаты для доставки
  latitude   Float?
  longitude  Float?

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([userId])
}

// ─── КОРЗИНА ────────────────────────────────────────

model Cart {
  id        Int      @id @default(autoincrement())
  userId    Int?     @unique // NULL для гостевой корзины
  user      User?    @relation(fields: [userId], references: [id])
  sessionId String?  @unique // Для гостей
  items     CartItem[]

  // Промокод
  promoCode String?
  discount  Decimal  @default(0) @db.Decimal(10, 2)

  totalPrice Decimal @db.Decimal(10, 2)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([sessionId])
}

model CartItem {
  id        Int      @id @default(autoincrement())
  cartId    Int
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId Int
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int      @default(1)
  price     Decimal  @db.Decimal(10, 2)

  @@unique([cartId, productId])
  @@index([cartId])
}

// ─── ВИШЛИСТ ────────────────────────────────────────

model Wishlist {
  id        Int      @id @default(autoincrement())
  userId    Int      @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     WishlistItem[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model WishlistItem {
  id        Int      @id @default(autoincrement())
  wishlistId Int
  wishlist  Wishlist @relation(fields: [wishlistId], references: [id], onDelete: Cascade)
  productId Int
  product   Product  @relation(fields: [productId], references: [id])
  createdAt DateTime @default(now())

  @@unique([wishlistId, productId])
  @@index([wishlistId])
}

// ─── ЗАКАЗЫ ─────────────────────────────────────────

model Order {
  id              Int      @id @default(autoincrement())
  orderNumber     String   @unique // ORD-2024-001234

  userId          Int
  user            User     @relation(fields: [userId], references: [id])

  items           OrderItem[]

  // Статус
  status          OrderStatus @default(PENDING)
  paymentStatus   PaymentStatus @default(UNPAID)

  // Адрес доставки
  shippingAddress Json

  // Доставка
  shippingMethod  String
  shippingCost    Decimal  @default(0) @db.Decimal(10, 2)
  estimatedDelivery DateTime?
  trackingNumber  String?

  // Оплата
  paymentMethod   String?
  paidAt          DateTime?

  // Итоговая сумма
  subtotal        Decimal  @db.Decimal(10, 2)
  discount        Decimal  @default(0) @db.Decimal(10, 2)
  total           Decimal  @db.Decimal(10, 2)

  // Бонусы
  bonusPointsEarned Int  @default(0)
  bonusPointsSpent  Int  @default(0)

  // Комментарий
  comment         String?  @db.Text

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([orderNumber])
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model OrderItem {
  id        Int      @id @default(autoincrement())
  orderId   Int
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId Int
  product   Product  @relation(fields: [productId], references: [id])

  name      String   // snapshot названия на момент заказа
  sku       String   // snapshot артикула
  price     Decimal  @db.Decimal(10, 2)
  quantity  Int
  total     Decimal  @db.Decimal(10, 2)

  @@index([orderId])
  @@index([productId])
}

enum OrderStatus {
  PENDING      // Ожидает подтверждения
  CONFIRMED    // Подтвержден
  PAYING       // Оплачивается
  PAID         // Оплачен
  ASSEMBLING   // Комплектуется
  SHIPPED      // Отправлен
  DELIVERING   // В доставке
  DELIVERED    // Доставлен
  CANCELLED    // Отменен
  REFUNDED     // Возврат
}

enum PaymentStatus {
  UNPAID
  PAID
  PARTIALLY_PAID
  REFUNDED
  FAILED
}

// ─── СКЛАДЫ ─────────────────────────────────────────

model Warehouse {
  id        Int      @id @default(autoincrement())
  name      String
  code      String   @unique
  address   String
  city      String
  phone     String?
  isActive  Bool     @default(true)

  stock     WarehouseStock[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model WarehouseStock {
  id          Int      @id @default(autoincrement())
  warehouseId Int
  warehouse   Warehouse @relation(fields: [warehouseId], references: [id])
  productId   Int
  product     Product  @relation(fields: [productId], references: [id])
  quantity    Int      @default(0)
  reserved    Int      @default(0)

  @@unique([warehouseId, productId])
  @@index([warehouseId])
  @@index([productId])
}

// ─── АНАЛИТИКА ──────────────────────────────────────

model ViewEvent {
  id        Int      @id @default(autoincrement())
  productId Int
  sessionId String
  userId    Int?
  viewedAt  DateTime @default(now())

  @@index([productId])
  @@index([sessionId])
  @@index([viewedAt])
}

model SearchQuery {
  id       Int      @id @default(autoincrement())
  query    String
  resultsCount Int  @default(0)
  sessionId String?
  userId   Int?
  searchedAt DateTime @default(now())

  @@index([query])
  @@index([searchedAt])
}
```

---

## 🔌 API Endpoints

### **Auth**

```
POST   /api/v1/auth/register          # Регистрация
POST   /api/v1/auth/login             # Вход (JWT)
POST   /api/v1/auth/refresh           # Обновление токена
POST   /api/v1/auth/logout            # Выход
POST   /api/v1/auth/forgot-password   # Сброс пароля
POST   /api/v1/auth/reset-password    # Установка нового пароля
GET    /api/v1/auth/me                # Текущий пользователь
```

### **Products**

```
GET    /api/v1/products               # Список товаров (с фильтрами)
GET    /api/v1/products/:slug         # Детальная информация
GET    /api/v1/products/:slug/related # Похожие товары
GET    /api/v1/products/:slug/reviews # Отзывы
POST   /api/v1/products/:slug/reviews # Добавить отзыв

GET    /api/v1/categories             # Дерево категорий
GET    /api/v1/brands                 # Список брендов
```

### **Configurator**

```
GET    /api/v1/configurator/parts/:type  # Список компонентов типа
POST   /api/v1/configurator/compatibility # Проверка совместимости

GET    /api/v1/configs                # Мои сборки
POST   /api/v1/configs                # Создать сборку
GET    /api/v1/configs/:id            # Получить сборку
PUT    /api/v1/configs/:id            # Обновить сборку
DELETE /api/v1/configs/:id            # Удалить сборку
POST   /api/v1/configs/:id/add-to-cart # Добавить в корзину
```

### **Cart**

```
GET    /api/v1/cart                   # Получить корзину
POST   /api/v1/cart/items             # Добавить товар
PATCH  /api/v1/cart/items/:id         # Обновить количество
DELETE /api/v1/cart/items/:id         # Удалить товар
DELETE /api/v1/cart                   # Очистить корзину
POST   /api/v1/cart/promo             # Применить промокод
```

### **Wishlist**

```
GET    /api/v1/wishlist               # Получить вишлист
POST   /api/v1/wishlist/items         # Добавить товар
DELETE /api/v1/wishlist/items/:id     # Удалить товар
```

### **Orders**

```
GET    /api/v1/orders                 # Мои заказы
POST   /api/v1/orders                 # Создать заказ
GET    /api/v1/orders/:id             # Детали заказа
POST   /api/v1/orders/:id/cancel      # Отменить заказ
GET    /api/v1/orders/:id/invoice     # Счёт (PDF)
```

### **User**

```
GET    /api/v1/user/profile           # Профиль
PUT    /api/v1/user/profile           # Обновить профиль
GET    /api/v1/user/addresses         # Адреса
POST   /api/v1/user/addresses         # Добавить адрес
PUT    /api/v1/user/addresses/:id     # Обновить адрес
DELETE /api/v1/user/addresses/:id     # Удалить адрес
GET    /api/v1/user/bonuses           # Бонусный счёт
```

### **Search**

```
GET    /api/v1/search?q=...           # Поиск товаров
GET    /api/v1/search/suggestions     # Подсказки
```

### **Admin**

```
# Products
CRUD   /api/v1/admin/products
CRUD   /api/v1/admin/categories
CRUD   /api/v1/admin/brands

# Orders
GET    /api/v1/admin/orders           # Все заказы
PATCH  /api/v1/admin/orders/:id/status # Обновить статус

# Analytics
GET    /api/v1/admin/analytics/sales
GET    /api/v1/admin/analytics/products
GET    /api/v1/admin/analytics/users

# Warehouses
CRUD   /api/v1/admin/warehouses
```

---

## 🔄 Flow диаграммы

### **1. Покупка товара**

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  User       │────▶│  Product     │────▶│  Cart       │
│  (Browser)  │     │  Page        │     │  (Zustand)  │
└─────────────┘     └──────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  API:        │     │  API:       │
                    │  /products   │     │  /cart/items│
                    │  /:slug      │     │  POST       │
                    └──────────────┘     └─────────────┘
                                                │
                           ┌────────────────────┘
                           ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  Checkout    │────▶│  Order      │
                    │  Page        │     │  API: POST  │
                    └──────────────┘     └─────────────┘
                                                │
                           ┌────────────────────┼────────────────────┐
                           ▼                    ▼                    ▼
                    ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
                    │  Payment     │     │  Warehouse  │     │  User       │
                    │  Gateway     │     │  (Reserve)  │     │  (Bonus)    │
                    └──────────────┘     └─────────────┘     └─────────────┘
```

### **2. Конфигуратор ПК**

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  User       │────▶│  Select Part │────▶│  Compatibility│
│  (Browser)  │     │  (UI)        │     │  Check      │
└─────────────┘     └──────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  API:        │     │  Service:   │
                    │  /configurator│    │  validate   │
                    │  /parts/:type│     │  (CPU↔MB,   │
                    └──────────────┘     │   PSU→Watt) │
                                         └─────────────┘
                                                │
                           ┌────────────────────┘
                           ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  Config      │────▶│  Save to    │
                    │  (Zustand)   │     │  DB / Share │
                    └──────────────┘     └─────────────┘
```

### **3. Аутентификация**

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Login      │────▶│  API:        │────▶│  JWT        │
│  Form       │     │  /auth/login │     │  Token      │
└─────────────┘     └──────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  Validate    │     │  HttpOnly   │
                    │  Password    │     │  Cookie     │
                    │  (bcrypt)    │     │  (refresh)  │
                    └──────────────┘     └─────────────┘
```

---

## 🛠️ Технологический стек

### **Frontend (Storefront & Admin)**

| Компонент   | Технология             | Версия            |
| ----------- | ---------------------- | ----------------- |
| Framework   | Next.js                | 14.x (App Router) |
| Language    | TypeScript             | 5.x               |
| Styling     | Tailwind CSS           | 3.x               |
| State       | Zustand                | 4.x               |
| Forms       | React Hook Form + Zod  | 7.x / 3.x         |
| Charts      | Recharts               | 2.x               |
| Icons       | Lucide React           | 0.x               |
| HTTP Client | Axios / TanStack Query | 1.x / 5.x         |

### **Backend (API)**

| Компонент   | Технология               | Версия |
| ----------- | ------------------------ | ------ |
| Framework   | NestJS                   | 10.x   |
| Language    | TypeScript               | 5.x    |
| ORM         | Prisma                   | 5.x    |
| Database    | PostgreSQL               | 15+    |
| Cache       | Redis                    | 7.x    |
| Search      | Meilisearch              | 1.x    |
| Validation  | class-validator          | 0.x    |
| Auth        | @nestjs/jwt, Passport    | 10.x   |
| File Upload | @nestjs/platform-express | 10.x   |

### **Infrastructure**

| Компонент  | Технология                            |
| ---------- | ------------------------------------- |
| Container  | Docker, Docker Compose                |
| CI/CD      | GitHub Actions                        |
| Hosting    | Vercel (FE), Railway/Render (BE)      |
| Storage    | Cloudflare R2 / Yandex Object Storage |
| CDN        | Cloudflare                            |
| Monitoring | Sentry, Prometheus + Grafana          |

---

## 📦 Развёртывание

### **Development**

```bash
# Установка зависимостей
pnpm install

# Запуск всех сервисов (Docker)
docker-compose up -d

# Запуск разработки
pnpm dev

# Миграции БД
pnpm db:migrate

# Seed данные
pnpm db:seed
```

### **Production**

```bash
# Build
pnpm build

# Миграции
pnpm db:migrate:prod

# Запуск
pnpm start
```

---

## 🔐 Безопасность

- **JWT** токены (access + refresh)
- **HttpOnly** cookies для refresh токена
- **Rate limiting** (100 req/min)
- **CORS** whitelist
- **Helmet** middleware
- **Input validation** (Zod/class-validator)
- **SQL injection** защита (Prisma)
- **XSS** защита (React escaping)
- **CSRF** токены для форм

---

## 📊 Производительность

### **Оптимизации**

- **SSR/SSG** для каталога (Next.js)
- **Image optimization** (next/image)
- **Lazy loading** компонентов
- **Code splitting** по роутам
- **Redis cache** для:
  - Категорий
  - Популярных товаров
  - Поисковых подсказок
- **Database indexes** на частых запросах
- **CDN** для статики

### **Цели (Core Web Vitals)**

- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

---

## 📈 Масштабирование

### **Горизонтальное**

- Stateless API сервера (запуск нескольких инстансов)
- Redis кластер для сессий
- PostgreSQL репликация (read replicas)

### **Вертикальное**

- Увеличение RAM/CPU для БД
- Выделение отдельного сервера для поиска

---

## 📝 ADR (Architecture Decision Records)

### ADR-001: Monorepo с Turborepo

**Статус:** Принято  
**Контекст:** Нужно разделять frontend, backend и shared код  
**Решение:** Turborepo для оркестрации pnpm workspace  
**Последствия:** Общий кэш сборки, shared типы между проектами

### ADR-002: Prisma ORM вместо TypeORM

**Статус:** Принято  
**Контекст:** Нужна типобезопасность и миграции  
**Решение:** Prisma имеет лучшую DX и автогенерацию типов  
**Последствия:** Меньше runtime ошибок, но оверхеад на генерацию клиента

### ADR-003: Zustand вместо Redux

**Статус:** Принято  
**Контекст:** Нужно простое состояние для корзины/вишлиста  
**Решение:** Zustand требует меньше бойлерплейта  
**Последствия:** Меньше кода, но нет DevTools из коробки

---

## 📚 Документация

- [API Documentation](./docs/api/README.md)
- [Database Schema](./docs/database/ERD.md)
- [Deployment Guide](./docs/deployment/README.md)
- [Development Setup](./docs/development/SETUP.md)

---

_Последнее обновление: Март 2026_

---

## 🔔 Уведомления и события

### **События (Event-Driven Architecture)**

```typescript
// packages/api/src/events/events.ts

// Заказ создан
class OrderCreatedEvent {
  orderId: number;
  userId: number;
  total: number;
  items: Array<{ productId: number; quantity: number }>;
}

// Статус заказа изменён
class OrderStatusChangedEvent {
  orderId: number;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  userId: number;
}

// Товар зарезервирован на складе
class ProductReservedEvent {
  productId: number;
  warehouseId: number;
  quantity: number;
  orderId: number;
}

// Цена товара изменилась
class PriceChangedEvent {
  productId: number;
  oldPrice: number;
  newPrice: number;
}

// Товар закончился
class ProductOutOfStockEvent {
  productId: number;
  sku: string;
  lastWarehouseId: number;
}

// Пользователь достиг нового уровня лояльности
class LoyaltyLevelUpEvent {
  userId: number;
  oldLevel: LoyaltyLevel;
  newLevel: LoyaltyLevel;
}
```

### **Каналы уведомлений**

```typescript
// packages/api/src/notifications/notification.service.ts

interface NotificationChannel {
  send(data: NotificationData): Promise<void>;
}

// Email (SendGrid / Resend / SMTP)
class EmailNotification implements NotificationChannel {
  async send({ to, subject, template, data }) {
    // Шаблоны: order-confirmed, order-shipped, password-reset...
  }
}

// SMS (Twilio / SMS.ru)
class SmsNotification implements NotificationChannel {
  async send({ phone, message }) {
    // Для статусов заказа, кодов подтверждения
  }
}

// Push (Firebase / OneSignal)
class PushNotification implements NotificationChannel {
  async send({ userId, title, body, data }) {
    // Для мобильных уведомлений
  }
}

// Telegram Bot
class TelegramNotification implements NotificationChannel {
  async send({ chatId, message, parseMode = "HTML" }) {
    // Для админов и пользователей
  }
}

// WebSocket (для реал-тайм обновлений в админке)
class WebSocketNotification implements NotificationChannel {
  async send({ event, payload, room }) {
    // Новые заказы, изменения статусов
  }
}
```

### **Сценарии уведомлений**

| Событие                  | Каналы                       | Получатели              |
| ------------------------ | ---------------------------- | ----------------------- |
| Заказ создан             | Email, SMS, Telegram (admin) | Пользователь, Менеджер  |
| Заказ оплачен            | Email, WebSocket             | Пользователь, Админка   |
| Заказ отправлен          | Email, SMS, Push             | Пользователь            |
| Заказ доставлен          | Email, Push                  | Пользователь            |
| Товар закончился         | Email, Telegram              | Менеджер по закупкам    |
| Цена изменилась          | Email                        | Пользователи в вишлисте |
| Бонусный уровень повышен | Email, Push                  | Пользователь            |
| Новый отзыв              | Email                        | Менеджер                |

---

## 🧪 Тестирование

### **Стратегия тестирования**

```
┌─────────────────────────────────────────────────────┐
│                  Тестовая пирамида                  │
├─────────────────────────────────────────────────────┤
│                    E2E (10%)                        │
│              (Playwright, Cypress)                  │
├─────────────────────────────────────────────────────┤
│              Integration (20%)                      │
│         (Supertest, тесты API endpoints)            │
├─────────────────────────────────────────────────────┤
│              Unit (70%)                             │
│         (Jest, тесты сервисов, утилит)              │
└─────────────────────────────────────────────────────┘
```

### **Примеры тестов**

```typescript
// packages/api/src/modules/products/products.service.spec.ts

describe("ProductsService", () => {
  let service: ProductsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService, PrismaService],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should calculate discount correctly", () => {
    const result = service.calculateDiscount(10000, 20);
    expect(result).toBe(8000);
  });

  it("should throw exception for invalid SKU", async () => {
    await expect(service.findBySku("INVALID")).rejects.toThrow(
      ProductNotFoundException,
    );
  });
});
```

```typescript
// apps/storefront/e2e/checkout.spec.ts

import { test, expect } from "@playwright/test";

test("complete checkout flow", async ({ page }) => {
  // Главная
  await page.goto("/");

  // Поиск товара
  await page.fill('[data-testid="search-input"]', "RTX 4070");
  await page.press('[data-testid="search-input"]', "Enter");

  // Карточка товара
  await page.click('[data-testid="product-card"]:first-child');
  await expect(page).toHaveURL(/\/product\/.*/);

  // Добавление в корзину
  await page.click('[data-testid="add-to-cart"]');
  await page.waitForSelector('[data-testid="cart-toast"]');

  // Переход в корзину
  await page.click('[data-testid="cart-button"]');
  await page.click('[data-testid="checkout-button"]');

  // Оформление заказа
  await page.fill('[data-testid="email-input"]', "test@example.com");
  await page.fill('[data-testid="phone-input"]', "+79991234567");
  await page.click('[data-testid="submit-order"]');

  // Подтверждение
  await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
});
```

### **Покрытие (цели)**

| Модуль             | Мин. покрытие |
| ------------------ | ------------- |
| Core бизнес-логика | 90%           |
| Сервисы            | 80%           |
| Контроллеры        | 70%           |
| UI компоненты      | 60%           |
| E2E критичные flow | 100%          |

---

## 📊 Логирование и мониторинг

### **Структура логов**

```typescript
// packages/api/src/common/logger/logger.service.ts

interface LogEntry {
  timestamp: string;      // ISO 8601
  level: 'debug' | 'info' | 'warn' | 'error';
  service: string;        // 'products-api'
  module: string;         // 'ProductsService'
  action: string;         // 'createOrder'
  userId?: number;
  requestId: string;      // UUID для трассировки
  duration?: number;      // ms
  message: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack: string;
  };
}

// Примеры логов
{
  "timestamp": "2026-03-23T14:32:15.234Z",
  "level": "info",
  "service": "products-api",
  "module": "OrdersService",
  "action": "createOrder",
  "userId": 1234,
  "requestId": "abc-123-def-456",
  "duration": 145,
  "message": "Order created successfully",
  "metadata": {
    "orderId": 5678,
    "total": 89990,
    "itemsCount": 3
  }
}

{
  "timestamp": "2026-03-23T14:35:22.891Z",
  "level": "error",
  "service": "products-api",
  "module": "PaymentService",
  "action": "processPayment",
  "userId": 1234,
  "requestId": "xyz-789-uvw-012",
  "message": "Payment gateway timeout",
  "error": {
    "name": "PaymentGatewayException",
    "message": "Request timeout after 30000ms",
    "stack": "..."
  }
}
```

### **Метрики для сбора**

```typescript
// packages/api/src/metrics/metrics.service.ts

interface Metrics {
  // Производительность API
  api_request_duration_seconds: Histogram;
  api_requests_total: Counter;
  api_requests_in_flight: Gauge;

  // Бизнес-метрики
  orders_total: Counter;
  orders_revenue_total: Counter;
  orders_items_total: Counter;
  cart_abandonment_rate: Gauge;
  conversion_rate: Gauge;

  // Товары
  products_views_total: Counter;
  products_searches_total: Counter;
  products_out_of_stock: Gauge;

  // Пользователи
  users_registered_total: Counter;
  users_active: Gauge;

  // Ошибки
  errors_total: Counter;
  payment_failures_total: Counter;
}
```

### **Дашборды (Grafana)**

1. **API Health**
   - RPS (requests per second)
   - P95/P99 latency
   - Error rate по endpoint'ам
   - Status codes distribution

2. **Бизнес-метрики**
   - Заказы по времени (час/день/неделя)
   - Выручка
   - Конверсия воронки
   - Топ товаров

3. **Инфраструктура**
   - CPU/Memory usage
   - Database connections
   - Redis hit rate
   - Disk I/O

4. **Ошибки**
   - Ошибки по типам
   - Payment failures
   - External API failures

---

## 🚨 Alerting

### **Правила алертов (Prometheus AlertManager)**

```yaml
# infra/prometheus/alerts.yml

groups:
  - name: api
    rules:
      - alert: HighErrorRate
        expr: sum(rate(api_requests_total{status=~"5.."}[5m])) / sum(rate(api_requests_total[5m])) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Высокий уровень ошибок API ({{ $value | humanizePercentage }})"

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(api_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Высокая задержка API (P95: {{ $value }}s)"

  - name: business
    rules:
      - alert: NoOrdersInHour
        expr: increase(orders_total[1h]) == 0
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "Нет заказов за последний час"

      - alert: PaymentGatewayDown
        expr: sum(rate(payment_failures_total[5m])) > 10
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Проблемы с платёжным шлюзом"

  - name: infrastructure
    rules:
      - alert: DatabaseConnectionsHigh
        expr: pg_stat_activity_count > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Высокое количество подключений к БД"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "Мало места на диске (< 10%)"
```

### **Каналы алертов**

| Severity | Канал                       | Время реакции |
| -------- | --------------------------- | ------------- |
| Critical | Telegram + SMS + Phone call | 15 мин        |
| Warning  | Telegram                    | 1 час         |
| Info     | Email                       | 24 часа       |

---

## 🔐 Дополнительная безопасность

### **Rate Limiting стратегии**

```typescript
// packages/api/src/common/guards/throttle.guard.ts

@Injectable()
export class ThrottlerGuard {
  // Глобальный лимит
  @Throttle({ default: { limit: 100, ttl: 60 } })

  // Для auth endpoints
  @Throttle({ strict: { limit: 5, ttl: 60 } })
  @Post('login')

  // Для поиска (тяжёлый запрос)
  @Throttle({ search: { limit: 20, ttl: 60 } })
  @Get('search')
}
```

### **CSP (Content Security Policy)**

```typescript
// apps/storefront/next.config.js

module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' https://js.stripe.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' https://fonts.gstatic.com;
              img-src 'self' data: https://*.cloudflare.com;
              connect-src 'self' https://api.1000fps.ru https://js.stripe.com;
              frame-src https://js.stripe.com;
            `
              .replace(/\s+/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },
};
```

### **Аудит безопасности**

```bash
# Проверка зависимостей на уязвимости
pnpm audit

# SAST анализ (статический анализ кода)
pnpm lint:security

# DAST сканирование (динамическое)
npm run test:e2e:security

# Проверка secrets в коде
npx git-secrets --scan
```

---

## 📱 PWA (Progressive Web App)

### **Функции PWA**

```typescript
// apps/storefront/next.config.js

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      // Кэширование API ответов
      urlPattern: /^https:\/\/api\.1000fps\.ru\/api\/v1\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 24 часа
        },
      },
    },
    {
      // Кэширование изображений
      urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 дней
        },
      },
    },
  ],
});

module.exports = withPWA({
  // ... остальная конфигурация
});
```

### **Offline возможности**

- Просмотр каталога (кэшированные товары)
- Просмотр корзины
- Просмотр заказов (кэшированные)
- Отложенная синхронизация действий
- Offline индикация

---

## 🌐 Internationalization (i18n)

### **Поддерживаемые языки**

```typescript
// apps/storefront/i18n/config.ts

export const supportedLocales = {
  ru: { name: "Русский", direction: "ltr" },
  en: { name: "English", direction: "ltr" },
  zh: { name: "中文", direction: "ltr" }, // Для клиентов из Китая
};

export const defaultLocale = "ru";
```

### **Структура переводов**

```
apps/storefront/locales/
├── ru/
│   ├── common.json
│   ├── catalog.json
│   ├── product.json
│   ├── cart.json
│   ├── checkout.json
│   ├── account.json
│   └── configurator.json
├── en/
│   └── ...
└── zh/
    └── ...
```

```json
// apps/storefront/locales/ru/product.json
{
  "addToCart": "В корзину",
  "buyNow": "Купить в 1 клик",
  "inStock": "В наличии",
  "outOfStock": "Нет в наличии",
  "specs": {
    "title": "Характеристики",
    "socket": "Сокет",
    "cores": "Количество ядер"
  },
  "reviews": {
    "title": "Отзывы",
    "writeReview": "Написать отзыв",
    "helpful": "Пользовательских отзывов: {{count}}"
  }
}
```

---

## 🔄 CI/CD Pipeline

### **GitHub Actions Workflow**

```yaml
# .github/workflows/ci.yml

name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:e2e

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: apps/*/dist

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to staging
        run: |
          # Деплой на staging сервер
          echo "Deploying to staging..."

  deploy-prod:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        run: |
          # Деплой на production
          echo "Deploying to production..."
```

---

## 📋 Чек-лист перед запуском

### **Pre-launch Checklist**

- [ ] Все unit-тесты проходят
- [ ] E2E тесты критичных flow проходят
- [ ] Нет уязвимостей в зависимостях (`pnpm audit`)
- [ ] Настроены переменные окружения для prod
- [ ] База данных замайгрирована
- [ ] Настроен HTTPS (Let's Encrypt / Cloudflare)
- [ ] Включён rate limiting
- [ ] Настроено логирование
- [ ] Настроен мониторинг и алерты
- [ ] Создан backup план БД
- [ ] Настроен CDN для статики
- [ ] Проверена производительность (Lighthouse > 90)
- [ ] Настроены 404 и 500 страницы
- [ ] Проверена мобильная версия
- [ ] Настроена robots.txt и sitemap.xml
- [ ] Добавлены метрики (Google Analytics / Yandex Metrica)
- [ ] Протестирован checkout flow на реальных данных
- [ ] Настроены email/SMS уведомления
- [ ] Создана документация для команды

---

## 🎯 Roadmap развития

### **Phase 1: MVP (4-6 недель)**

- [ ] Каталог товаров с фильтрами
- [ ] Корзина и checkout
- [ ] Базовая админка
- [ ] Интеграция платежей

### **Phase 2: Конфигуратор (3-4 недели)**

- [ ] Выбор компонентов
- [ ] Проверка совместимости
- [ ] Сохранение сборок
- [ ] Поделиться сборкой

### **Phase 3: Аккаунт (2-3 недели)**

- [ ] Личный кабинет
- [ ] История заказов
- [ ] Вишлист
- [ ] Бонусная система

### **Phase 4: Аналитика (2 недели)**

- [ ] Дашборд для админа
- [ ] Отчёты по продажам
- [ ] Аналитика товаров

### **Phase 5: Масштабирование (ongoing)**

- [ ] PWA
- [ ] Мультиязычность
- [ ] Мобильное приложение
- [ ] Интеграция с 1C/МойСклад
