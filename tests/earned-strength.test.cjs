const test = require('node:test');
const assert = require('node:assert/strict');
const earned = require('../src/earned-strength.js');
const {fixture} = require('./earned-strength-fixture.cjs');

const confirmed = {comparable: true, recovered: true, warmups: true, increment: true};
for (const id of ['powerlifting-three-day', 'powerlifting-four-day']) {
  test(id + ': generated peak earns 147.5 kg / RPE 9 with original plan retained', () => {
    const {state, live, index, now} = fixture(id);
    const original = structuredClone(state);
    const proposal = earned.assess(state, live, index, now);
    assert.ok(proposal);
    assert.equal(proposal.original[3], 145);
    assert.equal(proposal.adjusted[3], 147.5);
    assert.equal(proposal.adjusted[4], 9);
    const approved = earned.approve(state, live, proposal, confirmed, now);
    assert.deepEqual(state, original);
    assert.equal(live.ex[index][4], 8.5);
    assert.equal(approved.ex[index][4], 9);
    assert.match(approved.ex[index][5].cue, /RPE 9/);
    assert.deepEqual(approved.originalPrescription.ex, live.ex);
    assert.deepEqual(earned.revert(approved, index).ex, live.ex);
  });
}

test('generated 3 x 5 work earns one 112.5 → 115 kg suggestion', () => {
  const {state, live, index, now} = fixture('general-strength', 'volume');
  const proposal = earned.assess(state, live, index, now);
  assert.ok(proposal);
  assert.deepEqual(proposal.adjusted.slice(1, 5), [3, 5, 115, 7]);
  assert.equal(proposal.evidence.length, 3);
  assert.equal(earned.assess({...state, completedWorkouts: state.completedWorkouts.slice(0, 1)}, live, index, now), null);
});

for (const [name, alter] of [
  ['missing RPE', f => { delete f.state.sets.find(set => set.exerciseId === 'competition-bench' && set.reps === 1).rpe; }],
  ['overshot effort', f => { f.state.sets.find(set => set.exerciseId === 'competition-bench' && set.reps === 1).rpe = 9; }],
  ['partial workout', f => { f.state.completedWorkouts.at(-1).completedSets--; }],
  ['unreliable effort', f => { f.state.sets.find(set => set.exerciseId === 'competition-bench').rpeReliable = false; }],
  ['changed setup', f => { f.live.ex[f.index][5].variantId = 'new-setup'; }],
  ['wrong exercise', f => { f.live.ex[f.index][5].exerciseId = 'paused-bench'; }],
  ['shortened workout', f => { f.live.timeAdaptation = {reason: 'time'}; }],
  ['symptoms today', f => { f.state.checkins.push({date: f.now, symptoms: 'Fictional illness'}); }],
  ['wrong day', f => { f.live.scheduledDate = '2027-01-01'; }],
  ['stale historical evidence', f => { f.state.completedWorkouts.forEach(row => { row.date = '2020-01-01T10:00:00Z'; }); }],
  ['missing taper dates', f => { f.state.reviewedProgramme.weeks = []; }],
  ['interleaved taper before the peak', f => {
    f.state.reviewedProgramme.weeks.at(-1).sessions[0].scheduledDate = f.live.scheduledDate;
  }],
  ['current set already recorded', f => { f.live.entries[f.index + '_0'] = {done: true}; }],
]) {
  test('holds original on ' + name, () => {
    const f = fixture();
    alter(f);
    assert.equal(earned.assess(f.state, f.live, f.index, f.now), null);
  });
}

test('approval rechecks evidence and requires explicit confirmations', () => {
  const {state, live, index, now} = fixture();
  const proposal = earned.assess(state, live, index, now);
  assert.throws(() => earned.approve(state, live, proposal, {}, now), /Confirm/);
  state.sets.find(set => set.exerciseId === 'competition-bench').weight += 2.5;
  assert.throws(() => earned.approve(state, live, proposal, confirmed, now), /changed/);
});

test('missing sessions and unexplained incomplete work do not create a progression or fatigue record', () => {
  const f = fixture();
  f.state.completedWorkouts = [];
  const before = structuredClone(f.state);
  assert.equal(earned.assess(f.state, f.live, f.index, f.now), null);
  assert.deepEqual(f.state, before);
});

test('recorded sets prevent reverting an accepted prescription', () => {
  const f = fixture();
  const approved = earned.approve(f.state, f.live, earned.assess(f.state, f.live, f.index, f.now), confirmed, f.now);
  approved.entries[f.index + '_0'] = {weight: 147.5, reps: 1, rpe: 8.5, done: true};
  assert.throws(() => earned.revert(approved, f.index), /Recorded sets/);
  assert.equal(earned.localDay('2027-01-24T00:30:00Z'), '2027-01-24');
});
