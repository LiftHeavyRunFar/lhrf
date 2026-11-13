/* Experimental separate-key storage. This never writes the main workout key.
 * Web Locks serialize cooperating overlay writers only; legacy tabs remain uncoordinated. */
(function(root){'use strict';
 const adapter=typeof module==='object'&&module.exports?require('./fatigue-native-adapter'):root.LHRFFatigueNativeAdapter;
 const engine=typeof module==='object'&&module.exports?require('./fatigue-overlay'):root.LHRFFatigueOverlay;
 const training=typeof module==='object'&&module.exports?require('./catalogue-training'):root.LHRFCatalogueTraining;
 function inspect(raw,now){
  try{
   training.parseDate(now);if(raw===null)return {status:'none'};if(typeof raw!=='string')return {status:'invalid'};
   const record=JSON.parse(raw);if(record?.schema===1&&record.kind==='fatigue-overlay-revocation')return {status:'revoked'};
   if(record?.schema!==1||record.kind!=='fatigue-overlay'||record.approved!==true||training.addDays(record.start,6)!==record.end||!Array.isArray(record.changes)||!record.changes.length)return {status:'invalid'};
   if(now<record.start)return {status:'not-started'};if(now>record.end)return {status:'expired'};
   return {status:'active',overlay:record};
  }catch{return {status:'invalid'};}
 }
 async function revoke({storage,locks,overlayKey,expectedRaw,confirmed,now}){
  const fail=(status,reason)=>({status,reason});
  if(!storage||!locks||typeof locks.request!=='function'||typeof storage.getItem!=='function'||typeof storage.setItem!=='function'||typeof overlayKey!=='string'||!overlayKey||typeof expectedRaw!=='string')return fail('unavailable','locking or storage unavailable');
  if(confirmed!==true)return fail('not-approved','explicit cancellation required');
  let existing;try{training.parseDate(now);existing=JSON.parse(expectedRaw);if(existing?.schema!==1||existing.kind!=='fatigue-overlay'||existing.approved!==true||training.addDays(existing.start,6)!==existing.end||!Array.isArray(existing.changes)||!existing.changes.length)return fail('invalid','invalid overlay record');}catch{return fail('invalid','invalid overlay record');}
  try{return await locks.request('lhrf-fatigue-overlay:'+overlayKey,{mode:'exclusive',ifAvailable:true},async lock=>{
   if(!lock)return fail('busy','another approval is in progress');
   try{
    if(storage.getItem(overlayKey)!==expectedRaw)return fail('conflict','overlay record changed');
    const tombstone=JSON.stringify({schema:1,kind:'fatigue-overlay-revocation',revokedOn:now,previous:existing});
    storage.setItem(overlayKey,tombstone);
    if(storage.getItem(overlayKey)!==tombstone)return fail('unknown','revocation needs review');
    return {status:'revoked'};
   }catch{return fail('unknown','revocation needs review');}
  });}catch{return fail('unavailable','overlay lock unavailable');}
 }
 async function approve({storage,locks,mainKey,overlayKey,expectedRaw,proposal,approved,now,eventContext}){
  const fail=(status,reason)=>({status,reason});
  if(!storage||!locks||typeof locks.request!=='function'||typeof storage.getItem!=='function'||typeof storage.setItem!=='function'||typeof storage.removeItem!=='function'||typeof mainKey!=='string'||!mainKey||typeof overlayKey!=='string'||!overlayKey||mainKey===overlayKey||typeof expectedRaw!=='string')return fail('unavailable','locking or storage unavailable');
  try{return await locks.request('lhrf-fatigue-overlay:'+overlayKey,{mode:'exclusive',ifAvailable:true},async lock=>{
   if(!lock)return fail('busy','another approval is in progress');
   let native,state,drafts;
   try{
    if(storage.getItem(mainKey)!==expectedRaw)return fail('conflict','training data changed');
    if(storage.getItem(overlayKey)!==null)return fail('conflict','an overlay record already exists');
    native=JSON.parse(expectedRaw);if(native?.featureFlags?.fatigueIntervention!==true||approved!==true)return fail('not-approved','not enabled or approved');
    drafts=adapter.draftContext(storage);if(!drafts.known||drafts.activeSessionIds.length)return fail('conflict','active or unreadable workout draft');
    state=adapter.catalogueState(native);
   }catch{return fail('failed','unable to read current data');}
   let result;try{result=engine.approve({state,assessmentState:native,proposal,enabled:true,approved:true,now,eventContext,draftContext:drafts});}catch{return fail('invalid','approval inputs');}
   if(!result?.overlay)return fail('not-approved','no eligible adjustment');
   let raw;try{raw=JSON.stringify(result.overlay);if(storage.getItem(mainKey)!==expectedRaw||storage.getItem(overlayKey)!==null)return fail('conflict','data changed during review');
    const latest=adapter.draftContext(storage);if(!latest.known||latest.activeSessionIds.length)return fail('conflict','workout draft changed');
    storage.setItem(overlayKey,raw);
   }catch{
    try{if(storage.getItem(overlayKey)===null)return fail('failed','approval was not saved');}catch{}
    return fail('unknown','overlay storage needs review');
   }
   try{
    if(storage.getItem(overlayKey)!==raw)return fail('unknown','overlay storage needs review');
    if(storage.getItem(mainKey)!==expectedRaw||!adapter.draftContext(storage).known||adapter.draftContext(storage).activeSessionIds.length){
     if(storage.getItem(overlayKey)===raw)storage.removeItem(overlayKey);
     return fail('conflict','training changed during approval');
    }
   }catch{return fail('unknown','overlay storage needs review');}
   return {status:'saved',overlay:JSON.parse(raw)};
  });}catch{return fail('unavailable','overlay lock unavailable');}
 }
 const api={approve,revoke,inspect};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFFatigueOverlayStorage=api;
})(typeof globalThis!=='undefined'?globalThis:this);
