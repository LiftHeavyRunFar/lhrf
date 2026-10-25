/* Pure, approval-gated strength feedback proposals. Never mutates a programme. */
(function(root){
'use strict';
const round=(n,step=2.5)=>Math.round(n/step)*step;
function proposeStrengthAdjustment(prescription,feedback){
 const p=prescription||{},f=feedback||{},top=p.top;
 const actual=Number(f.actualRPE),target=Number(top?.rpe);
 const load=Number(f.actualWeight??top?.suggestedWeight);
 if(!top||!Number.isFinite(actual)||actual<1||actual>10||!Number.isFinite(target)||
    !Number.isFinite(load)||load<=0)
  return {approvalRequired:false,proposal:null,reason:'Insufficient valid top-set feedback.'};
 if(f.completed===false)return {approvalRequired:false,proposal:null,reason:'Review why the session was incomplete before proposing a load change.'};
 if(f.actualReps!=null&&f.targetReps!=null&&Number(f.actualReps)!==Number(f.targetReps))return {approvalRequired:false,proposal:null,reason:'Changed repetitions are not comparable top-set feedback.'};
 const delta=actual-target;
 if(Math.abs(delta)<1)return {approvalRequired:false,proposal:null,reason:'Top set within target RPE tolerance.'};
 // One-step, capped load proposal; feedback is not an inferred 1RM.
 const fraction=delta>=1?-.025:.025;
 const suggested=Math.max(2.5,round(load*(1+fraction)));
 if((delta>=1&&suggested>=load)||(delta<0&&suggested<=load))return {approvalRequired:false,proposal:null,reason:'Change below available load increment.'};
 return {approvalRequired:true,proposal:{
  kind:'next-exposure-top-load',lift:p.lift,from:load,to:suggested,
  targetRPE:target,actualRPE:actual,source:'reported top-set RPE',
  direction:delta>=1?'reduce':'increase',appliesTo:'next exposure only',
  reason:delta>=1?'Top set exceeded the target RPE by at least one point.':
   'Top set was at least one RPE point easier than prescribed.'
 },reason:'Proposal only; athlete approval required before any change.'};
}
const api={proposeStrengthAdjustment};
if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFStrengthFeedbackV2=api;
})(typeof globalThis!=='undefined'?globalThis:this);
