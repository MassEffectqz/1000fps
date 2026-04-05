import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { moderateReviewSchema } from '@/lib/validations/review';

/**
 * PUT /api/admin/reviews/[id] - модерировать отзыв
 * (защищено middleware — только ADMIN/MANAGER)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = moderateReviewSchema.safeParse({
      reviewId: id,
      ...body,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Некорректные данные' },
        { status: 400 }
      );
    }

    const { isApproved, rejectionReason } = validation.data;

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

    // Обновляем отзыв
    const review = await prisma.review.update({
      where: { id },
      data: {
        isApproved,
      },
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

    // TODO: Отправить уведомление пользователю о результате модерации
    if (isApproved) {
      console.log(`[Review] Отзыв ${id} одобрен`);
    } else {
      console.log(`[Review] Отзыв ${id} отклонен. Причина: ${rejectionReason || 'не указана'}`);
    }

    return NextResponse.json({
      success: true,
      message: isApproved ? 'Отзыв одобрен' : 'Отзыв отклонен',
      review,
    });
  } catch (error) {
    console.error('Error moderating review:', error);
    return NextResponse.json(
      { error: 'Ошибка при модерации' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reviews/[id] - удалить отзыв (админ)
 * (защищено middleware — только ADMIN/MANAGER)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
      { error: 'Ошибка при удалении' },
      { status: 500 }
    );
  }
}
