# 🎨 HTML Макеты / Layout Templates

## ⚠️ Важно

Все `.html` файлы в этой папке являются **визуальными макетами** для дизайна и прототипирования.

**Они НЕ используются в production!**

---

## 📁 Структура проекта

```
1000fps - дубль 2/
├── apps/
│   ├── storefront/     # Основной сайт (Next.js)
│   └── admin/          # Админ-панель (Next.js)
├── packages/
│   └── api/            # Backend API (NestJS)
└── *.html              # Макеты (только для дизайна!)
```

---

## 📋 Список макетов

| Файл                | Описание             | Production аналог                                  |
| ------------------- | -------------------- | -------------------------------------------------- |
| `index.html`        | Главная страница     | `apps/storefront/src/app/page.tsx`                 |
| `catalog.html`      | Каталог товаров      | `apps/storefront/src/app/catalog/page.tsx`         |
| `product.html`      | Карточка товара      | `apps/storefront/src/app/product/[id]/page.tsx`    |
| `configurator.html` | Конфигуратор ПК      | `apps/storefront/src/app/configurator/page.tsx`    |
| `profile.html`      | Профиль пользователя | `apps/storefront/src/app/profile/page.tsx`         |
| `admin.html`        | Админ-панель         | `apps/admin/src/app/page.tsx`                      |
| `header.html`       | Компонент шапки      | `apps/storefront/src/components/layout/Header.tsx` |
| `footer.html`       | Компонент подвала    | `apps/storefront/src/components/layout/Footer.tsx` |

---

## 🎯 Назначение макетов

- **Прототипирование** — быстрая визуализация дизайна
- **Демонстрация** — показ структуры страниц заказчикам
- **Тестирование** — проверка вёрстки без запуска Next.js
- **Документация** — наглядное представление структуры

---

## 🚀 Запуск production версии

### Storefront (основной сайт)

```bash
cd apps/storefront
pnpm dev
```

### Admin (админ-панель)

```bash
cd apps/admin
pnpm dev
```

### API (backend)

```bash
cd packages/api
pnpm dev
```

---

## 📝 Внесение изменений

**Для изменений в сайте:**

1. Редактируйте файлы в `apps/storefront/src/`
2. Не изменяйте `.html` макеты для production изменений

**Для изменений в админке:**

1. Редактируйте файлы в `apps/admin/src/`
2. Не изменяйте `admin.html` макет для production изменений

---

_Последнее обновление: Март 2026_
