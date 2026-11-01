const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const v=require('../src/coach-constraints'),a=require('../src/coach-adapters'),coach=require('../src/coach-engine'),intake=require('../src/coach-intake');
const clone=x=>JSON.parse(JSON.stringify(x)),now=()=>Date.parse('2026-11-01T08:00:00Z');
const ex=(name,sets=1,reps=1,rpe=9,meta={})=>[name,sets,reps,100,rpe,meta];
const session=()=>({id:'s',day:'Tue',name:'Specific bench',ex:[ex('Bench',1,1,9,{role:'top',category:'primary',competition:true}),ex('Bench',1,2,6,{role:'backoff',category:'primary',topIndex:0}),ex('Row',3,10,7),ex('Curl',2,12,7,{optional:true})],runs:[]});
const config=cap=>({sessionTimeVersion:1,availableDays:['Tue'],visitConstraints:{minutes:{Tue:cap},combinedDays:['Tue']}});
const fixture=id=>require('../docs/qa/stage-six/regressions/'+id+'.json');
function generate(id,patch={}){const r=fixture(id);return a.buildNewProgramme({...clone(r.input),...patch},{data:r.historicalData,now:()=>Date.parse(r.provenance.clock)})}
test('known days with absent, null or flexible time permit programmes without invented caps',()=>{
 for(const preference of [undefined,{mode:'varies'},{mode:'unspecified'},{mode:'typical',minutes:30}]){
  const row=fixture('Taylor'),c=clone(row.input);c.visitConstraints.minutes={};c.sessionDurationPreference=preference;
  const before=JSON.stringify(c),p=a.buildNewProgramme(c,{data:row.historicalData,now});assert.equal(JSON.stringify(c),before);assert.ok(p.weeks.every(w=>w.feasible));
  for(const s of p.weeks.flatMap(w=>w.sessions).filter(s=>!s.eventDate)){assert.equal(s.timeBudget.capMinutes,null);assert.equal(s.timeBudget.estimated,true);assert.ok(s.timeBudget.baselineRangeMinutes.max>s.timeBudget.baselineRangeMinutes.min)}
 }
 const r=fixture('Taylor'),c=clone(r.input);delete c.visitConstraints;const noWindows=a.buildNewProgramme(c,{now});assert.ok(noWindows.weeks.slice(0,-1).every(w=>w.feasible));assert.match(noWindows.weeks.at(-1).blockingIssues.join(' '),/event-day availability/);
});
test('heavy competition session includes general preparation, ramps, work, rest and changes rather than fourteen minutes',()=>{
 const s=session(),t=v.estimateSession(s);assert.ok(t.essentialRangeMinutes.min>=27);assert.ok(t.essentialRangeMinutes.max>=40);assert.ok(t.totalRangeMinutes.max>t.baselineRangeMinutes.max);assert.equal(t.components.strength.components[1].progressiveWarmupSets,6);
 const speed=v.estimateSession({ex:[ex('Bench',5,2,5.5,{category:'primary',trainingRole:'speed'})]});assert.ok(speed.baselineRangeMinutes.max<t.essentialRangeMinutes.max);assert.ok(speed.baselineRangeMinutes.min>=15);
});
test('hard limits remove optional and supporting work before honestly flagging protected essential work',()=>{
 const s=session(),original=clone(s),needed=v.estimateSession(s).essentialRangeMinutes.max;
 const f=v.fitSessions(config(needed),[s]);assert.ok(f.feasible);assert.deepEqual(f.sessions[0].ex.map(e=>e[0]),['Bench','Bench']);assert.deepEqual(f.sessions[0].ex.map(e=>e[1]),[1,1]);assert.equal(f.sessions[0].ex[1][5].topIndex,0);assert.deepEqual(s,original);
 const short=v.fitSessions(config(15),[s]);assert.equal(short.feasible,false);assert.deepEqual(short.sessions[0].ex.map(e=>e[1]),[1,1]);assert.match(short.blockingIssues.join(' '),/essential work cannot fit/);assert.equal(short.sessions[0].timeAdaptation.makeUpWorkScheduled,false);
 for(const minutes of [-1,0,'60'])assert.equal(v.fitSessions(config(minutes),[s]).feasible,false);
});
test('priority follows session purpose and protects meaningful backoffs and nonstandard essential exercises',()=>{
 const s={day:'Tue',ex:[ex('Row',3,8,7,{priority:'essential',priorityReason:'Primary pulling stimulus'}),ex('Bench',2,8,6,{priority:'supporting'}),ex('Row',2,12,6,{priority:'optional'})],runs:[]};
 const c=v.classifySession(s);assert.deepEqual(c.ex.map(e=>e[5].priority),['essential','supporting','optional']);assert.deepEqual(c.ex.map(e=>e[5].adherenceRequired),[true,true,false]);const f=v.fitSessions(config(v.estimateSession({ex:[s.ex[0]]}).baselineRangeMinutes.max),[s]);assert.ok(f.feasible);assert.deepEqual(f.sessions[0].ex.map(e=>e[0]),['Row']);
});
test('mixed estimates include running steps once, transitions and preparation; unknown run dose remains a legitimate blocker',()=>{
 const r={name:'Intervals',role:'quality-run',distanceKm:5,minutes:35,durationRangeMinutes:{min:30,max:35},steps:[{role:'easy',distanceKm:1},{role:'work',distanceKm:3},{role:'recovery',distanceKm:1}]};
 const s={...session(),runs:[r]},t=v.estimateSession(s);assert.deepEqual(t.components.runRangeMinutes,{min:33,max:40});assert.deepEqual(t.components.transitionRangeMinutes,{min:4,max:7});
 const f=v.fitSessions(config(20),[s]);assert.equal(f.feasible,false);assert.deepEqual(f.sessions[0].runs[0].steps,r.steps);assert.equal(f.sessions[0].runs[0].distanceKm,5);
 assert.equal(v.fitSessions(config(null),[{day:'Tue',runs:[{minutes:null}],ex:[]}]).feasible,false);
});
test('separate visits check independent limits and real recovery permission without inventing minutes',()=>{
 const s={...session(),runs:[{name:'Easy',minutes:30}]},c=config(null);Object.assign(c.visitConstraints,{separateDays:['Tue'],combinedDays:[],minimumGapHours:6});
 let f=v.fitSessions(c,[s]);assert.ok(f.feasible);assert.equal(f.sessions[0].timeBudget.visits.length,2);assert.ok(f.sessions[0].timeBudget.visits.every(v=>v.capMinutes===null));
 c.visitConstraints.separateMinutes={Tue:15};assert.equal(v.fitSessions(c,[s]).feasible,false);c.visitConstraints.minimumGapHours=2;assert.equal(v.fitSessions(c,[s]).feasible,false);
});
test('optional skipped work adds no planned stress or adherence deficit, but completed optional sets count as actual stress',()=>{
 const s=session(),base={...s,ex:s.ex.filter(e=>!e[5]?.optional)};assert.deepEqual(v.plannedStress(s),v.plannedStress(base));
 const skip=v.completedStress({sets:[{exercise:'Bench',reps:1,rpe:9},{exercise:'Curl',optional:true,skipped:true,reps:12,rpe:8}]}),done=v.completedStress({sets:[{exercise:'Bench',reps:1,rpe:9},{exercise:'Curl',optional:true,reps:12,rpe:8}]});assert.equal(skip.strengthSets,1);assert.equal(done.strengthSets,2);assert.ok(done.strengthEffortUnits>skip.strengthEffortUnits);
 // Existing recovery guard also includes genuinely completed optional lower work.
 const data={sets:Array.from({length:8},(_,i)=>({exercise:'Squat',optional:true,reps:5,weight:100,rpe:9,date:'2026-10-'+(29+i%2)})),runs:[],checkins:[],sessionFeedback:[],decisions:[]};const e=coach.createEngine({data,now});assert.ok(e.hybridAthleteBaseline().current.lower>0);
});
test('unexpected shortening is a pure approval-required proposal with original dose, recovery flags and no make-up work',()=>{
 const s=session();s.recoveryReviewRequired=true;const c=config(null),before=JSON.stringify({c,s});const f=v.adaptSessionToTime(c,s,45);assert.ok(f.feasible);assert.equal(f.applied,false);assert.equal(f.requiresAthleteApproval,true);assert.equal(f.makeUpWorkScheduled,false);assert.deepEqual(f.originalPrescription,s);assert.equal(f.sessions[0].recoveryReviewRequired,true);assert.equal(JSON.stringify({c,s}),before);
 const history=v.reviewTimeHistory([{reason:'unexpected-time-limit',date:'a'},{reason:'unexpected-time-limit',date:'a'},{reason:'unexpected-time-limit',date:'b'},{reason:'unexpected-time-limit',date:'c'}]);assert.equal(history.distinctModifiedDays,3);assert.ok(history.requiresAthleteApproval);assert.deepEqual(history.appliedChanges,[]);
});
test('simple intake allows omitted preference and minutes on the new route, retains explicitly supplied caps and validates malformed values',()=>{
 const c=clone(fixture('Taylor').input),r={sessionTimeVersion:1,strengthVisits:2,minutes:{Tue:120},eventDays:c.visitConstraints.eventDays};const p=intake.build(c,r);assert.equal(p.visitConstraints.minutes.Tue,120);assert.equal(p.visitConstraints.minutes.Sat,null);assert.ok(coach.prepareNewProgramme(p).sessionTimeVersion===1);assert.throws(()=>intake.build(c,{...r,minutes:{Tue:'unknown'}}));assert.throws(()=>coach.prepareNewProgramme({...c,sessionDurationPreference:{mode:'typical',minutes:-1}}));
});
test('all nine saved policies reproduce exactly; new Taylor fits, and hard-window/fatigue/partial-recovery/unknown-pace gates survive',()=>{
 for(const id of ['O1','O2','O3','P','Q','R','S','T','Taylor']){const r=fixture(id);assert.equal(JSON.stringify(a.buildProgramme(r.programme.config,{data:r.historicalData,now:()=>Date.parse(r.provenance.clock)})),JSON.stringify(r.programme));}
 const t=generate('Taylor');assert.ok(t.weeks.every(w=>w.feasible));assert.deepEqual(t.weeks[0].sessions.filter(s=>s.ex.length).map(s=>s.day),['Tue','Sat']);assert.ok(t.weeks.flatMap(w=>w.sessions).filter(s=>!s.eventDate).every(s=>s.timeBudget.baselineRangeMinutes.max<=s.timeBudget.capMinutes));
 const sofia=generate('R');assert.ok(sofia.weeks.every(w=>!w.feasible));const keiko=generate('T');assert.match(keiko.weeks.at(-1).blockingIssues.join(' '),/hard event window of 240/);
 const idris=generate('S');for(const w of idris.weeks)for(const s of w.sessions)for(const e of s.ex)if(e[5]?.recoveryEventDate)assert.ok(e[4]<=6);
 const original=generate('O1');assert.ok(original.weeks.some(w=>!w.feasible),'New full estimates must expose real short mixed-visit conflicts, not reuse false old feasibility');
});
test('native browser-global flexible generation and duration estimates equal Node',()=>{
 const box=vm.createContext({Date,console});for(const name of ['running-workouts','running-preparation','coach-constraints','coach-engine','coach-adapters'])vm.runInContext(fs.readFileSync('src/'+name+'.js','utf8'),box);
 const r=fixture('Taylor'),c=clone(r.input);c.visitConstraints.minutes={};const options={data:r.historicalData,now};assert.equal(JSON.stringify(box.LHRFCoachAdapters.buildNewProgramme(c,options)),JSON.stringify(a.buildNewProgramme(c,options)));assert.equal(JSON.stringify(box.LHRFCoachConstraints.estimateSession(session())),JSON.stringify(v.estimateSession(session())));
});
test('latest policy preserves all nine calendars, main-lift loads/reps/effort/roles and recovery dates while exposing time conflicts',()=>{
 for(const id of ['O1','O2','O3','P','Q','R','S','T','Taylor']){
  const old=fixture(id).programme,p=generate(id),main=s=>s.ex.filter(e=>e[5]?.category==='primary').map(e=>[e[0],e[2],e[3],e[4],e[5].trainingRole,e[5].recoveryEventDate]);
  assert.deepEqual(p.weeks.map(w=>w.sessions.map(s=>[s.day,s.eventDate,main(s)])),old.weeks.map(w=>w.sessions.map(s=>[s.day,s.eventDate,main(s)])),id+' retains scheduling, intensity, specificity and actual-date recovery');
 }
 const k=generate('T');assert.ok(k.weeks[0].sessions.flatMap(s=>s.ex).filter(e=>e[0]==='Squat'||e[0]==='Deadlift').every(e=>e[4]<=6.5));
});

test('rechecking a time conflict clears only obsolete time flags and does not cut support in a different separate visit',()=>{
 const short=v.fitSessions(config(10),[session()]);assert.equal(short.feasible,false);const larger=v.fitSessions(config(120),short.sessions);assert.equal(larger.feasible,true);assert.equal(larger.sessions[0].timeBudget.feasible,true);
 const c=config(10);Object.assign(c.visitConstraints,{separateDays:['Tue'],combinedDays:[],minimumGapHours:6,separateMinutes:{Tue:120}});const s={...session(),runs:[{minutes:30,role:'easy-run'}]},r=v.fitSessions(c,[s]);assert.equal(r.feasible,false);assert.ok(r.sessions[0].ex.some(e=>e[0]==='Row'),'A short independent run window must not remove unrelated fitting strength support');assert.equal(r.sessions[0].runs[0].minutes,30);
});
