// Module-level scenarios against generated programmes and synthetic native records.
// These DO NOT prove integrated app behavior or validate the experimental policy.
const {test}=require('node:test'),assert=require('node:assert/strict');
const catalogue=require('../src/programme-catalogue'),training=require('../src/catalogue-training'),native=require('../src/native-catalogue');
const registry=require('../src/exercise-registry'),gym=require('../src/gym-equipment'),assessment=require('../src/fatigue-assessment'),overlay=require('../src/fatigue-overlay'),guard=require('../src/catalogue-protection');
const policy={minDeclineFraction:.1,recentDays:14},now='2026-12-10';
function generated(id){const state=training.enrol(training.empty(),catalogue.previewProgramme(id),'2026-11-09','p-'+id);const p=native.buildProgramme(state.plans,null,{training,registry,gym,inventory:{items:{}},now:'2026-11-09T09:00:00Z',equipment:[],protectedWeek:()=>false});return {state,p};}
function history(discipline){
 const {state,p}=generated(discipline==='strength'?'powerlifting-four-day':'10k-two-run');
 const session=p.weeks[0].sessions.find(s=>discipline==='strength'?s.ex.length:s.runs.some(r=>r.steps.length===1));assert.ok(session);
 const logs={completedWorkouts:[],sets:[],runs:[],fatigueEvidence:[]};
 for(const [i,date] of ['2026-11-09','2026-11-16','2026-11-23','2026-11-30','2026-12-07'].entries()){
  const id=discipline+'-'+i,stamp=date+'T10:00:00.000Z';
  if(discipline==='strength'){
   const total=session.ex.reduce((n,x)=>n+x[1],0);logs.completedWorkouts.push({id,date:stamp,plannedSets:total,completedSets:total,prescription:{ex:structuredClone(session.ex),runs:[]}});
   session.ex.forEach((e,k)=>{for(let j=1;j<=e[1];j++)logs.sets.push({sessionId:id,date:stamp,exerciseId:e[5].exerciseId,set:j,reps:e[2],weight:k===0?(i<3?100:80):50,rpe:7})});
  }else{logs.completedWorkouts.push({id,date:stamp,completedRun:true,prescription:{ex:[],runs:structuredClone(session.runs)}});logs.runs.push({sessionId:id,date:stamp,km:session.runs[0].distanceKm,min:i<3?45:60});}
  logs.fatigueEvidence.push({sessionId:id,discipline,recordedAt:stamp,painOrDiscomfort:'no',illness:'no',unusualFatigue:i>=3?'yes':'no',...(discipline==='running'?{comparableConditions:'yes',reliableMeasurement:'yes',runEffort:4}:{})});
 }
 return {state,logs};
}
const assess=(logs,discipline)=>assessment.assess({state:logs,discipline,now,policy});
function noDecline(logs){for(const x of logs.sets.filter(x=>x.exerciseId===logs.sets[0].exerciseId))x.weight=100;for(const x of logs.runs)x.min=45;}
test('1 normal tiredness without regression remains neutral',()=>{const {logs}=history('strength');noDecline(logs);assert.equal(assess(logs,'strength').candidate,null)});
test('2 one difficult workout remains neutral',()=>{const {logs}=history('strength');for(const x of logs.sets.filter(x=>x.sessionId==='strength-3'&&x.exerciseId===logs.sets[0].exerciseId))x.weight=100;assert.equal(assess(logs,'strength').candidate,null)});
test('3 missed workouts due to work or family remain neutral',()=>{const {logs}=history('strength');noDecline(logs);logs.fatigueEvidence.push({sessionId:'missed',discipline:'strength',recordedAt:'2026-12-09T10:00:00Z',interruptionReason:'time'});assert.equal(assess(logs,'strength').candidate,null)});
test('4 incomplete sets without a cause do not establish regression',()=>{const {logs}=history('strength');logs.completedWorkouts.at(-1).completedSets--;assert.equal(assess(logs,'strength').candidate,null)});
test('5 confirmed fatigue for incomplete work is supporting evidence only',()=>{const {logs}=history('strength');logs.completedWorkouts.at(-1).completedSets--;logs.fatigueEvidence.at(-1).interruptionReason='fatigue';assert.equal(assess(logs,'strength').candidate,null)});
test('6 repeated comparable completed strength regression offers a review only',()=>{const {logs}=history('strength'),before=structuredClone(logs);assert.equal(assess(logs,'strength').status,'review');assert.deepEqual(logs,before)});
test('7 repeated comparable completed running regression requires reliable conditions',()=>{const {logs}=history('running');assert.equal(assess(logs,'running').status,'review');logs.fatigueEvidence.at(-1).reliableMeasurement='unknown';assert.equal(assess(logs,'running').candidate,null)});
test('8 hybrid evidence remains discipline scoped',()=>{const l=history('strength').logs,r=history('running').logs;noDecline(r);const logs={completedWorkouts:[...l.completedWorkouts,...r.completedWorkouts],sets:l.sets,runs:r.runs,fatigueEvidence:[...l.fatigueEvidence,...r.fatigueEvidence]};assert.equal(assess(logs,'strength').status,'review');assert.equal(assess(logs,'running').candidate,null)});
test('9 persistent fatigue at end of intervention requests another decision and never extends it',()=>{const record={approved:true,start:'2026-12-10',end:'2026-12-16'};assert.deepEqual(overlay.recovery({overlay:record,answer:'persistent',now:'2026-12-15'}),{status:'persistent',requiresDecision:true,autoExtend:false})});
test('10 expired overlay view returns original prescriptions without changing the plan',()=>{const {state}=generated('lifting-foundation'),before=structuredClone(state);const record={schema:1,kind:'fatigue-overlay',discipline:'strength',approved:true,start:'2026-11-09',end:'2026-11-15',changes:[]};for(const item of overlay.view({state,assessmentState:{},overlay:record,enabled:true,now:'2026-11-16'}).sessions)assert.deepEqual(item.adjusted,item.original);assert.deepEqual(state,before)});
test('11 generated competition and race sessions are protected with unknown taper',()=>{for(const id of ['general-strength','powerlifting-three-day','powerlifting-four-day','bench-specialisation','deadlift-specialisation','10k-two-run','10k-three-run','half-marathon','marathon-distance','marathon-timed']){const {state}=generated(id),p=state.plans[0],event=training.calendar(state).find(x=>x.session.kind==='event'||x.session.id==='race'||/benchmark/i.test(x.session.title||''));assert.ok(event,id);const info=guard.inspect(state.plans,{catalogueOccurrenceId:p.id+'-w'+event.week+'-'+event.sessionId});assert.equal(info.protected,true,id)}});
test('12a offline-safe JSON round-trip preserves generated snapshots and completion logs',()=>{const {state}=generated('marathon-timed'),{logs}=history('running');const packet={state,logs},restored=JSON.parse(JSON.stringify(packet));assert.deepEqual(restored,packet)});
test('unreliable, contradictory, missing or safety evidence fails closed',()=>{for(const change of [s=>{s.fatigueEvidence=[]},s=>{s.fatigueEvidence.at(-1).comparableConditions='no'},s=>{s.fatigueEvidence.at(-1).illness='yes'},s=>{s.fatigueEvidence.push({...s.fatigueEvidence.at(-1)})}]){const {logs}=history('running');change(logs);assert.equal(assess(logs,'running').candidate,null)}});
test('BLOCKED: full native approval, durable overlay storage failure/retry, offline operation and recovery UI', {skip:'No native overlay approval or persistence integration exists'},()=>{});
test('BLOCKED: full integration for all 12 scenarios, both units, true event/taper and Garmin workflows', {skip:'The isolated prototypes are not connected to live catalogue screens or Garmin'},()=>{});
