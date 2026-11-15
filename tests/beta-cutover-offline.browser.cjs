// Synthetic localhost test with real service-worker fetches and an unavailable server.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { MAIN, LIVE, STORE, key } = require('../src/beta-cutover.js');
const { oldRoot, fixture, moduleSource, betaMount, recordWorkout } = require('./beta-cutover.browser.cjs');

const types = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
};

const workerCache = lane => 'beta-cutover-shell-v1.40.6-' + lane;
const workerScript = lane => 'sw.js?adapter=' + lane;
const storageScript = lane => lane === 'beta' ? 'src/training-storage-beta-v1.js' : 'src/training-storage.js';

async function startServer(currentLane = () => 'beta') {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const route = url.pathname;
    const lane = currentLane();
    // Keep the ordinary HTTP cache from serving one lane's assets to the
    // other. Explicit service-worker Cache Storage still holds the shell.
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Fixture-Lane', lane);
    if (route === '/control.html') {
      res.setHeader('Content-Type', 'text/html');
      return res.end('<!doctype html><title>Offline cutover control</title><script src="/cutover.js"></script>');
    }
    if (route === '/cutover.js' || (route === '/beta/' + storageScript('beta') && lane === 'beta')) {
      res.setHeader('Content-Type', 'application/javascript');
      return res.end(route === '/cutover.js' ? moduleSource : moduleSource + '\n' + betaMount);
    }
    if (!route.startsWith('/beta/')) return res.writeHead(404).end();
    const relative = route.slice('/beta/'.length);
    const file = path.resolve(oldRoot, relative.endsWith('/') || !relative ? relative + 'index.html' : relative);
    if (!file.startsWith(oldRoot + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      return res.writeHead(404).end();
    }
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    if (relative === 'sw.js') {
      if (url.searchParams.get('adapter') !== lane) return res.writeHead(404).end();
      // Bind the worker, cache, and adapter URL to the same QA revision.
      // The beta and legacy shells still share a single registration scope.
      return res.end(fs.readFileSync(file, 'utf8')
        .replaceAll('lhrf-shell-', 'beta-cutover-shell-')
        .replace("'beta-cutover-shell-v1.40.6'", JSON.stringify(workerCache(lane)))
        .replace("CACHE.slice('beta-cutover-shell-v'.length)", "'1.40.6'")
        .replace("'./src/training-storage.js'", JSON.stringify('./' + storageScript(lane))));
    }
    if (path.basename(file) === 'index.html' && path.dirname(file) === oldRoot) {
      return res.end(fs.readFileSync(file, 'utf8')
        .replace('src="./src/training-storage.js"', 'src="./' + storageScript(lane) + '"')
        .replace("register('./sw.js', {scope:'./'})",
          "register('./" + workerScript(lane) + "', {scope:'./', updateViaCache:'none'})"));
    }
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return server;
}

async function simulateDowngrade(browser) {
  let lane = 'beta';
  const server = await startServer(() => lane);
  const origin = 'http://localhost:' + server.address().port;
  const app = origin + '/beta/';
  let context;
  try {
    context = await browser.newContext({
      viewport: {width: 393, height: 852}, isMobile: true, hasTouch: true,
      timezoneId: 'Europe/London', serviceWorkers: 'allow',
    });
    await context.route('**/*', route =>
      new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const control = await context.newPage();
    await control.goto(origin + '/control.html');
    const source = JSON.stringify(fixture);
    await control.evaluate(async ({MAIN, source}) => {
      localStorage.setItem(MAIN, source);
      await window.LHRFBetaCutover.stage(localStorage);
      await window.LHRFBetaCutover.commit(localStorage);
    }, {MAIN, source});

    async function openShell(expectedLane, offline = false) {
      const page = await context.newPage();
      page.setDefaultTimeout(12000);
      page.on('dialog', dialog => dialog.accept());
      await page.clock.install({time: new Date('2026-10-23T10:00:00+01:00')});
      const adapterResponses = [];
      page.on('response', response => {
        if (/\/src\/training-storage(?:-beta-v1)?\.js$/.test(new URL(response.url()).pathname)) {
          adapterResponses.push({url: response.url(), lane: response.headers()['x-fixture-lane'], fromWorker: response.fromServiceWorker()});
        }
      });
      await page.goto(app);
      await page.waitForFunction(worker => navigator.serviceWorker.controller?.scriptURL === worker,
        app + workerScript(expectedLane));
      const shell = await page.evaluate(async ({cacheName, adapterPath, MAIN}) => {
        const url = new URL(adapterPath, location.href).href;
        const cached = await (await caches.open(cacheName)).match(url);
        return {
          storageKey: window.LHRFStorage?.key(MAIN),
          cachedLane: cached?.headers.get('X-Fixture-Lane'),
          cachedAdapter: (await cached?.text())?.includes('root.LHRFBetaCutover') ?? null,
          offline: !navigator.onLine,
        };
      }, {cacheName: workerCache(expectedLane), adapterPath: storageScript(expectedLane), MAIN});
      assert.deepEqual(shell, {
        storageKey: expectedLane === 'beta' ? STORE : MAIN,
        cachedLane: expectedLane,
        cachedAdapter: expectedLane === 'beta',
        offline,
      }, JSON.stringify(adapterResponses));
      if (offline) {
        assert.deepEqual(adapterResponses,
          [{url: app + storageScript(expectedLane), lane: expectedLane, fromWorker: true}]);
      }
      return page;
    }

    async function activateShell(nextLane, currentPage) {
      lane = nextLane;
      const worker = app + workerScript(nextLane);
      await control.evaluate(({app, worker}) =>
        navigator.serviceWorker.register(worker, {scope: app, updateViaCache: 'none'}), {app, worker});
      await currentPage.waitForFunction(async worker =>
        (await navigator.serviceWorker.getRegistration()).waiting?.scriptURL === worker, worker);
      await currentPage.close();
      await control.waitForFunction(async ({app, worker, cache, previous}) => {
        const registration = await navigator.serviceWorker.getRegistration(app);
        const cachesOnOrigin = await caches.keys();
        return registration?.active?.scriptURL === worker && registration.active.state === 'activated' &&
          !registration.waiting && !registration.installing &&
          cachesOnOrigin.includes(cache) && !cachesOnOrigin.includes(previous);
      }, {app, worker, cache: workerCache(nextLane), previous: workerCache(nextLane === 'beta' ? 'legacy' : 'beta')},
      {timeout: 15000});
    }

    const stored = name => control.evaluate(key => localStorage.getItem(key), name);
    let beta = await openShell('beta');
    await recordWorkout(beta);
    const betaSnapshot = await stored(STORE);
    const betaIds = JSON.parse(betaSnapshot).completedWorkouts.map(workout => workout.id);
    const legacyIds = fixture.completedWorkouts.map(workout => workout.id);
    assert.deepEqual(betaIds, [...legacyIds, 'fri::strength']);
    assert.equal(await stored(MAIN), source);

    await activateShell('legacy', beta);
    await context.setOffline(true);
    const legacy = await openShell('legacy', true);
    assert.deepEqual(await legacy.evaluate(() => data.completedWorkouts.map(workout => workout.id)), legacyIds);
    assert.equal(await stored(MAIN), source);
    assert.equal(await stored(STORE), betaSnapshot);

    await context.setOffline(false);
    await activateShell('beta', legacy);
    await context.setOffline(true);
    beta = await openShell('beta', true);
    assert.deepEqual(await beta.evaluate(() => data.completedWorkouts.map(workout => workout.id)), betaIds);
    assert.match(await beta.locator('[data-session-id="fri::strength"]').innerText(), /3 sets logged/);
    assert.equal(await stored(MAIN), source);
    assert.equal(await stored(STORE), betaSnapshot);
    console.log('PASS mobile Chromium same-scope worker switch beta → legacy → beta: old cache retired, both shells reopen offline, beta workout retained byte-for-byte.');
    console.log('EVIDENCE offline legacy IDs', JSON.stringify(legacyIds), 'returned beta IDs', JSON.stringify(betaIds));
  } finally {
    await context?.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
}

async function run() {
  const server = await startServer();
  const origin = 'http://localhost:' + server.address().port;
  const app = origin + '/beta/';
  const worker = app + workerScript('beta');
  let browser;
  try {
    browser = await chromium.launch({
      headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
    const context = await browser.newContext({
      viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true,
      timezoneId: 'Europe/London', serviceWorkers: 'allow',
    });
    const control = await context.newPage();
    await control.goto(origin + '/control.html');
    assert.deepEqual(await control.evaluate(async ({ MAIN, fixture }) => {
      localStorage.setItem(MAIN, JSON.stringify(fixture));
      const api = window.LHRFBetaCutover;
      return [await api.stage(localStorage), await api.commit(localStorage)];
    }, { MAIN, fixture }), ['staged', 'imported']);

    async function openPractice() {
      const page = await context.newPage();
      page.setDefaultTimeout(12000);
      page.on('dialog', dialog => dialog.accept());
      await page.clock.install({ time: new Date('2026-10-23T10:00:00+01:00') });
      await page.goto(app);
      await page.waitForFunction(worker => navigator.serviceWorker.controller?.scriptURL === worker, worker);
      return page;
    }
    async function stored(page, name) {
      return page.evaluate(name => localStorage.getItem(name), name);
    }

    const page = await openPractice();
    assert.equal(await page.evaluate(async () => Boolean(await caches.match(
      new URL(storageScript('beta'), location.href),
    ))), true, 'the cutover adapter was cached by the worker');
    const closed = new Promise(resolve => server.close(resolve));
    server.closeAllConnections();
    await closed;
    await context.setOffline(true);
    await page.reload();
    assert.equal(await page.evaluate(() => navigator.onLine), false);
    assert.equal(await page.evaluate(() => navigator.serviceWorker.controller.scriptURL), worker);
    const source = await stored(page, MAIN);
    await recordWorkout(page);
    const saved = await stored(page, STORE);
    assert.equal(JSON.parse(saved).completedWorkouts.filter(item => item.id === 'fri::strength').length, 1);
    assert.deepEqual(JSON.parse(saved).completedWorkouts.slice(0, fixture.completedWorkouts.length), fixture.completedWorkouts);
    assert.equal(await stored(page, key(LIVE)), null);
    assert.equal(await stored(page, MAIN), source);
    await page.close();

    const reopened = await openPractice();
    assert.equal(await reopened.evaluate(() => navigator.onLine), false);
    assert.equal(await stored(reopened, STORE), saved);
    assert.match(await reopened.locator('[data-session-id="fri::strength"]').innerText(), /3 sets logged/);
    assert.equal(await stored(reopened, MAIN), source);
    console.log('PASS pinned service worker reopened the beta offline with the server closed. Native workout draft, completion, reload and legacy source were preserved.');
    await context.close();
    // The switch is separately selectable and runs in its own context.
    if (process.argv.includes('--downgrade-diagnostic')) await simulateDowngrade(browser);
  } finally {
    await browser?.close();
    if (server.listening) await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
