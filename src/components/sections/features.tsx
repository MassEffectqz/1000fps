const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    title: 'Самовывоз со склада',
    desc: 'Заберите заказ из наших складов в Волгограде и Волжском. Бесплатно и быстро.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Официальная гарантия',
    desc: 'До 3 лет на всю технику. Собственный сервисный центр.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: 'Рассрочка 0%',
    desc: 'До 24 месяцев без переплат. Одобрение за 2 минуты. Тинькофф, Сбер, ВТБ.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
    title: '50 000+ товаров',
    desc: 'Всё в наличии на складе. Видеокарты, процессоры, память, SSD и периферия.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-4 sm:py-6 lg:py-10">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray1 border border-gray1 rounded-[var(--radius)] overflow-hidden">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-5 bg-black2 transition-colors hover:bg-black3"
            >
              <div className="w-10 h-10 flex-shrink-0 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center">
                <div className="w-[18px] h-[18px] text-orange">{feature.icon}</div>
              </div>
              <div>
                <h4 className="font-body text-[13px] font-semibold text-white2 mb-1">
                  {feature.title}
                </h4>
                <p className="text-[12px] text-gray3 leading-[1.5]">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
