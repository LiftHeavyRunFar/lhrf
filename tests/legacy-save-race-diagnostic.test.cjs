// Diagnostic counterexample, NOT a safety gate: a passing test proves that
// the historical v1.40.6 writer can lose a concurrent workout. Do not remove
// the release hold merely because this test passes. Synthetic data only.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const vm = require('node:vm');

test('DIAGNOSTIC: v1.40.6 stale writer can overwrite a newer workout before its storage event', () => {
  // Uses the pinned production source, not a simplified copy of its save logic.
  // CI must check out full Git history (coaching-v2.yml already does so).
  const html = execFileSync('git', ['show', '87046db2925e1db2dd6e0af71d4b0c72b3d60395:index.html'], {
    encoding: 'utf8', maxBuffer: 5 * 1024 * 1024,
  });
  const source = html.match(/^function save\(candidate=data,\{notify=true\}=\{\}\)\{.*$/m)?.[0];
  assert.ok(source, 'Pinned production save() must exist for this diagnostic');

  let stored = JSON.stringify({ sets: [{ id: 'existing' }] });
  const oldTab = {
    data: { sets: [{ id: 'existing' }] },
    lhrfExternalStorageChanged: false, // old tab has not processed its storage event yet
    lhrfSaveError: '', LHRF_DATA_KEY: 'lhrf_beta_v1118_clean',
    window: {}, alert() {},
    LHRFStorage: { local: {
      getItem() { return null; }, // no programme-replacement lock exists
      setItem(_key, value) { stored = value; },
    } },
  };
  vm.runInNewContext(source + '; globalThis.productionSave = save;', oldTab);

  // A newer tab saves a completed set. Before the old tab handles the event,
  // the historical code saves its stale state, without reading the main key.
  stored = JSON.stringify({ sets: [{ id: 'existing' }, { id: 'newer-tab-workout' }] });
  assert.equal(oldTab.productionSave({ sets: [{ id: 'existing' }, { id: 'old-tab-workout' }] }), true);
  assert.deepEqual(JSON.parse(stored).sets.map(set => set.id), ['existing', 'old-tab-workout']);
  assert.ok(!JSON.parse(stored).sets.some(set => set.id === 'newer-tab-workout'),
    'The diagnostic must reproduce the known lost-write hazard');
  console.log('KNOWN UNSAFE: historical stale writer overwrote newer synthetic workout; this is not safety acceptance.');
});
