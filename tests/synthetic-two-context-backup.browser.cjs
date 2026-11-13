// Synthetic two-context transfer: no real account, device, athlete or cloud sync.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.join(__dirname,'..'), DATA='lhrf_beta_v1118_clean',LIVE='lhrf_fresh_beta_live_v1114';
const source=fs.readFileSync(path.join(__dirname,'today-flow.browser.cjs'),'utf8').split('(async()=>')[0];
const fixture=JSON.parse(JSON.stringify(vm.runInNewContext(source+';fixture',{require:require('module').createRequire(__filename),process,__dirname})));
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});try{
 const a=await browser.newContext({acceptDownloads:true,serviceWorkers:'block'}),b=await browser.newContext({acceptDownloads:true,serviceWorkers:'block'});
 async function pageFor(ctx){const page=await ctx.newPage();page.on('dialog',d=>d.accept());await page.route('https://backup-qa.test/**',route=>{const pathname=new URL(route.request().url()).pathname, file=path.join(root,pathname==='/'?'index.html':pathname);return route.fulfill({body:fs.readFileSync(file),contentType:pathname.endsWith('.js')?'application/javascript':pathname.endsWith('.css')?'text/css':'text/html'})});return page;}
 const one=await pageFor(a);await one.addInitScript(({DATA,fixture})=>localStorage.setItem(DATA,JSON.stringify(fixture)),{DATA,fixture});await one.goto('https://backup-qa.test/');
 const actual=await one.evaluate(k=>JSON.parse(localStorage.getItem(k)),DATA),draft={id:'synthetic-draft',entries:{'0_0':{done:true,weight:20,reps:5,rpe:7}}};await one.evaluate(({LIVE,draft})=>localStorage.setItem(LIVE,JSON.stringify(draft)),{LIVE,draft});
 const [download]=await Promise.all([one.waitForEvent('download'),one.evaluate(()=>exportLog())]);const backup=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.deepEqual(backup._backup.deviceState[LIVE],draft);assert.deepEqual(backup.sets,actual.sets);assert.deepEqual(backup.completedWorkouts,actual.completedWorkouts);
 const two=await pageFor(b);await two.goto('https://backup-qa.test/');const before=await two.evaluate(k=>localStorage.getItem(k),DATA);assert.ok(!before||!JSON.parse(before).sentinel,'No automatic cross-context sync');
 await two.evaluate(async backup=>{await importBackup({target:{files:[new File([JSON.stringify(backup)],'synthetic.json',{type:'application/json'})],value:'selected'}})},backup);
 const after=await two.evaluate(k=>JSON.parse(localStorage.getItem(k)),DATA);for(const key of ['sets','runs','completedWorkouts','activeSchedule','customRoadmap'])assert.deepEqual(after[key],actual[key],key+' transfer mismatch');assert.equal(await two.evaluate(k=>localStorage.getItem(k),LIVE),null,'full restore should not silently resume source live draft');
 await two.reload();const reread=await two.evaluate(k=>JSON.parse(localStorage.getItem(k)),DATA);assert.deepEqual(reread,after);console.log('PASS synthetic isolated browser contexts: no automatic sync; manual export/import restores programme/logs; source draft retained only in backup and not resumed');await a.close();await b.close();
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
