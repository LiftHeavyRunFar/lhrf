// Current production (history merged) -> combined candidate. Synthetic data only.
const assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const coach=require('../src/coach-engine'),registry=require('../src/exercise-registry');
const KEY='lhrf_beta_v1118_clean',LIVE='lhrf_fresh_beta_live_v1114',CONNECTION='lhrf_intervals_connection_v1';
const root=path.join(__dirname,'..'),previous=process.env.LHRF_COMBINED_BASE;
if(!previous)throw Error('Set LHRF_COMBINED_BASE to an archive of production main 719ef246d27f40796beaec194c5ffc2db986aa75.');
(async()=>{
 let upgraded=false,browser;
 const server=http.createServer((req,res)=>{
  try{
   const pathname=new URL(req.url,'http://localhost').pathname;
   const file=path.join(upgraded?root:previous,pathname==='/'?'index.html':pathname);
   res.setHeader('Cache-Control','no-store');
   res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.webmanifest')?'application/manifest+json':'text/html');
   res.end(fs.readFileSync(file));
  }catch{res.statusCode=404;res.end('Not found');}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,timezoneId:'Europe/London'});
  const page=await context.newPage(),errors=[],uploads=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
  const inventory=require('./equipment-fixtures.cjs').fullInventory();
  const ex=name=>[name,3,5,100,7,{...registry.identity(name,inventory),role:'straight'}];
  const strength={id:'replacement-thu',day:'Thursday',name:'Squat + Deadlift',ex:[ex('Squat'),ex('Deadlift')],runs:[]};
  const steps=[{label:'Warm-up',role:'easy',distanceKm:1,pace:'7:00 to 7:45/km'},
   {label:'Work',role:'work',distanceKm:.4,pace:'6:25 to 6:40/km'},
   {label:'Recovery',role:'recovery',distanceKm:.2,pace:'7:00/km'},
   {label:'Work',role:'work',distanceKm:.4,pace:'6:25 to 6:40/km'},
   {label:'Cool-down',role:'easy',distanceKm:1,pace:'7:00 to 7:45/km'}];
  const run={id:'prescribed-friday',day:'Friday',scheduledDate:'2026-11-06',name:'Controlled repeats',ex:[],runs:[{name:'Controlled repeats',role:'quality-run',distanceKm:3,steps}]};
  const stamp='2026-10-29T06:30:00Z';
  const fixture={onboardingComplete:true,customRoadmap:coach.approveProgrammeConfig({...require('../programmes/november-2026.json')}),
   activeCustomWeek:1,activeSchedule:[strength,run],equipmentInventory:inventory,
   sets:['Squat','Deadlift'].flatMap((exercise,i)=>[1,2].map(set=>({exercise,...registry.identity(exercise,inventory),date:stamp,session:'Archived strength',sessionId:'old-99',week:99,set,weight:i?140:112.5,reps:5,rpe:set===1?7.5:8}))),
   runs:[{date:'2026-10-30T08:00:00Z',km:5,min:34,source:'garmin-personal',garminActivityId:'synthetic-123',sessionId:'old-run'}],
   completedWorkouts:[{id:'old-99',name:'Archived strength',date:stamp,week:99,completedSets:4}],
   plannedRuns:[{id:'old-run',activityId:'synthetic-123'}],checkins:[],decisions:[],goals:{strength:'Bench',running:'10K PB'},overrides:{}};
  const live={...strength,sourceProgrammeWeek:1,entries:{'0_0':{weight:'119',reps:'4',rpe:'8',done:false}},notes:'Retain this active draft',started:'2026-11-05T06:00:00Z'};
  const connection={id:'synthetic',name:'Synthetic runner',key:'synthetic-key'};
  await page.addInitScript(({KEY,LIVE,CONNECTION,fixture,live,connection})=>{
   for(const [key,value] of [[KEY,fixture],[LIVE,live],[CONNECTION,connection]])if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(value));
  },{KEY,LIVE,CONNECTION,fixture,live,connection});
  const state=()=>page.evaluate(({KEY,LIVE,CONNECTION})=>Object.fromEntries([KEY,LIVE,CONNECTION].map(key=>[key,localStorage.getItem(key)])),{KEY,LIVE,CONNECTION});
  const origin='http://localhost:'+server.address().port;
  await page.goto(origin+'/');await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  const previousShellKeys=await page.evaluate(async()=>(await caches.keys()).filter(key=>key.startsWith('lhrf-shell-')));
  const expected=await state();assert.equal(expected[KEY],JSON.stringify(fixture));assert.equal(expected[LIVE],JSON.stringify(live));
  const checkHistory=async()=>{
   await page.locator('nav [data-screen=train]').click();await page.locator('#previousWorkout').evaluate(el=>el.open=true);
   const text=await page.locator('#previousWorkout').innerText();
   for(const pattern of [/Squat/,/Deadlift/,/29\/10\/2026/,/112.5 kg × 5 reps · RPE 7.5/,/140 kg × 5 reps · RPE 8/,/Context only/])assert.match(text,pattern);
   assert.equal(await page.locator('.live-set [data-field=weight]').first().inputValue(),'119');assert.deepEqual(await state(),expected);
  };
  const preview=()=>page.evaluate(run=>previewPlannedWorkout(run,new Date('2026-11-06T12:00:00'),2),run);
  await checkHistory();await preview();assert.equal(await page.locator('#livePreview [data-garmin-preview]').count(),0);await page.locator('#previewClose').click();
  upgraded=true;await page.evaluate(async()=>{await(await navigator.serviceWorker.getRegistration()).update()});
  await page.locator('#lhrf-update-banner').waitFor({state:'visible'});
  await Promise.all([page.waitForNavigation({waitUntil:'load'}),page.locator('#lhrf-update-banner button').click()]);
  await checkHistory();
  const shell=await page.evaluate(async()=>{
   const keys=(await caches.keys()).filter(key=>key.startsWith('lhrf-shell-'));
   const paths=['/src/performance-history.js','/src/mobile-ux.js','/src/intervals-sync.js'];
   return {keys,cached:await Promise.all(paths.map(p=>caches.match(location.origin+p).then(Boolean)))};
  });
  assert.equal(shell.keys.length,1);assert.notDeepEqual(shell.keys,previousShellKeys);assert.deepEqual(shell.cached,[true,true,true]);
  await context.route('https://intervals.icu/api/v1/athlete/0**',async route=>{
   const req=route.request(),headers={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type','access-control-allow-methods':'GET,POST,OPTIONS'};
   if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});
   if(req.method()==='GET')return route.fulfill({json:{id:'synthetic',name:'Synthetic runner'},headers});
   const event=req.postDataJSON()[0];uploads.push(event);
   const parsed=event.description.split('\n').map(line=>{
    const m=line.match(/ ([\d.]+)km (\d+:\d{2})(?:-(\d+:\d{2}))?\/km Pace intensity=(\w+)$/);
    assert.ok(m);const seconds=value=>value.split(':').reduce((n,x)=>n*60+Number(x),0);
    return {distance:Number(m[1])*1000,intensity:m[4],pace:{start:seconds(m[2]),end:seconds(m[3]||m[2]),units:'secs/km'}};
   });
   return route.fulfill({json:[{...event,id:123,workout_doc:{steps:parsed}}],headers});
  });
  await preview();await page.locator('#livePreview [data-garmin-preview]').click();
  assert.equal(await page.locator('#intervalsWorkoutDate').inputValue(),'2026-11-06');
  const send=async()=>{await page.locator('#sendIntervalsWorkout').click();await page.waitForFunction(()=>document.getElementById('intervalsSendStatus').textContent.includes('Watch delivery is not yet confirmed'))};
  await send();await page.locator('#intervalsWorkoutDate').fill('2026-11-08');await send();
  assert.equal(uploads.length,2);assert.equal(uploads[0].external_id,uploads[1].external_id);assert.equal(uploads[1].start_date_local,'2026-11-08T00:00:00');
  assert.deepEqual(uploads[0].description.split('\n').map(line=>line.match(/intensity=(\w+)/)[1]),['warmup','active','rest','active','cooldown']);
  assert.equal(uploads[0].description,uploads[1].description);assert.deepEqual(await state(),expected);
  await page.locator('#runToolsClose').click();await checkHistory();
  await context.setOffline(true);await page.reload();await checkHistory();
  assert.equal(await page.evaluate(()=>typeof LHRFIntervals.workoutEvent),'function');
  await preview();assert.equal(await page.locator('#livePreview [data-garmin-preview]').count(),1);
  await page.locator('#livePreview [data-garmin-preview]').click();assert.match(await page.locator('#garminPreview').innerText(),/Recovery/);
  assert.deepEqual(await state(),expected);assert.deepEqual(errors,[]);
  console.log('PASS production 719ef24 -> combined PWA update/offline: history refs + Garmin preview/structured export/moved-date identity; original sets/RPE, programme, equipment, Garmin links, private connection and active draft byte-preserved; mocked service only, watch delivery unverified');
  await context.close();
 }finally{
  if(browser)await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
 }
})().catch(error=>{console.error(error);process.exitCode=1});
