const test=require('node:test'),assert=require('node:assert/strict');
const coach=require('../src/coach-engine'),install=require('../src/programme-install'),base=require('../programmes/november-2026.json');
const config={...base,benchExposureVersion:1};
const engine=coach.createEngine();
const bench=s=>s.ex.filter(e=>e[5]?.benchRole);
const sessions=(c=config,w=1)=>engine.generatedSessions(c,w);
const now='2026-10-29T22:00:00Z';
function fixture(week=1){return {customRoadmap:base,activeCustomWeek:week,activeSchedule:sessions(base,week),sets:[{sessionId:'old',weight:100}],runs:[{sessionId:'old',km:5}],completedWorkouts:[],sessionFeedback:[{energy:4}],checkins:[{sleep:5}],decisions:[{approved:true}],overrides:{keep:true},onboardingComplete:true,preferences:{keep:true}}}
test('short preparation has volume, heavy single and speed practice from week one',()=>{
 const plan=sessions(),tue=bench(plan.find(s=>s.day==='Tue')),fri=bench(plan.find(s=>s.day==='Fri')),sun=bench(plan.find(s=>s.day==='Sun'));
 assert.deepEqual(tue.map(e=>[e[1],e[2],e[5].benchRole]),[[1,5,'volume'],[3,5,'volume']]);
 assert.deepEqual(fri.map(e=>[e[1],e[2],e[5].benchRole]),[[1,1,'heavy'],[3,3,'heavy']]);
 assert.equal(fri[0][3],140);assert.equal(fri[0][4],7.5);
 assert.deepEqual(sun.map(e=>[e[1],e[2],e[3],e[5].benchRole]),[[6,2,87.5,'speed']]);
 assert.ok(sun[0][5].cue.includes('deteriorates'));assert.ok(fri[0][5].cue.includes('no grinders'));
 assert.ok(plan.find(s=>s.day==='Sun').ex.every(e=>e[0]==='Bench'));
 for(const s of plan)for(const e of bench(s)){assert.equal(e[0],'Bench');assert.equal(e[5].competition,true)}
});
test('peaking maintains heavy practice, reduces volume and ends heavy work eight days out',()=>{
 const heavy=[],reps=[];
 for(let w=1;w<=4;w++){
  const all=sessions(config,w),b=all.flatMap(bench);heavy.push(b.find(e=>e[5].benchRole==='heavy')[3]);
  reps.push(b.reduce((n,e)=>n+e[1]*e[2],0));
  assert.equal(b.filter(e=>e[5].role==='top'&&e[2]===1).length,1);
 }
 assert.deepEqual(heavy,[140,142.5,145,147.5]);assert.ok(reps[3]<reps[0]*.6);
 const final=sessions(config,4).find(s=>s.day==='Fri');assert.equal(bench(final)[0][4],8);
 const week5=sessions(config,5);assert.ok(!week5.some(s=>s.day==='Fri'));
 assert.deepEqual(bench(week5.find(s=>s.day==='Tue')).map(e=>[e[1],e[2],e[3]]),[[2,2,95]]);
 assert.deepEqual(week5.filter(s=>s.eventDate).map(s=>s.eventDate),['2026-11-28','2026-11-29']);
});
test('roles use the event distance for short and long horizons; deloads stay light',()=>{
 for(const weeks of [4,5,8,12,20,52]){
  const d=new Date('2026-10-24T12:00:00Z');d.setUTCDate(d.getUTCDate()+(weeks-1)*7);
  const c={...config,startDate:'2026-10-19',weeks,strengthTargetDate:d.toISOString().slice(0,10),runningTargetDate:null};
  for(let w=1;w<weeks;w++){
   const b=sessions(c,w).flatMap(bench),deload=engine.candidateWeek(c,w).deload;
   assert.equal(b.filter(e=>e[5].role==='top'&&e[5].benchRole==='heavy').length,deload?0:1,`${weeks} week plan W${w}`);
   if(deload)assert.ok(b.every(e=>e[4]<=6));
   else if(weeks-w<=4)assert.ok(b.find(e=>e[5].benchRole==='heavy')[3]>=140);
  }
 }
});
test('legacy, beginner, light bench and maintenance programmes do not acquire heavy singles',()=>{
 assert.ok(sessions(base).flatMap(bench).length===0);
 for(const c of [{...config,coachingPolicy:'review-v2',trainingAge:'beginner'},{...config,lightLifts:['bench']},{...config,coachingPolicy:'review-v2',strengthMode:'maintenance'}])assert.equal(sessions(c).flatMap(bench).length,0);
});
test('role policy preserves running and lower body prescriptions exactly',()=>{
 for(let w=1;w<=5;w++){
  const before=sessions(base,w),after=sessions(config,w);
  for(const s of before){if(s.ex.some(e=>/bench/i.test(e[0])))continue;assert.deepEqual(after.find(x=>x.id===s.id),s)}
  assert.deepEqual(after.flatMap(s=>s.runs),before.flatMap(s=>s.runs));
 }
});
test('approved progression and actual single feedback retain a bounded backoff load',()=>{
 const state={customRoadmap:config,decisions:[{approved:true,kind:'adaptive-progression',exercise:'Bench',week:1,factor:1.025}]},e=coach.createEngine({data:state});
 const plan=e.carryForwardApprovedProgression(e.generatedSessions(config,2),2);
 for(const s of plan){const top=s.ex.find(x=>x[5]?.role==='top');if(!top)continue;const back=s.ex.find(x=>x[5]?.role==='backoff');assert.ok(back[3]>0&&back[3]<top[3]);assert.equal(back[5].topIndex,s.ex.indexOf(top))}
 const back=bench(sessions().find(s=>s.day==='Fri'))[1];
 const load=e.phaseBackoffLoad(140,1,9,back[5].backoffProfile);assert.ok(load<140*.89);
});
test('approved refresh preserves logs, completed Tuesday, running, lower lifts and all unrelated state',()=>{
 const old=fixture(),snapshot=JSON.stringify(old),next=install.refreshApprovedBenchProgramme(old,coach,now);
 assert.equal(JSON.stringify(old),snapshot);
 for(const key of Object.keys(old).filter(k=>!['customRoadmap','activeSchedule'].includes(k)))assert.deepEqual(next[key],old[key],key);
 assert.equal(next.customRoadmap.benchExposureVersion,1);
 assert.deepEqual(next.activeSchedule.find(s=>s.day==='Tue'),old.activeSchedule.find(s=>s.day==='Tue'));
 assert.equal(bench(next.activeSchedule.find(s=>s.day==='Fri'))[0][3],140);
 assert.deepEqual(next.activeSchedule.flatMap(s=>s.runs),old.activeSchedule.flatMap(s=>s.runs));
 assert.deepEqual(next.activeSchedule.find(s=>s.day==='Thu'),old.activeSchedule.find(s=>s.day==='Thu'));
 assert.equal(next.benchProgrammeArchive.length,1);assert.equal(install.refreshApprovedBenchProgramme(next,coach,now),next);
});
test('completed, partially logged, active and overridden strength sessions are protected; run-only completions allow bench update',()=>{
 for(const mode of ['combined','component','logged','active','override','run']){
  const old=fixture(),fri=old.activeSchedule.find(s=>s.day==='Fri');
  if(mode==='combined'||mode==='component')old.completedWorkouts.push({id:fri.id+(mode==='component'?'::strength':''),week:1});
  if(mode==='run')old.completedWorkouts.push({id:fri.id+'::run',week:1});
  if(mode==='logged')old.sets.push({sessionId:fri.id+'::strength',week:1,weight:100});
  if(mode==='override')old.overrides[fri.id]={exercise:'Bench',loadFactor:.9};
  const live=mode==='active'?{id:fri.id+'::strength',entries:{keep:true}}:null;
  const next=install.refreshApprovedBenchProgramme(old,coach,now,live),updated=next.activeSchedule.find(s=>s.id===fri.id);
  if(mode==='run')assert.equal(bench(updated)[0][2],1);else assert.deepEqual(updated,fri,mode);
  if(mode==='active'){
   const retry=install.refreshApprovedBenchProgramme(next,coach,now);assert.equal(bench(retry.activeSchedule.find(s=>s.id===fri.id))[0][2],1);
  }
 }
});
test('refresh scopes authorisation to this block and respects London dates',()=>{
 const s=fixture();
 for(const c of [{...base,programmeId:'other'},{...base,strengthTargetDate:'2027-11-28'}]){const other={...s,customRoadmap:c};assert.equal(install.refreshApprovedBenchProgramme(other,coach,now),other)}
 assert.equal(install.refreshApprovedBenchProgramme(s,coach,'2026-10-28T23:00:00Z'),s);
 const sunday=fixture(),later=install.refreshApprovedBenchProgramme(sunday,coach,'2026-11-01T00:30:00Z');assert.deepEqual(later.activeSchedule.find(s=>s.day==='Fri'),sunday.activeSchedule.find(s=>s.day==='Fri'));
});
