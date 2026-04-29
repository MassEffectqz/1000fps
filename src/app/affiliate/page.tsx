import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata = {
  title: 'Партнёрская программа — 1000fps',
};

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Партнёрская программа' }]} />
        <div className="max-w-3xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-8">Партнёрская программа</h1>
          <div className="prose prose-invert prose-sm max-w-none text-gray3 space-y-6">
            <p>Зарабатывайте с 1000fps! Приводите клиентов и получайте до 10% с каждой покупки.</p>
            <h2 className="text-white2 font-semibold text-lg">Как это работает</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Зарегистрируйтесь в партнёрской программе</li>
              <li>Получите уникальную ссылку</li>
              <li>Размещайте ссылку на сайте, соцсетях, блоге</li>
              <li>Получайте комиссию с каждой покупки</li>
            </ol>
            <h2 className="text-white2 font-semibold text-lg">Тарифы</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Базовый</strong> — 5% с каждого заказа</li>
              <li><strong>Серебряный</strong> — 7% (от 50 000 ₽ оборота)</li>
              <li><strong>Золотой</strong> — 10% (от 200 000 ₽ оборота)</li>
            </ul>
            <h2 className="text-white2 font-semibold text-lg">Вывод средств</h2>
            <p>Вывод на карту или расчётный счёт. Минимальная сумма — 3 000 ₽. Выплаты еженедельно.</p>
          </div>
        </div>
      </div>
    </div>
  );
}