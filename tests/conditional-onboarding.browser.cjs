// Fresh desktop and Pixel contexts plus an existing reviewed synthetic programme.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {confirmOnboardingEquipment} = require('./equipment-browser-fixtures.cjs');
const {fixture: trainingState} = require('./training-mode-fixture.cjs');
const {eventProgramme} = require('./replacement-fixtures.cjs');
const replacement = require('../src/programme-replacement');
const coach = require('../src/coach-engine');
const {reopenForWaitingUpdate} = require('./workout-update-helpers.cjs');

const root = path.join(__dirname, '..');
const previous = process.env.LHRF_ONBOARDING_BASE;
if (!previous) throw new Error('Set LHRF_ONBOARDING_BASE to the archived v1.37.0 release.');
const shellCache = dir => fs.readFileSync(path.join(dir, 'sw.js'), 'utf8').match(/^const CACHE = '([^']+)'/m)[1];
const candidateCache = shellCache(root), previousCache = shellCache(previous);
const key = replacement.DATA_KEY;
const pixel = {width: 393, height: 852};
const desktop = {width: 1366, height: 900};
const date = '2026-11-09T09:00:00Z';
const eventDate = '2026-12-20';

const loc = (page, id) => page.locator('#' + id);
const fitsViewport = page => loc(page, 'firstRun').evaluate(el => el.hidden || el.scrollWidth <= el.clientWidth);
const next = async page => {
  await loc(page, 'frNext').click();
  assert.equal(await fitsViewport(page), true, 'Setup does not scroll horizontally');
};
const step = page => page.locator('.fr-step.on').getAttribute('data-step');
const state = page => page.evaluate(key => localStorage.getItem(key), key);
const set = async (page, id, value) => {
  const field = loc(page, id);
  if (await field.evaluate(el => el.tagName === 'SELECT')) await field.selectOption(String(value));
  else await field.fill(String(value));
};
async function disclose(page, id) {
  const target = loc(page, id);
  if (!await target.evaluate(el => el.open)) await target.locator(':scope > summary').click();
}
async function fresh(browser, origin, viewport = pixel) {
  const isMobile = viewport === pixel;
  const context = await browser.newContext({viewport, isMobile, hasTouch: isMobile,
    timezoneId: 'Europe/London', acceptDownloads: true, serviceWorkers: 'block'});
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.clock.install({time: new Date(date)});
  await page.goto(origin);
  assert.equal(await loc(page, 'firstRun').isVisible(), true, errors.join('\n'));
  assert.equal(await fitsViewport(page), true);
  assert.equal(await step(page), '1');
  assert.match(await loc(page, 'frStepLabel').innerText(), /1 of 5/i);
  assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'), '1');
  assert.equal(await loc(page, 'frBack').isVisible(), false);
  assert.equal(await page.locator('.fr-step.on h1').evaluate(el => el === document.activeElement), true);
  return {page, context, errors};
}
async function chooseDays(page, days) {
  await disclose(page, 'frWeeklyDetails');
  for (const day of ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']) {
    await page.locator('.fr-day[value="' + day + '"]').setChecked(days.includes(day));
  }
}
async function currentRecovery(page, fatigue = 'normal') {
  assert.equal(await step(page), '4');
  await set(page, 'frFatigueStatus', fatigue);
  await next(page);
  assert.equal(await step(page), '5');
}
async function accept(page) {
  assert.equal(await loc(page, 'frNext').isEnabled(), true,
    (await loc(page, 'frError').textContent()) + ' ' + (await loc(page, 'frWarnings').textContent()));
  await next(page);
  assert.equal(await loc(page, 'firstRun').isVisible(), false, await loc(page, 'frError').textContent());
  return JSON.parse(await state(page));
}
async function rebuild(page, config) {
  return page.evaluate(config => LHRFCoachAdapters.buildProgramme(config, {data}), config);
}
function meetSessions(proposal) {
  return proposal.weeks.flatMap(week => week.sessions).filter(session => session.eventType === 'strength');
}
async function exportBackup(page) {
  await page.locator('nav [data-screen=settings]').click();
  await disclose(page, 'settingsData');
  const [file] = await Promise.all([page.waitForEvent('download'), loc(page, 'exportTrainingData').click()]);
  return JSON.parse(fs.readFileSync(await file.path(), 'utf8'));
}

(async () => {
  let servePrevious = false;
  const mime = {'.js':'application/javascript','.css':'text/css','.png':'image/png',
    '.svg':'image/svg+xml','.ttf':'font/ttf','.webmanifest':'application/manifest+json','.json':'application/json'};
  const server = http.createServer((req, res) => {
    const name = new URL(req.url, 'http://localhost').pathname;
    const file = path.join(servePrevious ? previous : root, name === '/' ? 'index.html' : name);
    try {
      res.writeHead(200, {'Content-Type': mime[path.extname(file)] || 'text/html', 'Cache-Control':'no-store'});
      res.end(fs.readFileSync(file));
    } catch {
      res.statusCode = 404;
      res.end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://localhost:' + server.address().port + '/';
  let browser;
  try {
    browser = await chromium.launch({executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
      args: ['--no-sandbox', '--disable-dev-shm-usage']});
    {
      const {page, context, errors} = await fresh(browser, origin);
      await set(page, 'frScope', 'running');
      await next(page);
      assert.equal(await step(page), '2');
      assert.equal(await page.locator('.fr-step.on h1').evaluate(el => el === document.activeElement), true);
      await set(page, 'frGoal', 'running');
      await set(page, 'frRunGoal', '10K');
      assert.equal(await loc(page, 'frExperience').isVisible(), false);
      assert.equal(await loc(page, 'frStrengthDate').isVisible(), false);
      assert.equal(await loc(page, 'frEquipment').isVisible(), false);
      await next(page);
      assert.equal(await step(page), '3');
      assert.equal(await loc(page, 'frStrengthVisits').isVisible(), false);
      await next(page);
      assert.equal(await step(page), '4');
      assert.equal(await loc(page, 'frMaxBench').isVisible(), false);
      assert.equal(await loc(page, 'frEquipment').isVisible(), false);
      assert.equal(await loc(page, 'frResultDate').isVisible(), false);
      await set(page, 'frRunKm', 10);
      await disclose(page, 'frRunningResult');
      await set(page, 'frRunTime', '55:00');
      await set(page, 'frResultDate', '2026-10-29');
      await currentRecovery(page);
      assert.equal(JSON.parse(await state(page))?.onboardingComplete === true, false);
      const installed = await accept(page);
      assert.equal(installed.customRoadmap.runs > 0, true);
      assert.ok(installed.activeSchedule.every(session => !session.ex?.length));
      assert.ok(installed.activeSchedule.some(session => session.runs?.length));
      const backup = await exportBackup(page);
      assert.deepEqual(backup.customRoadmap, installed.customRoadmap);
      assert.deepEqual(backup.activeSchedule, installed.activeSchedule);
      assert.deepEqual(errors, []);
      await context.close();
    }
    {
      const {page, context, errors} = await fresh(browser, origin);
      // Keep defaults for general hybrid fitness, availability and baselines.
      await next(page);
      assert.equal(await step(page), '2');
      assert.equal(await loc(page, 'frGoal').inputValue(), 'general');
      await set(page, 'frExperience', 'beginner');
      await next(page);
      assert.equal(await step(page), '3');
      await next(page);
      await currentRecovery(page);
      const installed = await accept(page);
      assert.ok(installed.activeSchedule.some(session => session.ex?.length));
      assert.ok(installed.activeSchedule.some(session => session.runs?.length));
      assert.equal(await loc(page, 'frFinalHeavyPreview').isVisible(), false);
      assert.deepEqual(errors, []);
      await context.close();
    }
    for (const test of [
      {goal:'bench', focus:'strength-only', lifts:['Bench'], viewport:pixel, choose:{Bench:{mode:'days',value:7}}},
      {goal:'deadlift', focus:'strength-only', lifts:['Deadlift'], viewport:desktop, choose:{Deadlift:{mode:'date',value:'2026-12-10'}}},
      {goal:'powerlifting', focus:'balanced', lifts:['Squat','Bench','Deadlift'], viewport:desktop,
        choose:{Squat:{mode:'date',value:'2026-12-10'},Bench:{mode:'days',value:7}}}
    ]) {
      const {page, context, errors} = await fresh(browser, origin, test.viewport);
      await set(page, 'frScope', test.focus === 'balanced' ? 'hybrid' : 'strength');
      if (test.focus === 'balanced') await page.locator('[name=frFocus][value=balanced]').check();
      await next(page);
      await set(page, 'frGoal', test.goal);
      await set(page, 'frExperience', 'advanced');
      await set(page, 'frStrengthDate', eventDate);
      await next(page);
      assert.equal(await step(page), '3');
      await chooseDays(page, ['Mon','Tue','Thu','Sat','Sun']);
      for (const lift of ['Squat','Bench','Deadlift']) {
        const mode = loc(page, 'frFinalHeavy' + lift + 'Mode');
        assert.equal(await mode.isVisible(), test.lifts.includes(lift));
        if (!test.lifts.includes(lift)) continue;
        assert.equal(await mode.inputValue(), 'coach');
        const choice = test.choose[lift];
        if (!choice) continue;
        await mode.selectOption(choice.mode);
        await set(page, 'frFinalHeavy' + lift + (choice.mode === 'date' ? 'Date' : 'Days'), choice.value);
      }
      await next(page);
      assert.equal(await step(page), '4', await loc(page, 'frError').textContent());
      await confirmOnboardingEquipment(page);
      for (const lift of test.lifts) {
        await set(page, 'frMax' + lift, {Squat:145,Bench:105,Deadlift:175}[lift]);
        await set(page, 'frMax' + lift + 'Date', '2026-11-02');
        await loc(page, 'frMax' + lift + 'Technique').check();
      }
      await currentRecovery(page);
      const preview = await loc(page, 'frFinalHeavyPreview').innerText();
      for (const lift of test.lifts) assert.match(preview, new RegExp(lift, 'i'));
      assert.match(preview, /heavy.*single/is);
      assert.match(preview, /technique|light/i);
      await disclose(page, 'frReviewEdits');
      assert.equal(await loc(page, 'frEditWeek').isVisible(), true);
      await loc(page, 'frEditWeek').click();
      assert.equal(await step(page), '3');
      for (const [lift, choice] of Object.entries(test.choose)) {
        assert.equal(await loc(page, 'frFinalHeavy' + lift + 'Mode').inputValue(), choice.mode);
      }
      await next(page);
      await currentRecovery(page);
      const installed = await accept(page);
      assert.equal(installed.customRoadmap.event, test.goal);
      const proposal = await rebuild(page, installed.customRoadmap);
      assert.deepEqual(meetSessions(proposal).map(s => s.competitionLifts), [test.lifts]);
      for (const [lift, choice] of Object.entries(test.choose)) {
        const final = proposal.finalHeavyPlan[lift];
        assert.equal(final.mode, 'athlete');
        assert.equal(final.date, choice.mode === 'date' ? choice.value : '2026-12-13');
        assert.ok(final.finalLightDate == null || final.finalLightDate > final.date);
        const exercises = proposal.weeks.flatMap(week => week.sessions.flatMap(session => session.ex || []));
        const conditional = final.kind === 'conditional-single';
        const marker = conditional ? 'conditionalFinalHeavy' : 'finalHeavyExposure';
        const planned = exercises.filter(ex => ex[5]?.[marker]?.lift === lift && ex[5][marker].date === final.date);
        assert.equal(planned.length, 1);
        assert.equal(planned[0][2] === 1, !conditional);
        if (final.finalLightDate) {
          const practice = exercises.find(ex => ex[5]?.finalLightExposure?.lift === lift);
          assert.equal(practice?.[5].finalLightExposure.date, final.finalLightDate);
          assert.ok(practice[4] < planned[0][4], 'Later technique practice is lighter than final rehearsal');
        }
      }
      if (test.goal === 'powerlifting') {
        assert.equal(proposal.finalHeavyPlan.Deadlift.mode, 'coach');
        assert.match(proposal.finalHeavyPlan.Deadlift.reason, /recovery|experience|taper|evidence/i);
      }
      assert.deepEqual(errors, []);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await context.close();
    }
    {
      const {page, context, errors} = await fresh(browser, origin);
      await set(page, 'frScope', 'strength');
      await next(page);
      await set(page, 'frGoal', 'bench');
      await set(page, 'frExperience', 'beginner');
      await set(page, 'frStrengthDate', eventDate);
      await next(page);
      await set(page, 'frFinalHeavyBenchMode', 'days');
      await set(page, 'frFinalHeavyBenchDays', 1);
      await next(page);
      if (await step(page) === '4') {
        await confirmOnboardingEquipment(page);
        await currentRecovery(page, 'all');
        assert.equal(await loc(page, 'frNext').isDisabled(), true);
        assert.match(await loc(page, 'frWarnings').innerText(), /coach timing|heavy|experience|recovery|taper/i);
        assert.match(await loc(page, 'frFinalHeavyPreview').innerText(), /heavy|experience|recovery|taper/i);
      } else {
        assert.equal(await step(page), '3');
        assert.match(await loc(page, 'frError').textContent(), /heavy|recovery|taper|training/i);
      }
      assert.equal(JSON.parse(await state(page))?.onboardingComplete === true, false);
      assert.deepEqual(errors, []);
      await context.close();
    }
    {
      const {page, context, errors} = await fresh(browser, origin, desktop);
      await set(page, 'frScope', 'strength');
      await next(page);
      await set(page, 'frGoal', 'deadlift');
      await set(page, 'frExperience', 'intermediate');
      await set(page, 'frStrengthDate', eventDate);
      await next(page);
      await next(page);
      assert.equal(await step(page), '4');
      await confirmOnboardingEquipment(page);
      await loc(page, 'frEquipment').locator(':scope > details > summary').click();
      const bar = loc(page, 'frEquipment').getByRole('checkbox', {name:'straight-bar', exact:true});
      await bar.uncheck();
      await currentRecovery(page);
      assert.equal(await loc(page, 'frNext').isDisabled(), true);
      assert.match((await loc(page, 'frWarnings').textContent()) + (await loc(page, 'frError').textContent()),
        /equipment|deadlift|bar/i);
      assert.equal(JSON.parse(await state(page))?.onboardingComplete === true, false);
      assert.deepEqual(errors, []);
      await context.close();
    }
    // An already-approved, fictional November programme is unaffected by update and export.
    {
      const original = trainingState();
      original.readinessDay = '2026-11-09';
      const packet = await replacement.createPackage(eventProgramme({equipmentInventory:original.equipmentInventory}),
        original, {reviewedCommit:'6e0a0e9', approvalContext:['Synthetic upgrade fixture']});
      const approved = replacement.createReplacement(original, packet, coach, {now:date}).next;
      servePrevious = true;
      const context = await browser.newContext({viewport:pixel, isMobile:true, hasTouch:true,
        timezoneId:'Europe/London', acceptDownloads:true});
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.clock.install({time: new Date(date)});
      await page.addInitScript(({key, approved}) => {
        if (location.protocol === 'http:' && !localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(approved));
      }, {key, approved});
      await page.goto(origin);
      await page.evaluate(() => navigator.serviceWorker.ready);
      await page.waitForFunction(() => !!navigator.serviceWorker.controller);
      assert.ok((await page.evaluate(() => caches.keys())).includes(previousCache));
      const before = await state(page);
      assert.equal(await loc(page, 'firstRun').isVisible(), false);
      servePrevious = false;
      await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
      await reopenForWaitingUpdate(page);
      assert.deepEqual((await page.evaluate(() => caches.keys())).filter(key => key.startsWith('lhrf-shell-')),
        [candidateCache]);
      assert.equal(await loc(page, 'firstRun').isVisible(), false);
      assert.equal(await state(page), before);
      const backup = await exportBackup(page);
      const preserved = JSON.parse(before);
      for (const field of ['sets','runs','completedWorkouts','reviewedProgramme','activeSchedule','programmeArchive']) {
        assert.deepEqual(backup[field], preserved[field]);
      }
      await context.setOffline(true);
      await page.reload();
      assert.equal(await loc(page, 'firstRun').isVisible(), false);
      assert.equal(await state(page), before);
      assert.deepEqual(errors, []);
      await context.close();
    }
    console.log('PASS progressive onboarding on desktop and Pixel, conditional sport and meet fields, per-lift final-heavy choices, safety gating, approval and preserved reviewed programme/history/backups offline');
  } finally {
    if (browser) await browser.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {console.error(error);process.exitCode = 1;});
