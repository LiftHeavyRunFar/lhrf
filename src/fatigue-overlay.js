/* Isolated prototype: a read-time overlay, never a programme rewrite. */
(function(root){'use strict';
 const training=typeof module==='object'&&module.exports?require('./catalogue-training.js'):root.LHRFCatalogueTraining;
 const protection=typeof module==='object'&&module.exports?require('./catalogue-protection.js'):root.LHRFCatalogueProtection;
 const assessment=typeof module==='object'&&module.exports?require('./fatigue-assessment.js'):root.LHRFFatigueAssessment;
 const copy=x=>JSON.parse(JSON.stringify(x));
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const day=x=>{training.parseDate(x);return x};
 function bound(state,native,proposal){
  const plans=native?.customRoadmap?.cataloguePlans, weeks=native?.reviewedProgramme?.weeks;
  if(!Array.isArray(state?.plans)||!Array.isArray(plans)||!Array.isArray(weeks)||!same(state.plans,plans))return false;
  const observations=[...(proposal?.baseline||[]),...(proposal?.regression||[])];
  if(observations.length!==5||new Set(observations.map(o=>o.sessionId)).size!==5)return false;
  const sessions=weeks.flatMap(w=>Array.isArray(w.sessions)?w.sessions:[]);
  return observations.every(observation=>sessions.some(session=>{
   if(!session?.catalogueOccurrenceId||!(observation.sessionId===session.id||observation.sessionId===session.id+'::strength'||observation.sessionId===session.id+'::run'))return false;
   const matches=plans.filter(p=>(p.snapshot?.weeks||[]).some(w=>(w.sessions||[]).some(s=>p.id+'-w'+w.week+'-'+s.id===session.catalogueOccurrenceId)));
   const logs=(native.completedWorkouts||[]).filter(w=>w.id===observation.sessionId&&String(w.date).slice(0,10)===observation.date);
   return matches.length===1&&matches[0].snapshot.discipline===proposal.discipline&&session.scheduledDate===observation.date&&logs.length===1&&
    same(logs[0].prescription,{ex:session.ex||[],runs:session.runs||[]});
  }));
 }
 function eligible(state,item,discipline,eventContext,native,draftContext){
  if(item.status!=='planned'||state.logs?.[item.id]||state.drafts?.[item.id])return false;
  if(item.session.kind!==(discipline==='strength'?'strength':'run'))return false;
  const key=item.planId+'-w'+item.week+'-'+item.sessionId;
  const nativeMatches=(native?.reviewedProgramme?.weeks||[]).flatMap(w=>w.sessions||[]).filter(s=>s.catalogueOccurrenceId===key);
  if(nativeMatches.length!==1||nativeMatches[0].scheduledDate!==item.date)return false;
  if(draftContext?.known!==true||!Array.isArray(draftContext.activeSessionIds))return false;
  const id=nativeMatches[0].id,belongs=x=>typeof x==='string'&&(x===id||x===id+'::strength'||x===id+'::run');
  if(draftContext.activeSessionIds.some(belongs)||!Array.isArray(native.completedWorkouts)||!Array.isArray(native.sets)||!Array.isArray(native.runs))return false;
  if(native.completedWorkouts.some(x=>belongs(x.id)||belongs(x.parentId))||native.sets.some(x=>belongs(x.sessionId))||native.runs.some(x=>belongs(x.sessionId)))return false;
  const result=protection.inspect(state.plans,{catalogueOccurrenceId:key},eventContext);
  return result.classification==='training'&&result.taper==='not-applicable'&&result.protected===false;
 }
 // These reductions are trial doses, not validated thresholds or coaching claims.
 // Retain small groups and complex running workouts until independently reviewed.
 function reduced(session){
  const out=copy(session);
  if(out.kind==='strength'&&Array.isArray(out.groups)){
   for(const group of out.groups){
    if(!Number.isInteger(group.sets)||group.sets<3)continue;
    const n=Math.round(group.sets*.7),ratio=n/group.sets;
    if(n>0&&ratio>=.65&&ratio<=.8)group.sets=n;
   }
  }else if(out.kind==='run'&&out.id!=='race'&&Array.isArray(out.steps)){
   const work=out.steps.filter(step=>step.role==='work');
   if(work.length!==1||work[0].effort!=='easy'||out.steps.some(step=>!['warm-up','work','cool-down'].includes(step.role)))return out;
   const step=work[0],unit=Number.isFinite(step.distanceMetres)&&step.distanceMetres>0?'distanceMetres':Number.isFinite(step.durationSeconds)&&step.durationSeconds>0?'durationSeconds':null;
   if(!unit||out.steps.some(s=>!Number.isFinite(s[unit])||s[unit]<=0)||out[unit]!==out.steps.reduce((sum,s)=>sum+s[unit],0))return out;
   const total=Math.round(out[unit]*.75),value=step[unit]-(out[unit]-total);
   if(value<=0||value<step[unit]*.5)return out;
   step[unit]=value;out[unit]=total;
  }
  return out;
 }
 function approve({state,assessmentState,proposal,approved,enabled,eventContext,draftContext,now}){
  day(now);
  if(enabled!==true||approved!==true||!['strength','running'].includes(proposal?.discipline)||!assessment)return {overlay:null};
  // Recompute from current native records, not a caller-provided conclusion.
  let fresh;try{fresh=assessment.assess({state:assessmentState,discipline:proposal.discipline,now,policy:proposal.experimentalPolicy});}catch{return {overlay:null}}
  if(fresh.status!=='review'||!same(fresh.candidate,proposal)||!bound(state,assessmentState,proposal))return {overlay:null};
  if(eventContext?.asOfDate!==now||eventContext?.eventFreeAttestation?.confirmedOn!==now||eventContext?.eventInformationUnchanged!==true)return {overlay:null};
  const end=training.addDays(now,6),changes=[];
  for(const item of training.calendar(state)){
   if(item.date<now||item.date>end||!eligible(state,item,proposal.discipline,eventContext,assessmentState,draftContext))continue;
   const adjusted=reduced(item.session);if(same(adjusted,item.session))continue;
   changes.push({occurrenceId:item.id,date:item.date,original:copy(item.session),adjusted});
  }
  if(!changes.length)return {overlay:null};
  return {overlay:{schema:1,kind:'fatigue-overlay',discipline:proposal.discipline,approved:true,start:now,end,proposal:copy(proposal),eventFreeAttestation:copy(eventContext.eventFreeAttestation),changes}};
 }
 function view({state,assessmentState,overlay,enabled,eventContext,draftContext,now}){
  day(now);
  const valid=enabled===true&&overlay?.schema===1&&overlay.kind==='fatigue-overlay'&&overlay.approved===true&&
   ['strength','running'].includes(overlay.discipline)&&typeof overlay.start==='string'&&typeof overlay.end==='string'&&
   (()=>{try{return training.addDays(overlay.start,6)===overlay.end}catch{return false}})()&&now>=overlay.start&&now<=overlay.end&&Array.isArray(overlay.changes)&&
   overlay.proposal?.discipline===overlay.discipline&&eventContext?.asOfDate===now&&eventContext?.eventInformationUnchanged===true&&same(eventContext?.eventFreeAttestation,overlay.eventFreeAttestation)&&!!assessment&&(()=>{try{
    const initial=assessment.assess({state:assessmentState,discipline:overlay.discipline,now:overlay.start,policy:overlay.proposal.experimentalPolicy});
    const current=assessment.assess({state:assessmentState,discipline:overlay.discipline,now,policy:overlay.proposal.experimentalPolicy});
    return initial.status==='review'&&same(initial.candidate,overlay.proposal)&&current.status!=='safety'&&bound(state,assessmentState,overlay.proposal);
   }catch{return false}})();
  const sessions=training.calendar(state).map(item=>{
   const original=copy(item.session);let adjusted=copy(original);
   if(valid&&item.date>=now&&item.date>=overlay.start&&item.date<=overlay.end&&eligible(state,item,overlay.discipline,eventContext,assessmentState,draftContext)){
    const candidates=overlay.changes.filter(change=>change.occurrenceId===item.id&&change.date===item.date);
    if(candidates.length===1&&same(candidates[0].original,original)){
     const expected=reduced(original);
     if(!same(expected,original)&&same(candidates[0].adjusted,expected))adjusted=expected;
    }
   }
   return {occurrenceId:item.id,date:item.date,original,adjusted};
  });
  return {sessions};
 }
 function recovery({overlay,answer,now}){
  day(now);
  if(!overlay||overlay.approved!==true||!['recovered','uncertain','persistent'].includes(answer))return {status:'unknown',requiresDecision:true,autoExtend:false};
  try{if(training.addDays(overlay.start,6)!==overlay.end||now<training.addDays(overlay.end,-1)||now>overlay.end)return {status:'unknown',requiresDecision:true,autoExtend:false};}catch{return {status:'unknown',requiresDecision:true,autoExtend:false}}
  return {status:answer,requiresDecision:answer!=='recovered',autoExtend:false};
 }
 const api={approve,view,recovery};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFFatigueOverlay=api;
})(typeof globalThis!=='undefined'?globalThis:this);
