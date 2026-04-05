import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

/**
 * GET /api/compare - получить список сравнения
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    // Для авторизованных пользователей
    if (session?.userId) {
      const comparison = await prisma.comparison.findFirst({
        where: { userId: session.userId },
        include: {
          items: {
            include: {
              product: {
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
                  },
                  specs: {
                    orderBy: { order: 'asc' },
                  },
                },
              },
            },
          },
        },
      });

      return NextResponse.json({
        comparison: comparison || { id: null, items: [], totalItems: 0 },
      });
    }

    // Для гостей - из session storage (через query params)
    const productIds = request.nextUrl.searchParams.get('products')?.split(',') || [];
    
    if (productIds.length === 0 || productIds[0] === '') {
      return NextResponse.json({
        comparison: { id: null, items: [], totalItems: 0 },
      });
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
        isDraft: false,
      },
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
        },
        specs: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({
      comparison: {
        id: null,
        items: products.map((product) => ({
          id: product.id,
          productId: product.id,
          product,
        })),
        totalItems: products.length,
      },
    });
  } catch (error) {
    console.error('Error fetching comparison:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comparison' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/compare - добавить товар в сравнение
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Проверяем существование товара
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Для авторизованных пользователей
    if (session?.userId) {
      // Находим или создаем сравнение
      let comparison = await prisma.comparison.findFirst({
        where: { userId: session.userId },
      });

      if (!comparison) {
        comparison = await prisma.comparison.create({
          data: {
            userId: session.userId,
          },
        });
      }

      // Проверяем, есть ли уже такой товар в сравнении
      const existingItem = await prisma.comparisonItem.findUnique({
        where: {
          comparisonId_productId: {
            comparisonId: comparison.id,
            productId,
          },
        },
      });

      if (existingItem) {
        return NextResponse.json(
          { error: 'Product already in comparison' },
          { status: 400 }
        );
      }

      // Ограничиваем количество товаров для сравнения (максимум 5)
      const itemCount = await prisma.comparisonItem.count({
        where: { comparisonId: comparison.id },
      });

      if (itemCount >= 5) {
        return NextResponse.json(
          { error: 'Maximum 5 products for comparison' },
          { status: 400 }
        );
      }

      // Добавляем товар в сравнение
      await prisma.comparisonItem.create({
        data: {
          comparisonId: comparison.id,
          userId: session.userId,
          productId,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Product added to comparison',
      });
    }

    // Для гостей - возвращаем productId для добавления в session storage
    return NextResponse.json({
      success: true,
      message: 'Product added to comparison (guest)',
      productId,
    });
  } catch (error) {
    console.error('Error adding to comparison:', error);
    return NextResponse.json(
      { error: 'Failed to add to comparison' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/compare - очистить сравнение
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');

    // Для авторизованных пользователей
    if (session?.userId) {
      if (productId) {
        // Удаляем конкретный товар
        await prisma.comparisonItem.deleteMany({
          where: {
            comparison: {
              userId: session.userId,
            },
            productId,
          },
        });
      } else {
        // Очищаем всё сравнение
        await prisma.comparisonItem.deleteMany({
          where: {
            comparison: {
              userId: session.userId,
            },
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Comparison cleared',
      });
    }

    // Для гостей - просто возвращаем успех (очистка на клиенте)
    return NextResponse.json({
      success: true,
      message: 'Comparison cleared (guest)',
    });
  } catch (error) {
    console.error('Error clearing comparison:', error);
    return NextResponse.json(
      { error: 'Failed to clear comparison' },
      { status: 500 }
    );
  }
}
