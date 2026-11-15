/* Unwired #168 prototype. The application does not load this module by default. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LHRFBetaCutover = factory();
})(globalThis, function () {
  'use strict';

  const MAIN = 'lhrf_beta_v1118_clean';
  const LIVE = 'lhrf_fresh_beta_live_v1114';
  const LOCK = 'lhrf_programme_replacement_lock_v1';
  const JOURNAL = 'lhrf_programme_replacement_transaction_v1';
  const PREFIX = 'beta-v1:'; // v1.40.6 reset removes keys beginning with "lhrf".
  const STAGE = PREFIX + 'staged-import';
  const STORE = PREFIX + 'history';
  const IMPORT_LOCK = PREFIX + 'cutover';
  const key = name => name === MAIN ? STORE : PREFIX + 'app:' + name;

  function validate(raw) {
    if (typeof raw !== 'string') throw new Error('There is no history snapshot to import.');
    const record = JSON.parse(raw);
    if (!record || !['sets', 'runs', 'checkins'].every(name => Array.isArray(record[name])) ||
        ('completedWorkouts' in record && !Array.isArray(record.completedWorkouts))) {
      throw new Error('The history snapshot is invalid.');
    }
    return raw;
  }

  function requireIdleLegacy(storage) {
    for (const name of [LIVE, LIVE + '_pendingRun', LOCK, JOURNAL]) {
      if (storage.getItem(name) !== null) throw new Error('Finish or recover the legacy workout or programme change before cutover.');
    }
  }

  function withImportLock(locks, action) {
    if (!locks?.request) throw new Error('Cutover requires an exclusive browser lock.');
    return locks.request(IMPORT_LOCK, { mode: 'exclusive' }, action);
  }

  function stage(storage, locks = globalThis.navigator?.locks) {
    return withImportLock(locks, () => stageSnapshot(storage));
  }

  function stageSnapshot(storage) {
    if (storage.getItem(STORE) !== null) return 'already-initialised';
    requireIdleLegacy(storage);
    const raw = validate(storage.getItem(MAIN));
    const previous = storage.getItem(STAGE);
    if (previous === raw) return 'already-staged';
    if (previous !== null) throw new Error('The earlier staged snapshot differs. Review the legacy changes before starting over.');
    storage.setItem(STAGE, raw);
    return 'staged';
  }

  function commit(storage, locks = globalThis.navigator?.locks) {
    return withImportLock(locks, () => commitSnapshot(storage));
  }

  function commitSnapshot(storage) {
    if (storage.getItem(STORE) !== null) return 'already-initialised';
    requireIdleLegacy(storage);
    const reviewed = validate(storage.getItem(STAGE));
    if (storage.getItem(MAIN) !== reviewed) throw new Error('Legacy history changed since staging. Review the difference before cutover.');
    // One write creates the destination and marks the import committed.
    storage.setItem(STORE, reviewed);
    return 'imported';
  }

  function scoped(storage) {
    const requireImported = () => validate(storage.getItem(STORE));
    requireImported();
    return {
      getItem(name) { return name === MAIN ? requireImported() : storage.getItem(key(name)); },
      setItem(name, value) {
        if (name === MAIN) {
          requireImported();
          validate(value);
        }
        storage.setItem(key(name), value);
      },
      removeItem(name) {
        if (name === MAIN) throw new Error('The beta history cannot be reset through this adapter.');
        storage.removeItem(key(name));
      },
    };
  }

  return { MAIN, LIVE, STAGE, STORE, key, stage, commit, scoped };
});
