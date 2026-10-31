// Synthetic users enter the actual first-run UI. No live browser profile or real records.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const coach=require('../src/coach-engine'),install=require('../src/programme-install');
const approved=require('./fixtures/approved-peak-v2.json').config;
const cases=[...require('./fixtures/five-scenario-engine-inputs.json').cases,...require('./fixtures/original-three-engine-inputs.json').cases];
const KEY='lhrf_beta_v1118_clean',stamp='2026-10-30T12:00:00Z';
const clone=x=>JSON.parse(JSON.stringify(x));
function legacy(){
 let d={customRoadmap:clone(approved),activeCustomWeek:1,activeSchedule:coach.createEngine().generatedSessions(approved,1),sets:[{date:'2026-10-27T07:00:00Z',exercise:'Bench',weight:120,reps:5,rpe:7,role:'top',week:1,sessionId:'november-2026-custom-tue::strength'}],runs:[{km:5,min:33,date:'2026-10-28T12:00:00Z'}],checkins:[{date:'2026-10-29T12:00:00Z',sleep:3,energy:4,soreness:2,stress:2}],sessionFeedback:[{date:'2026-10-27T08:00:00Z',difficulty:'expected'}],plannedRuns:[],decisions:[{approved:true,kind:'adaptive-progression',exercise:'Bench',factor:1.075,week:1,date:'2026-10-27T08:00:00Z'}],overrides:{},completedWorkouts:[{id:'november-2026-custom-tue::strength',week:1}],goals:{strength:'Bench',running:'10K PB'},onboardingComplete:true};
 d=install.refreshApprovedBenchPeak(install.refreshApprovedBenchProgramme(install.refreshApprovedRunningProgramme(d,coach,stamp),coach,stamp),coach,stamp);return d;
}
async function set(page,id,value){
 const loc=page.locator('#'+id),tag=await loc.evaluate(el=>el.tagName);
 if(tag==='SELECT')await loc.selectOption(String(value));else await loc.fill(value==null?'':String(value));
}
const read=page=>page.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)),KEY);
function preserved(after,before,approval=false){
 for(const k of ['sets','runs','checkins','completedWorkouts','decisions','sessionFeedback'])assert.deepEqual(after[k],before[k],k+' retained');
 if(!approval){assert.deepEqual(after.customRoadmap,before.customRoadmap);assert.deepEqual(after.activeSchedule,before.activeSchedule);assert.deepEqual(after.overrides,before.overrides);assert.equal(after.activeCustomWeek,before.activeCustomWeek)}
}
async function contextFor(browser){
 const context=await browser.newContext({viewport:{width:390,height:844},timezoneId:'Europe/London',serviceWorkers:'block'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.clock.install({time:new Date(stamp)});
 await page.route('http://intake.test/**',route=>{const p=new URL(route.request().url()).pathname,file=path.join(__dirname,'..',p==='/'?'index.html':p);return route.fulfill({body:fs.readFileSync(file),contentType:p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':p.endsWith('.png')?'image/png':'text/html'})});
 await page.addInitScript(({KEY,fixture})=>{if(!localStorage.getItem(KEY))localStorage.setItem(KEY,JSON.stringify(fixture))},{KEY,fixture:legacy()});
 await page.goto('http://intake.test/');const before=await read(page);assert.equal(await page.locator('#firstRun').isVisible(),false);
 await page.evaluate(()=>document.getElementById('restartOnboardingLink').click());return {context,page,before,errors};
}
async function enter(page,id){
 const c=cases.find(x=>x.id===id).config,v=c.visitConstraints,h=c.runningHistory||{};
 await page.locator('#frNext').click();await page.locator('[name="frFocus"][value="'+c.hybridFocus+'"]').check();await page.locator('#frNext').click();
 for(const [field,value]of Object.entries({frGoal:c.event,frExperience:c.trainingAge,frStrengthMode:c.orderedGoals?.[0]?.strengthMode||c.strengthMode,frStartDate:c.startDate,frStrengthDate:c.strengthTargetDate||'',frRunningDate:c.runningTargetDate||'',frRunGoal:c.runGoal,frRunningTarget:c.runningGoalSeconds?Math.floor(c.runningGoalSeconds/60)+':'+String(c.runningGoalSeconds%60).padStart(2,'0'):'',frLiftPriority:'Squat',frGoalStrategy:c.orderedGoals?'staged':'joint',frStrengthGoal:c.event==='powerlifting'?'powerlifting':'general'}))await set(page,field,value);
 if(c.orderedGoals)await set(page,'frRecoveryDays',c.orderedGoals[0].recoveryDays??7);
 if(!await page.getByText('Event-day availability',{exact:true}).evaluate(el=>el.parentElement.open))await page.getByText('Event-day availability',{exact:true}).click();
 for(const [kind,date]of [['Strength',c.strengthTargetDate],['Running',c.runningTargetDate]])if(date){const event=v.eventDays[date];await page.locator('#fr'+kind+'EventConfirmed').setChecked(event?.confirmed===true);await set(page,'fr'+kind+'EventMinutes',event?.minutes??'');}
 await page.locator('#frNext').click();
 for(const [field,value]of Object.entries({frDays:c.availableDays.length,frSquat:c.squat,frBench:c.bench,frDeadlift:c.deadlift,frRuns:c.runs,frStrengthVisits:v.strengthVisits,frLongDay:c.longRunDay||'Sun'}))await set(page,field,value);
 for(const day of ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])await page.locator('.fr-day[value="'+day+'"]').setChecked(c.availableDays.includes(day));
 for(const day of c.availableDays){await page.locator('.fr-double[value="'+day+'"]').setChecked(v.combinedDays.includes(day));await page.locator('.fr-separate[value="'+day+'"]').setChecked(v.separateDays.includes(day));await page.locator('.fr-minute[data-day="'+day+'"]').fill(String(v.minutes[day]));}
 await set(page,'frGapHours',v.minimumGapHours||6);
 if(c.orderedGoals){if(!await page.locator('#frAfterWrap').evaluate(el=>el.open))await page.locator('#frAfterWrap > summary').click();const next=c.orderedGoals[1];for(const [key,field]of [['runs','Runs'],['bench','Bench'],['squat','Squat'],['deadlift','Deadlift'],['strengthVisits','StrengthVisits']])await set(page,'frAfter'+field,next[key]);}
 await page.locator('#frNext').click();
 for(const name of ['Squat','Bench','Deadlift']){await set(page,'frMax'+name,c.liftProfiles[name].kg||'');await set(page,'frMax'+name+'Reps',c.liftProfiles[name].reps||1);}
 await page.getByText('Recent running history',{exact:true}).click();
 for(const [field,value]of Object.entries({frRunDistance:c.runProfile.distance,frRunTime:c.runProfile.time,frRunKm:c.runProfile.weeklyKm,frResultDate:c.runProfile.resultDate||'',frResultEffort:c.runProfile.effort,frResultEnvironment:c.runProfile.environment==='outside'?'outdoor':c.runProfile.environment||'outdoor',frRunHistory:(h.weeklyKm||[]).join(', '),frLongKm:h.longRun?.km??'',frLongMinutes:h.longRun?.minutes??'',frLongRecovery:h.longRun?.recoveryHours??'',frRecentMarathon:h.recentMarathonDate||'',frFatigueStatus:'normal'}))await set(page,field,value);
 await page.locator('#frNext').click();assert.equal(await page.locator('.fr-step.on').getAttribute('data-step'),'5');
}
async function backToGoals(page){for(let i=0;i<3;i++)await page.locator('#frBack').click();assert.equal(await page.locator('.fr-step.on').getAttribute('data-step'),'2')}
async function returnToPreview(page){for(let i=0;i<3;i++)await page.locator('#frNext').click();assert.equal(await page.locator('.fr-step.on').getAttribute('data-step'),'5')}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  // A: inspect and explicitly approve a feasible new v2 plan over a legacy programme.
  {
   const {context,page,before,errors}=await contextFor(browser);await enter(page,'A');preserved(await read(page),before);
   assert.equal(await page.locator('#frNext').isEnabled(),true);
   await page.getByText('Explore weekly sessions',{exact:true}).click();await page.locator('#frPreview details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));assert.match(await page.locator('#frPreview').innerText(),/Squat|Bench/);
   await page.locator('#frNext').click();assert.equal(await page.locator('#firstRun').isVisible(),false);
   const after=await read(page);preserved(after,before,true);assert.equal(after.customRoadmap.coachingRulesVersion,2);assert.equal(after.customRoadmap.visitConstraints.strengthVisits,2);assert.deepEqual(after.customRoadmap.visitConstraints.minutes,{Tue:75,Thu:75,Sun:105});assert.deepEqual(after.customRoadmap.runningHistory.weeklyKm,[20,22,23,24,22,25]);assert.notEqual(after.customRoadmap.programmeId,before.customRoadmap.programmeId);
   assert.deepEqual(after.programmeArchive.at(-1).programme,before.customRoadmap);assert.deepEqual(after.programmeArchive.at(-1).schedule,before.activeSchedule);assert.ok(after.activeSchedule.every(s=>s.id.startsWith(after.customRoadmap.sessionNamespace)));
   const native=await page.evaluate(c=>LHRFCoachAdapters.buildNewProgramme(c,{now:()=>Date.parse('2026-10-30T12:00:00Z')}),after.customRoadmap);assert.ok(native.weeks.every(w=>w.feasible));assert.ok(native.weeks[0].sessions.every(s=>s.timeBudget?.feasible));
   await page.reload();assert.equal(await page.locator('#firstRun').isVisible(),false);assert.deepEqual(await read(page),after);assert.deepEqual(errors,[]);await context.close();
  }
  // B: a future event outside the stated time window blocks approval, not only week-one preview.
  {
   const {context,page,before,errors}=await contextFor(browser);await enter(page,'B');assert.equal(await page.locator('#frNext').isDisabled(),true);preserved(await read(page),before);
   assert.match(await page.locator('#frWarnings').innerText(),/event|availability|participation|time/i);
   await backToGoals(page);await page.locator('#frRunningEventConfirmed').check();await set(page,'frRunningEventMinutes',150);await returnToPreview(page);assert.equal(await page.locator('#frNext').isEnabled(),true);preserved(await read(page),before);
   await page.locator('#frNext').click();const after=await read(page);preserved(after,before,true);assert.deepEqual(after.customRoadmap.visitConstraints.eventDays['2027-03-21'],{confirmed:true,minutes:150});assert.deepEqual(errors,[]);await context.close();
  }
  // C: the real intake creates a dated sport handover and protects two separate Tuesday visits.
  {
   const {context,page,before,errors}=await contextFor(browser);await enter(page,'C');assert.equal(await page.locator('#frNext').isDisabled(),true);preserved(await read(page),before);
   await backToGoals(page);await page.locator('#frStrengthEventConfirmed').check();await returnToPreview(page);assert.equal(await page.locator('#frNext').isEnabled(),true);await page.locator('#frNext').click();
   const after=await read(page);preserved(after,before,true);const c=after.customRoadmap;assert.equal(c.orderedGoals.length,2);assert.equal(c.orderedGoals[0].priority,'Running');assert.equal(c.orderedGoals[1].priority,'Squat');assert.equal(c.orderedGoals[1].runs,2);assert.deepEqual(c.visitConstraints.separateDays,['Tue']);assert.equal(c.visitConstraints.minimumGapHours,6);
   const p=await page.evaluate(c=>LHRFCoachAdapters.buildNewProgramme(c,{now:()=>Date.parse('2026-10-30T12:00:00Z')}),c);assert.equal(p.weeks[0].priority,'Running');assert.equal(p.weeks[7].priority,'Squat');const runs=p.weeks[7].sessions.flatMap(s=>s.runs||[]);assert.equal(runs.length,2);assert.ok(runs.every(r=>r.role==='easy-run'));
   const separate=p.weeks[0].sessions.find(s=>s.day==='Tue').timeBudget;assert.equal(separate.separate,true);assert.equal(separate.visits.length,2);assert.ok(separate.visits.every(v=>v.totalMinutes<=75));assert.deepEqual(errors,[]);await context.close();
  }
  // O3: unknown pace remains a timed health run throughout preview, timer and actual logging.
  {
   const {context,page,before,errors}=await contextFor(browser);await enter(page,'O3');assert.equal(await page.locator('#frNext').isEnabled(),true);preserved(await read(page),before);await page.locator('#frNext').click();
   const accepted=await read(page),health=accepted.activeSchedule.find(s=>s.runs?.some(r=>r.distanceKnown===false));assert.ok(health);assert.ok(health.runs.every(r=>r.minutes===20&&r.distanceKnown===false));
   await page.locator('nav [data-screen="today"]').click();await page.locator(`[data-session-id="${health.id}"]`).first().click();assert.match(await page.locator('#livePreview').innerText(),/20 min|20:00/i);await page.locator('#previewStart').click();
   if(await page.locator('#readinessModal').count()){await page.getByRole('button',{name:'Review readiness',exact:true}).click();await page.locator('#readinessContinue').click();}
   await page.locator('#liveRunTools').click();assert.equal(await page.locator('#startCanonicalTimer').isEnabled(),true);assert.equal(await page.locator('#sendIntervalsWorkout').isDisabled(),true);assert.match(await page.locator('#runPlanSummary').innerText(),/20:00 time target.*distance is not prescribed/);assert.doesNotMatch(await page.locator('#runSteps').innerText(),/Add a recent running PB/);
   const steps=await page.evaluate(()=>plannedSteps);assert.equal(steps.length,1);assert.equal(steps[0].seconds,1200);assert.equal(steps[0].timeOnly,true);await page.locator('#startCanonicalTimer').click();await page.clock.runFor(1100);assert.doesNotMatch(await page.locator('#timerClock').innerText(),/NaN/);await page.locator('#runToolsClose').click();
   await page.locator('#liveRunKm').fill('2.4');await page.locator('#liveRunMinutes').fill('20');await page.locator('#liveLogRun').click();await page.locator('#liveFinish').click();await page.locator('#liveFeedbackSkip').click();
   const finished=await read(page);assert.equal(finished.runs.length,before.runs.length+1);assert.equal(finished.runs.at(-1).km,2.4);assert.equal(finished.runs.at(-1).min,20);assert.equal(Object.hasOwn(finished.runs.at(-1),'rpe'),false);assert.deepEqual(finished.customRoadmap,accepted.customRoadmap);assert.deepEqual(finished.sets,before.sets);assert.equal(finished.completedWorkouts.length,before.completedWorkouts.length+1);assert.deepEqual(errors,[]);await context.close();
  }
  console.log('PASS real v2 intake, full-horizon event gating, explicit proposal approval, legacy-history preservation, reload, ordered priority handover, independent separate-visit budgets and an unknown-pace health run timed and logged honestly.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
