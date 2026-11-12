// Baseline evidence tests, written before a fatigue module exists. These intentionally
// exercise real catalogue output and existing persistence, not a simulated detector.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const catalogue = require('../src/programme-catalogue.js');
const training = require('../src/catalogue-training.js');

const start = '2026-11-09';
const enrol = (programme, id = 'plan') => training.enrol(training.empty(), catalogue.previewProgramme(programme), start, id);

test('all generated catalogue snapshots, dates and events survive JSON round-trip exactly', () => {
  for (const entry of catalogue.listProgrammes()) {
    const state = enrol(entry.id);
    const before = JSON.stringify(state);
    const restored = JSON.parse(before);
    assert.equal(JSON.stringify(restored), before, entry.id);
    assert.equal(JSON.stringify(training.calendar(restored)), JSON.stringify(training.calendar(state)), entry.id);
    assert.equal(restored.plans[0].snapshot.weeks.length, entry.durationWeeks, entry.id);
  }
});

test('a skipped workout and partial lift contain no structured cause or recovery evidence', () => {
  let state = enrol('powerlifting-four-day');
  const first = state.occurrences.find(x => x.week === 1 && x.sessionId === 'A');
  state = training.skip(state, first.id);
  assert.equal(state.occurrences.find(x => x.id === first.id).status, 'skipped');
  assert.equal(state.logs[first.id], undefined);
  state = training.skip(state, first.id, false);
  state = training.saveWorkout(state, first.id, { groups: [[{weightKg: 100, dose: 5, rpe: 9}]], fatigueResponsible: true }, '2026-11-09T19:00:00Z');
  assert.equal(state.logs[first.id].partial, true);
  assert.equal(state.logs[first.id].fatigueResponsible, undefined, 'current logger does not retain explicit confirmation');
  assert.deepEqual(Object.keys(state.logs[first.id]).sort(), ['loggedAt', 'note', 'partial', 'sets']);
});

test('run logs retain aggregate actuals but no structured effort, context or explicit fatigue cause', () => {
  let state = enrol('10k-two-run');
  const item = state.occurrences.find(x => x.week === 1 && x.sessionId === 'quality');
  state = training.saveWorkout(state, item.id, {km: 6, min: 40, partial: true, rpe: 9, fatigueResponsible: true, context: 'hot'}, '2026-11-11T19:00:00Z');
  const log = state.logs[item.id];
  assert.equal(log.partial, true);
  assert.equal(log.rpe, undefined);
  assert.equal(log.context, undefined);
  assert.equal(log.fatigueResponsible, undefined);
  assert.deepEqual(Object.keys(log).sort(), ['activity', 'km', 'loggedAt', 'min', 'note', 'partial']);
  assert.ok(training.calendar(state).find(x => x.id === item.id).session.steps.length > 1);
});

test('race and meet workouts have different representations requiring explicit protection', () => {
  for (const id of ['10k-two-run', '10k-three-run', 'half-marathon', 'marathon-distance', 'marathon-timed']) {
    const events = training.calendar(enrol(id)).filter(x => x.session.id === 'race');
    assert.equal(events.length, 1, id);
    assert.equal(events[0].session.kind, 'run', id);
  }
  for (const id of ['powerlifting-three-day', 'powerlifting-four-day', 'bench-specialisation', 'deadlift-specialisation']) {
    assert.ok(training.calendar(enrol(id)).some(x => x.session.kind === 'event'), id);
  }
});

test('logging and skipping preserve prescribed programme and other discipline in a hybrid enrolment', () => {
  let state = training.enrol(enrol('powerlifting-four-day', 'lift'), catalogue.previewProgramme('10k-two-run'), start, 'run');
  const originalPlans = structuredClone(state.plans);
  const run = state.occurrences.find(x => x.planId === 'run');
  const lift = state.occurrences.find(x => x.planId === 'lift');
  state = training.skip(state, run.id);
  state = training.saveWorkout(state, lift.id, {groups: [[{weightKg: 100, dose: 5, rpe: 7}]]}, '2026-11-09T19:00:00Z');
  assert.deepEqual(state.plans, originalPlans);
  assert.equal(state.occurrences.find(x => x.id === run.id).status, 'skipped');
  assert.ok(state.logs[lift.id]);
});

test('Garmin imported activity and completed log survive serialisation and other session changes', () => {
  let state = enrol('10k-two-run');
  const first = state.occurrences.find(x => x.week === 1 && x.sessionId === 'quality');
  const second = state.occurrences.find(x => x.week === 1 && x.sessionId === 'long');
  const activity = {sourceFileHash: 'synthetic-hash', sport: 'running', samples: [{seconds: 60, metres: 150}]};
  state = training.saveWorkout(state, first.id, {km: 7, min: 42, activity}, '2026-11-11T19:00:00Z');
  const savedLog = structuredClone(state.logs[first.id]);
  state = JSON.parse(JSON.stringify(state));
  state = training.skip(state, second.id);
  assert.deepEqual(state.logs[first.id], savedLog);
  assert.throws(() => training.saveWorkout(training.skip(state, second.id, false), second.id,
    {km: 7, min: 42, activity}, '2026-11-14T19:00:00Z'), /already been logged/);
});

test('catalogue contains distance-based and duration-based runs requiring unit-aware overlays', () => {
  const plans = catalogue.listProgrammes().map(entry => catalogue.previewProgramme(entry.id));
  const sessions = plans.flatMap(plan => plan.weeks.flatMap(week => week.sessions)).filter(s => s.kind === 'run');
  assert.ok(sessions.some(s => s.steps.some(step => step.distanceMetres > 0)));
  assert.ok(sessions.some(s => s.steps.some(step => step.durationSeconds > 0)));
});
