/* Read-only history and conservative weekly evidence. Programme edits remain in the approval flow. */
(function(root){'use strict';
const day=x=>String(x||'').slice(0,10);
function history(state){
 const rows=[],sets=state.sets||[],runs=state.runs||[],used=new Set();
 for(const w of state.completedWorkouts||[]){const own=sets.filter((s,i)=>{const yes=s.sessionId===w.id&&s.date===w.date;if(yes)used.add(i);return yes});rows.push({...w,kind:'strength',sets:own,runs:runs.filter(r=>r.sessionId===w.id&&day(r.date)===day(w.date)),feedback:(state.sessionFeedback||[]).filter(f=>f.sessionId===w.id&&day(f.date)===day(w.date))})}
 const groups=new Map();sets.forEach((s,i)=>{if(used.has(i))return;const key=day(s.date)+'|'+(s.sessionId||s.session||'Strength');if(!groups.has(key))groups.set(key,{date:s.date,name:s.session||'Strength session',kind:'strength',sets:[],runs:[],feedback:[]});groups.get(key).sets.push(s)});rows.push(...groups.values());
 for(const r of runs)if(!rows.some(w=>w.runs.includes(r)))rows.push({date:r.date,name:r.name||r.session||r.type||'Run',kind:'run',sets:[],runs:[r],feedback:[]});
 return rows.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
}
function assess(state,now=new Date()){
 const since=+now-14*86400000,recent=(state.runs||[]).filter(r=>Date.parse(r.date)>=since&&Date.parse(r.date)<=+now),messages=[],proposals=[];
 const reviews=(state.weeklyCheckins||[]).filter(c=>Date.parse(c.date)>=+now-7*86400000).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)),check=reviews[0];
 const comparable=recent.filter(r=>r.comparableEasy===true&&Number.isFinite(r.avgHr)&&r.avgHr>=40&&r.avgHr<=230&&r.km>0&&r.min>0).sort((a,b)=>Date.parse(a.date)-Date.parse(b.date));
 if(comparable.length>=4){const a=comparable.slice(-4,-2),b=comparable.slice(-2),avg=(xs,fn)=>xs.reduce((n,r)=>n+fn(r),0)/xs.length;
 const slower=avg(b,r=>r.min/r.km)/avg(a,r=>r.min/r.km)>=1.05,hr=Math.abs(avg(b,r=>r.avgHr)-avg(a,r=>r.avgHr))<=5;
 if(slower&&hr){messages.push('The latest two confirmed comparable easy runs were at least 5% slower than the previous two, at average heart rate within 5 bpm. Check conditions, sensor quality and recovery.');proposals.push('Review running stress before progressing; retain priority bench work and consider trimming optional accessories first.')}}
 const feedback=(state.sessionFeedback||[]).filter(f=>Date.parse(f.date)>=+now-7*86400000),hard=feedback.filter(f=>f.difficulty==='harder'||f.energy==='low').length;
 if(check&&(check.fatigue==='high'||check.soreness==='high'||check.discomfort==='yes')||hard>=2||feedback.some(f=>f.discomfort==='yes'))proposals.push('Review recovery before adding training stress. Consider reducing optional accessory volume first; reassess main lifts and running using warm-ups and actual RPE.');
 const rated=recent.filter(r=>Number.isFinite(r.rpe)&&r.rpe>0);if(rated.filter(r=>r.rpe>=8).length>=2)proposals.push('At least two recent runs were rated RPE 8 or above. Check their intended intensity and recovery before progressing running.');
 if(!check)messages.push('Weekly recovery information is missing. Readiness has not been assumed.');
 if(comparable.length<4)messages.push('Heart-rate comparisons need four easy runs you confirm had similar terrain, conditions and reliable heart-rate readings. No heart-rate adjustment is justified yet.');
 if(!rated.length)messages.push('Recent run effort ratings are missing. Garmin heart rate alone does not establish readiness.');
 if(!state.garminSync?.savedAt)messages.push('No successful Garmin import review has been recorded yet.');
 return {messages,proposals:[...new Set(proposals)],appliedChanges:[]};
}
function mount({getData,commit}){
 const host=document.getElementById('progress');if(!host)return;const box=document.createElement('div');box.className='card';box.id='trainingHistory';host.prepend(box);
 const make=(tag,text,parent)=>{const el=document.createElement(tag);if(text!=null)el.textContent=text;if(parent)parent.append(el);return el};
 make('h2','Workout history',box);make('p','Open a session to review recorded work. Older records without a saved prescription show only what was recorded.',box).className='muted small';
 const filters=make('div',null,box);filters.className='grid';const field=(label,type)=>{const wrap=make('label',label,filters),input=make('input',null,wrap);input.type=type;return input};const from=field('From','date'),to=field('To','date'),type=make('select',null,make('label','Workout type',filters));for(const [value,label]of [['all','All workouts'],['strength','Strength'],['run','Running']]){const o=make('option',label,type);o.value=value}
 const list=make('div',null,box),more=make('button','Show more',box);more.className='secondary';let limit=10;
 function renderHistory(){list.replaceChildren();const items=history(getData()).filter(r=>(!from.value||day(r.date)>=from.value)&&(!to.value||day(r.date)<=to.value)&&(type.value==='all'||type.value==='run'&&r.runs.length||type.value==='strength'&&r.sets.length));
 if(!items.length)make('p','No recorded workouts match these dates.',list);
 for(const row of items.slice(0,limit)){const detail=make('details',null,list);detail.className='entry';make('summary',new Date(row.date).toLocaleDateString('en-GB')+' · '+row.name,detail);
 if(row.prescription){make('h3','Prescribed',detail);for(const e of row.prescription.ex||[])make('p',e[0]+' · '+e[1]+' × '+e[2]+' · '+e[3]+' kg · RPE '+e[4],detail);for(const r of row.prescription.runs||[])make('p',r.name+' · '+(r.structure||r.minutes+' min'),detail)}else make('p','Original prescription was not saved with this historical record.',detail).className='muted small';
 for(const s of row.sets)make('p',s.exercise+' · set '+s.set+' · '+s.weight+' kg × '+s.reps+' · RPE '+s.rpe+(s.target?' / target '+s.target:''),detail);
 for(const r of row.runs){make('p',r.km+' km · '+r.min+' min'+(r.km>0?' · '+pace(r.min/r.km)+'/km':'')+(r.avgHr?' · average HR '+r.avgHr+' bpm':'')+(r.maxHr?' · max HR '+r.maxHr+' bpm':'')+(r.rpe!=null?' · RPE '+r.rpe:''),detail);for(const s of r.splits||[])make('p','Split · '+s.km.toFixed(2)+' km · '+s.min.toFixed(1)+' min'+(s.avgHr?' · '+s.avgHr+' bpm':''),detail);
 const label=make('label',null,detail),check=make('input',null,label);check.type='checkbox';check.checked=r.comparableEasy===true;label.append(document.createTextNode(' Comparable easy run: similar route, conditions and reliable heart-rate reading'));check.onchange=()=>{const next=JSON.parse(JSON.stringify(getData())),index=getData().runs.indexOf(r);if(index<0)return;next.runs[index].comparableEasy=check.checked;if(!commit(next)){check.checked=!check.checked;return}renderAssessment()};}
 for(const note of new Set([row.notes,...row.sets.map(s=>s.notes),...row.runs.map(r=>r.notes||r.note)].filter(Boolean)))make('p','Notes: '+note,detail);for(const f of row.feedback)make('p','Feedback: '+[f.difficulty,f.energy,f.discomfort==='yes'?'unusual discomfort':null].filter(Boolean).join(' · '),detail);
 }more.hidden=items.length<=limit;}
 function pace(n){const s=Math.round(n*60);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
 for(const el of [from,to,type])el.onchange=()=>{limit=10;renderHistory()};more.onclick=()=>{limit+=20;renderHistory()};
 const review=document.createElement('div');review.className='card';review.id='weeklyCheckin';box.after(review);make('h2','Weekly check-in',review);make('p','Review after your last run of the week. Import recent runs before assessing the week, or import afterwards to update the assessment.',review);
 const controls={};for(const [key,label,options]of [['fatigue','Overall fatigue',['low','moderate','high']],['soreness','Leg soreness',['low','moderate','high']],['discomfort','Unusual discomfort',['no','yes']]]){const wrap=make('label',label,review),select=make('select',null,wrap);for(const value of ['',...options]){const o=make('option',value||'Choose…',select);o.value=value}controls[key]=select}
 const notes=make('textarea',null,make('label','Anything affecting training? Heat, hills, sleep, illness or sensor problems',review));notes.rows=2;
 const actions=make('div',null,review);actions.className='actions';const save=make('button','Save weekly check-in',actions),sync=make('button','Pull recent Garmin runs',actions);sync.className='secondary';const status=make('p',null,review);status.setAttribute('aria-live','polite');const evidence=make('div',null,review);
 function renderAssessment(){evidence.replaceChildren();const state=getData(),result=assess(state);make('p',state.garminSync?.savedAt?'Last Garmin import reviewed: '+new Date(state.garminSync.savedAt).toLocaleString('en-GB'):'Garmin import has not been reviewed yet.',evidence).className='muted small';if(state.garminSync?.truncated)make('p','The last import was partial. Older runs may be missing; review coverage before drawing conclusions.',evidence);const latest=(state.weeklyCheckins||[]).slice(-1)[0];if(latest){make('p','Latest check-in: '+new Date(latest.date).toLocaleDateString('en-GB')+' · fatigue '+latest.fatigue+' · soreness '+latest.soreness+' · discomfort '+latest.discomfort,evidence);if(latest.notes)make('p','Context: '+latest.notes,evidence)}for(const text of result.messages)make('p',text,evidence);for(const text of result.proposals)make('p','Proposed for discussion: '+text,evidence).className='warn';make('p','No programme changes applied. These signals support the existing coach review; any prescription change still requires approval.',evidence).className='muted small'}
 save.onclick=()=>{if(Object.values(controls).some(x=>!x.value)){status.textContent='Choose fatigue, soreness and discomfort before saving.';return}const next=JSON.parse(JSON.stringify(getData()));next.weeklyCheckins=next.weeklyCheckins||[];next.weeklyCheckins.push({date:new Date().toISOString(),...Object.fromEntries(Object.entries(controls).map(([k,v])=>[k,v.value])),notes:notes.value.slice(0,2000)});if(!commit(next)){status.textContent='Could not save the check-in. Please try again.';return}status.textContent='Check-in saved. Pull recent Garmin runs to bring this assessment up to date.';renderAssessment()};
 sync.onclick=()=>{if(typeof root.go==='function')root.go('settings');document.getElementById('garminImportOpen')?.click();document.getElementById('garminIncoming')?.scrollIntoView({behavior:'smooth'})};
 const oldRefresh=root.refresh;if(typeof oldRefresh==='function')root.refresh=function(){oldRefresh();renderHistory();renderAssessment()};renderHistory();renderAssessment();
}
const api={history,assess,mount};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFTrainingReview=api;
})(typeof globalThis!=='undefined'?globalThis:this);
