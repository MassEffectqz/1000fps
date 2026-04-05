import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resetPasswordSchema } from '@/lib/validations/user';
import { z } from 'zod';

// Генерация случайного пароля
function generateRandomPassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  
  // Гарантируем наличие хотя бы одного символа каждого типа
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Заполняем оставшуюся длину случайными символами
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Перемешиваем пароль
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// POST /api/admin/users/[id]/reset-password - сброс пароля
// (защищено middleware — только ADMIN/MANAGER)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    
    // Валидация входных данных
    const validatedData = resetPasswordSchema.parse(body);

    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Генерируем новый пароль
    const newPassword = validatedData.newPassword || generateRandomPassword();

    // Обновляем пароль в базе данных
    await prisma.user.update({
      where: { id },
      data: {
        password: newPassword,
      },
    });

    // TODO: Здесь должна быть отправка email с новым паролем
    // Например, через nodemailer или сторонний сервис (SendGrid, Resend, etc.)
    // await sendPasswordResetEmail(user.email, newPassword);

    return NextResponse.json({
      success: true,
      message: 'Пароль успешно сброшен',
      temporaryPassword: newPassword,
      email: user.email,
      note: 'Временный пароль показан только в этом ответе. Отправьте его пользователю безопасным способом.',
    });
  } catch (error) {
    console.error('Error resetting password:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Не удалось сбросить пароль' },
      { status: 500 }
    );
  }
}
