import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isDemoMode } from '@/lib/demo-mode';
import ProfileClient from './ProfileClient';

/**
 * Server Component — загрузка профиля на сервере (SSR).
 * В демо-режиме — заглушка без БД.
 */
export default async function ProfilePage() {
  // Демо-режим — показываем демо-пользователя
  if (isDemoMode()) {
    const demoUser = {
      id: 'demo-user-001',
      email: 'demo@1000fps.ru',
      name: 'Демо Пользователь',
      phone: '+7 (999) 123-45-67',
      avatar: null,
      role: 'CUSTOMER',
      level: 'GOLD',
      emailVerified: true,
      createdAt: '2025-01-15T10:00:00.000Z',
      updatedAt: '2026-04-01T14:30:00.000Z',
    };

    return <ProfileClient initialUser={demoUser} />;
  }

  // Продакшн-режим (Prisma)
  const { verifySession } = await import('@/lib/session');
  const { prisma } = await import('@/lib/prisma');

  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    redirect('/login?callbackUrl=/profile');
  }

  const session = await verifySession(token);

  if (!session) {
    redirect('/login?callbackUrl=/profile');
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
    redirect('/login?callbackUrl=/profile');
  }

  return <ProfileClient initialUser={{
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }} />;
}
