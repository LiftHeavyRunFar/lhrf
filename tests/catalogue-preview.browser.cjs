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
      const file = resolve(root, '.' + (path.endsWith('/') ? path + 'index.html' : path));
      if (!file.startsWith(root + sep)) throw new Error('Invalid file');
      const bytes = await readFile(file);
      response.setHeader('content-type', mime[extname(file)] ?? 'application/octet-stream');
      response.end(bytes);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = 'http://127.0.0.1:' + server.address().port + '/catalogue-preview/';
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
      await page.getByRole('button', { name: 'Catalogue', exact: true }).click();
      await page.locator('#programme').selectOption(id);
      await page.locator('#monday').fill(date);
      if (fill) await fill();
      await page.getByRole('button', { name: 'Preview programme' }).click();
      await page.locator('#preview').waitFor({ state: 'visible' });
    };
    const approve = async () => {
      await page.getByLabel('I’ve reviewed the sessions and the dates.').check();
      await page.getByRole('button', { name: 'Approve and add to calendar' }).click();
      assert.match(await status().innerText(), /Programme added/);
    };
    const open = async name => {
      const card = page.locator('#calendar-body article').filter({ has: page.getByRole('heading', { name, exact: true }) }).first();
      await card.getByRole('button', { name: /workout/ }).click();
      await dialog.waitFor();
    };
    await page.goto(url);
    await page.waitForFunction(() => document.querySelector('#offline')?.textContent === 'Offline ready');
    assert.equal(await page.locator('#programme option').count(), 12);
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
    assert.equal(await page.locator('#preview .week').count(), 12);
    const strength = await page.locator('#preview .week').first().innerText();
    assert.match(strength, /Competition squat · 4 × 5 · start 100 kg/);
    assert.match(strength, /Spoto press · 3 × 5/);
    assert.match(strength, /Safety squat bar squat · 3 × 5/);
    assert.match(strength, /Paused deadlift · 2 × 4/);
    assert.match(await page.locator('#preview').innerText(), /does not include stable low deficit platform/);
    assert.match(strength, /Cable pressdown/);
    await page.locator('#preview .week').nth(4).locator('summary').click();
    assert.match(await page.locator('#preview .week').nth(4).innerText(), /Long-pause bench/);
    await approve();

    await enrol('10k-two-run', '2026-11-16', async () => {
      await page.getByLabel('Recent 10K time in minutes · optional').fill('55');
    });
    assert.equal(await page.locator('#preview .week').count(), 6);
    assert.match(await page.locator('#preview').innerText(), /lower-body and run pairings to review/);
    assert.match(await page.locator('#preview .week').first().innerText(), /7 km total/);
    await approve();
    assert.match(await page.locator('#calendar-body').innerText(), /Deadlift and support/);
    assert.match(await page.locator('#calendar-body').innerText(), /Easy long run/);
    await open('Squat and support');
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
    assert.deepEqual(errors, []);
    console.log('PASS: Pixel-size browser, 12 prescriptions, exercise swap, paired calendar, move/skip/repeat, FIT export, TCX import, offline reload, draft and history persistence.');
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
