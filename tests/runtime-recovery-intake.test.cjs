const test=require('node:test'),assert=require('node:assert/strict'),intake=require('../src/coach-intake.js'),coach=require('../src/coach-engine.js'),evidence=require('../src/coaching-evidence.js');
const {fullInventory}=require('./equipment-fixtures.cjs'),{record}=require('./fixtures/independent-coaching-inputs.cjs');
const now=()=>Date.parse('2026-11-07T12:00:00Z');
const base={startDate:'2026-11-09',weeks:4,availableDays:['Mon'],bench:1,squat:0,deadlift:0,runs:0,trainingAge:'intermediate',priority:'Bench',equipmentInventory:fullInventory(),runningHistory:{recentMarathonDate:'2026-11-01'},liftProfiles:{Bench:{kg:120,reps:1}},runProfile:{}};
const observation={sport:'strength',task:'heavy',lift:'Bench',observedAt:'2026-11-06',referencePerformanceDate:'2026-11-05',status:'normal',nextDayResponse:'normal',source:'athlete-recovery-review'};
const raw=observations=>({sessionTimeVersion:1,strengthVisits:1,minutes:{Mon:90},recentMarathonDate:'2026-11-01',recoveryObservations:observations});
test('proposal intake preserves a dated task response and binds it to actual completed evidence without changing logs',()=>{
 const data={sets:[record('Bench',100,3,7,'top','2026-11-05T12:00:00Z',{trainingRole:'heavy'})],runs:[]},input=raw([observation]),before=JSON.stringify({base,data,input}),prepared=coach.prepareNewProgramme(intake.build(base,input),{data,now});
 assert.equal(evidence.recovery(prepared,{now,sport:'strength',task:'heavy',lift:'Bench',atDate:'2026-11-09'}).status,'normal');assert.equal(prepared.recoveryObservations[0].referencePerformanceDate,'2026-11-05');assert.equal(JSON.stringify({base,data,input}),before);
 const unsupported=coach.prepareNewProgramme(intake.build(base,input),{data:{sets:[],runs:[]},now});assert.equal(evidence.recovery(unsupported,{now,sport:'strength',task:'heavy',lift:'Bench',atDate:'2026-11-09'}).canProgress,false);
});
test('proposal intake rejects same-day readiness disguised as a subsequent response and leaves scoped concerns available',()=>{
 for(const extra of [{observedAt:'2026-11-05'},{referencePerformanceDate:''},{task:'easy'},{observedAt:'2026-02-30'}])assert.throws(()=>intake.build(base,raw([{...observation,...extra}])),RangeError);
 const concern={sport:'all',task:'all',observedAt:'2026-11-04',status:'pain',source:'preserved-recovery-concern'},prepared=intake.build(base,raw([concern,observation]));assert.deepEqual(prepared.recoveryObservations,[concern,observation]);
});
test('legacy intake can reassess an undated task concern without inventing its onset date',()=>{
 const observations=[{observedAt:null,recordedAt:'2026-11-04T12:00:00.000Z',sport:'strength',task:'lifting',lift:'Squat',status:'fatigue',source:'preserved-recovery-concern'}];
 const input=intake.build(base,raw(observations)),held=coach.prepareNewProgramme(input,{data:{sets:[],runs:[]},now});assert.equal(evidence.recovery(held,{now,sport:'strength',task:'heavy',lift:'Squat',atDate:'2026-11-09'}).canProgress,false);
 const response={...observation,lift:'Squat'},updated=intake.build(base,raw([...observations,response])),prepared=coach.prepareNewProgramme(updated,{data:{sets:[record('Squat',100,3,7,'top','2026-11-05T12:00:00Z',{trainingRole:'heavy'})],runs:[]},now});
 assert.equal(evidence.recovery(prepared,{now,sport:'strength',task:'heavy',lift:'Squat',atDate:'2026-11-09'}).status,'normal');assert.equal(prepared.recoveryObservations[0].observedAt,null,'The onset date remains unknown even when later task evidence supports reassessment.');
});
