/* Conservative running feedback review: no pace changes without context. */
(function(root){
'use strict';
function reviewRunning(logs){
 const valid=(Array.isArray(logs)?logs:[]).filter(x=>x&&
  Number.isFinite(x.sessionRPE)&&x.sessionRPE>=1&&x.sessionRPE<=10&&
  Number.isFinite(x.targetRPE)&&x.targetRPE>=1&&x.targetRPE<=10&&
  (x.completed===true||x.completed===false));
 const recent=valid.slice(-3);
 if(recent.length<3)return {signal:'insufficient-data',sampleSize:recent.length,approvalRequired:false,proposal:null};
 const hard=recent.filter(x=>x.sessionRPE-x.targetRPE>=1||!x.completed).length;
 const easy=recent.filter(x=>x.completed&&x.sessionRPE-x.targetRPE<=-1).length;
 if(hard>=2)return {signal:'running-strain',sampleSize:3,approvalRequired:true,
  proposal:{kind:'review-running-load',change:'consider reducing next quality-session volume',
   appliesTo:'next quality session only',requiresApproval:true,
   reason:'At least two of three recent runs were harder than planned or incomplete.'}};
 if(easy===3)return {signal:'running-comfortable',sampleSize:3,approvalRequired:true,
  proposal:{kind:'review-running-progression',change:'review pace or volume after checking total hybrid recovery',
   appliesTo:'next running review',requiresApproval:true,
   reason:'Three consecutive runs were completed at least one RPE point easier than planned.'}};
 return {signal:'within-variation',sampleSize:3,approvalRequired:false,proposal:null};
}
const api={reviewRunning};
if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFRunningFeedbackV2=api;
})(typeof globalThis!=='undefined'?globalThis:this);
