const CACHE_NAME = 'playzone-bar-v1';
const urlsToCache = [
  '/',
  '/favicon/favicon.ico',
  '/favicon/favicon-16x16.png',
  '/favicon/favicon-32x32.png',
  '/favicon/apple-touch-icon.png',
  '/favicon/android-chrome-192x192.png',
  '/favicon/android-chrome-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Use network-first for images and uploaded assets so users see latest uploads
  if (req.destination === 'image' || req.url.includes('/attached_assets/') || req.url.includes('/uploads/')) {
    event.respondWith(
      fetch(req).then((networkRes) => {
        // Optionally update the cache for future navigations
        caches.open(CACHE_NAME).then((cache) => cache.put(req, networkRes.clone()));
        return networkRes;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Default cache-first strategy for shell assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
