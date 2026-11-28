/* Proposed training-start choices. Read-only: no save, activation or max calculation. */
(function(root){'use strict';
const clone=value=>JSON.parse(JSON.stringify(value));
const positive=value=>typeof value==='number'&&Number.isFinite(value)&&value>0;
const day=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
const validSets=value=>Number.isInteger(value)&&value>0;
const setCount=exercises=>exercises.some(ex=>!validSets(ex[1]))?null:exercises.reduce((n,ex)=>n+ex[1],0);
const addCount=(a,b)=>a===null||b===null?null:a+b;
function sessionView(session,loading={}){
 loading=loading&&typeof loading==='object'&&!Array.isArray(loading)?loading:{};
 const original=clone(session),view=clone(session);
 view.ex=(view.ex||[]).map((exercise,index)=>{
  const meta=exercise[5]||{},mode=loading[meta.exerciseId]==='rpe'?'rpe':'prescribed';
  exercise[5]={...meta,loadingMode:mode,originalSuggestedKg:positive(exercise[3])?exercise[3]:null,
   suppressLoadSuggestions:mode==='rpe',requiresActualLoad:true};
  if(mode==='rpe')exercise[3]=0;
  return exercise;
 });
 return {original,view};
}
function review(state,{loading={},introWeeks=0,active=false,returnCondition='unknown',today=''}={}){
 if(![0,1,2].includes(introWeeks))throw Error('Choose zero, one or two introductory strength weeks.');
 const before=clone(state),plans=state.customRoadmap?.cataloguePlans||[],programme=state.reviewedProgramme;
 if(!plans.length||!programme?.weeks?.length)throw Error('Choose a structured programme first.');
 const result={proposalOnly:true,ownerApprovalRequired:true,readiness:'not assessed',runningUnchanged:true,
  introWeeks,loading:clone(loading),blocked:[],weeks:[],resumeWeek:introWeeks+1};
 if(active)result.blocked.push('Finish the active workout or pending run before changing training choices.');
 if(introWeeks&&['pain','illness'].includes(returnCondition))result.blocked.push('Return dose needs a separate pain or illness review.');
 const sources=new Map();
 for(const plan of plans)for(const week of plan.snapshot.weeks)for(const s of week.sessions)
  sources.set(plan.id+'-w'+week.week+'-'+s.id,{week:week.week,plan,source:s});
 const logged=[...(state.completedWorkouts||[]),...(state.sets||[]),...(state.runs||[])];
 const recordId=row=>String(row.parentId||row.sessionId||row.id||'').replace(/::(?:strength|run)$/,'');
 for(const week of programme.weeks){
  const proposed={week:week.week,originalSets:0,proposedSets:0,sessions:[]};
  for(const session of week.sessions){
   const {original,view}=sessionView(session,loading);
   const target=introWeeks>0&&week.week<=introWeeks;
   if(target){
    const source=sources.get(session.catalogueOccurrenceId);
    if(!source||source.week!==week.week||!day(session.scheduledDate)||!day(today)||session.scheduledDate<today)
     result.blocked.push('Opening dates or source week need review; no introductory reduction can be accepted.');
    if(session.eventType||source?.source.kind==='event'||source?.source.id==='race'||
      /taper|deload|easier/i.test(session.phase||'')||source&&
      (source.week>=source.plan.snapshot.durationWeeks-1||
       source.plan.snapshot.id.startsWith('powerlifting')&&[4,8].includes(source.week)))
     result.blocked.push('An event, easier week or taper is protected.');
    if(logged.some(row=>recordId(row)===session.id))result.blocked.push('Completed or partly logged opening work is protected.');
    for(const ex of view.ex||[]){
     if(!validSets(ex[1]))result.blocked.push('An opening exercise has an unknown or invalid working-set count.');
     else ex[1]=Math.max(1,ex[1]-1);
    }
   }
   proposed.originalSets=addCount(proposed.originalSets,setCount(original.ex||[]));
   proposed.proposedSets=addCount(proposed.proposedSets,setCount(view.ex||[]));
   proposed.sessions.push({original,view});
  }
  result.weeks.push(proposed);
 }
 if(introWeeks&&result.weeks.slice(0,introWeeks).some(w=>w.originalSets===w.proposedSets))
  result.blocked.push('No smaller strength dose is available in an opening week; do not call it easier.');
 result.blocked=[...new Set(result.blocked)];
 if(result.blocked.length)for(const w of result.weeks){w.proposedSets=w.originalSets;for(const s of w.sessions)s.view=clone(s.original);}
 const resume=result.weeks.find(w=>w.week===result.resumeWeek);
 result.resumeSets=resume?.originalSets??null;
 if(JSON.stringify(state)!==JSON.stringify(before))throw Error('Read-only review changed training state.');
 return result;
}
function mount({state,active=()=>false}){
 if(root.LHRF_TRAINING_START_REVIEW_TEST!==true)return;
 const host=document.getElementById('settingsProgramme');if(!host||document.getElementById('trainingStartReview'))return;
 const section=document.createElement('details');section.id='trainingStartReview';section.className='entry';
 const summary=document.createElement('summary');summary.textContent='Review next programme start';section.append(summary);
 const note=document.createElement('p');note.textContent='Proposal only. Your programme stays unchanged. Owner and coaching review are required before applying these choices.';section.append(note);
 const controls=document.createElement('div');section.append(controls);const output=document.createElement('div');output.id='trainingStartPreview';output.setAttribute('role','status');
 const selections=new Map();let intro;
 function form(){
  controls.replaceChildren();selections.clear();const current=state();
  const seen=new Map();for(const w of current.reviewedProgramme?.weeks||[])for(const s of w.sessions)for(const ex of s.ex||[])
   if(ex[5]?.exerciseId&&!seen.has(ex[5].exerciseId))seen.set(ex[5].exerciseId,ex[0]);
  for(const [id,name]of seen){const label=document.createElement('label');label.textContent=name;
   const select=document.createElement('select');select.setAttribute('aria-label',name+' loading');select.dataset.exerciseId=id;
   for(const [value,text]of [['prescribed','Prescribed weight'],['rpe','RPE only']])select.add(new Option(text,value));
   label.append(select);controls.append(label);selections.set(id,select);}
  const label=document.createElement('label');label.textContent='Starting option';intro=document.createElement('select');intro.setAttribute('aria-label','Starting option');
  for(const [value,text]of [[0,'Start normally'],[1,'One easier introductory strength week'],[2,'Two easier introductory strength weeks']])intro.add(new Option(text,value));
  label.append(intro);controls.append(label);
 }
 section.addEventListener('toggle',()=>{if(section.open){form();output.replaceChildren();}});
 const preview=document.createElement('button');preview.type='button';preview.textContent='Preview choices';
 preview.onclick=()=>{output.replaceChildren();try{
  const proposal=review(state(),{loading:Object.fromEntries([...selections].map(([id,el])=>[id,el.value])),introWeeks:Number(intro.value),active:active(),today:new Date().toLocaleDateString('en-CA',{timeZone:'Europe/London'})});
  const add=text=>{const p=document.createElement('p');p.textContent=text;output.append(p);};
  add('Readiness is not assessed. Running prescriptions and dates stay unchanged.');
  if(proposal.blocked.length){for(const warning of proposal.blocked)add(warning);return;}
  if(proposal.introWeeks)add('Volume-only strength hypothesis: one fewer working set per exercise, minimum one. Reps, effort and dates are unchanged.');
  for(const week of proposal.weeks.slice(0,Math.max(1,proposal.introWeeks)))add('Week '+week.week+': '+week.originalSets+' → '+week.proposedSets+' strength sets.');
  if(proposal.introWeeks)add('Then resume original week '+proposal.resumeWeek+' ('+proposal.resumeSets+' strength sets). No weeks or events move.');
  for(const session of proposal.weeks[0].sessions)for(let i=0;i<(session.view.ex||[]).length;i++){
   const ex=session.view.ex[i],original=session.original.ex[i],byRpe=ex[5].loadingMode==='rpe';
   add(ex[0]+' · '+ex[1]+' × '+ex[2]+' · RPE '+ex[4]+' · '+(byRpe?'choose weight on the day':positive(ex[3])?ex[3]+' kg suggested':'no saved weight suggestion; choose by RPE')+
    (positive(original[3])&&byRpe?' (original '+original[3]+' kg retained)':''));
  }
 }catch(error){output.textContent=error.message;}};
 const cancel=document.createElement('button');cancel.type='button';cancel.className='secondary';cancel.textContent='Cancel review';cancel.onclick=()=>{output.replaceChildren();section.open=false;};
 section.append(preview,cancel,output);host.append(section);
}
const api={sessionView,review,mount};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFTrainingStartReview=api;
})(typeof globalThis==='object'?globalThis:this);
