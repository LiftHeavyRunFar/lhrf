/* Explicit local-file review. Persistence happens before publishing new app state. */
(function(root){'use strict';
function mount({getData,persist,apply,getLive=()=>root.LHRFLive?.get?.()}){
 const api=root.LHRFLocalActivityImport,$=id=>document.getElementById(id),status=$('importResult');if(!status)return;
 // Legacy running navigation redirects to Train; keep file import reachable in Settings.
 const card=$('activityFile')?.closest('.card'),incoming=$('garminIncoming');if(card&&incoming)incoming.after(card);
 const box=document.createElement('section');box.id='localActivityReview';box.hidden=true;box.setAttribute('aria-label','Review local activity');status.after(box);
 let pending=null,busy=false,revision=0;
 const make=(tag,text,parent=box)=>{const el=document.createElement(tag);if(text!==null)el.textContent=text;parent.append(el);return el};
 const minutes=n=>n===null?'unavailable':n.toFixed(2)+' min';
 async function open(){if(busy)return;const token=++revision;pending=null;box.replaceChildren();box.hidden=true;status.textContent='Reading activity locally…';busy=true;
  try{const file=$('activityFile').files?.[0],row=await api.prepareFile(file);if(token!==revision)return;const review=api.review(getData(),row);if(review.duplicate){status.textContent='This exact file has already been imported. No records changed.';return}
   pending=row;make('h3','Review activity before saving');make('p',new Date(row.date).toLocaleString('en-GB')+' · '+row.km.toFixed(3)+' km');make('p','Timer: '+minutes(row.timerMinutes)+' · elapsed: '+minutes(row.elapsedMinutes)+' · moving: '+minutes(row.movingMinutes));make('p','Average pace: '+row.pace+' ('+row.durationBasis+' duration)'+(row.avgHr===null?'':' · average HR '+row.avgHr+' bpm'));make('p','Totals: '+row.totalsSource);for(const warning of row.warnings)make('p',warning);
   if(review.matches.length){make('p','A similar activity already exists, possibly from Garmin API or another export. Saving separately can double-count it. Cancel to inspect existing history.');const label=make('label',null),check=make('input',null,label);check.id='localActivityAcknowledge';check.type='checkbox';label.append(document.createTextNode(' I reviewed existing history and want to save this as a separate activity.'));}
   const label=make('label','Planned run association (optional)'),planned=make('select',null,label);planned.id='localActivityPlanned';const none=make('option','No planned run',planned);none.value='';for(const t of root.LHRFGarminImport.plannedSessions(getData(),row)){const o=make('option',t.plannedDate+' · Week '+t.week+' · '+t.name,planned);o.value=t.key}
   const outcomeLabel=make('label','Recorded outcome'),outcome=make('select',null,outcomeLabel);outcome.id='localActivityOutcome';for(const [value,text]of [['unconfirmed','Associated only — completion unconfirmed'],['partial','Partial'],['interrupted','Interrupted'],['modified','Modified'],['completed','I confirm the full prescribed run was completed']]){const o=make('option',text,outcome);o.value=value}
   make('p','Association retains the actual activity date. Only explicit full-completion confirmation marks the planned run complete. Partial, interrupted and modified runs remain recorded without completing the prescription.');
   const actions=make('div',null);actions.className='actions';const save=make('button','Save reviewed activity',actions);save.id='localActivitySave';save.type='button';const cancel=make('button','Cancel import',actions);cancel.id='localActivityCancel';cancel.type='button';cancel.className='secondary';
   cancel.onclick=()=>{pending=null;revision++;box.hidden=true;box.replaceChildren();status.textContent='Import cancelled. No records changed.'};
   save.onclick=()=>{if(!pending||busy)return;busy=true;save.disabled=true;try{
    if(planned.value&&getLive())throw Error('Finish or discard your current workout before linking an activity.');
    api.saveReviewed({getData,persist,apply},pending,{plannedKey:planned.value,outcome:outcome.value,acknowledgeMatch:$('localActivityAcknowledge')?.checked===true});pending=null;box.hidden=true;box.replaceChildren();status.textContent='Activity saved with its original date. '+(planned.value&&outcome.value==='completed'?'Planned run explicitly confirmed complete.':'No planned workout was marked complete.');
   }catch(e){status.textContent=e.message}finally{busy=false;save.disabled=false}};
   box.hidden=false;status.textContent='Activity ready for review. No training records have been changed.';
  }catch(e){status.textContent='Could not read activity: '+e.message}finally{busy=false}
 }
 $('activityFile')?.addEventListener('change',()=>{revision++;pending=null;box.hidden=true;box.replaceChildren();status.textContent='Choose Import activity to review the selected file.'});
 root.LHRFLocalActivityImportUI={open};return {open};
}
root.LHRFLocalActivityImportUI={mount};
})(typeof globalThis!=='undefined'?globalThis:this);
