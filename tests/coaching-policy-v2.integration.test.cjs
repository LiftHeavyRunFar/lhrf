const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {buildNewProgramme}=require('../src/coach-adapters.js');
const {prepareNewProgramme}=require('../src/coach-engine.js');
const clock={now:()=>Date.parse('2026-10-30T12:00:00Z')};
const fresh=require('./fixtures/five-scenario-round-two-inputs.json');
const original=require('./fixtures/original-three-engine-inputs.json');
test('fresh beginner quality and two-set lifting doses fit all actual whole-visit windows',()=>{
 const config=fresh.cases.find(c=>c.id==='H').config,p=buildNewProgramme(config,clock);
 for(const w of p.weeks)for(const s of w.sessions.filter(s=>!s.eventDate))assert.equal(s.timeBudget.feasible,true,'week '+w.week+' '+s.day);
 for(const n of [6,7,9,11]){
  const s=p.weeks[n-1].sessions.find(s=>s.day==='Tue');assert.ok(s.runs.some(r=>r.role==='quality-run'));assert.ok(s.ex.filter(e=>e[5]?.category==='primary').every(e=>e[1]>=2));assert.ok(s.timeBudget.totalMinutes<=60);
 }
});
test('recent marathon recovery applies to supporting strength as well as running',()=>{
 const p=buildNewProgramme(original.cases.find(c=>c.id==='O2').config,clock);
 const first=p.weeks[0].sessions.flatMap(s=>s.ex);assert.ok(first.length);assert.ok(first.every(e=>e[4]<=5.5&&e[5]?.recentMarathonRecovery));
 assert.ok(p.weeks[0].sessions.flatMap(s=>s.runs).every(r=>r.role==='easy-run'));
 assert.equal(p.weeks[0].runningPhase,'Recovery');
});
test('running taper phase remains separately visible from strength development',()=>{
 const p=buildNewProgramme(fresh.cases.find(c=>c.id==='I').config,clock);
 assert.equal(p.weeks.at(-2).runningPhase,'Taper / event');
 assert.ok(p.weeks.at(-2).sessions.flatMap(s=>s.runs).every(r=>r.preparationPhase==='Taper / event'));
});
test('ordered goals validate dates and frequencies before entering shared generation',()=>{
 const c=fresh.cases.find(c=>c.id==='G').config;
 for(const orderedGoals of [[{sport:'running',date:'2027-02-30'}],[{sport:'strength',date:'2027-01-09',runs:2.2}],[{sport:'strength',date:'2027-01-09',recoveryDays:-1}]])assert.throws(()=>prepareNewProgramme({...c,orderedGoals}),RangeError);
});
test('new offline dependencies load in browser order and are cached without migrating approved policy',()=>{
 for(const name of ['index.html','coaching-preview.html']){const s=fs.readFileSync(name,'utf8');assert.ok(s.indexOf('./src/running-preparation.js')<s.indexOf('./src/coach-constraints.js'));assert.ok(s.indexOf('./src/coach-constraints.js')<s.indexOf('./src/coach-engine.js'));}
 const sw=fs.readFileSync('sw.js','utf8');for(const name of ['running-preparation','coach-constraints'])assert.ok(sw.includes('./src/'+name+'.js'));
 assert.equal(prepareNewProgramme({}).coachingRulesVersion,1);assert.equal(prepareNewProgramme({coachingRulesVersion:2}).coachingRulesVersion,2);
});
test('browser-global modules generate the exact same v2 prescriptions as Node canonical entry',()=>{
 const vm=require('node:vm'),sandbox=vm.createContext({Date,console});
 for(const file of ['running-workouts','running-preparation','coach-constraints','coach-engine','coach-adapters'])vm.runInContext(fs.readFileSync('src/'+file+'.js','utf8'),sandbox,{filename:file+'.js'});
 const config=fresh.cases.find(c=>c.id==='H').config;
 const browser=sandbox.LHRFCoachAdapters.buildNewProgramme(config,clock),native=buildNewProgramme(config,clock);
 assert.equal(JSON.stringify(browser),JSON.stringify(native));
});
test('version-two progression excludes approved load changes from an older programme',()=>{
 const coach=require('../src/coach-engine.js'),config=coach.approveProgrammeConfig(fresh.cases.find(c=>c.id==='J').config,'2026-10-30T12:00:00Z');
 const data={customRoadmap:config,decisions:[{approved:true,kind:'adaptive-progression',exercise:'Bench',week:1,factor:1.075,date:'2026-10-01T12:00:00Z'}]};
 const engine=coach.createEngine({data,now:clock.now}),before=engine.generatedSessions(config,2),snapshot=JSON.stringify(before);
 assert.equal(JSON.stringify(engine.carryForwardApprovedProgression(before,2)),snapshot);
 data.decisions.push({approved:true,kind:'adaptive-progression',exercise:'Bench',week:1,factor:1.025,date:'2026-10-31T12:00:00Z'});
 assert.notEqual(JSON.stringify(engine.carryForwardApprovedProgression(engine.generatedSessions(config,2),2)),snapshot);
});
test('unknown pace does not demand a race PB for general-health running',()=>{
 const p=buildNewProgramme(original.cases.find(c=>c.id==='O3').config,clock);
 assert.ok(p.weeks[0].sessions.flatMap(s=>s.runs).every(r=>r.distanceKnown===false&&r.minutes===20));
 assert.ok(p.weeks[0].warnings.some(x=>/race PB is optional/.test(x)));
 assert.ok(!p.weeks[0].warnings.some(x=>/^Enter a valid running PB/.test(x)));
});
