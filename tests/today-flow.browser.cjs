// Run with PLAYWRIGHT_MODULE and CHROMIUM_EXECUTABLE set when using external test dependencies.
// All athlete data below is synthetic and isolated in a new browser context.
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.join(__dirname,'..');
const DATA='lhrf_beta_v1118_clean',LIVE='lhrf_fresh_beta_live_v1114';
const baseConfig={event:'powerlifting',weeks:6,date:'2026-11-28',priority:'Bench',squat:1,bench:3,deadlift:1,runs:2,rungoal:'10k',days:5,noDate:false,startDate:'2026-10-19',strengthTargetDate:'2026-11-28',runningTargetDate:'2026-11-29',baselines:{Squat:120,Bench:160,Deadlift:160},liftProfiles:{Squat:{kg:120,reps:1,recency:'recent'},Bench:{kg:160,reps:1,recency:'recent'},Deadlift:{kg:160,reps:1,recency:'recent'}},runProfile:{distance:10,seconds:3900,time:'1:05:00',recency:'recent',weeklyKm:20},variations:{Squat:{choice:'auto'},Bench:{choice:'auto'},Deadlift:{choice:'auto'}},availableDays:['Tue','Thu','Fri','Sat','Sun'],longRunDay:'Sat',doubleDays:['Tue']};
const run={name:'Easy run',minutes:20,rpe:4,distanceKm:3,role:'easy'};
const fixture={onboardingComplete:true,customRoadmap:baseConfig,activeCustomWeek:1,activeSchedule:[
{id:'tue',day:'Tuesday',name:'Completed bench',ex:[['Bench press',1,5,100,7]]},
{id:'thu',day:'Thursday',name:'Past lower',ex:[['Squat',1,3,60,5]]},
{id:'fri',day:'Friday',name:'Bench + run',ex:[['Bench press',1,3,120,8,{role:'top'}],['Bench press',2,5,100,7,{role:'backoff',topIndex:0}]],runs:[run]},
{id:'sat',day:'Saturday',name:'Future run',ex:[],runs:[run]},
{id:'sun',day:'Sunday',name:'Completed early',ex:[['Bench press',1,5,100,7]]}],
completedWorkouts:[{id:'tue',week:1,date:'2026-10-21T12:00:00Z',name:'Completed bench'},{id:'sun',week:1,date:'2026-10-22T12:00:00Z',name:'Completed early'}],
sets:[{date:'2026-10-21T12:00:00Z',exercise:'Bench press',weight:100,reps:5,rpe:7,week:1}],runs:[],checkins:[],plannedRuns:[],goals:{strength:'Bench',running:'10K PB'},overrides:{},decisions:[],onboardingManualMode:true,onboardingManualSplit:{Tuesday:['bench','run']},sentinel:{keep:'athlete settings'}};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,timezoneId:'Europe/London',serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.stack));page.on('dialog',d=>d.accept());
 await page.clock.install({time:new Date('2026-10-23T10:00:00+01:00')});
 await page.route('http://lhrf.test/**',route=>{const file=new URL(route.request().url()).pathname;route.fulfill({body:fs.readFileSync(path.join(root,file==='/'?'index.html':file)),contentType:file.endsWith('.js')?'application/javascript':file.endsWith('.png')?'image/png':'text/html'})});
 await page.addInitScript(({key,fixture})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture))},{key:DATA,fixture});
 await page.goto('http://lhrf.test/');
 const getData=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),DATA);
 assert.equal(await page.locator('#firstRun').isVisible(),false);
 assert.equal(await page.locator('#thisWeekCarousel .day-slide').count(),5);
 assert.equal(await page.locator('#todaySessions').count(),0,'Weekly cards are the sole Today workout list');
 assert.equal(await page.locator('.day-workout.is-complete').count(),2);
 assert.equal(await page.locator('#upcomingSessions button').count(),5);
 const upcoming=page.locator('#upcomingSessions button').first();
 assert.equal(await upcoming.getAttribute('data-date'),'2026-10-27');assert.equal(await upcoming.getAttribute('data-week'),'2');
 await upcoming.click();assert.match(await page.locator('#livePreview').innerText(),/Week 2 · Future preview/);assert.equal(await page.locator('#previewStart').count(),0);assert.equal(await page.locator('#preWorkoutReadiness').isVisible(),false);await page.locator('#previewClose').click();

 assert.deepEqual(await getData(),fixture,'initialisation preserves every athlete field');
 for(const tab of ['today','train','plan','progress','settings']){
  await page.locator(`nav [data-screen="${tab}"]`).click();
  assert.equal(await page.locator('.screen.active').getAttribute('id'),tab);
  assert.equal(await page.locator('nav button.active').count(),1);
 }
 await page.locator('nav [data-screen="plan"]').click();
 assert.equal(await page.locator('#planDashWeekDetails > .plan-session-rail').count(),1);
 assert.equal(await page.locator('#planDashWeekDetails > *').count(),1,'Workout cards directly follow the week selector, without duplicate summaries or controls');
 await page.evaluate(()=>window.scrollTo(0,600));
 assert.equal(Math.round((await page.locator('#appHeader').boundingBox()).y),0,'Logo stays pinned while scrolling');
 const masthead=await page.locator('#appHeader').evaluate(e=>({border:getComputedStyle(e).borderTopWidth,shadow:getComputedStyle(e).boxShadow,logoWidth:e.querySelector('img').getBoundingClientRect().width}));
 assert.equal(masthead.border,'0px');assert.equal(masthead.shadow,'none');assert.ok(masthead.logoWidth>=220,'Logo is larger than the previous scaled wordmark');
 await page.locator('nav [data-screen="train"]').click();assert.equal(await page.locator('#preWorkoutReadiness').isVisible(),false);
 await page.getByRole('button',{name:'Choose workout →',exact:true}).click();assert.equal(await page.locator('.screen.active').getAttribute('id'),'today');
 // Arrow controls use the same scroll-snap rail as touch swiping.
 await page.locator('#dayPrev').click();assert.match(await page.locator('#dayPosition').innerText(),/Thursday/);
 await page.locator('#dayNext').click();assert.match(await page.locator('#dayPosition').innerText(),/Friday/);
 assert.equal(await page.locator('#dayCarousel').evaluate(e=>e.scrollWidth>e.clientWidth),true);
 await page.locator('[data-session-id="tue"]').click();assert.match(await page.locator('#livePreview').innerText(),/Completed/);assert.equal(await page.locator('#previewStart').count(),0);await page.locator('#previewClose').click();
 let previewText;
 for(const target of ['.day-label','h3','h3 span','.day-hint','.day-workout > strong']){
  await page.locator('.day-slide[data-index="4"] '+target).click();
  const text=await page.locator('#livePreview').innerText();if(previewText)assert.equal(text,previewText,'Every part of a day card opens the same preview');previewText=text;
  assert.equal(await page.locator('#livePreview .run-workout-flow').count(),1);assert.doesNotMatch(await page.locator('#livePreview .run-workout-flow').innerText(),/RPE/);await page.locator('#previewClose').click();
 }
 await page.locator('[data-session-id="fri::strength"]').click();assert.equal(await page.locator('#livePreview').isVisible(),true);assert.equal(await page.evaluate(key=>localStorage.getItem(key),LIVE),null);
 await page.locator('#previewClose').click();assert.deepEqual(await getData(),fixture,'preview never changes athlete data');
 await page.locator('[data-session-id="fri::strength"]').click();await page.locator('#previewStart').click();assert.equal(await page.locator('#readinessModal').isVisible(),true);assert.equal(await page.locator('#preWorkoutReadiness').getAttribute('open'),'');
 await page.getByRole('button',{name:'Review readiness',exact:true}).click();await page.locator('#readinessContinue').click();assert.equal(await page.locator('#preWorkoutReadiness').isVisible(),false);assert.equal(await page.locator('#liveRunKm').count(),0,'Strength is independent of the pending run');
 await page.locator('#liveFinish').click();assert.match(await page.locator('#liveError').innerText(),/Log at least one set/);
 await page.locator('.live-set [data-field="rpe"]').first().fill('8');await page.locator('.live-set .set-check').first().click();assert.equal(await page.locator('.live-ex').first().getAttribute('open'),null,'Final set collapses its completed exercise');
 const backoff=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).ex[1][3],LIVE);assert.ok(backoff>0);
 await page.reload();await page.locator('nav [data-screen="train"]').click();assert.equal(await page.locator('.set-check.checked').count(),1,'live workout survives reload');
 for(let j=0;j<2;j++){
  const details=page.locator('.live-ex').nth(1);if(await details.getAttribute('open')===null)await details.locator('summary').click();
  const row=details.locator('.live-set').nth(j);await row.locator('[data-field="rpe"]').fill('7');await row.locator('.set-check').click();
 }
 await page.locator('#liveNotes').fill('Synthetic regression test');
 await page.locator('#liveFinish').click();
 assert.equal(await page.locator('#liveFeedbackDialog').isVisible(),true);await page.locator('#liveFeedbackDifficulty').selectOption('expected');await page.locator('#liveFeedbackSave').click();
 let saved=await getData();assert.equal(saved.sets.length,4);assert.equal(saved.runs.length,0,'Strength review must not require or fabricate a run');assert.equal(saved.completedWorkouts.length,3);assert.equal(saved.sessionFeedback.length,1);assert.deepEqual(saved.activeSchedule,fixture.activeSchedule);assert.deepEqual(saved.customRoadmap,fixture.customRoadmap);assert.deepEqual(saved.sentinel,fixture.sentinel);assert.deepEqual(saved.sets[0],fixture.sets[0]);assert.deepEqual(saved.completedWorkouts.slice(0,2),fixture.completedWorkouts);
 assert.equal(await page.evaluate(key=>localStorage.getItem(key),LIVE),null);assert.equal(await page.locator('#preWorkoutReadiness').isVisible(),false);
 await page.locator('nav [data-screen="today"]').click();assert.equal(await page.locator('.day-workout.is-complete').count(),3);assert.equal(await page.locator('#todaySessions').count(),0,'Weekly cards are the sole Today workout list');
 await page.locator('[data-session-id="fri::run"]').click();await page.locator('#previewStart').click();assert.equal(await page.locator('#readinessModal').count(),0,'Second workout shares daily readiness');assert.equal(await page.locator('.live-ex').count(),0,'Run excludes strength exercises');await page.locator('#liveFinish').click();assert.match(await page.locator('#liveRunError').innerText(),/Log your completed run/);await page.locator('#liveRunKm').fill('3');await page.locator('#liveRunMinutes').fill('20');await page.locator('#liveLogRun').click();await page.locator('#liveFinish').click();await page.locator('#liveFeedbackSkip').click();saved=await getData();assert.equal(saved.runs.length,1);assert.equal(saved.completedWorkouts.length,4);assert.equal(saved.completedWorkouts.at(-1).id,'fri::run');await page.locator('nav [data-screen="today"]').click();
 await page.locator('[data-session-id="sat"]').click();await page.locator('#previewStart').click();await page.locator('#liveRunKm').fill('3');await page.locator('#liveRunMinutes').fill('20');assert.equal(await page.locator('#liveRunRpe').count(),0);await page.locator('#liveLogRun').click();await page.locator('#liveFinish').click();await page.locator('#liveFeedbackSkip').click();
 await page.locator('nav [data-screen="today"]').click();assert.equal(await page.locator('#todaySessions button').count(),0,'No duplicate list appears after completion');assert.equal(await page.locator('.day-workout.is-complete').count(),5);
 await page.reload();assert.equal(await page.locator('#firstRun').isVisible(),false);assert.equal((await getData()).completedWorkouts.length,5);
 await page.locator('nav [data-screen="today"]').click();
 // Exercise touch-driven horizontal scrolling in Chromium, not just the arrow handlers.
 await page.clock.runFor(900);
 const rail=page.locator('#dayCarousel'),box=await rail.boundingBox();
 const beforeSwipe=await rail.evaluate(e=>e.scrollLeft);
 const cdp=await context.newCDPSession(page);
 const swipeY=Math.round(box.y+80);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:310,y:swipeY}]});
 for(let x=290;x>=70;x-=20){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:swipeY}]});await page.waitForTimeout(20)}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await page.clock.runFor(900);
 assert.ok(await rail.evaluate(e=>e.scrollLeft)>beforeSwipe+50,'touch swipe advances the weekly rail');
 assert.match(await page.locator('#dayPosition').innerText(),/Saturday|Sunday/);
 if(process.env.LHRF_SCREENSHOT)await page.screenshot({path:process.env.LHRF_SCREENSHOT,fullPage:true});
 assert.deepEqual(errors,[]);
 console.log('PASS five tabs; weekly rail/controls; single weekly calendar; completion across changed training days; read-only previews; Start/readiness; top set/back-offs; validation; independent strength/run logging and once-daily readiness; reload/resume; finish/feedback; data preservation.');
 // Sunday completion and the Monday/DST boundary must not relabel old workouts as future.
 await page.clock.setSystemTime(new Date('2026-10-25T10:00:00Z'));
 await page.reload();await page.locator('nav [data-screen="today"]').click();
 await page.clock.runFor(100); // Flush the two animation frames used to select the calendar day.
 assert.equal(await page.locator('#todaySessions button').count(),0);
 assert.equal(await page.locator('.day-workout.is-complete').count(),5);
 assert.match(await page.locator('#dayPosition').innerText(),/Sunday 25 Oct/);
 for(let repeat=0;repeat<3;repeat++){
  await page.reload();await page.locator('nav [data-screen="today"]').click();await page.clock.runFor(150);
  assert.match(await page.locator('#dayPosition').innerText(),/Sunday 25 Oct/,'Detached or hidden calendar callbacks cannot reset the current day');
 }

 await page.clock.setSystemTime(new Date('2026-10-26T10:00:00Z'));
 await page.reload();await page.locator('nav [data-screen="today"]').click();
 await page.clock.runFor(100); // Flush the two animation frames used to select the calendar day.
 assert.equal(await page.locator('#todaySessions button').count(),0,'past active week is never rolled forward');
 assert.match(await page.locator('#thisWeekCarousel').innerText(),/19 Oct – 25 Oct/);
 assert.equal((await getData()).onboardingComplete,true);
 assert.deepEqual(errors,[]);
 console.log('PASS touch swipe and Sunday/Monday dates across UK daylight-saving change.');
 await context.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
