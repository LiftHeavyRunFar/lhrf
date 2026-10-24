/* Conservative 10K-PB pace suggestions; optional, never override RPE. */
(function(root){
'use strict';
function seconds(value){
 if(typeof value==='number'&&Number.isFinite(value))return value>0?value:null;
 if(typeof value!=='string')return null;
 const parts=value.trim().split(':').map(Number);
 if(parts.length<2||parts.length>3||parts.some(x=>!Number.isInteger(x)||x<0))return null;
 if(parts.slice(1).some(x=>x>59))return null;
 return parts.length===2?parts[0]*60+parts[1]:parts[0]*3600+parts[1]*60+parts[2];
}
function paceLabel(sec){const s=Math.round(sec);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+'/km'}
function calibrate10K(input){
 const raw=input?.tenKSeconds??input?.tenKTime??input?.pb10k;
 const t=seconds(raw);
 if(t===null||t<1800||t>10800)return {available:false,reason:'Provide a plausible recent 10K result (30 min to 3 h).'};
 const race=t/10;
 const range=(lo,hi)=>({minSecondsPerKm:Math.round(lo),maxSecondsPerKm:Math.round(hi),label:paceLabel(lo)+'–'+paceLabel(hi)});
 return {available:true,reference:'10K personal best',racePace:paceLabel(race),
  easy:range(race*1.18,race*1.40),steady:range(race*1.08,race*1.18),
  controlledIntervals:range(race*.98,race*1.06),
  advisory:'Initial estimates only; adjust for terrain, heat, recovery and current fitness. Use RPE to override pace.'};
}
function attachPaces(runs,config){
 const cal=calibrate10K(config);
 return runs.map(r=>{
  if(!cal.available)return {...r,pace:null,paceNote:cal.reason};
  const band=r.type==='quality'?cal.controlledIntervals:r.type==='long'?cal.easy:cal.easy;
  return {...r,pace:band,paceNote:cal.advisory};
 });
}
const api={seconds,calibrate10K,attachPaces};
if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFRunningPacesV2=api;
})(typeof globalThis!=='undefined'?globalThis:this);
