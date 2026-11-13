// Synthetic, isolated browser acceptance for the structured catalogue in the native app.
// Runs checked-out files on a private test origin; does not access an athlete account.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.join(__dirname,'..'),out=process.env.LHRF_QA_OUT||'/tmp/lhrf-structured-five',key='lhrf_beta_v1118_clean';
fs.mkdirSync(out,{recursive:true});
const profiles=[
 {id:'beginner',programme:'lifting-foundation',discipline:'strength',availability:['Monday','Wednesday','Friday'],days:['Monday','Friday']},
 {id:'powerlifter',programme:'powerlifting-three-day',discipline:'strength',availability:['Monday','Wednesday','Friday'],days:['Monday','Wednesday','Friday']},
 {id:'runner',programme:'10k',discipline:'running',availability:['Tuesday','Saturday'],days:['Tuesday','Saturday']},
 {id:'hybrid',programme:'lifting-foundation',discipline:'strength',availability:['Tuesday','Thursday','Friday','Sunday'],days:['Tuesday','Friday'],second:{programme:'10k',discipline:'running',days:['Thursday','Sunday']}},
 {id:'returning',programme:'lifting-foundation',discipline:'strength',availability:['Tuesday','Saturday'],days:['Tuesday','Saturday']},
];
async function selectDays(page,days){
 const group=page.getByRole('group',{name:'Training days'});
 for(const name of ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']){
  const box=group.getByRole('checkbox',{name,exact:true});if(await box.count())await box.setChecked(days.includes(name));
 }
}
async function setup(page,p,first){
 if(first)await page.getByRole('button',{name:p.discipline==='strength'?'Strength training':'Running',exact:true}).click();
 await page.locator('#native-catalogue-programme').selectOption(p.programme);
 if(p.programme==='10k')await page.getByRole('dialog',{name:'Programme setup'}).getByLabel('Runs per week',{exact:true}).selectOption('2');
 await selectDays(page,p.days);
 await page.getByLabel('First calendar week').fill('2026-11-16');
 await page.getByRole('button',{name:'Preview programme',exact:true}).click();
 await page.getByRole('region',{name:'First week'}).waitFor();
 const summary=await page.getByRole('region',{name:'First week'}).innerText();
 await page.getByRole('button',{name:'Get my programme',exact:true}).click();
 return summary;
}
async function one(browser,p){
 const context=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,timezoneId:'Europe/London',serviceWorkers:'block'}),page=await context.newPage(),errors=[],record={profile:p.id,requested:p,steps:[],errors};
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());page.setDefaultTimeout(12000);
 try{
  await page.clock.install({time:new Date('2026-11-16T09:00:00Z')});
  await page.route('https://qa-structured-lhrf.test/**',r=>{const pathname=new URL(r.request().url()).pathname;const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return r.fulfill({status:404,body:'missing'});const mime={'.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};return r.fulfill({body:fs.readFileSync(file),contentType:mime[path.extname(file)]||'text/html'})});
  await page.goto('https://qa-structured-lhrf.test/');await page.getByRole('heading',{name:'Welcome to Lift Heavy. Run Far.'}).waitFor();record.steps.push('clean native catalogue setup');
  record.firstWeek=await setup(page,p,true);record.steps.push('programme selected, days selected, first week reviewed');
  await page.getByRole('heading',{name:'Onboarding complete'}).waitFor();
  if(p.second){await page.getByRole('button',{name:'Add running programme'}).click();record.secondWeek=await setup(page,p.second,false);await page.locator('#catalogueSetupDialog').waitFor({state:'hidden'});record.steps.push('second discipline selected and reviewed');}
  else await page.getByRole('button',{name:'Go to programme'}).click();
  const state=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
  const installed=await state();assert.ok(installed?.onboardingComplete);assert.equal(installed.customRoadmap.cataloguePlans.length,p.second?2:1);
  record.plans=installed.customRoadmap.cataloguePlans.map(x=>({id:x.snapshot.id,weeks:x.snapshot.weeks.length,firstWeek:x.snapshot.weeks[0]}));record.steps.push('saved structured programme');
  const preview=page.getByRole('button',{name:/^Preview workout /}).first();await preview.waitFor();record.previewButton=await preview.getAttribute('aria-label');await preview.click();await page.locator('#livePreview').waitFor();record.preview=await page.locator('#livePreview').innerText();record.steps.push('first workout previewed');
  await page.locator('#previewStart').click();if(await page.locator('#readinessModal[open]').count())await page.locator('#readinessContinue').click();
  if(await page.locator('#liveRunKm').count()){
   await page.locator('#liveRunKm').fill('3');await page.locator('#liveRunMinutes').fill('21');await page.locator('#liveLogRun').click();
  }
  const details=page.locator('#liveExercises details');for(let i=0;i<await details.count();i++){
   const detail=details.nth(i);if(!await detail.evaluate(x=>x.open))await detail.locator('summary').click();
   const rows=detail.locator('.live-set');for(let j=0;j<await rows.count();j++){
    const row=rows.nth(j),weight=row.locator('[data-field=weight]'),rpe=row.locator('[data-field=rpe]');
    if(!Number(await weight.inputValue()))await weight.fill('20');await rpe.fill('7');await row.locator('.set-check').click();
   }
  }
  await page.locator('#liveFinish').click();await page.locator('#finishAndSave').click();if(await page.locator('#liveFeedbackSkip').count())await page.locator('#liveFeedbackSkip').click();
  const saved=await state();assert.ok(saved.completedWorkouts?.length>0,'no completed workout');assert.ok((saved.sets?.length||0)+(saved.runs?.length||0)>0,'no recorded results');record.saved={completed:saved.completedWorkouts.length,sets:saved.sets?.length||0,runs:saved.runs?.length||0};record.steps.push('completed workout logged');
  await page.reload();assert.deepEqual(await state(),saved,'state changed after reload');await page.locator('nav [data-screen="plan"]').click();await page.locator('nav [data-screen="today"]').click();record.steps.push('reload and return to training');assert.deepEqual(errors,[]);record.passed=true;
 }catch(e){record.passed=false;record.failure=e.stack||String(e);try{await page.screenshot({path:path.join(out,p.id+'-failure.png'),fullPage:true})}catch{}}
 finally{fs.writeFileSync(path.join(out,p.id+'.json'),JSON.stringify(record,null,2));await context.close()}
 return record;
}
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});let results=[];try{for(const p of profiles)results.push(await one(browser,p));}finally{await browser.close()}console.log('STRUCTURED_ATHLETE_RESULTS='+JSON.stringify(results.map(r=>({profile:r.profile,passed:r.passed,steps:r.steps,failure:r.failure?.slice(0,500),plans:r.plans?.map(p=>({id:p.id,weeks:p.weeks,firstWeek:p.firstWeek})),saved:r.saved,errors:r.errors}))));if(results.some(r=>!r.passed))process.exitCode=1})().catch(e=>{console.error(e);process.exitCode=1});
