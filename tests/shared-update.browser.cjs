// Real service-worker upgrade/offline test using synthetic local records and an ephemeral localhost server.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {normalizeProfile}=require('../src/coach-adapters.js');
(async()=>{let upgraded=false;const current=path.join(__dirname,'..'),previous=process.env.LHRF_PREVIOUS_ROOT;
 if(!previous)throw Error('Set LHRF_PREVIOUS_ROOT to the pre-extraction Today-fix checkout.');
 const server=http.createServer((req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname,file=path.join(upgraded?current:previous,pathname==='/'?'index.html':pathname);res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.webmanifest')?'application/manifest+json':'text/html');res.end(fs.readFileSync(file))}catch(e){res.statusCode=404;res.end('Not found')}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;try{browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']})}catch(e){await new Promise(resolve=>server.close(resolve));throw e}
 try{
  const c=normalizeProfile(require('./athletes/profiles.cjs')[0].config),ex=[['Bench',1,3,120,8,{role:'top',category:'primary'}]];
  const fixture={onboardingComplete:true,customRoadmap:c,activeCustomWeek:1,activeSchedule:[{id:'saved-bench',day:'Tuesday',name:'Saved programme',ex,runs:[]}],sets:[],runs:[],checkins:[],plannedRuns:[],goals:{strength:'Bench',running:'10K PB'},decisions:[],overrides:{},completedWorkouts:[],sentinel:'preserve through upgrade'};
  const live={id:'saved-bench',name:'Existing active session',day:'Tuesday',ex,runs:[],entries:{},notes:'Preserve unsaved session notes',started:'2026-10-25T10:00:00Z'};
  const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(({fixture,live})=>{if(!localStorage.getItem('lhrf_beta_v1118_clean'))localStorage.setItem('lhrf_beta_v1118_clean',JSON.stringify(fixture));if(!localStorage.getItem('lhrf_fresh_beta_live_v1114'))localStorage.setItem('lhrf_fresh_beta_live_v1114',JSON.stringify(live))},{fixture,live});
  const url='http://localhost:'+server.address().port+'/';await page.goto(url);await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await page.waitForTimeout(150);await page.waitForLoadState('load');
  assert.equal(await page.evaluate(()=>!!navigator.serviceWorker.controller),true);
  upgraded=true;await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update()});
  await page.locator('#lhrf-update-banner').waitFor({state:'visible'});await Promise.all([page.waitForNavigation({waitUntil:'load'}),page.locator('#lhrf-update-banner button').click()]);
  await page.waitForFunction(()=>typeof window.LHRFCoach?.createEngine==='function');
  const state=()=>page.evaluate(()=>({data:JSON.parse(localStorage.getItem('lhrf_beta_v1118_clean')),live:JSON.parse(localStorage.getItem('lhrf_fresh_beta_live_v1114'))}));
  assert.deepEqual((await state()).data,fixture);assert.deepEqual((await state()).live,live);
  await context.setOffline(true);await page.reload();await page.waitForFunction(()=>typeof window.LHRFCoach?.createEngine==='function');
  assert.equal(await page.locator('#firstRun').isVisible(),false);assert.deepEqual((await state()).data,fixture);assert.deepEqual((await state()).live,live);assert.deepEqual(errors,[]);
  console.log('PASS existing PWA -> shared-engine update via Update now -> offline reload; saved programme, onboarding and active workout preserved.');await context.close();
 }finally{await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exitCode=1});
