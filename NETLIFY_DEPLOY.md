# Деплой на Netlify — Инструкция

## 📋 Обзор

Этот проект подготовлен для демонстрации дизайна клиенту через Netlify. В демо-режиме приложение работает **без базы данных** — используются моковые данные (10 товаров: видеокарты, процессоры, материнки, память, SSD, мониторы).

## 🚀 Быстрый деплой (рекомендуемый)

### Способ 1: Через Netlify Dashboard (CLI)

1. **Установите Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Авторизуйтесь:**
   ```bash
   netlify login
   ```

3. **Создайте сайт и задеплойте:**
   ```bash
   netlify init
   ```
   - Выберите "Create & configure a new site"
   - Выберите команду сборки: `npm run build`
   - Publish directory: `.next`

4. **Добавьте переменную окружения:**
   ```bash
   netlify env:set NEXT_PUBLIC_DEMO_MODE true
   netlify env:set JWT_SECRET "your-secret-key-here"
   ```

5. **Деплой:**
   ```bash
   netlify deploy --prod
   ```

### Способ 2: Через Git (автоматический деплой)

1. **Запушьте код в GitHub/GitLab/Bitbucket**

2. **Подключите репозиторий в Netlify:**
   - Зайдите на https://app.netlify.com
   - Нажмите "Add new site" → "Import an existing project"
   - Выберите ваш репозиторий

3. **Настройте сборку:**
   - Build command: `npm run build`
   - Publish directory: `.next`

4. **Добавьте Environment Variables:**
   ```
   NEXT_PUBLIC_DEMO_MODE = true
   JWT_SECRET = your-secret-key-here
   ```

5. **Нажмите "Deploy site"**

### Способ 3: Drag & Drop (самый простой)

1. **Соберите проект локально:**
   ```bash
   npm run build
   ```

2. **Зайдите на https://app.netlify.com/drop**

3. **Перетащите папку `.next` в браузер**

⚠️ **Важно:** Для этого способа нужно вручную добавить env vars в Settings → Environment variables.

## ⚙️ Переменные окружения

| Переменная | Описание | Пример |
|-----------|----------|--------|
| `NEXT_PUBLIC_DEMO_MODE` | Включает моковые данные | `true` |
| `JWT_SECRET` | Секрет для middleware | `any-random-string` |
| `NEXT_PUBLIC_APP_URL` | URL сайта | `https://mysite.netlify.app` |

## 📦 Моковые данные

В демо-режиме доступны **10 товаров**:

### Видеокарты (3)
- NVIDIA RTX 5090 32GB — 189 990 ₽
- AMD RX 9070 XT 16GB — 74 990 ₽
- MSI RTX 4070 Ti SUPER 16GB — 64 990 ₽

### Процессоры (3)
- AMD Ryzen 9 9950X — 62 990 ₽
- Intel Core Ultra 9 285K — 58 990 ₽
- AMD Ryzen 7 9800X3D — 42 990 ₽

### Комплектующие (4)
- ASUS ROG Strix Z890-E Gaming (материнка) — 42 990 ₽
- G.Skill Trident Z5 RGB DDR5 32GB — 12 990 ₽
- Samsung 990 EVO Plus 2TB SSD — 16 990 ₽
- ASUS ROG Swift OLED PG27AQDM 27" 4K 240Hz — 89 990 ₽

## 🎨 Что работает в демо-режиме

✅ Главная страница с товарами  
✅ Каталог с фильтрами и сортировкой  
✅ Страница товара с характеристиками  
✅ Корзина (localStorage)  
✅ Wishlist (localStorage)  
✅ Сравнение товаров  
✅ Поиск по каталогу  
✅ Админ-панель (визуально, без сохранения)  

## ⚠️ Ограничения демо-режима

❌ Нет регистрации/авторизации  
❌ Нет оформления заказов  
❌ Нет серверной части админки (CRUD)  
❌ Данные не сохраняются — всё в памяти  

## 🔄 Переключение между режимами

Для переключения на продакшн-режим (с базой данных):

1. Удалите или измените `NEXT_PUBLIC_DEMO_MODE=false`
2. Добавьте `DATABASE_URL` с PostgreSQL подключением
3. Запустите миграции: `npx prisma migrate deploy`

## 🐛 Troubleshooting

### Ошибка сборки "Cannot find module '@/lib/demo-mode'"
- Убедитесь, что все файлы созданы в `src/lib/`
- Проверьте `tsconfig.json` наличие `"paths": { "@/*": ["./src/*"] }`

### Пустая главная страница
- Проверьте, что `NEXT_PUBLIC_DEMO_MODE=true` установлен в Netlify
- Откройте консоль браузера на наличие ошибок

### Не загружаются изображения
- В демо-режиме используются placeholder пути `/images/mock/*.jpg`
- Для реальных изображений загрузите их в `/public/images/mock/`

### Ошибка middleware
- Убедитесь, что `JWT_SECRET` установлен
- Проверьте `middleware.ts` на наличие импортов

## 📝 Структура файлов для демо

```
├── netlify.toml                  # Конфигурация Netlify
├── .env.demo                     # Env vars для демо
├── src/lib/
│   ├── mock-data.ts              # Моковые данные (10 товаров)
│   ├── demo-mode.ts              # Утилиты демо-режима
│   └── actions/
│       ├── catalog.ts            # Server Actions с демо-поддержкой
│       └── warehouse.ts          # Склады с демо-поддержкой
└── NETLIFY_DEPLOY.md             # Этот файл
```

## 🎯 Ссылки

- **Netlify Docs:** https://docs.netlify.com/
- **Next.js on Netlify:** https://docs.netlify.com/frameworks/next-js/
- **CLI Docs:** https://docs.netlify.com/cli/get-started/

---

**Готово!** 🎉 После деплоя вы получите ссылку вида `https://your-site.netlify.app`, которую можно отправить клиенту для демонстрации.
