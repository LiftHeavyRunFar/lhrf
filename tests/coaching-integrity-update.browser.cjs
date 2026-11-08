// Current-production same-origin PWA upgrade. Fictional local data only.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {reopenForWaitingUpdate}=require('./workout-update-helpers.cjs');
const clone=x=>JSON.parse(JSON.stringify(x)),root=path.join(__dirname,'..'),base=process.env.LHRF_INTEGRITY_BASE;
const currentShell=fs.readFileSync(path.join(root,'sw.js'),'utf8').match(/const CACHE = '([^']+)'/)[1];
const KEY='lhrf_beta_v1118_clean',LIVE='lhrf_fresh_beta_live_v1114';
(async()=>{
 if(!base)throw Error('Set LHRF_INTEGRITY_BASE to pinned production commit b59a720.');
 let candidate=false,browser;
 const server=http.createServer((req,res)=>{try{
  const pathname=new URL(req.url,'http://localhost').pathname,file=path.join(candidate?root:base,pathname==='/'?'index.html':pathname);
  res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.ttf')?'font/ttf':'text/html');res.end(fs.readFileSync(file));
 }catch{res.statusCode=404;res.end()}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({timezoneId:'Europe/London'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.clock.install({time:new Date('2026-11-07T19:00:00Z')});
  const data=require('./training-mode-fixture.cjs').fixture();data.customRoadmap.programmeId='synthetic-reviewed-integrity-update';
  data.reviewedProgramme={id:data.customRoadmap.programmeId,config:clone(data.customRoadmap),weeks:Array.from({length:5},(_,i)=>({week:i+1,sessions:i===1?clone(data.activeSchedule):[]}))};
  const s=data.activeSchedule[0],live={...clone(s),week:2,entries:{},notes:'Keep this fictional active draft',started:'2026-11-06T06:00:00Z',trainingPrescription:clone(s)};
  await page.addInitScript(({KEY,LIVE,data,live})=>{if(location.protocol!=='http:')return;if(!localStorage.getItem(KEY))localStorage.setItem(KEY,JSON.stringify(data));if(!localStorage.getItem(LIVE))localStorage.setItem(LIVE,JSON.stringify(live))},{KEY,LIVE,data,live});
  const stored=()=>page.evaluate(({KEY,LIVE})=>({data:localStorage.getItem(KEY),live:localStorage.getItem(LIVE)}),{KEY,LIVE});
  const url='http://localhost:'+server.address().port+'/';await page.goto(url);await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  const before=await stored();assert.deepEqual(JSON.parse(before.data),data);
  candidate=true;await page.evaluate(async()=>{await(await navigator.serviceWorker.getRegistration()).update()});
  await page.locator('#lhrf-update-banner').waitFor({state:'visible'});
  await reopenForWaitingUpdate(page);
  await page.waitForFunction(()=>!!window.LHRFCoach);
  assert.deepEqual(await stored(),before,'PWA update must preserve the entire saved programme, history, Garmin links and active draft');
  const correctedDistance=()=>page.evaluate(()=>{
   const run={name:'Easy aerobic run',role:'easy-run',minutes:60,durationRangeMinutes:{min:55,max:60},distanceKm:10,workMinutes:0,pace:'5:30 to 6:00/km',steps:[{label:'Easy run',role:'easy',distanceKm:10,pace:'5:30 to 6:00/km'}]};
   return LHRFCoach.createEngine({data:{decisions:[{approved:true,kind:'hybrid-load',week:2,key:'synthetic-check',factor:.9,intervention:'running-duration'}]}}).applyApprovedHybridRunning([{id:'synthetic',ex:[],runs:[run]}],2)[0].runs[0].distanceKm;
  });
  assert.equal(await correctedDistance(),9,'Updated app must execute the corrected engine');
  await page.waitForFunction(async shell=>(await caches.keys()).includes(shell)&&!!navigator.serviceWorker.controller,currentShell);
  await context.setOffline(true);await page.reload();await page.waitForFunction(()=>!!window.LHRFCoach);
  assert.equal(await correctedDistance(),9);assert.deepEqual(await stored(),before);assert.deepEqual(errors,[]);
  assert.equal(await page.evaluate(()=>LHRFCoach.prepareNewProgramme({coachingRulesVersion:2,weeks:1,bench:1,squat:0,deadlift:0,runs:0},{data:{sets:[],runs:[]}}).coachingRuntimeVersion),1,'Corrected new-proposal engine and its evidence dependency must be available offline');
  console.log('PASS production -> coaching-integrity app update and offline reload; exact saved programme/history/RPE/Garmin/draft preservation; corrected engine active.');
  await context.close();
 }finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1});
