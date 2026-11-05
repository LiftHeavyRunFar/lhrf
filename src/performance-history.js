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
function references(state,live,history,now=new Date()){
 const cutoff=day(live.started)||day(now.toISOString());if(!cutoff)return [];
 const out=[];
 for(const ex of live.ex||[]){
  if(ex[5]?.optional||ex[5]?.role==='optional'||out.some(x=>x.key===JSON.stringify(identity(ex[0],ex[5]))))continue;
  const candidates=[];
  for(const row of history||[]){
   const sets=(row.sets||[]).filter(s=>{const date=day(s.date||row.date);return date&&date<cutoff&&suitable(s)&&matches(ex,s)});
   const dates=[...new Set(sets.map(s=>day(s.date||row.date)))];
   for(const date of dates)candidates.push({row,date,sets:sets.filter(s=>day(s.date||row.date)===date)});
  }
  candidates.sort((a,b)=>b.date.localeCompare(a.date)||String(b.row.date).localeCompare(String(a.row.date)));
  const chosen=candidates[0];if(chosen)out.push({...chosen,exercise:ex[0],key:JSON.stringify(identity(ex[0],ex[5])),setupMissing:chosen.sets.some(s=>!s.variantId||!ex[5]?.variantId)});
 }
 return out;
}
function previousRun(live,history,now=new Date()){
 const cutoff=day(live.started)||day(now.toISOString()),role=live.runs?.[0]?.role;if(!cutoff||!live.runs?.length)return null;
 const rows=(history||[]).map(row=>({...row,runs:(row.runs||[]).filter(r=>{const date=day(r.date||row.date);return date&&date<cutoff&&r.km>0&&r.min>0&&!r.failed&&r.completed!==false&&(!role||r.type===role)})})).filter(row=>row.runs.length);
 return rows.sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0]||null;
}
const api={day,identity,suitable,matches,references,previousRun};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFPerformanceHistory=api;
})(typeof globalThis!=='undefined'?globalThis:this);
