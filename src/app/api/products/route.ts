import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * GET /api/products - получить товары для витрины
 * Поддерживает фильтрацию, сортировку и пагинацию
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Пагинация
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Фильтры
    const categoryId = searchParams.get('categoryId');
    const brandId = searchParams.get('brandId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const isInStock = searchParams.get('isInStock');
    
    // Сортировка
    const sortBy = searchParams.get('sortBy') || 'popular';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

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

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        (where.price as Record<string, unknown>).gte = new Decimal(minPrice);
      }
      if (maxPrice) {
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

    if (isInStock === 'true') {
      where.stock = { gt: 0 };
    }

    // Построение orderBy условия
    let orderBy: Record<string, unknown> = {};
    
    switch (sortBy) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'sales':
        orderBy = { salesCount: 'desc' };
        break;
      case 'popular':
      default:
        orderBy = [{ salesCount: 'desc' }, { rating: 'desc' }];
        break;
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
      // Вычисляем цену со скидкой
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

      // Форматируем спецификации в строку
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

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        categoryId,
        brandId,
        minPrice,
        maxPrice,
        search,
        isInStock,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
