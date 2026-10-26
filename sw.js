const CACHE = 'lhrf-shell-v1.15.1';
const SHELL = ['./','./index.html','./manifest.webmanifest','./icon-lhrf.svg','./icon-lhrf-192-v2.png','./icon-lhrf-512-v2.png','./icon-lhrf-maskable-v2.png','./src/coach-engine.js','./src/coach-adapters.js','./src/programme-install.js','./programmes/november-2026.json'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))));
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const key of await caches.keys()) {
    if (key.startsWith('lhrf-shell-') && key !== CACHE) await caches.delete(key);
  }
  await self.clients.claim();
})()));
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      if (response.ok) {
        const cache = await caches.open(CACHE);
        cache.put(event.request, response.clone());
      }
      return response;
    } catch {
      return (await caches.match(event.request)) || Response.error();
    }
  })());
});
