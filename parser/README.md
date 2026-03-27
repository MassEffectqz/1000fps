# 📦 Parser Service

Сервис автоматического парсинга товаров для 1000FPS

## 📁 Структура

```
parser/
├── src/
│   ├── index.js          # Главный файл запуска
│   ├── parse.js          # Скрипт парсинга
│   ├── services/
│   │   ├── wb-parser.js  # Wildberries парсер
│   │   └── importer.js   # Импорт в БД
│   └── utils/
│       └── logger.js     # Логирование
├── package.json
└── README.md
```

## 🚀 Интеграция с site-1000fps

### 1. Установка зависимостей

```bash
cd parser
pnpm install
```

### 2. Настройка .env

```bash
# Parser Service
PARSER_ENABLED=true
PARSER_INTERVAL_MINUTES=60
PARSER_MAX_CONCURRENT=5
PARSER_TIMEOUT_MS=30000

# Database (для импорта товаров)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/site-1000fps?schema=public"
```

### 3. Запуск

```bash
# Development
pnpm dev

# Одноразовый запуск парсинга
pnpm run:parse

# Production
pnpm start
```

## 🔧 Использование существующего парсера

### Интеграция wb-parser-auto

Python скрипт из `wb-parser-auto/parser.py` можно использовать как внешний парсер:

```bash
# Запуск Python парсера
cd parser/wb-parser-auto
pip install -r requirements.txt
playwright install chromium
python parser.py
```

### Интеграция wb-interceptor

Chrome расширение для ручного добавления товаров:

1. Установите расширение из `wb-interceptor`
2. Настройте Backend URL на `http://localhost:3003`
3. Товары будут сохраняться через API парсера

## 📡 API Endpoints

| Метод | Endpoint  | Описание           |
| ----- | --------- | ------------------ |
| POST  | `/parse`  | Запустить парсинг  |
| GET   | `/status` | Статус парсера     |
| POST  | `/import` | Импорт товара в БД |
| GET   | `/logs`   | Логи парсера       |

## 🔄 Архитектура

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  wb-interceptor │────▶│  Parser API  │────▶│  site-1000fps   │
│  (Chrome Ext)   │     │  (Node.js)   │     │  Database       │
└─────────────────┘     └──────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌──────────────┐
                        │ wb-parser-   │
                        │ auto (Python)│
                        └──────────────┘
```

## 📊 Импорт товаров

### Формат данных

```json
{
  "article": "12345678",
  "name": "Товар",
  "brand": "Бренд",
  "price": 1999,
  "originalPrice": 2999,
  "category": "Видеокарты",
  "description": "Описание",
  "images": ["url1", "url2"],
  "specifications": {
    "key": "value"
  },
  "url": "https://www.wildberries.ru/..."
}
```

### Маппинг в БД site-1000fps

| Поле парсера   | Таблица БД     | Поле БД                  |
| -------------- | -------------- | ------------------------ |
| article        | products       | sku                      |
| name           | products       | name                     |
| brand          | brands         | name (создать если нет)  |
| price          | products       | price                    |
| originalPrice  | products       | oldPrice                 |
| category       | categories     | slug (найти по названию) |
| images         | product_images | url                      |
| specifications | products       | specifications (JSON)    |

## 🐛 Troubleshooting

### Товары не импортируются

1. Проверьте подключение к БД
2. Убедитесь, что Prisma Client сгенерирован
3. Проверьте логи: `pnpm dev`

### Playwright ошибки

```bash
playwright install chromium
```

---

**Версия:** 1.0.0
