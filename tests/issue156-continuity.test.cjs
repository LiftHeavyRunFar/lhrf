'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const coach=require('../src/coach-engine');
const running=require('../src/running-preparation');
const adapters=require('../src/coach-adapters');
const {fullInventory}=require('./equipment-fixtures.cjs');
const registry=require('../src/exercise-registry');
const replacement=require('../src/programme-replacement');

const now=()=>Date.parse('2026-11-08T18:00:00Z');
const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const state=()=>({sets:[],runs:[],completedWorkouts:[],sessionFeedback:[],checkins:[]});
const config=(extra={})=>adapters.normalizeProfile({
 integratedCoachingVersion:1,startDate:'2026-11-09',weeks:3,days:7,availableDays:days,event:'running',
 runs:2,runGoal:'10k',priority:'Running',runningTargetDate:'2026-11-29',
 equipmentInventory:fullInventory(),visitConstraints:{strengthVisits:0,eventDays:{'2026-11-29':{confirmed:true}}},
 ...extra
});
function run(state,date,km,plannedKm,extra={}){
 const id='run-'+date,timestamp=date+'T09:15:00Z',reported=date+'T10:00:00Z';
 const {reason=null,effort=null,role='easy-run',adaptation=false}=extra;
 state.runs.push({date:timestamp,sessionId:id,km,min:30,type:role==='easy-run'?'Garmin run import':role,rpe:effort});
 state.completedWorkouts.push({id,date:reported,week:1,completedRun:true,
  prescription:{runs:[{role,distanceKm:plannedKm,minutes:36}]},
  ...(adaptation?{timeAdaptation:{reason:'unexpected-time-limit'}}:{})});
 if(reason)state.sessionFeedback.push({sessionId:id,date:reported,week:1,interruptionReason:reason});
}
function fixture(reason,omitLatest=false){
 const s=state();
 run(s,'2026-10-31',6,8);
 run(s,'2026-11-03',5,5.1);
 if(!omitLatest)run(s,'2026-11-07',2,5,{reason});
 return s;
}
function proposed(s,extra={},clock=now){
 const raw={...config(extra),runProfile:{weeklyKm:20,distance:10,seconds:3400,effort:'performance',recency:'recent',
  reportedRecency:'Within the last month',confirmedAt:'2026-11-06T18:00:00Z',...extra.runProfile},
  runningHistory:{recentMarathonDate:'2026-10-18',longRun:{km:6,minutes:38},...extra.runningHistory}};
 return coach.prepareNewProgramme(raw,{data:s,now:clock});
}
const assess=(c,w=1)=>running.assess(c,w,{now});
const dose=c=>[1,2].map(w=>assess(c,w).runs.map(r=>[r.role,r.distanceKm]));

test('time, logistics, an unknown shortening, an isolated fatigue report and one absent log retain a corroborated familiar repeat',()=>{
 for(const [reason,omit] of [[null,false],['time',false],['logistics',false],['fatigue',false],[null,true]]){
  const s=fixture(reason,omit),before=JSON.stringify(s),c=proposed(s);
  assert.equal(c.trainingContinuityVersion,1);
  assert.deepEqual(dose(c),Array.from({length:2},()=>[['easy-run',5],['easy-run',5]]));
  assert.ok(assess(c).warnings.some(note=>/shortened or time-limited/.test(note)));
  assert.equal(assess(c).qualityAllowed,false);
  assert.equal(JSON.stringify(s),before);
 }
});
test('two credible fatigue reports preserve a recovery review, and explicit pain or illness holds running',()=>{
 const s=fixture('fatigue');
 s.sessionFeedback.push({sessionId:'run-2026-11-03',date:'2026-11-03T10:00:00Z',week:1,difficulty:'harder',energy:'low'});
 const a=assess(proposed(s));
 assert.equal(a.actualKm,4);
 assert.ok(a.warnings.some(note=>/Repeated difficult recovery/.test(note)));
 for(const symptom of ['pain','illness']){
  const risky=fixture('time');
  risky.runs.at(-1).interruptionReason=symptom;
  assert.equal(assess(proposed(risky)).recoveryContext.runningTasks.easy.restriction,'hold');
  assert.deepEqual(assess(proposed(risky)).runs,[]);
  const reported=fixture(symptom);
  assert.equal(assess(proposed(reported)).recoveryContext.runningTasks.easy.restriction,'hold');
 }
});
test('old or ambiguously linked attendance cannot stand in for a missed familiar outing',()=>{
 const s=fixture(null,true);
 s.runs[0].date='2026-10-22T09:15:00Z';
 s.completedWorkouts[0].date='2026-10-22T10:00:00Z';
 assert.equal(assess(proposed(s)).actualKm,4);
 const duplicate=fixture(null,true);
 duplicate.completedWorkouts.push(structuredClone(duplicate.completedWorkouts[0]));
 assert.equal(assess(proposed(duplicate)).actualKm,4);
});
test('a recent reported performance can pace quality only after specific completed work and dated next-day recovery',()=>{
 const s=fixture('time');
 run(s,'2026-11-05',5.2,5.2,{role:'quality-run',effort:7});
 const observation={sport:'running',task:'quality',status:'normal',observedAt:'2026-11-06',
  nextDayResponse:'normal',referencePerformanceDate:'2026-11-05'};
 assert.equal(assess(proposed(s)).qualityAllowed,false);
 const quality=assess(proposed(s,{recoveryObservations:[observation]}));
 assert.equal(quality.baselineCurrent,false);
 assert.equal(quality.qualityAllowed,true);
 assert.ok(quality.runs.some(r=>r.steps.some(step=>step.role==='work')));
 const stale=assess(proposed(s,{recoveryObservations:[{...observation,observedAt:'2026-11-07'}]}));
 assert.equal(stale.qualityAllowed,false);
});
test('exact volume top-set evidence takes priority over same-day lighter back-offs in a new proposal',()=>{
 const inventory=fullInventory(),s=state(),identity=registry.identity('Bench',inventory);
 const id='prior-bench',date='2026-11-05T09:00:00Z';
 for(const [role,weight,rpe,target] of [['top',125,7.5,7.5],['backoff',115,7,7]]){
  s.sets.push({...identity,date,sessionId:id,exercise:'Bench',weight,reps:5,rpe,target,role,trainingRole:'volume'});
 }
 s.completedWorkouts.push({id,date,week:1,prescription:{ex:[['Bench',1,5,125,7.5,{...identity,role:'top',trainingRole:'volume'}],
  ['Bench',2,5,115,7,{...identity,role:'backoff',trainingRole:'volume'}]]}});
 const c=coach.prepareNewProgramme(config({event:'bench',strengthTargetDate:'2026-11-28',runningTargetDate:'',
  priority:'Bench',hybridFocus:'strength',runs:0,bench:2,trainingAge:'advanced',
  strengthExposureRoles:{Bench:['volume','heavy']},maxes:{bench:160},visitConstraints:{strengthVisits:2}}),{data:s,now});
 const schedule=coach.createEngine({data:s,now}).generatedSessions(c,1);
 const bench=schedule.flatMap(session=>session.ex).find(ex=>ex[0]==='Bench'&&ex[5].role==='top'&&ex[5].trainingRole==='volume');
 assert.ok(bench);
 assert.equal(bench[3],125);
 assert.equal(bench[5].runtimeLoadEvidence.role,'top');
 assert.match(bench[5].rationale,/125 kg × 5/);
});

test('a race-result date alone cannot clear post-marathon running recovery',()=>{
 const s=fixture('time');
 const clock=()=>Date.parse('2026-11-12T18:00:00Z');
 const input={runningHistory:{weeklyKm:[20,20,20]},startDate:'2026-11-16'};
 const onEitherSide=['2026-11-08','2026-11-09'].map(resultDate=>running.assess(
  proposed(s,{...input,runProfile:{resultDate}},clock),1,{now:clock}
 ));
 assert.deepEqual(onEitherSide[0].runs,onEitherSide[1].runs);
 assert.ok(onEitherSide.every(w=>w.actualKm===10&&!w.qualityAllowed&&!w.recoveryContext.runningContinuityEvidence));

 const returned=state();
 const week=[['2026-11-09','2026-11-10','easy',4,3],['2026-11-10','2026-11-11','quality',5,7],['2026-11-11','2026-11-12','long',7,4]];
 for(const [date,,task,km,effort] of week)run(returned,date,km,km,{role:task+'-run',effort});
 const recoveryObservations=week.map(([referencePerformanceDate,observedAt,task])=>({
  sport:'running',task,status:'normal',nextDayResponse:'normal',referencePerformanceDate,observedAt
 }));
 const supported=running.assess(proposed(returned,{...input,runs:3,
  runningHistory:{weeklyKm:[24,24,24],longRun:{km:7,minutes:45}},
  runProfile:{weeklyKm:24,resultDate:'2026-11-09'},recoveryObservations
 },clock),1,{now:clock});
 assert.ok(Object.values(supported.recoveryContext.runningTasks).every(task=>task.canProgress));
 assert.equal(supported.actualKm,16,'Corroborated task recovery supports the observed week, not the old 24 km dose');
 assert.equal(supported.qualityAllowed,true);
});

test('partial running evidence ages gradually and a confirmed break has a separate timed return',()=>{
 const s=fixture('time');
 const assessOn=date=>{
  const clock=()=>Date.parse(date+'T18:00:00Z');
  return running.assess(proposed(s,{startDate:'2026-12-07',runningTargetDate:'2026-12-27'},clock),1,{now:clock});
 };
 const recent=assessOn('2026-12-01'),older=assessOn('2026-12-02');
 assert.ok(older.actualKm<recent.actualKm&&older.actualKm>recent.actualKm-1);
 assert.equal(older.qualityAllowed,false);
 const clock=()=>Date.parse('2026-11-23T18:00:00Z');
 const extra={startDate:'2026-11-24',runningTargetDate:'2026-12-13',runningHistory:{lastRunBeforeBreak:'2026-11-07'}};
 const confirmed=proposed(s,extra,clock);
 const assessment=running.assess(confirmed,1,{now:clock});
 assert.deepEqual(assessment.runs.map(r=>[r.role,r.minutes,r.distanceKnown]),[['easy-run',15,false]]);
 assert.equal(assessment.reviewRequired,true);
 assert.equal(assessment.qualityAllowed,false);
 assert.throws(()=>proposed(s,{...extra,runningHistory:{lastRunBeforeBreak:'2026-11-03'}},clock),/A later run is recorded/);
 const withPain=fixture('pain');
 assert.deepEqual(running.assess(proposed(withPain,extra,clock),1,{now:clock}).runs,[]);
});

test('easy-only performance plans require explicit deferral and install without a race workout',async()=>{
 const s={...fixture('time'),onboardingComplete:true,activeCustomWeek:1,activeSchedule:[],
  customRoadmap:{programmeId:'synthetic-original',startDate:'2026-11-09',weeks:1}};
 const before=structuredClone(s),date='2026-11-29';
 const c=proposed(s,{runningGoalSeconds:3200});
 const build=config=>JSON.parse(JSON.stringify(adapters.buildProgramme(config,{data:s,now})));
 const pending=build(c);
 assert.equal(pending.racePreparationReview?.accepted,false);
 await assert.rejects(replacement.createPackage(pending,s),/explicitly choose provisional training/);
 assert.throws(()=>coach.approveProgrammeConfig(pending.config,'2026-11-09T09:00:00Z'),/explicitly choose provisional training/);
 const fallback=build({...c,provisionalRaceDate:date});
 assert.deepEqual(fallback.racePreparationReview,{date,accepted:true});
 assert.equal(assess(fallback.config,3).taper,false);
 assert.equal(assess(fallback.config,3).qualityAllowed,false);
 assert.equal(assess(fallback.config,3).actualKm,assess(fallback.config,2).actualKm);
 const placeholder=fallback.weeks.flatMap(w=>w.sessions).find(session=>session.eventDate===date);
 assert.equal(placeholder.raceDecisionDeferred,true);
 assert.deepEqual(placeholder.runs,[]);
 assert.deepEqual(placeholder.ex,[]);
 const pack=await replacement.createPackage(fallback,s,{reviewedCommit:'synthetic-audit'});
 await replacement.verifyPackage(pack,pack.reviewFingerprint,s);
 const preview=replacement.createReplacement(s,pack,coach,{now:'2026-11-09T09:00:00Z'});
 const installed=preview.next.reviewedProgramme.weeks.flatMap(w=>w.sessions).find(session=>session.eventDate===date);
 assert.equal(installed.raceDecisionDeferred,true);
 assert.deepEqual(installed.runs,[]);
 assert.equal(replacement.verifyPreservation(s,preview.next),true);
 assert.deepEqual(s,before);
 const approved=coach.approveProgrammeConfig(fallback.config,'2026-11-09T09:00:00Z');
 assert.equal(approved.provisionalRaceDate,date);
});

test('verified normal running weeks after a historical marathon preserve the established easy dose',()=>{
 const s=state();
 for(const date of ['2026-10-20','2026-10-22','2026-10-25','2026-10-27','2026-10-29','2026-11-01','2026-11-03','2026-11-05','2026-11-08']){
  s.runs.push({date:date+'T09:00:00Z',type:'Garmin run import',sourceActivityId:'run-'+date,km:10,min:65,rpe:3});
 }
 const clock=()=>Date.parse('2026-11-09T18:00:00Z');
 const extra={startDate:'2026-11-10',runs:3,
  runningHistory:{recentMarathonDate:'2026-02-22',weeklyKm:[30,30,30],longRun:{km:10,minutes:65}},
  runProfile:{weeklyKm:30,resultDate:'2026-11-01'}};
 const result=running.assess(proposed(s,extra,clock),1,{now:clock});
 assert.equal(result.actualKm,30);
 assert.equal(result.qualityAllowed,false);
 assert.equal(result.runs.every(r=>r.role==='easy-run'),true);
 const sparse=running.assess(proposed({...s,runs:s.runs.slice(-3)},extra,clock),1,{now:clock});
 assert.ok(sparse.actualKm<30);
});

test('deferred endurance dates do not suppress later training through frozen recovery evidence',()=>{
 const date='2026-11-29',s=state();
 for(const runGoal of ['half','marathon']){
  const c=proposed(s,{runGoal,runs:3,weeks:6,runningTargetDate:date,
   runningHistory:{recentMarathonDate:null},runProfile:{resultDate:'2026-11-01'}});
  assert.ok(c.coachingEvidence.recovery.events.some(e=>e.date===date));
  const result=assess({...c,provisionalRaceDate:date},4);
  assert.equal(result.recoveryContext.runningTasks.easy.eventDate,null);
  assert.equal(result.runs.length,3);
  assert.ok(result.actualKm>0);
  assert.equal(result.qualityAllowed,false);
 }
 const clock=()=>Date.parse(date+'T18:00:00Z');
 const sameDayMarathon=proposed(s,{runGoal:'marathon',runs:3,weeks:6,runningTargetDate:date,
  runningHistory:{recentMarathonDate:date}},clock);
 const realRecovery=running.assess({...sameDayMarathon,provisionalRaceDate:date},4,{now:clock});
 assert.equal(realRecovery.recoveryContext.runningTasks.easy.eventDate,date);
 assert.equal(realRecovery.recoveryContext.runningTasks.easy.restriction,'hold');
 assert.deepEqual(realRecovery.runs,[]);
});

test('a provisional marker can share the only available day, without approving missing or duplicate race entries',async()=>{
 const date='2026-11-15',s=state();
 s.runs.push({date:'2026-11-03T09:00:00Z',type:'Garmin run import',km:null,min:0});
 const c=proposed(s,{runningTargetDate:date,weeks:1,days:1,availableDays:['Sun'],runs:1,
  runningHistory:{recentMarathonDate:null,lastRunBeforeBreak:'2026-10-24'},
  runProfile:{weeklyKm:0,seconds:null},visitConstraints:{strengthVisits:0,eventDays:{[date]:{confirmed:true}}}});
 assert.ok(c.runningDoseEvidence.confirmedBreak);
 const draft=JSON.parse(JSON.stringify(adapters.buildProgramme({...c,provisionalRaceDate:date},{data:s,now})));
 assert.deepEqual(draft.racePreparationReview,{date,accepted:true});
 assert.deepEqual(draft.weeks[0].sessions.flatMap(s=>s.runs).map(r=>r.minutes),[15]);
 const source={...s,customRoadmap:{programmeId:'synthetic-audit'}};
 await replacement.createPackage(draft,source);
 for(const mutate of [
  sessions=>sessions.filter(s=>!s.eventDate),
  sessions=>[...sessions,{...sessions.find(s=>s.eventDate),id:'duplicate-race'}]
 ]){
  const altered=structuredClone(draft);
  altered.weeks[0].sessions=mutate(altered.weeks[0].sessions);
  await assert.rejects(replacement.createPackage(altered,source),/explicitly choose provisional training/);
 }
 const noBreak=structuredClone(c);
 delete noBreak.runningDoseEvidence.confirmedBreak;
 const provisional=adapters.buildProgramme({...noBreak,provisionalRaceDate:date},{data:s,now});
 assert.equal(provisional.weeks[0].feasible,true);
 assert.deepEqual(provisional.weeks[0].sessions.flatMap(s=>s.runs).map(r=>r.minutes),[15]);
});

test('an old endurance event or a single coarse intake answer does not impose an indefinite lifting restriction',()=>{
 const evidence=require('../src/coaching-evidence');
 const date='2026-11-09',clock=()=>Date.parse(date+'T18:00:00Z');
 const raw=config({planFirstVersion:1,bench:1,squat:1,deadlift:1,trainingAge:'intermediate',
  runningHistory:{recentMarathonDate:'2026-10-18'},recoveryContext:{status:'lower',reportedAt:date},
  recoveryEvidence:{status:'fatigue',source:'athlete-intake',affectedLifts:['Squat','Deadlift'],observedAt:date}});
 const review=(input,records=state())=>evidence.recovery(coach.prepareNewProgramme(input,{data:records,now:clock}),
  {now:clock,atDate:date,sport:'strength',task:'heavy',lift:'Squat'});
 assert.equal(review({...raw,planFirstVersion:undefined}).restriction,'bounded');
 assert.equal(review(raw).restriction,'none');
 const records=state();
 records.sets.push({date:'2026-11-08T10:00:00Z',exercise:'Squat',role:'top',trainingRole:'heavy',weight:130,reps:3,rpe:7});
 const observations=[{sport:'strength',lift:'Squat',task:'heavy',status:'normal',observedAt:date,
  referencePerformanceDate:'2026-11-08',nextDayResponse:'normal'}];
 assert.equal(review({...raw,recoveryObservations:observations},records).familiarTaskSupported,undefined,
  'A documented good session after an old event must not reintroduce a recovery cap');
 assert.equal(review({...raw,recoveryObservations:[{sport:'strength',lift:'Squat',task:'lifting',status:'pain',observedAt:date}]}).restriction,'hold');
 assert.equal(review({...raw,runningHistory:{recentMarathonDate:'2026-11-08'}}).restriction,'hold');
 assert.equal(review({...raw,runningHistory:{recentMarathonDate:'2026-10-29'}}).restriction,'bounded');
 assert.equal(review({...raw,recoveryEvidence:{...raw.recoveryEvidence,source:'athlete-recovery-review'}}).restriction,'bounded');
});

test('a linked legacy top set supports starting rep work through its unique archived prescription',()=>{
 const day='2026-11-05',date=day+'T09:00:00Z',id='old-custom-thu';
 const s=state(),raw=config({event:'bench',priority:'Bench',runningTargetDate:'',strengthTargetDate:'2026-11-28',
  bench:1,runs:0,availableDays:['Thu'],equipmentInventory:undefined,initialBuildVersion:1,
  competitionIntakeVersion:1,visitConstraints:{strengthVisits:1,eventDays:{'2026-11-28':{confirmed:true}}}});
 s.sets.push({date,sessionId:id,week:1,exercise:'Bench',role:'top',weight:125,reps:5,rpe:8,target:8});
 s.completedWorkouts.push({id,date,week:1,completedSets:1});
 const archived={programme:{approvedAt:'2026-11-02T06:00:00Z',sessionNamespace:'old-'},weeks:[{week:1,
  sessions:[{id,scheduledDate:day,ex:[['Bench',1,5,122.5,8,{role:'top',trainingRole:'volume'}]]}]}]};
 s.programmeArchive=[archived];
 const before=structuredClone(s);
 const p=adapters.buildNewProgramme(raw,{data:s,now});
 const bench=p.weeks[0].sessions.flatMap(session=>session.ex).find(ex=>ex[0]==='Bench'&&ex[5]?.role==='top');
 assert.ok(bench?.[3]>0);
 assert.equal(p.config.strengthCalibration.lifts.Bench.trainingLevel,'working-practice');
 assert.equal(p.config.strengthCalibration.lifts.Bench.singlesSupported,false);
 assert.ok(p.weeks.every(w=>w.feasible));
 assert.ok(p.weeks.flatMap(w=>w.sessions).flatMap(s=>s.ex).every(ex=>ex[2]!==1));
 assert.deepEqual(s,before);
 for(const programmeArchive of [[],[archived,structuredClone(archived)]]){
  const bad=adapters.buildNewProgramme(raw,{data:{...s,programmeArchive},now});
  assert.equal(bad.config.strengthCalibration?.lifts?.Bench,undefined);
  assert.ok(bad.weeks[0].blockingIssues.some(issue=>/Clarify experience/.test(issue)));
 }
});

test('a shortened easy outing can support repeating its actual distance without restoring race work',()=>{
 const s=state();
 run(s,'2026-11-01',6.5,9);
 const extra={initialBuildVersion:1,runningGoalSeconds:3200};
 const proposedConfig=proposed(s,extra);
 const a=assess(proposedConfig);
 assert.equal(a.actualKm,6.5);
 assert.equal(a.qualityAllowed,false);
 const unqualified=fixture('pain');
 assert.deepEqual(assess(proposed(unqualified,extra)).runs,[]);
 assert.equal(assess(proposed(s)).actualKm,4);
});

test('a two-day marathon can keep its date as a provisional marker and approve the available training',async()=>{
 const date='2027-02-21',s=state(),clock=()=>Date.parse('2026-11-08T18:00:00Z');
 const c=coach.prepareNewProgramme({...config({initialBuildVersion:1,runGoal:'marathon',runningTargetDate:date,
  weeks:15,runs:2,availableDays:['Tue','Sat'],days:2,visitConstraints:{strengthVisits:0,eventDays:{[date]:{confirmed:true}}}}),
  runProfile:{weeklyKm:30,distance:42.195,seconds:18817,resultDate:'2026-10-18',effort:'performance'},
  runningHistory:{recentMarathonDate:'2026-10-18',longRun:{km:28}}
 },{data:s,now:clock});
 const build=config=>JSON.parse(JSON.stringify(adapters.buildProgramme(config,{data:s,now:clock})));
 assert.equal(build(c).racePreparationReview.accepted,false);
 const draft=build({...c,provisionalRaceDate:date});
 assert.ok(draft.weeks.every(w=>w.feasible));
 assert.deepEqual(draft.racePreparationReview,{date,accepted:true});
 assert.equal(draft.weeks.flatMap(w=>w.sessions).flatMap(s=>s.runs).some(r=>r.role==='race'),false);
 await replacement.createPackage(draft,{...s,customRoadmap:{programmeId:'synthetic-baseline'}});
});
