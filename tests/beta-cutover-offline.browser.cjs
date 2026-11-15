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

async function startServer() {
  const server = http.createServer((req, res) => {
    const route = new URL(req.url, 'http://localhost').pathname;
    if (route === '/control.html') {
      res.setHeader('Content-Type', 'text/html');
      return res.end('<!doctype html><title>Offline cutover control</title><script src="/cutover.js"></script>');
    }
    if (route === '/cutover.js' || route === '/beta/src/training-storage.js') {
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
      // Exercise the pinned v1.40.6 worker with a cache name reserved for the QA lane.
      return res.end(fs.readFileSync(file, 'utf8').replaceAll('lhrf-shell-', 'beta-cutover-shell-'));
    }
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return server;
}

async function run() {
  const server = await startServer();
  const origin = 'http://127.0.0.1:' + server.address().port;
  const app = origin + '/beta/';
  const worker = app + 'sw.js';
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
      new URL('./src/training-storage.js', location.href),
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
  } finally {
    await browser?.close();
    if (server.listening) await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
