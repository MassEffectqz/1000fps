// Service Worker для 1000FPS PWA
// Версия: 1.0.0

const CACHE_NAME = '1000fps-v2';
const STATIC_CACHE = '1000fps-static-v2';
const DYNAMIC_CACHE = '1000fps-dynamic-v2';
const IMAGE_CACHE = '1000fps-images-v2';

// Ресурсы для кэширования при установке
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
];

// Максимальный размер кэша
const MAX_CACHE_SIZE = 50;
const MAX_IMAGE_CACHE_SIZE = 30;

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation complete, skipping waiting');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Installation error:', err);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => {
              // Удаляем ВСЕ старые версии кэша (начинающиеся с 1000fps)
              return key.startsWith('1000fps-');
            })
            .map((key) => {
              console.log('[SW] Removing old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete, claiming clients');
        return self.clients.claim();
      })
      .catch((err) => {
        console.error('[SW] Activation error:', err);
      })
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Игнорируем запросы не к нашему домену
  if (url.origin !== location.origin) {
    return;
  }

  // Игнорируем POST запросы
  if (request.method !== 'GET') {
    return;
  }

  // Стратегия для изображений - Cache First
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE));
    return;
  }

  // Стратегия для статики - Cache First
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, MAX_CACHE_SIZE));
    return;
  }

  // Стратегия для HTML страниц - Network First с fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Стратегия для API запросов - Network Only (без кэширования!)
  // API запросы требуют актуальных данных и авторизации, кэширование недопустимо
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Сервер недоступен' }), {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    return;
  }

  // Стратегия по умолчанию - Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE, MAX_CACHE_SIZE));
});

// Стратегия Cache First
async function cacheFirst(request, cacheName, maxSize) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Обновляем кэш в фоне
    fetch(request).then((response) => {
      if (response && response.status === 200) {
        updateCache(cacheName, request, response.clone(), maxSize);
      }
    }).catch(() => {
      // Игнорируем ошибки сети
    });
    
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      try {
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
        trimCache(cacheName, maxSize);
      } catch (cacheError) {
        console.error('[SW] Cache put failed:', cacheError);
        // Continue to return the network response even if caching fails
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache First failed:', error);
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Стратегия Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Кэшируем успешные ответы
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
    
    // Пробуем вернуть из кэша
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Возвращаем offline страницу для навигации
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Стратегия Stale While Revalidate
async function staleWhileRevalidate(request, cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
      trimCache(cacheName, maxSize);
    }
    return networkResponse;
  }).catch(() => {
    // Игнорируем ошибки
  });

  return cachedResponse || fetchPromise;
}

// Проверка на статический ресурс
function isStaticAsset(request) {
  const url = new URL(request.url);
  return /\.(js|css|woff|woff2|ttf|eot)$/.test(url.pathname);
}

// Обновление кэша
async function updateCache(cacheName, request, response, maxSize) {
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
    await trimCache(cacheName, maxSize);
  } catch (error) {
    console.error('[SW] Cache update failed:', error);
  }
}

// Очистка старого кэша
async function trimCache(cacheName, maxSize) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxSize) {
      await cache.delete(keys[0]);
      await trimCache(cacheName, maxSize);
    }
  } catch (error) {
    console.error('[SW] Cache trim failed:', error);
  }
}

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => {
      keys.forEach((key) => {
        if (key !== STATIC_CACHE) {
          caches.delete(key);
        }
      });
    });
  }

  // Очистка только динамического кэша (где могли быть API запросы)
  if (event.data && event.data.type === 'CLEAR_API_CACHE') {
    caches.keys().then((keys) => {
      keys.forEach((key) => {
        if (key.includes('dynamic')) {
          caches.delete(key);
        }
      });
    });
  }
});

// Background Sync для офлайн действий
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart());
  }
});

async function syncCart() {
  console.log('[SW] Syncing cart...');
  // Логика синхронизации корзины
}

// Push уведомления
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || '1000FPS';
  const options = {
    body: data.body || 'Новое уведомление',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: [
      {
        action: 'open',
        title: 'Открыть',
      },
      {
        action: 'close',
        title: 'Закрыть',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Клик по уведомлению
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        const url = event.notification.data?.url || '/';
        
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

console.log('[SW] Service Worker loaded');
