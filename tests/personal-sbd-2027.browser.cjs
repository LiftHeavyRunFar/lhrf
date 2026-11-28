// Synthetic Pixel acceptance on the normal app, including the real replacement gate.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createServer}=require('node:http'),{chromium,devices}=require('playwright');
const api=require('../src/programme-replacement'),clone=x=>JSON.parse(JSON.stringify(x));
const prior=require('../docs/qa/stage-seven/regressions/Taylor.json').programme;
const fixture={equipmentInventory:require('./equipment-fixtures.cjs').fullInventory(),onboardingComplete:true,
 customRoadmap:clone(prior.config),activeCustomWeek:1,activeSchedule:clone(prior.weeks[0].sessions),
 sets:[{date:'2026-10-30',exercise:'Bench',weight:75,reps:3,rpe:7}],
 runs:[{date:'2026-10-31',km:5.123,min:33.456,sourceActivityId:'keep-garmin',source:'garmin-personal',splits:[{km:1,min:6}]}],
 checkins:[],completedWorkouts:[{id:'old-workout',week:1,date:'2026-10-30',notes:'keep'}],
 decisions:[],overrides:{},readinessDay:'2026-11-28',athlete:{id:'synthetic'},settings:{keep:true},goals:{strength:'Bench',running:'Fitness'}};
const mime={'.js':'application/javascript','.css':'text/css','.png':'image/png','.webmanifest':'application/manifest+json'};
(async()=>{
 const server=createServer((req,res)=>{try{let file=new URL(req.url,'http://localhost').pathname;if(file.endsWith('/'))file+='index.html';const full=path.resolve(__dirname,'..','.'+file);assert.ok(full.startsWith(path.resolve(__dirname,'..')+path.sep));res.setHeader('content-type',mime[path.extname(full)]||'text/html');res.end(fs.readFileSync(full))}catch{res.writeHead(404).end()}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin='http://localhost:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
 try{
  for(const competition of [false,true]){
   const ctx=await browser.newContext({...devices['Pixel 7'],timezoneId:'Europe/London',acceptDownloads:true});
   const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
   await page.clock.install({time:new Date('2026-11-28T16:00:00Z')});
   const key=(competition?'competition:':'')+api.DATA_KEY;
   await page.addInitScript(({key,fixture})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture))},{key,fixture});
   await page.goto(origin+'/?owner=2027'+(competition?'&mode=competition':''));
   await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
   assert.equal(await page.locator('#catalogueSetupDialog').isVisible(),false);
   const before=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
   await page.getByRole('button',{name:'Use this programme in my workouts',exact:true}).click();
   await page.getByRole('button',{name:'1. Save my training backup',exact:true}).waitFor();
   const activate=page.getByRole('button',{name:'3. Activate my programme',exact:true});
   assert.equal(await activate.isEnabled(),false);
   const download=page.waitForEvent('download');await page.getByRole('button',{name:'1. Save my training backup',exact:true}).click();
   const backupPath=await(await download).path();const backup=JSON.parse(fs.readFileSync(backupPath));
   assert.deepEqual(backup.sets,before.sets);assert.deepEqual(backup.runs,before.runs);
   await page.locator('#ownerSbd2027 input[type=file]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{}')});
   await page.getByText('Backup verification failed.',{exact:false}).waitFor();assert.equal(await activate.isEnabled(),false);
   await page.locator('#ownerSbd2027 input[type=file]').setInputFiles(backupPath);
   await page.getByText('Downloaded training backup verified.',{exact:false}).waitFor();
   await page.locator('#ownerSbd2027 input[type=checkbox]').check();
   assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key),before);
   // Failure cannot discard original state or its rollback archive.
   await page.evaluate(key=>{window.originalStorageSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===key)throw Error('Injected write failure');return window.originalStorageSet.call(this,k,v)}},key);
   await activate.click();await page.getByText('Injected write failure',{exact:false}).waitFor();
   assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key),before);
   await page.evaluate(()=>{Storage.prototype.setItem=window.originalStorageSet});
   await activate.click();await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).programmeActivation?.status==='active',key);
   await page.waitForLoadState('load');
   let state=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
   api.verifyPreservation(before,state);assert.equal(state.reviewedProgramme.weeks.length,13);
   assert.equal(await page.locator('#ownerSbd2027').count(),0,'Normal app replaces the draft viewer after activation');
   assert.equal(await page.locator('#catalogueSetupDialog').isVisible(),false);
   await ctx.setOffline(true);await page.reload();
   state=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);api.verifyPreservation(before,state);
   const frozen=clone(state.reviewedProgramme);
   // Progression follows dates, not completion of an optional Saturday.
   await page.clock.setFixedTime(new Date('2026-12-03T10:00:00Z'));
   await page.evaluate(()=>LHRFSyncReviewedCalendar());
   const deadlift=await page.evaluate(()=>data.activeSchedule.find(s=>s.name.includes('Deadlift')));
   assert.equal(deadlift.ex.filter(e=>e[5].optional).length,2);
   await page.evaluate(id=>openWorkout(id),deadlift.id);assert.match(await page.locator('#livePreview').innerText(),/Optional/);
   await page.click('#previewStart');
   if(await page.locator('#readinessModal').isVisible())await page.click('#readinessContinue');
   await page.locator('#liveExercises details').first().waitFor();
   const required=deadlift.ex.filter(e=>!e[5].optional).reduce((n,e)=>n+e[1],0);
   await page.getByRole('button',{name:'Add optional set of '+deadlift.ex[0][0],exact:true}).first().click();
   let live=await page.evaluate(()=>LHRFLive.get());assert.equal(live.ex.length,deadlift.ex.length+1);
   assert.equal(live.ex.at(-1)[5].optional,true);
   await page.reload();live=await page.evaluate(()=>LHRFLive.get());assert.equal(live.ex.length,deadlift.ex.length+1);
   const extra=page.locator('#liveExercises details').last();await extra.locator('summary').click();
   await extra.locator('[data-field=weight]').fill('100');await extra.locator('[data-field=rpe]').fill('6');await extra.locator('.set-check').click();
   assert.match(await page.locator('#train .live-status').first().innerText(),new RegExp('0 of '+required+' sets'));
   await page.click('#liveFinish');await page.click('#finishAndSave');await page.click('#liveFeedbackSkip');
   const completed=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
   assert.deepEqual(completed.sets.slice(0,before.sets.length),before.sets);
   assert.equal(completed.sets.at(-1).optional,true);assert.equal(completed.sets.at(-1).role,'optional');
   assert.deepEqual(completed.runs,before.runs);assert.deepEqual(completed.reviewedProgramme,frozen);
   // Rolling the programme back retains the optional set just recorded.
   const rollback=await page.evaluate(async()=>{
    const p=LHRFProgrammeReplacement.createRollback(data,LHRFCoach,{now:new Date().toISOString()}),b=await LHRFProgrammeReplacement.backupFor(data,LHRFStorage.local,LHRFTrainingBackup,new Date().toISOString());
    await LHRFProgrammeReplacement.verifyBackupFile(b.text,b);
    return LHRFProgrammeReplacement.commit(LHRFStorage.local,p,{expectedRaw:LHRFStorage.local.getItem(LHRFProgrammeReplacement.DATA_KEY),backup:b,backupVerified:true,confirmed:true,now:new Date().toISOString()});
   });
   assert.deepEqual(rollback.sets,completed.sets);assert.deepEqual(rollback.runs,completed.runs);assert.deepEqual(rollback.completedWorkouts,completed.completedWorkouts);
   assert.deepEqual(rollback.customRoadmap,before.customRoadmap);
   assert.deepEqual(errors,[]);await ctx.close();
  }
  console.log('PASS owner 13-week normal/competition stores: no onboarding, verified backup, failed save, activation before first workout, offline logging, optional-set reload/metadata, frozen calendar and rollback retaining new training.');
 }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
