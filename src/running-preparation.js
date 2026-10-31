/* Version 2 running preparation. Pure, offline and deterministic.
 * Progression rates and review gates are explicit product policies, not injury
 * thresholds or validated forecasts. Saved programmes do not opt in implicitly. */
(function(root){
'use strict';
const library=typeof module==='object'&&module.exports?require('./running-workouts.js'):root.LHRFRunningWorkouts;
const DAY=86400000,WEEK=7*DAY,clone=x=>JSON.parse(JSON.stringify(x));
const round=x=>Math.max(0,Math.round(x*20)/20),sum=x=>x.reduce((a,b)=>a+b,0);
const median=x=>{const s=x.slice().sort((a,b)=>a-b);return s.length?s[Math.floor(s.length/2)]:null};
const stamp=x=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(x||''))return NaN;const n=Date.parse(x+'T12:00:00Z');return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===x?n:NaN};
const monday=x=>{const d=new Date(x);return x-((d.getUTCDay()+6)%7)*DAY};
const text=x=>{const n=Math.round(x);return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')+'/km'};
const range=(a,b=a)=>text(a)+' to '+text(b);
const work=s=>s.role==='work';
function history(c){
 const h=c.runningHistory||{},p=c.runProfile||{};
 const weeks=(h.weeklyKm||p.weeklyKmHistory||[]).filter(x=>Number.isFinite(x)&&x>=0);
 const long=h.longRun||p.recentLongRun||{};
 const current=Number(p.weeklyKm)>0?Number(p.weeklyKm):weeks.at(-1)||0;
 // A recent spike is not a reason to prescribe another spike. Retain source data.
 const typical=weeks.length>=3?median(weeks.slice(-3)):current;
 return {weeks,current,base:current?Math.min(current,typical||current):0,long,
  recentMarathonDate:h.recentMarathonDate||p.recentMarathonDate||c.recentMarathonDate,
  recentRace:h.recentRace||p.recentRace||c.recentRace};
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
 const count=Math.max(0,Math.min(7,Number(c.runs)||0)),goal=String(c.runGoal||'fitness').toLowerCase(),p=paceSet(c,options.paces),h=history(c),warnings=[],blocking=[];
 const now=typeof options.now==='function'?options.now():Number(options.now)||Date.now();
 const start=stamp(c.startDate),target=stamp(c.runningTargetDate),raceWeek=Number.isFinite(start)&&Number.isFinite(target)?Math.round((monday(target)-monday(start))/WEEK)+1:null;
 const until=raceWeek===null?null:raceWeek-w,event=until===0,postRace=until!==null&&until<0&&until>=-2;
 const taper=until!==null&&until>=0&&until<=(goal==='marathon'?2:goal==='half'?1:0),deload=!taper&&!postRace&&w%4===0;
 if(!Number.isInteger(Number(c.runs))||count!==Number(c.runs))blocking.push('Running frequency must be zero to seven whole sessions per week.');
 if(!['fitness','5k','10k','half','marathon'].includes(goal))blocking.push('Unsupported running goal.');
 if(count&&c.runningTargetDate&&(!h.base||!p))blocking.push('Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.');
 if(c.runningTargetDate&&(!Number.isFinite(start)||!Number.isFinite(target)||target<start))blocking.push('Running preparation requires valid ordered programme and event dates.');
 const resultAge=c.runProfile?.resultDate?(now-stamp(c.runProfile.resultDate))/DAY:null;
 if(c.runProfile?.resultDate&&(!Number.isFinite(resultAge)||resultAge<0))blocking.push('Running result date is invalid or in the future; confirm the baseline before approval.');
 const baselineCurrent=p&&c.runProfile?.recency!=='old'&&(resultAge===null||Number.isFinite(resultAge)&&resultAge>=0&&resultAge<=56)&&c.runProfile?.effort!=='training';
 if(p&&!baselineCurrent)warnings.push('Confirm a representative recent running result before progressing race-pace work; easy running remains available.');
 if(count&&!h.base)warnings.push('Running volume is provisional until recent completed mileage is confirmed.');
 const weekStart=Number.isFinite(start)?monday(start)+(w-1)*WEEK:now+(w-1)*WEEK;
 const recentMarathon=stamp(h.recentMarathonDate||(h.recentRace?.distanceKm>=40?h.recentRace.date:null));
 if(h.recentMarathonDate&&!Number.isFinite(recentMarathon))blocking.push('Recent marathon date is invalid; confirm recovery timing before approving the running build.');
 const daysSinceMarathon=Number.isFinite(recentMarathon)?(weekStart-recentMarathon)/DAY:null;
 const recoveringMarathon=daysSinceMarathon!==null&&daysSinceMarathon>=0&&daysSinceMarathon<21;
 const strengthWeek=Number.isFinite(start)&&Number.isFinite(stamp(c.strengthTargetDate))?Math.round((monday(stamp(c.strengthTargetDate))-monday(start))/WEEK)+1:null;
 const strengthEventWeek=strengthWeek===w;
 const strengthRecoveryWeek=strengthWeek!==null&&w===strengthWeek+1;
 // A strength-first stage with a later endurance event is aerobic support, not
 // an unrelated small health-running block. Keep its established running base
 // without importing the later race's demanding pace work into the current peak.
 const futureEnduranceGoal=(c.orderedGoals||[]).find(g=>g.sport==='running'&&['half','marathon'].includes(String(g.runGoal).toLowerCase())&&stamp(g.date)>weekStart);
 const supportEndurance=goal==='fitness'&&c.hybridFocus==='strength'&&!!futureEnduranceGoal;
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
  return focus==='strength'?.018:goal==='marathon'?(handoverEnduranceBuild&&k>=priorityFrom?.065:.045):goal==='half'?.045:goal==='fitness'?.018:.03;
 };
 for(let k=2;k<=Math.max(1,taper&&raceWeek?raceWeek-3:w);k++)if(k%4!==0&&!(handoverEnduranceBuild&&(k===priorStrengthWeek||k===priorStrengthWeek+1)))growth*=1+rateAt(k);
 const growthLimit=goal==='marathon'?(h.base>=70?1.35:h.base>=50?1.6:2.4):goal==='half'?(h.base>=40?1.5:1.9):1.5;
 growth=Math.min(growthLimit,growth);
 let factor=growth*(deload?.82:1);
 if(taper)factor=growth*(event?.30:until===1?.55:.75);
 if(postRace)factor=until===-1?(goal==='marathon'?.20:goal==='half'?.40:.60):(goal==='marathon'?.45:goal==='half'?.65:.85);
 if(recoveringMarathon)factor=Math.min(factor,daysSinceMarathon<7?.20:daysSinceMarathon<14?.40:.60);
 if(strengthEventWeek)factor=Math.min(factor,.35);
 if(strengthRecoveryWeek&&supportEndurance)factor=Math.min(factor,.50);
 const fatigue=c.recoveryEvidence||{};
 const lowerFatigue=!(fatigue.cleared===true||fatigue.resolved===true)&&((['accumulating-fatigue','fatigue','persistent-fatigue'].includes(fatigue.status)&&(fatigue.affectedLifts||[]).some(x=>/squat|deadlift|lower/i.test(x)))||fatigue.runningFatigue===true||fatigue.lowerBodyFatigue===true);
 if(lowerFatigue)factor=Math.min(factor,.65);
 const base=h.base||Math.min(6,count*2);
 let requestedKm=round(base*factor);
 if(goal==='fitness'&&!supportEndurance)requestedKm=round(Math.min(requestedKm,count*(lowerFatigue?8:6)));
 if(lowerFatigue)warnings.push('Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.');
 const enduranceSpecific=(goal==='marathon'&&raceWeek!==null&&w>=Math.max(5,priorityFrom+4)&&until<=10)||(goal==='half'&&w>=5&&until!==null&&until<=8);
 let phase=taper?'Taper / event':postRace||recoveringMarathon?'Recovery':enduranceSpecific?'Specific preparation':w<=Math.max(4,priorityFrom+2)?'Aerobic foundation':'Development';
 if(goal==='marathon'&&count&&count<3){if(raceWeek!==null)blocking.push('Marathon preparation needs more running support than one or two sessions, or individual review of a constrained alternative.');else warnings.push('Two or fewer runs can support a base-building block. Consider a third easy run and review completed endurance before choosing a marathon date; this block does not establish race readiness.');}
 if(goal==='marathon'&&raceWeek!==null&&raceWeek<12)blocking.push('Short marathon preparation needs individual review of established endurance and recovery.');
 if(goal==='marathon'&&h.base&&h.base<25)warnings.push('Build an aerobic base before treating this as race-ready marathon preparation; review completed mileage and long runs before the specific block.');
 if(recoveringMarathon)warnings.push('Recent marathon: provisional easy return, with no quality or long-run progression until recovery is confirmed. Rest or shorten if normal easy running is not comfortable.');
 if(postRace)warnings.push('Post-race return is provisional: confirm recovery before accepting the next loading block.');
 if(strengthEventWeek)warnings.push('Strength competition week: short easy running only; the day after the meet requires a separate recovery decision.');
 if(strengthRecoveryWeek&&supportEndurance)warnings.push('After the strength meet: provisional reduced easy running, with no long run until recovery is confirmed before the endurance-priority handover.');
 if(supportEndurance)warnings.push('Maintain an easy aerobic base for the later '+futureEnduranceGoal.runGoal+' while strength has priority. Race-specific running starts after the dated handover and recovery review.');
 if(handoverEnduranceBuild)warnings.push('The post-meet marathon build is conditional on restored recovery and completed aerobic support. Confirm actual mileage at the handover before progressing; proposed future kilometres are not evidence that those runs were completed.');
 const easy=km=>easyRun(km,p),noLong=taper||postRace||recoveringMarathon||strengthEventWeek||(strengthRecoveryWeek&&supportEndurance)||(goal==='fitness'&&!supportEndurance)||lowerFatigue;
 if(!count)return {runs:[],warnings,blocking,feasible:!blocking.length,reviewRequired:!!warnings.length,requestedKm:0,allocatedKm:0,km:0,longKm:0,longShare:0,phase,deload,taper,remaining:until===null?null:until+1};
 if(!p&&goal==='fitness'){
  const minutes=lowerFatigue||strengthEventWeek?15:20;
  const runs=Array.from({length:count},()=>({role:'easy-run',name:'Timed easy health run',minutes,durationRangeMinutes:{min:minutes,max:minutes},distanceKm:0,distanceKnown:false,rpe:3,pace:'Conversational easy effort',steps:[{label:'Easy conversational run',role:'easy',minutes,distanceKm:0,pace:'Conversational easy effort'}],workMinutes:0,structure:minutes+' minutes easy conversational running or run/walk',reason:'A time-based health dose does not require a race PB. Distance and pace remain unknown; record actual running to calibrate later.'}));
  return {runs,warnings,blocking,feasible:!blocking.length,reviewRequired:!!(warnings.length||blocking.length),requestedKm:0,allocatedKm:0,actualKm:0,km:0,distanceKnown:false,phase,preparationMode:'timed-health-running',progressionLimited:false,deload,taper,remaining:until===null?null:until+1,longKm:0,longShare:0,qualityAllowed:false,reviewGates:{baselineConfirmed:false,longRunHistoryConfirmed:!!Number(h.long.km),recoveryCheckRequired:lowerFatigue||strengthEventWeek}};
 }
 const share=count===1?1:count===2?.5:goal==='marathon'?(count===3?.40:count===4&&phase==='Specific preparation'?.45:.36):goal==='half'?(count===3?(phase==='Specific preparation'?.48:.42):.38):.38;
 const longReference=Number(h.long.km)>0?Number(h.long.km):null;
 const longWindow=(c.runVisitWindows||[]).find(x=>x.kind==='long'),knownLongWindow=Number(longWindow?.minutes)>0?Number(longWindow.minutes):Infinity;
 const conditionalLongerRehearsal=goal==='marathon'&&completedMarathonEvidence&&knownLongWindow>=240;
 const longTimeLimit=Math.min(knownLongWindow,Number(c.longRunMaxMinutes)>0?Number(c.longRunMaxMinutes):goal==='marathon'?(conditionalLongerRehearsal?240:210):goal==='half'||supportEndurance?150:100);
 const longDistanceLimit=goal==='marathon'?32:goal==='half'?20:supportEndurance?16:goal==='fitness'?12:16;
 const longTimeKm=p?longTimeLimit*60/p.easyHigh:Infinity;
 const longProgressLimit=longReference?longReference+.8*Math.max(0,w-1-Math.floor((w-1)/4)):Infinity;
 let longKm=Math.max(0,Math.floor(Math.min(requestedKm*((goal==='fitness'&&!supportEndurance)||lowerFatigue?1/count:share),longDistanceLimit,longTimeKm,longProgressLimit)*20+1e-9)/20);
 const longCapLimited=requestedKm*share-longKm>.2;
 const otherCount=count-1,otherKm=otherCount?round((requestedKm-longKm)/otherCount):0;
 const distances=Array.from({length:count},(_,i)=>count===1?round(Math.min(requestedKm,longDistanceLimit,longTimeKm)):i===1?longKm:otherKm);
 // Exact rounding stays on an ordinary easy run rather than inflating the long run.
 if(count>1)distances[count-1]=round(distances[count-1]+requestedKm-sum(distances));
 const qualityAllowed=baselineCurrent&&h.base>=12&&count>=3&&!noLong&&!deload&&goal!=='fitness'&&phase!=='Recovery';
 const runs=distances.map((km,i)=>easyRun(km,p,i===1&&!noLong?'long-run':'easy-run'));
 if(qualityAllowed){const q=qualityRun(distances[0],sum(distances),p,c,w,until,phase);if(q)runs[0]=q;}
 // Specific long-run pace rehearsal replaces the midweek quality, so this is
 // still one demanding running stimulus. Retain meaningful easy support.
 if(goal==='marathon'&&phase==='Specific preparation'&&qualityAllowed&&w%3===1&&longKm>=20){
  const eventPace=p.tenK*Math.pow(42.195/10,1.06)/42.195,mp=round(Math.min(12,requestedKm*.20,longKm*.40)),warm=round(longKm*.50),cool=round(longKm-warm-mp);
  runs[0]=easy(distances[0]);runs[1]=buildRun('Long run with marathon-pace rehearsal','long-run',[{label:'Easy aerobic running',role:'easy',distanceKm:warm,pace:range(p.easyLow,p.easyHigh)},{label:'Current-fitness marathon pace',role:'work',distanceKm:mp,paceSeconds:eventPace,pace:range(eventPace-5,eventPace+5)},{label:'Easy finish',role:'easy',distanceKm:cool,pace:range(p.easyLow,p.easyHigh)}],p,{workoutFamily:'marathon-pace-long-run',paceBasis:{method:'current-performance-equivalent',racePaceSeconds:eventPace,goalPaceSeconds:Number(c.runningGoalSeconds)>0?Number(c.runningGoalSeconds)/42.195:null,goalSupported:Number(c.runningGoalSeconds)>0?Number(c.runningGoalSeconds)/42.195>=eventPace:null}});
 }
 const eventDistance=({['5k']:5,['10k']:10,half:21.0975,marathon:42.195})[goal];
 const eventPace=p&&eventDistance?p.tenK*Math.pow(eventDistance/10,1.06)/eventDistance:null;
 if(eventPace&&Number(c.runningGoalSeconds)>0&&Number(c.runningGoalSeconds)/eventDistance<eventPace)warnings.push('Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.');
 if(longCapLimited)warnings.push('Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.');
 if(goal==='marathon'&&phase==='Specific preparation'&&!deload&&!taper&&(requestedKm<40||longKm<20))warnings.push('Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.');
 if(goal==='marathon'&&!longReference)warnings.push('Confirm recent long-run distance, duration and recovery before approving marathon long-run progression.');
 if(supportEndurance&&!longReference)warnings.push('Confirm recent long-run distance and recovery before extending the endurance-support long run; a past marathon does not establish present long-run readiness.');
 const halfEnduranceReview=goal==='half'&&phase==='Specific preparation'&&until!==null&&until<=4&&longKm<14;
 if(halfEnduranceReview)warnings.push('Half-marathon preparation review: long-running exposure remains modest. Review a completion-led run/walk strategy, recovery and supporting mileage before approving the final specific block.');
 const actualKm=Number(sum(runs.map(r=>r.distanceKm)).toFixed(3)),hard=sum(runs.flatMap(r=>r.steps).filter(work).map(s=>s.distanceKm));
 const qualityLimit=goal==='marathon'&&phase==='Specific preparation'?.30:.20;
 if(hard>actualKm*qualityLimit+.01)blocking.push('Quality running exceeds the actual weekly intensity budget; review required.');
 const longest=Math.max(...runs.map(r=>r.minutes||0));
 const longDurationReview=goal==='marathon'&&runs.some(r=>r.role==='long-run'&&r.minutes>210);
 if(longDurationReview)warnings.push('This long-run rehearsal exceeds 3.5 hours. Its use is conditional on recovery, fuelling tolerance and an agreed visit window; review duration versus distance instead of forcing 30 km or a fixed percentage.');
 return {runs,warnings:[...warnings,...blocking],blocking,feasible:!blocking.length,reviewRequired:!!(warnings.length||blocking.length),requestedKm,allocatedKm:actualKm,actualKm,km:requestedKm,factor,phase,preparationMode:supportEndurance?'endurance-support':raceWeek?'dated-event':'base-building',supportEndurance,progressionLimited:longCapLimited,deload,taper,remaining:until===null?null:until+1,longShare:actualKm&&!noLong?longKm/actualKm:0,longKm:noLong?0:longKm,qualityAllowed,
  reviewGates:{baselineConfirmed:!!h.base,longRunHistoryConfirmed:!!longReference,recoveryCheckRequired:recoveringMarathon||postRace||strengthEventWeek||(strengthRecoveryWeek&&supportEndurance),marathonEnduranceReview:goal==='marathon'&&phase==='Specific preparation'&&!deload&&!taper&&(requestedKm<40||longKm<20),halfEnduranceReview,handoverProgressionReview:handoverEnduranceBuild,longDurationReview},
  fuelling:longest>=75?['Practise carbohydrate and fluid intake during long runs, rather than introducing it on race day. Start with familiar small portions totalling about 30 g carbohydrate/hour; progress towards 45–60 g/hour on longer rehearsals if tolerated.','Drink to conditions and thirst; record what you actually tolerate. Use the same foods/drinks in later race rehearsals.']:[],
  qualityBudget:{workKm:Number(hard.toFixed(3)),weeklyKm:actualKm,maximumShare:qualityLimit,domain:goal==='marathon'&&phase==='Specific preparation'?'marathon-pace rehearsal':'threshold and faster'},
  policyNote:'Progression percentages, duration limits and endurance review points are adjustable planning defaults, not universal safety thresholds or performance guarantees.'};
}
const api={assess,history,paceSet,buildRun,fitRunToMinutes};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFRunningPreparation=api;
})(typeof globalThis!=='undefined'?globalThis:this);
