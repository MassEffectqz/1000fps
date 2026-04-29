import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata = {
  title: 'Как оформить заказ — 1000fps',
};

export default function HowToOrderPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Как оформить заказ' }]} />
        <div className="max-w-3xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-8">Как оформить заказ</h1>
          <div className="prose prose-invert prose-sm max-w-none text-gray3 space-y-6">
            <h2 className="text-white2 font-semibold text-lg">1. Выбор товара</h2>
            <p>Найдите нужный товар через каталог или поиск. Добавьте его в корзину кнопкой «В корзину».</p>
            <h2 className="text-white2 font-semibold text-lg">2. Оформление заказа</h2>
            <p>Перейдите в корзину, проверьте список товаров и нажмите «Оформить заказ».</p>
            <h2 className="text-white2 font-semibold text-lg">3. Заполнение данных</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Укажите ФИО и контактный телефон</li>
              <li>Выберите способ доставки</li>
              <li>Укажите адрес или пункт самовывоза</li>
              <li>Выберите способ оплаты</li>
            </ul>
            <h2 className="text-white2 font-semibold text-lg">4. Подтверждение</h2>
            <p>После оформления вам на почту придёт подтверждение с номером заказа.</p>
            <h2 className="text-white2 font-semibold text-lg">5. Получение</h2>
            <p>Менеджер свяжется с вами для подтверждения заказа. При получении проверьте товар.</p>
          </div>
        </div>
      </div>
    </div>
  );
}