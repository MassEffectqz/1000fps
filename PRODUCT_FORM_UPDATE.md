# Обновление формы редактирования товара

## Изменения

### 1. Новый layout (3 колонки)

**Старая версия:**
- Ограниченная ширина (~800px)
- Вертикальная структура с табами

**Новая версия:**
- Полная ширина экрана (max-width: 1920px)
- Grid layout с 3 колонками:
  - **Левая (25%)**: Основная информация + Парсинг + Статусы
  - **Центральная (50%)**: Описание, характеристики, изображения, варианты
  - **Правая (25%)**: Цены, склады, SEO (sticky sidebar)

### 2. Секция "Парсинг"

Добавлена в левую колонку:
- Компонент `ParserStatus` — отображение статуса парсинга
- Компонент `ParseSourceInput` — ввод ссылок/артикулов с приоритетами
- Компонент `PriceHistoryMini` — мини-график истории цен
- Интеграция с API `/api/admin/parser/parse`
- Polling статуса задачи (каждые 2 сек)
- Автоматическое обновление цены после парсинга

### 3. Новые компоненты

#### `src/components/ui/parser-status.tsx`
Компонент отображения статуса парсинга:
- Статусы: `idle`, `parsing`, `success`, `error`, `not_found`
- Отображение полученных данных (цена, бренд, рейтинг)
- Кнопка обновления

#### `src/components/ui/price-history-mini.tsx`
Компонент графика истории цен:
- SVG график с градиентом
- Отображение мин/макс цены
- Индикатор изменения цены (%)
- Адаптивный дизайн

### 4. API endpoints

#### Новый endpoint:
- `GET /api/admin/parser/products/[productId]/history` — история изменений цен

#### Существующие (используются):
- `POST /api/admin/parser/parse` — запуск парсинга
- `GET /api/admin/parser/jobs/[jobId]` — статус задачи

### 5. Улучшения UX

- **Sticky sidebar** для правой колонки
- **Адаптивность** для мобильных (grid-cols-12 → col-span-12)
- **Быстрая навигация** по вкладкам (для мобильных)
- **Валидация** с подробными сообщениями об ошибках
- **Автосохранение** черновика в localStorage
- **Предпросмотр** товара в модальном окне

### 6. Типизация

Все пропсы типизированы через TypeScript interface:
```typescript
interface ProductFormData {
  // Основные поля
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  brandId: string;
  // ...
  
  // Парсинг
  parseSources: string[];
}
```

### 7. Стили

- Использованы существующие CSS-переменные из `tailwind.config.ts`
- Цвета: `black2`, `gray1`, `orange`, `orange2`
- Border radius: `var(--radius)`, `var(--radius-sm)`
- Transition: `180ms ease`

## Структура файлов

```
src/components/ui/
├── product-form-container.tsx    # Основной компонент (обновлён)
├── parser-status.tsx             # Новый компонент
├── price-history-mini.tsx        # Новый компонент
├── parse-source-input.tsx        # Существующий (используется)
└── index.ts                      # Экспорты (обновлён)

src/app/api/admin/parser/products/[productId]/
├── route.ts                      # Существующий
└── history/
    └── route.ts                  # Новый endpoint
```

## Совместимость

- ✅ Сохранена вся существующая функциональность
- ✅ Обратная совместимость с API
- ✅ TypeScript strict mode
- ✅ Next.js 15 App Router
- ✅ Tailwind CSS
- ✅ Адаптивность (mobile-first)

## Известные ограничения

- Парсинг работает только для сохранённых товаров (требуется `productId`)
- Prisma types требуют регенерации (`prisma generate`)
- Тесты требуют обновления конфигурации vitest
