// Prescription-level gates frozen from the independent round-three review.
// These are engineering/coaching criteria, not a universal readiness standard.
const fs=require('node:fs'),path=require('node:path');
const training=w=>w.sessions.flatMap(s=>s.runs||[]).filter(r=>r.role!=='race');
const workKm=w=>training(w).flatMap(r=>r.steps||[]).filter(s=>s.role==='work').reduce((n,s)=>n+(s.distanceKm||0),0);
const primaries=(w,lift)=>w.sessions.flatMap(s=>(s.ex||[]).filter(e=>e[5]?.category==='primary'&&(!lift||e[0]===lift)));
const reps=rows=>rows.reduce((n,e)=>n+e[1]*e[2],0);
function audit(rows,probes){
 const gates=[],get=id=>rows.find(r=>r.id===id),add=(id,pass,detail)=>gates.push({id,status:pass?'pass':'blocked',detail});
 for(const id of ['K','L','M','N','O'])add(id+'-native-generation',!get(id)?.error&&get(id)?.programme?.weeks?.length>0,'Native programmes must generate without errors.');
 if(gates.some(x=>x.status==='blocked'))return {coachingSignoff:false,gates};
 const K=get('K').programme.weeks,L=get('L').programme.weeks,M=get('M').programme.weeks,N=get('N').programme.weeks;
 const peakKm=Math.max(...K.map(w=>training(w).reduce((n,r)=>n+(r.distanceKm||0),0)));
 const longest=Math.max(...K.flatMap(w=>training(w)).filter(r=>r.role==='long-run').map(r=>r.distanceKm||0));
 add('K-established-endurance-retained',peakKm>=75&&longest>=28,'Established marathon preparation must retain substantial support under this supplied 75 km baseline; this is not a universal minimum.');
 const peakWork=Math.max(...K.map(workKm)),taper=K.filter(w=>w.runningPhase==='Taper / event');
 add('K-small-taper-pace-reminders',taper.length>0&&taper.every(w=>workKm(w)>0&&workKm(w)<=Math.min(4,peakWork*.5)+.01),'Each recovered established-marathon taper week retains a smaller current-fitness work dose, bounded below the specific-block dose.');
 const final=K.at(-1),prior=K.find(w=>w.week===11),finalDL=primaries(final,'Deadlift');
 add('K-background-strength-taper',finalDL.every(e=>e[4]<=6.5)&&reps(primaries(final))<reps(primaries(prior)),'Background main-lift volume and deadlift effort reduce near the marathon.');
 add('L-unsupported-marathon-stays-blocked',L.every(w=>w.feasible===false),'Eight-week marathon from an 18 km baseline must not become approved just to satisfy the date.');
 const lower=M.flatMap(w=>primaries(w)).filter(e=>['Squat','Deadlift'].includes(e[0]));
 add('M-support-lifts-maintained',lower.length>0&&lower.every(e=>e[4]<=7.5&&!['heavy','strength','volume'].includes(e[5]?.trainingRole)),'Bench-only default support lifts receive maintenance/technique rather than a separate progressive peak, unless explicitly overridden.');
 const bench=M.flatMap(w=>primaries(w,'Bench'));
 add('M-bench-specific-heavy-practice-retained',bench.some(e=>e[2]===1&&e[4]>=8.5),'Fixing support lifts must retain demanding bench competition practice.');
 const raceWeek=N.find(w=>w.week===6),recoveryWeek=N.find(w=>w.week===7),dayAfter=recoveryWeek.sessions.find(s=>s.day.slice(0,3)==='Mon');
 const nextDayLower=(dayAfter?.ex||[]).filter(e=>e[5]?.category==='primary'&&['Squat','Deadlift'].includes(e[0]));
 add('N-day-after-half-recovery-coordination',nextDayLower.every(e=>e[4]<=6)&&reps(nextDayLower)<reps(primaries(N[0],'Squat')),'Day-after-half lower lifting is absent or deliberately reduced, rather than unchanged maintenance.');
 add('N-no-race-week-strength-rebound',primaries(raceWeek).filter(e=>['Squat','Deadlift'].includes(e[0])).every(e=>e[4]<=6),'An unrelated strength deload must not cause a lower-lifting rebound in the running race week.');
 const handover=N.find(w=>w.week===8),heavy=primaries(handover).filter(e=>e[4]>=8);
 const visibleReview=heavy.every(e=>e[5]?.recoveryReviewRequired===true)||handover.warnings.some(s=>/handover|post.race|after.*race/i.test(s)&&/review|reassess|confirm/i.test(s));
 add('N-handover-remains-conditional',handover.reviewRequired===true&&visibleReview,'A dated future handover is planned subject to actual recovery review, not presented as proof of recovery.');
 if(probes){
  const p=probes.counterfactuals||probes;
  add('long-run-recovery-observation-used',!p.longRecovery24versus96Hours.sessionsIdentical||!p.longRecovery24versus96Hours.warningsIdentical,'Changing observed recovery from 24 to 96 hours must affect dose or an explicit review warning.');
  add('long-run-duration-observation-used',!p.longRun145versus220Minutes.sessionsIdentical||p.longRun145versus220Minutes.warningsIdentical===false,'Changing observed long-run duration must affect dose or an explicit review warning.');
  add('dated-marathon-facts-normalised',p.sameKnownMarathonDateExplicitlyRepeated.sessionsIdentical,'Repeating the same known marathon date in another supported field must not change the prescription.');
  add('new-proposal-uses-completed-lift-evidence',!p.improvedCompletedMainLiftEvidence.sessionsIdentical,'Eligible repeated same-lift evidence influences calibration/review of a newly requested proposal; approved records remain separate.');
 }
 return {schema:'lhrf-coaching-round-three-gates-v1',coachingCodeGatesPassed:gates.every(g=>g.status==='pass'),coachingSignoff:false,signoffBoundary:'Passing these frozen criteria still requires prescription review. It is not athlete readiness or a result forecast.',gates};
}
if(require.main===module){
 const dir=process.argv[2]||'output/round-three-native',probePath=process.argv[3];
 const rows=['K','L','M','N','O'].map(id=>JSON.parse(fs.readFileSync(path.join(dir,id+'.json'))));
 const result=audit(rows,probePath?JSON.parse(fs.readFileSync(probePath)):null);
 console.log(JSON.stringify(result,null,2));process.exitCode=result.coachingCodeGatesPassed?0:1;
}
module.exports={audit};
