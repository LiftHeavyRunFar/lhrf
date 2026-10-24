/* Pure, conservative running/recovery feedback signals. No automatic edits. */
(function(root){
'use strict';
function reviewRunningRecovery(input){
 const c=input||{},runs=Array.isArray(c.runLogs)?c.runLogs:[];
 const valid=runs.filter(r=>r&&Number.isFinite(r.actualRPE)&&r.actualRPE>=1&&r.actualRPE<=10&&
  Number.isFinite(r.targetRPE)&&r.targetRPE>=1&&r.targetRPE<=10).slice(-3);
 const hard=valid.filter(r=>r.actualRPE-r.targetRPE>=1).length;
 const readiness=c.readiness||{};
 const legSoreness=Number(readiness.legSoreness);
 const fatigue=Number(readiness.fatigue);
 const elevated=Number.isFinite(fatigue)&&fatigue>=4&&fatigue<=5;
 const sore=Number.isFinite(legSoreness)&&legSoreness>=4&&legSoreness<=5;
 const repeated=valid.length===3&&hard>=2;
 const proposals=[];
 if(repeated||((elevated||sore)&&valid.length>0&&hard>=1)){
  proposals.push({kind:'review-running-intensity',change:'consider replacing the next quality run with easy running',
   appliesTo:'next quality run only',requiresApproval:true,
   reason:repeated?'At least two of three recent runs exceeded target RPE.':
    'High reported fatigue or leg soreness coincides with a harder-than-planned run.'});
 }
 return {signal:repeated?'repeated-running-overshoot':elevated||sore?'recovery-caution':
  valid.length<3?'insufficient-running-data':'within-variation',
  sampleSize:valid.length,proposals,approvalRequired:proposals.length>0,
  reason:proposals.length?'Review the next quality session before changing it.':
   'No running intensity adjustment supported by current feedback.'};
}
const api={reviewRunningRecovery};
if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFRunningRecoveryV2=api;
})(typeof globalThis!=='undefined'?globalThis:this);
