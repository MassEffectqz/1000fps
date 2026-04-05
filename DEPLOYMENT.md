# 📦 DEPLOYMENT GUIDE — 1000fps

Полное руководство по развёртыванию проекта 1000fps на Hetzner VPS или Railway.

---

## 📋 Оглавление

1. [Структура Docker файлов](#структура-docker-файлов)
2. [Локальная разработка](#локальная-разработка)
3. [Деплой на Hetzner VPS](#деплой-на-hetzner-vps)
4. [Деплой на Railway](#деплой-на-railway)
5. [CI/CD настройка](#cicd-настройка)
6. [Переменные окружения](#переменные-окружения)

---

## 📁 Структура Docker файлов

```
1000fps-backup/
├── Dockerfile                      # Next.js app (multi-stage)
├── docker-compose.yml              # Локальная разработка
├── docker-compose.prod.yml         # Продакшен
├── .dockerignore                   # Игнорирование файлов
├── .env.example                    # Шаблон переменных
├── parser/
│   └── Dockerfile                  # Parser server
├── nginx/
│   ├── nginx.conf                  # Nginx конфигурация
│   └── ssl/                        # SSL сертификаты
├── scripts/
│   ├── init-db.sh                  # Инициализация БД
│   └── setup-ssl.sh                # Настройка SSL
└── .github/workflows/
    ├── ci.yml                      # CI pipeline
    └── deploy.yml                  # CD pipeline
```

---

## 🖥️ Локальная разработка

### Быстрый старт

```bash
# 1. Клонирование репозитория
git clone <repository-url>
cd 1000fps-backup

# 2. Копирование переменных окружения
cp .env.example .env.local

# 3. Запуск всех сервисов
docker compose up -d

# 4. Просмотр логов
docker compose logs -f

# 5. Остановка
docker compose down
```

### Watch mode (hot-reload)

```bash
# Запуск с автоматической пересборкой при изменениях
docker compose up --watch
```

### Доступ к сервисам

| Сервис | URL | Описание |
|--------|-----|----------|
| Next.js App | http://localhost:3000 | Основное приложение |
| Parser Server | http://localhost:3005 | API парсинга |
| PostgreSQL | localhost:5432 | База данных |

### Полезные команды

```bash
# Пересборка образов
docker compose build

# Сброс данных (внимание: удалит все данные!)
docker compose down -v

# Вход в контейнер
docker compose exec app sh
docker compose exec postgres psql -U postgres -d fps1000

# Запуск тестов внутри контейнера
docker compose exec app npm run test
```

---

## 🚀 Деплой на Hetzner VPS

### Требования

- VPS с Ubuntu 22.04/24.04
- Домен, направленный на сервер
- SSH доступ

### Шаг 1: Подготовка сервера

```bash
# Подключение к серверу
ssh user@your-server-ip

# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo apt install docker-compose-plugin -y

# Проверка установки
docker --version
docker compose version
```

### Шаг 2: Клонирование проекта

```bash
# Создание директории
sudo mkdir -p /opt/1000fps
sudo chown $USER:$USER /opt/1000fps
cd /opt/1000fps

# Клонирование репозитория
git clone <repository-url> .
```

### Шаг 3: Настройка переменных окружения

```bash
# Копирование шаблона
cp .env.example .env

# Генерация секретов
# JWT_SECRET (минимум 32 символа)
openssl rand -base64 32

# COOKIE_SECRET (минимум 32 символа)
openssl rand -base64 32

# POSTGRES_PASSWORD
openssl rand -base64 24
```

Редактируйте `.env` файл:

```env
# База данных
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<сгенерированный-пароль>
POSTGRES_DB=fps1000

# Приложение
NEXT_PUBLIC_APP_URL=https://yourdomain.com
DATABASE_URL=postgresql://postgres:<пароль>@postgres:5432/fps1000?schema=public

# Безопасность
JWT_SECRET=<сгенерированный-секрет>
COOKIE_SECRET=<сгенерированный-секрет>
```

### Шаг 4: Настройка SSL (Let's Encrypt)

```bash
# Запуск скрипта настройки SSL
chmod +x scripts/setup-ssl.sh
./scripts/setup-ssl.sh yourdomain.com admin@yourdomain.com
```

### Шаг 5: Запуск продакшена

```bash
# Запуск всех сервисов
docker compose -f docker-compose.prod.yml up -d

# Применение миграций
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy

# Просмотр логов
docker compose -f docker-compose.prod.yml logs -f

# Проверка статуса
docker compose -f docker-compose.prod.yml ps
```

### Шаг 6: Настройка автозапуска

```bash
# Создание systemd сервиса
sudo nano /etc/systemd/system/1000fps.service
```

Содержимое файла:

```ini
[Unit]
Description=1000fps Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/1000fps
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down

[Install]
WantedBy=multi-user.target
```

Активация:

```bash
sudo systemctl daemon-reload
sudo systemctl enable 1000fps
sudo systemctl start 1000fps
sudo systemctl status 1000fps
```

---

## 🛤️ Деплой на Railway

### Шаг 1: Подготовка

1. Зарегистрируйтесь на [Railway](https://railway.app)
2. Установите Railway CLI:

```bash
npm install -g @railway/cli
```

### Шаг 2: Создание проекта

```bash
# Авторизация
railway login

# Создание нового проекта
railway init

# Выбор проекта или создание нового
railway link
```

### Шаг 3: Добавление PostgreSQL

```bash
# Добавление базы данных
railway add postgresql

# Проверка подключения
railway variables
```

Railway автоматически добавит `DATABASE_URL` в переменные окружения.

### Шаг 4: Настройка переменных

```bash
# Добавление секретов
railway variables set JWT_SECRET=your-secret-key
railway variables set COOKIE_SECRET=your-cookie-secret
railway variables set NEXT_PUBLIC_APP_URL=https://your-project.railway.app
railway variables set PARSER_URL=https://parser-your-project.railway.app
```

### Шаг 5: Деплой

```bash
# Деплой приложения
railway up

# Просмотр логов
railway logs
```

### Шаг 6: Parser Server

Parser server можно развернуть как отдельный сервис:

```bash
# Создание нового сервиса для parser
cd parser
railway up
```

Или использовать multi-service проект в Railway UI.

---

## ⚙️ CI/CD настройка

### GitHub Secrets

Для автоматического деплоя настройте следующие секреты в GitHub:

**Для Hetzner VPS:**

| Secret | Описание | Пример |
|--------|----------|--------|
| `VPS_HOST` | IP или домен сервера | `123.45.67.89` |
| `VPS_USER` | SSH пользователь | `root` |
| `VPS_SSH_KEY` | Приватный SSH ключ | `-----BEGIN RSA PRIVATE KEY-----...` |
| `VPS_PORT` | SSH порт (опционально) | `22` |
| `JWT_SECRET` | JWT секрет | `your-secret` |
| `COOKIE_SECRET` | Cookie секрет | `your-secret` |
| `POSTGRES_PASSWORD` | Пароль БД | `secure-password` |

**Для Railway:**

| Secret | Описание |
|--------|----------|
| `RAILWAY_TOKEN` | Токен Railway (из настроек проекта) |
| `RAILWAY_PROJECT` | ID проекта Railway |

### GitHub Variables

| Variable | Описание | Значение |
|----------|----------|----------|
| `DEPLOY_TARGET` | Целевая платформа | `hetzner` или `railway` |

### Workflow файлы

**ci.yml** — запускается при каждом push/PR:
- Линтинг (ESLint)
- Типизация (TypeScript)
- Тесты (Vitest)
- Сборка (Next.js build)

**deploy.yml** — запускается при merge в main:
- Сборка Docker образов
- Push в GitHub Container Registry
- Деплой на целевую платформу

---

## 🔐 Переменные окружения

### Для разработки (.env.local)

```env
# База данных
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fps1000?schema=public"

# Приложение
PORT=3000
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Безопасность (dev значения)
JWT_SECRET="dev-secret-key-change-in-production"
COOKIE_SECRET="dev-cookie-secret-change-in-production"

# Парсер
PARSER_URL="http://localhost:3005"

# Прочее
NEXT_TELEMETRY_DISABLED=1
```

### Для продакшена (.env)

```env
# База данных
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<secure-password>
POSTGRES_DB=fps1000
DATABASE_URL="postgresql://postgres:<password>@postgres:5432/fps1000?schema=public"

# Приложение
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Безопасность (обязательно смените!)
JWT_SECRET=<min-32-characters>
COOKIE_SECRET=<min-32-characters>

# Парсер
PARSER_URL="http://parser:3005"

# Прочее
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=production
```

---

## 🔍 Мониторинг и логи

### Просмотр логов

```bash
# Все сервисы
docker compose logs -f

# Конкретный сервис
docker compose logs -f app
docker compose logs -f parser
docker compose logs -f postgres
docker compose logs -f nginx

# Последние 100 строк
docker compose logs --tail=100 app
```

### Health check

```bash
# Проверка здоровья приложения
curl http://localhost:3000/api/health

# Проверка здоровья парсера
curl http://localhost:3005/api/health
```

### Статус сервисов

```bash
# Docker Compose статус
docker compose ps

# Подробная информация
docker compose exec app npm run doctor
```

---

## 🆘 Troubleshooting

### Ошибка: "Container exited with code 1"

```bash
# Проверка логов
docker compose logs app

# Проверка переменных окружения
docker compose exec app env

# Проверка подключения к БД
docker compose exec app npx prisma db pull
```

### Ошибка: "Database does not exist"

```bash
# Применение миграций
docker compose run --rm app npx prisma migrate deploy

# Ручное создание БД
docker compose exec postgres psql -U postgres -c "CREATE DATABASE fps1000;"
```

### Ошибка: "SSL certificate problem"

```bash
# Проверка сертификатов
ls -la nginx/ssl/

# Пересоздание сертификатов
./scripts/setup-ssl.sh yourdomain.com admin@yourdomain.com
```

### Ошибка: "Port already in use"

```bash
# Проверка занятых портов
docker compose ps

# Остановка конфликтующих контейнеров
docker compose down

# Изменение порта в docker-compose.yml
```

---

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи: `docker compose logs -f`
2. Проверьте health endpoint: `/api/health`
3. Убедитесь, что все переменные окружения настроены
4. Проверьте доступность портов

---

**Версия:** 1.0.0
**Последнее обновление:** Апрель 2026
