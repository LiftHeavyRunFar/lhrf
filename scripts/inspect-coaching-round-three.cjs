// Read-only coaching audit. Records native prescriptions and counterfactuals;
// deliberately does not treat calendar feasibility as coaching approval.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {run}=require('./test-five-scenarios.cjs');
const coach=require('../src/coach-engine.js'),adapters=require('../src/coach-adapters.js');
const fixturePath='tests/fixtures/five-scenario-round-three-inputs.json';
const fixture=require('../'+fixturePath),copy=x=>JSON.parse(JSON.stringify(x));
const capture=run({fixture,fixturePath});
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const cfg=id=>{const c=copy(fixture.cases.find(x=>x.id===id).config);const e=coach.createEngine();for(const [n,p]of Object.entries(c.liftProfiles))c.baselines[n]=e.estimatedMax(p.kg,p.reps);return c;};
const now=()=>Date.parse(fixture.clock);
const generate=(c,data)=>adapters.buildNewProgramme(c,{now,data});
const sessions=p=>p.weeks.map(w=>w.sessions);
const k=cfg('K'),original=generate(k),slowRecovery=copy(k),longerDuration=copy(k),explicitMarathon=copy(k);
slowRecovery.runningHistory.longRun.recoveryHours=96;
longerDuration.runningHistory.longRun.minutes=220;
explicitMarathon.runningHistory.recentMarathonDate=k.runProfile.resultDate;
const o=cfg('O'),noLogs=generate(o),evidence={sets:[]};
for(const date of ['2026-10-25T12:00:00Z','2026-10-29T12:00:00Z'])for(const lift of ['Squat','Bench','Deadlift'])evidence.sets.push({date,exercise:lift,weight:Math.round(o.baselines[lift]*.9/2.5)*2.5,reps:5,rpe:7,target:7,role:'top'});
const withLogs=generate(o,evidence);
const report={schema:'lhrf-coaching-round-three-depth-audit-v1',synthetic:true,
 fixtureSha256:hash(fs.readFileSync(path.join(__dirname,'..',fixturePath))),inspectionSha256:hash(fs.readFileSync(__filename)),provenance:capture.provenance,
 interpretation:'This audit freezes observations. Repeated prescriptions may be purposeful, and observed weaknesses require coaching judgement. Probes create new proposals only, never edit an approved programme.',
 cases:capture.cases.map(row=>({id:row.id,name:row.name,error:row.error||null,checks:row.checks,
  weeks:(row.programme?.weeks||[]).map(w=>{
   const training=w.sessions.flatMap(s=>s.runs||[]).filter(r=>r.role!=='race');
   return {week:w.week,priority:w.priority,phase:w.phase,runningPhase:w.runningPhase,calendarFeasible:w.feasible,reviewRequired:w.reviewRequired,
    runningKm:Number(training.reduce((n,r)=>n+(r.distanceKm||0),0).toFixed(3)),
    longRunKm:Math.max(0,...training.filter(r=>r.role==='long-run').map(r=>r.distanceKm||0)),
    qualityKm:Number(training.flatMap(r=>r.steps||[]).filter(s=>s.role==='work').reduce((n,s)=>n+(s.distanceKm||0),0).toFixed(3)),
    qualityDays:w.sessions.filter(s=>(s.runs||[]).some(r=>r.role!=='race'&&(r.steps||[]).some(t=>t.role==='work'))).map(s=>s.day),
    mainWork:w.sessions.filter(s=>(s.ex||[]).some(e=>e[5]?.category==='primary')).map(s=>({day:s.day,minutes:s.timeBudget?.totalMinutes,exercises:s.ex.filter(e=>e[5]?.category==='primary').map(e=>({exercise:e[0],sets:e[1],reps:e[2],kg:e[3],rpe:e[4],role:e[5]?.trainingRole||e[5]?.policy||null}))})),
    warnings:w.warnings,blockingIssues:w.blockingIssues};
  })})),
 counterfactuals:{
  longRecovery24versus96Hours:{sessionsIdentical:JSON.stringify(sessions(original))===JSON.stringify(sessions(generate(slowRecovery))),warningsIdentical:JSON.stringify(original.weeks.map(w=>w.warnings))===JSON.stringify(generate(slowRecovery).weeks.map(w=>w.warnings))},
  longRun145versus220Minutes:{sessionsIdentical:JSON.stringify(sessions(original))===JSON.stringify(sessions(generate(longerDuration)))},
  sameKnownMarathonDateExplicitlyRepeated:{sessionsIdentical:JSON.stringify(sessions(original))===JSON.stringify(sessions(generate(explicitMarathon))),originalFirstWeekKm:original.weeks[0].sessions.flatMap(s=>s.runs||[]).reduce((n,r)=>n+r.distanceKm,0),explicitDateFirstWeekKm:generate(explicitMarathon).weeks[0].sessions.flatMap(s=>s.runs||[]).reduce((n,r)=>n+r.distanceKm,0)},
  improvedCompletedMainLiftEvidence:{observedSets:evidence.sets,sessionsIdentical:JSON.stringify(sessions(noLogs))===JSON.stringify(sessions(withLogs)),boundary:'Generation only: review proposals, explicit approval, and same-session effort-led adjustments are separate paths and are not disproved by this probe.'}
 }};
const dest=process.argv[2]||'docs/qa/coaching-round-three-metrics.json';
fs.mkdirSync(path.dirname(path.resolve(dest)),{recursive:true});fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({output:dest,fixtureSha256:report.fixtureSha256,cases:report.cases.map(c=>({id:c.id,weeks:c.weeks.length,blocked:c.weeks.filter(w=>w.calendarFeasible===false).map(w=>w.week),peakKm:Math.max(...c.weeks.map(w=>w.runningKm)),longestKm:Math.max(...c.weeks.map(w=>w.longRunKm))})),counterfactuals:report.counterfactuals},null,2));
