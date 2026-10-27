// Acceptance checks for purposeful running variety. Synthetic software contracts,
// not proof of race readiness, injury prevention or physiological effectiveness.
const test=require('node:test'),assert=require('node:assert/strict');
const {normalizeProfile,createProfileEngine}=require('../src/coach-adapters.js');
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const paceValues=label=>[...String(label||'').matchAll(/(\d+):([0-5]\d)/g)].map(m=>Number(m[1])*60+Number(m[2]));
const workSteps=run=>(run.steps||[]).filter(step=>step.role==='work');
function profile({km=30,runs=3,goal='10k',...changes}={}){
 const c=normalizeProfile({coachingPolicy:'review-v2',runningGuidanceVersion:4,runningPaceVersion:2,runningWorkoutVersion:1,startDate:'2026-10-26',weeks:12,event:'running',priority:'Running',hybridFocus:'running',runGoal:goal,runs,bench:0,squat:0,deadlift:0,days:7,tenKTime:'59:00',availableDays:DAYS,...changes});
 c.runProfile.weeklyKm=km;return c;
}
function inspect(c,w){const engine=createProfileEngine(c).engine,sessions=engine.generatedSessions(c,w),runs=sessions.flatMap(s=>s.runs||[]),training=runs.filter(r=>!['race','event-run'].includes(r.role));return {engine,sessions,runs,training,budget:engine.runningAssessment(c,w)};}

test('new running workout policy conserves actual budgets and measures work by role across athlete matrix',()=>{
 const failures=[];let qualityCases=0;
 for(const km of [6,12,20,30,60])for(const count of [1,2,3,5])for(const goal of ['fitness','5k','10k','half','marathon']){
  const c=profile({km,runs:count,goal}),before=JSON.stringify(c);
  for(let w=1;w<=12;w++){
   const r=inspect(c,w);if(r.budget.feasible===false)continue;
   const actual=r.training.reduce((n,x)=>n+x.distanceKm,0),hard=r.training.flatMap(workSteps).reduce((n,x)=>n+x.distanceKm,0),quality=r.training.filter(x=>x.role==='quality-run');
   if(actual>r.budget.requestedKm+.151)failures.push(`${goal}/${km}/${count}/W${w}: allocation exceeds weekly budget`);
   if(hard>actual*.2+.001)failures.push(`${goal}/${km}/${count}/W${w}: work exceeds actual-week policy`);
   if(quality.length>1)failures.push(`${goal}/${km}/${count}/W${w}: multiple quality runs`);
   for(const run of r.training){
    const sum=(run.steps||[]).reduce((n,s)=>n+s.distanceKm,0);assert.ok(Math.abs(sum-run.distanceKm)<.001,'Lap distances must reconcile with run total');
    for(const s of run.steps||[]){assert.ok(Number.isFinite(s.distanceKm)&&s.distanceKm>0);assert.doesNotMatch(String(s.pace),/NaN|Infinity|undefined/);}
   }
   for(const run of quality){qualityCases++;assert.ok(workSteps(run).length>=2,'Every quality prescription must classify its work, independent of labels');for(const s of workSteps(run)){const p=paceValues(s.pace);assert.ok(p.length>0&&p.every(x=>x>0),'Every work lap needs valid pace guidance');}}
   if(w%4===0)assert.equal(quality.length,0,'Consolidation remains easy-only');
  }
  assert.equal(JSON.stringify(c),before,'Generating varied sessions cannot mutate the athlete profile');
 }
 assert.ok(qualityCases>50,'Positive controls prevent passing by removing all quality');assert.deepEqual(failures,[]);
});

test('new running workout policy keeps exact race calendars and easy-only event weeks across goals',()=>{
 for(const [goal,km,distance] of [['5k',30,5],['10k',30,10],['half',40,21.0975],['marathon',50,42.195]]){
  const c=profile({goal,km,runs:4,runningTargetDate:'2027-01-17'}),r=inspect(c,12);
  assert.equal(r.training.filter(x=>x.role==='quality-run').length,0,goal);
  assert.equal(r.training.flatMap(workSteps).length,0,goal);
  const race=r.sessions.find(s=>s.eventType==='running');assert.equal(race.eventDate,'2027-01-17');assert.ok(Math.abs(race.runs[0].distanceKm-distance)<.001);
 }
});

test('new policy cannot turn an unsupported goal time into faster-than-baseline quality running',()=>{
 const c=profile({runningGoalSeconds:2400}),without={...c};delete without.runningGoalSeconds;
 for(let w=1;w<=12;w++){
  const a=inspect(c,w),b=inspect(without,w),pa=a.training.flatMap(workSteps).flatMap(s=>paceValues(s.pace)),pb=b.training.flatMap(workSteps).flatMap(s=>paceValues(s.pace));
  // An implausible 40-minute goal must never make a 59-minute athlete run 4:00/km.
  assert.ok(pa.every(x=>x>=300),'Goal ambition cannot manufacture current fitness');
  assert.deepEqual(pa,pb,'Unsupported target pace should fall back to baseline-based work');
 }
});

test('saved programmes remain byte-for-byte unchanged when library flag is absent',()=>{
 const old={...require('../programmes/november-2026.json')};delete old.runningWorkoutVersion;
 const engine=createProfileEngine(old).engine;
 const before=Array.from({length:5},(_,i)=>JSON.stringify(engine.generatedSessions(old,i+1)));
 // Creating a new athlete/library session must not alter module-global state.
 const fresh=profile();for(let w=1;w<=12;w++)inspect(fresh,w);
 const after=Array.from({length:5},(_,i)=>JSON.stringify(engine.generatedSessions(old,i+1)));
 assert.deepEqual(after,before);assert.equal(old.runningWorkoutVersion,undefined);
});

const library=()=>require('../src/running-workouts.js');
function baseRun(){const steps=[{label:'Warm-up',distanceKm:1.5,pace:'7:00/km to 8:00/km'},{label:'Threshold interval 1 of 3',distanceKm:.8,pace:'6:20/km to 6:30/km'},{label:'Easy recovery',distanceKm:.25,pace:'7:00/km to 8:00/km'},{label:'Threshold interval 2 of 3',distanceKm:.8,pace:'6:20/km to 6:30/km'},{label:'Easy recovery',distanceKm:.25,pace:'7:00/km to 8:00/km'},{label:'Threshold interval 3 of 3',distanceKm:.8,pace:'6:20/km to 6:30/km'},{label:'Cool-down',distanceKm:1,pace:'7:00/km to 8:00/km'}];return {role:'quality-run',name:'Controlled threshold intervals',distanceKm:5.4,steps};}
const prescription=(kind,extra={})=>library().buildQuality({baseRun:baseRun(),kind,thresholdSeconds:360,raceSeconds:354,shortSeconds:340,...extra});

test('catalogue describes six distinct selectable workout purposes',()=>{
 const ids=library().catalogue.map(x=>x.id);assert.equal(new Set(ids).size,ids.length);for(const id of ['threshold-repeats','race-pace-repeats','pyramid','inverted-pyramid','ascending-ladder','descending-ladder'])assert.ok(ids.includes(id),id);
 for(const item of library().catalogue)assert.ok(typeof item.purpose==='string'&&item.purpose.length>10,'A session needs a coaching purpose, not a decorative name');
});

test('all six library families redistribute work and recovery without expanding the base prescription',()=>{
 for(const {id} of library().catalogue){
  const input=baseRun(),before=JSON.stringify(input),run=library().buildQuality({baseRun:input,kind:id,thresholdSeconds:360,raceSeconds:354,shortSeconds:340});
  assert.equal(JSON.stringify(input),before,'Library cannot rewrite approved source session');assert.notEqual(run,input);
  const sum=run.steps.reduce((n,s)=>n+s.distanceKm,0),work=workSteps(run).reduce((n,s)=>n+s.distanceKm,0),recover=run.steps.filter(s=>s.role==='recovery').reduce((n,s)=>n+s.distanceKm,0);
  assert.ok(Math.abs(sum-5.4)<.001,`${id}: total distance`);assert.ok(Math.abs(run.distanceKm-sum)<.001);
  assert.ok(Math.abs(work-2.4)<.001,`${id}: work distance conserved`);assert.ok(Math.abs(recover-.5)<.001,`${id}: recovery distance conserved`);
  assert.equal(run.steps[0].distanceKm,1.5);assert.equal(run.steps.at(-1).distanceKm,1);
  assert.equal(run.steps[0].pace,input.steps[0].pace);assert.equal(run.steps.at(-1).pace,input.steps.at(-1).pace);
  for(const step of run.steps){assert.ok(Number.isFinite(step.distanceKm)&&step.distanceKm>0);assert.ok(paceValues(step.pace).length>0);}
 }
});

test('pyramids have the requested shape and shortest reps are faster than the longest',()=>{
 const up=workSteps(prescription('pyramid')),down=workSteps(prescription('inverted-pyramid'));
 assert.equal(up.length,5);assert.equal(down.length,5);
 const [a,b,c,d,e]=up.map(s=>s.distanceKm);assert.ok(a<b&&b<c&&c>d&&d>e);assert.ok(Math.abs(a-e)<.001&&Math.abs(b-d)<.001);
 const [v,w,x,y,z]=down.map(s=>s.distanceKm);assert.ok(v>w&&w>x&&x<y&&y<z);assert.ok(Math.abs(v-z)<.001&&Math.abs(w-y)<.001);
 for(const reps of [up,down]){const shortest=reps.reduce((a,b)=>a.distanceKm<b.distanceKm?a:b),longest=reps.reduce((a,b)=>a.distanceKm>b.distanceKm?a:b);assert.ok(Math.max(...paceValues(shortest.pace))<Math.min(...paceValues(longest.pace)),'Short reps need a distinctly faster range');}
 const asc=workSteps(prescription('ascending-ladder')).map(s=>s.distanceKm),desc=workSteps(prescription('descending-ladder')).map(s=>s.distanceKm);
 assert.equal(asc.length,4);assert.equal(desc.length,4);assert.ok(asc.every((x,i)=>!i||x>asc[i-1]));assert.ok(desc.every((x,i)=>!i||x<desc[i-1]));
});

test('a fantastical race goal cannot override supported race pace in the library',()=>{
 const normal=prescription('race-pace-repeats'),ambitious=prescription('race-pace-repeats',{goalPaceSeconds:240}),achievable=prescription('race-pace-repeats',{goalPaceSeconds:360});
 assert.deepEqual(workSteps(ambitious).map(s=>s.pace),workSteps(normal).map(s=>s.pace));
 assert.ok(workSteps(achievable).every(s=>paceValues(s.pace).includes(355)&&paceValues(s.pace).includes(365)),'A supported slower goal may guide race-specific practice');
});

test('library rejects unsupported families and malformed pace inputs',()=>{
 assert.throws(()=>prescription('sprint-until-exhausted'));
 for(const value of [0,-1,NaN,Infinity,'fast'])assert.throws(()=>prescription('pyramid',{raceSeconds:value}),String(value));
});

test('library rejects bad individual lap distances even if their sum would look valid',()=>{
 for(const index of [0,1,2,6])for(const bad of [-.1,0,NaN,Infinity,undefined,'0.5']){
  const base=baseRun();base.steps[index].distanceKm=bad;
  assert.throws(()=>library().buildQuality({baseRun:base,kind:'pyramid',thresholdSeconds:360,raceSeconds:354,shortSeconds:340}),`lap ${index}, ${String(bad)}`);
 }
});

test('mixed-pace duration estimates reconcile with actual lap targets',()=>{
 for(const kind of ['pyramid','inverted-pyramid','ascending-ladder','descending-ladder','race-pace-repeats']){
  const run=prescription(kind),min=run.steps.reduce((n,s)=>n+s.distanceKm*Math.min(...paceValues(s.pace))/60,0),max=run.steps.reduce((n,s)=>n+s.distanceKm*Math.max(...paceValues(s.pace))/60,0);
  assert.equal(run.durationRangeMinutes.min,Math.round(min));assert.equal(run.durationRangeMinutes.max,Math.round(max));assert.equal(run.minutes,Math.round(max));
  const expectedWork=workSteps(run).reduce((n,s)=>n+s.distanceKm*s.paceSeconds/60,0);assert.equal(run.workMinutes,Math.round(expectedWork));
 }
});

test('unmeasured easy pace cannot retain a stale inherited duration estimate',()=>{
 const base=baseRun();base.minutes=999;base.durationRangeMinutes={min:998,max:999};base.steps[0].pace='Easy conversational';
 const run=library().buildQuality({baseRun:base,kind:'pyramid',thresholdSeconds:360,raceSeconds:354,shortSeconds:340});
 assert.ok(run.minutes==null,'Unknown lap pace means total time is unavailable, not 999 inherited minutes');assert.ok(run.durationRangeMinutes==null);
});

test('usable 10K development includes multiple purposeful families while long-distance preparation avoids speed pyramids',()=>{
 const c=profile({km:30,runs:3}),families=new Set();
 for(let w=1;w<=12;w++)for(const r of inspect(c,w).training.filter(r=>r.role==='quality-run'))families.add(r.workoutFamily);
 for(const family of library().catalogue.map(x=>x.id))assert.ok(families.has(family),'Usable development should expose '+family);
 for(const goal of ['half','marathon'])for(let w=1;w<=12;w++)for(const run of inspect(profile({goal,km:40,runs:4}),w).training.filter(x=>x.role==='quality-run'))assert.ok(['threshold-repeats','race-pace-repeats'].includes(run.workoutFamily),'Variety cannot silently change the distance-specific objective');
});

test('recent outdoor 28:20 5K supports sub-hour 10K practice without treating a training run as a PB',()=>{
 const c=profile({km:30,runs:3,runningGoalSeconds:3600});c.runProfile={distance:5,seconds:1700,time:'28:20',recency:'recent',weeklyKm:30,resultDate:'2026-10-10',effort:'performance',environment:'outdoor'};
 const engine=createProfileEngine(c,{now:()=>Date.parse('2026-10-27T12:00:00Z')}).engine,p=engine.runningPaces(c);
 assert.ok(p.tenK>3540&&p.tenK<3550,'Equivalent is approximately59:04, not65min');
 const run=engine.generatedSessions(c,3).flatMap(s=>s.runs||[]).find(r=>r.role==='quality-run');assert.equal(run.workoutFamily,'race-pace-repeats');assert.ok(workSteps(run).every(s=>s.paceSeconds===360));assert.equal(run.paceBasis.goalSupported,true);
 const ordinary={...c,runProfile:{...c.runProfile,distance:10,seconds:3900,time:'1:05:00',effort:'training'}};
 assert.equal(engine.runningPaces(ordinary),null);
 const easy=engine.generatedSessions(ordinary,1).flatMap(s=>s.runs||[]);assert.ok(easy.length>0);assert.ok(easy.every(r=>r.role!=='quality-run'));assert.ok(easy.flatMap(r=>r.steps).every(s=>paceValues(s.pace).length===0),'Training pace cannot masquerade as current race ability');
});

test('baseline date validity, staleness and environment remain explicit',()=>{
 const now=()=>Date.parse('2026-10-27T12:00:00Z');
 for(const date of ['2026-02-30','2026-10-28','not-a-date']){
  const c=profile();c.runProfile={...c.runProfile,resultDate:date,effort:'performance',environment:'outdoor'};
  const engine=createProfileEngine(c,{now}).engine,b=engine.runningAssessment(c,1);
  assert.equal(b.feasible,false,date);assert.match(b.blocking.join(' '),/date|future/i);assert.equal(b.runs.filter(r=>r.role==='quality-run').length,0);
 }
 const stale=profile();stale.runProfile={...stale.runProfile,resultDate:'2026-08-01',effort:'performance',environment:'outdoor'};
 const b=createProfileEngine(stale,{now}).engine.runningAssessment(stale,1);assert.equal(b.runs.filter(r=>r.role==='quality-run').length,0);assert.match(b.warnings.join(' '),/eight weeks|old|fitness/i);
 const treadmill=profile();treadmill.runProfile={...treadmill.runProfile,resultDate:'2026-10-10',effort:'performance',environment:'treadmill'};
 assert.match(createProfileEngine(treadmill,{now}).engine.runningAssessment(treadmill,1).warnings.join(' '),/treadmill|calibration/i);
});
