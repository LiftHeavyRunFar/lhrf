// Priya's independent acceptance gates. Capture success is not coaching acceptance.
const fs=require('node:fs'),path=require('node:path');
const {run}=require('./test-five-scenarios.cjs');
const trainingRuns=w=>w.sessions.flatMap(s=>s.runs||[]).filter(r=>r.role!=='race');
const liftVisits=w=>w.sessions.filter(s=>(s.ex||[]).some(e=>!(e[5]?.optional))).length;
function audit(report){
 const expectedVisits={A:2,B:2,C:3,D:3,E:2};
 const cases=report.cases.map(row=>{
  const gates=[],add=(id,pass,detail)=>gates.push({id,status:pass?'pass':'blocked',detail});
  if(row.error||!row.programme?.weeks?.length){add('native-generation',false,row.error?.message||'Missing native weeks');return {id:row.id,gates,status:'blocked'}}
  const p=row.programme,w=p.weeks[0],source=row.source;
  const runs=trainingRuns(w),expectedRuns=source.running.current_runs_per_week??source.running.previous_runs_per_week;
  add('requested-run-frequency',runs.length===expectedRuns,`Week 1: ${runs.length} actual training runs; athlete requests ${expectedRuns}.`);
  add('strength-visit-frequency',liftVisits(w)===expectedVisits[row.id],`Week 1: ${liftVisits(w)} strength visits; accepted scenario contract ${expectedVisits[row.id]}. Per-lift frequencies are separate mapping assumptions.`);
  add('complete-calendar',p.weeks.every(x=>x.feasible!==false&&!(x.unscheduled||[]).length),'Every native week must be feasible with no unplaced components.');
  add('partial-output-blocked',p.weeks.every(x=>!(x.unscheduled||[]).length||x.feasible===false),'Incomplete calendars must remain explicitly blocked, not exported as accepted programmes.');
  const minuteLimit=source.availability.visit_limits_minutes||source.availability.single_visit_limits_minutes;
  // A proof requires inclusive components, not run minutes or a generic feasibility flag.
  const unsupportedMinutes=(row.unsupported||[]).some(x=>/minute caps|strength duration|whole.visit/i.test(x));
  const proof=p.weeks.slice(0,4).every(x=>x.sessions.filter(s=>!s.eventDate).every(s=>{
   const budget=s.timeBudget,cap=minuteLimit[s.day.slice(0,3)];
   return budget?.includesWarmups===true&&budget?.includesRest===true&&budget?.includesTransitions===true&&Number.isFinite(budget.totalMinutes)&&Number.isFinite(cap)&&budget.totalMinutes<=cap;
  }));
  add('inclusive-visit-minute-contract',!unsupportedMinutes&&proof,'Source minute caps require auditable inclusive session budgets; no run-only estimate or unsupported mapping is a pass.');
  if(row.id==='C'){
   const after=p.weeks.filter(x=>x.week>=8&&!/Taper|Competition/.test(x.phase));
   const handedOver=after.length>0&&after.every(x=>trainingRuns(x).length===2&&trainingRuns(x).every(r=>r.role==='easy-run')&&['strength','Strength','Squat','Bench','Deadlift','powerlifting'].includes(x.priority));
   add('dated-priority-handover',handedOver,'After 5K recovery: explicit per-week strength priority and two easy runs required; constant horizon settings are not a handover.');
  }
  if(row.id==='D')add('fatigue-evidence-response',row.diagnostic?.historyVersusNoHistoryFirstWeekIdentical===false||['fatigue','recovery-review'].includes(row.review?.status),'Fatigue history must affect initial proposal or produce a recovery-specific review; generic observe is insufficient.');
  if(row.id==='E'){
   const quality=runs.filter(r=>r.role==='quality-run');
   add('current-fitness-pace-guard',row.diagnostic?.targetVersusNoTargetFirstWeekPrescriptionsIdentical===true&&quality.length>0&&quality.every(r=>r.paceBasis?.goalSupported===false)&&w.warnings.some(x=>/Goal pace is faster/.test(x)),'Unsupported 1:45 aspiration must be flagged while actual pace/steps/dose remain based on current fitness. Goal metadata may legitimately differ.');
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
   add('event-time-window',!Number.isFinite(cap)||duration<=cap||permission,`Event ${event.eventDate}: native upper duration ${duration} min, ordinary window ${cap??'unknown'} min; extension requires explicit confirmation.`);
  }
  return {id:row.id,name:row.name,status:gates.every(g=>g.status==='pass')?'pass':'blocked',gates};
 });
 return {schema:'lhrf-five-scenario-coaching-gates-v1',synthetic:true,provenance:report.provenance,scope:'Independent acceptance checks of actual native outputs; not physiological efficacy or deployed browser certification.',summary:{cases:cases.length,passed:cases.filter(c=>c.status==='pass').length,blocked:cases.filter(c=>c.status==='blocked').length,gates:cases.reduce((n,c)=>n+c.gates.length,0),blockedGates:cases.reduce((n,c)=>n+c.gates.filter(g=>g.status==='blocked').length,0)},cases};
}
if(require.main===module){
 const result=audit(run()),out=path.join(__dirname,'../docs/qa/five-scenario-engine-baseline/coaching-gates.json');
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({output:out,...result.summary},null,2));process.exitCode=result.summary.blocked?1:0;
}
module.exports={audit};
