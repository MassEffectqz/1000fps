import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

/**
 * Server Component — загрузка профиля на сервере (SSR).
 */
export default async function ProfilePage() {
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