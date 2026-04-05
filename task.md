# Задача: Next.js 15 проект по готовым HTML-макетам

## Исходные материалы

HTML-макеты находятся в папке **`/maket`**:
- `index.html` — главная
- `catalog.html` — каталог товаров
- `product.html` — страница товара
- `configurator.html` — конфигуратор ПК
- `profile.html` — профиль пользователя
- `admin.html` — админ-панель
- `header.html`, `footer.html` — общие компоненты

## Стек

- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS 4
- Prisma ORM
- PostgreSQL

## База данных

```env
DATABASE_URL="postgresql://danya:пароль@localhost:5432/fps1000"
```

## Задача

1. ✅ Инициализировать Next.js 15 проект с TypeScript и Tailwind
2. ✅ Перенести дизайн из HTML-макетов в React-компоненты
3. ✅ Извлечь CSS-переменные из макетов и перенести в стили
4. ✅ Создать все страницы из макетов + дополнительные: cart, checkout, login, register, 404
5. ✅ Вынести повторяющиеся элементы в компоненты: Header, Footer, ProductCard, Breadcrumbs и т.д.
6. ✅ Настроить Prisma: инициализировать, описать схему (Product, Category, User, Order, Cart, Review), сделать миграцию
7. ⏳ Функционал НЕ реализовывать — только UI и схема БД

## Требования

- Каждую страницу делать поэтапно, не переходить к следующей пока текущая не готова
- После каждого этапа сообщать что сделано и что будет дальше
- Использовать context7 для актуальной документации Next.js и Prisma
- Все компоненты типизировать через TypeScript интерфейсы
- Структура папок: `/app` для страниц, `/components` для компонентов, `/lib` для утилит и prisma клиента

## Порядок работы

1. ✅ Инициализация проекта
2. ✅ Настройка Tailwind с дизайн-токенами из макетов
3. ✅ Header и Footer
4. ✅ Главная страница
5. ✅ Каталог
6. ✅ Страница товара
7. ✅ Конфигуратор
8. ✅ Профиль
9. ✅ Корзина и чекаут
10. ✅ Логин и регистрация
11. ⏳ Админ-панель
12. ✅ Схема Prisma и миграция
13. ✅ 404 страница

## Текущий статус

**Выполнено:**
- ✅ Проект инициализирован (Next.js 15, TypeScript, Tailwind CSS 4)
- ✅ HTML макеты перемещены в папку `/maket`
- ✅ Созданы все страницы: home, catalog, product, configurator, profile, cart, login, register, admin, 404
- ✅ Созданы компоненты: Header, Footer, Hero, CategoryStrip, PromoBlocks, HotProducts, Brands, Features, Articles, Breadcrumbs, ProductCard, Button, Input, Badge
- ✅ Prisma инициализирована, схема описана, миграции применены на PostgreSQL
- ✅ Документация обновлена (README.md, ARCHITECTURE.md)

**В работе:**
- ⏳ Админ-панель

**Дизайн-токены из макета:**
```css
--black: #0a0a0a; --black2: #111; --black3: #1a1a1a; --black4: #222
--gray1: #2e2e2e; --gray2: #444; --gray3: #888; --gray4: #bbb
--white: #f0f0f0; --white2: #fff
--orange: #ff6a00; --orange2: #e05c00; --orange3: #ff8c33
--font-display: 'Barlow Condensed', sans-serif
--font-body: 'Barlow', sans-serif
--radius: 2px; --tr: 0.18s ease
```