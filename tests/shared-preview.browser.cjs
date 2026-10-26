// Synthetic end-to-end preview -> shared prescription -> live trial -> saved review.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {normalizeProfile}=require('../src/coach-adapters.js');
const config=normalizeProfile({...require('./athletes/profiles.cjs')[0].config,manualSplit:null});
const fixture={onboardingComplete:true,activeCustomWeek:1,customRoadmap:config,activeSchedule:[{id:'saved-bench',name:'Saved programme',day:'Tuesday',ex:[['Bench',1,3,120,8,{role:'top',category:'primary'}]],runs:[]}],sets:[],runs:[],checkins:[],plannedRuns:[],goals:{strength:'Bench',running:'10K PB'},overrides:{},decisions:[],completedWorkouts:[],sentinel:'preserve the real programme'};
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,timezoneId:'Europe/London',serviceWorkers:'block'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.clock.install({time:new Date('2026-10-25T12:00:00Z')});
 await page.route('http://shared.test/**',route=>{const file=new URL(route.request().url()).pathname;route.fulfill({body:fs.readFileSync(path.join(__dirname,'..',file==='/'?'index.html':file)),contentType:file.endsWith('.js')?'application/javascript':file.endsWith('.png')?'image/png':'text/html'})});
 await page.addInitScript(data=>{if(!localStorage.getItem('lhrf_beta_v1118_clean'))localStorage.setItem('lhrf_beta_v1118_clean',JSON.stringify(data))},fixture);
 await page.goto('http://shared.test/coaching-preview.html');
 for(const [name,value] of Object.entries({weeks:'6',startDate:'2026-10-19',strengthTargetDate:'2026-11-28',runningTargetDate:'2026-11-29',tenKTime:'1:05:00'}))await page.locator(`[name="${name}"]`).fill(value);
 await page.getByRole('button',{name:'Generate preview',exact:true}).click();
 assert.match(await page.locator('#output').innerText(),/strength EVENT — 2026-11-28/);
 const week=page.locator('#output .week').filter({has:page.getByRole('heading',{name:'Week 3 — development',exact:true})});
 await week.locator('p').filter({hasText:/Bench: top set/}).locator('.trainPrescribed').first().click();
 await page.waitForURL('**/index.html?trialTrain=1#train');await page.clock.runFor(100);
 assert.equal(await page.locator('.screen.active').getAttribute('id'),'train');
 assert.equal(await page.locator('#firstRun').isVisible(),false);
 const count=await page.locator('.live-ex').count();
 for(let i=0;i<count;i++){
  const sets=await page.locator('.live-ex').nth(i).locator('.live-set').count();
  for(let j=0;j<sets;j++){
   const detail=page.locator('.live-ex').nth(i);if(await detail.getAttribute('open')===null)await detail.locator('summary').click();
   const row=detail.locator('.live-set').nth(j);await row.locator('[data-field="rpe"]').fill(i===0?'8':'7');await row.locator('.set-check').click();
  }
 }
 await page.locator('#liveNotes').fill('Synthetic bench notes');await page.locator('#liveFinish').click();await page.locator('#liveFeedbackSkip').click();
 const logs=await page.evaluate(()=>JSON.parse(localStorage.getItem('lhrf-v2-genuine-training-log')));assert.equal(logs.length,1);assert.ok(logs[0].sets.length>0);assert.equal(logs[0].notes,'Synthetic bench notes');
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('lhrf_beta_v1118_clean'))),fixture,'Trial must not modify the saved programme, onboarding or genuine logs');
 await page.goto('http://shared.test/coaching-preview.html');assert.ok(await page.locator('#performanceReview').isVisible());
 assert.match(await page.locator('#logHistory').innerText(),/Recorded real sessions \(1\)/);
 // Running uses the full canonical prescription through preview -> live -> saved trial.
 await page.getByRole('button',{name:'Generate preview',exact:true}).click();
 const runRow=page.locator('#output .week').filter({has:page.getByRole('heading',{name:'Week 3 — development',exact:true})}).locator('p').filter({has:page.locator('.preview-run-steps')}).first();
 const displayed=await runRow.locator('.preview-run-steps').innerText();assert.doesNotMatch(displayed,/RPE/);
 await runRow.locator('.trainPrescribed').click();await page.waitForURL('**/index.html?trialTrain=1#train');await page.clock.runFor(100);
 const live=await page.evaluate(()=>JSON.parse(localStorage.getItem('lhrf_fresh_beta_live_v1114')));assert.ok(live.runs[0].steps.length>0);assert.ok(live.runs[0].distanceKm>0);
 for(const step of live.runs[0].steps){assert.ok(displayed.includes(step.label));assert.ok(displayed.includes(step.pace));}
 assert.equal(await page.locator('#liveRunRpe').count(),0);assert.doesNotMatch(await page.locator('#liveRunSection').innerText(),/RPE/);
 await page.locator('#liveRunKm').fill(String(live.runs[0].distanceKm));await page.locator('#liveRunMinutes').fill(String(Math.max(1,live.runs[0].minutes)));await page.locator('#liveLogRun').click();await page.locator('#liveNotes').fill('Synthetic run notes');await page.locator('#liveFinish').click();await page.locator('#liveFeedbackSkip').click();
 const afterRun=await page.evaluate(()=>JSON.parse(localStorage.getItem('lhrf-v2-genuine-training-log')));assert.equal(afterRun.length,2);assert.equal(afterRun[1].kind,'run');assert.equal(Object.hasOwn(afterRun[1],'rpe'),false);assert.equal(afterRun[1].km,live.runs[0].distanceKm);assert.equal(afterRun[1].notes,'Synthetic run notes');assert.deepEqual(afterRun[1].plannedSession.planned.run,live.runs[0]);
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('lhrf_beta_v1118_clean'))),fixture,'Run trial also preserves the active programme and history');
 await page.goto('http://shared.test/coaching-preview.html');assert.match(await page.locator('#logHistory').innerText(),/Recorded real sessions \(2\)/);assert.doesNotMatch(await page.locator('#logHistory').innerText(),/RPE undefined|RPE null/);
 assert.deepEqual(errors,[]);
 console.log('PASS shared preview generation -> live trial with all sets -> isolated log -> shared review; original programme and onboarding preserved.');
 await context.close();
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
