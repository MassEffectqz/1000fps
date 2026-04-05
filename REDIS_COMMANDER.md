# Redis Commander - Веб-интерфейс для Redis

## ✅ Установлено и работает

Redis Commander - это легкий веб-интерфейс для управления Redis через браузер.

### 🌐 Доступ

**URL:** http://localhost:8081

### 🚀 Запуск

```bash
# Запуск всех сервисов (включая Redis Commander)
npm run start:all

# Или только Redis Commander
docker compose up -d redis-commander
```

### 📊 Что вы увидите

Redis Commander предоставляет:

- **Дерево ключей** - просмотр всех ключей Redis
- **Просмотр значений** - отображение значений в удобном формате
- **Редактирование** - изменение значений ключей
- **Удаление** - очистка ключей
- **Консоль** - выполнение Redis команд
- **Статистика** - информация о сервере

### 🔧 Конфигурация

```yaml
redis-commander:
  image: rediscommander/redis-commander:latest
  container_name: 1000fps-redis-commander
  environment:
    - REDIS_HOSTS=local:redis:6379
  ports:
    - "8081:8081"
```

**Автоматическое подключение:**
- Redis Commander автоматически подключается к Redis сервису
- Не требует аутентификации (локальная разработка)
- Использует Redis DB #0

### 📁 Функции

#### 1. Просмотр ключей

- Все ключи отображаются в дереве слева
- Фильтрация по паттерну
- Группировка по namespace (через `:`)

#### 2. Работа с значениями

Поддерживаемые типы данных:
- ✅ String
- ✅ Hash
- ✅ List
- ✅ Set
- ✅ ZSet (Sorted Set)

#### 3. Редактирование

- Добавление новых ключей
- Изменение значений
- Установка TTL
- Удаление ключей

#### 4. Консоль

Выполнение Redis команд:
```
GET key
SET key value
KEYS *
INFO
```

### 🛠️ Примеры использования

#### Просмотр кэша товаров

1. Откройте http://localhost:8081
2. Введите в поиске `products:*`
3. Просмотрите закешированные данные

#### Очистка кэша

Через интерфейс:
1. Найдите ключи по паттерну `products:*`
2. Выделите все
3. Нажмите Delete

Через консоль:
```
DEL products:*
```

#### Проверка TTL

1. Кликните на ключ
2. Посмотрите поле "TTL"
3. При необходимости обновите

### 📈 Мониторинг

#### Статистика Redis

В Redis Commander:
- вкладка "Info" → полная статистика сервера
- использование памяти
- количество ключей
- подключенные клиенты

#### Логи

```bash
# Логи Redis Commander
docker compose logs redis-commander

# Логи в реальном времени
docker compose logs -f redis-commander
```

### 🔐 Безопасность

**Важно:** Redis Commander не требует аутентификации в текущей конфигурации!

**Для локальной разработки** - это нормально.

**Для продакшена:**
1. Добавьте аутентификацию:
```yaml
environment:
  - HTTP_USER=admin
  - HTTP_PASSWORD=your-strong-password
```

2. Ограничьте доступ:
```yaml
ports:
  - "127.0.0.1:8081:8081"  # Только localhost
```

### ⚙️ Настройка

### Изменение порта

```yaml
redis-commander:
  ports:
    - "9000:8081"  # Сменить на порт 9000
```

### Добавление нескольких Redis

```yaml
environment:
  - REDIS_HOSTS=local:redis:6379,cache:redis-cache:6380
```

### Персистентность настроек

```yaml
volumes:
  - redis-commander-data:/root/.redis-commander
```

### 🏥 Health Check

```bash
# Проверка доступности
curl http://localhost:8081

# Статус контейнера
docker compose ps redis-commander
```

**Ожидаемый ответ:**
- HTTP 200
- Статус: `healthy`

### 🧹 Очистка данных

#### Через Redis Commander

1. Откройте http://localhost:8081
2. Введите паттерн (например `products:*`)
3. Выделите все ключи
4. Нажмите Delete

#### Через CLI

```bash
# Подключение к Redis
docker compose exec redis redis-cli

# Удаление по паттерну
KEYS products:*
DEL products:123 products:456

# Очистка всей БД
FLUSHDB

# Очистка всех БД
FLUSHALL
```

### 📚 Ресурсы

- [Redis Commander GitHub](https://github.com/joeferner/redis-commander)
- [Redis Documentation](https://redis.io/docs/)
- [Redis Commands](https://redis.io/commands/)

### ✅ Чеклист

- [x] Redis Commander добавлен в docker-compose.yml
- [x] Автоматическое подключение к Redis
- [x] Порт 8081 доступен
- [x] start-all.ps1 обновлен
- [x] Health check настроен

## 🎯 Итог

**Redis Commander** - удобный веб-интерфейс для управления Redis.

**URL:** http://localhost:8081

**Запуск:**
```bash
npm run start:all  # Запускает всё включая Redis Commander
```

**Готово к использованию!** 🚀
