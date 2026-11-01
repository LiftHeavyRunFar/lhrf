// Safety acceptance is distinct from athlete programme feasibility/approval.
const assert=require('node:assert/strict');
const {fitSessions}=require('../src/coach-constraints.js');
const {validateProgramme}=require('../src/programme-replacement.js');
function checkSafety(capture,review,fixture,{frozenFive=false}={}){
 const errors=[];
 const check=(label,fn)=>{try{fn()}catch(e){errors.push(label+': '+e.message)}};
 check('complete capture',()=>assert.deepEqual(capture.cases.map(r=>r.id),fixture.cases.map(r=>r.id)));
 check('complete review',()=>assert.deepEqual(review.cases.map(r=>r.id),fixture.cases.map(r=>r.id)));
 for(const source of fixture.cases)check(source.id,()=>{
  const row=capture.cases.find(r=>r.id===source.id),assessment=review.cases.find(r=>r.id===source.id);
  assert.ok(row&&!row.error&&row.programme,'Replay must generate a programme');
  for(const key of ['sourceInputUnchanged','generationInputUnchanged','historicalInputUnchanged','deterministic','nativeSessionParity','reviewDoesNotMutate'])assert.equal(row.checks?.[key],true,key);
  const p=row.programme;
  assert.equal(p.weeks.length,p.config.weeks,'Complete horizon required');
  assert.deepEqual(row.input.visitConstraints,source.config.visitConstraints,'Source restrictions changed');
  assert.deepEqual(p.config.visitConstraints,source.config.visitConstraints,'Programme restrictions changed');
  assert.deepEqual(p.config.recoveryEvidence,source.config.recoveryEvidence,'Recovery evidence changed');
  const failed=assessment.gates.filter(g=>g.status==='blocked');
  assert.ok(failed.every(g=>['complete-calendar','inclusive-visit-minute-contract'].includes(g.id)),'Unexpected coaching gate failure');
  let timeBlocked=false;
  for(const [i,w]of p.weeks.entries()){
   assert.equal(w.week,i+1);assert.equal((w.unscheduled||[]).length,0,'Unplaced components');
   // Refit actual prescriptions against original restrictions: labels alone are insufficient.
   const fitted=fitSessions(p.config,w.sessions);
   for(const s of fitted.sessions){
    const actual=w.sessions.find(x=>x.id===s.id);
    assert.ok(actual?.timeBudget,'Missing time proof');
    for(const key of ['totalMinutes','capMinutes','visits','includesWarmups','includesRest','includesTransitions'])assert.deepEqual(actual.timeBudget[key],s.timeBudget[key],'Time proof changed: '+key);
    if(s.timeBudget.feasible===false){
     timeBlocked=true;
     assert.equal(actual.timeBudget.feasible,false,'Unsafe session marked feasible');
     assert.equal(w.feasible,false,'Unsafe week marked feasible');
     for(const issue of s.constraintIssues||[]){
      assert.ok(actual.constraintIssues?.some(x=>x.kind===issue.kind&&x.detail===issue.detail&&x.requiresAthleteInput===true),'Missing restriction: '+issue.kind);
      assert.ok(w.blockingIssues?.includes(issue.detail),'Missing week restriction');
     }
    }
   }
  }
  if(timeBlocked)assert.notEqual(assessment.status,'pass','Restricted programme reported passed');
  if(failed.length||timeBlocked){
   assert.ok(timeBlocked,'Blocked audit without a time restriction');
   assert.equal(assessment.status,'blocked','Blocked programme reported approved');
   assert.throws(()=>validateProgramme(p),/unresolved coaching gate/,'Unsafe reviewed package accepted');
  }
  const recovery=source.config.recoveryEvidence;
  if(recovery&&recovery.cleared!==true&&recovery.resolved!==true){
   assert.ok(assessment.inputReviews?.some(x=>x.kind==='recovery-reassessment'&&x.requiresAthleteInput===true),'Missing recovery clearance restriction');
   assert.equal(assessment.gates.find(g=>g.id==='fatigue-evidence-response')?.status,'pass','Missing fatigue response');
  }
 });
 if(frozenFive)check('frozen-five restrictions',()=>{
  assert.equal(review.summary.cases,5);assert.equal(review.summary.blocked,5);assert.equal(review.summary.passed,0);
  assert.equal(review.summary.gates,44);assert.equal(review.summary.blockedGates,10);
  for(const c of review.cases)assert.deepEqual(c.gates.filter(g=>g.status==='blocked').map(g=>g.id),['complete-calendar','inclusive-visit-minute-contract']);
  const b=review.cases.find(c=>c.id==='B');
  for(const kind of ['event-permission','event-time'])assert.ok(b.inputReviews.some(x=>x.kind===kind&&x.requiresAthleteInput===true),'Missing B '+kind);
 });
 return {passed:errors.length===0,errors,athleteApproval:false};
}
module.exports={checkSafety};
