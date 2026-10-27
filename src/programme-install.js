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
 return refreshApprovedRunningProgramme(next,engineModule,now);
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
// Explicit 27 October approval: refresh this athlete's running only, preserving every log.
function refreshApprovedRunningProgramme(state,engineModule,now=new Date().toISOString(),liveWorkout=null){
 const c=state.customRoadmap,revision='2026-10-27-running-v3';
 if(c?.programmeId!=='november-2026'||c.approvedRunningRevision===revision||String(now).slice(0,10)<'2026-10-27')return state;
 const next=JSON.parse(JSON.stringify(state)),week=Number(state.activeCustomWeek)||1;
 const previousConfig=JSON.parse(JSON.stringify(c));
 next.customRoadmap={...next.customRoadmap,runningWorkoutVersion:1,runningPaceVersion:2,runningGoalSeconds:3600,approvedRunningRevision:revision,
  runProfile:{...c.runProfile,distance:5,seconds:1700,time:'28:20',recency:'recent',resultDate:null,effort:'performance',environment:'outdoor',reportedRecency:'Within the last month',confirmedAt:now}};
 const fresh=engineModule.createEngine({data:next,now:()=>Date.parse(now)}).generatedSessions(next.customRoadmap,week);
 const monday=new Date(c.startDate+'T12:00:00Z');monday.setUTCDate(monday.getUTCDate()-(monday.getUTCDay()+6)%7+(week-1)*7);
 const today=new Date(now).toLocaleDateString('en-CA',{timeZone:'Europe/London'}),days={mon:0,tue:1,wed:2,thu:3,fri:4,sat:5,sun:6},previous=[];
 next.activeSchedule=(state.activeSchedule||[]).map(session=>{
  if(!(session.runs||[]).length)return session;
  const offset=days[String(session.day).slice(0,3).toLowerCase()];if(offset===undefined)return session;
  const date=new Date(monday);date.setUTCDate(date.getUTCDate()+offset);if(date.toISOString().slice(0,10)<today)return session;
  const sameWeek=x=>Number(x.week||1)===week;
  const matches=id=>id===session.id||id===session.id+'::run';
  const complete=(state.completedWorkouts||[]).some(x=>sameWeek(x)&&matches(x.id))||(state.runs||[]).some(x=>sameWeek(x)&&matches(x.sessionId));
  const active=liveWorkout&&(liveWorkout.week==null||sameWeek(liveWorkout))&&(matches(liveWorkout.id)||liveWorkout.parentId===session.id||liveWorkout.id===session.id+'::strength');
  if(complete||active)return session;
  const replacement=fresh.find(x=>x.id===session.id);if(!replacement)return session;
  previous.push({id:session.id,runs:session.runs,name:session.name});
  let name=session.name;for(let i=0;i<session.runs.length;i++)if(replacement.runs[i])name=name.replace(session.runs[i].name,replacement.runs[i].name);
  return {...session,name,runs:replacement.runs};
 });
 next.runningProgrammeArchive=[...(next.runningProgrammeArchive||[]),{revision,approvedAt:now,approval:'User explicitly requested redoing the approved programme while preserving logs on 27 October 2026',programme:previousConfig,week,sessions:previous}];
 return next;
}
const api={install,refreshRunningGuidance,refreshApprovedThresholdPaces,refreshApprovedRunningProgramme};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFProgrammeInstall=api;
})(typeof globalThis!=='undefined'?globalThis:this);
