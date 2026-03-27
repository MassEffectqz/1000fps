# 🚀 Development Setup Guide

Руководство по настройке окружения для разработки 1000FPS

---

## 📋 Требования

| Компонент  | Версия   | Примечание                    |
| ---------- | -------- | ----------------------------- |
| Node.js    | 20.x LTS | Обязательно                   |
| pnpm       | 8.x+     | Менеджер пакетов              |
| PostgreSQL | 15.x+    | База данных                   |
| Redis      | 7.x+     | Кэш и сессии                  |
| Docker     | 24.x+    | Контейнеризация (опционально) |
| Git        | 2.x+     | Система контроля версий       |

---

## 🔧 Быстрый старт

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-org/1000fps.git
cd 1000fps
```

### 2. Установка зависимостей

```bash
# Установка pnpm (если не установлен)
npm install -g pnpm

# Установка всех зависимостей
pnpm install
```

### 3. Настройка переменных окружения

```bash
# Копирование примеров .env файлов
cp .env.example .env
cp apps/storefront/.env.example apps/storefront/.env
cp packages/api/.env.example packages/api/.env
```

### 4. Запуск инфраструктуры (Docker)

```bash
# Запуск PostgreSQL и Redis
docker-compose up -d postgres redis

# Проверка статуса
docker-compose ps
```

### 5. Миграции базы данных

```bash
# Запуск миграций
pnpm db:migrate

# Seed данные (опционально)
pnpm db:seed
```

### 6. Запуск разработки

```bash
# Запуск всех сервисов одновременно
pnpm dev

# Или по отдельности:
pnpm dev:api      # Backend API (порт 3001)
pnpm dev:store    # Storefront (порт 3000)
pnpm dev:admin    # Admin panel (порт 3002)
```

---

## 📁 Структура .env файлов

### **Root .env**

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/1000fps_dev?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@1000fps.ru"

# File Storage (S3-compatible)
S3_ENDPOINT="https://storage.yandexcloud.net"
S3_REGION="ru-central1"
S3_BUCKET="1000fps-storage"
S3_ACCESS_KEY="your-access-key"
S3_SECRET_KEY="your-secret-key"

# Payment Gateway
PAYMENT_API_KEY="your-payment-api-key"
PAYMENT_SECRET="your-payment-secret"

# Telegram Bot (для уведомлений)
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_ADMIN_CHAT_ID="your-chat-id"

# Meilisearch (поиск)
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY="your-meilisearch-key"

# Sentry (мониторинг ошибок)
SENTRY_DSN="https://your-sentry-dsn"
SENTRY_ENVIRONMENT="development"
```

### **apps/storefront/.env.local**

```env
# API URL
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Yandex Metrica
NEXT_PUBLIC_YM_ID="XXXXXXXXX"

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-recaptcha-site-key"

# Payment Gateway
NEXT_PUBLIC_PAYMENT_API_KEY="your-public-payment-key"
```

### **packages/api/.env**

```env
# Port
PORT=3001

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/1000fps_dev?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:3002"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH="./uploads"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# S3
S3_ENDPOINT="https://storage.yandexcloud.net"
S3_BUCKET="1000fps-storage"
S3_ACCESS_KEY="your-access-key"
S3_SECRET_KEY="your-secret-key"

# Meilisearch
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY="your-meilisearch-key"

# Payment
PAYMENT_API_KEY="your-payment-api-key"
PAYMENT_SECRET="your-payment-secret"
PAYMENT_WEBHOOK_SECRET="your-webhook-secret"

# Telegram
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_ADMIN_CHAT_ID="your-chat-id"
```

---

## 🐳 Docker Compose

### **docker-compose.yml**

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    container_name: 1000fps-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: 1000fps_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: 1000fps-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  meilisearch:
    image: getmeili/meilisearch:v1.5
    container_name: 1000fps-meilisearch
    restart: unless-stopped
    environment:
      MEILI_MASTER_KEY: your-meilisearch-key
      MEILI_ENV: development
    ports:
      - "7700:7700"
    volumes:
      - meilisearch_data:/meili_data

  mailhog:
    image: mailhog/mailhog:latest
    container_name: 1000fps-mailhog
    restart: unless-stopped
    ports:
      - "1025:1025" # SMTP
      - "8025:8025" # Web UI
    # Для тестирования email в development

volumes:
  postgres_data:
  redis_data:
  meilisearch_data:
```

### **Команды Docker**

```bash
# Запуск всех сервисов
docker-compose up -d

# Запуск конкретного сервиса
docker-compose up -d postgres

# Просмотр логов
docker-compose logs -f postgres
docker-compose logs -f redis

# Остановка
docker-compose down

# Остановка с удалением volumes
docker-compose down -v

# Перезапуск
docker-compose restart

# Проверка статуса
docker-compose ps
```

---

## 🗄️ Работа с базой данных

### **Prisma команды**

```bash
# Генерация Prisma Client
pnpm prisma generate

# Создание новой миграции
pnpm prisma migrate dev --name init

# Применение миграций
pnpm prisma migrate deploy

# Откат миграции
pnpm prisma migrate down

# Сброс базы данных
pnpm prisma migrate reset

# Открытие Prisma Studio (GUI)
pnpm prisma studio
```

### **Seed данные**

```bash
# Запуск seed скрипта
pnpm db:seed

# Сид с сбросом базы
pnpm prisma migrate reset --seed
```

### **Пример seed данных (packages/api/prisma/seed.ts)**

```typescript
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Создание админа
  const hashedPassword = await bcrypt.hash("Admin123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@1000fps.ru" },
    update: {},
    create: {
      email: "admin@1000fps.ru",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "Adminov",
      role: "ADMIN",
    },
  });

  // Создание категорий
  const components = await prisma.category.create({
    data: {
      slug: "components",
      name: "Комплектующие",
      position: 0,
    },
  });

  const gpu = await prisma.category.create({
    data: {
      slug: "gpu",
      name: "Видеокарты",
      parentId: components.id,
      position: 0,
    },
  });

  const cpu = await prisma.category.create({
    data: {
      slug: "cpu",
      name: "Процессоры",
      parentId: components.id,
      position: 1,
    },
  });

  // Создание брендов
  const asus = await prisma.brand.create({
    data: {
      slug: "asus",
      name: "ASUS",
    },
  });

  const amd = await prisma.brand.create({
    data: {
      slug: "amd",
      name: "AMD",
    },
  });

  // Создание товаров
  await prisma.product.create({
    data: {
      slug: "asus-tuf-rtx-4070-ti-super-oc-16gb",
      sku: "TUF-RTX4070TIS-O16G",
      name: "ASUS TUF Gaming GeForce RTX 4070 Ti Super OC 16 ГБ",
      description: "Мощная видеокарта для игр в 4K",
      price: 79990,
      oldPrice: 97500,
      stock: 47,
      categoryId: gpu.id,
      brandId: asus.id,
      specifications: {
        gpu: "NVIDIA GeForce RTX 4070 Ti Super",
        memory: "16 ГБ GDDR6X",
        busWidth: "256 бит",
        boostClock: "2640 МГц",
      },
    },
  });

  await prisma.product.create({
    data: {
      slug: "amd-ryzen-7-7800x3d",
      sku: "7800X3D-OEM",
      name: "AMD Ryzen 7 7800X3D AM5, OEM",
      description: "Лучший игровой процессор",
      price: 34990,
      stock: 89,
      categoryId: cpu.id,
      brandId: amd.id,
      specifications: {
        socket: "AM5",
        cores: 8,
        threads: 16,
        baseClock: "4.2 ГГц",
        boostClock: "5.0 ГГц",
        tdp: "120W",
      },
    },
  });

  // Создание part types для конфигуратора
  await prisma.partType.createMany({
    data: [
      { id: "cpu", name: "Процессор", isRequired: true, position: 0 },
      { id: "gpu", name: "Видеокарта", isRequired: true, position: 1 },
      {
        id: "motherboard",
        name: "Материнская плата",
        isRequired: true,
        position: 2,
      },
      { id: "ram", name: "Оперативная память", isRequired: true, position: 3 },
      { id: "storage", name: "Накопитель", isRequired: true, position: 4 },
      { id: "psu", name: "Блок питания", isRequired: true, position: 5 },
      { id: "case", name: "Корпус", isRequired: true, position: 6 },
      { id: "cooling", name: "Охлаждение", isRequired: false, position: 7 },
    ],
  });

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 🧪 Тестирование

### **Запуск тестов**

```bash
# Все тесты
pnpm test

# Unit тесты
pnpm test:unit

# Integration тесты
pnpm test:integration

# E2E тесты
pnpm test:e2e

# Тесты с покрытием
pnpm test:coverage

# Watch mode (автоматический перезапуск)
pnpm test:watch
```

### **Запуск E2E тестов**

```bash
# Установка Playwright браузеров
pnpm exec playwright install

# Запуск E2E тестов
pnpm test:e2e

# Запуск с UI
pnpm test:e2e --ui

# Запуск конкретного теста
pnpm test:e2e checkout.spec.ts
```

---

## 🔍 Полезные скрипты

### **package.json scripts**

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "dev:api": "pnpm --filter api dev",
    "dev:store": "pnpm --filter storefront dev",
    "dev:admin": "pnpm --filter admin dev",
    "build": "turbo run build",
    "build:api": "pnpm --filter api build",
    "build:store": "pnpm --filter storefront build",
    "start:api": "pnpm --filter api start",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "test": "turbo run test",
    "test:e2e": "pnpm --filter storefront test:e2e",
    "db:migrate": "pnpm --filter api prisma migrate dev",
    "db:seed": "pnpm --filter api prisma db seed",
    "db:studio": "pnpm --filter api prisma studio",
    "format": "prettier --write \"**/*.{ts,tsx,md}\""
  }
}
```

---

## 🛠️ Инструменты разработчика

### **Prisma Studio**

GUI для просмотра и редактирования базы данных:

```bash
pnpm prisma studio
# Откроется на http://localhost:5555
```

### **MailHog**

Перехват email в development:

```bash
# SMTP сервер на localhost:1025
# Web интерфейс на http://localhost:8025
```

### **Redis CLI**

```bash
# Подключение к Redis
docker exec -it 1000fps-redis redis-cli

# Просмотр ключей
KEYS *

# Очистка кэша
FLUSHALL
```

### **PostgreSQL CLI**

```bash
# Подключение к PostgreSQL
docker exec -it 1000fps-postgres psql -U postgres -d 1000fps_dev

# Просмотр таблиц
\dt

# Описание таблицы
\d users

# SQL запрос
SELECT * FROM users LIMIT 10;

# Выход
\q
```

---

## 🐛 Отладка

### **VS Code launch.json**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug API",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/packages/api",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["run", "dev:debug"],
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "Debug Storefront",
      "type": "chrome",
      "request": "launch",
      "preLaunchTask": "Start Storefront",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/apps/storefront"
    }
  ]
}
```

### **Логирование в development**

```typescript
// packages/api/src/common/logger/logger.service.ts

@Injectable()
export class LoggerService {
  debug(message: string, context?: string) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${context || "App"}: ${message}`);
    }
  }

  log(message: string, context?: string) {
    console.log(`[LOG] ${context || "App"}: ${message}`);
  }

  error(message: string, error?: Error, context?: string) {
    console.error(`[ERROR] ${context || "App"}: ${message}`, error);
  }
}
```

---

## 🔌 API Testing

### **Insomnia / Postman коллекция**

Импортируйте коллекцию из `docs/api-collection.json` или создайте новую:

```
Base URL: http://localhost:3001/api/v1

Endpoints:
- POST /auth/register
- POST /auth/login
- GET /auth/me
- GET /products
- GET /products/:slug
- GET /cart
- POST /cart/items
- POST /orders
...
```

### **cURL примеры**

```bash
# Регистрация
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test"
  }'

# Логин
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Получение товаров
curl http://localhost:3001/api/v1/products?category=gpu

# Создание заказа (с токеном)
curl -X POST http://localhost:3001/api/v1/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddress": {...},
    "shippingMethod": "CDEK",
    "paymentMethod": "CARD"
  }'
```

---

## 📝 Чек-лист настройки

- [ ] Node.js 20.x установлен
- [ ] pnpm установлен глобально
- [ ] PostgreSQL запущен (Docker или локально)
- [ ] Redis запущен
- [ ] .env файлы настроены
- [ ] Зависимости установлены (`pnpm install`)
- [ ] Миграции применены (`pnpm db:migrate`)
- [ ] Seed данные загружены (`pnpm db:seed`)
- [ ] API запускается на порту 3001
- [ ] Storefront запускается на порту 3000
- [ ] Admin запускается на порту 3002
- [ ] Тесты проходят (`pnpm test`)
- [ ] Prisma Studio открывается на порту 5555
- [ ] MailHog доступен на порту 8025

---

## 🆘 Частые проблемы

### **Ошибка: "Cannot find module '@prisma/client'"**

```bash
pnpm prisma generate
```

### **Ошибка: "Database connection error"**

```bash
# Проверьте, что PostgreSQL запущен
docker-compose ps

# Проверьте DATABASE_URL в .env
# Убедитесь, что порт 5432 не занят
lsof -i :5432
```

### **Ошибка: "Port 3000 already in use"**

```bash
# Найдите процесс на порту 3000
lsof -i :3000

# Или измените порт в .env.local
NEXT_PUBLIC_APP_URL="http://localhost:3003"
```

### **Ошибка: "JWT malformed"**

Убедитесь, что заголовок Authorization имеет формат:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Ошибка миграций**

```bash
# Сброс и применение заново
pnpm prisma migrate reset

# Или создание новой миграции
pnpm prisma migrate dev --name fix_something
```

---

## 📞 Контакты

**Вопросы по настройке:** dev-support@1000fps.ru

**Документация:** https://github.com/your-org/1000fps/wiki

---

_Версия: 1.0.0 | Последнее обновление: Март 2026_
