'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const {createEngine} = require('../src/coach-engine');
const {capture, recovery} = require('../src/coaching-evidence');
const running = require('../src/running-preparation');
const {resolveAerobicBuild} = running;
const {buildNewProgramme} = require('../src/coach-adapters');

const day = n => '2026-12-'+String(n).padStart(2,'0');
const at = n => day(n)+'T10:00:00Z';
const now = () => Date.parse(at(14));
const good = {difficulty:'expected',energy:'good',discomfort:'no'};
const hard = {...good,difficulty:'harder',energy:'low'};

function timed(minutes, kind='normal', simplified=true){
 return {role:'easy-run',distanceKnown:false,minutes,aerobicDose:kind,conditionalAerobicBuild:{
  version:1,mode:'time',startingDose:15,startingMinutes:15,...(simplified?{integratedCoachingVersion:1}:{})
 }};
}

function runningSample(...entries){
 const data={runs:[],completedWorkouts:[],sessionFeedback:[]};
 for(const [n,feedback,rpe,extra={},kind='normal'] of entries){
  const date=at(n),id='active-'+n;
  data.completedWorkouts.push({id,date,week:1,completedRun:true,prescription:{runs:[timed(21,kind)],ex:[]}});
  data.runs.push({sessionId:id,date,km:5,min:21,rpe,...extra});
  if(feedback)data.sessionFeedback.push({sessionId:id,date,week:1,...feedback});
 }
 return data;
}

test('integrated easy running keeps an earned dose after isolated difficulty and still responds to corroborated adverse work',()=>{
 const live=(entries,simplified=true)=>resolveAerobicBuild(timed(25,'normal',simplified),
  runningSample([3,good,3],[6,good,3],...entries),{now:now(),ready:true,sessionNamespace:'active-'}).minutes;
 assert.equal(live([]),23);
 assert.equal(live([[10,hard,5]]),21);
 assert.equal(live([[10,hard,5]],false),15);
 assert.equal(live([[10,good,8,{approximateRpe:true}]]),21);
 assert.equal(live([[10,good,7]]),15);
 assert.equal(live([[10,{...good,safetyConcern:true},3]]),15);
 assert.equal(live([[10,good,3,{status:'aborted'}]]),15);
 assert.equal(live([[9,hard,4,{},'deload'],[11,hard,4,{},'deload']]),15);
 assert.equal(live([[9,hard,4],[10,good,3],[11,good,3]]),23);
});

test('integrated running cuts require distinct current linked real completed sessions and an unfinished target',()=>{
 const data=runningSample([8,hard,8],[10,hard,8]);
 data.customRoadmap={startDate:day(7),programmeId:'active',sessionNamespace:'active-',weeks:4,runs:2,
  coachingRulesVersion:2,coachingRuntimeVersion:1,integratedCoachingVersion:1};
 data.activeSchedule=[{id:'active-next',day:'Tue',scheduledDate:day(15),ex:[],runs:[{
  ...timed(40),name:'Easy running',steps:[{role:'easy',minutes:40}]
 }]}];
 const workload=state=>createEngine({data:state,now}).hybridWorkloadRecommendation();
 assert.equal(workload(data).intervention,'running-duration');
 const invalid=structuredClone(data);invalid.runs.at(-1).failed=true;
 assert.ok(!workload(invalid).intervention);
 const duplicate=structuredClone(data);duplicate.runs.push({...duplicate.runs.at(-1)});
 assert.ok(!workload(duplicate).intervention);
 const foreign=structuredClone(data);foreign.runs.at(-1).sessionId=foreign.completedWorkouts.at(-1).id=foreign.sessionFeedback.at(-1).sessionId='older-run';
 assert.ok(!workload(foreign).intervention);
});

test('shared integrated symptom handling ignores explicit negatives and keeps ambiguity and structured risk visible',()=>{
 for(const [symptoms,flags,expected] of [
  ['no pain or symptoms today',{},'none'],['fever and chills',{},'hold'],
  ['chest tightness and shortness of breath',{},'hold'],['no pain',{safetyConcern:true},'hold']
 ]){
  const row={date:at(12),symptoms,...flags},data={checkins:[row]};
  const c={integratedCoachingVersion:1};
  c.coachingEvidence=capture(c,{data,now});
  assert.equal(recovery(c,{now,atDate:day(14),sport:'running',task:'easy'}).restriction,expected);
  assert.equal(createEngine({data:{...data,customRoadmap:c},now}).hybridWorkloadRecommendation().level,
   expected==='none'?'continue':'review');
 }
});

test('a duplicated or same-day outing cannot establish repeatable fitness distance',()=>{
 const config={integratedCoachingVersion:1,weeks:1,startDate:day(14),runs:2,bench:0,squat:0,deadlift:0,runGoal:'fitness',onboardingAerobicBuildVersion:1,
  runProfile:{weeklyKm:28},liftProfiles:{},availableDays:['Mon','Wed','Fri']};
 const outing={sessionId:'old-run',date:at(9),type:'easy-run',km:14,min:81,rpe:3};
 const cases=[[[outing,{...outing,km:13.9,min:82}],false],
  [[outing,{...outing,sessionId:'other-run',date:day(9)+'T18:00:00Z'}],false],
  [[outing,{...outing,sessionId:'other-run',date:at(11)}],true]];
 for(const [runs,distanceKnown] of cases){
  const data={runs},draft=buildNewProgramme(config,{data,now});
  const result=running.assess(draft.config,1,{now});
  assert.equal(result.runs[0].distanceKnown!==false,distanceKnown);
  if(distanceKnown)assert.equal(result.actualKm,28);
 }
 const invalid=running.prepareEvidence({...config,runningDosePolicyVersion:1},{now,data:{runs:[{...outing,date:42}]}});
 assert.equal(invalid.validActivityCount,0);
 assert.equal(invalid.rejected[0].reason,'invalid-or-future-date');
});

test('only applicable symptoms constrain a run, and time or generic readiness cannot clear an applicable concern',()=>{
 const base=runningSample([10,good,3],[12,good,3]);
 const latest=at(13),cutoff=at(1);
 const resolve=(data,role='easy-run')=>resolveAerobicBuild({...timed(25),role},data,{now:now(),ready:true,sessionNamespace:'active-'}).minutes;
 assert.equal(resolve({...base,checkins:[{date:latest,symptoms:'Shoulder pain during Bench, running unaffected'}]}),23);
 assert.equal(resolve({...base,checkins:[{date:latest,symptoms:'No knee pain today'}]}),23);
 assert.equal(resolve({...base,checkins:[{date:cutoff,symptoms:'Knee pain'}]}),15);
 assert.equal(resolve({...base,checkins:[{date:latest,symptoms:'Sharp pain while running',sport:'strength',task:'heavy',affectedLifts:['Bench']}]}),15);
 assert.equal(resolve({...base,checkins:[{date:latest,symptoms:'Shoulder pain and chest tightness'}]}),15);
 const longConcern={date:latest,sport:'running',task:'long',pain:true};
 assert.equal(resolve({...base,checkins:[longConcern]},'long-run'),15);
 assert.equal(resolve({...base,checkins:[longConcern]}),23);
 const note={date:at(8),sport:'running',task:'easy',pain:true};
 const response={observedAt:day(13),sport:'running',task:'easy',status:'normal',nextDayResponse:'normal',referencePerformanceDate:day(12)};
 assert.equal(resolve({...base,checkins:[note],recoveryObservations:[response]}),23);
 assert.equal(resolve({...base,checkins:[note],recoveryObservations:[{...response,referencePerformanceDate:day(11)}]}),15);
 assert.equal(resolve({...base,checkins:[{...note,safetyConcern:true}],recoveryObservations:[response]}),15);
 assert.equal(resolve({...base,checkins:[{...note,safetyConcern:true}],recoveryObservations:[{...response,resolved:true}]}),23);
});

test('unreliable high RPE and conflicting activity volume cannot independently supply a workload trigger',()=>{
 const data=runningSample([8,hard,8],[10,hard,4]);
 data.runs[0].km=3;data.runs[1].km=4;
 data.runs.push({date:'2026-12-04T10:00:00Z',km:10,min:60,rpe:3});
 data.customRoadmap={startDate:day(7),programmeId:'active',sessionNamespace:'active-',weeks:4,runs:2,
  coachingRulesVersion:2,coachingRuntimeVersion:1,integratedCoachingVersion:1};
 data.activeSchedule=[{id:'active-next',day:'Tue',scheduledDate:day(15),ex:[],runs:[{
  ...timed(40),name:'Easy running',steps:[{role:'easy',minutes:40}]
 }]}];
 const recommendation=state=>createEngine({data:state,now}).hybridWorkloadRecommendation();
 assert.equal(recommendation(data).intervention,'running-duration');
 data.runs[0].rpeReliable=false;
 assert.ok(!recommendation(data).intervention);
 data.runs.push({...data.runs[0],km:10,rpe:3});
 assert.ok(!recommendation(data).intervention);
});
