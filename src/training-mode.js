/* Presentation only. No workout/data writes, timers or lifecycle replacement. */
(function(root){'use strict';
function mount({getData}){
 const $=id=>document.getElementById(id),getLive=()=>root.LHRFLive?.get?.(),VIEW='lhrf_training_view_v1';
 let currentKey=null,selected=null;
 const key=live=>live.id+'|'+live.started;
 const remember=(live,index)=>{selected=index;try{sessionStorage.setItem(VIEW,JSON.stringify({key:key(live),index}))}catch{}};
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
   currentKey=key(live);selected=null;try{const saved=JSON.parse(sessionStorage.getItem(VIEW)||'null');if(saved?.key===currentKey&&Number.isInteger(saved.index))selected=saved.index}catch{}
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
    const cells=[[ex[3]>0?practical.value:'By RPE',practical.type==='per-hand-kg'?'kg / hand':practical.type==='assistance-kg'?'kg assistance':'kg suggested'],[ex[1]+' × '+ex[2],ex[5]?.doseUnit==='seconds'?'sets × seconds':'sets × reps'],[ex[4],'target RPE']];
    for(const [value,label]of cells){const cell=document.createElement('div'),number=document.createElement('strong'),caption=document.createElement('span');number.textContent=value;caption.textContent=label;cell.append(number,caption);prescription.append(cell)}
    content.prepend(prescription);
   }
   if(!card.dataset.trainingBound){card.dataset.trainingBound='true';card.addEventListener('toggle',()=>{if(!card.isConnected)return;if(card.open)remember(live,index);refresh()})}
  }
  const restored=fresh?cards.find(card=>Number(card.dataset.exerciseIndex)===selected):null;
  let active=cards.find(card=>card.open);
  // Restore the presentation selection once per render, without editing any draft.
  if(restored&&selected!==null){for(const card of cards)card.open=card===restored;active=restored;}
  if(!active&&cards.length){active=cards.find(card=>{const i=Number(card.dataset.exerciseIndex),ex=live.ex[i];return Array.from({length:ex[1]},(_,j)=>!live.entries[i+'_'+j]?.done).some(Boolean)});if(active)active.open=true;}
  refresh();
 }
 const oldGo=root.go;root.go=function(...args){const result=oldGo.apply(this,args);sync();if(args[0]==='train')refresh();return result};
 root.LHRFTrainingMode={mount,render,refresh,sync};render();
}
root.LHRFTrainingMode={mount};
})(typeof globalThis!=='undefined'?globalThis:this);
