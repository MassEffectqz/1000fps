import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Icons } from '@/components/ui/icons';

export const metadata = {
  title: 'Доставка и самовывоз — 1000fps',
};

const deliveryMethods = [
  { icon: <Icons.Package className="w-8 h-8" />, title: 'СДЭК', price: 'от 150 ₽', time: '2-7 дней', desc: 'Доставка до пункта выдачи или курьером' },
  { icon: <Icons.Mail className="w-8 h-8" />, title: 'Boxberry', price: 'от 150 ₽', time: '2-7 дней', desc: 'Оплата при получении, более 5000 ПВЗ' },
  { icon: <Icons.MailOpen className="w-8 h-8" />, title: 'Почта России', price: 'от 200 ₽', time: '5-14 дней', desc: 'Доставка в любое отделение' },
  { icon: <Icons.Truck className="w-8 h-8" />, title: 'Курьерская доставка', price: 'от 300 ₽', time: '1-3 дня', desc: 'Доставка до двери по РФ' },
];

const localDelivery = [
  { title: 'Экспресс-доставка', time: '2 часа', price: '500 ₽', area: 'Волгоград и Волжский' },
  { title: 'Доставка по городу', time: '1 день', price: 'Бесплатно от 3000 ₽', area: 'Волгоград' },
];

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Доставка и самовывоз' }]} />
        <div className="max-w-4xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-8">Доставка и самовывоз</h1>
          
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {deliveryMethods.map((item, i) => (
              <div key={i} className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5 hover:border-orange transition-colors">
                <div className="text-orange mb-3">{item.icon}</div>
                <div className="text-white2 font-semibold mb-1">{item.title}</div>
                <div className="text-orange font-bold text-sm mb-1">{item.price}</div>
                <div className="text-gray3 text-sm">{item.time} · {item.desc}</div>
              </div>
            ))}
          </div>

          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6 mb-8">
            <h2 className="text-white2 font-semibold text-xl mb-4 flex items-center gap-2">
              <Icons.Truck className="w-5 h-5 text-orange" /> Доставка по Волгограду и области
            </h2>
            <div className="space-y-3">
              {localDelivery.map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b border-gray1 pb-3">
                  <div>
                    <div className="text-white2 font-medium">{item.title}</div>
                    <div className="text-gray3 text-sm">{item.area}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-orange font-bold">{item.price}</div>
                    <div className="text-gray3 text-sm">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6 mb-8">
            <h2 className="text-white2 font-semibold text-xl mb-4 flex items-center gap-2">
              <Icons.Store className="w-5 h-5 text-orange" /> Самовывоз
            </h2>
            <div className="text-gray3 space-y-2">
              <p>Заберите заказ бесплатно из наших магазинов:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li><strong>ТЦ &quot;Ворошиловский&quot;</strong> — ул. Рабоче-Крестьянская, 9Б, 2 этаж</li>
                <li><strong>ТЦ &quot;Спартак&quot;</strong> — пр-т им. Ленина, 54Д</li>
                <li><strong>ТЦ &quot;Диамант&quot;</strong> — ул. Землячки, 1</li>
              </ul>
              <p className="mt-2 text-sm">Время работы: Ежедневно с 10:00 до 20:00</p>
            </div>
          </div>

          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6">
            <h2 className="text-white2 font-semibold text-xl mb-4">Сроки доставки</h2>
            <div className="text-gray3 space-y-3">
              <div className="flex items-start gap-2">
                <Icons.Check className="w-4 h-4 text-orange mt-1" />
                <div>Товар в наличии — отправка в течение 1-2 рабочих дней</div>
              </div>
              <div className="flex items-start gap-2">
                <Icons.Check className="w-4 h-4 text-orange mt-1" />
                <div>Товар под заказ — срок уточняйте у менеджера (обычно 3-7 дней)</div>
              </div>
              <div className="flex items-start gap-2">
                <Icons.Check className="w-4 h-4 text-orange mt-1" />
                <div>Сборка ПК под заказ — 1-3 рабочих дня</div>
              </div>
              <div className="flex items-start gap-2">
                <Icons.Check className="w-4 h-4 text-orange mt-1" />
                <div>Отправка транспортными компаниями — ежедневно, кроме воскресенья</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}