import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Пункты выдачи — 1000FPS',
  description: 'Адреса наших складов в Волгограде и Волжском. Заберите заказ бесплатно.',
};

const warehouses = [
  {
    city: 'Волгоград',
    address: 'ул. Еременко, 126',
    phone: '8-902-650-05-11',
    hours: 'Пн–Вс: 8:00–22:00',
    mapUrl: 'https://yandex.ru/maps/-/CDa6jM~r',
    directions: 'Остановка «ТЦ Мармелад», 5 минут от остановки пешком',
    features: ['Самовывоз', 'Примерка', 'Проверка комплектации'],
  },
  {
    city: 'Волжский',
    address: 'пр. Ленина, 14',
    phone: '8-961-679-21-84',
    hours: 'Пн–Вс: 8:00–22:00',
    mapUrl: 'https://yandex.ru/maps/-/CDa6jN~s',
    directions: 'Центр города, рядом с остановкой «Площадь Ленина»',
    features: ['Самовывоз', 'Примерка', 'Проверка комплектации'],
  },
];

export default function WarehousesPage() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-black2 border-b border-gray1">
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Пункты выдачи' },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-b from-black2 to-black border-b border-gray1">
        <div className="container py-12">
          <div className="max-w-[700px]">
            <h1 className="font-display text-[28px] md:text-[40px] font-extrabold text-white2 mb-4 leading-tight">
              Пункты выдачи
            </h1>
            <p className="text-[14px] text-gray4 leading-relaxed">
              Заберите заказ бесплатно из любого нашего склада. Перед приездом рекомендуем позвонить и уточнить наличие товара.
            </p>
          </div>
        </div>
      </div>

      {/* Warehouses */}
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {warehouses.map((w, i) => (
            <div
              key={i}
              className="bg-black2 border border-gray1 rounded-[var(--radius)] overflow-hidden hover:border-orange/40 transition-colors group"
            >
              {/* Map placeholder */}
              <div className="w-full h-[200px] bg-black3 flex items-center justify-center relative">
                <a
                  href={w.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black3 to-gray1/20 hover:from-black3/80 hover:to-orange/10 transition-colors"
                >
                  <div className="text-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-gray3 mx-auto mb-2 group-hover:text-orange transition-colors">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-[13px] text-gray3 group-hover:text-orange transition-colors">
                      Открыть на карте
                    </span>
                  </div>
                </a>
              </div>

              {/* Info */}
              <div className="p-5">
                <h2 className="font-display text-[20px] font-bold text-white2 mb-4">
                  {w.city}
                </h2>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-orange mt-0.5 flex-shrink-0">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div>
                      <div className="text-[12px] text-gray3 uppercase tracking-wider mb-1">Адрес</div>
                      <div className="text-[14px] text-white2">{w.address}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-orange mt-0.5 flex-shrink-0">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-4.19-4.19 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.09 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z" />
                    </svg>
                    <div>
                      <div className="text-[12px] text-gray3 uppercase tracking-wider mb-1">Телефон</div>
                      <a href={`tel:${w.phone.replace(/[^0-9]/g, '')}`} className="text-[14px] text-orange hover:text-orange2">{w.phone}</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-orange mt-0.5 flex-shrink-0">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <div>
                      <div className="text-[12px] text-gray3 uppercase tracking-wider mb-1">Время работы</div>
                      <div className="text-[14px] text-white2">{w.hours}</div>
                    </div>
                  </div>
                </div>

                {/* Directions */}
                <div className="bg-black3 border border-gray1 rounded-[var(--radius)] p-3 mb-4">
                  <div className="text-[11px] text-gray3 uppercase tracking-wider mb-1">Как добраться</div>
                  <div className="text-[12px] text-gray4">{w.directions}</div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {w.features.map((f) => (
                    <span
                      key={f}
                      className="px-2.5 py-1 bg-orange/10 border border-orange/20 rounded-full text-[11px] text-orange font-medium"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-10 bg-black2 border border-gray1 rounded-[var(--radius)] p-6">
          <h2 className="font-display text-[18px] font-bold uppercase text-white2 mb-6">
            Как забрать заказ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange text-white rounded-full flex items-center justify-center font-display font-bold text-[16px] flex-shrink-0">
                1
              </div>
              <div>
                <div className="text-[14px] text-white2 font-medium mb-1">Оформите заказ</div>
                <div className="text-[12px] text-gray3">Выберите «Самовывоз» при оформлении заказа</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange text-white rounded-full flex items-center justify-center font-display font-bold text-[16px] flex-shrink-0">
                2
              </div>
              <div>
                <div className="text-[14px] text-white2 font-medium mb-1">Дождитесь готовности</div>
                <div className="text-[12px] text-gray3">Мы пришлём SMS или email, когда заказ будет готов</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange text-white rounded-full flex items-center justify-center font-display font-bold text-[16px] flex-shrink-0">
                3
              </div>
              <div>
                <div className="text-[14px] text-white2 font-medium mb-1">Заберите заказ</div>
                <div className="text-[12px] text-gray3">Приходите в пункт выдачи с паспортом или номером заказа</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
