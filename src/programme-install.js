/* Explicit approved-programme activation. No athlete logs are removed. */
(function(root){
'use strict';
function install(state,config,engineModule,now=new Date().toISOString()){
 if(!config?.programmeId||!config.sessionNamespace||!config.startDate||config.weeks!==5)throw Error('Invalid approved programme.');
 const next=JSON.parse(JSON.stringify(state));if(next.customRoadmap?.programmeId===config.programmeId)return next;
 const archive={programme:next.customRoadmap||null,schedule:next.activeSchedule||[],week:next.activeCustomWeek||1,overrides:next.overrides||{},decisions:next.decisions||[],archivedAt:now};
 next.programmeArchive=[...(next.programmeArchive||[]),archive];
 next.customRoadmap={...JSON.parse(JSON.stringify(config)),approvedAt:now};next.activeCustomWeek=1;next.overrides={};next.decisions=[];
 next.activeSchedule=engineModule.createEngine({data:next}).generatedSessions(next.customRoadmap,1);next.onboardingComplete=true;
 return next;
}
// Repair only future, unfinished running prescriptions; never rebuild lifting or history.
function refreshRunningGuidance(state,engineModule,now=new Date().toISOString(),liveWorkout=false){
 const c=state.customRoadmap;
 if(liveWorkout||!c||c.runTemplate!=='easy-one-quality-10k'||Number(c.runningGuidanceVersion)>=2)return state;
 const next=JSON.parse(JSON.stringify(state)),week=Number(state.activeCustomWeek)||1;
 next.customRoadmap.runningGuidanceVersion=2;
 const fresh=engineModule.createEngine({data:next}).generatedSessions(next.customRoadmap,week);
 const days={mon:0,tue:1,wed:2,thu:3,fri:4,sat:5,sun:6};
 const today=new Date(now);today.setHours(0,0,0,0);
 const monday=new Date(c.startDate+'T12:00:00');monday.setDate(monday.getDate()-(monday.getDay()+6)%7+(week-1)*7);
 const previous=[];
 next.activeSchedule=(next.activeSchedule||[]).map(session=>{
  const offset=days[String(session.day).slice(0,3).toLowerCase()];
  if(offset===undefined)return session;
  const date=new Date(monday);date.setDate(date.getDate()+offset);
  if(!Number.isFinite(+date)||date<today||(next.completedWorkouts||[]).some(x=>x.id===session.id&&Number(x.week||1)===week))return session;
  const replacement=fresh.find(x=>x.id===session.id);
  if(!replacement||!(session.runs||[]).length)return session;
  previous.push({id:session.id,runs:session.runs});return {...session,runs:replacement.runs};
 });
 next.runningGuidanceArchive=[...(next.runningGuidanceArchive||[]),{version:1,week,updatedAt:now,sessions:previous}];
 return next;
}
// User-authorised 26 Oct review: only this installed block's future threshold paces.
function refreshApprovedThresholdPaces(state,engineModule,now=new Date().toISOString()){
 const c=state.customRoadmap,engine=engineModule.createEngine({data:state});
 if(c?.programmeId!=='november-2026'||Number(c.runningPaceVersion)>=2||!engine.repaceThresholdRun)return state;
 const next=JSON.parse(JSON.stringify(state)),week=Number(state.activeCustomWeek)||1;
 next.customRoadmap.runningPaceVersion=2;next.customRoadmap.runningGoalSeconds=3600;
 const previous=[],monday=new Date(c.startDate+'T12:00:00');monday.setDate(monday.getDate()-(monday.getDay()+6)%7+(week-1)*7);
 const today=String(now).slice(0,10),days={mon:0,tue:1,wed:2,thu:3,fri:4,sat:5,sun:6};
 next.activeSchedule=(next.activeSchedule||[]).map(session=>{
  const offset=days[String(session.day).slice(0,3).toLowerCase()],date=new Date(monday);if(offset===undefined)return session;date.setDate(date.getDate()+offset);
  if(date.toISOString().slice(0,10)<today||(next.completedWorkouts||[]).some(x=>x.id===session.id&&Number(x.week||1)===week))return session;
  const runs=(session.runs||[]).map(run=>engine.repaceThresholdRun(run,next.customRoadmap));
  if(JSON.stringify(runs)===JSON.stringify(session.runs||[]))return session;
  previous.push({id:session.id,runs:session.runs});return {...session,runs};
 });
 next.runningPaceArchive=[...(next.runningPaceArchive||[]),{version:1,week,updatedAt:now,approval:'User requested investigation, correction and publication on 26 October 2026',sessions:previous}];
 return next;
}
const api={install,refreshRunningGuidance,refreshApprovedThresholdPaces};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFProgrammeInstall=api;
})(typeof globalThis!=='undefined'?globalThis:this);
