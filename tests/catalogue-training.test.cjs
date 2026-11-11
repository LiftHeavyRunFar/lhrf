const assert = require('node:assert/strict');
const { test } = require('node:test');
const training = require('../src/catalogue-training.js');
const catalogue = require('../src/programme-catalogue.js');

const strength = () => catalogue.previewProgramme('powerlifting-four-day');
const running = () => catalogue.previewProgramme('10k-two-run');

test('shared scheduling exposes a Friday to Saturday pairing and keeps two independent snapshots', () => {
  const a = strength();
  let state = training.enrol(training.empty(), a, '2026-11-09', 'lift');
  state = training.enrol(state, running(), '2026-11-09', 'run');
  assert.equal(state.occurrences.length, 59);
  assert.equal(new Set(state.occurrences.map(item => item.id)).size, 59);
  assert.ok(training.conflicts(state).some(([a, b]) => a.id === 'lift/1/C' && b.id === 'run/1/long'));
  a.weeks[0].sessions[0].groups[0].sets = 99;
  assert.equal(state.plans[0].snapshot.weeks[0].sessions[0].groups[0].sets, 4);
  const moved = training.move(state, 'run/1/long', '2026-11-15');
  assert.equal(moved.plans[1].snapshot.weeks[0].sessions[1].distanceMetres, 9000);
  assert.equal(moved.occurrences.find(item => item.id === 'run/1/long').date, '2026-11-15');
  assert.throws(() => training.enrol(state, running(), '2026-11-10', 'different'), /Monday/);
  assert.throws(() => training.move(state, 'run/1/long', '2026-11-31'), /valid date/);
});

test('preview placement and repeats change dates, while logging changes occurrence status and actuals', () => {
  let state = training.enrol(training.empty(), running(), '2026-11-09', 'run', { '1/quality': '2026-11-12' });
  assert.equal(state.occurrences[0].date, '2026-11-12');
  state = training.skip(state, 'run/1/quality');
  assert.throws(() => training.saveWorkout(state, 'run/1/quality', { km: 7, min: 42 }, 'now'), /open workout/);
  state = training.skip(state, 'run/1/quality', false);
  const draft = { km: '7', min: '42', note: 'Actual work' };
  state = training.saveDraft(state, 'run/1/quality', draft);
  draft.km = '8';
  assert.equal(state.drafts['run/1/quality'].km, '7');
  state = training.saveWorkout(state, 'run/1/quality', state.drafts['run/1/quality'], '2026-11-12T19:00:00Z');
  assert.equal(state.logs['run/1/quality'].km, 7);
  assert.equal(state.drafts['run/1/quality'], undefined);
  assert.throws(() => training.move(state, 'run/1/quality', '2026-11-12'), /has not been logged/);
  state = training.repeat(state, 'run/1/quality', 'repeat', '2026-11-17');
  const repeated = training.calendar(state).find(item => item.id === 'repeat');
  assert.equal(repeated.session.distanceMetres, 7000);
  assert.equal(repeated.status, 'planned');
  assert.equal(repeated.week, 1);
});

test('a strength log stores actual sets separately and recognises partial work', () => {
  let state = training.enrol(training.empty(), strength(), '2026-11-09', 'lift');
  assert.throws(() => training.saveWorkout(state, 'lift/1/A', { groups: [[{ weightKg: 100 }]] }, 'now'), /positive whole/);
  state = training.saveWorkout(state, 'lift/1/A', { groups: [[{ weightKg: '100', dose: '5', rpe: '7' }]] },
    '2026-11-09T19:00:00Z');
  assert.equal(state.logs['lift/1/A'].partial, true);
  assert.equal(state.logs['lift/1/A'].sets[0].weightKg, 100);
  assert.equal(state.plans[0].snapshot.weeks[0].sessions[0].groups[0].sets, 4);
});

test('a Garmin import cannot be logged against a second workout', () => {
  let state = training.enrol(training.empty(), running(), '2026-11-09', 'run');
  const data = { km: 7, min: 42, activity: { sourceFileHash: 'activity-1' } };
  state = training.saveWorkout(state, 'run/1/quality', data, '2026-11-11T19:00:00Z');
  assert.throws(() => training.saveWorkout(state, 'run/1/long', data, '2026-11-14T19:00:00Z'), /already been logged/);
});
