# WB Server - Локальный сервер для WB Price Tracker

Сервер для хранения данных и предоставления API расширению Chrome.

## 🚀 Запуск

```bash
node server.js
```

Или через `.bat` (Windows):

```bash
start.bat
```

## 📡 API Endpoints

| Метод  | Endpoint                 | Описание                   |
| ------ | ------------------------ | -------------------------- |
| GET    | `/api/products`          | Список всех товаров        |
| GET    | `/api/products/:article` | Товар по артикулу          |
| GET    | `/api/stats`             | Статистика                 |
| GET    | `/api/logs`              | История изменений цен      |
| POST   | `/webhook`               | Webhook для расширения     |
| DELETE | `/api/products/:article` | Удалить товар              |
| GET    | `/api/config`            | Конфигурация               |
| POST   | `/api/config/interval`   | Изменить интервал проверки |

## 🔗 Интеграция с расширением

В настройках расширения укажите:

```
Backend URL: http://localhost:3000
```

## 🔄 Архитектура

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Chrome         │────▶│  wb-server   │◀────│  wb-parser-auto │
│  Extension      │     │  (Node.js)   │     │  (Python)       │
└─────────────────┘     └──────────────┘     └─────────────────┘
```

## ⚙️ Конфигурация

### Переменные окружения

```bash
PORT=3000                     # Порт сервера
PYTHON_PARSER_URL=http://localhost:8080
DEFAULT_CHECK_INTERVAL=120    # Интервал проверки (мин)
```

## 📁 Структура

```
wb-server/
├── server.js         # Основной сервер
├── package.json      # Зависимости
├── start.bat         # Ярлык для Windows
├── wb_data.json      # База данных (создаётся)
└── README.md         # Документация
```

## 📊 Формат данных

Товар хранится в формате:

```json
{
  "article": "123456",
  "name": "Товар",
  "brand": "Бренд",
  "price": 1000,
  "originalPrice": 1500,
  "rating": 4.5,
  "feedbacks": 100,
  "url": "https://wildberries.ru/catalog/123456/detail.aspx",
  "checkedAt": "2024-01-01T00:00:00.000Z",
  "stockQuantity": 10,
  "deliveryMin": 2,
  "deliveryMax": 4,
  "outOfStock": false,
  "history": [
    { "ts": 1704067200000, "price": 1000 },
    { "ts": 1704153600000, "price": 950 }
  ],
  "addedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🐛 Troubleshooting

### "Port 3000 is already in use"

```bash
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

### "wb_data.json not found"

Файл создаётся автоматически при первом запуске.
