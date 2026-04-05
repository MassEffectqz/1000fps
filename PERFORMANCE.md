# Оптимизация производительности 1000FPS

## 📊 Реализованные оптимизации

### 1. Ленивая загрузка изображений

**Компонент:** `src/components/ui/lazy-image.tsx`

Использует Intersection Observer для загрузки изображений только когда они появляются в области видимости.

```tsx
import { LazyImage } from '@/components/ui/lazy-image';

<LazyImage
  src="/product.jpg"
  alt="Товар"
  width={300}
  height={300}
  placeholderBlur={true}
  threshold={0.1}
  rootMargin="200px"
/>
```

**Преимущества:**
- ⚡ Быстрая первоначальная загрузка страницы
- 📉 Меньше трафика (не загружаются невидимые изображения)
- 🎯 Автоматический placeholder с анимацией

### 2. Ленивая загрузка компонентов

**Компонент:** `src/components/ui/lazy-load.tsx`

Загружает тяжелые компоненты только когда они нужны.

```tsx
import { LazyLoad } from '@/components/ui/lazy-load';

<LazyLoad threshold={0.1} rootMargin="200px">
  <HeavyComponent />
</LazyLoad>
```

### 3. Кэширование

#### Redis (внешний кэш)

**Файл:** `src/lib/cache/redis.ts`

Для подключения Redis:
```bash
docker compose -f docker-compose.redis.yml up -d
```

Использование:
```typescript
import { cacheGetOrSet } from '@/lib/cache/redis';

const products = await cacheGetOrSet(
  'products:category:1',
  async () => {
    return await prisma.product.findMany({...});
  },
  3600 // TTL 1 час
);
```

#### In-Memory кэш (LRU)

**Файл:** `src/lib/cache/memory.ts`

Быстрый кэш в памяти процесса для часто используемых данных.

```typescript
import { getProductCache } from '@/lib/cache/memory';

const cache = getProductCache();
cache.set('product:123', productData, 600); // 10 минут
const data = cache.get('product:123');
```

**Типы кэшей:**
- `productCache` - товары (500 элементов, 10 мин)
- `categoryCache` - категории (100 элементов, 30 мин)
- `userCache` - пользователи (1000 элементов, 5 мин)
- `configCache` - конфигурация (50 элементов, 1 час)

### 4. Оптимизированные хуки

**Файл:** `src/lib/hooks/performance.ts`

#### useDebounce
```tsx
const debouncedSearch = useDebounce((query) => {
  // Поиск
}, 300);
```

#### useThrottle
```tsx
const throttledScroll = useThrottle(() => {
  // Обработка скролла
}, 100);
```

#### useVirtualList
```tsx
const { visibleItems, offsetY } = useVirtualList(
  items,
  50, // высота элемента
  600, // высота контейнера
  scrollTop
);
```

## 📈 Метрики производительности

### Целевые показатели

| Метрика | Цель | Текущее |
|---------|------|---------|
| LCP (Largest Contentful Paint) | < 2.5s | - |
| FID (First Input Delay) | < 100ms | - |
| CLS (Cumulative Layout Shift) | < 0.1 | - |
| TTFB (Time to First Byte) | < 600ms | - |
| Bundle Size (main) | < 200KB | - |

### Как измерить

```bash
# Lighthouse CLI
npm install -g lighthouse
lighthouse http://localhost:3000 --output html --output-path report.html

# Chrome DevTools
# Performance tab -> Record
```

## 🚀 Рекомендации

### Изображения
- ✅ Используйте `LazyImage` для всех изображений ниже первого экрана
- ✅ Оптимизируйте изображения (WebP, AVIF)
- ✅ Указывайте `width` и `height` для предотвращения CLS
- ✅ Используйте `sizes` атрибут для responsive images

### Компоненты
- ✅ `React.memo()` для чистых компонентов
- ✅ `useCallback()` для функций передаваемых в дочерние компоненты
- ✅ `useMemo()` для тяжелых вычислений
- ✅ Ленивая загрузка для тяжелых компонентов

### Запросы к API
- ✅ Кэшируйте ответы (Redis для общих данных, Memory для пользовательских)
- ✅ Используйте debouncing для поиска
- ✅ Пагинация и infinite scroll для больших списков
- ✅ GraphQL или tRPC для точного получения данных

### Сборка
- ✅ Code splitting по страницам
- ✅ Динамические импорты для тяжелых библиотек
- ✅ Tree shaking неиспользуемого кода
- ✅ Минификация и сжатие

## 🔧 Настройка Redis

### Локально
```bash
docker run -d -p 6379:6379 --name 1000fps-redis redis:7-alpine
```

### Docker Compose
```bash
docker compose -f docker-compose.redis.yml up -d
```

### Переменные окружения
```env
REDIS_URL=redis://localhost:6379
```

### Мониторинг
```bash
# Подключиться к Redis CLI
docker exec -it 1000fps-redis redis-cli

# Проверить использование памяти
INFO memory

# Посмотреть ключи
KEYS *

# Очистить кэш
FLUSHALL
```

## 📦 Bundle Optimization

### Анализ размера бандла
```bash
npm install --save-dev @next/bundle-analyzer
```

```js
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({});
```

```bash
npm run build
ANALYZE=true npm run build
```

### Оптимизации в next.config.ts
```typescript
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};
```

## 🎯 Чеклист перед деплоем

- [ ] Изображения оптимизированы (WebP/AVIF)
- [ ] Ленивая загрузка для всех изображений
- [ ] Кэширование настроено (Redis)
- [ ] Bundle size < 200KB
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] Сжатие gzip/brotli включено
- [ ] CDN для статики

## 📚 Дополнительные ресурсы

- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [Redis Best Practices](https://redis.io/docs/manual/optimization/)
- [Image Optimization](https://web.dev/fast/#optimize-your-images)
