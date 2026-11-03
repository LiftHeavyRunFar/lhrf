/* Presentation helpers. No prescription generation or storage migration. */
(function(root){'use strict';
function weekKey(state){const c=state.customRoadmap||{};return [state.reviewedProgramme?.fingerprint||c.programmeId||c.startDate||'programme',c.startDate||'',Number(state.activeCustomWeek||1)].join('|')}
function weekComplete(state,parts=x=>[x]){const sessions=(state.activeSchedule||[]).flatMap(parts);return sessions.length>0&&sessions.every(s=>(state.completedWorkouts||[]).some(w=>Number(w.week||1)===Number(s.sourceProgrammeWeek||state.activeCustomWeek||1)&&(w.id===s.id||w.id===s.parentId)))}
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
 const progressLink=make('button','Weekly check-in & recovery',$('progress'));progressLink.className='secondary';progressLink.onclick=reopen;
 const banners=[$('today'),$('train')].map(host=>{const box=make('aside',null,host);box.className='card weekly-prompt';box.setAttribute('aria-live','polite');return box});
 function render(){const state=getData(),key=weekKey(state),complete=weekComplete(state,parts),latest=(state.weeklyCheckins||[]).some(x=>x.programmeWeekKey===key),handled=state.uxWeeklyPrompts?.[key];
  for(const box of banners){box.replaceChildren();box.hidden=!complete||latest||!!handled;if(box.hidden)continue;make('h3','Week complete. How are you recovering?',box);const review=make('button','Weekly check-in',box);review.onclick=reopen;for(const [value,label]of [['deferred','Later'],['dismissed','Dismiss']]){const b=make('button',label,box);b.className='secondary';b.onclick=()=>{const next=JSON.parse(JSON.stringify(getData()));next.uxWeeklyPrompts={...next.uxWeeklyPrompts,[key]:value};if(commit(next))render()}}}
  history.querySelectorAll('p').forEach(e=>e.remove());for(const row of [...(state.weeklyCheckins||[])].reverse()){make('p',new Date(row.date).toLocaleDateString('en-GB')+' · fatigue '+row.fatigue+' · soreness '+row.soreness+' · discomfort '+row.discomfort+(row.notes?' · '+row.notes:''),history)}
 }
 const refresh=root.refresh;root.refresh=function(){refresh();render()};render();
 const oldGo=root.go;root.go=function(id){oldGo(id);if(id==='today'||id==='train')render()};
 // Legacy links to recovery now open its visible destination.
 document.addEventListener('click',e=>{if(e.target.closest('#progressReviewBtn')&&$('progressReviewBtn').textContent&&root.LHRFTrainingReview.assess(getData()).proposals.length)reopen()});
}
const api={weekKey,weekComplete,mount};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFMobileUX=api;
})(typeof globalThis!=='undefined'?globalThis:this);
