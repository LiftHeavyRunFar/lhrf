const test=require('node:test'),assert=require('node:assert/strict'),coach=require('../src/coach-engine'),install=require('../src/programme-install'),base=require('../programmes/november-2026.json');
const now='2026-10-27T20:00:00Z',engine=coach.createEngine();
function fixture(week=1){return {customRoadmap:base,activeCustomWeek:week,activeSchedule:engine.generatedSessions(base,week),sets:[{sessionId:'old',weight:100}],runs:[{sessionId:'old',km:5}],completedWorkouts:[],sessionFeedback:[{energy:4}],checkins:[{sleep:5}],decisions:[{approved:true}],overrides:{keep:true},onboardingComplete:true,preferences:{keep:true}}}
test('approved running refresh preserves all logs, settings, lifting, dates and identifiers without mutating input',()=>{
 const state=fixture(),before=JSON.stringify(state),next=install.refreshApprovedRunningProgramme(state,coach,now);
 assert.equal(JSON.stringify(state),before);for(const key of ['sets','runs','completedWorkouts','sessionFeedback','checkins','decisions','overrides','onboardingComplete','preferences','activeCustomWeek'])assert.deepEqual(next[key],state[key]);
 assert.deepEqual(next.activeSchedule.map(s=>[s.id,s.day,s.ex]),state.activeSchedule.map(s=>[s.id,s.day,s.ex]));
 for(const k of ['strengthTargetDate','runningTargetDate','startDate','priority','manualSplit','fixedSessions'])assert.deepEqual(next.customRoadmap[k],state.customRoadmap[k]);
 assert.equal(next.customRoadmap.runProfile.seconds,1700);assert.equal(next.customRoadmap.runProfile.environment,'outdoor');assert.equal(next.customRoadmap.runProfile.resultDate,null);assert.equal(next.runningProgrammeArchive[0].programme.runProfile.seconds,3900);
 assert.equal(install.refreshApprovedRunningProgramme(next,coach,now),next);
});
test('completed run components, legacy combined completions, logged runs, past sessions and active drafts are preserved',()=>{
 for(const mode of ['component','combined','logged','active']){const s=fixture(),tue=s.activeSchedule.find(x=>x.day==='Tue');if(mode==='component')s.completedWorkouts=[{id:tue.id+'::run',week:1}];if(mode==='combined')s.completedWorkouts=[{id:tue.id,week:1}];if(mode==='logged')s.runs.push({sessionId:tue.id+'::run',week:1,km:6});const live=mode==='active'?{id:tue.id+'::run',week:1,entries:[{keep:true}]}:null;const next=install.refreshApprovedRunningProgramme(s,coach,now,live);assert.deepEqual(next.activeSchedule.find(x=>x.id===tue.id),tue,mode);}
 const s=fixture();const next=install.refreshApprovedRunningProgramme(s,coach,'2026-11-01T12:00:00Z');assert.deepEqual(next.activeSchedule,s.activeSchedule);
 const other={...s,customRoadmap:{...base,programmeId:'another-athlete'}};assert.equal(install.refreshApprovedRunningProgramme(other,coach,now),other);
});
test('updated five-week plan has a pyramid, target-pace practice, easy Saturdays and easy race-week Tuesday with identical lifting',()=>{
 const c=install.refreshApprovedRunningProgramme(fixture(),coach,now).customRoadmap;
 for(let w=1;w<=5;w++){const next=engine.generatedSessions(c,w),old=engine.generatedSessions(base,w);assert.deepEqual(next.map(s=>[s.id,s.day,s.ex]),old.map(s=>[s.id,s.day,s.ex]));const sat=next.find(s=>s.day==='Sat');if(sat)assert.ok(sat.runs.every(r=>r.role==='long-run'&&r.workMinutes===0));}
 const get=w=>engine.generatedSessions(c,w).find(s=>s.day==='Tue').runs[0];assert.equal(get(2).workoutFamily,'pyramid');assert.equal(get(3).workoutFamily,'race-pace-repeats');assert.equal(get(3).pace,'5:55/km to 6:05/km');assert.equal(get(5).role,'easy-run');assert.equal(get(5).steps.some(s=>s.role==='work'),false);
});
