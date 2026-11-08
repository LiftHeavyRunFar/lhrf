const test=require('node:test'),assert=require('node:assert/strict');
const preparation=require('../src/running-preparation.js'),evidence=require('../src/coaching-evidence.js');
const now=Date.parse('2026-11-07T12:00:00Z');
const base={coachingRulesVersion:2,coachingRuntimeVersion:1,coachingRefinementVersion:1,runningEvidenceVersion:1,startDate:'2026-11-09',weeks:8,runs:3,hybridFocus:'balanced',runGoal:'fitness',runProfile:{distance:10,seconds:2700,weeklyKm:30,recency:'recent',effort:'performance',resultDate:'2026-10-25'},runningHistory:{weeklyKm:[28,29,30],longRun:{km:12,minutes:80,recoveryHours:24}}};
function config(extra={},data={}){const c={...structuredClone(base),...extra};c.runningDoseEvidence=preparation.prepareEvidence(c,{data,now});c.coachingEvidence=evidence.capture(c,{data,now});return c}
test('established fitness running retains its declared familiar base instead of an unrelated six-km-per-run ceiling',()=>{
 const c=config(),before=JSON.stringify(c),week=preparation.assess(c,1,{now});
 assert.equal(week.requestedKm,29,'Retain the existing median-of-recent-declared-weeks baseline, without treating the latest increase as proven capacity.');assert.equal(week.allocatedKm,29);assert.ok(week.runs.every(r=>r.role==='easy-run'&&!r.steps.some(s=>s.role==='work')));assert.equal(JSON.stringify(c),before);
 const legacy={...c};delete legacy.coachingRuntimeVersion;assert.equal(preparation.assess(legacy,1,{now}).requestedKm,18);
 for(const week of [3,7,11])assert.equal(preparation.assess(c,week,{now}).requestedKm,29,'A health-only goal cannot silently add endurance-development kilometres after removing the old cap.');
});
test('new 20-week hybrid health build with a pace and no mileage uses progressing time, with no invented kilometres',()=>{
 const c=config({weeks:20,runs:2,onboardingAerobicBuildVersion:1,strengthTargetDate:'2027-03-27',runProfile:{...base.runProfile,weeklyKm:0},runningHistory:{}});
 const assess=(week,changes={})=>preparation.assess({...c,...changes},week,{now});
 const legacy=assess(19,{onboardingAerobicBuildVersion:undefined});
 assert.deepEqual(legacy.runs.map(r=>r.distanceKm),[2,2]);
 assert.deepEqual(assess(1).runs.map(r=>r.minutes),[15,15]);
 assert.ok(assess(19).runs.every(r=>r.distanceKnown===false&&r.minutes>20&&r.workMinutes===0));
 assert.ok(assess(20).runs.every(r=>r.minutes===15&&!r.conditionalAerobicBuild));
 const known={...c.runProfile,weeklyKm:4};
 assert.ok(assess(19,{runProfile:known}).runs.every(r=>r.distanceKm>2&&r.workMinutes===0));
});
test('a longer timed run needs two actual easy completions with good feedback and readiness',()=>{
 const c=config({weeks:20,runs:2,onboardingAerobicBuildVersion:1,runProfile:{},runningHistory:{}});
 const run=preparation.assess(c,19,{now}).runs[0],starting=preparation.assess(c,1,{now}).runs[0];
 const data={completedWorkouts:[],runs:[],sessionFeedback:[]};
 const resolve=(ready=true)=>preparation.resolveAerobicBuild(run,data,{now,ready});
 assert.equal(resolve().minutes,15);
 for(const [i,day] of ['2026-11-02','2026-11-05'].entries()){
  const id='easy-'+i,date=day+'T08:00:00Z';
  data.completedWorkouts.push({id,date,week:1,completedRun:true,prescription:{runs:[starting]}});
  data.runs.push({sessionId:id,date,min:25});
  data.sessionFeedback.push({sessionId:id,date:day+'T08:01:00Z',week:1,difficulty:'expected',energy:'good',discomfort:'no'});
 }
 const before=JSON.stringify(data),earned=resolve();
 assert.equal(earned.minutes,17);
 assert.equal(earned.steps[0].minutes,17);
 assert.equal(earned.distanceKnown,false);
 assert.equal(resolve(false).minutes,15);
 assert.equal(JSON.stringify(data),before);
 data.sessionFeedback[1].discomfort='yes';
 assert.equal(resolve().minutes,15);
});
test('running observations reject invalid completion and linked conflicts without counting duplicates as progression',()=>{
 const runs=[{date:'2026-11-01',km:8,min:50,sourceActivityId:'same'},{date:'2026-11-01T10:00:00Z',km:8,min:50,rpe:3,sourceActivityId:'same'},{date:'2026-11-03',km:5,min:30,rpe:3,sourceActivityId:'conflict'},{date:'2026-11-03',km:9,min:30,rpe:3,sourceActivityId:'conflict'},{date:'2026-11-10',km:10,min:60},{date:'2026-02-30',km:10,min:60},{date:'2026-11-04',km:10,min:60,failed:true},{date:'2026-11-05',km:6,min:36,rpe:3,rpeReliable:false}];
 const original=JSON.stringify(runs),result=preparation.prepareEvidence(base,{now,data:{runs}});
 assert.equal(result.validActivityCount,2);assert.equal(result.latestCompletedCalendarWeek.observedKm,8);assert.equal(result.currentCalendarWeek.observedKm,6);assert.equal(result.currentCalendarWeek.activities[0].effortReliable,false);assert.ok(result.rejected.some(x=>x.reason==='conflicting-linked-activity'));assert.equal(JSON.stringify(runs),original);
});
test('completed calendar-week evidence includes Monday date-only and morning activities',()=>{
 const result=preparation.prepareEvidence(base,{now:Date.parse('2026-11-23T12:00:00Z'),data:{runs:[{date:'2026-11-16',km:9,min:55,rpe:3,type:'easy-run'},{date:'2026-11-18T07:00:00Z',km:9,min:50,rpe:7,type:'quality-run'},{date:'2026-11-20',km:10,min:65,rpe:3,type:'long-run'}]}});
 assert.equal(result.latestCompletedCalendarWeek.observedKm,28);assert.equal(result.latestCompletedCalendarWeek.activities.length,3);assert.equal(result.currentCalendarWeek.observedKm,0);
});
test('unresolved marathon return does not gain five percent per future week without actual new evidence',()=>{
 const c=config({runGoal:'10k',runningHistory:{recentMarathonDate:'2026-10-25'},runningReturnObservation:{reportedHabitualKm:30,observedWeekKm:8,initialWeeklyCeilingKm:9.6},recoveryContext:{status:'lower',reportedAt:'2026-11-06'},recoveryObservations:[{observedAt:'2026-11-06',sport:'running',task:'all',status:'fatigue'}]});
 for(const week of [1,3,6,8]){const run=preparation.assess(c,week,{now});assert.ok(run.requestedKm<=9.6);assert.ok(run.runs.every(r=>r.role==='easy-run'));assert.equal(run.recoveryContext.runningTasks.easy.canProgress,false);}
});
test('one tolerated easy run establishes task tolerance without restoring the pre-marathon running week',()=>{
 const data={runs:[{date:'2026-11-05',km:4,min:30,rpe:3,type:'easy-run',sourceActivityId:'single-return'}]},c=config({runGoal:'10k',runningHistory:{recentMarathonDate:'2026-11-01'},recoveryObservations:[{observedAt:'2026-11-06',sport:'running',task:'easy',status:'normal',nextDayResponse:'normal'}]},data);
 for(const week of [1,3,6]){const prescription=preparation.assess(c,week,{now});assert.equal(prescription.recoveryContext.runningTasks.easy.status,'normal');assert.ok(prescription.requestedKm<base.runProfile.weeklyKm);assert.ok(prescription.requestedKm<=12);assert.ok(prescription.runs.every(r=>r.role==='easy-run'));assert.ok(prescription.warnings.some(x=>x.startsWith('Running dose review:')));}
});
test('zero requested running does not require a completed running week or block unrelated training for a running-only concern',()=>{
 const c=config({runs:0,runGoal:'fitness',runningHistory:{recentMarathonDate:'2026-11-01'},recoveryObservations:[{observedAt:'2026-11-06',sport:'running',task:'all',status:'worsening'}]}),assessment=preparation.assess(c,1,{now});
 assert.deepEqual(assessment.runs,[]);assert.equal(assessment.requestedKm,0);assert.equal(assessment.feasible,true);assert.deepEqual(assessment.blocking,[]);
});
test('future performance cannot prescribe even easy pace while current recovery does not erase a justified taper',()=>{
 const invalid=config({runGoal:'10k',runningTargetDate:'2026-11-29',runProfile:{...base.runProfile,resultDate:'2026-11-12'}}),week=preparation.assess(invalid,1,{now});
 assert.equal(week.feasible,false);assert.ok(week.runs.every(r=>r.pace==='Conversational easy effort; confirm a recent race baseline'&&r.minutes===null));
 const race=config({runGoal:'10k',runningTargetDate:'2026-11-29'}),build=preparation.assess(race,2,{now}),taper=preparation.assess(race,3,{now});
 assert.ok(taper.requestedKm<build.requestedKm);assert.ok(taper.runs.every(r=>r.distanceKm===r.steps.reduce((n,s)=>n+s.distanceKm,0)||Math.abs(r.distanceKm-r.steps.reduce((n,s)=>n+s.distanceKm,0))<.001));
});
