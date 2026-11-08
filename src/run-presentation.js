/* Display-only run formatting. Original values and provenance are never rewritten. */
(function(root){'use strict';
const valid=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
function duration(minutes){if(!valid(minutes))return 'Not recorded';const n=Math.round(minutes*60),h=Math.floor(n/3600),m=Math.floor(n%3600/60),s=String(n%60).padStart(2,'0');return h?h+':'+String(m).padStart(2,'0')+':'+s:m+':'+s}
function distance(km){return valid(km)?km.toFixed(2)+' km':'Not recorded'}
function pace(minutes,km){return valid(minutes)&&km>0?duration(minutes/km)+'/km':'Not recorded'}
function splitRows(run){const rows=Array.isArray(run.splits)?run.splits:[],localLaps=run.source==='garmin-local'&&/FIT|TCX/.test(run.totalsSource||'');return rows.map((s,i)=>{const type=String(s.type||s.splitType||s.kind||'').toLowerCase(),total=/total|overall|activity/.test(type)||(valid(s.km)&&valid(run.km)&&Math.abs(s.km-run.km)<.005&&valid(s.min)&&valid(run.min)&&Math.abs(s.min-run.min)<.02),cumulative=s.cumulative===true||/cumul/.test(type),lap=!total&&!cumulative&&(localLaps||/^(lap|segment|interval)$/.test(type));return {label:total?'Activity total':cumulative?'Cumulative checkpoint '+(i+1):lap?'Recorded segment '+(i+1):'Garmin summary entry '+(i+1),detail:distance(s.km)+' · '+duration(s.min)+(s.avgHr?' · '+s.avgHr+' bpm':''),kind:total?'total':cumulative?'cumulative':lap?'segment':'unconfirmed'}})}
function completedRuns(state,session,week){
 const ids=[session.id,session.parentId].filter(Boolean);
 const matching=(state.completedWorkouts||[]).filter(w=>ids.includes(w.id)&&Number(w.week||1)===Number(week));
 return (state.runs||[]).filter(run=>matching.some(workout=>{
  if(workout.sourceActivityId&&run.sourceActivityId)return workout.source===run.source&&String(workout.sourceActivityId)===String(run.sourceActivityId);
  return ids.includes(run.sessionId)&&String(run.date).slice(0,10)===String(workout.date).slice(0,10)&&Number(run.week||workout.week||1)===Number(week);
 }));
}
function comparison(run,prescription){const runs=prescription?.runs||[],knownDistance=runs.length&&runs.every(r=>valid(r.distanceKm)&&r.distanceKnown!==false),km=knownDistance?runs.reduce((n,r)=>n+r.distanceKm,0):null,knownTime=runs.length&&runs.every(r=>valid(r.minutes)),minutes=knownTime?runs.reduce((n,r)=>n+r.minutes,0):null;
 const ranges=runs.length&&runs.every(r=>r.durationRangeMinutes&&valid(r.durationRangeMinutes.min)&&valid(r.durationRangeMinutes.max))?{min:runs.reduce((n,r)=>n+r.durationRangeMinutes.min,0),max:runs.reduce((n,r)=>n+r.durationRangeMinutes.max,0)}:null;
 const time=ranges?duration(ranges.min)+'–'+duration(ranges.max):minutes===null?'Not prescribed':duration(minutes),targetPace=runs.length===1&&runs[0].pace?String(runs[0].pace):'See prescribed steps';
 const changes=[];if(km!==null&&valid(run.km)){const d=run.km-km;changes.push(Math.abs(d)<.005?'Distance matched':Math.abs(d).toFixed(2)+' km '+(d>0?'over':'under')+' prescribed')}
 if(valid(run.min)&&(ranges||minutes!==null)){const low=ranges?ranges.min:minutes,high=ranges?ranges.max:minutes,delta=run.min<low?run.min-low:run.min>high?run.min-high:0;changes.push(Math.abs(delta)<1/60?'Within estimated time':duration(Math.abs(delta))+(delta>0?' longer':' shorter')+' than estimate')}
 const paceBounds=targetPace.match(/(\d+):(\d{2})/g)?.map(t=>{const [m,s]=t.split(':').map(Number);return m+s/60});if(paceBounds?.length&&valid(run.min)&&run.km>0){const actual=run.min/run.km,low=Math.min(...paceBounds),high=Math.max(...paceBounds),delta=actual<low?actual-low:actual>high?actual-high:0;changes.push(Math.abs(delta)<1/60?'Within target pace':duration(Math.abs(delta))+'/km '+(delta>0?'slower':'faster')+' than target')}
 return {distance:km===null?'Not prescribed':distance(km),duration:time,pace:targetPace,changes};
}
function renderSplits(host,run){const rows=splitRows(run);if(!rows.length)return;const detail=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Recorded segments & summaries ('+rows.length+')';detail.append(summary);const note=document.createElement('p');note.className='muted small';note.textContent=rows.some(r=>r.kind==='unconfirmed')?'Garmin summary entries may overlap or include cumulative totals. Segment boundaries were not supplied; do not add these entries together.':'Segments are individual laps. Cumulative checkpoints and activity totals are measured from the start and are not additional segments.';detail.append(note);for(const row of rows){const p=document.createElement('p');p.textContent=row.label+' · '+row.detail;detail.append(p)}host.append(detail)}
const api={duration,distance,pace,splitRows,completedRuns,comparison,renderSplits};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFRunPresentation=api;
})(typeof globalThis!=='undefined'?globalThis:this);
