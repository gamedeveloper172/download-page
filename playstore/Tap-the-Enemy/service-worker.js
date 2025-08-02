const CACHE_NAME = 'tap-the-enemy-cache-v1';

const urlsToCache = [
  '/game/Tap-the-Enemy/Tap-the-Enemy.html',
  '/image/enemy.png',
  '/playstore/Tap-the-Enemy/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
