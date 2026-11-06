/* Presentation only. No workout/data writes, timers or lifecycle replacement. */
(function(root){'use strict';
function mount({getData}){
 const $=id=>document.getElementById(id),getLive=()=>root.LHRFLive?.get?.(),VIEW='lhrf_training_view_v1';
 let currentKey=null,selected=null;
 const key=live=>live.id+'|'+live.started;
 const remember=(live,index)=>{selected=index;try{sessionStorage.setItem(VIEW,JSON.stringify({key:key(live),index,revision:root.LHRFTrainingFlow.revision(live)}))}catch{}};
 const resume=document.createElement('aside');resume.id='trainingResume';resume.hidden=true;
 const label=document.createElement('span');label.textContent='Workout in progress';const button=document.createElement('button');button.type='button';button.textContent='Resume training';button.onclick=()=>root.go('train');resume.append(label,button);$('appHeader').after(resume);
 function sync(){
  const live=getLive(),active=!!live&&$('train')?.classList.contains('active');
  document.body.dataset.trainingMode=active?'active':live?'away':'idle';resume.hidden=!live||active;
 }
 function refresh(){
  sync();const live=getLive(),header=$('trainingSessionHeader');if(!live||!header)return;

  const total=(live.ex||[]).reduce((n,ex)=>n+(ex[5]?.optional?0:ex[1]),0);
  const requiredDone=Object.entries(live.entries||{}).filter(([k,v])=>v.done&&!live.ex?.[Number(k.split('_')[0])]?.[5]?.optional).length;
  header.querySelector('.live-status').textContent=total?requiredDone+' of '+total+' sets completed':live.runLogged?'Run logged':'Running session';
  const progress=header.querySelector('.live-progress > div');if(progress)progress.style.width=(total?Math.round(requiredDone/total*100):live.runLogged?100:0)+'%';
  for(const card of document.querySelectorAll('#liveExercises > .live-ex')){
   const index=Number(card.dataset.exerciseIndex),ex=live.ex[index],complete=Array.from({length:ex[1]},(_,j)=>live.entries[index+'_'+j]?.done).every(Boolean);
   card.querySelectorAll('.live-set').forEach((row,j)=>{row.querySelector('.set-check')?.setAttribute('aria-pressed',String(!!live.entries[index+'_'+j]?.done));row.querySelectorAll('input[data-field]').forEach(input=>input.setAttribute('aria-label',ex[0]+' set '+(j+1)+' '+input.dataset.field))});
   const suggestions=[];
   card.querySelectorAll('.live-set').forEach((row,j)=>{const entry=live.entries[index+'_'+j],input=row.querySelector('[data-field=weight]'),label=input?.parentElement.querySelector('label');if(!input||!label)return;
    if(!label.dataset.baseLabel)label.dataset.baseLabel=label.textContent.replace(/ · suggested$/,'');
    const suggested=!entry?.done&&entry?.weightHint?.kind==='carry-forward';const caption=label.dataset.baseLabel+(suggested?' · suggested':'');if(label.textContent!==caption)label.textContent=caption;
    if(suggested){input.dataset.suggested='carry-forward';suggestions.push(entry)}else{delete input.dataset.suggested;input.removeAttribute('aria-description')}
   });
   const context=card.querySelector('.weight-carry-hint');if(context&&!suggestions.length)context.remove();
   card.classList.toggle('training-complete',complete);card.classList.toggle('training-active',card.open);
  }
  const active=document.querySelector('#liveExercises > .live-ex[open]'),ex=active&&live.ex[Number(active.dataset.exerciseIndex)];
  const purpose=ex?root.LHRFPerformanceHistory.purpose(ex[5]).value:null;
  header.querySelector('.training-purpose').textContent=purpose?purpose+' practice':live.ex?.length?'Strength training':'Running training';
 }
 function render(){
  sync();const live=getLive(),host=$('liveTrainRoot');if(!live||!host?.firstElementChild)return;
  const cards=[...host.querySelectorAll('#liveExercises > .live-ex')];
  const fresh=currentKey!==key(live);
  if(fresh){
   currentKey=key(live);let saved=null;try{saved=JSON.parse(sessionStorage.getItem(VIEW)||'null')}catch{}selected=root.LHRFTrainingFlow.resumeIndex(live,saved);root.LHRFLive?.selectExercise?.(selected??-1);
  }
  const header=host.firstElementChild;header.id='trainingSessionHeader';
  if(!header.querySelector('.training-leave')){
   // Replace only the existing presentation header; exercise inputs stay in place.
   header.replaceChildren();
   const top=document.createElement('div');top.className='training-topline';
   const mode=document.createElement('span');mode.className='tag';mode.textContent='LHRF / TRAINING MODE';
   const leave=document.createElement('button');leave.type='button';leave.className='secondary training-leave';leave.textContent='Leave & resume';leave.onclick=()=>root.go('today');top.append(mode,leave);
   const title=document.createElement('h2');title.textContent=live.name;
   const purpose=document.createElement('p');purpose.className='training-purpose';
   const count=document.createElement('span');count.className='live-status';
   const bar=document.createElement('div');bar.className='live-progress';bar.append(document.createElement('div'));
   header.append(top,title,purpose,count,bar);
  }
  for(const card of cards){
   const index=Number(card.dataset.exerciseIndex),ex=live.ex[index],content=card.querySelector('.ex-content');
   const heading=card.querySelector('.ex-text strong');if(heading)heading.textContent=ex[0];
   if(!card.querySelector('.training-role')){const role=document.createElement('span');role.className='training-role';role.textContent=[root.LHRFPerformanceHistory.purpose(ex[5]).value,ex[5]?.role==='top'?'Top set':ex[5]?.role==='backoff'?'Back-off':null].filter(Boolean).join(' / ')||'Prescribed work';heading?.before(role)}
   if(!content.querySelector('.training-prescription')){
    const prescription=document.createElement('div');prescription.className='training-prescription';
    const practical=root.LHRFAndroidPolish.loadSuggestion(ex);
    const original=root.LHRFTrainingFlow.originalWeight(live,index);
    const cells=[[original>0?original:'By RPE',practical.type==='per-hand-kg'?'prescribed kg / hand':practical.type==='assistance-kg'?'prescribed kg assistance':'prescribed kg'],[ex[1]+' × '+ex[2],ex[5]?.doseUnit==='seconds'?'sets × seconds':'sets × reps'],[ex[4],'target RPE']];
    for(const [value,label]of cells){const cell=document.createElement('div'),number=document.createElement('strong'),caption=document.createElement('span');number.textContent=value;caption.textContent=label;cell.append(number,caption);prescription.append(cell)}
    content.prepend(prescription);
    if(original!==ex[3]){const guidance=document.createElement('p');guidance.className='working-guidance';guidance.textContent='Current RPE-based back-off suggestion: '+practical.value+' kg. Original prescription remains above.';prescription.after(guidance)}
    let hintShown=false;card.querySelectorAll('.live-set').forEach((row,j)=>{const entry=live.entries[index+'_'+j];if(!entry?.done&&entry?.weightHint?.kind==='carry-forward'){const input=row.querySelector('[data-field=weight]');input.dataset.suggested='carry-forward';input.setAttribute('aria-description','Editable suggestion from recorded set '+entry.weightHint.fromSet);input.parentElement.querySelector('label').textContent+=' · suggested';if(!hintShown){const hint=document.createElement('small');hint.className='weight-carry-hint';hint.textContent='Working suggestion: '+entry.weight+(ex[5]?.loadType==='per-hand-kg'?' kg / hand':ex[5]?.loadType==='assistance-kg'?' kg assistance':' kg')+' · editable';prescription.after(hint);hintShown=true}}});
   }
   if(!card.dataset.trainingBound){card.dataset.trainingBound='true';
    card.querySelector(':scope > summary').addEventListener('click',()=>{const current=getLive();if(!card.isConnected||!current||card.open)return;host.querySelectorAll('#liveExercises > .live-ex').forEach(other=>{if(other!==card)other.open=false});root.LHRFLive?.selectExercise?.(index);remember(current,index);requestAnimationFrame(refresh)});
    card.addEventListener('toggle',()=>{if(!card.isConnected)return;if(card.open)remember(getLive()||live,index);refresh()});
   }
  }
  const restored=fresh?cards.find(card=>Number(card.dataset.exerciseIndex)===selected):null;
  let active=cards.find(card=>card.open);
  // Restore the presentation selection once per render, without editing any draft.
  if(restored&&selected!==null){for(const card of cards)card.open=card===restored;active=restored;}
  if(fresh&&selected===null&&live.trainingView?.exerciseIndex===-1&&cards.every(card=>root.LHRFTrainingFlow.complete(live,Number(card.dataset.exerciseIndex)))){cards.forEach(card=>card.open=false);active=null;}
  if(fresh&&!active&&cards.length&&live.trainingView?.exerciseIndex!==-1){active=cards.find(card=>{const i=Number(card.dataset.exerciseIndex),ex=live.ex[i];return Array.from({length:ex[1]},(_,j)=>!live.entries[i+'_'+j]?.done).some(Boolean)});if(active)active.open=true;}
  refresh();
 }
 function revealNext(index){
  const live=getLive(),card=[...document.querySelectorAll('#liveExercises > .live-ex')].find(c=>Number(c.dataset.exerciseIndex)===index);if(!live||!card)return;
  remember(live,index);
  requestAnimationFrame(()=>{if(!card.isConnected||!card.open)return;const row=[...card.querySelectorAll('.live-set')].find(r=>!r.querySelector('.set-check.checked'))||card;
   const box=row.getBoundingClientRect(),height=root.visualViewport?.height||root.innerHeight,bottom=height-90;
   const delta=box.bottom>bottom?box.bottom-bottom:box.top<20?box.top-20:0;
   if(Math.abs(delta)>1)root.scrollBy({top:delta,behavior:'instant'});
  });
 }
 const oldGo=root.go;root.go=function(...args){const result=oldGo.apply(this,args);sync();if(args[0]==='train')refresh();return result};
 root.LHRFTrainingMode={mount,render,refresh,sync,revealNext};render();
}
root.LHRFTrainingMode={mount};
})(typeof globalThis!=='undefined'?globalThis:this);
