// Current engine only; proposed decisions live in the review document, not code.
// Run: node docs/recovery-policy-proposal/characterize-current.cjs
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const adapters=require('../../src/coach-adapters');
const {cases,AS_OF}=require('../../tests/fixtures/recovery-policy-proposal-inputs.cjs');
const ROOT=path.join(__dirname,'../..'),sum=rows=>rows.reduce((n,x)=>n+x,0);
function summarize(p){return p.weeks.map(w=>{
 const ex=w.sessions.flatMap(s=>(s.ex||[]).map(e=>({day:s.day,exercise:e[0],sets:e[1],reps:e[2],kg:e[3],rpe:e[4],primary:e[5]?.category==='primary',role:e[5]?.trainingRole||null,firstFortnightClip:!!e[5]?.recentMarathonRecovery,reviewRequired:!!e[5]?.recoveryReviewRequired,eventRecovery:!!e[5]?.eventRecoveryReview}))),runs=w.sessions.flatMap(s=>s.runs||[]).filter(r=>r.role!=='race');
 return {week:w.week,phase:w.runningPhase,trainingKm:Number(sum(runs.map(r=>r.distanceKm||0)).toFixed(3)),workKm:Number(sum(runs.flatMap(r=>r.steps||[]).filter(s=>s.role==='work').map(s=>s.distanceKm||0)).toFixed(3)),feasible:w.feasible,
  bench:ex.filter(e=>e.exercise==='Bench'&&e.primary),lower:ex.filter(e=>['Squat','Deadlift'].includes(e.exercise)&&e.primary),warnings:w.warnings.filter(x=>/recover|fatigue|marathon/i.test(x))};
 });}
function characterize(scenario){
 const snapshot=JSON.stringify(scenario),now=()=>Date.parse(scenario.asOf),programme=adapters.buildNewProgramme(scenario.input.config,{data:scenario.input.data,now});
 assert.equal(JSON.stringify(scenario),snapshot,'Fictional source must remain unchanged');
 return {id:scenario.id,athlete:scenario.athlete,trajectory:scenario.trajectory,route:scenario.route,asOf:scenario.asOf,eventDate:scenario.eventDate,evidence:scenario.evidence,generatedWeeks:programme.weeks.length,
  targetEvents:programme.weeks.flatMap(w=>w.sessions.filter(s=>s.eventDate).map(s=>({week:w.week,date:s.eventDate,type:s.eventType}))),weeks:summarize(programme).slice(0,4)};
}
function build(){return {schema:'lhrf-recovery-proposal-current-characterization-1',proposalOnly:true,proposedPolicyImplemented:false,baseline:'cc8eef90b628269758bfdcb9b383aee8c41e2895',asOf:AS_OF,
 sourceSha256:Object.fromEntries(['src/coach-engine.js','src/running-preparation.js','src/coach-adapters.js','tests/fixtures/recovery-policy-proposal-inputs.cjs'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,f))).digest('hex')])),cases:cases().map(characterize)};}
if(require.main===module){const output=build();fs.writeFileSync(path.join(__dirname,'current-characterization.json'),JSON.stringify(output)+'\n');console.log(JSON.stringify({proposalOnly:true,proposedPolicyImplemented:false,cases:output.cases.length,firstFourWeeks:output.cases.map(c=>({id:c.id,weeks:c.weeks.map(w=>({week:w.week,phase:w.phase,km:w.trainingKm,workKm:w.workKm,clippedBench:w.bench.some(e=>e.firstFortnightClip),clippedLower:w.lower.some(e=>e.firstFortnightClip),lowerReview:w.lower.some(e=>e.reviewRequired)}))}))},null,2));}
module.exports={build,characterize,summarize};
