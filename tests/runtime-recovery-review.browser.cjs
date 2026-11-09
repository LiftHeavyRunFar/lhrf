// Actual proposal controls, fictional source data, no approval or live writes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {fullInventory}=require('./equipment-fixtures.cjs'),{record}=require('./fixtures/independent-coaching-inputs.cjs');
const KEY='lhrf_beta_v1118_clean',inventory=fullInventory(),config={coachingRulesVersion:2,coachingPolicy:'review-v2',startDate:'2026-11-09',weeks:4,event:'bench',strengthTargetDate:'2026-11-28',priority:'Bench',hybridFocus:'strength',trainingAge:'intermediate',strengthMode:'progression',bench:1,squat:0,deadlift:0,runs:1,days:3,availableDays:['Mon','Thu','Sun'],longRunDay:'Sun',doubleDays:[],runGoal:'fitness',liftProfiles:{Bench:{kg:120,reps:1,recency:'recent'}},baselines:{Bench:120},runProfile:{},equipmentInventory:inventory,visitConstraints:{strengthVisits:1,minutes:{Mon:120,Thu:120},eventDays:{'2026-11-28':{confirmed:true}}},recoveryEvidence:{status:'fatigue',affectedLifts:['Bench'],reportedAt:'2026-11-04'}};
config.recoveryObservations=[{sport:'strength',task:'heavy',lift:'Bench',observedAt:'2026-11-06',referencePerformanceDate:'2026-11-05',status:'normal',nextDayResponse:'normal',source:'athlete-recovery-review'}];
const fixture={equipmentInventory:inventory,onboardingComplete:true,customRoadmap:config,activeCustomWeek:1,activeSchedule:[{id:'saved-bench',day:'Mon',name:'Saved bench',ex:[['Bench',2,3,100,7]],runs:[]}],sets:[record('Bench',100,3,7,'top','2026-11-05T12:00:00Z',{trainingRole:'heavy'})],runs:[],checkins:[],sessionFeedback:[],decisions:[],overrides:{},completedWorkouts:[]};
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});try{
 const context=await browser.newContext({viewport:{width:390,height:844},timezoneId:'Europe/London',serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install({time:new Date('2026-11-07T12:00:00Z')});
 await page.route('http://recovery-review.test/**',route=>{const file=new URL(route.request().url()).pathname;return route.fulfill({body:fs.readFileSync(path.join(__dirname,'..',file==='/'?'index.html':file)),contentType:file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html'})});
 await page.addInitScript(({KEY,fixture})=>{if(!localStorage.getItem(KEY))localStorage.setItem(KEY,JSON.stringify(fixture))},{KEY,fixture});await page.goto('http://recovery-review.test/');const before=await page.evaluate(KEY=>localStorage.getItem(KEY),KEY),beforeData=await page.evaluate(()=>JSON.parse(JSON.stringify(data)));
 await page.evaluate(()=>{const prepare=LHRFCoach.prepareNewProgramme;LHRFCoach.prepareNewProgramme=(c,o)=>{const result=prepare(c,o);window.recoveryProposal=result;return result};LHRFStartNewProgramme()});
 await page.locator('#frNext').click();
 await page.locator('#frNext').click();
 for(const day of ['Mon','Thu','Sun'])await page.locator('.fr-day[value='+day+']').check();
 await page.locator('#frNext').click();
 assert.equal(await page.locator('.fr-step.on').getAttribute('data-step'),'4');
 assert.equal(await page.locator('#frFatigueStatus,#frTaskRecovery').count(),0);
 await page.locator('#frNext').click();
 const result=await page.evaluate(()=>({observations:recoveryProposal.recoveryObservations,state:LHRFCoachingEvidence.recovery(recoveryProposal,{now:Date.now(),atDate:'2026-11-09',sport:'strength',task:'heavy',lift:'Bench'})}));
 assert.equal(result.state.status,'normal','Existing task-specific evidence survives the simpler setup.');assert.ok(result.observations.some(o=>o.source==='athlete-recovery-review'&&o.status==='normal'));assert.ok(result.observations.some(o=>o.referencePerformanceDate==='2026-11-05'&&o.observedAt==='2026-11-06'));
 assert.equal(await page.evaluate(KEY=>localStorage.getItem(KEY),KEY),before);assert.deepEqual(await page.evaluate(()=>data),beforeData);assert.deepEqual(errors,[]);await context.close();console.log('PASS existing dated recovery evidence still applies without questionnaire controls or writes to the saved programme.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
