# ⚡ QUICK START — 1000fps Docker

## 🚀 Локальная разработка (5 минут)

### Шаг 1: Копирование переменных окружения

```bash
cp .env.example .env.local
```

### Шаг 2: Запуск Docker Compose

```bash
# Запуск всех сервисов
docker compose up -d

# Или с watch mode для hot-reload
docker compose up --watch
```

### Шаг 3: Проверка

```bash
# Просмотр логов
docker compose logs -f app

# Проверка здоровья
curl http://localhost:3000/api/health
```

**Готово!** Откройте http://localhost:3000

---

## 📦 Команды

### Основные

```bash
# Запуск
docker compose up -d

# Остановка
docker compose down

# Перезапуск
docker compose restart

# Логи
docker compose logs -f

# Статус
docker compose ps
```

### Разработка

```bash
# Watch mode (hot-reload)
docker compose up --watch

# Пересборка
docker compose build

# Сброс данных
docker compose down -v
```

### База данных

```bash
# Применение миграций
docker compose run --rm app npx prisma migrate deploy

# Создание миграции
docker compose run --rm app npx prisma migrate dev --name <name>

# Prisma Studio
docker compose run --rm app npx prisma studio

# Вход в БД
docker compose exec postgres psql -U postgres -d fps1000
```

---

## 🔧 Переменные окружения

Минимальный набор в `.env.local`:

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/fps1000?schema=public"
JWT_SECRET="dev-secret-key-minimum-32-characters-long"
COOKIE_SECRET="dev-cookie-secret-minimum-32-characters"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PARSER_URL="http://parser:3005"
```

---

## 🏗️ Архитектура

```
┌────────────────────────────────────────────┐
│            Docker Compose                  │
│                                            │
│  ┌──────────┐    ┌──────────┐             │
│  │   App    │───▶│ Postgres │             │
│  │  :3000   │    │  :5432   │             │
│  └──────────┘    └──────────┘             │
│       │                                    │
│       ▼                                    │
│  ┌──────────┐                              │
│  │  Parser  │                              │
│  │  :3005   │                              │
│  └──────────┘                              │
└────────────────────────────────────────────┘
```

**Сервисы:**
- `app` — Next.js приложение (порт 3000)
- `postgres` — PostgreSQL база данных (порт 5432)
- `parser` — Сервер парсинга (порт 3005)

---

## 🆘 Проблемы?

### Ошибка: "Port already in use"

```bash
# Windows: освободить порт 3000
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

### Ошибка: "Database connection failed"

```bash
# Подождать готовности БД
docker compose logs postgres

# Перезапустить app
docker compose restart app
```

### Ошибка: "Prisma Client not generated"

```bash
# Перегенерировать клиент
docker compose run --rm app npx prisma generate
```

### Ничего не работает

```bash
# Полный сброс
docker compose down -v
docker compose build --no-cache
docker compose up -d

# Следить за логами
docker compose logs -f
```

---

## 📚 Документация

- [DOCKER_SETUP.md](./DOCKER_SETUP.md) — Полная Docker документация
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Руководство по деплою
- [README.md](./README.md) — Основная документация проекта

---

**Время запуска:** ~2 минуты (первый запуск с сборкой)
**Требования:** Docker Desktop 4.0+ или Docker Engine 20+
