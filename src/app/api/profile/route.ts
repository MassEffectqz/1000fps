import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';
import { updateProfileSchema } from '@/lib/validations/auth';

/**
 * GET /api/profile
 * Получить данные текущего пользователя
 */
export async function GET(request: NextRequest) {
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

    // Получаем пользователя
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        level: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении профиля' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Обновить профиль пользователя
 */
export async function PUT(request: NextRequest) {
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

    // Получаем и валидируем тело запроса
    const body = await request.json();
    console.log('Profile update request:', body);
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      console.error('Validation error:', validation.error.issues);
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, phone, avatar } = validation.data;
    console.log('Updating profile for user:', session.userId, { name, phone, avatar });

    // Обновляем пользователя
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        level: true,
      },
    });

    console.log('Profile updated successfully:', updatedUser);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Профиль успешно обновлен',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении профиля' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile
 * Удалить аккаунт пользователя
 */
export async function DELETE(request: NextRequest) {
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

    // Получаем тело запроса для подтверждения
    const body = await request.json();
    const { confirm } = body;

    if (confirm !== true) {
      return NextResponse.json(
        { error: 'Требуется подтверждение удаления (confirm: true)' },
        { status: 400 }
      );
    }

    // Удаляем пользователя (каскадно удалит все связанные данные)
    await prisma.user.delete({
      where: { id: session.userId },
    });

    // Создаем ответ с очисткой cookie
    const response = NextResponse.json({
      success: true,
      message: 'Аккаунт успешно удален',
    });

    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Delete profile error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении аккаунта' },
      { status: 500 }
    );
  }
}
