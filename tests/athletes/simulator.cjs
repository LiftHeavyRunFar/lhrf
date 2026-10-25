// The athlete bots call the same canonical engine used by index.html and the preview.
const assert=require('node:assert/strict');
const profiles=require('./profiles.cjs');
const {createEngine}=require('../../src/coach-engine.js');
const {normalizeProfile,buildProgramme}=require('../../src/coach-adapters.js');
const scenarios=['on-target','rapid-progress','accumulated-fatigue','missed-for-schedule','variable-effort','pain-report'];
const clone=x=>JSON.parse(JSON.stringify(x));
const increase=p=>p.status==='progress';
function runSuite(){
 let checks=0;const failures=[],gaps=new Map(),trajectories=[];
 function check(id,fn){checks++;try{fn()}catch(e){failures.push({id,message:e.message})}}
 function gap(id,athlete,expected,observed){if(!gaps.has(id))gaps.set(id,{id,status:'blocked',expected,examples:[]});const g=gaps.get(id);if(g.examples.length<3&&!g.examples.some(x=>x.athlete===athlete&&x.observed===observed))g.examples.push({athlete,observed})}
 for(const profile of profiles)for(const scenario of scenarios){
  const c=normalizeProfile(profile.config),data={sets:[],runs:[],checkins:[],sessionFeedback:[],decisions:[],overrides:{},completedWorkouts:[],customRoadmap:c,activeCustomWeek:1};
  let serial=0;const weeks=[];
  for(let w=1;w<=c.weeks;w++){
   const now=Date.UTC(2026,9,19+(w-1)*7+6,23),base=JSON.stringify(data);
   const engine=createEngine({data,now:()=>now});let sessions;
   try{sessions=engine.generatedSessions(c,w)}catch(e){failures.push({id:profile.id+':generation',message:e.message});continue}
   check('generation does not alter athlete state',()=>assert.equal(JSON.stringify(data),base));
   data.activeCustomWeek=w;data.activeSchedule=sessions;
   for(const session of sessions){
    if(session.eventDate)continue;
    serial++;if(scenario==='missed-for-schedule'&&serial%3===0)continue;
    const delta=scenario==='rapid-progress'||scenario==='pain-report'&&w>=4?-1:scenario==='accumulated-fatigue'&&w>=4?1:scenario==='variable-effort'?[0,0,1,0,-.5][serial%5]:0;
    const di={Mon:0,Tue:1,Wed:2,Thu:3,Fri:4,Sat:5,Sun:6}[session.day.slice(0,3)],date=new Date(Date.UTC(2026,9,19+(w-1)*7+di,12)).toISOString();
    for(const [name,sets,reps,weight,rpe,meta] of session.ex||[]){
     check('bounded prescribed effort',()=>assert.ok(rpe>=0&&rpe<=10));
     if(!(weight>0))continue; // Unknown weights are never fabricated to make a test progress.
     for(let set=1;set<=sets;set++)data.sets.push({date,exercise:name,weight,reps,rpe:Math.max(1,Math.min(10,rpe+delta)),target:rpe,role:meta?.role,session:session.name,set,week:w});
    }
    for(const run of session.runs||[]){
     check('finite run prescription',()=>assert.ok(Number.isFinite(run.minutes)&&run.minutes>=0&&Number.isFinite(run.distanceKm)&&run.distanceKm>=0));
     if(!profile.config.tenKTime)check('unknown pace remains effort-based',()=>assert.ok(!/\d:\d\d/.test(String(run.pace))));
     data.runs.push({date,km:run.distanceKm,min:run.minutes,rpe:Math.max(1,Math.min(10,run.rpe+delta)),type:run.role,week:w});
    }
    data.sessionFeedback.push({date,difficulty:delta>0?'harder':delta<0?'easier':'expected',energy:scenario==='accumulated-fatigue'&&w>=4?'low':'good',discomfort:scenario==='pain-report'&&w>=4?'yes':'no'});
   }
   if(scenario==='accumulated-fatigue'&&w>=4)for(const offset of [1,3])data.checkins.push({date:new Date(Date.UTC(2026,9,19+(w-1)*7+offset,8)).toISOString(),sleep:2,energy:2,soreness:4,stress:4,symptoms:''});
   const before=JSON.stringify(data),coach=createEngine({data,schedule:sessions,now:()=>now}),decision=coach.reviewDecision();
   check('review deterministic',()=>assert.deepEqual(coach.reviewDecision(),decision));
   check('pending review never mutates athlete data or prescriptions',()=>assert.equal(JSON.stringify(data),before));
   if(scenario==='pain-report'&&w>=4)check('reported discomfort blocks progression',()=>assert.equal(increase(decision),false));
   const cycle=coach.cycleWeek(w,c.weeks),phase=coach.customPhase(w,c.weeks,c);
   if(cycle.deload||phase==='Taper / event')check('protected recovery/taper',()=>assert.equal(increase(decision),false));
   weeks.push({week:w,phase,deload:cycle.deload,status:decision.status,proposals:decision.changes||[],appliedChanges:0});
  }
  trajectories.push({athlete:profile.id,scenario,status:'tested',weeks});
 }
 // These are acceptance requirements, independent of the implementation's labels.
 for(const profile of profiles){
  const c=normalizeProfile(profile.config),p=buildProgramme(c,{now:()=>Date.UTC(2026,9,19)}),engine=createEngine({data:{sets:[],runs:[],checkins:[],decisions:[],customRoadmap:c},now:()=>Date.UTC(2026,9,19)});
  for(let i=1;i<p.weeks.length;i++){const a=p.weeks[i-1],b=p.weeks[i];if(a.phase!==b.phase&&!a.deload&&!b.deload&&!/Taper/.test(b.phase))gap('phase-transition-recovery',profile.id,'Phase changes include recovery or a reviewed rationale.',a.phase+' → '+b.phase+' at week '+b.week)}
  if(c.topSetFirst&&p.weeks[0].sessions.some(s=>s.ex.some(e=>e[0]==='Bench'&&e[5]?.role==='straight')))gap('bench-top-set-preference',profile.id,'Honour requested bench top-set-first style.','Foundation bench uses straight sets');
  if(c.lightLifts)for(const s of p.weeks.flatMap(w=>w.sessions))for(const e of s.ex||[])if(c.lightLifts.some(l=>String(e[0]).toLowerCase()===l)&&e[4]>6)gap('light-lower-body',profile.id,'Represent explicitly light lower-body work.',e[0]+' target RPE '+e[4]);
  if(c.trainingAge){const changed={...c,trainingAge:c.trainingAge==='beginner'?'advanced':'beginner'};if(JSON.stringify(engine.generatedSessions(c,1))===JSON.stringify(engine.generatedSessions(changed,1)))gap('training-experience',profile.id,'Training experience influences prescription or prompts review.','Beginner/advanced input has no effect')}
  if(c.purposefulVariations&&!p.weeks.some(w=>w.sessions.some(s=>s.ex.some(e=>/safety.bar|front squat|spoto|paused|close.grip|deficit/i.test(e[0])))))gap('lift-variation',profile.id,'Purposeful variations across blocks.','No purposeful variations generated');
  if(c.hybridFocus==='running'){
   const strength=p.weeks[5].sessions.flatMap(s=>s.ex),other=buildProgramme({...c,priority:'Balanced',hybridFocus:'strength'}).weeks[5].sessions.flatMap(s=>s.ex);
   if(JSON.stringify(strength)===JSON.stringify(other))gap('strength-maintenance-policy',profile.id,'A distinct maintenance prescription policy supports running.','Maintenance and progressive strength use identical prescriptions');
  }
  if(c.fixedSessions?.some(s=>s.kind==='run'&&s.runType==='long')){const fixed=c.fixedSessions.find(s=>s.kind==='run'&&s.runType==='long');if(!p.weeks[0].sessions.some(s=>s.day.slice(0,3)===fixed.day.slice(0,3)&&s.runs?.some(r=>r.role==='long-run')))gap('fixed-long-run-role',profile.id,'Protect both day and training role.','Requested long run is absent')}
  if(c.maxSessionsPerDay&&p.weeks.some(w=>w.sessions.some(s=>(s.ex||[]).filter(e=>['top','straight'].includes(e[5]?.role)&&!e[5]?.optional).length+(s.runs||[]).length>c.maxSessionsPerDay)))gap('daily-session-capacity',profile.id,'Respect component limits or return explicit unscheduled work.','Generated day exceeds requested component capacity; generic warnings are not a resolution');
 }
 const reference=normalizeProfile({...profiles[0].config,weeks:12}),post=buildProgramme(reference);
 if(post.weeks.slice(6).every(w=>w.phase==='Taper / event'))gap('post-event-progression','bench-dual-event','Recover after the event and review the next training phase.','Strength event leaves all later weeks labelled taper/event');
 const summary={profiles:profiles.length,trajectories:trajectories.length,simulatedWeeks:trajectories.reduce((n,t)=>n+t.weeks.length,0),checks,regressionFailures:failures.length,coachingGaps:gaps.size,coachingGatesPassed:failures.length===0&&gaps.size===0,readyForLiveUse:false};
 return {schema:'lhrf-athlete-test-report-v2',engine:'lhrf-shared-coach-v1',synthetic:true,profiles:profiles.map(p=>({id:p.id,name:p.name,weeks:p.config.weeks,expectations:p.expectations})),scenarios,summary,failures,coachingGaps:[...gaps.values()],trajectories,limitations:['RPE and recovery are scripted inputs, not predicted physiological responses.','Tests now exercise the live app shared engine; old v2 prototype tests are historical only.','Real-world efficacy and device-local records are not certified.']};
}
module.exports={runSuite,profiles,scenarios};
