/* Read-only history and conservative weekly evidence. Programme edits remain in the approval flow. */
(function(root){'use strict';
const day=x=>String(x||'').slice(0,10);
function completedRecord(rows,session,week){
 const matches=rows.filter(row=>Number(row.week||1)===week&&
  (row.id===session.id||(session.parentId&&row.id===session.parentId)))
  .sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 return matches.find(row=>row.id===session.id)||
  (session.parentId?matches.find(row=>row.id===session.parentId):undefined);
}
function recordedWorkout(state,workout){
 return {
  sets:(state.sets||[]).filter(s=>s.sessionId===workout.id&&s.date===workout.date),
  runs:(state.runs||[]).filter(r=>r.sessionId===workout.id&&day(r.date)===day(workout.date))
 };
}
function history(state){
 const rows=[],sets=state.sets||[],runs=state.runs||[],used=new Set();
 for(const w of state.completedWorkouts||[]){const recorded=recordedWorkout(state,w);recorded.sets.forEach(s=>used.add(s));rows.push({...w,kind:w.component==='run'?'run':'strength',...recorded,feedback:(state.sessionFeedback||[]).filter(f=>f.sessionId===w.id&&day(f.date)===day(w.date))})}
 const groups=new Map();sets.forEach(s=>{if(used.has(s))return;const key=day(s.date)+'|'+(s.sessionId||s.session||'Strength');if(!groups.has(key))groups.set(key,{date:s.date,name:s.session||'Strength session',kind:'strength',sets:[],runs:[],feedback:[]});groups.get(key).sets.push(s)});rows.push(...groups.values());
 for(const r of runs)if(!rows.some(w=>w.runs.includes(r)))rows.push({date:r.date,name:r.name||r.session||r.type||'Run',kind:'run',sets:[],runs:[r],feedback:[]});
 return rows.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
}
const loadUnits=meta=>meta?.loadType==='per-hand-kg'?'kg / hand':meta?.loadType==='assistance-kg'?'kg assistance':'kg';
function recordedSet(set){
 return (set.weight??'—')+' '+loadUnits(set)+' × '+(set.reps??'—')+
  (set.doseUnit==='seconds'?' sec':' reps')+' · RPE '+(set.rpe??'—');
}
function runInterruptionField(value='',id=''){
 const field=document.createElement('label'),select=document.createElement('select');
 field.className='field';field.textContent='If you cut the run short, why?';
 if(id)select.id=id;
 for(const [key,label] of [['','Not answered'],['time','Time available'],['logistics','Logistics'],
  ['fatigue','Unusual fatigue'],['pain','Pain or discomfort'],['illness','Illness']]){
  const option=document.createElement('option');option.value=key;option.textContent=label;select.append(option);
 }
 select.value=value;field.append(select);return field;
}
function strengthGroups(row){
 const groups=new Map(),key=(name,variant)=>name+'|'+(variant||'');
 const get=(name,variant)=>{const id=key(name,variant);if(!groups.has(id))groups.set(id,{name,variant,prescribed:[],actual:[]});return groups.get(id)};
 for(const ex of row.prescription?.ex||[])get(ex[0],ex[5]?.variantId).prescribed.push(ex);
 for(const set of row.sets||[])get(set.exercise,set.variantId).actual.push(set);
 return [...groups.values()];
}
// A labelled race or a uniquely associated saved race prescription is not an easy-run comparison.
// Unknown/legacy records remain under the athlete's explicit control; do not rewrite history.
function knownRace(state,run){
 if([run.type,run.role].some(value=>String(value||'').trim().toLowerCase()==='race'))return true;
 if(!run.sessionId||!day(run.date))return false;
 const matches=(state.completedWorkouts||[]).filter(w=>w.id===run.sessionId&&day(w.date)===day(run.date));
 if(matches.length!==1)return false;
 const prescribed=matches[0].prescription?.runs||[];
 return prescribed.length===1&&(prescribed[0].role==='race'||(prescribed[0].steps||[]).some(step=>step.role==='race'));
}
function assess(state,now=new Date()){
 const planFirst=state.customRoadmap?.planFirstVersion===1;
 const since=+now-14*86400000,recent=(state.runs||[]).filter(r=>Date.parse(r.date)>=since&&Date.parse(r.date)<=+now),messages=[],proposals=[];
 const reviews=(state.weeklyCheckins||[]).filter(c=>Date.parse(c.date)>=+now-7*86400000).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)),check=reviews[0];
 const comparable=recent.filter(r=>r.comparableEasy===true&&!knownRace(state,r)&&Number.isFinite(r.avgHr)&&r.avgHr>=40&&r.avgHr<=230&&r.km>0&&r.min>0).sort((a,b)=>Date.parse(a.date)-Date.parse(b.date));
 if(comparable.length>=4){const a=comparable.slice(-4,-2),b=comparable.slice(-2),avg=(xs,fn)=>xs.reduce((n,r)=>n+fn(r),0)/xs.length;
 const slower=avg(b,r=>r.min/r.km)/avg(a,r=>r.min/r.km)>=1.05,hr=Math.abs(avg(b,r=>r.avgHr)-avg(a,r=>r.avgHr))<=5;
 if(slower&&hr){messages.push('The latest two confirmed comparable easy runs were at least 5% slower than the previous two, at average heart rate within 5 bpm. Check conditions, sensor quality and recovery.');if(!planFirst)proposals.push('Review running stress before progressing; retain priority bench work and consider trimming optional accessories first.')}}
 const feedback=(state.sessionFeedback||[]).filter(f=>Date.parse(f.date)>=+now-7*86400000),hard=feedback.filter(f=>f.difficulty==='harder'||f.energy==='low').length;
 if(!planFirst&&(check&&(check.fatigue==='high'||check.soreness==='high'||check.discomfort==='yes')||hard>=2||feedback.some(f=>f.discomfort==='yes')))proposals.push('Review recovery before adding training stress. Consider reducing optional accessory volume first; reassess main lifts and running using warm-ups and actual RPE.');
 const rated=recent.filter(r=>Number.isFinite(r.rpe)&&r.rpe>0);if(!planFirst&&rated.filter(r=>r.rpe>=8).length>=2)proposals.push('At least two recent runs were rated RPE 8 or above. Check their intended intensity and recovery before progressing running.');
 if(!check)messages.push('Weekly recovery information is missing. Readiness has not been assumed.');
 if(comparable.length<4)messages.push('Heart-rate comparisons need four easy runs you confirm had similar terrain, conditions and reliable heart-rate readings. No heart-rate adjustment is justified yet.');
 if(!rated.length)messages.push('Recent run effort ratings are missing. Garmin heart rate alone does not establish readiness.');
 if(!state.garminSync?.savedAt)messages.push('No successful Garmin import review has been recorded yet.');
 return {messages,proposals:[...new Set(proposals)],appliedChanges:[]};
}
const dayMs=86400000;
function localDate(value){
 if(typeof value!=='string'||!value)return '';
 if(/^\d{4}-\d{2}-\d{2}$/.test(value)){
  const date=new Date(value+'T12:00:00Z');
  return Number.isFinite(+date)&&date.toISOString().slice(0,10)===value?value:'';
 }
 const date=new Date(value);
 return Number.isFinite(+date)?date.toLocaleDateString('en-CA'):'';
}
function monday(date){
 const d=new Date(date+'T12:00:00Z');
 return +d-(d.getUTCDay()+6)%7*dayMs;
}
function reviewPeriod(state,week,now){
 const start=localDate(state.customRoadmap?.startDate);
 const base=start?monday(start)+(week-1)*7*dayMs:
  week===Number(state.activeCustomWeek||1)?monday(localDate(now.toISOString())):NaN;
 const key=offset=>Number.isFinite(base)?new Date(base+offset*dayMs).toISOString().slice(0,10):'';
 return {start:key(0),end:key(6)};
}
function inPeriod(date,period,now){
 const d=localDate(date);
 return !!period.start&&d>=period.start&&d<=period.end&&Date.parse(date)<=+now;
}
function savedCheckin(state,key,period,now){
 return (state.weeklyCheckins||[]).findLast(row=>
  (row.programmeWeekKey===key&&localDate(state.customRoadmap?.startDate))||
  ((!row.programmeWeekKey||row.programmeWeekKey===key)&&inPeriod(row.date,period,now)));
}
function distinctRuns(rows){
 const seen=new Set();
 return rows.filter(run=>{
  const keys=[];
  const activityId=run.sourceActivityId||run.garminActivityId;
  if(activityId)keys.push('activity|'+activityId);
  for(const record of [run,run.importOriginal].filter(Boolean)){
   const time=Date.parse(record.date);
   if(Number.isFinite(time)&&record.km>0&&record.min>0)keys.push(['record',time,Number(record.km),Number(record.min)].join('|'));
  }
  const duplicate=keys.some(key=>seen.has(key));
  keys.forEach(key=>seen.add(key));
  return !duplicate;
 });
}
function weeklySummary({state,week,check,now=new Date(),sessions,nextSessions,parts,completion}){
 const period=reviewPeriod(state,week,now),recorded=row=>inPeriod(row.date,period,now);
 const actualSets=(state.sets||[]).filter(recorded);
 const sets=actualSets.filter(row=>row.exercise&&Number(row.reps)>0&&Number.isFinite(Number(row.reps)));
 const allRuns=distinctRuns((state.runs||[]).filter(r=>Date.parse(r.date)<=+now));
 const runs=allRuns.filter(recorded);
 const measured=runs.filter(r=>Number(r.km)>0&&Number.isFinite(Number(r.km)));
 const distance=measured.reduce((sum,r)=>sum+Number(r.km),0);
 const counts=completion({...state,activeCustomWeek:week,activeSchedule:sessions||[],
  completedWorkouts:(state.completedWorkouts||[]).filter(w=>localDate(w.date)&&Date.parse(w.date)<=+now)},parts);
 const planned=nextSessions?.flatMap(parts);
 const next=planned&&{
  strength:planned.filter(s=>s.ex?.length).length,
  running:planned.filter(s=>s.runs?.length||s.run).length,
  sessions:planned
 };
 const feedback=(state.sessionFeedback||[]).filter(recorded);
 const discomfort=check.discomfort==='yes'||feedback.some(f=>f.discomfort==='yes');
 const concern=discomfort?'Unusual discomfort reported.':
  check.fatigue==='high'||check.soreness==='high'?'High '+[check.fatigue==='high'?'fatigue':'',check.soreness==='high'?'leg soreness':''].filter(Boolean).join(' and ')+' reported.':'';
 const asOf=period.end&&period.end<localDate(now.toISOString())?new Date(period.end+'T23:59:59'):now;
 const evidence=assess({...state,runs:allRuns,sessionFeedback:feedback,weeklyCheckins:[{...check,date:asOf.toISOString()}]},asOf);
 const verdict=state.customRoadmap?.planFirstVersion===1&&concern
  ? discomfort?'Review the reported discomfort before the affected training.':'Check sleep, food and stress alongside the training trend.'
  : concern||evidence.proposals.length?'Review recovery before adding training stress.'
   : sets.length||runs.length?'The available logs and check-in give no clear reason to change the plan.':'There’s too little recorded training to assess this week.';
 const lastSync=localDate(state.garminSync?.end||state.garminSync?.savedAt);
 const coverage=state.garminSync?.truncated?'The last Garmin import was partial. Some runs may be missing.':
  !lastSync||!period.start||lastSync<localDate(asOf.toISOString())||
  (state.garminSync?.start&&localDate(state.garminSync.start)>period.start)?
   'Garmin coverage is unconfirmed. Totals reflect saved runs.':'';
 return {period,counts,sets:sets.length,incompleteSets:actualSets.length-sets.length,runs:runs.length,
  distance:measured.length?distance:null,missingDistance:runs.length-measured.length,next,concern,verdict,coverage,evidence};
}
function mount({getData,commit,getSessions,parts,openProgress}){
 const host=document.getElementById('progress');if(!host)return;const box=document.createElement('div');box.className='card';box.id='trainingHistory';host.insertBefore(box,document.getElementById('progressDetails'));const format=root.LHRFRunPresentation;
 const make=(tag,text,parent)=>{const el=document.createElement(tag);if(text!=null)el.textContent=text;if(parent)parent.append(el);return el};
 make('h2','Workout history',box);make('p','Open a session to review recorded work. Older records without a saved prescription show only what was recorded.',box).className='muted small';
 const filters=make('div',null,box);filters.className='grid';const field=(label,type)=>{const wrap=make('label',label,filters),input=make('input',null,wrap);input.type=type;return input};const from=field('From','date'),to=field('To','date'),type=make('select',null,make('label','Workout type',filters));for(const [value,label]of [['all','All workouts'],['strength','Strength'],['run','Running']]){const o=make('option',label,type);o.value=value}
 const list=make('div',null,box),more=make('button','Show more',box);more.className='secondary';let limit=10;
 const historyKey=row=>[row.date,row.id||row.name].join('|');
 function renderHistory(){const expanded=new Set([...list.querySelectorAll(':scope > details[open]')].map(e=>e.dataset.historyKey));list.replaceChildren();const items=history(getData()).filter(r=>(!from.value||day(r.date)>=from.value)&&(!to.value||day(r.date)<=to.value)&&(type.value==='all'||type.value==='run'&&r.runs.length||type.value==='strength'&&r.sets.length));
 if(!items.length)make('p','No recorded workouts match these dates.',list);
 for(const row of items.slice(0,limit)){const detail=make('details',null,list);detail.className='entry';detail.dataset.historyKey=historyKey(row);detail.open=expanded.has(detail.dataset.historyKey);make('summary',new Date(row.date).toLocaleDateString('en-GB')+' · '+row.name,detail);
 if(!row.sets.length&&!row.runs.length)make('p','No logged sets or run details are attached to this completion.',detail).className='muted small';
 if(row.plannedDate)make('p','Completed '+new Date(row.date).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'short'})+' · planned '+new Date(row.plannedDate+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'short'}),detail).className='muted small';
 for(const group of strengthGroups(row)){const section=make('section',null,detail);section.className='strength-comparison';make('h3',group.name,section);const table=make('table',null,section),head=make('tr',null,make('thead',null,table));make('th','Prescribed',head);make('th','Actual',head);const tr=make('tr',null,make('tbody',null,table)),target=make('td',null,tr),actual=make('td',null,tr);
 if(!group.prescribed.length)make('p','Original prescription unavailable',target);
 for(const ex of group.prescribed)make('p',ex[1]+' × '+ex[2]+(ex[5]?.doseUnit==='seconds'?' sec':' reps')+' · '+ex[3]+' '+loadUnits(ex[5])+' · RPE '+ex[4]+(ex[5]?.role?' · '+ex[5].role:''),target);
 if(!group.actual.length)make('p','No recorded sets',actual);
 for(const set of group.actual)make('p','Set '+(set.set??'—')+' · '+recordedSet(set)+(set.target?' / target '+set.target:''),actual);
 }
 if(!row.prescription&&row.sets.length)make('p','Original prescription was not saved with this historical record.',detail).className='muted small';
 for(const r of row.runs){
 const actual=make('section',null,detail);actual.className='run-comparison';make('h3','Prescribed vs actual',actual);
 const prescribed=r.plannedSession?.prescription||r.activityAssociation?.prescription||row.prescription,comparison=format.comparison(r,prescribed);
 if(!prescribed)make('p','No saved prescription to compare. Recorded work is shown below.',actual).className='muted small';
 const table=make('table',null,actual);table.className='run-summary-table';const head=make('tr',null,make('thead',null,table));for(const label of ['','Prescribed','Actual'])make('th',label,head);const body=make('tbody',null,table);
 for(const [name,target,value]of [['Distance',comparison.distance,format.distance(r.km)],['Time',comparison.duration,format.duration(r.min)],['Pace',comparison.pace,format.pace(r.min,r.km)]]){const tr=make('tr',null,body);make('th',name,tr).scope='row';make('td',target,tr);make('td',value,tr)}
 if(comparison.changes.length)make('p',comparison.changes.join(' · '),actual).className='run-difference';
 if(r.sessionId&&prescribed&&(r.sourceActivityId||r.garminActivityId)){
  const field=runInterruptionField(r.interruptionReason),reason=field.querySelector('select');
  actual.append(field);
  const saveReason=make('button','Save run reason',actual);saveReason.type='button';saveReason.className='secondary';
  const reasonStatus=make('p',null,actual);reasonStatus.setAttribute('aria-live','polite');
  saveReason.onclick=()=>{
   const state=getData(),index=state.runs.indexOf(r);
   if(index<0)return;
   const next=JSON.parse(JSON.stringify(state));
   if(reason.value)next.runs[index].interruptionReason=reason.value;
   else delete next.runs[index].interruptionReason;
   if(!commit(next))reasonStatus.textContent='Could not save the reason. Try again.';
  };
 }
 if(r.source==='garmin-local')make('p','Recorded outcome: '+(r.outcome||'unconfirmed')+(r.activityAssociation?' · planned '+r.activityAssociation.plannedDate+' · '+r.activityAssociation.name:''),actual);
 make('p',[r.avgHr?'average HR '+r.avgHr+' bpm':'',r.maxHr?'max HR '+r.maxHr+' bpm':'',r.rpe!=null?'RPE '+r.rpe:''].filter(Boolean).join(' · '),actual);
 format.renderSplits(actual,r);
 const provenance=make('details',null,actual);make('summary','Source & recorded timing',provenance);make('p','Source: '+(r.source||'athlete log')+(r.sourceActivityId?' · activity '+r.sourceActivityId:'')+(r.totalsSource?' · '+r.totalsSource:''),provenance);make('p','Recorded: '+r.date+(r.durationBasis?' · pace uses '+r.durationBasis+' time':''),provenance);
 if(r.source==='garmin-local')make('p','Timer: '+format.duration(r.timerMinutes)+' · elapsed: '+format.duration(r.elapsedMinutes)+' · moving: '+format.duration(r.movingMinutes),provenance);for(const warning of r.warnings||[])make('p',warning,provenance);
 const label=make('label',null,actual),check=make('input',null,label);check.type='checkbox';check.checked=r.comparableEasy===true;const race=knownRace(getData(),r);check.disabled=race&&!check.checked;label.append(document.createTextNode(' Use for comparable easy-run trends'));const help=make('p','Select only for an easy run with similar route, terrain, weather and a reliable heart-rate reading. Your coach needs four confirmed comparable runs to review pace at similar heart rate. This does not change the run or its prescription.',actual);help.id='comparableHelp'+list.querySelectorAll('input[type="checkbox"]').length;help.className='muted small';check.setAttribute('aria-describedby',help.id);if(race)help.textContent='Race sessions are excluded from easy-run comparisons. An existing selection can be cleared without changing the workout.';
 check.onchange=()=>{const next=JSON.parse(JSON.stringify(getData())),index=getData().runs.indexOf(r);if(index<0)return;next.runs[index].comparableEasy=check.checked;if(!commit(next))check.checked=!check.checked;else if(race&&!check.checked)check.disabled=true};}
 for(const note of new Set([row.notes,...row.sets.map(s=>s.notes),...row.runs.map(r=>r.notes||r.note)].filter(Boolean)))make('p','Notes: '+note,detail);for(const f of row.feedback)make('p','Feedback: '+[f.difficulty,f.energy,f.discomfort==='yes'?'unusual discomfort':null].filter(Boolean).join(' · '),detail);
 }more.hidden=items.length<=limit;}
 for(const el of [from,to,type])el.onchange=()=>{limit=10;renderHistory()};more.onclick=()=>{limit+=20;renderHistory()};
 root.LHRFOpenWorkoutHistory=(session,week)=>{
  const items=history(getData());
  const row=session
   ? completedRecord(items,session,week)
   : items.find(r=>r.sets.length||r.runs.length);
  from.value='';to.value='';type.value='all';
  limit=Math.max(10,items.indexOf(row)+1);
  openProgress();
  const detail=row&&[...list.children].find(el=>el.dataset.historyKey===historyKey(row));
  if(detail)detail.open=true;
  const target=detail?.querySelector('summary')||box.querySelector('h2');
  target.tabIndex=0;
  target.focus({preventScroll:true});
  target.scrollIntoView({block:'center'});
 };
 const review=document.createElement('div');review.className='card';review.id='weeklyCheckin';box.after(review);const heading=make('h2','Weekly check-in',review);make('p','Review recovery after your final workout of the week. You can return here any time.',review);
 const controls={};for(const [key,label,options]of [['fatigue','Overall fatigue',['low','moderate','high']],['soreness','Leg soreness',['low','moderate','high']],['discomfort','Unusual discomfort',['no','yes']]]){const wrap=make('label',label,review),select=make('select',null,wrap);for(const value of ['',...options]){const o=make('option',value||'Choose…',select);o.value=value}controls[key]=select}
 const notes=make('textarea',null,make('label','Anything affecting training? Heat, hills, sleep, illness or sensor problems',review));notes.rows=2;
 const actions=make('div',null,review);actions.className='actions';const save=make('button','Save weekly check-in',actions),sync=make('button','Pull recent Garmin runs',actions);sync.className='secondary';const status=make('p',null,review);status.setAttribute('aria-live','polite');
 function openReview(state,week,check){
  const sessions=getSessions(week),nextSessions=getSessions(week+1);
  const result=weeklySummary({state,week,check,sessions,nextSessions,parts,completion:root.LHRFMobileUX.weekCompletion});
  if(document.getElementById('weeklyReviewSheet'))return;
  const sheet=make('dialog',null,document.body);sheet.className='training-sheet weekly-sheet';sheet.id='weeklyReviewSheet';
  sheet.setAttribute('aria-labelledby','weeklyReviewTitle');
  make('p','CHECK-IN SAVED',sheet).className='tag';
  make('h2','Weekly review',sheet).id='weeklyReviewTitle';
  const dateLabel=date=>new Date(date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'});
  const {start,end}=result.period;
  make('p',start?dateLabel(start)+' – '+dateLabel(end):'Training dates unavailable',sheet).className='muted small';
  const plural=(n,word)=>n+' '+word+(n===1?'':'s');
  const metrics=make('section',null,sheet);metrics.className='weekly-metrics';metrics.setAttribute('aria-label','Training recorded');
  const metric=(value,label)=>{const item=make('div',null,metrics);make('strong',value,item);make('span',label,item)};
  metric(result.counts.planned?result.counts.completed+' / '+result.counts.planned:'—','Planned sessions done');
  metric(result.sets?String(result.sets):'—','Strength sets logged');
  metric(result.distance===null?'—':format.distance(result.distance),plural(result.runs,'run')+' logged');
  const gaps=[
   !result.sets?'No verified sets logged.':result.incompleteSets?'Some set records lack details.':'',
   !result.runs?'No runs logged.':result.missingDistance?'Some run distances are missing.':'',
   !result.counts.planned?'Planned session count unavailable.':''
  ].filter(Boolean);
  if(gaps.length)make('p',gaps.join(' '),sheet).className='muted small';
  const section=(label,copy)=>{const el=make('section',null,sheet);make('h3',label,el);make('p',copy,el);return el};
  const level=(value,label)=>value?value[0].toUpperCase()+value.slice(1)+' '+label:label+' unrecorded';
  const recovery=section('Recovery',[level(check.fatigue,'fatigue'),level(check.soreness,'leg soreness'),
   check.discomfort==='yes'?'Unusual discomfort':check.discomfort==='no'?'No unusual discomfort':'Discomfort unrecorded'].join(' · '));
  if(result.concern)make('p',result.concern,recovery).className='weekly-concern';
  section('Coach’s assessment',result.verdict);
  const next=result.next;
  section('Next week',next?.sessions.length
   ?[next.strength?plural(next.strength,'strength session'):'',next.running?plural(next.running,'run'):''].filter(Boolean).join(' · ')||'See the scheduled sessions below.'
   :next?'No sessions scheduled in the saved plan.':'Next week’s sessions are unavailable in the saved plan.');
  const details=make('details',null,sheet);details.className='weekly-evidence';make('summary','View details',details);
  make('p','Recovery responses were saved on '+new Date(check.date).toLocaleDateString('en-GB')+'.',details);
  if(check.notes)make('p','Your notes: '+check.notes,details);
  make('p','Set and run totals use the dates in the saved activity logs. Planned completion uses saved workout links, so a workout done early or late can count towards a different planned week.',details);
  if(result.coverage)make('p',result.coverage,details);
  for(const text of [...result.evidence.messages,...result.evidence.proposals])make('p',text,details);
  make('p','Heart rate is interpreted alongside comparable routes, conditions and sensor quality. Any programme adjustment needs your approval.',details);
  if(next?.sessions.length){
   make('h3','Scheduled sessions',details);
   const list=make('ul',null,details);
   for(const s of next.sessions)make('li',[s.day,s.name,s.recoveryReviewRequired?'conditional on recovery':''].filter(Boolean).join(' · '),list);
  }
  const close=make('button','Done',sheet);close.type='button';close.onclick=()=>sheet.close();
  sheet.addEventListener('close',()=>sheet.remove(),{once:true});
  sheet.showModal();
 }
 function reviewContext(){
  const state=getData(),ux=root.LHRFMobileUX,current=Number(state.activeCustomWeek||1);
  const requested=Number(root.LHRFWeeklyReviewKey?.split('|').at(-1));
  const week=Number.isInteger(requested)&&requested>0&&requested<=current&&
   root.LHRFWeeklyReviewKey===ux.weekKey({...state,activeCustomWeek:requested})?requested:current;
  return {state,week,key:ux.weekKey({...state,activeCustomWeek:week})};
 }
 function updateCheckin(){
  const {state,week,key}=reviewContext(),now=new Date();
  const existing=savedCheckin(state,key,reviewPeriod(state,week,now),now);
  for(const [name,field] of Object.entries(controls))field.value=existing?.[name]||'';
  notes.value=existing?.notes||'';
  for(const field of [...Object.values(controls),notes])field.disabled=!!existing;
  save.textContent=existing?'View weekly review':'Save weekly check-in';
  heading.textContent='Weekly check-in · Week '+week;
  status.textContent=existing?'This week’s check-in is saved.':'';
 }
 root.LHRFRefreshWeeklyCheckin=updateCheckin;
 save.onclick=()=>{
  const {state,week,key}=reviewContext(),now=new Date();
  const existing=savedCheckin(state,key,reviewPeriod(state,week,now),now);
  if(existing){openReview(state,week,existing);return}
  if(Object.values(controls).some(x=>!x.value)){status.textContent='Choose fatigue, soreness and discomfort before saving.';return}
  const check={date:now.toISOString(),programmeWeekKey:key,
   ...Object.fromEntries(Object.entries(controls).map(([k,v])=>[k,v.value])),notes:notes.value.slice(0,2000)};
  const next={...state,weeklyCheckins:[...(state.weeklyCheckins||[]),check]};
  if(!commit(next)){status.textContent='Could not save the check-in. Please try again.';return}
  updateCheckin();openReview(getData(),week,check);
 };
 sync.onclick=()=>root.LHRFOpenGarminReview?.(undefined,'Back to check-in');
 const oldRefresh=root.refresh;if(typeof oldRefresh==='function')root.refresh=function(){oldRefresh();renderHistory()};renderHistory();
}
const api={history,completedRecord,recordedWorkout,recordedSet,runInterruptionField,strengthGroups,assess,weeklySummary,mount};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFTrainingReview=api;
})(typeof globalThis!=='undefined'?globalThis:this);
