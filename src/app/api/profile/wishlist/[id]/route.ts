import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

/**
 * DELETE /api/profile/wishlist/[id]
 * Удалить товар из вишлиста
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Получаем токен из cookies
    const token = request.cookies.get('session')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Требуется аутентификация' },
        { status: 401 }
      );
    }

    // Проверяем сессию
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { error: 'Невалидная сессия' },
        { status: 401 }
      );
    }

    // Получаем ID элемента вишлиста
    const { id } = await params;

    // Проверяем, принадлежит ли элемент пользователю
    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!wishlistItem) {
      return NextResponse.json(
        { error: 'Элемент не найден' },
        { status: 404 }
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
    console.error('Delete from wishlist error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении из вишлиста' },
      { status: 500 }
    );
  }
}
