import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-helpers';
import { getReviewsSchema, createReviewSchema } from '@/lib/validations/review';
import type { Prisma } from '@prisma/client';

type ReviewWhereInput = Prisma.ReviewWhereInput;
type ReviewOrderByWithRelationInput = Prisma.ReviewOrderByWithRelationInput;

/**
 * GET /api/reviews - получить отзывы
 * Query params: productId, page, limit, rating, sortBy
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const validation = getReviewsSchema.safeParse({
      productId: searchParams.get('productId'),
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      rating: searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined,
      sortBy: searchParams.get('sortBy') || 'newest',
      isApproved: searchParams.get('isApproved') !== 'false',
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Некорректные параметры' },
        { status: 400 }
      );
    }

    const { productId, page, limit, rating, sortBy, isApproved } = validation.data;
    const skip = (page - 1) * limit;

    // Фильтры
    const where: ReviewWhereInput = { isApproved };

    if (productId) {
      where.productId = productId;
    }

    if (rating) {
      where.rating = rating;
    }

    // Сортировка
    let orderBy: ReviewOrderByWithRelationInput = {};
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'highest':
        orderBy = { rating: 'desc' };
        break;
      case 'lowest':
        orderBy = { rating: 'asc' };
        break;
      case 'helpful':
        orderBy = { helpful: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Получаем отзывы
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    // Получаем агрегированный рейтинг для товара (если указан productId)
    let averageRating: number | null = null;
    let ratingDistribution: Record<number, number> | null = null;
    
    if (productId) {
      const [avgResult, distributionResult] = await Promise.all([
        prisma.review.aggregate({
          where: { productId, isApproved: true },
          _avg: { rating: true },
          _count: { rating: true },
        }),
        prisma.review.groupBy({
          by: ['rating'],
          where: { productId, isApproved: true },
          _count: { rating: true },
        }),
      ]);

      averageRating = avgResult._avg.rating || 0;

      // Распределение по звездам
      ratingDistribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      distributionResult.forEach((item) => {
        if (ratingDistribution) {
          ratingDistribution[item.rating] = item._count.rating;
        }
      });
    }

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      averageRating,
      ratingDistribution,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении отзывов' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews - создать отзыв
 * Body: { productId, rating, title, text, pros, cons }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Некорректные данные' },
        { status: 400 }
      );
    }

    const { productId, rating, title, text, pros, cons } = validation.data;

    // Проверяем существование товара
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true, isDraft: false },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    // Проверяем, не оставлял ли пользователь уже отзыв на этот товар
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: session.userId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Вы уже оставляли отзыв на этот товар' },
        { status: 400 }
      );
    }

    // Проверяем, покупал ли пользователь этот товар (для verified отзыва)
    const order = await prisma.order.findFirst({
      where: {
        userId: session.userId,
        status: { in: ['DELIVERED', 'PAID'] },
        items: {
          some: { productId },
        },
      },
    });

    const isVerified = !!order;

    // Создаем отзыв
    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.userId,
        rating,
        title: title || null,
        text,
        pros: pros || null,
        cons: cons || null,
        isVerified,
        isApproved: false, // Требует модерации
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: isVerified 
        ? 'Отзыв создан и будет опубликован после проверки' 
        : 'Отзыв создан (требуется подтверждение покупки)',
      review,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании отзыва' },
      { status: 500 }
    );
  }
}
