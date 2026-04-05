'use server';

import { Decimal } from '@prisma/client/runtime/library';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { isDemoMode } from '@/lib/demo-mode';
import { 
  mockProducts,
  filterMockProducts,
  getMockCategoriesWithCount,
  getMockBrands,
  type MockProduct
} from '@/lib/mock-data';
import { prisma } from '@/lib/prisma';

/**
 * Helper: format product for catalog display
 */
function formatMockProduct(product: MockProduct | Record<string, unknown>) {
  const price = (product as MockProduct).price || 0;
  const discountValue = (product as MockProduct).discountValue || 0;
  let discountedPrice = price;

  if (discountValue > 0) {
    if ((product as MockProduct).discountType === 'PERCENT') {
      discountedPrice = price * (1 - discountValue / 100);
    } else {
      discountedPrice = Math.max(0, price - discountValue);
    }
  }

  const images = (product as MockProduct).images as Array<{ isMain: boolean; url: string }> | undefined;
  const mainImage = images?.find((img) => img.isMain) || images?.[0];
  
  const specs = (product as MockProduct).specs as Array<{ value: string; unit?: string }> | undefined;
  const specsString = specs
    ?.slice(0, 3)
    .map((spec) => `${spec.value}${spec.unit || ''}`)
    .join(' / ');

  const badges: Array<{ text: string; variant: 'orange' | 'green' | 'blue' | 'gray' | 'yellow' }> = [];

  if (discountedPrice < price) {
    const discountPercent = product.discountType === 'PERCENT'
      ? discountValue
      : Math.round((discountValue / price) * 100);
    badges.push({ text: `-${discountPercent}%`, variant: 'orange' });
  }

  if ((product as MockProduct).isHit) {
    badges.push({ text: 'Хит', variant: 'gray' });
  }

  if ((product as MockProduct).isNew) {
    badges.push({ text: 'NEW', variant: 'orange' });
  }

  if ((product as MockProduct).isFeatured) {
    badges.push({ text: 'Рекомендуем', variant: 'blue' });
  }

  if ((product as MockProduct).stock > 0) {
    badges.push({ text: 'В наличии', variant: 'green' });
  }

  return {
    id: (product as MockProduct).id,
    name: (product as MockProduct).name,
    slug: (product as MockProduct).slug,
    sku: (product as MockProduct).sku,
    price: Math.round(price),
    oldPrice: price !== discountedPrice ? Math.round(price) : null,
    discountedPrice: Math.round(discountedPrice),
    discount: discountValue > 0 ? discountValue : null,
    discountType: (product as MockProduct).discountType,
    rating: (product as MockProduct).rating,
    reviewCount: (product as MockProduct).reviewCount,
    salesCount: (product as MockProduct).salesCount,
    stock: (product as MockProduct).stock,
    specs: specsString || '',
    badges,
    category: (product as MockProduct).category ? {
      id: String(((product as MockProduct).category as unknown as Record<string, unknown>).id),
      name: String(((product as MockProduct).category as unknown as Record<string, unknown>).name),
      slug: String(((product as MockProduct).category as unknown as Record<string, unknown>).slug),
    } : { id: '', name: 'Без категории', slug: '' },
    brand: (product as MockProduct).brand ? {
      id: String(((product as MockProduct).brand as unknown as Record<string, unknown>).id),
      name: String(((product as MockProduct).brand as unknown as Record<string, unknown>).name),
      slug: String(((product as MockProduct).brand as unknown as Record<string, unknown>).slug),
    } : null,
    image: mainImage?.url || null,
    href: `/product/${(product as MockProduct).slug}`,
  };
}

/**
 * Получить товары с кэшированием
 * Используется для витрины товаров на публичных страницах
 */
export const getProducts = cache(
  unstable_cache(
    async (options?: {
      page?: number;
      limit?: number;
      categoryId?: string;
      brandId?: string;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
      isInStock?: boolean;
      sortBy?: 'popular' | 'price-asc' | 'price-desc' | 'newest' | 'rating' | 'sales';
      sortOrder?: 'asc' | 'desc';
    }) => {
      // Демо-режим
      if (isDemoMode()) {
        const {
          page = 1,
          limit = 20,
          categoryId,
          brandId,
          minPrice,
          maxPrice,
          isInStock,
          sortBy = 'popular',
        } = options || {};

        const filtered = filterMockProducts({
          categoryId,
          brandId,
          priceMin: minPrice,
          priceMax: maxPrice,
          inStock: isInStock,
          sort: sortBy,
        });

        // Поиск
        let result = filtered;
        if (options?.search) {
          const query = options.search.toLowerCase();
          result = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(query) ||
              p.description?.toLowerCase().includes(query) ||
              p.sku.toLowerCase().includes(query)
          );
        }

        const total = result.length;
        const skip = (page - 1) * limit;
        const paginated = result.slice(skip, skip + limit);

        return {
          products: paginated.map(formatMockProduct),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      }

      // Продакшн-режим (Prisma)
      const {
        page = 1,
        limit = 20,
        categoryId,
        brandId,
        minPrice,
        maxPrice,
        search,
        isInStock,
        sortBy = 'popular',
        sortOrder = 'desc',
      } = options || {};

      const skip = (page - 1) * limit;

      // Построение where условия
      const where: Record<string, unknown> = {
        isActive: true,
        isDraft: false,
      };

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (brandId) {
        where.brandId = brandId;
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) {
          (where.price as Record<string, unknown>).gte = new Decimal(minPrice);
        }
        if (maxPrice !== undefined) {
          (where.price as Record<string, unknown>).lte = new Decimal(maxPrice);
        }
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (isInStock) {
        where.stock = { gt: 0 };
      }

      // Построение orderBy условия
      let orderBy: Record<string, unknown>[] = [];

      switch (sortBy) {
        case 'price-asc':
          orderBy = [{ price: 'asc' }];
          break;
        case 'price-desc':
          orderBy = [{ price: 'desc' }];
          break;
        case 'newest':
          orderBy = [{ createdAt: 'desc' }];
          break;
        case 'rating':
          orderBy = [{ rating: 'desc' }];
          break;
        case 'sales':
          orderBy = [{ salesCount: 'desc' }];
          break;
        case 'popular':
        default:
          orderBy = [{ salesCount: 'desc' }, { rating: 'desc' }];
          break;
      }

      // Применяем sortOrder для сортировки по умолчанию (popular)
      if (sortBy === 'popular' && sortOrder === 'asc') {
        orderBy = [{ salesCount: 'asc' }, { rating: 'asc' }];
      }

      // Получение товаров и общего количества
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            brand: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            images: {
              where: { isMain: true },
              take: 1,
              orderBy: { order: 'asc' },
            },
            specs: {
              take: 3,
              orderBy: { order: 'asc' },
            },
            tags: {
              include: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    color: true,
                  },
                },
              },
            },
          },
          skip,
          take: limit,
          orderBy,
        }),
        prisma.product.count({ where }),
      ]);

      // Форматирование ответа
      const formattedProducts = products.map((product) => {
        const price = Number(product.price);
        const discountValue = Number(product.discountValue);
        let discountedPrice = price;

        if (discountValue > 0) {
          if (product.discountType === 'PERCENT') {
            discountedPrice = price * (1 - discountValue / 100);
          } else {
            discountedPrice = Math.max(0, price - discountValue);
          }
        }

        const mainImage = product.images.find(img => img.isMain) || product.images[0];
        const specsString = product.specs
          .map(spec => `${spec.value}${spec.unit || ''}`)
          .join(' / ');

        // Определяем бейджи
        const badges: Array<{ text: string; variant: 'orange' | 'green' | 'blue' | 'gray' | 'yellow' }> = [];

        if (discountedPrice < price) {
          const discountPercent = product.discountType === 'PERCENT'
            ? discountValue
            : Math.round((discountValue / price) * 100);
          badges.push({ text: `-${discountPercent}%`, variant: 'orange' });
        }

        if (product.isHit) {
          badges.push({ text: 'Хит', variant: 'gray' });
        }

        if (product.isNew) {
          badges.push({ text: 'NEW', variant: 'orange' });
        }

        if (product.isFeatured) {
          badges.push({ text: 'Рекомендуем', variant: 'blue' });
        }

        if (product.stock > 0) {
          badges.push({ text: 'В наличии', variant: 'green' });
        }

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price: Math.round(price),
          oldPrice: price !== discountedPrice ? Math.round(price) : null,
          discountedPrice: Math.round(discountedPrice),
          discount: discountValue > 0 ? discountValue : null,
          discountType: product.discountType,
          rating: product.rating,
          reviewCount: product.reviewCount,
          salesCount: product.salesCount,
          stock: product.stock,
          specs: specsString,
          badges,
          category: product.category,
          brand: product.brand,
          image: mainImage?.url || null,
          href: `/product/${product.slug}`,
        };
      });

      return {
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    },
    ['products'],
    {
      revalidate: 60, // Кэшировать на 60 секунд
      tags: ['products'],
    }
  )
);

/**
 * Получить горячие товары (хиты продаж)
 */
export const getHotProducts = cache(
  unstable_cache(
    async (limit: number = 5) => {
      // Демо-режим
      if (isDemoMode()) {
        const hotProducts = mockProducts
          .filter((p) => p.isHit)
          .sort((a, b) => b.salesCount - a.salesCount)
          .slice(0, limit);
        return hotProducts.map(formatMockProduct);
      }

      // Продакшн-режим
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          isDraft: false,
          isHit: true,
        },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          brand: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            where: { isMain: true },
            take: 1,
            orderBy: { order: 'asc' },
          },
          specs: {
            orderBy: { order: 'asc' },
          },
        },
        take: limit,
        orderBy: {
          salesCount: 'desc',
        },
      });

      return products.map((product) => {
        const price = Number(product.price);
        const discountValue = Number(product.discountValue);
        let discountedPrice = price;

        if (discountValue > 0) {
          if (product.discountType === 'PERCENT') {
            discountedPrice = price * (1 - discountValue / 100);
          } else {
            discountedPrice = Math.max(0, price - discountValue);
          }
        }

        const mainImage = product.images.find(img => img.isMain) || product.images[0];
        const specsString = product.specs
          .map(spec => `${spec.value}${spec.unit || ''}`)
          .join(' / ');

        const badges: Array<{ text: string; variant: 'orange' | 'green' | 'blue' | 'gray' | 'yellow' }> = [];

        if (discountedPrice < price) {
          const discountPercent = product.discountType === 'PERCENT'
            ? discountValue
            : Math.round((discountValue / price) * 100);
          badges.push({ text: `-${discountPercent}%`, variant: 'orange' });
        }

        badges.push({ text: 'Хит', variant: 'gray' });

        if (product.stock > 0) {
          badges.push({ text: 'В наличии', variant: 'green' });
        }

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price: Math.round(price),
          oldPrice: price !== discountedPrice ? Math.round(price) : null,
          discountedPrice: Math.round(discountedPrice),
          rating: product.rating,
          reviewCount: product.reviewCount,
          specs: specsString,
          badges,
          category: product.category,
          brand: product.brand,
          image: mainImage?.url || null,
          href: `/product/${product.slug}`,
        };
      });
    },
    ['hot-products'],
    {
      revalidate: 300, // Кэшировать на 5 минут
      tags: ['products', 'hot-products'],
    }
  )
);

/**
 * Получить новинки
 */
export const getNewProducts = cache(
  unstable_cache(
    async (limit: number = 10) => {
      // Демо-режим
      if (isDemoMode()) {
        const newProducts = mockProducts
          .filter((p) => p.isNew)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
        return newProducts.map((product) => {
          const price = product.price;
          const mainImage = product.images?.find((img) => img.isMain) || product.images?.[0];
          return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: Math.round(price),
            rating: product.rating,
            image: mainImage?.url || null,
            href: `/product/${product.slug}`,
          };
        });
      }

      // Продакшн-режим
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          isDraft: false,
          isNew: true,
        },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          brand: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            where: { isMain: true },
            take: 1,
          },
        },
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return products.map((product) => {
        const price = Number(product.price);
        const mainImage = product.images.find(img => img.isMain) || product.images[0];

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Math.round(price),
          rating: product.rating,
          image: mainImage?.url || null,
          href: `/product/${product.slug}`,
        };
      });
    },
    ['new-products'],
    {
      revalidate: 300,
      tags: ['products', 'new-products'],
    }
  )
);

/**
 * Получить товар по slug
 */
export const getProductBySlug = cache(
  unstable_cache(
    async (slug: string) => {
      // Демо-режим
      if (isDemoMode()) {
        const mockProduct = mockProducts.find((p) => p.slug === slug);
        if (!mockProduct) return null;

        const price = mockProduct.price;
        const discountValue = mockProduct.discountValue || 0;
        let discountedPrice = price;

        if (discountValue > 0) {
          if (mockProduct.discountType === 'PERCENT') {
            discountedPrice = price * (1 - discountValue / 100);
          } else {
            discountedPrice = Math.max(0, price - discountValue);
          }
        }

        return {
          ...mockProduct,
          price,
          discountedPrice,
          discountValue,
        };
      }

      // Продакшн-режим
      const product = await prisma.product.findUnique({
        where: { slug, isActive: true, isDraft: false },
        include: {
          category: {
            include: {
              parent: true,
            },
          },
          brand: true,
          images: {
            orderBy: { order: 'asc' },
          },
          specs: {
            orderBy: { order: 'asc' },
          },
          variants: {
            orderBy: { order: 'asc' },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          reviewItems: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: {
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      if (!product) {
        return null;
      }

      const price = Number(product.price);
      const discountValue = Number(product.discountValue);
      let discountedPrice = price;

      if (discountValue > 0) {
        if (product.discountType === 'PERCENT') {
          discountedPrice = price * (1 - discountValue / 100);
        } else {
          discountedPrice = Math.max(0, price - discountValue);
        }
      }

      return {
        ...product,
        price,
        discountedPrice,
        discountValue,
      };
    },
    ['product-by-slug'],
    {
      revalidate: 60,
      tags: ['products'],
    }
  )
);

/**
 * Получить категории с количеством товаров
 */
export const getCategoriesWithCount = cache(
  unstable_cache(
    async () => {
      // Демо-режим
      if (isDemoMode()) {
        return getMockCategoriesWithCount();
      }

      // Продакшн-режим
      const categories = await prisma.category.findMany({
        where: {
          isActive: true,
          parentId: null,
        },
        include: {
          children: {
            where: { isActive: true },
            include: {
              _count: {
                select: {
                  products: {
                    where: { isActive: true, isDraft: false },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              products: {
                where: { isActive: true, isDraft: false },
              },
            },
          },
        },
        orderBy: { order: 'asc' },
      });

      return categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        count: cat._count.products,
        children: cat.children.map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          count: child._count.products,
        })),
      }));
    },
    ['categories-with-count'],
    {
      revalidate: 300,
      tags: ['categories'],
    }
  )
);

/**
 * Получить бренды с количеством товаров
 */
export const getBrandsWithCount = cache(
  unstable_cache(
    async () => {
      // Демо-режим
      if (isDemoMode()) {
        return getMockBrands().map((brand) => ({
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          logo: brand.logo,
          count: mockProducts.filter((p) => p.brandId === brand.id).length,
        }));
      }

      // Продакшн-режим
      const brands = await prisma.brand.findMany({
        where: {
          isActive: true,
        },
        include: {
          _count: {
            select: {
              products: {
                where: { isActive: true, isDraft: false },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      return brands.map((brand) => ({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo,
        count: brand._count.products,
      }));
    },
    ['brands-with-count'],
    {
      revalidate: 300,
      tags: ['brands'],
    }
  )
);
