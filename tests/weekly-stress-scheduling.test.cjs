const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const adapters=require('../src/coach-adapters.js'),constraints=require('../src/coach-constraints.js');
const original=freeze(require('./fixtures/original-three-engine-inputs.json')),fresh=freeze(require('./fixtures/stage-two-new-athletes.json'));
const {dateOf}=require('../scripts/audit-stage-two.cjs');
const legacyPrepare=require('../scripts/compare-runtime-coaching.cjs').legacyEngine().coach.prepareNewProgramme;
const storedPolicyProgramme=(config,options)=>adapters.buildProgramme(legacyPrepare(config,options),options);
// Replay the frozen Stage 1–6 duration policy; Stage 7 latest-policy checks live in flexible-session-time.test.cjs.
function freeze(f){return ({...f,cases:f.cases.map(r=>({...r,config:{...r.config,sessionTimeVersion:0}}))})}

const clone=x=>JSON.parse(JSON.stringify(x)),now=f=>()=>Date.parse(f.clock),lower=s=>(s.ex||[]).filter(e=>e[5]?.category==='primary'&&/squat|deadlift/i.test(e[0])&&e[4]>=8);
test('original strength benchmarks regain weekly recovery without losing complete visits, progression or competition preparation',()=>{
 for(const id of ['O1','O3']){
  const row=original.cases.find(r=>r.id===id),p=storedPolicyProgramme(row.config,{data:row.historicalData,now:now(original)}),old=require('../docs/qa/stage-four/current/'+id+'.json').programme;
  assert.equal(p.config.weeklyStressVersion,1);assert.ok(p.weeks.every(w=>w.feasible&&w.sessions.every(s=>s.timeBudget.feasible!==false)));
  assert.deepEqual(p.weeks[2].sessions.filter(s=>s.ex.length).map(s=>s.day),['Mon','Wed','Fri']);
  const hard=p.weeks.flatMap(w=>w.sessions.filter(s=>lower(s).length).map(s=>({date:dateOf(row.config,w.week,s.day),s}))).sort((a,b)=>a.date.localeCompare(b.date));
  for(let i=1;i<hard.length;i++)assert.ok((Date.parse(hard[i].date)-Date.parse(hard[i-1].date))/86400000>1,'Avoid adjacent demanding lower work when spaced visits fit');
  const lifts=p.weeks.flatMap(w=>w.sessions.flatMap(s=>s.ex));assert.ok(lifts.some(e=>e[5]?.trainingRole==='heavy'&&e[4]>=8.5));assert.ok(lifts.some(e=>e[5]?.trainingRole==='speed'));
  const finalDates=['Squat','Deadlift','Bench'].map(lift=>p.weeks.flatMap(w=>w.sessions.filter(s=>s.ex.some(e=>e[0]===lift&&e[4]>=8.5&&e[5]?.trainingRole==='heavy')).map(s=>dateOf(row.config,w.week,s.day))).sort().at(-1));
  const daysOut=finalDates.map(d=>(Date.parse(row.config.strengthTargetDate)-Date.parse(d))/86400000);
  assert.ok(daysOut[0]>=6&&daysOut[0]<=14&&daysOut[1]>=7&&daysOut[1]<=14&&daysOut[2]>=4&&daysOut[2]<=7,'Retain useful final exposures before the meet');
  assert.ok(Math.abs(daysOut[0]-daysOut[1])>=2,'These flexible benchmark calendars allow separated final lower-heavy sessions');
  const runs=p=>p.weeks.map(w=>w.sessions.flatMap(s=>s.runs).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))));assert.deepEqual(runs(p),runs(old));
 }
});
test('cyclic recovery and running intensity influence placement rather than imposing forbidden weekdays',()=>{
 const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],slots=()=>days.map(day=>({day,items:[]})),lift=name=>({type:'strength',name}),run=schedulingDemand=>({type:'run',name:'Run',schedulingDemand});
 const adjacent=slots(),spaced=slots();adjacent[6].items=[lift('Deadlift')];adjacent[0].items=[lift('Squat')];spaced[6].items=[lift('Deadlift')];spaced[2].items=[lift('Squat')];
 assert.ok(constraints.weeklyStress({},spaced)<constraints.weeklyStress({},adjacent),'Sunday/Monday must not be treated as a seven-day recovery gap');
 const easy=slots(),hard=slots();easy[0].items=[lift('Squat')];easy[1].items=[run(.12)];hard[0].items=[lift('Squat')];hard[1].items=[run(.9)];assert.ok(constraints.weeklyStress({},hard)>constraints.weeklyStress({},easy));
 const bounded={weeklyStressVersion:1,runGoal:'fitness',priority:'Squat',availableDays:['Mon','Tue'],days:2,visitConstraints:{strengthVisits:2,minutes:{Mon:90,Tue:90}}};
 const forced=constraints.allocate(bounded,[],[lift('Squat'),lift('Deadlift')]);assert.equal(forced.feasible,true);assert.equal(forced.scheduled,2,'Consecutive work remains possible when required by actual availability');
});
test('weekly spread follows shifted availability and respects explicit athlete splits',()=>{
 const items=['Squat','Squat','Bench','Bench','Bench','Deadlift'].map(name=>({type:'strength',name,detail:'Exposure'})).concat([{type:'run',name:'Run',detail:'Easy aerobic'},{type:'run',name:'Run',detail:'Longer easy aerobic'}]),days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
 for(let shift=0;shift<7;shift++){
  const allowed=[0,1,2,4,5].map(n=>days[(n+shift)%7]),c={weeklyStressVersion:1,visitAllocationVersion:1,runGoal:'fitness',priority:'Squat',availableDays:allowed,days:5,longRunDay:days[(5+shift)%7],visitConstraints:{strengthVisits:3,minutes:Object.fromEntries(allowed.map(d=>[d,90]))}};
  const p=constraints.allocate(c,[],items);assert.ok(p.feasible);assert.equal(p.scheduled,items.length);
  const indices=p.slots.flatMap((s,i)=>s.items.some(x=>x.type==='strength'&&/Squat|Deadlift/.test(x.name))?[i]:[]);assert.equal(indices.length,3);
  for(let i=0;i<indices.length;i++)for(let j=i+1;j<indices.length;j++){const gap=Math.abs(indices[i]-indices[j]);assert.ok(Math.min(gap,7-gap)>=2,'Find the available spread under every weekday rotation');}
 }
 const fixed={weeklyStressVersion:1,visitAllocationVersion:1,runGoal:'fitness',priority:'Squat',availableDays:['Mon','Tue'],days:2,visitConstraints:{strengthVisits:2,minutes:{Mon:90,Tue:90}},manualSplit:{Mon:['lower'],Tue:['bench']},squat:1,deadlift:1,bench:1};
 const list=['Squat','Deadlift','Bench'].map(name=>({type:'strength',name}));assert.deepEqual(constraints.allocate(fixed,[],list),constraints.allocate({...fixed,weeklyStressVersion:undefined},[],list));
});
test('small scheduling-score gains do not churn Idris, and all Stage 3 safety conditions stay intact',()=>{
 for(const row of fresh.cases){
  const p=storedPolicyProgramme(row.config,{data:row.historicalData,now:now(fresh)}),old=require('../docs/qa/stage-three/'+row.id+'.json').programme;
  const doses=p=>p.weeks.map(w=>w.sessions.map(s=>[s.day,s.ex,s.runs]));assert.deepEqual(doses(p),doses(old),row.id+' retains every actual prescription and day');
  assert.deepEqual(p.weeks.map(w=>w.feasible),old.weeks.map(w=>w.feasible));
 }
});
test('saved Stage 4, Stage 3 and Taylor programmes reproduce exactly and generation leaves retained logs untouched',()=>{
 const rows=original.cases.map(c=>require('../docs/qa/stage-four/current/'+c.id+'.json')).concat(fresh.cases.map(c=>require('../docs/qa/stage-three/'+c.id+'.json')),[require('../docs/qa/stage-five/baseline/Taylor.json')]);
 for(const row of rows){
  const config=clone(row.programme.config),data={...clone(row.historicalData),customRoadmap:clone(config),activeSchedule:clone(row.programme.weeks[0].sessions),notes:'Keep',sets:[{exercise:'Bench',weight:50,reps:3,rpe:7,date:'2026-10-29',notes:'Actual'}],runs:[{km:3,min:22,date:'2026-10-28',sourceActivityId:'keep'}],decisions:[{approved:true,id:'keep'}],overrides:{keep:{weight:50}},completedWorkouts:[{id:'keep',week:1}],activeWorkout:{notes:'Unfinished'}};
  const untouched=JSON.stringify({config,data});assert.equal(JSON.stringify(adapters.buildProgramme(config,{data:row.historicalData,now:()=>Date.parse(row.provenance.clock)})),JSON.stringify(row.programme));
  adapters.buildProgramme(config,{data,now:()=>Date.parse(row.provenance.clock)});adapters.buildNewProgramme(config,{data,now:()=>Date.parse(row.provenance.clock)});assert.equal(JSON.stringify({config,data}),untouched);
 }
});
test('browser-global generation uses the same new weekly recovery policy as Node',()=>{
 const sandbox=vm.createContext({Date,console});for(const name of ['gym-equipment','exercise-registry','coaching-evidence','running-workouts','running-preparation','coach-constraints','coach-engine','coach-adapters'])vm.runInContext(fs.readFileSync('src/'+name+'.js','utf8'),sandbox);
 for(const row of original.cases){const opts={data:row.historicalData,now:now(original)};assert.equal(JSON.stringify(sandbox.LHRFCoachAdapters.buildNewProgramme(row.config,opts)),JSON.stringify(adapters.buildNewProgramme(row.config,opts)));}
});
