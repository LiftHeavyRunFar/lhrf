const test=require('node:test'),assert=require('node:assert/strict');
const coach=require('../src/coach-engine'),install=require('../src/programme-install'),base=require('../programmes/november-2026.json');
const prior={...base,benchExposureVersion:1},config={...prior,benchAccessoryVersion:1};
const engine=coach.createEngine(),sessions=(c=config,w=1,e=engine)=>e.generatedSessions(c,w);
const required=s=>s.ex.filter(e=>e[5]?.role==='accessory'),main=s=>s.ex.filter(e=>e[5]?.benchRole);
const state=()=>({customRoadmap:{...prior,approvedBenchRevision:'2026-10-29-bench-roles-v1'},activeCustomWeek:1,activeSchedule:sessions(prior),sets:[{exercise:'Bench',weight:115,reps:5,rpe:7,sessionId:'old'}],runs:[],completedWorkouts:[],decisions:[{approved:true}],overrides:{},checkins:[],onboardingComplete:true,sentinel:'keep'});
const now='2026-10-29T22:00:00Z';
test('three bench days have distinct, complete support work including shoulders and back',()=>{
 const plan=sessions(),tue=plan.find(s=>s.day==='Tue'),fri=plan.find(s=>s.day==='Fri'),sun=plan.find(s=>s.day==='Sun');
 assert.deepEqual(required(tue).map(e=>e[0]),['Incline dumbbell press','Chest-supported row','Dumbbell lateral raise']);
 assert.deepEqual(required(fri).map(e=>e[0]),['Lat pulldown','Triceps pushdown','Reverse pec deck']);
 assert.deepEqual(required(sun).map(e=>e[0]),['Seated dumbbell shoulder press','Seated cable row','Face pull']);
 for(const s of [tue,fri,sun]){
  assert.equal(required(s).length,3);assert.equal(s.ex.filter(e=>e[5]?.optional).length,2);
  const first=s.ex.findIndex(e=>e[5]?.optional);assert.ok(s.ex.slice(first).every(e=>e[5]?.optional));
  for(const e of required(s)){assert.ok(e[5].purpose);assert.ok(e[5].repRange);assert.equal(e[4],7);assert.equal(e[3],0,'Unknown accessory load is not invented from bench');}
 }
 assert.ok(!fri.ex.some(e=>e[5]?.optional&&/triceps|pushdown/i.test(e[0])));
 assert.ok(!tue.ex.some(e=>e[5]?.optional&&/lateral raise/i.test(e[0])));
});
test('accessory revision leaves every competition bench prescription, running and lower lift unchanged',()=>{
 for(let w=1;w<=5;w++){
  const old=sessions(prior,w),next=sessions(config,w);
  assert.deepEqual(next.map(s=>[s.id,main(s),s.runs]),old.map(s=>[s.id,main(s),s.runs]));
  for(const s of old.filter(s=>!main(s).length))assert.deepEqual(next.find(n=>n.id===s.id),s);
 }
});
test('support movements are stable within a block, rotate in later blocks and retain recovery weeks',()=>{
 const c={...config,weeks:20,strengthTargetDate:null,runningTargetDate:null};
 const names=w=>sessions(c,w).filter(s=>main(s).length).map(s=>required(s).map(e=>e[0]));
 for(const w of [2,3,4,5])assert.deepEqual(names(w),names(1));
 assert.notDeepEqual(names(6),names(1));assert.notDeepEqual(names(11),names(6));
 for(const s of sessions(c,5))for(const e of required(s)){assert.equal(e[1],1);assert.equal(e[4],6)}
});
test('avoid/unavailable/prefer selects alternatives for the same purpose and filters optional extras',()=>{
 const e=coach.createEngine({data:{accessoryPreferences:{'Incline dumbbell press':'avoid','Low-incline dumbbell press':'unavailable','Cable biceps curl':'avoid','Triceps pushdown':'avoid','Overhead triceps extension':'unavailable','Seated cable row':'prefer'}}});
 const plan=sessions(config,1,e),tue=plan.find(s=>s.day==='Tue'),fri=plan.find(s=>s.day==='Fri');
 assert.equal(required(tue)[0][0],'Dumbbell floor press');assert.equal(required(tue)[1][0],'Seated cable row');
 assert.equal(required(fri)[1][0],'Single-arm cable pushdown');
 assert.ok(plan.every(s=>s.ex.every(x=>!['Incline dumbbell press','Low-incline dumbbell press','Cable biceps curl','Triceps pushdown','Overhead triceps extension'].includes(x[0]))));
 const noPress=coach.createEngine({data:{accessoryPreferences:{'Incline dumbbell press':'avoid','Low-incline dumbbell press':'avoid','Dumbbell floor press':'unavailable'}}});
 assert.equal(required(sessions(config,1,noPress).find(s=>s.day==='Tue')).length,2,'No forced unavailable exercise');
});
test('accessory loads use only exact exercise history and progress after the top of the rep range',()=>{
 const e=coach.createEngine({data:{sets:[{exercise:'Bench',weight:160,reps:1,rpe:8},{exercise:'Incline dumbbell press',weight:20,reps:10,rpe:7},{exercise:'Seated cable row',weight:40,reps:10,rpe:7}]}});
 const p=sessions(config,1,e),tue=required(p.find(s=>s.day==='Tue')),sun=required(p.find(s=>s.day==='Sun'));
 assert.equal(tue[0][3],20.5);assert.equal(tue[1][3],0);assert.equal(sun[0][3],0);assert.equal(sun[1][3],40);
});
test('support work tapers before the meet and never reinstates pressing after the final heavy single',()=>{
 const late=sessions(config,4),fri=late.find(s=>s.day==='Fri'),sun=late.find(s=>s.day==='Sun');
 assert.ok(required(fri).every(e=>e[4]===6));assert.equal(required(fri).reduce((n,e)=>n+e[1],0),4);
 assert.deepEqual(required(sun).map(e=>e[0]),['Seated cable row','Face pull']);assert.ok(sun.ex.every(e=>!e[5]?.optional));
 for(const s of sessions(config,5))assert.equal(required(s).length,0);
});
test('installed update adds Sunday accessories while preserving saved main loads and all history',()=>{
 const s=state(),fri=s.activeSchedule.find(s=>s.day==='Fri');fri.ex[0][3]=142.5;const before=JSON.stringify(s);
 const next=install.refreshApprovedBenchProgramme(s,coach,now);
 assert.equal(JSON.stringify(s),before);assert.equal(next.customRoadmap.benchAccessoryVersion,1);
 for(const key of Object.keys(s).filter(k=>!['customRoadmap','activeSchedule'].includes(k)))assert.deepEqual(next[key],s[key]);
 for(const day of ['Fri','Sun'])assert.deepEqual(main(next.activeSchedule.find(s=>s.day===day)),main(s.activeSchedule.find(s=>s.day===day)));
 assert.equal(required(next.activeSchedule.find(s=>s.day==='Sun')).length,3);
 assert.deepEqual(next.activeSchedule.find(s=>s.day==='Tue'),s.activeSchedule.find(s=>s.day==='Tue'));
 assert.equal(install.refreshApprovedBenchProgramme(next,coach,now),next);
 assert.equal(next.benchProgrammeArchive[0].sessions.find(s=>s.day==='Fri').ex[0][3],142.5);
});
test('started, partially logged, completed and overridden bench sessions keep the entire original prescription',()=>{
 for(const mode of ['active','logged','completed','override']){
  const s=state(),sun=s.activeSchedule.find(x=>x.day==='Sun');
  if(mode==='logged')s.sets.push({sessionId:sun.id+'::strength',week:1,weight:87.5});
  if(mode==='completed')s.completedWorkouts.push({id:sun.id+'::strength',week:1});
  if(mode==='override')s.overrides[sun.id]={exercise:'Bench',loadFactor:.95};
  const live=mode==='active'?{id:sun.id+'::strength',entries:{'0_0':{done:true}},notes:'retain'}:null;
  const next=install.refreshApprovedBenchProgramme(s,coach,now,live);
  assert.deepEqual(next.activeSchedule.find(x=>x.id===sun.id),sun,mode);
 }
});
