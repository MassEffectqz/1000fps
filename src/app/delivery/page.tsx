import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata = {
  title: 'Доставка и самовывоз — 1000fps',
};

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Доставка и самовывоз' }]} />
        <div className="max-w-3xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-8">Доставка и самовывоз</h1>
          <div className="prose prose-invert prose-sm max-w-none text-gray3 space-y-6">
            <h2 className="text-white2 font-semibold text-lg">Доставка по России</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>СДЭК</strong> — от 150 ₽, 2-7 дней</li>
              <li><strong>Boxberry</strong> — от 150 ₽, 2-7 дней</li>
              <li><strong>Почта России</strong> — от 200 ₽, 5-14 дней</li>
              <li><strong>Курьер</strong> — от 300 ₽, 1-3 дня</li>
            </ul>
            <h2 className="text-white2 font-semibold text-lg">Экспресс-доставка</h2>
            <p>Доставка за 2 часа по Волгограду и Волжскому — 500 ₽.</p>
            <h2 className="text-white2 font-semibold text-lg">Самовывоз</h2>
            <p>Забер товар из наших магазинов бесплатно. Адреса магазинов указаны в разделе «Контакты».</p>
            <h2 className="text-white2 font-semibold text-lg">Сроки</h2>
            <p>Товар в наличии отправляется в течение 1-2 рабочих дней. Срок доставки зависит от региона и выбранного способа.</p>
          </div>
        </div>
      </div>
    </div>
  );
}