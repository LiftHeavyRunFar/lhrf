const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=process.env.LHRF_TEST_ROOT||process.cwd(),baseline=process.env.LHRF_BASE_ROOT||'/workspace/scratch/5075a213b296/lhrf-athlete-qa';
const c=require(path.join(root,'src/programme-catalogue.js')),t=require(path.join(root,'src/catalogue-training.js')),old=require(path.join(baseline,'src/programme-catalogue.js'));
const id='marathon-two-run';
const programme=()=>c.previewProgramme(id);
test('new option is additive and existing generated catalogue snapshots remain byte-for-byte equal',()=>{
 const now=c.listProgrammes(),before=old.listProgrammes();a.equal(now.length,before.length+1);a.deepEqual(now.filter(x=>x.id!==id),before);
 for(const e of before){for(const opts of [{},{recent10kSeconds:3900,referenceKg:{'competition-squat':180,'competition-bench':130,'competition-deadlift':200}}])a.deepEqual(c.previewProgramme(e.id,opts),old.previewProgramme(e.id,opts),e.id+' changed');}
});
test('actual complete generated programme has two weekly sessions and a real 42.195 km event',()=>{
 const p=programme();a.equal(p.durationWeeks,24);a.equal(p.sessionsPerWeek,2);a.equal(p.weeks.length,24);
 for(const [i,w] of p.weeks.entries()){a.equal(w.week,i+1);a.equal(w.sessions.length,2,'week '+w.week);a.equal(new Set(w.sessions.map(s=>s.id)).size,2);a.ok(w.sessions.every(s=>s.day>=0&&s.day<=6));}
 const all=p.weeks.flatMap(w=>w.sessions),events=all.filter(s=>s.id==='race'||s.kind==='event');a.equal(events.length,1);const event=events[0];a.equal(event.distanceMetres,42195);a.equal(p.weeks.at(-1).sessions.includes(event),true);a.ok(event.steps.some(x=>x.role==='race'&&x.distanceMetres===42195));
 const ordinary=all.filter(s=>s!==event);a.ok(ordinary.every(s=>s.kind==='run'&&s.durationSeconds>0&&!s.distanceMetres),'ordinary workouts must have time not fabricated distance');a.ok(ordinary.flatMap(s=>s.steps).every(s=>s.durationSeconds>0&&!s.distanceMetres));
});
test('hypothesis dose has easier weeks and final taper, without asserting universal thresholds',()=>{
 const w=programme().weeks,long=w.slice(0,23).map(x=>Math.max(...x.sessions.map(s=>s.durationSeconds/60)));for(const i of [3,7,11,15,19])a.ok(long[i]<long[i-1],'week '+(i+1)+' should be easier than previous');const max=Math.max(...long);a.ok(long[21]<max&&long[22]<long[21],'taper long runs');a.ok(w[23].sessions.filter(s=>s.id!=='race').every(s=>s.durationSeconds/60<=45));console.log('ACTUAL_SHORT_LONG_MINUTES='+JSON.stringify(w.slice(0,23).map(x=>x.sessions.map(s=>s.durationSeconds/60))));
});
test('empty history cannot become invented performance or suitability; guidance remains clear',()=>{
 const p=programme();a.match(p.entry,/two|twice/i);a.match(p.entry,/\b75\b/);a.match(p.entry,/4.{0,3}6/);a.match(p.entry,/review|coach/i);a.match(p.entry,/limit|less|fewer|constrain/i);a.ok(p.weeks.flatMap(w=>w.sessions).flatMap(s=>s.steps||[]).every(step=>step.paceSecondsPerKm==null),'no unreported race pace');const synthetic=c.previewProgramme(id,{recent10kSeconds:3900});a.ok(synthetic.weeks.flatMap(w=>w.sessions).flatMap(s=>s.steps||[]).every(step=>step.paceSecondsPerKm==null),'10K must not silently become a marathon pace');
});
test('calendar selections preserve the event and do not mutate earlier plans, logs or Garmin sentinels',()=>{
 const plan=programme(),ref=JSON.stringify(plan),chosen=t.scheduleSnapshot(plan,[1,6],6);a.equal(JSON.stringify(plan),ref,'mutated original plan');a.ok(chosen.weeks.slice(0,23).every(w=>w.sessions.map(s=>s.day).join(',')==='1,6'));a.equal(chosen.weeks[23].sessions.find(s=>s.id==='race').day,6);a.throws(()=>t.scheduleSnapshot(plan,[1],6));a.throws(()=>t.scheduleSnapshot(plan,[1,6],0));
 const existing=old.previewProgramme('10k-two-run'),s0=t.enrol(t.empty(),existing,'2026-11-16','previous');s0.logs={kept:{km:7,min:46}};s0.drafts={kept:{note:'preserve'}};s0.garmin={sentinel:'unchanged'};const previous=JSON.stringify(s0),s1=t.enrol(s0,chosen,'2026-11-16','marathon');a.equal(JSON.stringify(s0),previous);a.deepEqual(s1.plans[0],s0.plans[0]);a.deepEqual(s1.logs,s0.logs);a.deepEqual(s1.drafts,s0.drafts);a.deepEqual(s1.garmin,s0.garmin);const e=t.calendar(s1).find(x=>x.planId==='marathon'&&x.session.id==='race');a.equal(e.date,'2027-05-02');
});
test('generated hybrid overlap warns on real lower-body and long-run adjacency',()=>{
 const running=t.scheduleSnapshot(programme(),[1,6],6),strength=t.scheduleSnapshot(c.previewProgramme('lifting-foundation'),[3,5]);let s=t.enrol(t.empty(),strength,'2026-11-16','strength');s=t.enrol(s,running,'2026-11-16','marathon');const clashes=t.conflicts(s,'marathon');a.ok(clashes.length>0,'long run and adjacent lower-body work must be surfaced');a.ok(clashes.some(([a,b])=>[a,b].some(x=>x.session.id==='long')));
});
test('native adapter preserves time-only run, labels new race and refuses unsupported FIT time export',()=>{
 const n=require(path.join(root,'src/native-catalogue.js')),registry=require(path.join(root,'src/exercise-registry.js')),gym=require(path.join(root,'src/gym-equipment.js')),garmin=require(path.join(root,'src/garmin-workout.js'));
 const snapshot=t.scheduleSnapshot(programme(),[1,6],6),plans=[{id:'synthetic-two-run',start:'2026-11-16',snapshot}],before=JSON.stringify(plans),runtime=n.buildProgramme(plans,null,{training:t,registry,gym,inventory:undefined,equipment:[],now:'2026-11-14T12:00:00Z'});a.equal(JSON.stringify(plans),before);
 const first=runtime.weeks[0].sessions.find(s=>s.runs?.some(r=>r.role==='long-run'));a.ok(first);a.equal(first.runs[0].distanceKnown,false);a.equal(first.runs[0].minutes,75);a.equal(first.runs[0].steps[0].minutes,75);a.throws(()=>garmin.encodeWorkout({steps:first.runs[0].steps}),/valid positive distance/i,'time-based FIT must fail without fabricated distance');
 const event=runtime.weeks[23].sessions.find(s=>s.runs?.some(r=>r.steps?.some(x=>x.role==='race')));a.ok(event);a.equal(event.runs[0].role,'race');a.equal(event.runs[0].distanceKm,42.195);a.equal(event.scheduledDate,'2027-05-02');
 const beforeRuntime=JSON.stringify(runtime),again=n.buildProgramme(plans,runtime,{training:t,registry,gym,inventory:undefined,equipment:[],now:'2026-11-14T12:30:00Z'});a.equal(JSON.stringify(runtime),beforeRuntime);a.deepEqual(again.weeks,runtime.weeks,'saved occurrences must be retained on rebuild');
});
