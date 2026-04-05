# Обновление: Redis в npm run start:all

## ✅ Что изменено

### 1. Docker Compose обновлен
- ✅ Добавлен сервис **Redis** (redis:7-alpine)
- ✅ Порт: `6379:6379`
- ✅ Конфигурация: `--maxmemory 256mb --maxmemory-policy allkeys-lru`
- ✅ Health check для проверки доступности
- ✅ Volume `redis_data` для персистентности

### 2. App сервис обновлен
- ✅ Добавлена переменная `REDIS_URL=redis://redis:6379`
- ✅ Добавлена зависимость от `redis: service_healthy`
- ✅ Теперь app ждет пока Redis будет готов

### 3. Скрипт start-all.ps1
- ✅ Обновлен список сервисов (добавлен Redis)
- ✅ Redis запускается автоматически с остальными сервисами

### 4. Переменные окружения
- ✅ Добавлено `REDIS_URL` в `.env.example`
- ✅ Для локальной разработки: `REDIS_URL=redis://localhost:6379`
- ✅ Для Docker: `REDIS_URL=redis://redis:6379`

## 🚀 Использование

### Запуск всех сервисов

```bash
# Один команда запускает ВСЁ:
# - PostgreSQL
# - Redis (НОВЫЙ!)
# - Next.js App
# - Parser
# - Parser UI

npm run start:all
```

### Отдельное управление Redis

```bash
# Запуск только Redis
docker compose up -d redis

# Остановка только Redis
docker compose stop redis

# Просмотр логов
docker compose logs redis

# Проверка статуса
docker compose ps redis
```

## 📊 Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                   Docker Compose                        │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  PostgreSQL │  │    Redis    │  │  Next.js    │    │
│  │   :5432     │  │   :6379     │  │    App      │    │
│  │             │  │             │  │   :3000     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│         │                │                │            │
│         └────────────────┼────────────────┘            │
│                          │                             │
│                   ┌──────▼──────┐                      │
│                   │   Parser    │                      │
│                   │   :3005     │                      │
│                   └─────────────┘                      │
│                                                         │
│  ┌─────────────┐                                       │
│  │ Parser UI   │                                       │
│  │   :3006     │                                       │
│  └─────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Настройка Redis

### Изменение лимита памяти

Отредактируйте `docker-compose.yml`:

```yaml
redis:
  command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
```

### Смена политики eviction

```yaml
# LRU из всех ключей (рекомендуется)
--maxmemory-policy allkeys-lru

# LRU только из ключей с TTL
--maxmemory-policy volatile-lru

# Случайные ключи
--maxmemory-policy allkeys-random

# Ключи с наименьшим TTL
--maxmemory-policy volatile-ttl
```

## 📈 Мониторинг

### Проверка доступности

```bash
docker compose exec redis redis-cli ping
# Ответ: PONG
```

### Статистика

```bash
# Информация о сервере
docker compose exec redis redis-cli INFO

# Использование памяти
docker compose exec redis redis-cli INFO memory

# Количество ключей
docker compose exec redis redis-cli DBSIZE
```

### Логи

```bash
# Логи Redis
docker compose logs redis

# Логи в реальном времени
docker compose logs -f redis
```

## 🧹 Управление кэшем

### Очистка

```bash
# Очистить весь кэш
docker compose exec redis redis-cli FLUSHALL

# Удалить по паттерну
docker compose exec redis redis-cli --scan --pattern 'products:*' | xargs docker compose exec redis redis-cli DEL
```

### Программная очистка из приложения

```typescript
import { cacheDelPattern } from '@/lib/cache/redis';

// Очистить кэш товаров
await cacheDelPattern('products:*');
```

## 🛠️ Решение проблем

### Redis не запускается

**Проблема:** Порт 6379 занят
```bash
# Проверить что занимает порт
netstat -ano | findstr :6379

# Остановить другой Redis
docker stop <container_id>

# Или изменить порт в docker-compose.yml
ports:
  - "6380:6379"  # Использовать порт 6380
```

### Redis не подключается из приложения

**Проблема:** Неправильный REDIS_URL
```bash
# Проверить переменную окружения
docker compose exec app env | findstr REDIS

# Должно быть: REDIS_URL=redis://redis:6379
```

### Кэш не работает

**Проблема:** Redis клиент не инициализирован
```typescript
// Проверить подключение
import { checkRedisHealth } from '@/lib/cache/redis';

const isHealthy = await checkRedisHealth();
console.log('Redis health:', isHealthy);
```

## 📚 Дополнительные ресурсы

- [REDIS.md](./REDIS.md) - Полная документация по Redis
- [PERFORMANCE.md](./PERFORMANCE.md) - Оптимизация производительности
- [docker-compose.yml](./docker-compose.yml) - Конфигурация сервисов

## ✅ Чеклист после обновления

- [x] Redis добавлен в docker-compose.yml
- [x] App сервис зависит от Redis
- [x] REDIS_URL добавлена в переменные окружения
- [x] start-all.ps1 обновлен
- [x] .env.example обновлен
- [x] Документация создана

## 🎯 Итог

Теперь `npm run start:all` запускает **полный стек** приложения:
- ✅ База данных (PostgreSQL)
- ✅ Кэш (Redis) - **НОВЫЙ!**
- ✅ Приложение (Next.js)
- ✅ Парсер (Node.js)
- ✅ UI парсера (React)

**Всё готово к разработке!** 🚀
