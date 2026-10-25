// Replay reported training behaviour through the real v2 APIs. No physiological model,
// browser storage, real athlete data, network, or automatic approval is involved.
const assert=require('node:assert/strict');
const profiles=require('./profiles.cjs');
const {buildDatedProgramme}=require('../../src/dated-programme-v2.js');
const {reviewWeek}=require('../../src/weekly-review-v2.js');
const {reviewSession}=require('../../src/performance-v2.js');
const {proposeStrengthAdjustment}=require('../../src/strength-feedback-v2.js');
const {structureRuns}=require('../../src/run-sessions-v2.js');
const {reviewRunning}=require('../../src/running-feedback-v2.js');
const scenarios=['on-target','rapid-progress','accumulated-fatigue','missed-for-schedule','variable-effort','pain-report'];
const clone=x=>JSON.parse(JSON.stringify(x));
const increase=p=>p.kind==='review-progression'||p.kind==='review-running-progression'||p.direction==='increase';
const deepFreeze=x=>{if(x&&typeof x==='object'){Object.freeze(x);Object.values(x).forEach(deepFreeze)}return x};
function runSuite(){
 const failures=[],gaps=new Map(),trajectories=[];let checks=0;
 const check=(id,fn)=>{checks++;try{fn()}catch(e){failures.push({id,message:e.message})}};
 const gap=(id,athlete,expected,observed)=>{if(!gaps.has(id))gaps.set(id,{id,status:'blocked',expected,examples:[]});const g=gaps.get(id);if(g.examples.length<3&&!g.examples.some(x=>x.athlete===athlete&&x.observed===observed))g.examples.push({athlete,observed})};
 const truth=(id,value)=>check(id,()=>assert.ok(value));
 function replay(profile,scenario){
  const input=deepFreeze(clone(profile.config)),before=JSON.stringify(input);let programme;
  try{programme=buildDatedProgramme(input)}catch(e){
   gap('fixed-split-build',profile.id,'Every requested session slot can be represented, or the planner returns an explicit reviewable conflict.',e.message);
   return {athlete:profile.id,scenario,status:'blocked',weeks:[],reason:e.message};
  }
  check(profile.id+':input-immutable',()=>assert.equal(JSON.stringify(input),before));
  if(!programme.valid){failures.push({id:profile.id+':valid-profile',message:JSON.stringify(programme.errors)});return {athlete:profile.id,scenario,status:'failed',weeks:[]}}
  const strengthLogs=[],runLogs=[],weeks=[];let lastStrengthSession=null,serial=0;
  for(const week of programme.weeks){
   const snapshot=JSON.stringify(week);
   if(!week.events?.length){
    truth('all sessions accounted for',week.calendar.sessions.length+week.calendar.unscheduled===week.strengths.length+week.runs.length);
    truth('available days respected',week.calendar.sessions.every(s=>!input.availableDays||input.availableDays.includes(s.day)));
   }
   truth('finite nonnegative workload',Number.isFinite(week.strengthStress)&&week.strengthStress>=0&&Number.isFinite(week.runningMinutes)&&week.runningMinutes>=0);
   for(const s of week.strengths){
    for(const group of [s.top,s.backoff].filter(Boolean)){
     truth('bounded strength effort',Number.isFinite(group.rpe)&&group.rpe>=0&&group.rpe<=10);
     if(!input.maxes?.[s.lift])check('unknown strength baseline',()=>assert.equal(group.suggestedWeight,null));
    }
   }
   for(const r of week.runs){
    if(r.workout)check('run blocks match total',()=>assert.equal(r.workout.blocks.reduce((n,b)=>n+b.minutes,0),r.minutes));
    if(!input.tenKTime)check('unknown pace stays unknown',()=>assert.equal(r.pace,null));
   }
   const readiness={fatigue:2,legSoreness:1,pain:false};
   if(scenario==='accumulated-fatigue'&&week.week>=4){readiness.fatigue=5;readiness.legSoreness=4}
   if(scenario==='pain-report'&&week.week>=4)readiness.pain=true;
   const entries=week.calendar.sessions.filter(s=>s.kind!=='event');
   for(const entry of entries){
    serial++;
    // Missing a session for a diary conflict supplies no effort evidence.
    if(scenario==='missed-for-schedule'&&serial%3===0)continue;
    const delta=(scenario==='rapid-progress'||scenario==='pain-report'&&week.week>=4)?-1.5:scenario==='accumulated-fatigue'&&week.week>=4?1.5:scenario==='variable-effort'?[0,0,1,0,-.5][serial%5]:0;
    const date=new Date(Date.UTC(2026,9,19+(week.week-1)*7+entry.dayIndex)).toISOString().slice(0,10);
    if(entry.kind==='strength'){
     const s=week.strengths[Number(entry.id.slice(1))];
     if(!s?.top)continue; // Back-off RPE is not comparable evidence of top-set performance.
     const actualRPE=Math.max(1,Math.min(10,s.top.rpe+delta));
     strengthLogs.push({date,lift:s.lift,actualRPE,targetRPE:s.top.rpe,completed:true});
     lastStrengthSession={prescription:s,feedback:{actualRPE,actualWeight:s.top.suggestedWeight,completed:true,actualReps:s.top.reps,targetReps:s.top.reps}};
    }else if(entry.kind==='run'){
     const r=week.runs[Number(entry.id.slice(1))];
     const targetRPE=r.type==='quality'?6.5:3.5;
     runLogs.push({date,actualRPE:Math.max(1,Math.min(10,targetRPE+delta)),targetRPE,completed:true});
    }
   }
   const reviewInput=deepFreeze(clone({strengthLogs,runLogs,lastStrengthSession,readiness,phase:week.phase}));
   const beforeReview=JSON.stringify(reviewInput),review=reviewWeek(reviewInput);
   check('review deterministic',()=>assert.deepEqual(reviewWeek(reviewInput),review));
   check('review inputs unchanged',()=>assert.equal(JSON.stringify(reviewInput),beforeReview));
   check('prescriptions unchanged by review',()=>assert.equal(JSON.stringify(week),snapshot));
   check('approval never auto-applies',()=>assert.deepEqual(review.appliedChanges,[]));
   truth('approval visible',!review.proposals.length||review.approvalRequired);
   if(readiness.fatigue===5||readiness.pain||['recovery','realisation','assessment','event'].includes(week.phase))truth('recovery/phase guard',!review.proposals.some(increase));
   weeks.push({week:week.week,phase:week.phase,completedStrengthExposures:strengthLogs.length,completedRuns:runLogs.length,signals:review.signals.map(s=>({lift:s.lift,signal:s.signal})),proposals:review.proposals.map(p=>({kind:p.kind,lift:p.lift,direction:p.direction})),appliedChanges:review.appliedChanges.length});
  }
  if(scenario==='on-target'||scenario==='missed-for-schedule')truth('neutral/missing logs do not manufacture fatigue',weeks.every(w=>w.proposals.length===0));
  if(scenario==='rapid-progress')truth('sustained easier performance produces a progression review',weeks.some(w=>w.proposals.some(increase)));
  if(scenario==='accumulated-fatigue'&&weeks.some(w=>w.completedStrengthExposures>=3))truth('repeated overshoot receives accessory-first review',weeks.some(w=>w.proposals.some(p=>p.kind==='trim-accessory-volume')));
  return {athlete:profile.id,scenario,status:'tested',weeks};
 }
 for(const profile of profiles)for(const scenario of scenarios)trajectories.push(replay(profile,scenario));
 // Independent coaching acceptance gates: report failures, never rewrite the expected result
 // to match what the engine happens to generate. These remain red until implemented/reviewed.
 const {buildProgramme}=require('../../src/programme-v2.js');
 const {buildPlan}=require('../../src/coaching-v2.js');
 const {prescribeWeek}=require('../../src/prescriptions-v2.js');
 for(const profile of profiles){
  const c=profile.config;
  const plan=buildPlan(c);
  for(let i=1;i<plan.phases.length;i++){
   const a=plan.phases[i-1],b=plan.phases[i];
   if(['foundation','development','intensification'].includes(a.phase)&&['foundation','development','intensification'].includes(b.phase)&&a.phase!==b.phase)
    gap('phase-transition-recovery',profile.id,'A loading-phase change has a recovery transition or an explicit reviewed rationale.',a.phase+' → '+b.phase+' at week '+b.week+' without recovery');
  }
  if(c.fixedSessions?.some(f=>f.kind==='run'&&f.runType==='long')){
   const fixed=c.fixedSessions.find(f=>f.kind==='run'&&f.runType==='long');
   const p=buildDatedProgramme(c);
   const loading=p.weeks.filter(w=>['foundation','development','intensification'].includes(w.phase));
   if(loading.some(w=>!w.calendar.sessions.some(s=>s.kind==='run'&&s.day===fixed.day&&s.runType==='long')))
    gap('fixed-long-run-role',profile.id,'The protected long-run slot remains a long-run prescription in loading weeks.','The day is preserved but a normal easy run is substituted for the requested long run');
  }
  if(c.hybridFocus==='running'){
   const maintenance=prescribeWeek(c,{week:5,phase:'development'}).strengths;
   const development=prescribeWeek({...c,priority:'Balanced',hybridFocus:'strength'},{week:5,phase:'development'}).strengths;
   if(JSON.stringify(maintenance)===JSON.stringify(development))gap('strength-maintenance-policy',profile.id,'The strength-maintenance framework has an explicit prescription policy.','Maintenance and progressive-strength receive identical strength prescriptions');
  }
  if(c.trainingAge){
   const a=prescribeWeek(c,{week:1,phase:'foundation'}),b=prescribeWeek({...c,trainingAge:c.trainingAge==='beginner'?'advanced':'beginner'},{week:1,phase:'foundation'});
   if(JSON.stringify(a)===JSON.stringify(b))gap('training-experience',profile.id,'Training experience influences the starting prescription or prompts a review.','Changing beginner/advanced has no effect');
  }
  if(c.purposefulVariations){const p=buildProgramme(c);if(!p.weeks.some(w=>w.strengths.some(s=>s.variation)))gap('lift-variation',profile.id,'Purposeful variations are represented in the programme across blocks.','No exercise variation field exists in generated lifts')}
  if(c.topSetFirst){const w=prescribeWeek(c,{week:1,phase:'foundation'});if(w.strengths.some(s=>s.lift==='bench'&&!s.top))gap('bench-top-set-preference',profile.id,'Bench-specific prescriptions honour the requested top-set-first preference.','Foundation bench exposures have no top set')}
  if(c.lightLifts){const w=prescribeWeek(c,{week:3,phase:'development'});for(const s of w.strengths.filter(s=>c.lightLifts.includes(s.lift)))if(s.top?.rpe>6)gap('light-lower-body',profile.id,'Explicitly light squat/deadlift work is represented instead of normal demanding exposures.',s.lift+' top-set RPE '+s.top.rpe)}
  if(c.maxSessionsPerDay){
   const p=buildProgramme(c),days=p.weeks[0].calendar.sessions.reduce((m,s)=>(m[s.day]=(m[s.day]||0)+1,m),{});
   if(Object.values(days).some(n=>n>c.maxSessionsPerDay)&&!p.weeks[0].calendar.unscheduled&&!p.weeks[0].calendar.capacityConflicts?.length)
    gap('daily-session-capacity',profile.id,'An infeasible schedule returns unscheduled work or a capacity conflict, rather than claiming everything fits.',JSON.stringify(days));
  }
  if(c.strengthTargetDate||c.runningTargetDate){
   const dated=buildDatedProgramme({...c,fixedSessions:[]});
   if(dated.weeks.some(w=>!w.events.length&&w.runs.some(r=>!r.workout)))gap('dated-run-structure',profile.id,'Dated plans retain pace and actionable workout blocks.','Date overlay discards structured running prescriptions');
   if(dated.weeks.some(w=>w.events.length&&w.calendar.withheldTrainingSessions>0))gap('event-week-programming',profile.id,'Reviewable sport-specific event-week training and an explicit precedence for adjacent goals.','Ordinary event-week training is withheld; only event entries are scheduled');
  }
 }
 // A short quality slot becomes easy work: its pace guidance must become easy too.
 const short=structureRuns([{type:'quality',minutes:20,effort:'RPE 6–7'}],{tenKTime:'55:00'})[0];
 if(short.workout.kind==='continuous-easy'&&short.type==='quality')gap('easy-run-pace-consistency','short-quality-slot','A fallback easy session has easy type, pace and effort.','Continuous easy blocks retain quality type and interval pace');
 const comfortable=[1,2,3].map(()=>({sessionRPE:5,targetRPE:7,completed:true}));
 const single=reviewRunning(comfortable),combined=reviewWeek({runLogs:comfortable.map(x=>({actualRPE:x.sessionRPE,targetRPE:x.targetRPE,completed:x.completed}))});
 if(single.proposal&&!combined.proposals.some(p=>p.kind==='review-running-progression'))gap('running-progression-review','fast','The weekly review includes supported running progression, subject to hybrid recovery.','Standalone running reviewer proposes progression; combined weekly reviewer omits it');
 // Known decline and missing completion are different from an easy, completed top set.
 check('incomplete never progresses',()=>assert.equal(proposeStrengthAdjustment({lift:'bench',top:{rpe:8,suggestedWeight:100}},{actualRPE:6,actualWeight:100,completed:false}).proposal,null));
 check('missing completion is unknown',()=>assert.equal(reviewSession({top:{rpe:8,suggestedWeight:100}},{topRpe:6}).status,'insufficient-data'));
 const simulatedWeeks=trajectories.reduce((n,t)=>n+t.weeks.length,0);
 return {schema:'lhrf-athlete-test-report-v1',synthetic:true,profiles:profiles.map(p=>({id:p.id,name:p.name,weeks:p.config.weeks,expectations:p.expectations})),scenarios,summary:{profiles:profiles.length,trajectories:trajectories.length,simulatedWeeks,checks,regressionFailures:failures.length,blockedTrajectories:trajectories.filter(t=>t.status==='blocked').length,coachingGaps:gaps.size,coachingGatesPassed:failures.length===0&&gaps.size===0,readyForLiveUse:false},failures,coachingGaps:[...gaps.values()],trajectories,limitations:['Reported RPE and recovery are scripted inputs, not a validated physiological response model.','Only the isolated v2 engine APIs are exercised; live inline coaching and preview-page feedback remain separate.','Approval is verified as non-mutating pending review; accepted-change application and an approved next-week regeneration are not implemented in this harness.','No real athlete data, Garmin records or browser persistence is accessed.']};
}
module.exports={runSuite,profiles,scenarios};
