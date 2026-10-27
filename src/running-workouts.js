/* Purposeful running variants. Product prescriptions, informed by the sources in
 * docs/running-engine-review-2026-10-27.md; not copied training plans. Offline/pure. */
(function(root){
'use strict';
const catalogue=Object.freeze([
 {id:'threshold-repeats',name:'Controlled threshold repeats',purpose:'Accumulate controlled sustained work at estimated current threshold.'},
 {id:'race-pace-repeats',name:'Race-pace repeats',purpose:'Practise event rhythm supported by current performance.'},
 {id:'pyramid',name:'Pyramid intervals',purpose:'Progress through short, medium and longer efforts, then return; controlled changes of pace.'},
 {id:'inverted-pyramid',name:'Inverted pyramid intervals',purpose:'Start with longer work, shorten, then rebuild; controlled pacing under fatigue.'},
 {id:'ascending-ladder',name:'Ascending ladder intervals',purpose:'Extend repetition duration while settling towards event pace.'},
 {id:'descending-ladder',name:'Descending ladder intervals',purpose:'Shorten repetitions with controlled faster running towards the finish.'}
].map(item=>Object.freeze({...item,paceDomain:item.id==='threshold-repeats'?'threshold':item.id==='race-pace-repeats'?'event-pace':'mixed-5k-to-event',eligibleGoals:item.id==='threshold-repeats'||item.id==='race-pace-repeats'?['5k','10k','half','marathon']:['5k','10k'],source:item.id==='threshold-repeats'||item.id==='race-pace-repeats'?'https://www.mcmillanrunning.com/10k-training-plan-guide/':'https://mcmillan.helpscoutdocs.com/article/97-fun-workout-alternatives'})));
const isWork=s=>s?.role?s.role==='work':/Threshold interval/i.test(s?.label||'');
const paceText=s=>{const n=Math.round(s);return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')+'/km'};
const range=s=>paceText(s-5)+' to '+paceText(s+5);
function selectKind({week=1,goal='10k',weeksToRace=null}={}){
 // Familiar repeat session first. Variety stays within the week's training objective.
 const event=String(goal).toLowerCase(),i=Math.max(0,Math.floor(week)-1);
 if(['half','marathon'].includes(event))return i%3===2?'race-pace-repeats':'threshold-repeats';
 if(weeksToRace!=null&&weeksToRace>0&&weeksToRace<=2)return 'race-pace-repeats';
 return ['threshold-repeats','pyramid','race-pace-repeats','inverted-pyramid','ascending-ladder','descending-ladder'][i%6];
}
function buildQuality({baseRun,kind='threshold-repeats',thresholdSeconds,raceSeconds,shortSeconds,goalPaceSeconds}={}){
 const item=catalogue.find(x=>x.id===kind);if(!item)throw Error('Unknown running workout family: '+kind);
 if(!baseRun||!Array.isArray(baseRun.steps))throw Error('A complete base session is required.');
 for(const n of [thresholdSeconds,raceSeconds,shortSeconds])if(!Number.isFinite(n)||n<=10)throw Error('Valid current-fitness paces are required.');
 const copy=JSON.parse(JSON.stringify(baseRun)),work=copy.steps.filter(isWork);
 if(!work.length)throw Error('Base session has no work repetitions.');
 const first=copy.steps.findIndex(isWork),last=copy.steps.length-1-copy.steps.slice().reverse().findIndex(isWork);
 const middle=copy.steps.slice(first,last+1),recoveries=middle.filter(s=>!isWork(s));
 const workKm=work.reduce((n,s)=>n+s.distanceKm,0),recoveryKm=recoveries.reduce((n,s)=>n+s.distanceKm,0);
 if(copy.steps.some(s=>!Number.isFinite(s.distanceKm)||s.distanceKm<=0)||!Number.isFinite(workKm)||workKm<=0||!Number.isFinite(recoveryKm)||recoveryKm<0)throw Error('Invalid session distance.');
 // A short budget cannot fund five meaningful reps. Retain familiar repeats instead.
 const pattern=kind==='pyramid'?[1,1.5,2,1.5,1]:kind==='inverted-pyramid'?[2,1.5,1,1.5,2]:kind==='ascending-ladder'?[1,1.5,2,2.5]:kind==='descending-ladder'?[2.5,2,1.5,1]:work.map(()=>1);
 if(kind!=='threshold-repeats'&&(workKm*Math.min(...pattern)/pattern.reduce((a,b)=>a+b,0)<.1||(!recoveryKm&&pattern.length>work.length)))return {...buildQuality({baseRun,kind:'threshold-repeats',thresholdSeconds,raceSeconds,shortSeconds,goalPaceSeconds}),variantDeferred:'The session budget is too small for meaningful varied repetitions; retain familiar repeats.'};
 const recoveryTimes=[...String(recoveries[0]?.pace||'').matchAll(/(\d+):([0-5]\d)/g)].map(m=>+m[1]*60 + +m[2]);
 if(kind!=='threshold-repeats'&&recoveryTimes.length&&recoveryKm/(pattern.length-1)*Math.min(...recoveryTimes)<45)return {...buildQuality({baseRun,kind:'threshold-repeats',thresholdSeconds,raceSeconds,shortSeconds,goalPaceSeconds}),variantDeferred:'Recovery budget is insufficient for this variant; retain familiar repeats.'};
 const sum=pattern.reduce((a,b)=>a+b,0),min=Math.min(...pattern),max=Math.max(...pattern);
 const supportedGoal=Number.isFinite(goalPaceSeconds)&&goalPaceSeconds>=raceSeconds?goalPaceSeconds:raceSeconds;
 const steps=[];let usedWork=0,usedRecovery=0;
 for(let i=0;i<pattern.length;i++){
  const distanceKm=i===pattern.length-1?workKm-usedWork:workKm*pattern[i]/sum;usedWork+=distanceKm;
  const centre=kind==='threshold-repeats'?thresholdSeconds:kind==='race-pace-repeats'?supportedGoal:shortSeconds+(raceSeconds-shortSeconds)*(max===min?1:(pattern[i]-min)/(max-min));
  steps.push({label:(kind==='threshold-repeats'?'Threshold interval':item.name.replace(/ intervals| repeats/,'')+' interval')+' '+(i+1)+' of '+pattern.length,role:'work',distanceKm,pace:range(centre),paceSeconds:centre,intensity:kind==='threshold-repeats'?'threshold':kind==='race-pace-repeats'?'race-pace':'mixed-controlled'});
  if(i<pattern.length-1&&recoveryKm>0){const km=i===pattern.length-2?recoveryKm-usedRecovery:recoveryKm/(pattern.length-1);usedRecovery+=km;steps.push({label:'Easy recovery',role:'recovery',distanceKm:km,pace:recoveries[0]?.pace||'Easy jog or walk'});}
 }
 copy.steps=[...copy.steps.slice(0,first).map(s=>({...s,role:s.role||'easy'})),...steps,...copy.steps.slice(last+1).map(s=>({...s,role:s.role||'easy'}))];
 copy.name=item.name;copy.workoutFamily=kind;copy.libraryVersion=1;copy.purpose=item.purpose;
 copy.distanceKm=Number(copy.steps.reduce((n,s)=>n+s.distanceKm,0).toFixed(3));
 const bounds=s=>{const times=[...String(s.pace||'').matchAll(/(\d+):([0-5]\d)/g)].map(m=>+m[1]*60 + +m[2]);return times.length?{min:Math.min(...times),max:Math.max(...times)}:null};
 const workPaces=steps.filter(isWork).map(s=>s.paceSeconds);copy.pace=paceText(Math.min(...workPaces)-5)+' to '+paceText(Math.max(...workPaces)+5);
 const parsed=copy.steps.map(bounds);if(parsed.every(Boolean)){const minutes=key=>copy.steps.reduce((n,s,i)=>n+s.distanceKm*parsed[i][key]/60,0);copy.durationRangeMinutes={min:Math.round(minutes('min')),max:Math.round(minutes('max'))};copy.minutes=copy.durationRangeMinutes.max;}else{copy.minutes=null;copy.durationRangeMinutes=null;}
 copy.workMinutes=Math.round(steps.filter(isWork).reduce((n,s)=>n+s.distanceKm*s.paceSeconds/60,0));
 copy.structure=copy.steps.map(s=>Math.round(s.distanceKm*1000)+' m '+s.label.toLowerCase()).join(' + ');
 copy.reason=item.purpose+' Work and recovery distances stay within the approved session budget. Short repetitions are controlled, not sprints.';
 copy.paceBasis={method:'current-performance-equivalent',racePaceSeconds:raceSeconds,shortPaceSeconds:shortSeconds,goalPaceSeconds:goalPaceSeconds||null,goalSupported:Number.isFinite(goalPaceSeconds)?goalPaceSeconds>=raceSeconds:null};
 return copy;
}
const api={catalogue,isWork,buildQuality,selectKind};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFRunningWorkouts=api;
})(typeof globalThis!=='undefined'?globalThis:this);
