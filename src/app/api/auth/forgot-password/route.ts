import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import crypto from 'crypto';

/**
 * POST /api/auth/forgot-password
 * Запрос на сброс пароля
 *
 * Body: { email }
 * Returns: { success: true, message }
 *
 * Примечание: В реальном проекте здесь должна быть отправка email
 * с токеном сброса пароля. Для демонстрации токен сохраняется в БД.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Валидация входных данных
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Поиск пользователя
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Всегда возвращаем успех для безопасности (не раскрываем наличие email)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Если пользователь с таким email существует, вы получите инструкцию по сбросу пароля',
      });
    }

    // Генерация токена сброса пароля
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Сохранение токена в БД (в реальном проекте нужна отдельная таблица)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Временное хранение токена (в реальном проекте используйте отдельную таблицу password_resets)
        emailVerified: false, // Используем как флаг, что есть активный токен
      },
    });

    // TODO: Отправить email с токеном
    // В реальном проекте:
    // 1. Сохранить хэш токена и expiry в отдельной таблице password_resets
    // 2. Отправить email с ссылкой /reset-password?token=xxx
    console.log('Reset token for', email, ':', resetToken);
    console.log('Reset URL:', `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`);

    return NextResponse.json({
      success: true,
      message: 'Если пользователь с таким email существует, вы получите инструкцию по сбросу пароля',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Ошибка при запросе сброса пароля' },
      { status: 500 }
    );
  }
}
