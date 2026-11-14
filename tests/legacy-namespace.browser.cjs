// QA experiment only. No production storage or application code is migrated.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),oldRoot=path.join(root,'production-v1406');
const LEGACY='lhrf_beta_v1118_clean',NEW='qa_isolated_new_main_v1',CHECKPOINT='qa_legacy_checkpoint',CANDIDATE='qa_late_legacy_candidate';
const fixtureSource=fs.readFileSync(path.join(root,'tests/today-flow.browser.cjs'),'utf8').split('(async()=>')[0];
const fixture=JSON.parse(JSON.stringify(vm.runInNewContext(fixtureSource+';fixture',{require:require('module').createRequire(path.join(root,'tests/today-flow.browser.cjs')),process,__dirname:path.join(root,'tests')})));
fixture.completedWorkouts=fixture.completedWorkouts||[];fixture.garminSync={sentinel:'initial-synthetic'};
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});const context=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,serviceWorkers:'block'});try{
  await context.route('https://namespace-qa.test/**',route=>{
    const pathname=new URL(route.request().url()).pathname,isNew=pathname.startsWith('/new/');
    const relative=pathname.replace(/^\/(?:old|new)\//,''),file=path.resolve(oldRoot,relative||'index.html');
    if(!file.startsWith(oldRoot+path.sep)||!fs.existsSync(file))return route.fulfill({status:404});
    let body=fs.readFileSync(file);const ext=path.extname(file);
    if(isNew&&['.html','.js'].includes(ext))body=Buffer.from(body.toString('utf8').split(LEGACY).join(NEW));
    return route.fulfill({body,contentType:ext==='.js'?'application/javascript':ext==='.css'?'text/css':ext==='.json'?'application/json':'text/html'});
  });
  await context.addInitScript(({LEGACY,fixture})=>{
    if(!localStorage.getItem(LEGACY))localStorage.setItem(LEGACY,JSON.stringify(fixture));
    if(location.pathname.startsWith('/old/')){const add=window.addEventListener;window.__heldStorage=[];window.addEventListener=function(type,listener,options){if(type==='storage')return add.call(this,type,event=>window.__heldStorage.push(()=>listener.call(window,event)),options);return add.call(this,type,listener,options)}}
  },{LEGACY,fixture});
  const a=await context.newPage(),b=await context.newPage();for(const p of [a,b])p.on('dialog',d=>d.accept());
  await a.goto('https://namespace-qa.test/old/index.html');await b.goto('https://namespace-qa.test/old/index.html');
  await a.reload();await b.reload();await a.waitForFunction(()=>typeof save==='function');await b.waitForFunction(()=>typeof save==='function');
  // Synthetic, non-atomic copy. Legacy key is retained; no claim of safe production migration.
  await a.evaluate(({LEGACY,NEW,CHECKPOINT})=>{const raw=localStorage.getItem(LEGACY);localStorage.setItem(NEW,raw);localStorage.setItem(CHECKPOINT,raw)},{LEGACY,NEW,CHECKPOINT});
  let modern=await context.newPage();modern.on('dialog',d=>d.accept());await modern.goto('https://namespace-qa.test/new/index.html');await modern.waitForFunction(()=>typeof save==='function');
  const write=async(page,id)=>page.evaluate(id=>{const next=JSON.parse(JSON.stringify(data));next.completedWorkouts=[...(next.completedWorkouts||[]),{id,date:'2026-11-14T12:00:00Z',component:'run'}];next.garminSync={sentinel:id};return save(next,{notify:false})},id);
  assert.equal(await write(modern,'new-workout'),true);
  const protectedRaw=await modern.evaluate(key=>localStorage.getItem(key),NEW);assert.ok(JSON.parse(protectedRaw).completedWorkouts.some(w=>w.id==='new-workout'));
  await context.setOffline(true);assert.equal(await a.evaluate(()=>navigator.onLine),false);
  // Old page resumes with its old in-memory state and writes the unmodified legacy key.
  assert.equal(await write(a,'late-legacy-A'),true);
  assert.equal(await modern.evaluate(key=>localStorage.getItem(key),NEW),protectedRaw);
  await modern.close();
  // On re-entry QA compares the retained original and current legacy bytes, without merging.
  modern=await context.newPage();modern.on('dialog',d=>d.accept());await modern.goto('https://namespace-qa.test/new/index.html');
  const surfaced=await modern.evaluate(({LEGACY,CHECKPOINT,CANDIDATE})=>{const before=localStorage.getItem(CHECKPOINT),current=localStorage.getItem(LEGACY);if(before===current)return null;localStorage.setItem(CANDIDATE,current);return {before,current,status:'manual-review'}},{LEGACY,CHECKPOINT,CANDIDATE});
  assert.ok(surfaced);assert.equal(surfaced.status,'manual-review');assert.ok(JSON.parse(surfaced.current).completedWorkouts.some(w=>w.id==='late-legacy-A'));
  assert.equal(await modern.evaluate(key=>localStorage.getItem(key),NEW),protectedRaw);
  assert.equal(await modern.evaluate(key=>localStorage.getItem(key),CANDIDATE),surfaced.current);
  await modern.close();
  // Counterexample: two other old writes while the new client is absent. Only the last survives.
  assert.equal(await write(a,'unobserved-old-A'),true);assert.equal(await write(b,'unobserved-old-B'),true);
  const final=await b.evaluate(({LEGACY,NEW,CANDIDATE})=>({legacy:localStorage.getItem(LEGACY),modern:localStorage.getItem(NEW),candidate:localStorage.getItem(CANDIDATE)}),{LEGACY,NEW,CANDIDATE});
  assert.equal(final.modern,protectedRaw);assert.ok(JSON.parse(final.legacy).completedWorkouts.some(w=>w.id==='unobserved-old-B'));assert.ok(!JSON.parse(final.legacy).completedWorkouts.some(w=>w.id==='unobserved-old-A'));assert.ok(!final.candidate.includes('unobserved-old-A'));
  await context.setOffline(false);await a.reload();assert.equal(await a.evaluate(key=>localStorage.getItem(key),NEW),protectedRaw);
  console.log('PASS: test-only new namespace retains synthetic post-migration workout and Garmin snapshot when actual old client writes the legacy key offline.');
  console.log('PASS: QA re-entry comparison surfaces one retained late legacy snapshot as manual-review candidate; original and candidate remain separate, no merge.');
  console.log('REPRODUCED LIMIT: two unobserved old writes can overwrite one another; latest-key comparison cannot recover the first.');
  console.log('LIMITS: selective runtime rewriting of main key only, no production migration, real service worker, natural suspension, crash/quota, real hardware, or guarantees for other shared keys.');
 }finally{await context.close();await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
