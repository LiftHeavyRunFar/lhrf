const CACHE = 'lhrf-shell-v1.40.3';
const RELEASE = CACHE.slice('lhrf-shell-v'.length);
const SHELL = ['./src/training-flow.js','./src/training-mode.js','./src/training-mode.css','./assets/fonts/Goldman-Bold.ttf','./src/performance-history.js','./src/android-polish.js','./src/gym-equipment.js','./src/run-presentation.js','./src/mobile-ux.js','./src/mobile-ux.css','./','./index.html','./manifest.webmanifest','./icon-lhrf.svg','./icon-lhrf-192-v2.png','./icon-lhrf-512-v2.png','./icon-lhrf-maskable-v2.png','./src/training-review.js','./src/garmin-import.js','./src/local-activity-import.js','./src/local-activity-import-ui.js','./src/intervals-sync.js','./src/garmin-workout.js','./src/workout-tools.js','./src/workout-tools.css','./src/running-workouts.js','./src/coach-constraints.js','./src/coaching-evidence.js','./src/running-preparation.js','./src/exercise-registry.js','./src/coach-engine.js','./src/coach-adapters.js','./src/coach-intake.js','./src/programme-install.js','./src/programme-replacement.js','./src/programme-replacement-ui.js','./src/training-backup.js','./programmes/november-2026.json'];
SHELL.push(
  './catalogue-preview/index.html',
  './catalogue-preview/app.js',
  './catalogue-preview/app.css',
  './src/programme-catalogue.js',
  './src/catalogue-training.js',
  './src/native-catalogue.js',
);
const SHELL_PATHS = new Set(SHELL.map(asset => new URL(asset, self.registration.scope).pathname));
const CATALOGUE_DIRECTORY = new URL('./catalogue-preview/', self.registration.scope).pathname;
const CATALOGUE_PAGE = new URL('./catalogue-preview/index.html', self.registration.scope);
self.addEventListener('install', event => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  try {
    await cache.addAll(SHELL.map(asset => new Request(new URL(asset, self.registration.scope), {cache:'reload'})));
    for (const path of ['./', './index.html', './catalogue-preview/index.html']) {
      const page = await cache.match(new URL(path, self.registration.scope));
      if (!page || !(await page.text()).includes('<meta name="lhrf-release" content="' + RELEASE + '">')) {
        throw new Error('The app page and offline update are from different releases.');
      }
    }
  } catch (error) {
    await caches.delete(CACHE);
    throw error;
  }
})()));
self.addEventListener('message', event => {
  if (event.data === 'LHRF_ACTIVATE_UPDATE' && event.source?.url === new URL('refresh.html', self.registration.scope).href) {
    event.waitUntil(self.skipWaiting());
  }
});
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
    const pathname = new URL(event.request.url).pathname;
    if (SHELL_PATHS.has(pathname) || pathname === CATALOGUE_DIRECTORY) {
      const request = pathname === CATALOGUE_DIRECTORY ? CATALOGUE_PAGE : event.request;
      const installed = await cache.match(request, {ignoreSearch:true});
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
