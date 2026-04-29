import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata = {
  title: 'Рассрочка 0% — 1000fps',
};

export default function InstallmentPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Рассрочка 0%' }]} />
        <div className="max-w-3xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-8">Рассрочка 0%</h1>
          <div className="prose prose-invert prose-sm max-w-none text-gray3 space-y-6">
            <p>Оформите рассрочку 0% без переплат на срок до 24 месяцев.</p>
            <h2 className="text-white2 font-semibold text-lg">Банки-партнёры</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Тинькофф</strong> — до 24 месяцев</li>
              <li><strong>Сбербанк</strong> — до 24 месяцев</li>
              <li><strong>ВТБ</strong> — до 24 месяцев</li>
              <li><strong>ОТП Банк</strong> — до 18 месяцев</li>
            </ul>
            <h2 className="text-white2 font-semibold text-lg">Требования</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Паспорт РФ</li>
              <li>Возраст от 18 лет</li>
              <li>Официальное трудоустройство</li>
            </ul>
            <h2 className="text-white2 font-semibold text-lg">Как оформить</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Выберите товар и добавьте в корзину</li>
              <li>При оформлении выберите «Рассрочка 0%»</li>
              <li>Заполните заявку на сайте банка</li>
              <li>Получите одобрение за 2 минуты</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}