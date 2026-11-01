/* Offline, read-only export. Never enumerates storage or reads connection keys. */
(function(root){'use strict';
 const deviceKeys=['lhrf_fresh_beta_live_v1114','lhrf_fresh_beta_live_v1114_pendingRun','lhrf_treadmill_v1','lhrf_rest_v1','lhrf-v2-genuine-training-log'];
 const sensitive=/^(apikey|garminkey|intervalsapikey|token|accesstoken|refreshtoken|idtoken|authtoken|bearertoken|sessiontoken|authorization|password|clientsecret|secret|privatekey|cookie|credentials|connectioncredentials|rememberedkey)$/i;
 function clean(value){
  if(Array.isArray(value))return value.map(clean);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([key])=>!sensitive.test(key.replace(/[-_\s]/g,''))).map(([key,v])=>[key,clean(v)]));
  return value;
 }
 function create(data,{storage,now=new Date()}={}){
  if(!data||!Array.isArray(data.sets)||!Array.isArray(data.runs)||!Array.isArray(data.checkins))throw Error('Training data could not be read. No backup was created.');
  const backup=clean(JSON.parse(JSON.stringify(data))),deviceState={},warnings=[];
  for(const key of deviceKeys){try{const raw=storage?.getItem(key);if(raw!=null)deviceState[key]=clean(JSON.parse(raw))}catch{warnings.push('Could not include device state: '+key)}}
  backup._backup={app:'Lift Heavy. Run Far.',schema:1,exportedAt:new Date(now).toISOString(),exportVersion:'training-export-v1',credentialsExcluded:true,deviceState,
   deviceStateNote:'Supplementary draft/history snapshots are retained for review. Legacy Import backup restores the main training state; it does not resume these device drafts.',warnings};
  return backup;
 }
 function download(data,{storage=root.localStorage,document=root.document,URL=root.URL,Blob=root.Blob,now=new Date(),defer=root.setTimeout}={}){
  const backup=create(data,{storage,now}),blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  const filename='lhrf-training-backup-'+backup._backup.exportedAt.slice(0,10)+'.json';
  a.href=url;a.download=filename;a.hidden=true;document.body.appendChild(a);
  try{a.click()}finally{a.remove();defer(()=>URL.revokeObjectURL(url),60000)}
  return {filename,warnings:backup._backup.warnings};
 }
 const api={create,download};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFTrainingBackup=api;
})(typeof globalThis!=='undefined'?globalThis:this);
