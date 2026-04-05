#!/bin/bash

# ============================================================
# Скрипт запуска всех сервисов 1000fps
# Для Linux/MacOS
# ============================================================

echo "
╔═══════════════════════════════════════════════════════════╗
║         1000fps - Запуск всех сервисов                    ║
╠═══════════════════════════════════════════════════════════╣
║  • Next.js App  → http://localhost:3000                   ║
║  • Parser       → http://localhost:3005                   ║
║  • Parser UI    → http://localhost:3006                   ║
║  • PostgreSQL   → localhost:5432                          ║
╚═══════════════════════════════════════════════════════════╝
"

# Проверка Docker
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo "[✓] Docker доступен"
    read -p "Использовать Docker Compose? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
        echo "[→] Запуск docker compose..."
        docker compose up -d
        
        if [ $? -eq 0 ]; then
            echo -e "\n[✓] Все сервисы запущены!"
            echo -e "\nКоманды для управления:"
            echo "  docker compose logs -f     # Просмотр логов"
            echo "  docker compose down        # Остановка"
            exit 0
        else
            echo -e "\n[!] Ошибка запуска Docker Compose"
            echo "Пробуем локальный запуск..."
        fi
    fi
fi

# Локальный запуск
echo -e "\n[1/3] Проверка зависимостей..."

if [ ! -d "node_modules" ]; then
    echo "[!] node_modules не найден. Запуск npm install..."
    npm install
fi

if [ ! -d "parser/node_modules" ]; then
    echo "[!] parser/node_modules не найден. Запуск npm install..."
    cd parser && npm install && cd ..
fi

if [ ! -d "parser/ui/node_modules" ]; then
    echo "[!] parser/ui/node_modules не найден. Запуск npm install..."
    cd parser/ui && npm install && cd ../..
fi

echo -e "\n[2/3] Проверка PostgreSQL..."
echo "[!] Убедитесь, что PostgreSQL запущен на порту 5432"

echo -e "\n[3/3] Запуск сервисов..."

# Запуск Next.js
echo "  → Запуск Next.js App (порт 3000)..."
npm run dev &

# Запуск Parser Server
echo "  → Запуск Parser Server (порт 3005)..."
cd parser && npm start &
cd ..

# Запуск Parser UI
echo "  → Запуск Parser UI (порт 3006)..."
cd parser/ui && npm start &
cd ../..

echo -e "\n[✓] Все сервисы запущены!"
echo -e "\nОткройте в браузере:"
echo "  • Next.js App  → http://localhost:3000"
echo "  • Parser       → http://localhost:3005"
echo "  • Parser UI    → http://localhost:3006"
echo -e "\nДля остановки: Ctrl+C"

wait
