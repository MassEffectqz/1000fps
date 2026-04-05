import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-helpers';
import { updateReviewSchema, voteReviewSchema } from '@/lib/validations/review';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/reviews/[id] - получить отзыв по ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const review = await prisma.review.findUnique({
      where: { id },
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
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Отзыв не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении отзыва' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/reviews/[id] - обновить отзыв (только автор)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const validation = updateReviewSchema.safeParse({
      reviewId: id,
      ...body,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Некорректные данные' },
        { status: 400 }
      );
    }

    // Проверяем что отзыв принадлежит пользователю
    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Отзыв не найден' },
        { status: 404 }
      );
    }

    if (existingReview.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Вы можете редактировать только свои отзывы' },
        { status: 403 }
      );
    }

    // Обновляем отзыв
    const review = await prisma.review.update({
      where: { id },
      data: {
        ...validation.data,
        isApproved: false, // После редактирования требует повторной модерации
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
      message: 'Отзыв обновлен и будет опубликован после проверки',
      review,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении отзыва' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[id] - удалить отзыв (автор или админ)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Проверяем что отзыв существует
    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Отзыв не найден' },
        { status: 404 }
      );
    }

    // Проверяем права (автор или админ)
    const isAdmin = session.role === 'ADMIN' || session.role === 'MANAGER';
    const isOwner = existingReview.userId === session.userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Недостаточно прав для удаления' },
        { status: 403 }
      );
    }

    // Удаляем отзыв
    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Отзыв удален',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении отзыва' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews/[id]/vote - голосовать за отзыв
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const validation = voteReviewSchema.safeParse({
      reviewId: id,
      ...body,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Некорректные данные' },
        { status: 400 }
      );
    }

    const { voteType } = validation.data;

    // Проверяем что отзыв существует
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Отзыв не найден' },
        { status: 404 }
      );
    }

    // Нельзя голосовать за свой отзыв
    if (review.userId === session.userId) {
      return NextResponse.json(
        { error: 'Нельзя голосовать за свой отзыв' },
        { status: 400 }
      );
    }

    // Обновляем helpful count
    const helpfulChange = voteType === 'helpful' ? 1 : -1;

    await prisma.review.update({
      where: { id },
      data: {
        helpful: {
          increment: helpfulChange,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Голос учтен',
    });
  } catch (error) {
    console.error('Error voting review:', error);
    return NextResponse.json(
      { error: 'Ошибка при голосовании' },
      { status: 500 }
    );
  }
}
