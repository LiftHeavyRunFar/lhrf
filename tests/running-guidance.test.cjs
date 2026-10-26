const test=require('node:test'),assert=require('node:assert/strict');
const coach=require('../src/coach-engine.js'),{refreshRunningGuidance}=require('../src/programme-install.js');
const approved=require('../programmes/november-2026.json');
const old={...approved};delete old.runningGuidanceVersion;
const make=c=>coach.createEngine({data:{customRoadmap:c,sets:[],runs:[],checkins:[],decisions:[]}});
test('distance guidance has a short cooldown, numeric pace for every step, progressive actual mileage and unchanged lifting',()=>{
 const revised=make(approved),legacy=make(old),totals=[];
 for(let week=1;week<=5;week++){
  const sessions=revised.generatedSessions(approved,week),prior=legacy.generatedSessions(old,week);
  assert.deepEqual(sessions.map(s=>s.ex),prior.map(s=>s.ex));
  const runs=sessions.flatMap(s=>s.runs),total=runs.reduce((n,r)=>n+r.distanceKm,0);totals.push(total);
  for(const run of runs){assert.equal(run.distanceKm,run.steps.reduce((n,s)=>n+s.distanceKm,0));for(const step of run.steps){assert.match(step.pace,/\d+:\d{2}\/km/);if(step.label==='Cool-down')assert.equal(step.distanceKm,1.25)}}
  assert.ok(runs.filter(r=>r.role==='quality-run').length<=1);
 }
 assert.ok(Math.abs(totals[0]-15.65)<1e-9);for(let i=1;i<4;i++)assert.ok(totals[i]>totals[i-1]);assert.ok(totals[4]<totals[3]);
 const first=revised.generatedSessions(approved,1).flatMap(s=>s.runs).find(r=>r.role==='quality-run');assert.ok(Math.abs(first.distanceKm-6.15)<1e-9);
});
test('repair preserves completed and past prescriptions, all history, lifting, overrides and onboarding; active workouts defer repair',()=>{
 const initial={customRoadmap:old,activeCustomWeek:1,activeSchedule:make(old).generatedSessions(old,1),sets:[{weight:140}],runs:[{km:5}],completedWorkouts:[{id:old.sessionNamespace+'custom-tue',week:1}],overrides:{keep:true},decisions:[{approved:true}],onboardingComplete:true,preferences:{keep:true}};
 const snapshot=JSON.stringify(initial),next=refreshRunningGuidance(initial,coach,'2026-10-25T12:00:00Z');assert.equal(JSON.stringify(initial),snapshot);
 assert.equal(next.customRoadmap.runningGuidanceVersion,2);
 for(const key of ['sets','runs','completedWorkouts','overrides','decisions','onboardingComplete','preferences'])assert.deepEqual(next[key],initial[key]);
 assert.deepEqual(next.activeSchedule[0],initial.activeSchedule[0]);assert.deepEqual(next.activeSchedule.map(s=>s.ex),initial.activeSchedule.map(s=>s.ex));
 assert.equal(refreshRunningGuidance(next,coach),next);assert.equal(refreshRunningGuidance(initial,coach,undefined,true),initial);
 const past=refreshRunningGuidance(initial,coach,'2026-11-03T12:00:00Z');assert.deepEqual(past.activeSchedule,initial.activeSchedule);
});
test('the approved live version-2 block remains identical while candidate running changes are tested',()=>{
 const crypto=require('node:crypto'),fixture=require('./fixtures/approved-running-v2.json');
 for(const row of fixture.weeks)assert.equal(crypto.createHash('sha256').update(JSON.stringify(coach.createEngine({data:{customRoadmap:fixture.config}}).generatedSessions(fixture.config,row.week))).digest('hex'),row.sha256);
});
