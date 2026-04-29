import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata = {
  title: 'Трейд-ин — 1000fps',
};

export default function TradeInPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Трейд-ин' }]} />
        <div className="max-w-3xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-8">Трейд-ин</h1>
          <div className="prose prose-invert prose-sm max-w-none text-gray3 space-y-6">
            <p>Сдайте старую технику и получите скидку на новую до 50%!</p>
            <h2 className="text-white2 font-semibold text-lg">Что принимаем</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ноутбуки и ПК</li>
              <li>Телефоны и планшеты</li>
              <li>Телевизоры</li>
              <li>Бытовая техника</li>
            </ul>
            <h2 className="text-white2 font-semibold text-lg">Как это работает</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Принесите старую технику в магазин</li>
              <li>Мы проведём диагностику и оценим состояние</li>
              <li>Получите сертификат на скидку</li>
              <li>Купите новый товар со скидкой</li>
            </ol>
            <h2 className="text-white2 font-semibold text-lg">Преимущества</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Экологично — техника перерабатывается</li>
              <li>Выгодно — скидка до 50%</li>
              <li>Быстро — оценка за 15 минут</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}