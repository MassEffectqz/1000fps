'use server';

import { Decimal } from '@prisma/client/runtime/library';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';

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
      hasDiscount?: boolean;
      sortBy?: 'popular' | 'price-asc' | 'price-desc' | 'newest' | 'rating' | 'sales';
      sortOrder?: 'asc' | 'desc';
    }) => {
      const {
        page = 1,
        limit = 20,
        categoryId,
        brandId,
        minPrice,
        maxPrice,
        search,
        isInStock,
        hasDiscount,
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

      // Товары со скидкой (реальная скидка - discountValue > 0)
      if (hasDiscount) {
        where.discountValue = { gt: 0 };
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
