// Draft acceptance for the real native preview/start/finish path; fixture is generated, synthetic.
// Does not cover production records, Garmin, or PWA offline reload.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const overlay=require('../src/fatigue-overlay'),adapter=require('../src/fatigue-native-adapter');
const root=path.join(__dirname,'..'),mainKey='lhrf_beta_v1118_clean',overlayKey='lhrf_fatigue_overlay_v1';
function readFixture(file,split){const source=fs.readFileSync(file,'utf8').split(split)[0];return vm.runInNewContext(source+';fixture',{require:require('module').createRequire(file),process,__dirname:path.dirname(file),structuredClone,console});}
const base=readFixture(path.join(__dirname,'today-flow.browser.cjs'),'(async()=>');
const generated=readFixture(path.join(__dirname,'fatigue-overlay-storage.test.cjs'),"test('approval writes")();
function build(enabled){
 const f=generated,n={...structuredClone(base),...structuredClone(f.n)};n.featureFlags={fatigueIntervention:enabled};n.onboardingComplete=true;n.activeCustomWeek=9;
 n.reviewedProgramme={...n.reviewedProgramme,id:n.customRoadmap.programmeId,config:n.customRoadmap};n.activeSchedule=n.reviewedProgramme.weeks[8].sessions;n.readinessDay='2027-01-04';
 const record=overlay.approve({state:f.c,assessmentState:n,proposal:f.proposal,approved:true,enabled:true,now:f.now,eventContext:f.eventContext,draftContext:{known:true,activeSessionIds:[]}}).overlay;assert.ok(record);
 record.eventFingerprint=adapter.eventFingerprint(n);const change=record.changes[0],occ=f.c.occurrences.find(o=>o.id===change.occurrenceId),key=occ.planId+'-w'+occ.week+'-'+occ.sessionId;
 const session=n.reviewedProgramme.weeks.flatMap(w=>w.sessions).find(x=>x.catalogueOccurrenceId===key);assert.ok(session);
 return {n,record,session,change};
}
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});try{
 for(const scenario of ['off','active','revoked','expired','main-conflict','draft-revoked','draft-expired']){
  const data=build(scenario!=='off'),ctx=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,timezoneId:'Europe/London',serviceWorkers:'block'}),page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.clock.install({time:new Date('2027-01-05T09:00:00Z')});
  await page.route('https://fatigue-native.test/**',r=>{const p=new URL(r.request().url()).pathname;return r.fulfill({body:fs.readFileSync(path.join(root,p==='/'?'index.html':p)),contentType:p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':'text/html'})});
  await page.addInitScript(({mainKey,overlayKey,n,record})=>{if(!localStorage.getItem(mainKey))localStorage.setItem(mainKey,JSON.stringify(n));if(!localStorage.getItem(overlayKey))localStorage.setItem(overlayKey,JSON.stringify(record))},{mainKey,overlayKey,n:data.n,record:data.record});
  await page.goto('https://fatigue-native.test/');await page.evaluate(id=>openWorkout(id),data.session.id);assert.equal(await page.locator('#livePreview').count(),1);
  if(scenario==='off'){assert.equal(await page.locator('#fatigueOverlayNotice').count(),0);await ctx.close();continue;}
  assert.equal(await page.locator('#fatigueOverlayNotice').count(),1,scenario+' adjusted preview');
  if(scenario==='revoked')await page.evaluate(overlayKey=>localStorage.setItem(overlayKey,JSON.stringify({schema:1,kind:'fatigue-overlay-revocation',revokedOn:'2027-01-05'})),overlayKey);
  if(scenario==='expired')await page.clock.setFixedTime(new Date('2027-01-12T09:00:00Z'));
  if(scenario==='main-conflict')await page.evaluate(mainKey=>{const x=JSON.parse(localStorage.getItem(mainKey));x.otherTabSentinel='newer';localStorage.setItem(mainKey,JSON.stringify(x))},mainKey);
  await page.locator('#previewStart').click();if(await page.locator('#readinessModal[open]').count())await page.locator('#readinessContinue').click();
  if(!['active','draft-revoked','draft-expired'].includes(scenario)){
   // Fail closed: a changed or stale approval must never start an adjusted live session.
   const live=await page.evaluate(()=>window.LHRFLive?.get?.()||null);assert.ok(!live||!live.fatigueIntervention,scenario+' started with stale adjustment');if(live)assert.deepEqual(live.ex.map(x=>x[1]),data.session.ex.map(x=>x[1]),scenario+' started altered set counts');await ctx.close();continue;
  }
  const live=await page.evaluate(()=>window.LHRFLive?.get?.()||null);assert.ok(live?.fatigueIntervention,'active live session carries audit');
  assert.ok(live.ex.some((x,i)=>x[1]<data.session.ex[i][1]),'actual live set count reduced');
  if(scenario==='draft-revoked'||scenario==='draft-expired'){
   const before=JSON.stringify({ex:live.ex,audit:live.fatigueIntervention});
   if(scenario==='draft-revoked')await page.evaluate(overlayKey=>localStorage.setItem(overlayKey,JSON.stringify({schema:1,kind:'fatigue-overlay-revocation',revokedOn:'2027-01-05'})),overlayKey);
   else await page.clock.setFixedTime(new Date('2027-01-12T09:00:00Z'));
   await page.reload();await page.locator('nav [data-screen="train"]').click();
   const resumed=await page.evaluate(()=>window.LHRFLive?.get?.()||null);assert.ok(resumed?.fatigueIntervention,scenario+' must retain audit');
   assert.equal(JSON.stringify({ex:resumed.ex,audit:resumed.fatigueIntervention}),before,scenario+' must not rewrite active workout');
   assert.equal(await page.locator('#liveFatigueDraftNotice').count(),1,scenario+' must show saved adjustment and end date');
   await ctx.close();continue;
  }
  await page.locator('.live-set [data-field=weight]').first().fill('40');await page.locator('.live-set [data-field=rpe]').first().fill('7');await page.locator('.set-check').first().click();await page.locator('#liveFinish').click();await page.locator('#finishAndSave').click();
  const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),mainKey),completed=saved.completedWorkouts.at(-1);assert.ok(completed.fatigueIntervention,'completed record retains original and adjusted audit');
  assert.deepEqual(completed.fatigueIntervention.original.ex,data.session.ex);assert.deepEqual(completed.prescription.ex,live.ex);assert.deepEqual(saved.customRoadmap,data.n.customRoadmap);assert.deepEqual(saved.reviewedProgramme,data.n.reviewedProgramme);assert.deepEqual(saved.completedWorkouts.slice(0,data.n.completedWorkouts.length),data.n.completedWorkouts);assert.deepEqual(errors,[]);
  await ctx.close();
 }
 console.log('PASS native adjusted preview/start/readiness/finish and stale-approval fail-closed');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
