// Standalone updated-coach intake and saved trial profile; genuine app storage is isolated.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const KEY='lhrf_beta_v1118_clean',fixture={onboardingComplete:true,sentinel:'unchanged approved athlete',sets:[{weight:100,reps:3,rpe:8}],runs:[{km:5,min:32}],completedWorkouts:[{id:'kept'}]};
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});try{
 const context=await browser.newContext({viewport:{width:390,height:844},timezoneId:'Europe/London',serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install({time:new Date('2026-10-31T12:00:00Z')});
 await page.route('http://preview-intake.test/**',route=>{const f=new URL(route.request().url()).pathname;return route.fulfill({body:fs.readFileSync(path.join(__dirname,'..',f==='/'?'coaching-preview.html':f)),contentType:f.endsWith('.js')?'application/javascript':'text/html'})});
 await page.addInitScript(({KEY,fixture})=>{if(!localStorage.getItem(KEY))localStorage.setItem(KEY,JSON.stringify(fixture))},{KEY,fixture});await page.goto('http://preview-intake.test/');
 await page.locator('[name="v2Enabled"]').check();
 for(const [name,value]of Object.entries({weeks:'10',startDate:'2026-11-02',runningTargetDate:'2027-01-10',bench:'2',squat:'1',deadlift:'1',runs:'3',benchMax:'90',squatMax:'125',deadliftMax:'150',tenKTime:'50:30',v2StrengthVisits:'2',v2WeeklyKm:'25',v2History:'20,22,23,24,22,25',v2RunningEventMinutes:'90'}))await page.locator('[name="'+name+'"]').fill(value);
 for(const [name,value]of Object.entries({trainingAge:'intermediate',strengthMode:'maintenance',runGoal:'10k',priority:'Running',v2LongDay:'Sun',v2Fatigue:'normal'}))await page.locator('[name="'+name+'"]').selectOption(value);
 for(const day of ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])await page.locator('[name="v2Day'+day+'"]').setChecked(['Tue','Thu','Sun'].includes(day));
 for(const [day,value]of Object.entries({Tue:'75',Thu:'75',Sun:'105'}))await page.locator('[name="v2Minutes'+day+'"]').fill(value);
 await page.getByRole('button',{name:'Generate preview',exact:true}).click();assert.match(await page.locator('#output').innerText(),/needs changes before training/);assert.equal(await page.locator('.trainPrescribed:not([disabled])').count(),0);
 await page.locator('[name="v2RunningEventConfirmed"]').check();await page.getByRole('button',{name:'Generate preview',exact:true}).click();
 assert.match(await page.locator('#output').innerText(),/Coaching policy 2/);assert.doesNotMatch(await page.locator('#output').innerText(),/needs changes before training/);assert.ok(await page.locator('.startPrescribed:not([disabled])').count()>0);
 await page.locator('[name="priority"]').selectOption('Bench');await page.locator('.startPrescribed:not([disabled])').first().click();
 for(const row of await page.locator('#setRows > div').all())await row.locator('.setCompleted').check();await page.getByRole('button',{name:'Save genuine session',exact:true}).click();
 const logs=await page.evaluate(()=>JSON.parse(localStorage.getItem('lhrf-v2-genuine-training-log')));assert.equal(logs.length,1);assert.equal(logs[0].plannedSession.profile.coachingRulesVersion,2);assert.equal(logs[0].plannedSession.profile.priority,'Running','Review must use selected prescription rather than later form edits');
 await page.reload();assert.equal(await page.locator('[name="v2Enabled"]').isChecked(),true);assert.equal(await page.locator('[name="v2DayFri"]').isChecked(),false);assert.equal(await page.locator('[name="v2RunningEventConfirmed"]').isChecked(),true);assert.match(await page.locator('#logHistory').innerText(),/Recorded real sessions \(1\)/);
 assert.deepEqual(await page.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)),KEY),fixture);assert.deepEqual(errors,[]);await context.close();console.log('PASS updated preview respects visit/event gates, preserves selected coaching profile and restores trial inputs without changing approved athlete records.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
