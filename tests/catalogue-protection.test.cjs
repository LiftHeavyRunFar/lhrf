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
