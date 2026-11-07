// Priya's independent attribution controls; all records are fictional.
const test=require('node:test'),assert=require('node:assert/strict');
const {inspect}=require('../scripts/inspect-november-programme.cjs');
const coach=require('../src/coach-engine');
const clone=x=>JSON.parse(JSON.stringify(x)),asOf='2026-11-07T18:00:00Z';
function fixture(){
 const config={programmeId:'assurance-only',startDate:'2026-11-02',weeks:2};
 const saved={id:'assurance-sunday',day:'Sun',scheduledDate:'2026-11-08',name:'Fictional practice',
  ex:[['Squat',2,3,100,5.5,{role:'straight',light:true}]],runs:[]};
 return {customRoadmap:config,activeCustomWeek:1,activeSchedule:[clone(saved)],
  reviewedProgramme:{config:clone(config),weeks:[{week:1,sessions:[clone(saved)]},{week:2,sessions:[]}]},
  sets:[],runs:[],checkins:[],completedWorkouts:[],decisions:[],overrides:{}};
}
test('independent November assurance: conflicting frozen and active rows stay distinct and attribution remains unresolved',()=>{
 const source=fixture();source.activeSchedule[0].ex[0][3]=110;
 const original=JSON.stringify(source),report=inspect(source,asOf);
 assert.equal(JSON.stringify(source),original);
 assert.deepEqual(report.tomorrow.prescriptions.map(x=>x.basePrescription.ex[0][3]),[100,110]);
 assert.deepEqual(report.tomorrow.prescriptions.map(x=>x.origin),['reviewedProgramme.weeks','activeSchedule']);
 assert.ok(report.uncertainties.some(x=>/Active and frozen prescriptions differ/.test(x)));
 assert.equal(report.proposedCorrection.replacementReady,false);
 assert.deepEqual(report.proposedCorrection.changedPrescriptions,[]);
});
test('independent November assurance: missing source dates stay unknown and malformed/missing history is rejected',()=>{
 const source=fixture();delete source.reviewedProgramme;delete source.customRoadmap.startDate;
 delete source.activeSchedule[0].scheduledDate;source.activeSchedule[0].day='Unknown';
 const report=inspect(source,asOf);
 assert.equal(report.currentPrescriptions[0].date,null);
 assert.deepEqual(report.tomorrow.prescriptions,[]);
 assert.ok(report.uncertainties.some(x=>/no trustworthy calendar date/.test(x)));
 assert.ok(report.uncertainties.some(x=>/does not establish a rest day/.test(x)));
 for(const collection of ['sets','runs','checkins']){
  const invalid=fixture();delete invalid[collection];assert.throws(()=>inspect(invalid,asOf),/arrays|history|sets|runs|checkins|backup/i);
 }
});
test('independent November assurance: failed, warm-up, unreliable and future records never become eligible lower-body evidence',()=>{
 const source=fixture(),valid={date:'2026-11-05T09:00:00Z',exercise:'Squat',weight:100,reps:3,rpe:5};
 source.sets=[valid,...[{failed:true},{techniqueFailed:true},{warmup:true},{optional:true},{category:'warm-up'},
  {rpeReliable:false},{evidenceReview:{rpe:{approximate:true}}},{date:'2026-11-07T22:00:00Z'},
  {date:'2026-11-08T09:00:00Z'},{date:'2026-02-30T09:00:00Z'},{date:undefined}].map(extra=>({...valid,...extra}))];
 source.runs=[{date:'2026-10-31',sourceActivityId:'synthetic-preserved',sessionId:'prior',km:7,min:45,rpe:5}];
 const before=JSON.stringify(source),report=inspect(source,asOf);
 assert.deepEqual(report.recordedEvidence.eligibleCompletedLowerBody,[valid]);
 assert.equal(report.recordedEvidence.excludedUndatedOrFutureSetCount,4);
 assert.deepEqual(report.recordedEvidence.lastWeek.runs,source.runs);
 assert.equal(JSON.stringify(source),before);
});
test('independent November assurance: inspecting saved overrides does not call programme generation',()=>{
 const source=fixture(),original=coach.createEngine;let created=0;
 coach.createEngine=options=>{
  created++;const engine=original(options);
  for(const method of ['generatedSessions','customPlan','carryForwardApprovedProgression','applyApprovedHybridRunning'])
   engine[method]=()=>{throw Error('Attribution attempted '+method);};
  return engine;
 };
 try{const report=inspect(source,asOf);assert.ok(created);assert.equal(report.generationPerformed,false);assert.equal(report.activated,false);}
 finally{coach.createEngine=original;}
});
