const test=require('node:test'),assert=require('node:assert/strict');
const preparation=require('../src/running-preparation.js');
const fixtures=require('./fixtures/five-scenario-round-three-inputs.json');
const clone=x=>JSON.parse(JSON.stringify(x));
const options={now:Date.parse(fixtures.clock)};
const athlete=id=>({...clone(fixtures.cases.find(x=>x.id===id).config),coachingRefinementVersion:1});
const workKm=w=>w.runs.flatMap(r=>r.steps||[]).filter(s=>s.role==='work').reduce((n,s)=>n+s.distanceKm,0);

test('equivalent dated marathon facts trigger the same bounded recovery response without duplicate input',()=>{
 const c=athlete('K'),before=JSON.stringify(c);
 const inferred=preparation.assess(c,1,options),explicit=preparation.assess({...c,runningHistory:{...c.runningHistory,recentMarathonDate:c.runProfile.resultDate}},1,options);
 assert.equal(inferred.phase,'Recovery');assert.deepEqual(inferred.runs,explicit.runs);assert.deepEqual(inferred.reviewGates,explicit.reviewGates);
 assert.equal(inferred.recoveryContext.recentMarathonDate,'2026-10-18');assert.equal(inferred.reviewGates.recoveryCheckRequired,true);
 assert.ok(inferred.requestedKm<c.runProfile.weeklyKm);assert.equal(workKm(inferred),0);assert.equal(JSON.stringify(c),before);
});
test('dated athlete recovery can resolve a completed marathon but no undated or pre-event report can',()=>{
 const c=athlete('K');
 const recovered=preparation.assess({...c,recoveryContext:{status:'normal',reportedAt:'2026-10-30'}},1,options);
 assert.equal(recovered.recoveryContext.marathonRecoveryResolved,true);assert.ok(recovered.requestedKm>=75);assert.ok(workKm(recovered)>0);
 for(const context of [{status:'normal'},{status:'normal',reportedAt:'2026-10-17'},{status:'normal',reportedAt:'2026-11-01'},{status:'lower',reportedAt:'2026-10-30'}]){
  const result=preparation.assess({...c,recoveryContext:context},1,options);assert.equal(result.recoveryContext.marathonRecoveryResolved,false);assert.equal(result.phase,'Recovery');
 }
 const scoped=preparation.assess({...c,runningHistory:{...c.runningHistory,marathonRecovery:{resolved:true,reportedAt:'2026-10-30'}}},1,options);assert.equal(scoped.recoveryContext.marathonRecoveryResolved,true);
 const future=preparation.recoveryContext({...c,runningHistory:{...c.runningHistory,recentMarathonDate:'2027-01-17'},recoveryContext:{status:'normal',reportedAt:'2026-10-30'}},12,{...options,atDate:'2027-01-18'});assert.equal(future.marathonRecoveryResolved,false);
});
test('extended long-run recovery remains explicit, limits extension and does not disappear in later weeks',()=>{
 const c=athlete('K'),normal=preparation.assess(c,7,options),slow=clone(c);slow.runningHistory.longRun.recoveryHours=96;const before=JSON.stringify(slow);
 for(const week of [7,10]){
  const result=preparation.assess(slow,week,options);assert.equal(result.reviewGates.longRunRecoveryReview,true);assert.equal(result.reviewGates.recoveryCheckRequired,true);assert.ok(result.warnings.some(x=>x.includes('96 hours')));assert.ok(result.longKm<=28);assert.equal(workKm(result),0);
 }
 assert.ok(normal.longKm>28);assert.equal(JSON.stringify(slow),before);
});
test('observed long-run duration changes the time-bounded rehearsal and remains available for review',()=>{
 const c=athlete('K'),normal=preparation.assess(c,7,options),slow=clone(c);slow.runningHistory.longRun.minutes=225;
 const result=preparation.assess(slow,7,options);assert.ok(result.longKm<normal.longKm);assert.equal(result.reviewGates.longRunDurationReview,true);assert.equal(result.recoveryContext.observations.longRunMinutes,225);assert.ok(result.warnings.some(x=>x.includes('225 minutes')));assert.equal(workKm(result),0);
});
test('recovered established marathon taper retains small current-fitness reminders instead of full quality sessions',()=>{
 const c=athlete('K'),weeks=[12,13,14].map(w=>preparation.assess(c,w,options));
 for(let i=0;i<weeks.length;i++){
  const w=weeks[i],reminder=w.runs.find(r=>r.workoutFamily==='taper-race-rhythm');assert.ok(reminder);assert.ok(workKm(w)>0&&workKm(w)<=[4,3,1.5][i]);
  assert.ok(w.allocatedKm<=preparation.assess(c,11,options).allocatedKm*.75+.05);assert.ok(workKm(w)<=w.allocatedKm*.20);assert.equal(w.phase,'Taper / event');
  const currentPace=preparation.paceSet(c).tenK*Math.pow(42.195/10,1.06)/42.195;
  assert.equal(reminder.paceBasis.goalPaceSeconds,c.runningGoalSeconds/42.195);assert.equal(reminder.paceBasis.goalSupported,false);
  for(const s of reminder.steps.filter(s=>s.role==='work'))assert.equal(s.paceSeconds,currentPace);
  assert.ok(Math.abs(reminder.steps.reduce((n,s)=>n+s.distanceKm,0)-reminder.distanceKm)<.001);
 }
 assert.ok(workKm(weeks[2])<workKm(weeks[0]));
});
test('taper reminders cannot bypass blocked preparation, unresolved fatigue, recent recovery or visit limits',()=>{
 const blocked=preparation.assess(athlete('L'),7,options);assert.equal(blocked.feasible,false);assert.equal(workKm(blocked),0);
 const c=athlete('K'),fatigue={status:'fatigue',affectedLifts:['Squat'],runningFatigue:true};assert.equal(workKm(preparation.assess({...c,recoveryEvidence:fatigue},12,options)),0);
 const recent={...c,runningTargetDate:'2026-11-22',runningHistory:{...c.runningHistory,recentMarathonDate:'2026-10-25'}};assert.equal(workKm(preparation.assess(recent,1,options)),0);
 const narrow={...c,runVisitWindows:[{kind:'quality',minutes:10}]};assert.ok(preparation.assess(narrow,12,options).runs.every(r=>r.workoutFamily!=='taper-race-rhythm'||r.minutes<=10));
 const sufficient={...c,runVisitWindows:[{kind:'quality',minutes:40}]},w=preparation.assess(sufficient,12,options),reminder=w.runs.find(r=>r.workoutFamily==='taper-race-rhythm');assert.ok(reminder);assert.ok(reminder.minutes<=40);assert.ok(reminder.steps.some(s=>s.role==='recovery'));
});
test('saved version-two inputs without the explicit refinement marker keep their previous interpretation',()=>{
 const c=clone(fixtures.cases.find(x=>x.id==='K').config),w=preparation.assess(c,1,options),taper=preparation.assess(c,12,options);
 assert.notEqual(w.phase,'Recovery');assert.equal(w.requestedKm,75);assert.equal(w.recoveryContext,undefined);assert.equal(w.reviewGates.longRunRecoveryReview,undefined);assert.equal(workKm(taper),0);
 assert.equal(preparation.history(c).recentMarathonDate,undefined);
});
