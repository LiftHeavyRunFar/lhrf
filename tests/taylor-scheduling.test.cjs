// Replay the frozen Stage 1–6 duration policy; Stage 7 latest-policy checks live in flexible-session-time.test.cjs.
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const coach=require('../src/coach-engine.js'),adapters=require('../src/coach-adapters.js');
const {allocate}=require('../src/coach-constraints.js');
const fixture=require('./fixtures/five-scenario-round-three-inputs.json');
const saved=require('./fixtures/pre-taylor-saved-programmes.json');
const clone=x=>JSON.parse(JSON.stringify(x)),now=()=>Date.parse(fixture.clock);
const taylor=()=>{const p=clone(fixture.cases.find(p=>p.id==='O'));p.config.sessionTimeVersion=0;return p};
const mains=s=>(s.ex||[]).filter(e=>e[5]?.category==='primary');

test('Taylor uses the longer visits, separates lower lifts and retains the full health-running dose',()=>{
 const {config,historicalData}=taylor(),before=JSON.stringify({config,historicalData});
 const programme=adapters.buildNewProgramme(config,{data:historicalData,now});
 const previous=adapters.buildProgramme(saved.rows.find(r=>r.fixture==='five-scenario-round-three-inputs'&&r.id==='O').config,{data:historicalData,now});
 assert.deepEqual(adapters.buildNewProgramme(config,{data:historicalData,now}),programme);
 assert.equal(JSON.stringify({config,historicalData}),before);
 assert.equal(programme.config.visitAllocationVersion,1);
 for(const w of programme.weeks){
  assert.equal(w.feasible,true,'week '+w.week);
  for(const s of w.sessions.filter(s=>!s.eventDate)){
   assert.equal(s.timeBudget.feasible,true);
   assert.ok(s.timeBudget.visits.every(v=>v.totalMinutes<=v.capMinutes));
   assert.ok(s.timeBudget.includesWarmups&&s.timeBudget.includesRest&&s.timeBudget.includesTransitions);
   assert.equal(s.timeBudget.adjustments,undefined,'No time-driven volume cuts are needed');
  }
  assert.deepEqual(w.sessions.flatMap(s=>s.runs||[]),previous.weeks[w.week-1].sessions.flatMap(s=>s.runs||[]),'Only run days change, not dose or pace');
  if(w.week<=14){
   const lifting=w.sessions.filter(s=>s.ex?.length);
   assert.deepEqual(lifting.map(s=>s.day),['Tue','Sat']);
   assert.ok(mains(lifting[0]).some(e=>e[0]==='Squat'));
   assert.ok(!mains(lifting[0]).some(e=>e[0]==='Deadlift'));
   assert.ok(mains(lifting[1]).some(e=>e[0]==='Deadlift'));
   assert.ok(!mains(lifting[1]).some(e=>e[0]==='Squat'));
   for(const s of lifting)assert.ok(mains(s).some(e=>e[5]?.lift==='Bench'||/bench|Spoto/i.test(e[0])));
   assert.deepEqual(w.sessions.filter(s=>s.runs?.length).map(s=>s.day),['Thu','Sun']);
   assert.ok(w.sessions.flatMap(s=>s.runs||[]).every(r=>r.role==='easy-run'));
  }
 }
 assert.equal(programme.weeks[0].sessions.find(s=>s.day==='Tue').ex[0][0],'Squat','Priority lift stays first');
 assert.deepEqual(programme.weeks[0].sessions.filter(s=>s.ex?.length).map(s=>s.timeBudget.strengthMinutes),[63.5,63.5]);
 // A new calendar must still expose its real taper tradeoffs and retain meet recovery.
 assert.ok(programme.weeks[14].warnings.some(x=>/Squat: final heavy practice falls 11 days/.test(x)));
 const event=programme.weeks.at(-1).sessions.find(s=>s.eventDate);
 assert.equal(event.eventDate,'2027-02-20');assert.equal(event.eventPermission.confirmed,true);
 assert.ok(!programme.weeks.at(-1).sessions.some(s=>s.day.slice(0,3)==='Sun'&&s.runs?.length));
});

test('new health-running allocation responds to visit windows rather than named weekdays',()=>{
 const {config}=taylor();config.visitConstraints.minutes.Tue=60;config.visitConstraints.minutes.Thu=120;
 const p=adapters.buildNewProgramme(config,{now});
 assert.deepEqual(p.weeks[0].sessions.filter(s=>s.ex?.length).map(s=>s.day),['Thu','Sat']);
 assert.deepEqual(p.weeks[0].sessions.filter(s=>s.runs?.length).map(s=>s.day),['Tue','Sun']);
 assert.ok(p.weeks.every(w=>w.feasible));
});

test('all 18 existing saved programmes retain exact PR #107 output across 275 weeks',()=>{
 assert.equal(saved.rows.length,18);assert.equal(saved.rows.reduce((n,r)=>n+r.weeks,0),275);
 for(const row of saved.rows){
  const f=require('./fixtures/'+row.fixture+'.json'),p=f.cases.find(p=>p.id===row.id);
  const config=clone(row.config),data=clone(p.historicalData),before=JSON.stringify({config,data});
  assert.equal(config.visitAllocationVersion,undefined);
  const output=adapters.buildProgramme(config,{data,now:()=>Date.parse(f.clock)});
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(output)).digest('hex'),row.sha256,row.fixture+' '+row.id);
  assert.equal(JSON.stringify({config,data}),before);
 }
});

test('new allocation preserves explicit fixed splits and race long-run protection',()=>{
 const {config}=taylor(),items=['Squat','Deadlift','Bench','Bench'].map(name=>({type:'strength',name,detail:'Exposure'})).concat([{type:'run',name:'Run',detail:'Easy aerobic'},{type:'run',name:'Run',detail:'Longer easy aerobic'}]);
 for(const fixed of [{manualSplit:{Tue:['run'],Thu:['lower','bench'],Sat:['bench'],Sun:['long']}},{fixedSessions:[{day:'Tue',kind:'run'},{day:'Thu',kind:'strength',lift:'squat'},{day:'Thu',kind:'strength',lift:'deadlift'},{day:'Thu',kind:'strength',lift:'bench'},{day:'Sat',kind:'strength',lift:'bench'},{day:'Sun',kind:'run',runType:'long'}]}]){
  const c={...config,...fixed};
  assert.deepEqual(allocate({...c,visitAllocationVersion:1},[],items),allocate(c,[],items));
 }
 const race={...config,runGoal:'half',visitAllocationVersion:1},plan=allocate(race,[],items);
 assert.equal(plan.feasible,true);
 assert.ok(!plan.slots.find(s=>s.day==='Sat').items.some(x=>x.name==='Squat'||x.name==='Deadlift'));
 assert.deepEqual(plan,allocate({...race,visitAllocationVersion:undefined},[],items));
});
