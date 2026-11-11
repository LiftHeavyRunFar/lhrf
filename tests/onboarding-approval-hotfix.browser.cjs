// Reproduce the reported 20-week setup in a fresh Pixel-sized browser profile.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {observeOnboardingProposal, onboardingProposal} = require('./onboarding-browser-proposal.cjs');

const root = path.join(__dirname, '..');
const key = 'lhrf_beta_v1118_clean';
const media = {'.js':'application/javascript','.css':'text/css','.png':'image/png',
  '.svg':'image/svg+xml','.ttf':'font/ttf','.webmanifest':'application/manifest+json','.json':'application/json'};
const screenshotDir = process.env.LHRF_QA_SCREENSHOTS;
const baseline = process.env.LHRF_QA_BASE;
const timing = {Squat:22, Bench:22, Deadlift:24};
const pixel = {viewport:{width:393,height:852},isMobile:true,hasTouch:true,timezoneId:'Europe/London',serviceWorkers:'block'};
const loc = (page, id) => page.locator('#' + id);
const read = page => page.evaluate(key => localStorage.getItem(key), key);

async function screenshot(page, name) {
  if (!screenshotDir) return;
  fs.mkdirSync(screenshotDir, {recursive:true});
  await page.screenshot({path:path.join(screenshotDir, name + '.png')});
}

async function fillMeet(page) {
  const next = loc(page,'frNext');
  await loc(page,'frScope').selectOption('hybrid');
  await page.locator('[name=frFocus][value=balanced]').check();
  await next.tap();
  await loc(page,'frGoal').selectOption('powerlifting');
  await loc(page,'frExperience').selectOption('intermediate');
  await loc(page,'frStrengthDate').fill('2027-03-21');
  if (await loc(page,'frStrengthEventConfirmed').count()) await loc(page,'frStrengthEventConfirmed').check();
  await next.tap();
  for (const day of ['Mon','Tue','Thu','Sat']) await page.locator('.fr-day[value='+day+']').check();
  await page.locator('.fr-day[value=Sun]').uncheck();
  await page.locator('.fr-double[value=Tue]').check();
  for (const [lift, days] of Object.entries(timing)) {
    await loc(page,'frFinalHeavy'+lift+'Mode').selectOption('days');
    await loc(page,'frFinalHeavy'+lift+'Days').fill(String(days));
  }
  await next.tap();
  for (const [lift, kg] of Object.entries({Squat:140,Bench:105,Deadlift:165})) {
    await loc(page,'frMax'+lift).fill(String(kg));
  }
  if (await loc(page,'frFatigueStatus').count()) await loc(page,'frFatigueStatus').selectOption('normal');
  await next.tap();
}

(async () => {
  const server = http.createServer((req, res) => {
    const name = new URL(req.url, 'http://localhost').pathname;
    const old = baseline && name.startsWith('/baseline/');
    const route = old ? name.slice('/baseline'.length) : name;
    const file = path.join(old ? baseline : root, route === '/' ? 'index.html' : route);
    try {
      const body = fs.readFileSync(file);
      res.writeHead(200, {'Content-Type':media[path.extname(file)] || 'text/html', 'Cache-Control':'no-store'});
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://localhost:' + server.address().port + '/';
  let browser;
  try {
    browser = await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE || undefined,
      args:['--no-sandbox','--disable-dev-shm-usage']});
    if (baseline && screenshotDir) {
      const previous = await browser.newContext(pixel);
      const before = await previous.newPage();
      await before.clock.install({time:new Date('2026-11-08T10:00:00Z')});
      await before.goto(origin+'baseline/');
      await fillMeet(before);
      assert.match(await loc(before,'frSummary').innerText(), /20.week/i);
      assert.equal(await loc(before,'frNext').isDisabled(), true);
      await screenshot(before, 'before-review');
      await previous.close();
    }
    const context = await browser.newContext(pixel);
    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.clock.install({time:new Date('2026-11-08T10:00:00Z')});
    await page.goto(origin + '?setup=custom');
    await observeOnboardingProposal(page);
    await fillMeet(page);
    const next = loc(page,'frNext');
    assert.match(await loc(page,'frSummary').innerText(), /20.week/i);
    const blocked = await onboardingProposal(page);
    assert.equal(blocked.weeks.length, 20);
    assert.equal(blocked.weeks[0].sessions.length, 0, 'Opening Sunday is unavailable');
    assert.ok(blocked.weeks[1].sessions.length > 0);
    for (const [lift, daysOut] of Object.entries(timing)) {
      assert.deepEqual(blocked.config.finalHeavyPreferences[lift], {mode:'athlete', daysOut});
      assert.equal(blocked.finalHeavyPlan[lift].kind, 'none');
      assert.match(blocked.finalHeavyPlan[lift].reason, /within three weeks|taper/i);
    }
    assert.equal(await loc(page,'frWarnings').isVisible(), true);
    assert.match(await loc(page,'frWarnings').innerText(), /coach timing|single|recovery/i);
    assert.match(await loc(page,'frFinalHeavyPreview').innerText(), /requested timing unavailable|within three weeks/i);
    assert.equal(await loc(page,'frReviewEdits').evaluate(el => el.open), false);
    assert.equal(await page.locator('#firstRun').getByText('Explore weekly sessions',{exact:true}).isVisible(), false);
    assert.equal(await page.locator('#firstRun').getByText('Weekly volume figures',{exact:true}).isVisible(), false);
    assert.equal(await page.locator('#firstRun').evaluate(el => el.scrollWidth <= el.clientWidth), true);
    await screenshot(page, 'after-blocked-review');

    // The focusable unavailable action keeps the reason accessible and writes no programme.
    await next.press('Enter');
    assert.equal(await loc(page,'frReviewStatus').evaluate(el => el === document.activeElement), true);
    assert.equal(await loc(page,'firstRun').isVisible(), true);
    assert.equal(JSON.parse(await read(page))?.onboardingComplete === true, false);
    await loc(page,'frUseCoachTiming').tap();
    const reviewed = await onboardingProposal(page);
    for (const lift of Object.keys(timing)) {
      assert.equal(reviewed.config.finalHeavyPreferences[lift].mode, 'coach');
      assert.notEqual(reviewed.finalHeavyPlan[lift].kind, 'single');
    }
    assert.ok(reviewed.weeks.every(week => week.feasible));
    assert.equal(await next.isEnabled(), true);
    assert.match(await next.innerText(), /Start my programme/i);
    await page.locator('#firstRun').evaluate(el => {el.scrollTop=0;});
    await screenshot(page, 'after-ready-review');

    // A failed storage write stays on review and exposes an actionable retry.
    await page.evaluate(key => {
      const setItem = Storage.prototype.setItem;
      window.restoreTestStorage = () => {Storage.prototype.setItem = setItem;};
      Storage.prototype.setItem = function(name, value) {
        if (name === key) throw new DOMException('Storage limit reached', 'QuotaExceededError');
        return setItem.call(this, name, value);
      };
    }, key);
    await next.tap();
    assert.equal(await loc(page,'frApprovalError').isVisible(), true);
    assert.match(await loc(page,'frApprovalError').innerText(), /storage|save|space/i);
    assert.equal(JSON.parse(await read(page))?.onboardingComplete === true, false);
    await page.evaluate(() => window.restoreTestStorage());
    await next.tap();
    assert.equal(await loc(page,'firstRun').isVisible(), false, await loc(page,'frError').textContent());
    const saved = await read(page);
    const installed = JSON.parse(saved);
    assert.equal(installed.onboardingComplete, true);
    assert.equal(installed.activeCustomWeek, 2);
    assert.ok(installed.activeSchedule.some(s => s.ex?.length));
    const runs = reviewed.weeks[1].sessions.flatMap(s => s.runs || []);
    assert.ok(runs.length > 0 && runs.every(run => run.distanceKnown === false));
    const minutes = runs.reduce((sum, run) => sum + run.minutes, 0);

    await page.reload();
    assert.equal(await loc(page,'firstRun').isVisible(), false);
    assert.equal(await read(page), saved);
    await page.locator('nav [data-screen=plan]').tap();
    await page.locator('#planAdvancedDetails > summary').tap();
    assert.match(await loc(page,'planRunningVolume').innerText(), new RegExp('Week 2 · '+minutes+' min by effort'));
    assert.doesNotMatch(await loc(page,'planRunningVolume').innerText(), /\b0(?:\.0+)? km\b/);

    const mixedVolume = await page.evaluate(() => plannedRunningVolume([
      {runs:[{distanceKm:5, minutes:32}]},
      {runs:[{distanceKm:0, distanceKnown:false, minutes:20}]}
    ]));
    assert.equal(mixedVolume, '5.0 km + 20 min by effort');

    const firstStrength = installed.activeSchedule.find(session => session.ex?.length);
    await page.clock.setFixedTime(new Date('2026-11-09T10:00:00Z'));
    await page.reload();
    await page.locator('nav [data-screen=today]').tap();
    await page.locator('[data-session-id="'+firstStrength.id+'"]:visible').first().tap();
    await loc(page,'previewStart').tap();
    if (await loc(page,'readinessModal').isVisible()) await loc(page,'readinessContinue').tap();
    assert.equal(await loc(page,'liveTrainRoot').isVisible(), true);
    assert.equal(await page.getByRole('button',{name:'Finish workout',exact:true}).isVisible(), true);
    assert.deepEqual(errors, []);
    await context.close();
    console.log('PASS 20-week Pixel onboarding: requests preserved, safe blocked review, coach remedy, opening-week approval, reopen, actual running minutes and first workout');
  } finally {
    if (browser) await browser.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {console.error(error);process.exitCode=1;});
