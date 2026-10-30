/* Reviewed Garmin imports and explicit links to approved planned runs. */
(function(root){'use strict';
const BRIDGE='https://lhrf-garmin-import.equalmelon128.chatgpt.site';
function validatePayload(payload){
 if(payload?.version!==1||!Array.isArray(payload.runs)||payload.runs.length>20)throw Error('Unexpected Garmin import response.');
 const seen=new Set();return payload.runs.map(r=>{
  const id=String(r.sourceActivityId||'');if(r.source!=='garmin-personal'||!/^\d{1,25}$/.test(id)||seen.has(id))throw Error('Invalid or duplicate Garmin activity.');seen.add(id);
  if(!Number.isFinite(Date.parse(r.date))||!Number.isFinite(r.km)||r.km<=0||r.km>1000||!Number.isFinite(r.min)||r.min<=0||r.min>10080)throw Error('Garmin activity has invalid distance, time or date.');
  const hr=n=>Number.isFinite(n)&&n>=20&&n<=260?n:null;
  const splits=(Array.isArray(r.splits)?r.splits:[]).slice(0,200).filter(s=>Number.isFinite(s.km)&&s.km>=0&&Number.isFinite(s.min)&&s.min>0).map(s=>({km:s.km,min:s.min,avgHr:hr(s.avgHr),maxHr:hr(s.maxHr)}));
  const seconds=Math.round(r.min*60/r.km),pace=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+'/km';
  return {date:new Date(r.date).toISOString(),type:'Garmin run import',name:String(r.name||'Garmin run').slice(0,150),km:r.km,min:r.min,rpe:null,pace,avgHr:hr(r.avgHr),maxHr:hr(r.maxHr),source:'garmin-personal',sourceActivityId:id,splits,elapsedMinutes:Number.isFinite(r.elapsedMinutes)?r.elapsedMinutes:null,movingMinutes:Number.isFinite(r.movingMinutes)?r.movingMinutes:null};
 });
}
function reviewRuns(state,payload){return validatePayload(payload).map(run=>({run,duplicate:(state.runs||[]).some(r=>r.source==='garmin-personal'&&String(r.sourceActivityId)===run.sourceActivityId),matches:(state.runs||[]).map((r,i)=>({r,i})).filter(({r})=>r.source!=='garmin-personal'&&Number.isFinite(Date.parse(r.date))&&Math.abs(Date.parse(r.date)-Date.parse(run.date))<12*3600000&&Math.abs(Number(r.km)-run.km)<=Math.max(.15,run.km*.03)&&Math.abs(Number(r.min)-run.min)<=Math.max(2,run.min*.08)).map(x=>x.i)}));}
const localDay=value=>{const d=new Date(value);return Number.isFinite(+d)?[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'):null};
function plannedSessions(state,run){
 const c=state.customRoadmap,coach=typeof module==='object'&&module.exports?require('./coach-engine'):root.LHRFCoach;
 if(!c?.startDate||!coach)return [];
 const start=new Date(c.startDate+'T12:00:00'),actual=new Date(localDay(run.date)+'T12:00:00');if(!Number.isFinite(+start)||!Number.isFinite(+actual))return [];
 start.setDate(start.getDate()-(start.getDay()+6)%7);
 const days={mon:0,monday:0,tue:1,tuesday:1,wed:2,wednesday:2,thu:3,thursday:3,fri:4,friday:4,sat:5,saturday:5,sun:6,sunday:6},out=[];
 for(let week=1;week<=Math.min(104,Number(c.weeks)||1);week++){
  const base=new Date(start);base.setDate(base.getDate()+(week-1)*7);if(Math.abs((base-actual)/86400000)>15)continue;
  const sessions=week===Number(state.activeCustomWeek||1)&&state.activeSchedule?.length?state.activeSchedule:coach.createEngine({data:state,schedule:[]}).generatedSessions(c,week);
  for(const session of sessions){if(!session.runs?.length)continue;const offset=days[String(session.day||'').toLowerCase()]??session.dayIndex;if(!Number.isInteger(offset)||offset<0||offset>6)continue;
   const date=new Date(base);date.setDate(date.getDate()+offset);const distance=Math.round((Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())-Date.UTC(actual.getFullYear(),actual.getMonth(),actual.getDate()))/86400000);if(Math.abs(distance)>7)continue;
   const mixed=!!session.ex?.length,id=mixed?session.id+'::run':session.id;
   out.push({key:JSON.stringify([week,id,localDay(date)]),id,parentId:mixed?session.id:null,component:'run',week,plannedDate:localDay(date),day:session.day,name:session.runs.map(r=>r.name).join(', '),prescription:{ex:[],runs:session.runs},distance});
  }
 }
 return out.sort((a,b)=>Math.abs(a.distance)-Math.abs(b.distance)||a.plannedDate.localeCompare(b.plannedDate));
}
function occupied(state,target,row){
 const same=x=>Number(x.week||1)===target.week&&(x.sessionId===target.id||x.id===target.id||target.parentId&&(x.sessionId===target.parentId||x.id===target.parentId));
 const owns=row&&same(row);
 return (state.runs||[]).some(r=>r!==row&&same(r))||(!owns&&(state.completedWorkouts||[]).some(same));
}
function setPlannedLink(state,row,key){
 if(key===undefined)return;
 const previous=row.plannedSession;
 if(row.sessionId&&!previous){if(key==='')return;throw Error('This activity retains its existing LHRF session link.');}
 if(key===''){
  if(!previous)return;
  state.completedWorkouts=(state.completedWorkouts||[]).filter(w=>!(w.source==='garmin-personal'&&w.sourceActivityId===row.sourceActivityId));
  delete row.plannedSession;delete row.sessionId;delete row.session;delete row.week;return;
 }
 const target=plannedSessions(state,row).find(t=>t.key===key);if(!target)throw Error('The planned session changed or is outside seven days of this activity. Review the link again.');
 if(row.sessionId&&!previous&&row.sessionId!==target.id)throw Error('This existing log already belongs to another session.');
 if(occupied(state,target,row))throw Error('That planned run is already completed or linked to another activity.');
 state.completedWorkouts=state.completedWorkouts||[];
 // Only remove completion records created by this importer, never athlete logs.
 state.completedWorkouts=state.completedWorkouts.filter(w=>!(w.source==='garmin-personal'&&w.sourceActivityId===row.sourceActivityId));
 row.plannedSession=target;row.sessionId=target.id;row.session=target.name;row.week=target.week;
 if(!state.completedWorkouts.some(w=>Number(w.week||1)===target.week&&(w.id===target.id||target.parentId&&w.id===target.parentId)))state.completedWorkouts.push({id:target.id,parentId:target.parentId,component:'run',name:target.name,day:target.day,week:target.week,plannedDate:target.plannedDate,date:row.date,completedRun:true,completedSets:0,plannedSets:0,prescription:target.prescription,source:'garmin-personal',sourceActivityId:row.sourceActivityId});
}
function mergeRuns(state,choices){
 const next=JSON.parse(JSON.stringify(state));next.runs=next.runs||[];let added=0,linked=0;
 for(const choice of choices){const run=validatePayload({version:1,runs:[choice.run]})[0];let row=next.runs.find(r=>r.source==='garmin-personal'&&String(r.sourceActivityId)===run.sourceActivityId);
  if(choice.action==='skip')continue;
  if(row){if(choice.action==='existing')setPlannedLink(next,row,choice.plannedKey);continue;}
  if(choice.action==='new'){row=run;next.runs.push(row);added++;}
  else if(/^link:\d+$/.test(choice.action||'')){const index=Number(choice.action.slice(5)),old=next.runs[index];if(!old||!reviewRuns(next,{version:1,runs:[run]})[0].matches.includes(index))throw Error('The matching log changed. Review the import again.');row={...old,...run,rpe:old.rpe??null,type:old.type||run.type,avgHr:run.avgHr??old.avgHr??null,maxHr:run.maxHr??old.maxHr??null,importOriginal:old};next.runs[index]=row;linked++;}
  if(row)setPlannedLink(next,row,choice.plannedKey);
 }
 return {state:next,added,linked};
}
function mount({getData,commit}){
 const $=id=>document.getElementById(id),button=$('garminImportOpen'),status=$('garminIncomingStatus'),list=$('garminIncomingList'),save=$('garminIncomingSave');if(!button)return;
 const management=document.createElement('details');management.id='garminSavedLinks';const summary=document.createElement('summary');summary.textContent='Link a previously imported run';management.append(summary);list.parentNode.append(management);
 function picker(run,row){const select=document.createElement('select');select.setAttribute('aria-label','Planned session for '+localDay(run.date));
  const options=[['','No planned session — extra run']];for(const t of plannedSessions(getData(),run))if(!occupied(getData(),t,row))options.push([t.key,t.plannedDate+' · Week '+t.week+' · '+t.name+(t.distance===0?' · same day':' · '+Math.abs(t.distance)+' day'+(Math.abs(t.distance)===1?'':'s')+' '+(t.distance>0?'early':'late'))]);
  for(const [value,label]of options){const o=document.createElement('option');o.value=value;o.textContent=label;select.append(o)}select.value=row?.plannedSession?.key||'';return select;
 }
 function commitChoices(choices){if(choices.some(c=>c.plannedKey!==undefined)&&root.LHRFLive?.get?.())throw Error('Finish or discard your current workout before changing planned-session links.');const result=mergeRuns(getData(),choices);result.state.garminSync={...(getData().garminSync||{}),savedAt:new Date().toISOString()};if(!commit(result.state))throw Error('Could not save. Existing records are unchanged.');renderSaved();return result;}
 function renderSaved(){management.querySelectorAll('div').forEach(n=>n.remove());for(const run of (getData().runs||[]).filter(r=>r.source==='garmin-personal').slice(-20).reverse()){
  const row=document.createElement('div');row.className='entry';const text=document.createElement('p');text.textContent=localDay(run.date)+' · '+run.km.toFixed(2)+' km'+(run.plannedSession?' · planned '+run.plannedSession.plannedDate:' · unlinked');if(run.sessionId&&!run.plannedSession){text.textContent+=' · linked through existing LHRF log';row.append(text);management.append(row);continue;}const select=picker(run,run),button=document.createElement('button');button.type='button';button.textContent='Save session link';button.onclick=()=>{try{commitChoices([{run,action:'existing',plannedKey:select.value}]);status.textContent='Session link saved. Actual activity date retained.';}catch(e){status.textContent=e.message}};row.append(text,select,button);management.append(row);
 }}renderSaved();
 let pending=null,items=[],source=null,nonce=null;
 button.onclick=()=>{nonce=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');pending=null;items=[];list.replaceChildren();save.hidden=true;
  source=window.open(BRIDGE+'/?state='+nonce,'lhrf-garmin-import','popup,width=520,height=780');status.textContent=source?'Open the private connection window. After fetching, send your runs back here for review.':'Your browser blocked the connection window. Allow pop-ups for LHRF and try again.';
 };
 window.addEventListener('message',event=>{
  if(event.origin!==BRIDGE||event.source!==source||!nonce||event.data?.state!==nonce)return;
  if(event.data.type==='lhrf-garmin-ready'){status.textContent='Private connection opened. Fetch your runs there, then send them here for review.';return;}
  if(event.data.type!=='lhrf-garmin-import')return;
  try{items=reviewRuns(getData(),event.data.payload);pending=event.data.payload;nonce=null;list.replaceChildren();
   items.forEach((item,i)=>{const row=document.createElement('div');row.className='entry';const text=document.createElement('p');text.textContent=new Date(item.run.date).toLocaleDateString('en-GB')+' · '+item.run.km.toFixed(2)+' km · '+item.run.min.toFixed(1)+' min · '+item.run.pace+(item.run.avgHr?' · avg HR '+item.run.avgHr+' bpm':'')+(item.run.maxHr?' · max HR '+item.run.maxHr+' bpm':'');row.append(text);
    const select=document.createElement('select');select.dataset.importIndex=i;select.setAttribute('aria-label','Import action for '+new Date(item.run.date).toLocaleDateString('en-GB'));
    const options=item.duplicate?[['skip','Already imported']]:item.matches.length?[['skip','Possible existing log — skip'],...item.matches.map(n=>['link:'+n,'Add Garmin details to existing log']),['new','Save as a separate run']]:[['new','Save this run'],['skip','Skip']];
    for(const [value,label]of options){const o=document.createElement('option');o.value=value;o.textContent=label;select.append(o)}select.disabled=item.duplicate;row.append(select);if(!item.duplicate){const label=document.createElement('p');label.textContent='Complete a planned run (optional · within seven days)';const planned=picker(item.run);planned.dataset.plannedIndex=i;row.append(label,planned);select.onchange=()=>{planned.disabled=select.value==='skip'||select.value.startsWith('link:')};select.onchange();}
    if(item.run.splits.length){const d=document.createElement('details'),s=document.createElement('summary');s.textContent='Recorded splits ('+item.run.splits.length+')';d.append(s);for(const split of item.run.splits){const p=document.createElement('p');p.textContent=split.km.toFixed(2)+' km · '+split.min.toFixed(1)+' min'+(split.avgHr?' · '+split.avgHr+' bpm average':'');d.append(p)}row.append(d)}
    list.append(row);
   });save.hidden=false;status.textContent=items.length+' runs received. Review matches before saving. Your programme and bench work stay unchanged.';source?.close();
  }catch(e){status.textContent=e.message;}
 });
 save.onclick=()=>{if(!pending)return;try{const choices=items.map((item,i)=>({run:item.run,action:list.querySelector('[data-import-index="'+i+'"]').value,plannedKey:list.querySelector('[data-import-index="'+i+'"]').value==='new'?list.querySelector('[data-planned-index="'+i+'"]').value:undefined}));if(choices.some(c=>c.plannedKey)&&root.LHRFLive?.get?.())throw Error('Finish or discard your current workout before linking an imported run.');const result=mergeRuns(getData(),choices);result.state.garminSync={savedAt:new Date().toISOString(),start:pending.start||null,end:pending.end||null,truncated:pending.truncated===true};if(!commit(result.state))throw Error('Could not save. Existing records are unchanged.');status.textContent=result.added+' runs saved; '+result.linked+' existing logs updated with Garmin details.';save.hidden=true;pending=null;list.replaceChildren();renderSaved();}catch(e){status.textContent=e.message}};
}
const api={BRIDGE,validatePayload,reviewRuns,plannedSessions,occupied,mergeRuns,mount};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFGarminImport=api;
})(typeof globalThis!=='undefined'?globalThis:this);
