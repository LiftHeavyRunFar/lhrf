/* Isolated transaction prototype. Not connected to the app. A single localStorage
 * write preserves the programme and approval together; this is not a cross-tab lock. */
(function(root){'use strict';
 const overlay=typeof module==='object'&&module.exports?require('./fatigue-overlay'):root.LHRFFatigueOverlay;
 function approveAndSave({storage,key,expectedRaw,catalogueState,proposal,enabled,approved,now,eventContext,draftContext}){
  const fail=(status,reason)=>({status,reason});
  if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function'||typeof key!=='string'||!key||typeof expectedRaw!=='string')return fail('invalid','storage context');
  let current,native;try{current=storage.getItem(key);if(current!==expectedRaw)return fail('conflict','training data changed');native=JSON.parse(current);}catch{return fail('failed','unable to read training data');}
  if(!native||typeof native!=='object'||Array.isArray(native)||native.fatigueIntervention!==undefined)return fail('conflict','existing or invalid intervention state');
  let result;try{result=overlay.approve({state:catalogueState,assessmentState:native,proposal,enabled,approved,now,eventContext,draftContext});}catch{return fail('invalid','approval inputs');}
  if(!result?.overlay)return fail('not-approved','no eligible approved adjustment');
  let next;try{next=JSON.stringify({...native,fatigueIntervention:result.overlay});if(storage.getItem(key)!==expectedRaw)return fail('conflict','training data changed during review');}catch{return fail('failed','unable to prepare approval');}
  try{storage.setItem(key,next);}catch{
   try{if(storage.getItem(key)===expectedRaw)return fail('failed','approval was not saved');}catch{}
   return fail('unknown','storage result needs review');
  }
  try{if(storage.getItem(key)!==next)return fail('unknown','storage result needs review');}catch{return fail('unknown','storage result needs review');}
  return {status:'saved',state:JSON.parse(next)};
 }
 const api={approveAndSave};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFFatigueApprovalStorage=api;
})(typeof globalThis!=='undefined'?globalThis:this);
