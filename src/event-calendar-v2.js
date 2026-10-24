/* Calendar-only event placement and validity checks. No local-time DST arithmetic. */
(function(root){
'use strict';
const DAY=86400000;
function dayNumber(value){
 if(typeof value!=='string'||!/^(\d{4})-(\d{2})-(\d{2})$/.test(value))return null;
 const [y,m,d]=value.split('-').map(Number),t=Date.UTC(y,m-1,d),dt=new Date(t);
 return dt.getUTCFullYear()===y&&dt.getUTCMonth()===m-1&&dt.getUTCDate()===d?t/DAY:null;
}
function eventCalendar(c){
 const events=[['strength',c.strengthTargetDate],['running',c.runningTargetDate]].filter(x=>x[1]);
 const errors=[],start=dayNumber(c.startDate),weeks=Math.round(Number(c.weeks)||0);
 if(!events.length)return {status:'not-required',events:[],errors:[]};
 if(start===null)errors.push('A valid programme startDate (YYYY-MM-DD) is required to place events.');
 if(!Number.isInteger(weeks)||weeks<1)errors.push('A positive programme length is required.');
 const startMonday=start===null?null:start-((new Date(start*DAY).getUTCDay()+6)%7);
 const mapped=events.map(([sport,date])=>{
  const day=dayNumber(date);
  if(day===null)errors.push('Invalid '+sport+' event date: '+date);
  const week=startMonday===null||day===null?null:Math.floor((day-startMonday)/7)+1;
  if(week!==null&&(week<1||week>weeks))errors.push(sport+' event is outside the programme ('+week+').');
  return {sport,date,week,dayOfWeek:day===null?null:(new Date(day*DAY).getUTCDay()+6)%7};
 });
 const valid=errors.length===0;
 return {status:valid?'valid':'invalid',events:mapped,errors,
  sameWeek:valid&&mapped.length>1&&mapped.every(e=>e.week===mapped[0].week),
  consecutiveDays:valid&&mapped.length>1&&Math.abs(dayNumber(mapped[0].date)-dayNumber(mapped[1].date))===1};
}
const api={dayNumber,eventCalendar};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFEventCalendarV2=api;
})(typeof globalThis!=='undefined'?globalThis:this);
