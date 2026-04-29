import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata = {
  title: 'Рассрочка 0% — 1000fps',
};

const banks = [
  { name: 'Тинькофф', logo: '🏦', period: 'до 24 мес', rate: '0%', max: '500 000 ₽' },
  { name: 'Сбербанк', logo: '🏦', period: 'до 24 мес', rate: '0%', max: '300 000 ₽' },
  { name: 'ВТБ', logo: '🏦', period: 'до 24 мес', rate: '0%', max: '400 000 ₽' },
  { name: 'ОТП Банк', logo: '🏦', period: 'до 18 мес', rate: '0%', max: '300 000 ₽' },
  { name: 'МТС Банк', logo: '🏦', period: 'до 24 мес', rate: '0%', max: '200 000 ₽' },
  { name: 'Почта Банк', logo: '🏦', period: 'до 36 мес', rate: 'от 4.9%', max: '500 000 ₽' },
];

const requirements = [
  'Паспорт РФ',
  'Возраст от 18 до 70 лет',
  'Официальное трудоустройство',
  'Кредитная история без серьёзных просрочек',
];

const ways = [
  { title: 'На сайте', steps: 'Выберите товар → Оформить → Рассрочка → Заполнить заявку → Одобрение 2 мин' },
  { title: 'В магазине', steps: 'Выберите товар → Обратитесь к менеджеру → Заполните заявку → Мгновенное одобрение' },
  { title: 'По телефону', steps: 'Позвоните нам → Менеджер оформит заявку → Одобрение → Оплата картой' },
];

const benefits = [
  { icon: '💰', title: 'Без переплаты', desc: '0% годовых, вы платите только сумму покупки' },
  { icon: '⚡', title: 'Быстрое одобрение', desc: 'Решение за 2 минуты, без справок и поручителей' },
  { icon: '📅', title: 'Удобные платежи', desc: 'Автоматическое списание, напоминания о платежах' },
  { icon: '👍', title: 'Без первоначального взноса', desc: 'Многие банки не требуют первый платёж' },
];

export default function InstallmentPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Рассрочка 0%' }]} />
        <div className="max-w-4xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-4">Рассрочка 0%</h1>
          <p className="text-gray3 text-lg mb-8">Оформите рассрочку без переплат на срок до 24 месяцев. Без первоначального взноса!</p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {banks.map((bank, i) => (
              <div key={i} className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5 hover:border-orange transition-colors">
                <div className="text-2xl mb-2">{bank.logo}</div>
                <div className="text-white font-semibold mb-2">{bank.name}</div>
                <div className="flex justify-between text-sm">
                  <div><span className="text-orange font-bold">{bank.rate}</span> <span className="text-gray3">ставка</span></div>
                  <div><span className="text-white2">{bank.period}</span></div>
                </div>
                <div className="text-gray3 text-sm mt-2">до {bank.max}</div>
              </div>
            ))}
          </div>

          <div className="bg-orange/10 border border-orange/20 rounded-[var(--radius)] p-6 mb-8">
            <h2 className="text-white2 font-semibold text-xl mb-4">Требования к заёмщику</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-gray3">
                  <span className="text-orange">✓</span> {req}
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {benefits.map((item, i) => (
              <div key={i} className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-white font-semibold mb-1">{item.title}</div>
                <div className="text-gray3 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>

          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6">
            <h2 className="text-white2 font-semibold text-xl mb-4">Как оформить</h2>
            <div className="space-y-4">
              {ways.map((way, i) => (
                <div key={i} className="border border-gray1 rounded-lg p-4">
                  <div className="text-white font-medium mb-2">{way.title}</div>
                  <div className="text-gray3 text-sm">{way.steps}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}