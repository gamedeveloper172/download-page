// service-worker.js

const cacheName = 'game-world-cache-v1';
const assets = [
  '/',
  '/index.html',
  '/manifest.json',
  '/image/app-icon-192.png',
  '/image/app-icon-512.png',
  // Add more files if needed: CSS, JS, images
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
