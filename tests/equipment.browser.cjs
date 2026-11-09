// Local, synthetic equipment UI + frozen-session + offline gate.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {fullInventory}=require('./equipment-fixtures.cjs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const context=await browser.newContext(),page=await context.newPage(),errors=[],dialogs=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',async d=>{dialogs.push(d.message());await d.dismiss()});
  await page.goto(process.env.LHRF_BROWSER_URL || 'http://localhost:8765/');
  assert.equal(await page.locator('#frEquipment summary').filter({hasText:/^Specialist equipment/}).count(),1);
  assert.equal(await page.locator('#settings input[aria-label="safety-squat-bar"]').evaluate(e=>e.equipmentState),'unavailable');
  const inv=fullInventory();await page.evaluate(inv=>{data.onboardingComplete=true;data.equipmentInventory=inv;data.customRoadmap={programmeId:'synthetic-frozen',weeks:1};data.activeSchedule=[{id:'saved',day:'Tue',name:'Frozen bench',ex:[['Safety-bar squat',3,5,100,7]],runs:[]}];schedule=data.activeSchedule;save();document.getElementById('firstRun').hidden=true;go('settings')},inv);
  await page.reload();await page.evaluate(()=>go('settings'));
  await page.locator('#settingsEquipment>summary').click();
  const before=await page.evaluate(()=>JSON.stringify({sets:data.sets,customRoadmap:data.customRoadmap,activeSchedule:data.activeSchedule}));
  await page.locator('#settings input[aria-label="safety-squat-bar"]').uncheck();await page.locator('#settings').getByRole('button',{name:'Save equipment',exact:true}).click();
  assert.match(await page.locator('#settingsEquipment [aria-live]').innerText(),/Equipment saved/);
  const allowed=await page.evaluate(()=>equipmentStartAllowed(data.activeSchedule[0]));assert.equal(allowed,false);assert.ok(dialogs.some(x=>x.includes('safety-squat-bar')));
  assert.equal(await page.evaluate(()=>JSON.stringify({sets:data.sets,customRoadmap:data.customRoadmap,activeSchedule:data.activeSchedule})),before);
  await page.evaluate(async()=>{await navigator.serviceWorker.register('./sw.js');await navigator.serviceWorker.ready});
  await page.waitForFunction(async()=>{const c=await caches.open((await caches.keys()).find(k=>k.startsWith('lhrf-shell-')));return !!(await c.match('./src/exercise-registry.js'))});
  await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await context.setOffline(true);await page.reload();
  assert.equal(await page.evaluate(()=>LHRFExercises.eligibility('Safety-bar squat',currentEquipmentInventory()).eligible),false);
  assert.equal(await page.evaluate(()=>equipmentStartAllowed(data.activeSchedule[0])),false);
  assert.deepEqual(errors,[]);console.log('PASS onboarding inventory, Settings removal, frozen-record preservation, start rejection and offline reload');
  await context.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
