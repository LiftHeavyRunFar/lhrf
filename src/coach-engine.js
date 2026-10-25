/* Shared LHRF coaching engine. Extracted without changing the existing live prescriptions.
 * Views supply plain athlete state and a clock. This module has no DOM, storage or network access. */
(function(root){
'use strict';
function allowsProgression(phase,deload=false){return !deload&&['foundation','development','specificity','intensification'].includes(String(phase||'').toLowerCase())}
function createEngine(context={}){
 const data=context.data||{sets:[],runs:[],checkins:[],decisions:[],overrides:{}};
 const schedule=context.schedule||data.activeSchedule||[];
 const clock=typeof context.now==='function'?context.now:()=>globalThis.Date.now();
 const Date=class extends globalThis.Date{constructor(...args){super(...(args.length?args:[clock()]))}static now(){return clock()}};
function effectiveSession(id){
 const base=schedule.find(x=>x.id===id);if(!base)return null;
 const copy=JSON.parse(JSON.stringify(base));const ov=data.overrides?.[id];
 if(ov&&copy.ex){
   const changes=Array.isArray(ov)?ov:[ov];
   for(const ch of changes){const ex=copy.ex.find(e=>e[0]===ch.exercise);if(ex){
     ex[1]=Math.max(1,ex[1]+(ch.setDelta||0));
     ex[3]=Math.max(0,Math.round(ex[3]*(ch.loadFactor||1)*2)/2);
   }}
 }return copy;
}

function pbSeconds(v){const parts=String(v||'').trim().split(':').map(Number);if(!parts.length||parts.length>3||parts.some(x=>!Number.isFinite(x)||x<0))return NaN;if(parts.length>1&&parts.slice(1).some(x=>x>=60))return NaN;return parts.reduce((a,x)=>a*60+x,0)}

function distanceLabel(km){return km<1?Math.round(km*1000/50)*50+' m':(Math.round(km*20)/20).toFixed(2).replace(/0+$/,'').replace(/\.$/,'')+' km'}

function paceText(sec){if(!Number.isFinite(sec)||sec<=0)return '—';return Math.floor(sec/60)+':'+String(Math.round(sec%60)).padStart(2,'0')+'/km'}

function estimatedMax(kg,reps){return kg*(1+Math.max(0,reps-1)/30)}

function runningPaces(c){const p=c.runProfile;if(!p||!Number.isFinite(p.seconds)||p.seconds<=0||p.distance<=0)return null;const tenK=p.seconds*Math.pow(10/p.distance,1.06);const race=tenK/10;return {race, easyLow:race*1.18,easyHigh:race*1.4,threshold:race*1.04,tenK,valid:true}}

// Opt-in programme version. Saved programmes without this flag retain their prescriptions.
function candidateWeek(c,w){
 const event=c.strengthTargetDate&&c.startDate?Math.floor((Date.parse(c.strengthTargetDate+'T12:00:00')-(Date.parse(c.startDate+'T12:00:00')-((new Date(c.startDate+'T12:00:00').getDay()+6)%7)*86400000))/604800000)+1:null;
 const n=event||Math.max(1,Number(c.weeks)||12);
 const phaseAt=k=>{
  if(event&&k>event)return 'Development';
  if(event&&k===event)return 'Taper / event';
  if(event&&n<=4)return 'Specificity';
  if(event&&n<=8)return k<n-2?'Development':'Specificity';
  if(event&&n<=12)return k<6?'Development':'Specificity';
  if(event){const specificStart=Math.floor((n-2)/5)*5+1;return k<=5?'Foundation':k<specificStart?'Development':'Specificity'}
  return k<=5?'Foundation':'Development';
 };
 const phase=phaseAt(w),transition=w<n&&phaseAt(w+1)!==phase&&phaseAt(w+1)!=='Taper / event';
 const postEvent=!!event&&w===event+1;
 // A phase change alone does not justify a deload in a short event preparation.
 const shortPrep=!!event&&n<=8;
 const deload=postEvent||(!shortPrep&&(transition||(w%5===0&&(!event||event-w>2))));
 return {phase,deload,block:Math.floor((w-1)/5)+1,position:(w-1)%5+1,
  label:postEvent?'Post-event recovery':transition&&deload?'Recovery before '+phaseAt(w+1):deload?'Recovery week':'Training block '+(Math.floor((w-1)/5)+1),
  transitionReviewed:!!(shortPrep&&transition),
  rationale:postEvent?'Reduce load after the event; review recovery before starting the next phase.':transition&&deload?'Reduced volume separates '+phase+' from '+phaseAt(w+1)+'.':deload?'Planned recovery within the training block.':event&&n<=8?'Short event preparation: no automatic deload at phase changes; review actual recovery before proposing a reduction.':'Build within the current training block.'};
}

function customPhase(w,n,c=data.customRoadmap){
 if(c?.coachingPolicy==='review-v1')return candidateWeek(c,w).phase;
 // Only a scheduled strength event justifies a competition specificity/taper phase.
 if(c&&!c.strengthTargetDate){const ratio=w/Math.max(1,n);return ratio<=.30?'Foundation':'Development';}
 if(n===20){if(w<=5)return 'Foundation';if(w<=15)return 'Development';if(w<=18)return 'Specificity';return 'Taper / event'}
 const r=w/n;if(r>.92)return 'Taper / event';if(r>.73)return 'Specificity';if(r>.37)return 'Development';return 'Foundation';
}

function cycleWeek(w,n,c=data.customRoadmap){
 if(c?.coachingPolicy==='review-v1')return candidateWeek(c,w);
 if(n===20){
  if(w<=4)return {block:1,position:w,deload:false,label:'Accumulation 1'};
  if(w===5)return {block:1,position:5,deload:true,label:'Deload · Accumulation 1'};
  if(w<=9)return {block:2,position:w-5,deload:false,label:'Accumulation 2 / early strength'};
  if(w===10)return {block:2,position:5,deload:true,label:'Deload · early strength'};
  if(w<=14)return {block:3,position:w-10,deload:false,label:'Intensification'};
  if(w===15)return {block:3,position:5,deload:true,label:'Deload · intensification'};
  if(w<=18)return {block:4,position:w-15,deload:false,label:'Peaking'};
  if(w===19)return {block:5,position:1,deload:false,label:'Taper'};
  return {block:5,position:2,deload:false,label:'Competition week'};
 }
 const idx=Math.floor((w-1)/5),deload=w<=n-2&&w%5===0;
 return {block:idx+1,position:(w-1)%5+1,deload,label:deload?'Deload / transition':'Training block '+(idx+1)};
}

const variationCycles={Squat:['Safety-bar squat','Front squat','Paused squat'],Bench:['Close-grip bench','Spoto press','Paused bench'],Deadlift:['Paused deadlift','Deficit deadlift','Competition deadlift']};

const variationWhy={'Safety-bar squat':'Build quad and upper-back strength while practising upright bracing.','Front squat':'Challenge quad strength and upright positioning.','Paused squat':'Develop control and force production from the bottom.','Tempo squat':'Reinforce positional control under slower eccentric loading.','Competition squat':'Practise competition technique and specificity.','Close-grip bench':'Build triceps contribution and pressing strength.','Spoto press':'Practise tightness and control near the chest.','Paused bench':'Improve paused competition-style strength.','Tempo bench':'Reinforce bar path and control.','Competition bench':'Practise competition setup and commands.','Paused deadlift':'Improve position and tension through the pull.','Deficit deadlift':'Challenge the start position and leg drive.','Romanian deadlift':'Develop posterior-chain strength with controlled range.','Competition deadlift':'Practise the competition pull.'};

function variationBlock(w,n){const b=cycleWeek(w,n);return {index:Math.max(0,b.block-1),label:b.label,deload:b.deload};}

function variationChoice(c,lift,w){const b=variationBlock(w,c.weeks),specific=w/c.weeks>.74;
 const cfg=c.variations?.[lift]||{choice:'auto',lock:false};
 if(specific&&!cfg.lock)return {name:'Competition '+lift.toLowerCase(),why:'Competition-specific practice takes priority as the event approaches.',locked:false};
 if(cfg.choice&&cfg.choice!=='auto')return {name:cfg.choice,why:(variationWhy[cfg.choice]||'Athlete-selected variation.')+(cfg.lock?' Athlete-locked choice.':''),locked:!!cfg.lock};
 const options=variationCycles[lift],name=options[b.index%options.length];return {name,why:variationWhy[name],locked:false};
}

function customPlan(c){
 const warnings=[], strength=c.squat+c.bench+c.deadlift, total=strength+c.runs;
 if(total>c.days*2)warnings.push('You have '+total+' weekly activities across '+c.days+' available days. Several double-session days would be required.');
 if(c.event==='powerlifting'&&[c.squat,c.bench,c.deadlift].some(x=>x===0))warnings.push('A full powerlifting competition includes squat, bench and deadlift. An excluded lift may make meet preparation incomplete.');
 if(c.event==='squat'&&c.squat===0||c.event==='bench'&&c.bench===0||c.event==='deadlift'&&c.deadlift===0)warnings.push('Your chosen goal lift has zero sessions. Increase its frequency to prepare specifically.');
 if(c.priority==='Running'&&c.runs===0)warnings.push('Running is the top priority but you have no running sessions.');
 if(c.runs>0&&c.runGoal==='marathon'&&c.runs<3)warnings.push('Marathon preparation with fewer than three runs a week may limit specificity; this needs individual review.');
 if(c.date&&!c.noDate){const target=new Date(c.date+'T12:00:00');const days=(target-new Date())/86400000;if(days<0)warnings.push('The event date is in the past.');}
 if(total===0)warnings.push('Add at least one training session.');
 for(const k of ['Squat','Bench','Deadlift'])if(c[k.toLowerCase()]>0&&!(c.liftProfiles[k].kg>0))warnings.push('Enter a valid '+k+' performance baseline.');
 if(c.runs>0&&(!runningPaces(c)||c.runProfile.weeklyKm<0))warnings.push('Enter a valid running PB and recent weekly distance.');
 if(c.runs>0&&c.runProfile.recency==='old')warnings.push('Your running PB is over six months old; initial paces may be optimistic. Confirm current fitness.');
 const names={squat:'Squat',bench:'Bench',deadlift:'Deadlift'};const activities=[];
 for(const k of ['squat','bench','deadlift'])for(let i=0;i<c[k];i++)activities.push({type:'strength',name:names[k],detail:i===0?'Primary exposure':i===1?'Secondary exposure':'Additional technique / volume'});
 for(let i=0;i<c.runs;i++)activities.push({type:'run',name:'Run',detail:c.runGoal==='fitness'?(i===0?'Easy aerobic':i===1?'Longer easy aerobic':'Optional easy aerobic'):(i===0?'Quality / race-specific':i===1?'Easy aerobic':'Endurance / supporting run')});
 // Seven calendar days are always available. c.days is the maximum number of active days, not a Mon–Fri cutoff.
 const dayNames=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
 const allowed=Array.isArray(c.availableDays)&&c.availableDays.length?c.availableDays:dayNames;
 const slots=dayNames.map(day=>({day,items:[]}));
 if(c.longRunDay&&!allowed.includes(c.longRunDay))warnings.push('Your long-run day must be an available training day.');
 const lower=x=>['Squat','Deadlift'].includes(x.name);
 const hardRun=x=>x.type==='run'&&/Quality/.test(x.detail);
 const sorted=activities.slice().sort((a,b)=>{
   const rank=x=>x.name===c.priority?0:lower(x)?1:x.type==='strength'?2:3;
   return rank(a)-rank(b)
 });
 // Athlete-defined split: preserve exact calendar assignments, never reshuffle silently.
 if(c.manualSplit){
   const entries=c.manualSplit;
   const names={bench:'Bench',squat:'Squat',deadlift:'Deadlift'};
   let runIndex=0;
   for(const day of dayNames){
     const chosen=Array.isArray(entries[day])?entries[day]:[];
     const slot=slots.find(x=>x.day===day);
     if(chosen.includes('lower')){
       slot.items.push({type:'strength',name:'Squat',detail:'Lower-body session'});
       slot.items.push({type:'strength',name:'Deadlift',detail:'Same lower-body session'});
     }
     if(chosen.includes('bench'))slot.items.push({type:'strength',name:'Bench',detail:'Athlete-defined exposure'});
     if(chosen.includes('run')){slot.items.push({type:'run',name:'Run',detail:runIndex===0&&c.runGoal!=='fitness'?'Quality / race-specific':'Easy aerobic'});runIndex++}
     if(chosen.includes('long')){slot.items.push({type:'run',name:'Run',detail:'Long run · protected endurance'});runIndex++}
   }
   for(const [key,label] of Object.entries({squat:'Squat',bench:'Bench',deadlift:'Deadlift'})){
     const actual=slots.reduce((n,x)=>n+x.items.filter(i=>i.name===label).length,0);
     if(actual!==c[key])warnings.push(label+' frequency mismatch: selected '+actual+' but configured '+c[key]+'.');
   }
   const actualRuns=slots.reduce((n,x)=>n+x.items.filter(i=>i.type==='run').length,0);
   if(actualRuns!==c.runs)warnings.push('Run frequency mismatch: selected '+actualRuns+' but configured '+c.runs+'.');
   const longCount=Object.values(entries).filter(a=>Array.isArray(a)&&a.includes('long')).length;
   if(longCount!==1)warnings.push('Choose exactly one long run.');
   for(const slot of slots){
     if(slot.items.filter(i=>i.type==='run').length>1||slot.items.filter(i=>i.type==='strength').length>2)warnings.push(slot.day+' has too many training components.');
     if(slot.items.some(i=>i.type==='run'&&/Long run/.test(i.detail))&&slot.items.some(i=>i.type==='strength'))warnings.push(slot.day+' combines the protected long run with strength; consider separating these sessions.');
     if(slot.items.filter(i=>i.type==='run').length>1)warnings.push(slot.day+' has two runs; choose one.');
     if(slot.items.some(i=>i.type==='strength')&&slot.items.some(i=>i.type==='run')&&!c.doubleDays?.includes(slot.day))warnings.push(slot.day+' needs permission for a lift + run double session.');
   }
   if(!slots.some(x=>x.items.some(i=>i.type==='strength'))||!actualRuns)warnings.push('Hybrid training requires both lifting and running.');
   return {warnings,slots,total:slots.reduce((n,x)=>n+x.items.length,0)};
 }
 const preferred=[0,3,1,5,2,6,4]; // Spread demanding work across the full week.
 // Reserve the athlete's fixed long-run slot before scheduling other sessions.
 // Previously the greedy scheduler filled Saturday with strength work first,
 // then incorrectly rejected the long run because Saturday did not allow doubles.
 const runItems=sorted.filter(x=>x.type==='run');
 const longRun=runItems.length>=2?runItems[1]:runItems[0];
 if(c.longRunDay&&longRun&&allowed.includes(c.longRunDay)){
   slots.find(x=>x.day===c.longRunDay).items.push(longRun);
 }
 for(const item of sorted){
   if(item===longRun&&c.longRunDay&&allowed.includes(c.longRunDay))continue;
   const isLongRun=item===longRun;
   const scored=slots.map((slot,i)=>{
     if(!allowed.includes(slot.day))return {slot,score:1e8};
     if(isLongRun&&c.longRunDay&&slot.day!==c.longRunDay)return {slot,score:1e8};
     if(!isLongRun&&c.longRunDay&&item.type==='run'&&slot.day===c.longRunDay)return {slot,score:1e7};
     if(slot.items.length&&Array.isArray(c.doubleDays)&&!c.doubleDays.includes(slot.day)&&c.availableDays)return {slot,score:1e8};
     const active=slots.filter(x=>x.items.length).length;
     const wouldAdd=!slot.items.length;
     if(slot.items.length>=2)return {slot,score:1e5};
     let score=slot.items.length*6+(wouldAdd&&active>=c.days?85:0);
     if(slot.items.some(x=>lower(x)&&lower(item)))score+=65;
     if(slot.items.some(x=>x.name===item.name))score+=40;
     if(slot.items.some(x=>(lower(x)&&hardRun(item))||(hardRun(x)&&lower(item))))score+=55;
     if(slot.items.some(x=>x.type==='run'&&item.type==='run'))score+=30;
     if(item.type==='run'&&slot.items.some(x=>lower(x)))score+=14;
     for(const delta of [-1,1]){
       const neighbor=slots[i+delta];if(!neighbor)continue;
       if(lower(item)&&neighbor.items.some(lower))score+=30;
       if(lower(item)&&neighbor.items.some(hardRun))score+=22;
       if(hardRun(item)&&neighbor.items.some(lower))score+=22;
       if(item.name==='Bench'&&neighbor.items.some(x=>x.name==='Bench'))score+=28;
     }
     score+=preferred.indexOf(i)*.15;
     return {slot,score};
   }).sort((a,b)=>a.score-b.score);
   if(scored[0].score>=1e8){warnings.push('Could not schedule '+item.name+' within the selected days and double-session permissions. Adjust availability or frequencies.');continue}
   scored[0].slot.items.push(item);
 }
 const used=slots.filter(x=>x.items.length).length;
 if(used>c.days)warnings.push('Recovery scheduling requires '+used+' training days to avoid stacking hard sessions; your limit is '+c.days+'. Consider reducing frequency or allowing more double sessions.');
 return {warnings,slots,total};
}

function roundLoad(n){return Number.isFinite(n)&&n>=5?Math.round(n/2.5)*2.5:0}

function loadFromTopSet(weight,reps,rpe,targetReps,targetRpe){
 const w=Number(weight),n=Number(reps),effort=Number(rpe),tr=Number(targetReps),te=Number(targetRpe);
 if(!(w>0&&n>0&&effort>=1&&effort<=10&&tr>0&&te>=1&&te<=10))return 0;
 const estimatedMax=w*(1+(n+10-effort)/30);
 return Math.max(2.5,Math.round((estimatedMax/(1+(tr+10-te)/30))/2.5)*2.5);
}

function backoffProfile(phase,progress){
 if(phase==='Development'&&progress<=.45)return {topReps:5,backReps:5,backSets:3,backRpe:6.5,minDrop:.12,maxDrop:.20,fatigue:.025,label:'early strength · controlled volume'};
 if(phase==='Development')return {topReps:3,backReps:5,backSets:3,backRpe:7,minDrop:.08,maxDrop:.15,fatigue:.015,label:'late strength'};
 if(progress<.85)return {topReps:2,backReps:3,backSets:3,backRpe:7,minDrop:.05,maxDrop:.10,fatigue:.01,label:'early peaking'};
 return {topReps:1,backReps:2,backSets:2,backRpe:7,minDrop:.03,maxDrop:.08,fatigue:.005,label:'late peaking'};
}

function phaseBackoffLoad(weight,reps,rpe,profile){
 const w=Number(weight);if(!(w>0))return 0;
 const estimated=loadFromTopSet(w,reps,rpe,profile.backReps,profile.backRpe);
 // Account for fatigue and constrain the initial estimate to phase-appropriate loading.
 const fatigueAdjusted=estimated*(1-profile.fatigue);
 const constrained=Math.min(w*(1-profile.minDrop),Math.max(w*(1-profile.maxDrop),fatigueAdjusted));
 return Math.max(2.5,Math.floor((constrained+1e-8)/2.5)*2.5);
}

const accessoryPools={
 Squat:[
  [{name:'Bulgarian split squat',reps:10,role:'Single-leg quad development',sets:2},{name:'Seated leg curl',reps:12,role:'Hamstring hypertrophy',sets:2},{name:'Weighted plank',reps:30,role:'Trunk bracing (seconds)',sets:2}],
  [{name:'Leg press',reps:10,role:'Additional quad volume',sets:3},{name:'Romanian deadlift',reps:8,role:'Posterior-chain strength',sets:2},{name:'Pallof press',reps:12,role:'Anti-rotation control',sets:2}],
  [{name:'Reverse lunge',reps:8,role:'Single-leg stability',sets:2},{name:'Lying leg curl',reps:10,role:'Hamstring maintenance',sets:2},{name:'Ab wheel',reps:8,role:'Trunk control',sets:2}],
  [{name:'Leg extension',reps:12,role:'Low-skill quad support',sets:2},{name:'Cable crunch',reps:12,role:'Trunk maintenance',sets:2}]],
 Bench:[
  [{name:'Chest-supported row',reps:10,role:'Upper-back support',sets:3},{name:'Incline dumbbell press',reps:10,role:'Pressing hypertrophy',sets:2},{name:'Triceps pushdown',reps:12,role:'Triceps capacity',sets:2}],
  [{name:'One-arm dumbbell row',reps:10,role:'Upper-back strength',sets:3},{name:'Dumbbell floor press',reps:8,role:'Pressing strength',sets:2},{name:'Overhead triceps extension',reps:12,role:'Long-head triceps work',sets:2}],
  [{name:'Seated cable row',reps:10,role:'Scapular control',sets:2},{name:'Cable fly',reps:12,role:'Chest maintenance',sets:2},{name:'Triceps pushdown',reps:10,role:'Triceps maintenance',sets:2}],
  [{name:'Lat pulldown',reps:10,role:'Low-fatigue upper-back support',sets:2},{name:'Triceps pushdown',reps:12,role:'Low-fatigue triceps work',sets:1}]],
 Deadlift:[
  [{name:'Back extension',reps:12,role:'Posterior-chain capacity',sets:2},{name:'Lat pulldown',reps:10,role:'Upper-back support',sets:3},{name:'Side plank',reps:30,role:'Lateral trunk control (seconds)',sets:2}],
  [{name:'Hip thrust',reps:10,role:'Hip extension strength',sets:2},{name:'Seated cable row',reps:10,role:'Upper-back strength',sets:3},{name:'Pallof press',reps:12,role:'Anti-rotation control',sets:2}],
  [{name:'Back extension',reps:10,role:'Posterior-chain maintenance',sets:2},{name:'Chest-supported row',reps:10,role:'Upper-back maintenance',sets:2},{name:'Ab wheel',reps:8,role:'Trunk stability',sets:2}],
  [{name:'Lat pulldown',reps:10,role:'Low-fatigue back maintenance',sets:2}]]
};

const accessoryAlternatives={
 'Bulgarian split squat':['Reverse lunge','Leg press'],'Seated leg curl':['Lying leg curl','Back extension'],'Weighted plank':['Pallof press','Cable crunch'],
 'Leg press':['Leg extension','Reverse lunge'],'Romanian deadlift':['Back extension','Hip thrust'],'Pallof press':['Cable crunch','Side plank'],
 'Reverse lunge':['Bulgarian split squat','Leg extension'],'Lying leg curl':['Seated leg curl','Back extension'],'Ab wheel':['Weighted plank','Cable crunch'],
 'Leg extension':['Leg press','Bulgarian split squat'],'Cable crunch':['Weighted plank','Pallof press'],
 'Chest-supported row':['Seated cable row','One-arm dumbbell row'],'Incline dumbbell press':['Dumbbell floor press','Cable fly'],'Triceps pushdown':['Overhead triceps extension'],
 'One-arm dumbbell row':['Chest-supported row','Seated cable row'],'Dumbbell floor press':['Incline dumbbell press','Cable fly'],'Overhead triceps extension':['Triceps pushdown'],
 'Seated cable row':['Chest-supported row','One-arm dumbbell row'],'Cable fly':['Incline dumbbell press','Dumbbell floor press'],
 'Lat pulldown':['Chest-supported row','Seated cable row'],'Back extension':['Hip thrust','Romanian deadlift'],
 'Side plank':['Pallof press','Weighted plank'],'Hip thrust':['Back extension','Romanian deadlift']
};

function accessoryPrefs(){return data.accessoryPreferences||{}}

function accessoryNames(){return [...new Set(Object.values(accessoryPools).flat(2).map(x=>x.name))].sort()}

function accessorySelection(lift,w,totalWeeks,secondary){
 const phase=customPhase(w,totalWeeks,data.customRoadmap||null),b=variationBlock(w,totalWeeks),idx=Math.min(3,Math.floor((w-1)/5));
 if(phase==='Taper / event')return [];
 const deload=b.deload,base=accessoryPools[lift][idx%4],prefs=accessoryPrefs(),prior=accessoryPools[lift][Math.max(0,idx-1)%4];
 const output=[],used=new Set();
 for(let i=0;i<base.length;i++){
  let entry=base[i],why='Block '+(idx+1)+': '+entry.role+'.';
  const kept=prior.find(x=>x.role===entry.role&&prefs[x.name]==='prefer');
  if(kept&&idx>0){entry=kept;why='Kept your preferred exercise for '+entry.role.toLowerCase()+'.'}
  if(['avoid','unavailable'].includes(prefs[entry.name])){
   const alt=(accessoryAlternatives[entry.name]||[]).find(n=>!['avoid','unavailable'].includes(prefs[n])&&!used.has(n));
   if(alt){why=entry.name+' replaced with '+alt+' because of your preference. Same general training purpose.';entry={...entry,name:alt}}
   else continue;
  }
  if(used.has(entry.name))continue;used.add(entry.name);
  const volume=phase==='Specificity'?Math.max(1,entry.sets-1):entry.sets;
  const sets=deload?Math.max(1,Math.ceil(volume/2)):volume;
  if(secondary&&i===base.length-1)continue;
  const recent=(data.sets||[]).filter(x=>x.exercise===entry.name&&+x.weight>0&&+x.rpe>0).slice(-3);
  const last=recent.at(-1),target=deload?6:phase==='Specificity'?7:7.5;
  const next=last&&+last.reps>=entry.reps+2&&+last.rpe<=target?Math.round(last.weight*1.025*2)/2:last?+last.weight:0;
  output.push({name:entry.name,sets,reps:entry.reps,weight:next,rpe:target,why:why+' '+(last?'Load suggested from logged history; build reps before increasing.':'Choose initial load by RPE; aim to add reps before weight.'),range:entry.reps+'–'+(entry.reps+2)});
 }
 return output;
}

function exerciseEstimatedMax(name){
 const rows=(data.sets||[]).filter(x=>x.exercise===name&&+x.weight>0&&+x.reps>=1&&+x.reps<=10&&+x.rpe>=6&&+x.rpe<=10);
 const sessions=new Set(rows.map(x=>String(x.date||'').slice(0,10)));
 if(sessions.size<2)return 0;
 const recent=rows.slice(-12).map(x=>+x.weight*(1+(+x.reps+10-(+x.rpe))/30)).filter(Number.isFinite);
 return recent.length?recent.sort((x,y)=>x-y)[Math.floor(recent.length/2)]:0;
}

function hybridRecoverySignals(){
 const now=Date.now(),day=86400000;
 const runs=(data.runs||[]).filter(r=>{const t=Date.parse(r.date);return Number.isFinite(t)&&t<=now&&t>=now-28*day&&+r.km>0});
 const distance=(a,b)=>runs.filter(r=>{const age=(now-Date.parse(r.date))/day;return age>=a&&age<b}).reduce((sum,r)=>sum+(+r.km||0),0);
 const recentKm=distance(0,7),priorKm=distance(7,14);
 const recentLong=Math.max(0,...runs.filter(r=>(now-Date.parse(r.date))/day<30).map(r=>+r.km||0));
 const hardRuns=runs.filter(r=>(now-Date.parse(r.date))/day<10&&+r.rpe>=8).length;
 const lower=(data.sets||[]).filter(x=>{const t=Date.parse(x.date);return Number.isFinite(t)&&t<=now&&t>=now-10*day&&/squat|deadlift|leg press|lunge/i.test(x.exercise||'')&&+x.rpe>=8});
 const lowerDays=new Set(lower.map(x=>String(x.date).slice(0,10))).size;
 const recovery=typeof reviewRecovery==='function'?reviewRecovery():{lowDays:0,symptoms:false};
 const feedback=(data.sessionFeedback||[]).filter(x=>{const t=Date.parse(x.date);return Number.isFinite(t)&&t<=now&&t>=now-10*day});
 const hardFeedback=feedback.filter(x=>x.difficulty==='harder'&&x.energy==='low').length;
 const strained=!!(recovery.lowDays>=2||recovery.symptoms||hardFeedback>=2||feedback.some(x=>x.discomfort==='yes'));
 return {recentKm,priorKm,recentLong,runCount:runs.length,hardRuns,lowerDays,strained};
}

function hybridAthleteBaseline(){
 const now=Date.now(),day=86400000;
 const runs=(data.runs||[]).filter(x=>Number.isFinite(Date.parse(x.date))&&+x.km>0);
 const sets=(data.sets||[]).filter(x=>Number.isFinite(Date.parse(x.date))&&/squat|deadlift|leg press|lunge|romanian/i.test(x.exercise||'')&&+x.rpe>=7.5);
 const buckets=[];
 for(let w=0;w<8;w++){
  const inWeek=x=>{const age=(now-Date.parse(x.date))/day;return age>=w*7&&age<(w+1)*7};
  const km=runs.filter(inWeek).reduce((a,x)=>a+(+x.km||0),0);
  const lower=sets.filter(inWeek).reduce((a,x)=>a+Math.max(0,+x.weight||0)*Math.max(0,+x.reps||0)*Math.max(.5,(+x.rpe||7)/8),0);
  buckets.push({km,lower});
 }
 const median=xs=>{const a=xs.slice().sort((x,y)=>x-y);return a.length?a[Math.floor(a.length/2)]:0};
 const history=buckets.slice(1,7);
 const runWeeks=history.filter(x=>x.km>=3).map(x=>x.km);
 const lowerWeeks=history.filter(x=>x.lower>=300).map(x=>x.lower);
 return {runKm:median(runWeeks),lowerLoad:median(lowerWeeks),runWeeks:runWeeks.length,lowerWeeks:lowerWeeks.length,current:buckets[0],history:buckets};
}

function hybridInterventionFollowup(week){
 const prior=(data.decisions||[]).filter(d=>d.kind==='hybrid-load'&&d.approved&&Number(d.week)<week&&Number(d.week)>=week-3).sort((a,b)=>Number(b.week)-Number(a.week))[0];
 if(!prior)return null;
 const sig=hybridRecoverySignals();
 const rec=typeof reviewRecovery==='function'?reviewRecovery():{lowDays:0,symptoms:false};
 const unresolved=!!(sig.strained||rec.lowDays>=2||rec.symptoms);
 return {prior,unresolved,age:week-Number(prior.week),level:unresolved?'review':'continue'};
}

function hybridWorkloadRecommendation(){
 const sig=hybridRecoverySignals(),now=Date.now(),day=86400000;
 const recent=sig.recentKm,prior=sig.priorKm;
 const baselineRun=hybridAthleteBaseline();
 const surge=prior>=3&&recent>prior*1.3 && !(baselineRun.runWeeks>=3&&recent<=baselineRun.runKm*1.15);
 const lower=(data.sets||[]).filter(x=>{const t=Date.parse(x.date);return Number.isFinite(t)&&t<=now&&t>=now-10*day&&/squat|deadlift|leg press|lunge|romanian/i.test(x.exercise||'')&&Number(x.rpe)>=7.5});
 const lowerLoad=lower.reduce((n,x)=>n+Math.max(0,+x.weight||0)*Math.max(0,+x.reps||0)*Math.max(.5,(+x.rpe||7)/8),0);
 const baseline=hybridAthleteBaseline();
 const highLower=(lowerLoad>=4500||lower.length>=8) && !(baseline.lowerWeeks>=3&&baseline.current.lower<=baseline.lowerLoad*1.15);
 const accustomedLower=lowerLoad>=4500&&baseline.lowerWeeks>=3&&baseline.current.lower<=baseline.lowerLoad*1.15;
 const overlap=sig.hardRuns>=1&&(sig.lowerDays>=1||highLower);
 const feedback=(data.sessionFeedback||[]).filter(x=>{const t=Date.parse(x.date);return Number.isFinite(t)&&t<=now&&t>=now-10*day});
 const recovery=typeof reviewRecovery==='function'?reviewRecovery():{lowDays:0,symptoms:false};
 const discomfort=!!(recovery.symptoms||feedback.some(x=>x.discomfort==='yes'));
 const repeatedFatigue=recovery.lowDays>=2||feedback.filter(x=>x.difficulty==='harder'&&x.energy==='low').length>=2;
 const fatigue=!!(repeatedFatigue||(sig.hardRuns>=2&&sig.lowerDays>=2));
 const c=data.customRoadmap||{};
 const target=c.runningTargetDate?Date.parse(c.runningTargetDate+'T12:00:00'):NaN;
 const nearRace=Number.isFinite(target)&&target>=now&&target-now<28*day;
 const reasons=[];
 if(surge)reasons.push('running volume rose more than 30% compared with the previous week');
 if(overlap)reasons.push('hard running overlaps demanding lower-body work');
 if(highLower)reasons.push('recent combined lower-body workload is substantial');
 if(repeatedFatigue)reasons.push('repeated poor recovery or difficult sessions');
 if(discomfort)reasons.push('discomfort or symptoms were reported');
 if(!reasons.length&&!fatigue)return {level:'continue',reasons:accustomedLower?['High lower-body workload is consistent with your recent training history']:[],signals:sig,lowerLoad,baseline};
 if(discomfort)return {level:'review',reasons,signals:sig,lowerLoad,intervention:null,factor:1};
 // A workload spike or hard session is not automatically a reason to cut training.
 if(!repeatedFatigue&&!(sig.hardRuns>=2&&sig.lowerDays>=2))return {level:'monitor',reasons,signals:sig,lowerLoad,intervention:null,factor:1};
 const intervention=(nearRace||highLower&&!surge)?'lower-accessory':'running-duration';
 return {level:'adjust',intervention,factor:intervention==='running-duration'?.90:1,reasons,signals:sig,lowerLoad,protectLongRun:true};
}

function hybridRunWeek(c,w){
 const p=c.runProfile||{}, raw=Number(p.weeklyKm), known=Number.isFinite(raw)&&raw>0;
 const n=Math.max(1,Number(c.weeks)||12),goal=c.runGoal||'fitness', runs=Math.max(1,Number(c.runs)||1);
 const race=goal!=='fitness';
 // Unknown mileage is NOT zero fitness. Use conservative provisional run/walk exposure.
 const base=known?raw:Math.max(6,Math.min(12,runs*3));
 const focus=c.hybridFocus||(c.priority==='Running'?'running':'balanced');
 const target=c.runningTargetDate?new Date(c.runningTargetDate+'T12:00:00'):null;
 const origin=c.startDate?new Date(c.startDate+'T12:00:00'):new Date();
 const monday=d=>{const m=new Date(+d);m.setDate(m.getDate()-((m.getDay()+6)%7));return m};
 const raceWeek=target&&Number.isFinite(+target)?c.coachingPolicy==='review-v1'?Math.max(1,Math.round((monday(target)-monday(origin))/604800000)+1):Math.max(1,Math.ceil((target-origin+86400000)/604800000)):null;
 const remaining=raceWeek!==null?raceWeek-w+1:n-w+1;
 const template=c.coachingPolicy==='review-v1'&&c.runTemplate==='easy-one-quality-10k'&&goal==='10k';
 const taper=race&&(template?remaining===1:remaining>=0&&remaining<=2);
 const deload=c.coachingPolicy==='review-v1'?candidateWeek(c,w).deload&&!taper:w>1&&w%4===0&&!taper;
 const maxBuild=focus==='strength'?1.45:focus==='running'?2.3:1.85;
 // Modest gradual growth, recovery every fourth week; no forced end-of-year taper for fitness.
 const growth=Math.min(maxBuild,Math.pow(1.035,Math.max(0,w-1)));
 const factor=taper?(remaining<=1?.62:.82):deload?.82:template?Math.min(1.20,1+.035*Math.max(0,w-1)):growth;
 const signals=hybridRecoverySignals();
 // Only use logged volume when there is a recent, meaningful history; missing logs are not evidence of detraining.
 const observed=signals.recentKm>=3&&signals.priorKm>=3;
 const planned=base*factor;
 const overload=observed&&signals.recentKm>signals.priorKm*1.3;
 const hybridStrain=signals.strained||(signals.hardRuns>=2&&signals.lowerDays>=2);
 const hold=overload||hybridStrain;
 // Recovery modifies upcoming prescriptions, never retroactively rewrites completed sessions.
 const km=planned; // Never silently modify an approved programme. Surface recovery recommendations for athlete approval.

 const maxLong=goal==='marathon'?.78:goal==='half'?.65:.48;
 // Two-run marathon schedules need a feasibility warning, not artificially tiny long runs.
 const longShare=goal==='marathon'?(runs===2?.78:runs===3?.68:.55):goal==='half'?(runs===2?.65:.48):Math.min(maxLong,Math.max(.32,1/runs+.05));
 const longKm=km*longShare;
 const warnings=[];
 if(hold)warnings.push('Shared recovery review: recent running load and lower-body strength/recovery signals suggest holding or reducing running volume. Current prescription remains unchanged until athlete approval.');
 if(!known)warnings.push('Running baseline unknown: provisional easy run/walk starting volume. Confirm recent training before increasing.');
 if(goal==='marathon'&&runs<3)warnings.push('Marathon preparation with fewer than three runs weekly is high-risk for inadequate supporting mileage; consider another run or revising the goal.');
 if(goal==='marathon'&&base<25)warnings.push('Marathon readiness: current weekly volume is low. This plan cannot assume a 30–32 km long run is safe; extend preparation or reassess after building a base.');
 if(goal==='marathon'&&longKm>30)warnings.push('Long run above 30 km: check recent longest run, time on feet, recovery, and total weekly volume before approving.');
 if(goal==='marathon'&&longShare>.55)warnings.push('Long run is a large fraction of weekly mileage. Two-run marathon schedules require individual review and may not provide sufficient supporting volume.');
 if(race&&remaining>0&&remaining<5)warnings.push('Limited time to race: do not force rapid increases.');
 return {km,factor,deload,taper,longShare,longKm,warnings,remaining,provisional:!known,hybridStrain,observed};
}

function selectTrainingFramework(c){
 const strengthEvent=!!c.strengthTargetDate;
 const runningEvent=!!c.runningTargetDate;
 const runPriority=c.priority==='Running'||c.hybridFocus==='running';
 return {
  strength:strengthEvent?'event-specific strength blocks':runPriority?'strength maintenance':'progressive strength blocks',
  running:runningEvent?'race-specific running':c.runGoal==='fitness'?'aerobic maintenance':'progressive running',
  coordination:strengthEvent&&runningEvent?'dual-event priority and recovery':runPriority?'protect key runs':'protect key strength sessions',
  rationale:strengthEvent?'Strength competition requires a specificity phase and event-week taper.':'Without a strength event, continue building rather than imposing a competition peak.'
 };
}

function generatedSessions(c,w){
 const strengthEventWeek=c.strengthTargetDate&&c.startDate?Math.max(1,Math.floor((Date.parse(c.strengthTargetDate+'T12:00:00')-(Date.parse(c.startDate+'T12:00:00')-((new Date(c.startDate+'T12:00:00').getDay()+6)%7)*86400000))/604800000)+1):null;
 const strengthWeeks=strengthEventWeek||c.weeks;
 const framework=selectTrainingFramework(c);
 const phase=customPhase(c.coachingPolicy==='review-v1'?w:Math.min(w,strengthWeeks),strengthWeeks,c);const plan=customPlan(c),out=[];
 const taper=!!strengthEventWeek&&w===strengthEventWeek; // Event week only; preserve final heavy single in preceding week.
 const isRunPriority=c.priority==='Running';
 // No event date means no artificial strength peaking or taper; the next cycle can continue progression.
 const phases={Foundation:{sets:4,reps:6,intensity:.66,rpe:7},Development:{sets:4,reps:5,intensity:.73,rpe:7.5},Specificity:{sets:3,reps:3,intensity:.82,rpe:8},'Taper / event':{sets:2,reps:2,intensity:.68,rpe:6.5}};
 const settings={...phases[phase]};
 const block=cycleWeek(w,c.weeks);
 // Within-block progressive loading; deloads preserve moderate intensity while halving work.
 const step=Math.max(0,Math.min(3,block.position-1));
 // Short event preparations must still increase specificity before competition week.
 const weeksToStrengthEvent=strengthEventWeek?strengthEventWeek-w:null;
 if(weeksToStrengthEvent!==null&&weeksToStrengthEvent>0&&weeksToStrengthEvent<=3){settings.intensity=[0,.87,.84,.80][weeksToStrengthEvent];settings.sets=weeksToStrengthEvent===1?2:3;settings.reps=weeksToStrengthEvent===1?2:3;settings.rpe=weeksToStrengthEvent===1?8:7.5;}
 if(!taper&&!(weeksToStrengthEvent!==null&&weeksToStrengthEvent>0&&weeksToStrengthEvent<=3)){settings.intensity+=step*(phase==='Foundation'?.012:phase==='Development'?.01:.008);}
 if(block.deload){settings.sets=Math.max(2,Math.ceil(settings.sets*.55));settings.intensity=Math.max(.60,settings.intensity-.045);settings.rpe=6;}
 if(taper){
  settings.sets=1;
  settings.reps=2;
  settings.intensity=.70;
  settings.rpe=6;
 }

 const dayOffset={Monday:0,Tuesday:1,Wednesday:2,Thursday:3,Friday:4,Saturday:5,Sunday:6,Mon:0,Tue:1,Wed:2,Thu:3,Fri:4,Sat:5,Sun:6};
 const peakCandidates=plan.slots.filter(slot=>slot.items.some(item=>item.type==='strength'&&item.name==='Bench')).map(slot=>({day:slot.day,offset:dayOffset[slot.day]??0}));
 const peakBenchDay=peakCandidates.length?peakCandidates.reduce((best,item)=>{const daysOut=((new Date(c.strengthTargetDate+'T12:00:00').getDay()+6)%7-item.offset+7)%7;return daysOut>=5&&daysOut<=9&&(!best||daysOut<best.daysOut)?{day:item.day,daysOut}:best},null)?.day||peakCandidates[peakCandidates.length-1].day:null;
 const liftCount={};
 for(const slot of plan.slots){if(!slot.items.length)continue;
  const ex=[],runs=[],variationNotes=[];
  for(const item of slot.items){if(item.type==='strength'){
   const lift=item.name,occurrence=liftCount[lift]||0;liftCount[lift]=occurrence+1;
   const secondary=occurrence>0;
   const sets=Math.max(1,settings.sets-(secondary?1:0));
   const reps=settings.reps+(secondary&&!taper?1:0);
   const factor=settings.intensity*(secondary?.9:1)*(lift===c.priority?1.015:1);
   const vb=variationBlock(w,c.weeks),selectedVariation=variationChoice(c,lift,w);
   const candidate=c.coachingPolicy==='review-v1';
   const light=candidate&&(c.lightLifts||[]).some(x=>String(x).toLowerCase()===lift.toLowerCase());
   const nearBenchMeet=lift==='Bench'&&strengthEventWeek&&weeksToStrengthEvent!==null&&weeksToStrengthEvent>=0&&weeksToStrengthEvent<=6;
   // Within six weeks of a bench meet, the first two weekly exposures must
   // practise the competition lift; only the third may use a variation.
   const competitionBenchExposure=nearBenchMeet&&occurrence<2;
   const useVariation=secondary&&!taper&&!competitionBenchExposure&&!(strengthEventWeek&&w===strengthEventWeek-1&&lift==='Bench');const exerciseName=useVariation?selectedVariation.name:lift;
   const variationSets=useVariation?Math.max(1,sets-(phase==='Specificity'?1:0)):sets;
   const variationReps=useVariation?(phase==='Foundation'?6:phase==='Development'?5:phase==='Specificity'?3:reps):reps;
   const variationRpe=useVariation?(phase==='Foundation'?7:phase==='Development'?7.5:8):Math.max(5,settings.rpe-(secondary?.5:0));
   // Variations are calibrated independently: never transfer competition-lift percentage loads.
   const previous=(data.sets||[]).filter(x=>x.exercise===exerciseName&&+x.weight>0&&+x.rpe>0).slice(-6);
   const recent=previous.length?previous[previous.length-1]:null;
   const profile=c.liftProfiles?.[lift]||{};
   const loggedMax=(data.sets||[]).filter(x=>String(x.exercise||'').toLowerCase()===lift.toLowerCase()&&+x.weight>=20&&+x.reps>=1&&+x.reps<=10&&+x.rpe>=6&&+x.rpe<=10).slice(-12).map(x=>+x.weight*(1+(+x.reps+10-(+x.rpe))/30));
   const historicalMax=loggedMax.length?loggedMax.sort((a,b)=>a-b)[Math.floor(loggedMax.length/2)]:0;
   const knownMax=(Number(c.baselines?.[lift])>0?Number(c.baselines[lift]):0)||(Number(profile.kg)>0?estimatedMax(Number(profile.kg),Number(profile.reps)||1):0)||historicalMax;
   const baseline=useVariation?exerciseEstimatedMax(exerciseName):knownMax;
   // First-week athlete-defined secondary sessions retain a known-load competition lift until a variation is calibrated.
   const loadBaseline=baseline>0?baseline:(!useVariation?knownMax:0);
   const suggested=useVariation?(loadBaseline>0?roundLoad(loadBaseline*factor):recent?roundLoad(recent.weight*(+recent.rpe<variationRpe-.5?1.025:1)):0):(loadBaseline>0?roundLoad(loadBaseline*factor):0);
   const primary=!secondary;
   const strengthBlock=phase==='Development'||phase==='Specificity';
   const peakPractice=!!strengthEventWeek&&w===strengthEventWeek-1&&lift==='Bench'&&(slot.day===peakBenchDay||slot.day.slice(0,3)===peakBenchDay?.slice(0,3));
    const requestedTop=candidate&&c.topSetFirst&&lift==='Bench';
    const topEligible=!light&&((requestedTop&&!vb.deload&&!taper)||(primary&&(strengthBlock||(weeksToStrengthEvent!==null&&weeksToStrengthEvent>0&&weeksToStrengthEvent<=3))&&!vb.deload&&!taper)||peakPractice);
   if(light){
    ex.push([exerciseName,vb.deload||taper?1:2,3,baseline?roundLoad(baseline*.55):0,5.5,{role:'straight',category:'secondary',baseline,light:true}]);
    variationNotes.push(exerciseName+': light technique work, capped at RPE 5.5; no heavy top set.');
   }else if(topEligible){
    const profile=phase==='Foundation'&&requestedTop?{topReps:4,backReps:6,backSets:secondary?2:3,backRpe:6.5,minDrop:.12,maxDrop:.20,fatigue:.025,label:'foundation top set and controlled back-offs'}:peakPractice?{topReps:1,backReps:2,backSets:1,backRpe:6,minDrop:.10,maxDrop:.16,fatigue:.01,label:'final heavy single'}:backoffProfile(phase,w/c.weeks);
    if(requestedTop&&secondary&&!peakPractice)profile.backSets=Math.max(1,profile.backSets-1);
    // At a new strength phase, exchange straight-set volume for the top-set stimulus.
    // Avoid adding a heavy top set on top of an unchanged high-volume prescription.
    if(!strengthEventWeek&&phase==='Development'&&customPhase(Math.max(1,w-1),c.weeks,c)==='Foundation'){
     profile.backSets=Math.min(profile.backSets,3);
     profile.backReps=Math.min(profile.backReps,5);
    }
    const topReps=peakPractice?1:(weeksToStrengthEvent===1&&lift==='Bench'?1:profile.topReps);
    const topRpe=phase==='Foundation'&&requestedTop?7:requestedTop&&secondary&&!peakPractice?7.5:peakPractice?8.5:weeksToStrengthEvent===1&&lift==='Bench'?7.5:phase==='Development'?8:Math.round(Math.min(8.5,8+Math.max(0,w/c.weeks-.75))*2)/2;
    const targetPct=phase==='Foundation'&&requestedTop ? .80 : (phase==='Development'?(topReps===5?.77:.83):(topReps===2?.87:.91))+Math.max(0,Math.min(3,block.position-1))*(phase==='Development'?.012:.009);
    let topWeight=baseline?roundLoad(baseline*(peakPractice?.94:(weeksToStrengthEvent!==null&&weeksToStrengthEvent>0&&weeksToStrengthEvent<=3?[0,.88,.85,.82][weeksToStrengthEvent]:targetPct))):0;
    if(requestedTop&&secondary&&!peakPractice&&topWeight>0)topWeight=roundLoad(topWeight*.975);
    const topIndex=ex.length;
    ex.push([exerciseName,1,topReps,topWeight,topRpe,{role:'top',category:'primary',baseline}]);
    const initialBackWeight=topWeight?phaseBackoffLoad(topWeight,topReps,topRpe,profile):0;
    ex.push([exerciseName,profile.backSets,profile.backReps,initialBackWeight,profile.backRpe,{role:'backoff',category:'primary',baseline,topIndex,backoffProfile:profile}]);
    variationNotes.push(exerciseName+': top set '+topReps+' reps @ RPE '+topRpe+'; log actual load and RPE to calculate back-off loads.');
   }else{
    ex.push([exerciseName,vb.deload?Math.max(1,variationSets):variationSets,variationReps,suggested,vb.deload?6:variationRpe,{role:'straight',category:primary?'primary':'secondary',baseline}]);
   }
   if(useVariation){const why=selectedVariation.why+' '+(recent?'Suggested load uses previous exercise-specific history; verify by warm-ups.':'First exposure: discover working load through warm-ups at target RPE.');variationNotes.push(exerciseName+': '+why)}
   // Two optional, low-priority isolation slots rotate by training block.
   // Their completion is never required to finish a workout or assess adherence.
   if(lift==='Bench'&&!taper&&!(candidate&&vb.deload)){
    const extras=[['Cable biceps curl','Hammer curl','Preacher curl','Incline dumbbell curl'],['Rope triceps pushdown','Overhead cable triceps extension','Single-arm cable pushdown','Dumbbell triceps extension']];
    const rotation=Math.floor((w-1)/4)%4;
    for(const pool of extras){const name=pool[rotation];if(!ex.some(e=>e[0]===name))ex.push([name,2,12,0,7,{role:'optional',category:'optional',optional:true}]);}
   }
   // Accessories rotate by block, respect preferences, and use exercise-specific RPE loading.
   let accessories=accessorySelection(lift,w,c.weeks,secondary);
   if(light)accessories=accessories.filter(a=>isTertiaryExercise(a.name)).slice(0,1).map(a=>({...a,sets:Math.min(2,a.sets),rpe:6}));
   for(const acc of accessories){if(ex.some(e=>e[0]===acc.name))continue;ex.push([acc.name,acc.sets,acc.reps,acc.weight,acc.rpe]);variationNotes.push(acc.name+' ('+acc.range+' reps): '+acc.why)}
  }else{
   const isLongRun=/Long run|Longer easy aerobic/.test(item.detail);
   const template=c.coachingPolicy==='review-v1'&&c.runTemplate==='easy-one-quality-10k'&&c.runGoal==='10k';
   const quality=!isLongRun&&c.runGoal!=='fitness'&&/Quality/.test(item.detail)&&!(strengthEventWeek&&w===strengthEventWeek)&&(!template||(!hybridRunWeek(c,w).taper&&!out.some(s=>s.runs.some(r=>r.role==='quality-run'))));
   const rp=runningPaces(c),runWeek=hybridRunWeek(c,w),weekly=runWeek.km;
   const longKm=weekly*runWeek.longShare,otherKm=Math.max(0,weekly-longKm)/Math.max(1,c.runs-1);
   const perRun=isLongRun?longKm:otherKm;
   const easyPace=rp?rp.easyLow:420;
   const estimated=Math.round(perRun*easyPace/60);
   // Running fitness maintenance stays easy; quality running has explicit capped work intervals.
   if(quality){
    const baseReps=template?Math.min(5,3+Math.floor(Math.max(0,w-1)/2)):runWeek.taper?3:phase==='Foundation'?4:phase==='Development'?5:4;
    const reps=c.coachingPolicy==='review-v1'&&runWeek.deload?Math.max(2,Math.ceil(baseReps*.5)):baseReps;
    const workKm=template?.8:runWeek.taper?.4:phase==='Foundation'?.5:.6,recoveryKm=.25;
    const warmKm=template?2:1.5;
    // Allocate the remaining easy distance here so weekly targets match actual sessions.
    const coolKm=template?Math.max(1,Math.round((perRun-warmKm-reps*workKm-(reps-1)*recoveryKm)*4)/4):1.25;
    const easy=rp?paceText(rp.easyLow)+' to '+paceText(rp.easyHigh):'Easy · RPE 3–4';
    const threshold=rp?paceText(rp.threshold):'RPE 7 · pace to be established';
    const steps=[{label:'Warm-up',distanceKm:warmKm,detail:template?'Zone 2 / conversational · RPE 3–4':'Easy running · RPE 3–4',pace:easy}];
    for(let i=0;i<reps;i++){
      steps.push({label:'Threshold interval '+(i+1)+' of '+reps,distanceKm:workKm,detail:'RPE 7 · controlled',pace:threshold});
      if(i<reps-1)steps.push({label:'Easy recovery',distanceKm:recoveryKm,detail:'Jog or walk · RPE 2–3',pace:'Easy'});
    }
    steps.push({label:'Cool-down',distanceKm:coolKm,detail:template?'Zone 2 / conversational · RPE 3–4':'Easy running · RPE 3–4',pace:easy});
    const distanceKm=steps.reduce((n,x)=>n+x.distanceKm,0);
    const minutes=Math.round((warmKm+coolKm+(reps-1)*recoveryKm)*(rp?.easyLow||480)/60+reps*workKm*(rp?.threshold||420)/60);
    runs.push({role:'quality-run',name:'Controlled threshold intervals',distanceKm,minutes,rpe:7,pace:threshold,paceRole:'threshold intervals only',steps,structure:`${distanceLabel(warmKm)} easy + ${reps} × ${distanceLabel(workKm)} threshold / ${distanceLabel(recoveryKm)} recovery + ${distanceLabel(coolKm)} easy`,workMinutes:Math.round(reps*workKm*(rp?.threshold||420)/60),reason:template?'One controlled intensity session this week. Warm-up, recoveries and remaining distance stay conversational / Zone 2; pace is secondary to effort.':'Distances are the targets. Pace guides threshold efforts; adjust using RPE.'});
   }else{
    const distanceKm=Math.round(perRun*4)/4;
    const duration=Math.round(distanceKm*(rp?.easyLow||480)/60);
    runs.push({role:isLongRun?'long-run':'easy-run',name:isLongRun?'Long easy run':'Easy aerobic run',distanceKm,minutes:duration,rpe:3.5,pace:rp?paceText(rp.easyLow)+' to '+paceText(rp.easyHigh):'RPE 3–4',steps:[{label:isLongRun?'Long easy run':'Easy run',distanceKm,detail:template?'Zone 2 / conversational · RPE 3–4':'RPE 3–4 · conversational',pace:rp?paceText(rp.easyLow)+' to '+paceText(rp.easyHigh):'Easy'}],structure:`${distanceLabel(distanceKm)} conversational easy running`,workMinutes:0,reason:isLongRun?'Protected endurance distance; adjust for recovery.':'Aerobic distance at conversational effort.'});
   }
  }}
  const id='custom-'+slot.day.toLowerCase();const name=[...slot.items.filter(x=>x.type==='strength').map(x=>x.name),...runs.map(x=>x.name)].join(' + ');
  const purpose=phase==='Foundation'?'Build repeatable technique and capacity.':phase==='Development'?'Progress productive workload with manageable effort.':phase==='Specificity'?'Practise event-specific effort while managing fatigue.':'Reduce workload to arrive fresher for the event.';
  const reason=(c.coachingPolicy==='review-v1'&&block.deload?block.rationale+' ':'')+purpose+' '+(slot.items.some(x=>x.name===c.priority)?c.priority+' gets priority for progression and recovery.':isRunPriority&&runs.length?'Running is the protected priority.':'Support the main goal without unnecessary fatigue.');
  const hybridNotes=[];
  if(runs.length){const rw=hybridRunWeek(c,w);hybridNotes.push(...rw.warnings);if(rw.deload)hybridNotes.push('Running recovery week: reduced running volume.');if(rw.taper)hybridNotes.push('Running event taper: reduced running volume.');}
  if(ex.some(e=>/Squat|Deadlift/.test(e[0]))&&runs.some(r=>r.rpe>=7))hybridNotes.push('Hard running with lower-body lifting: consider moving the quality run or reducing its intensity.');
  out.push({id,day:slot.day,name,desc:reason,hybridNotes,variationNotes,ex,run:!ex.length&&runs.length>0,runs,reason,week:w,phase});
 }
 // Replace ordinary training on the exact target dates, using Monday-anchored calendar weeks.
 const monday=date=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()-((d.getDay()+6)%7));return d;};
 if(c.startDate)for(const event of [{date:c.strengthTargetDate,type:'strength',name:'Strength competition'},{date:c.runningTargetDate,type:'running',name:'Running event'}]){
  if(!event.date)continue;
  const target=new Date(event.date+'T12:00:00');
  if(!Number.isFinite(+target))continue;
  const eventWeek=Math.round((monday(event.date)-monday(c.startDate))/604800000)+1;
  if(eventWeek!==w)continue;
  const day=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][target.getDay()];
  const short=day.slice(0,3);const index=out.findIndex(session=>session.day===day||session.day===short);
  if(index>=0)out.splice(index,1);
  out.push({id:'event-'+event.type+'-'+event.date,day,name:event.name,desc:'Target event · '+event.date,reason:'Competition replaces scheduled training.',hybridNotes:[],variationNotes:[],ex:[],runs:[],run:false,week:w,phase:'Competition',eventDate:event.date,eventType:event.type});
 }
 const dayOrder={Monday:0,Mon:0,Tuesday:1,Tue:1,Wednesday:2,Wed:2,Thursday:3,Thu:3,Friday:4,Fri:4,Saturday:5,Sat:5,Sunday:6,Sun:6};out.sort((a,b)=>(dayOrder[a.day]??7)-(dayOrder[b.day]??7));
 return ensureKnownLiftLoads(out,c);
}

function ensureKnownLiftLoads(sessions,c){
 for(const session of sessions)for(const ex of session.ex||[]){
  const lift=String(ex[0]||'');if(!['Bench','Squat','Deadlift'].includes(lift)||Number(ex[3])>=5)continue;
  const max=Number(c.baselines?.[lift])||estimatedMax(Number(c.liftProfiles?.[lift]?.kg)||0,Number(c.liftProfiles?.[lift]?.reps)||1);
  if(max>=20){const role=ex[5]?.role;const pct=role==='top'?.78:role==='backoff'?.69:.66;ex[3]=roundLoad(max*pct);}
 }
 return sessions;
}

function carryForwardApprovedProgression(sessions,week){
 const phase=customPhase(week,Number(data.customRoadmap?.weeks)||20,data.customRoadmap);
 if(!allowsProgression(phase,cycleWeek(week,Number(data.customRoadmap?.weeks)||20).deload))return sessions;
 for(const session of sessions)for(const ex of session.ex||[]){
  if(ex[5]?.role!=='top'||!(+ex[3]>0))continue;
  const decisions=(data.decisions||[]).filter(d=>d.approved===true&&d.kind==='adaptive-progression'&&d.exercise===ex[0]&&Number(d.week)<week);
  // Cap total carry-forward uplift to 7.5%; later recommendations must be earned again.
  const factor=Math.min(1.075,decisions.reduce((f,d)=>f*(Number(d.factor)||1),1));
  if(factor>1){ex[3]=Math.round(ex[3]*factor/2.5)*2.5;
   const back=session.ex.find(e=>e[5]?.role==='backoff'&&e[0]===ex[0]);
   if(back){const profile=back[5].backoffProfile;back[3]=phaseBackoffLoad(ex[3],ex[2],ex[4],profile);}
  }
 }
 return sessions;
}

function applyApprovedHybridRunning(sessions,week){
 const approved=(data.decisions||[]).filter(d=>d.approved&&d.kind==='hybrid-load'&&Number(d.week)===Number(week));
 if(!approved.length)return sessions;
 const decision=approved.at(-1),kind=decision.intervention||'running-duration';
 const factor=Math.max(.75,Math.min(1,Number(decision.factor)||1));
 for(const session of sessions){
  if(kind==='lower-accessory'){
   for(const ex of session.ex||[]){
    const meta=ex[5]||{};
    if(meta.role==='top'||meta.role==='backoff'||/^(Squat|Deadlift|Competition squat|Competition deadlift)$/i.test(ex[0]))continue;
    if(/squat|deadlift|leg press|lunge|leg curl|leg extension|hip thrust|back extension|romanian|split squat/i.test(ex[0])&&Number(ex[1])>1){ex[1]=Math.max(1,Number(ex[1])-1);}
   }
   continue;
  }
  for(const run of session.runs||[]){
   if(run.role==='long-run'||run.sessionType==='long-run'||/long/i.test(run.name||''))continue;
   if(run.hybridAdjustmentKey===decision.key)continue; // repeat-safe even on same object
   const before=Number(run.minutes)||0;
   if(before>0){run.minutes=Math.max(15,Math.round(before*factor));run.hybridAdjustmentKey=decision.key;run.structure=(run.structure||'').replace(/ · Coach-approved adjusted duration.*$/,'')+' · Coach-approved adjusted duration '+run.minutes+' min';run.reason=(run.reason||'')+' Athlete-approved hybrid recovery adjustment.';}
  }
 }
 return sessions;
}

function isPrimaryExercise(name){return /^(squat|bench|bench press|deadlift)$/i.test(String(name||'').trim())}

function isTertiaryExercise(name){
 const n=String(name||'').toLowerCase();
 // Only unambiguously accessory/isolation exercises qualify for automatic volume trimming.
 return /leg curl|leg extension|calf raise|calf press|triceps pushdown|tricep extension|skull crusher|lateral raise|rear delt|face pull|biceps curl|hammer curl|cable fly|pec deck|lat pulldown|straight.arm pulldown|ab crunch|cable crunch|plank/.test(n);
}

function isDesignatedTopSet(x){return x.role==='top'||x.setRole==='top'||x.topSet===true}
function reviewSessions(){
 const grouped=new Map();
 for(const x of data.sets||[]){
  if(!isPrimaryExercise(x.exercise)||!(+x.weight>0)||!(+x.reps>0)||!(+x.rpe>=1))continue;
  const day=String(x.date||'').slice(0,10),key=x.exercise.toLowerCase()+'|'+day+'|'+(x.session||'');
  if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(x);
 }
 return [...grouped.values()].map(a=>{
  const designated=a.filter(isDesignatedTopSet);
  if(!designated.length)return null; // Never infer top sets from heaviest work sets.
  const top=designated[designated.length-1];
  const meanRpe=a.reduce((t,x)=>t+(+x.rpe),0)/a.length;
  return {exercise:top.exercise,date:top.date,weight:+top.weight,reps:+top.reps,rpe:+top.rpe,target:+top.target||7,meanRpe,estimated:(+top.weight)*(1+(+top.reps+Math.max(0,10-(+top.rpe)))/30),missed:a.some(x=>+x.rpe>=9.5),count:a.length};
 }).filter(Boolean).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
}

function reviewRecovery(){const recent=(data.checkins||[]).filter(x=>Date.now()-Date.parse(x.date)<10*86400000&&Date.now()>=Date.parse(x.date));const byDay=new Map();for(const c of recent)byDay.set(String(c.date).slice(0,10),c);const vals=[...byDay.values()];const low=vals.filter(c=>+c.sleep<=2||+c.energy<=2||+c.soreness>=4||+c.stress>=4);return {total:vals.length,low:low.length,lowDays:low.length,latest:vals.at(-1),symptoms:vals.some(c=>String(c.symptoms||'').trim())}}

function plannedNextWeek(){
 const c=data.customRoadmap;if(!c)return null; const week=Number(data.activeCustomWeek)||1;
 const max=Math.max(1,Number(c.weeks)||52);
 if(week>=max)return {week,finished:true,summary:'You are at the final planned week. Review event readiness and the next training goal rather than automatically adding load.'};
 const next=generatedSessions(c,week+1),current=schedule;
 const primary=(c.priority||'Squat').toLowerCase();
 const liftNames=(sessions)=>sessions.flatMap(x=>x.ex||[]).filter(e=>String(e[0]).toLowerCase().includes(primary));
 const old=liftNames(current),up=liftNames(next);
 const describe=a=>a.length?a.slice(0,2).map(e=>`${e[0]} ${e[1]}×${e[2]}${+e[3]>0?' @ '+e[3]+' kg':''} (RPE ${e[4]})`).join(' · '):'See next week’s sessions';
 return {week:week+1,finished:false,phase:next[0]?.phase||'',current:describe(old),next:describe(up),sessions:next.length};
}

function reviewNextStep(p){
 const next=plannedNextWeek();if(!next)return null;
 if(next.finished)return next.summary;
 const action=p.status==='recovery-review'?'Do not progress provoking sessions until symptoms are reviewed.':p.status==='monitor'?'Continue the plan while monitoring the flagged workload and recovery.':p.status==='fatigue'?'Keep the upcoming week provisional until you review the suggested fatigue adjustment.':p.status==='progress'?'The planned week remains the baseline; the additional progression above is optional and requires approval.':p.status==='observe'?'Follow the planned progression unless warm-ups or new performance evidence suggest otherwise.':'Review the next planned week.';
 return `Next: week ${next.week}${next.phase?' ('+next.phase+')':''}. ${action} Priority movement now: ${next.current}. Next week: ${next.next}. Preview and activate week ${next.week} in Plan when ready; this review does not change your schedule automatically.`;
}

function reviewDecision(){
 if(!data.activeSchedule?.length)return {status:'no-plan',summary:'Activate a custom programme to enable programme-specific adjustments.'};
 const shared=hybridWorkloadRecommendation();
 const followup=hybridInterventionFollowup(Number(data.activeCustomWeek)||1);
 if(shared.level==='review')return {status:'recovery-review',title:'Recovery and symptom check',summary:'The coach needs more information before proposing further training stress: '+shared.reasons.join('; ')+'.',why:'Check where discomfort occurs, severity and whether it is worsening. Avoid progressing provoking sessions until assessed. Seek appropriate professional advice for persistent, severe or worsening symptoms.'};
 if(followup?.unresolved&&shared.level!=='review')return {status:'recovery-review',title:'Review the previous adjustment',summary:'A training reduction was approved in week '+followup.prior.week+' but recovery concerns remain. Review the response before making another reduction.',why:'Check whether the adjustment was actually followed, whether fatigue or symptoms improved, and whether rest or a different session arrangement is more appropriate. No further automatic cut is proposed.'};
 if(shared.level==='monitor')return {status:'monitor',title:'Monitor — no change proposed',summary:'Training load deserves attention: '+shared.reasons.join('; ')+'.',why:'No automatic reduction is justified by this signal alone. Monitor upcoming sessions and recovery; reassess if performance or symptoms deteriorate.'};
 const currentWeek=Number(data.activeCustomWeek)||1;
 const sharedKey='hybrid-load|'+currentWeek+'|'+(data.runs||[]).length+'|'+(data.sets||[]).length;
 const already=(data.decisions||[]).some(d=>d.kind==='hybrid-load'&&d.approved&&Number(d.week)===currentWeek);
 if(shared.level==='adjust'&&!already&&!cycleWeek(currentWeek,Number(data.customRoadmap?.weeks)||20).deload&&customPhase(currentWeek,Number(data.customRoadmap?.weeks)||20,data.customRoadmap)!=='Taper / event'&&!((data.decisions||[]).some(d=>d.key===sharedKey))){
  return {status:'fatigue',key:sharedKey,title:'Hybrid workload — adjustment for approval',
   summary:'The coach detected competing running and lower-body demands: '+shared.reasons.join('; ')+'.',
   why:shared.intervention==='lower-accessory'?'Proposal: remove one set from eligible lower-body accessory exercises, preserving squat and deadlift main work and all runs.':'Proposal: reduce the upcoming week’s non-long-run running duration by '+Math.round((1-shared.factor)*100)+'%, while protecting the long run and main lifts.',
   hybridFactor:shared.factor,hybridIntervention:shared.intervention,changes:[{type:shared.intervention,factor:shared.factor}]};
 }
 const recovery=reviewRecovery(),sessions=reviewSessions(),groups={};
 for(const x of sessions)(groups[x.exercise]??=[]).push(x);
 const phase=customPhase(Number(data.activeCustomWeek)||1,Number(data.customRoadmap?.weeks)||20,data.customRoadmap);
 const deload=cycleWeek(Number(data.activeCustomWeek)||1,Number(data.customRoadmap?.weeks)||20).deload;
 const locked=!allowsProgression(phase,deload);
 const recentFeedback=(data.sessionFeedback||[]).filter(x=>{const age=Date.now()-Date.parse(x.date);return age>=0&&age<14*86400000});
 const hardFeedback=recentFeedback.filter(x=>x.difficulty==='harder'&&x.energy==='low');
 const discomfortFeedback=recentFeedback.some(x=>x.discomfort==='yes');
 const lowRecovery=recovery.lowDays>=2||recovery.symptoms||hardFeedback.length>=2||discomfortFeedback;

 const reviewKey=[data.activeCustomWeek||1,sessions.at(-1)?.date||'',recovery.latest?.date||''].join('|');
 const fatigueHistory=(data.decisions||[]).filter(d=>d.approved===true&&d.kind==='fatigue-intervention');
 const latestFatigue=fatigueHistory.at(-1);
 const weeksSinceFatigue=latestFatigue?Number(data.activeCustomWeek||1)-Number(latestFatigue.week||0):Infinity;
 // Do not repeatedly cut volume when an intervention has not improved the signal.
 // Reassess the athlete instead of stacking further accessory reductions.
 const priorFatigueIntervention=!!latestFatigue&&(weeksSinceFatigue<3||lowRecovery);


 const concerns=[],improvements=[];
 for(const [name,all] of Object.entries(groups)){
  // Compare the most recent two *distinct* exposures of the same lift, not individual sets.
  const last=all.slice(-4);if(last.length<3)continue;
  const distinctWeeks=new Set(last.map(x=>Math.floor(Date.parse(x.date)/(7*86400000))));
  const multiweek=distinctWeeks.size>=2;
  const controlled=last.every(x=>x.rpe<=x.target-.75&&!x.missed&&x.count>=1);
  const comparable=last.every(x=>x.reps>=1&&x.reps<=6)&&Math.max(...last.map(x=>x.reps))-Math.min(...last.map(x=>x.reps))<=2;
  const trend=(last.at(-1).estimated/last[0].estimated-1)*100;
  if(multiweek&&last.slice(-3).every(x=>x.rpe>=x.target+1))concerns.push({name,days:3,trend});
  if(multiweek&&controlled&&comparable&&trend>=-.5&&last.every(x=>Math.abs(x.rpe-x.target)<=2))improvements.push({name,days:last.length,trend});
 }
 if(concerns.length&&lowRecovery&&!locked&&!priorFatigueIntervention){
  const concern=concerns[0],target=/bench/i.test(concern.name)?'upper':'lower';const candidates=[];
  for(const session of schedule)for(const ex of session.ex||[]){if(!isTertiaryExercise(ex[0])||ex[1]<=1)continue;
   const lower=/leg curl|leg extension|calf|hamstring|quad/i.test(ex[0]);
   if((target==='lower')===lower)candidates.push({id:session.id,exercise:ex[0]});}
  if(candidates.length)return {status:'fatigue',key:'fatigue|'+reviewKey,title:'Recovery-led adjustment',summary:`Repeated ${concern.name} exposures exceeded their RPE targets, alongside recovery or post-session fatigue concerns.`,changes:candidates.slice(0,2).map(x=>({...x,setDelta:-1})),why:'Offer a small accessory-volume reduction while retaining the primary lift prescription. This does not prove fatigue is the cause.'};
 }
 if(!locked&&!lowRecovery&&improvements.length){
  const priority=String(data.customRoadmap?.priority||'Squat').toLowerCase();
  improvements.sort((a,b)=>Number(b.name.toLowerCase()===priority)-Number(a.name.toLowerCase()===priority));
  for(const x of improvements){
   // Apply only to a primary top set in the *currently activated* week. Never change back-offs independently.
   const target=schedule.find(y=>y.ex?.some(e=>e[0].toLowerCase()===x.name.toLowerCase()&&e[5]?.role==='top'));
   const ex=target?.ex?.find(e=>e[0].toLowerCase()===x.name.toLowerCase()&&e[5]?.role==='top');
   if(!ex||!(+ex[3]>0))continue;
   const prior=(data.decisions||[]).some(d=>d.key===`adaptive|${data.activeCustomWeek}|${x.name.toLowerCase()}`);
   if(prior)continue;
   if((data.decisions||[]).some(d=>d.approved&&d.kind==='adaptive-progression'&&d.exercise===ex[0]&&Number(d.week)>=Number(data.activeCustomWeek)-2))continue;
   const alreadyCompleted=(data.completedWorkouts||[]).some(y=>y.id===target.id&&+y.week===+(data.activeCustomWeek||1));
   if(alreadyCompleted)continue;
   return {status:'progress',key:`adaptive|${data.activeCustomWeek}|${x.name.toLowerCase()}`,title:'Sustained strong performance — optional progression',summary:`Your recent ${x.name} top sets across multiple weeks were at least 0.75 RPE below target. The coach proposes a modest increase for the active week.`,changes:[{id:target.id,exercise:ex[0],loadFactor:1.025}],why:'Increase only the upcoming top-set suggestion by approximately 2.5%, subject to warm-ups. Back-offs still recalculate from the actual top set and its logged RPE. No deload or taper changes; approval required.'};
  }
 }
 const recent=(data.sets||[]).filter(x=>+x.reps>0&&+x.rpe>=1&&+x.target>=1).slice(-40);
 const matched=recent.filter(x=>+x.rpe<=+x.target+.5).length;
 const onTrack=recent.length>=3&&matched/recent.length>=.75&&!concerns.length;
 return {status:onTrack?'on-track':'observe',title:locked?'Maintain the planned recovery / taper week':onTrack?'On track — continue planned progression':'Building the evidence',summary:locked?'Deload and taper weeks are protected from automatic acceleration.':lowRecovery?'Recovery or post-session feedback raises concerns. Keep the planned load and reassess before accelerating.':onTrack?`Effort was within target on ${matched} of the last ${recent.length} logged sets. Continue the planned progression.`:'Consistent, comparable top-set exposures across multiple weeks are needed before suggesting faster progression.',details:`${sessions.length} main-lift exposures logged. Suggestions remain lift-specific and require approval.`};
}

function latestCheckin(){return (data.checkins||[]).slice(-1)[0]}

function coachCandidate(){if(data.activeSchedule?.length)return null;
 const now=Date.now(),c=latestCheckin(),all=data.sets||[],runs=data.runs||[];
 const recentCheckins=(data.checkins||[]).filter(x=>now-new Date(x.date).getTime()<7*86400000&&now>=new Date(x.date).getTime());
 // Use the latest check-in as the current signal. Require concerns on at least
 // two different days before using check-in history to reduce a session.
 const latest=c&&now-new Date(c.date).getTime()<72*3600000?c:null;
 const lowSignal=x=>+x.energy<=2||+x.sleep<=2||+x.soreness>=4||+x.stress>=4;
 const low=recentCheckins.filter(lowSignal);
 const lowDays=new Set(low.map(x=>new Date(x.date).toDateString()));
 const latestGood=latest&&+latest.energy>=4&&+latest.sleep>=4&&+latest.soreness<=2&&+latest.stress<=2&&!String(latest.symptoms||'').trim();
 const symptoms=c&&(c.symptoms||'').trim()&&now-new Date(c.date).getTime()<72*3600000;
 const latestHard=runs.slice().reverse().find(x=>now-new Date(x.date).getTime()<48*3600000&&now>=new Date(x.date).getTime()&&(Number(x.rpe)>=8||/interval|threshold|tempo/i.test(x.type||'')));
 const bench=all.filter(x=>/bench press/i.test(x.exercise)&&Number.isFinite(+x.rpe)&&Number.isFinite(+x.target));
 const lastBench=bench.slice(-12);
 const high=lastBench.filter(x=>+x.rpe>=+x.target+1);
 const easy=lastBench.filter(x=>+x.rpe<=+x.target-0.5);
 // Single tough sessions are allowed. Serious symptom flags are an exception.
 if(symptoms)return {key:'symptoms-'+c.date,kind:'strength',session:'thu',exercise:'Squat',setDelta:-1,loadFactor:1,title:'Review symptoms before pushing',reason:'You reported pain, illness or unusual symptoms. These warrant caution even without a longer pattern.',details:'Consider resting or modifying training; do not push through concerning symptoms.',priority:100};
 if(!latestGood&&latest&&lowSignal(latest)&&lowDays.size>=2&&low.length>=Math.ceil(recentCheckins.length/2))return {key:'trend-'+recentCheckins.at(-1).date,kind:'strength',session:'thu',exercise:'Squat',setDelta:-1,loadFactor:1,title:'Manage accumulating fatigue',reason:`${low.length} of your last ${recentCheckins.length} check-ins within 7 days showed recovery concerns.`,details:'Reduce squat volume by one set; maintain movement quality.',priority:90};
 if(high.length>=3&&high.length>=Math.ceil(lastBench.length/2))return {key:'benchovershoot-'+lastBench.at(-1).date,kind:'strength',session:'fri',exercise:'Bench press',setDelta:0,loadFactor:.975,title:'Dial back repeated overshooting',reason:`${high.length} of your last ${lastBench.length} bench sets exceeded target RPE by at least one point.`,details:'Reduce Friday bench load around 2.5% and rebuild consistent reps.',priority:80};
 if(latestHard&&latest&&lowSignal(latest)&&!latestGood)return {key:'interference-'+latestHard.date,kind:'strength',session:'thu',exercise:'Deadlift',setDelta:-1,loadFactor:1,title:'Protect lower-body quality',reason:'A demanding run within 48 hours overlaps with recent low recovery.',details:'Remove one deadlift set without removing the lift.',priority:70};
 // Progression: require enough data across distinct completed days.
 const days=[...new Set(easy.map(x=>new Date(x.date).toDateString()))];
 if(easy.length>=4&&days.length>=2&&easy.length>=Math.ceil(lastBench.length*.7)&&!low.length){
   return {key:'benchprogress-'+lastBench.at(-1).date,kind:'strength',session:'fri',exercise:'Bench press',setDelta:0,loadFactor:1.025,title:'Earned bench progression',reason:`${easy.length} of your last ${lastBench.length} bench sets were comfortably below target RPE, across ${days.length} training days.`,details:'Increase the next Friday bench working load by about 2.5%, subject to warm-up feel.',priority:60};
 }
 // Pace progression only when matching easy/steady activity effort and multiple comparable runs exist.
 const easyRuns=runs.filter(x=>+x.km>0&&+x.min>0&&+x.rpe<=4&&/easy|long/i.test(x.type||'')).slice(-3);
 if(easyRuns.length>=3&&easyRuns.every(x=>now-new Date(x.date).getTime()<21*86400000)){
  const first=easyRuns[0].min/easyRuns[0].km,last=easyRuns.at(-1).min/easyRuns.at(-1).km;
  if(first-last>=.15)return {key:'runprogress-'+easyRuns.at(-1).date,kind:'running',title:'Consider a faster easy-run target',reason:'Three recent comparable easy runs show improved average pace without high reported effort.',details:'Propose a modest 5 sec/km faster easy pace. Keep RPE conversational.',paceDelta:-5,priority:50};
 }
 return null;
}
 function describeWeek(c,week){const sessions=generatedSessions(c,week);return {week,sessions,phase:sessions.find(s=>s.phase&&s.phase!=='Competition')?.phase||sessions[0]?.phase||customPhase(week,c.weeks,c),deload:cycleWeek(week,c.weeks).deload}}
 return {candidateWeek,describeWeek,isDesignatedTopSet,generatedSessions,selectTrainingFramework,customPhase,customPlan,runningPaces,cycleWeek,variationBlock,variationChoice,estimatedMax,exerciseEstimatedMax,roundLoad,backoffProfile,phaseBackoffLoad,loadFromTopSet,accessorySelection,accessoryPrefs,hybridRunWeek,hybridRecoverySignals,reviewRecovery,paceText,distanceLabel,ensureKnownLiftLoads,effectiveSession,reviewDecision,hybridWorkloadRecommendation,hybridAthleteBaseline,hybridInterventionFollowup,reviewSessions,isPrimaryExercise,isTertiaryExercise,plannedNextWeek,reviewNextStep,coachCandidate,latestCheckin,accessoryNames,carryForwardApprovedProgression,applyApprovedHybridRunning,pbSeconds};
}
const api={schema:'lhrf-shared-coach-v1',createEngine,allowsProgression};
if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFCoach=api;
})(typeof globalThis!=='undefined'?globalThis:this);
