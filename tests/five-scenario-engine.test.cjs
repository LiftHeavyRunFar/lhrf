const test=require('node:test');
const assert=require('node:assert/strict');
const fixture=require('./fixtures/five-scenario-engine-inputs.json');
const {run}=require('../scripts/test-five-scenarios.cjs');
const {createEngine}=require('../src/coach-engine.js');
const report=run();
test('five fictional scenarios run native engine with full horizons and immutable inputs',()=>{
 assert.equal(report.synthetic,true);assert.equal(report.provenance.seed,1570806085);
 assert.deepEqual(report.cases.map(c=>c.id),['A','B','C','D','E']);
 for(const row of report.cases){
  assert.equal(row.error,undefined,row.id+': '+row.error?.message);
  assert.equal(row.programme.weeks.length,row.input.weeks);
  assert.equal(row.source.id,row.id);
  assert.ok(Object.values(row.checks).every(v=>v===true),row.id+' read-only/parity/determinism checks');
  assert.ok(row.mapping.length&&row.unsupported.length,'Mapping omissions must remain visible');
 }
});
test('rep-based observations remain observations and use canonical UI estimate rather than fabricated tested max',()=>{
 const row=report.cases.find(c=>c.id==='B'),engine=createEngine();
 assert.deepEqual(row.input.liftProfiles.Squat,{kg:70,reps:5,recency:'recent'});
 assert.deepEqual(row.input.liftProfiles.Bench,{kg:40,reps:5,recency:'recent'});
 assert.deepEqual(row.input.liftProfiles.Deadlift,{kg:90,reps:5,recency:'recent'});
 assert.equal(row.source.strength.tested_1rms,false);
 for(const [lift,p] of Object.entries(row.input.liftProfiles))assert.equal(row.input.baselines[lift],engine.estimatedMax(p.kg,p.reps));
});
test('unknown timestamps, readiness scores and target changes are not fabricated to make fixture pass',()=>{
 const d=report.cases.find(c=>c.id==='D'),c=report.cases.find(c=>c.id==='C');
 assert.equal(d.historicalData.checkins.length,0,'Sleep hours cannot silently become 1–5 scores');
 assert.equal(d.historicalData.sets.length,2,'Only two dated squat observations supplied');
 assert.ok(d.historicalData.sets.every(s=>s.role==='reported-work-set'&&!s.target));
 assert.equal(c.input.runs,3,'Native baseline must not be manually stitched into two-run future');
 assert.equal(c.input.hybridFocus,'running');
 assert.equal(c.source.goals.length,2);
 assert.equal(fixture.source.profiles.find(p=>p.id==='C').availability.separate_double_minimum_gap_hours,6);
});
