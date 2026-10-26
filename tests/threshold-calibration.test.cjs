const test=require('node:test'),assert=require('node:assert/strict');
const moduleEngine=require('../src/coach-engine'),engine=moduleEngine.createEngine(),install=require('../src/programme-install'),base=require('../programmes/november-2026.json');
test('threshold uses one-hour race-equivalent fitness, independent of aspirational goal pace',()=>{
 const c={...base,runningPaceVersion:2},p=engine.runningPaces(c);
 assert.ok(p.threshold>387&&p.threshold<389);assert.equal(engine.runningPaces({...c,runningGoalSeconds:3000}).threshold,p.threshold);
 assert.equal(engine.runningPaces({...c,runProfile:{...c.runProfile,seconds:3600}}).threshold,360);
 const elite=engine.runningPaces({...c,runProfile:{distance:10,seconds:1800}});assert.ok(elite.threshold>180&&elite.threshold<190,'30-minute 10K runner has slower one-hour pace');
 assert.equal(engine.runningPaces({...c,runningPaceVersion:1}).threshold,405.6);
 const run=engine.generatedSessions(c,1).flatMap(s=>s.runs).find(r=>r.role==='quality-run');
 assert.equal(run.pace,'6:23/km to 6:33/km');assert.equal(run.steps.filter(s=>/Threshold interval/.test(s.label)).length,3);
 assert.ok(Math.abs(run.distanceKm-6.15)<1e-9);assert.equal(run.paceBasis.goalSeconds,3600);assert.match(run.coachNote,/warm-up|warm.up|Warm-up/i);
});
test('authorised pace repair changes future running paces only, archives old runs and preserves completed sessions',()=>{
 const c={...base};delete c.runningPaceVersion;delete c.runningGoalSeconds;
 const schedule=engine.generatedSessions(c,1),done=schedule.find(s=>s.day.startsWith('Fri'));
 const state={customRoadmap:c,activeCustomWeek:1,activeSchedule:schedule,sets:[{weight:100}],runs:[{km:5}],completedWorkouts:[{id:done.id,week:1}],checkins:[{sore:true}],decisions:[{approved:true}],overrides:{keep:true},onboardingComplete:true};
 const before=JSON.stringify(state),next=install.refreshApprovedThresholdPaces(state,moduleEngine,'2026-10-26T22:00:00Z');
 assert.equal(JSON.stringify(state),before);assert.equal(next.customRoadmap.runningPaceVersion,2);
 for(const key of ['sets','runs','completedWorkouts','checkins','decisions','overrides','onboardingComplete'])assert.deepEqual(next[key],state[key]);
 assert.deepEqual(next.activeSchedule.map(s=>s.ex),schedule.map(s=>s.ex));
 assert.deepEqual(next.activeSchedule.find(s=>s.id===done.id),done);
 const oldRun=schedule.flatMap(s=>s.runs).find(r=>r.role==='quality-run'),newRun=next.activeSchedule.flatMap(s=>s.runs).find(r=>r.role==='quality-run');
 assert.equal(oldRun.pace,'6:41/km to 6:51/km');assert.equal(newRun.pace,'6:23/km to 6:33/km');
 assert.deepEqual(newRun.steps.map(s=>s.distanceKm),oldRun.steps.map(s=>s.distanceKm));
 assert.deepEqual(newRun.steps.filter(s=>!/Threshold/.test(s.label)),oldRun.steps.filter(s=>!/Threshold/.test(s.label)));
 assert.equal(next.runningPaceArchive.length,1);assert.equal(install.refreshApprovedThresholdPaces(next,moduleEngine),next);
 const past=install.refreshApprovedThresholdPaces(state,moduleEngine,'2026-11-01T12:00:00Z');assert.deepEqual(past.activeSchedule[0],schedule[0]);
 assert.equal(install.refreshApprovedThresholdPaces({...state,customRoadmap:{...c,programmeId:'someone-else'}},moduleEngine).customRoadmap.programmeId,'someone-else');
});
