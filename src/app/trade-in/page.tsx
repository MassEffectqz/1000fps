import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata = {
  title: 'Трейд-ин — 1000fps',
};

const acceptedItems = [
  { icon: '💻', title: 'Ноутбуки', brands: 'Любые бренды, любого года' },
  { icon: '📱', title: 'Смартфоны и планшеты', brands: 'iPhone, Samsung, Xiaomi и др.' },
  { icon: '📺', title: 'Телевизоры', brands: 'Диагональ от 19 до 85 дюймов' },
  { icon: '🏠', title: 'Бытовая техника', brands: 'Холодильники, стиральные машины и т.д.' },
  { icon: '🖥️', title: 'ПК и комплектующие', brands: 'Процессоры, видеокарты, ОЗУ' },
];

const process = [
  { step: 1, title: 'Принесите технику', desc: 'Приходите в любой магазин 1000fps с устройством' },
  { step: 2, title: 'Диагностика 15 минут', desc: 'Наш специалист оценит состояние устройства' },
  { step: 3, title: 'Получите скидку', desc: 'Получите сертификат на сумму до 50% от стоимости' },
  { step: 4, title: 'Купите новое', desc: 'Новая техника со скидкой по сертификату' },
];

const conditions = [
  'Устройство включается и работает',
  'Нет серьёзных повреждений экрана',
  'Присутствуют все оригинальные комплектующие',
  'Есть документы о покупке (желательно)',
];

export default function TradeInPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Трейд-ин' }]} />
        <div className="max-w-4xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-4">Трейд-ин</h1>
          <p className="text-gray3 text-lg mb-8">Сдайте старую технику и получите скидку до 50% на новую!</p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {acceptedItems.map((item, i) => (
              <div key={i} className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5 hover:border-orange transition-colors">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-white font-semibold">{item.title}</div>
                <div className="text-gray3 text-sm">{item.brands}</div>
              </div>
            ))}
          </div>

          <div className="bg-black2 border border-orange/30 rounded-[var(--radius)] p-6 mb-8">
            <h2 className="text-white2 font-semibold text-xl mb-6">Как это работает</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {process.map((p) => (
                <div key={p.step} className="text-center">
                  <div className="w-10 h-10 bg-orange rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">{p.step}</div>
                  <div className="text-white font-medium mb-1">{p.title}</div>
                  <div className="text-gray3 text-sm">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6 mb-8">
            <h2 className="text-white2 font-semibold text-xl mb-4">Условия приёма</h2>
            <ul className="space-y-3">
              {conditions.map((c, i) => (
                <li key={i} className="flex items-center gap-2 text-gray3">
                  <span className="text-orange">✓</span> {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5 text-center">
              <div className="text-4xl mb-2">🏆</div>
              <div className="text-white font-semibold">До 50% скидки</div>
              <div className="text-gray3 text-sm">От стоимости устройства</div>
            </div>
            <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5 text-center">
              <div className="text-4xl mb-2">⚡</div>
              <div className="text-white font-semibold">За 15 минут</div>
              <div className="text-gray3 text-sm">Быстрая оценка</div>
            </div>
            <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5 text-center">
              <div className="text-4xl mb-2">♻️</div>
              <div className="text-white font-semibold">Экологично</div>
              <div className="text-gray3 text-sm">Переработка техники</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}