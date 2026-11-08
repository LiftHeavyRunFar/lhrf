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
test('runtime dated app discomfort uses saved task scope and cannot be cleared by older normal context',()=>{
 const rows=[record('Squat',100,3,8,'top','2026-11-05T12:00:00Z')],data=state(rows);data.completedWorkouts=[{id:'lower::strength',parentId:'lower',week:1,date:'2026-11-05T12:00:00Z',prescription:{ex:[['Squat',1,3,100,8,{role:'top',category:'primary'}]],runs:[]}}];data.sessionFeedback=[{date:'2026-11-06T12:00:00Z',sessionId:'lower::strength',week:1,discomfort:'yes',difficulty:'expected',energy:'good'}];
 const c={recoveryContext:{status:'normal',reportedAt:'2026-11-03'}},before=JSON.stringify(data);c.coachingEvidence=evidence.capture(c,{data,now});
 const squat=evidence.recovery(c,{atDate:'2026-11-09',now,sport:'strength',task:'heavy',lift:'Squat'}),bench=evidence.recovery(c,{atDate:'2026-11-09',now,sport:'strength',task:'heavy',lift:'Bench'});
 assert.equal(squat.canProgress,false);assert.equal(squat.restriction,'bounded');assert.equal(bench.restriction,'none');assert.ok(squat.evidence.some(o=>o.source.includes('session feedback')&&o.lifts.includes('Squat')));assert.equal(JSON.stringify(data),before);
 const safety=clone(data);safety.sessionFeedback[0].pain=true;const laterEvent={runningTargetDate:'2026-11-22',runGoal:'marathon'};laterEvent.coachingEvidence=evidence.capture(laterEvent,{data:safety,now});assert.equal(evidence.recovery(laterEvent,{atDate:'2026-11-30',now,sport:'strength',task:'heavy',lift:'Squat'}).restriction,'hold','A future event cannot erase an already reported unresolved concern');
 const negated=state(rows);negated.checkins=[{date:'2026-11-06',symptoms:'No pain or discomfort',notes:'A hard but completed training day'}];const clear={coachingEvidence:evidence.capture({}, {data:negated,now})};assert.equal(evidence.recovery(clear,{atDate:'2026-11-09',now,sport:'strength',task:'heavy',lift:'Squat'}).restriction,'none');
 const morning=()=>Date.parse('2026-11-07T08:00:00Z'),current=state(rows);current.checkins=[{date:'2026-11-07',pain:true}];const today={coachingEvidence:evidence.capture({}, {data:current,now:morning})};assert.equal(evidence.recovery(today,{atDate:'2026-11-09',now:morning,sport:'strength',task:'heavy',lift:'Squat'}).restriction,'hold','A date-only morning check-in is not a future noon observation');
});
test('runtime explicit speed or technique intent survives unknown and novice experience without borrowing heavy kilograms',()=>{
 for(const trainingAge of [undefined,'beginner'])for(const purpose of ['speed','technique']){
  const athlete=makeAthletes()[0];athlete.config.trainingAge=trainingAge;athlete.config.strengthExposureRoles.Bench=['heavy','volume',purpose];
  const programme=adapters.buildNewProgramme(athlete.config,{data:state([]),now}),practice=programme.weeks[0].sessions.flatMap(s=>s.ex).find(ex=>ex[0]==='Bench'&&ex[5]?.trainingRole===purpose);
  assert.ok(practice,purpose+' / '+trainingAge);assert.equal(practice[2],2);assert.ok(practice[1]<=2);assert.ok(practice[4]<=5.5);assert.equal(practice[3],0);assert.equal(practice[5].loadUnconfirmed,true);assert.match(practice[5].rationale,/purpose|requested|experience/i);
  assert.ok(!programme.weeks[0].sessions.flatMap(s=>s.ex).some(ex=>ex[0]==='Bench'&&ex[2]===1));
 }
});
test('runtime a current coarse normal intake does not erase an earlier valid task-specific next-day response',()=>{
 const data=state([]);data.runs=[{date:'2026-11-05T12:00:00Z',km:4,min:30,rpe:3,type:'easy-run'}];const config={runningHistory:{recentMarathonDate:'2026-11-01'},recoveryContext:{status:'normal',reportedAt:'2026-11-07'},recoveryObservations:[{sport:'running',task:'easy',observedAt:'2026-11-06T12:00:00Z',status:'normal',nextDayResponse:'normal',referencePerformanceDate:'2026-11-05',eventDate:'2026-11-01'}]};
 config.coachingEvidence=evidence.capture(config,{data,now});const supported=evidence.recovery(config,{sport:'running',task:'easy',atDate:'2026-11-09',now});assert.equal(supported.status,'normal');assert.equal(supported.observedAt,'2026-11-06T12:00:00Z');
 config.recoveryObservations.push({sport:'running',task:'easy',observedAt:'2026-11-07T09:00:00Z',status:'worsening'});config.coachingEvidence=evidence.capture(config,{data,now});assert.equal(evidence.recovery(config,{sport:'running',task:'easy',atDate:'2026-11-09',now}).restriction,'hold');
});
test('runtime withholding an unsupported single retains Taylor final demanding rep practice and lighter event-week work',()=>{
 const fixture=require('./fixtures/five-scenario-round-three-inputs.json'),athlete=fixture.cases.find(row=>row.id==='O'),clock=()=>Date.parse(fixture.clock),before=JSON.stringify(athlete),p=adapters.buildNewProgramme(athlete.config,{data:athlete.historicalData,now:clock}),calendar=coach.createEngine({now:clock}).generalStrengthCalendar(p.config);
 const squat=calendar.lifts.Squat;assert.equal(squat.peakEvidence.singleSupported,false);assert.equal(squat.finalPracticeKind,'rep-practice');assert.equal(squat.finalHeavyDate,'2027-02-09');assert.equal(squat.finalLightDate,'2027-02-16');
 const dose=week=>p.weeks[week-1].sessions.flatMap(s=>s.ex).filter(ex=>ex[0]==='Squat');assert.ok(dose(15).some(ex=>ex[2]===2&&ex[4]===8));assert.ok(dose(16).length);assert.ok(dose(16).every(ex=>ex[4]<=5.5));
 assert.ok(dose(16).reduce((n,ex)=>n+ex[1]*ex[2],0)<=dose(15).reduce((n,ex)=>n+ex[1]*ex[2],0));assert.ok(!p.weeks.flatMap(w=>w.sessions.flatMap(s=>s.ex)).some(ex=>ex[0]==='Squat'&&ex[2]===1));assert.equal(JSON.stringify(athlete),before);
});
test('runtime a final demanding rep slot in taper week cannot gain repetitions just because singles were withheld',()=>{
 const athlete=makeAthletes()[0];Object.assign(athlete.config,{weeks:5,event:'bench',bench:1,squat:0,deadlift:0,runs:0,days:1,availableDays:['Tue'],doubleDays:[],strengthTargetDate:'2026-12-12',runningTargetDate:'',strengthExposureRoles:undefined,visitConstraints:{strengthVisits:1,minutes:{Tue:120},combinedDays:[],separateDays:[],eventDays:{'2026-12-12':{confirmed:true}}}});athlete.data.sets=athlete.data.sets.filter(row=>row.exercise!=='Bench'||row.reps!==1);
 const p=adapters.buildNewProgramme(athlete.config,{data:athlete.data,now}),calendar=coach.createEngine({now}).generalStrengthCalendar(p.config).lifts.Bench,dose=week=>p.weeks[week-1].sessions.flatMap(s=>s.ex).filter(ex=>ex[0]==='Bench');
 assert.equal(calendar.peakEvidence.singleSupported,false);assert.equal(calendar.finalHeavyDate,'2026-12-08');assert.ok(dose(5).length);assert.ok(dose(5).every(ex=>ex[2]===2));assert.ok(dose(5).reduce((n,ex)=>n+ex[1]*ex[2],0)<=dose(4).reduce((n,ex)=>n+ex[1]*ex[2],0));assert.ok(dose(5).every(ex=>ex[4]<=8));assert.ok(!p.weeks.flatMap(w=>w.sessions.flatMap(s=>s.ex)).some(ex=>ex[0]==='Bench'&&ex[2]===1));
});
test('runtime a Sunday programme start preserves the full-calendar explicit speed purpose when earlier slots are omitted',()=>{
 for(const [index,age]of [[0,'advanced'],[1,'beginner'],[0,undefined]]){
  const athlete=makeAthletes()[index],data=age?athlete.data:state([]),config={...athlete.config,trainingAge:age,startDate:'2026-11-02',weeks:4,event:'bench',priority:'Bench',bench:3,squat:0,deadlift:0,runs:0,days:3,availableDays:['Tue','Fri','Sun'],doubleDays:[],manualSplit:{Tue:['bench'],Fri:['bench'],Sun:['bench']},strengthTargetDate:'2026-11-28',runningTargetDate:'',strengthExposureRoles:{Bench:['volume','heavy','speed']},visitConstraints:{strengthVisits:3,minutes:{Tue:120,Fri:120,Sun:120},combinedDays:[],separateDays:[],eventDays:{'2026-11-28':{confirmed:true}}}},before=JSON.stringify({config,data});
  const full=adapters.buildNewProgramme(config,{data,now}),partial=adapters.buildNewProgramme({...config,startDate:'2026-11-08'},{data,now}),sunday=p=>p.weeks[0].sessions.filter(s=>s.day==='Sun').flatMap(s=>s.ex).filter(ex=>ex[0]==='Bench');
  assert.ok(sunday(full).length);assert.ok(sunday(partial).length);assert.ok(partial.weeks[0].sessions.every(s=>s.day==='Sun'));assert.ok(sunday(partial).every(ex=>ex[5].trainingRole==='speed'&&ex[2]===2&&ex[4]<=5.5));assert.deepEqual(sunday(partial).map(ex=>ex.slice(0,5)),sunday(full).map(ex=>ex.slice(0,5)),String(age));
  if(!age)assert.ok(sunday(partial).every(ex=>ex[3]===0&&ex[5].loadUnconfirmed));assert.equal(JSON.stringify({config,data}),before);
 }
});
