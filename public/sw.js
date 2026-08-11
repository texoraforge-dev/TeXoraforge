const CACHE_NAME = 'texora-forge-offline-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/src/assets/images/texora_app_logo_1786115622051.jpg'
];

const SVG_OFFLINE_AVATAR = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#1e293b"/>
  <circle cx="50" cy="38" r="18" fill="#64748b"/>
  <path d="M 20 82 C 20 62, 35 52, 50 52 C 65 52, 80 62, 80 82 Z" fill="#64748b"/>
</svg>`;

// Install Event - Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline app shell');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[ServiceWorker] Install pre-cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response immediately if present
      if (cachedResponse) {
        // Asynchronously update cache in background if online
        if (navigator.onLine) {
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, networkResponse.clone());
                });
              }
            })
            .catch(() => { /* Offline fallback active */ });
        }
        return cachedResponse;
      }

      // Fetch from network and save to cache
      return fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (event.request.url.startsWith(self.location.origin) ||
              event.request.destination === 'image' ||
              event.request.url.includes('unsplash.com'))
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If network fails (Offline mode)
          // 1. Navigation requests fallback to offline SPA shell index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }

          // 2. Image requests fallback to SVG Avatar
          if (
            event.request.destination === 'image' ||
            url.pathname.endsWith('.jpg') ||
            url.pathname.endsWith('.png') ||
            url.pathname.endsWith('.webp') ||
            url.hostname.includes('unsplash.com')
          ) {
            return new Response(SVG_OFFLINE_AVATAR, {
              headers: { 'Content-Type': 'image/svg+xml' }
            });
          }
        });
    })
  );
});
