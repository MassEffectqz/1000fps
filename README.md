# 1000FPS — Интернет-магазин компьютерной техники

[Next.js 15](https://nextjs.org) + [TypeScript](https://www.typescriptlang.org) + [Tailwind CSS 4](https://tailwindcss.com) + [Prisma 7](https://www.prisma.io)

## Описание

Интернет-магазин компьютерной техники с конфигуратором ПК, корзиной, системой отзывов и админ-панелью.

### 🕷️ Parser Server

**Сервер парсинга Wildberries** — Node.js + Playwright решение для автоматического сбора цен.

- **Порт:** 3005
- **API:** POST /api/parse, GET /api/parse/:id
- **Документация:** [parser/README.md](parser/README.md)

### 🎨 Parser UI

**Интерфейс управления парсером** — Express сервер с веб-интерфейсом для запуска и мониторинга парсинга.

- **Порт:** 3006
- **URL:** http://localhost:3006
- **Документация:** [parser/ui/README.md](parser/ui/README.md)

## Стек

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Стили:** Tailwind CSS 4
- **База данных:** PostgreSQL + Prisma ORM
- **Валидация:** Zod
- **Контейнеризация:** Docker + Docker Compose

## Структура

```
├── src/                    # Исходный код
│   ├── app/                # Страницы
│   ├── components/         # Компоненты
│   ├── lib/                # Утилиты
│   └── types/              # Типы
├── maket/                  # HTML макеты (исходники)
├── prisma/                 # Схема БД и миграции
├── public/                 # Статика
├── parser/                 # Сервер парсинга
│   ├── ui/                 # UI интерфейс парсера
│   └── wb-parser-auto/     # Автоматический парсер
├── nginx/                  # Nginx конфигурация
├── scripts/                # Скрипты развёртывания
├── .github/workflows/      # GitHub Actions CI/CD
└── docker-compose*.yml     # Docker Compose конфиги
```

---

## 🚀 Быстрый старт

### Вариант 1: Docker Compose (Рекомендуется)

```bash
# Клонирование репозитория
git clone <repository-url>
cd 1000fps-backup

# Копирование переменных окружения
cp .env.example .env.local

# Запуск всех сервисов (PostgreSQL + Next.js + Parser + Parser UI)
docker compose up -d

# Просмотр логов
docker compose logs -f app
docker compose logs -f parser
docker compose logs -f parser-ui
docker compose logs -f postgres
```

Откройте [http://localhost:3000](http://localhost:3000)

**Все сервисы:**
- 🛒 **Next.js App** — http://localhost:3000
- 🕷️ **Parser Server** — http://localhost:3005
- 🎨 **Parser UI** — http://localhost:3006
- 🗄️ **PostgreSQL** — localhost:5432

### Вариант 2: Универсальный скрипт (Windows/Mac/Linux)

```bash
# Windows PowerShell
npm run start:all

# Или напрямую
.\start-all.ps1

# Linux/MacOS
./start-all.sh
```

Скрипт проверит Docker и предложит выбор: Docker Compose или локальный запуск.

### Вариант 3: Локальная разработка (без Docker)

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера Next.js
npm run dev

# В отдельных терминалах запустите:
cd parser && npm start
cd ui && npm start
```

---

## 🐳 Docker

### Локальная разработка

```bash
# Запуск с watch mode (hot-reload)
docker compose up --watch

# Остановка
docker compose down

# Пересборка образов
docker compose build

# Сброс и запуск с чистыми данными
docker compose down -v
docker compose up -d
```

### Продакшен

```bash
# Запуск production сборки
docker compose -f docker-compose.prod.yml up -d

# Просмотр логов
docker compose -f docker-compose.prod.yml logs -f

# Остановка
docker compose -f docker-compose.prod.yml down
```

### Сервисы

| Сервис | Порт | Описание |
|--------|------|----------|
| `app` | 3000 | Next.js приложение |
| `parser` | 3005 | Сервер парсинга Wildberries |
| `postgres` | 5432 | PostgreSQL база данных |
| `nginx` | 80, 443 | Reverse proxy + SSL (prod) |

---

## 🔧 Настройка окружения

### Переменные окружения

Скопируйте `.env.example` в `.env.local`:

```bash
cp .env.example .env.local
```

**Обязательные переменные:**

| Переменная | Описание | Пример |
|------------|----------|--------|
| `DATABASE_URL` | Подключение к PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Секрет для JWT токенов | `min-32-characters-secret` |
| `COOKIE_SECRET` | Секрет для cookies | `min-32-characters-secret` |
| `NEXT_PUBLIC_APP_URL` | Публичный URL приложения | `http://localhost:3000` |
| `PARSER_URL` | URL сервера парсинга | `http://localhost:3005` |

Полный список в [`.env.example`](./.env.example)

---

## 📦 Команды

### Разработка

```bash
npm run dev      # Запуск dev сервера
npm run lint     # ESLint проверка
npm run test     # Запуск тестов
```

### Продакшен

```bash
npm run build    # Продакшен сборка
npm run start    # Запуск продакшен сервера
```

### Prisma

```bash
npx prisma migrate dev    # Применить миграции (dev)
npx prisma migrate deploy # Применить миграции (prod)
npx prisma studio         # Открыть Prisma Studio
npx prisma generate       # Перегенерировать клиент
npx prisma db seed        # Сидирование БД
```

### Docker

```bash
docker compose up -d           # Запуск сервисов
docker compose down            # Остановка сервисов
docker compose logs -f         # Просмотр логов
docker compose restart         # Перезапуск сервисов
docker compose build --no-cache  # Пересборка без кэша
```

---

## 🌐 Деплой

### Hetzner VPS (Ubuntu 24)

1. **Подготовка сервера:**

```bash
# Установка Docker
curl -fsSL https://get.docker.com | sh

# Клонирование проекта
git clone <repository-url> /opt/1000fps
cd /opt/1000fps

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env с реальными значениями
```

2. **Настройка SSL (Let's Encrypt):**

```bash
# Запуск скрипта настройки SSL
chmod +x scripts/setup-ssl.sh
./scripts/setup-ssl.sh yourdomain.com your@email.com
```

3. **Запуск:**

```bash
docker compose -f docker-compose.prod.yml up -d
```

4. **CI/CD:**

При push в ветку `main` автоматически сработает деплой через GitHub Actions.

**Необходимые GitHub Secrets:**

| Secret | Описание |
|--------|----------|
| `VPS_HOST` | IP или домен сервера |
| `VPS_USER` | Пользователь SSH |
| `VPS_SSH_KEY` | Приватный SSH ключ |
| `VPS_PORT` | Порт SSH (по умолчанию 22) |
| `JWT_SECRET` | Секрет JWT |
| `COOKIE_SECRET` | Секрет cookies |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL |

### Railway

1. **Подключите репозиторий** в [Railway](https://railway.app)

2. **Добавьте PostgreSQL** как сервис

3. **Настройте переменные окружения:**

```bash
# В Railway UI добавьте:
JWT_SECRET=your-secret
COOKIE_SECRET=your-cookie-secret
PARSER_URL=<url-parser-service>
```

4. **Деплой** произойдёт автоматически при push в `main`

---

## 🏗️ Архитектура

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│     Nginx       │────▶│  Next.js App │────▶│  PostgreSQL │
│   (80, 443)     │     │   (3000)     │     │   (5432)    │
└─────────────────┘     └──────────────┘     └─────────────┘
                              │
                              ▼
                        ┌──────────────┐
                        │ Parser Server│
                        │   (3005)     │
                        └──────────────┘
```

---

## 📄 Страницы

- `/` — Главная
- `/catalog` — Каталог товаров
- `/product/[slug]` — Страница товара
- `/configurator` — Конфигуратор ПК
- `/profile` — Профиль пользователя
- `/cart` — Корзина
- `/login` / `/register` — Авторизация / Регистрация
- `/admin` — Админ-панель

---

## 📚 Документация

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Архитектура проекта
- [STACK.md](./STACK.md) — Стек технологий
- [task.md](./task.md) — Задача и план работ
- [PARSER_IMPLEMENTATION.md](./PARSER_IMPLEMENTATION.md) — Реализация парсера
- [API_ENDPOINTS_CREATED.md](./API_ENDPOINTS_CREATED.md) — API endpoints
- [parser/README.md](./parser/README.md) — Документация парсера

---

## 🔒 Безопасность

- Non-root пользователь в Docker образах
- Rate limiting через Nginx
- SSL/TLS шифрование
- JWT аутентификация
- Health check endpoint: `/api/health`

---

## 🆘 Troubleshooting

### Ошибка: "Port 3000 already in use"

```bash
# Найдите процесс на порту 3000
# Windows:
netstat -ano | findstr :3000

# Linux/Mac:
lsof -i :3000

# Освободите порт или измените PORT в .env.local
```

### Ошибка: "Database connection failed"

```bash
# Проверьте, что PostgreSQL запущен
docker compose ps postgres

# Проверьте логи БД
docker compose logs postgres

# Убедитесь, что DATABASE_URL правильный
```

### Ошибка: "Prisma Client not generated"

```bash
# Перегенерируйте клиент
npx prisma generate

# Или пересоберите контейнер
docker compose build app
docker compose up -d
```

---

## 📝 License

MIT
