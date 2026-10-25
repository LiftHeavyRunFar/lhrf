/* Pure, approval-gated post-workout coaching proposals. */
(function(root){
'use strict';
const round=(n,step=2.5)=>Math.round(n/step)*step;
function reviewSession(prescription,feedback){
 const s=prescription||{},f=feedback||{};
 const prescribed=Number(s.top?.rpe??s.backoff?.rpe);
 const observed=Number(f.topRpe??f.actualRpe);
 const completed=f.completed===true;
 const valid=typeof f.completed==='boolean'&&Number.isFinite(prescribed)&&prescribed>0&&Number.isFinite(observed)&&observed>=1&&observed<=10;
 const changes=[];
 if(!valid)return {status:'insufficient-data',changes,approvalRequired:false,reason:'Record completed status and actual RPE before recommending load changes.'};
 if(!completed){
  changes.push({kind:'review-incomplete',reason:'Session was not completed; review cause before advancing load.',requiresApproval:true});
 }else if(observed>=prescribed+1.5){
  changes.push({kind:'reduce-next-load',percent:-2.5,reason:'Actual RPE substantially exceeded the prescribed effort.',requiresApproval:true});
 }else if(observed<=prescribed-1.5){
  changes.push({kind:'increase-next-load',percent:2.5,reason:'Completed session was substantially easier than prescribed.',requiresApproval:true});
 }
 const baseline=Number(s.top?.suggestedWeight??s.backoff?.suggestedWeight);
 if(changes.length&&Number.isFinite(baseline)&&baseline>0&&changes[0].percent){
  changes[0].suggestedNextWeight=round(baseline*(1+changes[0].percent/100));
 }
 return {status:changes.length?'proposal':'on-target',changes,approvalRequired:changes.length>0,
  reason:changes.length?changes[0].reason:'Observed effort is within tolerance; keep the current progression.'};
}
const api={reviewSession};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFPerformanceV2=api;
})(typeof globalThis!=='undefined'?globalThis:this);
