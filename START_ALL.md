# 🚀 Запуск всех сервисов 1000fps

## ⚡ Быстрый старт

### Windows (PowerShell)

```powershell
# Вариант 1: Через npm (если работает Docker)
npm run docker:up

# Вариант 2: Универсальный скрипт (выберет Docker или локальный запуск)
npm run start:all

# Вариант 3: Напрямую скриптом
.\start-all.ps1
```

### Linux/MacOS

```bash
# Вариант 1: Через npm (если работает Docker)
npm run docker:up

# Вариант 2: Универсальный скрипт
./start-all.sh
```

---

## 📦 Сервисы

| Сервис | Порт | URL |
|--------|------|-----|
| Next.js App | 3000 | http://localhost:3000 |
| Parser Server | 3005 | http://localhost:3005 |
| Parser UI | 3006 | http://localhost:3006 |
| PostgreSQL | 5432 | localhost:5432 |

---

## 🔧 Управление через Docker

```bash
# Запуск
npm run docker:up

# Просмотр логов
npm run docker:logs

# Остановка
npm run docker:down

# Перезапуск
npm run docker:restart

# Пересборка
npm run docker:build
```

---

## 🔧 Управление локально (без Docker)

### Next.js App
```bash
npm run dev
```

### Parser Server
```bash
cd parser
npm start
```

### Parser UI
```bash
cd parser/ui
npm start
```

---

## 🛠️ Требования

### Для Docker варианта:
- Docker Desktop (Windows/Mac) или Docker Engine (Linux)
- Docker Compose

### Для локального варианта:
- Node.js 20+
- PostgreSQL (локально или удалённо)
- Переменные окружения в `.env.local`

---

## 📝 Переменные окружения

Скопируйте `.env.example` в `.env.local`:

```bash
cp .env.example .env.local
```

**Минимальные требования:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fps1000"
JWT_SECRET="ваш-секретный-ключ"
COOKIE_SECRET="ваш-secret"
```

---

## ❓ Troubleshooting

### Docker: failed to fetch oauth token
Проблема с сетью/доступом к Docker Hub. Попробуйте:
1. Проверить интернет-соединение
2. Перезапустить Docker Desktop
3. Использовать локальный запуск: `npm run start:all`

### PostgreSQL недоступен
Убедитесь, что:
- PostgreSQL запущен на порту 5432
- Или запустите только БД через Docker: `docker compose up -d postgres`

### Port already in use
Освободите порт или измените в `.env.local`:
```env
PORT=3001
PARSER_PORT=3006
PARSER_UI_PORT=3007
```

---

## 📚 Документация

- [README.md](./README.md) — Основная документация
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) — Настройка Docker
- [QUICKSTART_DOCKER.md](./QUICKSTART_DOCKER.md) — Быстрый старт с Docker
