/* Input/output adapters only. All programme and feedback decisions come from coach-engine.js. */
(function(root){
'use strict';
const coach=typeof module==='object'&&module.exports?require('./coach-engine.js'):root.LHRFCoach;
const names={bench:'Bench',squat:'Squat',deadlift:'Deadlift'};
const clone=x=>JSON.parse(JSON.stringify(x));
function normalizeProfile(input={}){
 if(input.liftProfiles&&input.runProfile)return clone(input);
 const base=coach.createEngine(),maxes=input.maxes||{},seconds=base.pbSeconds(input.tenKTime||'');
 const c={...clone(input),event:input.event||(input.strengthTargetDate?'powerlifting':input.runningTargetDate?'running':'hybrid'),
  weeks:Number(input.weeks)||12,priority:names[String(input.priority).toLowerCase()]||input.priority||'Balanced',
  squat:Number(input.squat)||0,bench:Number(input.bench)||0,deadlift:Number(input.deadlift)||0,runs:Number(input.runs)||0,
  days:input.days||input.availableDays?.length||5,noDate:!input.strengthTargetDate&&!input.runningTargetDate,
  date:input.strengthTargetDate||input.runningTargetDate||'',runGoal:input.runGoal||'fitness',
  liftProfiles:{},baselines:{},variations:input.variations||{},
  runProfile:{distance:10,seconds,time:input.tenKTime||'',recency:'recent',weeklyKm:0}};
 for(const [key,label] of Object.entries(names)){const kg=Number(maxes[key])||0;c.liftProfiles[label]={kg,reps:1,recency:'recent'};c.baselines[label]=kg}
 const pace=base.runningPaces(c);
 if(pace&&Number(input.runningBaselineMinutes)>0)c.runProfile.weeklyKm=Number(input.runningBaselineMinutes)*60/pace.easyLow;
 const fixed=input.fixedSessions||[];
 const long=fixed.find(s=>s.kind==='run'&&s.runType==='long');if(long)c.longRunDay=long.day;
 // A complete fixed split is represented by the live engine's existing manual-split contract.
 if(fixed.length===c.bench+c.squat+c.deadlift+c.runs){
  c.manualSplit={};
  for(const f of fixed){const day=String(f.day).slice(0,3),items=c.manualSplit[day]||(c.manualSplit[day]=[]);
   const item=f.kind==='run'?(f.runType==='long'?'long':'run'):f.lift==='bench'?'bench':'lower';
   if(!items.includes(item))items.push(item);
  }
  c.doubleDays=Object.entries(c.manualSplit).filter(([,v])=>v.some(x=>x==='bench'||x==='lower')&&v.some(x=>x==='run'||x==='long')).map(([d])=>d);
 }
 return c;
}
function createProfileEngine(input,options={}){
 const c=normalizeProfile(input),data={sets:[],runs:[],checkins:[],sessionFeedback:[],decisions:[],overrides:{},...clone(options.data||{}),customRoadmap:c};
 return {config:c,data,engine:coach.createEngine({data,schedule:options.schedule||data.activeSchedule||[],now:options.now})};
}
function buildProgramme(input,options={}){
 const {config:c,data,engine}=createProfileEngine(input,options),weeks=[];
 for(let week=1;week<=c.weeks;week++){
  const described=engine.describeWeek(c,week),{sessions,phase}=described,cycle=engine.cycleWeek(week,c.weeks);
  const constraints=engine.customPlan(c),warnings=constraints.warnings.slice();
  weeks.push({week,phase,deload:cycle.deload,sessions,warnings,reviewRequired:warnings.length>0});
 }
 return {schema:'lhrf-shared-programme-v1',config:c,framework:engine.selectTrainingFramework(c),weeks,
  requiresAthleteApproval:true,limitations:['Current live coaching rules, not a new programme-policy rollout.','Known programme acceptance gaps remain; generation alone does not establish coaching quality.']};
}
function previewProgramme(input,options={}){
 const native=buildProgramme(input,options),issues=[];
 const phaseName=(phase,deload)=>deload?'recovery':({'Foundation':'foundation','Development':'development','Specificity':'intensification','Taper / event':'realisation'}[phase]||'event');
 const weeks=native.weeks.map(w=>{
  const strengths=[],runs=[],calendar=[];const exposures={};
  for(const session of w.sessions){
   if(session.eventDate){calendar.push({id:session.id,kind:'event',sport:session.eventType,date:session.eventDate,day:session.day});continue}
   (session.ex||[]).forEach((ex,i)=>{
    const meta=ex[5]||{};if(!['top','straight'].includes(meta.role)||meta.optional)return;
    const lift=Object.keys(names).find(k=>String(ex[0]).toLowerCase().includes(k));if(!lift)return;
    const back=meta.role==='top'?session.ex.find(e=>e[5]?.role==='backoff'&&e[5]?.topIndex===i):ex;
    const group=(e,role)=>e?{role,sets:e[1],reps:e[2],suggestedWeight:e[3]||null,rpe:e[4]}:null;
    const index=strengths.length,exposure=exposures[lift]=(exposures[lift]||0)+1;
    strengths.push({lift,exposure,exercise:ex[0],top:meta.role==='top'?group(ex,'top'):null,backoff:group(back,'backoff')});
    calendar.push({id:'s'+index,kind:'strength',lift,exposure,exercise:ex[0],day:session.day});
   });
   for(const run of session.runs||[]){const type=run.role==='quality-run'?'quality':run.role==='long-run'?'long':'easy';
    const index=runs.length;runs.push({...run,type,effort:'RPE '+run.rpe,pace:run.pace&&!String(run.pace).startsWith('RPE')?{label:run.pace}:null});
    calendar.push({id:'r'+index,kind:'run',runType:type,day:session.day});
   }
  }
  w.warnings.forEach(detail=>issues.push({week:w.week,detail}));
  return {...w,phase:phaseName(w.phase,w.deload),strengths,runs,calendar:{sessions:calendar,warnings:w.warnings},objective:'Shared coaching engine · '+w.phase};
 });
 return {...native,weeks,issues,outcome:{description:native.framework.rationale},passesStructuralChecks:false,nativeWeeks:native.weeks};
}
function previewLogState(logs,input,week=1){
 const c=normalizeProfile(input),data={sets:[],runs:[],checkins:[],sessionFeedback:[],decisions:[],overrides:{},customRoadmap:c,activeCustomWeek:week};
 for(const entry of logs||[]){
  if(entry.kind==='run'){data.runs.push({date:entry.date,km:entry.km||entry.distanceKm||0,min:entry.minutes,rpe:entry.rpe,type:entry.plannedSession?.planned?.type||'run'});continue}
  const exercise=names[entry.kind];if(!exercise)continue;
  const planned=(entry.plannedSession?.planned?.sets||[]).flatMap(g=>Array.from({length:g.sets||1},()=>g));
  (entry.sets||[]).forEach((set,i)=>{
   const target=planned[i]||planned.find(s=>s.role===set.role)||planned[0];
   if(!target)return;
   const comparable=Number(set.reps)===Number(target.reps)&&Math.abs(Number(set.weight)-Number(target.weight))<=2.5;
   data.sets.push({date:entry.date,exercise,weight:Number(set.weight),reps:Number(set.reps),rpe:Number(set.rpe),target:Number(target.rpe),role:comparable?(set.role||target.role):'unmatched',session:entry.plannedSession?.day||'',week:entry.plannedSession?.week});
  });
  const f=entry.postWorkout||entry.recovery||entry.feedback;
  if(f&&typeof f==='object')data.sessionFeedback.push({date:entry.date,difficulty:f.difficulty,energy:f.energy,discomfort:f.discomfort==='yes'||f.pain===true||f.injury===true?'yes':'no'});
 }
 return data;
}
function reviewPreviewLogs(logs,input,options={}){
 const week=options.week||logs?.at(-1)?.plannedSession?.week||1;
 const data=previewLogState(logs,input,week);
 const initial=coach.createEngine({data,now:options.now});data.activeSchedule=initial.generatedSessions(data.customRoadmap,week);
 const engine=coach.createEngine({data,schedule:data.activeSchedule,now:options.now}),decision=engine.reviewDecision();
 return {decision,data,proposals:decision.changes?[{lift:(decision.changes[0]?.exercise||data.customRoadmap.priority).toLowerCase().replace(' press',''),direction:decision.status==='progress'?'easy':'hard',date:String(data.sets.at(-1)?.date||'').slice(0,10),message:decision.summary,evidence:decision.details||decision.why||'',cautions:decision.why?[decision.why]:[],blockLoad:decision.status!=='progress',sharedDecision:decision,
  loadSuggestion:decision.status==='progress'?(()=>{const change=decision.changes[0],ex=data.activeSchedule.find(s=>s.id===change.id)?.ex?.find(e=>e[0]===change.exercise&&e[5]?.role==='top');if(!ex)return undefined;return {current:ex[3],next:Math.round(ex[3]*change.loadFactor/2.5)*2.5,description:decision.why}})():undefined}]:[]};
}
const api={normalizeProfile,createProfileEngine,buildProgramme,previewProgramme,previewLogState,reviewPreviewLogs};
if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFCoachAdapters=api;
})(typeof globalThis!=='undefined'?globalThis:this);
