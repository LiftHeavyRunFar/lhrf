const { test } = require('node:test');
const assert = require('node:assert/strict');
const { MAIN, LIVE, STAGE, STORE, key, stage: stageImport, commit: commitImport, scoped } = require('../src/beta-cutover.js');

const snapshot = id => JSON.stringify({
  sets: [], runs: [], checkins: [], completedWorkouts: [{ id }], provenance: 'fictional',
});
const original = snapshot('before-cutover');
function storage(initial = {}) {
  const map = new Map(Object.entries(initial));
  let queue = Promise.resolve();
  return {
    locks: { request(name, options, operation) {
      assert.equal(name, 'beta-v1:cutover');
      assert.deepEqual(options, { mode: 'exclusive' });
      const result = queue.then(operation);
      queue = result.catch(() => {});
      return result;
    } },
    getItem: name => map.get(name) ?? null,
    setItem: (name, value) => map.set(name, String(value)),
    removeItem: name => map.delete(name),
  };
}

const stage = disk => stageImport(disk, disk.locks);
const commit = disk => commitImport(disk, disk.locks);

test('a committed snapshot seeds history once and beta saves never rewrite the source', async () => {
  const disk = storage({ [MAIN]: original });
  assert.throws(() => scoped(disk), /no history snapshot/);
  assert.equal(await stage(disk), 'staged');
  assert.equal(await stage(disk), 'already-staged');
  assert.equal(disk.getItem(STORE), null);
  assert.equal(await commit(disk), 'imported');
  const beta = scoped(disk);
  assert.equal(beta.getItem(MAIN), original);
  const newer = snapshot('after-cutover');
  beta.setItem(MAIN, newer);
  beta.setItem(LIVE, 'fictional beta draft');
  assert.equal(disk.getItem(MAIN), original);
  assert.equal(disk.getItem(LIVE), null);
  assert.equal(disk.getItem(key(LIVE)), 'fictional beta draft');

  disk.setItem(MAIN, snapshot('late legacy edit'));
  assert.equal(await stage(disk), 'already-initialised');
  assert.equal(await commit(disk), 'already-initialised');
  assert.equal(scoped(disk).getItem(MAIN), newer);
  assert.equal(disk.getItem(STAGE), original);
  assert.throws(() => beta.removeItem(MAIN), /cannot be reset/);
});

test('a legacy change after staging blocks the import without modifying either copy', async () => {
  const disk = storage({ [MAIN]: original });
  await stage(disk);
  disk.setItem(MAIN, snapshot('changed after staging'));
  await assert.rejects(commit(disk), /changed since staging/);
  await assert.rejects(stage(disk), /earlier staged snapshot differs/);
  assert.equal(disk.getItem(STORE), null);
  assert.equal(disk.getItem(STAGE), original);
  assert.equal(disk.getItem(MAIN), snapshot('changed after staging'));
});

test('an active draft, pending run or programme replacement blocks both cutover steps', async () => {
  for (const name of [LIVE, LIVE + '_pendingRun', 'lhrf_programme_replacement_lock_v1',
    'lhrf_programme_replacement_transaction_v1']) {
    const disk = storage({ [MAIN]: original, [name]: 'fictional pending work' });
    await assert.rejects(stage(disk), /finish or recover/i);
    disk.removeItem(name);
    await stage(disk);
    disk.setItem(name, 'fictional pending work');
    await assert.rejects(commit(disk), /finish or recover/i);
    assert.equal(disk.getItem(STORE), null);
    assert.equal(disk.getItem(name), 'fictional pending work');
  }
});

test('failed destination write leaves a reviewable stage and supports an exact retry', async () => {
  const disk = storage({ [MAIN]: original });
  await stage(disk);
  const set = disk.setItem;
  disk.setItem = (name, value) => {
    if (name === STORE) throw Error('synthetic quota failure');
    set(name, value);
  };
  await assert.rejects(commit(disk), /quota failure/);
  assert.equal(disk.getItem(STORE), null);
  assert.equal(disk.getItem(MAIN), original);
  assert.equal(disk.getItem(STAGE), original);
  disk.setItem = set;
  assert.equal(await commit(disk), 'imported');
  assert.equal(await commit(disk), 'already-initialised');
});

test('invalid data cannot be staged and missing beta history never falls back to legacy', async () => {
  for (const raw of [null, '[]', '{}', '{"sets":[],"runs":[],"checkins":[],"completedWorkouts":{}}']) {
    const disk = storage(raw === null ? {} : { [MAIN]: raw });
    await assert.rejects(stage(disk), /no history snapshot|invalid/);
    assert.equal(disk.getItem(STAGE), null);
  }
  const disk = storage({ [MAIN]: original });
  await stage(disk);
  await commit(disk);
  const beta = scoped(disk);
  disk.removeItem(STORE);
  assert.throws(() => beta.getItem(MAIN), /no history snapshot/);
  assert.throws(() => beta.setItem(MAIN, snapshot('in-memory beta edit')), /no history snapshot/);
  assert.equal(disk.getItem(MAIN), original);
});

test('missing exclusive lock blocks the import before storage is written', () => {
  const disk = storage({ [MAIN]: original });
  assert.throws(() => stageImport(disk, null), /exclusive browser lock/);
  assert.throws(() => commitImport(disk, null), /exclusive browser lock/);
  assert.equal(disk.getItem(STAGE), null);
  assert.equal(disk.getItem(STORE), null);
});
