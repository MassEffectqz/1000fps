'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Проверяем iOS
    const isIOSDevice = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
    setIsIOS(isIOSDevice);

    // Проверяем, есть ли отложенное событие установки
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('[PWA] beforeinstallprompt event fired');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Проверяем, не скрывал ли пользователь ранее
      if (typeof window !== 'undefined') {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        const dismissedAt = dismissed ? parseInt(dismissed) : 0;
        const now = Date.now();
        
        // Показываем через 1 минуту после первого визита
        if (now - dismissedAt > 60000) {
          setShowPrompt(true);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('[PWA] User choice:', outcome);
      
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
      }
      
      setShowPrompt(false);
      setDeferredPrompt(null);
    } catch (error) {
      console.error('[PWA] Install prompt error:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }
  };

  // Не показываем на iOS (там нет нативной установки)
  if (isIOS) return null;

  // Не показываем если уже установлено
  if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) return null;

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-12 h-12 bg-orange/10 rounded-[var(--radius)] flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-orange">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-[14px] font-bold text-white mb-1">
              Установите приложение 1000FPS
            </h3>
            <p className="text-[12px] text-gray4 mb-3">
              Быстрый доступ к магазину без браузера. Работает даже офлайн!
            </p>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleInstall}
                size="sm"
                className="h-8 text-[12px] bg-orange hover:bg-orange/90"
              >
                Установить
              </Button>
              <button
                onClick={handleDismiss}
                className="text-[12px] text-gray4 hover:text-white transition-colors"
              >
                Позже
              </button>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="w-6 h-6 flex items-center justify-center text-gray4 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
