import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata = {
  title: 'Партнёрская программа — 1000fps',
};

const tiers = [
  { name: 'Базовый', commission: '5%', minSales: '0 ₽', color: 'border-gray1', features: ['Базовая комиссия 5%', 'Доступ к рекламным материалам', 'Поддержка менеджера'] },
  { name: 'Серебряный', commission: '7%', minSales: '50 000 ₽', color: 'border-gray3', features: ['Повышенная комиссия 7%', 'Приоритетная поддержка', 'Эксклюзивные акции'] },
  { name: 'Золотой', commission: '10%', minSales: '200 000 ₽', color: 'border-orange', features: ['Максимальная комиссия 10%', 'Персональный менеджер', 'Специальные бонусы'] },
];

const ways = [
  { icon: '🌐', title: 'Сайт или блог', desc: 'Разместите ссылки на своём сайте' },
  { icon: '📱', title: 'Соцсети', desc: 'Публикуйте в соцсетях и мессенджерах' },
  { icon: '📧', title: 'Email-рассылки', desc: 'Отправляйте партнёрские ссылки подписчикам' },
];

const features = [
  'Уникальные партнёрские ссылки для каждого партнёра',
  'Отслеживание кликов и продаж в реальном времени',
  'Вывод средств от 3000 ₽ еженедельно',
  'На банковскую карту или расчётный счёт',
  'Средний чек — 25 000 ₽',
  'Конверсия — 3-5%',
];

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Партнёрская программа' }]} />
        <div className="max-w-4xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-4">Партнёрская программа</h1>
          <p className="text-gray3 text-lg mb-8">Зарабатывайте с 1000fps! Приводите клиентов и получайте до 10% с каждой покупки.</p>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {tiers.map((tier, i) => (
              <div key={i} className={`bg-black2 border-2 rounded-[var(--radius)] p-6 ${tier.color} hover:scale-105 transition-transform`}>
                <div className="text-center mb-4">
                  <div className="text-2xl mb-2">{i === 2 ? '⭐' : '☆'}</div>
                  <div className="text-white font-semibold text-lg">{tier.name}</div>
                  <div className="text-orange font-bold text-2xl mt-2">{tier.commission}</div>
                  <div className="text-gray3 text-sm">с каждого заказа</div>
                </div>
                <div className="text-center text-gray3 text-sm mb-4">от {tier.minSales} оборота</div>
                <ul className="space-y-2">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray3 text-sm">
                      <span className="text-orange">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6 mb-8">
            <h2 className="text-white2 font-semibold text-xl mb-4">Как продвигать</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {ways.map((way, i) => (
                <div key={i} className="text-center p-4">
                  <div className="text-3xl mb-2">{way.icon}</div>
                  <div className="text-white font-medium">{way.title}</div>
                  <div className="text-gray3 text-sm">{way.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange/10 border border-orange/20 rounded-[var(--radius)] p-6">
            <h2 className="text-white2 font-semibold text-xl mb-4">Преимущества</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-gray3">
                  <span className="text-orange">✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}