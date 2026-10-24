/* LHRF v2: preview-only end-to-end planning pipeline. No app state mutations. */
(function(root){
'use strict';
function dependencies(){
 if(typeof module==='object'&&module.exports)return {
  plan:require('./coaching-v2.js'),prescribe:require('./prescriptions-v2.js'),
  hybrid:require('./hybrid-v2.js'),schedule:require('./scheduler-v2.js')
 };
 return {plan:root.LHRFCoachingV2,prescribe:root.LHRFPrescriptionsV2,hybrid:root.LHRFHybridV2,schedule:root.LHRFSchedulerV2};
}
function buildProgramme(input){
 const c={...(input||{})},d=dependencies();
 for(const [key,api] of Object.entries(d))if(!api)throw Error('Missing v2 dependency: '+key);
 const outline=d.plan.buildPlan(c),weeks=[],issues=[];
 for(const phase of outline.phases){
  const prescribed=d.prescribe.prescribeWeek(c,phase);
  const coordinated=d.hybrid.coordinateWeek(c,prescribed);
  const calendar=d.schedule.scheduleWeek(c,coordinated);
  const week={...coordinated,objective:phase.objective,deload:phase.deload,
   calendar,reviewRequired:coordinated.hybrid.approvalRequired||calendar.requiresReview||calendar.unscheduled>0};
  weeks.push(week);
  if(calendar.unscheduled)issues.push({week:phase.week,type:'unscheduled',detail:calendar.unscheduled+' sessions could not be placed'});
  for(const warning of calendar.warnings)issues.push({week:phase.week,type:'recovery-conflict',detail:warning});
  for(const change of coordinated.hybrid.changes)issues.push({week:phase.week,type:'approval-proposal',detail:change.reason});
 }
 const terminal=weeks[weeks.length-1];
 const outcomeOk=outline.outcome.kind==='optional-assessment'
  ?terminal.phase==='assessment'&&terminal.strengths.every(s=>s.assessmentOptional)
  :outline.outcome.kind==='event'?terminal.phase==='event':outline.outcome.kind==='review';
 const checks={
  outcomeDefined:!!outline.outcome.description,
  finalWeekAligned:outcomeOk,
  allSessionsScheduled:weeks.every(w=>w.calendar.unscheduled===0),
  workloadBudgetRespected:weeks.every(w=>w.strengths.every(s=>s.totalStress<=s.stressBudget+0.001)),
  chartsUsePlanPhases:weeks.every((w,i)=>w.phase===outline.phases[i].phase),
  approvalsExplicit:weeks.every(w=>!w.hybrid.changes.length||w.hybrid.approvalRequired),
  noUnmotivatedCompetitionTaper:!!(c.strengthTargetDate||c.runningTargetDate)||weeks.every(w=>w.phase!=='event')
 };
 return {schema:'lhrf-v2-programme-preview',framework:outline.framework,outcome:outline.outcome,
  weeks,issues,checks,passesStructuralChecks:Object.values(checks).every(Boolean),
  limitations:['Prototype only; not wired into live application.',
   'Event dates are not yet mapped to exact calendar weeks; event phase assumes final week.',
   'Running paces, session-day ordering, athlete recovery and training efficacy are not validated.',
   'Stress budget is a coarse heuristic and does not prove injury risk or coaching quality.']};
}
const api={buildProgramme};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFProgrammeV2=api;
})(typeof globalThis!=='undefined'?globalThis:this);
