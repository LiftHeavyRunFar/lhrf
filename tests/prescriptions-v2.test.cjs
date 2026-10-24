const assert=require('node:assert/strict');
const {buildPlan}=require('../src/coaching-v2.js');
const {prescribeWeek,strengthPrescription}=require('../src/prescriptions-v2.js');
const scenarios=[
 {weeks:12,bench:2,squat:2,deadlift:1,runs:2,runGoal:'fitness',priority:'Bench'},
 {weeks:20,bench:2,squat:1,deadlift:1,runs:3,priority:'Running'},
 {weeks:20,bench:2,squat:2,deadlift:1,strengthTargetDate:'2027-05-01'},
 {weeks:12,bench:1,runs:3,runGoal:'10k',runningTargetDate:'2027-02-01',priority:'Running'},
 {weeks:6,bench:3,runs:3,strengthTargetDate:'2026-11-28',runningTargetDate:'2026-11-29'},
 {weeks:8,bench:2}
];
for(const [i,c] of scenarios.entries()){
 const plan=buildPlan(c);
 const weeks=plan.phases.map(p=>prescribeWeek(c,p));
 assert.equal(weeks.length,plan.weeks);
 assert.ok(weeks.every(w=>w.strengths.every(s=>s.totalStress<=s.stressBudget+0.001)));
 assert.ok(weeks.every(w=>w.strengths.every(s=>s.top===null||s.backoff!==null)));
 assert.ok(weeks.every(w=>w.strengths.every(s=>s.top?.suggestedWeight!==0)));
 if(!c.strengthTargetDate&&!c.runningTargetDate){
  assert.equal(weeks.at(-1).phase,'assessment');
  assert.ok(weeks.at(-1).strengths.every(s=>s.assessmentOptional));
 }
 if(i===0){
  const before=weeks[2].strengths.find(s=>s.lift==='bench');
  const after=weeks[4].strengths.find(s=>s.lift==='bench');
  assert.ok(after.top,'Development has a top set');
  assert.ok(after.totalReps<=before.totalReps,'No unbudgeted increase in reps on transition');
 }
 console.log('PASS prototype scenario',i+1);
}
assert.equal(strengthPrescription('bench',4,'development',undefined,'Bench').top.suggestedWeight,null);
console.log('All prototype invariants passed. Does not validate coaching efficacy, event timing or live app integration.');
