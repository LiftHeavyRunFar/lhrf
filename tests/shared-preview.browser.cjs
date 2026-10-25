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
 await page.locator('#liveFinish').click();await page.locator('#liveFeedbackSkip').click();
 const logs=await page.evaluate(()=>JSON.parse(localStorage.getItem('lhrf-v2-genuine-training-log')));assert.equal(logs.length,1);assert.ok(logs[0].sets.length>0);
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('lhrf_beta_v1118_clean'))),fixture,'Trial must not modify the saved programme, onboarding or genuine logs');
 await page.goto('http://shared.test/coaching-preview.html');assert.ok(await page.locator('#performanceReview').isVisible());
 assert.match(await page.locator('#logHistory').innerText(),/Recorded real sessions \(1\)/);
 assert.deepEqual(errors,[]);
 console.log('PASS shared preview generation -> live trial with all sets -> isolated log -> shared review; original programme and onboarding preserved.');
 await context.close();
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
