// Disposable synthetic storage only: exercise the blocked updater and the explicit erase flow.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createServer}=require('node:http');
const {chromium,devices}=require('playwright'),oldProgramme=require('../docs/qa/stage-seven/regressions/Taylor.json').programme;
const key='lhrf_beta_v1118_clean',liveKey='lhrf_fresh_beta_live_v1114';
const fixture={onboardingComplete:true,equipmentInventory:require('./equipment-fixtures.cjs').fullInventory(),athlete:{id:'synthetic'},settings:{keep:true},customRoadmap:oldProgramme.config,activeSchedule:oldProgramme.weeks[0].sessions,activeCustomWeek:1,sets:[{exercise:'Bench',weight:100,reps:5,rpe:7}],runs:[{km:5,min:30,sourceActivityId:'old-garmin'}],checkins:[],completedWorkouts:[{id:'old'}],overrides:{},decisions:[],goals:{strength:'Bench',running:'Fitness'}};
(async()=>{
 let previous=true;const baseline=process.env.LHRF_CLEAN_BASE;if(!baseline)throw Error('Provide exact 1.41.0 baseline');
 const server=createServer((req,res)=>{try{let p=new URL(req.url,'http://localhost').pathname;if(p.endsWith('/'))p+='index.html';const base=previous?baseline:path.join(__dirname,'..'),file=path.join(base,p);res.setHeader('cache-control','no-store');res.setHeader('content-type',p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':p.endsWith('.png')?'image/png':'text/html');res.end(fs.readFileSync(file))}catch{res.writeHead(404).end()}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://localhost:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
 try{for(const competition of [false,true]){
  previous=true;const context=await browser.newContext({...devices['Pixel 7'],timezoneId:'Europe/London'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.setFixedTime(new Date('2026-11-28T17:00:00Z'));
  await page.addInitScript(({key,liveKey,fixture})=>{if(location.protocol!=='http:'||sessionStorage.getItem('synthetic-clean-seeded'))return;sessionStorage.setItem('synthetic-clean-seeded','1');for(const prefix of ['','competition:']){localStorage.setItem(prefix+key,JSON.stringify(fixture));localStorage.setItem(prefix+liveKey,JSON.stringify({id:'old-live',day:'Tue',name:'Old draft',ex:fixture.activeSchedule[0].ex,runs:[],entries:{},started:'2026-11-20T10:00:00Z'}));localStorage.setItem(prefix+liveKey+'_pendingRun',JSON.stringify({parentId:'old-live',runs:[]}));}localStorage.setItem('lhrf_intervals_connection_v1','synthetic-connection');localStorage.setItem('lhrf_rest_v1','90');localStorage.setItem('lhrf_replacement_backup_v1:old','old-history')},{key,liveKey,fixture});
  await page.goto(origin+'/'+(competition?'?mode=competition':''));await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  const selected=(competition?'competition:':'')+key;
  const before=await page.evaluate(k=>localStorage.getItem(k),selected);
  previous=false;await page.goto(origin+'/refresh.html'+(competition?'?mode=competition':''));
  await page.click('#update');await page.getByText('Finish your workout or pending run in LHRF, then return here to update.',{exact:true}).waitFor();
  assert.equal(await page.evaluate(k=>localStorage.getItem(k),selected),before);
  await page.click('#cleanStart');await page.waitForURL(/clean=1/);await page.locator('#ownerCleanStart').waitFor();
  assert.equal(await page.locator('#catalogueSetupDialog').isVisible(),false);
  assert.equal(await page.evaluate(k=>localStorage.getItem(k),selected),before,'Code update must retain history until explicit erase confirmation');
  page.once('dialog',d=>d.dismiss());await page.click('#ownerCleanStart');assert.equal(await page.evaluate(k=>localStorage.getItem(k),selected),before);
  page.once('dialog',d=>d.accept());await Promise.all([page.waitForEvent('load'),page.click('#ownerCleanStart')]);
  const state=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),selected);
  assert.equal(state.programmeActivation.status,'active');assert.equal(state.programmeActivation.cleanStart,true);assert.equal(state.reviewedProgramme.weeks.length,13);
  assert.deepEqual(state.sets,[]);assert.deepEqual(state.runs,[]);assert.deepEqual(state.completedWorkouts,[]);assert.deepEqual(state.settings,fixture.settings);assert.deepEqual(state.equipmentInventory,fixture.equipmentInventory);
  assert.equal(await page.locator('#ownerSbd2027').count(),0);assert.equal(await page.locator('#catalogueSetupDialog').isVisible(),false);
  const drafts=await page.evaluate(({key,liveKey})=>({live:['','competition:'].flatMap(prefix=>[localStorage.getItem(prefix+liveKey),localStorage.getItem(prefix+liveKey+'_pendingRun')]),connection:localStorage.getItem('lhrf_intervals_connection_v1'),rest:localStorage.getItem('lhrf_rest_v1'),backup:localStorage.getItem('lhrf_replacement_backup_v1:old')}),{key,liveKey});
  assert.deepEqual(drafts.live,[null,null,null,null]);assert.equal(drafts.connection,'synthetic-connection');assert.equal(drafts.rest,'90');assert.equal(drafts.backup,null);
  await context.setOffline(true);await page.reload();assert.deepEqual(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),selected),state);assert.equal(await page.locator('#catalogueSetupDialog').isVisible(),false);assert.deepEqual(errors,[]);await context.close();
 }
 console.log('PASS blocked updater -> explicit clean start: ordinary update preserved; cancel does nothing; confirmed deletion clears histories/drafts/backups in both stores; same 13-week programme active with settings/connections retained; offline reload without onboarding.');
 }finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
