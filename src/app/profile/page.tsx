import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';
import ProfileClient from './ProfileClient';

/**
 * Server Component — загрузка профиля на сервере (SSR).
 * Обходит проблему lazy compilation API маршрутов в Docker dev.
 */
export default async function ProfilePage() {
  // Читаем session cookie
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    redirect('/login?callbackUrl=/profile');
  }

  // Проверяем сессию
  const session = await verifySession(token);

  if (!session) {
    redirect('/login?callbackUrl=/profile');
  }

  // Загружаем пользователя напрямую из БД
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
