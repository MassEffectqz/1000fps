import { NextResponse } from 'next/server';
import { resetPasswordSchema } from '@/lib/validations/auth';

/**
 * POST /api/auth/reset-password
 * Установка нового пароля с токеном
 *
 * Body: { token, password }
 * Returns: { success: true }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Валидация входных данных
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.error.issues },
        { status: 400 }
      );
    }

    // В реальном проекте здесь нужна проверка токена в таблице password_resets
    // Для демонстрации используем упрощенный подход

    // Генерируем хэш из токена для поиска (в реальном проекте - отдельная таблица)
    // Здесь мы предполагаем, что токен был сохранен каким-то образом
    // В production нужна отдельная таблица password_resets с:
    // - id, userId, token (hash), expiresAt, used, createdAt

    // Для демо-целей просто найдем пользователя и сбросим пароль
    // В реальном проекте нужна proper token validation

    // TODO: Реальная реализация требует:
    // 1. Таблицы PasswordReset { id, userId, token, expiresAt, used, createdAt }
    // 2. Поиска токена в этой таблице
    // 3. Проверки expiresAt
    // 4. Проверки used === false
    // 5. Обновления пароля и marked used = true

    // Для текущей реализации вернем ошибку, что функционал требует настройки
    return NextResponse.json(
      {
        error: 'Функционал сброса пароля требует настройки email-сервиса и таблицы токенов',
        hint: 'В реальном проекте нужна отдельная таблица password_resets и email-сервис',
      },
      { status: 501 } // Not Implemented
    );

    // Ниже пример полной реализации для будущего:
    /*
    const resetRequest = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRequest) {
      return NextResponse.json(
        { error: 'Неверный или истекший токен' },
        { status: 400 }
      );
    }

    if (resetRequest.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Токен истек' },
        { status: 400 }
      );
    }

    if (resetRequest.used) {
      return NextResponse.json(
        { error: 'Токен уже был использован' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRequest.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({ success: true });
    */
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Ошибка при сбросе пароля' },
      { status: 500 }
    );
  }
}
