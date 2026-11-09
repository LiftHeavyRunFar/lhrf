const CACHE = 'lhrf-shell-v1.39.2-recovery';
const SHELL = ['./src/training-flow.js','./src/training-mode.js','./src/training-mode.css','./assets/fonts/Goldman-Bold.ttf','./src/performance-history.js','./src/android-polish.js','./src/gym-equipment.js','./src/run-presentation.js','./src/mobile-ux.js','./src/mobile-ux.css','./','./index.html','./manifest.webmanifest','./icon-lhrf.svg','./icon-lhrf-192-v2.png','./icon-lhrf-512-v2.png','./icon-lhrf-maskable-v2.png','./src/training-review.js','./src/garmin-import.js','./src/local-activity-import.js','./src/local-activity-import-ui.js','./src/intervals-sync.js','./src/garmin-workout.js','./src/workout-tools.js','./src/workout-tools.css','./src/running-workouts.js','./src/coach-constraints.js','./src/coaching-evidence.js','./src/running-preparation.js','./src/exercise-registry.js','./src/coach-engine.js','./src/coach-adapters.js','./src/coach-intake.js','./src/programme-install.js','./src/programme-replacement.js','./src/programme-replacement-ui.js','./src/training-backup.js','./programmes/november-2026.json'];
const SHELL_PATHS = new Set(SHELL.map(asset => new URL(asset, self.registration.scope).pathname));
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache =>
  cache.addAll(SHELL.map(asset => new Request(new URL(asset, self.registration.scope), {cache:'reload'})))
)));
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const key of await caches.keys()) {
    if (key.startsWith('lhrf-shell-') && key !== CACHE) await caches.delete(key);
  }
  await self.clients.claim();
})()));
// A v1.36.0 window reloads on controllerchange. Let it close before taking control.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (SHELL_PATHS.has(new URL(event.request.url).pathname)) {
      const installed = await cache.match(event.request, {ignoreSearch:true});
      if (installed) return installed;
    }
    try {
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone()).catch(() => {});
      return response;
    } catch {
      return (await cache.match(event.request)) || Response.error();
    }
  })());
});
