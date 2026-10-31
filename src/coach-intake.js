/* Input translation only. The canonical engine owns every coaching decision. */
(function(root){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x)),DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const own=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
const number=(value,label,{minimum=0,integer=false,optional=false}={})=>{
 if(optional&&(value===''||value===null||value===undefined))return null;
 const n=Number(value);if(value===''||value===null||value===undefined||!Number.isFinite(n)||n<minimum||(integer&&!Number.isInteger(n)))throw new RangeError(label+' needs '+(integer?'a whole number':'a number')+' of at least '+minimum+'.');return n;
};
function date(value,label){if(!value)return '';if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T12:00:00Z'))||new Date(value+'T12:00:00Z').toISOString().slice(0,10)!==value)throw new RangeError(label+' is invalid.');return value;}
function build(base,raw={}){
 const c=clone(base||{}),days=(c.availableDays||[]).map(x=>String(x).slice(0,3));
 if(c.strengthTargetDate&&c.strengthTargetDate===c.runningTargetDate)throw new RangeError('Two events on the same date need an individual timing review before a programme can be approved.');
 if(!days.length||days.some(d=>!DAYS.includes(d))||new Set(days).size!==days.length)throw new RangeError('Choose your available training days.');
 const minutes={};for(const day of days)minutes[day]=number(raw.minutes?.[day],day+' whole-visit minutes',{minimum:15,integer:true});
 const strengthVisits=number(raw.strengthVisits,'Strength visits',{integer:true});
 if(strengthVisits>days.length)throw new RangeError('Strength visits cannot exceed available training days.');
 const lifts=['squat','bench','deadlift'].map(k=>Number(c[k])||0);
 if(lifts.some(x=>x>0)&&strengthVisits<1)throw new RangeError('Choose at least one strength visit for the requested lifts.');
 if(strengthVisits<Math.max(0,...lifts))throw new RangeError('Strength visits must cover the most frequent lift. Several different lifts can share a visit.');
 const combinedDays=[...new Set(raw.combinedDays||[])],separateDays=[...new Set(raw.separateDays||[])];
 if([...combinedDays,...separateDays].some(d=>!days.includes(d)))throw new RangeError('Mixed or separate visits must use available training days.');
 if(combinedDays.some(d=>separateDays.includes(d)))throw new RangeError('Choose combined or separate visits for a day, rather than both.');
 const minimumGapHours=separateDays.length?number(raw.minimumGapHours,'Gap between separate visits',{minimum:6}):0,separateMinutes={};
 for(const day of separateDays)separateMinutes[day]=number(raw.separateMinutes?.[day]??minutes[day],day+' separate strength-visit minutes',{minimum:15,integer:true});
 const eventDays={};for(const [when,value]of Object.entries(raw.eventDays||{})){date(when,'Event date');eventDays[when]={confirmed:value.confirmed===true,minutes:number(value.minutes,'Event time allowance',{minimum:1,integer:true,optional:true})};if(value.logisticsMinutes!==undefined)eventDays[when].logisticsMinutes=number(value.logisticsMinutes,'Event logistics minutes');}
 c.coachingRulesVersion=2;c.visitConstraints={strengthVisits,minutes,combinedDays,separateDays,separateMinutes,minimumGapHours,eventDays};
 c.doubleDays=[...new Set([...combinedDays,...separateDays])];
 c.runningHistory={};
 const history=Array.isArray(raw.weeklyKmHistory)?raw.weeklyKmHistory:String(raw.weeklyKmHistory||'').trim()?String(raw.weeklyKmHistory).split(',').map(s=>s.trim()):[];
 if(history.length>12)throw new RangeError('Enter up to twelve completed weekly distances.');
 if(history.length)c.runningHistory.weeklyKm=history.map(x=>number(x,'Completed weekly kilometres'));
 const long=raw.longRun||{},longValues=['km','minutes','recoveryHours'].map(k=>long[k]);
 if(longValues.some(v=>v!==''&&v!==null&&v!==undefined))c.runningHistory.longRun={km:number(long.km,'Recent long-run kilometres',{minimum:.1}),minutes:number(long.minutes,'Recent long-run minutes',{minimum:1}),recoveryHours:number(long.recoveryHours,'Recent long-run recovery hours')};
 const recent=date(raw.recentMarathonDate,'Recent marathon date');if(recent){if(recent>new Date().toISOString().slice(0,10)||(c.startDate&&recent>c.startDate))throw new RangeError('A completed marathon must not be after the programme start.');c.runningHistory.recentMarathonDate=recent;}
 if(own(raw,'recoveryEvidence')){if(raw.recoveryEvidence===null)delete c.recoveryEvidence;else {const evidence=clone(raw.recoveryEvidence);if(!['fatigue','accumulating-fatigue','recovery-review'].includes(evidence.status)||!Array.isArray(evidence.affectedLifts)||evidence.affectedLifts.some(l=>!['Squat','Bench','Deadlift'].includes(l)))throw new RangeError('Recovery evidence needs the affected lifts and current recovery status.');c.recoveryEvidence=evidence;}}
 if(raw.recoveryContext){
  const context=clone(raw.recoveryContext);if(!['normal','lower','all'].includes(context.status))throw new RangeError('Choose your current recovery status.');
  if(context.reportedAt)date(context.reportedAt,'Recovery report date');
  const hasSleep=own(context,'sleepHours'),hasUsual=own(context,'usualSleepHours');if(hasSleep!==hasUsual)throw new RangeError('Enter both recent and usual sleep, or leave both blank.');
  if(hasSleep){context.sleepHours=number(context.sleepHours,'Recent sleep hours');context.usualSleepHours=number(context.usualSleepHours,'Usual sleep hours');if(context.sleepHours>24||context.usualSleepHours>24)throw new RangeError('Sleep hours must be between zero and 24.');}
  c.recoveryContext=context;
 }
 if(raw.orderedGoals){
  if(!Array.isArray(raw.orderedGoals)||raw.orderedGoals.length<2||raw.orderedGoals.length>8)throw new RangeError('A priority handover needs two to eight dated goals.');
  for(const goal of raw.orderedGoals)if(goal.strengthVisits!==undefined){const visits=number(goal.strengthVisits,'After-event strength visits',{integer:true});if(visits>days.length||visits<Math.max(goal.squat||0,goal.bench||0,goal.deadlift||0))throw new RangeError('After-event strength visits must cover the lift frequencies and fit the available days.');}
  // Event ordering, dates and frequencies are validated by prepareNewProgramme.
  c.orderedGoals=clone(raw.orderedGoals);
 }
 else delete c.orderedGoals;
 return c;
}
const api={build};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFCoachIntake=api;
})(typeof globalThis!=='undefined'?globalThis:this);
