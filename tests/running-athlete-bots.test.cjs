// Synthetic acceptance bots. Bounds are conservative product acceptance guards, not
// physiological certification or a claim that a generic plan makes somebody race-ready.
// Unlike prescription hashes, these checks ask whether the output makes sense for
// the input athlete. Version 3 is opt-in; existing approved version-2 plans stay fixed.
const test=require('node:test'),assert=require('node:assert/strict');
const {normalizeProfile,createProfileEngine}=require('../src/coach-adapters.js');
const NOW=Date.parse('2026-10-25T12:00:00Z');
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
function athlete({km=20,runs=3,goal='10k',pb='50:00',weeks=12,...rest}={}){
 const c=normalizeProfile({coachingPolicy:'review-v2',runningGuidanceVersion:3,trainingAge:'intermediate',startDate:'2026-10-26',weeks,event:goal==='fitness'?'general':'running',priority:'Running',runGoal:goal,runs,bench:0,squat:0,deadlift:0,days:7,tenKTime:pb,availableDays:DAYS,doubleDays:[],...rest});
 c.runProfile.weeklyKm=km;
 return c;
}
function inspect(config,week=1){
 const {engine}=createProfileEngine(config,{now:()=>NOW}),sessions=engine.generatedSessions(config,week),runs=sessions.flatMap(s=>s.runs||[]),plan=engine.customPlan(config),budget=engine.hybridRunWeek(config,week);
 const race=runs.filter(r=>r.role==='race'||r.role==='event-run'),training=runs.filter(r=>!race.includes(r));
 return {engine,sessions,runs,training,race,plan,budget,actual:training.reduce((n,r)=>n+Number(r.distanceKm||0),0),quality:training.filter(r=>r.role==='quality-run')};
}
const hardKm=row=>row.training.flatMap(r=>r.steps||[]).filter(s=>/interval|threshold|tempo|race pace/i.test(s.label||'')&&!/recover/i.test(s.label||'')).reduce((n,s)=>n+Number(s.distanceKm||0),0);
const maxPace=text=>Math.max(0,...[...String(text||'').matchAll(/(\d+):([0-5]\d)/g)].map(m=>Number(m[1])*60+Number(m[2])));
const review=(row,re)=>row.plan.feasible===false||[...(row.plan.warnings||[]),...(row.budget.warnings||[]),...row.sessions.flatMap(s=>s.hybridNotes||[])].some(w=>re.test(w));
const matrix=[];
for(const km of [0,6,20,60])for(const goal of ['fitness','5k','10k','half','marathon'])for(const runs of [1,2,3,4,5])matrix.push({km,goal,runs});
const name=p=>`${p.goal}, ${p.km||'unknown'} km/week, ${p.runs} runs`;

test('100 athlete profiles: actual opening training volume cannot exceed its baseline budget through minimum session padding',()=>{
 const failures=[];
 for(const p of matrix){const row=inspect(athlete(p));if(row.plan.feasible===false)continue;
  // A little per-session distance rounding is allowed. Adding a quality-workout
  // minimum to an already complete easy-distance budget is not rounding.
  const upper=row.budget.km*1.10+.125*p.runs;
  if(row.actual>upper+1e-8)failures.push(`${name(p)}: actual ${row.actual.toFixed(2)} km exceeds ${row.budget.km.toFixed(2)} km budget`);
 }
 assert.deepEqual(failures,[]);
});

test('100 athlete profiles: mainly easy means no more than 20% hard kilometres and at most one quality session',()=>{
 const failures=[];
 for(const p of matrix){const row=inspect(athlete(p));if(row.plan.feasible===false)continue;
  const hard=hardKm(row);if(row.quality.length>1||hard>row.actual*.20+1e-8)failures.push(`${name(p)}: ${hard.toFixed(2)}/${row.actual.toFixed(2)} km hard, ${row.quality.length} quality sessions`);
 }
 assert.deepEqual(failures,[]);
});

test('unknown baseline or unknown PB bots receive easy-only provisional running and no invented numerical pace',()=>{
 for(const p of [{km:0,pb:'50:00'},{km:20,pb:null},{km:0,pb:null}]){
  const row=inspect(athlete(p));assert.equal(row.quality.length,0,JSON.stringify(p));
  if(!p.pb)for(const step of row.training.flatMap(r=>r.steps||[]))assert.equal(maxPace(step.pace),0,'A different saved athlete PB must not fill a missing PB');
  assert.ok(review(row,/unknown|provisional|confirm|baseline|PB/i),'Missing baseline is visible to the athlete');
 }
});

test('single-run bots get an easy session and an explicit race-frequency review rather than an all-intensity week',()=>{
 for(const goal of ['fitness','5k','10k','half','marathon']){
  const row=inspect(athlete({km:20,runs:1,goal}));assert.equal(row.quality.length,0,goal);
  if(goal!=='fitness')assert.ok(review(row,/one run|single.run|frequency|fewer than|at least|insufficient|individual review/i),goal+' requires a frequency review');
 }
});

test('cooldown bots bound estimated duration and share of session, including slow and low-mileage athletes',()=>{
 const failures=[];
 for(const pb of ['35:00','50:00','1:20:00','1:40:00'])for(const km of [6,20,60]){
  const row=inspect(athlete({pb,km,runs:3}));if(row.plan.feasible===false)continue;
  for(const run of row.training)for(const step of run.steps||[])if(/cool.down/i.test(step.label||'')){
   const minutes=step.distanceKm*maxPace(step.pace)/60;
   if(minutes>15+.01||step.distanceKm>run.distanceKm*.25+1e-8)failures.push(`${pb},${km}km/week: ${step.distanceKm}km cooldown (${minutes.toFixed(1)}min) within ${run.distanceKm}km session`);
  }
 }
 assert.deepEqual(failures,[]);
});

test('all goals and run frequencies: distances add up, load grows steadily between build weeks and paces never become NaN',()=>{
 for(const goal of ['fitness','5k','10k','half','marathon'])for(const runs of [1,2,3,4,5]){
  const c=athlete({goal,runs,km:20});let previous=null;
  for(let week=1;week<=12;week++){
   const row=inspect(c,week);if(row.plan.feasible===false)continue;
   for(const run of row.training){assert.ok(Number.isFinite(run.distanceKm)&&run.distanceKm>0);assert.ok(Math.abs(run.distanceKm-(run.steps||[]).reduce((n,s)=>n+Number(s.distanceKm||0),0))<1e-8);assert.doesNotMatch(String(run.pace),/NaN|Infinity/)}
   if(!row.budget.deload&&!row.budget.taper){if(previous!==null)assert.ok(row.actual<=previous*1.12+.25,`${goal}/${runs} runs: W${week} jumps from ${previous} to ${row.actual}`);previous=row.actual;}
  }
 }
});

test('near and distant event bots remove quality in event week and carry explicit race distance in the calendar',()=>{
 for(const [goal,distance] of [['5k',5],['10k',10],['half',21.0975],['marathon',42.195]])for(const weeks of [2,12,24]){
  const date=new Date(Date.UTC(2026,9,26+(weeks-1)*7+6)).toISOString().slice(0,10),c=athlete({goal,km:goal==='marathon'?45:20,weeks,runningTargetDate:date});
  const row=inspect(c,weeks);assert.equal(row.quality.length,0,`${goal}, ${weeks} weeks: no additional interval workout beside the race`);
  const event=row.sessions.find(s=>s.eventType==='running');assert.ok(event,'Race stays on its exact calendar date');assert.equal(event.eventDate,date);
  const raceDistance=Number(event.eventDistanceKm)||Number(event.distanceKm)||(event.runs||[]).reduce((n,r)=>n+Number(r.distanceKm||0),0);
  assert.ok(Math.abs(raceDistance-distance)<.01,`${goal}: race distance must be explicit, not omitted from the week`);
  const race=(event.runs||[])[0];if(race)assert.ok(maxPace(race.pace)>0,'Known PB supplies race pace guidance');
 }
});

test('high-mileage and low-frequency bots surface a specific review when a 10K long run exceeds two hours',()=>{
 const row=inspect(athlete({km:60,runs:2,goal:'10k'}));
 const tooLong=row.training.some(r=>r.role==='long-run'&&Number(r.minutes)>120);
 if(tooLong)assert.ok(review(row,/long.run|duration|time.on.feet|frequency|capacity/i),'Large long-run concentration cannot silently count as routine 10K preparation');
});

test('bench-first adjacent-event bot preserves fixed days and light lower work while accounting for the race',()=>{
 const approved={...require('../programmes/november-2026.json'),runningGuidanceVersion:3};
 const first=inspect(approved,1),event=inspect(approved,5);
 assert.deepEqual(first.sessions.map(s=>s.day.slice(0,3)),['Tue','Thu','Fri','Sat','Sun']);
 for(const e of first.sessions.flatMap(s=>s.ex||[]).filter(e=>/^(Squat|Deadlift)$/.test(e[0])))assert.ok(e[4]<=5.5);
 assert.equal(first.quality.length,1);assert.ok(hardKm(first)<=first.actual*.2+1e-8);
 assert.equal(event.quality.length,0);assert.deepEqual(event.sessions.filter(s=>s.eventDate).map(s=>s.eventDate),['2026-11-28','2026-11-29']);
});

test('the actual five-and-a-half-kilometre cooldown regression is rejected by the version-3 acceptance contract',()=>{
 const saved={...require('../programmes/november-2026.json')};delete saved.runningGuidanceVersion;
 const legacy=inspect(saved,1).training.find(r=>r.role==='quality-run');
 assert.ok(legacy.steps.find(s=>/cool.down/i.test(s.label)).distanceKm>=5,'Archived v1 reproduces the reported defect instead of only testing a manufactured bad example');
 const corrected=inspect({...saved,runningGuidanceVersion:3},1).training.find(r=>r.role==='quality-run');
 const cooldown=corrected.steps.find(s=>/cool.down/i.test(s.label));
 assert.ok(cooldown.distanceKm*maxPace(cooldown.pace)/60<=15,'Actual first run must pass the duration guard');
 assert.ok(cooldown.distanceKm<=corrected.distanceKm*.25,'Cooldown cannot dominate the session');
});

test('positive acceptance bots remain usable rather than passing by blocking every athlete',()=>{
 for(const km of [20,30,40]){
  const c=athlete({km,runs:3,goal:'10k'}),row=inspect(c);
  assert.equal(row.plan.feasible,true);assert.equal(row.quality.length,1);assert.ok(row.actual>0);
 }
});
test('malformed profiles and dates cannot silently produce an approved running plan',()=>{
 const c=athlete();for(const distance of [undefined,0,NaN,Infinity,-5])assert.equal(createProfileEngine(c).engine.runningPaces({...c,runProfile:{...c.runProfile,distance}}),null);
 for(const change of [{runs:2.5},{runGoal:'ultra'},{startDate:'2026-02-30'},{runningTargetDate:'2026-11-20',startDate:null},{runningTargetDate:'2026-10-20'},{runProfile:{...c.runProfile,weeklyKm:Infinity}}]){
  const candidate={...c,...change},row=inspect(candidate);assert.equal(row.plan.feasible,false,JSON.stringify(change));
 }
 const uppercase=inspect(athlete({goal:'10K',runningTargetDate:'2027-01-17'}),12);assert.equal(uppercase.race[0].distanceKm,10);
});
test('marathon bots have no long run the day before racing and require review before post-event training',()=>{
 const c=athlete({goal:'marathon',km:45,weeks:4,runningTargetDate:'2026-11-01',availableDays:['Tue','Thu','Sat'],days:3});
 const race=inspect(c,1);assert.equal(race.quality.length,0);assert.ok(!race.sessions.some(s=>s.day.slice(0,3)==='Sat'&&(s.runs||[]).length));
 const after=inspect(c,2);assert.equal(after.quality.length,0);assert.equal(after.engine.runningAssessment(c,2).feasible,false);assert.match(after.engine.runningAssessment(c,2).blocking.join(' '),/Post-race/);
 const summary=race.engine.describeWeek(c,1).runningSummary;assert.equal(summary.raceKm,42.195);assert.ok(Math.abs(summary.totalKm-summary.trainingKm-summary.raceKm)<1e-8);
});
test('partial and midweek-race calendars cannot hide pre-start workouts or post-marathon running',()=>{
 const c=athlete({startDate:'2026-10-29',km:20,runs:3,availableDays:['Mon','Tue','Fri'],days:3});const row=inspect(c);
 assert.ok(row.sessions.every(s=>s.day.slice(0,3)==='Fri'));assert.ok(hardKm(row)<=row.actual*.2+1e-8);
 const midweek=inspect(athlete({goal:'marathon',km:45,runs:3,availableDays:['Tue','Thu','Sat'],days:3,runningTargetDate:'2026-10-28'}));
 assert.ok(!midweek.sessions.some(s=>['Thu','Sat'].includes(s.day.slice(0,3))&&(s.runs||[]).length));
});


test('version 4: undated low-mileage two-run marathon is explicit progressive base building, not race preparation',()=>{
 const c=athlete({goal:'marathon',km:15,runs:2,weeks:8,runningGuidanceVersion:4,hybridFocus:'running'});
 const rows=Array.from({length:8},(_,i)=>inspect(c,i+1));
 assert.equal(rows[0].plan.feasible,true);
 for(const r of rows){assert.equal(r.budget.preparationMode,'base-building');assert.equal(r.budget.taper,false);assert.equal(r.race.length,0);assert.equal(r.quality.length,0);assert.equal(r.training.length,2);assert.ok(review(r,/third easy run/));}
 assert.ok(rows[6].actual>=rows[0].actual*1.20,'Uncapped build must deliver meaningful peak progression');
 assert.ok(rows[3].actual<rows[2].actual,'Consolidation reduces workload');
 assert.ok(rows[4].actual>rows[2].actual,'Next block resumes above the prior peak');
 assert.ok(rows[7].actual<rows[6].actual,'End-block consolidation is distinct from race taper');
 const dated={...c,runningTargetDate:'2026-12-20'};
 const checked=inspect(dated);assert.equal(checked.plan.feasible,false);assert.ok(review(checked,/Short marathon preparation/));
});

test('version 4 runner matrix: allocation limits are explicit, budgets conserved, growth bounded, saved policies immutable',()=>{
 for(const km of [0,6,15,24,40,60])for(const goal of ['fitness','5k','10k','half','marathon'])for(const runs of [1,2,3,5]){
  const c=athlete({km,goal,runs,weeks:12,runningGuidanceVersion:4}),before=JSON.stringify(c);let peak=0;
  for(let w=1;w<=12;w++){
   const r=inspect(c,w);assert.ok(r.actual<=r.budget.requestedKm+.15,`${goal}/${km}/${runs}: budget`);
   if(r.budget.progressionLimited)assert.ok(review(r,/volume\/frequency review/));
   assert.ok(r.runs.every(x=>Number.isFinite(x.distanceKm)&&x.distanceKm>0));
   assert.ok(hardKm(r)<=r.actual*.20+.001);
   if(!r.budget.deload){if(peak)assert.ok(r.actual<=peak*1.06+.2);peak=Math.max(peak,r.actual);}
  }
  assert.equal(JSON.stringify(c),before);
 }
 const c=athlete({km:24,goal:'marathon',runs:2,runningGuidanceVersion:4});assert.equal(inspect(c,7).budget.progressionLimited,true);
 const old=athlete({goal:'marathon',km:15,runs:2,runningGuidanceVersion:3});assert.equal(inspect(old).plan.feasible,false,'Saved version 3 rules remain unchanged');
});
