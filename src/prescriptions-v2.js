/* LHRF v2: isolated prescription prototype. No persistence or live-app wiring. */
(function(root){
 'use strict';
 const round=(n,step=2.5)=>Math.round(n/step)*step;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const strengthLifts=['squat','bench','deadlift'];
 const stress=(sets,reps,rpe)=>Math.round(sets*reps*(rpe/10)*10)/10;
 function strengthPrescription(lift,week,phase,baseline,priority){
  const main=priority?.toLowerCase()===lift;
  const scale=main?1:.85;
  const templates={
   foundation:{top:null,back:{sets:4,reps:6,rpe:7,pct:.66}},
   development:{top:{sets:1,reps:5,rpe:8,pct:.77},back:{sets:3,reps:5,rpe:7,pct:.70}},
   intensification:{top:{sets:1,reps:3,rpe:8,pct:.84},back:{sets:3,reps:3,rpe:7,pct:.76}},
   recovery:{top:null,back:{sets:2,reps:5,rpe:6,pct:.62}},
   realisation:{top:{sets:1,reps:2,rpe:7,pct:.81},back:{sets:2,reps:2,rpe:6,pct:.70}},
   assessment:{top:{sets:1,reps:3,rpe:8,pct:.86},back:{sets:1,reps:3,rpe:6,pct:.70}},
   event:{top:null,back:{sets:0,reps:0,rpe:0,pct:0}}
  };
  const t=templates[phase]||templates.development;
  const progress=phase==='foundation'||phase==='development'||phase==='intensification'?Math.min(0.025,((week-1)%4)*.008):0;
  function item(x,role){
   if(!x)return null;
   const pct=clamp((x.pct+progress)*scale,.4,.94);
   return {role,sets:x.sets,reps:x.reps,rpe:x.rpe,percent1RM:Math.round(pct*1000)/10,
    suggestedWeight:Number(baseline)>0?round(Number(baseline)*pct):null,
    stress:stress(x.sets,x.reps,x.rpe)};
  }
  let top=item(t.top,'top'),back=item(t.back,'backoff');
  // Do not add a heavy top set to the old foundation volume unchanged.
  // Use a conservative stress budget; trim backoffs before touching the top set.
  const cap=stress(4,6,7)*1.1;
  while(back&&back.sets>1&&((top?.stress||0)+back.stress)>cap){
   back={...back,sets:back.sets-1,stress:stress(back.sets-1,back.reps,back.rpe)};
  }
  return {lift,phase,top,backoff:back,totalReps:(top?.sets||0)*(top?.reps||0)+(back?.sets||0)*(back?.reps||0),
   totalStress:(top?.stress||0)+(back?.stress||0),stressBudget:cap,
   assessmentOptional:phase==='assessment'};
 }
 function runningPrescription(week,phase,runCount,priority){
  if(!runCount)return [];
  const runPriority=priority==='Running'||priority==='running';
  const easyBase=runPriority?35:25;
  const factor=phase==='recovery'?.65:phase==='realisation'?.7:phase==='assessment'||phase==='event'?.5:1;
  // Three progressive loading weeks followed by a reduced-load week.
  // Do not restart at the original baseline every fifth week: blocks build on each other.
  const loading=['foundation','development','intensification'].includes(phase);
  const block=Math.floor((week-1)/4),within=(week-1)%4;
  const progression=loading?(1+Math.min(.24,block*.04))*(1+within*.035):1;
  const easyMinutes=Math.round(easyBase*factor*progression);
  const sessions=Array.from({length:runCount},(_,i)=>({
   type:i===0&&runCount>=2?'quality':i===runCount-1&&runCount>=3?'long':'easy',
   minutes:i===runCount-1&&runCount>=3?Math.round(easyMinutes*1.5):easyMinutes,
   effort:i===0&&runCount>=2?'controlled quality / RPE 6–7':'conversational / RPE 3–4'
  }));
  if(['recovery','realisation','assessment','event'].includes(phase))
   sessions.forEach(s=>{s.type='easy';s.effort='conversational / RPE 3–4'});
  return sessions;
 }
 function prescribeWeek(config,phaseWeek){
  const phase=phaseWeek.phase,w=phaseWeek.week;
  const strengths=strengthLifts.flatMap(lift=>Array.from({length:Math.max(0,Math.min(4,Number(config[lift])||0))},(_,i)=>({
   exposure:i+1,...strengthPrescription(lift,w,phase,config.maxes?.[lift],config.priority)
  })));
  const runs=runningPrescription(w,phase,Math.max(0,Math.min(7,Number(config.runs)||0)),config.priority);
  const strengthStress=strengths.reduce((n,s)=>n+s.totalStress,0);
  const runningMinutes=runs.reduce((n,s)=>n+s.minutes,0);
  return {week:w,phase,strengths,runs,strengthStress,runningMinutes,
   notes:['Prototype: no day-level scheduling, individual running pace calibration or recovery feedback yet.',
    phase==='assessment'?'Assessment is optional and requires athlete approval.':null].filter(Boolean)};
 }
 const api={strengthPrescription,runningPrescription,prescribeWeek};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFPrescriptionsV2=api;
})(typeof globalThis!=='undefined'?globalThis:this);
