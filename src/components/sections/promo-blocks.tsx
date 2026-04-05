import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const promos = [
  {
    badge: { text: 'Акция', variant: 'orange' as const },
    title: 'Скидки до 30%\nна видеокарты',
    subtitle: 'Только до конца месяца',
    link: 'Смотреть',
    href: '/catalog/gpu',
    decor: 'GPU',
  },
  {
    badge: { text: 'Новинки', variant: 'white' as const },
    title: 'Intel Core Ultra\nсерия 200',
    subtitle: 'Новое поколение уже в наличии',
    link: 'Смотреть',
    href: '/catalog/cpu',
    decor: 'CPU',
  },
  {
    badge: { text: 'Готовые сборки', variant: 'gray' as const },
    title: 'ПК от 45 000\nс гарантией 2 года',
    subtitle: 'Протестированы перед отправкой',
    link: 'Собрать',
    href: '/configurator',
    decor: 'PC',
  },
  {
    badge: { text: 'Б/У', variant: 'orange' as const },
    title: 'Техника б/у\nс проверкой',
    subtitle: 'Гарантия 6 месяцев на всё',
    link: 'Смотреть',
    href: '/catalog',
    decor: 'B/U',
  },
];

export function PromoBlocks() {
  return (
    <section className="py-4 sm:py-6 lg:py-10">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {promos.map((promo, index) => (
            <div
              key={index}
              className="relative p-5 bg-black2 border border-gray1 rounded-[var(--radius)] overflow-hidden transition-colors hover:border-orange group"
            >
              <div className="mb-3">
                <Badge variant={promo.badge.variant}>{promo.badge.text}</Badge>
              </div>
              <div className="font-display text-[16px] font-extrabold uppercase leading-[1.2] mb-[6px] text-white2 whitespace-pre-line">
                {promo.title}
              </div>
              <div className="text-[12px] text-gray3 mb-4">{promo.subtitle}</div>
              <Button variant="outline" size="sm">
                {promo.link}
              </Button>
              <div className="absolute right-[-8px] bottom-[-12px] font-display text-[72px] font-extrabold text-gray1 pointer-events-none select-none opacity-35">
                {promo.decor}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
