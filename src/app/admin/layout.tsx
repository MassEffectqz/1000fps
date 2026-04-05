import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-helpers';
import AdminLayoutClient from './AdminLayoutClient';

/**
 * Серверный layout для админ-панели.
 * Проверяет аутентификацию и роль ADMIN/MANAGER перед рендерингом.
 * Middleware уже защищает на уровне запросов, это дополнительная защита.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Нет сессии — редирект на login
  if (!session) {
    redirect('/login?callbackUrl=/admin');
  }

  // Нет прав админа — редирект на главную
  if (session.role !== 'ADMIN' && session.role !== 'MANAGER') {
    redirect('/');
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
