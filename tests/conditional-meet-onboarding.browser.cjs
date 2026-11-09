// Fresh Pixel acceptance for the reported March meet and its partial opening week.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {observeOnboardingProposal, onboardingProposal} = require('./onboarding-browser-proposal.cjs');

const key = 'lhrf_beta_v1118_clean';
const root = path.join(__dirname, '..');
const screenshotDir = process.env.LHRF_QA_MEET_SCREENSHOTS;
const meetDate = '2027-03-27';
const timings = {
  Squat:{daysOut:7, date:'2027-03-20'},
  Bench:{daysOut:5, date:'2027-03-22'},
  Deadlift:{daysOut:9, date:'2027-03-18'}
};
const media = {'.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml',
  '.ttf':'font/ttf','.webmanifest':'application/manifest+json','.json':'application/json'};
const loc = (page,id) => page.locator('#'+id);
const next = page => loc(page,'frNext').tap();
const read = page => page.evaluate(key => localStorage.getItem(key),key);
const session = (proposal, lift) => proposal.weeks.flatMap(week => week.sessions.map(workout => ({week:week.week, workout})))
  .find(({workout}) => workout.ex?.some(ex => ex[5]?.conditionalFinalHeavy?.lift === lift));

async function fresh(browser, origin, start) {
  const context = await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,
    timezoneId:'Europe/London',serviceWorkers:'block'});
  const page = await context.newPage();
  page.setDefaultTimeout(9000);
  const errors = [];
  page.on('pageerror',error => errors.push(error.message));
  page.on('dialog',dialog => dialog.accept());
  await page.clock.install({time:new Date(start+'T10:00:00Z')});
  await page.goto(origin);
  await observeOnboardingProposal(page);
  assert.equal(await loc(page,'firstRun').isVisible(),true,errors.join(' '));
  return {page,context,errors};
}
async function fillMeet(page, {experience='advanced', eventMinutes, evidenceDate, paceOnly = false} = {}) {
  await loc(page,'frScope').selectOption('hybrid');
  await page.locator('[name=frFocus][value=balanced]').check();
  await next(page);
  await loc(page,'frGoal').selectOption('powerlifting');
  await loc(page,'frExperience').selectOption(experience);
  await loc(page,'frStrengthDate').fill(meetDate);
  assert.equal(await page.getByText('I can attend',{exact:false}).count(),0);
  if (eventMinutes) {
    await page.locator('#frEventLimits > summary').tap();
    await loc(page,'frStrengthEventMinutes').fill(String(eventMinutes));
  }
  await next(page);
  assert.equal(await loc(page,'frTimePreference').count(),0);
  assert.equal(await loc(page,'frAdvancedAvailability').count(),0);
  for (const day of ['Mon','Tue','Thu','Sat','Sun']) await page.locator('.fr-day[value='+day+']').check();
  for (const [lift,{daysOut}] of Object.entries(timings)) {
    await loc(page,'frFinalHeavy'+lift+'Mode').selectOption('days');
    await loc(page,'frFinalHeavy'+lift+'Days').fill(String(daysOut));
  }
  await next(page);
  for (const [lift,kg] of Object.entries({Squat:140,Bench:105,Deadlift:165})) {
    await loc(page,'frMax'+lift).fill(String(kg));
    if (evidenceDate) {
      await loc(page,'frMax'+lift+'Date').fill(evidenceDate);
      await loc(page,'frMax'+lift+'Technique').check();
    }
  }
  if (paceOnly) {
    await page.locator('#frRunningResult > summary').tap();
    await loc(page,'frRunTime').fill('55:00');
    await loc(page,'frRunKm').fill('');
  }
  await next(page);
  assert.equal(await page.locator('.fr-step.on').getAttribute('data-step'),'5',await loc(page,'frError').textContent());
  return onboardingProposal(page);
}
async function capture(page, name) {
  if (!screenshotDir) return;
  fs.mkdirSync(screenshotDir,{recursive:true});
  await page.screenshot({path:path.join(screenshotDir,name+'.png')});
}
function confirmEvent(proposal, week) {
  assert.equal(proposal.weeks.length,week);
  assert.deepEqual(proposal.weeks.flatMap(row => row.sessions
    .filter(workout => workout.eventType === 'strength')
    .map(workout => [row.week,workout.eventDate,workout.competitionLifts])),
    [[week,meetDate,['Squat','Bench','Deadlift']]]);
}
async function startFromToday(page, id) {
  await page.locator('nav [data-screen=today]').tap();
  await page.locator('[data-session-id="'+id+'"]:visible').first().tap();
  await loc(page,'previewStart').tap();
  if (await loc(page,'readinessModal').isVisible()) await loc(page,'readinessContinue').tap();
}
async function openPracticeWorkout(page, id) {
  await startFromToday(page,id);
  const index = await page.evaluate(() => LHRFLive.get().ex.findIndex(ex => ex[5]?.conditionalFinalHeavy?.lift === 'Squat'));
  assert.ok(index >= 0);
  const exercise = page.locator('.live-ex[data-exercise-index="'+index+'"]');
  if (await exercise.getAttribute('open') === null) await exercise.locator(':scope > summary').tap();
  const optional = exercise.locator('details').filter({has:page.getByText('Optional competition single',{exact:true})});
  await optional.locator(':scope > summary').press('Enter');
  await optional.locator('p').waitFor({state:'visible'});
  return optional;
}
async function verifyAerobicProgression(page, proposal) {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const dateFor = (week, day) => new Date(Date.UTC(2026,10,9+(week-1)*7+days.indexOf(day),10)).toISOString();
  const runs = proposal.weeks.flatMap(week => week.sessions.filter(workout => !workout.ex?.length && workout.runs?.length===1)
    .map(workout => ({week:week.week,workout,at:dateFor(week.week,workout.day)})));
  const firstBuild = runs.find(row => row.workout.runs[0].conditionalAerobicBuild && row.workout.runs[0].minutes>15);
  assert.ok(firstBuild);
  await page.clock.setFixedTime(new Date(firstBuild.at));
  await page.evaluate(week => {selectPlanDashWeek(week);activatePlanDashWeek();},firstBuild.week);
  const installed = JSON.parse(await read(page));
  const id = installed.customRoadmap.sessionNamespace+firstBuild.workout.id;
  await startFromToday(page,id);
  assert.equal(await page.evaluate(() => LHRFLive.get().runs[0].minutes),15,'Future duration stays at the familiar dose without completed evidence');
  await page.evaluate(() => cancelLiveWorkout());

  const prior = runs.filter(row => Date.parse(firstBuild.at)-Date.parse(row.at)>=86400000 &&
    Date.parse(firstBuild.at)-Date.parse(row.at)<=28*86400000 && row.workout.runs[0].minutes===15).slice(-2);
  assert.equal(prior.length,2);
  await page.evaluate(({key,prior}) => {
    const store=JSON.parse(localStorage.getItem(key));
    store.completedWorkouts ??= [];
    store.sessionFeedback ??= [];
    for (const {week,workout,at:date} of prior) {
      const id=store.customRoadmap.sessionNamespace+workout.id;
      store.completedWorkouts.push({id,date,week,completedRun:true,prescription:{runs:workout.runs}});
      store.runs.push({date,sessionId:id,week,min:15,km:2,rpe:3});
      store.sessionFeedback.push({date,sessionId:id,week,difficulty:'expected',energy:'good',discomfort:'no'});
    }
    localStorage.setItem(key,JSON.stringify(store));
  },{key,prior});
  await page.reload();
  await startFromToday(page,id);
  const checked = await page.evaluate(() => LHRFLive.get().runs[0]);
  assert.equal(checked.minutes,17,'Two comfortable timed runs can earn the next two minutes');
  assert.equal(checked.distanceKnown,false);
  await page.evaluate(() => cancelLiveWorkout());
}
async function verifyLiveRecheck(page, proposal) {
  const practice = session(proposal,'Squat');
  const date = timings.Squat.date;
  await page.clock.setFixedTime(new Date(date+'T10:00:00Z'));
  await page.evaluate(week => {selectPlanDashWeek(week);activatePlanDashWeek();},practice.week);
  const onDate = JSON.parse(await read(page));
  assert.equal(onDate.activeCustomWeek,practice.week);
  const workout = onDate.activeSchedule.find(row => row.ex?.some(ex => ex[5]?.conditionalFinalHeavy?.lift === 'Squat'));
  assert.ok(workout);
  const exercise = workout.ex.find(ex => ex[5]?.conditionalFinalHeavy?.lift === 'Squat');
  const identity = Object.fromEntries(['exerciseId','variantId','loadType','doseUnit'].map(name => [name,exercise[5][name]]));
  assert.ok(Object.values(identity).every(Boolean));
  const noData = await openPracticeWorkout(page,workout.id);
  assert.match(await noData.innerText(),/two recent controlled sessions/i);
  assert.equal(await noData.locator('[data-conditional-single]').count(),0);
  await page.evaluate(() => cancelLiveWorkout());
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const planned = proposal.weeks.flatMap(week => week.sessions.map(session => ({
    week:week.week, session, date:session.scheduledDate ||
      new Date(Date.UTC(2026,10,9+(week.week-1)*7+days.indexOf(session.day),10)).toISOString().slice(0,10)
  })));
  const completed = proposal.finalHeavyPlan.Squat.practiceDates.slice(-2).map((practiceDate,index) => {
    const eligible = ex => ex[0]==='Squat' && ['top','straight'].includes(ex[5]?.role) &&
      ex[5].competition && ex[2]<=3 && ex[4]>=6 && ex[4]<=7.5;
    const visit = planned.find(row => row.date===practiceDate && row.session.ex.some(eligible));
    assert.ok(visit,'A practice date corresponds to compatible installed competition work');
    return {...visit,exercise:visit.session.ex.find(eligible),date:practiceDate+'T10:00:00Z',weight:[100,105][index]};
  });
  assert.equal(completed.length,2);
  await page.evaluate(({key,identity,completed}) => {
    const store = JSON.parse(localStorage.getItem(key));
    store.completedWorkouts ??= [];
    for (const {session,exercise,date,weight,week} of completed) {
      const id = store.customRoadmap.sessionNamespace+session.id;
      store.completedWorkouts.push({id,date,week,prescription:{ex:session.ex}});
      store.sets.push({...identity,exercise:'Squat',date,sessionId:id,weight,reps:exercise[2],rpe:7,role:exercise[5].role});
    }
    localStorage.setItem(key,JSON.stringify(store));
  },{key,identity,completed});
  await page.reload();
  const eligible = await openPracticeWorkout(page,workout.id);
  const before = await read(page);
  const choose = eligible.locator('[data-conditional-single]');
  assert.equal(await choose.isDisabled(),true);
  await eligible.getByRole('checkbox',{name:/competition technique/i}).check();
  assert.equal(await choose.isEnabled(),true);
  await choose.tap();
  const selected = await page.evaluate(() => LHRFLive.get().ex.find(ex => ex[5]?.conditionalSingleAccepted));
  assert.deepEqual(selected.slice(1,5),[1,1,100,7.5]);
  assert.equal(await read(page),before,'The one-workout choice must leave the approved schedule and training history untouched');
  await page.getByText('Single selected for today',{exact:true}).press('Enter');
  await page.locator('[data-conditional-fallback]').tap();
  const restored = await page.evaluate(() => LHRFLive.get().ex.find(ex => ex[5]?.conditionalFinalHeavy?.lift === 'Squat'));
  assert.equal(restored[2],exercise[2]);
  assert.equal(restored[5].conditionalSingleAccepted,undefined);
  assert.equal(await read(page),before);
}
async function approve(page) {
  assert.equal(await loc(page,'frNext').isEnabled(),true,await loc(page,'frWarnings').textContent());
  assert.equal(JSON.parse(await read(page))?.onboardingComplete === true,false);
  await next(page);
  assert.equal(await loc(page,'firstRun').isVisible(),false,await loc(page,'frApprovalError').textContent());
  const saved = await read(page);
  await page.reload();
  assert.equal(await loc(page,'firstRun').isVisible(),false);
  assert.equal(await read(page),saved);
  return JSON.parse(saved);
}

(async () => {
  const server = http.createServer((req,res) => {
    const route = new URL(req.url,'http://localhost').pathname;
    const file = path.join(root,route === '/' ? 'index.html' : route);
    try {
      const body = fs.readFileSync(file);
      res.writeHead(200,{'Content-Type':media[path.extname(file)] || 'text/html','Cache-Control':'no-store'});
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const origin = 'http://localhost:'+server.address().port+'/';
  let browser;
  try {
    browser = await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE || undefined,
      args:['--no-sandbox','--disable-dev-shm-usage']});
    {
      const {page,context,errors} = await fresh(browser,origin,'2026-11-09');
      const proposal = await fillMeet(page,{paceOnly:true});
      confirmEvent(proposal,20);
      assert.equal(proposal.config.competitionConditionalVersion,1);
      assert.equal(proposal.config.visitConstraints.eventDays[meetDate].confirmed,true);
      for (const [lift,{date,daysOut}] of Object.entries(timings)) {
        assert.deepEqual(proposal.config.finalHeavyPreferences[lift],{mode:'athlete',daysOut});
        const plan = proposal.finalHeavyPlan[lift];
        assert.equal(plan.kind,'conditional-single',JSON.stringify(plan));
        assert.equal(plan.date,date);
        assert.equal(plan.daysOut,daysOut);
        assert.match(plan.condition,/recovery|warm.up|practice/i);
        const planned = session(proposal,lift);
        assert.ok(planned, lift+' is actually in the generated sessions');
        const exercise = planned.workout.ex.find(ex => ex[5]?.conditionalFinalHeavy?.lift === lift);
        assert.equal(exercise[5].conditionalFinalHeavy.date,date);
        assert.ok(exercise[2]>=2 && exercise[4]<=7,'Generated session uses bounded rep practice by default');
        assert.equal(exercise[5].finalHeavyExposure,undefined);
      }
      assert.match(await loc(page,'frFinalHeavyPreview').innerText(),/conditional heavy single/i);
      assert.equal(await loc(page,'frReviewStatus').isVisible(),false);
      assert.equal(await loc(page,'frFinalHeavyPreview').getByText('How a conditional single is checked',{exact:true}).count(),1);
      assert.equal(await loc(page,'frFinalHeavyPreview').locator('details').evaluate(el => el.open),false);
      assert.equal(await loc(page,'firstRun').evaluate(el => el.scrollWidth <= el.clientWidth),true);
      await capture(page,'conditional-meet-review');
      const timedRuns = proposal.weeks.flatMap(week => week.sessions.flatMap(workout => workout.runs || []));
      assert.ok(timedRuns.every(run => run.distanceKnown===false && run.role==='easy-run'));
      assert.equal(timedRuns[0].minutes,15);
      assert.ok(timedRuns.some(run => run.minutes>15 && run.conditionalAerobicBuild));
      const installed = await approve(page);
      assert.deepEqual(installed.customRoadmap.finalHeavyPreferences,proposal.config.finalHeavyPreferences);
      assert.ok(installed.activeSchedule.some(workout => workout.ex?.length));
      try {await verifyAerobicProgression(page,proposal);await verifyLiveRecheck(page,proposal);} catch (error) {if(errors.length)error.message+='; '+errors.join('; ');throw error;}
      assert.deepEqual(errors,[]);
      await context.close();
    }
    {
      const {page,context,errors} = await fresh(browser,origin,'2026-11-08');
      const proposal = await fillMeet(page,{eventMinutes:20});
      confirmEvent(proposal,21);
      assert.match(await loc(page,'frSummary').innerText(),/calendar week 21/i);
      assert.equal(await loc(page,'frNext').isDisabled(),true);
      assert.match(await loc(page,'frWarnings').innerText(),/time|window|minutes/i);
      assert.doesNotMatch(await loc(page,'frWarnings').innerText(),/confirm event.day availability/i);
      assert.equal(JSON.parse(await read(page))?.onboardingComplete === true,false);
      await capture(page,'partial-opening-week-blocked');
      await loc(page,'frReviewEditAvailability').tap();
      assert.equal(await loc(page,'frStrengthEventMinutes').isVisible(),true);
      await loc(page,'frStrengthEventMinutes').fill('');
      for (let i=0;i<3;i++) await next(page);
      confirmEvent(await onboardingProposal(page),21);
      await approve(page);
      assert.deepEqual(errors,[]);
      await context.close();
    }
    for (const variant of [
      {experience:'beginner',kind:'technique'},
      {experience:'advanced'},
      {experience:'advanced',evidenceDate:'2027-03-04'}
    ]) {
      const {page,context,errors} = await fresh(browser,origin,'2027-03-08');
      const proposal = await fillMeet(page,variant);
      for (const [lift,{date}] of Object.entries(timings)) {
        const plan = proposal.finalHeavyPlan[lift];
        const dates = plan.practiceDates || [];
        const enough = dates.length>=2 && Date.parse(date)-Date.parse(dates.at(-1))<=14*86400000;
        assert.equal(plan.kind,variant.kind || (enough?'conditional-single':'rep-practice'),JSON.stringify(plan));
        assert.equal(plan.date,date);
      }
      assert.equal(await loc(page,'frNext').isEnabled(),true,await loc(page,'frWarnings').textContent());
      await approve(page);
      assert.deepEqual(errors,[]);
      await context.close();
    }
    console.log('PASS Pixel March meet: exact conditional milestones, bounded fallback, activation/reopen, same-day live evidence and fallback, near-event novice and experienced cases, Week 21 coverage and event-window remedy');
  } finally {
    if (browser) await browser.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {console.error(error);process.exitCode=1;});
