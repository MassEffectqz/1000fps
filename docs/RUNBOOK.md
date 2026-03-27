# 📖 Operations Runbook

Эксплуатационная документация для 1000FPS

---

## 📋 Оглавление

1. [Ежедневные операции](#ежедневные-операции)
2. [Еженедельные операции](#еженедельные-операции)
3. [Ежемесячные операции](#ежемесячные-операции)
4. [Мониторинг](#мониторинг)
5. [Инциденты](#инциденты)
6. [Контакты](#контакты)

---

## 🔁 Ежедневные операции

### Утренняя проверка (9:00)

```bash
# 1. Проверка статуса сервисов
sudo systemctl status 1000fps-api
sudo systemctl status 1000fps-storefront
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status redis

# 2. Проверка логов на ошибки
sudo journalctl -u 1000fps-api --since "06:00" --no-pager | grep -i error
sudo journalctl -u 1000fps-storefront --since "06:00" --no-pager | grep -i error

# 3. Проверка дискового пространства
df -h
# Критично: < 80% использования

# 4. Проверка нагрузки
htop
# Критично: CPU < 80%, RAM < 85%

# 5. Проверка дашбордов
# - Grafana: https://grafana.1000fps.ru
# - Uptime: https://uptime.1000fps.ru
# - Sentry: https://sentry.io/organizations/1000fps
```

**Чек-лист:**

- [ ] Все сервисы в статусе `active (running)`
- [ ] Нет критичных ошибок в логах
- [ ] Свободно > 20% диска
- [ ] CPU < 70%, RAM < 80%
- [ ] Uptime 100% за ночь
- [ ] Нет алертов в Sentry

---

## 📊 Еженедельные операции

### Понедельник

```bash
# 1. Анализ метрик за неделю
# Grafana → Business Metrics → Weekly Report

# 2. Проверка бэкапов
ls -lh /backups/postgres/
# Проверить наличие ежедневных бэкапов

# 3. Анализ медленных запросов
sudo -u postgres psql -d 1000fps_prod -c \
  "SELECT query, calls, total_time, mean_time
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;"
```

### Среда

```bash
# 1. Обновление зависимостей (security patches)
cd /var/www/1000fps
pnpm audit
pnpm update --prod

# 2. Перезапуск сервисов (если были обновления)
sudo systemctl restart 1000fps-api
sudo systemctl restart 1000fps-storefront
```

### Пятница

```bash
# 1. Отчёт по заказам
sudo -u postgres psql -d 1000fps_prod -c \
  "SELECT
     DATE(created_at) as date,
     COUNT(*) as orders,
     SUM(total) as revenue
   FROM orders
   WHERE created_at >= NOW() - INTERVAL '7 days'
   GROUP BY DATE(created_at)
   ORDER BY date;"

# 2. Проверка очереди email
# Mailgun/SendGrid dashboard

# 3. Планирование работ на выходные
```

---

## 📅 Ежемесячные операции

### 1-е число

```bash
# 1. Инвентаризация ресурсов
# - S3 storage usage
# - Database size
# - Bandwidth usage

# 2. Финансовый отчёт
# - API costs (payments, SMS, email)
# - Infrastructure costs (servers, CDN)
# - Third-party services

# 3. Security scan
pnpm audit --production
docker scan 1000fps-api
docker scan 1000fps-storefront
```

### 15-е число

```bash
# 1. Ревизия пользователей
sudo -u postgres psql -d 1000fps_prod -c \
  "SELECT role, COUNT(*) as count
   FROM users
   GROUP BY role;"

# 2. Очистка старых данных
# - Корзины старше 30 дней
# - Сессии
# - Временные файлы

# 3. Проверка SSL сертификатов
sudo certbot certificates
# Обновить если < 30 дней до истечения
```

### 25-е число

```bash
# 1. Планирование релиза
# - Review открытых PR
# - Планирование фич на следующий месяц
# - Оценка технического долга

# 2. Обновление документации
# - Проверка актуальности runbook
# - Обновление диаграмм
# - Ревизия access control
```

---

## 📈 Мониторинг

### Критичные метрики

| Метрика              | Warning | Critical | Action              |
| -------------------- | ------- | -------- | ------------------- |
| CPU Usage            | > 70%   | > 90%    | Scale up / Optimize |
| RAM Usage            | > 80%   | > 95%    | Restart / Scale     |
| Disk Usage           | > 75%   | > 90%    | Cleanup / Expand    |
| Response Time (P95)  | > 2s    | > 5s     | Investigate         |
| Error Rate           | > 1%    | > 5%     | Hotfix              |
| Database Connections | > 80%   | > 95%    | Optimize queries    |
| Queue Size           | > 100   | > 500    | Scale workers       |

### Дашборды

**Grafana Dashboards:**

```
1. API Performance (ID: 1001)
   - RPS
   - P95/P99 latency
   - Error rate by endpoint
   - Status codes distribution

2. Business Metrics (ID: 1002)
   - Orders per hour/day
   - Revenue
   - Conversion rate
   - Cart abandonment rate

3. System Health (ID: 1003)
   - CPU/Memory/Disk
   - Network I/O
   - Process count
   - Open files

4. Database (ID: 1004)
   - Connections
   - Query performance
   - Locks
   - Replication lag

5. Redis (ID: 1005)
   - Memory usage
   - Hit rate
   - Keyspace
   - Operations/sec
```

### Алерты

**Настройка алертов (Prometheus):**

```yaml
# /etc/prometheus/alerts.yml

groups:
  - name: 1000fps-alerts
    rules:
      # API Down
      - alert: APIDown
        expr: up{job="api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "API down"
          description: "API instance {{ $labels.instance }} is down"

      # High Error Rate
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m])) 
          / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"

      # Database Disk Space
      - alert: DatabaseDiskSpaceLow
        expr: |
          (pg_database_size_bytes / pg_tablespace_size_bytes) > 0.85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Database disk space low"
          description: "Database is using {{ $value | humanizePercentage }} of tablespace"

      # High Memory Usage
      - alert: HighMemoryUsage
        expr: |
          (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) 
          / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"
```

**Каналы оповещения:**

| Severity | Канал                  | Время реакции | Эскалация          |
| -------- | ---------------------- | ------------- | ------------------ |
| Critical | Telegram + SMS + Phone | 15 мин        | 30 мин → CTO       |
| Warning  | Telegram               | 1 час         | 4 часа → Tech Lead |
| Info     | Email                  | 24 часа       | -                  |

---

## 🚨 Инциденты

### Классификация инцидентов

| Уровень | Описание  | Пример                                     | Время реакции |
| ------- | --------- | ------------------------------------------ | ------------- |
| P0      | Критичный | Сайт недоступен, потеря данных             | 15 мин        |
| P1      | Высокий   | Оформление заказов не работает             | 30 мин        |
| P2      | Средний   | Замедление работы, частичная недоступность | 2 часа        |
| P3      | Низкий    | Косметические проблемы, отдельные функции  | 24 часа       |

### Процесс реагирования

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Detection  │────▶│  Response   │────▶│  Resolution │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  - Alerts   │     │  - Triage   │     │  - Fix      │
│  - Reports  │     │  - Assign   │     │  - Deploy   │
│  - Monitoring│    │  - Comms    │     │  - Verify   │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Playbook для типовых инцидентов

#### P0: Сайт недоступен

```bash
# 1. Проверка статуса
curl -I https://1000fps.ru
ping 1000fps.ru

# 2. Проверка сервисов
sudo systemctl status nginx
sudo systemctl status 1000fps-storefront
sudo systemctl status 1000fps-api

# 3. Проверка логов
sudo tail -f /var/log/nginx/error.log
sudo journalctl -u 1000fps-storefront -f

# 4. Быстрое восстановление
sudo systemctl restart nginx
sudo systemctl restart 1000fps-storefront

# 5. Если не помогло — rollback
cd /var/www/1000fps
git revert HEAD
sudo systemctl restart 1000fps-storefront

# 6. Коммуникация
# - Обновить статус на status.1000fps.ru
# - Сообщение в Telegram канал
# - Email клиентам (если > 30 мин)
```

#### P1: Платежи не работают

```bash
# 1. Проверка логов платежного шлюза
sudo journalctl -u 1000fps-api -f | grep payment

# 2. Проверка подключения к платежному API
curl -X GET https://payment-gateway.ru/api/health

# 3. Проверка webhook'ов
# Payment dashboard → Webhooks → Recent events

# 4. Тестовый платеж
# Admin → Orders → Create test order → Pay

# 5. Если проблема на стороне шлюза
# - Переключиться на резервный шлюз
# - Временно включить оплату при получении

# 6. Коммуникация
# - Сообщение на сайте
# - Email клиентам с незавершёнными заказами
```

#### P2: Медленная загрузка

```bash
# 1. Проверка производительности
curl -w "@curl-format.txt" -o /dev/null -s https://1000fps.ru
# curl-format.txt:
# time_namelookup:  %{time_namelookup}\n
# time_connect:     %{time_connect}\n
# time_starttransfer: %{time_starttransfer}\n
# time_total:       %{time_total}\n

# 2. Проверка кэша
redis-cli INFO stats
# Проверить hit rate

# 3. Проверка медленных запросов
sudo -u postgres psql -d 1000fps_prod -c \
  "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# 4. Проверка CDN
# Cloudflare dashboard → Analytics → Performance

# 5. Временные меры
# - Включить полный кэш
# - Отключить тяжёлые функции
```

### Post-Mortem шаблон

```markdown
# Post-Mortem: [Название инцидента]

## Информация

- **Дата:** YYYY-MM-DD
- **Время:** HH:MM - HH:MM (UTC)
- **Уровень:** P0/P1/P2/P3
- **Сервисы:** [Список затронутых сервисов]

## Резюме

Краткое описание инцидента (2-3 предложения)

## Хронология

| Время | Событие                     |
| ----- | --------------------------- |
| HH:MM | Обнаружен инцидент          |
| HH:MM | Начата работа над решением  |
| HH:MM | Внедрён фикс                |
| HH:MM | Подтверждено восстановление |

## Влияние

- **Пользователи:** X% затронуты
- **Заказы:** X потеряно / отложено
- **Выручка:** ~X руб. потеряно
- **Репутация:** [Оценка]

## Root Cause

Подробное описание причины

## Решение

Описание применённого решения

## Preventive Measures

| Действие              | Ответственный | Срок     | Статус |
| --------------------- | ------------- | -------- | ------ |
| Добавить мониторинг   | @dev1         | 2 недели | TODO   |
| Обновить документацию | @dev2         | 1 неделя | TODO   |
| Добавить тесты        | @dev3         | 2 недели | TODO   |

## Lessons Learned

- Что сработало хорошо
- Что можно улучшить
- Какие процессы нужно изменить
```

---

## 📞 Контакты

### Команда

| Роль      | Имя           | Telegram        | Телефон          |
| --------- | ------------- | --------------- | ---------------- |
| CTO       | Иван Петров   | @ivan_cto       | +7-XXX-XXX-XX-XX |
| Tech Lead | Анна Сидорова | @anna_tl        | +7-XXX-XXX-XX-XX |
| DevOps    | Михаил Козлов | @mikhail_devops | +7-XXX-XXX-XX-XX |
| On-call   | Дежурный      | @1000fps_oncall | -                |

### Экстренные контакты

| Служба               | Контакт                | Доступ         |
| -------------------- | ---------------------- | -------------- |
| Хостинг              | support@hosting.ru     | Тикет, телефон |
| Доменный регистратор | support@registrar.ru   | Тикет          |
| Платежный шлюз       | api-support@payment.ru | Email, телефон |
| CDN (Cloudflare)     | support@cloudflare.com | Тикет          |

### Каналы коммуникации

- **Telegram (внутренний):** @1000fps_team
- **Telegram (статусы):** @1000fps_status
- **Email (экстренно):** emergency@1000fps.ru
- **Email (техподдержка):** support@1000fps.ru

---

## 🔐 Access Control

### Уровни доступа

| Уровень | Доступ                           | Кто имеет           |
| ------- | -------------------------------- | ------------------- |
| L1      | Read-only логи, дашборды         | Все разработчики    |
| L2      | Restart сервисов, деплой staging | Senior разработчики |
| L3      | Production деплой, БД read       | Tech Lead, DevOps   |
| L4      | Полный доступ, secrets           | CTO, CEO            |

### Получение доступа

```bash
# Запрос доступа через IT-портал
# 1. Выбрать уровень доступа
# 2. Указать обоснование
# 3. Получить approval от руководителя
# 4. Доступ выдаётся на 90 дней
# 5. Требуется продление
```

---

## 📚 Ресурсы

### Документация

- [Architecture](./ARCHITECTURE.md)
- [API](./API.md)
- [Database](./DATABASE.md)
- [Deployment](./DEPLOYMENT.md)
- [Incidents](./INCIDENTS.md)

### Внешние ресурсы

- Grafana: https://grafana.1000fps.ru
- Sentry: https://sentry.io/organizations/1000fps
- Uptime: https://uptime.1000fps.ru
- Status Page: https://status.1000fps.ru

---

_Версия: 1.0.0 | Последнее обновление: Март 2026_
