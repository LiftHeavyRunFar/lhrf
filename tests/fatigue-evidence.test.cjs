const {test} = require('node:test');
const assert = require('node:assert/strict');
const evidence = require('../src/fatigue-evidence.js');
const input = {discipline:'running', sessionId:'plan-w1-quality', recordedAt:'2026-11-12T19:00:00Z'};

test('legacy records remain intact and missing answers are unknown', () => {
 const old={sets:[{weight:100}], runs:[{km:5,min:30}], sessionFeedback:[{energy:'low'}]};
 const snapshot=structuredClone(old), next=evidence.append(old,input), item=next.fatigueEvidence[0];
 assert.deepEqual(old,snapshot); assert.deepEqual(next.sets,snapshot.sets); assert.deepEqual(next.runs,snapshot.runs);
 assert.equal(item.interruptionReason,null); assert.equal(item.unusualFatigue,'unknown');
 assert.equal(item.comparableConditions,'unknown'); assert.equal(item.reliableMeasurement,'unknown'); assert.equal(item.runEffort,null);
 assert.deepEqual(evidence.signals(item),{fatigueSupporting:false,safetyConcern:false,explicitRunningContext:false});
});
test('only explicit fatigue attribution contributes supporting evidence', () => {
 for(const interruptionReason of ['time','logistics','other',null]) assert.equal(evidence.signals(evidence.create({...input,interruptionReason})).fatigueSupporting,false);
 assert.equal(evidence.signals(evidence.create({...input,interruptionReason:'fatigue'})).fatigueSupporting,true);
 assert.equal(evidence.signals(evidence.create({...input,unusualFatigue:'yes'})).fatigueSupporting,true);
 assert.equal(evidence.signals(evidence.create({...input,unusualFatigue:'no'})).fatigueSupporting,false);
});
test('pain and illness route to separate safety concern, not fatigue inference', () => {
 for(const interruptionReason of ['pain','illness']) {
  const signal=evidence.signals(evidence.create({...input,interruptionReason}));
  assert.equal(signal.safetyConcern,true); assert.equal(signal.fatigueSupporting,false);
 }
});
test('running comparisons require explicit conditions, measurement reliability and actual effort', () => {
 const good={...input,comparableConditions:'yes',reliableMeasurement:'yes',runEffort:7};
 assert.equal(evidence.signals(evidence.create(good)).explicitRunningContext,true);
 for(const key of ['comparableConditions','reliableMeasurement','runEffort']) {
  const missing={...good}; delete missing[key]; assert.equal(evidence.signals(evidence.create(missing)).explicitRunningContext,false,key);
 }
 assert.equal(evidence.signals(evidence.create({...good,reliableMeasurement:'no'})).explicitRunningContext,false);
});
test('invalid or malformed values cannot manufacture observations', () => {
 for (const patch of [{unusualFatigue:true},{comparableConditions:'yes-ish'},{interruptionReason:'assumed-fatigue'}, {runEffort:0},{runEffort:11},{runEffort:'7'}, {discipline:'strength',runEffort:7}, {sessionId:''}, {recordedAt:'invalid'}, {recordedAt:'2026'}, {recordedAt:'2026-02-30T19:00:00Z'}])
  assert.throws(()=>evidence.create({...input,...patch}),TypeError);
 assert.throws(()=>evidence.append({fatigueEvidence:{}},input),TypeError);
});
test('observations round-trip without rewriting existing completed work', () => {
 const before={completedWorkouts:[{id:'a',prescription:{sets:3}}],fatigueEvidence:[{legacy:'kept'}]};
 const after=JSON.parse(JSON.stringify(evidence.append(before,{...input,interruptionReason:'fatigue'})));
 assert.deepEqual(after.completedWorkouts,before.completedWorkouts); assert.deepEqual(after.fatigueEvidence[0],{legacy:'kept'});
 assert.equal(after.fatigueEvidence[1].interruptionReason,'fatigue');
});
