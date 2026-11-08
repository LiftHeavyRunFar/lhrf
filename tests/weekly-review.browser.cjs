// Issue #141 acceptance on a Pixel-sized viewport using fictional records only.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {reopenForWaitingUpdate}=require('./workout-update-helpers.cjs');
const root=path.join(__dirname,'..');
const baseline=process.env.LHRF_WEEKLY_REVIEW_BASE;
const DATA='lhrf_beta_v1118_clean', LIVE='lhrf_fresh_beta_live_v1114';
const strength={id:'strength',day:'Monday',name:'Bench',ex:[['Bench press',1,5,60,7]]};
const run={id:'run',day:'Sunday',name:'Easy run',ex:[],runs:[{name:'Easy run',role:'easy-run',distanceKm:4,minutes:25,pace:'6:00/km',steps:[{label:'Easy running',distanceKm:4,pace:'6:00/km'}]}]};
const visit={id:'mixed',day:'Wednesday',name:'Bench + run',ex:strength.ex,runs:run.runs};
const config={...require('./training-mode-fixture.cjs').fixture().customRoadmap,programmeId:'weekly-review-test',startDate:'2026-11-02',weeks:2,bench:1,squat:0,deadlift:0,runs:1};
const history={
 sets:[
  {date:'2026-11-02T10:00:00Z',sessionId:'strength',exercise:'Bench press',weight:60,reps:5,rpe:7},
  {date:'2026-11-03T10:00:00Z',exercise:'Row'},
  {date:'2026-11-01T10:00:00Z',exercise:'Bench press',weight:55,reps:5,rpe:7}
 ],
 runs:[
  {date:'2026-11-04T10:00:00Z',source:'garmin-personal',sourceActivityId:'123',sessionId:'mixed::run',km:4.25,min:28,avgHr:145},
  {date:'2026-11-04T10:00:00Z',source:'garmin-personal',sourceActivityId:'123',sessionId:'mixed::run',km:4.25,min:28},
  {date:'2026-11-05T10:00:00Z',source:'manual',min:18},
  {date:'2026-11-01T10:00:00Z',km:10,min:60}
 ],
 completedWorkouts:[
  {id:'strength',week:1,date:'2026-11-02T10:00:00Z'},
  {id:'mixed::run',week:1,date:'2026-11-04T10:00:00Z',source:'garmin-personal',sourceActivityId:'123',plannedDate:'2026-11-04'}
 ],
 garminSync:{savedAt:'2026-11-05T12:00:00Z',truncated:true}
};
const seed={
 ...history,onboardingComplete:true,activeCustomWeek:1,activeSchedule:[strength,visit,run],
 customRoadmap:config,reviewedProgramme:{config,fingerprint:'synthetic-weekly-review',weeks:[
  {week:1,sessions:[strength,visit,run]},{week:2,sessions:[strength,run]}
 ]},checkins:[],plannedRuns:[],overrides:{},decisions:[],sessionFeedback:[]
};

(async()=>{
 let updated=!baseline,browser;
 const server=http.createServer((request,response)=>{
  try{
   const pathname=new URL(request.url,'http://localhost').pathname;
   const file=path.join(updated?root:baseline,pathname==='/'?'index.html':pathname);
   const types={'.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf'};
   response.setHeader('Content-Type',types[path.extname(file)]||'text/html');
   response.setHeader('Cache-Control','no-store');response.end(fs.readFileSync(file));
  }catch{response.statusCode=404;response.end()}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,timezoneId:'Europe/London'});
  const page=await context.newPage(),errors=[],alerts=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('dialog',dialog=>{alerts.push(dialog.message());dialog.dismiss()});
  await page.clock.install({time:new Date('2026-11-08T15:00:00Z')});
  await page.addInitScript(({key,seed})=>{if(location.protocol==='http:'&&!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(seed))},{key:DATA,seed});
  const url='http://localhost:'+server.address().port+'/';
  await page.goto(url);
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  const stored=key=>page.evaluate(key=>localStorage.getItem(key),key);
  const start=async id=>{
   await page.locator('nav [data-screen=today]').click();
   await page.locator('[data-session-id="'+id+'"]').click();
   await page.locator('#previewStart').click({timeout:5000}).catch(async error=>{
    console.error({alerts,errors,preview:await page.locator('#livePreview').allTextContents()});throw error;
   });
  };
  if(baseline){
   await start('run');
   await page.getByRole('button',{name:'Review readiness',exact:true}).click();
   await page.locator('#readinessContinue').click();
   await page.locator('#liveNotes').fill('Fictional workout in progress');
   const draft=await stored(LIVE),data=await stored(DATA);
   updated=true;
   await page.evaluate(async()=>{await(await navigator.serviceWorker.getRegistration()).update()});
   await page.waitForFunction(async()=>!!(await navigator.serviceWorker.getRegistration()).waiting);
   assert.equal(await stored(LIVE),draft);
   assert.equal(await stored(DATA),data);
   await reopenForWaitingUpdate(page);
   assert.equal(await stored(LIVE),draft);
   assert.equal(await stored(DATA),data);
   assert.equal(await page.locator('#liveNotes').inputValue(),'Fictional workout in progress');
   await page.getByRole('button',{name:'Leave & resume',exact:true}).click();
  }
  await context.setOffline(true);
  await page.reload();
  await page.waitForFunction(async()=>!!navigator.serviceWorker.controller&&
   (await caches.keys()).includes('lhrf-shell-v1.36.2-weekly-review'));
  await page.locator('nav [data-screen=today]').click();
  assert.equal(await page.locator('#today #weeklyRecovery, #today #preWorkoutReadiness').count(),0);
  if(!baseline){
   await start('run');
   await page.locator('#symptoms').fill('Fictional discomfort');
   await page.locator('#readinessContinue').click();
   assert.match(await page.locator('#readinessSafety').innerText(),/reported symptoms/);
   assert.equal(await stored(LIVE),null);
   await page.locator('#readinessBack').click();
   await page.locator('#livePreview').waitFor();
   assert.equal(JSON.parse(await stored(DATA)).checkins.length,0);
   await page.locator('#previewStart').click();
   await page.locator('#readinessContinue').click();
   assert.equal(await page.locator('#readinessModal').isVisible(),false);
   assert.equal(JSON.parse(await stored(DATA)).checkins.length,1);
   await page.getByRole('button',{name:'Leave & resume',exact:true}).click();
  }
  const draft=await stored(LIVE);
  await start('mixed::strength');
  assert.match(alerts.at(-1),/active workout/);
  assert.equal(await stored(LIVE),draft);
  await page.locator('#previewClose').click();
  await page.locator('nav [data-screen=progress]').click();
  await page.locator('#weeklyRecovery>summary').click();
  const fields=page.locator('#weeklyCheckin>label select');
  const save=page.getByRole('button',{name:'Save weekly check-in',exact:true});
  await save.click();
  assert.equal(await page.locator('#weeklyReviewSheet').count(),0);
  for(const [i,value] of ['high','moderate','no'].entries())await fields.nth(i).selectOption(value);
  const original=JSON.parse(await stored(DATA));
  await save.click();
  const sheet=page.getByRole('dialog',{name:'Weekly review',exact:true});
  await sheet.waitFor();
  const heading=await sheet.innerText();
  assert.match(heading,/2 \/ 4\s+Planned sessions done/);
  assert.match(heading,/1\s+Strength sets logged/);
  assert.match(heading,/4\.25 km\s+2 runs logged/);
  assert.match(heading,/Some set records lack details\. Some run distances are missing\./);
  assert.match(heading,/High fatigue reported\./);
  assert.match(heading,/Next week\s+1 strength session · 1 run/);
  assert.doesNotMatch(heading,/import was partial|Heart rate is interpreted/);
  const bounds=await sheet.boundingBox();
  assert.ok(bounds.x>=0&&bounds.x+bounds.width<=393&&bounds.y>=0&&bounds.y+bounds.height<=852);
  assert.equal(await sheet.evaluate(el=>el.scrollHeight<=el.clientHeight),true);
  if(process.env.LHRF_WEEKLY_REVIEW_SCREENSHOT)await page.screenshot({path:process.env.LHRF_WEEKLY_REVIEW_SCREENSHOT});
  await sheet.getByText('View details',{exact:true}).click();
  assert.match(await sheet.innerText(),/import was partial.*Heart rate is interpreted/s);
  assert.match(await sheet.innerText(),/Scheduled sessions\s+Monday · Bench\s+Sunday · Easy run/);
  await page.keyboard.press('Escape');
  await sheet.waitFor({state:'detached'});
  const reopen=page.getByRole('button',{name:'View weekly review',exact:true});
  assert.equal(await reopen.evaluate(el=>document.activeElement===el),true);
  await reopen.click();
  await sheet.getByRole('button',{name:'Done',exact:true}).click();
  const after=JSON.parse(await stored(DATA));
  assert.equal(after.weeklyCheckins.length,1);
  delete after.weeklyCheckins;
  assert.deepEqual(after,original);
  assert.equal(await stored(LIVE),draft);
  assert.deepEqual(errors,[]);
  console.log('PASS Pixel weekly sheet, verified/incomplete totals, duplicate handling, navigation, safety, offline and exact data/draft preservation');
 }finally{
  await browser?.close();
  server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
 }
})().catch(error=>{console.error(error);process.exitCode=1});
