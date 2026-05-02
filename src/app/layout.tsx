import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { Toaster } from "sonner";
import { CartProvider } from "@/lib/context/cart-context";
import { CompareProvider } from "@/lib/context/compare-context";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";
import { PWAInstallPrompt } from "@/components/pwa/install-prompt";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import { SWCleanup } from "@/components/pwa/sw-cleanup";
import { PaymentBlocker } from "@/components/ui/payment-blocker";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "1000FPS — Интернет-магазин компьютерной техники",
  description: "Видеокарты, процессоры, материнские платы и другие комплектующие. Официальная гарантия. Доставка по всей России.",
  keywords: ["видеокарты", "процессоры", "компьютерные комплектующие", "игровые ПК", "1000FPS"],
  authors: [{ name: "1000FPS" }],
  creator: "1000FPS",
  publisher: "1000FPS",
  icons: {
    icon: [
      { url: '/icons/favicon.ico', type: 'image/x-icon' },
    ],
    shortcut: '/icons/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://1000fps.ru",
    title: "1000FPS — Интернет-магазин компьютерной техники",
    description: "Видеокарты, процессоры, материнские платы и другие комплектующие. Официальная гарантия. Доставка по всей России.",
    siteName: "1000FPS",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "1000FPS — Интернет-магазин компьютерной техники",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "1000FPS — Интернет-магазин компьютерной техники",
    description: "Видеокарты, процессоры, материнские платы и другие комплектующие",
    images: ["/images/og-image.jpg"],
  },
  alternates: {
    canonical: "https://1000fps.ru",
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="scroll-smooth" data-theme="dark" data-scroll-behavior="smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ff6600" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="1000FPS" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)})()` }} />
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className="antialiased">
        <ServiceWorkerRegister />
        <SWCleanup />
        <CartProvider>
          <CompareProvider>
            <div className="relative min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 pb-10">{children}</main>
              <Footer />
            </div>
            <PWAInstallPrompt />
          </CompareProvider>
        </CartProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "bg-black2 border border-gray1 text-white",
              success: "border-green-500/30",
              error: "border-red-500/30",
              info: "border-blue-500/30",
            },
          }}
        />
        <PaymentBlocker />
      </body>
    </html>
  );
}
