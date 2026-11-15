// An actual service-worker update on a disposable loopback origin.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const previous = path.resolve('previous-owner-dist');
const candidate = path.resolve(process.env.OWNER_CANDIDATE_ROOT || 'native-owner-test-dist');
const marker = 'fictional-owner-upgrade-history';
const pending = 'lhrf_fresh_beta_live_v1114_pendingRun';
const types = { '.js': 'application/javascript', '.html': 'text/html', '.css': 'text/css' };

async function verifyUpgrade(browser, revision, canonicalRoute) {
  let active = previous;
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const serveCanonicalPage = canonicalRoute && active === candidate;
    if (serveCanonicalPage && url.pathname === '/refresh.html') {
      return res.writeHead(307, {location: '/refresh', 'cache-control': 'no-store'}).end();
    }
    const pathname = serveCanonicalPage && url.pathname === '/refresh' ? '/refresh.html' : url.pathname;
    const relative = pathname.endsWith('/') ? pathname + 'index.html' : pathname;
    const file = path.resolve(active, '.' + relative);
    if (!file.startsWith(active + path.sep)) return res.writeHead(404).end();
    try {
      const bytes = await fs.readFile(file);
      res.writeHead(200, {
        'content-type': types[path.extname(file)] || 'application/octet-stream',
        'cache-control': 'no-store',
      });
      res.end(bytes);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));

  let context;
  try {
    const origin = 'http://localhost:' + server.address().port + '/';
    context = await browser.newContext({viewport: {width: 393, height: 852}, serviceWorkers: 'allow'});
    const page = await context.newPage();
    page.setDefaultTimeout(25000);
    await page.goto(origin);
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
    assert.match(await page.locator('body').innerText(), /Build af48c572/);
    assert.equal((await context.request.get(origin + 'refresh.html')).status(), 404);
    await page.evaluate(({marker, pending}) => {
      localStorage.setItem(marker, JSON.stringify({workout: 'fictional-owner-sentinel', sets: [1, 2, 3]}));
      localStorage.setItem(pending, 'fictional unfinished run');
    }, {marker, pending});
    const history = await page.evaluate(key => localStorage.getItem(key), marker);

    active = candidate;
    await page.goto(origin + 'refresh.html');
    assert.equal(new URL(page.url()).pathname, canonicalRoute ? '/refresh' : '/refresh.html');
    const update = page.getByRole('button', {name: 'Update now'});
    await update.click();
    await page.getByText(/Finish your workout or pending run/).waitFor();
    assert.equal(await page.evaluate(key => localStorage.getItem(key), pending), 'fictional unfinished run');
    assert.equal(await page.evaluate(key => localStorage.getItem(key), marker), history);

    // Finish the isolated pending-run fixture before allowing activation.
    await page.evaluate(key => localStorage.removeItem(key), pending);
    await update.click();
    await page.getByText('LHRF is ready. Tap Open LHRF.').waitFor();
    await page.getByRole('link', {name: 'Open LHRF'}).click();
    const confirmRevision = () => page.getByText(new RegExp('Build ' + revision.slice(0, 8))).waitFor();
    await confirmRevision();
    assert.equal(await page.evaluate(key => localStorage.getItem(key), marker), history);

    await context.setOffline(true);
    await page.reload();
    await confirmRevision();
    assert.equal(await page.evaluate(() => navigator.onLine), false);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), marker), history);
    console.log('PASS guarded owner-practice update via ' + (canonicalRoute ? '307 to /refresh' : '/refresh.html') +
      ' preserves synthetic storage and reopens offline.');
  } finally {
    await context?.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
}

async function run() {
  const revision = (await fs.readFile(path.join(candidate, 'OWNER-TEST-REVISION.txt'), 'utf8')).split('\n')[0];
  assert.equal(revision, process.env.OWNER_SOURCE_SHA);
  const browser = await chromium.launch({
    headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE || undefined, args: ['--no-sandbox'],
  });
  try {
    await verifyUpgrade(browser, revision, true);
    await verifyUpgrade(browser, revision, false);
  } finally {
    await browser.close();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
