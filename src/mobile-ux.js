/* Presentation helpers. No prescription generation or storage migration. */
(function(root){'use strict';
function weekKey(state){const c=state.customRoadmap||{};return [state.reviewedProgramme?.fingerprint||c.programmeId||c.startDate||'programme',c.startDate||'',Number(state.activeCustomWeek||1)].join('|')}
function weekCompletion(...args){return (typeof module==='object'&&module.exports?require('./android-polish'):root.LHRFAndroidPolish).weekCompletion(...args)}
function weekComplete(state,parts=x=>[x]){const counts=weekCompletion(state,parts);return counts.planned>0&&counts.completed===counts.planned}

let closeModal=null;
function modal(dialog,onDismiss){
 if(closeModal)closeModal();
 const previous=document.activeElement,scrollY=root.scrollY,scrollX=root.scrollX,bodyStyle=document.body.getAttribute('style'),siblings=[...document.body.children].filter(e=>e!==dialog&&!['SCRIPT','STYLE','LINK'].includes(e.tagName)).map(e=>[e,e.inert]);
 dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label',dialog.querySelector('h2')?.textContent||'Workout preview');dialog.tabIndex=-1;dialog.classList.add('workout-dialog');
 document.body.style.position='fixed';document.body.style.top=-scrollY+'px';document.body.style.left='0';document.body.style.right='0';document.body.style.overflow='hidden';siblings.forEach(([e])=>e.inert=true);
 const nativeRemove=dialog.remove.bind(dialog);let closed=false;
 const close=()=>{if(closed)return;closed=true;observer.disconnect();document.removeEventListener('keydown',keys,true);siblings.forEach(([e,value])=>e.inert=value);if(bodyStyle===null)document.body.removeAttribute('style');else document.body.setAttribute('style',bodyStyle);root.scrollTo({left:scrollX,top:scrollY,behavior:'instant'});if(previous?.isConnected)previous.focus({preventScroll:true});closeModal=null;if(!dialog.isConnected)onDismiss?.()};
 const keys=e=>{if(e.key==='Escape'){e.preventDefault();dialog.remove();return}if(e.key!=='Tab')return;const focusable=[...dialog.querySelectorAll('button,a[href],input,select,textarea,summary,[tabindex="0"]')].filter(e=>!e.disabled&&e.getClientRects().length);const first=focusable[0]||dialog,last=focusable.at(-1)||dialog;if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){e.preventDefault();last.focus()}else if(!e.shiftKey&&(document.activeElement===last||!dialog.contains(document.activeElement))){e.preventDefault();first.focus()}};
 const observer=new MutationObserver(()=>{if(!dialog.isConnected)close()});observer.observe(document.body,{childList:true});dialog.remove=()=>{nativeRemove();close()};document.addEventListener('keydown',keys,true);closeModal=close;requestAnimationFrame(()=>{if(dialog.isConnected&&!dialog.contains(document.activeElement))dialog.focus({preventScroll:true})});
}
function previousReferences(state,live,history){return (typeof module==='object'&&module.exports?require('./performance-history'):root.LHRFPerformanceHistory).references(state,live,history)}
function comparable(state,live,history){return previousReferences(state,live,history)[0]?.row||(typeof module==='object'&&module.exports?require('./performance-history'):root.LHRFPerformanceHistory).previousRun(live,history)}
function exerciseReference(ex,live,state){
 const model=root.LHRFPerformanceHistory,history=root.LHRFTrainingReview.history(state),ref=model.references(state,{...live,ex:[ex]},history)[0];
 const box=document.createElement('aside');box.className='exercise-history';box.setAttribute('aria-label','Previous performance for '+ex[0]);
 const make=(tag,text,parent=box)=>{const node=document.createElement(tag);node.textContent=text;parent.append(node);return node};
 const current=model.purpose(ex[5]).value,name=ex[0].toLowerCase();
 if(!ref){make('p','No reliable previous '+(current?current+' ':'')+name+' performance.').className='history-title';return box;}
 const date=new Date(ref.date+'T12:00:00Z'),label=ref.samePurpose?'Previous '+ref.purpose.value+' '+name:'Alternative '+(ref.purpose.value?ref.purpose.value+' ':'')+name;
 make('p',label+' — '+date.toLocaleDateString('en-GB',{day:'numeric',month:'long'})).className='history-title';
 if(ref.alternative)make('small',current&&ref.purpose.value?'Different training purpose; contextual reference only.':'Training purpose is unconfirmed; contextual reference only.').className='history-caution';
 const units=s=>s.loadType==='per-hand-kg'?' kg / hand':s.loadType==='assistance-kg'?' kg assistance':' kg';
 const actual=s=>s.weight+units(s)+' × '+s.reps+(s.doseUnit==='seconds'?' seconds':' reps')+' · RPE '+(s.rpe??'not recorded')+(s.role?' · '+s.role:'');
 const groups=new Map();for(const set of ref.sets){const key=actual(set);groups.set(key,(groups.get(key)||0)+1)}
 const selected=[...groups].sort((a,b)=>Number(!/· top$/.test(a[0]))-Number(!/· top$/.test(b[0]))).slice(0,3);
 for(const [text,count]of selected)make('p',(count>1?count+' sets · ':'')+text).className='history-actual';
 const related=ref.sets.filter(s=>!ex[5]?.role||s.role===ex[5].role),different=(related.length?related:ref.sets).some(s=>s.reps!==ex[2]);
 if(different)make('small','Different rep scheme from this prescription; these sets are not directly equivalent.').className='history-caution';
 const all=make('details','');all.className='history-all';make('summary','All recorded sets ('+ref.sets.length+')',all);
 for(const set of ref.sets)make('p','Set '+(set.set??'—')+' · '+actual(set),all);
 for(const note of new Set([ref.row.notes,...ref.sets.map(s=>s.notes)].filter(Boolean)))make('p',note,all);
 const context=make('details','');context.className='history-context';make('summary','Comparison details',context);
 make('p','Recorded '+date.toLocaleDateString('en-GB')+' · Purpose evidence: '+ref.purpose.source+'.',context);
 if(ref.setupMissing)make('p','Legacy record: exact venue/setup was not recorded. Check equipment before comparing.',context);
 if(ref.purpose.ambiguous)make('p','Preserved purpose metadata conflicts; no classification has been assumed.',context);
 make('p','Context only. Follow the current prescription and RPE; entered values are unchanged.',context);
 return box;
}
function reference(host,live,state){
 host.querySelector('#previousWorkout')?.remove();host.querySelectorAll('.exercise-history').forEach(node=>node.remove());
 host.querySelectorAll('#liveExercises > .live-ex').forEach(card=>{const ex=live.ex?.[Number(card.dataset.exerciseIndex)];if(ex)card.querySelector('.ex-content').append(exerciseReference(ex,live,state))});
 if(!live.ex?.length){const row=root.LHRFPerformanceHistory.previousRun(live,root.LHRFTrainingReview.history(state));if(row){const box=document.createElement('details');box.id='previousWorkout';box.className='card';const summary=document.createElement('summary');summary.textContent='Previous recorded run';box.append(summary);for(const run of row.runs){const p=document.createElement('p');p.textContent=new Date(run.date||row.date).toLocaleDateString('en-GB')+' · '+root.LHRFRunPresentation.distance(run.km)+' · '+root.LHRFRunPresentation.duration(run.min);box.append(p)}host.firstElementChild.after(box)}}
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
 const reviewButton=make('button','Review current programme',programme);reviewButton.id='reviewCurrentProgramme';reviewButton.className='secondary';
 const startButton=make('button','Start a new programme',programme);startButton.id='startNewProgramme';
 const overview=make('section',null,programme);overview.id='currentProgrammeReview';overview.hidden=true;
 reviewButton.onclick=()=>{overview.replaceChildren();overview.hidden=!overview.hidden;if(overview.hidden)return;const state=getData(),c=state.customRoadmap||{};make('h3','Current programme',overview);make('p',[c.strengthGoal||c.event,c.priority?c.priority+' priority':'',c.runGoal||c.rungoal].filter(Boolean).join(' · ')||'No active programme saved.',overview);const targets=[c.strengthTarget||Object.entries(c.strengthTargets||{}).map(([lift,kg])=>lift+' '+kg+' kg').join(', '),c.strengthTargetDate,c.runningTarget,c.runningTargetDate].filter(Boolean);if(targets.length)make('p',targets.join(' · '),overview);if(c.trainingAge)make('p','Strength experience: '+(c.trainingAge==='returning'?'Returning after a break':c.trainingAge),overview);make('p',[['Squat',c.squat],['Bench',c.bench],['Deadlift',c.deadlift],['Runs',c.runs]].filter(([,n])=>n!=null).map(([name,n])=>name+' '+n+' / week').join(' · '),overview);make('p','Week '+(state.activeCustomWeek||1)+' of '+(c.weeks||'—')+' · '+(c.availableDays||state.onboardingDraftDays||[]).join(', '),overview);for(const s of state.activeSchedule||[]){const card=make('details',null,overview);card.className='entry';make('summary',s.day+' · '+s.name,card);for(const e of s.ex||[])make('p',e[0]+' · '+e[1]+' × '+e[2]+' · '+(e[3]>0?e[3]+' kg':'load by RPE')+' · RPE '+e[4],card);for(const r of s.runs||[])make('p',r.name+' · '+(r.distanceKm?r.distanceKm.toFixed(2)+' km':r.minutes+' min')+' · '+(r.pace||'follow prescribed effort'),card)}make('small','Read only. Reviewing this plan does not generate or change workouts.',overview)};
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
 const reopen=key=>{root.LHRFWeeklyReviewKey=typeof key==='string'?key:weekKey(getData());root.go('today');checkDetails.open=true;checkDetails.scrollIntoView({block:'start'});checkDetails.querySelector('select')?.focus({preventScroll:true})};
 root.LHRFMobileUX.openRecovery=reopen;checkDetails.querySelector('summary').addEventListener('click',()=>{root.LHRFWeeklyReviewKey=weekKey(getData())});
 const banners=[$('today'),$('train')].map(host=>{const box=make('aside',null,host);box.className='card weekly-prompt';box.setAttribute('aria-live','polite');return box});
 function render(){const state=getData(),current=Number(state.activeCustomWeek||1),weeks=[...new Set([current,...(state.completedWorkouts||[]).map(w=>Number(w.week||1)).filter(w=>w<current)])].sort((a,b)=>b-a);let reviewState=state;
  for(const week of weeks){let sessions=week===current?state.activeSchedule:state.reviewedProgramme?.weeks?.find(w=>w.week===week)?.sessions;if(!sessions&&root.generatedSessions)try{sessions=root.generatedSessions(state.customRoadmap,week)}catch{}const candidate={...state,activeCustomWeek:week,activeSchedule:sessions||[]},k=weekKey(candidate);if(weekComplete(candidate,parts)&&!(state.weeklyCheckins||[]).some(x=>x.programmeWeekKey===k)&&!state.uxWeeklyPrompts?.[k]){reviewState=candidate;break}}
  const key=weekKey(reviewState),complete=weekComplete(reviewState,parts),latest=(state.weeklyCheckins||[]).some(x=>x.programmeWeekKey===key),handled=state.uxWeeklyPrompts?.[key];
  for(const box of banners){box.replaceChildren();box.hidden=!complete||latest||!!handled;if(box.hidden)continue;make('h3','Week complete. How are you recovering?',box);const review=make('button','Weekly check-in',box);review.onclick=()=>reopen(key);for(const [value,label]of [['deferred','Later'],['dismissed','Dismiss']]){const b=make('button',label,box);b.className='secondary';b.onclick=()=>{const next=JSON.parse(JSON.stringify(getData()));next.uxWeeklyPrompts={...next.uxWeeklyPrompts,[key]:value};if(commit(next))render()}}}
  history.querySelectorAll('p,button').forEach(e=>e.remove());for(const [k,value]of Object.entries(state.uxWeeklyPrompts||{})){if(value==='deferred'&&!(state.weeklyCheckins||[]).some(x=>x.programmeWeekKey===k)){const b=make('button','Complete deferred week '+k.split('|').at(-1),history);b.className='secondary';b.onclick=()=>reopen(k)}}for(const row of [...(state.weeklyCheckins||[])].reverse()){make('p',new Date(row.date).toLocaleDateString('en-GB')+' · fatigue '+row.fatigue+' · soreness '+row.soreness+' · discomfort '+row.discomfort+(row.notes?' · '+row.notes:''),history)}
 }
 const refresh=root.refresh;root.refresh=function(){refresh();render()};render();
 const oldGo=root.go;root.go=function(id){oldGo(id);if(id==='today'||id==='train')render()};
 carousel($('upcomingSessions'),$('upcomingDots'));
 const restored=root.LHRFLive?.get?.();if(restored)reference($('liveTrainRoot'),restored,getData());

}
const api={weekKey,weekCompletion,weekComplete,modal,comparable,reference,exerciseReference,carousel,mount};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFMobileUX=api;
})(typeof globalThis!=='undefined'?globalThis:this);
