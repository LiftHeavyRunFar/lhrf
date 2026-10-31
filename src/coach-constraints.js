/* Visit-level constraints for new proposals. Pure/offline; saved athlete state is never changed. */
(function(root){
'use strict';
const running=typeof module==='object'&&module.exports?require('./running-preparation.js'):root.LHRFRunningPreparation;
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const short=x=>String(x).slice(0,3),clone=x=>JSON.parse(JSON.stringify(x));
const lower=x=>/squat|deadlift/i.test(x.name||x[0]||'');
function combinations(items,n){if(n===0)return [[]];if(n<0||n>items.length)return [];const out=[];for(let i=0;i<=items.length-n;i++)for(const tail of combinations(items.slice(i+1),n-1))out.push([items[i],...tail]);return out}
function permutations(items,n){if(n===0)return [[]];const out=[];for(let i=0;i<items.length;i++)for(const rest of permutations(items.filter((_,j)=>i!==j),n-1))out.push([items[i],...rest]);return out}
function allocate(c,warnings=[],activities=[]){
 const cfg=c.visitConstraints||{},allowed=DAYS.filter(d=>(c.availableDays?.length?c.availableDays.map(short):DAYS).includes(d)),slots=()=>DAYS.map(day=>({day,items:[]}));
 const work=activities.map((x,i)=>({...x,componentId:'component-'+i})),strength=work.filter(x=>x.type==='strength'),runs=work.filter(x=>x.type==='run');
 const combined=new Set((cfg.combinedDays||[]).map(short)),separate=new Set((cfg.separateDays||[]).map(short));
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
 let best=null;
 for(const strengthDays of combinations(allowed,visits))for(const runDays of permutations(allowed,runs.length)){
  if(longIndex>=0&&c.longRunDay&&runDays[longIndex]!==short(c.longRunDay))continue;
  if(runDays.some((day,i)=>strengthDays.includes(day)&&(!combined.has(day)&&!separate.has(day)||i===longIndex)))continue;
  if(new Set([...strengthDays,...runDays]).size>(Number(c.days)||7))continue;
  const out=slots();runs.forEach((x,i)=>out.find(s=>s.day===runDays[i]).items.push(x));
  let score=0,valid=true;
  // Place repeated lifts on distinct visits; prefer lower work away from the long run.
  for(const item of strength.slice().sort((a,b)=>Number(lower(b))-Number(lower(a)))){
   const choices=strengthDays.map(day=>out.find(s=>s.day===day)).filter(s=>!s.items.some(x=>x.type==='strength'&&x.name===item.name));
   choices.sort((a,b)=>{
    const rank=s=>{const i=DAYS.indexOf(s.day),long=longIndex>=0?DAYS.indexOf(runDays[longIndex]):-9,others=s.items.filter(x=>x.type==='strength'),adjacent=out.some(x=>Math.abs(DAYS.indexOf(x.day)-i)===1&&x.items.some(y=>y.type==='strength'&&y.name===item.name));return others.length*3+(lower(item)&&((long-i+7)%7===1)?24:0)+(lower(item)&&others.some(lower)?7:0)+(adjacent?12:0)+(s.items.some(x=>x.type==='run')&&!separate.has(s.day)?4:0)+i*.02};return rank(a)-rank(b)
   });
   if(!choices.length){valid=false;break}choices[0].items.push(item);
  }
  if(!valid||strengthDays.some(day=>!out.find(s=>s.day===day).items.some(x=>x.type==='strength')))continue;
  for(const s of out){const i=DAYS.indexOf(s.day),ss=s.items.filter(x=>x.type==='strength');score+=ss.length**2;if(ss.some(lower)&&longIndex>=0&&(DAYS.indexOf(runDays[longIndex])-i+7)%7===1)score+=40;if(ss.length&&s.items.some(x=>x.type==='run')&&!separate.has(s.day))score+=2;}
  // Quality early in the week, then supporting easy running; Sunday remains protected.
  runDays.forEach((day,i)=>{if(i!==longIndex){const preferred=i===0?1:3;score+=Math.abs(DAYS.indexOf(day)-preferred)*2}});
  score+=out.reduce((n,s)=>n+(s.items.length?DAYS.indexOf(s.day)*.001:0),0);
  if(!best||score<best.score)best={slots:out,score};
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
 const cfg=c.visitConstraints||{},sessions=clone(input),warnings=[],issues=[];
 const trainingKm=list=>list.flatMap(s=>s.runs||[]).filter(r=>r.role!=='race').reduce((n,r)=>n+(Number(r.distanceKm)||0),0),beforeKm=trainingKm(sessions);
 const ordinary=new Set((c.availableDays||DAYS).map(short)),combined=new Set((cfg.combinedDays||[]).map(short)),separate=new Set((cfg.separateDays||[]).map(short));
 for(const session of sessions){
  const sessionBeforeKm=(session.runs||[]).filter(r=>r.role!=='race').reduce((n,r)=>n+(Number(r.distanceKm)||0),0);
  const day=short(session.day),cap=Number(cfg.minutes?.[day]),permission=cfg.eventDays?.[session.eventDate];
  let runMinutes=(session.runs||[]).reduce((n,r)=>n+Number(r.durationRangeMinutes?.max??r.minutes),0);const knownRuns=(session.runs||[]).every(r=>Number.isFinite(Number(r.durationRangeMinutes?.max??r.minutes))&&(r.durationRangeMinutes?.max??r.minutes)!==null);
  if(session.eventDate){
   const duration=(session.runs||[]).length?runMinutes:Number(permission?.minutes),known=Number.isFinite(duration)&&duration>0;
   const allowed=permission?.confirmed===true||(ordinary.has(day)&&session.eventType==='running'&&known&&Number.isFinite(cap)&&duration+(Number(permission?.logisticsMinutes)||0)<=cap);
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
const api={allocate,fitSessions,strengthMinutes};
if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFCoachConstraints=api;
})(typeof globalThis!=='undefined'?globalThis:this);
