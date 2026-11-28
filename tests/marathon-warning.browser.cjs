const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE, args:['--no-sandbox']});
  try {
    for (const zone of ['Europe/London', 'America/Los_Angeles', 'Pacific/Auckland']) {
      const context = await browser.newContext({timezoneId:zone, serviceWorkers:'block'});
      const page = await context.newPage();
      await page.route('https://isolated.test/**', route => {
        const pathname = new URL(route.request().url()).pathname;
        const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
        if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return route.fulfill({status:404});
        return route.fulfill({body:fs.readFileSync(file), contentType:file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html'});
      });
      await page.goto('https://isolated.test/');
      await page.getByRole('button',{name:'Running',exact:true}).click();
      await page.locator('#native-catalogue-programme').selectOption('marathon-two-run');
      assert.equal(await page.getByText('Add a recent race time (optional)',{exact:true}).count(),0);
      await page.getByLabel('First calendar week').fill('2026-11-16');
      await page.getByRole('button',{name:'Preview programme',exact:true}).click();
      const preview = await page.locator('#native-catalogue-preview').innerText();
      assert.match(preview,/Template marathon: Sun, 2 May 2027 \(week 24\)/);
      assert.match(preview,/dates are not automatically aligned/);
      assert.match(preview,/does not assess suitability/);
      assert.match(preview,/event is sooner, the full 24-week plan will not fit/);
      await page.getByRole('button',{name:'Edit setup',exact:true}).click();
      await page.getByLabel('Final week event day').selectOption('0');
      await page.getByRole('button',{name:'Preview programme',exact:true}).click();
      assert.match(await page.locator('#native-catalogue-message').innerText(), /event day after the last training session/i);
      await page.getByLabel('Final week event day').selectOption('5');
      await page.getByRole('button',{name:'Preview programme',exact:true}).click();
      assert.match(await page.locator('#native-catalogue-preview').innerText(),/Template marathon: Sat, 1 May 2027 \(week 24\)/);
      await page.getByRole('button',{name:'Get my programme',exact:true}).click();
      await page.getByRole('button',{name:'Go to programme'}).click();
      const state = await page.evaluate(()=>JSON.parse(localStorage.getItem('lhrf_beta_v1118_clean')));
      assert.equal(state.reviewedProgramme.weeks.length,24);
      assert.equal(state.reviewedProgramme.weeks[23].sessions.find(s=>s.runs?.some(r=>r.role==='race')).scheduledDate,'2027-05-01');
      assert.equal(state.reviewedProgramme.weeks[15].sessions.find(s=>s.runs?.some(r=>r.role==='long-run')).runs[0].minutes,100);
      console.log('PASS',zone,'default + Saturday template dates and invalid Monday rejection, advisory, persisted unchanged 24-week schedule');
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
