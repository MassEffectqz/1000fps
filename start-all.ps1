# ============================================================
# Скрипт запуска всех сервисов 1000fps
# Для Windows PowerShell
# ============================================================

Write-Host "
╔═══════════════════════════════════════════════════════════╗
║         1000fps - Запуск всех сервисов                    ║
╠═══════════════════════════════════════════════════════════╣
║  • Next.js App      → http://localhost:3000               ║
║  • Parser           → http://localhost:3005               ║
║  • Parser UI        → http://localhost:3006               ║
║  • Redis Commander  → http://localhost:8081               ║
║  • PostgreSQL       → localhost:5432                      ║
║  • Redis            → localhost:6379                      ║
╚═══════════════════════════════════════════════════════════╝
" -ForegroundColor Green

# Проверка Docker
$dockerAvailable = $false
try {
    docker info | Out-Null
    $dockerAvailable = $true
} catch {
    Write-Host "[!] Docker недоступен. Пропускаем docker compose." -ForegroundColor Yellow
}

if ($dockerAvailable) {
    Write-Host "[1/2] Проверка Docker..." -ForegroundColor Cyan
    Write-Host "[✓] Docker доступен" -ForegroundColor Green
    
    $useDocker = Read-Host "Использовать Docker Compose? (y/n)"
    
    if ($useDocker -eq 'y' -or $useDocker -eq 'Y' -or $useDocker -eq '') {
        Write-Host "[2/2] Запуск docker compose..." -ForegroundColor Cyan
        docker compose up -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n[✓] Все сервисы запущены!" -ForegroundColor Green
            Write-Host "`nКоманды для управления:" -ForegroundColor Cyan
            Write-Host "  docker compose logs -f     # Просмотр логов" -ForegroundColor Gray
            Write-Host "  docker compose down        # Остановка" -ForegroundColor Gray
            exit 0
        } else {
            Write-Host "`n[!] Ошибка запуска Docker Compose" -ForegroundColor Red
            Write-Host "Пробуем локальный запуск..." -ForegroundColor Yellow
        }
    }
}

# Локальный запуск без Docker
Write-Host "`n[1/3] Проверка зависимостей..." -ForegroundColor Cyan

if (-not (Test-Path "node_modules")) {
    Write-Host "[!] node_modules не найден. Запуск npm install..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "parser\node_modules")) {
    Write-Host "[!] parser/node_modules не найден. Запуск npm install..." -ForegroundColor Yellow
    Set-Location parser
    npm install
    Set-Location ..
}

if (-not (Test-Path "parser\ui\node_modules")) {
    Write-Host "[!] parser/ui/node_modules не найден. Запуск npm install..." -ForegroundColor Yellow
    Set-Location parser\ui
    npm install
    Set-Location ..\..
}

Write-Host "`n[2/3] Проверка PostgreSQL..." -ForegroundColor Cyan
Write-Host "[!] Убедитесь, что PostgreSQL запущен на порту 5432" -ForegroundColor Yellow
Write-Host "    Или используйте Docker: docker compose up -d postgres" -ForegroundColor Gray

Write-Host "`n[3/3] Запуск сервисов..." -ForegroundColor Cyan

# Запуск Next.js
Write-Host "`n  → Запуск Next.js App (порт 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

# Запуск Parser Server
Write-Host "  → Запуск Parser Server (порт 3005)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location parser; npm start"

# Запуск Parser UI
Write-Host "  → Запуск Parser UI (порт 3006)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location parser\ui; npm start"

Start-Sleep -Seconds 2

Write-Host "`n[✓] Все сервисы запущены в отдельных окнах PowerShell!" -ForegroundColor Green
Write-Host "`nОткройте в браузере:" -ForegroundColor Cyan
Write-Host "  • Next.js App  → http://localhost:3000" -ForegroundColor Gray
Write-Host "  • Parser       → http://localhost:3005" -ForegroundColor Gray
Write-Host "  • Parser UI    → http://localhost:3006" -ForegroundColor Gray
Write-Host "`nДля остановки закройте окна PowerShell" -ForegroundColor Yellow
