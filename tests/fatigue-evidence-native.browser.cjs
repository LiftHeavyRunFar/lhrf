// Synthetic native workout UI; production feature defaults off. Requires Chromium + Playwright.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.join(__dirname,'..'),key='lhrf_beta_v1118_clean';
const source=fs.readFileSync(path.join(__dirname,'today-flow.browser.cjs'),'utf8').split('(async()=>')[0];
const base=JSON.parse(JSON.stringify(vm.runInNewContext(source+';fixture',{require:require('module').createRequire(__filename),process,__dirname})));
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});try{
 for(const enabled of [false,true]){
  const fixture=structuredClone(base); fixture.readinessDay='2026-10-23'; fixture.customRoadmap.cataloguePlans=[];
  if(enabled)fixture.featureFlags={fatigueEvidenceCapture:true};
  const context=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,timezoneId:'Europe/London',serviceWorkers:'block'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.clock.install({time:new Date('2026-10-23T09:00:00Z')});
  await page.route('http://fatigue.test/**',r=>{const p=new URL(r.request().url()).pathname;return r.fulfill({body:fs.readFileSync(path.join(root,p==='/'?'index.html':p)),contentType:p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':'text/html'})});
  await page.addInitScript(({key,fixture})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture))},{key,fixture});
  await page.goto('http://fatigue.test/');
  const before=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  await page.evaluate(()=>openWorkout('fri::strength')); await page.locator('#previewStart').click();
  if(await page.locator('#readinessModal[open]').count()) await page.locator('#readinessContinue').click();
  await page.locator('.live-set [data-field=weight]').first().fill('100');
  await page.locator('.live-set [data-field=rpe]').first().fill('7');
  await page.locator('.set-check').first().click(); await page.locator('#liveFinish').click(); await page.locator('#finishAndSave').click();
  assert.equal(await page.locator('#fatigueEvidenceFields').count(),enabled?1:0);
  if(enabled){
   assert.equal(await page.locator('#fatigueUnusual').inputValue(),'');assert.equal(await page.locator('#liveFeedbackInterruption').inputValue(),'');
   await page.locator('#fatigueUnusual').selectOption('yes');await page.locator('#liveFeedbackInterruption').selectOption('fatigue');
   const completed=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
   await page.evaluate(()=>{window.__originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new Error('simulated storage full')}});
   await page.locator('#liveFeedbackSave').click();
   assert.match(await page.locator('#liveFeedbackError').innerText(),/could not be saved/i);
   assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key),completed);
   await page.evaluate(()=>{Storage.prototype.setItem=window.__originalSetItem});
  }
  else await page.locator('#liveFeedbackDifficulty').selectOption('expected');
  await page.locator('#liveFeedbackSave').click();
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  assert.deepEqual(saved.customRoadmap,before.customRoadmap);assert.deepEqual(saved.activeSchedule,before.activeSchedule);
  assert.deepEqual(saved.completedWorkouts.slice(0,before.completedWorkouts.length),before.completedWorkouts);
  if(enabled){assert.equal(saved.fatigueEvidence.length,1);assert.equal(saved.fatigueEvidence[0].interruptionReason,'fatigue');assert.equal(saved.fatigueEvidence[0].unusualFatigue,'yes');assert.equal(saved.fatigueEvidence[0].comparableConditions,'unknown');}
  else assert.equal(saved.fatigueEvidence,undefined);
  await page.reload();assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key),saved);
  assert.deepEqual(errors,[]);await context.close();
 }
 console.log('PASS native feedback capture: default off, explicit opt-in, unknown defaults, preserved programme and reload');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
