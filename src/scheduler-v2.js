/* Preview-only, deterministic scheduling. No storage or live app writes. */
(function(root){
'use strict';
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
function index(d){const n=typeof d==='number'?d:DAYS.findIndex(x=>x.toLowerCase()===String(d).slice(0,3).toLowerCase());if(!Number.isInteger(n)||n<0||n>6)throw Error('Unknown day: '+d);return n}
function scheduleWeek(config,week){
 const c=config||{},days=[...new Set((c.availableDays?.length?c.availableDays:DAYS).map(index))].sort((a,b)=>a-b);
 const items=[...(week.strengths||[]).map((s,i)=>({id:'s'+i,kind:'strength',lift:s.lift,exposure:s.exposure||1,hard:!!(s.top&&s.top.rpe>=8)})),...(week.runs||[]).map((r,i)=>({id:'r'+i,kind:'run',runType:r.type,hard:['quality','long'].includes(r.type)}))];
 const fixed=new Map(),used=new Set();
 for(const f of c.fixedSessions||[]){
  const d=index(f.day);if(!days.includes(d))throw Error('Fixed day unavailable: '+f.day);
  const item=items.find(x=>!used.has(x.id)&&x.kind===f.kind&&(f.lift==null||x.lift===f.lift)&&(f.runType==null||x.runType===f.runType)&&(f.exposure==null||x.exposure===f.exposure));
  if(!item)throw Error('Cannot match fixed session');used.add(item.id);fixed.set(item.id,d);
 }
 const lower=x=>x.kind==='strength'&&['squat','deadlift'].includes(x.lift);
 const demanding=x=>x.kind==='run'&&['quality','long'].includes(x.runType);
 const placed=[];
 function cost(item,day){let n=0;for(const p of placed){const gap=Math.abs(p.dayIndex-day);if(gap===0)n+=4;if(item.hard&&p.hard)n+=gap===0?14:gap===1?7:0;if((lower(item)&&demanding(p))||(lower(p)&&demanding(item)))n+=gap===0?18:gap===1?9:0}return n+(item.runType==='long'&&day!==5?1:0)}
 for(const item of [...items].sort((a,b)=>Number(fixed.has(b.id))-Number(fixed.has(a.id))||Number(b.hard)-Number(a.hard))){
  if(!days.length)break;
  const choices=fixed.has(item.id)?[fixed.get(item.id)]:days;
  const day=choices.reduce((best,d)=>cost(item,d)<cost(item,best)?d:best,choices[0]);
  placed.push({...item,dayIndex:day,day:DAYS[day],fixed:fixed.has(item.id)});
 }
 const warnings=[];for(let i=0;i<placed.length;i++)for(let j=i+1;j<placed.length;j++){
  const a=placed[i],b=placed[j],gap=Math.abs(a.dayIndex-b.dayIndex);
  if(((lower(a)&&demanding(b))||(lower(b)&&demanding(a)))&&gap<=1)warnings.push('Lower-body lift and demanding run '+gap+' days apart: '+a.id+'/'+b.id);
  else if(a.hard&&b.hard&&gap===0)warnings.push('Two hard sessions on '+a.day+': '+a.id+'/'+b.id);
 }
 return {week:week.week,sessions:placed.sort((a,b)=>a.dayIndex-b.dayIndex),warnings,requiresReview:warnings.length>0,unscheduled:items.length-placed.length,limitations:['Day-level spacing only; no times or measured fatigue.','Fixed athlete constraints never silently overridden.']};
}
const api={scheduleWeek,DAYS};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFSchedulerV2=api;
})(typeof globalThis!=='undefined'?globalThis:this);
