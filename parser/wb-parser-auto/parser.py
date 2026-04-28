#!/usr/bin/env python3
"""
WB Price Parser - Автозапуск расширения Chrome для парсинга цен
Слушает Telegram бота и автоматически проверяет цены при добавлении товаров
"""

import asyncio
import json
import os
import sys
import logging
from pathlib import Path
from datetime import datetime
from playwright.async_api import async_playwright
from aiohttp import web
import aiohttp

# ===== LOGGING CONFIGURATION =====

# Создаём папку для логов
LOG_DIR = Path(__file__).parent / 'logs'
LOG_DIR.mkdir(parents=True, exist_ok=True)

# Формат логов
LOG_FORMAT = '%(asctime)s | %(levelname)-8s | %(message)s'
DATE_FORMAT = '%H:%M:%S'

# Настройка logging
logging.basicConfig(
    level=logging.INFO,
    format=LOG_FORMAT,
    datefmt=DATE_FORMAT,
    handlers=[
        # Console handler
        logging.StreamHandler(sys.stdout),
        # File handler (общий лог)
        logging.FileHandler(LOG_DIR / 'parser.log', encoding='utf-8'),
        # Error file handler
        logging.FileHandler(LOG_DIR / 'error.log', encoding='utf-8')
    ]
)

# Отдельный logger для ошибок
error_logger = logging.getLogger('error')
error_logger.setLevel(logging.ERROR)

# Logger для webhook
webhook_logger = logging.getLogger('webhook')
webhook_logger.setLevel(logging.INFO)

# Logger для парсинга
parser_logger = logging.getLogger('parser')
parser_logger.setLevel(logging.INFO)

logger = logging.getLogger(__name__)

# Конфигурация
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '8346542644:AAG3QY4uNVL7h21dlulFsZZLcdIegWfFQb8')
WORKER_URL = os.environ.get('WORKER_URL', 'http://host.docker.internal:3002')  # Локальный сервер вместо Cloudflare Worker
EXTENSION_PATH = Path(os.environ.get('EXTENSION_PATH', '/app/wb-server'))
CHECK_INTERVAL = int(os.environ.get('CHECK_INTERVAL', '1800'))  # 30 минут (в секундах)
POLL_INTERVAL = int(os.environ.get('POLL_INTERVAL', '60'))  # 1 минута (опрос pending товаров)
WEBHOOK_PORT = int(os.environ.get('WEBHOOK_PORT', '8080'))  # Порт для health check

# Путь к расширению (из переменной окружения или по умолчанию)
EXTENSION_PATH = Path(os.environ.get('EXTENSION_PATH', '/app/wb-interceptor'))

# Путь к профилю Chrome (для сохранения сессии)
CHROME_PROFILE = Path(__file__).parent / 'chrome_profile'


async def parse_wb_prices(articles):
    """Парсинг цен для списка товаров через Chrome с расширением"""
    
    parser_logger.info(f"Запуск парсера для {len(articles)} товаров: {articles}")
    
    async with async_playwright() as p:
        # Запускаем Chrome с расширением
        browser = await p.chromium.launch_persistent_context(
            user_data_dir=str(CHROME_PROFILE),
            headless=True,
            args=[
                f'--disable-extensions-except={EXTENSION_PATH}',
                f'--load-extension={EXTENSION_PATH}',
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
            ]
        )
        
        page = await browser.new_page()
        
        try:
            # Открываем WB - расширение начнёт работать
            parser_logger.info("Открытие wildberries.ru...")
            await page.goto('https://www.wildberries.ru/', timeout=30000)
            
            # Ждём пока расширение проверит цены
            parser_logger.info("Ожидание проверки цен (30 сек)...")
            await asyncio.sleep(30)
            
            # Собираем логи
            logs = []
            page.on('console', lambda msg: logs.append(f"[{msg.type}] {msg.text}"))
            
            # Выводим логи расширения
            extension_logs = [l for l in logs if '1000fps' in l]
            if extension_logs:
                parser_logger.info(f"Логи расширения ({len(extension_logs)}):")
                for log in extension_logs[-10:]:
                    parser_logger.debug(f"  {log}")
            
            parser_logger.info("✅ Проверка завершена")
            
            # Уведомляем что проверка завершена (даже если нет изменений)
            async with aiohttp.ClientSession() as session:
                try:
                    await session.post(
                        f'{WORKER_URL}/webhook',
                        json={'action': 'parser_check_complete', 'count': len(articles)}
                    )
                except:
                    pass
            
        except Exception as e:
            parser_logger.error(f"Ошибка парсинга: {e}")
            error_logger.exception("Parse error details")
        
        finally:
            await browser.close()


# ===== POLLING =====
# Опрос pending товаров реализован в poll_pending()


# ===== HEALTH CHECK =====

async def health_handler(request):
    """Health check"""
    return web.json_response({
        'status': 'ok',
        'time': datetime.now().isoformat()
    })


async def start_background_tasks(app):
    """Фоновые задачи"""
    app['poll_task'] = asyncio.create_task(poll_pending(app))
    app['check_task'] = asyncio.create_task(periodic_check(app))


async def stop_background_tasks(app):
    """Остановка задач"""
    app['poll_task'].cancel()
    app['check_task'].cancel()
    try:
        await app['poll_task']
    except asyncio.CancelledError:
        pass
    try:
        await app['check_task']
    except asyncio.CancelledError:
        pass


async def poll_pending(app):
    """Опрос pending товаров каждые 5 секунд"""
    
    last_pending = set()
    
    while True:
        await asyncio.sleep(POLL_INTERVAL)
        
        # Проверяем есть ли новые pending товары
        async with aiohttp.ClientSession() as session:
            try:
                response = await session.get(f'{WORKER_URL}/api/products')
                if response.ok:
                    result = await response.json()
                    data = result.get('data', [])
                    
                    # Проверяем что data это список словарей
                    if not isinstance(data, list):
                        logger.debug(f"Unexpected data type: {type(data)}")
                        continue
                    
                    # Ищем товары с pending=true или без цены
                    pending = {
                        p['article'] for p in data
                        if isinstance(p, dict) and (p.get('pending') == True or not p.get('price'))
                    }
                    
                    # Если есть новые pending товары
                    new_pending = pending - last_pending
                    if new_pending:
                        logger.info(f"📥 Найдено {len(new_pending)} новых pending товаров: {new_pending}")
                        await parse_wb_prices(list(new_pending))
                    
                    last_pending = pending
                    
            except Exception as e:
                logger.error(f"Ошибка опроса pending: {e}")
                error_logger.exception("Poll pending error details")


async def periodic_check(app):
    """Периодическая проверка (каждые 30 мин)"""

    while True:
        await asyncio.sleep(CHECK_INTERVAL)
        
        logger.info("🔄 Периодическая проверка...")
        
        # Проверяем есть ли товары без цен
        async with aiohttp.ClientSession() as session:
            try:
                response = await session.get(f'{WORKER_URL}/api/products')
                if response.ok:
                    data = await response.json()
                    products_list = data.get('data', [])
                    # Проверяем что это список, а не ошибка
                    if isinstance(products_list, list):
                        pending = [
                            p['article'] for p in products_list
                            if isinstance(p, dict) and not p.get('price')
                        ]

                        if pending:
                            logger.info(f"Найдено {len(pending)} товаров без цен")
                            await parse_wb_prices(pending)
            except Exception as e:
                logger.error(f"Ошибка периодической проверки: {e}")
                error_logger.exception("Periodic check error details")


# ===== MAIN =====

def create_app():
    """Создание web приложения"""

    app = web.Application()
    app.router.add_get('/health', health_handler)

    app.on_startup.append(start_background_tasks)
    app.on_shutdown.append(stop_background_tasks)

    return app


if __name__ == '__main__':
    logger.info("=" * 60)
    logger.info("WB Parser Auto - Telegram + Chrome Extension")
    logger.info("=" * 60)
    logger.info(f"Worker URL: {WORKER_URL}")
    logger.info(f"Расширение: {EXTENSION_PATH}")
    logger.info(f"Poll interval: {POLL_INTERVAL} сек")
    logger.info(f"Check interval: {CHECK_INTERVAL // 60} мин")
    logger.info(f"Логирование: {LOG_DIR}")
    logger.info("=" * 60)

    # Проверяем расширение
    if not EXTENSION_PATH.exists():
        logger.error(f"Расширение не найдено: {EXTENSION_PATH}")
        sys.exit(1)

    if not (EXTENSION_PATH / 'manifest.json').exists():
        logger.error("manifest.json не найден")
        sys.exit(1)

    logger.info("✅ Расширение найдено")

    # Создаём профиль
    CHROME_PROFILE.mkdir(parents=True, exist_ok=True)
    logger.info(f"Профиль Chrome: {CHROME_PROFILE}")

    # Запускаем web сервер
    logger.info(f"Запуск сервера на http://0.0.0.0:{WEBHOOK_PORT}")
    logger.info("Ожидание pending товаров...")
    app = create_app()
    web.run_app(app, host='0.0.0.0', port=WEBHOOK_PORT, print=lambda x: logger.info(x))
