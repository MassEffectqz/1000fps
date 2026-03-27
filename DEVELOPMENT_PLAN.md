# 📋 План разработки site-1000fps

Статус создания проекта и следующие шаги

---

## ✅ Выполнено (Шаг 1-3)

### Шаг 1: Базовая конфигурация

- [x] `.env.example` — переменные окружения
- [x] `package.json` (root) — скрипты проекта
- [x] `turbo.json` — Turborepo конфигурация
- [x] `pnpm-workspace.yaml` — workspace конфигурация
- [x] `docker-compose.yml` — Docker инфраструктура
- [x] `.gitignore` — игнорирование файлов
- [x] `README.md` — документация проекта

### Шаг 2: Интеграция Parser

- [x] `parser/package.json` — конфигурация парсера
- [x] `parser/README.md` — документация парсера
- [x] Адаптация README под интеграцию

### Шаг 3: Схема БД

- [x] `packages/api/prisma/schema.prisma` — полная схема Prisma
- [x] Добавлены модели для парсера:
  - `ProductSource` — источник товара
  - `PriceHistory` — история цен
  - `ParserLog` — логи парсера

---

## 🔄 Текущий шаг (Шаг 4): Создание структуры проекта

### Необходимо создать:

#### 1. packages/api — Backend API

```
packages/api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── modules/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── users/
│   │   └── ...
│   └── database/
├── prisma/
│   └── schema.prisma (создано)
├── test/
├── package.json
├── tsconfig.json
├── nest-cli.json
└── .env.example
```

#### 2. apps/storefront — Frontend витрина

```
apps/storefront/
├── app/
│   ├── (shop)/
│   ├── (account)/
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── public/
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── .env.local.example
```

#### 3. apps/admin — Админ-панель

```
apps/admin/
├── app/
│   ├── (dashboard)/
│   ├── auth/
│   └── layout.tsx
├── components/
├── package.json
├── next.config.js
└── ...
```

---

## 📋 Следующие шаги

### Шаг 5: Инициализация проекта

```bash
# 1. Установка зависимостей
pnpm install

# 2. Генерация Prisma Client
pnpm db:generate

# 3. Применение миграций (создание БД)
pnpm db:migrate

# 4. Запуск Docker (Redis, Meilisearch)
pnpm docker:up
```

### Шаг 6: Создание API (NestJS)

1. Инициализация NestJS проекта
2. Создание модулей (Products, Orders, Users, Auth)
3. Настройка Prisma
4. Создание endpoints

### Шаг 7: Создание Frontend (Next.js)

1. Инициализация Next.js
2. Создание компонентов
3. Настройка роутинга
4. Интеграция с API

### Шаг 8: Интеграция парсера

1. Создание API для импорта товаров
2. Настройка расписания парсинга
3. Маппинг данных из парсера в БД

---

## 🎯 Готовые файлы

| Файл                  | Статус | Назначение            |
| --------------------- | ------ | --------------------- |
| `.env.example`        | ✅     | Переменные окружения  |
| `package.json`        | ✅     | Скрипты проекта       |
| `turbo.json`          | ✅     | Turborepo конфиг      |
| `docker-compose.yml`  | ✅     | Docker инфраструктура |
| `schema.prisma`       | ✅     | Схема БД              |
| `parser/package.json` | ✅     | Парсер конфиг         |

---

## 📊 Структура проекта (итоговая)

```
site-1000fps/
├── apps/
│   ├── storefront/     # Next.js витрина
│   └── admin/          # Next.js админка
├── packages/
│   └── api/            # NestJS API
├── parser/             # Parser service
├── docs/               # Документация (12 файлов)
├── docker-compose.yml
├── package.json
├── turbo.json
└── .env.example
```

---

## 🆘 Команды для начала

```bash
# Установка зависимостей
pnpm install

# Запуск инфраструктуры
pnpm docker:up

# Генерация Prisma
pnpm db:generate

# Создание БД
pnpm db:migrate

# Запуск разработки
pnpm dev
```

---

**Следующий шаг:** Создание `packages/api` с базовой структурой NestJS

Хочешь, чтобы я продолжил создание структуры API?
