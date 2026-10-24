const assert=require('node:assert/strict');
const {strengthPrescription}=require('../src/prescriptions-v2.js');
const top=(week,phase='development')=>strengthPrescription('bench',week,phase,160,'Bench').top;
assert.ok(top(2).suggestedWeight>=top(1).suggestedWeight);
assert.ok(top(3).percent1RM>top(2).percent1RM);
assert.ok(top(5).percent1RM>top(1).percent1RM,'New block must not reset to week-one intensity');
assert.ok(top(9).percent1RM>top(5).percent1RM,'Intensity should advance across blocks');
assert.ok(top(13).percent1RM>=top(9).percent1RM);
assert.equal(strengthPrescription('bench',8,'recovery',160,'Bench').top,null);
assert.equal(strengthPrescription('bench',12,'realisation',160,'Bench').top.percent1RM,81);
for(let w=1;w<=52;w++){
 const x=strengthPrescription('bench',w,'development',160,'Bench');
 assert.ok(x.top.percent1RM<=81.1,'Limit intensity drift');
 assert.ok(x.totalStress<=x.stressBudget+.001);
}
const secondary=strengthPrescription('squat',9,'development',180,'Bench');
const primary=strengthPrescription('squat',9,'development',180,'Squat');
assert.equal(secondary.top.suggestedWeight,primary.top.suggestedWeight);
assert.ok(secondary.backoff.sets<primary.backoff.sets);
console.log('PASS bounded multi-block strength progression and priority isolation');
