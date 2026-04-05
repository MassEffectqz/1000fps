'use server';

import { cookies, headers } from 'next/headers';
import { verifySession, createSession, type SessionPayload } from '../../middleware';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

/**
 * Получить текущую сессию пользователя
 * Используется в server actions и server components
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    return null;
  }

  return await verifySession(token);
}

/**
 * Получить текущего пользователя с полными данными из БД
 */
export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

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

  return user;
}

/**
 * Проверить, что пользователь авторизован и имеет роль ADMIN или MANAGER
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();

  if (!session) {
    throw new Error('Требуется аутентификация');
  }

  if (session.role !== 'ADMIN' && session.role !== 'MANAGER') {
    throw new Error('Недостаточно прав для выполнения этого действия');
  }

  return session;
}

/**
 * Проверить, что пользователь авторизован
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();

  if (!session) {
    throw new Error('Требуется аутентификация');
  }

  return session;
}

/**
 * Проверить, что пользователь авторизован и вернуть полные данные
 */
export async function requireAuthWithUser() {
  const session = await getSession();

  if (!session) {
    throw new Error('Требуется аутентификация');
  }

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
    throw new Error('Пользователь не найден');
  }

  return { session, user };
}

/**
 * Создать сессию и установить cookie
 */
export async function createSessionAndSetCookie(
  user: { id: string; email: string; role: string },
  remember?: boolean
) {
  const token = await createSession({
    userId: user.id,
    email: user.email,
    role: user.role as 'ADMIN' | 'MANAGER' | 'CUSTOMER',
  });

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: remember ? 86400 * 30 : 86400, // 30 дней или 1 день
    path: '/',
  });

  return token;
}

/**
 * Удалить сессию (logout)
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

/**
 * Проверить пароль пользователя
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Хэшировать пароль
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Получить IP адрес пользователя
 */
export async function getUserIp(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown';
  return ip;
}

/**
 * Server Action для выхода
 */
export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}

/**
 * Server Action для получения данных профиля
 */
export async function getProfileAction() {
  try {
    const { user } = await requireAuthWithUser();
    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка получения профиля',
    };
  }
}

/**
 * Server Action для обновления профиля
 */
export async function updateProfileAction(data: {
  name?: string;
  phone?: string | null;
  avatar?: string | null;
}) {
  try {
    const { user } = await requireAuthWithUser();

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        phone: data.phone,
        avatar: data.avatar,
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

    return { success: true, user: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка обновления профиля',
    };
  }
}

/**
 * Server Action для смены пароля
 */
export async function changePasswordAction(data: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const session = await requireAuth();

    // Получаем пользователя с хэшем пароля
    const userWithPassword = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, password: true },
    });

    if (!userWithPassword) {
      return { success: false, error: 'Пользователь не найден' };
    }

    // Проверяем текущий пароль
    const validPassword = await bcrypt.compare(data.currentPassword, userWithPassword.password);

    if (!validPassword) {
      return { success: false, error: 'Неверный текущий пароль' };
    }

    // Хэшируем новый пароль
    const hashedPassword = await hashPassword(data.newPassword);

    await prisma.user.update({
      where: { id: userWithPassword.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка смены пароля',
    };
  }
}
