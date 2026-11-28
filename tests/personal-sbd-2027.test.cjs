'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const plan=require('../src/personal-sbd-2027.js');
const strength=plan.snapshots()[0].snapshot.weeks;
const running=plan.snapshots()[1].snapshot.weeks;
test('13 complete dated weeks with the Saturday meet in week 13',()=>{
 assert.equal(strength.length,13);assert.equal(running.length,13);assert.equal(plan.START,'2026-11-30');assert.equal(plan.MEET,'2027-02-27');
 assert.deepEqual(strength[12].sessions.filter(x=>x.kind==='event').map(x=>[x.id,x.day]),[['meet',5]]);
});
test('four fixed strength visits per week, no Monday or Wednesday, except competition week',()=>{
 for(let i=0;i<12;i++)assert.deepEqual(strength[i].sessions.filter(x=>x.kind==='strength').map(x=>x.day),[1,3,4,6]);
});
test('third bench exposure on squat day is always light',()=>{
 for(let i=0;i<12;i++){
 const sun=strength[i].sessions.find(x=>x.id==='sun-squat');
 const bench=sun.groups.filter(x=>x.exerciseId==='paused-bench');
 assert.equal(bench.length,1);assert.ok(bench.every(x=>x.rpe<=6));
 }
});
test('deadlift top exposure is one single/double; extra volume is optional and tapers',()=>{
 const expected=[2,2,2,0,2,2,1,0,1,1,1,0];
 for(let i=0;i<12;i++){
  const thu=strength[i].sessions.find(x=>x.id==='thu-deadlift');
  const pulls=thu.groups.filter(x=>x.exerciseId==='competition-deadlift');
  const required=pulls.filter(x=>!x.optional),optional=pulls.filter(x=>x.optional);
  assert.equal(required.length,1);assert.equal(required[0].sets,1);assert.ok(required[0].reps<=2);
  assert.ok(required[0].rpe<=9);
  assert.equal(optional.length,expected[i]);assert.ok(optional.every(x=>x.sets===1&&x.rpe<=7));
  assert.ok(thu.groups.some(x=>x.exerciseId==='leg-press'));
  assert.ok(thu.groups.some(x=>x.exerciseId==='split-squat'));
 }
});
test('peak singles reach RPE nine before the taper and taper genuinely reduces work',()=>{
 for(const day of ['tue-bench','thu-deadlift','sun-squat']){
  const peak=strength[10].sessions.find(s=>s.id===day).groups.filter(x=>x.kind==='lift'&&!x.optional&&x.reps===1);
  assert.ok(peak.some(x=>x.rpe===9),day);
 }
 assert.ok(strength[11].sessions.find(s=>s.id==='thu-deadlift').groups.every(x=>!x.optional));
});
test('optional Saturday never becomes planned running or fatigue evidence',()=>{
 for(let i=0;i<13;i++) {
 assert.ok(running[i].sessions.every(s=>s.day===1));
 assert.ok(strength[i].sessions.filter(s=>s.kind==='run').length===0);
 }
});
test('all loading remains RPE-first with no made-up squat or deadlift reference maximum',()=>{
 for(const week of strength)for(const s of week.sessions)for(const g of s.groups||[]){
 assert.equal(g.referencePercent,null);assert.equal(g.suggestedWeightKg,null);
 assert.ok(g.rpe>=5&&g.rpe<=9);
 }
});
test('meet week removes Thursday, Friday and Sunday work',()=>{
 assert.deepEqual(strength[12].sessions.map(s=>s.day),[1,5]);assert.equal(running[12].sessions.length,0);
});

test('the 13-week owner plan converts to the existing native workout schema without changing inputs',()=>{
 const native=require('../src/native-catalogue.js'),training=require('../src/catalogue-training.js');
 const registry=require('../src/exercise-registry.js'),gym=require('../src/gym-equipment.js');
 const fullInventory=require('./equipment-fixtures.cjs').fullInventory();
 const original=plan.snapshots(),before=JSON.stringify(original);
 const built=native.buildProgramme(original,null,{training,registry,gym,inventory:fullInventory,equipment:[],now:'2026-11-28T12:00:00Z',protectedWeek:()=>false});
 require('../src/programme-replacement.js').validateProgramme(built);
 assert.equal(built.config.weeks,13);
 assert.deepEqual(built.weeks[0].sessions.map(s=>s.day),['Tue','Tue','Thu','Fri','Sun']);
 assert.equal(built.weeks[12].sessions.find(s=>s.eventDate)?.eventDate,'2027-02-27');
 assert.equal(JSON.stringify(original),before);
});

test('native adapter retains optional sets and excludes them from required workload',()=>{
 const native=require('../src/native-catalogue.js'),training=require('../src/catalogue-training.js');
 const registry=require('../src/exercise-registry.js'),gym=require('../src/gym-equipment.js');
 const inventory=require('./equipment-fixtures.cjs').fullInventory();
 const p=native.buildProgramme(plan.snapshots(),null,{training,registry,gym,inventory,equipment:[],now:'2026-11-28T12:00:00Z',protectedWeek:()=>false});
 const dl=p.weeks[0].sessions.find(s=>s.name.includes('Deadlift'));
 const optional=dl.ex.filter(e=>e[5].optional);
 const required=dl.ex.filter(e=>e[5].exerciseId==='competition-deadlift'&&!e[5].optional);
 assert.equal(optional.length,2);assert.equal(required.length,1);
 assert.ok(optional.every(e=>e[1]===1&&e[5].role==='optional'&&e[5].category==='optional'));
 require('../src/programme-replacement.js').validateProgramme(p);
});
