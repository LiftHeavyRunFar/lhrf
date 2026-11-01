// Replay the frozen Stage 1–6 duration policy; Stage 7 latest-policy checks live in flexible-session-time.test.cjs.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const coach=require('../src/coach-engine.js'),adapters=require('../src/coach-adapters.js'),intake=require('../src/coach-intake.js');
const {fitSessions}=require('../src/coach-constraints.js'),{dateOf,inspect}=require('../scripts/audit-stage-two.cjs');
const fixture=require('./fixtures/stage-two-new-athletes.json'),copy=x=>JSON.parse(JSON.stringify(x)),now=()=>Date.parse(fixture.clock);
const profile=id=>{const p=copy(fixture.cases.find(p=>p.id===id));p.config.sessionTimeVersion=0;return p},previous=id=>require('../docs/qa/stage-two/programmes/'+id+'.json');
const generate=(id,patch={})=>{const p=profile(id);return adapters.buildNewProgramme({...p.config,...patch},{data:p.historicalData,now})};
const doses=p=>p.weeks.map(w=>w.sessions.map(s=>[s.day,s.ex,s.runs]));
const main=(w,lift)=>w.sessions.flatMap(s=>s.ex||[]).filter(e=>e[5]?.category==='primary'&&(!lift||e[0]===lift));
const event=(permission,minutes=90,patch={})=>fitSessions({coachingSafeguardsVersion:1,availableDays:['Sun'],visitConstraints:{minutes:{Sun:120},eventDays:{'2026-11-08':permission}}},[{day:'Sunday',eventDate:'2026-11-08',eventType:'running',ex:[],runs:[{minutes,durationRangeMinutes:minutes===null?null:{min:minutes-2,max:minutes}}],...patch}]);

test('hard event windows include logistics; explicit permission and faster aspirations cannot override them',()=>{
 const r=event({confirmed:true,minutes:100,logisticsMinutes:20,preferredFinishMinutes:75});
 assert.equal(r.feasible,false);assert.equal(r.sessions[0].eventPermission.attendanceConfirmed,true);assert.equal(r.sessions[0].eventPermission.confirmed,false);
 assert.equal(r.sessions[0].constraintIssues[0].kind,'event-time');assert.match(r.warnings.join(' '),/choose a suitable event\/date/);
 assert.equal(r.sessions[0].runs[0].minutes,90);
 assert.equal(event({confirmed:true,minutes:110,logisticsMinutes:20}).feasible,true,'Exact full-window boundary fits');
});
test('race cutoffs are hard duration constraints, whereas preferred finishes remain soft targets',()=>{
 assert.equal(event({confirmed:true,hardLimitMinutes:89}).feasible,false);
 assert.equal(event({confirmed:true,hardLimitMinutes:90,minutes:110,logisticsMinutes:20}).feasible,true);
 const soft=event({confirmed:true,preferredFinishMinutes:75});assert.equal(soft.feasible,true);assert.match(soft.warnings[0],/aspiration/);
 assert.equal(soft.sessions[0].timeBudget.totalMinutes,90);
});
test('unknown duration cannot satisfy a finite cap, and unlimited strength events do not get invented durations',()=>{
 assert.equal(event({confirmed:true,minutes:100},null).feasible,false);
 const meet={eventType:'strength',runs:[]};
 const open=event({confirmed:true},null,meet);assert.equal(open.feasible,true);assert.equal(open.sessions[0].timeBudget.totalMinutes,null);
 assert.equal(event({confirmed:true,minutes:100},null,meet).feasible,false);
 assert.equal(event({confirmed:true,minutes:100,estimatedMinutes:90,logisticsMinutes:10},null,meet).feasible,true);
 assert.equal(event({confirmed:false,preferredFinishMinutes:100}).feasible,false);
});
test('canonical intake preserves distinct hard limits and preferences, and rejects invalid event constraints',()=>{
 const p=profile('P'),v=copy(p.config.visitConstraints);v.eventDays={'2027-01-24':{confirmed:true,minutes:100,hardLimitMinutes:70,preferredFinishMinutes:45,logisticsMinutes:20}};
 const c=intake.build(p.config,v);assert.deepEqual(c.visitConstraints.eventDays,v.eventDays);
 for(const key of ['minutes','hardLimitMinutes','preferredFinishMinutes','estimatedMinutes'])assert.throws(()=>coach.prepareNewProgramme({...p.config,visitConstraints:{...v,eventDays:{'2027-01-24':{confirmed:true,[key]:-1}}}}),/Invalid event/);
});
test('Leila and Hugo retain every prescribed lift/run dose; Sofia remains blocked without fabricated pace or duration',()=>{
 for(const id of ['P','Q']){const p=generate(id);assert.deepEqual(doses(p),doses(previous(id).programme));assert.ok(p.weeks.every(w=>w.feasible));}
 const p=generate('R');assert.deepEqual(doses(p),doses(previous('R').programme));assert.ok(p.weeks.every(w=>!w.feasible));
 assert.ok(p.weeks.flatMap(w=>w.sessions.flatMap(s=>s.runs||[])).every(r=>r.minutes===null&&!r.steps.some(s=>s.role==='work')));
});
test('Keiko is blocked by her actual 240-minute allowance, while the preferred 3:45 goal never changes race pace',()=>{
 const p=generate('T'),w=p.weeks.at(-1),race=w.sessions.find(s=>s.eventDate);
 assert.equal(w.feasible,false);assert.equal(race.eventPermission.confirmed,false);assert.equal(race.timeBudget.totalMinutes,250);
 assert.match(w.blockingIssues.join(' '),/hard event window of 240/);
 assert.deepEqual(race.runs,previous('T').programme.weeks.at(-1).sessions.find(s=>s.eventDate).runs);
 const c=profile('T').config;c.visitConstraints.eventDays['2027-03-07']={confirmed:true,preferredFinishMinutes:225};
 const preferred=adapters.buildNewProgramme(c,{now}),eventWeek=preferred.weeks.at(-1);
 assert.equal(eventWeek.feasible,true,'A soft target alone does not cause a calendar failure');assert.equal(eventWeek.reviewRequired,true,'Fatigue and endurance readiness still require review');
 assert.deepEqual(eventWeek.sessions.find(s=>s.eventDate).runs,race.runs);
});
test('maintenance fatigue reduces affected intensity while preserving lifting, normal bench and already-light recovery weeks',()=>{
 const p=generate('T'),b=previous('T').programme;
 for(const w of p.weeks){
  assert.deepEqual(main(w,'Bench'),main(b.weeks[w.week-1],'Bench'));
  for(const lift of ['Squat','Deadlift']){
   const es=main(w,lift);assert.ok(es.length);assert.ok(es.every(e=>e[4]<=6.5&&e[5].recoveryReviewRequired));
   assert.ok(es.reduce((n,e)=>n+e[1]*e[2],0)<=main(b.weeks[w.week-1],lift).reduce((n,e)=>n+e[1]*e[2],0),'Do not increase work in an already reduced week');
  }
  assert.ok(w.sessions.flatMap(s=>s.runs).filter(r=>r.role!=='race').every(r=>r.role==='easy-run'));
 }
 assert.ok(main(p.weeks[0],'Squat')[0][3]<105);assert.ok(main(p.weeks[0],'Deadlift')[0][3]<127.5);
 const c=profile('T').config;delete c.recoveryEvidence;delete c.recoveryContext;
 assert.equal(adapters.buildNewProgramme(c,{now}).weeks[0].sessions.flatMap(s=>s.ex).find(e=>e[0]==='Squat')[4],7.5);
});
test('explicit lower-body recovery reports and novice maintenance stay bounded without manufacturing sleep/readiness scores',()=>{
 const p=profile('T');delete p.config.recoveryEvidence;
 const current=adapters.buildNewProgramme(p.config,{data:p.historicalData,now});assert.ok(main(current.weeks[0],'Squat').every(e=>e[4]<=6.5));assert.equal(main(current.weeks[0],'Bench')[0][4],7.5);
 p.config.trainingAge='returning';const novice=adapters.buildNewProgramme(p.config,{data:p.historicalData,now});assert.ok(main(novice.weeks[0],'Squat').every(e=>e[4]<=5.5&&e[1]===1));
 const cleared=profile('T').config;cleared.recoveryEvidence.cleared=true;
 assert.equal(main(adapters.buildNewProgramme(cleared,{now}).weeks[0],'Squat')[0][4],7.5,'Explicit clearance is distinct from elapsed weeks');
 p.config.trainingAge='intermediate';p.config.recoveryContext.reportedAt='2027-01-01';assert.equal(main(adapters.buildNewProgramme(p.config,{now}).weeks[0],'Squat')[0][4],7.5,'Future reports are not current evidence');
});
test('Idris has no hard lifting or long/quality running before the actual recovery end date, including partial weeks',()=>{
 for(const days of [10,14,21]){
  const c=profile('S').config;c.orderedGoals[0].recoveryDays=days;
  const p=adapters.buildNewProgramme(c,{now});
  for(const w of p.weeks)for(const s of w.sessions){const elapsed=(Date.parse(dateOf(c,w.week,s.day))-Date.parse('2026-11-28'))/86400000;
   if(elapsed>0&&elapsed<days){assert.ok((s.ex||[]).every(e=>e[4]<=6));assert.ok((s.runs||[]).every(r=>r.role!=='long-run'&&!r.steps.some(s=>s.role==='work')));}
  }
  assert.ok(!inspect([{id:'S',input:c,programme:p}]).findings.some(f=>f.kind==='hard-work-within-requested-recovery'));
 }
 const p=generate('S'),w=p.weeks[5];assert.ok(main(w).length,'Light practice remains');assert.ok(main({sessions:[w.sessions.find(s=>s.day==='Mon')]}).every(e=>e[4]<=6));
 assert.equal(w.coachingInstructions.handoverRecovery.conditional,true);
 assert.deepEqual(doses({...p,weeks:p.weeks.slice(6)}),doses({...previous('S').programme,weeks:previous('S').programme.weeks.slice(6)}));
});
test('date-based recovery spans the UK daylight-saving transition without losing a recovery day',()=>{
 const c=profile('S').config;c.startDate='2027-03-01';c.weeks=13;c.strengthTargetDate='2027-03-27';c.runningTargetDate='2027-05-30';c.orderedGoals[0].date=c.strengthTargetDate;c.orderedGoals[1].date=c.runningTargetDate;c.visitConstraints.eventDays={'2027-03-27':{confirmed:true},'2027-05-30':{confirmed:true,minutes:240}};
 const p=adapters.buildNewProgramme(c,{now}),monday=p.weeks[5].sessions.find(s=>s.day==='Mon');assert.equal(dateOf(c,6,'Mon'),'2027-04-05');assert.ok(monday.ex.every(e=>e[4]<=6));
 assert.ok(!inspect([{id:'DST',input:c,programme:p}]).findings.some(f=>f.kind==='hard-work-within-requested-recovery'));
});
test('all 64 saved Stage 2 athlete-weeks remain exactly unchanged; generation does not mutate retained logs or approvals',()=>{
 for(const id of 'PQRST'){
  const b=copy(previous(id)),config=b.programme.config,data=copy(b.historicalData),before=JSON.stringify({config,data});
  assert.equal(config.coachingSafeguardsVersion,undefined);
  assert.equal(JSON.stringify(adapters.buildProgramme(config,{data,now})),JSON.stringify(b.programme));assert.equal(JSON.stringify({config,data}),before);
  const retained={...data,customRoadmap:config,activeSchedule:copy(b.programme.weeks[0].sessions),sets:[...data.sets,{exercise:'Bench',weight:50,reps:3,rpe:7,date:'2026-10-29T12:00:00Z',notes:'Retained athlete log'}],runs:[...data.runs,{km:3,min:22,date:'2026-10-28T12:00:00Z'}],decisions:[{approved:true,kind:'manual',id:'retain'}],overrides:{retained:{weight:50}},completions:{retained:true},activeWorkout:{notes:'Unfinished work'}};
  const snapshot=JSON.stringify(retained);adapters.buildProgramme(config,{data:retained,now});adapters.buildNewProgramme(profile(id).config,{data:retained,now});assert.equal(JSON.stringify(retained),snapshot);
 }
});
test('browser-global canonical entry has the same event and recovery safeguards as Node',()=>{
 const sandbox=vm.createContext({Date,console});for(const file of ['running-workouts','running-preparation','coach-constraints','coach-engine','coach-adapters'])vm.runInContext(fs.readFileSync('src/'+file+'.js','utf8'),sandbox);
 for(const id of ['S','T']){const p=profile(id);assert.equal(JSON.stringify(sandbox.LHRFCoachAdapters.buildNewProgramme(p.config,{data:p.historicalData,now})),JSON.stringify(generate(id)));}
});
