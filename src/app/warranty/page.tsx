import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata = {
  title: 'Гарантия и ремонт — 1000fps',
};

const warrantyPeriods = [
  { category: 'Ноутбуки', base: '12 мес', extended: '24-36 мес', icon: '💻' },
  { category: 'Смартфоны и планшеты', base: '12 мес', extended: '18-24 мес', icon: '📱' },
  { category: 'ПК и комплектующие', base: '24 мес', extended: '36 мес', icon: '🖥️' },
  { category: 'Телевизоры', base: '12 мес', extended: '24-36 мес', icon: '📺' },
  { category: 'Бытовая техника', base: '12 мес', extended: '24 мес', icon: '🏠' },
  { category: 'Периферия', base: '12 мес', extended: '18-24 мес', icon: '⌨️' },
];

const serviceFeatures = [
  { icon: '🔧', title: 'Собственный сервис', desc: 'Ремонтируем технику сами, без посредников' },
  { icon: '⚡', title: 'Быстрый ремонт', desc: 'Средний срок ремонта — 3 дня' },
  { icon: '🏪', title: 'Приём в магазине', desc: 'Привезите технику в любой наш магазин' },
  { icon: '🚚', title: 'Транспортировка', desc: 'Заберём и доставим обратно за наш счёт' },
];

const warrantyProcess = [
  'Принесите товар в магазин или отправьте транспортной компанией',
  'Мы проведём диагностику (1-3 дня)',
  'Свяжемся и сообщим результат',
  'Ремонт или замена товара',
  'Вы получите исправный товар',
];

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Гарантия и ремонт' }]} />
        <div className="max-w-4xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-4">Гарантия и ремонт</h1>
          <p className="text-gray3 text-lg mb-8">Официальная гарантия на всю технику. Собственный сервисный центр в Волгограде.</p>

          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6 mb-8">
            <h2 className="text-white2 font-semibold text-xl mb-4 flex items-center gap-2">
              🛡️ <span>Гарантийные сроки</span>
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {warrantyPeriods.map((item, i) => (
                <div key={i} className="bg-black border border-gray1 rounded-lg p-4">
                  <div className="text-xl mb-1">{item.icon}</div>
                  <div className="text-white font-medium">{item.category}</div>
                  <div className="text-orange text-sm">Базовая: {item.base}</div>
                  <div className="text-gray3 text-xs">Расширенная: {item.extended}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange/10 border border-orange/20 rounded-[var(--radius)] p-6 mb-8">
            <h2 className="text-white2 font-semibold text-xl mb-4">Расширенная гарантия</h2>
            <div className="text-gray3 space-y-2 mb-4">
              <p>При покупке вы можете продлить гарантию до 3 лет за дополнительную плату.</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Стоимость — от 990 ₽ (зависит от товара)</li>
                <li>Покрывает все неисправности</li>
                <li>Приоритетный ремонт</li>
                <li>Замена товара без экспертизы</li>
              </ul>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {serviceFeatures.map((item, i) => (
              <div key={i} className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5 hover:border-orange transition-colors">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-white font-semibold mb-1">{item.title}</div>
                <div className="text-gray3 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>

          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6">
            <h2 className="text-white2 font-semibold text-xl mb-4">Как обратиться за ремонтом</h2>
            <div className="space-y-3">
              {warrantyProcess.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-orange rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">{i + 1}</div>
                  <div className="text-gray3">{step}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray1">
              <div className="text-gray3 text-sm">Контакт сервисного центра: <span className="text-orange">service@1000fps.ru</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}