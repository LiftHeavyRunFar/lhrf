/* LHRF v2 hybrid coordination — pure functions, preview-only. */
(function(root){
 'use strict';
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 const round5=n=>Math.round(n/5)*5;
 function coordinateWeek(config,week){
  const c=config||{},priority=String(c.priority||'Balanced').toLowerCase();
  const strengthFirst=['bench','squat','deadlift','strength'].includes(priority);
  const runFirst=priority==='running';
  const strengths=(week.strengths||[]).map(s=>({...s,top:s.top?{...s.top}:null,backoff:s.backoff?{...s.backoff}:null}));
  const runs=(week.runs||[]).map(r=>({...r}));
  const changes=[];
  const lower=strengths.filter(s=>s.lift==='squat'||s.lift==='deadlift');
  const quality=runs.filter(r=>r.type==='quality');
  const long=runs.filter(r=>r.type==='long');
  const highLower=lower.filter(s=>s.top&&s.top.rpe>=8);
  const conflict=highLower.length>0&&(quality.length>0||long.length>0);
  // Fatigue coordination must never silently rewrite either training template.
  // Return proposed adjustments separately; the athlete decides what to apply.
  if(conflict){
   if(runFirst){
    for(const session of lower){
     if(session.backoff?.sets>1){
      changes.push({kind:'trim-lower-backoffs',lift:session.lift,exposure:session.exposure,
       from:session.backoff.sets,to:session.backoff.sets-1,
       reason:'Optional: reduce lower-body backoffs to protect key runs. Athlete approval required.'});
     }
    }
   }else{
    for(const run of quality){
     const suggested=Math.max(15,round5(run.minutes*.8));
     if(suggested<run.minutes)changes.push({kind:'trim-quality-run',from:run.minutes,to:suggested,
      reason:'Optional: shorten quality running to protect strength recovery. Athlete approval required.'});
    }
   }
  }
  const strengthStress=Math.round(strengths.reduce((sum,s)=>sum+s.totalStress,0)*10)/10;
  const runningMinutes=runs.reduce((sum,r)=>sum+r.minutes,0);
  return {...week,strengths,runs,strengthStress,runningMinutes,
   hybrid:{conflict,priority:runFirst?'running':strengthFirst?'strength':'balanced',changes,
    approvalRequired:changes.length>0,
    limitations:['Session-day spacing and individual fatigue data are not available in this prototype.',
     'Conflict adjustments are proposals only; no running or lifting prescription is changed without athlete approval.']}};
 }
 const api={coordinateWeek};
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.LHRFHybridV2=api;
})(typeof globalThis!=='undefined'?globalThis:this);
