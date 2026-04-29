import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validations/auth';
import { createSession } from '@/lib/session';

const isSecure = (process.env.NEXT_PUBLIC_APP_URL || '').startsWith('https');

export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const bcrypt = await import('bcryptjs');

    const body = await request.json();

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password, remember } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    const token = await createSession({
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'MANAGER' | 'CUSTOMER',
    });

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

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: remember ? 86400 * 30 : 86400,
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