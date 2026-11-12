/* Experimental, conservative review signal. This module never changes training.
   A caller must explicitly supply trial parameters; none are clinical thresholds. */
(function(root){'use strict';
 const day=s=>{if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(s)||!Number.isFinite(Date.parse(s)))return null;const d=s.slice(0,10);return new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d?d:null;};
 const clean=x=>JSON.parse(JSON.stringify(x));
 const safe=e=>e&&e.painOrDiscomfort==='no'&&e.illness==='no'&&!['pain','illness'].includes(e.interruptionReason);
 const risky=e=>e&&(e.painOrDiscomfort==='yes'||e.illness==='yes'||['pain','illness'].includes(e.interruptionReason));
 const validRpe=n=>typeof n==='number'&&Number.isFinite(n)&&n>=1&&n<=10;
 function assess({state,discipline,now,policy}={}){
  const no=(reason,status='insufficient')=>({status,reason,candidate:null});
  const today=day(now), todayMs=today&&Date.parse(today+'T00:00:00Z');
  if(!state||!today||!['strength','running'].includes(discipline))return no('invalid input');
  if(!policy||!Number.isFinite(policy.minDeclineFraction)||policy.minDeclineFraction<=0||policy.minDeclineFraction>=1||!Number.isInteger(policy.recentDays)||policy.recentDays<1||policy.recentDays>30)return no('experimental policy parameters required');
  const feedback=Array.isArray(state.fatigueEvidence)?state.fatigueEvidence:[];
  const recent=e=>{const d=day(e?.recordedAt);if(!d)return false;const delta=(todayMs-Date.parse(d+'T00:00:00Z'))/86400000;return delta>=0&&delta<policy.recentDays;};
  if(feedback.some(e=>e?.discipline===discipline&&recent(e)&&risky(e)))return no('pain or illness requires separate review','safety');
  // Native feedback predates this prototype and may contradict the new evidence.
  // Unknown discipline must not hide an affirmative pain or illness report.
  const prior=Array.isArray(state.sessionFeedback)?state.sessionFeedback:[];
  if(prior.some(e=>recent({recordedAt:e?.date})&&(e?.discomfort==='yes'||e?.pain===true||e?.illness===true||['pain','illness'].includes(e?.interruptionReason))))return no('pain or illness requires separate review','safety');
  const workouts=Array.isArray(state.completedWorkouts)?state.completedWorkouts:[];
  const observations=[];
  for(const w of workouts){
   const d=day(w?.date);if(!d||d>today||typeof w.id!=='string'||!w.prescription)continue;
   // More than one record for a session/date is ambiguous: never choose one.
   if(workouts.filter(v=>v?.id===w.id&&day(v.date)===d).length!==1)continue;
   const reports=feedback.filter(e=>e?.sessionId===w.id&&e?.discipline===discipline&&day(e.recordedAt)===d);
   if(reports.length!==1)continue;
   const report=reports[0];if(!safe(report))continue;
   if(discipline==='strength'){
    if(!Number.isInteger(w.plannedSets)||w.plannedSets<=0||w.completedSets!==w.plannedSets||w.component==='run')continue;
    const ex=w.prescription.ex;if(!Array.isArray(ex)||!ex.length||ex.some(x=>!Array.isArray(x)||!Number.isInteger(x[1])||x[1]<1)||ex.reduce((n,x)=>n+x[1],0)!==w.plannedSets)continue;
    const ids=ex.map(x=>x[5]?.exerciseId);if(ids.some(x=>typeof x!=='string'||!x)||new Set(ids).size!==ids.length)continue;
    const allRows=(Array.isArray(state.sets)?state.sets:[]).filter(s=>s?.sessionId===w.id&&day(s.date)===d);
    if(allRows.length!==w.plannedSets||ex.some(x=>{const own=allRows.filter(s=>s.exerciseId===x[5].exerciseId);return own.length!==x[1]||new Set(own.map(s=>s.set)).size!==x[1]||own.some(s=>!Number.isInteger(s.set)||s.set<1||s.set>x[1]);}))continue;
    const target=ex.find(x=>Array.isArray(x)&&x[5]?.category==='primary'&&typeof x[5]?.exerciseId==='string');
    if(!target||!Number.isInteger(target[1])||target[1]<1||!Number.isInteger(target[2])||target[2]<1||!Number.isFinite(target[3])||!validRpe(target[4]))continue;
    const rows=(Array.isArray(state.sets)?state.sets:[]).filter(s=>s?.sessionId===w.id&&day(s.date)===d&&s.exerciseId===target[5].exerciseId);
    if(rows.length!==target[1]||new Set(rows.map(r=>r.set)).size!==target[1]||rows.some(r=>r.reps!==target[2]||!Number.isFinite(r.weight)||r.weight<=0||!validRpe(r.rpe)))continue;
    const weights=rows.map(r=>r.weight),rpes=rows.map(r=>r.rpe);
    if(new Set(weights).size!==1||new Set(rpes).size!==1)continue;
    const protocol=JSON.stringify(['strength',target[5].exerciseId,target[1],target[2],target[3],target[4],rpes[0]]);
    observations.push({date:d,sessionId:w.id,protocol,value:weights[0],report});
   }else{
    if(w.component==='strength'||w.completedRun!==true||report.comparableConditions!=='yes'||report.reliableMeasurement!=='yes'||!validRpe(report.runEffort))continue;
    const prescribed=w.prescription.runs;if(!Array.isArray(prescribed)||prescribed.length!==1)continue;
    const p=prescribed[0];if(!p||!Array.isArray(p.steps)||p.steps.length!==1||p.steps.some(s=>s?.role==='race'))continue;
    const logs=(Array.isArray(state.runs)?state.runs:[]).filter(r=>r?.sessionId===w.id&&day(r.date)===d);
    if(logs.length!==1)continue;const run=logs[0];
    if(!Number.isFinite(run.km)||run.km<=0||!Number.isFinite(run.min)||run.min<=0)continue;
    // A shortened outing is neutral: require a specified distance/duration to have been fully completed.
    const distance=Number(p.distanceKm)||0, minutes=Number(p.minutes)||0;
    if(distance<=0&&minutes<=0||distance>0&&run.km!==distance||minutes>0&&run.min!==minutes)continue;
    const protocol=JSON.stringify(['running',p.role,distance,minutes,p.rpe,p.steps,report.runEffort]);
    observations.push({date:d,sessionId:w.id,protocol,value:run.km/run.min,report});
   }
  }
  observations.sort((a,b)=>a.date.localeCompare(b.date));
  const groups=new Map();for(const o of observations){const g=groups.get(o.protocol)||[];g.push(o);groups.set(o.protocol,g);}
  for(const entries of groups.values()){
   if(entries.length<5||new Set(entries.map(x=>x.date)).size!==entries.length)continue;
   const sample=entries.slice(-5),base=sample.slice(0,3),later=sample.slice(3);
   if(!later.every(o=>recent(o.report))||!later.some(o=>o.report.unusualFatigue==='yes'||o.report.interruptionReason==='fatigue'))continue;
   const median=base.map(x=>x.value).sort((a,b)=>a-b)[1],limit=median*(1-policy.minDeclineFraction);
   if(later.every(x=>x.value<=limit))return {status:'review',reason:'repeated comparable regression with reported fatigue',candidate:{discipline,baseline:base.map(x=>({date:x.date,sessionId:x.sessionId,value:x.value})),regression:later.map(x=>({date:x.date,sessionId:x.sessionId,value:x.value})),experimentalPolicy:clean(policy)}};
  }
  return no('no supported repeated comparable regression');
 }
 const api={assess};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFFatigueAssessment=api;
})(typeof globalThis!=='undefined'?globalThis:this);
