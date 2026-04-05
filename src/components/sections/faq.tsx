'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'Как оформить заказ?',
    answer: 'Выберите товар, нажмите "Добавить в корзину", затем оформите заказ через корзину. Менеджер свяжется с вами для подтверждения деталей доставки и оплаты.',
  },
  {
    question: 'Какие способы оплаты вы принимаете?',
    answer: 'Мы принимаем оплату банковскими картами (Visa, Mastercard, МИР), через СБП, наличными при получении, а также в рассрочку от 0% до 24 месяцев.',
  },
  {
    question: 'Как работает доставка?',
    answer: 'Доставляем по всей России: СДЭК, Boxberry, Почта России, курьером. Экспресс-доставка за 2 часа доступна в Волгограде и Волжском. Самовывоз из наших магазинов бесплатный.',
  },
  {
    question: 'Есть ли гарантия на товары?',
    answer: 'Да, на все товары действует официальная гарантия от 6 месяцев до 3 лет. Собственный сервисный центр в Волгограде. Расширенная гарантия доступна при покупке.',
  },
  {
    question: 'Можно ли вернуть товар?',
    answer: 'Да, в течение 14 дней можно вернуть товар надлежащего качества. Технику с браком меняем или возвращаем деньги в течение гарантийного срока.',
  },
  {
    question: 'Предоставляете ли вы рассрочку?',
    answer: 'Да, рассрочка 0% до 24 месяцев от банков-партнёров (Тинькофф, Сбер, ВТБ). Одобрение за 2 минуты прямо в магазине или на сайте.',
  },
  {
    question: 'Как работает конфигуратор ПК?',
    answer: 'Выберите компоненты в конфигураторе, система проверит совместимость. Наши специалисты бесплатно соберут и протестируют ПК перед отправкой.',
  },
  {
    question: 'Есть ли у вас магазины?',
    answer: 'Да, два магазина в Волгоградской области: Волгоград (ул. Еременко, 126) и Волжский (пр. Ленина, 14). Режим работы: Пн–Вс 8:00–22:00.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-12 bg-transparent">
      <div className="container">
        {/* FAQ List */}
        <div className="max-w-[800px] mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="group border border-gray1 rounded-[var(--radius)] overflow-hidden bg-black2 transition-all duration-200 hover:border-orange/50 hover:shadow-lg hover:shadow-orange/5"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left bg-transparent border-none cursor-pointer"
              >
                <span className="font-display text-[14px] md:text-[15px] font-bold text-white2 pr-8">
                  {faq.question}
                </span>
                <div className={cn(
                  'w-8 h-8 flex items-center justify-center rounded-full bg-gray1 transition-all duration-300 group-hover:bg-orange/10 flex-shrink-0',
                  openIndex === index && 'bg-orange'
                )}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={cn(
                      'w-4 h-4 text-gray3 transition-transform duration-300',
                      openIndex === index ? 'rotate-180 text-white2' : ''
                    )}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </button>

              <div
                className={cn(
                  'overflow-hidden transition-all duration-300',
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                )}
              >
                <div className="px-6 pb-5">
                  <div className="w-12 h-px bg-orange/30 mb-4" />
                  <p className="text-[13px] text-gray4 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
