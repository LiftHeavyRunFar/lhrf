/* Conservative multi-exposure feedback review. Pure and approval-gated. */
(function(root){
'use strict';
function reviewStrengthTrend(logs,lift){
 const selected=(Array.isArray(logs)?logs:[]).filter(x=>x&&x.lift===lift&&
  Number.isFinite(x.actualRPE)&&x.actualRPE>=1&&x.actualRPE<=10&&
  Number.isFinite(x.targetRPE)&&x.targetRPE>=1&&x.targetRPE<=10);
 const recent=selected.slice(-3),deltas=recent.map(x=>x.actualRPE-x.targetRPE);
 const high=deltas.filter(x=>x>=1).length,low=deltas.filter(x=>x<=-1).length;
 if(recent.length<3)return {lift,signal:'insufficient-data',sampleSize:recent.length,
  approvalRequired:false,proposal:null,reason:'At least three valid exposures are required.'};
 if(high>=2){
  return {lift,signal:'repeated-overshoot',sampleSize:3,approvalRequired:true,
   proposal:{kind:'trim-accessory-volume',lift,change:'reduce one accessory set at next exposure',
    appliesTo:'next exposure only',requiresApproval:true,
    reason:'At least two of the last three top sets exceeded their target RPE by one or more points.'},
   reason:'Repeated overshoot warrants a recovery discussion, not an automatic deload.'};
 }
 if(low===3){
  return {lift,signal:'consistently-easy',sampleSize:3,approvalRequired:true,
   proposal:{kind:'review-progression',lift,change:'consider modest top-set progression',
    appliesTo:'next exposure only',requiresApproval:true,
    reason:'Three consecutive top sets were at least one RPE point easier than prescribed.'},
   reason:'Confirm readiness before increasing load.'};
 }
 return {lift,signal:'within-variation',sampleSize:3,approvalRequired:false,proposal:null,
  reason:'No persistent RPE pattern in the last three valid exposures.'};
}
const api={reviewStrengthTrend};
if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFStrengthTrendsV2=api;
})(typeof globalThis!=='undefined'?globalThis:this);
