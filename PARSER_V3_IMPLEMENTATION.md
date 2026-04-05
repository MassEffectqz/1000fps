# Система парсинга Wildberries v3.0

## Обзор изменений

Полностью переработана система парсинга для интеграции с сайтом и автоматического обновления цен.

## Архитектура

```
Chrome Extension (пакетный парсинг)
         ↓ (webhook)
Next.js Server API
         ↓
Priority Price Engine
         ↓
Product Database (auto-update)
```

## Что изменилось

### 1. Chrome Extension (parser/wb-parser-extension/)

**До:** 3 вкладки (Страница, Вручную, Товар)
**После:** 1 вкладка — пакетный парсинг ссылок

**Возможности:**
- Вставка нескольких ссылок на товары WB (каждая с новой строки)
- Автоматическое извлечение nmId из URL
- Отправка результатов webhook на сервер
- Сохранение URL сервера в chrome.storage.sync

**Как использовать:**
1. Указать URL сервера (по умолчанию: `http://localhost:3000/api/admin/parser/webhook`)
2. Вставить ссылки на товары WB
3. Нажать "Парсить и отправить на сервер"
4. Результаты автоматически отправляются на сервер

### 2. База данных (Prisma)

Добавлены поля в модель `Product`:

```prisma
useParserPrice  Boolean   @default(false)  // Использовать цены с парсера
parserSources   Json?                       // [{url, priority, isActive}]
parserPrice     Decimal?                    // Последняя цена с парсера
parserOldPrice  Decimal?                    // Старая цена с парсера
parserDelivery  String?                     // Срок доставки
parserName      String?                     // Название с парсера
parserInStock   Boolean   @default(true)    // Товар в наличии
parserUpdatedAt DateTime?                   // Время обновления
```

### 3. Приоритетное определение цены

**Алгоритм:**
1. Источники сортируются по `priority` (0 = главный)
2. Перебираем источники по порядку
3. Если первый источник: товар не в наличии → берём следующий
4. Как только нашли товар в наличии → обновляем цену
5. Если все источники не в наличии → `parserInStock = false`

### 4. API Endpoints

#### Новые endpoints:

**`POST /api/admin/parser/products/[id]/auto-parse`**
- Вкл/выкл использование цен с парсера
- Body: `{ useParserPrice: boolean }`

**`GET /api/admin/parser/products/[id]/auto-parse`**
- Получить настройки парсера для товара

**`POST /api/admin/parser/products/[id]/sources`**
- Добавить/обновить источники парсинга
- Body: `{ sources: [{url, priority, isActive}] }`

**`DELETE /api/admin/parser/products/[id]/sources?url=...`**
- Удалить источник

**`GET /api/admin/parser/products/[id]/sources`**
- Получить источники товара

**`GET /api/admin/parser/logs`**
- Получить логи парсинга с пагинацией и фильтрами

#### Обновлённые endpoints:

**`POST /api/admin/parser/webhook`**
- Теперь поддерживает пакетную обработку (`productId: '__BATCH__'`)
- Автоматическое нахождение товара по URL в `parserSources`
- Приоритетное обновление цены

### 5. UI в редактировании товара

**Новая вкладка "Парсинг":**
- Toggle "Использовать цены с парсера"
- Список источников с приоритетами (стрелки вверх/вниз)
- Toggle активности каждого источника
- Кнопка "Добавить источник"
- Кнопка "Запустить парсинг сейчас"
- Статус последнего парсинга

**Страница логов (`/admin/parser/logs`):**
- Таблица всех задач парсинга
- Фильтр по статусу
- Детали задачи (модальное окно)
- Пагинация

### 6. Навигация админки

Добавлен пункт "Парсинг" в боковое меню (секция "Продажи").

## Как это работает

### Сценарий 1: Ручной парсинг через Extension

1. Открываем Chrome Extension
2. Вставляем ссылки на товары (например, 3 штуки)
3. Нажимаем "Парсить"
4. Extension парсит все 3 товара через WB API
5. Отправляет webhook на сервер с результатами
6. Сервер находит товары по URL в `parserSources`
7. Обновляет цены, наличие, доставку

### Сценарий 2: Автоматическое обновление цен

1. В товаре включаем "Использовать цены с парсера"
2. Добавляем источники (приоритет 0, 1, 2...)
3. Запускаем парсинг (через Extension или API)
4. Сервер перебирает источники по приоритету
5. Если товар #0 в наличии → берём его цену
6. Если нет → проверяем #1, #2 и т.д.
7. Обновляем цену товара + записываем в `PriceHistory`

### Сценарий 3: Пакетный парсинг

1. Extension отправляет webhook с `productId: '__BATCH__'`
2. Сервер перебирает все URL из `sources`
3. Для каждого URL ищет товар с таким URL в `parserSources`
4. Обновляет найденные товары

## Миграция базы данных

Миграция уже применена через `prisma db push`.

Для создания файла миграции:
```bash
npx prisma migrate dev --name add_parser_fields_v3
```

## Установка Extension

1. Откройте Chrome → `chrome://extensions/`
2. Включите "Режим разработчика"
3. "Загрузить распакованное расширение"
4. Выберите папку `parser/wb-parser-extension/`
5. Extension появится в панели расширений

## Настройка URL сервера

В Extension укажите URL вашего сервера:
- Локально: `http://localhost:3000/api/admin/parser/webhook`
- Продакшен: `https://your-domain.com/api/admin/parser/webhook`

## Примеры использования API

### Включить автопарсинг для товара:
```bash
curl -X POST http://localhost:3000/api/admin/parser/products/[id]/auto-parse \
  -H "Content-Type: application/json" \
  -d '{"useParserPrice": true}'
```

### Добавить источники:
```bash
curl -X POST http://localhost:3000/api/admin/parser/products/[id]/sources \
  -H "Content-Type: application/json" \
  -d '{
    "sources": [
      {"url": "https://www.wildberries.ru/catalog/123456/detail.aspx", "priority": 0, "isActive": true},
      {"url": "https://www.wildberries.ru/catalog/789012/detail.aspx", "priority": 1, "isActive": true}
    ]
  }'
```

### Получить логи парсинга:
```bash
curl http://localhost:3000/api/admin/parser/logs?status=COMPLETED&page=1&limit=50
```

## Файлы изменены/созданы

### Изменены:
- `prisma/schema.prisma` — добавлены поля в Product
- `src/app/api/admin/parser/webhook/route.ts` — приоритетное определение цены + пакетная обработка
- `src/components/ui/product-form-container.tsx` — новая вкладка "Парсинг"
- `src/app/admin/AdminLayoutClient.tsx` — пункт "Парсинг" в навигации
- `parser/wb-parser-extension/popup.html` — упрощён до 1 вкладки
- `parser/wb-parser-extension/popup.js` — пакетный парсинг + webhook

### Созданы:
- `src/components/ui/product-parser-config.tsx` — компонент настройки парсинга
- `src/app/api/admin/parser/products/[id]/auto-parse/route.ts`
- `src/app/api/admin/parser/products/[id]/sources/route.ts`
- `src/app/api/admin/parser/logs/route.ts`
- `src/app/admin/parser/logs/page.tsx` — страница логов

## TypeScript

Все файлы проходят проверку `tsc --noEmit` без ошибок.

## Тестирование

1. Запустите Next.js сервер: `npm run dev`
2. Установите Extension в Chrome
3. Создайте товар в админке
4. Перейдите на вкладку "Парсинг"
5. Добавьте источники (URL товаров WB)
6. Включите "Использовать цены с парсера"
7. Запустите парсинг через Extension
8. Проверьте обновление цен в товаре

## Примечания

- Парсинг работает только когда браузер с Extension открыт
- Extension использует прямой WB API (без Playwright)
- Цены обновляются автоматически если `useParserPrice: true`
- Все изменения цен записываются в `PriceHistory` с reason: `parser_auto`
