/* Reviewed snapshot installation. No engine prescription changes or implicit activation. */
(function(root){'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const DATA_KEY='lhrf_beta_v1118_clean',JOURNAL_KEY='lhrf_programme_replacement_transaction_v1',LOCK_KEY='lhrf_programme_replacement_lock_v1';
const LIVE_KEY='lhrf_fresh_beta_live_v1114',DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function canonical(x){if(Array.isArray(x))return '['+x.map(canonical).join(',')+']';if(x&&typeof x==='object')return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';return JSON.stringify(x)}
async function digest(x){const bytes=new TextEncoder().encode(typeof x==='string'?x:canonical(x));return [...new Uint8Array(await root.crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('')}
function isoDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(value||'')&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value}
function today(now){const d=new Date(now);if(!Number.isFinite(+d))throw Error('Invalid activation time.');return d.toLocaleDateString('en-CA',{timeZone:'Europe/London'})}
function dateOf(c,w,s){if(isoDate(s.scheduledDate))return s.scheduledDate;if(s.eventDate)return s.eventDate;const i=DAYS.indexOf(String(s.day).slice(0,3));if(!isoDate(c.startDate)||i<0)throw Error('A session has no trustworthy calendar date.');const d=new Date(c.startDate+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7+(w-1)*7+i);return d.toISOString().slice(0,10)}
function validateProgramme(p){
 if(p?.schema!=='lhrf-shared-programme-v1'||!isoDate(p.config?.startDate)||!Array.isArray(p.weeks)||!p.weeks.length||p.weeks.length!==p.config.weeks||p.weeks.length>104)throw Error('Use a complete reviewed native programme, not a training-data backup.');
 const seen=new Set();for(const [i,w]of p.weeks.entries()){
  if(w.week!==i+1||w.feasible!==true||w.blockingIssues?.length||!Array.isArray(w.sessions)||w.sessions.length>14)throw Error('The reviewed programme contains an unresolved coaching gate.');
  for(const s of w.sessions){if(!s.id||!Array.isArray(s.ex)||!Array.isArray(s.runs)||!isoDate(dateOf(p.config,w.week,s)))throw Error('Malformed dated session.');const key=w.week+'|'+s.id;if(seen.has(key))throw Error('Duplicate session.');seen.add(key);
   for(const e of s.ex)if(!Array.isArray(e)||typeof e[0]!=='string'||!Number.isInteger(e[1])||e[1]<1||e[1]>30||!Number.isInteger(e[2])||e[2]<1||e[2]>100||!Number.isFinite(e[3])||e[3]<0||!Number.isFinite(e[4])||e[4]<1||e[4]>10)throw Error('Malformed strength prescription.');
   for(const r of s.runs)if(!Number.isFinite(r.distanceKm)||r.distanceKm<0||!Array.isArray(r.steps))throw Error('Malformed running prescription.');
  }
 }
 if(p.config.runningReviewVersion===1){
  const running=typeof module==='object'&&module.exports?require('./running-preparation.js'):root.LHRFRunningPreparation;
  if(running.racePreparationReview(p)?.accepted===false)
   throw Error('Review the running goal or explicitly choose provisional training before approving this programme.');
 }
 return p;
}
function identity(state){const out={};for(const key of ['athleteId','userId'])if(state[key]!=null)out[key]=state[key];for(const key of ['athlete','profile','athleteProfile'])if(state[key]?.id!=null)out[key]=state[key].id;return out}
async function anchors(state){const out={};for(const key of ['sets','runs'])out[key]=await Promise.all((state[key]||[]).map(r=>digest(r)));return out}
async function createPackage(programme,sourceState,{reviewedCommit,approvalContext=[]}={}){validateProgramme(programme);const packet={schema:'lhrf-reviewed-replacement-v1',reviewedCommit,programmeDigest:await digest(programme),sourceProgrammeDigest:await digest(sourceState.customRoadmap),sourceIdentityDigest:await digest(identity(sourceState)),sourceTrainingAnchors:await anchors(sourceState),...(sourceState.reviewedProgramme?.weeks?{sourceCalendarDigest:await digest(sourceState.reviewedProgramme.weeks)}:{}),approvalContext:clone(approvalContext),programme:clone(programme)};packet.reviewFingerprint=await digest(packet);return packet}
async function verifyProgrammePayload(packet,expectedDigest){
 const payload=clone(packet||{});delete payload.reviewFingerprint;
 if(packet?.schema!=='lhrf-reviewed-replacement-v1'||!/^([a-f0-9]{64})$/.test(expectedDigest||'')||packet.reviewFingerprint!==expectedDigest||await digest(payload)!==expectedDigest||await digest(packet.programme)!==packet.programmeDigest)throw Error('Reviewed fingerprint mismatch. Use the exact package and fingerprint supplied with the review.');
 return validateProgramme(packet.programme);
}
async function verifyPackage(packet,expectedDigest,state){
 await verifyProgrammePayload(packet,expectedDigest);
 if(await digest(identity(state))!==packet.sourceIdentityDigest)throw Error('This package belongs to a different athlete identity.');
 const current=await anchors(state);for(const key of ['sets','runs'])if(!Array.isArray(packet.sourceTrainingAnchors?.[key])||packet.sourceTrainingAnchors[key].some(h=>!current[key].includes(h)))throw Error('Reviewed training evidence is missing or changed. Obtain a fresh comparison.');
 const alreadyApplied=state.programmeReplacementHistory?.some(x=>x.id==='reviewed-'+packet.programmeDigest.slice(0,24));
 if(!alreadyApplied&&(await digest(state.customRoadmap)!==packet.sourceProgrammeDigest||packet.sourceCalendarDigest&&(!state.reviewedProgramme?.weeks||await digest(state.reviewedProgramme.weeks)!==packet.sourceCalendarDigest)))throw Error('The saved programme differs from the review source. Obtain a fresh coaching comparison; no replacement was applied.');
 return packet;
}

function calendar(state,engine,now){
 if(state.reviewedProgramme&&state.reviewedProgramme.config?.programmeId===state.customRoadmap?.programmeId){
  return state.reviewedProgramme.weeks.map(w=>({...clone(w),sessions:clone(w.week===Number(state.activeCustomWeek||1)&&Array.isArray(state.activeSchedule)?state.activeSchedule:w.sessions)}));
 }
 const c=state.customRoadmap;if(!c||!isoDate(c.startDate)||!Number.isInteger(c.weeks)||c.weeks<1||c.weeks>104)throw Error('The existing programme needs a trustworthy dated archive before replacement.');
 const e=engine.createEngine({data:clone(state),now:()=>Date.parse(now)}),out=[];
 for(let w=1;w<=c.weeks;w++)out.push({week:w,sessions:clone(w===Number(state.activeCustomWeek||1)&&Array.isArray(state.activeSchedule)?state.activeSchedule:e.generatedSessions(c,w))});
 return out;
}
function baseId(id){return String(id||'').replace(/::(strength|run)$/,'')}
function recordMatches(r,s,w,date){
 const id=r.sessionId||r.id||r.parentId;
 if(id&&baseId(id)===baseId(s.id)&&(r.week==null||Number(r.week)===Number(s.sourceProgrammeWeek||w)))return true;
 // Unlinked imports / legacy logs protect the date conservatively, not a guessed lift.
 return !id&&String(r.date||'').slice(0,10)===date;
}
function protection(state,weeks,c,cutoff){
 const records=[...(state.completedWorkouts||[]),...(state.sets||[]),...(state.runs||[])],protectedDates=new Map();
 for(const w of weeks)for(const s of w.sessions){const date=dateOf(c,w.week,s),logged=records.some(r=>recordMatches(r,s,w.week,date));if(date<=cutoff||logged){const list=protectedDates.get(date)||[];list.push({...clone(s),scheduledDate:date,sourceProgrammeWeek:s.sourceProgrammeWeek||w.week,preservedFromProgrammeId:s.preservedFromProgrammeId||c.programmeId||'previous-programme',preservationReason:logged?'Recorded or partly logged; whole date retained':'Today or earlier; not a future replacement'});protectedDates.set(date,list)}}
 return protectedDates;
}
function mergeCalendar(baseWeeks,c,protectedDates,cutoff){
 return baseWeeks.map(w=>({...clone(w),sessions:[...w.sessions.filter(s=>{const d=dateOf(c,w.week,s);return d>cutoff&&!protectedDates.has(d)}).map(clone),...[...protectedDates].filter(([d])=>d>=c.startDate&&weekAt(c,d)===w.week).flatMap(([,ss])=>clone(ss))].sort((a,b)=>dateOf(c,w.week,a).localeCompare(dateOf(c,w.week,b)))}));
}
function weekAt(c,date){const d=new Date(c.startDate+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return Math.floor((Date.parse(date+'T12:00:00Z')-Number(d))/604800000)+1}
function sessions(state,w){if(!state.reviewedProgramme||state.customRoadmap?.programmeId!==state.reviewedProgramme.config.programmeId)return null;return clone(state.reviewedProgramme.weeks.find(x=>x.week===w)?.sessions||[])}
function context(state,weeks){return {programme:clone(state.customRoadmap),schedule:clone(state.activeSchedule||[]),week:state.activeCustomWeek||1,overrides:clone(state.overrides||{}),decisions:clone(state.decisions||[]),weeks:clone(weeks),reviewedProgramme:state.reviewedProgramme?clone(state.reviewedProgramme):null}}
function previewRows(before,bc,after,ac,cutoff){
 const rows=new Map();for(const [key,weeks,c]of [['before',before,bc],['after',after,ac]])for(const w of weeks)for(const s of w.sessions){const date=dateOf(c,w.week,s);if(date<cutoff)continue;const row=rows.get(date)||{date,before:[],after:[]};row[key].push(clone(s));rows.set(date,row)}
 return [...rows.values()].sort((a,b)=>a.date.localeCompare(b.date)).map(r=>{if(r.date===cutoff&&!r.after.length)r.after=clone(r.before).map(s=>({...s,preservedFromProgrammeId:bc.programmeId||'previous',preservationReason:'Retained in history and the archive; not replaced'}));return {...r,status:r.after.some(s=>s.preservedFromProgrammeId)?'protected':r.date===cutoff?'unchanged-today':'future-replacement'}});
}
function effectivePreview(rows,before,after,engine){return rows.map(row=>({...row,...Object.fromEntries([['before',before],['after',after]].map(([key,state])=>[key,row[key].map(s=>{const ex=engine.createEngine({data:state,schedule:[s]}).effectiveSession(s.id)?.ex;return {...s,displayEx:clone(ex||s.ex),hasApprovedAdjustment:!same(ex||s.ex,s.ex)}})]))}))}
function equipmentReview(state,weeks,c,cutoff){
 const registry=typeof module==='object'&&module.exports?require('./exercise-registry.js'):root.LHRFExercises;
 const inventory=Object.prototype.hasOwnProperty.call(state,'equipmentInventory')?state.equipmentInventory:c.equipmentInventory;
 const future=weeks.flatMap(w=>w.sessions.filter(s=>dateOf(c,w.week,s)>cutoff&&!s.preservedFromProgrammeId));
 for(const session of future)registry.assertStart(session,inventory);
 const review=registry.audit(future,inventory);if(!review.eligible)throw Error('Equipment review required before programme replacement. '+review.messages.join(' '));return review;
}
function createReplacement(state,packet,engine,{now,liveWorkout=null,pendingRun=null}={}){
 validateProgramme(packet.programme);const c=packet.programme.config,cutoff=today(now),id='reviewed-'+packet.programmeDigest.slice(0,24);
 if(state.programmeReplacementHistory?.some(x=>x.id===id))return {alreadyApplied:true,next:clone(state),rows:[],id};
 if(liveWorkout||pendingRun||state.activeWorkout||state.liveWorkout)throw Error('Finish the active workout and any pending run before replacing the programme. Drafts have not been changed.');
 if(!state.onboardingComplete)throw Error('An existing athlete and programme are required. Do not repeat onboarding.');
 const oldWeeks=calendar(state,engine,now),oldContext=context(state,oldWeeks),protectedDates=protection(state,oldWeeks,state.customRoadmap,cutoff),config={...clone(c),programmeId:id,sessionNamespace:id+'-',approvedAt:now,reviewedSnapshotVersion:1};
 const rawWeeks=packet.programme.weeks.map(w=>({...clone(w),sessions:w.sessions.map((s,i)=>({...clone(s),id:id+'-w'+w.week+'-'+i,scheduledDate:dateOf(c,w.week,s)}))}));
 const weeks=mergeCalendar(rawWeeks,config,protectedDates,cutoff),week=Math.min(config.weeks,Math.max(1,weekAt(config,cutoff)));
 if(!weeks.some(w=>w.sessions.some(s=>!s.preservedFromProgrammeId&&s.scheduledDate>cutoff)))throw Error('No unfinished future sessions remain in this reviewed programme.');
 equipmentReview(state,weeks,config,cutoff);
 const next=clone(state);next.programmeArchive=[...(next.programmeArchive||[]),{...oldContext,archivedAt:now,replacementId:id,reason:'Explicit reviewed replacement'}];
 next.customRoadmap=config;next.reviewedProgramme={id,config:clone(config),weeks,sourceDigest:packet.programmeDigest,originalNative:clone(packet.programme),approvalContext:clone(packet.approvalContext||[])};
 next.activeCustomWeek=week;next.activeSchedule=clone(weeks[week-1].sessions);next.programmeActivation={id,at:now,status:'active',sourceDigest:packet.programmeDigest};next.programmeReplacementHistory=[...(next.programmeReplacementHistory||[]),{id,at:now,status:'active'}];
 return {id,next,asOfDate:cutoff,activationNotBefore:c.startDate,rows:effectivePreview(previewRows(oldWeeks,state.customRoadmap,weeks,config,cutoff),state,next,engine),alreadyApplied:false};
}
function createRollback(state,engine,{now,liveWorkout=null,pendingRun=null}={}){
 if(liveWorkout||pendingRun||state.activeWorkout||state.liveWorkout)throw Error('Finish the active workout and pending run before rollback.');
 const id=state.programmeActivation?.id;if(!id)throw Error('No replacement to roll back.');if(state.programmeActivation.status==='rolled-back')return {id,alreadyApplied:true,next:clone(state),rows:[]};
 const archive=(state.programmeArchive||[]).findLast(x=>x.replacementId===id);if(!archive?.weeks)throw Error('No verified historical programme archive is available.');
 const cutoff=today(now),current=calendar(state,engine,now),protectedDates=protection(state,current,state.customRoadmap,cutoff),c=clone(archive.programme),weeks=mergeCalendar(archive.weeks,c,protectedDates,cutoff),week=Math.min(c.weeks,Math.max(1,weekAt(c,cutoff))),next=clone(state);
 next.programmeArchive=[...next.programmeArchive,{...context(state,current),archivedAt:now,rollbackOf:id}];next.customRoadmap=c;next.reviewedProgramme={id:'rollback-'+id,config:clone(c),weeks,rollbackOf:id};next.activeCustomWeek=week;next.activeSchedule=clone(weeks[week-1].sessions);next.programmeActivation={...state.programmeActivation,status:'rolled-back',rolledBackAt:now};next.programmeReplacementHistory=next.programmeReplacementHistory.map(x=>x.id===id?{...x,status:'rolled-back',rolledBackAt:now}:x);
 return {id:'rollback-'+id,next,asOfDate:cutoff,rows:effectivePreview(previewRows(current,state.customRoadmap,weeks,c,cutoff),state,next,engine),alreadyApplied:false};
}
function verifyPreservation(before,after){const changed=new Set(['customRoadmap','activeSchedule','activeCustomWeek','programmeArchive','reviewedProgramme','programmeActivation','programmeReplacementHistory']);for(const key of Object.keys(before))if(!changed.has(key)&&!same(before[key],after[key]))throw Error('Unrelated athlete data changed: '+key);return true}
async function backupFor(state,storage,backupModule,now){const backup=backupModule.create(state,{storage,now});if(backup._backup.warnings.length)throw Error('A draft could not be backed up. Resolve the backup warning before activation.');const text=JSON.stringify(backup,null,2)+'\n';return {text,digest:await digest(text),backup,sourceCanonical:canonical(state)}}
async function verifyBackupFile(text,expected){if(await digest(text)!==expected.digest||!same(JSON.parse(text),expected.backup))throw Error('Backup verification failed. Select the fresh downloaded backup file.');return true}
function liveFrom(storage){const parse=k=>{const raw=storage.getItem(k);if(!raw)return null;try{return JSON.parse(raw)}catch{throw Error('An unreadable live draft must be resolved before activation.')}};return {liveWorkout:parse(LIVE_KEY),pendingRun:parse(LIVE_KEY+'_pendingRun')}}
function commit(storage,preview,{expectedRaw,backup,backupVerified=false,confirmed=false,now}={}){
 if(!confirmed||!backupVerified||!backup?.digest)throw Error('Verified fresh backup and explicit athlete confirmation are required.');
 if(storage.getItem(DATA_KEY)!==expectedRaw)throw Error('Training data changed after preview. Create a new preview and fresh backup.');
 const live=liveFrom(storage);if(live.liveWorkout||live.pendingRun)throw Error('A workout is now active. Nothing was replaced.');
 const before=JSON.parse(expectedRaw);if(backup.sourceCanonical!==canonical(before))throw Error('The backup does not match the current preview. Create a fresh backup.');verifyPreservation(before,preview.next);if(preview.alreadyApplied)return before;equipmentReview(before,preview.next.reviewedProgramme.weeks,preview.next.customRoadmap,today(now));
 if(today(now)!==preview.asOfDate)throw Error('The preview is from another day. Create a fresh preview and backup.');
 if(!preview.id.startsWith('rollback-')&&today(now)<preview.activationNotBefore)throw Error('Activation is available from '+preview.activationNotBefore+'. Preview only today.');
 const afterRaw=JSON.stringify(preview.next),backupKey='lhrf_replacement_backup_v1:'+preview.id+':'+Date.parse(now),journal={id:preview.id,phase:'prepared',backupKey,backupDigest:backup.digest,at:now,programmeId:preview.next.customRoadmap.programmeId};
 if(storage.getItem(LOCK_KEY))throw Error('Another programme transaction is in progress. Reload to inspect its status.');
 storage.setItem(LOCK_KEY,preview.id);
 try{
  storage.setItem(backupKey,backup.text);if(storage.getItem(backupKey)!==backup.text)throw Error('Could not verify the recovery backup in device storage.');
  storage.setItem(JOURNAL_KEY,JSON.stringify(journal));
  if(storage.getItem(DATA_KEY)!==expectedRaw)throw Error('Another tab changed training data. Replacement cancelled.');
  // One synchronous main-state write contains archive + snapshot + identity + logs.
  storage.setItem(DATA_KEY,afterRaw);if(storage.getItem(DATA_KEY)!==afterRaw)throw Error('Could not verify programme storage. Reload before training.');
  try{storage.setItem(JOURNAL_KEY,JSON.stringify({...journal,phase:'committed'}))}catch{/* Main-state identity is authoritative after an interrupted journal write. */}
  return clone(preview.next);
 }finally{try{storage.removeItem(LOCK_KEY)}catch{/* Startup recovery inspects stale locks. */}}
}
function recovery(storage){
 const raw=storage.getItem(JOURNAL_KEY);if(!raw){if(storage.getItem(LOCK_KEY))return {status:'review-lock',message:'A programme transaction was interrupted before its journal. Reload after checking that no other LHRF tab is open.'};return {status:'none'}}
 let j,state;try{j=JSON.parse(raw);state=JSON.parse(storage.getItem(DATA_KEY))}catch{return {status:'conflict',message:'Programme transaction is unreadable. Keep the app unchanged and use the verified backup for review.'}}
 const applied=j.id.startsWith('rollback-')?state.programmeActivation?.id===j.id.slice(9)&&state.programmeActivation.status==='rolled-back':state.programmeActivation?.id===j.id&&state.programmeActivation.status==='active';
 return {status:applied?'committed':j.phase==='prepared'?'not-applied':'review',id:j.id,message:applied?'The programme transaction completed. All subsequently recorded training is retained.':'No automatic restoration was attempted. Recheck the current programme and create a fresh preview.'};
}
function clearInterruptedLock(storage){const r=recovery(storage);if(['committed','not-applied','review-lock'].includes(r.status))storage.removeItem(LOCK_KEY);else if(storage.getItem(LOCK_KEY))throw Error('Review the transaction before clearing its lock.');return r}
const api={DATA_KEY,JOURNAL_KEY,LOCK_KEY,LIVE_KEY,canonical,digest,createPackage,verifyPackage,verifyProgrammePayload,validateProgramme,dateOf,weekAt,sessions,calendar,createReplacement,createRollback,verifyPreservation,backupFor,verifyBackupFile,commit,recovery,clearInterruptedLock};
if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFProgrammeReplacement=api;
})(typeof globalThis!=='undefined'?globalThis:this);
