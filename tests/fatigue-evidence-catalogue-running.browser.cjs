// Synthetic native workout UI; production feature defaults off. Requires Chromium + Playwright.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const catalogue=require('../src/programme-catalogue'),training=require('../src/catalogue-training'),native=require('../src/native-catalogue'),registry=require('../src/exercise-registry'),gym=require('../src/gym-equipment');
const root=path.join(__dirname,'..'),key='lhrf_beta_v1118_clean';
const source=fs.readFileSync(path.join(__dirname,'today-flow.browser.cjs'),'utf8').split('(async()=>')[0];
const base=JSON.parse(JSON.stringify(vm.runInNewContext(source+';fixture',{require:require('module').createRequire(__filename),process,__dirname})));
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});try{
 for(const scenario of ['unknown','fatigue','pain']){
  const enabled=true;
  const fixture=structuredClone(base); fixture.readinessDay='2026-11-09';
  const generated=catalogue.previewProgramme('10k-two-run');
  const plans=training.enrol(training.empty(),generated,'2026-11-09','synthetic-catalogue').plans;
  const programme=native.buildProgramme(plans,null,{training,registry,gym,inventory:fixture.equipmentInventory,now:'2026-11-09T09:00:00Z',equipment:[],protectedWeek:()=>false});
  fixture.customRoadmap=programme.config;fixture.reviewedProgramme={id:programme.config.programmeId,config:programme.config,weeks:programme.weeks};fixture.activeCustomWeek=1;fixture.activeSchedule=programme.weeks[0].sessions;fixture.completedWorkouts=[];fixture.sets=[];fixture.runs=[];
  const session=fixture.activeSchedule.find(s=>s.runs.length&&!s.ex.length);assert.ok(session.catalogueOccurrenceId);assert.equal(plans[0].snapshot.id,'10k-two-run');
  if(enabled)fixture.featureFlags={fatigueEvidenceCapture:true};
  const context=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,timezoneId:'Europe/London',serviceWorkers:'block'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.clock.install({time:new Date('2026-11-09T09:00:00Z')});
  await page.route('http://fatigue.test/**',r=>{const p=new URL(r.request().url()).pathname;return r.fulfill({body:fs.readFileSync(path.join(root,p==='/'?'index.html':p)),contentType:p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':'text/html'})});
  await page.addInitScript(({key,fixture})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture))},{key,fixture});
  await page.goto('http://fatigue.test/');
  const before=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  await page.evaluate(id=>openWorkout(id),session.id); await page.locator('#previewStart').click();
  if(await page.locator('#readinessModal[open]').count()) await page.locator('#readinessContinue').click();
  await page.locator('#liveRunKm').fill('3');await page.locator('#liveRunMinutes').fill('23');await page.locator('#liveLogRun').click(); await page.locator('#liveFinish').click(); await page.locator('#finishAndSave').click();
  assert.equal(await page.locator('#fatigueEvidenceFields').count(),enabled?1:0);
  for(const selector of ['#fatigueUnusual','#fatigueIllness','#liveFeedbackDiscomfort','#liveFeedbackInterruption','#fatigueConditions','#fatigueMeasurement','#fatigueRunEffort'])assert.equal(await page.locator(selector).inputValue(),'');
  if(scenario==='unknown')await page.locator('#liveFeedbackInterruption').selectOption('time');
  if(scenario==='fatigue'){
   await page.locator('#liveFeedbackInterruption').selectOption('fatigue');
   await page.locator('#fatigueUnusual').selectOption('yes');
   await page.locator('#fatigueConditions').selectOption('yes');
   await page.locator('#fatigueMeasurement').selectOption('yes');
   await page.locator('#fatigueRunEffort').fill('8');
  }
  if(scenario==='pain')await page.locator('#liveFeedbackInterruption').selectOption('pain');
  if(scenario==='fatigue'){
   const completed=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
   await page.evaluate(()=>{window.__originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new Error('simulated storage full')}});
   await page.locator('#liveFeedbackSave').click();
   assert.match(await page.locator('#liveFeedbackError').innerText(),/could not be saved/i);
   assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key),completed);
   await page.evaluate(()=>{Storage.prototype.setItem=window.__originalSetItem});
  }
  await page.locator('#liveFeedbackSave').click();
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  assert.deepEqual(saved.customRoadmap,before.customRoadmap);assert.deepEqual(saved.activeSchedule,before.activeSchedule);
  assert.deepEqual(saved.completedWorkouts.slice(0,before.completedWorkouts.length),before.completedWorkouts);
  assert.equal(saved.fatigueEvidence.length,1);const e=saved.fatigueEvidence[0];assert.equal(e.discipline,'running');
  const signals=await page.evaluate(e=>LHRFFatigueEvidence.signals(e),e);
  if(scenario==='unknown'){assert.equal(e.interruptionReason,'time');assert.equal(e.unusualFatigue,'unknown');assert.equal(e.painOrDiscomfort,'unknown');assert.equal(e.illness,'unknown');assert.equal(e.comparableConditions,'unknown');assert.equal(e.reliableMeasurement,'unknown');assert.equal(e.runEffort,null);assert.equal(signals.fatigueSupporting,false);assert.equal(signals.explicitRunningContext,false);}
  if(scenario==='fatigue'){assert.equal(e.interruptionReason,'fatigue');assert.equal(e.unusualFatigue,'yes');assert.equal(e.runEffort,8);assert.equal(signals.fatigueSupporting,true);assert.equal(signals.explicitRunningContext,true);}
  if(scenario==='pain'){assert.equal(e.interruptionReason,'pain');assert.equal(signals.safetyConcern,true);assert.equal(signals.fatigueSupporting,false);}
  await page.reload();assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key),saved);
  assert.deepEqual(errors,[]);await context.close();
 }
 console.log('PASS generated catalogue running capture: unknown, confirmed fatigue and pain; storage retry and reload');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
