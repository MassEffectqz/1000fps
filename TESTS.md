# 🧪 Тестирование проекта 1000FPS

## 📊 Статистика тестов

- **Всего тестов:** 62
- **Успешных:** 60 (97%)
- **Неуспешных:** 2 (3%)

## 📁 Структура тестов

```
src/tests/
├── setup.ts                      # Настройка тестового окружения
├── utils.test.ts                 # Тесты утилит (cn)
├── validations/
│   ├── order.test.ts             # Тесты валидации заказов
│   ├── user.test.ts              # Тесты валидации пользователей
│   └── warehouse.test.ts         # Тесты валидации складов
├── components/
│   └── admin/
│       ├── analytics.test.tsx    # Тесты страницы аналитики
│       └── warehouses.test.tsx   # Тесты страницы складов
└── api/
    └── warehouses.test.ts        # Тесты API складов
```

## ✅ Пройденные тесты

### Utils (6 тестов)
- ✓ Объединение классов
- ✓ Фильтрация falsy значений
- ✓ Объекты с условиями
- ✓ Массивы
- ✓ Мерж с tailwind-merge
- ✓ Пустые аргументы

### Order Validations (13 тестов)
- ✓ Валидные статусы заказов
- ✓ Валидные статусы оплаты
- ✓ Валидные данные для обновления
- ✓ Частичные данные
- ✓ Discount и deliveryCost
- ✓ Query параметры
- ✓ Значения по умолчанию
- ✓ Отклонение невалидных данных

### User Validations (14 тестов)
- ✓ Валидные роли
- ✓ Валидные уровни
- ✓ Валидные данные для обновления
- ✓ Частичные данные
- ✓ Null значения
- ✓ Query параметры
- ✓ Значения по умолчанию

### Warehouse Validations (14 тестов)
- ✓ Валидные данные склада
- ✓ Обязательные поля
- ✓ Создание склада
- ✓ Обновление склада
- ✓ Query параметры
- ✓ Фильтры

### Warehouses Component (3 теста)
- ✓ Состояние загрузки
- ✓ Список складов
- ✓ Пустое состояние

### Analytics Component (2 теста)
- ✓ Состояние загрузки
- ✓ Ошибка загрузки

### Warehouses API (8 тестов)
- ✓ Список складов
- ✓ Фильтр по city
- ✓ Фильтр по isActive
- ✓ Создание склада
- ✓ Ошибка валидации
- ✓ Склад по ID
- ✓ 404 ошибка
- ✓ Ошибка удаления с товарами

## ❌ Неуспешные тесты (2)

### 1. Analytics Component - "должен показывать основную статистику"
**Причина:** Текст "250" встречается в нескольких элементах (заказов всего / другая статистика)

**Решение:** Использовать более специфичные селекторы или data-testid атрибуты

### 2. Warehouses API - "должен удалять склад без товаров"
**Причина:** Mock для `warehouse.count` не правильно настроен в контексте DELETE запроса

**Решение:** Настроить mock для всех вызовов prisma.warehouse.count

## 🚀 Запуск тестов

```bash
# Запустить все тесты
npm run test

# Запустить тесты с UI
npm run test:ui

# Запустить тесты с coverage
npm run test:coverage

# Запустить конкретный файл
npx vitest src/tests/utils.test.ts

# Запустить тесты в watch режиме
npx vitest --watch
```

## 📦 Зависимости для тестирования

```json
{
  "devDependencies": {
    "vitest": "^4.1.2",
    "@testing-library/react": "^16.3.2",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/user-event": "^14.6.1",
    "jsdom": "^29.0.1",
    "happy-dom": "^20.8.9",
    "@vitejs/plugin-react": "^6.0.1"
  }
}
```

## 🔧 Конфигурация

### vitest.config.ts
- Среда: jsdom
- Глобальные переменные: true
- Setup файл: src/tests/setup.ts
- Include: src/**/*.{test,spec}.{ts,tsx}

### setup.ts
- Мок для next/navigation
- Мок для next/image
- Мок для sonner (toast)
- Cleanup после каждого теста

## 📝 Best Practices

### 1. Именование тестов
```typescript
describe('Order Validations', () => {
  describe('orderStatusSchema', () => {
    it('должен принимать все валидные статусы заказов', () => {
      // ...
    });
  });
});
```

### 2. Mocking fetch
```typescript
global.fetch = vi.fn();

(fetch as vi.Mock).mockResolvedValueOnce({
  ok: true,
  json: async () => ({ data: 'value' }),
});
```

### 3. Testing async components
```typescript
await vi.waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### 4. Testing forms
```typescript
fireEvent.change(screen.getByPlaceholderText('Name'), {
  target: { value: 'New Value' },
});
fireEvent.click(screen.getByText('Submit'));
```

## 🎯 Покрытие кода

Для запуска тестов с покрытием:

```bash
npm run test:coverage
```

Отчёт будет доступен в `coverage/index.html`

## 🔄 CI/CD Интеграция

Для использования в CI/CD:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test -- --run
```

## 📈 Рекомендации по улучшению

1. **Добавить тесты для API endpoints:**
   - Orders API
   - Users API
   - Products API

2. **Добавить компонентные тесты:**
   - ProductCard
   - Catalog Filters
   - Configurator

3. **Добавить e2e тесты:**
   - Оформление заказа
   - Регистрация пользователя
   - Добавление товара в корзину

4. **Увеличить покрытие:**
   - Server Actions
   - Utility functions
   - Hooks

## 🐛 Известные проблемы

1. **act() warnings:** Некоторые тесты компонентов требуют обёртывания в act()
2. **Multiple element matches:** Использовать getAllByText или data-testid
3. **Mock complexity:** Сложные mock для Prisma транзакций

## 📚 Ресурсы

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing)
