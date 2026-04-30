import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Контакты — 1000FPS',
  description: 'Контакты магазина 1000FPS в Волгограде. Телефон, email, режим работы.',
};

const contacts = {
  phone: '8-902-650-05-11',
  phone2: '8-961-679-21-84',
  email: 'info@1000fps.ru',
  telegram: '@1000fps_shop',
  whatsapp: '+79026500511',
  address: 'г. Волгоград, ул. Еременко, 126',
  workingHours: 'Пн–Вс: 8:00–22:00',
};

const socials = [
  {
    name: 'Telegram',
    link: `https://t.me/${contacts.telegram.replace('@', '')}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
  },
  {
    name: 'WhatsApp',
    link: `https://wa.me/${contacts.whatsapp}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  },
];

export default function ContactsPage() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-black2 border-b border-gray1">
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Контакты' },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-b from-black2 to-black border-b border-gray1">
        <div className="container py-12">
          <div className="max-w-[700px]">
            <h1 className="font-display text-[28px] md:text-[40px] font-extrabold text-white2 mb-4 leading-tight">
              Контакты
            </h1>
            <p className="text-[14px] text-gray4 leading-relaxed">
              Свяжитесь с нами любым удобным способом. Мы работаем ежедневно с 8:00 до 22:00.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {/* Phone */}
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6 hover:border-orange/40 transition-colors">
            <div className="w-12 h-12 bg-orange/10 rounded-[var(--radius)] flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-orange">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <h2 className="font-display text-[16px] font-bold text-white2 mb-2">Телефон</h2>
            <a href={`tel:${contacts.phone.replace(/[^0-9]/g, '')}`} className="text-[20px] font-display font-bold text-orange hover:text-orange2 block mb-1">
              {contacts.phone}
            </a>
            <a href={`tel:${contacts.phone2.replace(/[^0-9]/g, '')}`} className="text-[16px] text-gray4 hover:text-white2">
              {contacts.phone2}
            </a>
          </div>

          {/* Email */}
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6 hover:border-orange/40 transition-colors">
            <div className="w-12 h-12 bg-orange/10 rounded-[var(--radius)] flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-orange">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <h2 className="font-display text-[16px] font-bold text-white2 mb-2">Email</h2>
            <a href={`mailto:${contacts.email}`} className="text-[16px] text-orange hover:text-orange2">
              {contacts.email}
            </a>
          </div>

          {/* Working Hours */}
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6 hover:border-orange/40 transition-colors">
            <div className="w-12 h-12 bg-orange/10 rounded-[var(--radius)] flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-orange">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h2 className="font-display text-[16px] font-bold text-white2 mb-2">Режим работы</h2>
            <p className="text-[16px] text-white2">{contacts.workingHours}</p>
          </div>
        </div>

        {/* Socials */}
        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6 mb-10">
          <h2 className="font-display text-[18px] font-bold uppercase text-white2 mb-6">Мессенджеры</h2>
          <div className="flex flex-wrap gap-4">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-3 bg-black3 border border-gray1 rounded-[var(--radius)] text-white2 hover:border-orange hover:text-orange transition-colors"
              >
                {s.icon}
                <span className="font-medium">{s.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6">
          <h2 className="font-display text-[18px] font-bold uppercase text-white2 mb-6">Адрес</h2>
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-orange mt-0.5 flex-shrink-0">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div>
                  <div className="text-[14px] text-white2 font-medium">{contacts.address}</div>
                  <div className="text-[12px] text-gray3 mt-1">ТЦ «Мармелад», 2 этаж</div>
                </div>
              </div>
              <a
                href="https://yandex.ru/maps/-/CDa6jM~r"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-[var(--radius)] text-[13px] font-medium hover:bg-orange2 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Открыть на карте
              </a>
            </div>
            <div className="w-full md:w-[400px] h-[200px] bg-black3 rounded-[var(--radius)] overflow-hidden">
              <iframe
                src="https://yandex.ru/maps/-/CDa6jM~r?embed&ll=44.501%2C48.716&spn=0.02%2C0.02&z=16"
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Contact Form Note */}
        <div className="mt-10 bg-black2 border border-gray1 rounded-[var(--radius)] p-6">
          <h2 className="font-display text-[18px] font-bold uppercase text-white2 mb-4">Остались вопросы?</h2>
          <p className="text-[14px] text-gray4 mb-4">
            Если у вас есть вопросы о товарах, доставке или оплате — звоните или пишите. Мы поможем подобрать комплектующие под ваши задачи.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`tel:${contacts.phone.replace(/[^0-9]/g, '')}`}
              className="px-5 py-2.5 bg-orange text-white rounded-[var(--radius)] text-[13px] font-semibold hover:bg-orange2 transition-colors"
            >
              Позвонить
            </a>
            <a
              href={`https://t.me/${contacts.telegram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-black3 border border-gray1 text-white2 rounded-[var(--radius)] text-[13px] font-semibold hover:border-orange hover:text-orange transition-colors"
            >
              Написать в Telegram
            </a>
          </div>
        </div>
      </div>
    </>
  );
}