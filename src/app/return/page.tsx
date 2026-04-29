import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata = {
  title: 'Возврат и обмен — 1000fps',
};

export default function ReturnPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Возврат и обмен' }]} />
        <div className="max-w-3xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-8">Возврат и обмен</h1>
          <div className="prose prose-invert prose-sm max-w-none text-gray3 space-y-6">
            <h2 className="text-white2 font-semibold text-lg">Условия возврата</h2>
            <p>Вы можете вернуть товар надлежащего качества в течение 14 дней при соблюдении условий:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Товар не был в использовании</li>
              <li>Сохранены упаковка и товарный вид</li>
              <li>Имеется чек или подтверждение покупки</li>
            </ul>
            <h2 className="text-white2 font-semibold text-lg">Возврат товара ненадлежащего качества</h2>
            <p>Товар с браком можно вернуть в течение гарантийного срока. Мы проведим экспертизу и вернём деньги или обменяем товар.</p>
            <h2 className="text-white2 font-semibold text-lg">Как оформить возврат</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Свяжитесь с менеджером по телефону</li>
              <li>Заполните заявление на возврат</li>
              <li>Отправьте товар транспортной компанией</li>
              <li>Деньги вернутся в течение 10 дней</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}