/* Personal Garmin import: pure validation/merge, no programme or completion mutations. */
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
function mergeRuns(state,choices){
 const next=JSON.parse(JSON.stringify(state));next.runs=next.runs||[];let added=0,linked=0;
 for(const choice of choices){const run=validatePayload({version:1,runs:[choice.run]})[0];if(next.runs.some(r=>r.source==='garmin-personal'&&String(r.sourceActivityId)===run.sourceActivityId))continue;
  if(choice.action==='new'){next.runs.push(run);added++;}
  else if(/^link:\d+$/.test(choice.action||'')){const index=Number(choice.action.slice(5)),old=next.runs[index];if(!old||!reviewRuns(next,{version:1,runs:[run]})[0].matches.includes(index))throw Error('The matching log changed. Review the import again.');next.runs[index]={...old,...run,rpe:old.rpe??null,type:old.type||run.type,avgHr:run.avgHr??old.avgHr??null,maxHr:run.maxHr??old.maxHr??null,importOriginal:old};linked++;}
 }
 return {state:next,added,linked};
}
function mount({getData,commit}){
 const $=id=>document.getElementById(id),button=$('garminImportOpen'),status=$('garminIncomingStatus'),list=$('garminIncomingList'),save=$('garminIncomingSave');if(!button)return;
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
    for(const [value,label]of options){const o=document.createElement('option');o.value=value;o.textContent=label;select.append(o)}select.disabled=item.duplicate;row.append(select);
    if(item.run.splits.length){const d=document.createElement('details'),s=document.createElement('summary');s.textContent='Recorded splits ('+item.run.splits.length+')';d.append(s);for(const split of item.run.splits){const p=document.createElement('p');p.textContent=split.km.toFixed(2)+' km · '+split.min.toFixed(1)+' min'+(split.avgHr?' · '+split.avgHr+' bpm average':'');d.append(p)}row.append(d)}
    list.append(row);
   });save.hidden=!items.length;status.textContent=items.length+' runs received. Review matches before saving. Your programme and bench work stay unchanged.';source?.close();
  }catch(e){status.textContent=e.message;}
 });
 save.onclick=()=>{if(!pending)return;try{const choices=items.map((item,i)=>({run:item.run,action:list.querySelector('[data-import-index="'+i+'"]').value}));const result=mergeRuns(getData(),choices);if(!commit(result.state))throw Error('Could not save. Existing records are unchanged.');status.textContent=result.added+' runs saved; '+result.linked+' existing logs updated with Garmin details.';save.hidden=true;pending=null;list.replaceChildren();}catch(e){status.textContent=e.message}};
}
const api={BRIDGE,validatePayload,reviewRuns,mergeRuns,mount};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFGarminImport=api;
})(typeof globalThis!=='undefined'?globalThis:this);
