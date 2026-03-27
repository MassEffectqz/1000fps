@echo off
echo =====================================================
echo WB Price Tracker - Auto Start
echo =====================================================
echo.

echo [1/2] Запуск локального сервера...
start cmd /k "cd /d %~dp0 && node server.js"
timeout /t 2 /nobreak >nul

echo [2/2] Запуск автопарсера...
start cmd /k "cd /d %~dp0..\wb-parser-auto && python parser.py"
timeout /t 2 /nobreak >nul

echo =====================================================
echo Готово!
echo Сервер: http://localhost:3000
echo Автопарсер: http://localhost:8080/health
echo =====================================================
pause
