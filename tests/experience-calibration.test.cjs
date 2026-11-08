const test=require('node:test'),assert=require('node:assert/strict');
const adapters=require('../src/coach-adapters.js'),coach=require('../src/coach-engine.js');
const {fullInventory}=require('./equipment-fixtures.cjs'),registry=require('../src/exercise-registry');
const original=require('./fixtures/five-scenario-round-three-inputs.json'),copy=x=>JSON.parse(JSON.stringify(x)),now=()=>Date.parse('2026-11-01T08:00:00Z');
function config(){const c=copy(original.cases.find(r=>r.id==='M').config);delete c.trainingAge;c.startDate='2026-11-02';c.weeks=8;c.strengthTargetDate='2026-12-26';c.baselines={Bench:160};c.liftProfiles.Bench={kg:160,reps:1,recency:'old'};c.equipmentInventory=fullInventory();return c}
function history(){return {sets:[{exercise:'Bench',weight:100,reps:5,rpe:8,role:'top',date:'2026-10-22T10:00:00Z'},{exercise:'Bench',weight:120,reps:1,rpe:9,role:'top',execution:'competition-paused',competition:true,date:'2026-10-29T10:00:00Z'}].map(row=>({...row,...registry.identity(row.exercise,fullInventory())})),runs:[],checkins:[],overrides:{},decisions:[]}}
const generate=(c=config(),data=history())=>adapters.buildNewProgramme(c,{data,now}),main=p=>p.weeks.flatMap(w=>w.sessions.flatMap(s=>s.ex)).filter(e=>e[0]==='Bench'&&e[5]?.category==='primary');
test('missing experience uses distinct reliable main-lift days without inventing training age or retaining an old maximum',()=>{
 const c=config(),d=history(),before=JSON.stringify({c,d}),p=generate(c,d),proof=p.config.strengthCalibration.lifts.Bench;
 assert.equal(p.config.trainingAge,undefined);assert.equal(proof.trainingLevel,'performance-supported');assert.ok(proof.adoptedBaseline<140&&proof.adoptedBaseline>120);assert.equal(p.config.liftProfiles.Bench.kg,160);
 assert.ok(main(p).some(e=>e[2]===1&&e[3]>=110&&e[4]>=7.5&&e[4]<=8.5));assert.ok(main(p).every(e=>e[5].policy!=='beginner'));assert.equal(JSON.stringify({c,d}),before);assert.deepEqual(generate(c,d),p);
});
test('top sets dominate back-offs and variations; a back-off cannot establish another lift or a competition single',()=>{
 const d=history(),expected=generate(undefined,d).config.strengthCalibration;for(const date of ['2026-10-22T10:00:00Z','2026-10-29T10:00:00Z'])for(let i=0;i<8;i++)d.sets.push({exercise:'Bench',weight:50,reps:5,rpe:8,role:'backoff',date});
 d.sets.push(...history().sets.map(x=>({...x,exercise:'Close-grip bench',weight:200})),...history().sets.map(x=>({...x,exercise:'Paused squat',weight:300})));
 const p=generate(undefined,d);assert.deepEqual(p.config.strengthCalibration,expected);assert.equal(p.config.strengthCalibration.lifts.Squat,undefined);
});
test('insufficient, stale, duplicate, future, failed and missing-effort records request clarification, not beginner kilograms',()=>{
 const edits=[d=>d.sets.pop(),d=>d.sets.forEach(r=>r.role='backoff'),d=>d.sets.forEach(r=>r.exercise='Close-grip bench'),d=>d.sets.forEach(r=>r.date='2025-01-01'),d=>d.sets.forEach(r=>r.date='2027-01-01'),d=>d.sets.forEach(r=>r.failed=true),d=>d.sets.forEach(r=>delete r.rpe),d=>d.sets[1].date=d.sets[0].date];
 for(const edit of edits){const d=history();edit(d);const p=generate(undefined,d);assert.ok(p.weeks.every(w=>!w.feasible));assert.ok(main(p).every(e=>e[3]===0&&e[4]<=7));assert.match(p.weeks[0].blockingIssues.join(' '),/Clarify experience/);}
});
test('explicit novice/returning status is respected and ordinary rep practice alone does not authorise near-max competition singles',()=>{
 for(const age of ['beginner','novice','returning']){const p=generate({...config(),trainingAge:age});assert.ok(!main(p).some(e=>e[2]===1&&e[4]>=7.5&&e[4]<=8.5));}
 const d=history();d.sets[1]={...d.sets[1],weight:105,reps:3,execution:undefined,competition:false};const p=generate(undefined,d);assert.equal(p.config.strengthCalibration.lifts.Bench.singlesSupported,false);assert.ok(!main(p).some(e=>e[2]===1&&e[4]>=7.5&&e[4]<=8.5));assert.match(p.weeks[0].warnings.join(' '),/single experience/);
});
test('experience evidence is per lift and conflicting performances cannot silently reuse a historical max',()=>{
 const c=config();c.lightLifts=[];c.strengthModes={Squat:'progression',Deadlift:'maintenance'};delete c.trainingAge;const p=generate(c);assert.ok(p.weeks.every(w=>!w.feasible));assert.ok(main(p).some(e=>e[2]===1));
 const d=history();d.sets[1].weight=200;const conflict=generate({...config(),trainingAge:'advanced'},d);assert.equal(conflict.config.strengthCalibration.lifts.Bench.trainingLevel,'clarification-required');assert.ok(conflict.weeks.every(w=>!w.feasible));assert.ok(main(conflict).every(e=>e[3]===0&&e[4]<=6));
});
test('historical underestimates and absent baselines do not cap reliable explicit main-set evidence; absolute strength does not define training age',()=>{
 for(const source of [0,50,200]){const c=config();c.baselines.Bench=source;c.liftProfiles.Bench.kg=source;const p=generate(c);assert.ok(p.config.baselines.Bench>120&&p.config.baselines.Bench<140);}
 const d=history();d.sets.forEach(r=>r.weight/=4);const p=generate(undefined,d);assert.equal(p.config.strengthCalibration.lifts.Bench.trainingLevel,'performance-supported');assert.equal(p.config.trainingAge,undefined);
});
test('legacy role intent and earned increments survive new proposal creation without a fabricated improvement',()=>{
 const c=config();c.benchExposureVersion=1;const p=generate(c),roles=p.weeks[0].sessions.flatMap(s=>s.ex.filter(e=>e[0]==='Bench'&&e[5]?.role!=='backoff').map(e=>e[5].trainingRole));assert.deepEqual(roles,['volume','heavy','speed']);
 const heavy=main(p).filter(e=>e[2]===1);assert.ok(heavy.some(e=>e[5].earnedProgression));for(const e of heavy){const earned=e[5].earnedProgression;if(!earned)continue;assert.equal(earned.automatic,false);assert.ok(earned.rangeKg[1]>=e[3]);assert.match(earned.conditions,/prior.*ceiling/);}
 const saved=copy(p.config),before=JSON.stringify(saved);adapters.buildProgramme(saved,{data:history(),now});assert.equal(JSON.stringify(saved),before);
 const d=history();d.sets.push({exercise:'Lat pulldown',weight:80,reps:8,rpe:7,date:'2026-10-29T10:00:00Z'},{exercise:'Lat pulldown',weight:90,reps:8,rpe:8,date:'2026-10-29T10:00:00Z'});const support=generate(c,d).weeks.flatMap(w=>w.sessions.flatMap(s=>s.ex)).filter(e=>e[0]==='Lat pulldown'&&e[4]===6.5);assert.ok(support.length);assert.ok(support.every(e=>e[3]<80&&e[1]<=2),'Reducing support RPE must also reconcile an overshooting logged load, rather than reuse fatigued last-set kg');
});
test('a low post-marathon week remains a return observation, not a replacement habitual capacity; two short-race runs can include bounded rhythm practice',()=>{
 const c=config();c.runGoal='10k';c.runs=2;c.runningGuidanceVersion=4;c.runningTargetDate='2026-12-27';c.runProfile={distance:5,seconds:1600,weeklyKm:20,recency:'recent',effort:'performance'};c.runningHistory={recentMarathonDate:'2026-10-18',longRun:{km:6,minutes:45}};
 const d=history();d.runs=[{date:'2026-10-27T08:00:00Z',km:3,min:24,sourceActivityId:'x'},{date:'2026-10-31T08:00:00Z',km:6,min:45,sourceActivityId:'y'}];const before=JSON.stringify(d),p=generate(c,d);assert.equal(p.config.runProfile.weeklyKm,20);assert.equal(p.config.runningReturnObservation.observedWeekKm,9);assert.equal(p.config.runningReturnObservation.normalCapacityEstablished,false);
 const runs=p.weeks.flatMap(w=>w.sessions.flatMap(s=>s.runs)),quality=runs.filter(r=>r.role==='quality-run');assert.equal(quality.length,0,'Future weeks cannot establish recovery or earn quality progression without new task evidence');assert.ok(p.weeks[0].sessions.flatMap(s=>s.runs).every(r=>r.role!=='quality-run'));assert.equal(JSON.stringify(d),before);
 for(const w of p.weeks){const rs=w.sessions.flatMap(s=>s.runs).filter(r=>r.role!=='race'),total=rs.reduce((n,r)=>n+r.distanceKm,0),work=rs.flatMap(r=>r.steps).filter(s=>s.role==='work').reduce((n,s)=>n+s.distanceKm,0);assert.ok(work<=total*.2+.01);}
 delete c.startDate;delete c.strengthTargetDate;delete c.runningTargetDate;c.noDate=true;assert.equal(coach.prepareNewProgramme(c,{data:d,now}).runningReturnObservation,undefined,'Undated input cannot invent a dated observation week');
});
test('race PB strategy and adjacent competition readiness stay separate from hard time feasibility',()=>{
 const c=config();c.strengthTargetDate='2026-12-26';c.runningTargetDate='2026-12-27';c.runGoal='10k';c.runs=2;c.runningGuidanceVersion=4;c.runProfile={distance:5,seconds:1600,weeklyKm:20,recency:'recent',effort:'performance'};c.runningPersonalBestSeconds=4000;c.runningGoalSeconds=3500;c.runProfile.resultDate='2026-10-25';
 const p=generate(c),race=p.weeks.at(-1).sessions.find(s=>s.eventType==='running');assert.equal(race.recoveryReviewRequired,true);assert.equal(race.runs[0].raceStrategy.personalBestSeconds,4000);assert.equal(race.runs[0].raceStrategy.stretchGoalSeconds,3500);assert.match(race.runs[0].raceStrategy.note,/not.*required|No forecast/);
 c.visitConstraints.eventDays={...c.visitConstraints.eventDays,'2026-12-27':{confirmed:true,minutes:60}};
 const capped=generate(c).weeks.at(-1).sessions.find(s=>s.eventType==='running');assert.equal(capped.eventPermission.confirmed,false);assert.ok(capped.constraintIssues.some(i=>i.kind==='event-time'));
 c.runProfile.seconds=null;const unknown=generate(c).weeks.at(-1).sessions.find(s=>s.eventType==='running');assert.equal(unknown.timeBudget.totalMinutes,null);assert.doesNotMatch(JSON.stringify(unknown),/NaN|0:00\/km/);
 assert.ok(unknown.constraintIssues.some(i=>i.kind==='event-duration'));
 c.visitConstraints.eventDays['2026-12-27']={confirmed:true};
 const available=generate(c).weeks.at(-1).sessions.find(s=>s.eventType==='running');
 assert.equal(available.eventPermission.confirmed,true);
 assert.equal(available.timeBudget.totalMinutes,null);
 assert.ok(!available.constraintIssues?.some(i=>i.kind==='event-duration'));
});
test('all nine Stage 5 saved policies retain exact programmes and browser globals match evidence-based Node generation',()=>{
 const fs=require('node:fs'),vm=require('node:vm');
 for(const id of ['O1','O2','O3','P','Q','R','S','T','Taylor']){const row=require('../docs/qa/stage-five/current/'+id+'.json');assert.equal(JSON.stringify(adapters.buildProgramme(row.programme.config,{data:row.historicalData,now:()=>Date.parse(row.provenance.clock)})),JSON.stringify(row.programme));}
 const sandbox=vm.createContext({Date,console});for(const name of ['gym-equipment','exercise-registry','coaching-evidence','running-workouts','running-preparation','coach-constraints','coach-engine','coach-adapters'])vm.runInContext(fs.readFileSync('src/'+name+'.js','utf8'),sandbox);
 const c=config(),data=history();assert.equal(JSON.stringify(sandbox.LHRFCoachAdapters.buildNewProgramme(c,{data,now})),JSON.stringify(generate(c,data)));
});
