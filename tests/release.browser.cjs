// Release gate: install artwork + explicit programme activation with synthetic existing records.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});try{
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const config={...require('./fixtures/approved-five-week.json').config,runningGuidanceVersion:2},fixture={customRoadmap:config,activeCustomWeek:2,activeSchedule:[],sets:[{exercise:'Bench',weight:100,reps:5}],runs:[{km:5}],completedWorkouts:[{id:'custom-tue',week:1}],decisions:[{approved:true,kind:'old-programme'}],checkins:[],plannedRuns:[],overrides:{},goals:{strength:'Bench',running:'10K'},onboardingComplete:true,onboardingDraftDays:['Tue','Thu','Fri','Sat','Sun'],sentinel:'retain'};
 await page.route('http://release.test/**',route=>{const file=new URL(route.request().url()).pathname;route.fulfill({body:fs.readFileSync(path.join(__dirname,'..',file==='/'?'index.html':file)),contentType:file.endsWith('.js')?'application/javascript':file.endsWith('.png')?'image/png':file.endsWith('.json')||file.endsWith('.webmanifest')?'application/json':'text/html'})});
 await page.addInitScript(f=>{if(!localStorage.getItem('lhrf_beta_v1118_clean'))localStorage.setItem('lhrf_beta_v1118_clean',JSON.stringify(f))},fixture);
 await page.goto('http://release.test/?programme=november-2026');await page.getByRole('button',{name:'Activate approved programme',exact:true}).waitFor();
 await page.goto('http://release.test/');const activate=page.getByRole('button',{name:'Activate approved programme',exact:true});await activate.waitFor();
 await page.waitForFunction(()=>!document.querySelector('[aria-label="Approved programme activation"] button').disabled);
 const icons=JSON.parse(fs.readFileSync(path.join(__dirname,'../manifest.webmanifest'))).icons;
 const decoded=await page.evaluate(async icons=>Promise.all(icons.map(async icon=>{const image=new Image();image.src=icon.src;await image.decode();return [image.naturalWidth,image.naturalHeight]})),icons);assert.deepEqual(decoded,[[192,192],[512,512],[512,512]]);assert.ok(icons.some(i=>i.purpose==='maskable'&&i.src.includes('v2')));
 await page.evaluate(()=>localStorage.setItem('lhrf_fresh_beta_live_v1114','active workout sentinel'));await activate.click();assert.match(await page.getByRole('status').innerText(),/active workout first/);assert.equal(await page.evaluate(()=>localStorage.getItem('lhrf_fresh_beta_live_v1114')),'active workout sentinel');
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('lhrf_beta_v1118_clean'))),fixture);
 await page.evaluate(()=>localStorage.removeItem('lhrf_fresh_beta_live_v1114'));await activate.click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('lhrf_beta_v1118_clean')).customRoadmap.programmeId==='november-2026');
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('lhrf_beta_v1118_clean')));for(const key of ['sets','runs','completedWorkouts','onboardingDraftDays','sentinel'])assert.deepEqual(state[key],fixture[key]);assert.deepEqual(state.programmeArchive[0].decisions,fixture.decisions);assert.equal(state.activeCustomWeek,1);assert.equal(await page.locator('.day-workout.is-complete').count(),0,'Previous programme completion must not mark new workouts complete');
 await page.goto('http://release.test/?programme=november-2026');assert.match(await page.getByRole('status').innerText(),/already active/);assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('lhrf_beta_v1118_clean'))),state);assert.deepEqual(errors,[]);
 // Existing installed programme receives the running-only correction without activation/onboarding.
 const legacyConfig={...require('../programmes/november-2026.json')};delete legacyConfig.runningGuidanceVersion;
 const legacyState={...state,customRoadmap:legacyConfig,activeSchedule:require('../src/coach-engine.js').createEngine({data:state}).generatedSessions(legacyConfig,1)};
 await page.evaluate(s=>localStorage.setItem('lhrf_beta_v1118_clean',JSON.stringify(s)),legacyState);await page.goto('http://release.test/');
 const repaired=await page.evaluate(()=>JSON.parse(localStorage.getItem('lhrf_beta_v1118_clean')));assert.equal(repaired.customRoadmap.runningGuidanceVersion,2);assert.equal(await page.locator('#firstRun').isVisible(),false);
 assert.deepEqual(repaired.sets,legacyState.sets);assert.deepEqual(repaired.completedWorkouts,legacyState.completedWorkouts);assert.deepEqual(repaired.activeSchedule.map(s=>s.ex),legacyState.activeSchedule.map(s=>s.ex));
 const running=repaired.activeSchedule.flatMap(s=>s.runs);assert.equal(running.find(r=>r.role==='quality-run').steps.at(-1).distanceKm,1.25);
 assert.deepEqual(errors,[]);console.log('PASS new install icons decode; in-progress workout is protected; explicit approved-block activation preserves athlete history, archives prior decisions and is repeat-safe.');await context.close();
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
