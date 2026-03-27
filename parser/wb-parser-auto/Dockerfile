# Dockerfile для Python парсера
FROM python:3.11-slim

# Установка зависимостей для Playwright
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копирование requirements и установка зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Установка браузеров Playwright
RUN playwright install chromium

# Копирование исходников
COPY . .

# Создание директорий
RUN mkdir -p /app/logs /app/chrome_profile

# Порт для health check
EXPOSE 8080

# Запуск парсера
CMD ["python", "parser.py"]
