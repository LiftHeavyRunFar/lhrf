// Synthetic local-only backup warning and restore checks; no real athlete data.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.join(__dirname,'..'),DATA='lhrf_beta_v1118_clean',LIVE='lhrf_fresh_beta_live_v1114';
const source=fs.readFileSync(path.join(__dirname,'today-flow.browser.cjs'),'utf8').split('(async()=>')[0];
const fixture=JSON.parse(JSON.stringify(vm.runInNewContext(source+';fixture',{require:require('module').createRequire(__filename),process,__dirname})));
const backup=require('../src/training-backup').create({...fixture,sentinel:{source:'backup'}},{storage:{getItem:key=>key===LIVE?JSON.stringify({id:'source-draft',entries:{'0_0':{done:true}}}):null},now:'2026-11-13T12:00:00Z'});
assert.ok(backup._backup.deviceState[LIVE]);
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});try{
 for(const profile of [{name:'mobile',viewport:{width:393,height:852},isMobile:true,hasTouch:true},{name:'desktop',viewport:{width:1280,height:800}}]){
 const context=await browser.newContext({viewport:profile.viewport,isMobile:profile.isMobile||false,hasTouch:profile.hasTouch||false,serviceWorkers:'block'}),page=await context.newPage();
 await page.route('http://backup-warning.test/**',route=>{const file=new URL(route.request().url()).pathname;return route.fulfill({body:fs.readFileSync(path.join(root,file==='/'?'index.html':file)),contentType:file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html'})});
 await page.addInitScript(({key,data})=>localStorage.setItem(key,JSON.stringify(data)),{key:DATA,data:fixture});await page.goto('http://backup-warning.test/');
 await page.locator('nav [data-screen="settings"]').click();await page.locator('#settingsData > summary').click();
 const warning=await page.locator('#exportTrainingData').locator('..').innerText();assert.match(warning,/lost|cleared/i);assert.match(warning,/somewhere other than this device/i);
 const getState=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),DATA),before=await getState();let prompt='';
 const restore=()=>page.evaluate(async backup=>importBackup({target:{files:[new File([JSON.stringify(backup)],'backup.json',{type:'application/json'})],value:'selected'}}),backup);
 page.once('dialog',d=>{prompt=d.message();return d.dismiss()});await restore();assert.match(prompt,/replaces this device’s current local records/i);assert.match(prompt,/in-progress workout.*not automatically resume/i);assert.deepEqual(await getState(),before,'cancel must preserve destination');
 const messages=[];page.on('dialog',d=>{messages.push(d.message());return d.accept()});await restore();const after=await getState();assert.equal(after.sentinel.source,'backup');assert.deepEqual(after.sets,backup.sets);assert.deepEqual(after.runs,backup.runs);assert.equal(after._backup,undefined);assert.equal(await page.evaluate(key=>localStorage.getItem(key),LIVE),null,'source draft is not resumed');assert.ok(messages.some(m=>/not automatically resumed/i.test(m)));await context.close();console.log('PASS '+profile.name);}
 console.log('PASS device-loss warning, cancel, replacement and non-resumed backup draft');
 }finally{await browser.close()}})().catch(error=>{console.error(error);process.exitCode=1});
