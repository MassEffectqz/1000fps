export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { cookies } = await import('next/headers');
  const { redirect } = await import('next/navigation');
  const { verifySession } = await import('@/lib/session');

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