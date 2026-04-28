@echo off
echo WB Parser Auto - Запуск
echo =======================
echo.

cd /d "%~dp0"

python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python не найден! Установите Python 3.8+
    pause
    exit /b 1
)

python parser.py

pause
