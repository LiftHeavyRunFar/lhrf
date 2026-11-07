const test=require('node:test'),assert=require('node:assert/strict');
const coach=require('../src/coach-engine'),adapters=require('../src/coach-adapters'),evidence=require('../src/coaching-evidence'),registry=require('../src/exercise-registry');
const {makeAthletes,record,clone}=require('./fixtures/independent-coaching-inputs.cjs');
const {fullInventory}=require('./equipment-fixtures.cjs');
const now=()=>Date.parse('2026-11-07T12:00:00Z'),state=sets=>({sets,runs:[],checkins:[],sessionFeedback:[],completedWorkouts:[],decisions:[],overrides:{}});
test('runtime frozen generic accessory and timed bodyweight anchors preserve the actual dose without high-rep maximum estimates',()=>{
 const inventory=fullInventory(),sets=[{...registry.identity('Seated leg curl',inventory),exercise:'Seated leg curl',weight:30,reps:12,rpe:7,role:'accessory',date:'2026-11-05T12:00:00Z'},
 {...registry.identity('Side plank',inventory),exercise:'Side plank',weight:0,reps:30,rpe:7,role:'accessory',date:'2026-11-05T12:00:00Z'}],c={coachingRuntimeVersion:1,equipmentPolicyVersion:1,equipmentInventory:inventory};c.coachingEvidence=evidence.capture(c,{data:state(sets),now});
 const sessions=()=>[{id:'generic',day:'Mon',ex:[['Seated leg curl',2,12,0,7,{role:'accessory',category:'accessory'}],['Side plank',2,30,0,7,{role:'accessory',category:'accessory'}]],runs:[]}];
 const original=JSON.stringify(c),future=state([...sets,{...sets[0],weight:999,date:'2026-11-06T12:00:00Z'}]),out=coach.createEngine({data:future,now}).equipmentFinish(sessions(),c);
 assert.equal(out[0].ex[0][3],30);assert.equal(out[0].ex[0][5].loadAnchor.weight,30);assert.equal(out[0].ex[1][5].loadUnconfirmed,false);assert.equal(out[0].ex[1][5].doseUnit,'seconds');assert.equal(JSON.stringify(c),original);assert.equal(c.coachingEvidence.strength['Seated leg curl'].rows[0].reps,12);
});
test('runtime starting-load provenance names the selected comparable source and familiar back-offs do not increase merely from a transfer formula',()=>{
 const athlete=makeAthletes()[2],rows=clone(athlete.data.sets);rows.push(record('Bench',100,1,8,'top','2026-11-06T12:00:00Z',{execution:'competition-paused',competition:true}));
 const p=adapters.buildNewProgramme(athlete.config,{data:state(rows),now}),main=p.weeks[0].sessions.flatMap(s=>s.ex).filter(e=>e[0]==='Bench'),top=main.find(e=>e[5].role==='top'),back=main.find(e=>e[5].role==='backoff');
 assert.equal(top[5].runtimeLoadEvidence.kg,80);assert.equal(top[5].loadAnchor.weight,80);assert.equal(back[3],72.5);assert.equal(back[5].loadAnchor.weight,72.5);assert.match(back[5].rationale,/does not exceed/);
 const withFuture=adapters.buildProgramme(p.config,{data:state([...rows,record('Bench',300,5,7,'top','2026-11-07T11:00:00Z')]),now});assert.deepEqual(withFuture.weeks,p.weeks);
});
test('runtime light post-marathon novice evidence does not silently become more repetitions, sets and effort',()=>{
 const athlete=makeAthletes()[1];athlete.config.runningHistory.recentMarathonDate='2026-11-01';athlete.config.recoveryObservations=[{observedAt:'2026-11-06T12:00:00Z',sport:'strength',task:'lifting',lift:'Squat',status:'normal',nextDayResponse:'normal',eventDate:'2026-11-01'}];
 athlete.data.sets.push(record('Squat',40,3,5,'straight','2026-11-05T12:00:00Z',{set:1}));
 const p=adapters.buildNewProgramme(athlete.config,{data:athlete.data,now}),squat=p.weeks.flatMap(w=>w.sessions.flatMap(s=>s.ex)).filter(e=>e[0]==='Squat');
 assert.ok(squat.length);for(const ex of squat){assert.ok(ex[1]<=1);assert.equal(ex[2],3);assert.ok(ex[3]<=40);assert.ok(ex[4]<=5);assert.equal(ex[5].recoveryState.canProgress,false);}
});
test('runtime benign normal context cannot suppress upper work more than missing context after initial systemic rest',()=>{
 const athlete=makeAthletes()[2];athlete.config.runningHistory.recentMarathonDate='2026-11-01';const unknown=adapters.buildNewProgramme(athlete.config,{data:athlete.data,now});
 const normal=adapters.buildNewProgramme({...athlete.config,recoveryContext:{status:'normal',reportedAt:'2026-11-06'}},{data:athlete.data,now});
 const doses=p=>p.weeks[0].sessions.flatMap(s=>s.ex).filter(e=>e[0]==='Bench').map(e=>e.slice(0,5));assert.deepEqual(doses(normal),doses(unknown));
});
test('runtime has no unvetted legacy candidate fallback and race pace cannot come from a future result',()=>{
 const a=makeAthletes()[0],p=adapters.buildNewProgramme(a.config,{data:a.data,now}),e=coach.createEngine({data:{...a.data,customRoadmap:p.config,activeSchedule:[]},now});assert.equal(e.coachCandidate(),null);
 const future=clone(a.config);future.runProfile.resultDate='2027-01-01';const programme=adapters.buildNewProgramme(future,{data:a.data,now}),event=programme.weeks.flatMap(w=>w.sessions).find(s=>s.eventType==='running');assert.ok(event);assert.equal(event.runs[0].minutes,null);assert.match(event.runs[0].pace,/Confirm/);assert.equal(event.runs[0].raceStrategy,undefined);
});
