# 🏗️ 1000FPS — Структура проекта

Полная модульная структура интернет-магазина 1000FPS

---

## 📊 Обзор

| Компонент               | Статус          | Описание                     |
| ----------------------- | --------------- | ---------------------------- |
| **Backend API**         | ✅ Готово       | NestJS + Prisma + PostgreSQL |
| **Frontend Storefront** | ✅ Готово       | Next.js 14 + Tailwind CSS    |
| **Frontend Admin**      | ⏳ В процессе   | Next.js 14 + Dashboard       |
| **Parser Service**      | ✅ Интегрирован | WB parser integration        |
| **Документация**        | ✅ Готово       | ~7500 строк                  |

---

## 📁 Структура проекта

```
site-1000fps/
├── apps/
│   ├── storefront/                 # Next.js витрина (порт 3000)
│   │   ├── src/
│   │   │   ├── app/                # App Router
│   │   │   │   ├── layout.tsx      # Layout с Header/Footer
│   │   │   │   ├── page.tsx        # Главная страница
│   │   │   │   └── globals.css     # Глобальные стили
│   │   │   ├── components/
│   │   │   │   ├── layout/         # Header, Footer компоненты
│   │   │   │   │   ├── Header.tsx  # TopBar, Header, Nav
│   │   │   │   │   ├── Footer.tsx  # Newsletter, Footer
│   │   │   │   │   └── index.ts
│   │   │   │   ├── ui/             # UI компоненты
│   │   │   │   └── sections/       # Секции
│   │   │   ├── data/               # Моковые данные
│   │   │   │   ├── mockData.ts     # Все данные
│   │   │   │   └── index.ts
│   │   │   ├── lib/                # Утилиты
│   │   │   ├── hooks/              # Хуки
│   │   │   ├── store/              # Zustand stores
│   │   │   └── types/              # TypeScript типы
│   │   ├── public/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   └── STRUCTURE.md            # Документация frontend
│   │
│   └── admin/                      # Next.js админ-панель (порт 3002)
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx        # Dashboard
│       │   └── components/
│       ├── package.json
│       └── ...
│
├── packages/
│   └── api/                        # NestJS API (порт 3001)
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── modules/
│       │   │   ├── products/       # Товары (CRUD, фильтры)
│       │   │   ├── categories/     # Категории (дерево)
│       │   │   ├── brands/         # Бренды
│       │   │   ├── auth/           # Аутентификация (JWT)
│       │   │   ├── users/          # Пользователи
│       │   │   ├── orders/         # Заказы
│       │   │   ├── cart/           # Корзина
│       │   │   ├── wishlist/       # Вишлист
│       │   │   ├── configurator/   # Конфигуратор ПК
│       │   │   ├── parser/         # Интеграция парсера
│       │   │   └── search/         # Поиск
│       │   └── database/
│       │       ├── prisma.service.ts
│       │       └── database.module.ts
│       ├── prisma/
│       │   └── schema.prisma       # Схема БД
│       ├── package.json
│       ├── tsconfig.json
│       └── .env.example
│
├── parser/                         # Parser service (порт 3003)
│   ├── wb-interceptor/             # Chrome расширение
│   ├── wb-parser-auto/             # Python парсер
│   ├── wb-server/                  # Node.js сервер
│   └── package.json
│
├── docs/                           # Документация (~7500 строк)
│   ├── README.md                   # Индекс
│   ├── API.md                      # REST API спецификация
│   ├── DATABASE.md                 # Схема БД (ERD)
│   ├── SETUP.md                    # Development setup
│   ├── DEPLOYMENT.md               # Production deployment
│   ├── CONTRIBUTING.md             # Contribution guide
│   ├── CODE_STYLE.md               # Code style
│   ├── TESTING.md                  # Testing guide
│   ├── RUNBOOK.md                  # Operations
│   ├── INCIDENTS.md                # Incident management
│   └── SECURITY.md                 # Security policies
│
├── ARCHITECTURE.md                 # Главная архитектура (~1770 строк)
├── DEVELOPMENT_PLAN.md             # План разработки
├── GET_STARTED.md                  # Быстрый старт
├── docker-compose.yml              # Docker инфраструктура
├── package.json                    # Root package.json (Turborepo)
├── turbo.json                      # Turborepo конфиг
├── pnpm-workspace.yaml             # Workspace конфиг
├── .env.example                    # Переменные окружения
└── README.md                       # Этот файл
```

---

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
pnpm install
```

### 2. Настройка окружения

```bash
# Копирование .env файлов
cp .env.example .env
cp packages/api/.env.example packages/api/.env
cp apps/storefront/.env.local.example apps/storefront/.env.local
cp apps/admin/.env.local.example apps/admin/.env.local
```

### 3. Запуск инфраструктуры

```bash
pnpm docker:up
```

### 4. Создание БД

```bash
docker exec -it pg-local psql -U postgres -c 'CREATE DATABASE "site-1000fps";'
```

### 5. Генерация Prisma и миграции

```bash
pnpm db:generate
pnpm db:migrate
```

### 6. Запуск разработки

```bash
pnpm dev
```

---

## 🌐 URLs

| Сервис            | URL                           | Статус          |
| ----------------- | ----------------------------- | --------------- |
| **Storefront**    | http://localhost:3000         | ✅ Готово       |
| **Admin**         | http://localhost:3002         | ⏳ В процессе   |
| **API**           | http://localhost:3001/api/v1  | ✅ Готово       |
| **Swagger**       | http://localhost:3001/swagger | ✅ Готово       |
| **Parser**        | http://localhost:3003         | ✅ Интегрирован |
| **Prisma Studio** | http://localhost:5555         | ✅ Готово       |
| **pgAdmin**       | http://localhost:5050         | ✅ Готово       |

---

## ✅ Реализованный функционал

### Backend (NestJS)

- ✅ Аутентификация (JWT, register, login)
- ✅ CRUD товаров
- ✅ Категории (дерево)
- ✅ Бренды
- ✅ Корзина
- ✅ Вишлист
- ✅ Заказы
- ✅ Конфигуратор ПК (совместимость)
- ✅ Поиск товаров
- ✅ Интеграция парсера (импорт, webhook)
- ✅ Валидация (class-validator)
- ✅ Swagger документация

### Frontend (Next.js)

- ✅ Header (TopBar, поиск, действия, навигация)
- ✅ Footer (рассылка, ссылки, контакты)
- ✅ Главная страница (hero, категории, промо, товары, бренды, блог)
- ✅ Таймер обратного отсчёта
- ✅ Моковые данные для тестирования
- ✅ CSS переменные (оригинальный дизайн)
- ✅ Адаптивность

### Parser Integration

- ✅ WB parser integration
- ✅ Импорт товаров через API
- ✅ Webhook обработка
- ✅ История цен
- ✅ Логирование

---

## 📚 Документация

| Документ                       | Строк | Описание              |
| ------------------------------ | ----- | --------------------- |
| `ARCHITECTURE.md`              | ~1770 | Архитектура проекта   |
| `docs/API.md`                  | ~800  | REST API спецификация |
| `docs/DATABASE.md`             | ~600  | Схема БД (ERD)        |
| `docs/SETUP.md`                | ~500  | Development setup     |
| `docs/DEPLOYMENT.md`           | ~700  | Production deployment |
| `docs/CONTRIBUTING.md`         | ~350  | Contribution guide    |
| `docs/CODE_STYLE.md`           | ~450  | Code style guide      |
| `docs/TESTING.md`              | ~550  | Testing guide         |
| `docs/RUNBOOK.md`              | ~500  | Operations            |
| `docs/INCIDENTS.md`            | ~550  | Incident management   |
| `docs/SECURITY.md`             | ~650  | Security policies     |
| `apps/storefront/STRUCTURE.md` | ~200  | Frontend структура    |

**Всего: ~8000+ строк документации**

---

## 🎯 Следующие шаги

### Backend

- [ ] Загрузка изображений (S3)
- [ ] Email уведомления
- [ ] SMS уведомления
- [ ] Платежный шлюз
- [ ] Admin module

### Frontend

- [ ] Страница каталога
- [ ] Страница товара
- [ ] Корзина
- [ ] Checkout
- [ ] Личный кабинет
- [ ] Конфигуратор ПК

### Parser

- [ ] Ozon parser integration
- [ ] Автоматический парсинг по расписанию
- [ ] Синхронизация цен

---

## 📞 Контакты

- **Email:** dev-support@1000fps.ru
- **Документация:** [docs/](./docs/)
- **API Docs:** http://localhost:3001/swagger

---

**Версия:** 1.0.0  
**Последнее обновление:** Март 2026  
**Лицензия:** UNLICENSED
