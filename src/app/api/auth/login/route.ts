import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validations/auth';
import { isDemoMode } from '@/lib/demo-mode';
import { createSession } from '@/lib/session';

/**
 * POST /api/auth/login
 * Вход пользователя по email/password
 *
 * Body: { email, password, remember? }
 * Returns: { user, token }
 */
export async function POST(request: NextRequest) {
  try {
    // Демо-режим — фейковый логин
    if (isDemoMode()) {
      const token = await createSession({
        userId: 'demo-user-001',
        email: 'demo@1000fps.ru',
        role: 'CUSTOMER',
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: 'demo-user-001',
          email: 'demo@1000fps.ru',
          name: 'Демо Пользователь',
          phone: '+7 (999) 123-45-67',
          avatar: null,
          role: 'CUSTOMER',
          level: 'GOLD',
        },
        token,
      });

      response.cookies.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400,
        path: '/',
      });

      return response;
    }

    // Продакшн-режим (Prisma)
    const { prisma } = await import('@/lib/prisma');
    const bcrypt = await import('bcryptjs');

    const body = await request.json();

    // Валидация входных данных
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password, remember } = validation.data;

    // Поиск пользователя
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Проверка пароля
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Создание JWT сессии
    const token = await createSession({
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'MANAGER' | 'CUSTOMER',
    });

    // Подготовка ответа
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        level: user.level,
      },
      token,
    });

    // Установка cookie с учетом remember me
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: remember ? 86400 * 30 : 86400, // 30 дней или 1 день
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Ошибка при входе' },
      { status: 500 }
    );
  }
}
