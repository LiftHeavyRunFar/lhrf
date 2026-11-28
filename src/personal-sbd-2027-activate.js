/* Owner 2027 programme installation through EXISTING reviewed replacement gate.
   No reset, no onboarding, and never writes without verified download + explicit confirmation.
   The owner-only plan is shown for every week even if installation is refused. */
(function(root){'use strict';
function mount(host){
 const owner=root.LHRFPersonalSBD2027,training=root.LHRFCatalogueTraining,
   builder=root.LHRFNativeCatalogue,replacement=root.LHRFProgrammeReplacement;
 if(!host||!owner||!training||!builder||!replacement)return;
 const status=document.createElement('p');status.setAttribute('role','status');status.className='muted small';
 const button=document.createElement('button');button.type='button';button.textContent='Use this programme in my workouts';
 const area=document.createElement('div');area.className='entry';area.hidden=true;
 host.append(button,area,status);
 let preview=null,backup=null,raw=null,verified=false,seal=null;
 const msg=text=>{status.textContent=text};
 const fail=error=>{msg(error?.message||String(error));button.disabled=false};
 const block=()=>Boolean(root.LHRFLive?.get?.()) ||
   Boolean(root.localStorage.getItem(replacement.LIVE_KEY+'_pendingRun')) ||
   Boolean(root.localStorage.getItem(replacement.LIVE_KEY));
 const fresh=()=>{if(root.LHRFExternalStorageChanged?.())throw Error('Another app tab changed training data. Reload before making a programme change.');
   if(block())throw Error('Finish your active workout and pending run before changing programmes.');
   const value=root.localStorage.getItem(replacement.DATA_KEY);
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
         backup=await replacement.backupFor(current.state,root.localStorage,root.LHRFTrainingBackup,new Date().toISOString());
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
         const next=replacement.commit(root.localStorage,preview,{expectedRaw:raw,backup,backupVerified:verified,
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
const api={mount};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFPersonalSBDActivation=api;
})(globalThis);
