// Isolated separate-key storage prototype in two real browser tabs.
// No native UI wiring, service worker reload, real Garmin device, or live athlete data.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.join(__dirname,'..'),fixtureFile=path.join(__dirname,'fatigue-overlay-storage.test.cjs');
const prelude=fs.readFileSync(fixtureFile,'utf8').split("test('approval writes")[0];
const {fixture}=vm.runInNewContext(prelude+';({fixture})',{require:require('module').createRequire(fixtureFile),structuredClone,console});
const scripts=['gym-equipment.js','exercise-registry.js','catalogue-training.js','catalogue-protection.js','fatigue-assessment.js','fatigue-overlay.js','fatigue-native-adapter.js','fatigue-overlay-storage.js'];
(async()=>{const f=fixture(),browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});try{
 const ctx=await browser.newContext({serviceWorkers:'block'});await ctx.route('https://fatigue-qa.invalid/**',r=>r.fulfill({status:200,body:'<!doctype html><title>Isolated overlay storage</title>',contentType:'text/html'}));
 const a=await ctx.newPage(),b=await ctx.newPage();await a.goto('https://fatigue-qa.invalid/');await b.goto('https://fatigue-qa.invalid/');
 for(const p of [a,b])for(const script of scripts)await p.addScriptTag({content:fs.readFileSync(path.join(root,'src',script),'utf8')});
 assert.equal(await a.evaluate(()=>typeof navigator.locks?.request),'function');
 const mainKey='isolated-main',overlayKey='isolated-overlay',raw=JSON.stringify(f.n);
 const payload={mainKey,overlayKey,expectedRaw:raw,proposal:f.proposal,approved:true,now:f.now,eventContext:f.eventContext};
 await a.evaluate(({mainKey,overlayKey,raw})=>{localStorage.clear();localStorage.setItem(mainKey,raw);localStorage.removeItem(overlayKey)},{mainKey,overlayKey,raw});
 // Actual separate tab writes stale main data before approval.
 const other=JSON.stringify({...f.n,otherTabRecord:'protected'});await b.evaluate(({mainKey,other})=>localStorage.setItem(mainKey,other),{mainKey,other});
 const stale=await a.evaluate(p=>LHRFFatigueOverlayStorage.approve({...p,storage:localStorage,locks:navigator.locks}),payload);assert.equal(stale.status,'conflict');assert.equal(await b.evaluate(k=>localStorage.getItem(k),mainKey),other);
 await a.evaluate(({mainKey,raw})=>localStorage.setItem(mainKey,raw),{mainKey,raw});
 // A draft from another tab is not silently overwritten or approved around.
 await b.evaluate(()=>localStorage.setItem('lhrf_fresh_beta_live_v1114',JSON.stringify({id:'in-progress'})));
 const draft=await a.evaluate(p=>LHRFFatigueOverlayStorage.approve({...p,storage:localStorage,locks:navigator.locks}),payload);assert.equal(draft.status,'conflict');assert.equal(await a.evaluate(k=>localStorage.getItem(k),overlayKey),null);
 await b.evaluate(()=>localStorage.removeItem('lhrf_fresh_beta_live_v1114'));
 // Feature disable must leave both keys untouched.
 const disabled=JSON.stringify({...f.n,featureFlags:{fatigueIntervention:false}});await b.evaluate(({mainKey,disabled})=>localStorage.setItem(mainKey,disabled),{mainKey,disabled});
 const off=await a.evaluate(p=>LHRFFatigueOverlayStorage.approve({...p,expectedRaw:p.disabled,storage:localStorage,locks:navigator.locks}),{...payload,disabled});assert.equal(off.status,'not-approved');assert.equal(await b.evaluate(k=>localStorage.getItem(k),mainKey),disabled);
 await a.evaluate(({mainKey,raw})=>localStorage.setItem(mainKey,raw),{mainKey,raw});await ctx.setOffline(true);
 // Actual localStorage, fault-injected only for the overlay write; no app PWA offline claim.
 const failure=await a.evaluate(p=>{const fail={getItem:k=>localStorage.getItem(k),removeItem:k=>localStorage.removeItem(k),setItem(){throw Error('quota')}};return LHRFFatigueOverlayStorage.approve({...p,storage:fail,locks:navigator.locks})},payload);assert.equal(failure.status,'failed');assert.equal(await a.evaluate(k=>localStorage.getItem(k),mainKey),raw);assert.equal(await a.evaluate(k=>localStorage.getItem(k),overlayKey),null);
 // Deterministic emulation of an old client saving after the last pre-write comparison.
 const race=await a.evaluate(async({p,other})=>{let reads=0,injected=false;const proxy={getItem(k){const value=localStorage.getItem(k);if(k===p.mainKey&&++reads===2){localStorage.setItem(k,other);injected=true}return value},setItem:(k,v)=>localStorage.setItem(k,v),removeItem:k=>localStorage.removeItem(k)};const result=await LHRFFatigueOverlayStorage.approve({...p,storage:proxy,locks:navigator.locks});return {result,reads,injected,main:localStorage.getItem(p.mainKey),overlay:localStorage.getItem(p.overlayKey)}},{p:payload,other});
 assert.equal(race.injected,true,'simulated other-tab write must actually occur; got '+JSON.stringify({reads:race.reads,status:race.result.status,reason:race.result.reason}));assert.equal(race.result.status,'conflict');assert.equal(race.main,other);assert.equal(await b.evaluate(k=>localStorage.getItem(k),mainKey),other);assert.equal(race.overlay,null);assert.equal(await a.evaluate(k=>localStorage.getItem(k),overlayKey),null);
 await a.evaluate(({mainKey,raw})=>localStorage.setItem(mainKey,raw),{mainKey,raw});
 // Actual Web Locks and two concurrent browser tabs: at most one can save.
 const [first,second]=await Promise.all([a.evaluate(p=>LHRFFatigueOverlayStorage.approve({...p,storage:localStorage,locks:navigator.locks}),payload),b.evaluate(p=>LHRFFatigueOverlayStorage.approve({...p,storage:localStorage,locks:navigator.locks}),payload)]);
 assert.equal([first,second].filter(x=>x.status==='saved').length,1);assert.ok([first,second].every(x=>['saved','busy','conflict'].includes(x.status)));
 assert.equal(await b.evaluate(k=>localStorage.getItem(k),mainKey),raw);const saved=JSON.parse(await b.evaluate(k=>localStorage.getItem(k),overlayKey));assert.ok(saved.changes.length);
 // Existing approval must not alter originals after expiry; test the actual adapter API.
 const occ=f.c.occurrences.find(o=>o.id===saved.changes[0].occurrenceId),key=occ.planId+'-w'+occ.week+'-'+occ.sessionId,session=f.n.reviewedProgramme.weeks.flatMap(w=>w.sessions).find(s=>s.catalogueOccurrenceId===key);
 const active=await a.evaluate(({native,session,mainKey,overlayKey,eventContext})=>LHRFFatigueNativeAdapter.resolve({native,session,storage:localStorage,mainKey,overlayKey,now:'2027-01-05',eventContext}),{native:f.n,session,mainKey,overlayKey,eventContext:f.eventContext});assert.equal(active.adjusted,true);assert.equal(JSON.stringify(active.audit.original.ex),JSON.stringify(session.ex));
 const expired=await a.evaluate(({native,session,mainKey,overlayKey,eventContext})=>LHRFFatigueNativeAdapter.resolve({native,session,storage:localStorage,mainKey,overlayKey,now:'2027-01-12',eventContext:{...eventContext,asOfDate:'2027-01-12'}}),{native:f.n,session,mainKey,overlayKey,eventContext:f.eventContext});
 assert.equal(expired.adjusted,false);assert.equal(JSON.stringify(expired.session),JSON.stringify(session));
 const disabledView=await a.evaluate(({native,session,mainKey,overlayKey,eventContext})=>{const disabled={...native,featureFlags:{fatigueIntervention:false}},storage={getItem:k=>k===mainKey?JSON.stringify(disabled):localStorage.getItem(k)};return LHRFFatigueNativeAdapter.resolve({native:disabled,session,storage,mainKey,overlayKey,now:'2027-01-05',eventContext})},{native:f.n,session,mainKey,overlayKey,eventContext:f.eventContext});
 assert.equal(disabledView.adjusted,false);assert.equal(JSON.stringify(disabledView.session),JSON.stringify(session));
 const expectedRaw=await b.evaluate(k=>localStorage.getItem(k),overlayKey);
 const rejected=await b.evaluate(({overlayKey,expectedRaw})=>LHRFFatigueOverlayStorage.revoke({storage:localStorage,locks:navigator.locks,overlayKey,expectedRaw,confirmed:false,now:'2027-01-05'}),{overlayKey,expectedRaw});assert.equal(rejected.status,'not-approved');
 const revoked=await b.evaluate(({overlayKey,expectedRaw})=>LHRFFatigueOverlayStorage.revoke({storage:localStorage,locks:navigator.locks,overlayKey,expectedRaw,confirmed:true,now:'2027-01-05'}),{overlayKey,expectedRaw});assert.equal(revoked.status,'revoked');
 const status=await a.evaluate(k=>LHRFFatigueOverlayStorage.inspect(localStorage.getItem(k),'2027-01-05'),overlayKey);assert.equal(status.status,'revoked');assert.equal(await a.evaluate(k=>localStorage.getItem(k),mainKey),raw);
 const afterRevoke=await a.evaluate(({native,session,mainKey,overlayKey,eventContext})=>LHRFFatigueNativeAdapter.resolve({native,session,storage:localStorage,mainKey,overlayKey,now:'2027-01-05',eventContext}),{native:f.n,session,mainKey,overlayKey,eventContext:f.eventContext});assert.equal(afterRevoke.adjusted,false);assert.equal(JSON.stringify(afterRevoke.session),JSON.stringify(session));
 console.log('PASS isolated two-tab storage: stale data, drafts, disable, offline quota retry, concurrent approvals, expiry, revocation');await ctx.close();
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
