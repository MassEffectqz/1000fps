'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Логируем ошибку (можно отправить в Sentry или другой сервис)
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-black2 border border-gray1 rounded-[var(--radius)] p-8 text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-red-500">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="font-display text-[20px] font-bold text-white mb-3">
          Ошибка загрузки
        </h1>

        {/* Message */}
        <p className="text-[13px] text-gray4 mb-6">
          {error.message || 'Произошла непредвиденная ошибка при загрузке страницы'}
        </p>

        {/* Error details (только в development) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left mb-6 bg-black3 border border-gray1 rounded-[var(--radius)] p-4">
            <summary className="text-[11px] font-bold text-gray3 uppercase tracking-wider mb-2 cursor-pointer">
              Детали ошибки
            </summary>
            <pre className="text-[11px] text-red-400 whitespace-pre-wrap break-words font-mono">
              {error.stack || error.toString()}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="px-5 py-[10px] bg-orange text-white rounded-[var(--radius)] text-[13px] font-semibold hover:bg-orange2 transition-colors"
          >
            Попробовать снова
          </button>

          <Link
            href="/admin"
            className="px-5 py-[10px] bg-black3 border border-gray1 text-gray4 rounded-[var(--radius)] text-[13px] font-semibold hover:text-white hover:border-gray2 transition-colors"
          >
            Вернуться на дашборд
          </Link>
        </div>
      </div>
    </div>
  );
}
