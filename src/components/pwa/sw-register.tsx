'use client';

import { useEffect, useState } from 'react';

export function ServiceWorkerRegister() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Не регистрируем SW в dev режиме (localhost)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Unregister existing SW if any
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
        // Clear all caches
        if ('caches' in window) {
          caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
        }
      }
      console.log('[PWA] Service Worker disabled in dev mode');
      return;
    }

    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] Service Worker not supported');
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[PWA] Service Worker registered:', registration.scope);
        setIsRegistered(true);

        // Проверяем обновления
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Доступно обновление
              setUpdateAvailable(true);
              console.log('[PWA] Update available');
            }
          });
        });

        // Обработчик изменений состояния
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[PWA] Controller changed, reloading...');
        });

      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    };

    registerSW();
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update();
          window.location.reload();
        }
      });
    }
  };

  if (!isRegistered) return null;

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-black2 border border-orange/50 rounded-[var(--radius)] px-4 py-3 shadow-2xl flex items-center gap-3">
        <div className="w-2 h-2 bg-orange rounded-full animate-pulse" />
        <span className="text-[13px] text-white">
          Доступна новая версия приложения
        </span>
        <button
          onClick={handleUpdate}
          className="text-[13px] text-orange hover:text-orange/80 font-semibold"
        >
          Обновить
        </button>
      </div>
    </div>
  );
}
