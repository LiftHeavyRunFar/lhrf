const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {buildProgramme,createProfileEngine,normalizeProfile}=require('../src/coach-adapters.js');
const profiles=require('./athletes/profiles.cjs');
const base={...profiles[2].config,coachingPolicy:'review-v2'};
const mains=p=>p.weeks.flatMap(w=>w.sessions.flatMap(s=>s.ex.filter(e=>['top','straight'].includes(e[5]?.role))));
test('beginners and returning lifters have bounded entry work, independently of known baseline',()=>{
 for(const age of ['beginner','returning'])for(const maxes of [{},{squat:100,bench:80,deadlift:120}]){
  const p=buildProgramme({...base,trainingAge:age,maxes,weeks:12});
  assert.ok(mains(p).length);for(const e of mains(p)){assert.equal(e[5].role,'straight');assert.ok(e[1]<=3);assert.ok(e[4]<=7);if(!Object.keys(maxes).length)assert.equal(e[3],0)}
  assert.ok(mains(p).every(e=>['Bench','Squat','Deadlift'].includes(e[0])),'Learn main lifts before automatically rotating variants');
  assert.ok(p.weeks[0].sessions.flatMap(s=>s.ex).every(e=>e[1]<=2));
 }
 const novice=buildProgramme({...base,trainingAge:'beginner'}),advanced=buildProgramme({...base,trainingAge:'advanced'});
 assert.ok(novice.weeks[0].sessions.flatMap(s=>s.ex).reduce((n,e)=>n+e[1],0)<advanced.weeks[0].sessions.flatMap(s=>s.ex).reduce((n,e)=>n+e[1],0));
});
test('running-focused maintenance has a stable distinct dose and never inherits approved strength acceleration',()=>{
 const input={...base,weeks:12,strengthMode:'maintenance',trainingAge:'advanced',hybridFocus:'running',priority:'Running'},p=buildProgramme(input);
 for(const e of mains(p)){assert.equal(e[5].policy,'maintenance');assert.equal(e[5].role,'straight');assert.ok(e[1]<=2);assert.ok(e[4]<=7.5)}
 const loads=w=>p.weeks[w-1].sessions.flatMap(s=>s.ex.filter(e=>e[5]?.policy==='maintenance').map(e=>e[3]));assert.deepEqual(loads(1),loads(8));
 const {engine,data}=createProfileEngine(input,{data:{decisions:[{approved:true,kind:'adaptive-progression',exercise:'Bench',week:1,factor:1.075}]}});
 const sessions=engine.generatedSessions(p.config,8),before=JSON.stringify(sessions);data.activeSchedule=sessions;engine.carryForwardApprovedProgression(sessions,8);assert.equal(JSON.stringify(sessions),before);
 assert.equal(engine.reviewDecision().title,'Maintain strength while prioritising running');
});
test('restricted, impossible and manual schedules report every omitted component and respect hard limits',()=>{
 const cases=[{...profiles[4].config},{...base,availableDays:['Tue'],days:1,doubleDays:[],maxSessionsPerDay:1},
 {...base,availableDays:['Tue','Thu'],days:2,doubleDays:['Tue'],maxSessionsPerDay:1,manualSplit:{Tue:['bench','lower','run'],Thu:['long']}},
 {...base,fixedSessions:[{kind:'strength',lift:'bench',day:'Mon'}],availableDays:['Tue','Thu'],days:2,doubleDays:['Tue','Thu']}];
 for(const c of cases){const {engine,config}=createProfileEngine({...c,coachingPolicy:'review-v2'}),plan=engine.customPlan(config);
  assert.ok(plan.unscheduled.length);assert.equal(plan.feasible,false);assert.equal(plan.scheduled+plan.unscheduled.length,plan.total);
  assert.ok(plan.slots.filter(s=>s.items.length).length<=config.days);
  for(const slot of plan.slots){assert.ok(slot.items.length<=(config.maxSessionsPerDay||2));if(slot.items.length)assert.ok(config.availableDays.includes(slot.day));if(slot.items.some(x=>x.type==='run')&&slot.items.some(x=>x.type==='strength'))assert.ok(config.doubleDays.includes(slot.day))}
  assert.ok(plan.unscheduled.every(x=>x.reason&&x.componentId));const p=buildProgramme(config);assert.ok(p.weeks.every(w=>w.reviewRequired&&!w.feasible&&w.unscheduled.length));
 }
});
test('different horizons, goals and experience levels remain deterministic, finite, immutable and capacity constrained',()=>{
 let cases=0;
 for(const weeks of [2,5,12,20,52])for(const priority of ['Bench','Squat','Running','Balanced'])for(const trainingAge of ['beginner','intermediate','advanced'])for(const runGoal of ['fitness','10k','half','marathon']){
  const input={...base,weeks,priority,trainingAge,runGoal,availableDays:['Mon','Tue','Thu','Sat','Sun'],doubleDays:['Tue','Thu'],days:5,maxSessionsPerDay:2};
  const snapshot=JSON.stringify(input),a=buildProgramme(input),b=buildProgramme(input);assert.deepEqual(a,b);assert.equal(JSON.stringify(input),snapshot);assert.equal(a.weeks.length,weeks);
  for(const w of a.weeks){assert.notEqual(w.phase,'Taper / event','Undated athlete must not peak because horizon ends');assert.ok(w.sessions.length<=5);for(const s of w.sessions){const components=s.ex.filter(e=>['top','straight'].includes(e[5]?.role)).length+s.runs.length;assert.ok(components<=2);for(const r of s.runs)assert.ok(Number.isFinite(r.distanceKm)&&r.distanceKm>=0);for(const e of s.ex)assert.ok(Number.isFinite(e[3])&&e[4]>0&&e[4]<=10)}}
  cases++;
 }
 assert.equal(cases,240);
});
test('near and distant event dates, exclusions and post-event weeks stay tied to the calendar',()=>{
 for(const weeks of [2,5,12,20,52]){
  const strengthTargetDate=new Date(Date.UTC(2026,9,19+(weeks-1)*7+5)).toISOString().slice(0,10);
  const p=buildProgramme({...base,weeks:weeks+2,startDate:'2026-10-19',strengthTargetDate,trainingAge:'advanced',squat:0,deadlift:0,event:'bench'});
  assert.equal(p.weeks[weeks-1].sessions.filter(s=>s.eventDate===strengthTargetDate).length,1);assert.equal(p.weeks[weeks].deload,true);assert.notEqual(p.weeks[weeks+1].phase,'Taper / event');
  assert.ok(mains(p).every(e=>!/squat|deadlift/i.test(e[0])));
 }
});
test('approved five-week review-v1 prescriptions remain byte-identical across all weeks',()=>{
 const fixture=require('./fixtures/approved-five-week.json');const {engine,config}=createProfileEngine(fixture.config);
 for(const item of fixture.weeks)assert.equal(crypto.createHash('sha256').update(JSON.stringify(engine.generatedSessions(config,item.week))).digest('hex'),item.sha256);
});

test('invalid horizons and frequencies cannot silently produce a plausible programme',()=>{
 for(const weeks of [-1,2.5,105])assert.throws(()=>buildProgramme({...base,weeks}),/horizon/);
 for(const bench of [-1,1.5,8])assert.throws(()=>buildProgramme({...base,bench}),/frequencies/);
 assert.throws(()=>buildProgramme({...base,strengthMode:'maximise everything'}),/maintenance or progression/);
});

test('previewing a new athlete never borrows the saved programme phase or recovery calendar',()=>{
 const saved=createProfileEngine({...profiles[0].config,coachingPolicy:'review-v1'}),c=normalizeProfile({...base,weeks:12,strengthTargetDate:'2027-01-09',startDate:'2026-10-19',trainingAge:'advanced'});
 const fresh=createProfileEngine(c);for(const week of [1,5,6,10,12])assert.deepEqual(saved.engine.generatedSessions(c,week),fresh.engine.generatedSessions(c,week));
});

test('the actual app approval handler refuses an infeasible schedule before changing any athlete state',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const source=html.slice(html.indexOf('function saveCustom(){'),html.indexOf('function loadCustom(){'));
 const data={sets:[{preserved:true}],customRoadmap:{preserved:true}},before=JSON.stringify(data),message={textContent:''};
 const ctx=vm.createContext({data,customConfig:()=>({}),customPlan:()=>({feasible:false,warnings:[]}),$:()=>message,confirm:()=>{throw Error('Approval must be blocked')}});
 vm.runInContext(source,ctx);ctx.saveCustom();assert.match(message.textContent,/cannot fit/);assert.equal(JSON.stringify(data),before);
});
