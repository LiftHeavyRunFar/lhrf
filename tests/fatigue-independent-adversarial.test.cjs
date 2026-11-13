// Independent, synthetic native-log checks using a real generated prescription.
const {test}=require('node:test'),assert=require('node:assert/strict');
const catalogue=require('../src/programme-catalogue'),training=require('../src/catalogue-training');
const native=require('../src/native-catalogue'),registry=require('../src/exercise-registry'),gym=require('../src/gym-equipment');
const base={equipmentInventory:require('./equipment-fixtures.cjs').fullInventory()};
const assess=require('../src/fatigue-assessment').assess;
const policy={minDeclineFraction:.1,recentDays:14},now='2026-12-10';
function fixture(){
 const plans=training.enrol(training.empty(),catalogue.previewProgramme('powerlifting-four-day'),'2026-11-09','lift').plans;
 const programme=native.buildProgramme(plans,null,{training,registry,gym,inventory:base.equipmentInventory,now:'2026-11-09T09:00:00Z',equipment:[],protectedWeek:()=>false});
 const session=programme.weeks[0].sessions.find(s=>s.ex.length),planned=session.ex.reduce((sum,e)=>sum+e[1],0);
 const target=session.ex.find(e=>e[5]?.category==='primary');
 assert.ok(target&&planned>target[1]);
 const state={completedWorkouts:[],sets:[],runs:[],fatigueEvidence:[]};
 for(const [i,date] of ['2026-11-09','2026-11-16','2026-11-23','2026-11-30','2026-12-07'].entries()){
  const id='real-generated-'+i,stamp=date+'T10:00:00.000Z';
  state.completedWorkouts.push({id,date:stamp,completedSets:planned,plannedSets:planned,prescription:{ex:structuredClone(session.ex),runs:[]}});
  for(const e of session.ex)for(let j=1;j<=e[1];j++)state.sets.push({sessionId:id,date:stamp,exerciseId:e[5].exerciseId,set:j,reps:e[2],weight:e===target?(i<3?100:60):50,rpe:7});
  state.fatigueEvidence.push({sessionId:id,discipline:'strength',recordedAt:stamp,painOrDiscomfort:'no',illness:'no',unusualFatigue:i>=3?'yes':'no'});
 }
 return {state,planned,target};
}
const run=state=>assess({state,discipline:'strength',now,policy});
function runningFixture(){
 const plans=training.enrol(training.empty(),catalogue.previewProgramme('10k-two-run'),'2026-11-09','run').plans;
 const programme=native.buildProgramme(plans,null,{training,registry,gym,inventory:base.equipmentInventory,now:'2026-11-09T09:00:00Z',equipment:[],protectedWeek:()=>false});
 const session=programme.weeks[0].sessions.find(s=>s.runs.length&&s.runs[0].steps.length===1);assert.ok(session);
 const state={completedWorkouts:[],sets:[],runs:[],fatigueEvidence:[]};
 for(const [i,date] of ['2026-11-09','2026-11-16','2026-11-23','2026-11-30','2026-12-07'].entries()){
  const id='real-run-'+i,stamp=date+'T10:00:00.000Z';state.completedWorkouts.push({id,date:stamp,completedRun:true,prescription:{ex:[],runs:structuredClone(session.runs)}});
  state.runs.push({sessionId:id,date:stamp,km:session.runs[0].distanceKm,min:i<3?45:60});
  state.fatigueEvidence.push({sessionId:id,discipline:'running',recordedAt:stamp,painOrDiscomfort:'no',illness:'no',unusualFatigue:i>=3?'yes':'no',comparableConditions:'yes',reliableMeasurement:'yes',runEffort:4});
 }
 return {state};
}
const runDistance=state=>assess({state,discipline:'running',now,policy});
test('independent generated-strength fixture can establish an experimental review without changing native records',()=>{
 const {state}=fixture(),before=structuredClone(state);assert.equal(run(state).status,'review');assert.deepEqual(state,before);
});
test('inconsistent full-workout totals cannot turn skipped work into regression evidence',()=>{
 const {state,planned}=fixture();for(const w of state.completedWorkouts.slice(-2)){w.plannedSets=planned-1;w.completedSets=planned-1;}
 assert.notEqual(run(state).status,'review');
});
test('recent reported pain overrides an otherwise positive experimental review',()=>{
 const {state}=fixture();state.fatigueEvidence.at(-1).painOrDiscomfort='yes';assert.equal(run(state).status,'safety');
});
test('missing and conflicting safety or fatigue evidence cannot trigger review',()=>{
 for(const change of [s=>delete s.fatigueEvidence.at(-1).illness,s=>s.fatigueEvidence.slice(-2).forEach(e=>e.unusualFatigue='unknown'),s=>s.fatigueEvidence.push({...s.fatigueEvidence.at(-1)})]){
  const {state}=fixture();change(state);assert.notEqual(run(state).status,'review');
 }
});
test('contradictory native pain feedback blocks review despite newer structured answers',()=>{
 const {state}=fixture();state.sessionFeedback=[{sessionId:state.completedWorkouts.at(-1).id,date:'2026-12-07T11:00:00.000Z',discomfort:'yes'}];
 assert.notEqual(run(state).status,'review');
});
test('a malformed legacy prescription returns insufficient instead of throwing',()=>{
 const {state}=fixture();delete state.completedWorkouts.at(-1).prescription.ex.at(-1)[5];
 assert.doesNotThrow(()=>run(state));assert.notEqual(run(state).status,'review');
});
test('normal tiredness and one difficult lifting workout do not establish repeated regression',()=>{
 const {state}=fixture();for(const row of state.sets.filter(r=>r.sessionId==='real-generated-3'))row.weight=100;
 assert.notEqual(run(state).status,'review');
});
test('missed and unconfirmed partial sessions are neutral even when appended to an athlete record',()=>{
 const {state}=fixture();for(const row of state.sets.filter(r=>r.sessionId==='real-generated-3'))row.weight=100;
 state.fatigueEvidence.push({sessionId:'missed',discipline:'strength',recordedAt:'2026-12-08T10:00:00.000Z',interruptionReason:'time',unusualFatigue:'unknown',painOrDiscomfort:'no',illness:'no'});
 state.fatigueEvidence.push({sessionId:'partial',discipline:'strength',recordedAt:'2026-12-09T10:00:00.000Z',interruptionReason:'fatigue',unusualFatigue:'yes',painOrDiscomfort:'no',illness:'no'});
 assert.notEqual(run(state).status,'review');
});
test('repeated continuous running regression with explicit context yields review; normal variation does not',()=>{
 const {state}=runningFixture(),before=structuredClone(state);assert.equal(runDistance(state).status,'review');assert.deepEqual(state,before);
 for(const r of state.runs.slice(-2))r.min=46;assert.notEqual(runDistance(state).status,'review');
});
test('a slow run without reliable and comparable conditions cannot establish a trend',()=>{
 for(const patch of [{comparableConditions:'unknown'},{reliableMeasurement:'no'},{runEffort:null}]){
  const {state}=runningFixture();Object.assign(state.fatigueEvidence.at(-1),patch);assert.notEqual(runDistance(state).status,'review');
 }
});
test('shortened running sessions cannot become regression even when fatigue is confirmed',()=>{
 const {state}=runningFixture();state.runs.at(-1).km=3;state.fatigueEvidence.at(-1).interruptionReason='fatigue';assert.notEqual(runDistance(state).status,'review');
});
test('strength regression remains discipline-specific in a mixed generated training history',()=>{
 const lift=fixture().state,running=runningFixture().state;for(const item of running.runs)item.min=45;
 const state={completedWorkouts:[...lift.completedWorkouts,...running.completedWorkouts],sets:lift.sets,runs:running.runs,fatigueEvidence:[...lift.fatigueEvidence,...running.fatigueEvidence]},before=structuredClone(state);
 assert.equal(run(state).status,'review');assert.notEqual(runDistance(state).status,'review');assert.deepEqual(state,before);
});
test('changed generated prescription invalidates comparisons even when hard recent work is reported',()=>{
 const {state}=fixture();state.completedWorkouts.at(-1).prescription.ex[0][4]=9;
 assert.notEqual(run(state).status,'review');
});
