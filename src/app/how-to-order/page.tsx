import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata = {
  title: 'Как оформить заказ — 1000fps',
};

const steps = [
  { step: 1, icon: '🔍', title: 'Выберите товар', desc: 'Найдите нужный товар через каталог или поиск. Используйте фильтры для удобного поиска.' },
  { step: 2, icon: '🛒', title: 'Добавьте в корзину', desc: 'Нажмите кнопку «В корзину». Товар добавится в корзину, вы можете продолжить покупки.' },
  { step: 3, icon: '📝', title: 'Оформите заказ', desc: 'Перейдите в корзину, проверьте товары и нажмите «Оформить заказ».' },
  { step: 4, icon: '📋', title: 'Заполните данные', desc: 'Укажите ФИО, телефон, адрес доставки и выберите способ оплаты.' },
  { step: 5, icon: '✅', title: 'Подтвердите', desc: 'Получите подтверждение на email и SMS с номером заказа.' },
  { step: 6, icon: '📦', title: 'Получите товар', desc: 'Менеджер свяжется для подтверждения. Получите товар удобным способом.' },
];

const tips = [
  'Регистрируйтесь — получите доступ к истории заказов и персональным скидкам',
  'Проверяйте наличие товара перед оформлением',
  'Указывайте точный адрес и контактный телефон',
  'При получении проверяйте товар и комплектацию',
];

export default function HowToOrderPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Как оформить заказ' }]} />
        <div className="max-w-4xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-8">Как оформить заказ</h1>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {steps.map((item, i) => (
              <div key={i} className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5 hover:border-orange transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-white font-semibold mb-1">{item.title}</div>
                    <div className="text-gray3 text-sm">{item.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-orange/10 border border-orange/20 rounded-[var(--radius)] p-6">
            <h2 className="text-white2 font-semibold text-xl mb-4">Полезные советы</h2>
            <ul className="space-y-3">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-center gap-2 text-gray3">
                  <span className="text-orange">✓</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}