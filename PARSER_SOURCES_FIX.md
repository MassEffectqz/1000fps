# Исправление: Сохранение источников парсинга

## Проблема
После парсинга товары **не сохраняли источники парсинга** (`Product.parserSources`). 
В UI формы на вкладке "Парсинг" секция "Источники парсинга" оставалась пустой с сообщением:
> "Добавьте ссылки на товары Wildberries. Цена будет браться из первого доступного источника."

## Причина
Webhook endpoint (`/api/admin/parser/webhook`) получал `sources` из payload, но сохранял их **только в `ParseJob.sources`**, а **НЕ в `Product.parserSources`**.

Существовало два параллельных хранилища:
1. `Product.parserSources` — управлялось только через ручной UI (`/api/admin/parser/products/[id]/sources`)
2. `ParseJob.sources` — обновлялось через webhook и product update, но не синхронизировалось с Product

## Решение
Добавлена функция `updateProductParserSources()` в webhook route которая:
1. Получает `sources` из webhook payload (массив URL)
2. Загружает существующие `Product.parserSources`
3. **Объединяет** старые и новые источники (уникальность по URL через `Set`)
4. Сохраняет в формате `[{url, priority, isActive}]`
5. Выполняется **внутри транзакции** вместе с сохранением поставщиков

## Изменённые файлы

### `src/app/api/admin/parser/webhook/route.ts`
- **Строки 138-140**: Извлечение `sourcesFromPayload` из результата
- **Строки 150-153**: Вызов `updateProductParserSources()` внутри транзакции
- **Строки 637-692**: Новая функция `updateProductParserSources()`

### Алгоритм объединения источников
```typescript
// Существующие: [{url, priority, isActive}]
const existing = product.parserSources || [];

// Извлекаем URL
const existingUrls = existing.map(s => s.url);

// Объединяем с новыми (уникальность)
const allUrls = [...new Set([...existingUrls, ...newSources])];

// Формируем новую структуру
const parserSources = allUrls.map((url, i) => ({
  url,
  priority: i,
  isActive: true,
}));

// Сохраняем
await prisma.product.update({ data: { parserSources } });
```

## Результат
✅ После парсинга источники автоматически появляются в UI формы  
✅ При повторном парсинге новые источники добавляются к существующим  
✅ Дубликаты URL автоматически удаляются  
✅ Приоритет источников сохраняется по порядку добавления  

## Тестирование
1. Откройте товар в админ-панели
2. Перейдите на вкладку "Парсинг"
3. Добавьте URL для парсинга и запустите
4. После завершения обновите страницу
5. **Ожидание**: В секции "Источники парсинга" отображается добавленный URL

## Проверка в базе данных
```sql
-- Проверить источники парсинга
SELECT id, name, sku, "parserSources"
FROM "Product"
WHERE "parserSources" IS NOT NULL
ORDER BY "updatedAt" DESC
LIMIT 10;
```
