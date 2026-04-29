import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata = {
  title: 'Корпоративным клиентам — 1000fps',
};

const benefits = [
  { icon: '🏢', title: 'Оптовые цены', desc: 'Специальные цены от 1 единицы товара' },
  { icon: '💳', title: 'Отсрочка платежа', desc: 'До 30 дней для постоянных клиентов' },
  { icon: '👤', title: 'Персональный менеджер', desc: 'Выделенный специалист для вашей компании' },
  { icon: '🚚', title: 'Доставка по РФ', desc: 'Доставка в любой регион России' },
  { icon: '📊', title: 'Без НДС или с НДС', desc: 'Работаем по любой системе налогообложения' },
  { icon: '🎧', title: 'Приоритетная поддержка', desc: 'Техническая поддержка 24/7' },
];

const targetSegments = [
  { title: 'Юридические лица', desc: 'ООО, АО, ПАО любых форм собственности' },
  { title: 'ИП', desc: 'Индивидуальные предприниматели' },
  { title: 'Госучреждения', desc: 'Школы, больницы, администрации' },
  { title: 'Образование', desc: 'Вузы, колледжи, учебные центры' },
  { title: 'IT-компании', desc: 'Стартапы, аутсорс, разработчики' },
  { title: 'Розничные магазины', desc: 'Дилеры и партнёры' },
];

const process = [
  'Оставьте заявку на сайте или позвоните',
  'Менеджер свяжется в течение 1 часа',
  'Подтверждение юр. данных и реквизитов',
  'Заключение договора',
  'Доступ к оптовым ценам и системе заказов',
];

const documents = [
  'Свидетельство ОГРН',
  'Свидетельство ИНН',
  'Паспорт директора',
  'Приказ о назначении',
  'Доверенность (при необходимости)',
];

export default function B2BPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Корпоративным клиентам' }]} />
        <div className="max-w-4xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-4">Корпоративным клиентам</h1>
          <p className="text-gray3 text-lg mb-8">Специальные условия для бизнеса: оптовые цены, отсрочка платежа, персональный менеджер.</p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {benefits.map((item, i) => (
              <div key={i} className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5 hover:border-orange transition-colors">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-white font-semibold mb-1">{item.title}</div>
                <div className="text-gray3 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>

          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6 mb-8">
            <h2 className="text-white2 font-semibold text-xl mb-4">Для кого</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {targetSegments.map((seg, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-orange">✓</span>
                  <div>
                    <span className="text-white">{seg.title}</span>
                    <span className="text-gray3 text-sm"> — {seg.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange/10 border border-orange/20 rounded-[var(--radius)] p-6 mb-8">
            <h2 className="text-white2 font-semibold text-xl mb-4">Как стать клиентом</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-3">
              {process.map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-8 h-8 bg-orange rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">{i + 1}</div>
                  <div className="text-gray3 text-sm">{step}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <a href="mailto:b2b@1000fps.ru" className="text-orange hover:underline">b2b@1000fps.ru</a>
            </div>
          </div>

          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6">
            <h2 className="text-white2 font-semibold text-xl mb-4">Документы для оформления</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-2 text-gray3">
                  <span className="text-orange">✓</span> {doc}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}