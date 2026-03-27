#!/usr/bin/env python3
"""
WB Price Parser - Автозапуск расширения Chrome для парсинга цен
Автоматическая проверка цен Wildberries
"""

import asyncio
import os
import sys
import logging
from pathlib import Path
from datetime import datetime
from playwright.async_api import async_playwright
from aiohttp import web
import aiohttp

# ===== LOGGING CONFIGURATION =====
LOG_DIR = Path(__file__).parent / 'logs'
LOG_DIR.mkdir(parents=True, exist_ok=True)

LOG_FORMAT = '%(asctime)s | %(levelname)-8s | %(message)s'
DATE_FORMAT = '%H:%M:%S'

logging.basicConfig(
    level=logging.INFO,
    format=LOG_FORMAT,
    datefmt=DATE_FORMAT,
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_DIR / 'parser.log', encoding='utf-8'),
        logging.FileHandler(LOG_DIR / 'error.log', encoding='utf-8')
    ]
)

error_logger = logging.getLogger('error')
error_logger.setLevel(logging.ERROR)
parser_logger = logging.getLogger('parser')
parser_logger.setLevel(logging.INFO)
logger = logging.getLogger(__name__)

# ===== CONFIGURATION =====
WORKER_URL = os.environ.get('WORKER_URL', 'http://localhost:3002')
EXTENSION_PATH = Path(os.environ.get('EXTENSION_PATH', Path(__file__).parent.parent / 'wb-interceptor'))
CHECK_INTERVAL = int(os.environ.get('CHECK_INTERVAL', '1800'))  # 30 минут
WEBHOOK_PORT = int(os.environ.get('WEBHOOK_PORT', '8080'))
CHROME_PROFILE = Path(__file__).parent / 'chrome_profile'


async def parse_wb_prices(articles):
    """Парсинг цен для списка товаров через Chrome с расширением"""
    parser_logger.info(f"Запуск парсера для {len(articles)} товаров: {articles}")

    async with async_playwright() as p:
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
            parser_logger.info("Открытие wildberries.ru...")
            await page.goto('https://www.wildberries.ru/', timeout=30000)

            parser_logger.info("Ожидание проверки цен (30 сек)...")
            await asyncio.sleep(30)

            logs = []
            page.on('console', lambda msg: logs.append(f"[{msg.type}] {msg.text}"))

            extension_logs = [l for l in logs if '1000fps' in l]
            if extension_logs:
                parser_logger.info(f"Логи расширения ({len(extension_logs)}):")
                for log in extension_logs[-10:]:
                    parser_logger.debug(f"  {log}")

            parser_logger.info("✅ Проверка завершена")

        except Exception as e:
            parser_logger.error(f"Ошибка парсинга: {e}")
            error_logger.exception("Parse error details")

        finally:
            await browser.close()


async def periodic_check(app):
    """Периодическая проверка всех товаров (каждые 30 мин)"""
    while True:
        await asyncio.sleep(CHECK_INTERVAL)
        logger.info("🔄 Периодическая проверка...")

        async with aiohttp.ClientSession() as session:
            try:
                response = await session.get(f'{WORKER_URL}/api/wb/products')
                if response.ok:
                    data = await response.json()
                    products_list = data.get('data', [])
                    
                    if isinstance(products_list, list):
                        # Проверяем товары без цен
                        no_price = [p['article'] for p in products_list if isinstance(p, dict) and not p.get('price')]
                        
                        if no_price:
                            logger.info(f"Найдено {len(no_price)} товаров без цен")
                            await parse_wb_prices(no_price)
                            
            except Exception as e:
                logger.error(f"Ошибка периодической проверки: {e}")
                error_logger.exception("Periodic check error details")


async def health_handler(request):
    """Health check"""
    return web.json_response({
        'status': 'ok',
        'time': datetime.now().isoformat()
    })


async def start_background_tasks(app):
    app['check_task'] = asyncio.create_task(periodic_check(app))


async def stop_background_tasks(app):
    app['check_task'].cancel()
    try:
        await app['check_task']
    except asyncio.CancelledError:
        pass


def create_app():
    app = web.Application()
    app.router.add_get('/health', health_handler)
    app.on_startup.append(start_background_tasks)
    app.on_shutdown.append(stop_background_tasks)
    return app


if __name__ == '__main__':
    logger.info("=" * 60)
    logger.info("WB Parser Auto - Chrome Extension Auto-Checker")
    logger.info("=" * 60)
    logger.info(f"Worker URL: {WORKER_URL}")
    logger.info(f"Расширение: {EXTENSION_PATH}")
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

    CHROME_PROFILE.mkdir(parents=True, exist_ok=True)
    logger.info(f"Профиль Chrome: {CHROME_PROFILE}")

    logger.info(f"Запуск сервера на http://0.0.0.0:{WEBHOOK_PORT}")
    app = create_app()
    web.run_app(app, host='0.0.0.0', port=WEBHOOK_PORT, print=lambda x: logger.info(x))
