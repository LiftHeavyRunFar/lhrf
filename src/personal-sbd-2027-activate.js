/* Owner 2027 programme installation through EXISTING reviewed replacement gate.
   No reset, no onboarding, and never writes without verified download + explicit confirmation.
   The owner-only plan is shown for every week even if installation is refused. */
(function(root){'use strict';
const DATA_KEY='lhrf_beta_v1118_clean';
const historyFields=['sets','runs','plannedRuns','checkins','completedWorkouts','decisions','sessionFeedback','weeklyCheckins','weeklyReviews','programmeArchive','programmeReplacementHistory'];
function withoutHistory(source){
 const next=JSON.parse(JSON.stringify(source||{}));
 for(const field of historyFields)next[field]=[];
 next.overrides={};
 for(const field of ['customRoadmap','activeSchedule','activeCustomWeek','reviewedProgramme','programmeActivation','strengthEvidenceReview','garminSync','eventRecoveryDecisions','readinessDay','block','_backup','activeWorkout','liveWorkout','pendingRun','workoutHistory','trainingHistory','garminRecords','garminActivities'])delete next[field];
 return next;
}
function cleanState(source,{owner,builder,training,registry,gym,now}){
 const next=withoutHistory(source),inventory=source.equipmentInventory||source.customRoadmap?.equipmentInventory;
 const programme=builder.buildProgramme(owner.snapshots(),null,{training,registry,gym,inventory,equipment:[],now,protectedWeek:()=>false});
 const replacement=typeof module==='object'&&module.exports?require('./programme-replacement'):root.LHRFProgrammeReplacement;
 replacement.validateProgramme(programme);
 const id=programme.config.programmeId,week=Math.min(13,Math.max(1,replacement.weekAt(programme.config,now.slice(0,10))));
 next.onboardingComplete=true;next.equipmentInventory=inventory;next.customRoadmap=programme.config;
 next.activeCustomWeek=week;next.activeSchedule=JSON.parse(JSON.stringify(programme.weeks[week-1].sessions));
 next.reviewedProgramme={id,config:programme.config,weeks:programme.weeks};
 next.programmeActivation={id,at:now,status:'active',cleanStart:true};
 return next;
}
function clearAndInstall(local,session,selectedKey,next,{expectedRaw,confirmed=false}={}){
 if(!confirmed)throw Error('Confirm deleting previous training before starting fresh.');
 if(local.getItem(selectedKey)!==expectedRaw)throw Error('Training changed in another tab. Reload before starting fresh.');
 const historyKey=/^(?:competition:)?(?:lhrf_fresh_beta_live_v1114(?:_pendingRun)?|lhrf-v2-(?:genuine-training-log|coach-decisions|approved-load-overrides|live-handoff)|lhrf_replacement_backup_v1:.*|lhrf_programme_replacement_(?:transaction|lock)_v1|lhrf-catalogue-preview-v1|lhrf_training_view_v1|lhrf_onboarding_test_last_tab_v194|lhrf_pending_programme)$/;
 const changes=[];
 for(const store of [local,session])for(let i=0;i<store.length;i++){
  const key=store.key(i),value=store.getItem(key);
  if(historyKey.test(key))changes.push({store,key,before:value,after:null});
  else if(store===local&&(key===DATA_KEY||key==='competition:'+DATA_KEY)&&key!==selectedKey){
   const clean=withoutHistory(JSON.parse(value));clean.activeSchedule=[];clean.onboardingComplete=false;
   changes.push({store,key,before:value,after:JSON.stringify(clean)});
  }
 }
 changes.unshift({store:local,key:selectedKey,before:expectedRaw,after:JSON.stringify(next)});
 try{
  for(const change of changes){if(change.after===null)change.store.removeItem(change.key);else change.store.setItem(change.key,change.after);
   if(change.store.getItem(change.key)!==change.after)throw Error('Could not verify the clean programme save.');}
 }catch(error){
  for(const change of [...changes].reverse())try{if(change.before===null)change.store.removeItem(change.key);else change.store.setItem(change.key,change.before)}catch{}
  throw error;
 }
 return next;
}
function mount(host){
 const owner=root.LHRFPersonalSBD2027,training=root.LHRFCatalogueTraining,
   builder=root.LHRFNativeCatalogue,replacement=root.LHRFProgrammeReplacement;
 if(!host||!owner||!training||!builder||!replacement)return;
 const storage=root.LHRFStorage.local;
 const status=document.createElement('p');status.setAttribute('role','status');status.className='muted small';status.id='ownerActivationStatus';
 const button=document.createElement('button');button.type='button';button.textContent='Use this programme in my workouts';
 const area=document.createElement('div');area.className='entry';area.hidden=true;
 host.append(button,area,status);
 const freshButton=document.createElement('button');freshButton.type='button';freshButton.id='ownerCleanStart';
 freshButton.textContent='Delete old training and start my programme';
 const cleanNote=document.createElement('p');cleanNote.className='muted small';
 cleanNote.textContent='Start with empty training history. Old workouts, runs and unfinished drafts will be deleted. Your settings and connections stay.';
 host.prepend(freshButton,cleanNote);
 if(new URLSearchParams(root.location.search).get('clean')==='1')button.hidden=true;
 freshButton.onclick=()=>{
  if(!root.confirm('Delete all previous workout logs, runs, check-ins and unfinished drafts on this device, then start the 13-week programme? Your settings and connections stay.'))return;
  freshButton.disabled=true;
  try{
   if(root.LHRFExternalStorageChanged?.())throw Error('Training changed in another tab. Reload before starting fresh.');
   const key=root.LHRFStorage.key(DATA_KEY),raw=root.localStorage.getItem(key),source=raw?JSON.parse(raw):{};
   const next=cleanState(source,{owner,builder,training,registry:root.LHRFExercises,gym:root.LHRFGymEquipment,now:new Date().toISOString()});
   clearAndInstall(root.localStorage,root.sessionStorage,key,next,{expectedRaw:raw,confirmed:true});
   const target=new URL(root.location.href);target.searchParams.delete('clean');target.searchParams.set('owner','2027');
   root.location.replace(target.href);
  }catch(error){msg(error.message);freshButton.disabled=false}
 };
 let preview=null,backup=null,raw=null,verified=false,seal=null;
 const msg=text=>{status.textContent=text};
 const fail=error=>{msg(error?.message||String(error));button.disabled=false};
 const block=()=>Boolean(root.LHRFLive?.get?.()) ||
   Boolean(storage.getItem(replacement.LIVE_KEY+'_pendingRun')) ||
   Boolean(storage.getItem(replacement.LIVE_KEY));
 const fresh=()=>{if(root.LHRFExternalStorageChanged?.())throw Error('Another app tab changed training data. Reload before making a programme change.');
   if(block())throw Error('Finish your active workout and pending run before changing programmes.');
   const value=storage.getItem(replacement.DATA_KEY);
   if(!value)throw Error('Your existing athlete record was not found. No data has been changed.');
   const state=JSON.parse(value);
   if(!state.onboardingComplete||!state.customRoadmap)throw Error('Existing training data needs review before safe activation. No fresh onboarding is required.');
   return {value,state};
 };
 const build=(state,now)=>{
   const plans=owner.snapshots(),registry=root.LHRFExercises,gym=root.LHRFGymEquipment;
   const candidate=builder.buildProgramme(plans,null,{
     training,registry,gym,inventory:state.equipmentInventory||state.customRoadmap?.equipmentInventory,
     equipment:[],now,protectedWeek:()=>false
   });
   candidate.config.preStartActivation='reviewed-future-only';
   replacement.validateProgramme(candidate);
   return candidate;
 };
 button.onclick=async()=>{
   button.disabled=true;area.replaceChildren();area.hidden=true;preview=null;backup=null;raw=null;verified=false;
   try{
     const {value,state}=fresh(),now=new Date().toISOString(),programme=build(state,now);
     const packet=await replacement.createPackage(programme,state,{reviewedCommit:'owner-sbd-2027-13-weeks',
       approvalContext:['Owner-requested personal meet programme: 2026-11-28','No required Saturday run']});
     const result=replacement.createReplacement(state,packet,root.LHRFCoach,{now});
     if(result.alreadyApplied){msg('This exact programme is already installed. Nothing was changed.');return;}
     raw=value;preview=result;
     const future=result.rows.filter(x=>x.after.some(s=>!s.preservedFromProgrammeId)).length;
     const summary=document.createElement('p');summary.textContent='Ready to replace '+future+
       ' future training dates. Existing completed workouts and historical dates remain protected. This plan starts 30 November and finishes at the 27 February meet.';
     area.append(summary);
     const first=document.createElement('button');first.type='button';first.textContent='1. Save my training backup';
     const second=document.createElement('label');second.textContent='2. Verify the downloaded backup ';
     const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.disabled=true;second.append(input);
     const confirmLabel=document.createElement('label');
     const agree=document.createElement('input');agree.type='checkbox';confirmLabel.append(agree,document.createTextNode(' I approve replacing only future workouts with this 13-week programme.'));
     const commit=document.createElement('button');commit.type='button';commit.textContent='3. Activate my programme';commit.disabled=true;
     area.append(first,second,confirmLabel,commit);area.hidden=false;
     const valid=()=>{commit.disabled=!(verified&&agree.checked)};
     agree.onchange=valid;
     first.onclick=async()=>{
       try{
         const current=fresh();
         if(current.value!==raw)throw Error('Training changed. Start again with a fresh programme review.');
         verified=false;valid();
         backup=await replacement.backupFor(current.state,storage,root.LHRFTrainingBackup,new Date().toISOString());
         const blob=new Blob([backup.text],{type:'application/json'}),link=root.URL.createObjectURL(blob);
         const a=document.createElement('a');a.href=link;a.download='lhrf-before-dec2026-meet-plan.json';document.body.append(a);a.click();a.remove();
         root.setTimeout(()=>root.URL.revokeObjectURL(link),60000);
         input.disabled=false;verified=false;valid();msg('Backup prepared for download. Select that saved file to verify it.');
       }catch(e){msg(e.message)}
     };
     input.onchange=async()=>{
       try{
         verified=false;valid();if(!backup||!input.files?.[0])return;
         if(input.files[0].size>25*1024*1024)throw Error('Backup file too large.');
         await replacement.verifyBackupFile(await input.files[0].text(),backup);
         verified=true;valid();msg('Downloaded training backup verified. You can activate your programme.');
       }catch(e){msg(e.message)}
     };
     commit.onclick=()=>{
       commit.disabled=true;
       try{
         const now=new Date().toISOString();
         const current=fresh();
         if(current.value!==raw)throw Error('Training changed. Start again with a fresh programme review.');
         const next=replacement.commit(storage,preview,{expectedRaw:raw,backup,backupVerified:verified,
           confirmed:agree.checked,now});
         if(!next?.reviewedProgramme?.weeks?.length)throw Error('The new programme was not confirmed in the training record.');
         root.location.reload();
       }catch(e){msg(e.message);valid()}
     };
     msg('Review the dated 13 weeks above. Nothing has been changed yet.');
   }catch(e){fail(e)}
   finally{button.disabled=false}
 };
}
const api={mount,withoutHistory,cleanState,clearAndInstall};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFPersonalSBDActivation=api;
})(globalThis);
