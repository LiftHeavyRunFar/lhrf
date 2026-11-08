// Synthetic athlete only. Exercise the v1.36.0 service-worker upgrade on the same origin.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {fixture: build} = require('./training-mode-fixture.cjs');
const {reopenForWaitingUpdate} = require('./workout-update-helpers.cjs');

const previous = process.env.LHRF_WORKOUT_FOCUS_BASE;
if (!previous) throw new Error('Set LHRF_WORKOUT_FOCUS_BASE to the archive of production 059d4eb.');
const root = path.join(__dirname, '..');
const dataKey = 'lhrf_beta_v1118_clean';
const liveKey = 'lhrf_fresh_beta_live_v1114';

function athlete() {
  const fixture = build();
  const session = fixture.activeSchedule[0];
  const benchMeta = {
    ...session.ex[0][5],
    benchRole: 'speed',
    role: 'straight',
    execution: 'paused',
    cue: 'Drive the bar fast with a controlled pause. Rest 90–120 seconds between sets. Stop before reps grind.'
  };
  session.ex = [
    ['Bench', 3, 2, 87.5, 5.5, benchMeta],
    session.ex[2]
  ];
  const addPerformance = (id, date, weight, meta) => {
    const name = 'Synthetic ' + id;
    fixture.completedWorkouts.push({
      id, name, date, week: 90, completedSets: 2,
      prescription: {ex: [['Bench', 2, 2, weight, 5.5, meta]], runs: []}
    });
    fixture.sets.push(...[1, 2].map(set => ({
      ...meta, exercise: 'Bench', date, session: name, sessionId: id, week: 90,
      set, weight, reps: 2, rpe: set === 1 ? 4.5 : 5
    })));
  };
  addPerformance('older-speed', '2026-10-31T06:00:00Z', 86, benchMeta);
  addPerformance('previous-speed', '2026-11-02T06:00:00Z', 91.25, benchMeta);
  addPerformance('wrong-variation', '2026-11-04T06:00:00Z', 96, {...benchMeta, variantId: 'synthetic-other-variant'});
  addPerformance('wrong-execution', '2026-11-04T07:00:00Z', 97, {...benchMeta, execution: 'touch-and-go'});
  addPerformance('wrong-purpose', '2026-11-05T06:00:00Z', 99, {...benchMeta, benchRole: 'volume'});
  return fixture;
}

(async () => {
  let updated = false;
  const types = {'.js': 'application/javascript', '.css': 'text/css', '.ttf': 'font/ttf',
    '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json'};
  const server = http.createServer((request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const file = path.join(updated ? root : previous, pathname === '/' ? 'index.html' : pathname);
    try {
      const body = fs.readFileSync(file);
      response.writeHead(200, {'Cache-Control': 'no-store', 'Content-Type': types[path.extname(file)] || 'text/html'});
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
      args: ['--no-sandbox', '--disable-dev-shm-usage']});
    const context = await browser.newContext({
      viewport: {width: 393, height: 852}, isMobile: true, hasTouch: true, timezoneId: 'Europe/London'
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', dialog => dialog.accept());
    await page.clock.install({time: new Date('2026-11-06T08:00:00Z')});
    await page.addInitScript(({key, fixture}) => {
      if (location.protocol !== 'http:') return;
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(fixture));
    }, {key: dataKey, fixture: athlete()});
    const rawData = () => page.evaluate(key => localStorage.getItem(key), dataKey);
    const rawDraft = () => page.evaluate(key => localStorage.getItem(key), liveKey);
    const draft = async () => JSON.parse(await rawDraft());
    const card = index => page.locator('#liveExercises > .live-ex').nth(index);
    const row = (exercise, set) => card(exercise).locator('.live-set').nth(set);
    const rpe = (exercise, set) => row(exercise, set).locator('[data-field=rpe]');
    const mark = (exercise, set) => row(exercise, set).locator('.set-check').tap();
    const timer = page.locator('#restStopwatch');
    const time = page.locator('#restTime');
    const toggle = page.locator('#restToggle');
    const info = card(0).getByRole('button', {name: 'Exercise information for Bench', exact: true});
    const details = page.getByRole('dialog', {name: 'Bench', exact: true});
    const tapInfo = async () => {
      const box = await info.boundingBox();
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    };
    const update = page.locator('#lhrf-update-banner button');
    const train = () => page.locator('nav [data-screen=train]').tap();
    const leave = () => page.getByRole('button', {name: 'Leave & resume', exact: true}).tap();
    const resume = () => page.getByRole('button', {name: 'Resume training', exact: true}).tap();
    const capture = async name => {
      if (!process.env.LHRF_WORKOUT_FOCUS_EVIDENCE) return;
      fs.mkdirSync(process.env.LHRF_WORKOUT_FOCUS_EVIDENCE, {recursive: true});
      await page.screenshot({path: path.join(process.env.LHRF_WORKOUT_FOCUS_EVIDENCE, name + '.png')});
    };
    const shellKeys = () => page.evaluate(async () => (await caches.keys()).filter(key => key.startsWith('lhrf-shell-')));

    await page.goto('http://localhost:' + server.address().port + '/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    assert.match((await shellKeys()).join(' '), /v1\.36\.0/);
    await page.evaluate(() => openWorkout('replacement-heavy'));
    await page.locator('#previewStart').tap();
    await page.evaluate(() => document.fonts.ready);
    const beforeRow = await row(0, 0).boundingBox();
    await capture('v1.36.0-active');
    await rpe(0, 0).fill('5');
    await mark(0, 0);
    await row(0, 1).locator('[data-field=weight]').fill('88.75');
    await rpe(0, 1).fill('5.5');
    await page.locator('#liveNotes').fill('Fictional workout in progress');
    const beforeUpgrade = await rawDraft();
    const protectedData = await rawData();
    assert.equal((await draft()).entries['0_0'].done, true);
    assert.equal((await draft()).entries['0_1'].done, false);

    // Discovering a waiting worker while training must not navigate the open tab.
    updated = true;
    await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
    await page.waitForFunction(async () => !!(await navigator.serviceWorker.getRegistration()).waiting);
    assert.equal(await page.locator('body').getAttribute('data-training-mode'), 'active');
    assert.equal(await rawDraft(), beforeUpgrade);
    assert.equal(await rawData(), protectedData);
    assert.equal(await rpe(0, 1).inputValue(), '5.5');
    assert.equal(await info.count(), 0, 'The in-use production page stays on its existing shell');
    // Even the legacy Update now button must not interrupt the current workout.
    await update.tap();
    await page.clock.runFor(500);
    assert.equal(await info.count(), 0);
    assert.equal(await rawDraft(), beforeUpgrade);
    await reopenForWaitingUpdate(page);
    await train();
    assert.equal(await rawDraft(), beforeUpgrade);
    assert.equal(await rawData(), protectedData);
    assert.doesNotMatch((await shellKeys()).join(' '), /v1\.36\.0/);
    assert.equal(await row(0, 1).locator('[data-field=weight]').inputValue(), '88.75');
    assert.equal(await rpe(0, 1).inputValue(), '5.5');
    assert.equal(await page.locator('#liveNotes').inputValue(), 'Fictional workout in progress');
    assert.equal(await page.locator('#liveExercises .exercise-history').count(), 0);
    assert.doesNotMatch(await card(0).innerText(), /Drive the bar fast/);
    const afterRow = await row(0, 0).boundingBox();
    assert.ok(afterRow.y < beforeRow.y, 'The first editable set moves higher on a Pixel viewport');
    assert.ok(afterRow.y >= 0 && afterRow.y + afterRow.height < 852);
    await capture('candidate-active');

    // Touch entry, keyboard containment and Escape preserve scroll and draft.
    await page.evaluate(() => scrollTo(0, 44));
    const scroll = await page.evaluate(() => scrollY);
    assert.ok(scroll > 0);
    await tapInfo();
    await details.waitFor({state: 'visible'});
    assert.equal(await details.evaluate(element => element.contains(document.activeElement)), true);
    await page.keyboard.press('Shift+Tab');
    assert.equal(await details.evaluate(element => element.contains(document.activeElement)), true);
    await page.keyboard.press('Tab');
    assert.equal(await details.evaluate(element => element.contains(document.activeElement)), true);
    assert.match(await details.innerText(), /speed\/technique/i);
    assert.match(await details.innerText(), /Drive the bar fast.*controlled pause/);
    assert.match(await details.innerText(), /Stop before reps grind/);
    assert.match(await details.innerText(), /2 November/i);
    assert.match(await details.innerText(), /91\.25 kg × 2 reps · RPE 4\.5/);
    assert.doesNotMatch(await details.innerText(), /86 kg|96 kg|97 kg|99 kg/);
    assert.equal(await details.locator('.history-all').evaluate(element => element.open), false);
    await details.getByText('All recorded sets (2)', {exact: true}).tap();
    await details.getByText('Comparison details', {exact: true}).tap();
    assert.match(await details.innerText(), /Set 2 · 91\.25 kg × 2 reps · RPE 5/);
    assert.match(await details.innerText(), /02\/11\/2026/);
    await capture('candidate-reference');
    await page.keyboard.press('Escape');
    await page.locator('dialog.training-info-dialog').waitFor({state: 'detached'});
    assert.equal(await info.evaluate(element => document.activeElement === element), true);
    assert.equal(await rawDraft(), beforeUpgrade);
    assert.equal(await page.evaluate(() => scrollY), scroll);
    await tapInfo();
    await details.getByRole('button', {name: 'Close', exact: true}).tap();
    await page.locator('dialog.training-info-dialog').waitFor({state: 'detached'});
    assert.equal(await page.evaluate(() => scrollY), scroll);
    assert.equal(await info.evaluate(element => document.activeElement === element), true);
    assert.equal(await rawDraft(), beforeUpgrade);

    // A storage failure or a correction must never begin a fresh countdown.
    assert.match(await timer.innerText(), /90.{0,3}120/);
    assert.equal(await time.innerText(), '1:30');
    assert.equal(await toggle.innerText(), 'Start');
    await page.evaluate(key => {
      const original = Storage.prototype.setItem;
      window.restoreDraftStorage = () => { Storage.prototype.setItem = original; };
      Storage.prototype.setItem = function (item, value) {
        if (item === key) throw new DOMException('Synthetic quota fault', 'QuotaExceededError');
        return original.call(this, item, value);
      };
    }, liveKey);
    await mark(0, 1);
    assert.match(await card(0).innerText(), /Set not saved/);
    assert.equal(await rawDraft(), beforeUpgrade);
    assert.equal(await toggle.innerText(), 'Start');
    await page.evaluate(() => restoreDraftStorage());
    await rpe(0, 0).fill('5.5');
    await mark(0, 0);
    assert.equal((await draft()).entries['0_0'].rpe, 5.5);
    assert.equal(await toggle.innerText(), 'Start');
    await mark(0, 1);
    assert.equal((await draft()).entries['0_1'].weight, 88.75);
    assert.equal((await draft()).entries['0_1'].rpe, 5.5);
    assert.equal(await toggle.innerText(), 'Pause');
    assert.equal(await time.innerText(), '1:30');
    await page.clock.fastForward(20000);
    assert.match(await time.innerText(), /1:(09|10)/);
    await toggle.tap();
    const paused = await time.innerText();
    await page.clock.fastForward(15000);
    assert.equal(await time.innerText(), paused);
    await page.locator('#restPlus15').tap();
    assert.match(await time.innerText(), /1:(24|25)/);
    await toggle.tap();
    await page.locator('#restPlus30').tap();
    assert.match(await time.innerText(), /1:(54|55)/);
    await page.locator('#restReset').tap();
    assert.equal(await time.innerText(), '1:30');
    assert.equal(await toggle.innerText(), 'Pause');
    await capture('candidate-countdown');

    const beforeAway = await rawDraft();
    await leave();
    await page.clock.fastForward(25000);
    await resume();
    assert.equal(await rawDraft(), beforeAway);
    assert.match(await time.innerText(), /1:(04|05)/);

    // A real service worker must provide the candidate and current draft offline.
    await context.setOffline(true);
    await page.reload();
    await train();
    assert.equal(await rawDraft(), beforeAway);
    assert.equal(await rawData(), protectedData);
    assert.match(await time.innerText(), /1:(0[2-5])/);
    assert.equal(await toggle.innerText(), 'Pause');
    await page.clock.fastForward(90000);
    assert.equal(await time.innerText(), '0:00');
    assert.notEqual(await toggle.innerText(), 'Pause');
    assert.equal(await rawDraft(), beforeAway, 'Expiry does not log, start, or change a set');
    await page.locator('#restPlus15').tap();
    assert.equal(await time.innerText(), '0:15', 'An extension after expiry adds only the selected interval');
    assert.equal(await rawDraft(), beforeAway);

    await rpe(0, 2).fill('6');
    await mark(0, 2);
    assert.equal(await card(1).evaluate(element => element.open), true);
    assert.match(await timer.innerText(), /Bench/i);
    assert.equal(await time.innerText(), '1:30', 'Last set retains its own countdown while the next exercise opens');
    await page.locator('#restSkip').tap();
    assert.match(await timer.innerText(), /optional stopwatch/i);
    await toggle.tap();
    await page.clock.fastForward(3000);
    assert.match(await time.innerText(), /0:0[23]/);
    await toggle.tap();
    assert.equal(await page.locator('#restPlus15').isVisible(), false);
    await card(1).getByRole('button', {name: /Exercise information/}).tap();
    const other = page.getByRole('dialog', {name: /Chest-supported row/i});
    assert.match(await other.innerText(), /No reliable previous/i);
    await other.getByRole('button', {name: 'Close', exact: true}).tap();
    assert.equal((await draft()).entries['1_0'], undefined);
    assert.equal(await rawData(), protectedData);

    for (const width of [320, 393]) {
      await page.setViewportSize({width, height: 852});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    }
    assert.deepEqual(errors, []);
    console.log('PASS Pixel workout focus, strict original-RPE references, accessible disclosure, saved-set timer, correction, background time, v1.36.0 update and offline draft/data preservation');
  } finally {
    if (browser) await browser.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
