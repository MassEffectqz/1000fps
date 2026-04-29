import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata = {
  title: 'Гарантия и ремонт — 1000fps',
};

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Гарантия и ремонт' }]} />
        <div className="max-w-3xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-8">Гарантия и ремонт</h1>
          <div className="prose prose-invert prose-sm max-w-none text-gray3 space-y-6">
            <h2 className="text-white2 font-semibold text-lg">Гарантийные сроки</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Ноутбуки и ПК</strong> — от 6 до 36 месяцев</li>
              <li><strong>Телефоны и планшеты</strong> — от 6 до 24 месяцев</li>
              <li><strong>Бытовая техника</strong> — от 6 до 24 месяцев</li>
              <li><strong>Комплектующие</strong> — от 12 до 36 месяцев</li>
            </ul>
            <h2 className="text-white2 font-semibold text-lg">Расширенная гарантия</h2>
            <p>При покупке доступно продление гарантии до 3 лет за дополнительную плату.</p>
            <h2 className="text-white2 font-semibold text-lg">Ремонт</h2>
            <p>Собственный сервисный центр в Волгограде. Ремонтируем технику любых брендов. Срок ремонта — от 1 до 14 дней.</p>
            <h2 className="text-white2 font-semibold text-lg">Как обратиться за ремонтом</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Привезите товар в магазин</li>
              <li>Отправьте транспортной компанией (для регионов)</li>
              <li>Мы проведём диагностику и сообщим сроки ремонта</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}