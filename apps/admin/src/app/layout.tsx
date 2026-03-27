import type { Metadata } from 'next';
import { AdminProviders } from '@/components/AdminProviders';
import './globals.css';

export const metadata: Metadata = {
  title: '1000FPS Admin — Панель управления',
  description: 'Админ-панель интернет-магазина 1000FPS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <AdminProviders>{children}</AdminProviders>
      </body>
    </html>
  );
}
