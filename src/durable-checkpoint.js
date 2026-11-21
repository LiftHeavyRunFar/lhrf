/* Isolated owner-practice checkpoint. The original local records remain the app's view. */
(function () {
  'use strict';
  const DATABASE = 'lhrf-owner-durable-checkpoint-v1';
  const STORE = 'checkpoint';
  const native = {
    set: Storage.prototype.setItem,
    remove: Storage.prototype.removeItem,
    clear: Storage.prototype.clear,
  };
  const tracked = key => /^(?:competition:)?lhrf/i.test(key);
  let database, envelope, dirty = 0, saved = 0, pending = null, failure = null;
  let initialised = false;
  const gate = document.createElement('section');
  gate.id = 'durableCheckpointGate';
  gate.setAttribute('role', 'status');
  gate.innerHTML = '<p id="durableCheckpointStatus">Checking saved training…</p>' +
    '<button id="durableCheckpointRetry" hidden>Retry checkpoint</button>' +
    '<button id="durableCheckpointExport" hidden>Download recovery copies</button>';
  document.body.append(gate);
  const status = gate.querySelector('p');
  const retryButton = gate.querySelector('#durableCheckpointRetry');
  const exportButton = gate.querySelector('#durableCheckpointExport');

  function capture() {
    return Object.fromEntries(Object.keys(localStorage).filter(tracked).sort()
      .map(key => [key, localStorage.getItem(key)]));
  }
  async function digest(values) {
    const bytes = new TextEncoder().encode(JSON.stringify(values));
    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)))
      .map(value => value.toString(16).padStart(2, '0')).join('');
  }
  function display(state, message) {
    document.documentElement.dataset.lhrfCheckpoint = state;
    gate.hidden = state === 'saved';
    status.textContent = message;
    retryButton.hidden = state !== 'failed' || !initialised;
    exportButton.hidden = !['failed', 'conflict'].includes(state);
  }
  function stop(error, state = 'failed') {
    failure = error;
    display(state, error.message + ' Training is paused. Keep both recovery copies.');
  }
  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(Error('Checkpoint storage is blocked by another page.'));
    });
  }
  function readEnvelope() {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE, 'readonly');
      const request = transaction.objectStore(STORE).get('head');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }
  function commit(next) {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE, 'readwrite', {durability: 'strict'});
      if (transaction.durability !== 'strict') {
        transaction.abort();
        reject(Error('Strict checkpoint durability is unavailable in this browser.'));
        return;
      }
      const store = transaction.objectStore(STORE);
      const request = store.get('head');
      request.onsuccess = () => {
        if ((request.result?.revision || 0) !== (envelope?.revision || 0)) {
          transaction.abort();
          return;
        }
        store.put(next, 'head');
      };
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error || Error('Checkpoint changed or its save was interrupted.'));
      transaction.onerror = () => {};
    });
  }
  async function drain() {
    while (saved < dirty) {
      const version = dirty;
      const values = capture();
      const snapshot = {values, digest: await digest(values)};
      const next = {revision: (envelope?.revision || 0) + 1,
        snapshots: [snapshot, ...(envelope?.snapshots || [])].slice(0, 16)};
      await commit(next);
      envelope = next;
      saved = version;
    }
    if (initialised) display('saved', 'Checkpoint saved on this device.');
  }
  function schedule() {
    if (failure) throw failure;
    display('saving', 'Saving training checkpoint…');
    if (!pending) {
      pending = Promise.resolve().then(drain).catch(error => { stop(error); throw error; })
        .finally(() => { pending = null; });
      pending.catch(() => {});
    }
    return pending;
  }
  function changed() { dirty += 1; schedule(); }
  Storage.prototype.setItem = function (key, value) {
    if (this === localStorage && tracked(String(key)) && failure) throw failure;
    native.set.call(this, key, value);
    if (this === localStorage && tracked(String(key))) changed();
  };
  Storage.prototype.removeItem = function (key) {
    if (this === localStorage && tracked(String(key)) && failure) throw failure;
    const existed = this.getItem(key) !== null;
    native.remove.call(this, key);
    if (this === localStorage && existed && tracked(String(key))) changed();
  };
  Storage.prototype.clear = function () {
    if (this === localStorage && failure) throw failure;
    native.clear.call(this);
    if (this === localStorage) changed();
  };
  const copies = () => ({format: 'lhrf-durable-recovery-v1', local: capture(), durable: envelope,
    error: failure?.message || null});
  exportButton.onclick = () => {
    const link = document.createElement('a');
    link.download = 'lhrf-recovery-copies.json';
    link.href = URL.createObjectURL(new Blob([JSON.stringify(copies(), null, 2)], {type: 'application/json'}));
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };
  retryButton.onclick = () => {
    failure = null;
    schedule().catch(() => {});
  };
  window.LHRFDurableCheckpoint = {
    get initialised() { return initialised; },
    get state() { return document.documentElement.dataset.lhrfCheckpoint; },
    whenSaved: async () => {
      if (failure) throw failure;
      if (pending) await pending;
      if (saved !== dirty) await schedule();
      if (failure) throw failure;
    },
    copies,
    retry: () => { failure = null; return schedule(); },
  };
  window.addEventListener('storage', event => {
    if (event.storageArea === localStorage && (!event.key || tracked(event.key))) {
      stop(Error('Another page changed training records. Review both copies before continuing.'), 'conflict');
    }
  });

  async function restore() {
    envelope = await readEnvelope();
    const local = capture();
    if (!envelope) {
      dirty += 1;
      await schedule();
      return;
    }
    if (!Number.isInteger(envelope.revision) || !Array.isArray(envelope.snapshots) || !envelope.snapshots.length) {
      throw Error('The saved checkpoint is incomplete.');
    }
    for (const snapshot of envelope.snapshots) {
      if (await digest(snapshot.values) !== snapshot.digest) throw Error('Checkpoint checksum does not match.');
    }
    const known = envelope.snapshots;
    const keys = new Set([...Object.keys(local), ...known.flatMap(snapshot => Object.keys(snapshot.values))]);
    for (const key of keys) {
      const value = local[key] ?? null;
      if (value !== null && !known.some(snapshot => (snapshot.values[key] ?? null) === value)) {
        stop(Error('Local records differ from every retained checkpoint. Review both copies.'), 'conflict');
        return;
      }
    }
    const latest = known[0].values;
    if (JSON.stringify(local) !== JSON.stringify(latest)) {
      const next = {...envelope, revision: envelope.revision + 1,
        recovery: {local, digest: await digest(local)}};
      await commit(next);
      envelope = next;
    }
    for (const key of keys) {
      if (Object.hasOwn(latest, key)) native.set.call(localStorage, key, latest[key]);
      else native.remove.call(localStorage, key);
    }
    if (JSON.stringify(capture()) !== JSON.stringify(latest)) throw Error('Checkpoint restoration did not verify.');
  }
  async function executeScripts() {
    const errors = [];
    const watch = event => errors.push(event.message || 'Application script failed.');
    window.addEventListener('error', watch);
    try {
      for (const inert of document.querySelectorAll('script[data-lhrf-pending]')) {
        const script = document.createElement('script');
        if (inert.src) {
          script.src = inert.src;
          script.async = false;
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () => reject(Error('An application script could not load.'));
            inert.replaceWith(script);
          });
        } else {
          script.textContent = inert.textContent;
          inert.replaceWith(script);
        }
        if (errors.length) throw Error(errors[0]);
      }
      document.dispatchEvent(new Event('DOMContentLoaded'));
      window.dispatchEvent(new Event('load'));
    } finally { window.removeEventListener('error', watch); }
  }
  async function start() {
    if (!navigator.locks) throw Error('This browser cannot reserve the checkpoint writer.');
    await new Promise((resolve, reject) => {
      navigator.locks.request('lhrf-owner-checkpoint-writer', {ifAvailable: true}, async lock => {
        if (!lock) { reject(Error('Another checkpoint writer is open. Close it before continuing.')); return; }
        resolve();
        await new Promise(() => {});
      }).catch(reject);
    });
    database = await openDatabase();
    await restore();
    if (failure) return;
    await executeScripts();
    initialised = true;
    await window.LHRFDurableCheckpoint.whenSaved();
    display('saved', 'Checkpoint saved on this device.');
  }
  start().catch(error => stop(error));
})();
