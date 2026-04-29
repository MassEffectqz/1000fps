import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations/auth';
import { createSession } from '@/lib/session';

const isSecure = (process.env.NEXT_PUBLIC_APP_URL || '').startsWith('https');

export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const bcrypt = await import('bcryptjs');

    const body = await request.json();

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password, name, phone } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

    const token = await createSession({
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'MANAGER' | 'CUSTOMER',
    });

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
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 86400,
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