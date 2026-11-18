// Real Chromium/native workout flow on a disposable loopback origin and fictional records.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {fixture} = require('./earned-strength-fixture.cjs');
const root = path.resolve(process.env.OWNER_CANDIDATE_ROOT || path.join(__dirname, '..'));
const MAIN = 'lhrf_beta_v1118_clean';
const LIVE = 'lhrf_fresh_beta_live_v1114';
const types = {'.js': 'application/javascript', '.html': 'text/html', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml'};
const copy = value => JSON.parse(JSON.stringify(value));

async function run() {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const file = path.resolve(root, '.' + (url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname));
    if (!file.startsWith(root + path.sep)) return res.writeHead(404).end();
    try {
      res.writeHead(200, {'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store'});
      res.end(await fs.readFile(file));
    } catch {
      if (!res.headersSent) res.writeHead(404);
      res.end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = 'http://localhost:' + server.address().port + '/';
  let browser;
  try {
    browser = await chromium.launch({headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
      args: ['--no-sandbox', '--disable-dev-shm-usage']});
    for (const [id, kind] of [['powerlifting-three-day', 'peak'], ['powerlifting-four-day', 'peak'], ['general-strength', 'volume']]) {
      const f = fixture(id, kind);
      const context = await browser.newContext({viewport: {width: 393, height: 852}, isMobile: true,
        hasTouch: true, timezoneId: 'Europe/London', serviceWorkers: 'allow'});
      try {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('dialog', dialog => dialog.accept());
        page.setDefaultTimeout(15000);
        await page.clock.install({time: new Date(f.now)});
        await page.addInitScript(({MAIN, state}) => {
          if (!localStorage.getItem('fictional-earned-seeded')) {
            localStorage.setItem(MAIN, JSON.stringify(state));
            localStorage.setItem('fictional-earned-seeded', 'true');
          }
        }, {MAIN, state: f.state});
        await page.goto(url);
        await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
        const baseline = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), MAIN);
        const planBefore = copy(baseline.customRoadmap);
        const reviewedBefore = copy(baseline.reviewedProgramme);
        const stored = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), MAIN);
        const draft = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), LIVE);
        for (const dot of await page.locator('#dayDots button').all()) {
          if ((await dot.getAttribute('aria-label') || '').toLowerCase().startsWith(f.live.day.toLowerCase())) {
            await dot.click();
            break;
          }
        }
        await page.locator('.day-slide.is-current').getByRole('button', {name: /^Preview workout /}).first().click();
        await page.locator('#previewStart').click();
        if (await page.locator('#readinessModal[open]').count()) await page.locator('#readinessContinue').click();
        const panel = () => page.locator('[data-earned-strength="' + f.index + '"]');
        const targetExercise = page.locator('.live-ex').nth(f.index);
        if (!await targetExercise.evaluate(el => el.open)) await targetExercise.locator(':scope > summary').click();
        await panel().locator('summary').click();
        const accept = () => panel().getByRole('button', {name: 'Accept for this workout', exact: true});
        assert.equal(await accept().isEnabled(), false);
        const before = await draft();
        await panel().getByRole('button', {name: 'Keep planned work', exact: true}).click();
        assert.deepEqual(await draft(), before);
        await panel().locator('summary').click();
        for (const checkbox of await panel().locator('input[type="checkbox"]').all()) await checkbox.check();
        assert.equal(await accept().isEnabled(), true);

        // Interrupt the ordinary live-draft write. Retry must retain the
        // original load until the explicit decision is durably saved.
        await page.evaluate(key => {
          const setItem = Storage.prototype.setItem;
          Storage.prototype.setItem = function (name, value) {
            if (this === localStorage && name === key) {
              Storage.prototype.setItem = setItem;
              throw new DOMException('Fictional interruption', 'QuotaExceededError');
            }
            return setItem.call(this, name, value);
          };
        }, LIVE);
        await accept().click();
        await panel().getByText(/Could not save this choice/).waitFor();
        assert.deepEqual(await draft(), before);
        await accept().click();
        await page.getByText('Bench change approved for this workout', {exact: true}).waitFor();
        let approved = await draft();
        const expectedWeight = kind === 'peak' ? 147.5 : 115;
        assert.equal(approved.ex[f.index][3], expectedWeight);
        assert.equal(approved.ex[f.index][4], kind === 'peak' ? 9 : 7);
        assert.equal(approved.strengthProgressionDecisions.length, 1);
        assert.deepEqual(approved.originalPrescription.ex, before.ex);

        // Exercise the original fallback, then explicitly approve once more.
        await panel().locator('summary').click();
        await panel().getByRole('button', {name: 'Use original prescription', exact: true}).click();
        assert.deepEqual((await draft()).ex, before.ex);
        await panel().locator('summary').click();
        for (const checkbox of await panel().locator('input[type="checkbox"]').all()) await checkbox.check();
        await accept().click();
        approved = await draft();
        assert.equal(approved.strengthProgressionDecisions.length, 1);

        await context.setOffline(true);
        await page.reload();
        await page.locator('nav [data-screen="train"]').click();
        assert.equal(await page.evaluate(() => navigator.onLine), false);
        assert.deepEqual(await draft(), approved);
        assert.equal(await page.evaluate(async () => Boolean(await caches.match(new URL('./src/earned-strength.js', location.href)))), true);
        const exercise = page.locator('.live-ex').nth(f.index);
        if (!await exercise.evaluate(el => el.open)) await exercise.locator(':scope > summary').click();
        const row = exercise.locator('.live-set').first();
        assert.equal(Number(await row.locator('[data-field="weight"]').inputValue()), expectedWeight);
        await row.locator('[data-field="rpe"]').fill(kind === 'peak' ? '8.5' : '7');
        await row.locator('.set-check').click();
        await page.locator('#liveFinish').click();
        await page.locator('#finishAndSave').click();
        if (await page.locator('#liveFeedbackSkip').count()) await page.locator('#liveFeedbackSkip').click();
        await page.reload();
        const after = await stored();
        assert.equal(after.completedWorkouts.length, baseline.completedWorkouts.length + 1);
        assert.deepEqual(after.completedWorkouts.slice(0, -1), baseline.completedWorkouts);
        assert.deepEqual(after.customRoadmap, planBefore);
        assert.deepEqual(after.reviewedProgramme, reviewedBefore);
        assert.deepEqual(after.runs, baseline.runs);
        const saved = after.completedWorkouts.at(-1);
        assert.equal(saved.strengthProgressionDecisions.length, 1);
        assert.deepEqual(saved.originalPrescription.ex, before.ex);
        assert.equal(saved.prescription.ex[f.index][3], expectedWeight);
        assert.equal(await page.evaluate(key => localStorage.getItem(key), LIVE), null);
        assert.deepEqual(errors, []);
        console.log('PASS', id, kind, 'explicit approval, original fallback, interrupted save and retry, real worker offline reopen, completion audit and immutable programme/history.');
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser?.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
}
run().catch(error => {console.error(error); process.exitCode = 1;});
