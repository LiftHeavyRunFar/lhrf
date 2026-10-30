// Real new-programme path: legacy athlete -> preview -> explicit approval -> reload.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const coach=require('../src/coach-engine'),install=require('../src/programme-install'),config=require('../tests/fixtures/approved-peak-v2.json').config;
const KEY='lhrf_beta_v1118_clean';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});try{
 const context=await browser.newContext({viewport:{width:390,height:844},timezoneId:'Europe/London',serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-30T12:00:00Z')});
 let fixture={customRoadmap:config,activeCustomWeek:1,activeSchedule:coach.createEngine().generatedSessions(config,1),sets:[{date:'2026-10-27T07:00:00Z',exercise:'Bench',weight:120,reps:5,rpe:7,role:'top',week:1,sessionId:'november-2026-custom-tue::strength'}],runs:[{km:5,min:33}],checkins:[],sessionFeedback:[],plannedRuns:[],decisions:[{approved:true,kind:'adaptive-progression',exercise:'Bench',factor:1.075,week:1,date:'2026-10-27T08:00:00Z'}],overrides:{},completedWorkouts:[{id:'november-2026-custom-tue::strength',week:1}],goals:{strength:'Bench',running:'10K PB'},onboardingComplete:true};
 fixture=install.refreshApprovedBenchPeak(install.refreshApprovedBenchProgramme(install.refreshApprovedRunningProgramme(fixture,coach,'2026-10-30T12:00:00Z'),coach,'2026-10-30T12:00:00Z'),coach,'2026-10-30T12:00:00Z');
 await page.route('http://general.test/**',route=>{const file=new URL(route.request().url()).pathname;return route.fulfill({body:fs.readFileSync(path.join(__dirname,'..',file==='/'?'index.html':file)),contentType:file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':'text/html'})});
 await page.addInitScript(({KEY,fixture})=>{if(!localStorage.getItem(KEY))localStorage.setItem(KEY,JSON.stringify(fixture))},{KEY,fixture});await page.goto('http://general.test/');
 const read=()=>page.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)),KEY),before=await read();
 assert.deepEqual(before.activeSchedule,fixture.activeSchedule);assert.deepEqual(before.sets,fixture.sets);
 await page.evaluate(()=>document.getElementById('restartOnboardingLink').click());await page.locator('#frNext').click();await page.locator('[name="frFocus"][value="strength"]').check();await page.locator('#frNext').click();
 await page.locator('#frGoal').selectOption('bench');await page.locator('#frExperience').selectOption('advanced');await page.locator('#frStrengthMode').selectOption('progression');await page.locator('#frStartDate').fill('2027-01-04');await page.locator('#frStrengthDate').fill('2027-03-27');await page.locator('#frRunningDate').fill('');await page.locator('#frNext').click();
 for(const [id,v]of Object.entries({frBench:'3',frSquat:'0',frDeadlift:'0',frRuns:'2'}))await page.locator('#'+id).selectOption(v);
 await page.locator('#frNext').click();await page.locator('#frMaxBench').fill('120');await page.locator('#frRunTime').fill('50:00');await page.locator('#frRunKm').fill('20');await page.locator('#frNext').click();
 await page.locator('#frPreview').waitFor();const preview=await page.locator('#frPreview').innerText();assert.match(preview,/Lat pulldown/);assert.match(preview,/Face pull/);assert.match(preview,/Incline dumbbell press/);
 const proposed=await read();assert.deepEqual(proposed.customRoadmap,before.customRoadmap);assert.deepEqual(proposed.activeSchedule,before.activeSchedule);assert.deepEqual(proposed.sets,before.sets);
 await page.locator('#frNext').click();assert.equal(await page.locator('#firstRun').isVisible(),false);
 const accepted=await read();assert.equal(accepted.customRoadmap.coachingRulesVersion,1);assert.equal(accepted.customRoadmap.benchPeakVersion,undefined);assert.equal(accepted.customRoadmap.lightLifts,undefined);assert.equal(accepted.customRoadmap.manualSplit,undefined);
 assert.notEqual(accepted.customRoadmap.programmeId,before.customRoadmap.programmeId);assert.ok(accepted.activeSchedule.every(s=>s.id.startsWith(accepted.customRoadmap.sessionNamespace)));
 for(const k of ['sets','runs','completedWorkouts','decisions','sessionFeedback'])assert.deepEqual(accepted[k],before[k],k);
 assert.deepEqual(accepted.programmeArchive.at(-1).programme,before.customRoadmap);assert.deepEqual(accepted.programmeArchive.at(-1).schedule,before.activeSchedule);
 const roles=accepted.activeSchedule.flatMap(s=>s.ex.filter(e=>e[0]==='Bench'&&e[5]?.category==='primary').map(e=>e[5].trainingRole));assert.ok(roles.includes('volume'));assert.ok(roles.includes('heavy'));assert.ok(roles.includes('speed'));
 await page.reload();assert.deepEqual(await read(),accepted);assert.deepEqual(errors,[]);
 console.log('PASS canonical defaults in real onboarding; preview does not alter approval; three distinct bench roles; isolated completion IDs; prior programme archived; real history retained; version survives reload.');await context.close();
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
