const {test}=require('node:test'),assert=require('node:assert/strict');
const catalogue=require('../src/programme-catalogue'),training=require('../src/catalogue-training'),native=require('../src/native-catalogue'),registry=require('../src/exercise-registry'),gym=require('../src/gym-equipment');
const assessment=require('../src/fatigue-assessment'),store=require('../src/fatigue-overlay-storage'),adapter=require('../src/fatigue-native-adapter');
function fixture(){
 const c=training.enrol(training.empty(),catalogue.previewProgramme('lifting-foundation',{continuation:true}),'2026-11-09','r');
 const p=native.buildProgramme(c.plans,null,{training,registry,gym,inventory:{items:{}},now:'2026-11-09T09:00:00Z',equipment:[],protectedWeek:()=>false});
 const n={customRoadmap:p.config,reviewedProgramme:{weeks:p.weeks},completedWorkouts:[],sets:[],runs:[],fatigueEvidence:[],featureFlags:{fatigueIntervention:true}};
 for(const [i,week] of [4,6,7,8,9].entries()){
  const s=p.weeks[week-1].sessions.find(x=>x.catalogueOccurrenceId.endsWith('-A')),stamp=s.scheduledDate+'T09:00:00.000Z',total=s.ex.reduce((sum,x)=>sum+x[1],0);
  n.completedWorkouts.push({id:s.id,date:stamp,completedSets:total,plannedSets:total,prescription:{ex:structuredClone(s.ex),runs:[]}});
  s.ex.forEach((x,k)=>{for(let set=1;set<=x[1];set++)n.sets.push({sessionId:s.id,date:stamp,exerciseId:x[5].exerciseId,set,reps:x[2],weight:k===0?(i<3?100:80):50,rpe:7});});
  n.fatigueEvidence.push({sessionId:s.id,discipline:'strength',recordedAt:stamp,painOrDiscomfort:'no',illness:'no',unusualFatigue:i===4?'yes':'no'});
 }
 const now='2027-01-05',proposal=assessment.assess({state:n,discipline:'strength',now,policy:{minDeclineFraction:.1,recentDays:14}}).candidate;assert.ok(proposal);
 const eventContext={asOfDate:now,eventInformationUnchanged:true,eventFreeAttestation:{source:'athlete-confirmed',confirmedOn:now,noOtherEventOrTaper:true,boundPlans:JSON.stringify(c.plans)}};
 return {n,c,now,proposal,eventContext};
}
function memory(raw){const values=new Map([['main',raw]]),writes=[];return {values,writes,getItem:k=>values.has(k)?values.get(k):null,setItem(k,v){writes.push(k);values.set(k,v)},removeItem:k=>values.delete(k)};}
function lock(){let held=false;return {async request(name,opts,fn){if(held)return fn(null);held=true;try{return await fn({name})}finally{held=false}}};}
function args(f,s,l){return {storage:s,locks:l,mainKey:'main',overlayKey:'overlay',expectedRaw:JSON.stringify(f.n),proposal:f.proposal,approved:true,now:f.now,eventContext:f.eventContext};}
test('approval writes only separate key, preserves generated programme and rejects competing approvals',async()=>{
 const f=fixture(),raw=JSON.stringify(f.n),s=memory(raw),l=lock(),a=args(f,s,l);
 const result=await Promise.all([store.approve(a),store.approve(a)]);assert.deepEqual(result.map(x=>x.status),['saved','busy']);
 assert.deepEqual(s.writes,['overlay']);assert.equal(s.getItem('main'),raw);assert.equal(JSON.parse(s.getItem('overlay')).end,'2027-01-11');
 assert.equal((await store.approve(a)).status,'conflict');
 const saved=JSON.parse(s.getItem('overlay')),change=saved.changes[0],occ=f.c.occurrences.find(o=>o.id===change.occurrenceId),key=occ.planId+'-w'+occ.week+'-'+occ.sessionId;
 const session=f.n.reviewedProgramme.weeks.flatMap(w=>w.sessions).find(x=>x.catalogueOccurrenceId===key);
 const view=adapter.resolve({native:JSON.parse(s.getItem('main')),session,approvedOverlay:saved,now:f.now,eventContext:f.eventContext,draftContext:adapter.draftContext(s)});
 assert.equal(view.adjusted,true);assert.deepEqual(view.audit.original.ex,session.ex);
});
test('unavailable locks, stale main state and active drafts fail closed without writes',async()=>{
 const f=fixture(),s=memory(JSON.stringify(f.n)),a=args(f,s,lock());
 assert.equal((await store.approve({...a,locks:null})).status,'unavailable');assert.equal((await store.approve({...a,expectedRaw:'{}'})).status,'conflict');
 s.values.set('lhrf_fresh_beta_live_v1114',JSON.stringify({id:'in-progress'}));assert.equal((await store.approve(a)).status,'conflict');assert.deepEqual(s.writes,[]);
});
test('storage failure is retryable; changing main data during approval is never overwritten',async()=>{
 const f=fixture(),raw=JSON.stringify(f.n),s=memory(raw),a=args(f,s,lock());const save=s.setItem;
 s.setItem=()=>{throw Error('quota')};assert.equal((await store.approve(a)).status,'failed');assert.equal(s.getItem('main'),raw);
 s.setItem=save;assert.equal((await store.approve(a)).status,'saved');assert.equal(s.getItem('main'),raw);
 const s2=memory(raw),a2=args(f,s2,lock()),old=s2.setItem;s2.setItem=function(k,v){old.call(this,k,v);this.values.set('main',JSON.stringify({...f.n,newerLog:'kept'}))};
 assert.equal((await store.approve(a2)).status,'conflict');assert.equal(JSON.parse(s2.getItem('main')).newerLog,'kept');assert.equal(s2.getItem('overlay'),null);
});
test('another tab saving immediately after the final pre-write comparison is not overwritten',async()=>{
 const f=fixture(),raw=JSON.stringify(f.n),other=JSON.stringify({...f.n,otherTabRecord:'newly saved workout'}),s=memory(raw),get=s.getItem;let mainReads=0;
 s.getItem=function(k){const value=get.call(this,k);if(k==='main'&&++mainReads===2)this.values.set('main',other);return value};
 const out=await store.approve(args(f,s,lock()));assert.notEqual(out.status,'saved');assert.equal(s.getItem('main'),other);assert.equal(s.getItem('overlay'),null);
});
test('expiry and confirmed revocation fail closed, preserve audit and cannot be recreated by a stale writer',async()=>{
 const f=fixture(),raw=JSON.stringify(f.n),s=memory(raw),l=lock(),a=args(f,s,l);assert.equal((await store.approve(a)).status,'saved');const saved=s.getItem('overlay');
 assert.equal(store.inspect(saved,'2027-01-05').status,'active');assert.equal(store.inspect(saved,'2027-01-11').status,'active');assert.equal(store.inspect(saved,'2027-01-12').status,'expired');
 assert.equal((await store.revoke({storage:s,locks:l,overlayKey:'overlay',expectedRaw:saved,confirmed:false,now:'2027-01-06'})).status,'not-approved');assert.equal(s.getItem('overlay'),saved);
 assert.equal((await store.revoke({storage:s,locks:l,overlayKey:'overlay',expectedRaw:saved,confirmed:true,now:'2027-01-06'})).status,'revoked');
 const tombstone=s.getItem('overlay');assert.equal(store.inspect(tombstone,'2027-01-06').status,'revoked');assert.deepEqual(JSON.parse(tombstone).previous,JSON.parse(saved));
 assert.equal((await store.approve(a)).status,'conflict');assert.equal((await store.revoke({storage:s,locks:l,overlayKey:'overlay',expectedRaw:saved,confirmed:true,now:'2027-01-06'})).status,'conflict');assert.equal(s.getItem('main'),raw);
});
