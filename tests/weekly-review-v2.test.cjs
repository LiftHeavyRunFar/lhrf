const assert=require('node:assert/strict');
const {reviewWeek}=require('../src/weekly-review-v2.js');
const logs=[9,8,9].map(actualRPE=>({lift:'bench',actualRPE,targetRPE:8}));
const input={strengthLogs:logs,lastStrengthSession:{
 prescription:{lift:'bench',top:{rpe:8,suggestedWeight:120}},
 feedback:{actualRPE:9,actualWeight:120}}};
const before=JSON.stringify(input),r=reviewWeek(input);
assert.equal(r.approvalRequired,true);
assert.equal(r.appliedChanges.length,0);
assert.ok(r.proposals.some(p=>p.kind==='trim-accessory-volume'));
assert.ok(r.proposals.some(p=>p.kind==='next-exposure-top-load'&&p.direction==='reduce'));
assert.equal(JSON.stringify(input),before);
assert.deepEqual(reviewWeek(input),r);
const quiet=reviewWeek({strengthLogs:[8,8,8].map(actualRPE=>({lift:'bench',actualRPE,targetRPE:8}))});
assert.equal(quiet.approvalRequired,false);
assert.equal(quiet.proposals.length,0);
const guarded=reviewWeek({strengthLogs:logs,lastStrengthSession:{
 prescription:{lift:'bench',top:{rpe:8,suggestedWeight:120}},
 feedback:{actualRPE:6,actualWeight:120}}});
assert.ok(!guarded.proposals.some(p=>p.direction==='increase'));
assert.equal(reviewWeek({}).approvalRequired,false);
console.log('PASS weekly coach review, explicit approvals, no mutation and overshoot guard');
