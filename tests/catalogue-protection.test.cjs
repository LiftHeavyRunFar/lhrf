const {test}=require('node:test'),assert=require('node:assert/strict');
const catalogue=require('../src/programme-catalogue.js'),training=require('../src/catalogue-training.js'),guard=require('../src/catalogue-protection.js');
function plan(id){return training.enrol(training.empty(),catalogue.previewProgramme(id),'2026-11-09','plan-'+id).plans[0]}
const occurrence=(p,w,s)=>({catalogueOccurrenceId:p.id+'-w'+w+'-'+s});
test('actual event, race and benchmark source sessions resolve with taper unknown and protected',()=>{
 for(const id of ['powerlifting-three-day','powerlifting-four-day','bench-specialisation','deadlift-specialisation']){
  const p=plan(id);assert.equal(guard.inspect([p],occurrence(p,p.snapshot.durationWeeks,'meet')).classification,'event');
 }
 for(const id of ['10k-two-run','10k-three-run','half-marathon','marathon-distance','marathon-timed']){
  const p=plan(id),out=guard.inspect([p],occurrence(p,p.snapshot.durationWeeks,'race'));
  assert.equal(out.classification,'race',id);assert.equal(out.taper,'unknown');assert.equal(out.protected,true);
 }
 const p=plan('general-strength');assert.equal(guard.inspect([p],occurrence(p,8,'C')).classification,'benchmark');
});
test('ordinary sessions remain protected because no explicit taper data is available',()=>{
 for(const entry of catalogue.listProgrammes()){
  const p=plan(entry.id),w=p.snapshot.weeks[0],s=w.sessions[0],out=guard.inspect([p],occurrence(p,w.week,s.id));
  assert.equal(out.classification,'training',entry.id);assert.equal(out.taper,'unknown');assert.equal(out.protected,true);
 }
});
test('missing, duplicate, unrecognised and inconsistent source must fail closed',()=>{
 const p=plan('10k-two-run'),o=occurrence(p,6,'race');
 for(const [plans,occ] of [[[],o],[[p,p],o],[[p],{}],[[p],{catalogueOccurrenceId:o.catalogueOccurrenceId+'-suffix'}]]){
  const out=guard.inspect(plans,occ);assert.equal(out.classification,'unknown');assert.equal(out.protected,true);
 }
 const newer=structuredClone(p);newer.snapshot.revision='future';assert.equal(guard.inspect([newer],o).classification,'unknown');
 const bad=structuredClone(p);bad.snapshot.weeks[5].sessions.find(s=>s.id==='race').steps=[];assert.equal(guard.inspect([bad],o).classification,'unknown');
});
test('matching uses the complete occurrence key, not substring or separator parsing',()=>{
 const a=plan('general-strength'),b=structuredClone(a);a.id='a-w1-A';b.id='a';
 const original=JSON.stringify([a,b]);
 const out=guard.inspect([a,b],occurrence(a,8,'C'));
 assert.equal(out.classification,'benchmark');assert.equal(JSON.stringify([a,b]),original);
});
const eventFree=(plans)=>({asOfDate:'2026-11-09',eventInformationUnchanged:true,eventFreeAttestation:{source:'athlete-confirmed',confirmedOn:'2026-11-09',noOtherEventOrTaper:true,boundPlans:JSON.stringify(plans)}});
test('event-free foundation and running base require explicit confirmation scoped to exact complete snapshots',()=>{
 for(const id of ['lifting-foundation','running-base'])for(const continuation of [false,true]){
  const p=training.enrol(training.empty(),catalogue.previewProgramme(id,{continuation}),'2026-11-09','p-'+id).plans[0];
  const o=occurrence(p,1,p.snapshot.weeks[0].sessions[0].id);
  assert.equal(guard.inspect([p],o).protected,true);
  assert.equal(guard.inspect([p],o,eventFree([p])).protected,false);
  assert.equal(guard.inspect([p],o,eventFree([p])).taper,'not-applicable');
  const last=eventFree([p]);last.asOfDate='2026-11-15';assert.equal(guard.inspect([p],o,last).protected,false);
  for(const change of [c=>delete c.eventFreeAttestation.source,c=>c.eventFreeAttestation.noOtherEventOrTaper=false,c=>c.eventFreeAttestation.boundPlans='old',c=>c.eventFreeAttestation.confirmedOn='2026-11-10',c=>c.asOfDate='2026-11-16',c=>c.asOfDate='2026-02-30',c=>delete c.eventInformationUnchanged,c=>c.eventInformationUnchanged=false]){
   const c=eventFree([p]);change(c);assert.equal(guard.inspect([p],o,c).protected,true);
  }
 }
});
test('incomplete or tampered event-free snapshots and hybrid event programmes fail closed',()=>{
 const p=plan('running-base'),o=occurrence(p,1,'easy-1'),original=structuredClone(p),c=eventFree([p]);
 p.snapshot.weeks.pop();assert.equal(guard.inspect([p],o,c).protected,true);assert.equal(guard.inspect([p],o,eventFree([p])).protected,true);
 const altered=structuredClone(original);altered.snapshot.weeks[4].sessions[0].steps[0].role='race';
 assert.equal(guard.inspect([altered],o,eventFree([altered])).protected,true);
 const extraEvent=structuredClone(original);extraEvent.snapshot.weeks[1].sessions[0].raceDate='2026-11-20';
 assert.equal(guard.inspect([extraEvent],o,eventFree([extraEvent])).protected,true);
 const renamed=structuredClone(original);renamed.snapshot.weeks[1].sessions[0].title='Unlabelled test day';
 assert.equal(guard.inspect([renamed],o,eventFree([renamed])).protected,true);
 const lift=plan('lifting-foundation'),hybrid=[original,lift];
 assert.equal(guard.inspect(hybrid,o,eventFree(hybrid)).protected,false);
 const race=plan('10k-two-run'),mixed=[original,race];
 assert.equal(guard.inspect(mixed,o,eventFree(mixed)).protected,true);
 const meet=plan('powerlifting-four-day'),mixedLift=[lift,meet];
 assert.equal(guard.inspect(mixedLift,occurrence(lift,1,'A'),eventFree(mixedLift)).protected,true);
 assert.equal(guard.inspect([original,original],o,eventFree([original,original])).protected,true);
});
