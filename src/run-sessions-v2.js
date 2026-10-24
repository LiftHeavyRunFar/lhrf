/* Convert a run prescription into an actionable, bounded workout preview. */
(function(root){
'use strict';
function deps(){return typeof module==='object'&&module.exports?require('./running-paces-v2.js'):root.LHRFRunningPacesV2}
function structureRuns(runs,config){
 const pace=deps(),annotated=pace.attachPaces(runs,config);
 return annotated.map(run=>{
  const minutes=Math.max(0,Math.round(Number(run.minutes)||0));
  if(run.type!=='quality'||minutes<24){
   return {...run,minutes,workout:{kind:run.type==='long'?'long-easy':'continuous-easy',
    blocks:[{kind:'easy',minutes}],totalMinutes:minutes},effort:run.type==='quality'?'conversational / RPE 3–4':run.effort};
  }
  const warmup=Math.min(12,Math.max(8,Math.floor(minutes*.25)));
  const cooldown=Math.min(10,Math.max(6,Math.floor(minutes*.2)));
  const available=minutes-warmup-cooldown;
  const repetitions=Math.max(3,Math.min(6,Math.floor(available/5)));
  const recoveries=repetitions-1;
  const workMinutes=3;
  const recoveryMinutes=2;
  const used=repetitions*workMinutes+recoveries*recoveryMinutes;
  if(used>available)return {...run,minutes,workout:{kind:'continuous-easy',
   blocks:[{kind:'easy',minutes}],totalMinutes:minutes},effort:'conversational / RPE 3–4'};
  const extra=available-used;
  const blocks=[{kind:'warmup',minutes:warmup+extra,effort:'RPE 3–4'}];
  for(let i=0;i<repetitions;i++){
   blocks.push({kind:'work',minutes:workMinutes,effort:'RPE 6–7',pace:run.pace});
   if(i<recoveries)blocks.push({kind:'recovery',minutes:recoveryMinutes,effort:'RPE 2–3'});
  }
  blocks.push({kind:'cooldown',minutes:cooldown,effort:'RPE 3–4'});
  return {...run,minutes,workout:{kind:'controlled-intervals',repetitions,workMinutes,recoveryMinutes,
   blocks,totalMinutes:blocks.reduce((sum,b)=>sum+b.minutes,0)}};
 });
}
const api={structureRuns};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFRunSessionsV2=api;
})(typeof globalThis!=='undefined'?globalThis:this);
