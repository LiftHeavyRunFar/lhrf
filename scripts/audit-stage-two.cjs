// Independent capture/inspection only. Never edits a profile, prescription or saved programme.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {run}=require('./test-five-scenarios.cjs'),adapters=require('../src/coach-adapters.js');
const root=path.join(__dirname,'..'),fixturePath='tests/fixtures/stage-two-new-athletes.json';
const clone=x=>JSON.parse(JSON.stringify(x)),hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const stamp=s=>Date.parse(s+'T12:00:00Z');
function dateOf(config,week,day){const d=new Date(stamp(config.startDate)),offset=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(day.slice(0,3));d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7+(week-1)*7+offset);return d.toISOString().slice(0,10)}
const primary=s=>(s.ex||[]).filter(e=>e[5]?.category==='primary');
function inspect(rows){
 const findings=[],metrics=[];
 for(const row of rows){
  if(row.error||!row.programme){findings.push({id:row.id,kind:'capture-error',severity:'high',detail:row.error});continue}
  const c=row.programme.config,all=row.programme.weeks,training=all.flatMap(w=>w.sessions.flatMap(s=>(s.runs||[]).filter(r=>r.role!=='race')));
  const weekly=all.map(w=>{const runs=w.sessions.flatMap(s=>(s.runs||[]).filter(r=>r.role!=='race'));return {week:w.week,priority:w.priority,phase:w.phase,runningPhase:w.runningPhase,feasible:w.feasible,reviewRequired:w.reviewRequired,trainingKm:Number(runs.reduce((n,r)=>n+(Number(r.distanceKm)||0),0).toFixed(3)),longKm:Math.max(0,...runs.filter(r=>r.role==='long-run').map(r=>Number(r.distanceKm)||0)),workKm:Number(runs.flatMap(r=>r.steps||[]).filter(s=>s.role==='work').reduce((n,s)=>n+(Number(s.distanceKm)||0),0).toFixed(3)),strengthDays:w.sessions.filter(s=>s.ex?.length).map(s=>s.day),runDays:w.sessions.filter(s=>s.runs?.length).map(s=>s.day),warnings:w.warnings,blockingIssues:w.blockingIssues};});
  const events=[];
  for(const w of all)for(const s of w.sessions){
   if(s.eventDate){
    const allowance=row.input.visitConstraints?.eventDays?.[s.eventDate],minutes=s.timeBudget?.totalMinutes,logistics=Number(allowance?.logisticsMinutes)||0;
    events.push({date:s.eventDate,minutes,allowedMinutes:allowance?.minutes??null,logisticsMinutes:logistics,confirmed:s.eventPermission?.confirmed});
    if(allowance?.minutes>0&&Number.isFinite(minutes)&&minutes+logistics>allowance.minutes)findings.push({id:row.id,kind:'event-window-exceeded',severity:'high',week:w.week,date:s.eventDate,estimatedMinutes:minutes,logisticsMinutes:logistics,capMinutes:allowance.minutes,calendarFeasible:w.feasible});
   }else{
    const b=s.timeBudget;
    if(b?.feasible===false&&w.feasible)findings.push({id:row.id,kind:'false-visit-feasibility',severity:'high',week:w.week,day:s.day});
    if(b?.visits?.some(v=>v.totalMinutes>v.capMinutes)&&w.feasible)findings.push({id:row.id,kind:'visit-window-exceeded',severity:'high',week:w.week,day:s.day});
   }
   for(const goal of row.input.orderedGoals||[]){
    if(!goal.recoveryDays||s.eventDate)continue;
    const date=dateOf(row.input,w.week,s.day),elapsed=(stamp(date)-stamp(goal.date))/86400000;
    const hardLifts=primary(s).filter(e=>Number(e[4])>=8),hardRuns=(s.runs||[]).filter(r=>(r.steps||[]).some(step=>step.role==='work'));
    if(elapsed>0&&elapsed<goal.recoveryDays&&(hardLifts.length||hardRuns.length))findings.push({id:row.id,kind:'hard-work-within-requested-recovery',severity:'high',week:w.week,date,daysAfterEvent:elapsed,requestedRecoveryDays:goal.recoveryDays,lifts:hardLifts.map(e=>e.slice(0,5)),hardRuns:hardRuns.map(r=>r.name),handoverReview:w.coachingInstructions?.handoverRecovery||null});
   }
  }
  metrics.push({id:row.id,name:row.name,weeks:all.length,captureChecks:row.checks,blockedWeeks:weekly.filter(w=>w.feasible===false).map(w=>w.week),peakTrainingKm:Math.max(0,...weekly.map(w=>w.trainingKm)),longestTrainingRunKm:Math.max(0,...training.filter(r=>r.role==='long-run').map(r=>r.distanceKm||0)),longestAnyEasyRunKm:Math.max(0,...training.map(r=>r.distanceKm||0)),qualityWeeks:weekly.filter(w=>w.workKm>0).map(w=>w.week),events,weekly});
 }
 return {scope:'Objective inspection, not a complete coaching judgement. Read the prescription review.',metrics,findings};
}
function replay(output='work/stage-two/replay'){
 const fixture=JSON.parse(fs.readFileSync(path.join(root,fixturePath))),dir=path.resolve(root,output);fs.mkdirSync(dir,{recursive:true});
 const capture=run({fixture,fixturePath}),inspection=inspect(capture.cases),probes=[];
 for(const row of capture.cases){
  fs.writeFileSync(path.join(dir,row.id+'.json'),JSON.stringify({...row,provenance:capture.provenance},null,2)+'\n');
  if(!row.programme||!row.input.recoveryEvidence)continue;
  const noFatigue=clone(row.input),data=clone(row.historicalData);delete noFatigue.recoveryEvidence;delete noFatigue.recoveryContext;data.sets=[];
  const now=()=>Date.parse(fixture.clock),comparison=adapters.buildNewProgramme(noFatigue,{data,now});
  const lifts=p=>p.weeks.map(w=>w.sessions.flatMap(s=>primary(s))),affected=new Set(row.input.recoveryEvidence.affectedLifts||[]);
  const first=p=>p.weeks[0].sessions.flatMap(s=>primary(s).filter(e=>affected.has(e[0])).map(e=>({day:s.day,exercise:e.slice(0,5),recoveryReviewRequired:!!e[5]?.recoveryReviewRequired})));
  const probe={id:row.id,boundary:'Counterfactual new proposals only; original capture and input remain unedited.',allPrimaryLiftingIdentical:JSON.stringify(lifts(row.programme))===JSON.stringify(lifts(comparison)),withFatigue:first(row.programme),withoutFatigue:first(comparison)};
  probes.push(probe);
  if(probe.allPrimaryLiftingIdentical&&probe.withFatigue.some(e=>e.exercise[4]>7&&!e.recoveryReviewRequired))inspection.findings.push({id:row.id,kind:'fatigue-not-applied-to-maintenance-lifting',severity:'high',detail:probe});
 }
 const result={...inspection,probes,inputSha256:hash(fs.readFileSync(path.join(root,fixturePath))),provenance:capture.provenance,engineeringCapturePassed:capture.cases.length===5&&capture.cases.every(r=>!r.error&&Object.values(r.checks||{}).every(Boolean)),coachingSignoff:false,originalThreeComparisonStarted:false};
 fs.writeFileSync(path.join(dir,'inspection.json'),JSON.stringify(result,null,2)+'\n');
 return result;
}
if(require.main===module){const r=replay(process.argv[2]);console.log(JSON.stringify({engineeringCapturePassed:r.engineeringCapturePassed,findings:r.findings,profiles:r.metrics.map(({weekly,captureChecks,...m})=>m),coachingSignoff:false,originalThreeComparisonStarted:false},null,2));process.exitCode=!r.engineeringCapturePassed||r.findings.length?1:0}
module.exports={inspect,replay,dateOf};
