import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const categoryId = searchParams.get('categoryId');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const isInStock = searchParams.get('inStock') === 'true';
    const isUsed = searchParams.get('isUsed') === 'true';
    const sortBy = searchParams.get('sortBy') || 'popular';

    const where: Record<string, unknown> = {
      isActive: true,
      isDraft: false,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (brand) {
      where.brand = { slug: brand };
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
      ];
    }

    if (isInStock) {
      where.stock = { gt: 0 };
    }

    if (isUsed) {
      where.isUsed = true;
    }

    let orderBy: Record<string, string> = {};
    switch (sortBy) {
      case 'price':
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
      default:
        orderBy = { isFeatured: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { name: true } },
          brand: { select: { name: true } },
          images: { where: { isMain: true }, take: 1 },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
        images: p.images.map(i => ({ url: i.url })),
        category: p.category,
        brand: p.brand,
        isHit: p.isHit,
        isNew: p.isNew,
        isFeatured: p.isFeatured,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Catalog error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}