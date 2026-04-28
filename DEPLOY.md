# ============================================================
# DEPLOYMENT GUIDE — 1000fps VDS (Timeweb + Docker)
# ============================================================

## 1. ПОДГОТОВКА СЕРВЕРА

### 1.1 Подключение к серверу
```bash
ssh root@your-vps-ip
```

### 1.2 Установка Docker и Docker Compose
```bash
# Обновление пакетов
apt update && apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com | sh

# Установка Docker Compose
apt install docker-compose -y

# Проверка
docker --version
docker-compose --version
```

### 1.3 Настройка PostgreSQL (если без Docker)
```bash
# Установка PostgreSQL
apt install postgresql postgresql-contrib -y

# Запуск
systemctl start postgresql
systemctl enable postgresql

# Создание БД
sudo -u postgres psql
CREATE DATABASE fps1000;
CREATE USER postgres WITH PASSWORD 'ваш_пароль';
GRANT ALL PRIVILEGES ON DATABASE fps1000 TO postgres;
```

---

## 2. DEPLOY С ПОМОЩЬЮ DOCKER

### 2.1 Клонирование проекта
```bash
cd /opt
git clone https://github.com/your-repo/1000fps.git
cd 1000fps
```

### 2.2 Настройка переменных окружения
```bash
# Копирование примера конфига
cp .env.example .env
nano .env

# Заполните:
# DATABASE_URL=postgresql://user:password@localhost:5432/fps1000
# JWT_SECRET=$(openssl rand -base64 32)
# COOKIE_SECRET=$(openssl rand -base64 32)
# NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2.3 Сборка и запуск
```bash
# Сборка образов (первый раз)
docker-compose -f docker-compose.prod.yml build

# Запуск всех сервисов
docker-compose -f docker-compose.prod.yml up -d

# Проверка статуса
docker-compose -f docker-compose.prod.yml ps

# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f app
```

### 2.4 Миграции и Seed
```bash
# Выполнение миграций
docker exec -it 1000fps-app npx prisma migrate deploy

# Или создание миграций (если БД пустая)
docker exec -it 1000fps-app npx prisma migrate dev

# Seed данных (опционально)
docker exec -it 1000fps-app npm run db:seed
```

---

## 3. НАСТРОЙКА NGINX И SSL

### 3.1 SSL сертификат (Let's Encrypt)
```bash
# Получение сертификата
docker exec 1000fps-nginx certbot certonly --webroot \
  --webroot-path /var/www/certbot \
  -d your-domain.com -d www.your-domain.com

# Обновление конфига nginx
# Добавьте certbot hooks в docker-compose.prod.yml
```

### 3.2 Nginx конфиг
```nginx
# nginx/nginx.conf
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 4. ОБНОВЛЕНИЕ ПРИЛОЖЕНИЯ

```bash
# Остановка
docker-compose -f docker-compose.prod.yml down

# Pull обновлений
git pull origin main

# Пересборка
docker-compose -f docker-compose.prod.yml build

# Запуск
docker-compose -f docker-compose.prod.yml up -d

# Миграции (если есть)
docker exec -it 1000fps-app npx prisma migrate deploy
```

---

## 5. ПРОВЕРКА РАБОТЫ

```bash
# Статус контейнеров
docker-compose -f docker-compose.prod.yml ps

# Логи приложения
docker-compose -f docker-compose.prod.yml logs app --tail=100

# Логи PostgreSQL
docker-compose -f docker-compose.prod.yml logs postgres --tail=50

# Проверка endpoints
curl http://localhost:3000/api/catalog
curl http://localhost:3000/api/auth/session
```

---

## 6. ПОЛЕЗНЫЕ КОМАНДЫ

```bash
# Перезапуск конкретного сервиса
docker restart 1000fps-app
docker restart 1000fps-parser

# Просмотр использования ресурсов
docker stats

# Очистка неиспользуемых образов
docker system prune -a

# Бэкап БД
docker exec 1000fps-postgres pg_dump -U postgres fps1000 > backup_$(date +%Y%m%d).sql

# Восстановление БД
docker exec -i 1000fps-postgres psql -U postgres fps1000 < backup.sql
```

---

## 7. МОНИТОРИНГ

### Systemd сервис для автозапуска
```bash
# /etc/systemd/system/1000fps.service
[Unit]
Description=1000fps Docker App
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
WorkingDirectory=/opt/1000fps
ExecStart=/usr/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.prod.yml down
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

```bash
# Активация
systemctl daemon-reload
systemctl enable 1000fps.service
systemctl start 1000fps.service
```

---

## 8. TROUBLESHOOTING

### Ошибка подключения к БД
```bash
# Проверьте DATABASE_URL
docker exec 1000fps-app env | grep DATABASE

# Проверьте доступность PostgreSQL
docker exec 1000fps-app nc -zv postgres 5432
```

### Ошибка миграций
```bash
# Примените миграции вручную
docker exec -it 1000fps-app npx prisma migrate deploy --force
```

### Ошибка SSL
```bash
# Проверьте сертификаты
ls -la nginx/ssl/
```

---

## КОНТАКТЫ ПОДДЕРЖКИ

- Email: support@1000fps.ru
- Telegram: @1000fps_support