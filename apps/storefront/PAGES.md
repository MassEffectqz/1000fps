# 📄 Frontend Pages — 1000FPS

Список созданных страниц frontend приложения

---

## ✅ Созданные страницы

### 1. Главная страница

**Путь:** `app/page.tsx`  
**URL:** `/`  
**Статус:** ✅ Готово

**Компоненты:**

- Hero секция (3 слайда)
- Категории (10 иконок)
- Промо блоки (4 шт)
- Горячие предложения (таймер + товары)
- Новинки
- Бренды
- Преимущества
- Блог

**Функции:**

- Автопереключение слайдов (5 сек)
- Таймер обратного отсчёта
- Моковые данные из `@/data`

---

### 2. Каталог товаров

**Путь:** `app/catalog/page.tsx`  
**URL:** `/catalog`  
**Статус:** ✅ Готово

**Компоненты:**

- Sidebar с фильтрами
- Category tree
- Фильтр по цене
- Фильтр по бренду
- Toolbar (сортировка, вид)
- Products grid / list view
- Pagination

**Функции:**

- Переключение вида (grid/list)
- Сортировка товаров
- Фильтрация
- Пагинация

---

### 3. Страница товара

**Путь:** `app/product/[id]/page.tsx`  
**URL:** `/product/:id`  
**Статус:** ✅ Готово

**Компоненты:**

- Gallery (main + thumbs)
- Product info
- Price block
- CTA buttons
- Quick specs
- Tabs (описание, характеристики, отзывы)

**Функции:**

- Переключение изображений
- Добавление в корзину
- Добавление в вишлист
- Сравнение товаров

---

### 4. Конфигуратор ПК

**Путь:** `app/configurator/page.tsx`  
**URL:** `/configurator`  
**Статус:** ✅ Готово

**Компоненты:**

- Parts list (accordion)
- Component picker
- Compatibility checker
- Power calculator
- Summary sidebar
- Preset buttons

**Функции:**

- Выбор компонентов (8 типов)
- Проверка совместимости
- Расчёт мощности
- Сохранение конфигурации
- Готовые сборки (presets)

**Part types:**

- CPU (Процессор)
- GPU (Видеокарта)
- Motherboard (Материнская плата)
- RAM (Оперативная память)
- Storage (Накопитель)
- PSU (Блок питания)
- Case (Корпус)
- Cooling (Охлаждение)

---

### 5. Профиль пользователя

**Путь:** `app/profile/page.tsx`  
**URL:** `/profile`  
**Статус:** ✅ Готово

**Компоненты:**

- Sidebar navigation
- User info (avatar, name, email, level)
- Bonus widget
- Tab panels

**Вкладки:**

- Обзор (overview) — статистика, последние заказы
- Заказы (orders) — история заказов
- Вишлист (wishlist) — избранное
- Сборки (configs) — сохранённые конфигурации
- Бонусы (bonuses) — бонусный счёт

---

### 6. Корзина

**Путь:** `app/cart/page.tsx`  
**URL:** `/cart`  
**Статус:** ✅ Готово

**Компоненты:**

- Cart items list
- Quantity selector
- Order summary
- Checkout sidebar

**Функции:**

- Изменение количества
- Удаление товаров
- Подсчёт итоговой суммы
- Оформление заказа

---

## 📊 Layout компоненты

### Header

**Путь:** `components/layout/Header.tsx`

**Компоненты:**

- `TopBar` — город, телефон, режим работы
- `Header` — лого, поиск, действия (сравнение, вишлист, профиль, корзина)
- `Nav` — навигация (каталог, ссылки)
- `HeaderWrapper` — обёртка + promo strip

---

### Footer

**Путь:** `components/layout/Footer.tsx`

**Компоненты:**

- `Newsletter` — подписка на рассылку
- `Footer` — ссылки, контакты, соцсети, приложения
- `FooterWrapper` — обёртка

---

## 📁 Моковые данные

**Путь:** `data/mockData.ts`

**Экспортируемые данные:**

- `categories` — 10 категорий
- `promoBlocks` — 4 промо блока
- `hotProducts` — 5 горячих товаров
- `newProducts` — 5 новинок
- `brands` — 16 брендов
- `articles` — 3 статьи
- `features` — 4 преимущества
- `navLinks` — ссылки навигации
- `footerLinks` — ссылки footer
- `contacts` — контакты
- `socials` — соцсети
- `payments` — способы оплаты
- `apps` — приложения

---

## 🎨 Стили

**Глобальные стили:** `app/globals.css`

**CSS переменные:**

```css
:root {
  --black: #0a0a0a;
  --black2: #111111;
  --black3: #1a1a1a;
  --gray1: #2e2e2e;
  --gray2: #444444;
  --gray3: #888888;
  --gray4: #bbbbbb;
  --white: #f0f0f0;
  --white2: #ffffff;
  --orange: #ff6a00;
  --orange2: #e05c00;
  --orange3: #ff8c33;
  --font-display: 'Barlow Condensed', sans-serif;
  --font-body: 'Barlow', sans-serif;
  --radius: 2px;
  --tr: 0.18s ease;
}
```

---

## 🔄 Следующие шаги

### Страницы для создания:

- [ ] Checkout (оформление заказа)
- [ ] Blog (список статей)
- [ ] Blog post (статья)
- [ ] Brands (список брендов)
- [ ] Brand page (страница бренда)
- [ ] Compare (сравнение товаров)
- [ ] Wishlist (вишлист отдельной страницей)

### Компоненты для создания:

- [ ] ProductCard (вынести в UI)
- [ ] Button (вынести в UI)
- [ ] Input (вынести в UI)
- [ ] Modal (модальные окна)
- [ ] Toast (уведомления)
- [ ] Loading (скелетоны)

---

## 📝 Использование

### Импорт layout компонентов:

```tsx
import { HeaderWrapper, FooterWrapper } from '@/components/layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderWrapper>
        <main>{children}</main>
      </HeaderWrapper>
      <FooterWrapper />
    </>
  );
}
```

### Импорт моковых данных:

```tsx
import { categories, products } from '@/data';

export default function Catalog() {
  return (
    <div>
      {categories.map((cat) => (
        <Link key={cat.id} href={`/catalog/${cat.slug}`}>
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
```

---

**Версия:** 1.0.0  
**Последнее обновление:** Март 2026
