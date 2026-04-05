# Инструкция по тестированию сохранения источников парсинга

## Проблема
Источники парсинга не сохраняются после сохранения товара.

## Что добавлено
Логирование на всех этапах:
1. **Загрузка товара** (API GET) → `[API GET /products/:id]`
2. **Инициализация формы** → `[ProductForm] Initial data loaded`
3. **Сохранение товара** (UI) → `[Product Save]`
4. **Сохранение в API** → `[API PUT /products/:id]`

## Шаги тестирования

### 1. Откройте товар в админ-панели
Откройте консоль браузера (F12) и посмотрите логи.

**Ожидание в консоли:**
```
[API GET /products/:id] Product loaded: {
  id: "...",
  name: "...",
  parserSourcesCount: 0 или больше,
  parserSources: ["url1", "url2"] или []
}

[ProductForm] Initial data loaded: {
  id: "...",
  parseSources: [{url, priority, isActive}, ...],
  parseSourcesCount: число
}
```

### 2. Добавьте источник парсинга
1. Перейдите на вкладку "Парсинг"
2. Добавьте URL: `https://www.wildberries.ru/catalog/241468031/detail.aspx`
3. Нажмите "Добавить источник"

**Проверьте в консоли:**
```
// Можно проверить в React DevTools что formData.parseSources обновился
```

### 3. Сохраните товар
Нажмите кнопку "Сохранить товар"

**Ожидание в консоли браузера:**
```
[Product Save] Отправляемые данные: {
  id: "...",
  parseSources: ["https://www.wildberries.ru/catalog/241468031/detail.aspx"],
  parseSourcesCount: 1
}

[Product Save] Успешно сохранено
```

**Ожидание в консоли сервера (терминал с npm dev):**
```
[API PUT /products/:id] parseSources received: ["https://..."]
[API PUT /products/:id] Saving to Product.parserSources: [{url: "...", priority: 0, isActive: true}]
[API PUT /products/:id] Product.parserSources saved successfully
[API PUT /products/:id] ParseJob.sources updated (или New ParseJob created)
```

### 4. Обновите страницу
Нажмите F5 или кнопку в alert.

**Ожидание в консоли:**
```
[API GET /products/:id] Product loaded: {
  parserSourcesCount: 1,
  parserSources: ["https://www.wildberries.ru/catalog/241468031/detail.aspx"]
}

[ProductForm] Initial data loaded: {
  parseSourcesCount: 1,
  parseSources: [{url: "https://...", priority: 0, isActive: true}]
}
```

**В UI:** На вкладке "Парсинг" должен отображаться добавленный URL.

### 5. Проверка в базе данных
Выполните SQL запрос:
```sql
SELECT id, name, sku, "parserSources"
FROM "Product"
WHERE id = 'cmnispa25001kqo9vt3xtsmvm';
```

**Ожидание:** В поле `parserSources` должен быть JSON массив объектов:
```json
[
  {
    "url": "https://www.wildberries.ru/catalog/241468031/detail.aspx",
    "priority": 0,
    "isActive": true
  }
]
```

## Возможные проблемы и решения

### parseSourcesCount = 0 при загрузке
**Причина:** В базе данных `Product.parserSources` пустой или NULL

**Решение:** 
1. Проверьте что sources были сохранены при предыдущем сохранении
2. Проверьте логи сервера на ошибки

### parseSources есть в initialData но пропадают при сохранении
**Причина:** API не сохраняет или validation schema отклоняет

**Решение:**
1. Проверьте `[API PUT /products/:id] parseSources received`
2. Если `parseSources: undefined` или `[]` — проблема в payload формы

### parseSources сохраняются но не загружаются
**Причина:** API GET не читает из Product.parserSources

**Решение:**
1. Проверьте `[API GET /products/:id] Product loaded`
2. Если `parserSourcesCount: 0` но в базе есть данные — проблема в преобразовании

## После успешного тестирования
Уберите логирование или оставьте только для отладки:
- Удалите `console.log` из page.tsx (handleSave)
- Удалите `console.log` из product-form-container.tsx (useEffect)
- Оставьте или удалите логи из API route.ts по усмотрению
