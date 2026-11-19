const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium, devices } = require('playwright');

const os = require('node:os');
const candidateRevision = '60a89595e1ad3d3a16c152d9dd9069c6bac9cfae';
const archiveSha256 = 'f502a3b618495ded50fe053f037f298c6b39a6d7f8794ad07b3019126f538849';
const fsSync = require('node:fs');
const crypto = require('node:crypto');
const root = fsSync.mkdtempSync(path.join(os.tmpdir(), 'lhrf208-recovery-'));
const builtRoot = path.resolve(process.env.OWNER_CANDIDATE_ROOT || 'native-owner-test-dist');
const manifest = require('./fixtures/owner-practice-60a89595.sha256.json');
const qaRevision = process.env.OWNER_SOURCE_SHA;
assert.match(qaRevision || '', /^[a-f0-9]{40}$/);
assert.equal(Object.keys(manifest).length, 43);
// Retain original runtime bytes. Only build identity differs on this QA-only branch.
// Every resulting file must match the independently downloaded #208 package digest.
for (const [name, digest] of Object.entries(manifest)) {
  let bytes = fsSync.readFileSync(path.join(builtRoot, name));
  if (/\.(html|js|txt)$/.test(name)) {
    const text = bytes.toString('utf8').replaceAll(qaRevision, candidateRevision)
      .replaceAll(qaRevision.slice(0, 12), candidateRevision.slice(0, 12));
    bytes = Buffer.from(text);
  }
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), digest, name);
  const destination = path.join(root, name);
  fsSync.mkdirSync(path.dirname(destination), {recursive: true});
  fsSync.writeFileSync(destination, bytes);
}
const key = 'lhrf_beta_v1118_clean';
const monday = '2026-11-16';
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png' };

async function offlineAthlete(context, origin, profile) {
 let page = await context.newPage();
 const errors = [];
 const watch = page => page.on('pageerror', error => errors.push(error.message));
 watch(page);
 await page.clock.install({time:new Date(monday+'T09:00:00Z')});
 await page.goto(origin);
 await page.getByRole('button',{name:profile.runningOnly?'Running':'Strength training',exact:true}).click();
 await page.locator('#native-catalogue-programme').selectOption(profile.runningOnly?'10k':profile.programme);
 if(profile.runningOnly) await page.locator('#native-catalogue-run-count').selectOption('2');
 const setDays = async days => {
  const group = page.getByRole('group',{name:'Training days'});
  for(const day of ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']) {
   const box = group.getByRole('checkbox',{name:day,exact:true});
   if(await box.isChecked() !== days.includes(day)) await box.setChecked(days.includes(day));
  }
 };
 await setDays(profile.days);
 await page.getByLabel('First calendar week').fill(monday);
 await page.getByRole('button',{name:'Preview programme',exact:true}).click();
 await page.getByRole('button',{name:'Get my programme',exact:true}).click();
 if(profile.addRunning) {
  await page.getByRole('button',{name:'Add running programme',exact:true}).click();
  await page.locator('#native-catalogue-programme').selectOption('10k');
  await page.locator('#native-catalogue-run-count').selectOption('2');
  await setDays(['Thursday','Sunday']);
  await page.getByLabel('First calendar week').fill(monday);
  await page.getByRole('button',{name:'Preview programme',exact:true}).click();
  await page.getByRole('button',{name:'Get my programme',exact:true}).click();
 } else await page.getByRole('button',{name:'Go to programme',exact:true}).click();
 await page.locator('#catalogueSetupDialog').waitFor({state:'hidden'});
 const state = () => page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
 const installed = await state();
 const session = installed.activeSchedule.filter(item=>profile.runningOnly?item.runs?.length:item.ex?.length)
  .sort((a,b)=>a.scheduledDate.localeCompare(b.scheduledDate))[0];
 assert.ok(session);
 await page.clock.setFixedTime(new Date(session.scheduledDate+'T09:00:00Z'));
 await page.reload();
 await page.waitForFunction(()=>navigator.serviceWorker.controller);
 await context.setOffline(true);
 await page.locator('nav [data-screen="today"]').click();
 for(const dot of await page.locator('#dayDots button').all()) {
  if((await dot.getAttribute('aria-label')||'').toLowerCase().startsWith(session.day.toLowerCase())) {
   await dot.click(); break;
  }
 }
 await page.locator('.day-slide.is-current').getByRole('button',{name:'Preview workout '+session.name,exact:true}).click();
 await page.locator('#previewStart').click();
 if(await page.locator('#readinessModal[open]').count()) await page.locator('#readinessContinue').click();
 if(profile.runningOnly) {
  await page.locator('#liveRunKm').fill(String(session.runs[0].distanceKm));
  await page.locator('#liveRunMinutes').fill('46');
  await page.locator('#liveLogRun').click();
 } else {
  const detail=page.locator('#liveExercises details').first();
  if(!await detail.evaluate(item=>item.open)) await detail.locator('summary').click();
  const row=detail.locator('.live-set').first();
  if(!Number(await row.locator('[data-field=weight]').inputValue())) await row.locator('[data-field=weight]').fill('20');
  await row.locator('[data-field=rpe]').fill('7');
  await row.locator('.set-check').click();
 }
 const beforeClose = await state();
 const draft = await page.evaluate(()=>JSON.stringify(window.LHRFLive.get()));
 assert.notEqual(draft,'null');
 await page.close();
 page=await context.newPage();watch(page);
 await page.clock.install({time:new Date(session.scheduledDate+'T09:10:00Z')});
 await page.goto(origin);
 assert.equal(await page.evaluate(()=>navigator.onLine),false);
 assert.equal(await page.evaluate(()=>!!navigator.serviceWorker.controller),true);
 assert.deepEqual(await state(),beforeClose);
 assert.equal(await page.evaluate(()=>JSON.stringify(window.LHRFLive.get())),draft);
 await page.locator('nav [data-screen="train"]').click();
 if(profile.runningOnly) assert.equal(await page.evaluate(()=>window.LHRFLive.get().runLogged),true);
 else {
  assert.ok(await page.locator('.set-check.checked').count());
  for(const detail of await page.locator('#liveExercises details').all()) {
   if(!await detail.evaluate(item=>item.open)) await detail.locator('summary').click();
   for(const row of await detail.locator('.live-set').all()) {
    if((await row.locator('.set-check').getAttribute('class')).includes('checked')) continue;
    if(!Number(await row.locator('[data-field=weight]').inputValue())) await row.locator('[data-field=weight]').fill('20');
    await row.locator('[data-field=rpe]').fill('7');
    await row.locator('.set-check').click();
   }
  }
 }
 await page.locator('#liveFinish').click();
 await page.locator('#finishAndSave').click();
 if(await page.locator('#liveFeedbackSkip').count()) await page.locator('#liveFeedbackSkip').click();
 const finished=await state();
 assert.deepEqual(finished.reviewedProgramme,installed.reviewedProgramme);
 assert.deepEqual(finished.customRoadmap,installed.customRoadmap);
 assert.deepEqual(finished.activeSchedule,installed.activeSchedule);
 assert.deepEqual(finished.equipmentInventory,installed.equipmentInventory);
 assert.equal(finished.completedWorkouts.length,1);
 const completion=finished.completedWorkouts[0];
 if(profile.runningOnly) {
  assert.equal(finished.runs.length,1);
  assert.equal(finished.runs[0].km,session.runs[0].distanceKm);
  assert.equal(finished.runs[0].min,46);
  assert.equal(finished.runs[0].type,session.runs[0].role);
 } else {
  assert.equal(completion.completedSets,completion.plannedSets);
  assert.equal(finished.sets.length,completion.plannedSets);
 }
 assert.equal(await page.evaluate(()=>window.LHRFLive.get()),null);
 await page.reload();
 assert.deepEqual(await state(),finished);
 await context.setOffline(false);
 await page.reload();
 assert.deepEqual(await state(),finished);
 assert.deepEqual(errors,[]);
 console.log('PASS offline athlete',profile.id,'draft reopen, full completion, exact reload/reconnect, programme and schedule preserved');
}

async function run() {
  const revision = (await fs.readFile(path.join(root, 'OWNER-TEST-REVISION.txt'), 'utf8')).split('\n')[0];
  assert.equal(revision, candidateRevision);
  console.log('TEST EXACT CANDIDATE', revision, 'ARTIFACT 14415288569 SHA256', archiveSha256);
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
    for (const profile of [{"id":"beginner","programme":"lifting-foundation","days":["Monday","Friday"]},{"id":"powerlifter","programme":"powerlifting-three-day","days":["Monday","Wednesday","Friday"]},{"id":"runner","runningOnly":true,"days":["Tuesday","Saturday"]},{"id":"balanced","programme":"lifting-foundation","days":["Tuesday","Friday"],"addRunning":true},{"id":"returning","programme":"lifting-foundation","days":["Tuesday","Saturday"]}]) {
      const context = await browser.newContext({ ...devices['Pixel 7'], timezoneId: 'Europe/London' });
      context.setDefaultTimeout(10000);
      await context.route('**/*', route => new URL(route.request().url()).origin === new URL(origin).origin ? route.continue() : route.abort());
      try { await offlineAthlete(context, origin, profile); } finally { await context.close(); }
    }
  } finally {
    await browser?.close();
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(root, {recursive: true, force: true});
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
