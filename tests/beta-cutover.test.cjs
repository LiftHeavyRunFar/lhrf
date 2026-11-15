const { test } = require('node:test');
const assert = require('node:assert/strict');
const { MAIN, LIVE, STAGE, STORE, key, stage, commit, scoped } = require('../src/beta-cutover.js');

const snapshot = id => JSON.stringify({
  sets: [], runs: [], checkins: [], completedWorkouts: [{ id }], provenance: 'fictional',
});
const original = snapshot('before-cutover');
function storage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: name => map.get(name) ?? null,
    setItem: (name, value) => map.set(name, String(value)),
    removeItem: name => map.delete(name),
  };
}

test('a committed snapshot seeds history once and beta saves never rewrite the source', () => {
  const disk = storage({ [MAIN]: original });
  assert.throws(() => scoped(disk), /no history snapshot/);
  assert.equal(stage(disk), 'staged');
  assert.equal(stage(disk), 'already-staged');
  assert.equal(disk.getItem(STORE), null);
  assert.equal(commit(disk), 'imported');
  const beta = scoped(disk);
  assert.equal(beta.getItem(MAIN), original);
  const newer = snapshot('after-cutover');
  beta.setItem(MAIN, newer);
  beta.setItem(LIVE, 'fictional beta draft');
  assert.equal(disk.getItem(MAIN), original);
  assert.equal(disk.getItem(LIVE), null);
  assert.equal(disk.getItem(key(LIVE)), 'fictional beta draft');

  disk.setItem(MAIN, snapshot('late legacy edit'));
  assert.equal(stage(disk), 'already-initialised');
  assert.equal(commit(disk), 'already-initialised');
  assert.equal(scoped(disk).getItem(MAIN), newer);
  assert.equal(disk.getItem(STAGE), original);
  assert.throws(() => beta.removeItem(MAIN), /cannot be reset/);
});

test('a legacy change after staging blocks the import without modifying either copy', () => {
  const disk = storage({ [MAIN]: original });
  stage(disk);
  disk.setItem(MAIN, snapshot('changed after staging'));
  assert.throws(() => commit(disk), /changed since staging/);
  assert.throws(() => stage(disk), /earlier staged snapshot differs/);
  assert.equal(disk.getItem(STORE), null);
  assert.equal(disk.getItem(STAGE), original);
  assert.equal(disk.getItem(MAIN), snapshot('changed after staging'));
});

test('an active draft, pending run or programme replacement blocks both cutover steps', () => {
  for (const name of [LIVE, LIVE + '_pendingRun', 'lhrf_programme_replacement_lock_v1',
    'lhrf_programme_replacement_transaction_v1']) {
    const disk = storage({ [MAIN]: original, [name]: 'fictional pending work' });
    assert.throws(() => stage(disk), /finish or recover/i);
    disk.removeItem(name);
    stage(disk);
    disk.setItem(name, 'fictional pending work');
    assert.throws(() => commit(disk), /finish or recover/i);
    assert.equal(disk.getItem(STORE), null);
    assert.equal(disk.getItem(name), 'fictional pending work');
  }
});

test('failed destination write leaves a reviewable stage and supports an exact retry', () => {
  const disk = storage({ [MAIN]: original });
  stage(disk);
  const set = disk.setItem;
  disk.setItem = (name, value) => {
    if (name === STORE) throw Error('synthetic quota failure');
    set(name, value);
  };
  assert.throws(() => commit(disk), /quota failure/);
  assert.equal(disk.getItem(STORE), null);
  assert.equal(disk.getItem(MAIN), original);
  assert.equal(disk.getItem(STAGE), original);
  disk.setItem = set;
  assert.equal(commit(disk), 'imported');
  assert.equal(commit(disk), 'already-initialised');
});

test('invalid data cannot be staged and missing beta history never falls back to legacy', () => {
  for (const raw of [null, '[]', '{}', '{"sets":[],"runs":[],"checkins":[],"completedWorkouts":{}}']) {
    const disk = storage(raw === null ? {} : { [MAIN]: raw });
    assert.throws(() => stage(disk), /no history snapshot|invalid/);
    assert.equal(disk.getItem(STAGE), null);
  }
  const disk = storage({ [MAIN]: original });
  stage(disk);
  commit(disk);
  const beta = scoped(disk);
  disk.removeItem(STORE);
  assert.throws(() => beta.getItem(MAIN), /no history snapshot/);
  assert.throws(() => beta.setItem(MAIN, snapshot('in-memory beta edit')), /no history snapshot/);
  assert.equal(disk.getItem(MAIN), original);
});
