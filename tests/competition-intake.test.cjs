const test = require('node:test');
const assert = require('node:assert/strict');
const coach = require('../src/coach-engine.js');
const adapters = require('../src/coach-adapters.js');
const {fullInventory} = require('./equipment-fixtures.cjs');

const MEET = '2026-12-19';
const NOW = () => Date.parse('2026-11-09T12:00:00Z');
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const LIFTS = ['Squat', 'Bench', 'Deadlift'];

function profile(event, overrides = {}) {
  const lifts = event === 'powerlifting' ? LIFTS : LIFTS.filter(lift => lift.toLowerCase() === event);
  return {
    ...adapters.normalizeProfile({
      event, strengthTargetDate: MEET, startDate: '2026-11-09', weeks: 6, days: 7,
      availableDays: DAYS, trainingAge: 'intermediate', strengthMode: 'auto', priority: 'Bench',
      squat: +lifts.includes('Squat'), bench: +lifts.includes('Bench'), deadlift: +lifts.includes('Deadlift'),
      runs: 0, equipmentInventory: fullInventory(), competitionIntakeVersion: 1,
      visitConstraints: {strengthVisits: lifts.length, eventDays: {[MEET]: {confirmed: true}}}
    }),
    liftProfiles: Object.fromEntries(lifts.map(lift => [lift, {
      kg: 100, reps: 1, resultDate: '2026-11-06', competitionTechnique: true
    }])),
    ...overrides
  };
}

function review(raw) {
  const config = coach.prepareNewProgramme(raw, {now: NOW});
  const programme = adapters.buildProgramme(config, {now: NOW});
  const sessions = programme.weeks.flatMap(week => week.sessions);
  const issues = programme.weeks.flatMap(week => week.blockingIssues || []);
  const finalExposures = sessions.flatMap(session => session.ex).filter(ex => ex[5]?.finalHeavyExposure);
  return {config, programme, sessions, issues, finalExposures};
}

test('competition types produce only their event lifts and deliver each athlete-chosen single and taper', () => {
  const choices = {Squat: {mode: 'athlete', date: '2026-12-11'}, Bench: {mode: 'athlete', daysOut: 6},
    Deadlift: {mode: 'athlete', daysOut: 10}};
  const expected = {Squat: '2026-12-11', Bench: '2026-12-13', Deadlift: '2026-12-09'};
  for (const event of ['powerlifting', 'bench', 'deadlift']) {
    const lifts = event === 'powerlifting' ? LIFTS : LIFTS.filter(lift => lift.toLowerCase() === event);
    const finalHeavyPreferences = Object.fromEntries(lifts.map(lift => [lift, choices[lift]]));
    const result = review(profile(event, {finalHeavyPreferences}));
    assert.deepEqual(result.issues, []);
    const meet = result.sessions.find(session => session.competitionType);
    assert.equal(meet.eventDate, MEET);
    assert.deepEqual(meet.competitionLifts, lifts);
    assert.equal(meet.variationNotes.length, lifts.length);
    meet.variationNotes.forEach((note, i) => {
      assert.match(note, new RegExp('^' + lifts[i] + ':'));
      assert.match(note, /warm up|warm-up/i);
      assert.match(note, /opener/);
    });
    assert.equal(result.finalExposures.length, lifts.length);
    for (const lift of lifts) {
      const plan = result.programme.finalHeavyPlan[lift];
      assert.equal(plan.date, expected[lift]);
      assert.equal(plan.kind, 'single');
      const single = result.finalExposures.find(ex => ex[0] === lift);
      assert.equal(single[2], 1);
      assert.equal(single[3], 0);
      assert.equal(single[4], 7.5);
      assert.equal(single[5].earnedProgression, undefined);
      const eventWeek = result.programme.weeks.at(-1);
      for (const session of eventWeek.sessions) {
        for (const ex of session.ex.filter(ex => ex[0] === lift)) {
          assert.ok(ex[4] <= 6 || ex[5].finalHeavyExposure, 'Only the designated final exposure can remain heavy in meet week');
        }
      }
    }
  }
});

test('coach timing distinguishes supported singles, demanding rep practice and novice technique', () => {
  const available = {bench: 7, visitConstraints: {strengthVisits: 7, eventDays: {[MEET]: {confirmed: true}}}};
  const advanced = review(profile('bench', {...available, trainingAge: 'advanced'}));
  const intermediate = review(profile('bench', available));
  assert.equal(advanced.programme.finalHeavyPlan.Bench.daysOut, 6);
  assert.equal(intermediate.programme.finalHeavyPlan.Bench.daysOut, 7);
  assert.equal(intermediate.programme.finalHeavyPlan.Bench.mode, 'coach');
  const missingSingle = {liftProfiles: {Bench: {kg: 100, reps: 5}}};
  const reps = review(profile('bench', {...available, ...missingSingle}));
  assert.equal(reps.programme.finalHeavyPlan.Bench.kind, 'rep-practice');
  assert.ok(reps.finalExposures.every(ex => ex[2] > 1));
  const novice = review(profile('bench', {...available, ...missingSingle, trainingAge: 'beginner'}));
  assert.equal(novice.programme.finalHeavyPlan.Bench.kind, 'none');
  assert.equal(novice.finalExposures.length, 0);
  assert.ok(novice.programme.weeks.at(-1).sessions.flatMap(session => session.ex).every(ex => ex[4] <= 6));
});

test('unavailable, too-late and unsupported athlete choices block approval with an explanation', () => {
  const tooLate = review(profile('deadlift', {finalHeavyPreferences: {Deadlift: {mode: 'athlete', daysOut: 2}}}));
  assert.ok(tooLate.issues.some(issue => /at least 5 days/.test(issue)));
  const unavailable = review(profile('bench', {availableDays: ['Mon'], finalHeavyPreferences: {Bench: {mode: 'athlete', daysOut: 6}}}));
  assert.ok(unavailable.issues.some(issue => /no bench visit/.test(issue)));
  const unsupported = review(profile('bench', {trainingAge: 'beginner', finalHeavyPreferences: {Bench: {mode: 'athlete', daysOut: 6}}}));
  assert.ok(unsupported.issues.some(issue => /recent completed competition-single evidence/.test(issue)));
  assert.throws(() => coach.approveProgrammeConfig(tooLate.config, new Date(NOW()).toISOString()), /at least 5 days/);
  for (const result of [tooLate, unavailable, unsupported]) {
    assert.equal(result.finalExposures.length, 0);
    assert.equal(Object.values(result.programme.finalHeavyPlan)[0].date, null);
  }
});

test('reported pain blocks a chosen rehearsal and supporting lifts stay light for a deadlift-only meet', () => {
  const finalHeavyPreferences = {Deadlift: {mode: 'athlete', daysOut: 10}};
  const unsafe = review(profile('deadlift', {finalHeavyPreferences, recoveryObservations: [{
    sport: 'strength', task: 'heavy', lift: 'Deadlift', status: 'pain', observedAt: '2026-11-08'
  }]}));
  assert.ok(unsafe.issues.some(issue => /current recovery|competition-single experience/i.test(issue)));
  assert.equal(unsafe.finalExposures.length, 0);
  const support = review(profile('deadlift', {finalHeavyPreferences, bench: 1, squat: 1}));
  assert.deepEqual(support.issues, []);
  assert.equal(support.config.strengthModes.Bench, 'maintenance');
  assert.equal(support.config.strengthModes.Squat, 'maintenance');
  assert.deepEqual(support.finalExposures.map(ex => ex[0]), ['Deadlift']);
  const supportingWork = support.programme.weeks.at(-2).sessions.flatMap(session => session.ex)
    .filter(ex => ['Bench', 'Squat'].includes(ex[0]));
  assert.ok(supportingWork.length > 0);
  assert.ok(supportingWork.every(ex => ex[4] <= 6));
});

test('competition and running calendar protects same-day and close-event conflicts', () => {
  assert.throws(() => review(profile('bench', {runningTargetDate: MEET})), /same date/);
  const race = '2026-12-13';
  const overlap = review(profile('bench', {
    runningTargetDate: race, runs: 3, runGoal: '10k', hybridFocus: 'balanced',
    runProfile: {distance: 10, seconds: 3000, recency: 'recent', weeklyKm: 22},
    finalHeavyPreferences: {Bench: {mode: 'athlete', date: race}},
    visitConstraints: {strengthVisits: 1, combinedDays: DAYS,
      eventDays: {[MEET]: {confirmed: true}, [race]: {confirmed: true}}}
  }));
  assert.ok(overlap.issues.some(issue => /overlaps a running event/.test(issue)));
  assert.equal(overlap.finalExposures.length, 0);
  const nextDay = '2026-12-20';
  const adjacent = review(profile('deadlift', {
    runningTargetDate: nextDay, runs: 3, runGoal: '10k',
    runProfile: {distance: 10, seconds: 3000, recency: 'recent', weeklyKm: 22},
    visitConstraints: {strengthVisits: 1, combinedDays: DAYS,
      eventDays: {[MEET]: {confirmed: true}, [nextDay]: {confirmed: true}}}
  }));
  const run = adjacent.sessions.find(session => session.eventType === 'running');
  assert.equal(run.recoveryReviewRequired, true);
});

test('pre-marker configs retain their existing output contract and no timing preferences are injected', () => {
  const legacy = profile('bench');
  delete legacy.competitionIntakeVersion;
  const {config, programme, sessions} = review(legacy);
  assert.equal(config.finalHeavyPreferences, undefined);
  assert.equal(programme.finalHeavyPlan, undefined);
  assert.equal(sessions.find(session => session.eventType === 'strength').name, 'Strength competition');
  assert.equal(sessions.some(session => session.competitionLifts), false);
});
