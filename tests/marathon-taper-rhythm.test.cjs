const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const a=require('../src/coach-adapters'),coach=require('../src/coach-engine'),prep=require('../src/running-preparation');
const fixture=require('./fixtures/original-three-engine-inputs.json'),copy=x=>JSON.parse(JSON.stringify(x)),now=()=>Date.parse(fixture.clock);
function input(id){const row=fixture.cases.find(x=>x.id===id),c=copy(row.config),e=coach.createEngine({now});for(const [n,p]of Object.entries(c.liftProfiles))c.baselines[n]=e.estimatedMax(p.kg,p.reps);return c;}
const generate=(c,data={})=>a.buildNewProgramme(c,{data,now});
const runs=w=>w.sessions.flatMap(s=>s.runs||[]).filter(r=>r.role!=='race');
const km=w=>runs(w).reduce((n,r)=>n+r.distanceKm,0);
const rhythm=w=>runs(w).find(r=>r.workoutFamily==='taper-race-rhythm');
const work=r=>r.steps.filter(s=>s.role==='work');
function legacy(c){const saved=coach.prepareNewProgramme(c,{now});delete saved.marathonTaperRhythmVersion;delete saved.marathonTaperRhythmRecovery;return a.buildProgramme(saved,{now});}
test('original runner and hybrid retain weekly distance and strength, replacing easy metres with bounded current-fitness rhythm',()=>{
 for(const id of ['O1','O2']){
  const c=input(id),snapshot=JSON.stringify(c),p=generate(c),old=legacy(c),first=id==='O1'?24:15;
  assert.equal(JSON.stringify(c),snapshot);assert.deepEqual(generate(c),p);
  for(let n=first;n<=c.weeks;n++){
   const w=p.weeks[n-1],b=old.weeks[n-1],r=rhythm(w);assert.ok(r,`${id} W${n}`);assert.equal(work(r).length,2);
   assert.ok(Math.abs(km(w)-km(b))<.001);assert.deepEqual(w.sessions.map(s=>s.ex),b.sessions.map(s=>s.ex));
   const distance=work(r).reduce((n,s)=>n+s.distanceKm,0);assert.ok(distance<=[4,3,1.5][n-first]);
   assert.ok(distance<=km(w)*.08+.001);assert.equal(r.recoveryReviewRequired,true);assert.equal(r.rpe,5);
   assert.ok(r.steps.some(s=>s.role==='recovery'));assert.ok(r.steps.some(s=>s.label==='Warm-up'));assert.ok(r.steps.some(s=>s.label==='Cool-down'));
   assert.ok(work(r).every(s=>Math.abs(s.paceSeconds-c.runProfile.seconds/c.runProfile.distance)<.001));
   assert.ok(r.minutes<=runs(b)[0].minutes);assert.equal(p.config.runningHistory.longRun,undefined);
  }
  assert.ok(p.weeks.slice(0,first-1).every((w,i)=>JSON.stringify(w.sessions)===JSON.stringify(old.weeks[i].sessions)));
 }
});
test('aspirational goals cannot accelerate the taper pace or change its dose',()=>{
 const c=input('O2'),p=generate(c),fast=generate({...c,runningGoalSeconds:9000});
 for(let i=14;i<17;i++){assert.deepEqual(rhythm(p.weeks[i]).steps,rhythm(fast.weeks[i]).steps);assert.equal(rhythm(fast.weeks[i]).paceBasis.goalSupported,false);}
});
test('unresolved fatigue, long-run recovery, stale pace and missing familiarity have specific suppression reasons',()=>{
 const c=coach.prepareNewProgramme(input('O2'),{now});
 const cases=[[{recoveryEvidence:{runningFatigue:true}},/fatigue remains unresolved/],
 [{runningHistory:{longRun:{km:20,minutes:120,recoveryHours:72}}},/48 hours/],
 [{runningHistory:{longRun:{km:30,minutes:220}}},/210-minute/],
 [{runProfile:{...c.runProfile,recency:'old'}},/stale or invalid/],
 [{runProfile:{...c.runProfile,seconds:null}},/performance is missing/],
 [{runProfile:{...c.runProfile,distance:10,seconds:2400}},/familiar marathon rhythm/i],
 [{runProfile:{...c.runProfile,resultDate:'2027-01-01'}},/invalid/]];
 for(const [change,reason]of cases){const x={...copy(c),...copy(change)},snapshot=JSON.stringify(x),w=prep.assess(x,15,{now});assert.equal(w.taperRaceRhythm.prescribed,false);assert.ok(w.taperRaceRhythm.reasons.some(r=>reason.test(r)),JSON.stringify(w.taperRaceRhythm));assert.ok(w.warnings.some(s=>s.startsWith('Marathon taper race rhythm suppressed:')));assert.equal(JSON.stringify(x),snapshot);}
});
test('new proposals freeze reported symptoms and repeated recovery concerns without editing logs; one hard day does not block',()=>{
 for(const data of [{checkins:[{date:'2026-10-29',symptoms:'knee pain'}]}, {sessionFeedback:[{date:'2026-10-29',discomfort:'yes'}]}, {checkins:[{date:'2026-10-28',sleep:1},{date:'2026-10-29',energy:1}]}]){
  const snapshot=JSON.stringify(data),p=generate(input('O2'),data);assert.ok(p.weeks.slice(14).every(w=>!rhythm(w)));assert.equal(JSON.stringify(data),snapshot);assert.ok(p.weeks[14].warnings.some(s=>/symptoms|poor recovery/.test(s)));
 }
 assert.ok(rhythm(generate(input('O2'),{checkins:[{date:'2026-10-29',energy:1}]}).weeks[14]));
});
test('post-marathon and strength-event restrictions remain, and calendar projection cannot clear fatigue',()=>{
 const c=coach.prepareNewProgramme(input('O2'),{now});c.startDate='2026-11-02';c.runningTargetDate='2026-11-15';c.weeks=3;
 const w=prep.assess(c,1,{now});assert.equal(w.taperRaceRhythm.prescribed,false);assert.ok(w.taperRaceRhythm.reasons.some(s=>/Post-event/.test(s)));
 const strength={...copy(c),runningHistory:{weeklyKm:[]},strengthTargetDate:'2026-11-07'};
 assert.ok(prep.assess(strength,1,{now}).taperRaceRhythm.reasons.some(s=>/Strength competition/.test(s)));
 const p=generate({...input('O1'),recoveryEvidence:{runningFatigue:true}});assert.ok(p.weeks.slice(23).every(w=>!rhythm(w)));
});
test('health running, historical captures and old saved-policy output remain unchanged; new saved plans freeze recovery evidence',()=>{
 const c=input('O3');assert.deepEqual(generate(c).weeks,legacy(c).weeks);
 for(const id of ['O1','O2','O3']){
  const b=require('../docs/qa/stage-four/original-native/'+id+'.json'),snapshot=JSON.stringify(b);
  assert.deepEqual(copy(a.buildProgramme(b.programme.config,{data:b.historicalData,now})),b.programme);assert.equal(JSON.stringify(b),snapshot);
 }
 const p=generate(input('O2')),saved=copy(p.config),snapshot=JSON.stringify(saved);
 assert.deepEqual(a.buildProgramme(saved,{now}).weeks,a.buildProgramme(saved,{now,data:{checkins:[{date:'2026-10-29',symptoms:'pain'}]}}).weeks);assert.equal(JSON.stringify(saved),snapshot);
});
test('browser globals and Node generate identical taper prescriptions',()=>{
 const sandbox=vm.createContext({Date,console});for(const name of ['running-workouts','running-preparation','coach-constraints','coach-engine','coach-adapters'])vm.runInContext(fs.readFileSync('src/'+name+'.js','utf8'),sandbox);
 const c=input('O2');assert.equal(JSON.stringify(sandbox.LHRFCoachAdapters.buildNewProgramme(c,{now})),JSON.stringify(generate(c)));
});
test('existing shorter-distance pace with established endurance stays eligible, while tiny or absent visits explain suppression',()=>{
 const c=coach.prepareNewProgramme(input('O2'),{now});
 const established={...copy(c),runProfile:{...c.runProfile,distance:10,seconds:2400},runningHistory:{longRun:{km:18,minutes:100}}};
 assert.equal(prep.assess(established,15,{now}).taperRaceRhythm.prescribed,true);
 const tiny={...copy(c),runVisitWindows:[{kind:'quality',minutes:1}]},w=prep.assess(tiny,15,{now});
 assert.equal(w.taperRaceRhythm.prescribed,false);assert.ok(w.taperRaceRhythm.reasons.some(s=>/visit window/.test(s)));
 assert.ok(prep.assess({...c,runs:0},15,{now}).warnings.some(s=>/no running visits/.test(s)));
});
test('explicit fatigue clearance permits rhythm, but future symptom reports cannot become current evidence',()=>{
 const p=generate({...input('O2'),recoveryEvidence:{runningFatigue:true,resolved:true}});assert.ok(rhythm(p.weeks[14]));
 const future=generate(input('O2'),{checkins:[{date:'2027-02-01',symptoms:'pain'}],sessionFeedback:[{date:'2027-02-01',discomfort:'yes'}]});assert.ok(rhythm(future.weeks[14]));
});
