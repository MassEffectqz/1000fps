# 📦 DOCKER SETUP COMPLETE — 1000fps

## ✅ Созданные файлы

### Docker конфигурация

| Файл | Описание |
|------|----------|
| `Dockerfile` | Multi-stage build для Next.js приложения (builder + runner, Alpine, non-root) |
| `docker-compose.yml` | Локальная разработка (app + postgres + parser) с watch mode |
| `docker-compose.prod.yml` | Продакшен конфигурация (app + postgres + parser + nginx) |
| `.dockerignore` | Игнорирование файлов при сборке Docker |
| `parser/Dockerfile` | Dockerfile для сервера парсинга (Node.js + Playwright) |

### Nginx конфигурация

| Файл | Описание |
|------|----------|
| `nginx/nginx.conf` | Reverse proxy, SSL, Gzip, кэширование статики, rate limiting |
| `nginx/ssl/` | Директория для SSL сертификатов (Let's Encrypt) |

### GitHub Actions CI/CD

| Файл | Описание |
|------|----------|
| `.github/workflows/ci.yml` | CI pipeline: lint + typecheck + тесты при push/PR |
| `.github/workflows/deploy.yml` | CD pipeline: деплой при merge в main |

### Переменные окружения

| Файл | Описание |
|------|----------|
| `.env.example` | Шаблон всех необходимых переменных с комментариями |

### Скрипты

| Файл | Описание |
|------|----------|
| `scripts/init-db.sh` | Инициализация БД при старте контейнера (миграции Prisma) |
| `scripts/setup-ssl.sh` | Автоматическая настройка SSL через Certbot |

### Конфигурация Railway

| Файл | Описание |
|------|----------|
| `railway.toml` | Конфигурация деплоя на Railway.app |

### Документация

| Файл | Описание |
|------|----------|
| `DEPLOYMENT.md` | Полное руководство по развёртыванию |
| `README.md` | Обновлён с инструкциями по Docker |

### Код приложения

| Файл | Описание |
|------|----------|
| `next.config.ts` | Добавлен `output: 'standalone'` для Docker |
| `src/app/api/health/route.ts` | Health check endpoint для Docker и балансировщиков |

---

## 🚀 Быстрый старт

### Локальная разработка

```bash
# 1. Копирование переменных окружения
cp .env.example .env.local

# 2. Запуск всех сервисов
docker compose up -d

# 3. Просмотр логов
docker compose logs -f

# 4. Остановка
docker compose down
```

**Доступные сервисы:**
- **Next.js App:** http://localhost:3000
- **Parser Server:** http://localhost:3005
- **PostgreSQL:** localhost:5432

### Продакшен (Hetzner VPS)

```bash
# 1. Настройка .env файла
cp .env.example .env
# Отредактируйте .env с реальными значениями

# 2. Настройка SSL
./scripts/setup-ssl.sh yourdomain.com admin@yourdomain.com

# 3. Запуск
docker compose -f docker-compose.prod.yml up -d
```

---

## 📋 Архитектура

### Локальная разработка

```
┌─────────────────────────────────────────────────────────┐
│                   Docker Compose                        │
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   Next.js   │───▶│  PostgreSQL │    │   Parser    │ │
│  │    App      │    │   :5432     │    │   Server    │ │
│  │   :3000     │    │             │    │   :3005     │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│         │                                      ▲        │
│         └──────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### Продакшен

```
┌─────────────────────────────────────────────────────────┐
│                      Nginx (80, 443)                    │
│                    SSL + Rate Limiting                  │
└─────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌─────────────────────┐         ┌─────────────────────┐
│    Next.js App      │         │    Parser Server    │
│      (port 3000)    │         │      (port 3005)    │
└─────────────────────┘         └─────────────────────┘
            │
            ▼
┌─────────────────────┐
│    PostgreSQL       │
│     (port 5432)     │
└─────────────────────┘
```

---

## 🔐 Безопасность

### Реализованные меры

✅ **Non-root пользователь** в Docker образах
✅ **Multi-stage build** для минимизации размера образов
✅ **Rate limiting** через Nginx (10 req/s для API, 50 req/s для статики)
✅ **SSL/TLS** шифрование через Let's Encrypt
✅ **Health check** endpoint `/api/health`
✅ **Graceful shutdown** через Docker signals
✅ **Логи в stdout** (не в файлы)
✅ **.dockerignore** исключает секреты из образов

### Переменные окружения

**Никогда не коммитьте `.env` файлы!**

- `.env.example` — шаблон без значений (можно коммитить)
- `.env.local` — локальная разработка (игнорируется в .gitignore)
- `.env` — продакшен (игнорируется в .gitignore)

---

## 📊 Характеристики образов

### Next.js App

| Параметр | Значение |
|----------|----------|
| Базовый образ | Node 20 Alpine |
| Размер (~) | 250 MB |
| Пользователь | nextjs (non-root) |
| Порт | 3000 |
| Health check | /api/health |

### Parser Server

| Параметр | Значение |
|----------|----------|
| Базовый образ | Node 20 Alpine + Chromium |
| Размер (~) | 350 MB |
| Порт | 3005 |
| Health check | /api/health |

---

## 🛠️ Полезные команды

### Управление контейнерами

```bash
# Запуск
docker compose up -d

# Остановка
docker compose down

# Перезапуск
docker compose restart

# Логи
docker compose logs -f
docker compose logs -f app
docker compose logs -f parser

# Статус
docker compose ps

# Вход в контейнер
docker compose exec app sh
docker compose exec postgres psql -U postgres -d fps1000
```

### Сборка и пересборка

```bash
# Пересборка образов
docker compose build

# Пересборка без кэша
docker compose build --no-cache

# Запуск с пересборкой
docker compose up -d --build
```

### Watch mode (hot-reload)

```bash
# Запуск с автоматической пересборкой при изменениях
docker compose up --watch
```

### Миграции БД

```bash
# Применение миграций
docker compose run --rm app npx prisma migrate deploy

# Создание новой миграции
docker compose run --rm app npx prisma migrate dev --name <name>

# Сброс БД (осторожно!)
docker compose run --rm app npx prisma migrate reset
```

---

## 🆘 Troubleshooting

### Ошибка: "Cannot connect to Docker daemon"

```bash
# Проверка статуса Docker
systemctl status docker

# Перезапуск Docker
sudo systemctl restart docker
```

### Ошибка: "Port already in use"

```bash
# Проверка занятых портов (Windows)
netstat -ano | findstr :3000

# Освобождение порта или изменение в docker-compose.yml
```

### Ошибка: "Database connection failed"

```bash
# Проверка статуса PostgreSQL
docker compose ps postgres

# Логи БД
docker compose logs postgres

# Проверка DATABASE_URL в .env.local
```

### Ошибка: "Prisma Client not generated"

```bash
# Генерация клиента
docker compose run --rm app npx prisma generate
```

---

## 📚 Дополнительная документация

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Полное руководство по развёртыванию
- [README.md](./README.md) — Основная документация проекта
- [parser/README.md](./parser/README.md) — Документация парсера
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Архитектура проекта

---

## ✅ Чеклист перед деплоем

- [ ] Скопировать `.env.example` в `.env` и заполнить значения
- [ ] Сгенерировать `JWT_SECRET` и `COOKIE_SECRET` (минимум 32 символа)
- [ ] Настроить домен и DNS записи
- [ ] Настроить SSL через `scripts/setup-ssl.sh`
- [ ] Проверить health endpoint: `curl http://localhost:3000/api/health`
- [ ] Применить миграции: `docker compose run --rm app npx prisma migrate deploy`
- [ ] Настроить GitHub Secrets для CI/CD
- [ ] Протестировать локально перед деплоем

---

**Дата создания:** Апрель 2026
**Версия Docker конфигурации:** 1.0.0
