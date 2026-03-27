# WB Parser Auto - Автопарсинг цен Wildberries

Автоматическая проверка цен Wildberries с использованием расширения Chrome.

## 📦 Установка

```bash
cd wb-parser-auto
pip install -r requirements.txt
playwright install chromium
```

## 🚀 Запуск

```bash
python parser.py
```

Или через `.bat` (Windows):

```bash
run.bat
```

## 🔄 Как работает

1. Скрипт запускает Chrome с расширением `wb-interceptor`
2. Открывается wildberries.ru
3. Расширение парсит цены через WB API
4. Каждые 30 минут происходит автоматическая проверка

## ⚙️ Настройка

### Переменные окружения

```bash
WORKER_URL=http://localhost:3002      # URL сервера с данными
CHECK_INTERVAL=1800                   # Интервал проверки (сек)
WEBHOOK_PORT=8080                     # Порт health check
EXTENSION_PATH=/path/to/wb-interceptor # Путь к расширению
```

### Изменение интервала проверки

В `parser.py`:

```python
CHECK_INTERVAL = int(os.environ.get('CHECK_INTERVAL', '1800'))  # 30 минут
```

## 📁 Структура

```
wb-parser-auto/
├── parser.py           # Основной скрипт
├── requirements.txt    # Зависимости
├── README.md          # Документация
├── run.bat            # Ярлык для Windows
├── logs/              # Логи
│   ├── parser.log
│   └── error.log
└── chrome_profile/    # Профиль Chrome
```

## 🐛 Troubleshooting

### "Port 8080 is already in use"

```bash
netstat -ano | findstr :8080
taskkill /F /PID <PID>
```

### "Extension not found"

Проверьте путь в `EXTENSION_PATH`

### Chrome не запускается

```bash
playwright install chromium
```
