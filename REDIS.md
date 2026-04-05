# Redis в 1000FPS

## 🚀 Быстрый старт

### Запуск с остальными сервисами

```bash
# Запуск всех сервисов (включая Redis)
npm run start:all

# Или через Docker Compose
docker compose up -d
```

Redis будет доступен на `localhost:6379`

### Отдельный запуск Redis

```bash
# Только Redis
docker compose -f docker-compose.redis.yml up -d

# Проверка
docker ps | grep redis
```

## 📊 Конфигурация

### Docker Compose

```yaml
redis:
  image: redis:7-alpine
  command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
```

**Параметры:**
- `--appendonly yes` - персистентность (AOF)
- `--maxmemory 256mb` - лимит памяти
- `--maxmemory-policy allkeys-lru` - LRU eviction

### Переменные окружения

```env
REDIS_URL=redis://localhost:6379
# Для Docker: REDIS_URL=redis://redis:6379
```

## 🔧 Использование в коде

### Базовое кэширование

```typescript
import { cacheGet, cacheSet } from '@/lib/cache/redis';

// Сохранить
await cacheSet('key', { data: 'value' }, 3600); // 1 час

// Получить
const data = await cacheGet('key');
```

### Кэширование запроса

```typescript
import { cacheGetOrSet } from '@/lib/cache/redis';

const products = await cacheGetOrSet(
  'products:featured',
  async () => {
    return await prisma.product.findMany({
      where: { isFeatured: true },
    });
  },
  600 // 10 минут
);
```

### In-Memory кэш

```typescript
import { getProductCache } from '@/lib/cache/memory';

const cache = getProductCache();
cache.set('product:123', productData, 600);
const data = cache.get('product:123');
```

##  Мониторинг

### Проверка доступности

```bash
# Через Docker
docker exec 1000fps-redis redis-cli ping
# Ответ: PONG

# Локально
redis-cli ping
```

### Статистика

```bash
# Информация о сервере
docker exec 1000fps-redis redis-cli INFO

# Использование памяти
docker exec 1000fps-redis redis-cli INFO memory

# Количество ключей
docker exec 1000fps-redis redis-cli DBSIZE
```

### Просмотр ключей

```bash
# Все ключи (осторожно на продакшене!)
docker exec 1000fps-redis redis-cli KEYS '*'

# Ключи по паттерну
docker exec 1000fps-redis redis-cli KEYS 'products:*'

# TTL ключа
docker exec 1000fps-redis redis-cli TTL 'products:featured'
```

## 🧹 Управление кэшем

### Очистка

```bash
# Очистить весь кэш
docker exec 1000fps-redis redis-cli FLUSHALL

# Очистить текущую БД
docker exec 1000fps-redis redis-cli FLUSHDB

# Удалить по паттерну
docker exec 1000fps-redis redis-cli --scan --pattern 'products:*' | xargs docker exec -i 1000fps-redis redis-cli DEL
```

### Программная очистка

```typescript
import { cacheDel, cacheDelPattern } from '@/lib/cache/redis';

// Удалить ключ
await cacheDel('key');

// Удалить по паттерну
await cacheDelPattern('products:*');
```

## 🔍 Отладка

### Логи Redis

```bash
# Просмотр логов
docker logs 1000fps-redis

# Логи в реальном времени
docker logs -f 1000fps-redis
```

### Подключение к CLI

```bash
# Интерактивная консоль
docker exec -it 1000fps-redis redis-cli

# Команды в консоли:
> KEYS *
> GET key
> SET key value
> TTL key
> INFO
> EXIT
```

## ⚙️ Настройка

### Изменение лимита памяти

Отредактируйте `docker-compose.yml`:

```yaml
redis:
  command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
```

### Смена политики eviction

- `allkeys-lru` - LRU из всех ключей (рекомендуется для кэша)
- `volatile-lru` - LRU только из ключей с TTL
- `allkeys-random` - случайные ключи
- `volatile-ttl` - ключи с наименьшим TTL

### Персистентность

```yaml
# RDB снапшоты
command: redis-server --save 900 1 --save 300 10 --save 60 10000

# AOF (рекомендуется)
command: redis-server --appendonly yes

# RDB + AOF
command: redis-server --save 900 1 --appendonly yes
```

## 🛡️ Безопасность

### Локальная разработка

Без пароля (только localhost):
```yaml
redis:
  image: redis:7-alpine
  ports:
    - "127.0.0.1:6379:6379"  # Только localhost
```

### Продакшен

```yaml
redis:
  command: redis-server --appendonly yes --requirepass your-strong-password
  ports:
    - "6379:6379"
```

```typescript
// Подключение с паролем
const redis = new Redis('redis://:your-strong-password@localhost:6379');
```

## 📚 Ресурсы

- [Redis Documentation](https://redis.io/docs/)
- [Redis Commands](https://redis.io/commands/)
- [Redis Best Practices](https://redis.io/docs/manual/optimization/)
- [Redis Memory Optimization](https://redis.io/docs/manual/memory-optimization/)
