// Combined release acceptance: fictional athlete, real production-main shell -> candidate -> offline.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {reopenForWaitingUpdate}=require('./workout-update-helpers.cjs');
const coach = require('../src/coach-engine.js');
const install = require('../src/programme-install.js');
const DATA = 'lhrf_beta_v1118_clean', LIVE = 'lhrf_fresh_beta_live_v1114';
const clone = x => JSON.parse(JSON.stringify(x));
const root = path.join(__dirname, '..');
const previous = process.env.LHRF_PRODUCTION_ROOT;
if (!previous) throw Error('Set LHRF_PRODUCTION_ROOT to the pinned production main checkout.');
const inventory = require('./equipment-fixtures.cjs').fullInventory();
let fixture = install.install({equipmentInventory: inventory, sets: [], runs: [], checkins: [],
  decisions: [], overrides: {}, completedWorkouts: [], plannedRuns: [],
  goals: {strength: 'Bench', running: '10K PB'}, athlete: {id: 'synthetic-release-115'}},
  require('../programmes/november-2026.json'), coach, '2026-11-03T08:00:00Z');
fixture = install.refreshApprovedThresholdPaces(fixture, coach, '2026-11-03T08:00:00Z');
fixture.activeCustomWeek = 2;
fixture.activeSchedule = coach.createEngine({data: fixture}).generatedSessions(fixture.customRoadmap, 2);
// Model an already-installed production week, including its existing revision markers.
// A freshly generated legacy week would exercise production's old migrations before this release loads.
fixture = install.refreshApprovedBenchProgramme(fixture, coach, '2026-11-03T08:00:00Z');
fixture = install.refreshApprovedBenchPeak(fixture, coach, '2026-11-03T08:00:00Z');
fixture.onboardingManualSplit = {Tue: ['bench'], Thu: ['lower', 'run']};
fixture.onboardingFacts = {retain: 'existing athlete answers'};
const strength = fixture.activeSchedule.find(s => s.ex.length);
const strengthId = strength.runs?.length ? strength.id + '::strength' : strength.id;
fixture.sets = [{date: '2026-10-30T07:00:00Z', sessionId: strengthId, session: strength.name,
  week: 1, exercise: strength.ex[0][0], set: 1, weight: 117.5, reps: 3, rpe: 8.5,
  target: 8, notes: 'Synthetic original RPE evidence'}];
const recordedRun = {source: 'garmin-personal', sourceActivityId: '900001',
  date: '2026-10-31T07:00:00Z', km: 6.51914990234375, min: 42.1234567, avgHr: 148,
  sessionId: 'synthetic-planned-run', week: 1,
  plannedSession: {id: 'synthetic-planned-run', week: 1, plannedDate: '2026-10-31',
    name: 'Synthetic easy run', prescription: {runs: [{name: 'Easy run', distanceKm: 6, minutes: 40}]}},
  splits: [{km: 1, min: 6}, {km: 6.51914990234375, min: 42.1234567}]};
fixture.runs = [recordedRun];
fixture.completedWorkouts = [
  {id: strengthId, name: strength.name, day: strength.day, week: 1,
    date: fixture.sets[0].date, prescription: {ex: [strength.ex[0]], runs: []}},
  {id: recordedRun.sessionId, name: 'Synthetic easy run', component: 'run', week: 1,
    source: 'garmin-personal', sourceActivityId: recordedRun.sourceActivityId,
    plannedDate: '2026-10-31', date: recordedRun.date, prescription: recordedRun.plannedSession.prescription}
];
const live = {id: strengthId, parentId: strength.id, component: 'strength', name: strength.name,
  day: strength.day, sourceProgrammeWeek: 2, ex: [[strength.ex[0][0], 1, 3, 120, 8]], runs: [],
  entries: {'0_0': {done: true, weight: 120, reps: 3, rpe: 7.5}},
  notes: 'Synthetic unsaved session notes', started: '2026-11-03T08:00:00Z'};

(async () => {
  let upgraded = false;
  const server = http.createServer((req, res) => {
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      const file = path.join(upgraded ? root : previous, pathname === '/' ? 'index.html' : pathname);
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', file.endsWith('.js') ? 'application/javascript' :
        file.endsWith('.css') ? 'text/css' : file.endsWith('.svg') ? 'image/svg+xml' :
        file.endsWith('.png') ? 'image/png' : file.endsWith('.webmanifest') ? 'application/manifest+json' : 'text/html');
      res.end(fs.readFileSync(file));
    } catch { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://localhost:' + server.address().port;
  let browser;
  try {
    browser = await chromium.launch({executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
      args: ['--no-sandbox', '--disable-dev-shm-usage']});
    const context = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const storageSeeds = {lhrf_release_115_sentinel: 'synthetic unrelated device preference',
      [LIVE + '_pendingRun']: JSON.stringify({parentId: strength.id, week: 2, runLogged: true, runEntry: {km: 5, min: 32}}),
      'lhrf-v2-genuine-training-log': JSON.stringify([{source: 'synthetic-release-test', rpe: 8.5}])};
    await page.addInitScript(({fixture, live, DATA, LIVE, storageSeeds}) => {if(location.protocol!=='http:')return;
      if (!localStorage.getItem(DATA)) localStorage.setItem(DATA, JSON.stringify(fixture));
      if (!localStorage.getItem(LIVE)) localStorage.setItem(LIVE, JSON.stringify(live));
      for (const [key, value] of Object.entries(storageSeeds)) if (!localStorage.getItem(key)) localStorage.setItem(key, value);
    }, {fixture, live, DATA, LIVE, storageSeeds});
    const snapshot = () => page.evaluate(({DATA, LIVE}) => ({
      data: JSON.parse(localStorage.getItem(DATA)), live: JSON.parse(localStorage.getItem(LIVE)),
      storage: Object.fromEntries(Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)]))
    }), {DATA, LIVE});
    await page.goto(origin);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    for (const tab of ['settings', 'today', 'progress']) {
      await page.locator(`nav [data-screen=${tab}]`).click();
      await page.screenshot({path: path.join(root, `docs/ux-115/combined-before-${tab}.png`), fullPage: true});
    }
    const before = await snapshot();
    assert.deepEqual(before.data, fixture, 'Production shell did not rewrite the fictional programme/history');
    assert.equal(before.live.entries['0_0'].rpe, 7.5);
    upgraded = true;
    await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
    await reopenForWaitingUpdate(page);
    await page.waitForFunction(() => !!window.LHRFMobileUX?.openRecovery);
    assert.deepEqual(await snapshot(), before, 'Combined update preserves exact existing storage and active inputs');
    assert.deepEqual(await page.evaluate(() => JSON.parse(JSON.stringify(data))), fixture);
    for (const tab of ['settings', 'today', 'progress']) {
      await page.locator(`nav [data-screen=${tab}]`).click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({path: path.join(root, `docs/ux-115/combined-after-${tab}.png`), fullPage: true});
    }
    await context.setOffline(true);
    await page.reload();
    await page.waitForFunction(() => !!window.LHRFMobileUX?.openRecovery);
    assert.equal(await page.locator('#firstRun').isVisible(), false);
    assert.equal(await page.locator('#liveExercises .exercise-history').count(), 0);
    assert.ok(await page.locator('#liveExercises .training-info-button').count() > 0);
    assert.deepEqual(await snapshot(), before, 'Offline resume retains November prescriptions, RPE and Garmin associations');
    assert.equal(await page.evaluate(() => LHRFExercises.eligibility('Bench', data.equipmentInventory).eligible), true);
    assert.deepEqual(errors, []);
    await context.close();

    // Independent device fixture: late completion of the final run in programme week 2.
    const recoveryContext = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true,
      hasTouch: true, serviceWorkers: 'block'});
    const recovery = await recoveryContext.newPage(), recoveryErrors = [];
    recovery.on('pageerror', e => recoveryErrors.push(e.message));
    await recovery.clock.install({time: new Date('2026-11-10T12:00:00Z')});
    await recovery.addInitScript(({DATA, fixture}) => {
      if (!localStorage.getItem(DATA)) localStorage.setItem(DATA, JSON.stringify(fixture));
    }, {DATA, fixture});
    await recovery.goto(origin);
    await recovery.evaluate(() => {
      const parts = data.activeSchedule.flatMap(workoutParts), late = parts.find(s => s.runs?.length);
      window.syntheticLateRun = late;
      data.completedWorkouts.push(...parts.filter(s => s.id !== late.id).map(s => ({id: s.id, week: 2,
        date: '2026-11-08T10:00:00Z', name: s.name})));
      save(); refresh(); go('today');
    });
    assert.equal(await recovery.locator('#today .weekly-prompt').isVisible(), false);
    await recovery.evaluate(() => {
      const s = window.syntheticLateRun;
      data.runs.push({source: 'garmin-personal', sourceActivityId: '900002', sessionId: s.id,
        week: 2, date: '2026-11-10T07:00:00Z', km: 5, min: 32,
        plannedSession: {id: s.id, week: 2, plannedDate: '2026-11-03', name: s.name}});
      data.completedWorkouts.push({id: s.id, week: 2, date: '2026-11-10T07:00:00Z',
        source: 'garmin-personal', sourceActivityId: '900002', completedRun: true});
      save(); refresh();
    });
    assert.equal(await recovery.locator('#today .weekly-prompt').isVisible(), true);
    await recovery.locator('#today .weekly-prompt').getByRole('button', {name: 'Later', exact: true}).click();
    await recovery.reload();
    await recovery.locator('nav [data-screen=today]').click();
    assert.equal(await recovery.locator('#today .weekly-prompt').isVisible(), false);
    await recovery.locator('nav [data-screen=progress]').click();
    await recovery.locator('#weeklyRecovery>summary').click();
    const questions = recovery.locator('#weeklyCheckin>label select');
    for (const [i, value] of ['high', 'moderate', 'no'].entries()) await questions.nth(i).selectOption(value);
    await recovery.getByRole('button', {name: 'Save weekly check-in', exact: true}).click();
    const after = await recovery.evaluate(DATA => JSON.parse(localStorage.getItem(DATA)), DATA);
    for (const key of ['customRoadmap', 'activeSchedule', 'equipmentInventory', 'onboardingManualSplit', 'onboardingFacts', 'sets']) {
      assert.deepEqual(after[key], fixture[key], key + ' preserved after late completion and recovery check-in');
    }
    assert.deepEqual(after.runs[0], fixture.runs[0]);
    assert.equal(after.weeklyCheckins.at(-1).programmeWeekKey.endsWith('|2'), true);
    assert.equal(await recovery.locator('#today .weekly-prompt').isVisible(), false);
    assert.equal(await recovery.evaluate(() => LHRFTrainingReview.assess(data).proposals.length > 0), true);
    await recovery.locator('#weeklyReviewSheet').getByRole('button',{name:'Done',exact:true}).click();
    // Regression for the integration overlap: a coaching action must not be intercepted as recovery navigation.
    await recovery.evaluate(() => {
      go('progress');
      document.getElementById('progressReviewBtn')?.remove();
      const button = document.createElement('button'); button.id = 'progressReviewBtn';
      button.textContent = 'Synthetic coaching recommendation';
      button.onclick = () => { document.getElementById('progressDetails').open = true; };
      document.getElementById('progressDashboard').append(button);
    });
    await recovery.getByRole('button', {name: 'Synthetic coaching recommendation', exact: true}).click();
    assert.equal(await recovery.locator('.screen.active').getAttribute('id'), 'progress');
    assert.equal(await recovery.locator('#progressDetails').getAttribute('open'), '');
    assert.deepEqual(recoveryErrors, []);
    await recoveryContext.close();
    console.log('PASS combined production-main update/offline resume; November programme, original RPE, Garmin IDs/links, kit and settings; late imported final run, persistent deferral, coaching review routing; synthetic before/after evidence.');
  } finally {
    if (browser) await browser.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
