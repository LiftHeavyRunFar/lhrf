const assert=require('node:assert/strict');
const {structureRuns}=require('../src/run-sessions-v2.js');
for(const duration of [15,20,24,25,30,35,40,45,50,60]){
 const input=[{type:'quality',minutes:duration,effort:'controlled quality / RPE 6–7'}];
 const before=JSON.stringify(input),r=structureRuns(input,{pb10k:'1:05:00'})[0];
 assert.equal(JSON.stringify(input),before);
 assert.equal(r.workout.totalMinutes,duration);
 assert.equal(r.workout.blocks.reduce((n,b)=>n+b.minutes,0),duration);
 if(r.workout.kind==='controlled-intervals'){
  assert.equal(r.workout.blocks.filter(b=>b.kind==='work').length,r.workout.repetitions);
  assert.equal(r.workout.blocks.filter(b=>b.kind==='recovery').length,r.workout.repetitions-1);
  assert.ok(r.workout.blocks.every(b=>b.minutes>0));
  assert.ok(r.workout.blocks.filter(b=>b.kind==='work').every(b=>b.pace?.label));
 }
}
const easy=structureRuns([{type:'easy',minutes:25},{type:'long',minutes:70}],{}) ;
assert.ok(easy.every(r=>r.workout.blocks.length===1));
assert.ok(easy.every(r=>r.pace===null));
console.log('PASS bounded interval work/rest/warmup/cooldown and optional pace guidance');
