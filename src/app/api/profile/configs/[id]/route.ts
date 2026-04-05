import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

/**
 * DELETE /api/profile/configs/[id]
 * Удалить сборку пользователя
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

    // Получаем ID конфигурации
    const { id } = await params;

    // Проверяем, принадлежит ли конфигурация пользователю
    const existingConfig = await prisma.configuration.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existingConfig) {
      return NextResponse.json(
        { error: 'Сборка не найдена' },
        { status: 404 }
      );
    }

    // Удаляем конфигурацию (каскадно удалит items)
    await prisma.configuration.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Сборка успешно удалена',
    });
  } catch (error) {
    console.error('Delete config error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении сборки' },
      { status: 500 }
    );
  }
}
