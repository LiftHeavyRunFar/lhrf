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
    assert.match(await page.locator('#choose-discipline').innerText(), /set up the other discipline after you get your first programme/);
    assert.equal(await page.locator('#plan-form').isVisible(), false);
    await page.getByRole('button', { name: 'Running', exact: true }).click();
    assert.equal(await page.locator('#programme option').count(), 6);
    assert.equal(await page.locator('#programme option[value="powerlifting-four-day"]').count(), 0);
    await page.getByRole('button', { name: 'Change discipline' }).click();
    await page.getByRole('button', { name: 'Strength training', exact: true }).click();
    assert.equal(await page.locator('#programme option').count(), 6);
    assert.equal(await page.locator('#programme option[value="10k-two-run"]').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await enrol('powerlifting-four-day', '2026-11-16', async () => {
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
    assert.match(await page.locator('#preview article').first().innerText(), /Spoto press/);
    assert.equal(await page.locator('#preview details').count(), 0);
    await page.getByRole('button', { name: 'Edit setup' }).click();
    assert.equal(await page.getByLabel('Bench (kg)', { exact: true }).inputValue(), '95');
    await page.getByRole('button', { name: 'Preview programme' }).click();
    await approve();
    assert.equal(await page.getByLabel('Calendar week').inputValue(), '2026-11-16');
    await open('Deadlift and support');
    assert.match(await dialog.innerText(), /Spoto press · 3 × 5/);
    assert.match(await dialog.innerText(), /Safety squat bar squat · 3 × 5/);
    await dialog.getByRole('button', { name: 'Close' }).click();
    await open('Bench volume');
    assert.match(await dialog.innerText(), /Cable pressdown/);
    await dialog.getByRole('button', { name: 'Close' }).click();
    await page.getByLabel('Calendar week').selectOption('2026-12-14');
    await open('Deadlift and support');
    assert.match(await dialog.innerText(), /Long-pause bench/);
    await dialog.getByRole('button', { name: 'Close' }).click();

    await page.getByRole('button', { name: 'Add running' }).click();
    await page.getByRole('heading', { name: 'Running', exact: true }).waitFor();
    assert.equal(await page.locator('#programme option').count(), 6);
    await enrol('10k-two-run', '2026-11-16', async () => {
      await page.getByLabel('Recent 10K time in minutes · optional').fill('55');
    });
    assert.deepEqual(await page.locator('#preview article h3').allTextContents(), ['Weeks 1–4', 'Weeks 5–6']);
    const warning = page.locator('#preview details');
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
    existingApp.once('dialog', confirmation => confirmation.accept());
    await existingApp.getByRole('button', { name: 'Start from scratch' }).click();
    await existingApp.getByRole('heading', { name: 'Welcome to Lift Heavy. Run Far.' }).waitFor();
    assert.equal(await existingApp.evaluate(() => JSON.parse(localStorage.getItem('lhrf_beta_v1118_clean'))?.sets?.length || 0), 0);
    await installed.setOffline(true);
    await existingApp.getByRole('button', { name: 'Running', exact: true }).click();
    await existingApp.getByLabel('Week one starts on').fill('2026-11-16');
    await existingApp.getByRole('button', { name: 'Preview programme' }).click();
    await existingApp.getByRole('button', { name: 'Get my programme' }).click();
    await existingApp.locator('#catalogueSetupDialog').waitFor({ state: 'hidden' });
    await existingApp.locator('nav [data-screen="plan"]').click();
    const nativeState = () => existingApp.evaluate(() => JSON.parse(localStorage.getItem('lhrf_beta_v1118_clean')));
    const running = await nativeState();
    assert.equal(running.onboardingComplete, true);
    assert.equal(running.reviewedProgramme.weeks[0].sessions[0].runs.length, 1);
    await existingApp.locator('#plan').getByRole('button', { name: 'Add strength training' }).click();
    await existingApp.getByLabel('Week one starts on').fill('2026-11-16');
    await existingApp.getByRole('button', { name: 'Preview programme' }).click();
    await existingApp.getByRole('button', { name: 'Get my programme' }).click();
    await existingApp.locator('#catalogueSetupDialog').waitFor({ state: 'hidden' });
    const hybrid = await nativeState();
    assert.equal(hybrid.customRoadmap.cataloguePlans.length, 2);
    assert.ok(hybrid.reviewedProgramme.weeks[0].sessions.some(s => s.ex.length > 0));
    assert.deepEqual(hybrid.reviewedProgramme.weeks[0].sessions.find(s => s.id === running.reviewedProgramme.weeks[0].sessions[0].id),
      running.reviewedProgramme.weeks[0].sessions[0]);
    assert.equal(existingApp.url(), appUrl);
    await installed.close();
    assert.deepEqual(errors, []);
    console.log('PASS: Pixel-size onboarding, block previews, paired calendar, exercise swaps, move/skip/repeat, Garmin, offline reload and log persistence.');
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
