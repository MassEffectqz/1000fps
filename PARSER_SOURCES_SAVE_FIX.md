# Исправление: Сохранение источников парсинга и поставщиков

## Проблема
После сохранения товара в админ-панели **пропадали**:
1. Источники парсинга (`parseSources`)
2. Поставщики (`ProductSupplier`)

При повторном открытии товара секция "Источники парсинга" была пустой.

## Корневая причина

В системе существовало **два независимых хранилища** для источников парсинга:

| Хранилище | Таблица | Тип | Обновлялось из |
|---|---|---|---|
| `Product.parserSources` | Product | `Json [{url, priority, isActive}]` | Только webhook парсера |
| `ParseJob.sources` | ParseJob | `String[] ["url1", "url2"]` | Форма сохранения товара |

### Цикл проблемы:
1. **Сохранение:** `parseSources` записывались ТОЛЬКО в `ParseJob.sources`
2. **Загрузка:** `parseSources` читались из `ParseJob.sources` → преобразовывались в UI
3. **loadParserData():** `Product.parserSources` (пустой) **перезаписывал** formData.parseSources
4. **Результат:** Источники пропадали при следующей загрузке

## Решение

### 1. Синхронизация при сохранении (PUT `/api/admin/products/[id]`)
**Файл:** `src/app/api/admin/products/[id]/route.ts`, строки 340-373

```typescript
// Обновляем ОБА хранилища при сохранении

// 1. Product.parserSources (единый источник)
const parserSourcesForProduct = parseSources.map((url: string, index: number) => ({
  url,
  priority: index,
  isActive: true,
}));

await prisma.product.update({
  where: { id },
  data: { parserSources: parserSourcesForProduct },
});

// 2. ParseJob.sources (обратная совместимость)
await prisma.parseJob.update/create({...});
```

### 2. Синхронизация при загрузке (GET `/api/admin/products/[id]`)
**Файл:** `src/app/api/admin/products/[id]/route.ts`, строки 61-70

```typescript
// Возвращаем parseSources из Product.parserSources (единый источник)
// Преобразуем [{url, priority, isActive}] -> [url1, url2, ...]
const parserSources = product.parserSources && Array.isArray(product.parserSources)
  ? (product.parserSources as Array<{ url?: string }>).map(s => s.url).filter(Boolean)
  : [];

return NextResponse.json({
  ...product,
  parseSources: parserSources,
});
```

### 3. Загрузка поставщиков
**Файл:** `src/app/admin/products/[id]/page.tsx`, строки 193-207

```typescript
// Загружаем поставщиков отдельно
let suppliers = [];
try {
  const suppliersRes = await fetch(`/api/admin/products/${id}/suppliers`);
  if (suppliersRes.ok) {
    const suppliersData = await suppliersRes.json();
    suppliers = suppliersData.data || [];
  }
} catch (e) {
  console.warn('Failed to load suppliers:', e);
}

setProduct({ ...productData, suppliers });
```

### 4. Предотвращение перезаписи parseSources
**Файл:** `src/components/ui/product-form-container.tsx`, строки 294-300

```typescript
// loadParserData(): НЕ перезаписываем parseSources
// Они уже загружены из initialData (Product.parserSources)
setFormData(prev => ({
  ...prev,
  useParserPrice: data.useParserPrice || false,
  // parseSources оставляем как есть из initialData
}));
```

## Поток данных (после исправления)

```
┌─────────────────────────────────────────────────────┐
│                 СОХРАНЕНИЕ ТОВАРА                    │
├─────────────────────────────────────────────────────┤
│  UI форма (объекты {url, priority, isActive})       │
│         ↓                                            │
│  page.tsx (объекты -> строки [url1, url2])          │
│         ↓                                            │
│  API PUT /api/admin/products/[id]                   │
│         ↓                                            │
│  ┌─────┴─────┐                                      │
│  ↓           ↓                                      │
│  Product    ParseJob                                 │
│  .parser    .sources                                 │
│  Sources    (String[])                               │
│  (JSON)                                              │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                  ЗАГРУЗКА ТОВАРА                     │
├─────────────────────────────────────────────────────┤
│  API GET /api/admin/products/[id]                   │
│         ↓                                            │
│  Product.parserSources -> parseSources [urls]       │
│         ↓                                            │
│  page.tsx (строки -> объекты)                       │
│         ↓                                            │
│  initialData.parseSources                           │
│         ↓                                            │
│  formData.parseSources (spread ...initialData)      │
│         ↓                                            │
│  ProductParserConfig (отображение)                   │
│                                                      │
│  + Загрузка поставщиков                              │
│    GET /api/admin/products/[id]/suppliers           │
└─────────────────────────────────────────────────────┘
```

## Изменённые файлы

| Файл | Что изменено |
|---|---|
| `src/app/api/admin/products/[id]/route.ts` | GET: читает из Product.parserSources; PUT: обновляет Product.parserSources + ParseJob.sources |
| `src/app/admin/products/[id]/page.tsx` | Загружает поставщиков, передаёт suppliers в initialData |
| `src/components/ui/product-form-container.tsx` | Не перезаписывает parseSources в loadParserData |

## Проверка

### 1. Сохранение источников
1. Откройте товар в админ-панели
2. Перейдите на вкладку "Парсинг"
3. Добавьте URL: `https://www.wildberries.ru/catalog/123456/detail.aspx`
4. Нажмите "Сохранить товар"
5. Откройте товар заново
6. **Ожидание:** URL отображается в "Источники парсинга"

### 2. Сохранение поставщиков
1. Запустите парсинг товара
2. Дождитесь завершения
3. Нажмите "Сохранить товар"
4. Откройте товар заново
5. **Ожидание:** Поставщики отображаются во вкладке "Парсинг"

### 3. Проверка в базе данных
```sql
-- Проверить источники
SELECT id, name, sku, "parserSources"
FROM "Product"
WHERE "parserSources" IS NOT NULL
ORDER BY "updatedAt" DESC
LIMIT 10;

-- Проверить поставщиков
SELECT ps.id, p.name, ps.name as supplier, ps.price, ps.url
FROM "ProductSupplier" ps
JOIN "Product" p ON ps."productId" = p.id
ORDER BY ps."createdAt" DESC
LIMIT 10;
```

## Результат
✅ Источники парсинга сохраняются и загружаются корректно  
✅ Поставщики загружаются при открытии товара  
✅ Данные не пропадают после сохранения  
✅ Единый источник истины: `Product.parserSources`
