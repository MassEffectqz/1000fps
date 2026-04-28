# 1000FPS — Интернет-магазин компьютерной техники

[Next.js 15](https://nextjs.org) + [TypeScript](https://www.typescriptlang.org) + [Tailwind CSS 4](https://tailwindcss.com) + [Prisma 7](https://www.prisma.io) + [PostgreSQL](https://www.postgresql.org)

## Описание

Интернет-магазин компьютерной техники с полным фукционалом: каталог товаров, конфигуратор ПК, корзина, система отзывов, личный кабинет и админ-панель.

## Стек

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Стили:** Tailwind CSS 4
- **База данных:** PostgreSQL + Prisma ORM
- **Валидация:** Zod
- **Контейнеризация:** Docker + Docker Compose

## Структура

```
src/
├── app/                 # Страницы (App Router)
├── components/         # React компоненты
├── lib/                # Утилиты, Prisma клиент, Server Actions
└── types/              # TypeScript типы
prisma/                 # Схема БД и миграции
public/                 # Статика
parser/                 # Сервер парсинга Wildberries
docker-compose*.yml     # Docker Compose конфиги
```

## Быстрый старт

### Docker Compose (Рекомендуется)

```bash
# Клонирование репозитория
git clone <repository-url>
cd 1000fps-backup

# Копирование переменных окружения
cp .env.example .env.local

# Запуск всех сервисов
docker compose up -d
```

Откройте [http://localhost:3000](http://localhost:3000)

**Сервисы:**
- `app` — http://localhost:3000 (Next.js)
- `parser` — http://localhost:3005 (Парсер Wildberries)
- `parser-ui` — http://localhost:3006 (UI парсера)
- `postgres` — localhost:5432

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Настройка .env.local
cp .env.example .env.local

# Запуск PostgreSQL через Docker
docker compose up postgres

# Применение миграций
npx prisma migrate dev

# Запуск dev сервера
npm run dev
```

## Переменные окружения

| Переменная | Описание | Пример |
|------------|----------|--------|
| `DATABASE_URL` | Подключение к PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Секрет для JWT токенов | `min-32-characters-secret` |
| `COOKIE_SECRET` | Секрет для cookies | `min-32-characters-secret` |
| `NEXT_PUBLIC_APP_URL` | Публичный URL | `http://localhost:3000` |
| `PARSER_URL` | URL сервера парсинга | `http://localhost:3005` |

## Команды

```bash
npm run dev      # Dev сервер
npm run build   # Продакшен сборка
npm run start   # Продакшен сервер
npm run lint    # ESLint проверка
```

### Prisma

```bash
npx prisma migrate dev   # Миграции (dev)
npx prisma migrate deploy # Миграции (prod)
npx prisma studio     # Prisma Studio
npx prisma generate   # Перегенерировать клиент
```

## Страницы

- `/` — Главная
- `/catalog` — Каталог товаров
- `/product/[slug]` — Страница товара
- `/configurator` — Конфигуратор ПК
- `/profile` — Профиль пользователя
- `/cart` — Корзина
- `/login` / `/register` — Авторизация
- `/admin` — Админ-панель

## Деплой

### Docker (Production)

```bash
docker compose -f docker-compose.prod.yml up -d
```

### Vercel

Деплой на Vercel происходит автоматически при push в `main`.

## Лицензия

MIT