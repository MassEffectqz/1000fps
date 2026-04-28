# WB Parser Auto - Автозапуск расширения с Telegram интеграцией

Автоматический парсинг цен Wildberries при добавлении товаров через Telegram бота.

## 📦 Установка

### 1. Установка зависимостей

```bash
cd wb-parser-auto
pip install -r requirements.txt
```

### 2. Установка браузеров Playwright

```bash
playwright install chromium
```

## 🚀 Запуск

### Обычный запуск

```bash
python parser.py
```

### Через .bat (Windows)

```bash
run.bat
```

## 🔄 Как работает

### 1. Добавление товара через Telegram

```
Вы: /add 123456
Бот: ✅ Товар 123456 добавлен (ожидает проверки через расширение)
```

### 2. Worker отправляет webhook на Python скрипт

```
Worker → http://localhost:8080/webhook
{
  "action": "price_add",
  "product": {"article": "123456", ...}
}
```

### 3. Python скрипт запускает Chrome с расширением

```
→ Запуск Chrome с расширением
→ Открытие wildberries.ru
→ Расширение парсит цену через WB API
→ Отправка цены на Worker
→ Worker шлёт уведомление в Telegram
```

### 4. Периодическая проверка

Каждые 30 минут скрипт проверяет товары без цен и обновляет их.

## 📊 Архитектура

```
Telegram → Worker → Python Parser → Chrome + Extension → Worker → Telegram
   ↑                                         │
   └─────────────────────────────────────────┘
              Уведомления о ценах
```

## ⚙️ Настройка

### Изменение интервала проверки

В `parser.py`:
```python
CHECK_INTERVAL = 1800  # 30 минут
```

### Отключение headless режима

Для отладки:
```python
browser = await p.chromium.launch_persistent_context(
    ...
    headless=False,  # Показывать браузер
)
```

### Смена порта webhook

В `parser.py`:
```python
WEBHOOK_PORT = 8080  # Порт для webhook
```

## 🔧 Автозапуск

### Windows Task Scheduler

1. Откройте Task Scheduler
2. Create Basic Task
3. Trigger: At startup
4. Action: Start a program
   - Program: `python`
   - Arguments: `C:\path\to\parser.py`
   - Start in: `C:\path\to\wb-parser-auto`

### Windows Service (NSSM)

```bash
# Установите NSSM
nssm install WBParser python C:\path\to\wb-parser-auto\parser.py
nssm start WBParser
```

### Linux (systemd)

```ini
# /etc/systemd/system/wb-parser.service
[Unit]
Description=WB Price Parser
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/wb-parser-auto
ExecStart=/usr/bin/python3 /path/to/wb-parser-auto/parser.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable wb-parser
sudo systemctl start wb-parser
```

## 📁 Структура

```
wb-parser-auto/
├── parser.py           # Основной скрипт + web сервер
├── requirements.txt    # Зависимости
├── logging.conf        # Конфигурация логирования
├── README.md          # Документация
├── run.bat            # Ярлык для запуска
├── logs/              # Логи (создаётся)
│   ├── parser.log     # Общий лог
│   └── error.log      # Только ошибки
└── chrome_profile/    # Профиль Chrome (создаётся)
```

## 📊 Логирование

### Файлы логов

- `logs/parser.log` — все события (ротация 10MB, 5 файлов)
- `logs/error.log` — только ошибки (ротация 10MB, 5 файлов)

### Формат логов

```
00:54:56 | INFO     | WB Parser Auto - Telegram + Chrome Extension
00:54:56 | INFO     | Webhook порт: 8080
00:54:56 | INFO     | ✅ Расширение найдено
00:55:01 | INFO     | webhook | Webhook: pending_check - 420299592
00:55:01 | INFO     | 📥 Pending товар: 420299592
00:55:01 | INFO     | 🆕 Новый товар: 420299592
00:55:02 | INFO     | parser | Запуск парсера для 1 товаров: ['420299592']
00:55:02 | INFO     | parser | Открытие wildberries.ru...
00:55:32 | INFO     | parser | ✅ Проверка завершена
00:55:33 | INFO     | ✅ Цена получена: 420299592 = 3874 ₽
```

### Просмотр логов

**Windows:**
```bash
# Последние 50 строк
Get-Content logs\parser.log -Tail 50

# Следить в реальном времени
Get-Content logs\parser.log -Wait

# Только ошибки
Get-Content logs\error.log -Tail 50
```

**Linux/Mac:**
```bash
tail -f logs/parser.log
tail -f logs/error.log
```

## 🎯 Команды

### Telegram

- `/add <артикул>` — Добавить товар
- `/list` — Список товаров
- `/stats` — Статистика
- `/chart <артикул>` — График цены

### Webhook

- `POST /webhook` — Получить данные от Worker
- `GET /health` — Проверка статуса

## ⚠️ Важно

1. **Скрипт должен работать постоянно** — для мгновенной проверки
2. **Порт 8080 должен быть свободен** — для webhook
3. **Расширение должно быть** в папке `wb-interceptor`
4. **Первый запуск** создаст профиль Chrome (может занять время)

## 🐛 Troubleshooting

### "Port 8080 is already in use"

```bash
# Найдите процесс
netstat -ano | findstr :8080

# Убейте процесс
taskkill /F /PID <PID>
```

### "Extension not found"

Проверьте путь в `parser.py`:
```python
EXTENSION_PATH = Path(__file__).parent.parent / 'wb-interceptor'
```

### Chrome не запускается

Установите браузеры:
```bash
playwright install chromium
```

## 📊 Логи

Скрипт выводит:
- Время получения webhook
- Логи расширения (1000fps)
- Ошибки парсинга
- Статус проверки
