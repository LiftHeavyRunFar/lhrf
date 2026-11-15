// Independent synthetic browser QA, isolated test origin; no real athletes or Garmin.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),DATA='lhrf_beta_v1118_clean',LIVE='lhrf_fresh_beta_live_v1114';
const ORIGIN='https://native-meet-qa.test',PENDING_RUN=LIVE+'_pendingRun';
async function setup(browser,id,{includeRunning=true}={}){
 const context=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,timezoneId:'Europe/London',serviceWorkers:'block'}),page=await context.newPage(),errors=[];
 page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.addInitScript(()=>{window.LHRF_NATIVE_MEET_TEST=true});
 await page.route('**/*',r=>{const url=new URL(r.request().url());if(url.origin!==ORIGIN)return r.abort();let p=url.pathname;if(p.endsWith('/'))p+='index.html';const f=path.resolve(root,'.'+p);if(!f.startsWith(root+path.sep)||!fs.existsSync(f))return r.fulfill({status:404});const ext=path.extname(f);return r.fulfill({body:fs.readFileSync(f),contentType:ext==='.js'?'application/javascript':ext==='.css'?'text/css':ext==='.json'?'application/json':'text/html'})});
 await page.clock.install({time:new Date('2026-11-16T09:00:00Z')});await page.goto(ORIGIN+'/');
 await page.getByRole('button',{name:'Strength training',exact:true}).click();await page.locator('#native-catalogue-programme').selectOption(id);
 if(id==='powerlifting-four-day')for(const lift of ['Squat','Bench','Deadlift'])await page.getByLabel(lift+' · where do you struggle?').selectOption('unsure');
 await page.getByLabel('First calendar week').fill('2026-11-16');await page.getByRole('button',{name:'Preview programme',exact:true}).click();await page.getByRole('button',{name:'Get my programme',exact:true}).click();
 if(includeRunning){
  await page.getByRole('button',{name:'Add running programme'}).click();await page.locator('#native-catalogue-programme').selectOption('marathon-two-run-16');await page.getByLabel('First calendar week').fill('2026-11-16');await page.getByRole('button',{name:'Preview programme',exact:true}).click();await page.getByRole('button',{name:'Get my programme',exact:true}).click();
 }else await page.getByRole('button',{name:'Go to programme',exact:true}).click();
 await page.locator('#catalogueSetupDialog').waitFor({state:'hidden'});
 const state=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),DATA),installed=await state();assert.equal(installed.customRoadmap.cataloguePlans.length,includeRunning?2:1);
 const first=installed.activeSchedule.filter(s=>s.ex?.length).sort((a,b)=>a.scheduledDate.localeCompare(b.scheduledDate))[0];assert.ok(first);
 await page.clock.setFixedTime(new Date(first.scheduledDate+'T09:00:00Z'));await page.reload();
 for(const dot of await page.locator('#dayDots button').all())if((await dot.getAttribute('aria-label')||'').toLowerCase().startsWith(first.day.toLowerCase())){await dot.click();break}
 await page.locator('.day-slide.is-current').getByRole('button',{name:/^Preview workout /}).first().click();await page.locator('#previewStart').click();if(await page.locator('#readinessModal[open]').count())await page.locator('#readinessContinue').click();
 for(const detail of await page.locator('#liveExercises details').all()){if(!await detail.evaluate(e=>e.open))await detail.locator('summary').click();for(const row of await detail.locator('.live-set').all()){const weight=row.locator('[data-field=weight]');if(!Number(await weight.inputValue()))await weight.fill('20');await row.locator('[data-field=rpe]').fill('7');await row.locator('.set-check').click()}}
 await page.locator('#liveFinish').click();await page.locator('#finishAndSave').click();if(await page.locator('#liveFeedbackSkip').count())await page.locator('#liveFeedbackSkip').click();
 const logged=await state();assert.ok(logged.completedWorkouts?.length);assert.ok(logged.sets?.length);return {context,page,state,logged,errors};
}
async function review(page,id,oldId){await page.locator('nav [data-screen="plan"]').click();await page.getByRole('button',{name:'Review meet preparation',exact:true}).click();await page.locator('#native-catalogue-programme').selectOption(id);if(id==='powerlifting-four-day')for(const lift of ['Squat','Bench','Deadlift'])await page.getByLabel(lift+' · where do you struggle?').selectOption('unsure');await page.getByLabel('I have a competition in 6–12 weeks').check();await page.getByLabel('Actual competition date').fill('2027-01-05');await page.getByLabel('Strength programme to switch from').selectOption(oldId);await page.getByRole('button',{name:'Preview programme',exact:true}).click();}

async function verifyRejectedWrites(page, panel, id) {
 const read = () => page.evaluate(key => ({
  stored: localStorage.getItem(key), inMemory: JSON.stringify(data),
 }), DATA);
 const before = await read();
 const accept = page.getByRole('button', {name: 'Get my programme', exact: true});
 const waitForMessage = text => page.waitForFunction(expected =>
  document.getElementById('native-catalogue-message')?.textContent.includes(expected), text);

 assert.equal(await page.evaluate(key => localStorage.getItem(key), LIVE), null);
 const pending = JSON.stringify({fixture: 'pending fictional run'});
 await page.evaluate(({key, pending}) => localStorage.setItem(key, pending), {key: PENDING_RUN, pending});
 await accept.click();
 await waitForMessage('Finish the active workout before changing your programme');
 assert.deepEqual(await read(), before, 'pending run must block changes to stored and in-memory training');
 assert.equal(await page.evaluate(key => localStorage.getItem(key), PENDING_RUN), pending);
 assert.equal(await panel.isVisible(), true);
 await page.evaluate(key => localStorage.removeItem(key), PENDING_RUN);
 console.log('PASS native synthetic pending-run rejection', id);

 await page.evaluate(key => {
  const setItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (name, value) {
   if (this === localStorage && name === key) {
    Storage.prototype.setItem = setItem;
    throw new DOMException('Synthetic meet storage write failure', 'QuotaExceededError');
   }
   return setItem.call(this, name, value);
  };
 }, DATA);
 await accept.click();
 await waitForMessage('Storage failed: Synthetic meet storage write failure');
 assert.deepEqual(await read(), before, 'failed write must leave the programme, history and schedule untouched');
 assert.equal(await panel.isVisible(), true, 'the athlete can retry the same reviewed proposal');
 console.log('PASS native synthetic failed meet save leaves training unchanged', id);
}

async function addRunningAfterMeet(browser, id) {
 const {context,page,state,logged,errors} = await setup(browser,id,{includeRunning:false});
 try {
  const old = logged.customRoadmap.cataloguePlans[0];
  await page.clock.setFixedTime(new Date('2026-11-20T09:00:00Z'));
  await page.reload();
  await review(page,id,old.id);
  await page.getByLabel('I have reviewed the opening week, easier weeks, final week and transition.').check();
  await page.getByRole('button',{name:'Get my programme',exact:true}).click();
  await page.locator('#catalogueSetupDialog').waitFor({state:'hidden'});
  const before = await state();
  const sessions = data => data.reviewedProgramme.weeks.flatMap(week=>week.sessions);
  assert.ok(sessions(before).some(session=>session.eventType==='strength'&&session.eventDate==='2027-01-05'));

  await page.locator('nav [data-screen="plan"]').click();
  await page.getByRole('button',{name:'Add running',exact:true}).click();
  await page.locator('#native-catalogue-programme').selectOption('10k');
  await page.getByLabel('Runs per week').selectOption('2');
  await page.getByLabel('First calendar week').fill('2026-11-16');
  await page.getByRole('button',{name:'Preview programme',exact:true}).click();
  assert.doesNotMatch(await page.locator('#native-catalogue-preview').innerText(),/\bnull(?:null)?\b/);
  await page.getByRole('button',{name:'Get my programme',exact:true}).click();
  await page.locator('#catalogueSetupDialog').waitFor({state:'hidden'});

  const after = await state();
  const running = after.customRoadmap.cataloguePlans.at(-1);
  assert.equal(running.snapshot.discipline,'running');
  assert.equal(running.snapshot.sessionsPerWeek,2);
  assert.equal(running.snapshot.durationWeeks,6);
  assert.deepEqual(sessions(after).filter(s=>!s.catalogueOccurrenceId?.startsWith(running.id+'-')),sessions(before));
  assert.deepEqual(after.customRoadmap.catalogueOccurrences.filter(o=>o.planId!==running.id),before.customRoadmap.catalogueOccurrences);
  assert.equal(after.customRoadmap.catalogueOccurrences.filter(o=>o.planId===running.id).length,12);
  assert.deepEqual(after.completedWorkouts,before.completedWorkouts);
  assert.deepEqual(after.sets,before.sets);
  await page.reload();
  assert.deepEqual(await state(),after);
  assert.deepEqual(errors,[]);
  console.log('PASS native add two-run 10K after reviewed meet, preserving strength dates and history',id);
 } finally { await context.close(); }
}

(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});try{for(const id of ['powerlifting-three-day','powerlifting-four-day']){
 const {context,page,state,logged,errors}=await setup(browser,id);try{
 const old=logged.customRoadmap.cataloguePlans.find(p=>p.snapshot.id===id),running=logged.customRoadmap.cataloguePlans.find(p=>p.snapshot.discipline==='running');assert.ok(old&&running);
 const runningBefore=logged.reviewedProgramme.weeks.flatMap(w=>w.sessions).filter(s=>s.catalogueOccurrenceId?.startsWith(running.id+'-'));assert.ok(runningBefore.length);
 await page.clock.setFixedTime(new Date('2026-11-20T09:00:00Z'));await page.reload();const prior=await state();
 await review(page,id,old.id);const panel=page.getByRole('region',{name:'Meet preparation review'});await panel.waitFor();assert.match(await panel.innerText(),/5 Jan 2027/);assert.deepEqual(await state(),prior,'review must not change records');
 const reviewedFinal=await panel.evaluate(r=>{let h=[...r.querySelectorAll('h3')].find(x=>x.textContent==='Final week and meet'),result=[];for(let el=h.nextElementSibling;el&&el.tagName==='ARTICLE';el=el.nextElementSibling)result.push(el.querySelector('h4').textContent);return result});assert.ok(reviewedFinal.length>=2);
 await page.getByRole('button',{name:'Get my programme',exact:true}).click();assert.deepEqual(await state(),prior,'unacknowledged review must not change records');
 await page.getByLabel('I have reviewed the opening week, easier weeks, final week and transition.').check();
 await verifyRejectedWrites(page,panel,id);
 await page.getByRole('button',{name:'Get my programme',exact:true}).click();await page.locator('#catalogueSetupDialog').waitFor({state:'hidden'});
 const after=await state();assert.deepEqual(after.completedWorkouts,prior.completedWorkouts);assert.deepEqual(after.sets,prior.sets);assert.deepEqual(after.runs,prior.runs);assert.deepEqual(after.customRoadmap.cataloguePlans.find(p=>p.id===running.id),running);
 const sessions=after.reviewedProgramme.weeks.flatMap(w=>w.sessions);assert.deepEqual(sessions.filter(s=>s.catalogueOccurrenceId?.startsWith(running.id+'-')),runningBefore);const meet=sessions.find(s=>s.eventType==='strength'&&s.eventDate==='2027-01-05');assert.ok(meet,'reviewed off-schedule event must be retained');
 const newPlan=after.customRoadmap.cataloguePlans.at(-1),prefix=newPlan.id+'-w'+newPlan.snapshot.durationWeeks+'-',final=sessions.filter(s=>s.catalogueOccurrenceId?.startsWith(prefix)),fmt=new Intl.DateTimeFormat('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});assert.equal(final.length,reviewedFinal.length);for(const s of final)assert.ok(reviewedFinal.includes(fmt.format(new Date(s.scheduledDate+'T00:00:00Z'))+' · '+s.name),'final date/title must match reviewed display');
 await page.reload();assert.deepEqual(await state(),after,'native data must survive reload');assert.deepEqual(errors,[]);console.log('PASS native synthetic meet accept/reload',id);
 }finally{await context.close()}
 const active=await setup(browser,id);try{
  const {page,state,logged}=active,old=logged.customRoadmap.cataloguePlans.find(p=>p.snapshot.id===id);
  const next=logged.activeSchedule.filter(s=>s.ex?.length&&s.scheduledDate>'2026-11-16').sort((a,b)=>a.scheduledDate.localeCompare(b.scheduledDate))[0];assert.ok(next);
  await page.clock.setFixedTime(new Date(next.scheduledDate+'T09:00:00Z'));await page.reload();await page.locator('nav [data-screen="today"]').click();for(const dot of await page.locator('#dayDots button').all())if((await dot.getAttribute('aria-label')||'').toLowerCase().startsWith(next.day.toLowerCase())){await dot.click();break}
  await page.locator('.day-slide.is-current').getByRole('button',{name:/^Preview workout /}).first().click();await page.locator('#previewStart').click();if(await page.locator('#readinessModal[open]').count())await page.locator('#readinessContinue').click();
  const draft=await page.evaluate(k=>localStorage.getItem(k),LIVE),before=await state();assert.ok(draft,'native workout draft must exist');
  await review(page,id,old.id);const panel=page.getByRole('region',{name:'Meet preparation review'});if(await panel.isVisible()){await page.getByLabel('I have reviewed the opening week, easier weeks, final week and transition.').check();await page.getByRole('button',{name:'Get my programme',exact:true}).click()}
  assert.match(await page.locator('#native-catalogue-message').innerText(),/active workout|in-progress workout/i,'the active-workout guard must explain the rejection');
  assert.deepEqual(await state(),before,'active workout must prevent programme change');assert.equal(await page.evaluate(k=>localStorage.getItem(k),LIVE),draft,'active draft must remain identical');
  await page.reload();assert.equal(await page.evaluate(k=>localStorage.getItem(k),LIVE),draft,'active draft survives reload');assert.deepEqual(await state(),before);console.log('PASS native synthetic active-draft rejection',id);
 }finally{await active.context.close()}
 await addRunningAfterMeet(browser,id);
 }
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
