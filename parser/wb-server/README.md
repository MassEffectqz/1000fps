# WB Price Tracker - Локальный сервер с Telegram ботом

Полноценная замена Cloudflare Worker для работы с Telegram ботом.

## Архитектура

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Telegram Bot  │────▶│    ngrok     │────▶│  server.js:3000 │
│  (команды пользователя) │  (туннель)   │     │  (локальный сервер)│
└─────────────────┘     └──────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│ Chrome Extension│────▶│ localhost:3000│◀────│  wb_data.json   │
│  (проверка цен)  │     │  (webhook)   │     │  (хранилище)    │
└─────────────────┘     └──────────────┘     └─────────────────┘
```

## Быстрый старт

### 1. Запустить локальный сервер

```bash
cd wb-server
node server.js
```

Сервер запустится на порту **3000**.

### 2. Запустить ngrok туннель

```bash
ngrok http 3000
```

Скопируйте публичный URL из консоли (например: `https://abc123.ngrok-free.app`)

### 3. Настроить Telegram webhook

Отредактируйте `setup-webhook.js`, замените URL на ваш ngrok:

```javascript
const NGROK_URL = 'https://abc123.ngrok-free.app'; // ваш URL из шага 2
```

Запустите:

```bash
node setup-webhook.js
```

### 4. Перезагрузить расширение

1. Откройте `chrome://extensions/`
2. Нажмите ↻ на "1000fps WB Парсер"

## Команды Telegram бота

| Команда | Описание |
|---------|----------|
| `/start` | Справка по всем командам |
| `/add 12345` | Добавить товар по артикулу |
| `/list` | Список всех товаров |
| `/list compact` | Краткий список |
| `/remove 12345` | Удалить товар |
| `/stats` | Статистика |
| `/chart 12345` | График цены |
| `/interval 30` | Интервал проверки (мин) |
| `/export` | Экспорт данных JSON |
| `/admins` | Список администраторов |
| `/chats` | Чаты для уведомлений |

## Проверка работы

### 1. Проверить сервер

```bash
curl http://localhost:3000/health
```

Ответ: `{"status":"ok","products":N}`

### 2. Проверить ngrok

Откройте в браузере: `http://127.0.0.1:4040`

### 3. Проверить webhook

```bash
node setup-webhook.js
```

### 4. Добавить товар

**Через расширение:**
1. Откройте WB
2. Нажмите на иконку расширения
3. Введите артикул → Добавить

**Через Telegram:**
1. Напишите боту: `/add 12345678`
2. Бот ответит с подтверждением

## Хранение данных

Все данные сохраняются в `wb-server/wb_data.json`:
- Товары
- История цен
- Конфигурация (админы, чаты, интервалы)
- Напоминания

## Логи

### Сервер (консоль где запущен node)
```
📥 POST /webhook: {"action":"price_add",...}
✓ Товар 12345 сохранён
✓ Уведомление отправлено в Telegram
```

### ngrok (консоль где запущен ngrok)
```
tunnel established at https://abc123.ngrok-free.app
```

### Расширение (консоль DevTools)
```
[1000fps] sendToTelegram: action=price_add, article=12345
[1000fps] sendToTelegram: отправлено на сервер
```

## Решение проблем

### "Receiving end does not exist"
Перезагрузите расширение в `chrome://extensions/`

### ngrok не подключается (аутентификация)
1. Зарегистрируйтесь на https://ngrok.com/signup
2. Скопируйте токен из https://dashboard.ngrok.com/get-started/your-authtoken
3. Добавьте токен: `ngrok config add-authtoken ВАШ_ТОКЕН`

### Бот не отвечает
1. Проверьте webhook: `node setup-webhook.js`
2. Убедитесь, что сервер запущен
3. Проверьте ngrok статус на http://127.0.0.1:4040

### ngrok-free.app не работает
Некоторые провайдеры блокируют домен ngrok-free.app. Используйте платный тариф ngrok или альтернативы (ngrok.io, localtunnel).

## Автоматический запуск

Создайте `start.bat`:

```batch
@echo off
start cmd /k "cd wb-server && node server.js"
timeout /t 2 /nobreak >nul
start cmd /k "ngrok http 3000"
echo Сервер запущен!
echo Откройте http://127.0.0.1:4040 для мониторинга
pause
```

## API Endpoints

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/health` | GET | Статус сервера |
| `/webhook` | POST | Webhook от расширения |
| `/telegram` | POST | Webhook от Telegram |
| `/api/products` | GET | Список товаров |
| `/api/config` | GET | Конфигурация |
