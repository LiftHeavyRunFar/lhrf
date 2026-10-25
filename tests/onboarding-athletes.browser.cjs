// Synthetic fresh-athlete onboarding. No existing browser profile or real records.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});try{
 const context=await browser.newContext({viewport:{width:390,height:844},timezoneId:'Europe/London',serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-25T12:00:00Z')});
 await page.route('http://athlete.test/**',route=>{const file=new URL(route.request().url()).pathname;route.fulfill({body:fs.readFileSync(path.join(__dirname,'..',file==='/'?'index.html':file)),contentType:file.endsWith('.js')?'application/javascript':file.endsWith('.png')?'image/png':'text/html'})});
 await page.goto('http://athlete.test/');assert.equal(await page.locator('#firstRun').isVisible(),true);
 await page.locator('#frNext').click();await page.locator('[name="frFocus"][value="running"]').check();await page.locator('#frNext').click();
 await page.locator('#frNext').click();assert.match(await page.locator('#frError').innerText(),/experience/);
 await page.locator('#frExperience').selectOption('beginner');await page.locator('#frStrengthMode').selectOption('auto');await page.locator('#frGoal').selectOption('running');await page.locator('#frRunGoal').selectOption('10K');await page.locator('#frRunningDate').fill('2027-01-17');await page.locator('#frNext').click();
 for(const [id,v]of Object.entries({frSquat:'1',frBench:'1',frDeadlift:'0',frRuns:'3'}))await page.locator('#'+id).selectOption(v);
 await page.locator('#frNext').click();await page.locator('#frRunTime').fill('55:00');await page.locator('#frRunKm').fill('20');await page.locator('#frNext').click();
 assert.match(await page.locator('#frPreview').textContent(),/RPE 6/);await page.locator('#frNext').click();assert.equal(await page.locator('#firstRun').isVisible(),false);
 const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('lhrf_beta_v1118_clean')));assert.equal(data.customRoadmap.coachingPolicy,'review-v2');assert.equal(data.customRoadmap.trainingAge,'beginner');assert.equal(data.customRoadmap.strengthMode,'auto');assert.equal(data.customRoadmap.hybridFocus,'running');assert.equal(data.customRoadmap.runGoal,'10K');assert.equal(data.sets.length,0);
 assert.ok(data.activeSchedule.flatMap(s=>s.ex).filter(e=>e[5]?.category==='primary').every(e=>e[5].role==='straight'&&e[4]<=7));assert.ok(data.activeSchedule.flatMap(s=>s.ex).every(e=>!e[5]?.optional));
 await page.reload();assert.equal(await page.locator('#firstRun').isVisible(),false);assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('lhrf_beta_v1118_clean'))),data);
 for(const tab of ['today','train','plan','progress','settings']){await page.locator('nav [data-screen="'+tab+'"]').click();assert.equal(await page.locator('.screen.active').getAttribute('id'),tab)}
 assert.deepEqual(errors,[]);await context.close();console.log('PASS new beginner / running-priority onboarding requires experience, activates shared policy, excludes deadlift and preserves settings after reload; all five tabs work.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
