# 🚀 Deployment Guide

Руководство по развёртыванию 1000FPS в production

---

## 📋 Оглавление

1. [Требования](#требования)
2. [Подготовка](#подготовка)
3. [Docker развёртывание](#docker-развёртывание)
4. [Vercel + Railway](#vercel--railway)
5. [VPS развёртывание](#vps-развёртывание)
6. [Kubernetes](#kubernetes)
7. [CI/CD](#cicd)
8. [Мониторинг](#мониторинг)
9. [Backup](#backup)
10. [Troubleshooting](#troubleshooting)

---

## 🔧 Требования

### **Минимальные (для начала)**

| Ресурс    | Значение   |
| --------- | ---------- |
| CPU       | 2 cores    |
| RAM       | 4 GB       |
| Disk      | 40 GB SSD  |
| Bandwidth | 1 TB/month |

### **Рекомендуемые (production)**

| Ресурс    | Значение         |
| --------- | ---------------- |
| CPU       | 4+ cores         |
| RAM       | 8+ GB            |
| Disk      | 100+ GB NVMe SSD |
| Bandwidth | Unlimited        |

### **Для высокой нагрузки**

| Ресурс    | Значение         |
| --------- | ---------------- |
| CPU       | 8+ cores         |
| RAM       | 16+ GB           |
| Disk      | 500+ GB NVMe SSD |
| Bandwidth | 10 Gbps          |

---

## 📦 Подготовка

### 1. Production переменные окружения

Создайте `.env.production`:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/1000fps_prod?schema=public"

# Redis
REDIS_URL="redis://host:6379"

# JWT
JWT_SECRET="production-super-secret-key-min-32-chars"
JWT_EXPIRES_IN="2h"
JWT_REFRESH_EXPIRES_IN="30d"

# App URLs
FRONTEND_URL="https://1000fps.ru"
ADMIN_URL="https://admin.1000fps.ru"
API_URL="https://api.1000fps.ru"

# Email (production SMTP)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
SMTP_FROM="noreply@1000fps.ru"

# S3 Storage
S3_ENDPOINT="https://storage.yandexcloud.net"
S3_REGION="ru-central1"
S3_BUCKET="1000fps-prod"
S3_ACCESS_KEY="your-access-key"
S3_SECRET_KEY="your-secret-key"
S3_PUBLIC_URL="https://1000fps.storage.yandexcloud.net"

# Payment Gateway
PAYMENT_API_KEY="prod-payment-api-key"
PAYMENT_SECRET="prod-payment-secret"
PAYMENT_WEBHOOK_SECRET="prod-webhook-secret"

# Telegram
TELEGRAM_BOT_TOKEN="prod-bot-token"
TELEGRAM_ADMIN_CHAT_ID="-1001234567890"

# Meilisearch
MEILISEARCH_HOST="http://meilisearch:7700"
MEILISEARCH_API_KEY="prod-meilisearch-key"

# Sentry
SENTRY_DSN="https://prod-sentry-dsn"
SENTRY_ENVIRONMENT="production"

# Monitoring
GRAFANA_CLOUD_API_KEY="your-grafana-key"
PROMETHEUS_REMOTE_WRITE_URL="https://prometheus-prod/grafana"

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=50

# CORS
CORS_ORIGIN="https://1000fps.ru,https://admin.1000fps.ru"

# Node
NODE_ENV="production"
```

### 2. Build приложения

```bash
# Установка зависимостей
pnpm install --frozen-lockfile

# Type check
pnpm type-check

#Lint
pnpm lint

# Build всех приложений
pnpm build

# Build по отдельности
pnpm --filter api build
pnpm --filter storefront build
pnpm --filter admin build
```

---

## 🐳 Docker развёртывание

### 1. Dockerfile для API

```dockerfile
# packages/api/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/api/package.json ./packages/api/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter api...

# Copy source
COPY packages/api ./packages/api
COPY packages/shared-types ./packages/shared-types

# Build
WORKDIR /app/packages/api
RUN pnpm prisma generate
RUN pnpm build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/api/package.json ./packages/api/
RUN corepack enable && pnpm install --prod --frozen-lockfile --filter api...

# Copy built files
COPY --from=builder /app/packages/api/dist ./dist
COPY --from=builder /app/packages/api/prisma ./prisma
COPY --from=builder /app/packages/api/node_modules/.prisma ./node_modules/.prisma

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

EXPOSE 3001

CMD ["node", "dist/main"]
```

### 2. Dockerfile для Storefront

```dockerfile
# apps/storefront/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/storefront/package.json ./apps/storefront/
COPY packages/shared-types/package.json ./packages/shared-types/

RUN pnpm install --frozen-lockfile --filter storefront...

COPY apps/storefront ./apps/storefront
COPY packages/shared-types ./packages/shared-types

WORKDIR /app/apps/storefront
RUN pnpm build

FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/storefront/package.json ./apps/storefront/
RUN corepack enable && pnpm install --prod --frozen-lockfile --filter storefront...

COPY --from=builder /app/apps/storefront/.next/standalone ./
COPY --from=builder /app/apps/storefront/.next/static ./apps/storefront/.next/static
COPY --from=builder /app/apps/storefront/public ./apps/storefront/public

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["node", "apps/storefront/server.js"]
```

### 3. docker-compose.prod.yml

```yaml
version: "3.8"

services:
  # PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: 1000fps-prod-postgres
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: 1000fps_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "127.0.0.1:5432:5432" # Только localhost
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - internal

  # Redis
  redis:
    image: redis:7-alpine
    container_name: 1000fps-prod-redis
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - internal

  # Meilisearch
  meilisearch:
    image: getmeili/meilisearch:v1.5
    container_name: 1000fps-prod-meilisearch
    restart: always
    environment:
      MEILI_MASTER_KEY: ${MEILISEARCH_KEY}
      MEILI_ENV: production
    volumes:
      - meilisearch_data:/meili_data
    networks:
      - internal

  # API
  api:
    build:
      context: .
      dockerfile: packages/api/Dockerfile
    container_name: 1000fps-prod-api
    restart: always
    env_file: .env.production
    environment:
      - NODE_ENV=production
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - internal
      - web

  # Storefront
  storefront:
    build:
      context: .
      dockerfile: apps/storefront/Dockerfile
    container_name: 1000fps-prod-storefront
    restart: always
    env_file: apps/storefront/.env.production
    environment:
      - NODE_ENV=production
    ports:
      - "3000:3000"
    depends_on:
      - api
    networks:
      - web

  # Admin
  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    container_name: 1000fps-prod-admin
    restart: always
    env_file: apps/admin/.env.production
    environment:
      - NODE_ENV=production
    ports:
      - "3002:3002"
    depends_on:
      - api
    networks:
      - web

  # Nginx (reverse proxy)
  nginx:
    image: nginx:alpine
    container_name: 1000fps-prod-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - storefront
      - admin
      - api
    networks:
      - web

  # Certbot (SSL)
  certbot:
    image: certbot/certbot
    container_name: 1000fps-prod-certbot
    volumes:
      - ./nginx/ssl:/etc/letsencrypt
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

volumes:
  postgres_data:
  redis_data:
  meilisearch_data:

networks:
  web:
    driver: bridge
  internal:
    driver: bridge
    internal: true
```

### 4. nginx/nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Security headers
    server_tokens off;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=50r/s;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript
               application/xml application/xml+rss text/javascript image/svg+xml;

    # Upstreams
    upstream storefront {
        server storefront:3000;
        keepalive 32;
    }

    upstream admin {
        server admin:3002;
        keepalive 32;
    }

    upstream api {
        server api:3001;
        keepalive 64;
    }

    # HTTP -> HTTPS redirect
    server {
        listen 80;
        server_name 1000fps.ru www.1000fps.ru;
        return 301 https://$server_name$request_uri;
    }

    # Storefront
    server {
        listen 443 ssl http2;
        server_name 1000fps.ru www.1000fps.ru;

        ssl_certificate /etc/nginx/ssl/1000fps.ru/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/1000fps.ru/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location / {
            proxy_pass http://storefront;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            limit_req zone=general burst=20 nodelay;
        }

        location /api/ {
            proxy_pass http://api/api/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            limit_req zone=api burst=10 nodelay;
        }
    }

    # Admin
    server {
        listen 443 ssl http2;
        server_name admin.1000fps.ru;

        ssl_certificate /etc/nginx/ssl/admin.1000fps.ru/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/admin.1000fps.ru/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location / {
            proxy_pass http://admin;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            limit_req zone=general burst=20 nodelay;
        }
    }

    # API
    server {
        listen 443 ssl http2;
        server_name api.1000fps.ru;

        ssl_certificate /etc/nginx/ssl/api.1000fps.ru/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/api.1000fps.ru/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location / {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            limit_req zone=api burst=10 nodelay;
        }
    }
}
```

### 5. Развёртывание

```bash
# Build образов
docker-compose -f docker-compose.prod.yml build

# Запуск
docker-compose -f docker-compose.prod.yml up -d

# Проверка статуса
docker-compose -f docker-compose.prod.yml ps

# Логи
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f storefront

# Применение миграций
docker-compose -f docker-compose.prod.yml exec api pnpm prisma migrate deploy

# Seed (только первый раз)
docker-compose -f docker-compose.prod.yml exec api pnpm prisma db seed

# Остановка
docker-compose -f docker-compose.prod.yml down

# Перезапуск
docker-compose -f docker-compose.prod.yml restart
```

---

## ⚡ Vercel + Railway

### **Vercel (Frontend)**

1. **Подключите репозиторий к Vercel**

2. **Настройте переменные окружения:**

```
NEXT_PUBLIC_API_URL=https://api.1000fps.ru/api/v1
NEXT_PUBLIC_APP_URL=https://1000fps.ru
```

3. **vercel.json:**

```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm --filter storefront build",
  "installCommand": "pnpm install",
  "outputDirectory": "apps/storefront/.next"
}
```

### **Railway (Backend + DB)**

1. **Создайте PostgreSQL базу**

2. **Добавьте переменные окружения**

3. **Deploy:**

```bash
railway login
railway init
railway up
```

---

## 🖥️ VPS развёртывание

### **1. Подготовка сервера (Ubuntu 22.04)**

```bash
# Обновление
sudo apt update && sudo apt upgrade -y

# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Установка pnpm
npm install -g pnpm

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установка PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Установка Redis
sudo apt install -y redis-server

# Установка Nginx
sudo apt install -y nginx

# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### **2. Настройка PostgreSQL**

```bash
sudo -u postgres psql

CREATE DATABASE "1000fps_prod";
CREATE USER "1000fps_user" WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE "1000fps_prod" TO "1000fps_user";
\q
```

### **3. Клонирование и настройка**

```bash
cd /var/www
git clone https://github.com/your-org/1000fps.git
cd 1000fps

pnpm install
cp .env.example .env.production
# Отредактируйте .env.production
```

### 4. **Systemd сервисы**

**/etc/systemd/system/1000fps-api.service:**

```ini
[Unit]
Description=1000FPS API
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/1000fps/packages/api
ExecStart=/usr/bin/pnpm start
Restart=always
Environment=NODE_ENV=production
EnvironmentFile=/var/www/1000fps/.env.production

[Install]
WantedBy=multi-user.target
```

**/etc/systemd/system/1000fps-storefront.service:**

```ini
[Unit]
Description=1000FPS Storefront
After=network.target 1000fps-api.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/1000fps/apps/storefront
ExecStart=/usr/bin/pnpm start
Restart=always
Environment=NODE_ENV=production
EnvironmentFile=/var/www/1000fps/apps/storefront/.env.production

[Install]
WantedBy=multi-user.target
```

```bash
# Перезагрузка systemd
sudo systemctl daemon-reload

# Включение сервисов
sudo systemctl enable 1000fps-api
sudo systemctl enable 1000fps-storefront
sudo systemctl enable 1000fps-admin

# Запуск
sudo systemctl start 1000fps-api
sudo systemctl start 1000fps-storefront

# Проверка статуса
sudo systemctl status 1000fps-api
```

### **5. SSL сертификат**

```bash
sudo certbot --nginx -d 1000fps.ru -d www.1000fps.ru
sudo certbot --nginx -d admin.1000fps.ru
sudo certbot --nginx -d api.1000fps.ru
```

---

## 🔄 CI/CD

### **GitHub Actions (.github/workflows/deploy.yml)**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm test
      - run: pnpm lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: |
            apps/*/dist
            apps/*/.next
            packages/*/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/1000fps
            git pull origin main
            pnpm install --prod
            pnpm prisma migrate deploy
            sudo systemctl restart 1000fps-api
            sudo systemctl restart 1000fps-storefront
            sudo systemctl restart 1000fps-admin

  notify:
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - name: Telegram Notification
        uses: appleboy/telegram-action@master
        with:
          to: ${{ secrets.TELEGRAM_CHAT_ID }}
          token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          message: |
            ✅ Production Deploy Completed

            Commit: ${{ github.event.head_commit.message }}
            Author: ${{ github.actor }}
            Time: ${{ github.event.head_commit.timestamp }}
```

---

## 📊 Мониторинг

### **Prometheus + Grafana**

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "api"
    static_configs:
      - targets: ["api:3001"]
    metrics_path: "/metrics"

  - job_name: "postgres"
    static_configs:
      - targets: ["postgres-exporter:9187"]

  - job_name: "redis"
    static_configs:
      - targets: ["redis-exporter:9121"]
```

### **Дашборды**

Импортируйте дашборды из `infra/grafana/dashboards/`:

- API Performance
- Business Metrics
- System Health
- Error Tracking

---

## 💾 Backup

### **Автоматический backup БД**

```bash
#!/bin/bash
# scripts/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
DB_NAME="1000fps_prod"
DB_USER="1000fps_user"

# Backup
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Delete old backups (older than 30 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Upload to S3
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://1000fps-backups/postgres/
```

### **Cron job**

```bash
# Ежедневный backup в 3:00
0 3 * * * /var/www/1000fps/scripts/backup-db.sh >> /var/log/backup.log 2>&1
```

---

## 🐛 Troubleshooting

### **API не запускается**

```bash
# Проверка логов
sudo journalctl -u 1000fps-api -f

# Проверка подключения к БД
docker exec -it 1000fps-prod-postgres psql -U 1000fps_user -d 1000fps_prod -c "SELECT 1"
```

### **502 Bad Gateway**

```bash
# Проверка статуса сервисов
sudo systemctl status 1000fps-api
sudo systemctl status 1000fps-storefront

# Проверка Nginx
sudo nginx -t
sudo systemctl status nginx
```

### **Медленная производительность**

```bash
# Проверка использования ресурсов
htop
df -h
free -m

# Анализ медленных запросов
docker exec -it 1000fps-prod-postgres psql -U 1000fps_user -d 1000fps_prod -c \
  "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

---

_Версия: 1.0.0 | Последнее обновление: Март 2026_
