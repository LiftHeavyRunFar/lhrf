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
test('deadlift exposure never exceeds one working single or double',()=>{
 for(let i=0;i<12;i++){
 const thu=strength[i].sessions.find(x=>x.id==='thu-deadlift');
 const pulls=thu.groups.filter(x=>x.exerciseId==='competition-deadlift');
 assert.equal(pulls.length,1);assert.equal(pulls[0].sets,1);assert.ok(pulls[0].reps<=2);assert.ok(pulls[0].rpe<=8);
 assert.ok(thu.groups.some(x=>x.exerciseId==='leg-press'));
 assert.ok(thu.groups.some(x=>x.exerciseId==='split-squat'));
 }
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
 assert.ok(g.rpe>=5&&g.rpe<=8.5);
 }
});
test('meet week removes Thursday, Friday and Sunday work',()=>{
 assert.deepEqual(strength[12].sessions.map(s=>s.day),[1,5]);assert.equal(running[12].sessions.length,0);
});
