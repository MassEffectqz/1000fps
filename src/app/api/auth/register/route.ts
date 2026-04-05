import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations/auth';
import { isDemoMode } from '@/lib/demo-mode';
import { createSession } from '@/lib/session';

/**
 * POST /api/auth/register
 * Регистрация нового пользователя
 *
 * Body: { email, password, name, phone? }
 * Returns: { user, token }
 */
export async function POST(request: NextRequest) {
  try {
    // Демо-режим
    if (isDemoMode()) {
      const token = await createSession({
        userId: 'demo-user-001',
        email: 'demo@1000fps.ru',
        role: 'CUSTOMER',
      });

      const response = NextResponse.json(
        {
          success: true,
          user: {
            id: 'demo-user-001',
            email: 'demo@1000fps.ru',
            name: 'Демо Пользователь',
            phone: '+7 (999) 123-45-67',
            role: 'CUSTOMER',
            level: 'GOLD',
          },
          token,
        },
        { status: 201 }
      );

      response.cookies.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400,
        path: '/',
      });

      return response;
    }

    // Продакшн-режим
    const { prisma } = await import('@/lib/prisma');
    const bcrypt = await import('bcryptjs');

    const body = await request.json();

    // Валидация входных данных
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password, name, phone } = validation.data;

    // Проверка существующего пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        phone: phone || null,
        role: 'CUSTOMER',
        level: 'BRONZE',
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        level: true,
        createdAt: true,
      },
    });

    // Создание JWT сессии
    const token = await createSession({
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'MANAGER' | 'CUSTOMER',
    });

    // Установка cookie
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          level: user.level,
        },
        token,
      },
      { status: 201 }
    );

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 часа
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Ошибка при регистрации' },
      { status: 500 }
    );
  }
}
