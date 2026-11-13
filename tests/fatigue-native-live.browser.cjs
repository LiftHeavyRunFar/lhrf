// Draft acceptance for the real native preview/start/finish path; fixture is generated, synthetic.
// Does not cover production records, Garmin, or PWA offline reload.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const overlay=require('../src/fatigue-overlay'),adapter=require('../src/fatigue-native-adapter');
const root=path.join(__dirname,'..'),mainKey='lhrf_beta_v1118_clean',overlayKey='lhrf_fatigue_overlay_v1';
function readFixture(file,split){const source=fs.readFileSync(file,'utf8').split(split)[0];return vm.runInNewContext(source+';fixture',{require:require('module').createRequire(file),process,__dirname:path.dirname(file),structuredClone,console});}
const base=readFixture(path.join(__dirname,'today-flow.browser.cjs'),'(async()=>');
const generated=require('./fatigue-overlay-fixture.cjs').fixture();
function build(enabled){
 const f=generated,n={...structuredClone(base),...structuredClone(f.n)};n.featureFlags={fatigueIntervention:enabled};n.onboardingComplete=true;n.activeCustomWeek=9;
 n.reviewedProgramme={...n.reviewedProgramme,id:n.customRoadmap.programmeId,config:n.customRoadmap};n.activeSchedule=n.reviewedProgramme.weeks[8].sessions;n.readinessDay='2027-01-04';
 const record=overlay.approve({state:f.c,assessmentState:n,proposal:f.proposal,approved:true,enabled:true,now:f.now,eventContext:f.eventContext,draftContext:{known:true,activeSessionIds:[]}}).overlay;assert.ok(record);
 record.eventFingerprint=adapter.eventFingerprint(n);const change=record.changes[0],occ=f.c.occurrences.find(o=>o.id===change.occurrenceId),key=occ.planId+'-w'+occ.week+'-'+occ.sessionId;
 const session=n.reviewedProgramme.weeks.flatMap(w=>w.sessions).find(x=>x.catalogueOccurrenceId===key);assert.ok(session);
 return {n,record,session,change};
}
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});try{
 for(const scenario of ['off','no-record','active','revoked','expired','main-conflict','idb-unavailable','draft-revoked','draft-expired','idb-abort-start']){
  const data=build(true),ctx=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,timezoneId:'Europe/London',serviceWorkers:'block'}),page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.clock.install({time:new Date('2027-01-05T09:00:00Z')});
  await page.route('https://fatigue-native.test/**',r=>{const p=new URL(r.request().url()).pathname;if(p==='/seed')return r.fulfill({body:'<!doctype html><title>Seed</title>',contentType:'text/html'});return r.fulfill({body:fs.readFileSync(path.join(root,p==='/'?'index.html':p)),contentType:p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':'text/html'})});
  await page.goto('https://fatigue-native.test/seed');
  for(const name of ['gym-equipment.js','exercise-registry.js','catalogue-training.js','catalogue-protection.js','fatigue-assessment.js','fatigue-overlay.js','fatigue-native-adapter.js','fatigue-overlay-idb.js'])await page.addScriptTag({content:fs.readFileSync(path.join(root,'src',name),'utf8')});
  const seeded=await page.evaluate(async({mainKey,overlayKey,n,proposal,eventContext,scenario})=>{const raw=JSON.stringify(n);localStorage.setItem(mainKey,raw);if(scenario==='no-record')return null;return LHRFFatigueOverlayIDB.approve({indexedDB,storage:localStorage,mainKey,overlayKey,expectedRaw:raw,proposal,approved:true,now:'2027-01-05',eventContext})},{mainKey,overlayKey,n:data.n,proposal:generated.proposal,eventContext:generated.eventContext,scenario});
  if(scenario!=='no-record')assert.equal(seeded.status,'saved','fixture must create an actually approved IndexedDB overlay');
  const seededRaw=seeded?JSON.stringify(seeded.overlay):null;
  if(scenario==='off')await page.evaluate(mainKey=>{const n=JSON.parse(localStorage.getItem(mainKey));n.featureFlags.fatigueIntervention=false;localStorage.setItem(mainKey,JSON.stringify(n))},mainKey);
  await page.goto('https://fatigue-native.test/');await page.evaluate(id=>openWorkout(id),data.session.id);assert.equal(await page.locator('#livePreview').count(),1);
  if(scenario==='off'||scenario==='no-record'){
   assert.equal(await page.locator('#fatigueOverlayNotice').count(),0);
   if(scenario==='no-record'){
    await page.locator('#previewStart').click();if(await page.locator('#readinessModal[open]').count())await page.locator('#readinessContinue').click();
    await page.waitForFunction(()=>!!window.LHRFLive?.get?.());const baseline=await page.evaluate(()=>window.LHRFLive.get());
    assert.ok(!baseline.fatigueIntervention);assert.deepEqual(baseline.ex.map(x=>x[1]),data.session.ex.map(x=>x[1]));
   }
   await ctx.close();continue;
  }
  if(await page.locator('#fatigueOverlayNotice').count()!==1){
   const diagnostic=await page.evaluate(async({mainKey,overlayKey,session,initial})=>{
    try{
     const raw=localStorage.getItem(mainKey),stored=JSON.parse(raw),idb=await window.LHRFFatigueOverlayIDB?.read({indexedDB,overlayKey,now:'2027-01-05'}),record=idb?.overlay||null;
     const current=typeof data==='undefined'?null:data;
     const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
     const fp=window.LHRFFatigueNativeAdapter?.eventFingerprint;
     const all=(stored?.reviewedProgramme?.weeks||[]).flatMap(w=>w.sessions||[]),match=all.filter(s=>s.catalogueOccurrenceId===session.catalogueOccurrenceId);
     const changedKeys=[...new Set([...Object.keys(initial),...Object.keys(stored)])].filter(k=>JSON.stringify(initial[k])!==JSON.stringify(stored[k]));
     const context={asOfDate:'2027-01-05',eventInformationUnchanged:true,eventFreeAttestation:record?.eventFreeAttestation};
     const ephemeral={getItem:k=>k===overlayKey?JSON.stringify(record):localStorage.getItem(k)};
     const result=window.LHRFFatigueNativeAdapter?.resolve({native:stored,session:match[0],storage:ephemeral,mainKey,overlayKey,now:'2027-01-05',eventContext:context});
     const memoryDiff=current?[...new Set([...Object.keys(current),...Object.keys(stored)])].filter(k=>JSON.stringify(canonical(current[k]))!==JSON.stringify(canonical(stored[k]))):[];
     return {changedKeys,memoryDiff,memoryStructurallyEqual:current?JSON.stringify(canonical(current))===JSON.stringify(canonical(stored)):null,idbStatus:idb?.status,flag:stored?.featureFlags?.fatigueIntervention,rawMatchesData:current?raw===JSON.stringify(current):null,fingerprintMatches:!!fp&&record?.eventFingerprint===fp(stored),locks:typeof navigator.locks?.request,competitionPresent:localStorage.getItem('competition:lhrf_beta_v1118_clean')!==null,draft:window.LHRFFatigueNativeAdapter?.draftContext(localStorage),matchCount:match.length,sessionMatches:match.length===1&&JSON.stringify(match[0])===JSON.stringify(session),directAdjusted:result?.adjusted,errors:window.LHRFFatigueNativeAdapter?'adapter-present':'adapter-missing'};
    }catch(e){return {exception:String(e)}}
   },{mainKey,overlayKey,session:data.session,initial:data.n});
   console.log('NATIVE_OVERLAY_DIAGNOSTIC='+JSON.stringify(diagnostic));
  }
  assert.equal(await page.locator('#fatigueOverlayNotice').count(),1,scenario+' adjusted preview');
  if(scenario==='revoked')assert.equal((await page.evaluate(({overlayKey,expectedRaw})=>LHRFFatigueOverlayIDB.revoke({indexedDB,overlayKey,expectedRaw,confirmed:true,now:'2027-01-05'}),{overlayKey,expectedRaw:seededRaw})).status,'revoked');
  if(scenario==='expired')await page.clock.setFixedTime(new Date('2027-01-12T09:00:00Z'));
  if(scenario==='main-conflict')await page.evaluate(mainKey=>{const x=JSON.parse(localStorage.getItem(mainKey));x.otherTabSentinel='newer';localStorage.setItem(mainKey,JSON.stringify(x))},mainKey);
  if(scenario==='idb-unavailable')await page.evaluate(()=>Object.defineProperty(window,'indexedDB',{value:null,configurable:true}));
  const staleScenario=['revoked','expired','main-conflict','idb-unavailable'].includes(scenario);
  const staleAlert=staleScenario?page.waitForEvent('dialog',{timeout:10000}):null;
  await page.locator('#previewStart').click();
  if(scenario==='idb-abort-start'){
   assert.equal(await page.locator('#readinessModal[open]').count(),1,'fault injection must happen during readiness');
   await page.evaluate(()=>{const original=IDBObjectStore.prototype.get;IDBObjectStore.prototype.get=function(...args){const req=original.apply(this,args);req.addEventListener('success',()=>queueMicrotask(()=>{try{req.transaction.abort()}catch{}}));return req}});
   await page.locator('#readinessContinue').click();await page.waitForFunction(()=>window.LHRFLive?.get?.()?.fatigueVerificationPending===true);
   await page.locator('nav [data-screen="train"]').click();assert.match(await page.locator('#liveTrainRoot').innerText(),/verification interrupted/i);assert.equal(await page.locator('.live-set').count(),0,'an unverified draft must not permit logging');
   const pending=await page.evaluate(()=>window.LHRFLive.get()),before=JSON.stringify({ex:pending.ex,audit:pending.fatigueIntervention});await page.reload();await page.locator('nav [data-screen="train"]').click();
   const restored=await page.evaluate(()=>window.LHRFLive.get());assert.equal(restored.fatigueVerificationPending,true);assert.equal(JSON.stringify({ex:restored.ex,audit:restored.fatigueIntervention}),before);assert.equal(await page.locator('.live-set').count(),0);await ctx.close();continue;
  }
  if(await page.locator('#readinessModal[open]').count())await page.locator('#readinessContinue').click();
  if(!['active','draft-revoked','draft-expired'].includes(scenario)){
   // Fail closed: a changed or stale approval must never start an adjusted live session.
   await staleAlert;
   const live=await page.evaluate(()=>window.LHRFLive?.get?.()||null);assert.ok(!live||!live.fatigueIntervention,scenario+' started with stale adjustment');if(live)assert.deepEqual(live.ex.map(x=>x[1]),data.session.ex.map(x=>x[1]),scenario+' started altered set counts');await ctx.close();continue;
  }
  await page.waitForFunction(()=>!!window.LHRFLive?.get?.()?.fatigueIntervention,null,{timeout:10000});
  const live=await page.evaluate(()=>window.LHRFLive?.get?.()||null);assert.ok(live?.fatigueIntervention,'active live session carries audit');
  assert.ok(live.ex.some((x,i)=>x[1]<data.session.ex[i][1]),'actual live set count reduced');
  if(scenario==='draft-revoked'||scenario==='draft-expired'){
   const before=JSON.stringify({ex:live.ex,audit:live.fatigueIntervention});
   if(scenario==='draft-revoked')assert.equal((await page.evaluate(({overlayKey,expectedRaw})=>LHRFFatigueOverlayIDB.revoke({indexedDB,overlayKey,expectedRaw,confirmed:true,now:'2027-01-05'}),{overlayKey,expectedRaw:seededRaw})).status,'revoked');
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
