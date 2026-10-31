// Priya's independent acceptance gates. Capture success is not coaching acceptance.
const fs=require('node:fs'),path=require('node:path');
const {run}=require('./test-five-scenarios.cjs');
const trainingRuns=w=>w.sessions.flatMap(s=>s.runs||[]).filter(r=>r.role!=='race');
const liftVisits=w=>w.sessions.filter(s=>(s.ex||[]).some(e=>!(e[5]?.optional))).length;
function audit(report){
 const expectedVisits={A:2,B:2,C:3,D:3,E:2};
 const cases=report.cases.map(row=>{
  const gates=[],inputReviews=[],add=(id,pass,detail)=>gates.push({id,status:pass?'pass':'blocked',detail});
  if(row.error||!row.programme?.weeks?.length){add('native-generation',false,row.error?.message||'Missing native weeks');return {id:row.id,gates,status:'blocked'}}
  const p=row.programme,w=p.weeks[0],source=row.source;
  inputReviews.push(...(source.inputAssumptions||[]).map(detail=>({kind:'source-assumption',requiresAthleteInput:true,detail})));
  if(row.input?.recoveryEvidence&&row.input.recoveryEvidence.cleared!==true&&row.input.recoveryEvidence.resolved!==true)inputReviews.push({kind:'recovery-reassessment',requiresAthleteInput:true,detail:'Fatigue-led proposal is conditional on recovery reassessment; passing its response gate does not clear the supplied fatigue evidence.'});
  const runs=trainingRuns(w),expectedRuns=source.running.current_runs_per_week??source.running.previous_runs_per_week;
  add('requested-run-frequency',runs.length===expectedRuns,`Week 1: ${runs.length} actual training runs; athlete requests ${expectedRuns}.`);
  const requestedVisits=row.input?.visitConstraints?.strengthVisits??expectedVisits[row.id];
  add('strength-visit-frequency',liftVisits(w)===requestedVisits,`Week 1: ${liftVisits(w)} strength visits; accepted scenario contract ${requestedVisits}. Per-lift frequencies are separate mapping assumptions.`);
  const unresolvedEvents=p.weeks.flatMap(x=>x.sessions).flatMap(s=>s.constraintIssues||[]).filter(x=>x.requiresAthleteInput&&['event-time','event-permission'].includes(x.kind));
  inputReviews.push(...unresolvedEvents);
  const enduranceReviews=new Map();for(const week of p.weeks)for(const detail of week.runningSummary?.warnings||[])if(/Marathon endurance review|Confirm recent long.run.*marathon|Confirm recent long.run.*endurance.support/.test(detail)){if(!enduranceReviews.has(detail))enduranceReviews.set(detail,[]);enduranceReviews.get(detail).push(week.week)}
  for(const [detail,weeks]of enduranceReviews)inputReviews.push({kind:'endurance-reassessment',requiresAthleteInput:true,weeks,detail});
  const eventOnlyBlock=x=>{const eventDetails=new Set(x.sessions.flatMap(s=>s.constraintIssues||[]).filter(i=>i.requiresAthleteInput&&['event-time','event-permission'].includes(i.kind)).map(i=>i.detail));return x.feasible===false&&!(x.unscheduled||[]).length&&eventDetails.size>0&&Array.isArray(x.blockingIssues)&&x.blockingIssues.length>0&&x.blockingIssues.every(detail=>eventDetails.has(detail))&&x.sessions.filter(s=>!s.eventDate).every(s=>s.timeBudget?.feasible!==false)};
  add('complete-calendar',p.weeks.every(x=>(x.feasible!==false||eventOnlyBlock(x))&&!(x.unscheduled||[]).length),'Training calendars must contain no unplaced components; a specific blocked event permission/time gate is retained as athlete-input review, not silently approved.');
  add('partial-output-blocked',p.weeks.every(x=>!(x.unscheduled||[]).length||x.feasible===false),'Incomplete calendars must remain explicitly blocked, not exported as accepted programmes.');
  const minuteLimit=source.availability.visit_limits_minutes||source.availability.single_visit_limits_minutes;
  // A proof requires inclusive components, not run minutes or a generic feasibility flag.
  const unsupportedMinutes=(row.unsupported||[]).some(x=>/minute caps|strength duration|whole.visit/i.test(x));
  const proof=p.weeks.every(x=>x.sessions.filter(s=>!s.eventDate).every(s=>{
   const budget=s.timeBudget,cap=minuteLimit[s.day.slice(0,3)];
   const common=budget?.includesWarmups===true&&budget?.includesRest===true&&budget?.includesTransitions===true&&Number.isFinite(budget.totalMinutes)&&Number.isFinite(cap)&&budget.feasible!==false;
   const separate=source.availability.separate_double_days?.includes(s.day.slice(0,3))&&(s.ex||[]).length&&(s.runs||[]).length;
   if(separate)return common&&budget.separate===true&&Array.isArray(budget.visits)&&budget.visits.length===2&&budget.visits.every(v=>Number.isFinite(v.totalMinutes)&&v.totalMinutes<=source.availability.separate_double_each_session_minutes)&&budget.minimumGapHours>=source.availability.separate_double_minimum_gap_hours;
   return common&&budget.totalMinutes<=cap;
  }));
  add('inclusive-visit-minute-contract',!unsupportedMinutes&&proof,'Source minute caps require auditable inclusive session budgets; no run-only estimate or unsupported mapping is a pass.');
  if(row.id==='C'){
   const after=p.weeks.filter(x=>x.week>=8&&!/Taper|Competition/.test(x.phase));
   const handedOver=after.length>0&&after.every(x=>trainingRuns(x).length===2&&trainingRuns(x).every(r=>r.role==='easy-run')&&['strength','Strength','Squat','Bench','Deadlift','powerlifting'].includes(x.priority));
   add('dated-priority-handover',handedOver,'After 5K recovery: explicit per-week strength priority and two easy runs required; constant horizon settings are not a handover.');
  }
  if((row.input?.orderedGoals||[]).length>1){
   const goals=row.input.orderedGoals,start=Date.parse(row.input.startDate+'T12:00:00Z');
   for(let i=1;i<goals.length;i++){
    const prev=goals[i-1],next=goals[i],switchDate=Date.parse(prev.date+'T12:00:00Z')+(prev.recoveryDays??7)*86400000;
    const reviewed=p.weeks.filter(x=>start+(x.week-1)*604800000>switchDate&&start+(x.week-1)*604800000<Date.parse(next.date+'T12:00:00Z')-7*86400000);
    add('ordered-goal-handover-'+i,reviewed.length>0&&reviewed.every(x=>x.priority===next.priority&&trainingRuns(x).length===next.runs&&(next.runGoal!=='fitness'||trainingRuns(x).every(r=>r.role==='easy-run'))),'After the first event and recovery gate, the calendar must visibly adopt the next sport priority and running frequency.');
   }
  }
  if(row.input?.recoveryEvidence||row.id==='D')add('fatigue-evidence-response',row.diagnostic?.historyVersusNoHistoryFirstWeekIdentical===false||['fatigue','recovery-review'].includes(row.review?.status),'Fatigue history must affect initial proposal or produce a recovery-specific review; generic observe is insufficient.');
  if(row.input?.runningGoalSeconds||row.id==='E'){
   const quality=p.weeks.flatMap(trainingRuns).filter(r=>r.role==='quality-run');
   add('current-fitness-pace-guard',(row.diagnostic?.targetVersusNoTargetAllWeekPrescriptionsIdentical??row.diagnostic?.targetVersusNoTargetFirstWeekPrescriptionsIdentical)===true&&quality.length>0&&quality.every(r=>r.paceBasis?.goalSupported===false)&&p.weeks.some(w=>(w.warnings||[]).some(x=>/Goal pace is faster|goal.*faster|unsupported.*goal|aspiration/i.test(x))),'An unsupported faster aspiration must be flagged while actual pace/steps/dose remain based on current fitness. Goal metadata may legitimately differ.');
  }
  for(const x of p.weeks)for(const event of x.sessions.filter(s=>s.eventType==='strength')){
   const eventMs=Date.parse(event.eventDate+'T12:00:00Z');
   const nextDate=new Date(eventMs+86400000).toISOString().slice(0,10);
   const nextDay=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(nextDate+'T12:00:00Z').getUTCDay()];
   const start=Date.parse(row.input.startDate+'T12:00:00Z'),weekIndex=Math.floor((Date.parse(nextDate+'T12:00:00Z')-start)/604800000);
   const nextWeek=p.weeks[weekIndex];
   const automaticLong=nextWeek?.sessions.some(s=>s.day.slice(0,3)===nextDay&&(s.runs||[]).some(r=>r.role==='long-run'));
   add('post-strength-event-recovery',!automaticLong,`No automatic long run the day after strength event ${event.eventDate}.`);
  }
  const raceEvents=p.weeks.flatMap(x=>x.sessions).filter(s=>s.eventType==='running');
  for(const event of raceEvents){const cap=minuteLimit[event.day.slice(0,3)],duration=(event.runs||[]).reduce((n,r)=>n+(r.durationRangeMinutes?.max??r.minutes??0),0);
   const permission=source.availability.confirmed_event_time_extension===true;
   const eventWindow=row.input?.visitConstraints?.eventDays?.[event.eventDate];
   const explicitCap=eventWindow&&Object.hasOwn(eventWindow,'minutes')?(eventWindow.minutes===null?(eventWindow.confirmed===true?Infinity:cap):Number(eventWindow.minutes)):cap;
   const properlyBlocked=(event.constraintIssues||[]).some(x=>x.kind==='event-time'&&x.requiresAthleteInput)&&p.weeks.some(x=>x.sessions.includes(event)&&x.feasible===false);
   add('event-time-window',!Number.isFinite(explicitCap)||duration<=explicitCap||permission||properlyBlocked,`Event ${event.eventDate}: native upper duration ${duration} min, confirmed window ${explicitCap===Infinity?'explicitly uncapped':explicitCap??'unknown'} min; unresolved extension must be specifically blocked.`);
  }
  const allExercises=p.weeks.flatMap(x=>x.sessions).flatMap(s=>s.ex||[]),allRuns=p.weeks.flatMap(trainingRuns);
  const runningEvents=(source.goals||[]).filter(g=>g.sport==='running');
  for(const goal of runningEvents){
   const eventMs=Date.parse(goal.date+'T12:00:00Z'),startMs=Date.parse(row.input.startDate+'T12:00:00Z');
   const rehearsal=p.weeks.filter(x=>startMs+(x.week-1)*604800000<eventMs-7*86400000).flatMap(trainingRuns).filter(r=>['race-pace-repeats','marathon-pace-long-run'].includes(r.workoutFamily));
   add('event-rhythm-rehearsal-'+goal.date,rehearsal.length>=2,`${rehearsal.length} actual scheduled event-rhythm rehearsals before the final race week; current-fitness pacing is required.`);
  }
  const strengthEvents=(source.goals||[]).filter(g=>['powerlifting','strength'].includes(g.sport));
  if(strengthEvents.length&&(row.input.bench||0)>=3){
   const roles=new Set(allExercises.map(e=>e[5]?.trainingRole));
   add('distinct-strength-exposures',['heavy','volume','speed'].every(r=>roles.has(r)),'Three weekly bench exposures must express distinct heavy, volume and speed doses where the preparation allows them.');
  }
  if(strengthEvents.length&&source.strength?.reference_maxes_kg&&['advanced','intermediate'].includes(row.input.trainingAge)&&!row.input.recoveryEvidence){
   const heavy=allExercises.filter(e=>e[5]?.trainingRole==='heavy');
   add('competition-effort-progression',heavy.some(e=>e[4]>=8.5)&&heavy.every(e=>e[4]<=9),'Recovered experienced athletes need meaningful heavy rehearsals approaching competition, with RPE governing load and no forced maximum/grind.');
  }
  const coachingMetrics={peakScheduledTrainingKm:Number(Math.max(...p.weeks.map(x=>trainingRuns(x).reduce((n,r)=>n+(r.distanceKm||0),0))).toFixed(3)),longestScheduledRunKm:Math.max(0,...allRuns.map(r=>r.role==='long-run'?r.distanceKm||0:0)),raceRhythmRehearsals:allRuns.filter(r=>['race-pace-repeats','marathon-pace-long-run'].includes(r.workoutFamily)).length,strengthTrainingRoles:[...new Set(allExercises.map(e=>e[5]?.trainingRole).filter(Boolean))],peakPrescribedRpe:Math.max(0,...allExercises.filter(e=>!e[5]?.optional).map(e=>Number(e[4])||0)),phases:[...new Set(p.weeks.map(x=>x.phase))],runningPhases:[...new Set(p.weeks.map(x=>x.runningPhase||x.runningSummary?.phase).filter(Boolean))]};
  return {id:row.id,name:row.name,status:gates.every(g=>g.status==='pass')?(inputReviews.length?'conditional-review':'pass'):'blocked',inputReviews,gates,coachingMetrics};
 });
 return {schema:'lhrf-scenario-coaching-gates-v2',synthetic:true,provenance:report.provenance,scope:'Independent acceptance checks of actual native outputs; not physiological efficacy or deployed browser certification.',summary:{cases:cases.length,passed:cases.filter(c=>c.status==='pass').length,blocked:cases.filter(c=>c.status==='blocked').length,conditionalReview:cases.filter(c=>c.status==='conditional-review').length,gates:cases.reduce((n,c)=>n+c.gates.length,0),blockedGates:cases.reduce((n,c)=>n+c.gates.filter(g=>g.status==='blocked').length,0)},cases};
}
if(require.main===module){
 const arg=name=>{const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:null},root=path.join(__dirname,'..');
 const fixturePath=arg('--fixture')||'tests/fixtures/five-scenario-engine-inputs.json';
 const fixture=JSON.parse(fs.readFileSync(path.resolve(root,fixturePath),'utf8'));
 const result=audit(run({fixture,fixturePath})),out=path.join(path.resolve(root,arg('--output')||'docs/qa/five-scenario-engine-baseline'),'coaching-gates.json');
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({output:out,...result.summary},null,2));process.exitCode=result.summary.blocked||result.summary.conditionalReview?1:0;
}
module.exports={audit};
