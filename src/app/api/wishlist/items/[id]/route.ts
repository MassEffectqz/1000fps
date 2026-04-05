import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

/**
 * DELETE /api/wishlist/items/[id] - удалить товар из вишлиста
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Находим элемент вишлиста
    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: { id },
      include: {
        wishlist: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!wishlistItem) {
      return NextResponse.json(
        { error: 'Элемент вишлиста не найден' },
        { status: 404 }
      );
    }

    // Проверяем, что элемент принадлежит текущему пользователю
    if (wishlistItem.wishlist.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Удаляем элемент
    await prisma.wishlistItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Товар удален из вишлиста',
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}
