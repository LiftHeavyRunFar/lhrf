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
function mount({getData,commit,parts}){
 const $=id=>document.getElementById(id),make=(tag,text,parent)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(parent)parent.append(e);return e};
 const settings=$('settings'),old=[...settings.children];const header=make('div',null,settings);settings.prepend(header);header.className='ux-intro';make('h2','Settings',header);make('p','Your athlete, training and connected services.',header);
 const section=(id,title,description)=>{const d=make('details',null,settings);d.id=id;d.className='card settings-section';const summary=make('summary',null,d);make('strong',title,summary);make('span',description,summary);return d};
 const athlete=section('settingsAthlete','Athlete profile','Your current goals and training background');
 const preferences=section('settingsPreferences','Training preferences','Priorities, frequency and available days');
 const equipment=section('settingsEquipment','Gym equipment','Confirm what is available at your venue');
 const services=section('settingsServices','Garmin and connected services','Import runs and manage connections');
 const programme=section('settingsProgramme','Programme management','Review configuration, replacement and rollback');
 const backups=section('settingsData','Data, backups and recovery','Export and restore device records');
 const advanced=section('settingsAdvanced','Advanced settings','Technical controls and intentional setup restart');
 const openProgramme=()=>{root.go('settings');programme.open=true;programme.scrollIntoView({block:'start'});};
 root.togglePlanSettings=()=>{openProgramme();$('planAdvanced').open=true};
 const c=getData().customRoadmap||{};make('p',[c.strengthGoal||c.event,c.runningTarget||c.runGoal||c.rungoal,c.trainingAge].filter(Boolean).join(' · ')||'Your profile is stored on this device.',athlete);
 make('p',[c.days?c.days+' training days':'',c.bench!=null?c.bench+' bench sessions':'',c.runs!=null?c.runs+' runs':'',(c.availableDays||[]).join(', ')].filter(Boolean).join(' · ')||'Review your programme to see training preferences.',preferences);
 for(const host of [athlete,preferences]){const b=make('button','Review in programme management',host);b.className='secondary';b.onclick=openProgramme}
 programme.append($('planAdvanced'));$('planAdvanced').querySelector('summary').textContent='Review goals & programme configuration';programme.append($('programmeReplacement'));
 const exportButton=$('exportTrainingData');backups.prepend(exportButton.closest('.card')); // preserve existing export handler and description
 services.append($('garminIncoming'));const recoveryControl=document.querySelector('input[onchange="importBackup(event)"]');if(recoveryControl)backups.append(recoveryControl.closest('.card')); const kit=settings.querySelector('.equipment-panel')||old.find(e=>e.classList.contains('equipment-panel'));if(kit){equipment.append(kit);kit.open=true;kit.querySelector('summary').textContent='Equipment inventory'}
 const account=$('lhrfSettings');if(account){advanced.append(account);account.open=false}
 for(const item of old){if(item.querySelector('#activityFile')){services.append(item);continue}if(item.id==='garminIncoming'||item.id==='programmeReplacement'||item===kit||item.contains(exportButton))continue;if(item.querySelector('#settingsContent')){const b=make('button','Open Garmin & Intervals.icu tools',services);b.className='secondary';b.onclick=()=>root.openRunningTools();item.remove();continue}if(!settings.contains(item))advanced.append(item)}
 const planLink=make('button','Programme management →',$('plan'));planLink.className='secondary';planLink.onclick=openProgramme;
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

}
const api={weekKey,weekComplete,modal,comparable,reference,mount};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFMobileUX=api;
})(typeof globalThis!=='undefined'?globalThis:this);
