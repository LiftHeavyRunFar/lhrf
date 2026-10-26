/* Phone-only planned-workout bridge. Only explicit sends write to Intervals.icu.
 * The API key is never embedded in a URL or included in training backups. */
(function(root){
'use strict';
const fit=typeof module==='object'&&module.exports?require('./garmin-workout.js'):root.LHRFGarminWorkout;
const API='https://intervals.icu/api/v1/athlete/0';
function dateOnly(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))throw Error('Choose a workout date.');const d=new Date(value+'T12:00:00Z');if(!Number.isFinite(+d)||d.toISOString().slice(0,10)!==value)throw Error('Choose a valid workout date.');return value;}
function authorization(key){const clean=String(key||'').trim();if(!clean)throw Error('Paste your Intervals.icu API key into the key field first.');if(!/^[\x21-\x7e]+$/.test(clean))throw Error('The key contains spaces or unsupported characters. Copy the full API key again from Intervals.icu Developer Settings.');return 'Basic '+btoa('API_KEY:'+clean);}
function workoutEvent({name,steps,sessionId,date,environment='outside'}){
 const day=dateOnly(date);if(!sessionId)throw Error('Select a scheduled running session first.');if(!fit)throw Error('The workout exporter has not loaded. Reopen LHRF online once.');
 const bytes=fit.encodeWorkout({name:'LHRF '+name,steps,environment});let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
 return {category:'WORKOUT',type:'Run',name:'LHRF · '+String(name||'Run'),start_date_local:day+'T00:00:00',external_id:'lhrf-run-v1:'+String(sessionId)+':'+day,filename:'lhrf-workout.fit',file_contents_base64:btoa(binary)};
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
async function sendWorkout(key,event,options={}){const result=await request('/events/bulk?upsert=true',key,{...options,method:'POST',body:[event]});if(!Array.isArray(result)||result.length!==1||!result[0]?.id)throw Error('Upload was not confirmed. Check the Intervals calendar before retrying.');return {id:result[0].id,date:event.start_date_local.slice(0,10)};}
const api={workoutEvent,checkConnection,sendWorkout,dateOnly};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFIntervals=api;
})(typeof globalThis!=='undefined'?globalThis:this);
