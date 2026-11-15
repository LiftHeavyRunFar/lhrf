// Synthetic acceptance against exact old client HTML and JS. The beta storage
// adapter is mounted only on QA-served routes. No real connections or data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createRequire} = require('node:module');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {MAIN, LIVE, STAGE, STORE} = require('../src/beta-cutover.js');

const root = path.resolve(__dirname, '..');
const oldRoot = path.join(root, 'production-v1406');
const origin = 'https://beta-cutover-qa.test';
const fixturePath = path.join(oldRoot, 'tests/today-flow.browser.cjs');
const prelude = fs.readFileSync(fixturePath, 'utf8').split('(async()=>')[0];
const fixture = JSON.parse(JSON.stringify(vm.runInNewContext(prelude + ';fixture', {
  require: createRequire(fixturePath), process, __dirname: path.dirname(fixturePath),
})));
const original = JSON.stringify(fixture);
const moduleSource = fs.readFileSync(path.join(root, 'src/beta-cutover.js'), 'utf8');
const betaMount = `
(() => {
  const api = window.LHRFBetaCutover;
  const local = api.scoped(window.localStorage);
  window.LHRFStorage = {
    competition: false,
    key: api.key,
    local,
    session: window.sessionStorage,
    hasActiveWorkout: () => Boolean(local.getItem(api.LIVE) || local.getItem(api.LIVE + '_pendingRun')),
    hasCompetition: () => false,
    resetTesting: () => { throw Error('Practice reset is not part of this storage test.'); },
  };
})();
`;

async function mountRoutes(context) {
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) return route.abort();
    const pathname = url.pathname;
    if (pathname === '/control.html') {
      return route.fulfill({contentType: 'text/html', body: '<!doctype html><title>Beta QA control</title><script src="/cutover.js"></script>'});
    }
    if (pathname === '/cutover.js') {
      return route.fulfill({contentType: 'application/javascript', body: moduleSource});
    }
    if (pathname === '/beta/src/training-storage.js') {
      return route.fulfill({contentType: 'application/javascript', body: moduleSource + '\n' + betaMount});
    }
    const relative = pathname.replace(/^\/(?:old|beta)\//, '');
    const file = path.resolve(oldRoot, relative || 'index.html');
    if (!file.startsWith(oldRoot + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      return route.fulfill({status: 404});
    }
    const type = {'.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png'};
    return route.fulfill({body: fs.readFileSync(file), contentType: type[path.extname(file)] || 'text/html'});
  });
}

async function openApp(context, lane) {
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.on('dialog', dialog => dialog.accept());
  await page.clock.install({time: new Date('2026-10-23T10:00:00+01:00')});
  if (lane === 'old') {
    await page.addInitScript(() => {
      const originalAdd = window.addEventListener;
      window.__heldStorage = [];
      window.addEventListener = function (type, handler, options) {
        if (type === 'storage') {
          return originalAdd.call(this, type, event => window.__heldStorage.push(() => handler.call(window, event)), options);
        }
        return originalAdd.call(this, type, handler, options);
      };
    });
  }
  await page.goto(origin + '/' + lane + '/index.html');
  await page.waitForFunction(() => typeof save === 'function' && window.LHRFLive);
  return page;
}

async function recordWorkout(page) {
  await page.locator('[data-session-id="fri::strength"]').click();
  await page.locator('#previewStart').click();
  await page.locator('#readinessContinue').click();
  await page.locator('.live-set [data-field="rpe"]').first().fill('8');
  await page.locator('.live-set .set-check').first().click();
  await page.reload();
  await page.locator('nav [data-screen="train"]').click();
  assert.equal(await page.locator('.set-check.checked').count(), 1, 'beta in-progress workout survives app reload');
  for (let index = 0; index < 2; index++) {
    const detail = page.locator('.live-ex').nth(1);
    if (await detail.getAttribute('open') === null) await detail.locator(':scope > summary').click();
    const row = detail.locator('.live-set').nth(index);
    await row.locator('[data-field="rpe"]').fill('7');
    await row.locator('.set-check').click();
  }
  await page.locator('#liveNotes').fill('Synthetic beta cutover set');
  await page.locator('#liveFinish').click();
  await page.locator('#finishAndSave').click();
  await page.locator('#liveFeedbackDialog').waitFor();
  await page.locator('#liveFeedbackDifficulty').selectOption('expected');
  await page.locator('#liveFeedbackSave').click();
}

const read = (page, key) => page.evaluate(name => localStorage.getItem(name), key);
const writeLegacy = (page, id) => page.evaluate(id => {
  const next = structuredClone(data);
  next.completedWorkouts.push({id, name: 'Fictional stale workout', week: 1, date: '2026-10-23T12:00:00Z'});
  return save(next, {notify: false});
}, id);

async function withDeadline(promise, label) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Timed out waiting for ' + label)), 10000);
    })]);
  } finally {
    clearTimeout(timer);
  }
}

async function run() {
  const browser = await chromium.launch({
    headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const context = await browser.newContext({
      viewport: {width: 393, height: 852}, isMobile: true, hasTouch: true,
      timezoneId: 'Europe/London', serviceWorkers: 'block',
    });
    await mountRoutes(context);
    const control = await context.newPage();
    await control.goto(origin + '/control.html');
    await control.evaluate(({MAIN, original}) => localStorage.setItem(MAIN, original), {MAIN, original});

    for (const key of [
      LIVE, LIVE + '_pendingRun', 'lhrf_programme_replacement_lock_v1', 'lhrf_programme_replacement_transaction_v1',
    ]) {
      await control.evaluate(key => localStorage.setItem(key, '{"synthetic":true}'), key);
      await assert.rejects(control.evaluate(() => window.LHRFBetaCutover.stage(localStorage)));
      assert.equal(await read(control, key), '{"synthetic":true}', 'blocked import must retain unfinished legacy state');
      assert.equal(await read(control, STORE), null);
      await control.evaluate(key => localStorage.removeItem(key), key);
    }

    await control.evaluate(() => window.LHRFBetaCutover.stage(localStorage));
    const staged = await read(control, STAGE);
    assert.ok(staged, 'immutable staged snapshot is persisted');
    assert.equal(await read(control, STORE), null, 'staging does not activate beta');
    await control.evaluate(MAIN => {
      const changed = JSON.parse(localStorage.getItem(MAIN));
      changed.sentinel = {keep: 'synthetic intervening legacy edit'};
      localStorage.setItem(MAIN, JSON.stringify(changed));
    }, MAIN);
    await assert.rejects(control.evaluate(() => window.LHRFBetaCutover.commit(localStorage)));
    await assert.rejects(control.evaluate(() => window.LHRFBetaCutover.stage(localStorage)));
    assert.equal(await read(control, STORE), null, 'legacy edit after staging blocks activation');
    assert.equal(await read(control, STAGE), staged, 'the source edit must not replace the reviewed staging bytes');
    assert.match(await read(control, MAIN), /intervening legacy edit/);
    await control.evaluate(({MAIN, original}) => localStorage.setItem(MAIN, original), {MAIN, original});
    assert.equal(await control.evaluate(() => window.LHRFBetaCutover.stage(localStorage)), 'already-staged');
    await control.reload();
    const anotherImporter = await context.newPage();
    await anotherImporter.goto(origin + '/control.html');
    const overlapping = await Promise.all([control, anotherImporter].map(page =>
      page.evaluate(() => window.LHRFBetaCutover.commit(localStorage))));
    assert.deepEqual(overlapping.sort(), ['already-initialised', 'imported']);
    await anotherImporter.close();
    assert.equal(await read(control, MAIN), original);
    console.log('PASS staged import blocks active/pending/locked state and intervening source edits; staged reload and overlapping two-tab import initialise once.');

    const oldA = await openApp(context, 'old');
    const oldB = await openApp(context, 'old');
    let beta = await openApp(context, 'beta');
    await beta.bringToFront();
    const debuggerSession = await context.newCDPSession(oldA);
    await debuggerSession.send('Debugger.enable');
    const paused = new Promise(resolve => debuggerSession.once('Debugger.paused', resolve));
    await debuggerSession.send('Debugger.pause');
    // Give the old page a statement at which to pause even if it is idle.
    const probe = oldA.evaluate(() => 'legacy execution resumed').then(value => ({value}), error => ({error}));
    await withDeadline(paused, 'the old tab debugger pause');
    await recordWorkout(beta); // Old A's JavaScript is paused throughout this save.
    const saved = await beta.evaluate(MAIN => JSON.parse(window.LHRFStorage.local.getItem(MAIN)), MAIN);
    assert.deepEqual(saved.completedWorkouts.slice(0, fixture.completedWorkouts.length), fixture.completedWorkouts);
    assert.equal(saved.completedWorkouts.filter(workout => workout.id === 'fri::strength').length, 1);
    assert.deepEqual(saved.activeSchedule, fixture.activeSchedule);
    assert.deepEqual(saved.customRoadmap, fixture.customRoadmap);
    assert.equal(await beta.evaluate(key => window.LHRFStorage.local.getItem(key), LIVE), null);
    const savedRaw = await read(beta, STORE);
    assert.ok(savedRaw);
    assert.equal(await read(beta, MAIN), original, 'beta saves must never write legacy history');
    console.log('PASS normal native workout start, draft reload and completion in versioned beta storage.');

    await context.setOffline(true);
    const resumed = new Promise(resolve => debuggerSession.once('Debugger.resumed', resolve));
    await debuggerSession.send('Debugger.resume');
    await withDeadline(resumed, 'the old tab debugger resume');
    assert.deepEqual(await withDeadline(probe, 'legacy script execution after resume'), {value: 'legacy execution resumed'});
    await oldA.bringToFront();
    assert.equal(await oldA.evaluate(() => navigator.onLine), false);
    console.log('PASS Chromium debugger confirmed stale legacy JavaScript paused across the save and resumed offline.');
    await beta.close();
    assert.equal(await writeLegacy(oldA, 'legacy-offline-A'), true);
    assert.equal(await read(oldA, STORE), savedRaw);
    assert.match(await read(oldA, MAIN), /legacy-offline-A/);
    assert.equal(await writeLegacy(oldB, 'legacy-offline-B'), true);
    assert.equal(await read(oldB, STORE), savedRaw);
    assert.match(await read(oldB, MAIN), /legacy-offline-B/);
    assert.doesNotMatch(await read(oldB, MAIN), /legacy-offline-A/, 'historic first legacy write remains unrecoverable');

    // Read the newer beta record on an offline test-harness relaunch and prove a repeated import cannot replace it.
    beta = await openApp(context, 'beta');
    assert.equal(await beta.evaluate(() => navigator.onLine), false);
    assert.equal(await read(beta, STORE), savedRaw);
    await beta.locator('nav [data-screen="today"]').click();
    assert.match(await beta.locator('[data-session-id="fri::strength"]').innerText(), /3 sets logged/);
    assert.equal(await control.evaluate(() => window.LHRFBetaCutover.commit(localStorage)), 'already-initialised');
    assert.equal(await control.evaluate(() => window.LHRFBetaCutover.stage(localStorage)), 'already-initialised');
    assert.equal(await control.evaluate(() => window.LHRFBetaCutover.commit(localStorage)), 'already-initialised');
    assert.equal(await read(beta, STORE), savedRaw, 'stage and commit cannot replay current stale legacy data into beta history');
    assert.equal(await read(control, STAGE), staged, 'repeated imports must not replace the frozen snapshot');
    assert.match(await read(control, MAIN), /legacy-offline-B/);

    // The old app deletes every key beginning with lhrf during its reset.
    assert.equal(await oldB.evaluate(() => { window.LHRFStorage.resetTesting(); return true; }), true);
    assert.equal(await read(control, MAIN), null);
    assert.equal(await read(beta, STORE), savedRaw, 'legacy reset must not delete beta storage');
    await context.close();
    console.log('PASS two stale offline legacy saves after debugger resume, repeated imports, and legacy reset cannot alter the saved beta workout.');
    console.log('REPRODUCED LIMIT: the first of two uncaptured old snapshots is lost from legacy storage.');
    console.log('Scope: simulated suspension by pausing Chromium JavaScript, routed offline responses, single beta writer, synthetic only.');
  } finally {
    await browser.close();
  }
}

module.exports = { oldRoot, fixture, moduleSource, betaMount, recordWorkout };

if (require.main === module) {
  run().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
