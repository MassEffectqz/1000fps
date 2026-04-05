import { MetadataRoute } from 'next';

/**
 * Генерация sitemap.xml для статических страниц
 * Динамические страницы (товары, категории) добавляются через sitemap.tsx
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Статические страницы
const staticPages = [
  {
    url: '',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  },
  {
    url: '/catalog',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  },
  {
    url: '/configurator',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  },
  {
    url: '/faq',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: '/cart',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.5,
  },
  {
    url: '/wishlist',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  },
  {
    url: '/compare',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return staticPages.map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: page.lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
