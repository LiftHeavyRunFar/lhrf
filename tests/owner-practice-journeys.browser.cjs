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
      .replaceAll(qaRevision.slice(0, 12), candidateRevision.slice(0, 12))
      .replaceAll(qaRevision.slice(0, 8), candidateRevision.slice(0, 8));
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

async function checkpointReady(page) {
 await page.waitForFunction(() => window.LHRFDurableCheckpoint?.initialised ||
  ['failed','conflict'].includes(window.LHRFDurableCheckpoint?.state));
 const state = await page.evaluate(() => window.LHRFDurableCheckpoint.state);
 assert.ok(!['failed','conflict'].includes(state), 'checkpoint startup: ' + await page.locator('#durableCheckpointStatus').innerText());
 await page.evaluate(() => window.LHRFDurableCheckpoint.whenSaved());
}

async function offlineAthlete(context, origin, profile, restartBrowser = null, abrupt = false) {
 let page = await context.newPage();
 const errors = [];
 const watch = page => page.on('pageerror', error => errors.push(error.message));
 watch(page);
 await page.clock.install({time:new Date(monday+'T09:00:00Z')});
 await page.goto(origin); await checkpointReady(page);
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
 if (abrupt && profile.established) {
  const baselineRaw = await page.evaluate(key => localStorage.getItem(key), key);
  // Establish a previously persisted profile before the new, unflushed offline edit.
  await context.close();
  context = await restartBrowser('baseline');
  page = await context.newPage(); watch(page);
  await page.clock.install({time:new Date(monday+'T09:00:00Z')});
  await page.goto(origin); await checkpointReady(page);
  assert.equal(await page.evaluate(key => localStorage.getItem(key), key), baselineRaw);
  console.log('VERIFIED established disk baseline', profile.id,
   crypto.createHash('sha256').update(baselineRaw).digest('hex'));
 }
 await page.clock.setFixedTime(new Date(session.scheduledDate+'T09:00:00Z'));
 await page.reload(); await checkpointReady(page);
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
 await page.evaluate(() => window.LHRFDurableCheckpoint.whenSaved());
 console.log('ACK durable checkpoint', profile.id);
 const rawBeforeClose = await page.evaluate(key => localStorage.getItem(key), key);
 const beforeClose = await state();
 const draft = await page.evaluate(()=>JSON.stringify(window.LHRFLive.get()));
 assert.notEqual(draft,'null');
 if (restartBrowser) {
  if (!abrupt) await context.close();
  context = await restartBrowser();
 } else await page.close();
 page=await context.newPage();watch(page);
 await page.clock.install({time:new Date(session.scheduledDate+'T09:10:00Z')});
 await page.goto(origin); await checkpointReady(page);
 assert.equal(await page.evaluate(()=>navigator.onLine),false);
 assert.equal(await page.evaluate(()=>!!navigator.serviceWorker.controller),true);
 const recoveredRaw = await page.evaluate(key => localStorage.getItem(key), key);
 const recoveredDraft = await page.evaluate(()=>JSON.stringify(window.LHRFLive.get()));
 console.log('RECOVERY readback', profile.id, JSON.stringify({
  mainPresent:recoveredRaw !== null, draftPresent:recoveredDraft !== 'null',
  mainExact:recoveredRaw === rawBeforeClose, draftExact:recoveredDraft === draft,
  expectedMainBytes:Buffer.byteLength(rawBeforeClose),
  actualMainBytes:recoveredRaw === null ? 0 : Buffer.byteLength(recoveredRaw),
 }));
 assert.ok(recoveredRaw === rawBeforeClose, 'main training state must match its pre-kill bytes');
 assert.deepEqual(await state(),beforeClose);
 assert.ok(recoveredDraft === draft, 'unfinished draft must match its pre-kill bytes');
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
 await page.evaluate(() => window.LHRFDurableCheckpoint.whenSaved());
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
 await page.reload(); await checkpointReady(page);
 assert.deepEqual(await state(),finished);
 await context.setOffline(false);
 await page.reload(); await checkpointReady(page);
 assert.deepEqual(await state(),finished);
 assert.deepEqual(errors,[]);
 console.log('PASS offline athlete',profile.id,'draft reopen, full completion, exact reload/reconnect, programme and schedule preserved');
 if(profile.addRunning) await offlineRunAfterStrength(context, origin, page, finished, errors);
}


async function offlineRunAfterStrength(context, origin, page, strengthState, errors) {
 const runSession = strengthState.activeSchedule.filter(session=>session.runs?.length)
  .sort((a,b)=>a.scheduledDate.localeCompare(b.scheduledDate))[0];
 assert.ok(runSession, 'balanced athlete retains a scheduled run');
 assert.ok(strengthState.sets.length > 0, 'strength records exist before the run');
 const read = () => page.evaluate(key=>JSON.parse(localStorage.getItem(key)), key);
 await page.clock.setFixedTime(new Date(runSession.scheduledDate+'T09:00:00Z'));
 await context.setOffline(true);
 await page.reload(); await checkpointReady(page);
 assert.equal(await page.evaluate(()=>navigator.onLine), false);
 await page.locator('nav [data-screen="today"]').click();
 for(const dot of await page.locator('#dayDots button').all()) {
  if((await dot.getAttribute('aria-label')||'').toLowerCase().startsWith(runSession.day.toLowerCase())) {
   await dot.click(); break;
  }
 }
 await page.locator('.day-slide.is-current').getByRole('button', {
  name:'Preview workout '+runSession.name, exact:true,
 }).click();
 await page.locator('#previewStart').click();
 if(await page.locator('#readinessModal[open]').count()) await page.locator('#readinessContinue').click();
 await page.locator('#liveRunKm').fill(String(runSession.runs[0].distanceKm));
 await page.locator('#liveRunMinutes').fill('46');
 await page.locator('#liveLogRun').click();
 const pendingState = await read();
 const pendingDraft = await page.evaluate(()=>JSON.stringify(window.LHRFLive.get()));
 assert.equal(await page.evaluate(()=>window.LHRFLive.get().runLogged), true);
 await page.close();
 page = await context.newPage();
 page.on('pageerror', error=>errors.push(error.message));
 await page.clock.install({time:new Date(runSession.scheduledDate+'T09:10:00Z')});
 await page.goto(origin); await checkpointReady(page);
 assert.equal(await page.evaluate(()=>navigator.onLine), false);
 assert.equal(await page.evaluate(()=>!!navigator.serviceWorker.controller), true);
 assert.deepEqual(await read(), pendingState);
 assert.equal(await page.evaluate(()=>JSON.stringify(window.LHRFLive.get())), pendingDraft);
 await page.locator('nav [data-screen="train"]').click();
 await page.locator('#liveFinish').click();
 await page.locator('#finishAndSave').click();
 if(await page.locator('#liveFeedbackSkip').count()) await page.locator('#liveFeedbackSkip').click();
 const completed = await read();
 assert.deepEqual(completed.completedWorkouts.slice(0,-1), strengthState.completedWorkouts);
 assert.equal(completed.completedWorkouts.length, strengthState.completedWorkouts.length+1);
 assert.deepEqual(completed.sets, strengthState.sets);
 assert.deepEqual(completed.runs.slice(0,-1), strengthState.runs || []);
 assert.equal(completed.runs.length, (strengthState.runs || []).length+1);
 const run = completed.runs.at(-1);
 assert.equal(run.sessionId, runSession.id);
 assert.equal(run.km, runSession.runs[0].distanceKm);
 assert.equal(run.min, 46);
 assert.equal(run.type, runSession.runs[0].role);
 assert.equal(completed.completedWorkouts.filter(item=>item.id===runSession.id).length, 1);
 assert.deepEqual(completed.reviewedProgramme, strengthState.reviewedProgramme);
 assert.deepEqual(completed.customRoadmap, strengthState.customRoadmap);
 assert.deepEqual(completed.activeSchedule, strengthState.activeSchedule);
 assert.deepEqual(completed.equipmentInventory, strengthState.equipmentInventory);
 assert.equal(await page.evaluate(()=>window.LHRFLive.get()), null);
 await page.reload(); await checkpointReady(page);
 assert.deepEqual(await read(), completed);
 await context.setOffline(false);
 await page.reload(); await checkpointReady(page);
 assert.deepEqual(await read(), completed);
 assert.deepEqual(errors, []);
 console.log('PASS balanced second-discipline run offline draft reopen/completion/reconnect preserves exact earlier strength records and both plans');
}


async function killIsolatedBrowser(context, directory) {
 const processes = [];
 for (const entry of await fs.readdir('/proc')) {
  if (!/^\d+$/.test(entry)) continue;
  try {
   const args = (await fs.readFile('/proc/' + entry + '/cmdline', 'utf8')).split('\0');
   const status = await fs.readFile('/proc/' + entry + '/status', 'utf8');
   processes.push({pid:Number(entry), parent:Number(status.match(/^PPid:\s+(\d+)/m)[1]), args});
  } catch (error) {
   if (!['ENOENT', 'ESRCH', 'EACCES'].includes(error.code)) throw error;
  }
 }
 const roots = processes.filter(item => item.args.includes('--user-data-dir=' + directory) &&
  !item.args.some(argument => argument.startsWith('--type=')));
 assert.equal(roots.length, 1, 'exactly one Chromium main process owns the isolated profile');
 const main = roots[0];
 assert.equal(main.parent, process.pid, 'kill only the browser launched by this test runner');
 const descendants = [main.pid];
 for (let index = 0; index < descendants.length; index += 1) {
  descendants.push(...processes.filter(item => item.parent === descendants[index]).map(item => item.pid));
 }
 const closed = context.waitForEvent('close', {timeout:10000});
 process.kill(main.pid, 'SIGKILL');
 for (const pid of descendants.slice(1)) {
  try { process.kill(pid, 'SIGKILL'); }
  catch (error) { if (error.code !== 'ESRCH') throw error; }
 }
 await closed;
 // Playwright must reap the killed main process before this profile is reopened.
 for (let attempt = 0; attempt < 100 && fsSync.existsSync('/proc/' + main.pid); attempt += 1) {
  await new Promise(resolve => setTimeout(resolve, 20));
 }
 assert.equal(fsSync.existsSync('/proc/' + main.pid), false, 'killed browser main process exited');
 console.log('VERIFIED abrupt SIGKILL', JSON.stringify({pid:main.pid, processCount:descendants.length}));
 return main.pid;
}

async function checkpointControls(context, origin) {
 const page = context.pages().find(item => item.url().startsWith(origin));
 assert.ok(page);
 const before = await page.evaluate(key => localStorage.getItem(key), key);
 await page.evaluate(() => {
  const original = IDBDatabase.prototype.transaction;
  window.restoreCheckpointTransactions = () => { IDBDatabase.prototype.transaction = original; };
  let abort = true;
  IDBDatabase.prototype.transaction = function (...arguments_) {
   const transaction = original.apply(this, arguments_);
   if (this.name === 'lhrf-owner-durable-checkpoint-v1' && arguments_[1] === 'readwrite' && abort) {
    abort = false;
    queueMicrotask(() => transaction.abort());
   }
   return transaction;
  };
  localStorage.setItem('lhrf_fictional_checkpoint_probe', 'retry-candidate');
 });
 await page.waitForFunction(() => window.LHRFDurableCheckpoint.state === 'failed');
 const failed = await page.evaluate(() => window.LHRFDurableCheckpoint.copies());
 assert.equal(failed.local.lhrf_fictional_checkpoint_probe, 'retry-candidate');
 assert.equal(failed.durable.snapshots[0].values.lhrf_fictional_checkpoint_probe, undefined);
 await page.evaluate(async () => {
  window.restoreCheckpointTransactions();
  await window.LHRFDurableCheckpoint.retry();
 });
 assert.equal(await page.evaluate(() => window.LHRFDurableCheckpoint.copies()
  .durable.snapshots[0].values.lhrf_fictional_checkpoint_probe), 'retry-candidate');
 await page.evaluate(async () => {
  localStorage.removeItem('lhrf_fictional_checkpoint_probe');
  await window.LHRFDurableCheckpoint.whenSaved();
 });
 assert.equal(await page.evaluate(key => localStorage.getItem(key), key), before);
 console.log('PASS checkpoint abort holds acknowledgement, retains both copies and retries without changing training records');
 const second = await context.newPage();
 await second.goto(origin);
 await second.waitForFunction(() => window.LHRFDurableCheckpoint?.state === 'failed');
 assert.match(await second.locator('#durableCheckpointStatus').innerText(), /Another checkpoint writer/);
 await second.close();
 assert.equal(await page.evaluate(key => localStorage.getItem(key), key), before);
 console.log('PASS second cooperative checkpoint writer is refused without changing the active records');
}

async function abruptRecovery(origin, profile) {
 const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'lhrf208-abrupt-'));
 let activeContext;
 let launches = 0;
 let killedPid;
 const launch = async offline => {
  activeContext = await chromium.launchPersistentContext(directory, {
   ...devices['Pixel 7'], timezoneId:'Europe/London',
   executablePath:process.env.CHROMIUM_EXECUTABLE || undefined,
   args:['--no-sandbox'],
  });
  launches += 1;
  activeContext.setDefaultTimeout(10000);
  await activeContext.route('**/*', route => new URL(route.request().url()).origin === new URL(origin).origin
   ? route.continue() : route.abort());
  await activeContext.setOffline(offline);
  return activeContext;
 };
 try {
  await offlineAthlete(await launch(false), origin, profile, async reason => {
   if (reason === 'baseline') return launch(false);
   // No close(), storage flush or graceful browser shutdown before this kill.
   killedPid = await killIsolatedBrowser(activeContext, directory);
   return launch(true);
  }, true);
  assert.equal(launches, profile.established ? 3 : 2);
  assert.ok(killedPid > 0);
  console.log('PASS abrupt browser recovery', profile.id,
   'SIGKILL, same-profile offline relaunch, exact main/draft, one completion and reconnect preservation');
  let completedPage = activeContext.pages().find(item => item.url().startsWith(origin));
  const completedRaw = await completedPage.evaluate(key => localStorage.getItem(key), key);
  await completedPage.evaluate(() => window.LHRFDurableCheckpoint.whenSaved());
  await killIsolatedBrowser(activeContext, directory);
  await launch(true);
  completedPage = await activeContext.newPage();
  await completedPage.clock.install({time:new Date(monday+'T09:30:00Z')});
  await completedPage.goto(origin); await checkpointReady(completedPage);
  assert.equal(await completedPage.evaluate(key => localStorage.getItem(key), key), completedRaw);
  assert.equal(await completedPage.evaluate(() => window.LHRFLive.get()), null);
  await activeContext.setOffline(false);
  await completedPage.reload(); await checkpointReady(completedPage);
  assert.equal(await completedPage.evaluate(key => localStorage.getItem(key), key), completedRaw);
  console.log('PASS completed checkpoint', profile.id, 'second SIGKILL retains one completion without replay');
  if (profile.id === 'unfinished-running-established-profile') {
   await checkpointControls(activeContext, origin);
   let page = activeContext.pages().find(item => item.url().startsWith(origin));
   const main = await page.evaluate(key => localStorage.getItem(key), key);
   const pendingKey = 'lhrf_fresh_beta_live_v1114_pendingRun';
   const pending = JSON.stringify({parentId:'fictional-pending-run', week:1,
    runs:[{name:'Fictional pending easy run',distanceKm:2}],runLogged:false,runEntry:null});
   await page.evaluate(async ({pendingKey,pending}) => {
    localStorage.setItem(pendingKey,pending);
    await window.LHRFDurableCheckpoint.whenSaved();
   }, {pendingKey,pending});
   await killIsolatedBrowser(activeContext, directory);
   await launch(true);
   page = await activeContext.newPage();
   await page.clock.install({time:new Date('2026-11-17T09:30:00Z')});
   await page.goto(origin); await checkpointReady(page);
   assert.equal(await page.evaluate(key => localStorage.getItem(key), key), main);
   assert.equal(await page.evaluate(key => localStorage.getItem(key), pendingKey), pending);
   console.log('PASS pending-run checkpoint survives abrupt offline relaunch with exact completed history');
   await activeContext.close();
   await launch(false);
   await activeContext.addInitScript(({key,pendingKey}) => {
    if (location.protocol === 'http:') {
     localStorage.removeItem(key);
     localStorage.removeItem('lhrf_fresh_beta_live_v1114');
     localStorage.removeItem(pendingKey);
    }
   }, {key,pendingKey});
   page = await activeContext.newPage();
   await page.clock.install({time:new Date('2026-11-17T09:30:00Z')});
   await page.goto(origin); await checkpointReady(page);
   assert.equal(await page.evaluate(key => localStorage.getItem(key), key), main);
   assert.equal(await page.evaluate(key => localStorage.getItem(key), pendingKey), pending);
   await page.evaluate(async () => {
    localStorage.setItem('lhrf_fictional_receipt_probe', 'preserve-receipt');
    await window.LHRFDurableCheckpoint.whenSaved();
   });
   const receipts = await page.evaluate(() => window.LHRFDurableCheckpoint.copies().durable.recoveries);
   assert.ok(receipts.some(receipt => !Object.hasOwn(receipt.local, key)));
   await page.evaluate(async () => {
    localStorage.removeItem('lhrf_fictional_receipt_probe');
    await window.LHRFDurableCheckpoint.whenSaved();
   });
   console.log('PASS missing local keys recover before app startup and retain the observed local copy through a later save');
   await activeContext.close();
   await launch(false);
   await activeContext.addInitScript(key => {
    if (location.protocol === 'http:') {
     const state = JSON.parse(localStorage.getItem(key));
     state.fictionalRecoveryConflict = true;
     localStorage.setItem(key, JSON.stringify(state));
    }
   }, key);
   page = await activeContext.newPage();
   await page.goto(origin);
   await page.waitForFunction(() => window.LHRFDurableCheckpoint?.state === 'conflict');
   const conflict = await page.evaluate(() => window.LHRFDurableCheckpoint.copies());
   assert.equal(JSON.parse(conflict.local[key]).fictionalRecoveryConflict, true);
   assert.equal(conflict.durable.snapshots[0].values[key], main);
   assert.equal(await page.evaluate(() => typeof window.LHRFLive), 'undefined');
   const downloadEvent = page.waitForEvent('download');
   await page.getByRole('button', {name:'Download recovery copies',exact:true}).click();
   const downloaded = JSON.parse(await fs.readFile(await (await downloadEvent).path(), 'utf8'));
   assert.deepEqual(downloaded.local, conflict.local);
   assert.deepEqual(downloaded.durable, conflict.durable);
   console.log('PASS unknown local recovery variant blocks startup and exports exact local plus durable copies');
  }

 } finally {
  await activeContext?.close();
  await fs.rm(directory, {recursive:true, force:true});
 }
}

async function run() {
  const revision = (await fs.readFile(path.join(root, 'OWNER-TEST-REVISION.txt'), 'utf8')).split('\n')[0];
  assert.equal(revision, candidateRevision);
  console.log('VERIFIED BASE CANDIDATE', revision, 'ARTIFACT 14415288569 SHA256', archiveSha256);
  await require('../scripts/build-durable-owner-candidate.cjs')(root, qaRevision);
  await fs.cp(root, builtRoot, {recursive:true});
  console.log('TEST DURABLE DRAFT', qaRevision);
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
  const failures = [];
  try {
    // Earlier tab-reopen and graceful-restart cases retain their passing receipts.
    for (const profile of [
      {id:'unfinished-strength-fresh', programme:'lifting-foundation', days:['Monday','Friday']},
      {id:'unfinished-strength-established-profile', programme:'lifting-foundation', days:['Monday','Friday'], established:true},
      {id:'unfinished-running-fresh', runningOnly:true, days:['Tuesday','Saturday']},
      {id:'unfinished-running-established-profile', runningOnly:true, days:['Tuesday','Saturday'], established:true},
    ]) {
      try { await abruptRecovery(origin, profile); }
      catch (error) {
        failures.push(profile.id);
        console.error('FAIL abrupt browser recovery', profile.id, error);
      }
    }
    assert.deepEqual(failures, [], 'both missing abrupt-recovery cases must pass');
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(root, {recursive: true, force: true});
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
