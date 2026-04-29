import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import Link from 'next/link';

export const metadata = {
  title: 'Карта сайта — 1000fps',
};

const siteMapItems = [
  {
    title: 'Каталог',
    links: [
      { label: 'Все товары', href: '/catalog' },
      { label: 'Б/У техника', href: '/used' },
      { label: 'Бренды', href: '/brands' },
      { label: 'Новинки', href: '/catalog?sortBy=new' },
      { label: 'Хиты продаж', href: '/catalog?sortBy=sales' },
    ],
  },
  {
    title: 'Информация',
    links: [
      { label: 'О нас', href: '/about' },
      { label: 'Контакты', href: '/contacts' },
      { label: 'Доставка', href: '/delivery' },
      { label: 'Гарантия', href: '/warranty' },
      { label: 'Возврат', href: '/return' },
    ],
  },
  {
    title: 'Документы',
    links: [
      { label: 'Политика конфиденциальности', href: '/privacy' },
      { label: 'Оферта', href: '/offer' },
      { label: 'Реквизиты', href: '/requisites' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Карта сайта' },
          ]}
        />
        <div className="max-w-3xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-8">
            Карта сайта
          </h1>
          <div className="grid gap-8">
            {siteMapItems.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-semibold text-white2 mb-4">{section.title}</h2>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-gray3 hover:text-orange transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}