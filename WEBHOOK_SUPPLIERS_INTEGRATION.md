# Webhook Integration для сохранения поставщиков

## Проблема
Результаты парсинга из Chrome extension не отправлялись на сервер для сохранения как поставщики. Данные только обновляли UI формы и отправлялись на `/api/wb/products` для обновления цен, но не сохранялись как поставщики через `/api/admin/parser/webhook`.

## Решение
Добавлена функция `sendToWebhook()` в `background.js`, которая:
1. Находит `productId` по артикулу товара через `/api/wb/products?article={article}`
2. Формирует данные поставщика в формате, совместимом с `webhookPayloadSchema`
3. Отправляет на `/api/admin/parser/webhook` для сохранения в базу

## Изменённые файлы

### background.js
- **Добавлена функция** `sendToWebhook(productData, sourceArticle)` (строки ~1253-1343)
  - Автоматически ищет `productId` по артикулу
  - Формирует payload с данными поставщика (цена, наличие, доставка, рейтинг)
  - Отправляет на webhook endpoint
  - Логирует результат

- **Интегрировано в**:
  1. `PRICE_ADD` — при добавлении нового товара (строка ~862)
  2. `PRICE_REFRESH_ONE` — при обновлении одного товара (строка ~938)
  3. `checkAllPrices()` — при массовой проверке всех цен (строка ~771)
  4. Keep-alive парсинг при открытии вкладки (строка ~1129)

## Формат webhook payload

```json
{
  "jobId": "webhook_{article}_{timestamp}",
  "productId": "uuid-товара-или-null",
  "status": "COMPLETED",
  "result": [
    {
      "source": "https://www.wildberries.ru/catalog/{article}/detail.aspx",
      "price": 1999,
      "oldPrice": 2999,
      "name": "Название товара",
      "brand": "Бренд",
      "inStock": true,
      "stockQuantity": 100,
      "deliveryMin": 2,
      "deliveryMax": 4,
      "deliveryTime": "2–4 дн.",
      "rating": 4.8,
      "feedbacks": 150
    }
  ],
  "sources": ["https://www.wildberries.ru/catalog/{article}/detail.aspx"]
}
```

## Как это работает

### Цепочка при парсинге товара
1. Extension парсит товар через WB API
2. **Сохраняет локально** в chrome.storage.local
3. **Отправляет на** `/api/wb/products` — для обновления цены в основной базе
4. **Отправляет на** `/api/admin/parser/webhook` — для сохранения как поставщика

### Webhook endpoint обрабатывает:
1. Валидация через `webhookPayloadSchema` (Zod)
2. Поиск товара по `productId`
3. Атомарная транзакция:
   - `saveSuppliers()` — сохраняет/обновляет поставщика через `prisma.productSupplier.upsert`
   - `updateProductPriceFromParser()` — обновляет цену если включён `useParserPrice`
4. Запись в `PriceHistory` при изменении цены

## Тестирование

### 1. Проверка через Chrome extension
1. Откройте Chrome extension
2. Добавьте новый товар по артикулу
3. В консоли расширения (chrome://extensions → Service Worker) проверьте логи:
   - `[1000fps] 🔍 Найден productId=...`
   - `[1000fps] 📤 Отправка поставщика на webhook: ...`
   - `[1000fps] ✅ Поставщик сохранён через webhook: ...`

### 2. Проверка в базе данных
```sql
-- Проверить сохранённых поставщиков
SELECT * FROM ProductSupplier ORDER BY createdAt DESC LIMIT 10;

-- Проверить связанные товары
SELECT p.id, p.name, p.sku, ps.name as supplier_name, ps.price, ps.url
FROM Product p
LEFT JOIN ProductSupplier ps ON p.id = ps."productId"
WHERE ps.id IS NOT NULL
ORDER BY p.createdAt DESC;
```

### 3. Проверка через админ-панель
1. Откройте товар в админ-панели
2. Перейдите на вкладку "Парсинг"
3. Должны отображаться поставщики с ценами и сроками доставки

## Возможные проблемы

### productId не найден
**Симптом:** `[1000fps] Не удалось найти productId по артикулу`

**Решение:** Убедитесь что товар существует в базе и имеет поле `sku` равное артикулу из WB

### Webhook возвращает 400
**Симптом:** `HTTP 400: Невалидные данные`

**Решение:** Проверьте что payload соответствует схеме — особенно наличие `jobId` и `status`

### Поставщики не сохраняются
**Симптом:** Webhook возвращает 200, но поставщиков нет в базе

**Решение:** Проверьте логи сервера — возможны ошибки валидации или транзакции

## Преимущества решения
- ✅ Автоматическое сохранение всех поставщиков при парсинге
- ✅ **Автоматическое сохранение источников парсинга** (`Product.parserSources`)
- ✅ Источники объединяются с существующими (уникальность по URL)
- ✅ Идемпотентность через `jobId` + rate limiting (2 сек)
- ✅ Не блокирует основной поток — ошибки только логируются
- ✅ Работает во всех сценариях: добавление, обновление, массовая проверка
- ✅ Полная трассировка через логи

## Что сохраняется при парсинге

### 1. Поставщики (`ProductSupplier`)
- URL, цена, старая цена, наличие, сроки доставки, рейтинг

### 2. Источники парсинга (`Product.parserSources`)
- Массив URL из webhook payload
- Формат: `[{url, priority, isActive}]`
- Объединяются с существующими источниками (уникальность по URL)
- Используются для multi-source fallback при следующих парсингах
