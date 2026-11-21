const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const {fixture}=require('./training-start-fixture.cjs');
const root=path.resolve(process.env.OWNER_CANDIDATE_ROOT||path.join(__dirname,'..'));
const ORIGIN='https://personal-return-qa.test',MAIN='lhrf_beta_v1118_clean',LIVE='lhrf_fresh_beta_live_v1114';
async function setup(browser,id,enabled){
 const context=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,timezoneId:'Europe/London',serviceWorkers:'block'}),page=await context.newPage();page.setDefaultTimeout(12000);
 await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin!==ORIGIN)return route.abort();const p=path.resolve(root,'.'+(u.pathname.endsWith('/')?u.pathname+'index.html':u.pathname));if(!p.startsWith(root+path.sep)||!fs.existsSync(p))return route.fulfill({status:404});return route.fulfill({body:fs.readFileSync(p),contentType:p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':'text/html'});});
 await page.clock.install({time:new Date('2026-11-21T12:00:00Z')});
 await page.addInitScript(({state,enabled,MAIN})=>{window.LHRF_TRAINING_START_REVIEW_TEST=enabled;if(!localStorage.getItem('fictional-start-seed')){localStorage.setItem(MAIN,JSON.stringify(state));localStorage.setItem('fictional-start-seed','yes');}}, {state:fixture(id),enabled,MAIN});
 await page.goto(ORIGIN);await page.locator('nav [data-screen="settings"]').waitFor();
 const ready=async()=>page.evaluate(async()=>{if(window.LHRFDurableCheckpoint)await window.LHRFDurableCheckpoint.whenSaved();});await ready();
 const stored=()=>page.evaluate(k=>localStorage.getItem(k),MAIN);
 return {context,page,stored,ready};
}
async function openReview(page){
 await page.locator('nav [data-screen="settings"]').click();const group=page.locator('#settingsProgramme');if(!await group.evaluate(e=>e.open))await group.locator(':scope > summary').click();
 const panel=page.locator('#trainingStartReview');if(!await panel.evaluate(e=>e.open))await panel.locator(':scope > summary').click();await panel.getByRole('button',{name:'Preview choices',exact:true}).waitFor();return panel;
}
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});try{
 const disabled=await setup(browser,'powerlifting-four-day',false);assert.equal(await disabled.page.locator('#trainingStartReview').count(),0);await disabled.context.close();console.log('PASS proposed training-start UI absent with flag off');
 for(const id of ['powerlifting-three-day','powerlifting-four-day']){
  const {context,page,stored,ready}=await setup(browser,id,true);try{
   const before=await stored();let panel=await openReview(page);
   await panel.getByLabel('Competition squat loading',{exact:true}).selectOption('rpe');await panel.getByLabel('Competition deadlift loading',{exact:true}).selectOption('rpe');
   const preview=panel.getByRole('button',{name:'Preview choices',exact:true}),out=page.locator('#trainingStartPreview');
   await preview.click();assert.match(await out.innerText(),/Week 1: 34 → 34/);assert.match(await out.innerText(),/Competition squat.*choose weight on the day/);assert.match(await out.innerText(),/Competition bench.*kg suggested/);assert.match(await out.innerText(),/Readiness is not assessed/);
   await panel.getByLabel('Starting option',{exact:true}).selectOption('1');await preview.click();assert.match(await out.innerText(),/Week 1: 34 → 21/);assert.match(await out.innerText(),/resume original week 2 \(37 strength sets\)/);
   await panel.getByLabel('Starting option',{exact:true}).selectOption('2');await preview.click();assert.match(await out.innerText(),/Week 2: 37 → 24/);assert.match(await out.innerText(),/resume original week 3 \(37 strength sets\)/);assert.match(await out.innerText(),/Running prescriptions and dates stay unchanged/);
   await ready();assert.equal(await stored(),before);
   await panel.getByRole('button',{name:'Cancel review',exact:true}).click();assert.equal(await panel.evaluate(e=>e.open),false);assert.equal(await stored(),before);
   await page.reload();await ready();assert.equal(await stored(),before);panel=await openReview(page);assert.equal(await panel.getByLabel('Competition squat loading',{exact:true}).inputValue(),'prescribed');assert.equal(await panel.getByLabel('Starting option',{exact:true}).inputValue(),'0');
   console.log('PASS',id,'mixed loading and 0/1/2 strength intro review, original return jump, cancel/reload; history, running, settings and prescriptions unchanged');
   await panel.getByRole('button',{name:'Cancel review',exact:true}).click();await page.clock.setFixedTime(new Date('2026-12-01T12:00:00Z'));await page.reload();await ready();await page.locator('nav [data-screen="today"]').click();
   for(const dot of await page.locator('#dayDots button').all())if((await dot.getAttribute('aria-label')||'').startsWith('Tuesday')){await dot.click();break;}
   await page.locator('.day-slide.is-current').getByRole('button',{name:/^Preview workout /}).first().click();await page.locator('#previewStart').click();if(await page.locator('#readinessModal[open]').count())await page.locator('#readinessContinue').click();await ready();
   const live=await page.evaluate(k=>localStorage.getItem(k),LIVE),main=await stored();assert.ok(live);panel=await openReview(page);await panel.getByRole('button',{name:'Preview choices',exact:true}).click();assert.match(await out.innerText(),/Finish the active workout/);assert.equal(await stored(),main);assert.equal(await page.evaluate(k=>localStorage.getItem(k),LIVE),live);
   console.log('PASS',id,'existing active-workout guard preserves main and live draft during proposal review');
  }finally{await context.close();}
 }
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
