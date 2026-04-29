import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata = {
  title: 'Оферта — 1000fps',
};

export default function OfferPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Оферта' },
          ]}
        />
        <div className="max-w-3xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-8">
            Договор оферты
          </h1>
          <div className="prose prose-invert prose-sm max-w-none text-gray3 space-y-6">
            <p>
              Настоящий договор публичной оферты (далее — «Оферта») является предложением интернет-магазина 1000fps.ru заключить договор купли-продажи товаров на условиях, изложенных ниже.
            </p>
            <h2 className="text-white2 font-semibold text-lg">1. Термины и определения</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Продавец</strong> — ИП «1000fps», ОГРН _______________</li>
              <li><strong>Покупатель</strong> — физическое или юридическое лицо, оформившее заказ на сайте</li>
              <li><strong>Товар</strong> — продукция, представленная в каталоге интернет-магазина</li>
            </ul>
            <h2 className="text-white2 font-semibold text-lg">2. Предмет договора</h2>
            <p>
              Продавец обязуется передать Покупателю товар, соответствующий описанию на сайте, а Покупатель обязуется оплатить и принять товар на условиях настоящей Оферты.
            </p>
            <h2 className="text-white2 font-semibold text-lg">3. Порядок оформления заказа</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Выбор товара на сайте</li>
              <li>Добавление в корзину</li>
              <li>Заполнение контактных данных</li>
              <li>Выбор способа доставки и оплаты</li>
              <li>Подтверждение заказа</li>
            </ul>
            <h2 className="text-white2 font-semibold text-lg">4. Стоимость и оплата</h2>
            <p>
              Цены на товары указаны на сайте и могут быть изменены Продавцом без предварительного уведомления. Оплата производится способами, указанными на сайте.
            </p>
            <h2 className="text-white2 font-semibold text-lg">5. Доставка</h2>
            <p>
              Доставка осуществляется по всей России. Сроки и стоимость доставки указаны при оформлении заказа.
            </p>
            <h2 className="text-white2 font-semibold text-lg">6. Возврат товара</h2>
            <p>
              Возврат товара осуществляется в соответствии с Законом о защите прав потребителей. Товар надлежащего качества может быть возвращён в течение 14 дней.
            </p>
            <h2 className="text-white2 font-semibold text-lg">7. Ответственность</h2>
            <p>
              Продавец не несёт ответственности за ущерб, причинённый Покупателю вследствие ненадлежащего использования товара.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}