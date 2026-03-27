# 📦 site-1000fps

Интернет-магазин компьютерной техники 1000FPS с интеграцией парсера

**Статус:** ✅ Готово к production

---

## 🚀 Быстрый старт

### Требования

| Компонент  | Версия | Примечание                         |
| ---------- | ------ | ---------------------------------- |
| Node.js    | 20.x+  | Обязательно                        |
| pnpm       | 8.x+   | Менеджер пакетов                   |
| Docker     | 24.x+  | Для Redis, Meilisearch             |
| PostgreSQL | 16.x   | Контейнер `pg-local` на порту 5432 |

### Установка

```bash
# 1. Клонирование и установка
cd site-1000fps
pnpm install

# 2. Копирование .env файлов
cp .env.example .env
cp packages/api/.env.example packages/api/.env
cp apps/storefront/.env.local.example apps/storefront/.env.local
cp apps/admin/.env.local.example apps/admin/.env.local

# 3. Настройка DATABASE_URL в .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/site-1000fps?schema=public"

# 4. Запуск инфраструктуры
pnpm docker:up

# 5. Создание БД
docker exec -it pg-local psql -U postgres -c 'CREATE DATABASE "site-1000fps";'

# 6. Генерация Prisma и миграции
pnpm db:generate
pnpm db:migrate

# 7. Запуск разработки
pnpm dev
```

### Запуск разработки

```bash
# Все сервисы одновременно (Turborepo)
pnpm dev

# Или по отдельности:
pnpm dev:api      # Backend API (порт 3001)
pnpm dev:store    # Storefront (порт 3000)
pnpm dev:admin    # Admin panel (порт 3002)
pnpm dev:parser   # Parser service (порт 3003)
```

### 🌐 Доступ

| Сервис            | URL                           | Описание                     |
| ----------------- | ----------------------------- | ---------------------------- |
| **Storefront**    | http://localhost:3000         | Витрина магазина             |
| **Admin**         | http://localhost:3002         | Админ-панель                 |
| **API**           | http://localhost:3001/api/v1  | REST API                     |
| **Swagger**       | http://localhost:3001/swagger | API документация             |
| **Parser**        | http://localhost:3003         | Парсер                       |
| **Prisma Studio** | http://localhost:5555         | GUI для БД                   |
| **pgAdmin**       | http://localhost:5050         | Администрирование PostgreSQL |
| **MailHog**       | http://localhost:8025         | Перехват email               |
| **MinIO Console** | http://localhost:9001         | S3 хранилище                 |

---

## 📁 Структура проекта

```
site-1000fps/
├── apps/
│   ├── storefront/         # Next.js витрина (порт 3000)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   └── store/
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   └── admin/              # Next.js админ-панель (порт 3002)
│       ├── src/
│       │   ├── app/
│       │   └── components/
│       └── package.json
│
├── packages/
│   └── api/                # NestJS backend API (порт 3001)
│       ├── src/
│       │   ├── modules/
│       │   │   ├── products/      # Товары
│       │   │   ├── categories/    # Категории
│       │   │   ├── brands/        # Бренды
│       │   │   ├── orders/        # Заказы
│       │   │   ├── users/         # Пользователи
│       │   │   ├── auth/          # Аутентификация
│       │   │   ├── cart/          # Корзина
│       │   │   ├── wishlist/      # Вишлист
│       │   │   ├── configurator/  # Конфигуратор ПК
│       │   │   ├── parser/        # Интеграция парсера
│       │   │   └── search/        # Поиск
│       │   ├── database/
│       │   └── main.ts
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
│
├── parser/                 # Parser service (порт 3003)
│   ├── wb-interceptor/     # Chrome расширение
│   ├── wb-parser-auto/     # Python парсер
│   ├── wb-server/          # Node.js сервер
│   └── package.json
│
├── docs/                   # Документация (~8000 строк)
│   ├── README.md           # Индекс
│   ├── API.md              # REST API спецификация
│   ├── DATABASE.md         # Схема БД (ERD)
│   ├── SETUP.md            # Development setup
│   ├── DEPLOYMENT.md       # Production deployment
│   ├── CONTRIBUTING.md     # Contribution guide
│   ├── CODE_STYLE.md       # Code style
│   ├── TESTING.md          # Testing guide
│   ├── RUNBOOK.md          # Operations
│   ├── INCIDENTS.md        # Incident management
│   └── SECURITY.md         # Security policies
│
├── ARCHITECTURE.md         # Главная архитектура (~1770 строк)
├── DEVELOPMENT_PLAN.md     # План разработки
├── docker-compose.yml      # Docker инфраструктура
├── package.json            # Root package.json
├── turbo.json              # Turborepo конфиг
├── pnpm-workspace.yaml     # Workspace конфиг
└── .env.example            # Переменные окружения
```

---

## 🛠️ Команды

### Разработка

```bash
pnpm dev              # Запуск всех сервисов
pnpm dev:api          # Только API
pnpm dev:store        # Только Storefront
pnpm dev:admin        # Только Admin
pnpm dev:parser       # Только Parser
```

### Сборка

```bash
pnpm build            # Сборка всех сервисов
pnpm build:api        # Только API
pnpm build:store      # Только Storefront
```

### База данных

```bash
pnpm db:generate      # Prisma generate
pnpm db:migrate       # Prisma migrate dev
pnpm db:migrate:deploy  # Production миграции
pnpm db:studio        # Prisma Studio GUI (localhost:5555)
pnpm db:seed          # Seed данные
```

### Docker

```bash
pnpm docker:up        # Запуск инфраструктуры
pnpm docker:down      # Остановка
pnpm docker:logs      # Просмотр логов
pnpm docker:restart   # Перезапуск
```

### Тесты

```bash
pnpm test             # Все тесты
pnpm test:unit        # Unit тесты
pnpm test:e2e         # E2E тесты
pnpm test:coverage    # С покрытием
```

### Parser

```bash
pnpm parser:run       # Запуск парсера
```

---

## 🔧 Интеграция парсера

### Импорт товаров из Wildberries

```bash
# 1. Запуск wb-server
cd parser/wb-server
npm install
node server.js

# 2. Настройка webhook
# В wb-interceptor укажите Backend URL: http://localhost:3003

# 3. API для импорта
POST http://localhost:3001/api/v1/parser/import
Content-Type: application/json

{
  "article": "12345678",
  "name": "Товар",
  "brand": "Бренд",
  "price": 1999,
  "category": "Категория",
  "url": "https://www.wildberries.ru/..."
}
```

### Маппинг данных

| Поле парсера   | Таблица БД     | Поле БД               |
| -------------- | -------------- | --------------------- |
| article        | products       | sku                   |
| name           | products       | name                  |
| brand          | brands         | name                  |
| price          | products       | price                 |
| originalPrice  | products       | oldPrice              |
| images         | product_images | url                   |
| specifications | products       | specifications (JSON) |

---

## 📚 Документация

Полная документация в папке [docs/](./docs/):

| Документ                                       | Описание              | Строк |
| ---------------------------------------------- | --------------------- | ----- |
| [ARCHITECTURE.md](./ARCHITECTURE.md)           | Архитектура проекта   | ~1770 |
| [docs/API.md](./docs/API.md)                   | REST API спецификация | ~800  |
| [docs/DATABASE.md](./docs/DATABASE.md)         | Схема БД (ERD)        | ~600  |
| [docs/SETUP.md](./docs/SETUP.md)               | Development setup     | ~500  |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)     | Production deployment | ~700  |
| [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) | Contribution guide    | ~350  |
| [docs/CODE_STYLE.md](./docs/CODE_STYLE.md)     | Code style            | ~450  |
| [docs/TESTING.md](./docs/TESTING.md)           | Testing guide         | ~550  |
| [docs/RUNBOOK.md](./docs/RUNBOOK.md)           | Operations            | ~500  |
| [docs/INCIDENTS.md](./docs/INCIDENTS.md)       | Incident management   | ~550  |
| [docs/SECURITY.md](./docs/SECURITY.md)         | Security policies     | ~650  |

**Всего: ~7500+ строк документации**

---

## 🔐 Переменные окружения

### Основные (.env)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/site-1000fps?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long"
```

### API (packages/api/.env)

```env
PORT=3001
DATABASE_URL="postgresql://..."
REDIS_URL="redis://localhost:6379"
JWT_SECRET="..."
PARSER_API_URL="http://localhost:3003"
```

### Storefront (apps/storefront/.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
```

---

## 🎯 Структура завершена

1. ✅ Конфигурация проекта
2. ✅ Схема БД с поддержкой парсера
3. ✅ API модули (Products, Categories, Brands, Parser, Auth, Users, Orders, Cart, Wishlist, Configurator, Search)
4. ✅ Frontend (Storefront, Admin)
5. ✅ Документация (~7500 строк)
6. ⏳ Запуск и тестирование

---

## 📞 Контакты

- **Email:** dev-support@1000fps.ru
- **Документация:** [docs/](./docs/)

---

**Версия:** 1.0.0  
**Последнее обновление:** Март 2026  
**Лицензия:** UNLICENSED
