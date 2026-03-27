# 🚀 Как запустить проект 1000FPS

Полное руководство по запуску всех сервисов проекта.

---

## 📋 Требования

| Компонент | Версия | Зачем |
|-----------|--------|-------|
| **Node.js** | 20.x+ | Основная среда выполнения |
| **pnpm** | 8.x+ | Менеджер пакетов |
| **Docker** | 24.x+ | Для PostgreSQL, Redis |

---

## 🔧 Быстрый старт (5 минут)

### 1️⃣ Установка зависимостей

```bash
cd "C:\Users\danya\Documents\My Web Sites\1000fps - дубль 2"

# Установка всех зависимостей
pnpm install
```

### 2️⃣ Настройка переменных окружения

```bash
# Копирование .env файлов
cp .env.example .env
cp packages/api/.env.example packages/api/.env
cp apps/storefront/.env.local.example apps/storefront/.env.local
cp apps/admin/.env.local.example apps/admin/.env.local
```

### 3️⃣ Запуск инфраструктуры (Docker)

```bash
# Запуск PostgreSQL и Redis
pnpm docker:up

# Проверка что контейнеры запущены
docker-compose ps
```

### 4️⃣ Инициализация базы данных

```bash
# Генерация Prisma клиента
pnpm db:generate

# Запуск миграций
pnpm db:migrate

# Seed данные (опционально)
pnpm db:seed
```

### 5️⃣ Запуск всех сервисов

```bash
# Запуск ВСЕХ сервисов одновременно (Turborepo)
pnpm dev
```

---

## 🌐 Доступ к сервисам

| Сервис | URL | Описание |
|--------|-----|----------|
| **Storefront** | http://localhost:3000 | Витрина магазина |
| **Admin** | http://localhost:3002 | Админ-панель |
| **API** | http://localhost:3001/api/v1 | REST API |
| **Swagger** | http://localhost:3001/swagger | API документация |
| **Prisma Studio** | http://localhost:5555 | GUI для БД |

---

## 🎯 Запуск по отдельности

### Backend API

```bash
pnpm dev:api
```
📍 http://localhost:3001

### Storefront (витрина)

```bash
pnpm dev:store
```
📍 http://localhost:3000

### Admin (админка)

```bash
pnpm dev:admin
```
📍 http://localhost:3002

---

## 🛑 Остановка

```bash
# Остановить все сервисы
pnpm docker:down

# Или вручную остановить dev сервер (Ctrl+C)
```

---

## 📦 Основные команды

| Команда | Описание |
|---------|----------|
| `pnpm dev` | Запуск всех сервисов |
| `pnpm build` | Сборка всех сервисов |
| `pnpm lint` | Проверка кода |
| `pnpm test` | Запуск тестов |
| `pnpm db:studio` | Prisma Studio (GUI для БД) |
| `pnpm docker:logs` | Логи контейнеров |

---

## ⚠️ Возможные проблемы

### Ошибка: Port 5432 already in use

```bash
# Остановить другие PostgreSQL процессы
docker-compose down
pnpm docker:up
```

### Ошибка: Cannot find module

```bash
# Переустановить зависимости
rm -rf node_modules
pnpm install
```

### Ошибка: Prisma Client not generated

```bash
pnpm db:generate
```

---

## 📞 Поддержка

При возникновении проблем:
1. Проверьте что Docker запущен
2. Проверьте что порты свободны (3000, 3001, 3002, 5432)
3. Посмотрите логи: `pnpm docker:logs`

---

*Версия: 1.0.0 | Обновлено: Март 2026*
