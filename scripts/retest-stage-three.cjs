// Replay the unchanged Stage 2 facts; compare all prescriptions with the frozen evidence.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {replay}=require('./audit-stage-two.cjs');
const root=path.join(__dirname,'..'),fixture=require('../tests/fixtures/stage-two-new-athletes.json');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const doses=p=>p.weeks.map(w=>w.sessions.map(s=>[s.day,s.ex,s.runs]));
const numericDoses=p=>p.weeks.map(w=>w.sessions.map(s=>[s.day,(s.ex||[]).map(e=>e.slice(0,5)),s.runs]));
const main=(w,lift)=>w.sessions.flatMap(s=>s.ex||[]).filter(e=>e[5]?.category==='primary'&&(!lift||e[0]===lift));
function retest(output='docs/qa/stage-three'){
 const dir=path.resolve(root,output),inspection=replay(dir),manifest=require('../docs/qa/stage-two/manifest.json'),rows={};
 for(const m of manifest.programmes){
  const bytes=fs.readFileSync(path.join(root,m.raw));assert.equal(hash(bytes),m.sha256,'Frozen baseline changed: '+m.id);
  rows[m.id]={before:JSON.parse(bytes),after:JSON.parse(fs.readFileSync(path.join(dir,m.id+'.json')))};
 }
 const t=rows.T.after.programme,s=rows.S.after.programme,race=t.weeks.at(-1).sessions.find(x=>x.eventDate);
 const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const checks={
  unchangedFrozenFacts:inspection.inputSha256==='5a0e83d10a5aab146db43ad2d7170be0cd2ff97888de412a809161099a4e190a',
  nativeImmutableDeterministicCapture:inspection.engineeringCapturePassed,
  leilaAndHugoPrescriptionsUnchanged:['P','Q'].every(id=>equal(doses(rows[id].after.programme),doses(rows[id].before.programme))&&rows[id].after.programme.weeks.every(w=>w.feasible)),
  sofiaStillBlocked:rows.R.after.programme.weeks.every(w=>!w.feasible)&&equal(doses(rows.R.after.programme),doses(rows.R.before.programme)),
  hardTimeConflictBlocksKeiko:t.weeks.at(-1).feasible===false&&race.eventPermission.confirmed===false&&race.timeBudget.totalMinutes===250&&race.eventPermission.hardWindowMinutes===240&&race.constraintIssues.some(i=>i.kind==='event-time'),
  aspirationDoesNotChangeRacePrescription:equal(race.runs,rows.T.before.programme.weeks.at(-1).sessions.find(x=>x.eventDate).runs),
  affectedMaintenanceBoundedWithoutRemovingStrength:t.weeks.every(w=>['Squat','Deadlift'].every(lift=>main(w,lift).length&&main(w,lift).every(e=>e[4]<=6.5&&e[5]?.recoveryReviewRequired))),
  unaffectedBenchRetained:t.weeks.every(w=>equal(main(w,'Bench'),main(rows.T.before.programme.weeks[w.week-1],'Bench'))),
  partialWeekHasNoEarlyHardWork:!inspection.findings.some(f=>f.kind==='hard-work-within-requested-recovery'),
  idrisDayNineIsLightWithReview:main({sessions:s.weeks[5].sessions.filter(x=>x.day==='Mon')}).every(e=>e[4]<=6)&&s.weeks[5].coachingInstructions.handoverRecovery.conditional===true,
  fatigueChangesMaintenance:inspection.probes.find(p=>p.id==='T')?.allPrimaryLiftingIdentical===false,
  noUnaddressedEngineFinding:inspection.findings.every(f=>f.kind==='event-window-exceeded'&&f.calendarFeasible===false)
 };
 const comparisons=Object.entries(rows).map(([id,{before,after}])=>({id,name:after.name,weeks:after.programme.weeks.length,
  dosesExactlyEqual:equal(doses(before.programme),doses(after.programme)),
  beforeBlockedWeeks:before.programme.weeks.filter(w=>!w.feasible).map(w=>w.week),afterBlockedWeeks:after.programme.weeks.filter(w=>!w.feasible).map(w=>w.week),
  changedDoseWeeks:after.programme.weeks.filter((w,i)=>!equal(doses({weeks:[before.programme.weeks[i]]}),doses({weeks:[w]}))).map(w=>w.week),
  changedNumericPrescriptionWeeks:after.programme.weeks.filter((w,i)=>!equal(numericDoses({weeks:[before.programme.weeks[i]]}),numericDoses({weeks:[w]}))).map(w=>w.week),
  beforeFirstPrimary:before.programme.weeks[0].sessions.map(x=>({day:x.day,ex:main({sessions:[x]}).map(e=>e.slice(0,5))})),
  afterFirstPrimary:after.programme.weeks[0].sessions.map(x=>({day:x.day,ex:main({sessions:[x]}).map(e=>e.slice(0,5))}))}));
 const result={scope:'Stage 3 corrections against immutable Stage 2 prescriptions; no original-three coaching comparison.',baseCommit:'b83d04a',sourceWorktreeAtCapture:true,
  sourceSha256:Object.fromEntries(['src/coach-engine.js','src/coach-constraints.js','src/coach-intake.js'].map(p=>[p,hash(fs.readFileSync(path.join(root,p)))])),
  inputSha256:inspection.inputSha256,checks,allCorrectionChecksPassed:Object.values(checks).every(Boolean),comparisons,
  retainedStageTwoAuditFindings:inspection.findings,
  interpretation:'The unchanged Stage 2 audit still reports the real 250-versus-240-minute athlete constraint. Stage 3 must block it, not erase or relabel the hard limit. No fatigue/partial-week failures remain.',
  originalThreeComparisonStarted:false,athleteApproval:false};
 fs.writeFileSync(path.join(dir,'before-after.json'),JSON.stringify(result,null,2)+'\n');
 return result;
}
if(require.main===module){const r=retest(process.argv[2]);console.log(JSON.stringify({checks:r.checks,allCorrectionChecksPassed:r.allCorrectionChecksPassed,comparisons:r.comparisons.map(({beforeFirstPrimary,afterFirstPrimary,...c})=>c),retainedStageTwoAuditFindings:r.retainedStageTwoAuditFindings},null,2));process.exitCode=r.allCorrectionChecksPassed?0:1}
module.exports={retest};
