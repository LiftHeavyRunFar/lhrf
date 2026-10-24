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
  if(conflict){
   if(runFirst){
    // Protect running priority: trim lower-body backoffs, not the primary run.
    for(const s of lower){
     if(s.backoff&&s.backoff.sets>1){
      const previous=s.backoff.sets;
      s.backoff.sets=Math.max(1,previous-1);
      s.backoff.stress=Math.round(s.backoff.sets*s.backoff.reps*s.backoff.rpe)/10;
      s.totalStress=(s.top?.stress||0)+s.backoff.stress;
      s.totalReps=(s.top?.sets||0)*(s.top?.reps||0)+s.backoff.sets*s.backoff.reps;
      changes.push({kind:'trim-lower-backoffs',lift:s.lift,from:previous,to:s.backoff.sets,reason:'Protect quality running and long-run recovery.'});
     }
    }
   }else{
    // Protect strength priority; trim secondary run duration, preserve long run.
    for(const r of quality){
     const before=r.minutes;
     r.minutes=Math.max(15,round5(before*.8));
     if(r.minutes<before)changes.push({kind:'trim-quality-run',from:before,to:r.minutes,reason:'Protect heavy lower-body lifting and recovery.'});
    }
   }
  }
  const strengthStress=Math.round(strengths.reduce((sum,s)=>sum+s.totalStress,0)*10)/10;
  const runningMinutes=runs.reduce((sum,r)=>sum+r.minutes,0);
  return {...week,strengths,runs,strengthStress,runningMinutes,
   hybrid:{conflict,priority:runFirst?'running':strengthFirst?'strength':'balanced',changes,
    approvalRequired:changes.length>0,
    limitations:['Session-day spacing and individual fatigue data are not available in this prototype.',
     'Load changes are proposals for athlete approval, not automatic edits to the live plan.']}};
 }
 const api={coordinateWeek};
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.LHRFHybridV2=api;
})(typeof globalThis!=='undefined'?globalThis:this);
