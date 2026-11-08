/* Read-only workout context. Never supplies coaching loads or changes stored rows. */
(function(root){'use strict';
const registry=typeof module==='object'&&module.exports?require('./exercise-registry'):root.LHRFExercises;
const norm=x=>String(x||'').trim().toLowerCase();
const legacyBarbell=new Set(['squat','bench','bench-press','deadlift']);
function day(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value)||!Number.isFinite(Date.parse(value)))return null;
 const date=value.slice(0,10);if(new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date)return null;
 return value.length===10?date:new Date(value).toLocaleDateString('en-CA',{timeZone:'Europe/London'});
}
function identity(name,meta={}){
 const registered=registry?.resolve(meta.exerciseId||name),label=registry?.resolve(name);
 if(meta.exerciseId&&label&&label.id!==meta.exerciseId)return null;
 return {id:meta.exerciseId||registered?.id||norm(name),variant:meta.variantId||null,load:meta.loadType||registered?.loadType||null,dose:meta.doseUnit||registered?.doseUnit||null};
}
function suitable(s){
 return !s.failed&&!s.techniqueFailed&&!s.warmup&&!s.optional&&s.completed!==false&&
 ![s.role,s.category].some(value=>['optional','warmup','warm-up','failed'].includes(norm(value)))&&
 typeof s.weight==='number'&&Number.isFinite(s.weight)&&s.weight>=0&&typeof s.reps==='number'&&Number.isFinite(s.reps)&&s.reps>0&&(s.doseUnit==='seconds'||Number.isInteger(s.reps))&&
 (s.weight>0||['bodyweight','assistance-kg'].includes(identity(s.exercise,s)?.load))&&
 (s.rpe==null||typeof s.rpe==='number'&&s.rpe>=1&&s.rpe<=10)&&!s.evidenceReview?.rpe?.approximate&&s.rpeReliable!==false;
}
function matches(ex,s){
 const a=identity(ex[0],ex[5]),b=identity(s.exercise,s);if(!a||!b||!a.id||a.id!==b.id||a.load!==b.load||a.dose!==b.dose)return false;
 if(a.variant&&b.variant)return a.variant===b.variant;
 // Legacy basic barbell rows can be contextual evidence, with setup uncertainty visible.
 // Machines, accessories and explicit variations require a recorded exact setup.
 return legacyBarbell.has(a.id);
}
function executionMatches(ex,set,row){
 const known=value=>norm(value)==='unconfirmed'?'':norm(value);
 const expected=known(ex[5]?.execution),recorded=known(set.execution);
 if(!expected)return true;
 if(recorded)return recorded===expected;
 const prescribed=(row.prescription?.ex||[]).filter(candidate=>
  matches([set.exercise,0,0,0,0,set],{exercise:candidate[0],...(candidate[5]||{})})&&
  (!set.role||!candidate[5]?.role||set.role===candidate[5].role));
 const evidence=[known(row.execution),...prescribed.map(candidate=>known(candidate[5]?.execution))].filter(Boolean);
 return evidence.every(value=>value===expected);
}
// Set roles (top/backoff/straight) are not training purposes. Never infer purpose
// from loads, reps, RPE, weekday, programme-week numbers or a new engine replay.
const purposes={heavy:'heavy',volume:'volume',speed:'speed/technique',technique:'speed/technique',practice:'speed/technique',recovery:'recovery',hypertrophy:'hypertrophy',strength:'strength',maintenance:'maintenance',endurance:'endurance',power:'power'};
function purpose(meta={}){
 meta=meta||{};
 const values=[meta.trainingPurpose,meta.trainingRole,meta.benchRole].map(x=>purposes[norm(x)]).filter(Boolean);
 return {value:values.length&&new Set(values).size===1?values[0]:null,ambiguous:new Set(values).size>1};
}
function frozenSessions(state){
 const out=[];
 const add=(weeks,config)=>{for(const week of weeks||[])for(const session of week.sessions||[]){
  let date=day(session.scheduledDate);
  if(!date&&day(config?.startDate)&&Number.isInteger(week.week)&&week.week>0){
   const index=['mon','tue','wed','thu','fri','sat','sun'].indexOf(norm(session.day).slice(0,3));
   if(index>=0){const d=new Date(config.startDate+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7+(week.week-1)*7+index);date=d.toISOString().slice(0,10);}
  }
  if(date)out.push({session,date});
 }};
 add(state.reviewedProgramme?.weeks,state.reviewedProgramme?.config);
 for(const archive of state.programmeArchive||[])add(archive.weeks||[{week:archive.week,sessions:archive.schedule||[]}],archive.programme);
 for(const session of state.activeSchedule||[])if(day(session.scheduledDate))out.push({session,date:day(session.scheduledDate)});
 return out;
}
function recordedPurpose(state,row,set,date,snapshots=frozenSessions(state)){
 const evidence=[],add=(meta,source)=>{const result=purpose(meta);if(result.value||result.ambiguous)evidence.push({...result,source})};
 add(set,'recorded set');add(row,'recorded session');
 const compatible=e=>matches([set.exercise,0,0,0,0,set],{exercise:e[0],...(e[5]||{})})&&(!set.role||!e[5]?.role||set.role===e[5].role);
 for(const ex of row.prescription?.ex||[])if(compatible(ex))add(ex[5],'saved prescription');
 // Legacy set timestamps can differ from the completion timestamp. An exact
 // historical link plus the actual day retains its saved purpose without
 // requiring any identity to match the current programme.
 if(!evidence.length&&(set.sessionId||row.id))for(const completed of state.completedWorkouts||[])if(completed.id===(set.sessionId||row.id)&&day(completed.date)===date)for(const ex of completed.prescription?.ex||[])if(compatible(ex))add(ex[5],'saved session prescription');
 // Dates plus compatible exercise/role select preserved evidence; old/new IDs need
 // not match. Conflicting evidence remains unknown, even on the same weekday.
 for(const entry of snapshots)if(entry.date===date)for(const ex of entry.session.ex||[])if(compatible(ex))add(ex[5],'preserved programme');
 const values=new Set(evidence.map(e=>e.value).filter(Boolean)),ambiguous=evidence.some(e=>e.ambiguous)||values.size>1;
 return {value:!ambiguous&&values.size===1?[...values][0]:null,ambiguous,source:evidence.map(e=>e.source).filter((x,i,xs)=>xs.indexOf(x)===i).join(', ')||'not recorded'};
}
function references(state,live,history,now=new Date(),{comparableOnly=false}={}){
 const cutoff=day(live.started)||day(now.toISOString());if(!cutoff)return [];
 const out=[],snapshots=frozenSessions(state);
 for(const ex of live.ex||[]){
  const currentPurpose=purpose(ex[5]),key=JSON.stringify([identity(ex[0],ex[5]),currentPurpose.value]);
  if(ex[5]?.optional||ex[5]?.role==='optional'||out.some(x=>x.key===key))continue;
  const candidates=[];
  for(const row of history||[]){
   const groups=new Map();
   for(const set of row.sets||[]){
    const date=day(set.date||row.date);
    if(!date||date>=cutoff||!suitable(set)||!matches(ex,set)||comparableOnly&&!executionMatches(ex,set,row))continue;
    const classification=recordedPurpose(state,row,set,date,snapshots),groupKey=JSON.stringify([date,classification.value,classification.ambiguous]);
    if(!groups.has(groupKey))groups.set(groupKey,{row,date,sets:[],purpose:classification});groups.get(groupKey).sets.push(set);
   }
   candidates.push(...groups.values());
  }
  const samePurpose=c=>!!currentPurpose.value&&currentPurpose.value===c.purpose.value;
  candidates.sort((a,b)=>Number(samePurpose(b))-Number(samePurpose(a))||b.date.localeCompare(a.date)||String(b.row.date).localeCompare(String(a.row.date)));
  const role=ex[5]?.role,matchingRole=s=>!role||!s.role||s.role===role;
  const chosen=comparableOnly?candidates.find(c=>samePurpose(c)&&c.sets.some(matchingRole)):candidates[0];
  if(!chosen)continue;
  const comparisonSets=comparableOnly?chosen.sets.filter(matchingRole):chosen.sets;
  const pairedRole=role==='top'?'backoff':role==='backoff'?'top':null;
  const sets=comparableOnly?chosen.sets.filter(s=>matchingRole(s)||s.role===pairedRole):chosen.sets;
  out.push({...chosen,sets,...(comparableOnly?{comparisonSets}:{}),exercise:ex[0],key,currentPurpose,samePurpose:samePurpose(chosen),alternative:!samePurpose(chosen),setupMissing:sets.some(s=>!s.variantId||!ex[5]?.variantId)});
 }
 return out;
}
function previousRun(live,history,now=new Date()){
 const cutoff=day(live.started)||day(now.toISOString()),role=live.runs?.[0]?.role;if(!cutoff||!live.runs?.length)return null;
 const rows=(history||[]).map(row=>({...row,runs:(row.runs||[]).filter(r=>{const date=day(r.date||row.date);return date&&date<cutoff&&r.km>0&&r.min>0&&!r.failed&&r.completed!==false&&(!role||r.type===role)})})).filter(row=>row.runs.length);
 return rows.sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0]||null;
}
const api={day,identity,suitable,matches,purpose,frozenSessions,recordedPurpose,references,previousRun};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFPerformanceHistory=api;
})(typeof globalThis!=='undefined'?globalThis:this);
