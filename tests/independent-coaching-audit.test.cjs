// Investigation characterizations, not endorsements of current coaching policy.
// Assertions of defects must change when the associated defect is corrected.
const test=require('node:test'),assert=require('node:assert/strict');
const coach=require('../src/coach-engine'),adapters=require('../src/coach-adapters');
const {clock,makeAthletes,clone}=require('./fixtures/independent-coaching-inputs.cjs');
const {metrics,replay,recoveryVariants}=require('../scripts/independent-coaching-audit.cjs');
const now=()=>Date.parse(clock),proposal=a=>adapters.buildNewProgramme(a.config,{data:a.data,now});
test('independent audit: three full current-policy blocks are deterministic, feasible and leave fictional source data unchanged',()=>{
 for(const a of makeAthletes()){const source=JSON.stringify(a),p=proposal(a);assert.equal(p.weeks.length,a.config.weeks);assert.ok(p.weeks.every(w=>w.feasible),a.id);assert.deepEqual(proposal(a),p);assert.equal(JSON.stringify(a),source);assert.equal(p.config.sessionTimeVersion,1);assert.equal(p.config.strengthEvidenceVersion,1);assert.equal(p.config.equipmentPolicyVersion,1);assert.ok(p.requiresAthleteApproval);}
});
test('corrected novice review: straight main sets enter monitoring without inventing historical prescription provenance',()=>{
 const a=makeAthletes()[1],p=proposal(a),r=replay(a,p);assert.ok(r.reviews.every(x=>x.reviewSessions>0));assert.ok(r.reviews.every(x=>!x.decision.changes),'This old replay has no preserved historical prescriptions, so extra progression remains unproven.');
 const main=w=>p.weeks[w-1].sessions.flatMap(s=>s.ex).filter(e=>e[5]?.category==='primary').map(e=>e.slice(0,5));assert.deepEqual(main(3),main(11));
 const actualBench=r.finalData.sets.filter(s=>s.exercise==='Bench'&&s.week===7);assert.ok(actualBench.some(s=>s.weight>50));assert.ok(main(11).filter(e=>e[0]==='Bench').every(e=>e[3]>=50&&e[3]<=55),'Familiar completed six-rep work informs the conditional RPE-led build instead of the old37.5kg entry cap.');
 assert.deepEqual(proposal(a),p,'Unapproved simulated outcomes do not rewrite the generated block.');
});
test('characterization: general hybrid default Development main doses do not progress between non-deload weeks',()=>{
 const p=proposal(makeAthletes()[2]);const dose=w=>p.weeks[w-1].sessions.flatMap(s=>s.ex).filter(e=>e[5]?.category==='primary'&&['Bench','Squat','Deadlift'].includes(e[0])).map(e=>[e[0],e[1],e[2],e[4],e[5].trainingRole]);assert.deepEqual(dose(6),dose(7));assert.deepEqual(dose(7),dose(9));assert.deepEqual(dose(9),dose(11));
});
test('corrected recovery: a broad normal report cannot clear running and no unconditional all-lift clip overrides scoped decisions',()=>{
 const p=recoveryVariants().fast.programme;assert.equal(p.weeks[0].runningPhase,'Recovery');const ex=p.weeks[0].sessions.flatMap(s=>s.ex);assert.ok(ex.length);assert.ok(ex.some(e=>e[5]?.category==='primary'&&e[0]==='Bench'&&e[4]>5.5));assert.ok(ex.every(e=>!e[5]?.recentMarathonRecovery));assert.ok(p.weeks.every(w=>w.sessions.flatMap(s=>s.runs).every(r=>!r.steps.some(s=>s.role==='work'))));
});
test('corrected recovery: a persistent lower-body report does not release running quality after21 days',()=>{
 const p=recoveryVariants().slow.programme,w=p.weeks[2];assert.ok(w.sessions.flatMap(s=>s.runs).every(r=>!r.steps.some(s=>s.role==='work')));const lower=w.sessions.flatMap(s=>s.ex).filter(e=>['Squat','Deadlift'].includes(e[0]));assert.ok(lower.some(e=>e[5].recoveryReviewRequired));assert.ok(lower.every(e=>e[4]<=6.5));
});
function temporalReview(dates,extra={}){const schedule=[{id:'bench-upcoming',day:'Sun',ex:[['Bench',1,3,100,8,{role:'top',category:'primary',policy:'general-strength-v2'}]],runs:[]}],data={activeCustomWeek:2,customRoadmap:{coachingRulesVersion:2,coachingPolicy:'review-v2',weeks:12,bench:2,priority:'Bench',trainingAge:'advanced',startDate:'2026-11-02'},activeSchedule:schedule,sets:dates.map((date,i)=>({date,exercise:'Bench',weight:100+i*2.5,reps:3,rpe:7,target:8,role:'top',session:'Bench',...extra})),runs:[],sessionFeedback:[],checkins:[],decisions:[]};const source=JSON.stringify(data),decision=coach.createEngine({data,now}).reviewDecision();assert.equal(JSON.stringify(data),source);return decision}
test('corrected IA02: stale and future top sets cannot support a progression proposal',()=>{
 for(const dates of [['2020-01-01','2020-01-08','2020-01-15'],['2027-01-01','2027-01-08','2027-01-15']]){const decision=temporalReview(dates);assert.notEqual(decision.status,'progress');assert.equal(decision.changes,undefined)}
});
test('corrected IA02: failed, technically failed, warm-up and optional top rows cannot support progression',()=>{for(const flag of ['failed','techniqueFailed','warmup','optional'])assert.notEqual(temporalReview(['2026-10-20','2026-10-27','2026-11-03'],{[flag]:true}).status,'progress',flag)});
test('corrected IA02: two epoch-week bins cannot establish sustained progression from48 hours',()=>{assert.notEqual(temporalReview(['2026-11-04T10:00:00Z','2026-11-05T10:00:00Z','2026-11-06T10:00:00Z']).status,'progress')});
test('corrected IA01: approved run-duration reduction updates executable distance, intervals and duration bounds consistently',()=>{
 const run={name:'Easy aerobic run',role:'easy-run',minutes:60,durationRangeMinutes:{min:55,max:60},distanceKm:10,steps:[{label:'Easy run',role:'easy',distanceKm:10,pace:'5:30 to 6:00/km'}],structure:'10000 m easy run',workMinutes:0},sessions=[{id:'s',ex:[],runs:[clone(run)]}],engine=coach.createEngine({data:{decisions:[{kind:'hybrid-load',approved:true,week:2,intervention:'running-duration',factor:.9,key:'proof'}]},now});const result=engine.applyApprovedHybridRunning(sessions,2)[0].runs[0];assert.equal(result.minutes,54);assert.deepEqual(result.durationRangeMinutes,{min:50,max:54});assert.equal(result.steps[0].distanceKm,9);assert.equal(result.distanceKm,9);assert.deepEqual(result.hybridAdjustment.originalPrescription,run);const once=JSON.stringify(sessions);engine.applyApprovedHybridRunning(sessions,2);assert.equal(JSON.stringify(sessions),once);
});
test('independent audit: aspirational faster10K target does not replace current race-pace basis',()=>{
 const p=proposal(makeAthletes()[1]),q=p.weeks.flatMap(w=>w.sessions).flatMap(s=>s.runs).filter(r=>r.workoutFamily==='race-pace-repeats');assert.ok(q.length);assert.ok(q.every(r=>r.paceBasis.racePaceSeconds===240));assert.equal(p.config.runningGoalSeconds/10,228);
});
test('independent audit: isolated difficult session and repeated fatigue review preserve synthetic active prescriptions and history',()=>{
 for(const a of [makeAthletes()[0],makeAthletes()[2]]){const r=replay(a,proposal(a));assert.ok(r.reviews.every(x=>x.activeScheduleUnchanged&&x.historyUnchangedByReview&&x.approvedChanges===0));if(a.id==='A')assert.equal(r.reviews[1].decision.status,'on-track');else assert.equal(r.reviews[2].decision.status,'fatigue');}
});
