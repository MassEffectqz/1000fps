import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata = {
  title: 'Способы оплаты — 1000fps',
};

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Способы оплаты' }]} />
        <div className="max-w-3xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-8">Способы оплаты</h1>
          <div className="prose prose-invert prose-sm max-w-none text-gray3 space-y-6">
            <h2 className="text-white2 font-semibold text-lg">Наличными</h2>
            <p>Оплата наличными при получении заказа в магазине или курьеру.</p>
            <h2 className="text-white2 font-semibold text-lg">Банковской картой</h2>
            <p>Оплата Visa, MasterCard, МИР при самовывозе или курьеру. Также доступна оплата на сайте.</p>
            <h2 className="text-white2 font-semibold text-lg">Онлайн-оплата</h2>
            <p>Оплата через сайт картой. После оформления заказа вы получите ссылку на оплату.</p>
            <h2 className="text-white2 font-semibold text-lg">Безналичный расчёт</h2>
            <p>Для юридических лиц — оплата по счёту. Свяжитесь с менеджером для выставления счёта.</p>
            <h2 className="text-white2 font-semibold text-lg">Рассрочка и кредит</h2>
            <p>Оформите рассрочку 0% или кредит прямо на сайте или в магазине.</p>
          </div>
        </div>
      </div>
    </div>
  );
}