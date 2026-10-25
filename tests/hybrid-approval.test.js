/* Regression checks for conservative hybrid coordination. Run: node tests/hybrid-approval.test.js */
const assert=require('node:assert/strict');
const {coordinateWeek}=require('../src/hybrid-v2.js');
const makeWeek=()=>({week:2,phase:'development',strengths:[{lift:'squat',exposure:1,top:{sets:1,reps:3,rpe:8,stress:2.4},backoff:{sets:3,reps:5,rpe:7,stress:10.5},totalStress:12.9,totalReps:18}],runs:[{type:'quality',minutes:40},{type:'long',minutes:65}]});
for(const priority of ['Bench','Running','Balanced']){
 const week=makeWeek(),snapshot=JSON.stringify(week),result=coordinateWeek({priority},week);
 assert.equal(JSON.stringify(week),snapshot,'input must remain unchanged');
 assert.deepEqual(result.strengths,week.strengths,'strength prescription must remain unchanged');
 assert.deepEqual(result.runs,week.runs,'running template must remain unchanged');
 assert.equal(result.hybrid.conflict,true);
 assert.equal(result.hybrid.approvalRequired,result.hybrid.changes.length>0);
 for(const change of result.hybrid.changes)assert.match(change.reason,/approval required/i);
}
const quiet=makeWeek();quiet.strengths[0].top.rpe=7;
const result=coordinateWeek({priority:'Bench'},quiet);
assert.equal(result.hybrid.conflict,false);
assert.deepEqual(result.hybrid.changes,[]);
assert.equal(result.hybrid.approvalRequired,false);
console.log('Hybrid approval invariants passed');
