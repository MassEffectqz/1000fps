import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Icons } from '@/components/ui/icons';

export const metadata = {
  title: 'Способы оплаты — 1000fps',
};

const paymentMethods = [
  { icon: <Icons.DollarSign className="w-8 h-8" />, title: 'Наличными', desc: 'При получении в магазине или курьеру', badge: null },
  { icon: <Icons.CreditCard className="w-8 h-8" />, title: 'Банковской картой', desc: 'Visa, MasterCard, МИР при самовывозе или курьеру', badge: null },
  { icon: <Icons.Globe className="w-8 h-8" />, title: 'Онлайн на сайте', desc: 'Оплата картой через безопасный шлюз', badge: null },
  { icon: <Icons.Briefcase className="w-8 h-8" />, title: 'По счёту', desc: 'Безналичный расчёт для юрлиц и ИП', badge: 'Для бизнеса' },
];

const banks = [
  { name: 'Тинькофф', period: 'до 24 мес', rate: '0%' },
  { name: 'Сбербанк', period: 'до 24 мес', rate: '0%' },
  { name: 'ВТБ', period: 'до 24 мес', rate: '0%' },
  { name: 'ОТП Банк', period: 'до 18 мес', rate: '0%' },
  { name: 'Почта Банк', period: 'до 36 мес', rate: 'от 4.9%' },
];

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Способы оплаты' }]} />
        <div className="max-w-4xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-8">Способы оплаты</h1>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {paymentMethods.map((item, i) => (
              <div key={i} className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6 hover:border-orange transition-colors">
                <div className="text-orange mb-3">{item.icon}</div>
                <div className="text-white2 font-semibold text-lg mb-1">{item.title}</div>
                <div className="text-gray3">{item.desc}</div>
                {item.badge && (
                  <span className="inline-block mt-2 bg-orange/20 text-orange text-xs px-2 py-1 rounded">{item.badge}</span>
                )}
              </div>
            ))}
          </div>

          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6 mb-8">
            <h2 className="text-white2 font-semibold text-xl mb-4 flex items-center gap-2">
              <Icons.Shield className="w-5 h-5 text-orange" /> Оплата онлайн на сайте
            </h2>
            <div className="text-gray3 space-y-3">
              <p>После оформления заказа вы получите ссылку для оплаты на указанный email и телефон.</p>
              <div className="flex items-start gap-2">
                <Icons.Check className="w-4 h-4 text-orange mt-1" />
                <div>Все платежи защищены SSL-шифрованием. Мы не храним данные ваших карт.</div>
              </div>
            </div>
          </div>

          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6 mb-8">
            <h2 className="text-white2 font-semibold text-xl mb-4 flex items-center gap-2">
              <Icons.FileText className="w-5 h-5 text-orange" /> Рассрочка и кредит
            </h2>
            <div className="text-gray3 mb-4">
              Оформите рассрочку 0% или кредит прямо на сайте или в магазине. Одобрение за 2 минуты.
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {banks.map((bank, i) => (
                <div key={i} className="bg-black border border-gray1 rounded-lg p-4">
                  <div className="text-white font-medium mb-1">{bank.name}</div>
                  <div className="text-orange font-bold text-sm">{bank.rate}</div>
                  <div className="text-gray3 text-xs">до {bank.period}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6">
            <h2 className="text-white2 font-semibold text-xl mb-4">Безналичный расчёт для юрлиц</h2>
            <div className="text-gray3 space-y-2">
              <p>Для организаций и ИП доступна оплата по счёту с НДС.</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Выставляем счёт в течение 1 часа</li>
                <li>Работаем с НДС 20%</li>
                <li>Отсрочка платежа до 30 дней для постоянных клиентов</li>
                <li>Сканы закрывающих документов направляем на email</li>
              </ul>
              <p className="mt-3">Для выставления счёта: <span className="text-orange">info@1000fps.ru</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}