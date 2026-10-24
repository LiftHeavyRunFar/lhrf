const assert=require('node:assert/strict');
const {proposeStrengthAdjustment}=require('../src/strength-feedback-v2.js');
const p={lift:'bench',top:{rpe:8,suggestedWeight:120},backoff:{sets:3,reps:5}};
const snapshot=JSON.stringify(p);
const high=proposeStrengthAdjustment(p,{actualRPE:9,actualWeight:120});
assert.equal(high.approvalRequired,true);
assert.equal(high.proposal.to,117.5);
assert.equal(high.proposal.direction,'reduce');
assert.equal(high.proposal.appliesTo,'next exposure only');
const low=proposeStrengthAdjustment(p,{actualRPE:6.5,actualWeight:120});
assert.equal(low.proposal.to,122.5);
assert.equal(low.proposal.direction,'increase');
for(const rpe of [7.1,8,8.9]){
 assert.equal(proposeStrengthAdjustment(p,{actualRPE:rpe}).approvalRequired,false);
}
for(const rpe of [-1,0,11,NaN]){
 assert.equal(proposeStrengthAdjustment(p,{actualRPE:rpe}).approvalRequired,false);
}
assert.equal(proposeStrengthAdjustment({...p,top:null},{actualRPE:9}).approvalRequired,false);
assert.equal(proposeStrengthAdjustment(p,{actualRPE:9,actualWeight:-5}).approvalRequired,false);
assert.equal(JSON.stringify(p),snapshot,'Input prescription must remain unchanged');
assert.deepEqual(proposeStrengthAdjustment(p,{actualRPE:9}),proposeStrengthAdjustment(p,{actualRPE:9}));
console.log('PASS RPE adjustment proposals, safety guards, approval and immutability');
