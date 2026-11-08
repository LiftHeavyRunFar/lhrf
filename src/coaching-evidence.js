/* Frozen proposal evidence. No storage, network, history mutation or readiness diagnosis. */
(function(root){'use strict';
const DAY=86400000,norm=value=>String(value||'').trim().toLowerCase(),clone=value=>JSON.parse(JSON.stringify(value));
function date(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value)||!Number.isFinite(Date.parse(value)))return null;const day=value.slice(0,10);return new Date(day+'T12:00:00Z').toISOString().slice(0,10)===day?day:null;}
const time=value=>date(value)?Date.parse(value.length===10?value+'T00:00:00Z':value):NaN;
function validSet(row,asOf,{practice=false,generic=false}={}){
 const when=time(row.date),rpe=Number(row.rpe),reps=Number(row.reps),kg=Number(row.weight);
 const validDose=Number.isFinite(reps)&&reps>0&&(generic&&row.doseUnit==='seconds'||Number.isInteger(reps)&&(generic||reps<=8)),validLoad=Number.isFinite(kg)&&(kg>0||generic&&kg===0&&['bodyweight','assistance-kg'].includes(row.loadType));
 return Number.isFinite(when)&&when<=asOf&&asOf-when<=42*DAY&&validLoad&&validDose&&rpe>=1&&rpe<=10&&row.completed!==false&&!row.skipped&&!row.failed&&!row.techniqueFailed&&!row.warmup&&!row.warmUp&&!row.optional&&!row.unreliable&&![row.role,row.setRole,row.category].some(x=>['warmup','warm-up','optional','failed'].includes(norm(x)))&&(practice||row.rpeReliable!==false&&!row.evidenceReview?.rpe?.approximate)&&row.evidenceReview?.rpe?.value!==null;
}
function purpose(row,state){
 const aliases={heavy:'heavy',strength:'strength',volume:'volume',speed:'speed',technique:'speed',practice:'speed',recovery:'recovery',maintenance:'maintenance'},values=[];
 const add=meta=>{for(const key of ['trainingPurpose','trainingRole','benchRole'])if(meta?.[key])values.push(aliases[norm(meta[key])]||'ambiguous');};add(row);
 if(row.evidenceReview?.rpe?.purpose)add({trainingPurpose:row.evidenceReview.rpe.purpose});
 const base=id=>String(id||'').replace(/::strength$/,'');
 for(const done of state.completedWorkouts||[])if(base(done.id)===base(row.sessionId)&&date(done.date)===date(row.date))for(const ex of done.prescription?.ex||[])if(norm(ex[0])===norm(row.exercise)&&(!row.role||!ex[5]?.role||row.role===ex[5].role))add(ex[5]);
 const unique=[...new Set(values)];return unique.length===1&&unique[0]!=='ambiguous'?unique[0]:unique.length?'ambiguous':null;
}
function strengthIdentity(raw,meta,inventory,linked){
 const keys=['exerciseId','variantId','loadType','doseUnit'];
 const recorded=Object.fromEntries(keys.map(key=>[key,raw[key]||meta[key]||null]));
 if(!linked||inventory?.venueId&&inventory.venueId!=='unknown'||keys.some(key=>recorded[key])||!['bench','squat','deadlift'].includes(norm(raw.exercise)))return recorded;
 const registry=typeof module==='object'&&module.exports?require('./exercise-registry.js'):root.LHRFExercises;
 const standard=registry?.identity(raw.exercise);
 return standard?{...standard,setupSource:'Exact legacy main lift and role in a completed prescription; commercial kit, venue unverified'}:recorded;
}
function capture(config,{data={},now=Date.now()}={}){
 const asOf=typeof now==='function'?Number(now()):Number(now),strength={},observations=[],invalid=[];
 for(const lift of new Set(['Squat','Bench','Deadlift',...(data.sets||[]).map(row=>String(row.exercise||'').trim()).filter(Boolean)])){
  const seen=new Set(),rows=[];
  for(const raw of data.sets||[]){if(norm(raw.exercise)!==norm(lift)||!validSet(raw,asOf,{practice:true,generic:true}))continue;
   const key=JSON.stringify([raw.date,raw.sessionId,raw.set,raw.exercise,raw.weight,raw.reps,raw.rpe,raw.role,raw.variantId]);if(seen.has(key))continue;seen.add(key);
   const typedPurpose=purpose(raw,data),review=raw.evidenceReview?.rpe,reliable=raw.rpeReliable!==false&&!review?.approximate;
   if(typedPurpose==='ambiguous')continue;
   const base=id=>String(id||'').replace(/::strength$/,''),saved=(data.completedWorkouts||[]).filter(done=>base(done.id)===base(raw.sessionId)&&date(done.date)===date(raw.date)).flatMap(done=>done.prescription?.ex||[]).filter(ex=>norm(ex[0])===norm(raw.exercise)&&ex[5]?.role===raw.role),meta=saved.length===1?saved[0][5]:{};
   rows.push({date:raw.date,set:raw.set??null,exercise:lift,kg:Number(raw.weight),reps:Number(raw.reps),rpe:Number(raw.rpe),target:Number(raw.target)||null,role:raw.role||null,purpose:typedPurpose,reliable,unreliable:raw.rpeReliable===false,approximate:!!review?.approximate,execution:raw.execution||meta.execution||null,executionSource:raw.execution?'recorded or explicitly reviewed':meta.execution?'saved-prescription-intent':null,competition:raw.competition===true||meta.competition===true,...strengthIdentity(raw,meta,data.equipmentInventory??config.equipmentInventory,saved.length===1),...(review?{review:clone(review)}:{})});
  }
  rows.sort((a,b)=>time(a.date)-time(b.date));strength[lift]={rows:rows.slice(-24),evidenceHorizonDays:42,note:'Evidence horizon is a planning default, not biological expiry. Low/approximate effort is practice context, never a maximum.'};
 }
 const add=(raw,defaults={})=>{if(!raw)return;const observedAt=raw.observedAt||raw.reportedAt||raw.date,when=time(observedAt);
  const status=norm(raw.status),negative=['lower','all','fatigue','accumulating-fatigue','recovery-review','unrecovered','poor','worsening','pain','restricted'].includes(status),positive=['normal','recovered','ready','comfortable'].includes(status)||raw.resolved===true||raw.cleared===true;
  const text=String(raw.symptoms||raw.pain||'').trim(),negated=text.replace(/\bno (?:pain|symptoms|discomfort)(?: or (?:pain|discomfort|symptoms))?\b/ig,'').trim(),symptom=['none','no','normal','false'].includes(norm(negated))?'':negated,safety=status==='worsening'||status==='pain'||raw.safetyConcern===true||raw.worsening===true||/pain|illness|severe|worsen|limp|dizz/i.test(symptom);
  const observation={date:observedAt||null,sport:raw.sport||defaults.sport||'all',task:raw.task||defaults.task||'all',scope:raw.scope||defaults.scope||null,lifts:raw.affectedLifts||raw.lifts?.filter(x=>typeof x==='string')||(raw.lift?[raw.lift]:defaults.lifts)||[],status:safety?'safety':negative||symptom?'adverse':positive?'normal':'unknown',nextDayResponse:raw.nextDayResponse||raw.responseNextDay||null,referencePerformanceDate:raw.referencePerformanceDate||null,eventDate:raw.eventDate||null,source:defaults.source||'recovery observation',symptoms:symptom||null};
  if(!Number.isFinite(when)||when>asOf){invalid.push({...observation,recordedAt:raw.recordedAt||new Date(asOf).toISOString(),invalidTiming:Number.isFinite(when)?'future':'missing-or-invalid',reason:'Undated, invalid or future recovery observation cannot establish readiness; a reported concern still needs scoped review.'});return;}
  observations.push(observation);
 };
 const context=config.recoveryContext;
 add(context,{source:'recoveryContext',sport:'all',scope:context?.status==='lower'?'lower':null});
 const evidence=config.recoveryEvidence;
 add(evidence,{source:'recoveryEvidence',sport:evidence?.affectedLifts?.length?'strength':'all'});
 if(evidence?.runningFatigue)add({...evidence,status:'fatigue',affectedLifts:undefined},{source:'running fatigue evidence',sport:'running'});
 if(evidence?.lowerBodyFatigue)add({...evidence,status:'fatigue',affectedLifts:undefined},{source:'lower-body fatigue evidence',sport:'all',scope:'lower'});
 for(const entry of evidence?.lifts||[])if(typeof entry==='object')add({...entry,observedAt:entry.observedAt||evidence.observedAt},{source:'lift recovery evidence',sport:'strength'});
 for(const observation of [...(config.recoveryObservations||[]),...(evidence?.observations||[])])add(observation,{source:'task recovery observation'});
 // Actual app feedback can add a concern, never positive readiness. Scope is
 // taken only from its preserved completed prescription, not guessed anatomy.
 for(const [source,rows]of [['session feedback',data.sessionFeedback||[]],['check-in',data.checkins||[]]])for(const row of rows){
  const text=String(row.symptoms||'').replace(/\bno (?:pain|symptoms|discomfort)(?: or (?:pain|discomfort|symptoms))?\b/ig,'').trim(),safety=row.pain===true||row.injury===true||row.worsening===true||row.illness===true||row.safetyConcern===true||/pain|injur|worsen|illness|severe|limp|dizz/i.test(text),discomfort=norm(row.discomfort)==='yes';
  if(!safety&&!discomfort)continue;
  const base=id=>String(id||'').replace(/::(?:strength|run)$/,''),when=time(row.date),linked=(data.completedWorkouts||[]).filter(done=>row.sessionId&&base(done.id)===base(row.sessionId)&&(!row.week||Number(done.week)===Number(row.week))&&time(done.date)<=when).sort((a,b)=>time(a.date)-time(b.date)).at(-1),prescription=linked?.prescription,ex=prescription?.ex||[],runs=prescription?.runs||[],lifts=[...new Set(ex.filter(e=>['Squat','Bench','Deadlift'].includes(e[0])).map(e=>e[0]))];
  const precise=ex.length===1&&!runs.length&&lifts.length===1,scope=ex.length&&!runs.length?{sport:'strength',affectedLifts:precise?lifts:[]}:runs.length&&!ex.length?{sport:'running'}:{sport:'all'};
  add({date:row.date,status:safety?'pain':'fatigue',...scope,symptoms:safety?text||'Structured safety concern':null},{source:source+(precise?' linked to saved completed prescription':' with unknown location; clarify the affected activity')});
 }
 const performances=[];
 const runs=config.runningDoseEvidence?.recentActivities??data.runs??[];
 for(const raw of runs){const when=time(raw.date),minutes=Number(raw.minutes??raw.min);if(!Number.isFinite(when)||when>asOf||asOf-when>42*DAY||raw.completed===false||raw.failed||raw.unreliable||raw.rpeReliable===false||raw.effortReliable===false||raw.evidenceReview?.rpe?.approximate||!(Number(raw.km)>0&&minutes>0))continue;const type=norm(raw.type||raw.role);performances.push({date:raw.date,sport:'running',task:/quality|interval|threshold|tempo|race/.test(type)?'quality':/long/.test(type)?'long':'easy',km:Number(raw.km),minutes,rpe:Number(raw.rpe)||null});}
 for(const [lift,proof]of Object.entries(strength))if(['Squat','Bench','Deadlift'].includes(lift))for(const row of proof.rows)if(row.reliable&&row.reps<=8)performances.push({date:row.date,sport:'strength',task:row.reps<=3&&row.rpe>=7&&row.purpose!=='speed'?'heavy':'lifting',lift,kg:row.kg,reps:row.reps,rpe:row.rpe});
 const events=[],profile=config.runProfile||{},races=[config.runningHistory?.recentRace,profile.recentRace,config.recentRace,...(Number(profile.distance)>=40&&Number(profile.seconds)>0&&profile.effort==='performance'?[{distanceKm:Number(profile.distance),date:profile.resultDate}]:[])];
 const marathonDates=[config.runningHistory?.recentMarathonDate,profile.recentMarathonDate,config.recentMarathonDate,...races.filter(r=>Number(r?.distanceKm)>=40).map(r=>r.date)].filter(value=>date(value)&&time(value)<=asOf).map(date);
 for(const marathon of new Set(marathonDates))events.push({date:marathon,sport:'running',goal:'marathon'});
 for(const goal of config.orderedGoals||[])if(date(goal.date))events.push({date:goal.date,sport:goal.sport,goal:goal.runGoal||goal.goal||'event'});
 if(date(config.runningTargetDate))events.push({date:config.runningTargetDate,sport:'running',goal:config.runGoal||'event'});
 const uniqueEvents=[...new Map(events.map(e=>[JSON.stringify([e.date,e.sport,norm(e.goal)]),e])).values()].sort((a,b)=>a.date.localeCompare(b.date)||String(a.sport).localeCompare(String(b.sport))||String(a.goal).localeCompare(String(b.goal)));
 return {version:1,asOf:new Date(asOf).toISOString(),strength,recovery:{observations,performances,events:uniqueEvents,invalid},originalHistoryUnchanged:true};
}
function recovery(config,{atDate,now=Date.now(),sport='strength',task='lifting',lift}={}){
 const packet=config.coachingEvidence,asOf=Math.min(typeof now==='function'?Number(now()):Number(now),time(packet?.asOf)),when=time(atDate||packet?.asOf),base={status:'normal',restriction:'none',canProgress:true,reviewRequired:false,eventDate:null,observedAt:null,reassessment:'Review the next comparable completed session and its next-day response.',reasons:[],evidence:[]};
 if(!packet||!Number.isFinite(asOf)||!Number.isFinite(when))return {...base,status:'review',canProgress:false,reviewRequired:true,reasons:['Dated frozen proposal evidence is missing.']};
 const relevant=o=>(o.sport==='all'||o.sport===sport)&&(!o.scope||o.scope!=='lower'||sport==='running'||lift!=='Bench')&&(!o.lifts.length||sport==='strength'&&o.lifts.some(x=>norm(x)===norm(lift)))&&(o.task==='all'||o.task===task||sport==='strength'&&task==='lifting'&&o.task==='heavy'||o.status!=='normal'&&(sport==='strength'&&task==='heavy'&&o.task==='lifting'||sport==='running'&&o.task==='easy'));
 const observations=packet.recovery.observations.filter(o=>time(o.date)<=asOf&&time(o.date)<=when&&relevant(o)).sort((a,b)=>time(a.date)-time(b.date)),latest=observations.at(-1);
 const events=packet.recovery.events.filter(e=>e.sport==='running'&&['marathon','half'].includes(norm(e.goal))&&time(e.date)<when).sort((a,b)=>time(a.date)-time(b.date)),event=events.at(-1),eventDays=event?(when-time(event.date))/DAY:null,eventAge=event?Math.max(0,(asOf-time(event.date))/DAY):null;
 const reasons=[],invalid=packet.recovery.invalid||[];
 const finish=extra=>({...base,...extra,eventDate:event?.date||null,observedAt:extra.observedAt??latest?.date??null,reasons:[...reasons,...(extra.reasons||[])],evidence:extra.evidence||observations.map(clone)});
 const uncertain=invalid.filter(o=>relevant(o)&&['safety','adverse'].includes(o.status));
 const uncertainReview=()=>finish({status:'review',restriction:uncertain.some(o=>o.status==='safety'&&o.invalidTiming!=='future')?'hold':'bounded',canProgress:false,reviewRequired:true,reasons:['A task-relevant concern has uncertain timing. Clarify its date and current symptoms before loading; missing timing is not recovery clearance. A later completed task and explicit subsequent response must follow when the concern was documented.'],evidence:uncertain.map(clone)});
 const laterRoutine=event&&sport==='strength'&&packet.recovery.performances.some(p=>p.sport==='strength'&&p.lift===lift&&p.rpe>=6&&p.rpe<=8&&time(p.date)>time(event.date)+(norm(event.goal)==='marathon'?21:7)*DAY&&time(p.date)<=asOf&&time(p.date)<=when);
 if(latest){
  const concern=observations.filter(o=>['safety','adverse'].includes(o.status)).at(-1);
  const concernWhen=Math.max(Number.isFinite(time(concern?.date))?time(concern.date):-Infinity,...uncertain.map(o=>time(o.recordedAt)).filter(Number.isFinite));
  // A later coarse normal check-in is benign context, not a veto of a valid
  // task-specific response. A later concern still invalidates the older proof.
  for(const report of observations.slice().reverse()){
   const afterEvent=!event||time(report.date)>time(event.date),scoped=report.task===task||(sport==='strength'&&task==='lifting'&&report.task==='heavy'),normalResponse=['normal','no-worsening'].includes(norm(report.nextDayResponse));
   if(report.status!=='normal'||!afterEvent||!scoped||!normalResponse||report.eventDate&&report.eventDate!==event?.date)continue;
   const completed=packet.recovery.performances.filter(p=>p.sport===sport&&(!lift||p.lift===lift)&&p.task===task&&time(p.date)<=time(report.date)&&time(p.date)>concernWhen&&(!event||time(p.date)>time(event.date))&&(!report.referencePerformanceDate||date(p.date)===date(report.referencePerformanceDate))).sort((a,b)=>time(a.date)-time(b.date)),performance=completed.at(-1),nextDay=performance&&(time(date(report.date))-time(date(performance.date)))===DAY,tolerated=!!(performance&&nextDay&&(sport!=='running'||performance.rpe!==null&&performance.rpe<=(task==='easy'?4:8))),conflicting=observations.some(o=>date(o.date)===date(report.date)&&['safety','adverse'].includes(o.status));
   if(!tolerated||conflicting)continue;
   if(sport==='strength'&&task==='lifting'&&performance.rpe<6)return finish({observedAt:report.date,status:'rebuild',restriction:'bounded',canProgress:false,reviewRequired:true,reasons:['Comfortable light practice supports repeating that familiar dose only. It does not establish higher repetitions, more sets or demanding work.']});
   return finish({observedAt:report.date,familiarTaskSupported:true,canProgress:sport!=='strength'||task==='heavy',reviewRequired:sport==='strength'&&task==='lifting',reasons:['A dated task-specific normal subsequent response corroborates completed comparable activity; this supports this familiar task only, not higher volume or intensity.']});
  }
  if(uncertain.length)return uncertainReview();
  const unresolved=observations.filter(o=>['safety','adverse'].includes(o.status)),unknownLocation=unresolved.some(o=>o.source.includes('unknown location'));
  if(unresolved.some(o=>o.status==='safety'))return finish({status:'restricted',restriction:'hold',canProgress:false,reviewRequired:true,reasons:['A dated task-relevant safety concern needs prompt assessment; an unknown or unsupported normal answer or later event does not clear provoking work.'+(unknownLocation?' Its location is not recorded; clarify the affected activity without inferring a diagnosis.':'')]});
  if(unresolved.length)return finish({status:'review',restriction:'bounded',canProgress:false,reviewRequired:true,reasons:['The task-relevant recovery concern has not been resolved by later comparable evidence; elapsed event days or an unknown report do not clear it.'+(unknownLocation?' Its location is not recorded; clarify which activity is affected.':'')]});
  if(latest.status==='normal'&&event&&time(latest.date)>time(event.date)&&!(sport==='strength'&&lift==='Bench')&&!laterRoutine)return finish({status:'rebuild',restriction:'bounded',canProgress:false,reviewRequired:true,reasons:['The normal report is useful context but does not establish this task and dose with a normal next-day response.']});
 }
 if(uncertain.length)return uncertainReview();
 if(event&&eventDays<=2)return finish({status:'restricted',restriction:'hold',canProgress:false,reviewRequired:true,reasons:['Initial post-event rest is a planning precaution; review actual symptoms and task readiness before return.']});
 if(event&&sport==='strength'&&lift==='Bench')return finish({status:'review',restriction:'none',canProgress:false,reviewRequired:true,reasons:['After initial systemic rest, the endurance event alone does not justify a continuing upper-body restriction. Preserve familiar nonprovoking work and review setup, systemic recovery and subsequent response before progression.']});
 if(laterRoutine)return finish({status:'normal',restriction:'none',familiarTaskSupported:true,canProgress:false,reviewRequired:true,reasons:['Later current same-lift practice supports repeating its familiar working dose. It is current performance evidence, not clearance from advancing the event clock; additional volume or intensity needs review.']});
 if(event&&(sport==='strength'||eventAge<=(norm(event.goal)==='marathon'?21:7)))return finish({status:'rebuild',restriction:'bounded',canProgress:false,reviewRequired:true,reasons:['Recent endurance event with incomplete task-specific return evidence; preserve a bounded familiar option and review, rather than assuming full recovery. Future calendar weeks do not supply new return evidence.']});
 if(event||latest?.status==='unknown'||invalid.some(relevant))return finish({status:'review',restriction:'none',canProgress:false,reviewRequired:true,reasons:['Historical event or incomplete report is context requiring review, not a permanent task ban or proof of full readiness. Preserve familiar training without assuming further progression.']});
 return finish({});
}
function anchor(config,{exercise,purpose:requested,reps,target,execution,variantId}={}){
 const packet=config.coachingEvidence,proof=packet?.strength?.[exercise],rows=(proof?.rows||[]).filter(row=>(!variantId||row.variantId===variantId)&&(!execution||row.execution===execution));
 const purposeMatch=row=>row.purpose===requested||(requested==='speed'&&row.purpose==='speed'),eligible=rows.filter(row=>!row.unreliable&&purposeMatch(row)&&row.reps===reps&&row.rpe<=target&&row.rpe>=target-2&&(row.reliable||requested==='speed'&&row.approximate&&row.review?.source==='athlete-confirmation'));
 const latest=eligible.at(-1);if(!latest)return null;
 return {...clone(latest),suggestedKg:latest.kg,confidence:latest.reliable?'reported-compatible-practice':'approximate-practice-only',automaticIncrease:false,velocityMeasured:false,reason:'Repeat a familiar same-purpose load within the prescribed effort ceiling; it is not a maximum, velocity measurement or guaranteed RPE.'};
}
const api={capture,recovery,anchor,validSet,date};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFCoachingEvidence=api;
})(typeof globalThis!=='undefined'?globalThis:this);
