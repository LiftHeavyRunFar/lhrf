// Real two-tab IndexedDB transaction test of an isolated prototype, not native UI.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.join(__dirname,'..'),fixtureFile=path.join(__dirname,'fatigue-overlay-storage.test.cjs');
const prelude=fs.readFileSync(fixtureFile,'utf8').split("test('approval writes")[0];
const {fixture}=vm.runInNewContext(prelude+';({fixture})',{require:require('module').createRequire(fixtureFile),structuredClone,console});
const scripts=['gym-equipment.js','exercise-registry.js','catalogue-training.js','catalogue-protection.js','fatigue-assessment.js','fatigue-overlay.js','fatigue-native-adapter.js','fatigue-overlay-storage.js','fatigue-overlay-idb.js'];
(async()=>{const f=fixture(),browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});try{
 const ctx=await browser.newContext({serviceWorkers:'block'});await ctx.route('https://fatigue-idb.invalid/**',r=>r.fulfill({status:200,body:'<!doctype html><title>Isolated IDB prototype</title>',contentType:'text/html'}));
 const a=await ctx.newPage(),b=await ctx.newPage();await a.goto('https://fatigue-idb.invalid/');await b.goto('https://fatigue-idb.invalid/');
 for(const page of [a,b])for(const name of scripts)await page.addScriptTag({content:fs.readFileSync(path.join(root,'src',name),'utf8')});
 const mainKey='isolated-main',overlayKey='isolated-overlay',raw=JSON.stringify(f.n),payload={mainKey,overlayKey,expectedRaw:raw,proposal:f.proposal,approved:true,now:f.now,eventContext:f.eventContext};
 await a.evaluate(({mainKey,raw})=>localStorage.setItem(mainKey,raw),{mainKey,raw});await ctx.setOffline(true);
 const unavailable=await a.evaluate(p=>LHRFFatigueOverlayIDB.approve({...p,indexedDB:null,storage:localStorage}),payload);assert.equal(unavailable.status,'unavailable');assert.equal(await a.evaluate(k=>localStorage.getItem(k),mainKey),raw);
 const badIDB=await a.evaluate(p=>LHRFFatigueOverlayIDB.approve({...p,indexedDB:{open(){throw new DOMException('quota','QuotaExceededError')}},storage:localStorage}),payload);assert.ok(['unavailable','failed'].includes(badIDB.status));assert.equal(await a.evaluate(k=>localStorage.getItem(k),mainKey),raw);
 // Two real tabs race approvals in serialisable IDB transactions; exactly one commits.
 const [one,two]=await Promise.all([a.evaluate(p=>LHRFFatigueOverlayIDB.approve({...p,indexedDB,storage:localStorage}),payload),b.evaluate(p=>LHRFFatigueOverlayIDB.approve({...p,indexedDB,storage:localStorage}),payload)]);
 assert.equal([one,two].filter(r=>r.status==='saved').length,1);assert.ok([one,two].every(r=>['saved','conflict','busy'].includes(r.status)));assert.equal(await b.evaluate(k=>localStorage.getItem(k),mainKey),raw);
 const read=await b.evaluate(({overlayKey,now})=>LHRFFatigueOverlayIDB.read({indexedDB,overlayKey,now}),{overlayKey,now:f.now});assert.equal(read.status,'active');assert.ok(read.overlay.changes.length);
 // A confirmed revoke committed by B must be visible in A's next transactional read immediately.
 const revoked=await b.evaluate(({overlayKey,expectedRaw,now})=>LHRFFatigueOverlayIDB.revoke({indexedDB,overlayKey,expectedRaw,confirmed:true,now}),{overlayKey,expectedRaw:JSON.stringify(read.overlay),now:f.now});assert.equal(revoked.status,'revoked');
 const fresh=await a.evaluate(({overlayKey,now})=>LHRFFatigueOverlayIDB.read({indexedDB,overlayKey,now}),{overlayKey,now:f.now});assert.equal(fresh.status,'revoked');assert.equal(await a.evaluate(k=>localStorage.getItem(k),mainKey),raw);
 console.log('PASS isolated real-tab IDB approval/revocation, offline and unsupported/quota checks');await ctx.close();
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
