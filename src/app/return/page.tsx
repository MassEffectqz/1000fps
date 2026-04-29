import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Icons } from '@/components/ui/icons';

export const metadata = {
  title: 'Возврат и обмен — 1000fps',
};

const periods = [
  { title: 'Надлежащего качества', days: '14 дней', icon: <Icons.Check className="w-6 h-6" />, desc: 'Товар не был в использовании, сохранены упаковка и товарный вид' },
  { title: 'Ненадлежащего качества', days: 'гарантия', icon: <Icons.AlertTriangle className="w-6 h-6" />, desc: 'В течение гарантийного срока, после экспертизы' },
];

const process = [
  { step: 1, title: 'Свяжитесь с нами', desc: 'Позвоните или напишите, опишите причину возврата' },
  { step: 2, title: 'Заполните заявление', desc: 'Скачайте бланк или заполните в магазине' },
  { step: 3, title: 'Отправьте товар', desc: 'Отправьте ТК или принесите в магазин' },
  { step: 4, title: 'Деньги вернутся', desc: 'В течение 10 дней после одобрения' },
];

const reasons = [
  'Товар не подошёл по характеристикам',
  'Обнаружен дефект или неисправность',
  'Товар не соответствует описанию',
  'Курьер привез не тот товар',
];

export default function ReturnPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Возврат и обмен' }]} />
        <div className="max-w-4xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-4">Возврат и обмен</h1>
          <p className="text-gray3 text-lg mb-8">Простой и быстрый процесс возврата. Защита прав потребителей по закону РФ.</p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {periods.map((item, i) => (
              <div key={i} className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6 hover:border-orange transition-colors">
                <div className="text-orange mb-3">{item.icon}</div>
                <div className="text-white font-semibold text-lg mb-1">{item.title}</div>
                <div className="text-orange font-bold mb-2">{item.days}</div>
                <div className="text-gray3 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>

          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6 mb-8">
            <h2 className="text-white2 font-semibold text-xl mb-4 flex items-center gap-2">
              <Icons.Refresh className="w-5 h-5 text-orange" /> Как оформить возврат
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {process.map((p) => (
                <div key={p.step}>
                  <div className="w-8 h-8 bg-orange rounded-full flex items-center justify-center text-white font-bold mb-2">{p.step}</div>
                  <div className="text-white font-medium">{p.title}</div>
                  <div className="text-gray3 text-sm">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6 mb-8">
            <h2 className="text-white2 font-semibold text-xl mb-4">Основания для возврата</h2>
            <ul className="space-y-3">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-center gap-2 text-gray3">
                  <Icons.Check className="w-4 h-4 text-orange" /> {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5 text-center">
              <Icons.Clock className="w-8 h-8 text-orange mx-auto mb-2" />
              <div className="text-white font-medium">10 дней</div>
              <div className="text-gray3 text-sm">Срок возврата денег</div>
            </div>
            <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5 text-center">
              <Icons.Package className="w-8 h-8 text-orange mx-auto mb-2" />
              <div className="text-white font-medium">Бесплатно</div>
              <div className="text-gray3 text-sm">Обратная доставка</div>
            </div>
            <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5 text-center">
              <Icons.DollarSign className="w-8 h-8 text-orange mx-auto mb-2" />
              <div className="text-white font-medium">Любой способ</div>
              <div className="text-gray3 text-sm">На карту или наличными</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}