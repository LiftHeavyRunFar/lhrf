/* Isolated IndexedDB experiment. Transactions serialize cooperating overlay records;
 * they do not serialize old tabs' main-state or workout writes. Not wired to UI. */
(function(root){'use strict';
 const adapter=typeof module==='object'&&module.exports?require('./fatigue-native-adapter'):root.LHRFFatigueNativeAdapter;
 const engine=typeof module==='object'&&module.exports?require('./fatigue-overlay'):root.LHRFFatigueOverlay;
 const records=typeof module==='object'&&module.exports?require('./fatigue-overlay-storage'):root.LHRFFatigueOverlayStorage;
 const training=typeof module==='object'&&module.exports?require('./catalogue-training'):root.LHRFCatalogueTraining;
 const fail=(status,reason)=>({status,reason});
 function open(factory){
  return new Promise((resolve,reject)=>{
   if(!factory||typeof factory.open!=='function')return reject(Error('IndexedDB unavailable'));
   let request,settled=false;
   try{request=factory.open('lhrf-fatigue-overlay-v1',1)}catch(e){return reject(e)}
   request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains('records'))db.createObjectStore('records')};
   request.onblocked=()=>{if(!settled){settled=true;reject(Error('IndexedDB blocked'))}};
   request.onerror=()=>{if(!settled){settled=true;reject(Error('IndexedDB unavailable'))}};
   request.onsuccess=()=>{const db=request.result;if(settled){db.close();return}settled=true;db.onversionchange=()=>db.close();resolve(db)};
  });
 }
 async function transact(factory,mode,operation){
  let db;try{db=await open(factory)}catch{return fail('unavailable','overlay database unavailable')}
  return new Promise(resolve=>{
   let tx,out=fail('failed','overlay transaction failed'),settled=false;
   const finish=value=>{if(!settled){settled=true;try{db.close()}catch{}resolve(value)}};
   try{
    tx=db.transaction('records',mode);const store=tx.objectStore('records');
    tx.oncomplete=()=>finish(out);tx.onabort=()=>finish(fail('failed','overlay transaction aborted'));tx.onerror=()=>{};
    operation(store,value=>{out=value},tx);
   }catch{try{tx?.abort()}catch{}finish(fail('failed','overlay transaction failed'))}
  });
 }
 async function read({indexedDB,overlayKey,now}={}){
  if(typeof overlayKey!=='string'||!overlayKey)return fail('invalid','overlay key');
  try{training.parseDate(now)}catch{return fail('invalid','date')}
  return transact(indexedDB,'readonly',(store,done)=>{
   const request=store.get(overlayKey);request.onsuccess=()=>{const value=request.result;done(records.inspect(value===undefined?null:JSON.stringify(value),now))};
  });
 }
 // The callback must be synchronous. It runs while a readwrite transaction holds
 // the overlay record lock, so a cooperating revocation cannot commit between
 // the read and the caller's synchronous live-draft save. Legacy writers of the
 // independent main-state key are not serialized by this transaction.
 async function withActive({indexedDB,overlayKey,now}={},callback){
  if(typeof overlayKey!=='string'||!overlayKey||typeof callback!=='function')return fail('invalid','overlay context');
  try{training.parseDate(now)}catch{return fail('invalid','date')}
  return transact(indexedDB,'readwrite',(store,done)=>{
   const request=store.get(overlayKey);request.onsuccess=()=>{
    const view=records.inspect(request.result===undefined?null:JSON.stringify(request.result),now);
    try{const value=callback(view.status==='active'?view.overlay:null);if(value&&typeof value.then==='function')return done(fail('invalid','callback must be synchronous'));done({status:'read',value})}catch{return done(fail('failed','overlay application failed'))}
   };
  });
 }
 async function approve({indexedDB,storage,mainKey,overlayKey,expectedRaw,proposal,approved,now,eventContext}={}){
  if(!storage||typeof storage.getItem!=='function'||typeof mainKey!=='string'||!mainKey||typeof overlayKey!=='string'||!overlayKey||mainKey===overlayKey||typeof expectedRaw!=='string')return fail('invalid','storage context');
  let native,source,drafts,result;
  try{
   if(storage.getItem(mainKey)!==expectedRaw)return fail('conflict','training data changed');
   native=JSON.parse(expectedRaw);if(native?.featureFlags?.fatigueIntervention!==true||approved!==true)return fail('not-approved','not enabled or approved');
   if(storage.getItem('competition:lhrf_beta_v1118_clean')!==null)return fail('conflict','separate competition programme requires review');
   drafts=adapter.draftContext(storage);if(!drafts.known||drafts.activeSessionIds.length)return fail('conflict','active or unreadable workout draft');
   source=adapter.catalogueState(native);result=engine.approve({state:source,assessmentState:native,proposal,enabled:true,approved:true,now,eventContext,draftContext:drafts});
  }catch{return fail('invalid','approval inputs')}
  if(!result?.overlay)return fail('not-approved','no eligible adjustment');
  const record={...result.overlay,eventFingerprint:adapter.eventFingerprint(native)};
  return transact(indexedDB,'readwrite',(store,done)=>{
   const get=store.get(overlayKey);get.onsuccess=()=>{
    if(get.result!==undefined)return done(fail('conflict','an overlay record already exists'));
    try{
     const current=adapter.draftContext(storage);
     if(storage.getItem(mainKey)!==expectedRaw||storage.getItem('competition:lhrf_beta_v1118_clean')!==null||!current.known||current.activeSessionIds.length)return done(fail('conflict','training changed during review'));
     const put=store.add(record,overlayKey);put.onsuccess=()=>done({status:'saved',overlay:record});
    }catch{done(fail('failed','overlay could not be prepared'))}
   };
  });
 }
 async function revoke({indexedDB,overlayKey,expectedRaw,confirmed,now}={}){
  if(typeof overlayKey!=='string'||!overlayKey||typeof expectedRaw!=='string')return fail('invalid','overlay key');
  if(confirmed!==true)return fail('not-approved','explicit cancellation required');
  let expected;try{training.parseDate(now);expected=JSON.parse(expectedRaw);if(expected?.schema!==1||expected.kind!=='fatigue-overlay'||expected.approved!==true||training.addDays(expected.start,6)!==expected.end||!Array.isArray(expected.changes)||!expected.changes.length)return fail('invalid','overlay record')}catch{return fail('invalid','overlay record')}
  return transact(indexedDB,'readwrite',(store,done)=>{
   const get=store.get(overlayKey);get.onsuccess=()=>{
    if(get.result===undefined||JSON.stringify(get.result)!==expectedRaw)return done(fail('conflict','overlay record changed'));
    const put=store.put({schema:1,kind:'fatigue-overlay-revocation',revokedOn:now,previous:expected},overlayKey);put.onsuccess=()=>done({status:'revoked'});
   };
  });
 }
 const api={approve,read,withActive,revoke};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFFatigueOverlayIDB=api;
})(typeof globalThis!=='undefined'?globalThis:this);
