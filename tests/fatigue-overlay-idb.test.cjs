const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('fs'),vm=require('vm'),path=require('path');
const file=path.join(__dirname,'fatigue-overlay-storage.test.cjs'),prelude=fs.readFileSync(file,'utf8').split("test('approval writes")[0];
const {fixture,memory,args}=vm.runInNewContext(prelude+';({fixture,memory,args})',{require:require('module').createRequire(file),structuredClone,console});
const idb=require('../src/fatigue-overlay-idb'),overlay=require('../src/fatigue-overlay');
test('missing or unavailable IndexedDB fails closed and never writes main storage',async()=>{
 const f=fixture(),s=memory(JSON.stringify(f.n)),a=args(f,s,null),before=s.getItem('main');
 assert.equal((await idb.approve({...a,indexedDB:undefined})).status,'unavailable');
 assert.equal((await idb.read({indexedDB:{open(){throw Error('blocked')}},overlayKey:'overlay',now:f.now})).status,'unavailable');
 let ran=false;assert.equal((await idb.withActive({indexedDB:undefined,overlayKey:'overlay',now:f.now},()=>{ran=true})).status,'unavailable');assert.equal(ran,false);
 assert.equal(s.getItem('main'),before);assert.equal(s.writes.length,0);
});
test('invalid date, absent explicit approval and malformed revocation never invoke the database',async()=>{
 const f=fixture(),s=memory(JSON.stringify(f.n)),a=args(f,s,null);let opens=0;const db={open(){opens++;throw Error('must not open')}};
 assert.equal((await idb.read({indexedDB:db,overlayKey:'overlay',now:'2027-02-30'})).status,'invalid');
 assert.equal((await idb.approve({...a,indexedDB:db,approved:false})).status,'not-approved');
 assert.equal((await idb.revoke({indexedDB:db,overlayKey:'overlay',expectedRaw:'{}',confirmed:true,now:f.now})).status,'invalid');
 const result=overlay.approve({state:f.c,assessmentState:f.n,proposal:f.proposal,enabled:true,approved:true,now:f.now,eventContext:f.eventContext,draftContext:{known:true,activeSessionIds:[]}});
 assert.ok(result.overlay);assert.equal((await idb.revoke({indexedDB:db,overlayKey:'overlay',expectedRaw:JSON.stringify(result.overlay),confirmed:false,now:f.now})).status,'not-approved');
 assert.equal(opens,0);assert.equal(s.writes.length,0);
});
