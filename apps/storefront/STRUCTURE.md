# 📚 Frontend Structure — 1000FPS Storefront

Модульная структура frontend приложения Next.js

---

## 📁 Структура папок

```
apps/storefront/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Главный layout с Header и Footer
│   │   ├── page.tsx              # Главная страница
│   │   ├── globals.css           # Глобальные стили
│   │   └── ...
│   │
│   ├── components/               # React компоненты
│   │   ├── layout/               # Layout компоненты
│   │   │   ├── Header.tsx        # Header (TopBar, Header, Nav)
│   │   │   ├── Footer.tsx        # Footer (Newsletter, Footer)
│   │   │   └── index.ts          # Экспорты layout
│   │   ├── ui/                   # UI компоненты (кнопки, инпуты...)
│   │   └── sections/             # Секции страницы
│   │
│   ├── data/                     # Моковые данные
│   │   ├── mockData.ts           # Все моковые данные
│   │   └── index.ts              # Экспорты данных
│   │
│   ├── lib/                      # Утилиты, хелперы, API client
│   ├── hooks/                    # Кастомные хуки
│   ├── store/                    # Zustand stores
│   └── types/                    # TypeScript типы
│
├── public/                       # Статические файлы
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 🧩 Компоненты

### Layout компоненты

**`src/components/layout/Header.tsx`**

- `TopBar` — Верхняя панель (город, телефон, режим работы)
- `Header` — Шапка (лого, поиск, действия)
- `Nav` — Навигация (каталог, ссылки)
- `HeaderWrapper` — Обёртка для всех header компонентов

**`src/components/layout/Footer.tsx`**

- `Newsletter` — Подписка на рассылку
- `Footer` — Подвал (ссылки, контакты, соцсети)
- `FooterWrapper` — Обёрка для newsletter + footer

### Использование

```tsx
import { HeaderWrapper, FooterWrapper } from '@/components/layout';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <HeaderWrapper>
          <main>{children}</main>
        </HeaderWrapper>
        <FooterWrapper />
      </body>
    </html>
  );
}
```

---

## 📊 Моковые данные

**`src/data/mockData.ts`**

Экспортируемые данные:

| Данные        | Описание                  |
| ------------- | ------------------------- |
| `categories`  | Категории товаров (10 шт) |
| `promoBlocks` | Промо блоки (4 шт)        |
| `hotProducts` | Горячие товары (5 шт)     |
| `newProducts` | Новинки (5 шт)            |
| `brands`      | Бренды (16 шт)            |
| `articles`    | Статьи блога (3 шт)       |
| `features`    | Преимущества (4 шт)       |
| `navLinks`    | Ссылки навигации          |
| `footerLinks` | Ссылки footer             |
| `contacts`    | Контакты                  |
| `socials`     | Соцсети                   |
| `payments`    | Способы оплаты            |
| `apps`        | Приложения                |

### Использование

```tsx
import { categories, hotProducts } from '@/data';

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

## 🎨 Стили

**`src/app/globals.css`**

CSS переменные из оригинального дизайна:

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

### Для разработки

1. **Создать каталог страниц:**

   ```
   app/
   ├── catalog/
   │   └── [category]/
   │       └── page.tsx
   ├── product/
   │   └── [slug]/
   │       └── page.tsx
   ├── cart/
   │   └── page.tsx
   └── configurator/
       └── page.tsx
   ```

2. **Создать UI компоненты:**

   ```
   components/ui/
   ├── Button.tsx
   ├── Input.tsx
   ├── ProductCard.tsx
   └── ...
   ```

3. **Настроить API client:**

   ```
   lib/
   └── api.ts
   ```

4. **Настроить Zustand store:**
   ```
   store/
   ├── cart.ts
   ├── wishlist.ts
   └── configurator.ts
   ```

---

## 📝 Преимущества структуры

✅ **Модульность** — компоненты переиспользуемы  
✅ **Разделение ответственности** — layout, ui, sections разделены  
✅ **Моковые данные** — легко тестировать без API  
✅ **TypeScript** — полная типизация  
✅ **CSS переменные** — соответствие оригинальному дизайну  
✅ **Экспорты** — удобные импорты через index.ts

---

_Версия: 1.0.0 | Последнее обновление: Март 2026_
