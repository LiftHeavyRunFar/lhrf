'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const adapters=require('../src/coach-adapters');
const coach=require('../src/coach-engine');
const running=require('../src/running-preparation');
const {fullInventory}=require('./equipment-fixtures.cjs');

const weekdays=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const clock=()=>Date.parse('2026-11-08T16:00:00Z');
const data=()=>({sets:[],runs:[],completedWorkouts:[],sessionFeedback:[],checkins:[]});
function profile(overrides={}){
 return adapters.normalizeProfile({
  startDate:'2026-11-09',weeks:8,days:7,availableDays:weekdays,runs:4,
  event:'running',priority:'Running',runGoal:'fitness',integratedCoachingVersion:1,onboardingAerobicBuildVersion:1,
  equipmentInventory:fullInventory(),longRunDay:'Sun',
  visitConstraints:{strengthVisits:0},...overrides
 });
}
function history(pattern,{second=pattern,dates=[0,1,3,6],feedback=true,numeric=false,secondReduced=false}={}){
 const state=data();
 for(const [week,values] of [pattern,second].entries()){
  const start=Date.parse(week===0?'2026-10-19T08:00:00Z':'2026-10-26T08:00:00Z');
  for(const [index,km] of values.entries()){
   const date=new Date(start+(dates[index]??index)*86400000).toISOString();
   const id='training-'+week+'-'+index,min=Math.ceil(km*6.25);
   const run={role:'easy-run',distanceKm:km,minutes:min,steps:[{role:'easy',distanceKm:km}],
    aerobicDose:week===1&&secondReduced?'deload':'normal'};
   state.completedWorkouts.push({id,date,week,completedRun:true,prescription:{runs:[run]}});
   state.runs.push({date,sessionId:id,type:'easy-run',km,min,rpe:numeric?3:null});
   if(feedback)state.sessionFeedback.push({date,sessionId:id,week,difficulty:'expected',energy:'good',discomfort:'no'});
  }
 }
 return state;
}
const prepared=(raw,records)=>coach.prepareNewProgramme(raw,{data:records,now:clock});
const assessment=(c,week)=>running.assess(c,week,{now:clock});
const km=week=>week.runs.map(run=>run.distanceKm).sort((a,b)=>a-b);
const runs=week=>week.sessions.flatMap(session=>session.runs||[]);
const distances=rows=>rows.map(run=>run.distanceKm).sort((a,b)=>a-b);

test('verified uneven fitness routine preserves 48 km across familiar distances without requiring a pace result',()=>{
 const records=history([10,10,12,16]);
 const raw={...profile(),runProfile:{weeklyKm:48},runningHistory:{weeklyKm:[48,48,48]}};
 const c=prepared(raw,records);
 const first=assessment(c,1);
 assert.deepEqual(km(first),[10,10,12,16]);
 assert.equal(first.actualKm,48);
 assert.equal(first.longKm,16);
 assert.equal(first.runs.find(run=>run.role==='long-run').distanceKm,16);
 assert.ok(first.runs.every(run=>run.minutes>0));
 const paced=prepared({...raw,runProfile:{...raw.runProfile,distance:10,seconds:2400,effort:'performance',resultDate:'2026-11-01'}},records);
 assert.deepEqual(km(assessment(paced,1)),km(first));
 const second=assessment(c,2);
 assert.ok(second.actualKm>48);
 assert.ok(second.runs.every(run=>Number.isInteger(run.conditionalAerobicBuild.capacitySlot)));
 const deload=assessment(c,4);
 assert.ok(deload.actualKm<second.actualKm);
 assert.ok(deload.runs.every(run=>run.aerobicDose==='deload'));
});

test('maintenance preserves the familiar pattern while reducing volume in planned recovery weeks',()=>{
 const c=prepared({...profile({runningMode:'maintenance'}),runProfile:{weeklyKm:48}},history([10,10,12,16]));
 for(const week of [1,2,3,5,6,7]){
  const a=assessment(c,week);
  assert.deepEqual(km(a),[10,10,12,16]);
  assert.ok(a.runs.every(run=>!run.conditionalAerobicBuild));
 }
 assert.ok(assessment(c,4).actualKm<48);
});

test('requested move from two to seven runs stages one short easy day without increasing total or longest outing',()=>{
 const c=prepared({...profile({runs:7}),runProfile:{weeklyKm:28}},history([14,14]));
 for(const week of [1,2]){
  const a=assessment(c,week);
  assert.deepEqual(km(a),[14,14]);
  assert.equal(a.runningFrequency.effective,2);
 }
 const third=assessment(c,3);
 assert.equal(third.runningFrequency.requested,7);
 assert.equal(third.runningFrequency.effective,3);
 assert.equal(third.runs.filter(run=>run.frequencyTrial).length,1);
 assert.deepEqual(km(third),[3,12.5,12.5]);
 assert.equal(third.actualKm,28);
 assert.ok(third.longKm<14);
 assert.equal(assessment(c,4).runningFrequency.effective,2);
 assert.equal(assessment(c,7).runningFrequency.effective,3);
});

test('partial, duplicated day and reduced logs cannot establish a habitual frequency increase',()=>{
 const raw={...profile({runs:7}),runProfile:{weeklyKm:28}};
 const adverse=history([14,14],{numeric:true});
 adverse.sessionFeedback.at(-1).discomfort='yes';
 for(const records of [
  history([14,14],{second:[14]}),
  history([14,14],{dates:[1,1]}),
  history([14,14],{secondReduced:true}),
  history([14,14],{feedback:false}),adverse
 ]){
  const c=prepared(raw,records);
  assert.equal(assessment(c,3).runningFrequency.familiar,null);
  assert.equal(assessment(c,3).runningFrequency.effective,2);
  assert.equal(assessment(c,3).runs.some(run=>run.frequencyTrial),false);
 }
});
test('two successful short trial weeks can establish the new frequency at an explicit fresh review',()=>{
 const records=history([3,12.5,12.5]);
 for(const row of records.completedWorkouts.filter(row=>row.id.endsWith('-0'))){
  const run=row.prescription.runs[0];
  run.aerobicDose='frequency-trial';run.frequencyTrial=true;
 }
 const raw={...profile({runs:4}),runProfile:{weeklyKm:28}};
 const revised=prepared(raw,records),first=assessment(revised,1);
 assert.equal(first.runningFrequency.familiar,3);
 assert.deepEqual(km(first),[3,12.5,12.5]);
 const uncertain=structuredClone(records);
 uncertain.sessionFeedback.find(row=>row.sessionId==='training-1-0').energy='low';
 assert.equal(assessment(prepared(raw,uncertain),1).runningFrequency.familiar,null);
});

test('a later planned increase cannot ratchet up its live starting dose without new evidence',()=>{
 const raw={...profile(),runProfile:{weeklyKm:48}};
 const c=prepared(raw,history([12,12,12,16]));
 const first=assessment(c,1),later=assessment(c,7);
 assert.ok(later.actualKm>first.actualKm);
 const live=later.runs.map(run=>running.resolveAerobicBuild(run,data(),{now:clock(),ready:true}));
 assert.deepEqual(distances(live),km(first));
});

test('a proved seven-day runner keeps seven days while a requested reduction does not concentrate mileage',()=>{
 const records=history([4,4,4,4,4,4,4],{dates:[0,1,2,3,4,5,6]});
 const raw={...profile({runs:7}),runProfile:{weeklyKm:28}};
 assert.equal(assessment(prepared(raw,records),1).runningFrequency.effective,7);
 const fewer=assessment(prepared({...raw,runs:3},records),1);
 assert.deepEqual(km(fewer),[4,4,4]);
 assert.equal(fewer.actualKm,12);
});
test('familiar exceptional long work is retained without extending it, while a scoped concern removes the long outing',()=>{
 const records=history([4,24]),raw={...profile({runs:2,weeks:20}),runProfile:{weeklyKm:28}};
 const familiar=prepared(raw,records);
 assert.deepEqual(km(assessment(familiar,1)),[4,24]);
 assert.equal(assessment(familiar,19).longKm,24);
 const concern=prepared({...raw,recoveryObservations:[{sport:'running',task:'long',status:'fatigue',
  observedAt:'2026-11-07'}]},records);
 const restricted=assessment(concern,1);
 assert.equal(restricted.recoveryContext.runningTasks.easy.restriction,'none');
 assert.notEqual(restricted.recoveryContext.runningTasks.long.restriction,'none');
 assert.deepEqual(km(restricted),[4,4]);
 assert.ok(restricted.runs.every(run=>run.role==='easy-run'&&!run.conditionalAerobicBuild));
 const routine=prepared({...profile(),runProfile:{weeklyKm:48},recoveryObservations:concern.recoveryObservations},history([10,10,12,16]));
 assert.deepEqual(km(assessment(routine,1)),[10,10,10,12]);
});
test('ordinary easy outlets cannot overtake the protected long outing as a fitness block grows',()=>{
 const c=prepared({...profile({runs:2,weeks:20}),runProfile:{weeklyKm:28}},history([14,14]));
 const late=assessment(c,19);
 assert.equal(late.longKm,16);
 assert.deepEqual(km(late),[16,16]);
});

test('programme calendar renders the actual frequency, preserves the selected long day and does not orphan a trial',()=>{
 const records=history([14,14]),raw={...profile({runs:7}),runProfile:{weeklyKm:28}};
 const programme=adapters.buildNewProgramme(raw,{data:records,now:clock});
 for(const [index,expected] of [2,2,3,2,3,3,3,2].entries()){
  const week=programme.weeks[index], scheduled=runs(week);
  assert.equal(week.feasible,true,JSON.stringify(week.blockingIssues));
  assert.equal(scheduled.length,expected);
  assert.equal(new Set(week.sessions.filter(session=>session.runs.length).map(session=>session.day)).size,expected);
  assert.equal(week.sessions.find(session=>session.runs.some(run=>run.role==='long-run')).day,'Sun');
  assert.deepEqual(distances(scheduled),km(assessment(programme.config,index+1)));
 }
 assert.equal(runs(programme.weeks[2]).filter(run=>run.frequencyTrial).length,1);
});

test('plan-first familiar running has executable scheduled progression without a workout-start unlock',()=>{
 const records=history([10,10,12,16]),c=prepared({...profile({planFirstVersion:1}),runProfile:{weeklyKm:48}},records);
 const first=assessment(c,1),second=assessment(c,2),deload=assessment(c,4),fifth=assessment(c,5);
 assert.equal(first.actualKm,48);
 assert.ok(second.actualKm>first.actualKm&&fifth.actualKm>second.actualKm);
 assert.ok(deload.actualKm<second.actualKm);
 assert.ok(second.runs.every(run=>!run.conditionalAerobicBuild));
 const pain={sport:'running',task:'easy',status:'pain',observedAt:'2026-11-07'};
 const restricted=prepared({...profile({planFirstVersion:1}),runProfile:{weeklyKm:48},recoveryObservations:[pain]},records);
 assert.deepEqual(assessment(restricted,1).runs,[]);
 const novice=prepared(profile({runs:2,planFirstVersion:1}),data());
 assert.ok(assessment(novice,6).runs.every(run=>run.conditionalAerobicBuild));
 const frequency=prepared({...profile({runs:7,planFirstVersion:1}),runProfile:{weeklyKm:48}},records);
 assert.equal(assessment(frequency,3).runs.filter(run=>run.frequencyTrial).length,1);
});
