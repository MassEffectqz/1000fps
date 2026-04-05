import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/session';

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    redirect('/login?callbackUrl=/profile');
  }

  const session = await verifySession(token);

  if (!session) {
    redirect('/login?callbackUrl=/profile');
  }

  return <>{children}</>;
}
