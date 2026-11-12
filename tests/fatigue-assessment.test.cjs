const {test}=require('node:test');const a=require('node:assert/strict');
const catalogue=require('../src/programme-catalogue'),training=require('../src/catalogue-training'),native=require('../src/native-catalogue'),registry=require('../src/exercise-registry'),gym=require('../src/gym-equipment'),{assess}=require('../src/fatigue-assessment');
const policy={minDeclineFraction:.1,recentDays:14}, now='2026-12-14';
function fixture(){
 const plans=training.enrol(training.empty(),catalogue.previewProgramme('powerlifting-four-day'),'2026-11-09','real-generated').plans;
 const p=native.buildProgramme(plans,null,{training,registry,gym,inventory:{items:{}},now:'2026-11-09T09:00:00Z',equipment:[],protectedWeek:()=>false});
 const session=p.weeks[0].sessions.find(s=>s.ex?.length);const ex=structuredClone(session.ex),days=['2026-11-09','2026-11-16','2026-11-23','2026-12-01','2026-12-08'];
 const state={sets:[],runs:[],completedWorkouts:[],fatigueEvidence:[],originalProgramme:structuredClone(p)};
 days.forEach((date,i)=>{const id='s'+i,total=ex.reduce((sum,x)=>sum+x[1],0),stamp=date+'T09:00:00.000Z';state.completedWorkouts.push({id,date:stamp,completedSets:total,plannedSets:total,prescription:{ex:structuredClone(ex),runs:[]}});
 ex.forEach((x,k)=>{for(let set=1;set<=x[1];set++)state.sets.push({date:stamp,sessionId:id,exerciseId:x[5].exerciseId,set,reps:x[2],weight:k===0?(i<3?100:80):50,rpe:7})});
 state.fatigueEvidence.push({sessionId:id,discipline:'strength',recordedAt:stamp,painOrDiscomfort:'no',illness:'no',unusualFatigue:i===4?'yes':'no',interruptionReason:null});});return state;
}
const check=s=>assess({state:s,discipline:'strength',now,policy});
test('actual generated prescription supports repeated comparable completed strength review only; input untouched',()=>{const s=fixture(),original=structuredClone(s),result=check(s);a.equal(result.status,'review');a.equal(result.candidate.baseline.length,3);a.equal(result.candidate.regression.length,2);a.deepEqual(s,original);});
test('ordinary fatigue, one bad session, incomplete sessions or no confirmed fatigue never trigger',()=>{for(const mutate of [s=>s.sets.filter(x=>x.sessionId==='s4'&&x.exerciseId==='competition-squat').forEach(x=>x.weight=100),s=>s.sets.filter(x=>x.sessionId==='s3'&&x.exerciseId==='competition-squat').forEach(x=>x.weight=100),s=>s.completedWorkouts[4].completedSets--,s=>s.fatigueEvidence[4].unusualFatigue='unknown',s=>s.sets.pop()]){const s=fixture();mutate(s);a.notEqual(check(s).status,'review');}});
test('missing, unreliable, inconsistent and invalid evidence fails closed',()=>{for(const mutate of [s=>delete s.fatigueEvidence[4].illness,s=>s.fatigueEvidence.push({...s.fatigueEvidence[4]}),s=>s.completedWorkouts[4].plannedSets--,s=>s.completedWorkouts[4].date='2026-02-30',s=>s.sets='bad',s=>s.completedWorkouts[4].prescription.ex[0][4]=8]){const s=fixture();mutate(s);a.notEqual(check(s).status,'review');}a.equal(assess({state:fixture(),discipline:'strength',now}).status,'insufficient');});
test('pain and illness route away from fatigue review even with regression',()=>{for(const field of ['illness','painOrDiscomfort']){const s=fixture();s.fatigueEvidence[4][field]='yes';a.equal(check(s).status,'safety');}});
test('future dates and expired reports cannot support a review',()=>{const s=fixture();a.notEqual(assess({state:s,discipline:'strength',now:'2026-12-01',policy}).status,'review');a.notEqual(assess({state:s,discipline:'strength',now:'2027-01-01',policy}).status,'review');});
test('actual generated continuous run requires comparable reliable context and completed distance',()=>{
 const plans=training.enrol(training.empty(),catalogue.previewProgramme('10k-two-run'),'2026-11-09','real-run').plans;
 const p=native.buildProgramme(plans,null,{training,registry,gym,inventory:{items:{}},now:'2026-11-09T09:00:00Z',equipment:[],protectedWeek:()=>false});
 const session=p.weeks.flatMap(w=>w.sessions).find(s=>s.runs?.length&&s.runs[0].steps.length===1&&s.runs[0].role==='long-run');
 const run=structuredClone(session.runs[0]),days=['2026-11-09','2026-11-16','2026-11-23','2026-12-01','2026-12-08'],state={completedWorkouts:[],runs:[],fatigueEvidence:[]};
 days.forEach((date,i)=>{const id='run'+i,stamp=date+'T09:00:00.000Z';state.completedWorkouts.push({id,date:stamp,completedRun:true,prescription:{ex:[],runs:[structuredClone(run)]}});state.runs.push({sessionId:id,date:stamp,km:run.distanceKm,min:i<3?55:75});state.fatigueEvidence.push({sessionId:id,discipline:'running',recordedAt:stamp,painOrDiscomfort:'no',illness:'no',unusualFatigue:i===4?'yes':'no',comparableConditions:'yes',reliableMeasurement:'yes',runEffort:5});});
 const evaluate=()=>assess({state,discipline:'running',now,policy});a.equal(evaluate().status,'review');state.runs[4].km-=1;a.notEqual(evaluate().status,'review');state.runs[4].km=run.distanceKm;state.fatigueEvidence[4].comparableConditions='unknown';a.notEqual(evaluate().status,'review');state.fatigueEvidence[4].comparableConditions='yes';state.completedWorkouts[4].prescription.runs[0].steps.push({role:'work'});a.notEqual(evaluate().status,'review');
});
