const test=require('node:test'),assert=require('node:assert/strict');
const {reviewWeek}=require('../src/weekly-review-v2.js');
const {reviewSession}=require('../src/performance-v2.js');
const {proposeStrengthAdjustment}=require('../src/strength-feedback-v2.js');
const {reviewStrengthTrend}=require('../src/strength-trends-v2.js');
const {structureRuns}=require('../src/run-sessions-v2.js');
const {buildDatedProgramme}=require('../src/dated-programme-v2.js');
const {buildProgramme}=require('../src/programme-v2.js');
const {scheduleWeek}=require('../src/scheduler-v2.js');
const prescription={lift:'bench',top:{rpe:8,suggestedWeight:100}};
const logs=Array.from({length:3},()=>({lift:'bench',targetRPE:8,actualRPE:6,completed:true}));
const runs=Array.from({length:3},()=>({actualRPE:5,targetRPE:7,completed:true}));
const progresses=p=>p.kind==='review-progression'||p.kind==='review-running-progression'||p.direction==='increase';
test('explicitly incomplete or altered-rep work is not an easy completed top set',()=>{
 assert.equal(reviewSession(prescription,{actualRpe:6}).status,'insufficient-data');
 assert.equal(proposeStrengthAdjustment(prescription,{actualRPE:6,actualWeight:100,completed:false}).proposal,null);
 assert.equal(proposeStrengthAdjustment(prescription,{actualRPE:6,actualWeight:100,actualReps:1,targetReps:5}).proposal,null);
 assert.equal(reviewStrengthTrend(logs.map(x=>({...x,completed:false})),'bench').signal,'insufficient-data');
 assert.equal(proposeStrengthAdjustment({...prescription,top:{rpe:8,suggestedWeight:1}},{actualRPE:9,actualWeight:1}).proposal,null,'Rounding must not turn a reduction into an increase');
});
test('recovery, event phases and reported pain suppress positive trend proposals',()=>{
 const input={strengthLogs:logs,runLogs:runs,lastStrengthSession:{prescription,feedback:{actualRPE:6,actualWeight:100,completed:true}}};
 assert.ok(reviewWeek(input).proposals.some(progresses),'Healthy control must be able to progress');
 for(const phase of ['recovery','realisation','assessment','event'])assert.ok(!reviewWeek({...input,phase}).proposals.some(progresses),phase);
 for(const readiness of [{pain:true},{unusualDiscomfort:true},{fatigue:5}])assert.ok(!reviewWeek({...input,readiness}).proposals.some(progresses));
 assert.ok(!reviewWeek({...input,lastStrengthSession:{prescription,feedback:{actualRPE:6,actualWeight:100,completed:false}}}).proposals.some(p=>p.lift==='bench'&&progresses(p)));
 assert.doesNotThrow(()=>reviewWeek({runLogs:{invalid:true}}));
});
test('weekly running progression stays optional and respects hybrid recovery',()=>{
 const clear=reviewWeek({runLogs:runs});assert.ok(clear.proposals.some(p=>p.kind==='review-running-progression'));
 assert.deepEqual(clear.appliedChanges,[]);
 assert.ok(!reviewWeek({runLogs:runs,readiness:{legSoreness:5}}).proposals.some(p=>p.kind==='review-running-progression'));
 assert.equal(reviewWeek({strengthLogs:[],runLogs:[]}).proposals.length,0,'Missing sessions do not imply fatigue');
});
test('easy fallback type, effort and pace agree; dated plans retain run blocks',()=>{
 const {calibrate10K}=require('../src/running-paces-v2.js');
 for(const minutes of [20,24,25]){
  const run=structureRuns([{type:'quality',minutes}],{tenKTime:'55:00'})[0];
  if(run.workout.kind==='continuous-easy'){assert.equal(run.type,'easy');assert.deepEqual(run.pace,calibrate10K({tenKTime:'55:00'}).easy)}
  assert.equal(run.workout.totalMinutes,minutes);
 }
 const p=buildDatedProgramme({startDate:'2026-10-19',weeks:6,runs:3,bench:2,priority:'Bench',tenKTime:'55:00',runningTargetDate:'2026-11-29'});
 for(const week of p.weeks){assert.equal(week.deload,week.phase==='recovery');for(const run of week.runs){assert.ok(run.pace);assert.equal(run.workout.blocks.reduce((n,b)=>n+b.minutes,0),run.minutes)}}
 assert.equal(p.passesStructuralChecks,false,'Date-aware taper remains provisional');
});
test('restricted capacity is explicit and a conflicting schedule change never moves a fixed session',()=>{
 const config={weeks:8,bench:2,squat:1,deadlift:1,runs:3,availableDays:['Tue','Thu','Sat'],maxSessionsPerDay:2};
 const p=buildProgramme(config);assert.equal(p.checks.allSessionsScheduled,false);
 assert.ok(p.weeks[0].calendar.capacityConflicts.length>0);
 assert.equal(p.weeks[0].reviewRequired,true);
 assert.throws(()=>scheduleWeek({availableDays:['Thu'],fixedSessions:[{kind:'strength',lift:'bench',day:'Tue'}]},{week:2,strengths:[prescription],runs:[]}),/Fixed day unavailable/);
});
