/* Visit-level constraints for new proposals. Pure/offline; saved athlete state is never changed. */
(function(root){
'use strict';
const running=typeof module==='object'&&module.exports?require('./running-preparation.js'):root.LHRFRunningPreparation;
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const short=x=>String(x).slice(0,3),clone=x=>JSON.parse(JSON.stringify(x));
const lower=x=>/squat|deadlift/i.test(x.name||x[0]||'');
function combinations(items,n){if(n===0)return [[]];if(n<0||n>items.length)return [];const out=[];for(let i=0;i<=items.length-n;i++)for(const tail of combinations(items.slice(i+1),n-1))out.push([items[i],...tail]);return out}
function permutations(items,n){if(n===0)return [[]];const out=[];for(let i=0;i<items.length;i++)for(const rest of permutations(items.filter((_,j)=>i!==j),n-1))out.push([items[i],...rest]);return out}
// Relative scheduling costs, not physiological readiness scores. A continuous
// distance kernel permits consecutive work when availability/dose warrants it.
// The cyclic term includes Sunday -> Monday rather than resetting recovery weekly.
function weeklyStress(c,slots,context={}){
 const exposures={},loads=slots.map(s=>({lower:0,upper:0,run:0,lifts:{}}));
 const recovering=new Set(context.recoveryLifts||[]);
 for(let d=0;d<slots.length;d++)for(const x of slots[d].items){
  if(x.type==='strength'){
   const occurrence=exposures[x.name]||0;exposures[x.name]=occurrence+1;
   const mode=c.strengthModes?.[x.name]||c.strengthMode,light=(c.lightLifts||[]).some(n=>String(n).toLowerCase()===x.name.toLowerCase());
   const easy=light||['beginner','novice','returning'].includes(c.trainingAge)||mode==='maintenance';
   const intensity=Number.isFinite(x.schedulingDemand)?x.schedulingDemand:light?.2:easy?.45:occurrence>=2?.25:occurrence===1?1:1.15;
   const demand=recovering.has(x.name)?Math.min(intensity,.35):intensity;
   loads[d][lower(x)?'lower':'upper']+=demand;loads[d].lifts[x.name]=demand;
  }else{
   const health=c.runGoal==='fitness',quality=!health&&/Quality/.test(x.detail),long=!health&&/Long run/.test(x.detail);
   const history=c.runningHistory?.longRun,minutes=long?Number(history?.minutes):0;
   // Observed long-run duration changes interference cost, never a prescription.
   const duration=minutes>0?Math.max(.5,Math.sqrt(minutes/90)):1;
   loads[d].run+=(Number.isFinite(x.schedulingDemand)?x.schedulingDemand:quality?.9:long?.75*duration:health?.12:.2);
  }
 }
 let score=0;
 for(let i=0;i<7;i++){
  const a=loads[i];score+=a.lower*a.run*8+a.upper*a.upper*.15;
  for(let j=i+1;j<7;j++){
   const b=loads[j],gap=j-i,kernel=1/gap**2+1/(7-gap)**2;
   const same=Object.keys(a.lifts).reduce((n,k)=>n+(a.lifts[k]||0)*(b.lifts[k]||0),0);
   score+=kernel*(8*a.lower*b.lower+2*same+5*(a.lower*b.run+b.lower*a.run)+2*a.run*b.run+a.upper*b.upper*.5);
  }
 }
 // Reuse the canonical final-exposure selection; do not invent new taper windows.
 const finals=context.finalHeavyDates?.(slots)||[];
 for(let i=0;i<finals.length;i++)for(let j=i+1;j<finals.length;j++){
  const gap=Math.abs(Date.parse(finals[i])-Date.parse(finals[j]))/86400000;
  score+=4/(1+gap)**2;
 }
 return score;
}
function allocate(c,warnings=[],activities=[],context={}){
 const cfg=c.visitConstraints||{},allowed=DAYS.filter(d=>(c.availableDays?.length?c.availableDays.map(short):DAYS).includes(d)),slots=()=>DAYS.map(day=>({day,items:[]}));
 const work=activities.map((x,i)=>({...x,componentId:'component-'+i})),strength=work.filter(x=>x.type==='strength'),runs=work.filter(x=>x.type==='run');
 const combined=new Set((cfg.combinedDays||(Number(c.sessionTimeVersion)>=1?c.doubleDays:[])||[]).map(short)),separate=new Set((cfg.separateDays||[]).map(short));
 // New strength-first health programmes use the available lifting windows.
 // Their easy runs do not need race-quality placement or long-run leg protection.
 // Saved proposals without this marker keep their original calendar.
 const strengthFirstHealth=Number(c.visitAllocationVersion)>=1&&c.runGoal==='fitness'&&c.priority!=='Running'&&c.hybridFocus!=='running';
 const requested=Number(cfg.strengthVisits),visits=strength.length?(Number.isInteger(requested)&&requested>0?requested:Math.max(...['Squat','Bench','Deadlift'].map(name=>strength.filter(x=>x.name===name).length))):0;
 const fail=reason=>{const unscheduled=work.map(x=>({...x,reason}));return {slots:slots(),warnings:[...warnings,reason],total:work.length,scheduled:0,unscheduled,feasible:false}};
 if(visits>allowed.length||runs.length>allowed.length||visits<Math.max(0,...['Squat','Bench','Deadlift'].map(name=>strength.filter(x=>x.name===name).length)))return fail('Requested visit and lift/run frequencies cannot fit the available days.');
 const longIndex=runs.length?Math.max(0,runs.findIndex(x=>/Long run|Longer easy/.test(x.detail))>=0?runs.findIndex(x=>/Long run|Longer easy/.test(x.detail)):runs.length>=2?1:0):-1;
 if(longIndex>=0)runs[longIndex].detail='Long run · protected endurance';
 // A fixed split is an explicit athlete choice, never a suggestion to reshuffle silently.
 if(c.manualSplit||c.fixedSessions?.length){
  const out=slots(),pending=work.slice(),unscheduled=[];
  const assign=(day,type,name,long)=>{const at=pending.findIndex(x=>x.type===type&&(!name||x.name===name));if(at<0)return false;const item=pending.splice(at,1)[0],slot=out.find(s=>s.day===short(day));if(long)item.detail='Long run · protected endurance';if(!slot||!allowed.includes(slot.day)||slot.items.some(x=>x.name===item.name)){unscheduled.push({...item,reason:'Fixed assignment conflicts with availability or duplicates a lift/run'});return false}slot.items.push(item);return true};
  if(c.manualSplit){for(const [day,items]of Object.entries(c.manualSplit))for(const item of items){if(item==='lower'){for(const lift of ['Squat','Deadlift'])if(Number(c[lift.toLowerCase()])>0)assign(day,'strength',lift)}else if(item==='bench')assign(day,'strength','Bench');else if(item==='run'||item==='long')assign(day,'run',null,item==='long')}}
  else for(const f of c.fixedSessions)assign(f.day,f.kind==='run'?'run':'strength',f.kind==='run'?null:({squat:'Squat',bench:'Bench',deadlift:'Deadlift'}[String(f.lift).toLowerCase()]),f.runType==='long');
  for(const item of pending)unscheduled.push({...item,reason:'Requested frequency has no fixed visit assignment'});
  for(const s of out){const lift=s.items.some(x=>x.type==='strength'),run=s.items.some(x=>x.type==='run');if(lift&&run&&(!combined.has(s.day)&&!separate.has(s.day)||s.items.some(x=>/Long run/.test(x.detail))))unscheduled.push({name:s.day,reason:'Fixed mixed visit is not permitted or conflicts with the protected long run'})}
  if(out.filter(s=>s.items.some(x=>x.type==='strength')).length!==visits)unscheduled.push({name:'Strength visits',reason:'Fixed split differs from the requested number of strength visits'});
  return {slots:out,warnings:[...warnings,...unscheduled.map(x=>x.reason)],total:work.length,scheduled:work.length-pending.length,unscheduled,feasible:!unscheduled.length};
 }
 let best=null,legacyBest=null;
 const required=context.requiredStrengthDays||{},requiredDays=Object.values(required);
 const strengthOrder=strength.slice().sort((a,b)=>Number(lower(b))-Number(lower(a)));
 if(c.competitionConditionalVersion===1&&requiredDays.length){
  // Reserve each explicit visit before unpinned work occupies it. Repeated
  // exposures of a pinned lift still use the ordinary scheduling order.
  const firstPinned=new Set(Object.keys(required).map(lift=>strengthOrder.find(item=>item.name===lift)));
  strengthOrder.sort((a,b)=>Number(firstPinned.has(b))-Number(firstPinned.has(a)));
 }
 for(const strengthDays of combinations(allowed,visits))for(const runDays of permutations(allowed,runs.length)){
  if(requiredDays.some(day=>!strengthDays.includes(day)))continue;
  if(longIndex>=0&&c.longRunDay&&runDays[longIndex]!==short(c.longRunDay))continue;
  if(runDays.some((day,i)=>strengthDays.includes(day)&&(!combined.has(day)&&!separate.has(day)||i===longIndex)))continue;
  if(new Set([...strengthDays,...runDays]).size>(Number(c.days)||7))continue;
  const out=slots();runs.forEach((x,i)=>out.find(s=>s.day===runDays[i]).items.push(x));
  let score=0,valid=true;
  const pinned=new Set();
  // Place repeated lifts on distinct visits; prefer lower work away from the long run.
  for(const item of strengthOrder){
   const pin=pinned.has(item.name)?null:required[item.name];
   const choices=strengthDays.map(day=>out.find(s=>s.day===day)).filter(s=>(!pin||s.day===pin)&&!s.items.some(x=>x.type==='strength'&&x.name===item.name));
   choices.sort((a,b)=>{
    const rank=s=>{const i=DAYS.indexOf(s.day),long=longIndex>=0?DAYS.indexOf(runDays[longIndex]):-9,others=s.items.filter(x=>x.type==='strength'),adjacent=out.some(x=>Math.abs(DAYS.indexOf(x.day)-i)===1&&x.items.some(y=>y.type==='strength'&&y.name===item.name));return others.length*3+(!strengthFirstHealth&&lower(item)&&((long-i+7)%7===1)?24:0)+(lower(item)&&others.some(lower)?7:0)+(adjacent?12:0)+(s.items.some(x=>x.type==='run')&&!separate.has(s.day)?4:0)+i*.02};return rank(a)-rank(b)
   });
   if(!choices.length){valid=false;break}choices[0].items.push(item);if(pin)pinned.add(item.name);
  }
  if(!valid||strengthDays.some(day=>!out.find(s=>s.day===day).items.some(x=>x.type==='strength')))continue;
  for(const s of out){const i=DAYS.indexOf(s.day),ss=s.items.filter(x=>x.type==='strength'),cap=Number(cfg.minutes?.[s.day]);score+=ss.length**2*(strengthFirstHealth&&cap>0?75/cap:1);if(!strengthFirstHealth&&ss.some(lower)&&longIndex>=0&&(DAYS.indexOf(runDays[longIndex])-i+7)%7===1)score+=40;if(ss.length&&s.items.some(x=>x.type==='run')&&!separate.has(s.day))score+=2;}
  // Quality early in the week, then supporting easy running; Sunday remains protected.
  if(!strengthFirstHealth)runDays.forEach((day,i)=>{if(i!==longIndex){const preferred=i===0?1:3;score+=Math.abs(DAYS.indexOf(day)-preferred)*2}});
  score+=out.reduce((n,s)=>n+(s.items.length?DAYS.indexOf(s.day)*.001:0),0);
  const priorScore=score;
  if(!legacyBest||priorScore<legacyBest.score)legacyBest={slots:out,score:priorScore};
  if(Number(c.weeklyStressVersion)>=1)score+=weeklyStress(c,out,context);
  if(!best||score<best.score)best={slots:out,score};
 }
 if(best&&Number(c.weeklyStressVersion)>=1){
  const previousDays=new Map(legacyBest.slots.flatMap(s=>s.items.map(x=>[x.componentId,s.day])));
  const moved=best.slots.reduce((n,s)=>n+s.items.filter(x=>previousDays.get(x.componentId)!==s.day).length,0);
  // Changing familiar days has a real cost. Require a material stress reduction,
  // not marginal heuristic gains that churn an otherwise coherent calendar.
  if(best.score+moved>=legacyBest.score+weeklyStress(c,legacyBest.slots,context))best=legacyBest;
 }
 if(!best&&requiredDays.length){
  // An impossible request must not knock out other lifts with feasible dates.
  // Keep the largest possible subset in this draft; the omitted requests
  // still require an explicit resolution before programme approval.
  if(context.keepFeasiblePins){
   const entries=Object.entries(required);
   for(let n=entries.length-1;n>0;n--)for(const subset of combinations(entries,n)){
    const fallback=allocate(c,warnings,activities,{...context,requiredStrengthDays:Object.fromEntries(subset),keepFeasiblePins:false,strictPins:true});
    if(fallback.feasible)return fallback;
   }
  }
  if(!context.strictPins)return allocate(c,warnings,activities,{...context,requiredStrengthDays:null});
 }
 if(!best)return fail('No complete visit calendar fits the requested strength visits, runs, protected long run and mixed/separate permissions. Review frequencies or availability.');
 return {warnings:warnings.slice(),slots:best.slots,total:work.length,scheduled:work.length,unscheduled:[],feasible:true,visitModel:'strength visits group multiple distinct lift exposures; one run per day'};
}

const primary=e=>e[5]?.category==='primary'||['top','backoff'].includes(e[5]?.role)||/^(?:competition |paused )?(?:Squat|Bench|Deadlift)$/i.test(e[0]);
function strengthMinutes(ex){
 const mains=ex.filter(primary),names=new Set(mains.map(e=>e[0]));
 const warmups=names.size*6,workAndRest=mains.reduce((n,e)=>n+Number(e[1])*(e[5]?.trainingRole==='speed'?1.5:Number(e[4])>=8?4:Number(e[2])<=3?2.5:3),0);
 const support=ex.filter(e=>!primary(e)).reduce((n,e)=>n+Number(e[1])*1.75+.75,0);
 return {warmups,workAndRest,support,setup:ex.length?2:0,total:warmups+workAndRest+support+(ex.length?2:0)};
}
function fitSessions(c,input){
 if(Number(c.sessionTimeVersion)>=1)return fitFlexibleSessions(c,input);
 const cfg=c.visitConstraints||{},sessions=clone(input),warnings=[],issues=[];
 const trainingKm=list=>list.flatMap(s=>s.runs||[]).filter(r=>r.role!=='race').reduce((n,r)=>n+(Number(r.distanceKm)||0),0),beforeKm=trainingKm(sessions);
 const ordinary=new Set((c.availableDays||DAYS).map(short)),combined=new Set((cfg.combinedDays||(Number(c.sessionTimeVersion)>=1?c.doubleDays:[])||[]).map(short)),separate=new Set((cfg.separateDays||[]).map(short));
 for(const session of sessions){
  const sessionBeforeKm=(session.runs||[]).filter(r=>r.role!=='race').reduce((n,r)=>n+(Number(r.distanceKm)||0),0);
  const day=short(session.day),cap=Number(cfg.minutes?.[day]),permission=cfg.eventDays?.[session.eventDate];
  let runMinutes=(session.runs||[]).reduce((n,r)=>n+Number(r.durationRangeMinutes?.max??r.minutes),0);const knownRuns=(session.runs||[]).every(r=>Number.isFinite(Number(r.durationRangeMinutes?.max??r.minutes))&&(r.durationRangeMinutes?.max??r.minutes)!==null);
  if(session.eventDate){
   if(Number(c.coachingSafeguardsVersion)>=1){
    const runtime=Number(c.coachingRuntimeVersion)>=1;
    const duration=session.runs?.length?(knownRuns?runMinutes:runtime?permission?.estimatedMinutes??null:null):(permission?.estimatedMinutes??null),known=Number.isFinite(duration)&&duration>0,logistics=Number(permission?.logisticsMinutes)||0;
    const window=permission?permission.minutes:ordinary.has(day)?cap:null,cutoff=permission?.hardLimitMinutes,preferred=permission?.preferredFinishMinutes;
    const hasWindow=Number.isFinite(window)&&window>0,hasCutoff=Number.isFinite(cutoff)&&cutoff>0;
    const attendance=permission?permission.confirmed===true:ordinary.has(day)&&session.eventType==='running';
    const conflicts=[];
    if(!attendance)conflicts.push({kind:'event-permission',detail:'Confirm event-day availability before approving participation.'});
    if(!known&&(hasWindow||hasCutoff||!runtime&&session.eventType==='running'))conflicts.push({kind:'event-duration',detail:'Confirm a representative event-duration estimate before checking the hard time limit. Do not substitute the preferred finish target.'});
    if(known&&hasWindow&&duration+logistics>window)conflicts.push({kind:'event-time',detail:'Estimated event duration '+duration+' minutes plus '+logistics+' minutes logistics exceeds the hard event window of '+window+' minutes. Confirm a genuinely larger window or choose a suitable event/date; do not force faster pacing to fit.'});
    if(known&&hasCutoff&&duration>cutoff)conflicts.push({kind:'event-cutoff',detail:'Estimated event duration '+duration+' minutes exceeds the hard event cutoff of '+cutoff+' minutes. Review a suitable event or defer participation; a faster aspiration does not establish fitness.'});
    const feasible=!conflicts.length;
    session.eventPermission={confirmed:feasible,attendanceConfirmed:attendance,explicit:permission?.confirmed===true,estimatedMinutes:known?duration:null,logisticsMinutes:permission?.logisticsMinutes??null,hardWindowMinutes:hasWindow?window:null,hardLimitMinutes:hasCutoff?cutoff:null,preferredFinishMinutes:preferred??null};
    session.timeBudget={totalMinutes:known?duration:null,event:true,confirmed:feasible,feasible,hardWindowMinutes:hasWindow?window:null,hardLimitMinutes:hasCutoff?cutoff:null,logisticsMinutes:logistics,includesWarmups:false,includesRest:false,includesTransitions:false};
    if(conflicts.length){session.constraintIssues=conflicts.map(x=>({...x,date:session.eventDate,requiresAthleteInput:true}));session.constraintWarnings=conflicts.map(x=>x.detail);issues.push(...session.constraintWarnings);}
    if(known&&Number.isFinite(preferred)&&duration>preferred){const note='The preferred finish target of '+preferred+' minutes is faster than the current event-duration estimate. It is an aspiration, not a hard feasibility limit or permission to prescribe faster training.';warnings.push(note);session.hybridNotes=[...(session.hybridNotes||[]),note];}
    continue;
   }
   const duration=(session.runs||[]).length?runMinutes:Number(permission?.minutes),known=Number.isFinite(duration)&&duration>0;
   const allowed=permission?.confirmed===true||(!permission&&ordinary.has(day)&&session.eventType==='running'&&known&&Number.isFinite(cap)&&duration+(Number(permission?.logisticsMinutes)||0)<=cap);
   session.eventPermission={confirmed:allowed,explicit:permission?.confirmed===true,estimatedMinutes:known?duration:null,logisticsMinutes:permission?.logisticsMinutes??null};
   if(!allowed){const note='Confirm event-day availability and sufficient time for '+session.eventDate+' before approving participation.';issues.push(note);session.constraintWarnings=[note];session.constraintIssues=[{kind:ordinary.has(day)&&known&&Number.isFinite(cap)&&duration>cap?'event-time':'event-permission',date:session.eventDate,requiresAthleteInput:true,detail:note}]}
   session.timeBudget={totalMinutes:known?duration:null,event:true,confirmed:allowed,includesWarmups:false,includesRest:false,includesTransitions:false};
   continue;
  }
  if(!ordinary.has(day)||!Number.isFinite(cap)||cap<=0){issues.push('No valid whole-visit minute window for '+day+'.');continue}
  const mixed=!!session.ex?.length&&!!session.runs?.length,isSeparate=mixed&&separate.has(day),transition=mixed&&!isSeparate?3:0;
  if(mixed&&!isSeparate&&!combined.has(day)){issues.push(day+' combines running and lifting without permission.');continue}
  const strengthCap=isSeparate?Number(cfg.separateMinutes?.[day]||cap):cap-runMinutes-transition;
  const topReferences=new Map((session.ex||[]).filter(e=>Number.isInteger(e[5]?.topIndex)).map(e=>[e,session.ex[e[5].topIndex]]));
  const changes=[];
  let strength=strengthMinutes(session.ex||[]);
  // Remove low-value work first. Never rush rests or silently delete a designated top exposure.
  const trim=(predicate,label,minSets=0)=>{
   for(let i=(session.ex||[]).length-1;i>=0&&strength.total>strengthCap;i--){const e=session.ex[i];if(!predicate(e))continue;while(Number(e[1])>minSets&&strength.total>strengthCap){e[1]--;changes.push(label+': '+e[0]+' one set');strength=strengthMinutes(session.ex)}if(!e[1])session.ex.splice(i,1);strength=strengthMinutes(session.ex)}
  };
  trim(e=>e[5]?.optional||e[5]?.category==='optional','Removed optional work');
  trim(e=>!primary(e),'Reduced supporting work');
  trim(e=>e[5]?.role==='backoff'&&Number(e[1])>1,'Reduced back-off volume',1);
  // A running-first beginner can retain two useful straight sets per lift
  // instead of losing the priority run to an inflexible three-set template.
  if(c.priority==='Running'||c.hybridFocus==='running')trim(e=>primary(e)&&e[5]?.role==='straight'&&!['speed','technique'].includes(e[5]?.trainingRole)&&Number(e[1])>2,'Reduced straight-set volume for running priority',2);
  for(const [entry,top]of topReferences)if(session.ex.includes(entry))entry[5].topIndex=session.ex.indexOf(top);
  // Fit supporting easy kilometres only after low-value strength volume has been removed.
  // Canonical running helper retains quality repetitions/recoveries and usable warm-up/cool-down.
  const runCap=isSeparate?cap:cap-strength.total-transition;
  if(knownRuns&&runMinutes>runCap&&typeof running?.fitRunToMinutes==='function'){
   for(let i=(session.runs||[]).length-1;i>=0&&runMinutes>runCap;i--){
    const current=session.runs[i],minutes=Number(current.durationRangeMinutes?.max??current.minutes),available=minutes-(runMinutes-runCap);
    const fitted=running.fitRunToMinutes(current,available,{minWarmupKm:1,minCooldownKm:.5});
    if(fitted.feasible&&Number(fitted.trimmedKm)>0){session.runs[i]=fitted.run;runMinutes=(session.runs||[]).reduce((n,r)=>n+Number(r.durationRangeMinutes?.max??r.minutes),0);changes.push('Shortened supporting easy running by '+Number(fitted.trimmedKm).toFixed(2)+' km to fit the visit; work repetitions and recovery steps retained.');session.hybridNotes=[...(session.hybridNotes||[]),fitted.reason||'Easy running shortened to respect the complete visit window.'];}
   }
  }
  const total=runMinutes+strength.total+transition,visits=isSeparate?[{kind:'run',totalMinutes:runMinutes,capMinutes:cap},{kind:'strength',totalMinutes:strength.total,capMinutes:strengthCap}]:[{kind:mixed?'combined':session.ex?.length?'strength':'run',totalMinutes:total,capMinutes:cap}];
  const fits=knownRuns&&visits.every(v=>v.totalMinutes>=0&&v.totalMinutes<=v.capMinutes)&&(isSeparate?Number(cfg.minimumGapHours)>=6:true);
  session.timeBudget={totalMinutes:Math.ceil(total),runMinutes,strengthMinutes:strength.total,transitionMinutes:transition,components:strength,includesWarmups:true,includesRest:true,includesTransitions:true,visits,separate:isSeparate,minimumGapHours:isSeparate?Number(cfg.minimumGapHours):null,feasible:fits,estimateBasis:'Main-lift warm-ups 6 min per movement; work/rest 2.5–3 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.'};
  const sessionAfterKm=(session.runs||[]).filter(r=>r.role!=='race').reduce((n,r)=>n+(Number(r.distanceKm)||0),0);
  if(sessionAfterKm<sessionBeforeKm)session.runningAdjustments={beforeKm:Number(sessionBeforeKm.toFixed(3)),afterKm:Number(sessionAfterKm.toFixed(3)),trimmedKm:Number((sessionBeforeKm-sessionAfterKm).toFixed(3)),capacityLimited:true};
  if(changes.length){session.timeBudget.adjustments=changes;session.hybridNotes=[...(session.hybridNotes||[]),'Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.'];}
  if(isSeparate)session.hybridNotes=[...(session.hybridNotes||[]),'Two separate visits; allow at least '+cfg.minimumGapHours+' hours between them. Each visit has its own time cap.'];
  if(!fits){const note=day+' does not fit its inclusive visit window'+(!knownRuns?' because running duration is unknown':'')+'. Review dose or availability; do not rush rest or omit main work.';issues.push(note);session.constraintWarnings=[note]}
 }
 const afterKm=trainingKm(sessions),trimmedKm=Number((beforeKm-afterKm).toFixed(3)),reviewRequired=beforeKm>0&&trimmedKm>beforeKm*.10;
 if(reviewRequired)warnings.push('Visit windows reduce actual running from '+beforeKm.toFixed(2)+' to '+afterKm.toFixed(2)+' km. Review endurance adequacy before approving this block; removed kilometres are not automatically made up.');
 warnings.push(...issues);return {sessions,warnings,blockingIssues:issues.slice(),feasible:!issues.length,reviewRequired,runningAdjustments:{beforeKm:Number(beforeKm.toFixed(3)),afterKm:Number(afterKm.toFixed(3)),trimmedKm,reviewRequired}};
}
// Versioned estimates for new proposals only. Minutes are ranges, not promises.
const priorities=['essential','supporting','optional'];
function exercisePriority(e){
 const m=e[5]||{};
 // Explicit session purpose overrides the exercise name; optional never inferred from name.
 if(priorities.includes(m.priority))return m.priority;
 return m.optional||m.category==='optional'?'optional':primary(e)?'essential':'supporting';
}
function classifySession(input){
 const s=clone(input);
 s.ex=(s.ex||[]).map(e=>{const p=exercisePriority(e);e[5]={...e[5],priority:p,priorityReason:e[5]?.priorityReason||(p==='essential'?'Programmed main stimulus or specific practice':p==='supporting'?'Secondary volume or balance supporting this session':'Discretionary extra; skipping has no adherence penalty'),adherenceRequired:p!=='optional',plannedFatigueIncluded:p!=='optional',optional:p==='optional'};return e});
 s.runs=(s.runs||[]).map(r=>{const p=priorities.includes(r.priority)?r.priority:'essential';return {...r,priority:p,adherenceRequired:p!=='optional',plannedFatigueIncluded:p!=='optional',optional:p==='optional'}});
 return s;
}
const range=(min=0,max=min)=>({min:Math.floor(min),max:Math.ceil(max)}),plus=(a,b)=>({min:a.min+b.min,max:a.max+b.max});
function strengthDuration(ex){
 if(!ex.length)return {rangeMinutes:range(),components:[]};
 let total={min:5,max:8};const components=[{purpose:'General preparation',rangeMinutes:range(5,8)}],seen=new Set();
 for(const e of ex){
  const m=e[5]||{},main=primary(e)||m.priority==='essential',sets=Math.max(0,Number(e[1])||0),reps=Math.max(1,Number(e[2])||1),rpe=Number(e[4])||6;
  if(!sets)continue;
  const heavy=main&&rpe>=8,technical=['speed','technique','recovery'].includes(m.trainingRole),key=String(e[0]).toLowerCase();
  let warm={min:0,max:0},rampSets=0;
  if(!seen.has(key)){
   // Heavy work: unloaded pattern plus 4–6 progressive approaches, including
   // plate changes and increasing rests. Lighter main work: 2–4 approaches.
   if(main){rampSets=heavy?(reps<=2?6:5):technical?2:3;warm=heavy?(reps<=2?{min:18,max:25}:{min:14,max:21}):technical?{min:5,max:8}:{min:8,max:12};}
   else warm={min:1,max:2};
   seen.add(key);
  }
  const rest=heavy?{min:3,max:5}:main?(technical?{min:1,max:1.5}:{min:2,max:3}):{min:1,max:1.5};
  // Last-set recovery is not charged as a full between-set rest. Different
  // movement/setup includes transition; same-lift backoffs include plate change.
  const transition=components.length===1?{min:1,max:2}:seen.has(key)&&warm.max===0?(m.role==='backoff'?{min:3,max:5}:{min:1,max:2}):{min:2,max:3};
  const execution=sets*(reps*(heavy?.08:.06)+.35),between=Math.max(0,sets-1);
  const work={min:execution+between*rest.min,max:execution+between*rest.max};
  const duration=plus(plus(warm,transition),work);total=plus(total,duration);
  components.push({exercise:e[0],priority:exercisePriority(e),progressiveWarmupSets:rampSets,warmupRangeMinutes:range(warm.min,warm.max),betweenSetRestMinutes:rest,rangeMinutes:range(duration.min,duration.max)});
 }
 return {rangeMinutes:range(total.min,total.max),components};
}
function runDuration(r){
 const a=r.durationRangeMinutes,known=a&&Number.isFinite(a.min)&&Number.isFinite(a.max)&&a.min>=0&&a.max>0;
 const n=Number(r.minutes),timed=r.minutes!==null&&r.minutes!==undefined&&Number.isFinite(n)&&n>0;
 if(!known&&!timed)return null;
 // Prescribed run duration already includes its warm-up, repetitions, recoveries
 // and cooldown. Add preparation/changeover, never duplicate interval steps.
 return range((known?a.min:n)+3,(known?a.max:n)+5);
}
function estimateSession(input){
 const s=classifySession(input);
 const estimate=ps=>{
  const ex=s.ex.filter(e=>ps.includes(e[5].priority)),runs=s.runs.filter(r=>ps.includes(r.priority)),strength=strengthDuration(ex);let run=range();
  for(const r of runs){const d=runDuration(r);if(!d)return {rangeMinutes:null,strength,runRangeMinutes:null};run=plus(run,d)}
  const transition=ex.length&&runs.length&&!s.separateVisits?range(4,7):range();
  return {rangeMinutes:plus(plus(strength.rangeMinutes,run),transition),strength,runRangeMinutes:run,transitionRangeMinutes:transition};
 };
 const essential=estimate(['essential']),baseline=estimate(['essential','supporting']),total=estimate(priorities);
 return {estimated:true,essentialRangeMinutes:essential.rangeMinutes,baselineRangeMinutes:baseline.rangeMinutes,totalRangeMinutes:total.rangeMinutes,components:total,includesWarmups:true,includesRest:true,includesTransitions:true,estimateBasis:'General preparation 5–8 min; heavy main-lift ramp 5–6 progressive approaches / 14–25 min; other main ramps 2–3 approaches / 5–12 min; heavy rests 3–5 min, main 2–3, speed 1–1.5, accessories 1–1.5; work execution and equipment changes counted. Run duration includes prescribed warm-up/recovery/cool-down plus 3–5 min preparation; mixed transition 4–7 min. Queueing and individual variation may extend the range.'};
}
function plannedStress(input){
 const s=classifySession(input),sets=s.ex.filter(e=>e[5].plannedFatigueIncluded),runs=s.runs.filter(r=>r.plannedFatigueIncluded);
 return {strengthSets:sets.reduce((n,e)=>n+Number(e[1]),0),strengthEffortUnits:sets.reduce((n,e)=>n+Number(e[1])*Number(e[2])*(Number(e[4])||6),0),runningKm:runs.reduce((n,r)=>n+(Number(r.distanceKm)||0),0),optionalExcluded:true,physiologicalScore:false};
}
function completedStress(records={}){
 // Actual completed optional work counts exactly like other actual work.
 const sets=(records.sets||[]).filter(e=>e.completed!==false&&e.skipped!==true),runs=(records.runs||[]).filter(r=>r.completed!==false&&r.skipped!==true);
 return {strengthSets:sets.length,strengthEffortUnits:sets.reduce((n,e)=>n+(Number(e.reps)||0)*(Number(e.rpe)||6),0),runningKm:runs.reduce((n,r)=>n+(Number(r.km??r.distanceKm)||0),0),optionalIncluded:true,physiologicalScore:false};
}
function fitFlexibleSessions(c,input){
 const cfg=c.visitConstraints||{},ordinary=new Set((c.availableDays||DAYS).map(short)),warnings=[],issues=[],sessions=[];
 const validCap=x=>typeof x==='number'&&Number.isFinite(x)&&x>0;
 for(const original of input){
  if(original.eventDate){const event=fitSessions({...c,sessionTimeVersion:0},[original]);sessions.push(...event.sessions);warnings.push(...event.warnings);issues.push(...event.blockingIssues);continue}
  const s=classifySession(original),day=short(s.day),raw=cfg.minutes?.[day],hasCap=validCap(raw),cap=hasCap?raw:null,mixed=!!s.ex.length&&!!s.runs.length,separate=mixed&&(cfg.separateDays||[]).includes(day),changes=[];
  const oldTimeIssues=new Set((s.constraintIssues||[]).filter(i=>i.kind==='visit-time').map(i=>i.detail));
  if(oldTimeIssues.size){s.constraintIssues=s.constraintIssues.filter(i=>i.kind!=='visit-time');s.constraintWarnings=(s.constraintWarnings||[]).filter(w=>!oldTimeIssues.has(w));if(!s.constraintIssues.length)delete s.constraintIssues;if(!s.constraintWarnings.length)delete s.constraintWarnings;}
  const fail=detail=>{issues.push(detail);s.constraintWarnings=[...(s.constraintWarnings||[]),detail];s.constraintIssues=[...(s.constraintIssues||[]),{kind:'visit-time',detail,requiresAthleteInput:true}]};
  if(!ordinary.has(day))fail(day+' is not an available training day.');
  if(raw!==null&&raw!==undefined&&raw!==''&&!hasCap)fail(day+' has an invalid hard time limit.');
  if(mixed&&!separate&&!(cfg.combinedDays||c.doubleDays||[]).includes(day))fail(day+' combines running and lifting without permission.');
  if(separate&&!(Number(cfg.minimumGapHours)>=6))fail(day+' separate visits require at least six hours recovery.');
  const sc=cfg.separateMinutes?.[day],strengthCap=separate?(sc==null?cap:validCap(sc)?sc:null):cap;
  if(separate&&sc!=null&&!validCap(sc))fail(day+' has an invalid separate strength limit.');
  s.separateVisits=separate;
  const estimate=()=>estimateSession(s);
  const fits=()=>{const t=estimate();if(separate){const sr=strengthDuration(s.ex.filter(e=>e[5].priority!=='optional')).rangeMinutes;let rr=range();for(const r of s.runs.filter(r=>r.priority!=='optional')){const d=runDuration(r);if(!d)return false;rr=plus(rr,d)}return (!strengthCap||sr.max<=strengthCap)&&(!cap||rr.max<=cap)}return !!t.baselineRangeMinutes&&(!cap||t.baselineRangeMinutes.max<=cap)};
  const topRefs=new Map(s.ex.filter(e=>Number.isInteger(e[5]?.topIndex)).map(e=>[e,s.ex[e[5].topIndex]]));
  const prescribed=clone({ex:s.ex,runs:s.runs}),before=estimate();
  // Optional is never required for the baseline. Omit it first under an actual
  // hard constraint; then reduce support only. Essential dose/rest never rushed.
  const constrained=hasCap||separate&&validCap(strengthCap);
  const optionalFits=separate?(!strengthCap||before.components.strength.rangeMinutes.max<=strengthCap)&&(!cap||(before.components.runRangeMinutes&&before.components.runRangeMinutes.max<=cap)):before.totalRangeMinutes&&(!cap||before.totalRangeMinutes.max<=cap);
  if(constrained&&(!fits()||!optionalFits)){
   for(let i=s.ex.length-1;i>=0;i--)if(s.ex[i][5].priority==='optional'){changes.push({kind:'omit-optional',exercise:s.ex[i][0],sets:s.ex[i][1],adherencePenalty:false});s.ex.splice(i,1)}
   s.runs=s.runs.filter(r=>{if(r.priority!=='optional')return true;changes.push({kind:'omit-optional-run',name:r.name,adherencePenalty:false});return false});
  }
  const strengthOver=()=>separate?strengthCap!==null&&strengthDuration(s.ex.filter(e=>e[5].priority!=='optional')).rangeMinutes.max>strengthCap:!fits();
  for(let i=s.ex.length-1;i>=0&&strengthOver()&&constrained;i--){const e=s.ex[i];if(e[5].priority!=='supporting')continue;while(e[1]>0&&strengthOver()){e[1]--;changes.push({kind:'reduce-support',exercise:e[0],sets:1})}if(!e[1])s.ex.splice(i,1)}
  const runningOver=()=>{if(!separate)return !fits();if(cap===null)return false;let n=0;for(const r of s.runs.filter(r=>r.priority!=='optional')){const d=runDuration(r);if(!d)return true;n+=d.max}return n>cap};
  for(let i=s.runs.length-1;i>=0&&runningOver()&&constrained;i--)if(s.runs[i].priority==='supporting'){changes.push({kind:'omit-support-run',name:s.runs[i].name});s.runs.splice(i,1)}
  for(const [e,top]of topRefs)if(s.ex.includes(e))e[5].topIndex=s.ex.indexOf(top);
  const t=estimate(),known=!!t.baselineRangeMinutes;
  if(!known)fail(day+' has unknown prescribed running duration; confirm representative pace or a timed prescription.');
  else if(!fits()){const er=t.essentialRangeMinutes,tooShort=separate?visitsTooShort():cap!==null&&er&&er.min>cap;fail(day+(tooShort?' essential work cannot fit':' essential work may exceed')+' the hard limit with full warm-ups and rests. Review the limit or training priorities; essential work has not been silently removed.');}
  function visitsTooShort(){const sr=strengthDuration(s.ex.filter(e=>e[5].priority==='essential')).rangeMinutes;let rr=0;for(const r of s.runs.filter(r=>r.priority==='essential'))rr+=runDuration(r)?.min||0;return (strengthCap!==null&&sr.min>strengthCap)||(cap!==null&&rr>cap)}
  const visits=separate?[{kind:'strength',rangeMinutes:strengthDuration(s.ex.filter(e=>e[5].priority!=='optional')).rangeMinutes,capMinutes:strengthCap},{kind:'run',rangeMinutes:estimateSession({...s,ex:[]}).baselineRangeMinutes,capMinutes:cap}]:[{kind:mixed?'combined':s.ex.length?'strength':'run',rangeMinutes:t.baselineRangeMinutes,capMinutes:cap}];
  s.timeBudget={...t,totalMinutes:t.baselineRangeMinutes?.max??null,capMinutes:cap,hardLimit:hasCap,availability:hasCap?'hard-limit':'unspecified-flexible',feasible:!s.constraintWarnings?.length,visits,separate,minimumGapHours:separate?cfg.minimumGapHours:null,adjustments:changes};
  s.plannedStress=plannedStress(s);
  if(changes.length){s.timeAdaptation={originalPrescription:prescribed,adjustedPrescription:clone({ex:s.ex,runs:s.runs}),reason:'hard-time-limit',changes,completedWorkChanged:false,makeUpWorkScheduled:false};s.hybridNotes=[...(s.hybridNotes||[]),'Time adjustment: supporting/optional work reduced; essential work protected. Removed work is not stacked onto later days.'];}
  if(c.sessionDurationPreference?.mode==='typical'&&t.baselineRangeMinutes?.max>c.sessionDurationPreference.minutes)warnings.push(day+': estimate exceeds the typical duration preference; this is not a hard limit. Review supporting volume if desired.');
  if(!hasCap)warnings.push(day+': session duration is estimated; no hard time limit was supplied.');
  sessions.push(s);
 }
 return {sessions,warnings:[...warnings,...issues],blockingIssues:issues,feasible:!issues.length,reviewRequired:!!issues.length};
}
function adaptSessionToTime(c,session,minutes){
 if(!Number.isFinite(minutes)||minutes<=0)throw new RangeError('Supply a positive actual time limit.');
 if(session.eventDate)throw new RangeError('An event requires an event-specific timing review.');
 const day=short(session.day),copy=clone(c);copy.sessionTimeVersion=1;copy.visitConstraints={...copy.visitConstraints,minutes:{...copy.visitConstraints?.minutes,[day]:minutes}};
 const result=fitFlexibleSessions(copy,[session]);return {...result,originalPrescription:clone(session),requiresAthleteApproval:true,applied:false,makeUpWorkScheduled:false,reason:'unexpected-time-limit'};
}
function reviewTimeHistory(records=[]){
 const dates=new Set(records.filter(r=>r.reason==='unexpected-time-limit'||r.reason==='hard-time-limit').map(r=>r.date).filter(Boolean));
 return {distinctModifiedDays:dates.size,recommendation:dates.size>=3?'Review typical duration or supporting volume with the athlete.':'Keep the approved programme; record actual changes.',requiresAthleteApproval:dates.size>=3,appliedChanges:[]};
}
const api={allocate,fitSessions,strengthMinutes,weeklyStress,classifySession,estimateSession,plannedStress,completedStress,adaptSessionToTime,reviewTimeHistory};
if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFCoachConstraints=api;
})(typeof globalThis!=='undefined'?globalThis:this);
