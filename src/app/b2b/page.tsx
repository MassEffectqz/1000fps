import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata = {
  title: 'Корпоративным клиентам — 1000fps',
};

export default function B2BPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Корпоративным клиентам' }]} />
        <div className="max-w-3xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-8">Корпоративным клиентам</h1>
          <div className="prose prose-invert prose-sm max-w-none text-gray3 space-y-6">
            <p>Специальные условия для юридических лиц и ИП.</p>
            <h2 className="text-white2 font-semibold text-lg">Преимущества</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Оптовые цены от 1 единицы товара</li>
              <li>Отсрочка платежа до 30 дней</li>
              <li>Персональный менеджер</li>
              <li>Безналичный расчёт с НДС</li>
              <li>Доставка по всей России</li>
            </ul>
            <h2 className="text-white2 font-semibold text-lg">Для кого</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Юридические лица</li>
              <li>Индивидуальные предприниматели</li>
              <li>Государственные учреждения</li>
              <li>Образовательные организации</li>
            </ul>
            <h2 className="text-white2 font-semibold text-lg">Как стать клиентом</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Оставьте заявку на сайте</li>
              <li>Мы свяжемся с вами в течение дня</li>
              <li>Заключим договор</li>
              <li>Получите доступ к оптовым ценам</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}