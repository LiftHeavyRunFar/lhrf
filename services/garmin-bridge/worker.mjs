const GARMIN='https://personal.connectapi.garmin.com';
const APP='https://liftheavyrunfar.github.io';
const TOKEN='/personalapitoken-service/personal-api/personal-api-key/token';
const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"};
const json=(data,status=200)=>Response.json(data,{status,headers});
export function normalizeRun(a){
 if(!a||typeof a!=='object')return null;
 const type=String(a.activityType?.typeKey||'');if(!/(running|^run$|_run$)/i.test(type))return null;
 const id=String(a.activityId||''),distance=Number(a.distance),seconds=Number(a.duration);
 if(!/^\d{1,25}$/.test(id)||!Number.isFinite(distance)||distance<=0||distance>1000000||!Number.isFinite(seconds)||seconds<=0||seconds>604800)return null;
 const stamp=String(a.startTimeGMT||'');const date=new Date(/[zZ]|[+-]\d\d:\d\d$/.test(stamp)?stamp:stamp+'Z');if(!Number.isFinite(+date))return null;
 const hr=n=>Number.isFinite(Number(n))&&Number(n)>=20&&Number(n)<=260?Number(n):null;
 return {source:'garmin-personal',sourceActivityId:id,date:date.toISOString(),name:String(a.activityName||'Garmin run').slice(0,150),km:distance/1000,min:seconds/60,elapsedMinutes:Number.isFinite(Number(a.elapsedDuration))&&Number(a.elapsedDuration)>0?Number(a.elapsedDuration)/60:null,movingMinutes:Number.isFinite(Number(a.movingDuration))&&Number(a.movingDuration)>0?Number(a.movingDuration)/60:null,avgHr:hr(a.averageHR),maxHr:hr(a.maxHR),rpe:null};
}
export async function importRuns(key,{fetchImpl=fetch,now=new Date(),days=14}={}){
 if(typeof key!=='string'||!/^[\x21-\x7e]{1,2048}$/.test(key))throw Error('Enter your Garmin Personal API key.');
 const call=async(path,authorization,method='GET',format='json')=>{
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000),stage=path===TOKEN?'TOKEN':path.includes('/search/')?'ACTIVITIES':'SPLITS';
  try{
   const r=await fetchImpl(GARMIN+path,{method,headers:{Authorization:authorization,Accept:format==='text'?'text/plain':'application/json'},redirect:'manual',signal:controller.signal});
   if(!r.ok){if([400,401,403].includes(r.status))throw Error('Garmin did not authorise the connection. Check your Personal API key and its expiry.');if(r.status===429)throw Error('Garmin is busy. Try again later.');throw Error('Garmin could not complete the import. Try again later.');}
   try{return format==='text'?await r.text():await r.json()}catch{throw Error('Garmin returned an unreadable activity response.');}
  }catch(e){
   if(e.name==='AbortError')throw Error('Garmin request timed out ('+stage+'). No runs have been saved.');
   if(e instanceof TypeError){console.error(JSON.stringify({event:'garmin-network-failure',stage,name:e.name}));throw Error('Garmin connection could not be reached ('+stage+'). No runs have been saved.');}
   throw e;
  }finally{clearTimeout(timer)}
 };
 const token=(await call(TOKEN,'ApiKey '+key,'POST','text')).trim();
 if(!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token))throw Error('Garmin returned an unexpected authentication response.');
 const end=now.toISOString().slice(0,10),start=new Date(+now-days*86400000).toISOString().slice(0,10),runs=[];let truncated=false;
 for(let page=0;page<4;page++){
  const q=new URLSearchParams({start:String(page*50),limit:'50',startDate:start,endDate:end,activityType:'running'});
  const rows=await call('/activitylist-service/activities/search/activities?'+q,'Bearer '+token);
  if(!Array.isArray(rows))throw Error('Garmin returned an unexpected activity list.');
  for(const row of rows){const run=normalizeRun(row);if(run&&run.date.slice(0,10)>=start&&run.date.slice(0,10)<=end&&!runs.some(r=>r.sourceActivityId===run.sourceActivityId))runs.push(run);}
  if(rows.length<50)break;if(page===3)truncated=true;
 }
 const selected=runs.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,20);if(runs.length>20)truncated=true;
 for(let i=0;i<selected.length;i+=4)await Promise.all(selected.slice(i,i+4).map(async run=>{
  try{const detail=await call('/activity-service/activity/'+run.sourceActivityId,'Bearer '+token);
   run.splits=(Array.isArray(detail.splitSummaries)?detail.splitSummaries:[]).slice(0,200).map(s=>({km:Number(s.distance)/1000,min:Number(s.duration)/60,avgHr:Number(s.averageHR)||null,maxHr:Number(s.maxHR)||null})).filter(s=>Number.isFinite(s.km)&&s.km>=0&&Number.isFinite(s.min)&&s.min>0);
   run.splitStatus='available';
  }catch{run.splits=[];run.splitStatus='unavailable';}
 }));
 return {version:1,runs:selected,start,end,truncated};
}
const page=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LHRF · Garmin import</title><style>:root{color-scheme:dark;font:16px/1.5 system-ui;background:#030b15;color:#eef7ff}main{max-width:540px;margin:40px auto;padding:22px}h1{font-size:28px}label{display:block;margin:16px 0}input[type=password]{display:block;box-sizing:border-box;width:100%;padding:14px;background:#0b1c30;color:white;border:1px solid #49718c;border-radius:12px}button{padding:14px 20px;border:0;border-radius:12px;background:#078fff;color:#fff;font:700 16px system-ui;margin:8px 0}button:disabled{opacity:.5}small,p{color:#bed0df}a{color:#72ccff}#summary{white-space:pre-line}</style><main><h1>Import your Garmin runs</h1><p>Distance, time, pace, available splits and average/max heart rate from the last 14 days.</p><details><summary>One-time connection setup</summary><p>In Garmin Connect web, open Settings → Personal API Key → Create Key. This is for your personal data and does not require a business application.</p><a href="https://connect.garmin.com/app/settings/personalApiToken" target="_blank" rel="noopener noreferrer">Open Garmin key settings</a></details><label>Garmin Personal API key<input id="key" type="password" autocomplete="off" spellcheck="false"></label><label><input id="remember" type="checkbox"> Remember the key on this device</label><small>The key is sent only to this private connection service and Garmin. It is never included in training backups. With Remember off, it lasts only for this open page.</small><div><button id="fetch">Fetch recent runs</button> <button id="forget">Forget key</button></div><p id="status" role="status" aria-live="polite"></p><p id="summary"></p><button id="send" hidden>Send runs to LHRF</button><p>Imported runs are reviewed in LHRF before saving. Bench work, programme settings and existing logs stay intact.</p></main><script>
const ORIGIN='https://liftheavyrunfar.github.io',STORE='lhrf_private_garmin_key_v1',state=new URL(location.href).searchParams.get('state');
const $=id=>document.getElementById(id);let payload=null;try{const key=localStorage.getItem(STORE);if(key){$('key').value=key;$('remember').checked=true}}catch{}
const valid=()=>!!window.opener&&/^[a-f0-9]{64}$/.test(state||'');
if(!valid())$('status').textContent='Return to LHRF and tap Import recent Garmin runs again. Initial sign-in may have detached this window. Your key and runs will not be sent to another page.';
$('forget').onclick=()=>{try{localStorage.removeItem(STORE)}catch{}$('key').value='';$('remember').checked=false;payload=null;$('send').hidden=true;$('summary').textContent='';$('status').textContent='Key forgotten. Runs already saved in LHRF remain.'};
$('fetch').onclick=async()=>{if(!valid())return;const key=$('key').value.trim();if(!key){$('status').textContent='Paste your Garmin Personal API key first.';return}payload=null;$('send').hidden=true;$('fetch').disabled=true;$('status').textContent='Reading your recent Garmin runs…';try{const r=await fetch('/api/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key}),credentials:'same-origin',cache:'no-store',redirect:'error'});let result;try{result=await r.json()}catch{throw Error('The private connection session expired. Reopen this window from LHRF.')}if(!r.ok)throw Error(result.error||'Could not import runs.');payload=result;try{if($('remember').checked)localStorage.setItem(STORE,key);else localStorage.removeItem(STORE)}catch{}$('status').textContent=result.runs.length+' runs ready to review.'+(result.truncated?' Showing the 20 most recent runs.':'');$('summary').textContent=result.runs.map(r=>new Date(r.date).toLocaleDateString('en-GB')+' · '+r.km.toFixed(2)+' km · '+r.min.toFixed(1)+' min'+(r.avgHr?' · '+r.avgHr+' bpm average':'')).join('\\n');$('send').hidden=!result.runs.length;}catch(e){$('status').textContent=e.message==='Failed to fetch'?'Connection interrupted. No runs have been saved.':e.message}finally{$('fetch').disabled=false}};
$('send').onclick=()=>{if(!valid()||!payload)return;window.opener.postMessage({type:'lhrf-garmin-import',state,payload},ORIGIN);$('status').textContent='Sent to LHRF for review. Return to LHRF to save your runs.';$('send').disabled=true};
if(valid())window.opener.postMessage({type:'lhrf-garmin-ready',state},ORIGIN);
</script></html>`;
export default {async fetch(request,env,ctx){
 const url=new URL(request.url);
 if(url.pathname==='/health'&&request.method==='GET'){
  const result={version:'1.3',abortTimeout:typeof AbortSignal.timeout,abortController:typeof AbortController};
  if(url.searchParams.get('probe')==='1'){
   try{AbortSignal.timeout(1000);result.legacyTimeout='ok'}catch(e){result.legacyTimeout=String(e.message).slice(0,200)}
   for(const kind of ['manual','error']){const c=new AbortController(),t=setTimeout(()=>c.abort(),12000);try{const r=await fetch(GARMIN+TOKEN,{method:'POST',signal:c.signal,redirect:kind});result[kind]={status:r.status};await r.text()}catch(e){result[kind]={error:String(e.message).slice(0,200)}}finally{clearTimeout(t)}}
  }
  return json(result);
 }
 if(url.pathname==='/'&&request.method==='GET')return new Response(page,{headers:{...headers,'Content-Type':'text/html; charset=utf-8'}});
 if(url.pathname!=='/api/import'||request.method!=='POST')return json({error:'Not found.'},404);
 if(!request.headers.get('oai-authenticated-user-id'))return json({error:'Sign in to your private Garmin connection first.'},401);
 if(request.headers.get('Origin')!==url.origin||!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Request not permitted.'},403);
 if(Number(request.headers.get('Content-Length'))>4096)return json({error:'Request too large.'},413);
 try{const text=await request.text();if(text.length>4096)return json({error:'Request too large.'},413);const body=JSON.parse(text);return json(await importRuns(body.key));}catch(e){console.error(JSON.stringify({event:'garmin-import-failure',name:e.name||'Error'}));const safe=['Enter your Garmin','Garmin did not','Garmin is busy','Garmin could not','Garmin returned','Garmin request timed out','Garmin connection could not'];return json({error:safe.some(p=>String(e.message).startsWith(p))?e.message:'Connection interrupted. No runs have been saved.'},400);}
}};
