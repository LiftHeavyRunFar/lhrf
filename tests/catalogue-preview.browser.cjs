const assert = require('node:assert/strict');
const { chromium, devices } = require('playwright');
const { createServer } = require('node:http');
const { readFile } = require('node:fs/promises');
const { resolve, sep, extname } = require('node:path');
const root = resolve(__dirname, '..');
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.png': 'image/png', '.webmanifest': 'application/manifest+json' };

(async () => {
  const server = createServer(async (request, response) => {
    try {
      const path = new URL(request.url, 'http://localhost').pathname;
      const file = resolve(root, '.' + (path === '/' ? '/index.html' : path));
      if (!file.startsWith(root + sep)) throw new Error('Invalid file');
      const bytes = await readFile(file);
      response.setHeader('content-type', mime[extname(file)] ?? 'application/octet-stream');
      response.end(bytes);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const appUrl = 'http://localhost:' + server.address().port + '/';
  const catalogueUrl = appUrl + 'catalogue-preview/';
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE || undefined, args: ['--no-sandbox'] });
    const context = await browser.newContext({ ...devices['Pixel 7'], acceptDownloads: true });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const status = () => page.locator('#message');
    const dialog = page.getByRole('dialog');
    const enrol = async (id, date, fill) => {
      await page.locator('#programme').selectOption(id);
      await page.locator('#monday').fill(date);
      if (fill) await fill();
      await page.getByRole('button', { name: 'Preview programme' }).click();
      await page.locator('#preview').waitFor({ state: 'visible' });
    };
    const approve = async () => {
      await page.getByRole('button', { name: 'Get my programme' }).click();
      assert.match(await status().innerText(), /Programme added/);
    };
    const open = async name => {
      const card = page.locator('#calendar-body article').filter({ has: page.getByRole('heading', { name, exact: true }) }).first();
      await card.getByRole('button', { name: /workout/ }).click();
      await dialog.waitFor();
    };
    await page.goto(appUrl);
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
    await page.getByRole('heading', { name: 'Welcome to Lift Heavy. Run Far.' }).waitFor();
    await context.setOffline(true);
    await page.goto(catalogueUrl);
    await page.waitForURL(catalogueUrl);
    await context.setOffline(false);
    await page.waitForFunction(() => document.querySelector('#offline')?.textContent === 'Offline ready');
    await page.getByRole('heading', { name: 'Welcome to Lift Heavy. Run Far.' }).waitFor();
    assert.match(await page.locator('#choose-discipline').innerText(), /add the other discipline after setup/);
    assert.equal(await page.locator('#plan-form').isVisible(), false);
    await page.getByRole('button', { name: 'Running', exact: true }).click();
    assert.equal(await page.locator('#programme option').count(), 6);
    assert.equal(await page.locator('#programme option[value="powerlifting-four-day"]').count(), 0);
    await page.getByRole('button', { name: 'Change discipline' }).click();
    await page.getByRole('button', { name: 'Strength training', exact: true }).click();
    assert.equal(await page.locator('#programme option').count(), 6);
    assert.equal(await page.locator('#programme option[value="10k"]').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await enrol('powerlifting-four-day', '2026-11-16', async () => {
      await page.getByText('Add reference maxes (optional)', { exact: true }).click();
      await page.getByLabel('Squat (kg)', { exact: true }).fill('140');
      await page.getByLabel('Bench (kg)', { exact: true }).fill('95');
      await page.getByLabel('Deadlift (kg)', { exact: true }).fill('170');
      await page.getByRole('button', { name: 'Preview programme' }).click();
      assert.equal(await page.locator('#preview').isVisible(), false);
      await page.getByLabel('Squat · where do you struggle?').selectOption('torso');
      await page.getByLabel('Bench · where do you struggle?').selectOption('chest');
      await page.getByLabel('Deadlift · where do you struggle?').selectOption('start');
      await page.getByLabel('Safety squat bar', { exact: true }).check();
    });
    assert.deepEqual(await page.locator('#preview article h3').allTextContents(), ['Weeks 1–4', 'Weeks 5–8', 'Weeks 9–12']);
    await page.getByText('Programme by block', { exact: true }).click();
    await page.getByRole('heading', { name: 'Weeks 1–4', exact: true }).waitFor();
    assert.match(await page.locator('#preview article').first().innerText(), /Spoto press/);
    await page.getByRole('button', { name: 'Edit setup' }).click();
    assert.equal(await page.getByLabel('Bench (kg)', { exact: true }).inputValue(), '95');
    await page.getByRole('button', { name: 'Preview programme' }).click();
    await approve();
    assert.equal(await page.getByLabel('Calendar week', { exact: true }).inputValue(), '2026-11-16');
    await open('Deadlift and support');
    assert.match(await dialog.innerText(), /Spoto press · 3 × 5/);
    assert.match(await dialog.innerText(), /Safety squat bar squat · 3 × 5/);
    await dialog.getByRole('button', { name: 'Close' }).click();
    await open('Bench volume');
    assert.match(await dialog.innerText(), /Cable pressdown/);
    await dialog.getByRole('button', { name: 'Close' }).click();
    await page.getByLabel('Calendar week', { exact: true }).selectOption('2026-12-14');
    await open('Deadlift and support');
    assert.match(await dialog.innerText(), /Long-pause bench/);
    await dialog.getByRole('button', { name: 'Close' }).click();

    await page.getByRole('button', { name: 'Add running' }).click();
    await page.getByRole('heading', { name: 'Running', exact: true }).waitFor();
    assert.equal(await page.locator('#programme option').count(), 6);
    await enrol('10k', '2026-11-16', async () => {
      await page.getByText('Add a recent race time (optional)', { exact: true }).click();
      await page.getByLabel('Recent 10K time (minutes)').fill('55');
    });
    assert.deepEqual(await page.locator('#preview article h3').allTextContents(), ['Weeks 1–4', 'Weeks 5–6']);
    const warning = page.locator('#preview details').filter({ hasText: 'lower-body and run pairings to review' });
    assert.match(await warning.locator('summary').innerText(), /lower-body and run pairings to review/);
    await warning.locator('summary').click();
    assert.match(await warning.locator('li').first().innerText(), /run/i);
    await approve();
    assert.match(await page.locator('#calendar-body').innerText(), /Deadlift and support/);
    assert.match(await page.locator('#calendar-body').innerText(), /Easy long run/);
    await open('Squat and support');
    assert.match(await dialog.innerText(), /Competition squat · 4 × 5 · start 100 kg/);
    assert.match(await dialog.innerText(), /Paused deadlift · 2 × 4/);
    await dialog.locator('[name="g0-0-weightKg"]').fill('100');
    await dialog.locator('[name="g0-0-dose"]').fill('5');
    await dialog.locator('[name="g0-0-rpe"]').fill('7');

    await context.setOffline(true);
    await page.reload({ waitUntil: 'load' });
    await page.getByRole('button', { name: 'Calendar', exact: true }).click();
    await open('Squat and support');
    assert.equal(await dialog.locator('[name="g0-0-dose"]').inputValue(), '5');
    await dialog.getByRole('button', { name: 'Save workout' }).click();
    await dialog.waitFor({ state: 'hidden' });
    await open('Quality run');
    assert.match(await dialog.innerText(), /7 km total/);
    const download = page.waitForEvent('download');
    await dialog.getByRole('button', { name: 'Download Garmin FIT' }).click();
    assert.match((await download).suggestedFilename(), /quality\.fit$/);
    const tcx = '<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"><Activities><Activity Sport="Running"><Id>2026-11-18T18:00:00Z</Id><Lap StartTime="2026-11-18T18:00:00Z"><TotalTimeSeconds>2520</TotalTimeSeconds><DistanceMeters>7000</DistanceMeters></Lap></Activity></Activities></TrainingCenterDatabase>';
    await dialog.locator('input[type=file]').setInputFiles({ name: 'test-run.tcx', mimeType: 'application/xml', buffer: Buffer.from(tcx) });
    await dialog.getByText(/Garmin TCX activity · 7.00 km/).waitFor();
    await dialog.getByRole('button', { name: 'Save workout' }).click();
    await dialog.waitFor({ state: 'hidden' });
    await open('Easy long run');
    await dialog.getByLabel('New workout date').fill('2026-11-22');
    await dialog.getByRole('button', { name: 'Move workout' }).click();
    assert.match(await status().innerText(), /Workout moved/);
    await open('Easy long run');
    assert.match(await dialog.innerText(), /Sun, 22 Nov 2026/);
    assert.match(await dialog.innerText(), /9 km total/);
    await dialog.getByRole('button', { name: 'Skip', exact: true }).click();
    await open('Easy long run');
    await dialog.getByRole('button', { name: 'Restore', exact: true }).click();
    await open('Easy long run');
    await dialog.getByLabel('New workout date').fill('2026-11-24');
    await dialog.getByRole('button', { name: 'Repeat on selected date' }).click();
    assert.match(await status().innerText(), /Repeat added/);

    await page.getByRole('button', { name: 'History', exact: true }).click();
    assert.equal(await page.locator('#history-body article').count(), 2);
    assert.match(await page.locator('#history-body').innerText(), /7 km · 42 min/);
    assert.match(await page.locator('#history-body').innerText(), /1 actual sets/);
    await page.reload({ waitUntil: 'load' });
    await page.getByRole('button', { name: 'History', exact: true }).click();
    assert.equal(await page.locator('#history-body article').count(), 2);
    await page.getByRole('link', { name: 'Back to LHRF' }).click();
    await page.waitForURL(appUrl);
    await context.setOffline(false);
    const installed = await browser.newContext({ ...devices['Pixel 7'] });
    const existingApp = await installed.newPage();
    existingApp.on('pageerror', error => errors.push(error.stack || error.message));
    await existingApp.clock.setFixedTime(new Date('2026-11-12T12:00:00Z'));
    const existingLog = [{ exercise: 'Bench press', weight: 100, reps: 5, date: '2026-11-08T12:00:00Z' }];
    await existingApp.addInitScript(sets => {
      const key = 'lhrf_beta_v1118_clean';
      if (!sessionStorage.getItem('fixture-seeded')) {
        localStorage.setItem(key, JSON.stringify({ onboardingComplete: true, customRoadmap: { weeks: 1 }, sets }));
        sessionStorage.setItem('fixture-seeded', 'yes');
      }
    }, existingLog);
    await existingApp.goto(appUrl);
    await existingApp.waitForFunction(() => navigator.serviceWorker.controller !== null);
    await existingApp.locator('nav [data-screen="plan"]').click();
    await existingApp.getByRole('button', { name: 'Start a programme', exact: true }).click();
    await existingApp.getByRole('heading', { name: 'Welcome to Lift Heavy. Run Far.' }).waitFor();
    assert.equal(existingApp.url(), appUrl);
    assert.deepEqual(await existingApp.evaluate(() => JSON.parse(localStorage.getItem('lhrf_beta_v1118_clean')).sets), existingLog);
    await existingApp.getByRole('button', { name: 'Close setup' }).click();
    await existingApp.locator('nav [data-screen="settings"]').click();
    await existingApp.locator('#settingsProgramme > summary').click();
    await existingApp.getByRole('button', { name: 'Start a new programme', exact: true }).click();
    await existingApp.getByRole('heading', { name: 'Welcome to Lift Heavy. Run Far.' }).waitFor();
    await existingApp.getByRole('button', { name: 'Close setup' }).click();
    await existingApp.locator('nav [data-screen="settings"]').click();
    existingApp.once('dialog', confirmation => confirmation.accept());
    await existingApp.getByRole('button', { name: 'Start from scratch' }).click();
    await existingApp.getByRole('heading', { name: 'Welcome to Lift Heavy. Run Far.' }).waitFor();
    assert.equal(await existingApp.evaluate(() => JSON.parse(localStorage.getItem('lhrf_beta_v1118_clean'))?.sets?.length || 0), 0);
    await installed.setOffline(true);
    const nativeState = () => existingApp.evaluate(() => JSON.parse(localStorage.getItem('lhrf_beta_v1118_clean')));
    await existingApp.getByRole('button', { name: 'Strength training', exact: true }).click();
    await existingApp.locator('#native-catalogue-programme').selectOption('powerlifting-four-day');
    const daysBeforeEquipment = await existingApp.locator('#native-catalogue-training-days').evaluate(element =>
      Boolean(element.compareDocumentPosition(document.querySelector('#native-catalogue-settings')) & Node.DOCUMENT_POSITION_FOLLOWING));
    assert.equal(daysBeforeEquipment, true);
    for (const lift of ['Squat', 'Bench', 'Deadlift']) {
      await existingApp.getByLabel(lift + ' · where do you struggle?').selectOption('unsure');
    }
    await existingApp.getByRole('checkbox', { name: 'Monday', exact: true }).uncheck();
    await existingApp.getByRole('checkbox', { name: 'Tuesday', exact: true }).check();
    await existingApp.getByLabel('First calendar week').fill('2026-11-16');
    await existingApp.getByRole('button', { name: 'Preview programme' }).click();
    const firstWeek = existingApp.getByRole('region', { name: 'First week' });
    assert.match(await firstWeek.innerText(), /Tue 17 Nov/);
    assert.doesNotMatch(await firstWeek.innerText(), /Mon 16 Nov/);
    assert.equal(await existingApp.getByText('Programme by block', { exact: true }).locator('..').getAttribute('open'), null);
    await existingApp.getByRole('button', { name: 'Edit setup' }).click();
    assert.equal(await existingApp.getByRole('checkbox', { name: 'Tuesday', exact: true }).isChecked(), true);
    assert.equal(await existingApp.getByRole('checkbox', { name: 'Monday', exact: true }).isChecked(), false);
    await existingApp.getByRole('button', { name: 'Preview programme' }).click();
    await existingApp.getByRole('button', { name: 'Get my programme' }).click();
    await existingApp.getByRole('heading', { name: 'Onboarding complete' }).waitFor();
    assert.equal(await existingApp.getByRole('dialog').getByRole('button', { name: 'Custom programme setup' }).count(), 0);
    await existingApp.getByRole('button', { name: 'Go to programme' }).waitFor();
    const nativeStrength = await nativeState();
    assert.equal(nativeStrength.onboardingComplete, true);
    await existingApp.getByRole('button', { name: 'Add running programme' }).click();
    await existingApp.getByRole('button', { name: 'Back', exact: true }).click();
    await existingApp.getByRole('heading', { name: 'Onboarding complete' }).waitFor();
    await existingApp.getByRole('button', { name: 'Add running programme' }).click();
    await existingApp.locator('#native-catalogue-programme').selectOption('10k');
    await existingApp.getByRole('dialog', { name: 'Programme setup' }).getByLabel('Runs per week', { exact: true }).selectOption('3');
    assert.equal(await existingApp.getByRole('group', { name: 'Training days' }).getByRole('checkbox', { checked: true }).count(), 3);
    await existingApp.getByRole('dialog', { name: 'Programme setup' }).getByLabel('Runs per week', { exact: true }).selectOption('2');
    assert.equal(await existingApp.getByRole('group', { name: 'Training days' }).getByRole('checkbox', { checked: true }).count(), 2);
    await existingApp.getByLabel('First calendar week').fill('2026-11-16');
    await existingApp.getByRole('button', { name: 'Preview programme' }).click();
    const fatigue = existingApp.getByRole('region', { name: 'Fatigue review' });
    assert.match(await fatigue.innerText(), /Demanding run|demanding run/);
    assert.ok(await fatigue.locator('li').count() > 0);
    assert.match(await firstWeek.innerText(), /Your first week together/);
    assert.equal(await firstWeek.locator('dd > div').count(), 6);
    await existingApp.getByRole('button', { name: 'Get my programme' }).click();
    await existingApp.locator('#catalogueSetupDialog').waitFor({ state: 'hidden' });
    const hybrid = await nativeState();
    assert.equal(hybrid.customRoadmap.cataloguePlans.length, 2);
    assert.equal(hybrid.customRoadmap.cataloguePlans[1].snapshot.id, '10k-two-run');
    await existingApp.getByRole('button', { name: /Preview workout Squat and support/ }).waitFor();
    assert.match(await existingApp.locator('.programme-start-notice').innerText(), /First workout: Tuesday 17 Nov/);
    await existingApp.getByRole('button', { name: /Preview workout Squat and support/ }).click();
    await existingApp.locator('#livePreview').waitFor();
    await existingApp.locator('#previewClose').click();
    const strengthSessions = hybrid.reviewedProgramme.weeks[0].sessions.filter(s => s.ex.length);
    assert.deepEqual(strengthSessions, nativeStrength.reviewedProgramme.weeks[0].sessions);
    assert.deepEqual(strengthSessions.map(s => s.day), ['Tue', 'Wed', 'Fri', 'Sun']);
    await existingApp.locator('nav [data-screen="plan"]').click();
    await existingApp.getByRole('heading', { name: /Powerlifting.*10K/ }).waitFor();
    await existingApp.getByRole('region', { name: 'Week 1 workouts' }).waitFor();
    assert.equal(await existingApp.locator('#planDashWeekDetails article').count(), 6);
    assert.equal(await existingApp.locator('#planDashChart svg').count(), 1);
    await existingApp.getByLabel('Workout week').selectOption('2');
    await existingApp.getByRole('region', { name: 'Week 2 workouts' }).waitFor();
    await existingApp.getByRole('button', { name: 'Change strength training days' }).click();
    await existingApp.getByRole('checkbox', { name: 'Wednesday', exact: true }).uncheck();
    await existingApp.getByRole('checkbox', { name: 'Thursday', exact: true }).check();
    await existingApp.getByRole('button', { name: 'Save training days' }).click();
    await existingApp.locator('#catalogueSetupDialog').waitFor({ state: 'hidden' });
    const moved = await nativeState();
    const movedStrength = moved.reviewedProgramme.weeks[0].sessions.filter(s => s.ex.length);
    assert.deepEqual(movedStrength.map(s => s.day), ['Tue', 'Thu', 'Fri', 'Sun']);
    assert.deepEqual(movedStrength.map(s => [s.id, s.ex]), strengthSessions.map(s => [s.id, s.ex]));
    assert.equal(existingApp.url(), appUrl);
    await existingApp.reload();
    assert.deepEqual(await nativeState(), moved);
    await existingApp.locator('nav [data-screen="plan"]').click();
    const api = require('../src/programme-replacement');
    const compProgramme = {
      schema: 'lhrf-shared-programme-v1',
      config: { ...moved.customRoadmap, startDate: '2026-11-09', weeks: 2 },
      weeks: [1, 2].map(week => ({ week, feasible: true, sessions: [{
        id: 'fixture-' + week, day: 'Thu', name: 'Competition practice ' + week,
        scheduledDate: week === 1 ? '2026-11-12' : '2026-11-19',
        ex: [['Bench', 1, 3, 60, 6]], runs: [],
      }] })),
    };
    delete compProgramme.config.cataloguePlans;
    const packet = await api.createPackage(compProgramme, { customRoadmap: {}, sets: [], runs: [] },
      { reviewedCommit: 'synthetic-competition-slot' });
    const competitionState = () => existingApp.evaluate(() => JSON.parse(localStorage.getItem('competition:lhrf_beta_v1118_clean')));
    await existingApp.getByRole('button', { name: 'Competition programme', exact: true }).click();
    await existingApp.waitForURL(appUrl + '?mode=competition');
    assert.equal(await existingApp.locator('#catalogueSetupDialog').isVisible(), false);
    await existingApp.getByLabel('Reviewed programme file').setInputFiles({
      name: 'competition-fixture.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(packet)),
    });
    await existingApp.getByLabel('Programme fingerprint', { exact: true }).fill(packet.reviewFingerprint);
    await existingApp.getByRole('button', { name: 'Save competition programme', exact: true }).click();
    const importStatus = existingApp.locator('#competitionProgramme [role="status"]');
    await importStatus.filter({ hasText: /.+/ }).waitFor({ timeout: 5000 });
    assert.equal(await importStatus.innerText(), 'Competition programme saved on this device.');
    await existingApp.getByRole('button', { name: /Competition practice 2/ }).click();
    await existingApp.locator('#previewStart').click({ timeout: 6000 });
    await existingApp.locator('#readinessContinue').click();
    await existingApp.locator('.live-set [data-field="rpe"]').first().fill('6');
    await existingApp.locator('.live-set .set-check').first().click();
    await existingApp.locator('#liveFinish').click();
    await existingApp.locator('#finishAndSave').click();
    await existingApp.locator('#liveFeedbackDifficulty').selectOption('expected');
    await existingApp.locator('#liveFeedbackSave').click();
    assert.equal((await competitionState()).sets.length, 1);
    assert.deepEqual(await nativeState(), moved);
    await existingApp.getByRole('button', { name: 'Back to app testing' }).click();
    await existingApp.waitForURL(appUrl);
    await existingApp.locator('nav [data-screen="settings"]').click();
    await existingApp.locator('#settingsProgramme > summary').click();
    existingApp.once('dialog', confirmation => confirmation.accept());
    await existingApp.getByRole('button', { name: 'Reset test setup' }).click();
    await existingApp.getByRole('heading', { name: 'Welcome to Lift Heavy. Run Far.' }).waitFor();
    await existingApp.getByRole('button', { name: 'Strength training', exact: true }).click();
    await existingApp.locator('#native-catalogue-programme').selectOption('powerlifting-four-day');
    await existingApp.getByRole('checkbox', { name: 'Monday', exact: true }).uncheck();
    await existingApp.getByRole('dialog', { name: 'Programme setup' }).getByRole('button', { name: 'Competition programme', exact: true }).click();
    await existingApp.waitForURL(appUrl + '?mode=competition');
    await existingApp.getByRole('button', { name: /Competition practice 2 · Completed/ }).waitFor();
    assert.equal((await competitionState()).sets.length, 1);
    assert.equal(await nativeState(), null);
    await existingApp.getByRole('button', { name: 'Back to app testing' }).click();
    await existingApp.locator('#native-catalogue-programme').waitFor();
    assert.equal(await existingApp.locator('#native-catalogue-programme').inputValue(), 'powerlifting-four-day');
    assert.equal(await existingApp.getByRole('checkbox', { name: 'Monday', exact: true }).isChecked(), false);
    await installed.close();
    assert.deepEqual(errors, []);
    console.log('PASS: Pixel-size onboarding, block previews, paired calendar, exercise swaps, move/skip/repeat, Garmin, offline reload and log persistence.');
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
