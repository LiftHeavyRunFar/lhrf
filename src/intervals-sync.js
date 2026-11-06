/* Phone-only planned-workout bridge. Only explicit sends write to Intervals.icu.
 * The API key is never embedded in a URL or included in training backups. */
(function(root){
'use strict';
const API='https://intervals.icu/api/v1/athlete/0';
function dateOnly(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))throw Error('Choose a workout date.');const d=new Date(value+'T12:00:00Z');if(!Number.isFinite(+d)||d.toISOString().slice(0,10)!==value)throw Error('Choose a valid workout date.');return value;}
function authorization(key){const clean=String(key||'').trim();if(!clean)throw Error('Paste your Intervals.icu API key into the key field first.');if(!/^[\x21-\x7e]+$/.test(clean))throw Error('The key contains spaces or unsupported characters. Copy the full API key again from Intervals.icu Developer Settings.');return 'Basic '+btoa('API_KEY:'+clean);}
// Native absolute pace avoids threshold-percentage conversion in LHRF.
function paceTimes(value){
 const text=String(value||'').trim();if(!text)return [];
 const m=text.match(/^(\d{1,2}:[0-5]\d)(?:\s*\/km)?(?:\s*(?:to|[-–—])\s*(\d{1,2}:[0-5]\d)(?:\s*\/km)?)?$/i);
 if(!m)throw Error('Could not read a prescribed pace target. Export requires an exact min/km pace or range.');
 const times=[m[1],m[2]||m[1]].map(t=>t.split(':').reduce((n,x)=>n*60+Number(x),0));
 if(times.some(t=>t<=0))throw Error('Could not read a prescribed pace target.');return times.sort((a,b)=>a-b);
}
function stepIntensity(step){
 const role=String(step.role||'').toLowerCase(),label=String(step.name||step.label||'');
 if(role==='recovery')return 'rest';if(role==='work')return 'active';
 if(/warm[ -]?up/i.test(label))return 'warmup';if(/cool[ -]?down/i.test(label))return 'cooldown';
 if(/recovery|\brest\b/i.test(label))return 'rest';return 'active';
}
function workoutDescription(steps){
 if(!Array.isArray(steps)||!steps.length||steps.length>50)throw Error('Select a running workout with 1–50 steps.');
 return steps.map(step=>{
  if(step.timeOnly)throw Error('Time-based steps are not supported by this exporter. Use the prescribed timer or recreate the exact time steps in Garmin Connect.');
  const km=Number(step.distanceKm);if(!Number.isFinite(km)||km<=0)throw Error('Every step needs a valid positive distance. Time-based steps must be recreated exactly in Garmin Connect.');
  const times=paceTimes(step.pace),format=n=>Math.floor(n/60)+':'+String(n%60).padStart(2,'0');
  const target=times.length?' '+[...new Set(times)].sort((a,b)=>b-a).map(format).join('-')+'/km Pace':'';
  const label=String(step.name||step.label||'Run').replace(/[\r\n]/g,' ').replace(/[^a-zA-Z ,]/g,'').replace(/\s+/g,' ').trim()||'Run';
  // Decimal notation (not scientific notation) is required by the native parser.
  const distance=km.toFixed(9).replace(/0+$/,'').replace(/\.$/,'');
  if(!/^\d+(?:\.\d+)?$/.test(distance)||Math.abs(Number(distance)-km)*1000>.001||Number(distance)<=0)throw Error('Step distance cannot be represented accurately.');
  return '- '+label+' '+distance+'km'+target+' intensity='+stepIntensity(step);
 }).join('\n');
}
function workoutEvent({name,steps,sessionId,date,scheduledDate=date,environment='outside'}){
 const day=dateOnly(date),occurrence=dateOnly(scheduledDate);if(!sessionId)throw Error('Select a scheduled running session first.');
 const identity=String(sessionId).replace(/::run(?=:\d+$)/,'');
 // Reuse the original v1 identity for the prescribed occurrence, even when moved.
 return {category:'WORKOUT',type:'Run',target:'PACE',name:'LHRF · '+String(name||'Run'),start_date_local:day+'T00:00:00',external_id:'lhrf-run-v1:'+identity+':'+occurrence,description:workoutDescription(steps)};
}
async function request(path,key,{method='GET',body,fetchImpl=root.fetch}={}){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
 try{
  const response=await fetchImpl(API+path,{method,headers:{Authorization:authorization(key),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),credentials:'omit',redirect:'error',cache:'no-store',referrerPolicy:'no-referrer',signal:controller.signal});
  if(!response.ok){if(response.status===401||response.status===403)throw Error('Intervals.icu did not authorise this request. Check the key and calendar permissions.');if(response.status===429)throw Error('Intervals.icu is busy. Wait before trying again.');throw Error('Intervals.icu could not complete the request (HTTP '+response.status+').');}
  try{return await response.json()}catch{throw Error('Intervals.icu returned an unreadable response. Check its calendar before retrying.');}
 }catch(error){if(error.name==='AbortError'||error instanceof TypeError)throw Error('Connection interrupted or blocked. Check your internet connection. If sending, check the Intervals calendar before retrying.');throw error;}finally{clearTimeout(timeout)}
}
async function checkConnection(key,options){const athlete=await request('',key,options);if(!athlete||!athlete.id)throw Error('Could not verify the Intervals.icu account.');return {id:String(athlete.id),name:String(athlete.name||'Intervals.icu athlete')};}
function verifyStructuredPaces(event,saved){
 const expected=event.description.split('\n').map(line=>{
  const m=line.match(/ (\d+(?:\.\d+)?)km(?: (\d+:\d{2})(?:-(\d+:\d{2}))?\/km Pace)? intensity=(active|rest|warmup|cooldown)$/);
  if(!m)throw Error('Could not validate the exported running steps.');
  const seconds=t=>t.split(':').reduce((a,b)=>a*60+Number(b),0);
  return {intensity:m[4],distance:Number(m[1])*1000,times:m[2]?[seconds(m[2]),seconds(m[3]||m[2])].sort((a,b)=>a-b):[]};
 });
 const steps=saved.workout_doc?.steps;
 const failure='Saved to Intervals.icu, but structured pace targets were not confirmed, or step order/recovery roles changed. Open the workout editor, select Pace as its target and check the steps before syncing Garmin. Do not assume watch pace alerts are ready.';
 if(!Array.isArray(steps)||steps.length!==expected.length||saved.target!=='PACE')throw Error(failure);
 steps.forEach((step,i)=>{
  if(!step||typeof step!=='object')throw Error(failure);
  const wanted=expected[i];if(step.intensity!==wanted.intensity)throw Error(failure);if(Math.abs(Number(step.distance)-wanted.distance)>.1||!Number.isFinite(Number(step.distance)))throw Error(failure);
  if(!wanted.times.length&&step.pace)throw Error(failure);
  if(wanted.times.length){const pace=step.pace,actual=pace&&[pace.start??pace.value,pace.end??pace.value].map(Number).sort((a,b)=>a-b);if(!pace||pace.units!=='secs/km'||actual.some((n,j)=>!Number.isFinite(n)||Math.abs(n-wanted.times[j])>1))throw Error(failure);}
 });
}
async function sendWorkout(key,event,options={}){
 const result=await request('/events/bulk?upsert=true',key,{...options,method:'POST',body:[event]});
 if(!Array.isArray(result)||result.length!==1||!result[0]?.id)throw Error('Upload was not confirmed. Check the Intervals calendar before retrying.');
 if(result[0].external_id!==event.external_id||result[0].start_date_local!==event.start_date_local)throw Error('Saved response did not confirm the selected workout identity and date. Check the Intervals calendar before retrying.');
 verifyStructuredPaces(event,result[0]);
 return {id:result[0].id,date:event.start_date_local.slice(0,10)};
}
const api={stepIntensity,paceTimes,verifyStructuredPaces,workoutDescription,workoutEvent,checkConnection,sendWorkout,dateOnly};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFIntervals=api;
})(typeof globalThis!=='undefined'?globalThis:this);
