@echo off
echo =====================================================
echo WB Price Tracker - Auto Start
echo =====================================================
echo.

echo [1/3] Запуск локального сервера...
start cmd /k "cd /d %~dp0 && node server.js"
timeout /t 2 /nobreak >nul

echo [2/3] Запуск Cloudflare туннеля...
start cmd /k "cloudflared tunnel --url http://localhost:3000"
timeout /t 5 /nobreak >nul

echo [3/3] Настройка Telegram webhook...
echo.
echo ОТКРОЙТЕ ОКНО CLOUDFLARE И СКОПИРУЙТЕ URL
echo (выглядит как: https://xxxx-xxxx-xxxx.ngrok-free.app)
echo.
echo Затем отредактируйте setup-webhook.js и замените URL
echo После чего выполните: node setup-webhook.js
echo.
echo =====================================================
echo Готово! Проверьте http://localhost:3000/health
echo =====================================================
pause
