import type { Metadata } from 'next';
import { Barlow, Barlow_Condensed } from 'next/font/google';
import './globals.css';
import { HeaderWrapper } from '@/components/layout/Header';
import { FooterWrapper } from '@/components/layout/Footer';
import { Providers } from '@/components/Providers';

const barlow = Barlow({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-barlow',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-barlow-condensed',
});

export const metadata: Metadata = {
  title: '1000FPS — Интернет-магазин компьютерной техники',
  description:
    'Видеокарты, процессоры, материнские платы и другие комплектующие. Более 50 000 товаров в наличии.',
  keywords: [
    'видеокарты',
    'процессоры',
    'комплектующие',
    'ПК',
    'компьютеры',
    'NVIDIA',
    'AMD',
    'Intel',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${barlow.variable} ${barlowCondensed.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>
          <HeaderWrapper>
            <main>{children}</main>
          </HeaderWrapper>
          <FooterWrapper>
            <div />
          </FooterWrapper>
        </Providers>
      </body>
    </html>
  );
}
