// Repeatable, read-only synthetic evaluation of the production shared coaching engine.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const cp=require('node:child_process');
const assert=require('node:assert/strict');
const fixture=require('../tests/fixtures/five-scenario-engine-inputs.json');
const coach=require('../src/coach-engine.js');
const adapters=require('../src/coach-adapters.js');
const clone=x=>JSON.parse(JSON.stringify(x));
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const root=path.join(__dirname,'..');
function provenance(){
 const files=['src/coach-engine.js','src/coach-adapters.js','src/running-workouts.js','tests/fixtures/five-scenario-engine-inputs.json','scripts/test-five-scenarios.cjs'];
 return {localCommit:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),files:Object.fromEntries(files.map(f=>[f,hash(fs.readFileSync(path.join(root,f)))])),entry:'buildNewProgramme -> prepareNewProgramme -> buildProgramme -> createEngine.describeWeek -> generatedSessions',browserParity:'index.html customConfig/sync use prepareNewProgramme; generatedSessions delegates to canonical createEngine; see shared-coach.test.cjs. No browser activation or storage used.',clock:fixture.clock,seed:fixture.seed};
}
function weekSummary(w){
 return {week:w.week,phase:w.phase,feasible:w.feasible,reviewRequired:w.reviewRequired,runKm:Number(w.sessions.flatMap(s=>s.runs||[]).reduce((n,r)=>n+(Number(r.distanceKm)||0),0).toFixed(3)),strengthDays:w.sessions.filter(s=>s.ex?.length).map(s=>s.day),runDays:w.sessions.filter(s=>s.runs?.length).map(s=>s.day),warnings:w.warnings,unscheduled:w.unscheduled||[],sessions:w.sessions.map(s=>({day:s.day,eventDate:s.eventDate||null,exercises:(s.ex||[]).map(e=>({exercise:e[0],sets:e[1],reps:e[2],kg:e[3],rpe:e[4],role:e[5]?.role,trainingRole:e[5]?.trainingRole})),runs:(s.runs||[]).map(r=>({name:r.name,role:r.role,distanceKm:r.distanceKm,minutes:r.minutes,durationRangeMinutes:r.durationRangeMinutes,pace:r.pace,paceBasis:r.paceBasis}))}))};
}
function run(){
 const origin=JSON.stringify(fixture),now=()=>Date.parse(fixture.clock),proof=provenance(),cases=[];
 for(const p of fixture.cases){
  const config=clone(p.config),inputSnapshot=JSON.stringify(config),data=clone(p.historicalData),dataSnapshot=JSON.stringify(data);
  // Native UI estimates from kg/reps. The original observations remain intact in the fixture.
  const bare=coach.createEngine({now});
  for(const [name,performance] of Object.entries(config.liftProfiles))config.baselines[name]=bare.estimatedMax(performance.kg,performance.reps);
  const mappedSnapshot=JSON.stringify(config);
  try{
   const programme=adapters.buildNewProgramme(config,{data,now});
   assert.equal(JSON.stringify(config),mappedSnapshot,'generation mutated mapped input');
   assert.equal(JSON.stringify(data),dataSnapshot,'generation mutated historical input');
   assert.deepEqual(adapters.buildNewProgramme(config,{data,now}),programme,'generation is not deterministic');
   const prepared=coach.prepareNewProgramme(config),native=adapters.createProfileEngine(prepared,{data,now});
   const parity=programme.weeks.every(w=>JSON.stringify(native.engine.describeWeek(native.config,w.week).sessions)===JSON.stringify(w.sessions));
   assert.ok(parity,'adapter sessions differ from native production generator');
   native.data.activeSchedule=clone(programme.weeks[0].sessions);
   const reviewing=coach.createEngine({data:native.data,schedule:native.data.activeSchedule,now});
   const beforeReview=JSON.stringify(native.data),review=reviewing.reviewDecision();
   assert.equal(JSON.stringify(native.data),beforeReview,'review mutated athlete state');
   assert.deepEqual(reviewing.reviewDecision(),review,'review not deterministic');
   const diagnostic={};
   if(p.id==='D'){
    const noHistory=adapters.buildNewProgramme(config,{now});
    diagnostic.historyVersusNoHistoryFirstWeekIdentical=JSON.stringify(programme.weeks[0].sessions)===JSON.stringify(noHistory.weeks[0].sessions);
    diagnostic.reviewRecovery=reviewing.reviewRecovery();diagnostic.hybridSignals=reviewing.hybridRecoverySignals();
   }
   if(p.id==='E'){
    const withoutTarget=clone(config);delete withoutTarget.runningGoalSeconds;
    const baseRuns=programme.weeks[0].sessions.flatMap(s=>s.runs||[]),noTargetRuns=adapters.buildNewProgramme(withoutTarget,{data,now}).weeks[0].sessions.flatMap(s=>s.runs||[]);
    diagnostic.targetVersusNoTargetFirstWeekRunsIdentical=JSON.stringify(baseRuns)===JSON.stringify(noTargetRuns);
    const prescribed=runs=>runs.map(({paceBasis,...prescription})=>prescription);
    diagnostic.targetVersusNoTargetFirstWeekPrescriptionsIdentical=JSON.stringify(prescribed(baseRuns))===JSON.stringify(prescribed(noTargetRuns));
    diagnostic.targetMetadataNote='Full run equality includes paceBasis goal metadata. Prescription-only equality excludes paceBasis; actual paces, steps and doses remain compared.';
   }
   cases.push({id:p.id,name:p.name,source:fixture.source.profiles.find(x=>x.id===p.id),input:config,historicalData:data,mapping:p.mapping,unsupported:p.unsupported,programme,review,diagnostic,checks:{sourceInputUnchanged:JSON.stringify(p.config)===inputSnapshot,generationInputUnchanged:JSON.stringify(config)===mappedSnapshot,historicalInputUnchanged:JSON.stringify(data)===dataSnapshot,deterministic:true,nativeSessionParity:parity,reviewDoesNotMutate:true},summary:programme.weeks.map(weekSummary)});
  }catch(error){cases.push({id:p.id,name:p.name,input:config,mapping:p.mapping,unsupported:p.unsupported,error:{name:error.name,message:error.message,stack:error.stack}})}
 }
 assert.equal(JSON.stringify(fixture),origin,'fixture mutated');
 return {schema:'lhrf-five-scenario-engine-baseline-v1',synthetic:true,provenance:proof,scope:'Actual native engine outputs. No hand-authored sessions, activation, athlete data writes, outcome simulation, engine fixes or deployment.',cases};
}
if(require.main===module){
 const report=run(),dir=path.join(root,'docs/qa/five-scenario-engine-baseline');
 fs.mkdirSync(dir,{recursive:true});
 for(const row of report.cases)fs.writeFileSync(path.join(dir,row.id+'.json'),JSON.stringify({...row,provenance:report.provenance},null,2)+'\n');
 const summary={...report,cases:report.cases.map(({programme,historicalData,source,...rest})=>rest)};
 fs.writeFileSync(path.join(dir,'summary.json'),JSON.stringify(summary,null,2)+'\n');
 console.log(JSON.stringify({output:dir,seed:fixture.seed,cases:report.cases.map(c=>({id:c.id,weeks:c.programme?.weeks.length,error:c.error||null,allWeekFeasible:c.programme?.weeks.every(w=>w.feasible!==false),checks:c.checks,firstWeek:c.summary?.[0],diagnostic:c.diagnostic}))},null,2));
 process.exitCode=report.cases.some(c=>c.error)?1:0;
}
module.exports={run,weekSummary};
