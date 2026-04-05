import Link from 'next/link';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="text-center max-w-md">
        {/* 404 Text */}
        <div className="font-display text-[120px] md:text-[180px] font-extrabold text-gray1 leading-none mb-4 select-none">
          404
        </div>
        
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-black2 border border-gray1 rounded-[var(--radius)] flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-gray3">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Message */}
        <h1 className="font-display text-[28px] font-extrabold uppercase text-white2 mb-3">
          Страница не найдена
        </h1>
        <p className="text-gray3 text-[14px] mb-8 leading-relaxed">
          К сожалению, страница, которую вы ищете, не существует или была перемещена.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Link href="/">
            <Button variant="primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              На главную
            </Button>
          </Link>
          <Link href="/catalog">
            <Button variant="outline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Каталог
            </Button>
          </Link>
        </div>

        {/* Additional info */}
        <div className="mt-12 pt-8 border-t border-gray1">
          <p className="text-[12px] text-gray3 mb-4">Возможно, вам помогут эти ссылки:</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[13px]">
            <Link href="/catalog" className="text-gray4 hover:text-orange transition-colors">Видеокарты</Link>
            <Link href="/catalog" className="text-gray4 hover:text-orange transition-colors">Процессоры</Link>
            <Link href="/configurator" className="text-gray4 hover:text-orange transition-colors">Конфигуратор ПК</Link>
            <Link href="/profile" className="text-gray4 hover:text-orange transition-colors">Личный кабинет</Link>
            <Link href="#" className="text-gray4 hover:text-orange transition-colors">Помощь</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
