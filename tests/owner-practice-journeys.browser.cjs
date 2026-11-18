const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium, devices } = require('playwright');

const root = path.resolve(process.env.OWNER_CANDIDATE_ROOT || 'native-owner-test-dist');
const key = 'lhrf_beta_v1118_clean';
const monday = '2026-11-16';
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png' };

async function standalone(context, origin) {
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date(monday + 'T09:00:00Z'));
  await page.goto(origin);
  await page.waitForFunction(() => navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.goto(origin + 'catalogue-preview/');
  await page.getByRole('button', { name: 'Running', exact: true }).click();
  await page.locator('#programme').selectOption('10k');
  await page.locator('#monday').fill(monday);
  await page.getByRole('button', { name: 'Preview programme' }).click();
  await page.getByRole('button', { name: 'Get my programme' }).click();
  await page.getByRole('button', { name: 'Calendar', exact: true }).click();
  const open = async (name) => {
    await page.locator('#calendar-body article').filter({ has: page.getByRole('heading', { name, exact: true }) })
      .first().getByRole('button', { name: /workout/ }).click();
    return page.getByRole('dialog');
  };
  const quality = await open('Quality run');
  assert.match(await quality.innerText(), /7 km total/);
  assert.equal(await quality.getByRole('button', { name: 'Download Garmin FIT' }).count(), 0);
  assert.equal(await quality.locator('input[type=file]').count(), 0);
  await quality.getByLabel('Actual distance (km)').fill('7');
  await quality.getByLabel('Actual minutes').fill('42');
  await page.reload();
  await page.getByRole('button', { name: 'Calendar', exact: true }).click();
  await open('Quality run');
  assert.equal(await quality.getByLabel('Actual minutes').inputValue(), '42');
  await quality.getByRole('button', { name: 'Save workout' }).click();
  await quality.waitFor({ state: 'hidden' });
  const long = await open('Easy long run');
  await long.getByLabel('New workout date').fill('2026-11-22');
  await long.getByRole('button', { name: 'Move workout' }).click();
  await open('Easy long run');
  assert.match(await long.innerText(), /Sun, 22 Nov 2026/);
  await long.getByRole('button', { name: 'Skip', exact: true }).click();
  await open('Easy long run');
  await long.getByRole('button', { name: 'Restore', exact: true }).click();
  await open('Easy long run');
  await long.getByLabel('New workout date').fill('2026-11-24');
  await long.getByRole('button', { name: 'Repeat on selected date' }).click();
  assert.match(await page.locator('#message').innerText(), /Repeat added/);
  await page.reload();
  await page.getByRole('button', { name: 'History', exact: true }).click();
  assert.equal(await page.locator('#history-body article').count(), 1);
  assert.match(await page.locator('#history-body').innerText(), /7 km · 42 min/);
  assert.equal(await page.evaluate(() => navigator.onLine), false);
  console.log('PASS standalone offline setup, draft, manual log, calendar changes and reload; FIT and file import unavailable');
}

async function native(context, origin) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.clock.install({ time: new Date(monday + 'T09:00:00Z') });
  await page.goto(origin);
  await page.getByRole('button', { name: 'Running', exact: true }).click();
  await page.locator('#native-catalogue-programme').selectOption('marathon-two-run-16');
  await page.getByLabel('First calendar week').fill(monday);
  await page.getByRole('button', { name: 'Preview programme', exact: true }).click();
  await page.getByRole('button', { name: 'Get my programme', exact: true }).click();
  await page.getByRole('button', { name: 'Go to programme', exact: true }).click();
  const saved = () => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), key);
  const before = await saved();
  const session = before.activeSchedule.find((candidate) => candidate.runs?.some((run) => run.distanceKnown === false));
  assert.ok(session, 'expected a scheduled timed run');
  await page.clock.setFixedTime(new Date(session.scheduledDate + 'T09:00:00Z'));
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller);
  await page.locator('nav [data-screen="today"]').click();
  await page.locator('.day-slide.is-current').getByRole('button', {
    name: 'Preview workout ' + session.name, exact: true,
  }).click();
  const preview = page.locator('#livePreview');
  await preview.waitFor();
  const buttons = await preview.getByRole('button', { name: /Garmin/ }).allTextContents();
  await page.locator('#previewStart').click();
  if (await page.locator('#readinessModal[open]').count()) await page.locator('#readinessContinue').click();
  await page.locator('#liveRunTools').click();
  await page.locator('#startCanonicalTimer').click();
  assert.match(await page.locator('#timerStep').innerText(), /Work|easy/i);
  await page.locator('#runToolsClose').click();
  await page.locator('#liveRunKm').fill('6.5');
  await page.locator('#liveRunMinutes').fill('45');
  await page.locator('#liveLogRun').click();
  await page.locator('#liveFinish').click();
  await page.locator('#finishAndSave').click();
  if (await page.locator('#liveFeedbackSkip').count()) await page.locator('#liveFeedbackSkip').click();
  const after = await saved();
  assert.equal(after.runs.length, 1);
  assert.equal(after.runs[0].km, 6.5);
  assert.equal(after.runs[0].min, 45);
  assert.equal(after.completedWorkouts.length, 1);
  assert.deepEqual(after.customRoadmap, before.customRoadmap);
  assert.deepEqual(after.reviewedProgramme, before.reviewedProgramme);
  await page.locator('nav [data-screen="settings"]').click();
  await page.locator('#settings.active').waitFor();
  const services = page.locator('#settingsServices');
  assert.equal(await services.count(), 1, 'settings services exist in the shared UI');
  assert.equal(await services.isVisible(), false, 'practice does not expose connected services');
  for (const id of ['sendIntervalsWorkout', 'garminImportOpen', 'activityFile', 'garminIncomingSave']) {
    assert.equal(await page.locator('#' + id).isVisible(), false, id);
  }
  await page.locator('nav [data-screen="progress"]').click();
  await page.locator('#weeklyRecovery > summary').click();
  assert.equal(await page.getByRole('button', { name: 'Save weekly check-in' }).isVisible(), true);
  assert.equal(await page.getByRole('button', { name: 'Pull recent Garmin runs' }).count(), 0);
  assert.deepEqual(await saved(), after);
  await context.setOffline(true);
  await page.reload();
  assert.deepEqual(await saved(), after);
  assert.deepEqual(errors, []);
  console.log('PASS native canonical run preview, timer, manual completion, unchanged programme, settings restrictions and offline reload');
  assert.deepEqual(buttons, [], 'native run preview must not offer disabled Garmin actions');
}

async function run() {
  const revision = (await fs.readFile(path.join(root, 'OWNER-TEST-REVISION.txt'), 'utf8')).split('\n')[0];
  assert.equal(revision, process.env.OWNER_SOURCE_SHA);
  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const file = path.resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
    if (!file.startsWith(root + path.sep)) return response.writeHead(404).end();
    try {
      response.setHeader('content-type', mime[path.extname(file)] || 'application/octet-stream');
      response.end(await fs.readFile(file));
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://localhost:' + server.address().port + '/';
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE || undefined, args: ['--no-sandbox'] });
    for (const journey of [standalone, native]) {
      const context = await browser.newContext({ ...devices['Pixel 7'], timezoneId: 'Europe/London' });
      context.setDefaultTimeout(6500);
      await context.route('**/*', (route) => new URL(route.request().url()).origin === new URL(origin).origin
        ? route.continue() : route.abort());
      try {
        await journey(context, origin);
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser?.close();
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
