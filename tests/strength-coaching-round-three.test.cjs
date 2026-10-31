const test=require('node:test'),assert=require('node:assert/strict');
const coach=require('../src/coach-engine'),adapters=require('../src/coach-adapters'),intake=require('../src/coach-intake');
const fixture=require('./fixtures/five-scenario-round-three-inputs.json');
const clone=x=>JSON.parse(JSON.stringify(x)),now=()=>Date.parse(fixture.clock);
const profile=id=>clone(fixture.cases.find(x=>x.id===id));
function proposal(id,patch={},data){const p=profile(id);return adapters.buildNewProgramme({...p.config,...patch},{data:data||p.historicalData,now})}
const entries=(p,week,day,lift)=>p.weeks[week-1].sessions.filter(s=>!day||s.day.slice(0,3)===day).flatMap(s=>s.ex||[]).filter(e=>!lift||e[0]===lift);

test('running-first race taper bounds background strength without a strength-deload rebound',()=>{
 const p=proposal('N');
 for(const week of [5,6])for(const lift of ['Squat','Deadlift'])for(const e of entries(p,week,null,lift)){assert.ok(e[1]<=1);assert.ok(e[4]<=6);assert.ok(e[3]<=(p.config.baselines[lift]||p.config.liftProfiles[lift].kg)*.60+2.5)}
 const k=proposal('K');assert.ok(entries(k,14,'Thu','Deadlift').length);assert.ok(entries(k,14,'Thu','Deadlift').every(e=>e[1]===1&&e[4]<=6));
});
test('day after a half marathon does not restore loaded lower-body work and later handover remains conditional',()=>{
 const p=proposal('N');assert.equal(entries(p,7,'Mon','Squat').length,0);assert.ok(entries(p,7,'Mon','Bench').every(e=>e[4]<=6));
 assert.equal(p.weeks[7].priority,'Squat');assert.equal(p.weeks[7].reviewRequired,true);assert.ok(p.weeks[7].warnings.some(x=>/handover review/.test(x)));assert.equal(p.weeks[7].coachingInstructions.handoverRecovery.conditional,true);assert.match(p.weeks[7].coachingInstructions.handoverRecovery.note,/elapsed days alone/);
 assert.ok(entries(p,8,null,'Squat').some(e=>e[4]>=8),'Provisional future preparation remains represented for review, rather than blocked because future recovery is not yet observable.');
});
test('bench-only meet defaults other lifts to maintenance and keeps distinct bench exposures',()=>{
 const p=proposal('M');assert.deepEqual(p.config.strengthModes,{Squat:'maintenance',Deadlift:'maintenance'});
 for(const week of [1,6,7])for(const lift of ['Squat','Deadlift'])assert.ok(entries(p,week,null,lift).every(e=>e[4]<=7.5&&e[5].policy==='maintenance'));
 const roles=new Set(entries(p,3,null,'Bench').map(e=>e[5].trainingRole));assert.ok(['heavy','volume','speed'].every(r=>roles.has(r)));
 const override=proposal('M',{strengthModes:{Squat:'progression'}});assert.ok(entries(override,6,null,'Squat').some(e=>e[4]===8));assert.equal(override.config.strengthModes.Deadlift,'maintenance');
 const o=proposal('O');assert.equal(o.config.strengthModes,undefined,'Full powerlifting does not default all supporting lifts to maintenance.');
});
test('per-lift objectives reject malformed modes and are carried by canonical intake and ordered stages',()=>{
 for(const strengthModes of [[],null,{squat:'maintenance'},{Squat:'max'},{Run:'maintenance'}])assert.throws(()=>coach.prepareNewProgramme({...profile('M').config,strengthModes}),/strengthModes/);
 const p=profile('M'),v=p.config.visitConstraints,raw={strengthVisits:v.strengthVisits,minutes:v.minutes,combinedDays:v.combinedDays,strengthModes:{Squat:'maintenance'}};
 const out=intake.build(p.config,raw);assert.deepEqual(out.strengthModes,raw.strengthModes);assert.notEqual(out.strengthModes,raw.strengthModes);
 assert.throws(()=>intake.build(p.config,{...raw,strengthModes:{Squat:'hard'}}),/strength modes/);
 const staged=profile('N').config;staged.orderedGoals[1].strengthModes={Squat:'wrong'};assert.throws(()=>coach.prepareNewProgramme(staged),/strengthModes/);
});
function improved(){const d=profile('O').historicalData;d.sets=[{date:'2026-10-20T12:00:00Z',exercise:'Squat',weight:140,reps:5,rpe:8},{date:'2026-10-27T12:00:00Z',exercise:'Squat',weight:145,reps:5,rpe:8}];return d}
test('new proposals reconcile two recent same-lift sessions with a bounded attributable change and no history mutation',()=>{
 const config=profile('O').config,data=improved(),before=JSON.stringify({config,data}),p=adapters.buildNewProgramme(config,{data,now}),source=150;
 assert.equal(JSON.stringify({config,data}),before);assert.equal(p.config.baselines.Squat,source*1.05);assert.ok(entries(p,1,null,'Squat')[0][3]>120);
 const proof=p.config.strengthCalibration.lifts.Squat;assert.equal(proof.sourceBaseline,source);assert.equal(proof.maximumChangeFraction,.05);assert.equal(proof.evidence.length,2);assert.equal(p.config.strengthCalibration.requiresAthleteApproval,true);
 assert.equal(p.config.liftProfiles.Bench.kg,100);assert.equal(p.config.baselines.Bench,undefined);
});
test('new-proposal calibration excludes future, stale, undated, missing-effort and other-exercise observations',()=>{
 const cases=[d=>d.sets.forEach(r=>delete r.date),d=>d.sets.forEach(r=>r.date='2027-01-01'),d=>d.sets.forEach(r=>r.date='2026-01-01'),d=>d.sets.forEach(r=>delete r.rpe),d=>d.sets.forEach(r=>r.exercise='Paused squat'),d=>d.sets[1].date=d.sets[0].date,d=>d.sets.forEach(r=>r.failed=true)];
 for(const change of cases){const data=improved();change(data);const p=proposal('O',{},data);assert.equal(p.config.baselines.Squat,undefined);assert.equal(p.config.liftProfiles.Squat.kg,150);assert.equal(p.config.strengthCalibration,undefined)}
});
test('raw saved version-two generation remains on its saved rules and does not recalibrate from later history',()=>{
 const raw=profile('O').config,before=JSON.stringify(raw),a=adapters.buildProgramme(raw,{now}),b=adapters.buildProgramme(raw,{data:improved(),now});assert.deepEqual(a.weeks,b.weeks);assert.equal(JSON.stringify(raw),before);assert.equal(a.config.coachingRefinementVersion,undefined);assert.equal(a.config.baselines.Squat,undefined);
});

test('repeated new-proposal preparation with the same evidence does not compound calibration',()=>{
 const data=improved(),a=coach.prepareNewProgramme(profile('O').config,{data,now}),b=coach.prepareNewProgramme(a,{data,now}),c=coach.prepareNewProgramme(b,{data,now});
 assert.equal(a.baselines.Squat,157.5);assert.deepEqual(b,a);assert.deepEqual(c,a);
});

test('first programme activation can review progression before a saved roadmap exists',()=>{
 const engine=coach.createEngine({data:{sets:[],runs:[],decisions:[]},now});
 assert.deepEqual(engine.carryForwardApprovedProgression([],1),[]);
});
