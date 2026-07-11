const CACHE_NAME = 'playzone-bar-v2';
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

// Helper: try network first, fallback to cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle GET requests
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Network-first for images and API endpoints (avoid stale images and ensure fresh data)
  if (req.destination === 'image' || url.pathname.startsWith('/api')) {
    event.respondWith(networkFirst(req));
    return;
  }

  // For navigation and static assets use cache-first, but update cache in background
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.ok) {
          caches.open(CACHE_NAME).then((cache) => cache.put(req, res.clone())).catch(() => {});
        }
        return res;
      });
    })
  );
});
