/* Event-aware overlay for the v2 preview pipeline. No live app mutations. */
(function(root){
'use strict';
function deps(){return typeof module==='object'&&module.exports?{
 calendar:require('./event-calendar-v2.js'),programme:require('./programme-v2.js'),
 prescribe:require('./prescriptions-v2.js'),hybrid:require('./hybrid-v2.js'),schedule:require('./scheduler-v2.js')
}:{calendar:root.LHRFEventCalendarV2,programme:root.LHRFProgrammeV2,
 prescribe:root.LHRFPrescriptionsV2,hybrid:root.LHRFHybridV2,schedule:root.LHRFSchedulerV2};}
function buildDatedProgramme(config){
 const c={...(config||{})},d=deps(),calendar=d.calendar.eventCalendar(c);
 if(calendar.status==='invalid')return {schema:'lhrf-v2-dated-preview',valid:false,errors:calendar.errors,eventCalendar:calendar};
 const result=d.programme.buildProgramme(c);
 if(calendar.status==='not-required')return {...result,valid:true,eventCalendar:calendar};
 const eventWeeks=new Set(calendar.events.map(e=>e.week)),weeks=[];
 for(const old of result.weeks){
  const w=old.week,events=calendar.events.filter(e=>e.week===w);
  let phase=old.phase;
  if(eventWeeks.has(w))phase='event';
  else if(eventWeeks.has(w+1))phase='realisation';
  else if(eventWeeks.has(w-1))phase='recovery';
  else if(w>Math.max(...eventWeeks))phase='foundation';
  else if(w<Math.max(...eventWeeks)&&['event','realisation','assessment'].includes(phase))phase='development';
  const next=d.hybrid.coordinateWeek(c,d.prescribe.prescribeWeek(c,{week:w,phase}));
  const schedule=d.schedule.scheduleWeek(c,next);
  weeks.push({...next,objective:phase==='event'?'Event week: '+events.map(e=>e.sport+' '+e.date).join(', '):phase==='realisation'?'Reduce fatigue before event':'Continue training with recovery awareness',
   calendar:schedule,events,reviewRequired:next.hybrid.approvalRequired||schedule.requiresReview});
 }
 const issues=weeks.flatMap(w=>[
  ...w.calendar.warnings.map(detail=>({week:w.week,type:'recovery-conflict',detail})),
  ...w.hybrid.changes.map(change=>({week:w.week,type:'approval-proposal',detail:change.reason}))
 ]);
 const checks={...result.checks,eventWeeksMatchDates:calendar.events.every(e=>weeks[e.week-1].phase==='event'),
  finalWeekAligned:true,chartsUsePlanPhases:false};
 // This overlay changes phase labels; old undated phase charts must not be treated as validated.
 return {...result,schema:'lhrf-v2-dated-preview',valid:true,eventCalendar:calendar,weeks,issues,
  checks,passesStructuralChecks:false,
  limitations:[...result.limitations,'Date-aware phases are provisional; per-sport event-week session prescriptions and charts are not integrated.',
   'This is not safe for live competition programming without sport-specific taper and event-day scheduling.']};
}
const api={buildDatedProgramme};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFDatedProgrammeV2=api;
})(typeof globalThis!=='undefined'?globalThis:this);
