/* Presentation helpers. No prescription generation or storage migration. */
(function(root){'use strict';
function weekKey(state){const c=state.customRoadmap||{};return [state.reviewedProgramme?.fingerprint||c.programmeId||c.startDate||'programme',c.startDate||'',Number(state.activeCustomWeek||1)].join('|')}
function weekComplete(state,parts=x=>[x]){const sessions=(state.activeSchedule||[]).flatMap(parts);return sessions.length>0&&sessions.every(s=>(state.completedWorkouts||[]).some(w=>Number(w.week||1)===Number(s.sourceProgrammeWeek||state.activeCustomWeek||1)&&(w.id===s.id||w.id===s.parentId)))}
let closeModal=null;
function modal(dialog){
 if(closeModal)closeModal();
 const previous=document.activeElement,scrollY=root.scrollY,scrollX=root.scrollX,bodyStyle=document.body.getAttribute('style'),siblings=[...document.body.children].filter(e=>e!==dialog&&!['SCRIPT','STYLE','LINK'].includes(e.tagName)).map(e=>[e,e.inert]);
 dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label',dialog.querySelector('h2')?.textContent||'Workout preview');dialog.tabIndex=-1;dialog.classList.add('workout-dialog');
 document.body.style.position='fixed';document.body.style.top=-scrollY+'px';document.body.style.left='0';document.body.style.right='0';document.body.style.overflow='hidden';siblings.forEach(([e])=>e.inert=true);
 const nativeRemove=dialog.remove.bind(dialog);let closed=false;
 const close=()=>{if(closed)return;closed=true;observer.disconnect();document.removeEventListener('keydown',keys,true);siblings.forEach(([e,value])=>e.inert=value);if(bodyStyle===null)document.body.removeAttribute('style');else document.body.setAttribute('style',bodyStyle);root.scrollTo({left:scrollX,top:scrollY,behavior:'instant'});if(previous?.isConnected)previous.focus({preventScroll:true});closeModal=null};
 const keys=e=>{if(e.key==='Escape'){e.preventDefault();dialog.remove();return}if(e.key!=='Tab')return;const focusable=[...dialog.querySelectorAll('button,a[href],input,select,textarea,summary,[tabindex="0"]')].filter(e=>!e.disabled&&e.getClientRects().length);const first=focusable[0]||dialog,last=focusable.at(-1)||dialog;if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){e.preventDefault();last.focus()}else if(!e.shiftKey&&(document.activeElement===last||!dialog.contains(document.activeElement))){e.preventDefault();first.focus()}};
 const observer=new MutationObserver(()=>{if(!dialog.isConnected)close()});observer.observe(document.body,{childList:true});dialog.remove=()=>{close();nativeRemove()};document.addEventListener('keydown',keys,true);closeModal=close;requestAnimationFrame(()=>{if(dialog.isConnected)dialog.focus({preventScroll:true})});
}
function comparable(state,live,history){
 const week=Number(live.sourceProgrammeWeek||state.activeCustomWeek||1),main=live.ex?.find(e=>!e[5]?.optional),identity=e=>String(e.exerciseId||e.exercise||'').toLowerCase().replace(/[^a-z0-9]/g,'');
 if(week<=1)return null;
 return history.filter(row=>Number(row.week||row.sets[0]?.week||row.runs[0]?.week||0)===week-1&&((row.day&&row.day===live.day)||(row.id&&row.id===live.id)||(row.name&&row.name===live.name))&&
  (main?row.sets.some(s=>identity(s)===identity({exerciseId:main[5]?.exerciseId,exercise:main[0]})&&(!main[5]?.role||s.role===main[5].role)&&(!main[5]?.loadType||s.loadType===main[5].loadType)&&(!main[5]?.variantId||s.variantId===main[5].variantId)):row.runs.some(r=>!live.runs?.[0]?.role||r.type===live.runs[0].role)))
 .sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0]||null;
}
function reference(host,live,state){
 host.querySelector('#previousWorkout')?.remove();const detail=document.createElement('details');detail.className='card previous-workout';detail.id='previousWorkout';const summary=document.createElement('summary');summary.textContent="Last week's comparable workout";detail.append(summary);
 const make=(tag,text)=>{const el=document.createElement(tag);el.textContent=text;detail.append(el);return el},row=comparable(state,live,root.LHRFTrainingReview.history(state));
 if(!row)make('p','No comparable recorded session from last week.');else{make('p',new Date(row.date).toLocaleDateString('en-GB')+' · '+row.name+' · Recorded work');for(const s of row.sets)make('p',s.exercise+' · set '+(s.set??'—')+' · '+(s.weight??'—')+(s.loadType==='per-hand-kg'?' kg / hand':s.loadType==='assistance-kg'?' kg assistance':' kg')+' × '+(s.reps??'—')+(s.doseUnit==='seconds'?' seconds':' reps')+' · RPE '+(s.rpe??'—'));for(const r of row.runs)make('p',root.LHRFRunPresentation.distance(r.km)+' · '+root.LHRFRunPresentation.duration(r.min)+(r.rpe!=null?' · RPE '+r.rpe:''));for(const note of new Set([row.notes,...row.sets.map(s=>s.notes),...row.runs.map(r=>r.notes||r.note)].filter(Boolean)))make('p',note)}
 make('small','Reference only. Your current workout inputs stay as entered.');host.firstElementChild.after(detail);
}
function carousel(rail,dots){
 if(!rail||!dots||rail.dataset.paginationReady)return;rail.dataset.paginationReady='true';const cards=[...rail.children];dots.replaceChildren();dots.hidden=cards.length<2;
 const select=index=>{const card=cards[index];if(!card)return;rail.scrollTo({left:rail.scrollLeft+card.getBoundingClientRect().left-rail.getBoundingClientRect().left,behavior:'instant'})};
 cards.forEach((card,i)=>{const button=document.createElement('button');button.type='button';button.className='day-dot';button.setAttribute('aria-label','Upcoming session '+(i+1)+': '+card.innerText.replace(/\s+/g,' '));button.onclick=()=>select(i);dots.append(button)});
 const update=()=>{let index=0,best=Infinity;cards.forEach((card,i)=>{const d=Math.abs(card.getBoundingClientRect().left-rail.getBoundingClientRect().left);if(d<best){best=d;index=i}});[...dots.children].forEach((dot,i)=>{dot.classList.toggle('active',i===index);dot.setAttribute('aria-current',i===index?'true':'false')})};
 rail.addEventListener('scroll',update,{passive:true});rail.addEventListener('keydown',event=>{if(event.target!==rail||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const index=[...dots.children].findIndex(d=>d.getAttribute('aria-current')==='true');select(event.key==='Home'?0:event.key==='End'?cards.length-1:Math.max(0,Math.min(cards.length-1,index+(event.key==='ArrowRight'?1:-1))))});update();
}
function mount({getData,commit,parts}){
 const $=id=>document.getElementById(id),make=(tag,text,parent)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(parent)parent.append(e);return e};
 const settings=$('settings'),nodes={builder:$('planAdvanced'),replacement:$('programmeReplacement'),garmin:$('garminIncoming'),export:$('exportTrainingData'),manual:$('activityFile')?.closest('.card'),account:$('lhrfSettings'),equipmentPanel:settings.querySelector('.equipment-panel'),restore:document.querySelector('input[onchange="importBackup(event)"]')};
 const exportCard=nodes.export.closest('.card'),restoreLabel=nodes.restore?.closest('label'),oldRecovery=nodes.restore?.closest('.card'),clear=oldRecovery?.querySelector('[onclick="clearLog()"]');
 settings.replaceChildren();const header=make('div',null,settings);header.className='ux-intro';make('h2','Settings',header);
 const section=(id,title,description)=>{const d=make('details',null,settings);d.id=id;d.className='card settings-section';const summary=make('summary',null,d);make('strong',title,summary);if(description)make('span',description,summary);return d};
 const programme=section('settingsProgramme','Programme management','Review your plan or prepare a new one');
 const equipment=section('settingsEquipment','Gym equipment','Standard gym included; select specialist kit');
 const services=section('settingsServices','Garmin and connected services','Import and link recorded runs');
 const backups=section('settingsData','Data and backups','Download a backup or restore this device');
 const advanced=section('settingsAdvanced','Advanced settings','Recovery and technical controls');
 const recovery=make('details',null,advanced);recovery.id='advancedRecovery';make('summary','Advanced recovery',recovery);recovery.append(nodes.replacement);
 advanced.append(nodes.builder);nodes.builder.hidden=true;
 if(nodes.account){advanced.append(nodes.account);nodes.account.hidden=true;}
 const openProgramme=()=>{root.go('settings');programme.open=true;programme.scrollIntoView({block:'start'})};root.togglePlanSettings=openProgramme;
 const reviewButton=make('button','Review current programme',programme);reviewButton.id='reviewCurrentProgramme';reviewButton.className='secondary';
 const startButton=make('button','Start a new programme',programme);startButton.id='startNewProgramme';
 const overview=make('section',null,programme);overview.id='currentProgrammeReview';overview.hidden=true;
 reviewButton.onclick=()=>{overview.replaceChildren();overview.hidden=!overview.hidden;if(overview.hidden)return;const state=getData(),c=state.customRoadmap||{};make('h3','Current programme',overview);make('p',[c.strengthGoal||c.event,c.priority?c.priority+' priority':'',c.runGoal||c.rungoal].filter(Boolean).join(' · ')||'No active programme saved.',overview);make('p','Week '+(state.activeCustomWeek||1)+' of '+(c.weeks||'—')+' · '+(c.availableDays||state.onboardingDraftDays||[]).join(', '),overview);for(const s of state.activeSchedule||[]){const card=make('details',null,overview);card.className='entry';make('summary',s.day+' · '+s.name,card);for(const e of s.ex||[])make('p',e[0]+' · '+e[1]+' × '+e[2]+' · '+(e[3]>0?e[3]+' kg':'load by RPE')+' · RPE '+e[4],card);for(const r of s.runs||[])make('p',r.name+' · '+(r.distanceKm?r.distanceKm.toFixed(2)+' km':r.minutes+' min')+' · '+(r.pace||'follow prescribed effort'),card)}make('small','Read only. Reviewing this plan does not generate or change workouts.',overview)};
 startButton.onclick=()=>{if(root.LHRFStartNewProgramme)root.LHRFStartNewProgramme();else alert('Programme setup is unavailable in this cached version. Reopen when online.')};
 const generated=make('section',null,programme);generated.id='generatedProgrammeReview';generated.hidden=true;
 services.append(nodes.garmin);nodes.garmin.querySelector('h2').textContent='Garmin';nodes.garmin.querySelector('p').textContent='Review recorded runs before saving or linking them to planned sessions.';$('garminImportOpen').textContent='Import Garmin runs';
 const serviceAdvanced=make('details',null,services);serviceAdvanced.id='garminAdvanced';make('summary','Advanced imports and connections',serviceAdvanced);if(nodes.manual)serviceAdvanced.append(nodes.manual);const tools=make('button','Connected workout tools',serviceAdvanced);tools.className='secondary';tools.onclick=()=>root.openRunningTools();
 nodes.export.textContent='Download backup';exportCard.querySelector('h2').textContent='Backups';exportCard.querySelector('p').textContent='Keep a safe copy before changing devices. Connection credentials are excluded.';backups.append(exportCard);
 if(restoreLabel){for(const node of [...restoreLabel.childNodes])if(node.nodeType===3)node.textContent='Restore from backup ';backups.append(restoreLabel);}
 const inventoryRecovery=make('details',null,recovery);make('summary','Equipment recovery',inventoryRecovery);make('p','Existing explicit missing-equipment choices and load identities are retained. Reset ordinary equipment only when it is genuinely available.',inventoryRecovery);
 const resetGym=make('button','Use standard commercial gym defaults',inventoryRecovery);resetGym.className='secondary';resetGym.onclick=()=>{if(root.LHRFLive?.get?.()){alert('Finish the active workout first.');return}if(!confirm('Confirm ordinary commercial gym equipment is available. Specialist selections and load identities will be retained.'))return;const next=JSON.parse(JSON.stringify(getData())),raw=next.equipmentInventory||next.customRoadmap?.equipmentInventory;next.equipmentInventory=LHRFGymEquipment.effective(raw,LHRFExercises.exercises,LHRFExercises.equipment);for(const key of LHRFGymEquipment.standard)next.equipmentInventory.items[key]='available';if(commit(next))root.LHRFRefreshEquipmentForms?.()};
 const legacy=(getData().activeSchedule||[]).flatMap(s=>s.ex||[]).map(e=>LHRFExercises.resolve(e[0])).filter(e=>e?.setup==='execution-review');for(const e of [...new Map(legacy.map(e=>[e.id,e])).values()]){const confirmSetup=make('button','Review '+e.label+' setup',inventoryRecovery);confirmSetup.className='secondary';confirmSetup.onclick=()=>{if(root.LHRFLive?.get?.())return alert('Finish the active workout first.');if(!confirm('Confirm this saved exercise uses the prescribed cable/rope execution and kg load convention. If your execution differs, cancel and request a programme review.'))return;const next=JSON.parse(JSON.stringify(getData())),raw=next.equipmentInventory||next.customRoadmap?.equipmentInventory;next.equipmentInventory=LHRFGymEquipment.effective(raw,LHRFExercises.exercises,LHRFExercises.equipment);next.equipmentInventory.setups[e.id]=e.setup;commit(next)}}
 if(clear){clear.textContent='Clear training data';recovery.append(clear);}if(oldRecovery)oldRecovery.remove();document.querySelector('#progressDetails .foot')?.remove();
 // Its event handlers and explicit selections must survive the layout change.
 const equipmentPanel=nodes.equipmentPanel||root.LHRFEquipmentPanel;if(equipmentPanel){equipment.append(equipmentPanel);equipmentPanel.open=true;equipmentPanel.querySelector('summary').textContent='Specialist equipment'}else make('p','Reopen online to finish updating equipment controls.',equipment)
 // Keep the original weekly questions and commit path; give them a discoverable home.
 const checkin=$('weeklyCheckin'),checkDetails=make('details',null,$('today'));checkDetails.id='weeklyRecovery';checkDetails.className='card';make('summary','Weekly check-in & recovery',checkDetails);checkDetails.append(checkin);
 const history=make('details',null,checkin);make('summary','Previous check-ins',history);
 const reopen=()=>{root.go('today');checkDetails.open=true;checkDetails.scrollIntoView({block:'start'});checkDetails.querySelector('select')?.focus({preventScroll:true})};
 root.LHRFMobileUX.openRecovery=reopen;
 const progressLink=make('button','Weekly check-in & recovery',$('progress'));progressLink.className='secondary';progressLink.onclick=reopen;
 const banners=[$('today'),$('train')].map(host=>{const box=make('aside',null,host);box.className='card weekly-prompt';box.setAttribute('aria-live','polite');return box});
 function render(){const state=getData(),key=weekKey(state),complete=weekComplete(state,parts),latest=(state.weeklyCheckins||[]).some(x=>x.programmeWeekKey===key),handled=state.uxWeeklyPrompts?.[key];
  for(const box of banners){box.replaceChildren();box.hidden=!complete||latest||!!handled;if(box.hidden)continue;make('h3','Week complete. How are you recovering?',box);const review=make('button','Weekly check-in',box);review.onclick=reopen;for(const [value,label]of [['deferred','Later'],['dismissed','Dismiss']]){const b=make('button',label,box);b.className='secondary';b.onclick=()=>{const next=JSON.parse(JSON.stringify(getData()));next.uxWeeklyPrompts={...next.uxWeeklyPrompts,[key]:value};if(commit(next))render()}}}
  history.querySelectorAll('p').forEach(e=>e.remove());for(const row of [...(state.weeklyCheckins||[])].reverse()){make('p',new Date(row.date).toLocaleDateString('en-GB')+' · fatigue '+row.fatigue+' · soreness '+row.soreness+' · discomfort '+row.discomfort+(row.notes?' · '+row.notes:''),history)}
 }
 const refresh=root.refresh;root.refresh=function(){refresh();render()};render();
 const oldGo=root.go;root.go=function(id){oldGo(id);if(id==='today'||id==='train')render()};
 carousel($('upcomingSessions'),$('upcomingDots'));
 const restored=root.LHRFLive?.get?.();if(restored)reference($('liveTrainRoot'),restored,getData());

}
const api={weekKey,weekComplete,modal,comparable,reference,carousel,mount};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFMobileUX=api;
})(typeof globalThis!=='undefined'?globalThis:this);
