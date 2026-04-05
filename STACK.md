# Стек 1000FPS

## Фронтенд
- Next.js 15 + TypeScript + Tailwind
- SSR для каталога, CSR для конфигуратора

## Инфраструктура
- CDN: Cloudflare или Vercel Edge
- Поиск: Meilisearch или Typesense
- Изображения: Next/Image + S3 + CloudFront

## Бэкенд
- API: tRPC или Fastify REST
- Валидация: Zod
- Auth: NextAuth

## Сервисы
- Каталог: фильтры, сортировка, 1000+ товаров
- Заказы: корзина, checkout, статусы
- Конфигуратор: совместимость компонентов
- Пользователи: профили, вишлист

## Данные
- PostgreSQL: товары, заказы, пользователи
- Redis: сессии, кэш, очереди
- S3: фото товаров, документы

## Админка и фоновые задачи
- React Admin или Payload CMS
- BullMQ + Redis

## Мониторинг
- Sentry + Grafana + Prometheus

## Деплой
- Vercel (фронт) + Railway (бэк)
- или Docker + Hetzner VPS + Nginx

DATABASE_URL="postgresql://danya:пароль@localhost:5432/fps1000"
