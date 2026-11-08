/* Version 2 running preparation. Pure, offline and deterministic.
 * Progression rates and review gates are explicit product policies, not injury
 * thresholds or validated forecasts. Saved programmes do not opt in implicitly. */
(function(root){
'use strict';
const library=typeof module==='object'&&module.exports?require('./running-workouts.js'):root.LHRFRunningWorkouts;
const evidence=typeof module==='object'&&module.exports?require('./coaching-evidence.js'):root.LHRFCoachingEvidence;
const DAY=86400000,WEEK=7*DAY,clone=x=>JSON.parse(JSON.stringify(x));
const round=x=>Math.max(0,Math.round(x*20)/20),sum=x=>x.reduce((a,b)=>a+b,0);
const median=x=>{const s=x.slice().sort((a,b)=>a-b);return s.length?s[Math.floor(s.length/2)]:null};
const stamp=x=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(x||''))return NaN;const n=Date.parse(x+'T12:00:00Z');return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===x?n:NaN};
const monday=x=>{const d=new Date(x);return x-((d.getUTCDay()+6)%7)*DAY};
const text=x=>{const n=Math.round(x);return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')+'/km'};
const range=(a,b=a)=>text(a)+' to '+text(b);
const work=s=>s.role==='work';
const easyType=r=>!/quality|interval|threshold|tempo|race|long/i.test(r.type||r.role||'');
const normalEasyOuting=r=>r.minutes>0&&easyType(r)&&!r.reducedDose&&confirmedEasyEffort(r);
const usefulRun=r=>r.completed!==false&&!r.failed&&!r.warmup&&!r.unreliable&&!['failed','aborted','unreliable'].includes(r.status);
const easyFeedback=f=>f?.discomfort==='no'&&['good','okay'].includes(f.energy)&&['expected','easier'].includes(f.difficulty);
const adverseFeedback=f=>f?.discomfort==='yes'||f?.energy==='low'||f?.difficulty==='harder';
const easyPrescription=r=>['easy-run','long-run'].includes(r?.role)&&!r.steps?.some(work);
const activityKey=(id,date)=>JSON.stringify([id,date]);
function workoutFeedback(rows,done,now){
 const completed=Date.parse(done.date);
 return rows.filter(f=>f.sessionId===done.id&&Number(f.week)===Number(done.week)&&
  typeof f.date==='string'&&f.date.slice(0,10)===done.date.slice(0,10)&&Date.parse(f.date)>=completed&&Date.parse(f.date)<=now)
  .sort((a,b)=>Date.parse(b.date)-Date.parse(a.date))[0];
}
const confirmedEasyEffort=r=>r.rpe==null?r.easyEffortConfirmed===true&&!r.uncertainty:r.effortReliable!==false&&r.rpe<=4;
// Capture observations at the explicit proposal boundary. A partial device/log
// extract is not a completed-week capacity estimate, and missing runs are not rest.
function prepareEvidence(c,options={}){
 const now=typeof options.now==='function'?Number(options.now()):Number(options.now)||Date.now(),today=new Date(now).toISOString().slice(0,10),at=monday(Date.parse(today+'T00:00:00Z')),groups=new Map(),rejected=[];
 const rawRuns=options.data?.runs||[],nativeKey=row=>{
  const day=evidence.date(row.date);
  return row.sessionId&&day?JSON.stringify([row.sessionId,day]):null;
 };
 const linkedSources=new Map();
 if(c.integratedCoachingVersion===1)for(const row of rawRuns){
  const key=nativeKey(row),source=row.sourceActivityId||row.garminActivityId;
  if(key&&source&&!linkedSources.has(key))linkedSources.set(key,source);
 }
 const completions=(options.data?.completedWorkouts||[]).filter(done=>done.completedRun===true&&done.prescription?.runs?.length===1&&easyPrescription(done.prescription.runs[0]));
 const easyCompletions=new Set(completions.map(done=>activityKey(done.id,done.date?.slice(0,10))));
 const nativeEasy=c.runningDosePolicyVersion===1?new Map(completions.filter(done=>done.id&&Number.isFinite(Date.parse(done.date))&&Date.parse(done.date)<=now)
  .map(done=>[activityKey(done.id,done.date),done])):null;
 const nextDayReports=c.runningDosePolicyVersion===1?[...(c.recoveryObservations||[]),...(c.recoveryEvidence?.observations||[])]:[];
 const validDate=value=>{
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)||!Number.isFinite(stamp(value.slice(0,10))))return NaN;
  return value.length===10?Date.parse(value+'T00:00:00Z'):Date.parse(value);
 };
 for(const row of rawRuns){
  const when=validDate(row.date),km=Number(row.km??row.distanceKm),minutes=row.min??row.minutes,rpe=row.rpe;
  const reason=!Number.isFinite(when)||when>now?'invalid-or-future-date':!usefulRun(row)?'unsuitable-completion':!(km>0)||!Number.isFinite(km)||minutes!=null&&(!(Number(minutes)>0)||!Number.isFinite(Number(minutes)))||rpe!=null&&(!(Number(rpe)>=1&&Number(rpe)<=10))?'invalid-dose-or-effort':null;
  if(reason){rejected.push({date:row.date??null,reason});continue}
  const linkedEasy=minutes!=null&&row.sessionId&&easyCompletions.has(activityKey(row.sessionId,row.date.slice(0,10)));
  const done=nativeEasy?.get(activityKey(row.sessionId,row.date)),planned=done?.prescription.runs[0];
  const feedback=done&&workoutFeedback(options.data?.sessionFeedback||[],done,now);
  const day=row.date.slice(0,10);
  const nextDayEasy=nextDayReports.some(report=>{
   const observed=(report.observedAt||report.reportedAt||report.date||'').slice(0,10);
   return report.sport==='running'&&report.task==='easy'&&report.status==='normal'&&
    ['normal','no-worsening'].includes(report.nextDayResponse)&&report.referencePerformanceDate===day&&
    stamp(observed)-stamp(day)===DAY&&Date.parse(observed)<=now;
  });
  const ordinaryEasy=planned?.role==='easy-run'&&easyType(row);
  const familiarLong=c.integratedCoachingVersion===1&&planned?.role==='long-run'&&!/quality|interval|threshold|tempo|race/i.test(row.type||row.role||'');
  const compatible=done&&minutes!=null&&(ordinaryEasy||familiarLong)&&row.rpeReliable!==false&&row.effortReliable!==false&&!row.approximateRpe&&!row.evidenceReview?.rpe?.approximate;
  const withinPlan=planned&&(planned.distanceKnown!==false&&planned.distanceKm>0
   ?km<=planned.distanceKm:planned.minutes>0&&minutes<=planned.minutes);
  const easyEffortConfirmed=compatible&&!adverseFeedback(feedback)&&(nextDayEasy||withinPlan&&easyFeedback(feedback));
  const reduced=planned?.aerobicDose!=='normal'&&!!planned?.aerobicDose||!!done?.timeAdaptation||!!planned?.capacityLimited;
  const verifiedFrequencyTrial=c.integratedCoachingVersion===1&&planned?.frequencyTrial===true&&withinPlan&&
   Math.abs(km-planned.distanceKm)<=.01+1e-8&&easyEffortConfirmed&&!done.timeAdaptation&&!planned.capacityLimited&&
   !evidence.symptomObservation(row)&&!evidence.symptomObservation(feedback)&&(rpe==null||evidence.reliableEffort(row)&&Number(rpe)<=4);
  const item={date:row.date,type:row.type||row.role||'',km,minutes:minutes==null?null:Number(minutes),rpe:rpe==null?null:Number(rpe),
   effortReliable:row.rpeReliable!==false&&!row.approximateRpe&&!row.evidenceReview?.rpe?.approximate,sourceActivityId:row.sourceActivityId||row.garminActivityId||null,
   ...(linkedEasy?{plannedEasy:true}:{}),...(easyEffortConfirmed?{easyEffortConfirmed:true}:{}),...(reduced?{reducedDose:true}:{}),
   ...(verifiedFrequencyTrial?{verifiedFrequencyTrial:true}:{}),
   ...(c.integratedCoachingVersion===1&&(adverseFeedback(feedback)||evidence.symptomObservation(row)||evidence.symptomObservation(feedback))?{adverseResponse:true}:{})};
  const native=c.integratedCoachingVersion===1?nativeKey(row):null;
  const source=linkedSources.get(native)||item.sourceActivityId;
  const key=source?'activity:'+source:native||JSON.stringify([row.date,km,item.minutes]);
  const group=groups.get(key)||[];group.push(item);groups.set(key,group);
 }
 const rows=[];
 for(const group of groups.values()){
  const unique=key=>[...new Set(group.map(x=>x[key]).filter(x=>x!==null))],days=new Set(group.map(x=>x.date.slice(0,10))),kms=unique('km'),minutes=unique('minutes'),efforts=unique('rpe');
  if(days.size>1||kms.length>1||minutes.length>1){rejected.push({date:group[0].date,reason:'conflicting-linked-activity'});continue}
  const merged={...group[0],minutes:minutes[0]??null,rpe:efforts.length===1?efforts[0]:null,effortReliable:efforts.length===1&&group.every(x=>x.effortReliable),...(group.length>1?{sourceObservations:group}:{}),...(efforts.length>1?{uncertainty:'Conflicting effort reports; distance is retained, effort is unsuitable for progression.'}:{})};
  if(group.some(x=>x.adverseResponse))merged.adverseResponse=true;
  if(!group.every(x=>x.plannedEasy))delete merged.plannedEasy;
  if(!group.every(x=>x.easyEffortConfirmed)||efforts.length>1)delete merged.easyEffortConfirmed;
  if(!group.every(x=>x.verifiedFrequencyTrial)||efforts.length>1)delete merged.verifiedFrequencyTrial;
  rows.push(merged);
 }
 rows.sort((a,b)=>a.date.localeCompare(b.date));
 const lastWeek=rows.filter(r=>validDate(r.date)>=at-WEEK&&validDate(r.date)<at),currentWeek=rows.filter(r=>validDate(r.date)>=at);
 return {version:1,asOf:today,validActivityCount:rows.length,rejected,recentActivities:rows.filter(r=>validDate(r.date)>=now-42*DAY),latestCompletedCalendarWeek:{from:new Date(at-WEEK).toISOString().slice(0,10),to:new Date(at-DAY).toISOString().slice(0,10),observedKm:Number(sum(lastWeek.map(r=>r.km)).toFixed(3)),activities:lastWeek},currentCalendarWeek:{observedKm:Number(sum(currentWeek.map(r=>r.km)).toFixed(3)),activities:currentWeek},coverage:'Partial logs are observations only; completeness and habitual capacity are not inferred.',progressionUse:'Future increases are conditional proposals. Confirm completed dose, adherence and recovery at review; a week number is not evidence of adaptation.'};
}
function history(c){
 const h=c.runningHistory||{},p=c.runProfile||{};
 const weeks=(h.weeklyKm||p.weeklyKmHistory||[]).filter(x=>Number.isFinite(x)&&x>=0);
 const long=h.longRun||p.recentLongRun||{};
 const current=Number(p.weeklyKm)>0?Number(p.weeklyKm):weeks.at(-1)||0;
 // A recent spike is not a reason to prescribe another spike. Retain source data.
 const typical=weeks.length>=3?median(weeks.slice(-3)):current;
 if(c.coachingRefinementVersion!==1)return {weeks,current,base:current?Math.min(current,typical||current):0,long,recentMarathonDate:h.recentMarathonDate||p.recentMarathonDate||c.recentMarathonDate,recentRace:h.recentRace||p.recentRace||c.recentRace};
 const profileRace=Number(p.distance)>0&&Number(p.seconds)>0&&p.effort==='performance'&&Number.isFinite(stamp(p.resultDate))?{distanceKm:Number(p.distance),date:p.resultDate,source:'dated-performance-profile'}:null;
 const races=[h.recentRace,p.recentRace,c.recentRace,profileRace].filter(r=>r&&Number.isFinite(stamp(r.date))).sort((a,b)=>stamp(b.date)-stamp(a.date));
 const explicitMarathon=h.recentMarathonDate||p.recentMarathonDate||c.recentMarathonDate;
 const marathonDates=[explicitMarathon,...races.filter(r=>Number(r.distanceKm)>=40).map(r=>r.date)].filter(d=>Number.isFinite(stamp(d))).sort((a,b)=>stamp(b)-stamp(a));
 return {weeks,current,base:current?Math.min(current,typical||current):0,long,
  recentMarathonDate:explicitMarathon&&!Number.isFinite(stamp(explicitMarathon))?explicitMarathon:marathonDates[0],
  recentRace:races[0]||h.recentRace||p.recentRace||c.recentRace};
}
// Observed recovery is evidence, not a universal duration-based injury rule.
// A dated normal report may resolve a completed race; an old report can never
// clear a future event. Keep source observations intact for the review UI.
function recoveryContext(c,w=1,options={}){
 const h=history({...c,coachingRefinementVersion:1}),now=typeof options.now==='function'?options.now():Number(options.now)||Date.now(),start=stamp(c.startDate);
 const weekStart=Number.isFinite(stamp(options.atDate))?stamp(options.atDate):Number.isFinite(start)?monday(start)+(w-1)*WEEK:now+(w-1)*WEEK;
 const recentMarathon=stamp(h.recentMarathonDate),daysSinceMarathon=Number.isFinite(recentMarathon)?(weekStart-recentMarathon)/DAY:null;
 const report=h=>{const when=stamp(h?.reportedAt);return h&&Number.isFinite(when)&&when<=now&&when<=weekStart&&Number.isFinite(recentMarathon)&&when>recentMarathon;};
 const dedicated=c.runningHistory?.marathonRecovery,normal=c.recoveryContext;
 const marathonRecoveryResolved=!!(report(dedicated)&&dedicated.resolved===true||report(normal)&&normal.status==='normal');
 const longRecovery=Number(h.long.recoveryHours),longMinutes=Number(h.long.minutes),longKm=Number(h.long.km);
 const longRunRecoveryReview=Number.isFinite(longRecovery)&&longRecovery>48;
 const longRunDurationReview=Number.isFinite(longMinutes)&&longMinutes>210;
 if(Number(c.coachingRuntimeVersion)>=1){
  const reference=Math.max(weekStart,w===1&&Number.isFinite(start)?start:weekStart,Math.min(now,weekStart+6*DAY)),atDate=new Date(reference).toISOString().slice(0,10),runningTasks=Object.fromEntries(['easy','quality','long'].map(task=>[task,evidence.recovery(c,{atDate,now,sport:'running',task})]));
  return {weekStart,recentRace:h.recentRace,recentMarathonDate:h.recentMarathonDate,daysSinceMarathon,
   marathonRecoveryResolved:!!(runningTasks.easy.status==='normal'&&runningTasks.quality.status==='normal'&&runningTasks.long.status==='normal'),
   recoveringMarathon:!!runningTasks.easy.eventDate&&runningTasks.easy.restriction!=='none',runningTasks,
   longRunRecoveryReview,longRunDurationReview,observations:{longRunKm:longKm>0?longKm:null,longRunMinutes:longMinutes>0?longMinutes:null,longRunRecoveryHours:Number.isFinite(longRecovery)&&longRecovery>=0?longRecovery:null},
   policyNote:'Task-specific dated evidence governs return. A calendar window or normal lower-body lifting does not establish running readiness. Review provisional doses and next-day response.'};
 }
 return {weekStart,recentRace:h.recentRace,recentMarathonDate:h.recentMarathonDate,daysSinceMarathon,marathonRecoveryResolved,
  recoveringMarathon:daysSinceMarathon!==null&&daysSinceMarathon>=0&&daysSinceMarathon<21&&!marathonRecoveryResolved,
  longRunRecoveryReview,longRunDurationReview,
  observations:{longRunKm:longKm>0?longKm:null,longRunMinutes:longMinutes>0?longMinutes:null,longRunRecoveryHours:Number.isFinite(longRecovery)&&longRecovery>=0?longRecovery:null},
  policyNote:'Recovery intervals and review points are adjustable planning defaults. A reported duration is retained as evidence, not a validated injury threshold.'};
}
function paceSet(c,provided){
 if(provided?.valid!==false&&Number(provided?.race)>0)return provided;
 const p=c.runProfile||{};
 if(!(p.seconds>0&&p.distance>0)||p.effort==='training')return null;
 const tenK=p.seconds*Math.pow(10/p.distance,1.06),race=tenK/10;
 return {tenK,race,easyLow:race*1.18,easyHigh:race*1.4,threshold:3600/(10*Math.pow(3600/tenK,1/1.06)),valid:true};
}
function buildRun(name,role,steps,p,extra={}){
 const distanceKm=Number(sum(steps.map(s=>s.distanceKm)).toFixed(3));
 const bounds=step=>step.paceSeconds?{min:step.paceSeconds-5,max:step.paceSeconds+5}:{min:p?.easyLow,max:p?.easyHigh};
 const timed=p?steps.map(bounds):null;
 const duration=timed?{min:Math.ceil(sum(steps.map((s,i)=>s.distanceKm*timed[i].min/60))),max:Math.ceil(sum(steps.map((s,i)=>s.distanceKm*timed[i].max/60)))}:null;
 const hard=steps.filter(work);
 return {role,name,distanceKm,minutes:duration?.max??null,durationRangeMinutes:duration,rpe:hard.length?7:3.5,
  pace:hard.length?range(Math.min(...hard.map(s=>s.paceSeconds))-5,Math.max(...hard.map(s=>s.paceSeconds))+5):p?range(p.easyLow,p.easyHigh):'Conversational easy effort; confirm a recent race baseline',steps,
  workMinutes:Math.ceil(sum(hard.map(s=>s.distanceKm*s.paceSeconds/60))),
  structure:steps.map(s=>Math.round(s.distanceKm*1000)+' m '+s.label.toLowerCase()).join(' + '),
  reason:hard.length?'Practise current-fitness event rhythm within a predominantly easy week.':'Build aerobic support at conversational effort; adjust to conditions and recovery.',...extra};
}
function easyRun(km,p,role='easy-run'){
 return buildRun(role==='long-run'?'Long aerobic run':'Easy aerobic run',role,[{label:role==='long-run'?'Long easy run':'Easy run',role:'easy',distanceKm:round(km),pace:p?range(p.easyLow,p.easyHigh):'Conversational easy effort'}],p);
}
function timedEasyRun(minutes,conditionalAerobicBuild){
 const reason=conditionalAerobicBuild?minutes>conditionalAerobicBuild.startingMinutes?'This longer easy dose depends on recent comfortable runs and today’s recovery.':'Keep this dose conversational. Log the run and answer the quick feedback to support future increases.':'A time-based health dose does not require a race PB. Distance and pace remain unknown; record actual running to calibrate later.';
 return {role:'easy-run',name:'Timed easy health run',minutes,durationRangeMinutes:{min:minutes,max:minutes},distanceKm:0,distanceKnown:false,rpe:3,pace:'Conversational easy effort',steps:[{label:'Easy conversational run',role:'easy',minutes,distanceKm:0,pace:'Conversational easy effort'}],workMinutes:0,structure:minutes+' minutes easy conversational running or run/walk',reason,...(conditionalAerobicBuild?{conditionalAerobicBuild}:{})};
}
function easyRecoveryResponse(log,feedback){
 const rpe=evidence.reliableEffort(log)?Number(log.rpe):null;
 const relevant=row=>evidence.symptomApplies(evidence.symptomObservation(row), 'running','easy');
 const acute=feedback?.discomfort==='yes'||relevant(feedback)&&evidence.symptomConcern(feedback)||relevant(log)&&evidence.symptomConcern(log)||
  log?.completed===false||log?.failed||['failed','aborted'].includes(log?.status)||rpe>=7;
 return {acute,uncertain:!log||!usefulRun(log)||adverseFeedback(feedback)||relevant(feedback)||relevant(log)||
  rpe>4||log.rpe!=null&&rpe===null};
}
function runningSymptomReview(data,{now,task='easy'}){
 const hasConcern=[...(data.checkins||[]),...(data.recoveryObservations||[]),...(data.customRoadmap?.recoveryObservations||[])].some(evidence.symptomObservation);
 const performances=[];
 if(hasConcern)for(const done of data.completedWorkouts||[]){
  if(done.completedRun!==true||done.prescription?.runs?.length!==1||!evidence.date(done.date)||Date.parse(done.date)>now)continue;
  const run=done.prescription.runs[0],kind=run.role==='long-run'?'long':easyPrescription(run)?'easy':'quality';
  if(kind!==task)continue;
  const actual=(data.runs||[]).filter(row=>row.sessionId===done.id&&row.date===done.date);
  if(actual.length!==1||!usefulRun(actual[0]))continue;
  const log=actual[0],feedback=workoutFeedback(data.sessionFeedback||[],done,now),rpe=evidence.reliableEffort(log)?Number(log.rpe):null;
  if(!(Number(log.min??log.minutes)>0)||log.rpe!=null&&rpe===null||evidence.symptomObservation(log)||evidence.symptomObservation(feedback)||adverseFeedback(feedback))continue;
  const dose=run.distanceKnown===false?Number(log.min??log.minutes):Number(log.km),target=run.distanceKnown===false?run.minutes:run.distanceKm;
  if(!(dose>0&&target>0&&dose<=target+(run.distanceKnown===false?.1:.01)+1e-8))continue;
  performances.push({date:done.date,sport:'running',task:kind,rpe,easyEffortConfirmed:kind==='easy'&&rpe===null});
 }
 return evidence.symptomReview(data,{now,sport:'running',task,performances});
}
function resolveEarnedAerobicDose(run,data,{now,ready,sessionNamespace}){
 const build=run.conditionalAerobicBuild,isDistance=build.mode==='distance',target=isDistance?run.distanceKm:run.minutes;
 const starting=build.startingDose;
 if(!(target>0))return run;
 const dates=new Set(),latest=[],verified=[],timeLimited=[];
 const simplified=build.integratedCoachingVersion===1;
 const symptoms=simplified?runningSymptomReview(data,{now,task:run.role==='long-run'?'long':'easy'}):null;
 let difficultDays=0;
 let adverse=symptoms?.restriction==='hold';
 const eligible=(data.completedWorkouts||[]).filter(done=>{
  const age=now-Date.parse(done.date),prior=done.prescription?.runs?.[0];
  return age>=0&&age<=28*DAY&&(!simplified||evidence.date(done.date))&&done.completedRun===true&&done.prescription?.runs?.length===1&&
   prior?.conditionalAerobicBuild?.version===1&&prior.conditionalAerobicBuild.mode===build.mode&&
   easyPrescription(prior)&&(!sessionNamespace||done.id?.startsWith(sessionNamespace));
 }).map(done=>{
  const logs=(data.runs||[]).filter(r=>r.sessionId===done.id&&r.date===done.date);
  const feedback=workoutFeedback(data.sessionFeedback||[],done,now);
  return {done,log:logs.length===1?logs[0]:null,feedback,
   response:simplified?easyRecoveryResponse(logs.length===1?logs[0]:null,feedback):null};
 }).sort((a,b)=>{
  if(simplified&&a.done.date.slice(0,10)===b.done.date.slice(0,10)){
   const priority=entry=>entry.response.acute?2:entry.response.uncertain?1:0;
   return priority(b)-priority(a)||Date.parse(b.done.date)-Date.parse(a.done.date);
  }
  return Date.parse(b.done.date)-Date.parse(a.done.date);
 });
 for(const {done,log,feedback,response} of eligible){
  const age=now-Date.parse(done.date),date=done.date.slice(0,10),prior=done.prescription.runs[0];
  const matchingSlot=build.capacitySlot==null||prior.conditionalAerobicBuild.capacitySlot===build.capacitySlot;
  if(dates.has(date))continue;
  if(response?.acute){adverse=true;break}
  if(!matchingSlot){
   if(response?.uncertain&&age<=14*DAY&&usefulRun(log||{})&&feedback?.difficulty==='harder'&&feedback?.energy==='low'){
    dates.add(date);
    if(++difficultDays>=2){adverse=true;break}
   }
   continue;
  }
  if(!log){
   if(simplified&&prior.aerobicDose==='normal'){
    dates.add(date);
    if(latest.length<2)latest.push({confirmed:false,short:false});
   }
   continue;
  }
  if(simplified){
   const hardLow=age<=14*DAY&&usefulRun(log)&&feedback?.difficulty==='harder'&&feedback?.energy==='low';
   if(hardLow||prior.aerobicDose==='normal')dates.add(date);
   if(hardLow)difficultDays++;
   if(difficultDays>=2){adverse=true;break}
   if(prior.aerobicDose!=='normal'){
    if(hardLow&&latest.length<2)latest.push({confirmed:false,short:false});
    continue;
   }
   if(response.uncertain){
    if(latest.length<2)latest.push({confirmed:false,short:false});
    continue;
   }
  }else if(adverseFeedback(feedback)||Number(log.rpe)>4||!usefulRun(log)){adverse=true;break}
  if(prior.aerobicDose!=='normal')continue;
  const prescribed=isDistance?prior.distanceKm:prior.minutes;
  const dose=Math.min(isDistance?Number(log.km):Number(log.min),prescribed);
  if(!Number.isFinite(dose)||dose<=0){
   if(simplified&&latest.length<2)latest.push({confirmed:false,short:false});
   continue;
  }
  dates.add(date);
  const confirmed=easyFeedback(feedback);
  // The logger records kilometres to hundredths and minutes to tenths.
  const short=prescribed-dose>(isDistance?.01:.1)+1e-8;
  if(simplified&&confirmed&&!short&&!done.timeAdaptation&&!prior.capacityLimited)difficultDays=0;
  if(done.timeAdaptation||prior.capacityLimited){
   if(confirmed&&!short&&timeLimited.length<2)timeLimited.push(dose);
   continue;
  }
  if(latest.length<2)latest.push({confirmed,dose,short});
  if(confirmed&&!short)verified.push(dose);
  if(verified.length===2)break;
 }
 const reference=verified.length===2?Math.min(...verified):starting;
 const recentShort=latest.filter(item=>item.short).map(item=>item.dose);
 // Short outings alone leave the reason unknown. Hold the verified dose;
 // an adverse response is a separate reason to return to familiar work.
 const support=adverse?Math.min(reference,starting):reference;
 const increment=isDistance?Math.max(.05,support*build.rate):2;
 const mayIncrease=run.aerobicDose==='normal'&&ready&&!adverse&&!symptoms?.reviewRequired&&latest.length===2&&latest.every(item=>item.confirmed&&!item.short);
 const increase=mayIncrease?(isDistance?round(support+increment):Math.round(support+increment)):support;
 // A pair of comfortable time-limited visits can support repeating that dose.
 // It does not qualify as evidence for adding time or distance.
 const earned=!adverse&&!recentShort.length&&verified.length<2&&timeLimited.length===2
  ?Math.max(increase,Math.min(...timeLimited)):increase;
 const dose=Math.min(target,earned);
 const symptomNote=symptoms?.reviewRequired?'Review the reported symptoms before running. Avoid work that provokes them.':null;
 if(dose===target)return symptomNote?{...run,reason:symptomNote,recoveryReviewRequired:true}:run;
 const ratio=dose/target,estimate=run.durationRangeMinutes;
 const time=isDistance&&estimate?{min:Math.ceil(estimate.min*ratio),max:Math.ceil(estimate.max*ratio)}:null;
 const reason=symptomNote||(
  adverse?'Recent running feedback needs review. Use familiar easy work only if comfortable.':
  'Use the last supported easy dose. Increases need two comparable comfortable completions and supportive readiness.');
 if(!isDistance)return {...run,...timedEasyRun(dose),reason};
 return {...run,distanceKm:dose,minutes:time?.max??null,durationRangeMinutes:time,
  steps:[{...run.steps[0],distanceKm:dose}],structure:dose+' km easy running',reason};
}
function resolveAerobicBuild(run,data,options){
 const {now,ready}=options,build=run.conditionalAerobicBuild;
 if(build?.version===1)return resolveEarnedAerobicDose(run,data,options);
 if(!build||run.minutes<=build.startingMinutes)return run;
 const dates=new Set(),recent=[];
 if(ready)for(const done of (data.completedWorkouts||[]).slice().sort((a,b)=>Date.parse(b.date)-Date.parse(a.date))){
  const age=now-Date.parse(done.date),date=done.date?.slice(0,10),prior=done.prescription?.runs;
  if(!(age>=0&&age<=28*DAY)||dates.has(date)||done.completedRun!==true||prior?.length!==1||prior[0].name!=='Timed easy health run')continue;
  const log=(data.runs||[]).find(row=>row.sessionId===done.id&&row.date===done.date);
  const feedback=(data.sessionFeedback||[]).findLast(row=>row.sessionId===done.id&&row.week===done.week&&row.date?.slice(0,10)===date&&Date.parse(row.date)>=Date.parse(done.date));
  const minutes=Math.floor(Math.min(log?.min,prior[0].minutes));
  if(!(minutes>0&&Number.isFinite(minutes)))continue;
  dates.add(date);
  recent.push(feedback?.discomfort==='no'&&['good','okay'].includes(feedback.energy)&&['expected','easier'].includes(feedback.difficulty)?minutes:0);
  if(recent.length===2)break;
 }
 const ceiling=recent.length===2&&recent.every(minutes=>minutes>0)?Math.max(build.startingMinutes,Math.min(...recent)+2):build.startingMinutes;
 if(run.minutes<=ceiling)return run;
 return {...run,...timedEasyRun(ceiling),reason:'Use this familiar easy dose today. A longer run needs two recent comfortable easy sessions with feedback and a good readiness check.'};
}
function ordinaryOuting(activities,distinctDays=false){
 if(distinctDays){
  const daily=new Map();
  for(const row of activities){
   const day=evidence.date(row.date),prior=daily.get(day);
   if(day&&(!prior||row.km<prior.km))daily.set(day,row);
  }
  activities=[...daily.values()];
 }
 if(activities.length<2)return null;
 const lowerMedian=values=>values.sort((a,b)=>a-b)[Math.floor((values.length-1)/2)];
 return {distance:lowerMedian(activities.map(r=>r.km)),duration:lowerMedian(activities.map(r=>r.minutes)),
  secondsPerKm:Math.max(...activities.map(r=>r.minutes*60/r.km)),source:'recent comfortable easy outings'};
}
const roundDownDistance=km=>Math.floor(km*20+1e-8)/20;
function verifiedFitnessRoutine(c,h){
 const asOf=stamp(c.runningDoseEvidence?.asOf);
 if(!(h.base>0)||!Number.isFinite(asOf))return null;
 const currentWeek=monday(asOf),calendar=new Map();
 for(const row of c.runningDoseEvidence.recentActivities||[]){
  const day=stamp(evidence.date(row.date)),week=monday(day);
  if(!Number.isFinite(day)||week>=currentWeek||week<currentWeek-3*WEEK)continue;
  if(!calendar.has(week))calendar.set(week,[]);
  calendar.get(week).push(row);
 }
 const complete=[...calendar].sort(([a],[b])=>b-a).flatMap(([,rows])=>{
  const days=new Set(rows.map(row=>evidence.date(row.date))),km=sum(rows.map(row=>row.km));
  const normal=rows.every(row=>row.minutes>0&&(!row.reducedDose||row.verifiedFrequencyTrial)&&!row.adverseResponse&&!row.uncertainty&&
   !/quality|interval|threshold|tempo|race/i.test(row.type)&&confirmedEasyEffort(row));
  if(!normal||days.size!==rows.length||km<h.base*.85||km>h.base*1.15)return [];
  return [rows.slice().sort((a,b)=>a.km-b.km||a.minutes-b.minutes)];
 });
 const pair=complete.map((rows,i)=>[rows,complete.slice(i+1).find(other=>other.length===rows.length)])
  .find(([,other])=>other);
 if(!pair)return null;
 const [latest,earlier]=pair;
 return latest.map((row,i)=>({km:Math.min(row.km,earlier[i].km),
  secondsPerKm:Math.max(row.minutes*60/row.km,earlier[i].minutes*60/earlier[i].km)}));
}
function integratedFitnessFrequency(c,w=1){
 const start=stamp(c.startDate),weekStart=Number.isFinite(start)?monday(start)+(w-1)*WEEK:NaN;
 const supportsLaterEvent=c.hybridFocus==='strength'&&(c.orderedGoals||[]).some(goal=>
  goal.sport==='running'&&['half','marathon'].includes(String(goal.runGoal).toLowerCase())&&stamp(goal.date)>weekStart);
 if(c.integratedCoachingVersion!==1||String(c.runGoal||'fitness').toLowerCase()!=='fitness'||supportsLaterEvent)return null;
 const requested=Math.max(0,Math.min(7,Number(c.runs)||0)),h=history(c),routine=verifiedFitnessRoutine(c,h);
 const familiar=routine?.length??null,known=Number.isFinite(familiar),opening=Math.min(requested,known?familiar:2);
 const target=stamp(c.strengthTargetDate);
 const meets=Number.isFinite(target)&&monday(target)===weekStart;
 const marathon=stamp(h.recentMarathonDate);
 const current=stamp(c.runningDoseEvidence?.asOf);
 const recentMarathon=Number.isFinite(marathon)&&(!Number.isFinite(current)||current-marathon<42*DAY);
 const recentHalf=h.recentRace?.distanceKm>=20&&h.recentRace?.distanceKm<40&&stamp(h.recentRace?.date)>current-21*DAY;
 const recovery=recoveryContext(c,w,{now:Math.max(0,Date.parse(c.coachingEvidence?.asOf)||current||0)});
 const tasks=recovery.runningTasks;
 const trialKm=routine?roundDownDistance(Math.min(3,routine[0].km/2,sum(routine.map(run=>run.km))*.15)):0;
 const trial=requested>opening&&known&&trialKm>=1&&w>=3&&w%4!==0&&!meets&&!recentMarathon&&!recentHalf&&
  tasks?.easy.canProgress&&tasks?.long.canProgress&&!recovery.longRunRecoveryReview&&!recovery.longRunDurationReview&&
  c.runningMode!=='maintenance';
 const effective=tasks?.easy.restriction==='hold'?0:opening+Number(!!trial);
 const reason=requested<=opening?null:!known?'The requested frequency is a goal. Start with up to two easy running days while a repeatable routine is established.':
  trial?'One shorter easy trial redistributes familiar weekly distance. Review completed training before adding another running day.':
  'Keep the verified running frequency for now. Additional days need a suitable week and review of the completed response.';
 return {requested,effective,familiar,trial:!!trial&&effective>opening,trialKm,routine,reason};
}
function routineFitnessDoses(c,{frequency,p,factor,base,requestedKm,canBuild,deload,reduced,longBounded}){
 const {routine,effective,trial,trialKm}=frequency;
 if(!routine?.length||!effective||reduced)return null;
 const slots=routine.map((row,capacitySlot)=>({...row,capacitySlot}));
 if(effective<slots.length)slots.splice(Math.max(0,effective-1),slots.length-effective);
 const familiarKm=sum(slots.map(row=>row.km)),steady=c.runningMode==='maintenance'||frequency.requested>routine.length;
 const openingMultiplier=Math.min(1,base/familiarKm);
 const budget=Math.min(requestedKm,steady?familiarKm*Math.min(factor,1):familiarKm*factor);
 const multiplier=Math.max(0,(budget-(trial?trialKm:0))/familiarKm);
 // A shorter-labelled easy run must never exceed the protected longest dose.
 const ordinaryCap=Math.max(16,slots.at(-1).km);
 const runs=slots.map((row,i)=>{
  const longest=i===slots.length-1;
  const normalLong=!longBounded&&longest&&slots.length>1;
  // Keep a familiar longer outing, but use a reviewed endurance goal for
  // further distance beyond the ordinary general-fitness long dose.
  const cap=longBounded?(longest?routine[0].km:row.km):ordinaryCap;
  const target=roundDownDistance(Math.min(row.km*multiplier,cap));
  const run=easyRun(target,p,normalLong?'long-run':'easy-run');
  const estimate=Math.ceil(target*row.secondsPerKm/60),prior=run.durationRangeMinutes;
  run.minutes=Math.max(prior?.max||0,estimate);
  run.durationRangeMinutes={min:prior?.min??estimate,max:run.minutes};
  run.aerobicDose=deload?'deload':'normal';
  run.fitnessDistanceDose=true;
  run.reason=trial?'Shorter familiar work makes room for one easy trial without adding weekly distance.':
   'This easy outing reflects your verified weekly pattern. Shorten if needed.';
  if(canBuild&&!steady&&!longBounded&&target>0)run.conditionalAerobicBuild={version:1,mode:'distance',
   startingDose:roundDownDistance(row.km*openingMultiplier),rate:c.hybridFocus==='strength'?.025:.03,
   integratedCoachingVersion:1,capacitySlot:row.capacitySlot};
  return run;
 });
 if(trial){
  const run=easyRun(trialKm,p);
  const estimate=Math.ceil(trialKm*Math.max(...slots.map(row=>row.secondsPerKm))/60);
  run.minutes=Math.max(run.durationRangeMinutes?.max||0,estimate);
  run.durationRangeMinutes={min:run.durationRangeMinutes?.min??estimate,max:run.minutes};
  run.aerobicDose='frequency-trial';run.fitnessDistanceDose=true;run.frequencyTrial=true;
  run.reason='Trial one shorter conversational outing within familiar weekly distance. Review recovery and completion before adding another day.';
  runs.push(run);
 }
 return {runs,actualKm:Number(sum(runs.map(run=>run.distanceKm)).toFixed(3)),source:'verified weekly running pattern'};
}
function fitnessDoses(c,w,{h,count,p,requestedKm,factor,base,canBuild,deload,reduced,returnEvent,returnActivities}){
 const recent=(c.runningDoseEvidence?.recentActivities||[]).filter(r=>r.minutes>0&&easyType(r)&&
  (returnEvent?stamp(r.date.slice(0,10))>stamp(returnEvent.date):!r.reducedDose)&&confirmedEasyEffort(r));
 const supported=returnEvent?returnActivities:recent;
 const proof=ordinaryOuting(supported,c.integratedCoachingVersion===1);
 // A single reported longest outing is a ceiling, not a repeatable dose.
 const outing=proof?{...proof,distance:Math.min(proof.distance,Number(h.long.km)>0&&!returnEvent?Number(h.long.km):Infinity)}
  :{distance:0,duration:0,secondsPerKm:null,source:'provisional starting dose'};
 const doseKind=reduced?'recovery':deload?'deload':'normal';
 const distanceBased=(h.base>0&&outing.distance>0)||!!returnEvent&&requestedKm>0;
 if(distanceBased){
  // Weekly mileage supplies a budget. A smaller requested frequency does not
  // turn a week of shorter outings into evidence for a single longer outing.
  const startingDose=roundDownDistance(Math.min(base/count,outing.distance||requestedKm/count));
  const target=roundDownDistance(outing.distance>0?Math.min(requestedKm/count,startingDose*factor):requestedKm/count);
  if(target>0){
   const run=easyRun(target,p);
   if(outing.secondsPerKm>0){
    const estimate=Math.ceil(target*outing.secondsPerKm/60),prior=run.durationRangeMinutes;
    run.minutes=Math.max(prior?.max||0,estimate);
    run.durationRangeMinutes={min:prior?.min??estimate,max:run.minutes};
   }
   run.aerobicDose=doseKind;
   run.fitnessDistanceDose=true;
   run.reason='Easy distance reflects '+outing.source+' and the weekly running budget. Stay conversational and shorten if needed.';
   if(canBuild&&startingDose>0)run.conditionalAerobicBuild={version:1,mode:'distance',startingDose,rate:c.hybridFocus==='strength'?.025:.03,
    ...(c.integratedCoachingVersion===1?{integratedCoachingVersion:1}:{})};
   return {runs:Array.from({length:count},()=>clone(run)),actualKm:Number((target*count).toFixed(3)),source:outing.source};
  }
 }
 const startingDose=Math.max(1,Math.floor(outing.duration||(h.base>0?20:15)));
 const buildWeeks=w-1-Math.floor((w-1)/4);
 const planned=canBuild?Math.max(startingDose,Math.min(Math.max(startingDose,30),startingDose+2*Math.floor(buildWeeks/3))):startingDose;
 const minutes=reduced?Math.min(startingDose,15):deload?Math.max(1,Math.floor(planned*.8)):planned;
 const run=timedEasyRun(minutes,canBuild?{version:1,mode:'time',startingDose,startingMinutes:startingDose,
  ...(c.integratedCoachingVersion===1?{integratedCoachingVersion:1}:{})}:undefined);
 run.aerobicDose=doseKind;
 if(outing.source==='provisional starting dose')run.reason='Recent per-outing capacity is unconfirmed. Start with conversational running or run/walk and use actual completed outings to review the dose.';
 else run.reason='Start from '+outing.source+'. Any increase depends on comparable comfortable completions and supportive readiness.';
 return {runs:Array.from({length:count},()=>clone(run)),actualKm:0,source:outing.source};
}
function fitRunToMinutes(run,maxMinutes,options={}){
 const original=clone(run),copy=clone(run),cap=Math.floor(Number(maxMinutes));
 if(run.distanceKnown===false&&Number.isFinite(run.minutes)&&run.minutes>0){
  if(run.minutes<=cap)return {run:original,feasible:true,trimmedKm:0,capacityLimited:false};
  const minimum=Math.min(run.minutes,Number(options.minEasyMinutes)||15);
  if(!(cap>=minimum))return {run:original,feasible:false,trimmedKm:0,capacityLimited:false,reason:'The visit does not fit the minimum planned easy-running duration.'};
  copy.minutes=Math.floor(cap);copy.durationRangeMinutes={min:copy.minutes,max:copy.minutes};copy.steps=[{label:'Easy conversational run',role:'easy',minutes:copy.minutes,distanceKm:0,pace:'Conversational easy effort'}];copy.structure=copy.minutes+' minutes easy conversational running or run/walk';copy.capacityLimited=true;copy.capacityAdjustment={originalMinutes:run.minutes,actualMinutes:copy.minutes,capMinutes:cap,method:'shorten timed easy run'};copy.coachNote='Timed easy running shortened from '+run.minutes+' to '+copy.minutes+' minutes to fit the visit. Distance remains unknown until recorded.';
  return {run:copy,feasible:true,trimmedKm:0,capacityLimited:true,reason:'Timed easy run shortened to fit the visit; distance remains unknown.'};
 }
 const bounds=step=>{
  if(Number(step.paceSeconds)>0)return {min:step.paceSeconds-5,max:step.paceSeconds+5};
  const seconds=[...String(step.pace||run.pace||'').matchAll(/(\d+):([0-5]\d)/g)].map(m=>Number(m[1])*60+Number(m[2]));
  return seconds.length?{min:Math.min(...seconds),max:Math.max(...seconds)}:null;
 };
 const times=(copy.steps||[]).map(bounds);
 if(!(cap>0)||!times.length||times.some(x=>!x)||copy.steps.some(s=>!(s.distanceKm>0)))return {run:original,feasible:false,trimmedKm:0,capacityLimited:false,reason:'A finite whole-run time budget and timed distance steps are required.'};
 const minutes=key=>sum(copy.steps.map((s,i)=>s.distanceKm*times[i][key]/60));
 const originalKm=sum(copy.steps.map(s=>s.distanceKm)),hard=copy.steps.some(work);
 if(Math.ceil(minutes('max'))<=cap)return {run:original,feasible:true,trimmedKm:0,capacityLimited:false};
 const minEasyMinutes=Math.min(Math.ceil(minutes('max')),Number(options.minEasyMinutes)||15);
 const minima=copy.steps.map((s,i)=>{
  if(work(s)||s.role==='recovery'||/recovery/i.test(s.label||''))return s.distanceKm;
  if(/warm.up/i.test(s.label||''))return Math.min(s.distanceKm,Number(options.minWarmupKm)||1);
  if(/cool.down/i.test(s.label||''))return Math.min(s.distanceKm,Number(options.minCooldownKm)||.5);
  return hard?0:Math.min(s.distanceKm,minEasyMinutes*60/times[i].max/(copy.steps.filter(t=>!work(t)).length||1));
 });
 // Ordinary easy support is trimmed before warm-up/cool-down. Work and recovery
 // intervals are immutable: a session that cannot retain them is a conflict.
 const candidates=copy.steps.map((s,i)=>({i,rank:/warm.up|cool.down/i.test(s.label||'')?1:0})).sort((a,b)=>a.rank-b.rank||b.i-a.i);
 for(const {i} of candidates){
  const need=minutes('max')-cap;if(need<=0)break;
  const removable=Math.max(0,copy.steps[i].distanceKm-minima[i]);
  if(!removable)continue;
  const amount=Math.min(removable,Math.ceil((need*60/times[i].max)*1000)/1000);
  copy.steps[i].distanceKm=Number(Math.max(minima[i],copy.steps[i].distanceKm-amount).toFixed(3));
 }
 if(minutes('max')>cap+1e-8)return {run:original,feasible:false,trimmedKm:0,capacityLimited:false,reason:'The visit cannot fit meaningful warm-up, all work/recovery intervals and cool-down. Change the visit arrangement or quality dose explicitly.'};
 // Recompute before filtering zero-distance easy padding; indices refer to original
 // pace bounds. Preserve every work/recovery step and every prescribed work pace.
 copy.durationRangeMinutes={min:Math.ceil(minutes('min')),max:Math.ceil(minutes('max'))};copy.minutes=copy.durationRangeMinutes.max;
 copy.steps=copy.steps.filter(s=>s.distanceKm>.0001);copy.distanceKm=Number(sum(copy.steps.map(s=>s.distanceKm)).toFixed(3));
 copy.structure=copy.steps.map(s=>Math.round(s.distanceKm*1000)+' m '+s.label.toLowerCase()).join(' + ');
 const trimmedKm=Number((originalKm-copy.distanceKm).toFixed(3));
 copy.capacityLimited=true;copy.capacityAdjustment={originalKm:Number(originalKm.toFixed(3)),actualKm:copy.distanceKm,trimmedKm,capMinutes:cap,method:'easy-segments-first; work/recovery and minimum warm-up/cool-down retained'};
 copy.coachNote=(copy.coachNote?copy.coachNote+' ':'')+'Visit time limit: '+trimmedKm+' km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.';
 return {run:copy,feasible:true,trimmedKm,capacityLimited:true,reason:'Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.'};
}
function qualityRun(km,total,p,c,w,until,phase){
 const goal=String(c.runGoal||'fitness').toLowerCase(),distance=({['5k']:5,['10k']:10,half:21.0975,marathon:42.195})[goal]||10;
 const eventPace=p.tenK*Math.pow(distance/10,1.06)/distance,shortPace=p.tenK*Math.pow(.5,1.06)/5;
 const goalPace=Number(c.runningGoalSeconds)>0?Number(c.runningGoalSeconds)/distance:null;
 // Marathon and half pace are slower than threshold but are still counted as
 // quality kilometres. A faster aspiration does not set prescribed work pace.
 let kind=library.selectKind({week:w,goal,weeksToRace:until});
 if(Number(c.runningEvidenceVersion)>=1&&Number(c.runs)===2&&['5k','10k'].includes(goal))kind='race-pace-repeats';
 if(goal==='marathon'&&phase==='Specific preparation')kind='race-pace-repeats';
 const raceSpecific=kind==='race-pace-repeats';
 const warm=round(Math.min(2,km*.25)),cool=round(Math.min(1.5,km*.18));
 const reps=goal==='marathon'&&raceSpecific?2:goal==='half'&&raceSpecific?3:goal==='5k'?5:4;
 const recovery=round(Math.min(.3,km*.035));
 let workKm=round(Math.min(total*(goal==='marathon'&&raceSpecific?.25:.18),km-warm-cool-recovery*(reps-1),goal==='marathon'&&raceSpecific?12:goal==='half'&&raceSpecific?6:4));
 const originalWorkKm=workKm,window=(c.runVisitWindows||[]).find(x=>x.kind==='quality'),cap=Number.isFinite(Number(window?.minutes))&&Number(window?.minutes)>0?Math.floor(Number(window.minutes)):null;
 if(cap){
  const minimumEasy=Math.min(warm,1)+Math.min(cool,.5)+recovery*(reps-1);
  const workPace=raceSpecific?Math.max(eventPace,goalPace&&goalPace>=eventPace?goalPace:eventPace)+5:kind==='threshold-repeats'?p.threshold+5:Math.max(eventPace,p.threshold)+5;
  const maximumWorkKm=Math.max(0,(cap*60-minimumEasy*p.easyHigh)/workPace);
  workKm=Math.min(workKm,Math.floor(maximumWorkKm*20)/20);
 }
 if(workKm/reps<.2)return null;
 const steps=[{label:'Warm-up',role:'easy',distanceKm:warm,pace:range(p.easyLow,p.easyHigh)}];
 for(let i=0;i<reps;i++){
  steps.push({label:'Threshold interval '+(i+1)+' of '+reps,role:'work',distanceKm:workKm/reps,paceSeconds:p.threshold,pace:range(p.threshold-5,p.threshold+5)});
  if(i<reps-1)steps.push({label:'Easy recovery',role:'recovery',distanceKm:recovery,pace:range(p.easyLow,p.easyHigh)});
 }
 const spare=round(km-warm-cool-workKm-recovery*(reps-1));
 if(spare>.01)steps.push({label:'Easy aerobic running',role:'easy',distanceKm:spare,pace:range(p.easyLow,p.easyHigh)});
 steps.push({label:'Cool-down',role:'easy',distanceKm:cool,pace:range(p.easyLow,p.easyHigh)});
 const base=buildRun('Controlled threshold repeats','quality-run',steps,p,workKm<originalWorkKm?{workCapacityAdjustment:{originalWorkKm,actualWorkKm:workKm,availableMinutes:cap,method:'Quality work distance calibrated before generation to preserve all repetitions, recoveries and minimum warm-up/cool-down within the known visit.'}}:{});
 return library.buildQuality({baseRun:base,kind,thresholdSeconds:p.threshold,raceSeconds:eventPace,shortSeconds:shortPace,goalPaceSeconds:goalPace});
}
function assess(c,w=1,options={}){
 const refined=c.coachingRefinementVersion===1,runtime=Number(c.coachingRuntimeVersion)>=1;
 const requestedFrequency=Math.max(0,Math.min(7,Number(c.runs)||0)),fitnessFrequency=integratedFitnessFrequency(c,w);
 const count=fitnessFrequency?.effective??requestedFrequency,goal=String(c.runGoal||'fitness').toLowerCase(),h=history(c),warnings=[],blocking=[];
 const now=typeof options.now==='function'?options.now():Number(options.now)||Date.now();
 const resultStamp=stamp(c.runProfile?.resultDate),futureOrInvalidResult=!!c.runProfile?.resultDate&&(!Number.isFinite(resultStamp)||resultStamp>now),p=runtime&&futureOrInvalidResult?null:paceSet(c,options.paces);
 const start=stamp(c.startDate),target=stamp(c.runningTargetDate),raceWeek=Number.isFinite(start)&&Number.isFinite(target)?Math.round((monday(target)-monday(start))/WEEK)+1:null;
 const until=raceWeek===null?null:raceWeek-w,event=until===0,postRace=until!==null&&until<0&&until>=-2;
 const taper=until!==null&&until>=0&&until<=(goal==='marathon'?2:goal==='half'?1:0),deload=!taper&&!postRace&&w%4===0;
 if(!Number.isInteger(Number(c.runs))||requestedFrequency!==Number(c.runs))blocking.push('Running frequency must be zero to seven whole sessions per week.');
 if(!['fitness','5k','10k','half','marathon'].includes(goal))blocking.push('Unsupported running goal.');
 if(count&&c.runningTargetDate&&(!h.base||!p))blocking.push('Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.');
 if(c.runningTargetDate&&(!Number.isFinite(start)||!Number.isFinite(target)||target<start))blocking.push('Running preparation requires valid ordered programme and event dates.');
 const resultAge=c.runProfile?.resultDate?(now-stamp(c.runProfile.resultDate))/DAY:null;
 if(c.runProfile?.resultDate&&(!Number.isFinite(resultAge)||resultAge<0))blocking.push('Running result date is invalid or in the future; confirm the baseline before approval.');
 const baselineCurrent=p&&c.runProfile?.recency!=='old'&&(resultAge===null||Number.isFinite(resultAge)&&resultAge>=0&&resultAge<=56)&&c.runProfile?.effort!=='training'&&(!runtime||c.runProfile?.effort==='performance'&&Number.isFinite(resultAge));
 const confirmedAt=Date.parse(c.runProfile?.confirmedAt),reviewAt=Math.min(now,Date.parse(c.coachingEvidence?.asOf)||now),confirmedAge=(reviewAt-confirmedAt)/DAY;
 // A confirmed "within the last month" result is at most 31 days old
 // at confirmation. Do not turn the confirmation timestamp into a race date.
 const reportedPerformance=runtime&&p&&resultAge===null&&c.runProfile?.effort==='performance'&&c.runProfile?.recency==='recent'&&c.runProfile?.reportedRecency==='Within the last month'&&confirmedAge>=0&&confirmedAge+31<=56;
 const eventPaceAvailable=!!(baselineCurrent||reportedPerformance);
 if(p&&!baselineCurrent)warnings.push('Confirm a representative recent running result before progressing race-pace work; easy running remains available.');
 if(count&&!h.base)warnings.push('Running volume is provisional until recent completed mileage is confirmed.');
 const recovery=recoveryContext(c,w,{now}),weekStart=recovery.weekStart;
 const recentMarathon=stamp(h.recentMarathonDate||(h.recentRace?.distanceKm>=40?h.recentRace.date:null));
 if(h.recentMarathonDate&&!Number.isFinite(recentMarathon))blocking.push('Recent marathon date is invalid; confirm recovery timing before approving the running build.');
 const daysSinceMarathon=Number.isFinite(recentMarathon)?(weekStart-recentMarathon)/DAY:null;
 let recoveringMarathon=refined||runtime?recovery.recoveringMarathon:daysSinceMarathon!==null&&daysSinceMarathon>=0&&daysSinceMarathon<21;
 const tasks=recovery.runningTasks,returnEvent=runtime?(c.coachingEvidence?.recovery?.events||[]).find(e=>e.date===tasks.easy.eventDate&&e.sport==='running'):null,eventAt=stamp(returnEvent?.date),reviewDays=returnEvent?.goal==='half'?7:21;
 // A dated performance after the provisional event context, together with a
 // reported recent routine, can make an OLD event context rather than a ban.
 // This is new fitness evidence, never clearance from advancing the clock.
 const continuingRoutine=!!(runtime&&returnEvent&&baselineCurrent&&resultStamp>eventAt+reviewDays*DAY&&h.weeks.length>=3&&h.base>0&&!Object.values(tasks).some(t=>t.restriction==='hold'||t.evidence.some(o=>['adverse','safety'].includes(o.status))));
 if(continuingRoutine){recoveringMarathon=false;recovery.runningContinuityEvidence={resultDate:c.runProfile.resultDate,reportedWeeklyKm:h.base,source:'dated-post-event-performance-and-reported-recent-routine',fullReadinessEstablished:false};warnings.push('The later dated performance and reported recent routine support preserving familiar running. This does not establish full recovery or justify extra mileage; historical event timing alone does not impose a permanent restriction.');}
 const runBounded=runtime&&tasks.easy.restriction!=='none'&&!continuingRoutine,runHeld=runtime&&tasks.easy.restriction==='hold',qualityBounded=runtime&&(tasks.quality.restriction!=='none'||tasks.quality.eventDate&&!tasks.quality.canProgress)&&!continuingRoutine,longBounded=runtime&&(tasks.long.restriction!=='none'||tasks.long.eventDate&&!tasks.long.canProgress)&&!continuingRoutine;
 let returnDoseCap=null,returnDoseBase=null,returnDoseBaseWeek=0,familiarEasy=null,returnActivities=[];
 if(runtime&&count>0&&returnEvent&&!continuingRoutine){
  const weeks=[c.runningDoseEvidence?.latestCompletedCalendarWeek,c.runningDoseEvidence?.currentCalendarWeek].filter(Boolean),taskOf=r=>/quality|interval|threshold|tempo|race/i.test(r.type)?'quality':/long/i.test(r.type)?'long':'easy';
  const post=week=>(week.activities||[]).filter(r=>{
   const task=taskOf(r),typed=r.effortReliable!==false&&r.rpe!=null&&r.rpe<=(task==='easy'?4:8);
   const supported=typed||c.runningDosePolicyVersion===1&&task==='easy'&&confirmedEasyEffort(r);
   return stamp(r.date.slice(0,10))>eventAt&&supported&&tasks[task].status==='normal'&&
    String(tasks[task].observedAt||'').slice(0,10)>r.date.slice(0,10);
  }),observed=weeks.flatMap(post);
  const complete=weeks.filter(week=>new Set(post(week).map(r=>r.date.slice(0,10))).size>=count).at(-1);
  if(complete){returnActivities=post(complete);returnDoseBase=Math.min(h.base,sum(returnActivities.map(r=>r.km)));returnDoseBaseWeek=Math.floor((monday(stamp(returnActivities[0].date.slice(0,10)))-monday(start))/WEEK)+1;}
  else {
   // Missing observations never move to a later return stage just because a
   // new proposal is made later. The first trial remains provisional.
   const latest=observed.map(r=>stamp(r.date.slice(0,10))).sort((a,b)=>a-b).at(-1),observedDays=latest?(latest-eventAt)/DAY:0,familiar=observed.length?Math.max(...observed.map(r=>r.km))*count:Infinity;
   returnDoseCap=Math.min(h.base*(returnEvent.goal==='half'?.40:observedDays<7?.20:observedDays<14?.40:.60),familiar);
   // Matched completions establish distances already covered. They do not
   // establish actual effort or next-day recovery, so only offer easy repeats.
   const hasConcern=Object.values(tasks).some(task=>task.restriction==='hold'||task.evidence.some(o=>['adverse','safety'].includes(o.status)));
   const linked=week=>(week.activities||[]).filter(r=>r.plannedEasy&&!r.uncertainty&&r.minutes>0&&stamp(r.date.slice(0,10))>eventAt+14*DAY&&(r.rpe===null||r.effortReliable&&r.rpe<=4));
   const activities=!hasConcern&&count>=2&&weeks.map(linked).filter(rows=>rows.length===count&&new Set(rows.map(r=>r.date.slice(0,10))).size===count).at(-1);
   if(activities){
    familiarEasy={weeklyKm:Math.min(h.base,sum(activities.map(r=>r.km))),longestKm:Math.max(...activities.map(r=>r.km))};
    returnDoseCap=Math.max(returnDoseCap,familiarEasy.weeklyKm);
   }
  }
  warnings.push('Running dose review: comfortable individual activity does not establish habitual weekly mileage. '+(complete?'Completed post-event running and its subsequent responses provide an observed temporary build base, not a new habitual-capacity estimate.':'This graded return retains a provisional planning fraction and any familiar completed-run bound; advancing the date does not expand it.')+' Review actual completed mileage and subsequent response before extending the plan; fractions are planning conventions, not recovery thresholds.');
 }
 if(runtime)for(const [task,decision]of Object.entries(tasks))if(decision.reviewRequired)warnings.push(task+' running review: '+decision.reasons.join(' ')+' '+decision.reassessment);
 if(runHeld&&(requestedFrequency>0||c.runningTargetDate))blocking.push('Running is held for a task-relevant safety or initial recovery concern. Review before approving running or race participation.');
 const strengthWeek=Number.isFinite(start)&&Number.isFinite(stamp(c.strengthTargetDate))?Math.round((monday(stamp(c.strengthTargetDate))-monday(start))/WEEK)+1:null;
 const strengthEventWeek=strengthWeek===w;
 const strengthRecoveryWeek=strengthWeek!==null&&w===strengthWeek+1;
 // A strength-first stage with a later endurance event is aerobic support, not
 // an unrelated small health-running block. Keep its established running base
 // without importing the later race's demanding pace work into the current peak.
 const futureEnduranceGoal=(c.orderedGoals||[]).find(g=>g.sport==='running'&&['half','marathon'].includes(String(g.runGoal).toLowerCase())&&stamp(g.date)>weekStart);
 const supportEndurance=goal==='fitness'&&c.hybridFocus==='strength'&&!!futureEnduranceGoal;
 const aerobicBuild=runtime&&(c.onboardingAerobicBuildVersion===1||fitnessFrequency)&&goal==='fitness'&&!supportEndurance;
 let growth=1;
 const priorityFrom=Number(c.runningPriorityFromWeek)||1;
 const completedMarathonEvidence=Number.isFinite(recentMarathon)||(Number(c.runProfile?.distance)>=40&&c.runProfile?.effort==='performance'&&c.runProfile?.recency!=='old');
 const orderedStrengthLeadIn=(c.goalSchedule||[]).some(s=>Number(s.fromWeek)<priorityFrom&&s.hybridFocus==='strength');
 const handoverEnduranceBuild=goal==='marathon'&&priorityFrom>1&&orderedStrengthLeadIn&&completedMarathonEvidence&&h.base>=25;
 const priorStrength=(c.orderedGoals||[]).filter(g=>g.sport==='strength'&&stamp(g.date)<target).sort((a,b)=>stamp(b.date)-stamp(a.date))[0];
 const priorStrengthWeek=priorStrength&&Number.isFinite(start)?Math.round((monday(stamp(priorStrength.date))-monday(start))/WEEK)+1:null;
 const rateAt=k=>{
  const stages=(c.goalSchedule||[]).filter(s=>Number(s.fromWeek)<=k).sort((a,b)=>a.fromWeek-b.fromWeek);
  const focus=stages.at(-1)?.hybridFocus||(k<priorityFrom?'strength':c.hybridFocus);
  if(aerobicBuild)return focus==='strength'?.025:.03;
  return focus==='strength'?.018:goal==='marathon'?(handoverEnduranceBuild&&k>=priorityFrom?.065:.045):goal==='half'?.045:goal==='fitness'?.018:.03;
 };
 for(let k=2;k<=Math.max(1,taper&&raceWeek?raceWeek-3:w);k++)if(!(runtime&&returnDoseBase!==null&&k<=returnDoseBaseWeek)&&k%4!==0&&!(handoverEnduranceBuild&&(k===priorStrengthWeek||k===priorStrengthWeek+1)))growth*=1+rateAt(k);
 const growthLimit=goal==='marathon'?(h.base>=70?1.35:h.base>=50?1.6:2.4):goal==='half'?(h.base>=40?1.5:1.9):1.5;
 growth=Math.min(growthLimit,growth);
 if(runtime&&goal==='fitness'&&!supportEndurance&&!aerobicBuild)growth=1;
 if(fitnessFrequency&&c.runningMode==='maintenance')growth=1;
 // A planned week is not a completed exposure. Unresolved evidence freezes the
 // build at its familiar baseline until a new reviewed proposal is supported.
 if(runtime&&(!tasks.easy.canProgress||returnDoseCap!==null))growth=1;
 let factor=growth*(deload?.82:1);
 if(taper)factor=growth*(event?.30:until===1?.55:.75);
 if(postRace)factor=until===-1?(goal==='marathon'?.20:goal==='half'?.40:.60):(goal==='marathon'?.45:goal==='half'?.65:.85);
 if(recoveringMarathon){const referenceDays=runtime?(Math.min(now,weekStart)-recentMarathon)/DAY:daysSinceMarathon;factor=Math.min(factor,referenceDays<7?.20:referenceDays<14?.40:.60);}
 if(strengthEventWeek)factor=Math.min(factor,.35);
 if(strengthRecoveryWeek&&supportEndurance)factor=Math.min(factor,.50);
 const fatigue=c.recoveryEvidence||{};
 const lowerFatigue=runtime?runBounded&&!recoveringMarathon:!(fatigue.cleared===true||fatigue.resolved===true)&&((['accumulating-fatigue','fatigue','persistent-fatigue'].includes(fatigue.status)&&(fatigue.affectedLifts||[]).some(x=>/squat|deadlift|lower/i.test(x)))||fatigue.runningFatigue===true||fatigue.lowerBodyFatigue===true);
 if(lowerFatigue)factor=Math.min(factor,.65);
 const base=returnDoseBase??(h.base||Math.min(6,count*2));
 let requestedKm=round(base*factor);
 if(returnDoseCap!==null)requestedKm=Math.min(requestedKm,round(returnDoseCap));
 if(Number(c.runningEvidenceVersion)>=1&&c.runningReturnObservation&&(!runtime||!tasks.easy.canProgress)){
  const observation=c.runningReturnObservation,cap=Math.min(base,Number(observation.initialWeeklyCeilingKm)*(runtime?1:1.05**Math.max(0,w-1)));
  requestedKm=Math.min(requestedKm,round(cap));
  warnings.push('Post-marathon running return is provisional: '+observation.observedWeekKm+' km was recorded versus '+observation.reportedHabitualKm+' km reported habitual mileage. The low recovery week is not a normal-capacity estimate; confirm actual recovery before quality and review completed training before extending the return.');
 }
 if(goal==='fitness'&&!supportEndurance&&!runtime)requestedKm=round(Math.min(requestedKm,count*(lowerFatigue?8:6)));
 if(runHeld)requestedKm=0;
 if(lowerFatigue)warnings.push('Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.');
 const enduranceSpecific=(goal==='marathon'&&raceWeek!==null&&w>=Math.max(5,priorityFrom+4)&&until<=10)||(goal==='half'&&w>=5&&until!==null&&until<=8);
 let phase=taper?'Taper / event':postRace||recoveringMarathon?'Recovery':enduranceSpecific?'Specific preparation':w<=Math.max(4,priorityFrom+2)?'Aerobic foundation':'Development';
 if(goal==='marathon'&&count&&count<3){if(raceWeek!==null)blocking.push('Marathon preparation needs more running support than one or two sessions, or individual review of a constrained alternative.');else warnings.push('Two or fewer runs can support a base-building block. Consider a third easy run and review completed endurance before choosing a marathon date; this block does not establish race readiness.');}
 if(goal==='marathon'&&raceWeek!==null&&raceWeek<12)blocking.push('Short marathon preparation needs individual review of established endurance and recovery.');
 if(goal==='marathon'&&h.base&&h.base<25)warnings.push('Build an aerobic base before treating this as race-ready marathon preparation; review completed mileage and long runs before the specific block.');
 if(recoveringMarathon)warnings.push('Recent marathon: provisional easy return, with no quality or long-run progression until recovery is confirmed. Rest or shorten if normal easy running is not comfortable.');
 if(refined&&recovery.longRunRecoveryReview)warnings.push('The recent long run required '+recovery.observations.longRunRecoveryHours+' hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.');
 if(refined&&recovery.longRunDurationReview)warnings.push('The recorded long run lasted '+recovery.observations.longRunMinutes+' minutes. Review duration, pace, fuelling and recovery before extending it; distance alone does not establish capacity.');
 if(postRace)warnings.push('Post-race return is provisional: confirm recovery before accepting the next loading block.');
 if(strengthEventWeek)warnings.push('Strength competition week: short easy running only; the day after the meet requires a separate recovery decision.');
 if(strengthRecoveryWeek&&supportEndurance)warnings.push('After the strength meet: provisional reduced easy running, with no long run until recovery is confirmed before the endurance-priority handover.');
 if(supportEndurance)warnings.push('Maintain an easy aerobic base for the later '+futureEnduranceGoal.runGoal+' while strength has priority. Race-specific running starts after the dated handover and recovery review.');
 if(handoverEnduranceBuild)warnings.push('The post-meet marathon build is conditional on restored recovery and completed aerobic support. Confirm actual mileage at the handover before progressing; proposed future kilometres are not evidence that those runs were completed.');
 const easy=km=>easyRun(km,p),commonEasyOnly=taper||postRace||recoveringMarathon||strengthEventWeek||(strengthRecoveryWeek&&supportEndurance)||(goal==='fitness'&&!supportEndurance)||lowerFatigue,noLong=commonEasyOnly||longBounded;
 if(!count||runHeld)return {runs:[],warnings,blocking,feasible:!blocking.length,reviewRequired:!!warnings.length,requestedKm:0,allocatedKm:0,km:0,longKm:0,longShare:0,phase,deload,taper,remaining:until===null?null:until+1,
  ...(fitnessFrequency?{runningFrequency:{...fitnessFrequency,effective:0,trial:false}}:{}),
  ...(runtime?{recoveryContext:recovery,baselineCurrent:!!baselineCurrent,eventPaceAvailable,reportedPerformance:!!reportedPerformance}:{})};
 if(c.runningDosePolicyVersion===1&&aerobicBuild){
  const canBuild=tasks.easy.canProgress&&returnDoseCap===null&&!lowerFatigue&&!recoveringMarathon&&!taper&&!postRace&&!strengthEventWeek;
  const reduced=lowerFatigue||recoveringMarathon||strengthEventWeek||postRace||taper||returnDoseCap!==null;
  const frequency=fitnessFrequency?.trial&&reduced?{...fitnessFrequency,effective:fitnessFrequency.familiar,trial:false,
   reason:'Keep the verified number of days during reduced training. Review recovery before adding another day.'}:fitnessFrequency;
  const pace=baselineCurrent||reportedPerformance?p:null;
  const verified=frequency&&routineFitnessDoses(c,{frequency,p:pace,factor,base,requestedKm,canBuild,deload,reduced,
   longBounded:longBounded||recovery.longRunRecoveryReview||recovery.longRunDurationReview});
  const {runs,actualKm,source}=verified||fitnessDoses(c,w,{h,count:frequency?.effective??count,p:pace,requestedKm,factor,base,canBuild,deload,reduced,returnEvent,returnActivities});
  const distanceKnown=runs[0]?.distanceKnown!==false;
  if(source==='provisional starting dose')warnings.push('Confirm a familiar outing and recent completed running before changing the provisional dose.');
  const observedDays=new Map();
  const asOf=Date.parse(c.runningDoseEvidence?.asOf+'T00:00:00Z');
  if(Number.isFinite(asOf))for(const row of c.runningDoseEvidence.recentActivities||[]){
   const day=Date.parse(row.date.slice(0,10)+'T00:00:00Z'),week=monday(day);
   if(week>=monday(asOf))continue;
   if(!observedDays.has(week))observedDays.set(week,new Set());
   observedDays.get(week).add(day);
  }
  const familiarFrequency=median([...observedDays.values()].map(days=>days.size));
  if(frequency?.reason)warnings.push(frequency.reason);
  if(!fitnessFrequency&&observedDays.size>=2&&count>familiarFrequency+1)
   warnings.push('The available logs show about '+familiarFrequency+' running days per recorded week. Review the move to '+count+
    ' days and build a repeatable frequency before extending the outings.');
  const longest=verified?runs.find(run=>run.role==='long-run')?.distanceKm||0:0;
  return {runs,warnings:[...warnings,...blocking],blocking,feasible:!blocking.length,reviewRequired:!!(warnings.length||blocking.length),
   requestedKm:distanceKnown?requestedKm:0,allocatedKm:actualKm,actualKm,km:actualKm,distanceKnown,phase,
   preparationMode:verified?'verified-weekly-pattern':distanceKnown?'evidence-led-health-running':'timed-health-running',
   progressionLimited:!canBuild||distanceKnown&&actualKm<requestedKm,
   deload,taper,remaining:until===null?null:until+1,longKm:longest,longShare:actualKm?longest/actualKm:0,qualityAllowed:false,recoveryContext:recovery,
   ...(frequency?{runningFrequency:frequency}:{}),
   reviewGates:{baselineConfirmed:source!=='provisional starting dose',longRunHistoryConfirmed:!!Number(h.long.km),recoveryCheckRequired:reduced}};
 }
 if(goal==='fitness'&&(!p||aerobicBuild&&!h.base)){
  const startingMinutes=aerobicBuild&&!h.base?15:20;
  const canBuild=aerobicBuild&&tasks.easy.canProgress&&returnDoseCap===null&&!lowerFatigue&&!recoveringMarathon&&!taper&&!postRace&&!strengthEventWeek;
  const buildWeeks=w-1-Math.floor((w-1)/4);
  const planned=canBuild?Math.min(30,startingMinutes+2*Math.floor(buildWeeks/3)):startingMinutes;
  const minutes=lowerFatigue||strengthEventWeek||aerobicBuild&&recoveringMarathon?15:aerobicBuild&&deload?Math.min(24,Math.floor(planned*.8)):planned;
  const runs=Array.from({length:count},()=>timedEasyRun(minutes,canBuild?{startingMinutes}:null));
  return {runs,warnings,blocking,feasible:!blocking.length,reviewRequired:!!(warnings.length||blocking.length),requestedKm:0,allocatedKm:0,actualKm:0,km:0,distanceKnown:false,phase,preparationMode:'timed-health-running',progressionLimited:false,deload,taper,remaining:until===null?null:until+1,longKm:0,longShare:0,qualityAllowed:false,...(runtime?{baselineCurrent:false,recoveryContext:recovery}:{}),reviewGates:{baselineConfirmed:false,longRunHistoryConfirmed:!!Number(h.long.km),recoveryCheckRequired:lowerFatigue||strengthEventWeek}};
 }
 const capRaceOutings=c.runningDosePolicyVersion===1&&goal!=='fitness'&&!returnEvent;
 const raceOutings=capRaceOutings?(c.runningDoseEvidence?.recentActivities||[]).filter(normalEasyOuting):[];
 const typicalRaceOuting=ordinaryOuting(raceOutings,c.integratedCoachingVersion===1),reportedLongest=Number(h.long.km)||0;
 if(capRaceOutings&&count<=2&&h.base&&!typicalRaceOuting&&reportedLongest<=0){
  const review='Confirm a familiar running outing before concentrating the reported weekly mileage into one or two race-preparation runs.';
  if(raceWeek!==null)blocking.push(review);else warnings.push(review);
  const minutes=lowerFatigue||strengthEventWeek||postRace||taper||deload?15:20;
  const runs=Array.from({length:count},()=>timedEasyRun(minutes));
  return {runs,warnings:[...warnings,...blocking],blocking,feasible:!blocking.length,reviewRequired:true,requestedKm:0,
   allocatedKm:0,actualKm:0,km:0,distanceKnown:false,phase,preparationMode:'provisional-easy-running',
   progressionLimited:true,deload,taper,remaining:until===null?null:until+1,qualityAllowed:false,longKm:0,longShare:0};
 }
 const share=count===1?1:count===2?.5:goal==='marathon'?(count===3?.40:count===4&&phase==='Specific preparation'?.45:.36):goal==='half'?(count===3?(phase==='Specific preparation'?.48:.42):.38):.38;
 const longReference=Number(h.long.km)>0?Number(h.long.km):null;
 const longWindow=(c.runVisitWindows||[]).find(x=>x.kind==='long'),knownLongWindow=Number(longWindow?.minutes)>0?Number(longWindow.minutes):Infinity;
 const conditionalLongerRehearsal=goal==='marathon'&&completedMarathonEvidence&&knownLongWindow>=240;
 const longTimeLimit=Math.min(knownLongWindow,Number(c.longRunMaxMinutes)>0?Number(c.longRunMaxMinutes):goal==='marathon'?(conditionalLongerRehearsal?240:210):goal==='half'||supportEndurance?150:100);
 const longDistanceLimit=goal==='marathon'?32:goal==='half'?20:supportEndurance?16:goal==='fitness'?12:16;
 // The observed duration can reveal a slower endurance pace than the race
 // equivalent. Do not pretend a recorded four-hour run was a two-hour dose.
 const observedLongPace=refined&&longReference&&Number(h.long.minutes)>0?Number(h.long.minutes)*60/longReference:0;
 const longTimeKm=p?longTimeLimit*60/Math.max(p.easyHigh,observedLongPace):Infinity;
 const longProgressLimit=longReference?longReference+(refined&&recovery.longRunRecoveryReview||runtime&&!tasks.long.canProgress?0:.8*Math.max(0,w-1-Math.floor((w-1)/4))):Infinity;
 const familiarLong=!!familiarEasy&&!taper&&!strengthEventWeek&&!postRace;
 let longKm=Math.max(0,Math.floor(Math.min(requestedKm*(familiarLong&&count===2?.55:(goal==='fitness'&&!supportEndurance)||lowerFatigue?1/count:share),longDistanceLimit,longTimeKm,longProgressLimit,familiarEasy?.longestKm??Infinity)*20+1e-9)/20);
 const longCapLimited=requestedKm*share-longKm>.2;
 const otherCount=count-1,otherKm=otherCount?round((requestedKm-longKm)/otherCount):0;
 const distances=Array.from({length:count},(_,i)=>runtime&&goal==='fitness'&&!supportEndurance?round(requestedKm/count):count===1?round(Math.min(requestedKm,longDistanceLimit,longTimeKm)):i===1?longKm:otherKm);
 // Exact rounding stays on an ordinary easy run rather than inflating the long run.
 if(count>1)distances[count-1]=round(distances[count-1]+requestedKm-sum(distances));
 if(capRaceOutings&&(typicalRaceOuting||reportedLongest>0)){
  const observedLong=Math.max(...raceOutings.map(r=>r.km),reportedLongest);
  for(let i=0;i<distances.length;i++){
   const visitBase=i===1&&!noLong?observedLong:typicalRaceOuting?.distance||reportedLongest;
   const cap=Math.floor(visitBase*factor*20+1e-8)/20;
   if(cap>0)distances[i]=Math.min(distances[i],cap);
  }
  if(sum(distances)<requestedKm-.15)warnings.push('Recent outing capacity limits this week to '+round(sum(distances))+
   ' km. Review frequency or outing evidence before concentrating the remaining mileage into longer sessions.');
  longKm=Math.min(longKm,distances[count===1?0:1]);
 }
 const shortTwoRun=Number(c.runningEvidenceVersion)>=1&&count===2&&['5k','10k'].includes(goal);
 const qualityAllowed=baselineCurrent&&h.base>=12&&(count>=3||shortTwoRun)&&!commonEasyOnly&&!qualityBounded&&!deload&&(!refined||!recovery.longRunRecoveryReview&&!recovery.longRunDurationReview&&!blocking.length)&&goal!=='fitness'&&phase!=='Recovery';
 const runs=distances.map((km,i)=>easyRun(km,p,i===1&&(!noLong||familiarLong)?'long-run':'easy-run'));
 if(familiarEasy)for(const run of runs){
  run.recoveryReviewRequired=true;
  run.coachNote='Use conversational RPE 3–4 and shorten or walk if it feels harder than usual. Record effort and next-day response before adding faster or longer work.';
 }
 if(qualityAllowed){const q=qualityRun(distances[0],sum(distances),p,c,w,until,phase);if(q){if(c.runningReturnObservation){q.recoveryReviewRequired=true;q.coachNote=(q.coachNote||'')+' This is conditional on comfortable easy running and actual post-marathon recovery. If not confirmed, replace this session with easy running of no greater duration; do not make the work up.';}runs[0]=q;}}
 // Specific long-run pace rehearsal replaces the midweek quality, so this is
 // still one demanding running stimulus. Retain meaningful easy support.
 if(goal==='marathon'&&phase==='Specific preparation'&&qualityAllowed&&!longBounded&&w%3===1&&longKm>=20){
  const eventPace=p.tenK*Math.pow(42.195/10,1.06)/42.195,mp=round(Math.min(12,requestedKm*.20,longKm*.40)),warm=round(longKm*.50),cool=round(longKm-warm-mp);
  runs[0]=easy(distances[0]);runs[1]=buildRun('Long run with marathon-pace rehearsal','long-run',[{label:'Easy aerobic running',role:'easy',distanceKm:warm,pace:range(p.easyLow,p.easyHigh)},{label:'Current-fitness marathon pace',role:'work',distanceKm:mp,paceSeconds:eventPace,pace:range(eventPace-5,eventPace+5)},{label:'Easy finish',role:'easy',distanceKm:cool,pace:range(p.easyLow,p.easyHigh)}],p,{workoutFamily:'marathon-pace-long-run',paceBasis:{method:'current-performance-equivalent',racePaceSeconds:eventPace,goalPaceSeconds:Number(c.runningGoalSeconds)>0?Number(c.runningGoalSeconds)/42.195:null,goalSupported:Number(c.runningGoalSeconds)>0?Number(c.runningGoalSeconds)/42.195>=eventPace:null}});
 }
 const eventDistance=({['5k']:5,['10k']:10,half:21.0975,marathon:42.195})[goal];
 const eventPace=p&&eventDistance?p.tenK*Math.pow(eventDistance/10,1.06)/eventDistance:null;
 // Retain a small current-fitness rhythm reminder during a recovered taper.
 // This replaces easy metres, never adds a second full quality workout or
 // borrows a faster aspiration. Race-day insertion remains the engine's job.
 const established=goal==='marathon'?h.base>=25&&longReference>=16:goal==='half'?h.base>=20&&longReference>=10:h.base>=12;
 const taperReminderAllowed=!!(refined&&taper&&eventPace&&baselineCurrent&&established&&count>=3&&!blocking.length&&!lowerFatigue&&!qualityBounded&&!recoveringMarathon&&!postRace&&!strengthEventWeek&&!recovery.longRunRecoveryReview&&!recovery.longRunDurationReview);
 if(taperReminderAllowed){
  const km=distances[0],warm=round(Math.min(1.5,km*.3)),cool=round(Math.min(1,km*.2)),recoveryKm=.2;
  const fraction=event?.04:until===1?.06:.08,ceiling=event?1.5:until===1?3:4;
  const workKm=Math.floor(Math.max(0,Math.min(ceiling,sum(distances)*fraction,km-warm-cool-recoveryKm))*20)/20;
  if(workKm>=.4){
   const steps=[{label:'Warm-up',role:'easy',distanceKm:warm,pace:range(p.easyLow,p.easyHigh)},{label:'Current-fitness race rhythm 1 of 2',role:'work',distanceKm:workKm/2,paceSeconds:eventPace,pace:range(eventPace-5,eventPace+5)},{label:'Easy recovery',role:'recovery',distanceKm:recoveryKm,pace:range(p.easyLow,p.easyHigh)},{label:'Current-fitness race rhythm 2 of 2',role:'work',distanceKm:workKm/2,paceSeconds:eventPace,pace:range(eventPace-5,eventPace+5)}];
   const spare=Number((km-warm-cool-recoveryKm-workKm).toFixed(3));
   if(spare>.001)steps.push({label:'Easy aerobic running',role:'easy',distanceKm:spare,pace:range(p.easyLow,p.easyHigh)});
   steps.push({label:'Cool-down',role:'easy',distanceKm:cool,pace:range(p.easyLow,p.easyHigh)});
   let reminder=buildRun('Taper race-rhythm reminder','quality-run',steps,p,{workoutFamily:'taper-race-rhythm',paceBasis:{method:'current-performance-equivalent',racePaceSeconds:eventPace,goalPaceSeconds:Number(c.runningGoalSeconds)>0?Number(c.runningGoalSeconds)/eventDistance:null,goalSupported:Number(c.runningGoalSeconds)>0?Number(c.runningGoalSeconds)/eventDistance>=eventPace:null},reason:'A short current-fitness pace reminder inside reduced easy volume; finish fresh, with no extra repetitions or faster goal-pace testing.'});
   const window=(c.runVisitWindows||[]).find(x=>x.kind==='quality');
   if(Number(window?.minutes)>0){const fitted=fitRunToMinutes(reminder,Number(window.minutes));reminder=fitted.feasible?fitted.run:null;}
   if(reminder)runs[0]=reminder;
  }
 }

 if(eventPace&&Number(c.runningGoalSeconds)>0&&Number(c.runningGoalSeconds)/eventDistance<eventPace)warnings.push('Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.');
 if(longCapLimited)warnings.push('Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.');
 if(goal==='marathon'&&phase==='Specific preparation'&&!deload&&!taper&&(requestedKm<40||longKm<20))warnings.push('Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.');
 if(goal==='marathon'&&!longReference)warnings.push('Confirm recent long-run distance, duration and recovery before approving marathon long-run progression.');
 if(supportEndurance&&!longReference)warnings.push('Confirm recent long-run distance and recovery before extending the endurance-support long run; a past marathon does not establish present long-run readiness.');
 const halfEnduranceReview=goal==='half'&&phase==='Specific preparation'&&until!==null&&until<=4&&longKm<14;
 if(halfEnduranceReview)warnings.push('Half-marathon preparation review: long-running exposure remains modest. Review a completion-led run/walk strategy, recovery and supporting mileage before approving the final specific block.');
 const actualKm=Number(sum(runs.map(r=>r.distanceKm)).toFixed(3)),hard=sum(runs.flatMap(r=>r.steps).filter(work).map(s=>s.distanceKm));
 if(runtime)for(const run of runs){
  const task=run.role==='quality-run'?'quality':run.role==='long-run'?'long':'easy',decision=tasks[task];
  run.coachingRationale={policy:'runtime-coaching-v1',task,recovery:decision,paceBasis:p?'Current reported performance equivalent; easy effort still governs in heat, hills or fatigue.':'No defensible current pace baseline; use conversational effort.',progression:'Planned increases are conditional on completed dose, adherence and recovery. Review recurring patterns before approving a changed programme; never catch up missed kilometres.'};
  run.coachNote=[run.coachNote,...decision.reasons,'Future planned increases are conditional; review actual completed running and next-day response.'].filter(Boolean).join(' ');
 }
 const qualityLimit=goal==='marathon'&&phase==='Specific preparation'?.30:.20;
 if(hard>actualKm*qualityLimit+.01)blocking.push('Quality running exceeds the actual weekly intensity budget; review required.');
 const longest=Math.max(...runs.map(r=>r.minutes||0));
 const longDurationReview=goal==='marathon'&&runs.some(r=>r.role==='long-run'&&r.minutes>210);
 if(longDurationReview)warnings.push('This long-run rehearsal exceeds 3.5 hours. Its use is conditional on recovery, fuelling tolerance and an agreed visit window; review duration versus distance instead of forcing 30 km or a fixed percentage.');
 return {runs,warnings:[...warnings,...blocking],blocking,feasible:!blocking.length,reviewRequired:!!(warnings.length||blocking.length),requestedKm,allocatedKm:actualKm,actualKm,km:requestedKm,factor,phase,preparationMode:supportEndurance?'endurance-support':raceWeek?'dated-event':'base-building',supportEndurance,...(refined||runtime?{recoveryContext:recovery}:{}),...(runtime?{baselineCurrent:!!baselineCurrent,eventPaceAvailable,reportedPerformance:!!reportedPerformance,progressionEvidence:c.runningDoseEvidence||null,progressionStatus:tasks.easy.canProgress&&returnDoseCap===null?'conditional-planned-build':'familiar-dose-pending-review'}:{}),progressionLimited:longCapLimited,deload,taper,remaining:until===null?null:until+1,longShare:actualKm&&(!noLong||familiarLong)?longKm/actualKm:0,longKm:noLong&&!familiarLong?0:longKm,qualityAllowed,
  reviewGates:{baselineConfirmed:!!h.base,longRunHistoryConfirmed:!!longReference,recoveryCheckRequired:recoveringMarathon||postRace||strengthEventWeek||(strengthRecoveryWeek&&supportEndurance)||(refined&&recovery.longRunRecoveryReview),...(refined?{longRunRecoveryReview:recovery.longRunRecoveryReview,longRunDurationReview:recovery.longRunDurationReview}:{}),marathonEnduranceReview:goal==='marathon'&&phase==='Specific preparation'&&!deload&&!taper&&(requestedKm<40||longKm<20),halfEnduranceReview,handoverProgressionReview:handoverEnduranceBuild,longDurationReview},
  fuelling:longest>=75?['Practise carbohydrate and fluid intake during long runs, rather than introducing it on race day. Start with familiar small portions totalling about 30 g carbohydrate/hour; progress towards 45–60 g/hour on longer rehearsals if tolerated.','Drink to conditions and thirst; record what you actually tolerate. Use the same foods/drinks in later race rehearsals.']:[],
  qualityBudget:{workKm:Number(hard.toFixed(3)),weeklyKm:actualKm,maximumShare:qualityLimit,domain:goal==='marathon'&&phase==='Specific preparation'?'marathon-pace rehearsal':'threshold and faster'},
  policyNote:'Progression percentages, duration limits and endurance review points are adjustable planning defaults, not universal safety thresholds or performance guarantees.'};
}
const api={assess,history,recoveryContext,paceSet,buildRun,fitRunToMinutes,prepareEvidence,resolveAerobicBuild,integratedFitnessFrequency,runningSymptomReview};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFRunningPreparation=api;
})(typeof globalThis!=='undefined'?globalThis:this);
