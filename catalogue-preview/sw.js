const CACHE = 'lhrf-catalogue-preview-v2';
const SHELL = [
  './', './index.html', './app.js', './app.css', './manifest.webmanifest',
  '../src/programme-catalogue.js', '../src/catalogue-training.js',
  '../src/garmin-workout.js', '../src/local-activity-import.js',
  '../icon-lhrf-192-v2.png', '../icon-lhrf-512-v2.png', '../icon-lhrf-maskable-v2.png',
].map(path => new URL(path, self.registration.scope).href);
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL.map(url => new Request(url, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('lhrf-catalogue-preview-') && key !== CACHE)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  url.search = '';
  if (!SHELL.includes(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    return (await cache.match(url.href)) ?? fetch(event.request);
  })());
});
