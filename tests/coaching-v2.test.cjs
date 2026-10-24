const assert=require('node:assert/strict');
const {buildPlan}=require('../src/coaching-v2.js');
const cases=[
 {name:'12-week undated strength',input:{weeks:12,bench:2,squat:2,deadlift:1,runs:2,runGoal:'fitness'},end:'assessment'},
 {name:'20-week undated hybrid',input:{weeks:20,bench:2,squat:1,deadlift:1,runs:3,runGoal:'fitness'},end:'assessment'},
 {name:'20-week strength event',input:{weeks:20,bench:2,squat:2,deadlift:1,strengthTargetDate:'2027-05-01'},end:'event'},
 {name:'12-week running race',input:{weeks:12,bench:1,runs:3,runGoal:'10k',runningTargetDate:'2027-02-01',priority:'Running'},end:'event'},
 {name:'6-week dual event',input:{weeks:6,bench:3,runs:3,strengthTargetDate:'2026-11-28',runningTargetDate:'2026-11-29'},end:'event'},
 {name:'8-week unknown strength baseline',input:{weeks:8,bench:2},end:'assessment'}
];
for(const test of cases){
 const p=buildPlan(test.input),last=p.phases.at(-1);
 assert.equal(p.phases.length,p.weeks,test.name);
 assert.equal(last.phase,test.end,test.name);
 assert.equal(p.outcome.optional,test.end==='assessment',test.name);
 assert.equal(p.phases.at(-2).phase,'realisation',test.name);
 assert.ok(p.framework.reason,test.name);
 assert.ok(p.phases.every((w,i)=>w.week===i+1),test.name);
 console.log('PASS',test.name);
}
console.log('6 planning-contract fixtures passed; prescriptions and chart consistency NOT YET TESTED.');
