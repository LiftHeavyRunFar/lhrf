/* Read-time native adapter; no persistence, scheduling or Garmin writes. */
(function(root){'use strict';
 const training=typeof module==='object'&&module.exports?require('./catalogue-training'):root.LHRFCatalogueTraining;
 const overlay=typeof module==='object'&&module.exports?require('./fatigue-overlay'):root.LHRFFatigueOverlay;
 const clone=x=>JSON.parse(JSON.stringify(x));
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 function catalogueState(native){
  const plans=native?.customRoadmap?.cataloguePlans;if(!Array.isArray(plans)||!plans.length)throw Error('No catalogue plans');
  return plans.reduce((s,p)=>training.enrol(s,p.snapshot,p.start,p.id),training.empty());
 }
 function draftContext(storage){
  try{
   const ids=[];for(const suffix of ['','_pendingRun']){
    const raw=storage.getItem('lhrf_fresh_beta_live_v1114'+suffix);if(!raw)continue;
    const parsed=JSON.parse(raw);if(!parsed||typeof parsed!=='object')throw Error('Invalid draft');
    const id=parsed.id||parsed.parentId;if(typeof id!=='string'||!id)throw Error('Invalid draft identity');ids.push(id);
   }
   return {known:true,activeSessionIds:ids};
  }catch{return {known:false,activeSessionIds:[]};}
 }
 // The original native session remains authoritative on every error or ambiguity.
 function resolve({native,session,storage,mainKey,overlayKey,now,eventContext}){
  if(!session||typeof session!=='object'||Array.isArray(session))return {session:null,adjusted:false};
  const original=clone(session);const unchanged=()=>({session:clone(original),adjusted:false});
  try{
   if(native?.featureFlags?.fatigueIntervention!==true||!storage||typeof storage.getItem!=='function'||!mainKey||!overlayKey||mainKey===overlayKey||!session?.catalogueOccurrenceId||session.runs?.length||!Array.isArray(session.ex))return unchanged();
   const originalRaw=storage.getItem(mainKey),overlayRaw=storage.getItem(overlayKey),context=draftContext(storage);
   if(typeof originalRaw!=='string'||originalRaw!==JSON.stringify(native)||typeof overlayRaw!=='string'||!context.known||context.activeSessionIds.length)return unchanged();
   const approvedOverlay=JSON.parse(overlayRaw);
   const state=catalogueState(native),key=session.catalogueOccurrenceId;
   const all=(native.reviewedProgramme?.weeks||[]).flatMap(w=>w.sessions||[]),source=all.filter(s=>s.catalogueOccurrenceId===key);
   if(source.length!==1||!same(source[0],session))return unchanged();
   const occurrence=state.occurrences.filter(o=>o.planId+'-w'+o.week+'-'+o.sessionId===key);
   if(occurrence.length!==1)return unchanged();
   const result=overlay.view({state,assessmentState:native,overlay:approvedOverlay,enabled:true,eventContext,draftContext:context,now});
   const match=result.sessions.filter(x=>x.occurrenceId===occurrence[0].id);
   if(match.length!==1||same(match[0].original,match[0].adjusted))return unchanged();
   const a=match[0].adjusted,b=match[0].original;
   if(a.kind!=='strength'||!Array.isArray(a.groups)||!Array.isArray(b.groups)||a.groups.length!==session.ex.length||b.groups.length!==session.ex.length)return unchanged();
   const changed=clone(session);
   for(let i=0;i<session.ex.length;i++){
    if(!Number.isInteger(a.groups[i].sets)||a.groups[i].sets<1||a.groups[i].sets>b.groups[i].sets||session.ex[i][1]!==b.groups[i].sets)return unchanged();
    const aGroup={...a.groups[i],sets:b.groups[i].sets};if(!same(aGroup,b.groups[i]))return unchanged();
    changed.ex[i][1]=a.groups[i].sets;
   }
   const latest=draftContext(storage);
   if(storage.getItem(mainKey)!==originalRaw||storage.getItem(overlayKey)!==overlayRaw||!latest.known||latest.activeSessionIds.length)return unchanged();
   return {session:changed,adjusted:true,audit:{overlayStart:approvedOverlay.start,overlayEnd:approvedOverlay.end,occurrenceId:occurrence[0].id,original:{ex:clone(session.ex),runs:clone(session.runs||[])},adjusted:{ex:clone(changed.ex),runs:clone(changed.runs||[])}}};
  }catch{return unchanged();}
 }
 const api={catalogueState,draftContext,resolve};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFFatigueNativeAdapter=api;
})(typeof globalThis!=='undefined'?globalThis:this);
