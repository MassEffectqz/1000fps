import { FAQ } from '@/components/sections/faq';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Частые вопросы — 1000FPS',
  description: 'Ответы на популярные вопросы о доставке, оплате, гарантии и возврате товаров',
};

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-black2 to-black border-b border-gray1">
        <div className="container py-16">
          <div className="max-w-[800px]">
            <h1 className="font-display text-[32px] md:text-[48px] font-extrabold text-white2 mb-6 leading-tight">
              Частые вопросы
            </h1>
            <p className="text-[14px] text-gray4 max-w-[700px] leading-relaxed">
              Ответы на самые популярные вопросы о нашем магазине, доставке, оплате, гарантии и возврате товаров.
              Если вы не нашли ответ на свой вопрос, свяжитесь с нами.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <FAQ />

      {/* Contact Section */}
      <div className="bg-gradient-to-t from-black2 to-black border-t border-gray1">
        <div className="container py-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-[24px] font-bold uppercase text-white2 mb-3">
              Остались вопросы?
            </h2>
            <p className="text-[14px] text-gray4 max-w-[500px] mx-auto">
              Свяжитесь с нами любым удобным способом — мы ответим в течение 24 часов
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Phone */}
            <div className="text-center p-6 bg-black2 border border-gray1 rounded-[var(--radius)] hover:border-orange/50 transition-colors group">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-orange rounded-[var(--radius)] mb-5 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-white2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6.91-6.91 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.29 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z" />
                </svg>
              </div>
              <h3 className="font-display text-[18px] font-bold text-white2 mb-3">
                Телефон
              </h3>
              <a href="tel:89026500511" className="inline-block text-[16px] text-orange hover:text-orange2 font-medium transition-colors">
                8-902-650-05-11
              </a>
              <p className="text-[12px] text-gray4 mt-2">
                Волгоград
              </p>
            </div>

            {/* Email */}
            <div className="text-center p-6 bg-black2 border border-gray1 rounded-[var(--radius)] hover:border-orange/50 transition-colors group">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-orange rounded-[var(--radius)] mb-5 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-white2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <h3 className="font-display text-[18px] font-bold text-white2 mb-3">
                Email
              </h3>
              <a href="mailto:support@1000fps.ru" className="inline-block text-[16px] text-orange hover:text-orange2 font-medium transition-colors">
                support@1000fps.ru
              </a>
              <p className="text-[12px] text-gray4 mt-2">
                Ответим в течение 24 часов
              </p>
            </div>

            {/* Address */}
            <div className="text-center p-6 bg-black2 border border-gray1 rounded-[var(--radius)] hover:border-orange/50 transition-colors group">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-orange rounded-[var(--radius)] mb-5 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-white2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 className="font-display text-[18px] font-bold text-white2 mb-3">
                Магазины
              </h3>
              <p className="text-[14px] text-gray4 leading-relaxed">
                Волгоград, ул. Еременко, 126<br />
                Волжский, пр. Ленина, 14
              </p>
              <p className="text-[12px] text-gray4 mt-3">
                Пн–Вс: 8:00–22:00
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
