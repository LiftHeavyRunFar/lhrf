// QA-only: five isolated native app journeys; fictional athletes and storage only.
// Fails closed when any athlete cannot complete onboarding, first-workout logging and reload.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {observeOnboardingProposal,onboardingProposal}=require('./onboarding-browser-proposal.cjs');
const OUT=process.env.LHRF_QA_OUT||'/tmp/lhrf-five-journeys',KEY='lhrf_beta_v1118_clean';
fs.mkdirSync(OUT,{recursive:true});
const people=[
 {id:'beginner',scope:'strength',focus:'strength',goal:'general',experience:'beginner',days:['Mon','Wed','Fri'],visits:3,squat:2,bench:2,deadlift:1,runs:0,weeks:8},
 {id:'powerlifter',scope:'strength',focus:'strength',goal:'powerlifting',experience:'advanced',days:['Mon','Wed','Fri'],visits:3,squat:2,bench:3,deadlift:1,runs:0,weeks:12,strengthDate:'2027-02-20'},
 {id:'runner-10k',scope:'running',focus:'running',goal:'running',experience:'intermediate',days:['Tue','Sat'],visits:0,squat:0,bench:0,deadlift:0,runs:2,weeks:6,runGoal:'10K'},
 {id:'hybrid',scope:'hybrid',focus:'balanced',goal:'general',experience:'intermediate',days:['Mon','Tue','Thu','Sat'],visits:2,squat:1,bench:2,deadlift:1,runs:2,weeks:8},
 {id:'returning',scope:'strength',focus:'strength',goal:'general',experience:'returning',days:['Tue','Thu'],visits:2,squat:1,bench:2,deadlift:1,runs:0,weeks:8}
];
const safe=(x)=>JSON.parse(JSON.stringify(x));
async function set(page,id,value){
 const el=page.locator('#'+id);if(!await el.count()||!await el.isVisible())return;
 const tag=await el.evaluate(x=>x.tagName);
 if(tag==='SELECT')await el.selectOption(String(value));else await el.fill(String(value));
}
async function runOne(browser,p){
 const context=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,timezoneId:'Europe/London',serviceWorkers:'block'});
 const page=await context.newPage(),errors=[],steps=[],record={profile:p.id,inputs:p,steps,errors};
 page.on('pageerror',e=>errors.push(e.message));
 page.on('dialog',d=>d.accept());
 page.setDefaultTimeout(9000);
 try{
  await page.clock.install({time:new Date('2026-11-16T09:00:00Z')});
  await page.route('https://qa-lhrf.test/**',async route=>{
   const u=new URL(route.request().url()),filename=path.join(__dirname,'..',u.pathname==='/'?'index.html':u.pathname);
   if(!fs.existsSync(filename))return route.fulfill({status:404,body:'Not found: '+u.pathname});
   const ext=path.extname(filename),type={'.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'}[ext]||'text/html';
   await route.fulfill({body:fs.readFileSync(filename),contentType:type});
  });
  await page.goto('https://qa-lhrf.test/?setup=custom');
  await observeOnboardingProposal(page);
  assert.equal(await page.locator('#firstRun').isVisible(),true);
  steps.push('fresh first-run');
  await set(page,'frScope',p.scope);
  if(await page.locator('[name=frFocus][value='+p.focus+']').isVisible())await page.locator('[name=frFocus][value='+p.focus+']').check();
  await page.locator('#frNext').click();
  assert.equal(await page.locator('.fr-step.on').getAttribute('data-step'),'2');
  await set(page,'frGoal',p.goal);
  await set(page,'frExperience',p.experience);
  await set(page,'frStrengthMode','progression');
  await set(page,'frStartDate','2026-11-16');
  await set(page,'frWeeks',p.weeks);
  if(p.strengthDate)await set(page,'frStrengthDate',p.strengthDate);
  if(p.runGoal)await set(page,'frRunGoal',p.runGoal);
  await page.locator('#frNext').click();
  assert.equal(await page.locator('.fr-step.on').getAttribute('data-step'),'3',await page.locator('#frError').innerText());
  steps.push('goal and experience entered');
  if(await page.locator('#frModeCoach').isVisible())await page.locator('#frModeCoach').click();
  for(const day of ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])await page.locator('.fr-day[value='+day+']').setChecked(p.days.includes(day));
  await page.locator('#frWeeklyDetails > summary').click();
  if(p.visits)await set(page,'frStrengthVisits',p.visits);
  for(const [id,n] of [['frSquat',p.squat],['frBench',p.bench],['frDeadlift',p.deadlift],['frRuns',p.runs]])if(n>0)await set(page,id,n);
  await page.locator('#frNext').click();
  assert.equal(await page.locator('.fr-step.on').getAttribute('data-step'),'4',await page.locator('#frError').innerText());
  steps.push('training days selected');
  if(p.scope!=='running'){
   for(const [name,kg] of [['Squat',p.experience==='advanced'?170:90],['Bench',p.experience==='advanced'?125:65],['Deadlift',p.experience==='advanced'?195:110]]){
    await set(page,'frMax'+name,kg);
    await set(page,'frMax'+name+'Reps',1);
   }
  }
  if(p.scope!=='strength'){
   const panel=page.locator('#frRunningResult > summary');
   if(await panel.count()&&!await page.locator('#frRunningResult').evaluate(x=>x.open))await panel.click();
   await set(page,'frRunTime',p.id==='runner-10k'?'55:00':'30:00');
   await set(page,'frRunDistance',p.id==='runner-10k'?'10K':'5K');
   await set(page,'frRunKm',p.id==='runner-10k'?15:12);
  }
  await page.locator('#frNext').click();
  assert.equal(await page.locator('.fr-step.on').getAttribute('data-step'),'5',await page.locator('#frError').innerText());
  const proposal=await onboardingProposal(page);
  record.coaching={weeks:proposal.weeks?.length,firstWeek:proposal.weeks?.[0],lastWeek:proposal.weeks?.at(-1),feasible:proposal.weeks?.every(w=>w.feasible)};
  assert.ok(proposal.weeks?.length,'Programme has no weeks');
  assert.ok(proposal.weeks[0].sessions?.length,'First week has no sessions');
  steps.push('full programme preview available');
  await page.locator('#frNext').click();
  assert.equal(await page.locator('#firstRun').isVisible(),false,await page.locator('#frApprovalError').innerText());
  steps.push('programme installed');
  const state=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
  const installed=await state();assert.ok(installed.onboardingComplete&&installed.activeSchedule?.length);
  const session=installed.activeSchedule.find(s=>s.ex?.length||s.runs?.length);
  assert.ok(session,'No executable first workout');
  record.firstWorkout={id:session.id,day:session.day,exercises:session.ex?.length||0,runs:session.runs?.length||0};
  record.availableWorkoutIds=await page.locator('[data-session-id]').evaluateAll(els=>els.map(e=>e.getAttribute('data-session-id')).slice(0,20));
  for(const id of [session.id+(session.runs?.length&&!session.ex?.length?'::run':''),session.id,session.id+'::run',session.id+'::strength']){
    try{await page.evaluate(key=>openWorkout(key),id)}catch(error){record.previewErrors=(record.previewErrors||[]).concat(id+': '+error.message)}
    if(await page.locator('#livePreview').count()){record.openedId=id;break}
  }
  assert.ok(await page.locator('#livePreview').count(),'Workout preview absent; available ids '+record.availableWorkoutIds.join(','));
  steps.push('first workout previewed');
  await page.locator('#previewStart').click();
  if(await page.locator('#readinessModal[open]').count())await page.locator('#readinessContinue').click();
  if(session.runs?.length){
    await page.locator('#liveRunKm').fill(String(session.runs[0].distanceKm||3));
    await page.locator('#liveRunMinutes').fill(String(session.runs[0].minutes||25));
    await page.locator('#liveLogRun').click();
  }
  if(session.ex?.length){
    const first=page.locator('.live-set [data-field=weight]').first();
    assert.ok(await first.count(),'No strength logging input');
    await first.fill(String(session.ex[0]?.[3]||40));
    await page.locator('.set-check').first().click();
  }
  await page.locator('#liveFinish').click();
  record.finishDebug={liveError:await page.locator('#liveError').allTextContents(),finishDialogCount:await page.locator('#finishSessionDialog').count(),buttons:await page.locator('button:visible').allTextContents().then(x=>x.slice(-15)),errors:errors.slice()};
  await page.locator('#finishAndSave').click();
  if(await page.locator('#liveFeedbackSkip').count())await page.locator('#liveFeedbackSkip').click();
  const saved=await state();
  assert.ok(saved.completedWorkouts?.length>0,'Completed workout did not persist');
  assert.ok((saved.sets?.length||0)+(saved.runs?.length||0)>0,'No actual logged data');
  record.saved={sets:saved.sets?.length||0,runs:saved.runs?.length||0,completed:saved.completedWorkouts?.length||0};
  steps.push('workout logged');
  await page.reload();
  assert.deepEqual(await state(),saved,'Reload changed athlete state');
  steps.push('persistence after reload');
  assert.equal(errors.length,0,errors.join('\n'));
  record.passed=true;
 }catch(e){
  record.passed=false;record.failure=e.stack||e.message;
  try{record.screen=await page.screenshot({path:path.join(OUT,p.id+'-failure.png'),fullPage:true}).then(()=>p.id+'-failure.png')}catch(_){}
 }finally{
  fs.writeFileSync(path.join(OUT,p.id+'.json'),JSON.stringify(record,null,2));
  await context.close();
 }
 return record;
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 let results;
 try{results=[];for(const p of people)results.push(await runOne(browser,p));}
 finally{await browser.close();}
 console.log('LHRF_FIVE_ATHLETE_RESULTS='+JSON.stringify(results.map(r=>({profile:r.profile,passed:r.passed,steps:r.steps,failure:r.failure?.slice(0,400),finishDebug:r.finishDebug,availableWorkoutIds:r.availableWorkoutIds,errors:r.errors}))));
 if(results.some(r=>!r.passed))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
