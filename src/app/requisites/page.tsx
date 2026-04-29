import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata = {
  title: 'Реквизиты — 1000fps',
};

export default function RequisitesPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Реквизиты' },
          ]}
        />
        <div className="max-w-3xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-8">
            Реквизиты
          </h1>
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6 space-y-6">
            <div>
              <div className="text-gray3 text-sm mb-1">Наименование</div>
              <div className="text-white2 font-medium">ИП "Тыщенко Даниил Андреевич"</div>
            </div>
            <div>
              <div className="text-gray3 text-sm mb-1">ИНН</div>
              <div className="text-white2 font-medium">________________________________</div>
            </div>
            <div>
              <div className="text-gray3 text-sm mb-1">ОГРН / ОГРНИП</div>
              <div className="text-white2 font-medium">________________________________</div>
            </div>
            <div>
              <div className="text-gray3 text-sm mb-1">КПП</div>
              <div className="text-white2 font-medium">________________________________</div>
            </div>
            <div>
              <div className="text-gray3 text-sm mb-1">Расчётный счёт</div>
              <div className="text-white2 font-medium">________________________________</div>
            </div>
            <div>
              <div className="text-gray3 text-sm mb-1">Банк</div>
              <div className="text-white2 font-medium">________________________________</div>
            </div>
            <div>
              <div className="text-gray3 text-sm mb-1">БИК</div>
              <div className="text-white2 font-medium">________________________________</div>
            </div>
            <div>
              <div className="text-gray3 text-sm mb-1">Корр. счёт</div>
              <div className="text-white2 font-medium">________________________________</div>
            </div>
            <div>
              <div className="text-gray3 text-sm mb-1">Юридический адрес</div>
              <div className="text-white2 font-medium">________________________________</div>
            </div>
            <div>
              <div className="text-gray3 text-sm mb-1">Фактический адрес</div>
              <div className="text-white2 font-medium">________________________________</div>
            </div>
            <div>
              <div className="text-gray3 text-sm mb-1">Телефон</div>
              <div className="text-white2 font-medium">+7 (999) 000-00-00</div>
            </div>
            <div>
              <div className="text-gray3 text-sm mb-1">E-mail</div>
              <div className="text-white2 font-medium">info@1000fps.ru</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}