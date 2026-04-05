'use client';

import { useEffect } from 'react';

/**
 * Компонент для очистки старого Service Worker кэша API запросов.
 * Удаляется после того как все пользователи обновят страницу.
 */
export function SWCleanup() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Очищаем динамический кэш который мог закэшировать API запросы
        caches.keys().then((keys) => {
          keys.forEach((key) => {
            if (key.includes('dynamic') || key.includes('1000fps-dynamic')) {
              caches.delete(key);
            }
          });
        });

        // Отправляем сообщение SW для очистки кэша
        if (registration.active) {
          registration.active.postMessage({ type: 'CLEAR_API_CACHE' });
        }
      });
    }
  }, []);

  return null;
}
