/* Phone-only planned-workout bridge. Only explicit sends write to Intervals.icu.
 * The API key is never embedded in a URL or included in training backups. */
(function(root){
'use strict';
const API='https://intervals.icu/api/v1/athlete/0';
function dateOnly(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))throw Error('Choose a workout date.');const d=new Date(value+'T12:00:00Z');if(!Number.isFinite(+d)||d.toISOString().slice(0,10)!==value)throw Error('Choose a valid workout date.');return value;}
function authorization(key){const clean=String(key||'').trim();if(!clean)throw Error('Paste your Intervals.icu API key into the key field first.');if(!/^[\x21-\x7e]+$/.test(clean))throw Error('The key contains spaces or unsupported characters. Copy the full API key again from Intervals.icu Developer Settings.');return 'Basic '+btoa('API_KEY:'+clean);}
// Native absolute pace avoids FIT import converting targets to threshold percentages.
function workoutDescription(steps){
 if(!Array.isArray(steps)||!steps.length||steps.length>50)throw Error('Select a running workout with 1–50 steps.');
 return steps.map(step=>{
  const km=Number(step.distanceKm);if(!Number.isFinite(km)||km<=0)throw Error('Every step needs a valid positive distance.');
  const text=String(step.pace||'');
  if(/%|km\s*\/\s*h|mph|\/mi/i.test(text))throw Error('Workout export requires min/km pace targets.');
  const times=[...text.matchAll(/(\d{1,2}):([0-5]\d)/g)].map(m=>Number(m[1])*60+Number(m[2]));
  if(times.length>2||times.some(x=>x<=0)||(!times.length&&text.trim()))throw Error('Could not read a prescribed pace target.');
  const format=n=>Math.floor(n/60)+':'+String(n%60).padStart(2,'0');
  const target=times.length?' '+[...new Set(times)].sort((a,b)=>b-a).map(format).join('-')+'/km Pace':'';
  const label=String(step.name||step.label||'Run').replace(/[\r\n]/g,' ').replace(/[^a-zA-Z ,]/g,'').replace(/\s+/g,' ').trim()||'Run';
  return '- '+label+' '+String(km)+'km'+target;
 }).join('\n');
}
function workoutEvent({name,steps,sessionId,date,environment='outside'}){
 const day=dateOnly(date);if(!sessionId)throw Error('Select a scheduled running session first.');
 return {category:'WORKOUT',type:'Run',target:'PACE',name:'LHRF · '+String(name||'Run'),start_date_local:day+'T00:00:00',external_id:'lhrf-run-v1:'+String(sessionId)+':'+day,description:workoutDescription(steps)};
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
  const m=line.match(/ (\d+(?:\.\d+)?)km(?: (\d+:\d{2})(?:-(\d+:\d{2}))?\/km Pace)?$/);
  if(!m)throw Error('Could not validate the exported running steps.');
  const seconds=t=>t.split(':').reduce((a,b)=>a*60+Number(b),0);
  return {distance:Number(m[1])*1000,times:m[2]?[seconds(m[2]),seconds(m[3]||m[2])].sort((a,b)=>a-b):[]};
 });
 const steps=saved.workout_doc?.steps;
 const failure='Saved to Intervals.icu, but structured pace targets were not confirmed. Open the workout editor, select Pace as its target and check the steps before syncing Garmin. Do not assume watch pace alerts are ready.';
 if(!Array.isArray(steps)||steps.length!==expected.length||saved.target&&saved.target!=='PACE')throw Error(failure);
 steps.forEach((step,i)=>{
  const wanted=expected[i];if(Math.abs(Number(step.distance)-wanted.distance)>.1||!Number.isFinite(Number(step.distance)))throw Error(failure);
  if(wanted.times.length){const pace=step.pace,actual=pace&&[pace.start??pace.value,pace.end??pace.value].map(Number).sort((a,b)=>a-b);if(!pace||pace.units!=='secs/km'||actual.some((n,j)=>!Number.isFinite(n)||Math.abs(n-wanted.times[j])>1))throw Error(failure);}
 });
}
async function sendWorkout(key,event,options={}){
 const result=await request('/events/bulk?upsert=true',key,{...options,method:'POST',body:[event]});
 if(!Array.isArray(result)||result.length!==1||!result[0]?.id)throw Error('Upload was not confirmed. Check the Intervals calendar before retrying.');
 verifyStructuredPaces(event,result[0]);
 return {id:result[0].id,date:event.start_date_local.slice(0,10)};
}
const api={verifyStructuredPaces,workoutDescription,workoutEvent,checkConnection,sendWorkout,dateOnly};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFIntervals=api;
})(typeof globalThis!=='undefined'?globalThis:this);
