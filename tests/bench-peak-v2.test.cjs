const test=require('node:test'),assert=require('node:assert/strict');
const coach=require('../src/coach-engine'),install=require('../src/programme-install'),base=require('../programmes/november-2026.json');
const previous={...base,benchExposureVersion:1,benchAccessoryVersion:1,approvedBenchRevision:'2026-10-29-bench-accessories-v1'};
const config={...previous,benchPeakVersion:2,finalHeavyBenchDaysOut:6};
const engine=coach.createEngine(),sessions=(c=config,w=1,e=engine)=>e.generatedSessions(c,w);
const main=s=>(s.ex||[]).filter(e=>e[5]?.benchRole),top=s=>main(s).find(e=>e[5]?.role==='top');
const now='2026-10-30T05:30:00Z';
function date(s,w){const d=new Date('2026-10-26T12:00:00Z'),i=['mon','tue','wed','thu','fri','sat','sun'].indexOf(s.day.slice(0,3).toLowerCase());d.setUTCDate(d.getUTCDate()+(w-1)*7+i);return d.toISOString().slice(0,10)}
function fixture(week=1){
 const old=sessions(previous,week);
 return {customRoadmap:previous,activeSchedule:old,activeCustomWeek:week,sets:[{date:'2026-10-27T06:30:00Z',sessionId:'november-2026-custom-tue::strength',week:1,exercise:'Bench',weight:120,reps:5,rpe:7},{date:'2026-10-29T06:30:00Z',sessionId:'november-2026-custom-thu::strength',week:1,exercise:'Squat',weight:60,reps:3,rpe:5}],runs:[{km:5,min:32}],completedWorkouts:[{id:'november-2026-custom-tue::strength',week:1,prescription:{ex:[['Bench',1,5,120,7]]}},{id:'november-2026-custom-thu::strength',week:1,prescription:{ex:[['Squat',2,3,60,5]]}}],checkins:[{sleep:4}],sessionFeedback:[{energy:4}],decisions:[{approved:true,kind:'adaptive-progression',exercise:'Bench',week:1,factor:1.075}],overrides:{'completed-day':{keep:true}},onboardingComplete:true,preferences:{keep:true},programmeArchive:[{old:true}]};
}
test('approved heavy singles target 8, 8.5, 8.5 and 9 on the reviewed dates with recalibrated suggestions',()=>{
 const heavy=[];
 for(let w=1;w<=5;w++)for(const s of sessions(config,w)){const t=top(s);if(t&&t[2]===1)heavy.push([date(s,w),t[4],t[3]])}
 assert.deepEqual(heavy,[['2026-10-30',8,147.5],['2026-11-06',8.5,150],['2026-11-13',8.5,150],['2026-11-22',9,152.5]]);
 assert.equal(new Date('2026-11-28')-new Date(heavy.at(-1)[0]),6*86400000);
 for(const w of [1,2,3,4])for(const s of sessions(config,w))for(const e of main(s))assert.equal(e[5].benchPeakVersion,2);
});
test('Friday before the final Sunday is light technique with no support work; final Sunday has only a single and easy backoff',()=>{
 const p=sessions(config,4),fri=p.find(s=>s.day==='Fri'),sun=p.find(s=>s.day==='Sun');
 assert.deepEqual(main(fri).map(e=>[e[1],e[2],e[3],e[4],e[5].benchRole]),[[2,2,95,5.5,'technique']]);assert.equal(fri.ex.length,1);
 assert.deepEqual(main(sun).map(e=>[e[1],e[2],e[4]]),[[1,1,9],[1,2,6]]);assert.equal(sun.ex.length,2);
 assert.ok(sun.variationNotes[0].includes('effort ceiling'));assert.ok(sun.variationNotes[0].includes('6 days'));
});
test('the last Tuesday technique session and exact competition dates stay intact',()=>{
 const p=sessions(config,5),old=sessions(previous,5),tue=p.find(s=>s.day==='Tue');
 assert.deepEqual(main(tue).map(e=>e.slice(0,5)),main(old.find(s=>s.day==='Tue')).map(e=>e.slice(0,5)));
 assert.equal(p.some(s=>s.day==='Fri'),false);assert.deepEqual(p.filter(s=>s.eventDate).map(s=>s.eventDate),['2026-11-28','2026-11-29']);
});
test('volume work uses effort-aware suggestions and weekly bench volume falls towards the event',()=>{
 const volumes=[];
 for(let w=1;w<=5;w++){const p=sessions(config,w);volumes.push(p.flatMap(main).reduce((n,e)=>n+e[1]*e[2],0));}
 assert.ok(volumes[3]<volumes[0]*.6);assert.ok(volumes[4]<volumes[3]);
 const volume=sessions(config,2).find(s=>s.day==='Tue');assert.equal(top(volume)[3],125);assert.equal(top(volume)[4],7);
});
test('new peak cannot inherit stale percentage uplifts and actual effort still recalculates backoffs',()=>{
 const e=coach.createEngine({data:{customRoadmap:config,decisions:[{approved:true,kind:'adaptive-progression',exercise:'Bench',week:1,factor:1.075}]}});
 const p=e.generatedSessions(config,2),before=JSON.stringify(p);assert.equal(JSON.stringify(e.carryForwardApprovedProgression(p,2)),before);
 const back=sessions(config,1).find(s=>s.day==='Fri').ex.find(e=>e[5]?.role==='backoff');
 assert.ok(e.phaseBackoffLoad(147.5,1,9,back[5].backoffProfile)<=e.phaseBackoffLoad(147.5,1,8,back[5].backoffProfile));
});
test('running, lower-body work, identifiers and normal accessory variety remain unchanged',()=>{
 for(let w=1;w<=5;w++){
  const old=sessions(previous,w),p=sessions(config,w);assert.deepEqual(p.map(s=>[s.id,s.runs]),old.map(s=>[s.id,s.runs]));
  for(const s of old.filter(s=>!main(s).length))assert.deepEqual(p.find(n=>n.id===s.id),s);
  if(w<=3)for(const s of old.filter(s=>main(s).length))assert.deepEqual(p.find(n=>n.id===s.id).ex.filter(e=>!e[5]?.benchRole),s.ex.filter(e=>!e[5]?.benchRole));
 }
});
test('migration preserves both logged sessions and every historical field while changing remaining bench work',()=>{
 const s=fixture(),before=JSON.stringify(s),n=install.refreshApprovedBenchPeak(s,coach,now);
 assert.equal(JSON.stringify(s),before);
 for(const key of Object.keys(s).filter(k=>!['customRoadmap','activeSchedule'].includes(k)))assert.deepEqual(n[key],s[key],key);
 for(const day of ['Tue','Thu'])assert.deepEqual(n.activeSchedule.find(x=>x.day===day),s.activeSchedule.find(x=>x.day===day));
 assert.equal(top(n.activeSchedule.find(s=>s.day==='Fri'))[4],8);assert.equal(n.customRoadmap.benchPeakVersion,2);
 assert.equal(n.benchPeakArchive[0].sessions.find(s=>s.day==='Fri').ex[0][4],7.5);assert.equal(install.refreshApprovedBenchPeak(n,coach,now),n);
});
test('completed Friday, active drafts and partially logged or legacy bench records remain byte-for-byte intact',()=>{
 for(const mode of ['completed','active','partly','legacy']){
  const s=fixture(),fri=s.activeSchedule.find(s=>s.day==='Fri');let live=null;
  if(mode==='completed')s.completedWorkouts.push({id:fri.id+'::strength',week:1,prescription:{ex:fri.ex}});
  if(mode==='active')live={id:fri.id+'::strength',entries:{'0_0':{done:true,weight:140}},notes:'keep'};
  if(mode==='partly')s.sets.push({sessionId:fri.id+'::strength',week:1,exercise:'Bench',weight:140,reps:1,rpe:7.5});
  if(mode==='legacy')s.sets.push({date:'2026-10-30T06:00:00Z',exercise:'Bench',weight:140,reps:1,rpe:7.5});
  const n=install.refreshApprovedBenchPeak(s,coach,now,live);assert.deepEqual(n.activeSchedule.find(x=>x.id===fri.id),fri,mode);assert.deepEqual(n.sets,s.sets);assert.deepEqual(n.completedWorkouts,s.completedWorkouts);
 }
});
test('future bench overrides are archived and replaced; completed and unrelated overrides remain',()=>{
 const s=fixture(),fri=s.activeSchedule.find(s=>s.day==='Fri'),tue=s.activeSchedule.find(s=>s.day==='Tue');
 s.overrides[fri.id]={exercise:'Bench',loadFactor:1.075};s.overrides[tue.id]={exercise:'Bench',loadFactor:.95};
 const n=install.refreshApprovedBenchPeak(s,coach,now);assert.equal(n.overrides[fri.id],undefined);assert.deepEqual(n.overrides[tue.id],s.overrides[tue.id]);assert.deepEqual(n.overrides['completed-day'],s.overrides['completed-day']);assert.deepEqual(n.benchPeakArchive[0].overrides[fri.id],s.overrides[fri.id]);
});
test('peak update is approval-scoped and the full startup migration chain is repeat-safe',()=>{
 const s=fixture();for(const c of [{...previous,programmeId:'another-athlete'},{...previous,strengthTargetDate:'2027-11-28'}]){const other={...s,customRoadmap:c};assert.equal(install.refreshApprovedBenchPeak(other,coach,now),other)}
 assert.equal(install.refreshApprovedBenchPeak(s,coach,'2026-10-29T23:30:00Z'),s);
 const upgrade=x=>install.refreshApprovedBenchPeak(install.refreshApprovedBenchProgramme(x,coach,now),coach,now);
 const n=upgrade(s);assert.deepEqual(upgrade(n),n);
 const week4=install.refreshApprovedBenchPeak(fixture(4),coach,'2026-11-20T12:00:00Z');assert.equal(top(week4.activeSchedule.find(s=>s.day==='Sun'))[4],9);
});
