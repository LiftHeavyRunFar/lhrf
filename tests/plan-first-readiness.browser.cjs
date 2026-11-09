// Pixel-sized browser replay using fictional sessions and readiness reports.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const key='lhrf_beta_v1118_clean';
const run={name:'Threshold repeats',role:'quality-run',minutes:30,distanceKm:5,
 steps:[{label:'Warm-up',role:'easy',distanceKm:1,pace:'6:00/km'},{label:'Threshold',role:'work',distanceKm:4,pace:'5:30/km'}]};
async function replay(browser,{symptoms='',legacy=false}={}){
 const context=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,timezoneId:'Europe/London',serviceWorkers:'block'});
 try{
  const page=await context.newPage(),errors=[],alerts=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('dialog',async dialog=>{alerts.push(dialog.message());await dialog.accept();});
  await page.clock.install({time:new Date('2026-11-10T08:00:00Z')});
  const data={onboardingComplete:true,customRoadmap:{startDate:'2026-11-09',weeks:1,runs:1,integratedCoachingVersion:1,...(legacy?{}:{planFirstVersion:1})},
   activeCustomWeek:1,activeSchedule:[{id:'planned-run',day:'Tue',name:run.name,ex:[],run:true,runs:[run]}],
   sets:[],runs:[],completedWorkouts:[],sessionFeedback:[],checkins:[],decisions:[],overrides:{}};
  await page.addInitScript(({key,data})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(data));},{key,data});
  await page.route('http://plan-first.test/**',async route=>{
   const pathname=new URL(route.request().url()).pathname,file=path.join(__dirname,'..',pathname==='/'?'index.html':pathname);
   if(!fs.existsSync(file)){await route.fulfill({status:404});return;}
   await route.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html'});
  });
  await page.goto('http://plan-first.test/');
  await page.locator('[data-session-id="planned-run"]:visible').first().click();
  await page.locator('#previewStart').click();
  for(const [id,value] of [['sleep','1'],['energy','1'],['soreness','5'],['stress','5']])await page.locator('#'+id).selectOption(value);
  await page.locator('#symptoms').fill(symptoms);
  await page.locator('#readinessContinue').click();
  const adjustment=page.getByRole('button',{name:'Accept adjustment'});
  assert.equal(await adjustment.isVisible(),legacy);
  if(legacy)return;
  if(symptoms){
   assert.match(await page.locator('#readinessSafety').innerText(),/You reported symptoms/);
   await page.locator('#readinessContinue').click();
  }
  const live=await page.evaluate(()=>LHRFLive.get());
  if(symptoms){
   assert.equal(live,null);
   assert.ok(alerts.some(message=>message.includes('reported symptoms')));
  }else assert.deepEqual(live.runs,[run]);
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  assert.equal(saved.checkins.length,1);
  assert.deepEqual(saved.activeSchedule,data.activeSchedule);
  assert.deepEqual(saved.decisions,[]);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  await replay(browser,{legacy:true});
  await replay(browser);
  await replay(browser,{symptoms:'Sharp knee pain while running.'});
  console.log('PASS legacy low-score option, plan-first exact workout, scoped symptom stop, saved state preserved');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
