const assert = require('node:assert/strict');
const { test } = require('node:test');
const catalogue = require('../src/programme-catalogue.js');

test('the four-day powerlifting prescription keeps its weekly lift and accessory doses', () => {
  const { weeks } = catalogue.previewProgramme('powerlifting-four-day');
  assert.deepEqual(weeks.map(week => week.sessions.length), [...Array(11).fill(4), 3]);
  const totals = kind => weeks.map(week => week.sessions
    .flatMap(session => session.groups ?? [])
    .filter(group => group.kind === kind)
    .reduce((sum, group) => sum + group.sets, 0));
  assert.deepEqual(totals('lift'), [21, 24, 24, 13, 24, 24, 24, 13, 23, 21, 14, 8]);
  assert.deepEqual(totals('accessory'), [13, 13, 13, 6, 13, 13, 13, 6, 6, 6, 0, 0]);
  assert.deepEqual(weeks[11].sessions.map(session => [session.id, session.day]),
    [['A', 0], ['B', 2], ['meet', 5]]);
  assert.equal(weeks[10].sessions[0].groups.at(-1).exerciseId, 'competition-bench');
  assert.equal(weeks[10].sessions[2].groups.some(group => group.exerciseId.includes('bench')), false);
});

test('only exact lift references provide kilos and RPE distinguishes targets and caps', () => {
  const options = { referenceKg: { 'competition-bench': 95, 'competition-squat': 140, 'competition-deadlift': 170 } };
  const { weeks } = catalogue.previewProgramme('powerlifting-four-day', options);
  const opening = weeks[0].sessions;
  assert.equal(opening[1].groups[0].suggestedWeightKg, 67.5);
  assert.equal(opening[1].groups[0].rpeMode, 'final-set-target');
  assert.equal(opening[0].groups[1].suggestedWeightKg, null);
  assert.equal(opening[2].groups[2].suggestedWeightKg, null);
  const heavy = weeks[6].sessions;
  assert.deepEqual([heavy[0], heavy[2], heavy[3]].map(session => session.groups[0].suggestedWeightKg),
    [122.5, 150, 82.5]);
  assert.equal(heavy[3].groups[0].rpeMode, 'cap');
  assert.equal(weeks[11].sessions[0].groups[0].rpeMode, 'cap');
  const tie = catalogue.previewProgramme('powerlifting-four-day', {
    referenceKg: { 'competition-squat': 62.5 }, loadIncrementKg: 2,
  });
  assert.equal(tie.weeks[0].sessions[0].groups[0].suggestedWeightKg, 44);
});

test('the two-run 10K keeps race week to two outings and counts recovery between reps', () => {
  const { weeks } = catalogue.previewProgramme('10k-two-run', { recent10kSeconds: 3300 });
  assert.deepEqual(weeks.map(week => week.sessions.length), Array(6).fill(2));
  assert.deepEqual(weeks.map(week => week.sessions.reduce((total, session) => total + session.distanceMetres, 0)),
    [16000, 18000, 19500, 15500, 20000, 17000]);
  assert.deepEqual(weeks.map(week => week.sessions[0].steps.filter(step => step.role === 'recovery').length),
    [2, 3, 2, 3, 1, 1]);
  assert.equal(weeks[4].sessions[0].steps[1].paceSecondsPerKm, 330);
  assert.equal(weeks[5].sessions[1].steps.find(step => step.role === 'race').distanceMetres, 10000);
  assert.equal(weeks[5].sessions[1].day, 6);
  assert.equal(weeks[0].sessions[0].steps[1].paceSecondsPerKm, null);
});

test('preview calls return independent data and reject invalid programme input', () => {
  assert.equal(catalogue.listProgrammes().length, 13);
  const preview = catalogue.previewProgramme('10k-two-run');
  preview.weeks[0].sessions[0].steps[0].distanceMetres = 1;
  assert.equal(catalogue.previewProgramme('10k-two-run').weeks[0].sessions[0].steps[0].distanceMetres, 1500);
  assert.throws(() => catalogue.previewProgramme('missing'), RangeError);
  assert.throws(() => catalogue.previewProgramme('powerlifting-four-day', { loadIncrementKg: 0 }), RangeError);
});

test('the original catalogue, both marathon formats and continuations resolve every session', () => {
  const ids = new Set();
  for (const entry of catalogue.listProgrammes()) {
    assert.equal(ids.has(entry.id), false);
    ids.add(entry.id);
    const plan = catalogue.previewProgramme(entry.id);
    assert.equal(plan.weeks.length, entry.durationWeeks);
    for (const week of plan.weeks) {
      const keys = week.sessions.map(session => session.id);
      assert.equal(new Set(keys).size, keys.length, entry.id + ' week ' + week.week);
      assert.ok(week.sessions.every(session => session.day >= 0 && session.day <= 6));
      for (const session of week.sessions.filter(session => session.kind === 'run')) {
        for (const step of session.steps) {
          assert.ok(step.distanceMetres > 0 || step.durationSeconds > 0);
        }
      }
    }
  }
  const bridge = catalogue.previewProgramme('lifting-foundation', { continuation: true }).weeks.slice(6);
  assert.deepEqual(bridge.map(week => week.sessions.flatMap(s => s.groups).reduce((n, g) => n + g.sets, 0)),
    [28, 30, 32]);
  const base = catalogue.previewProgramme('running-base', { continuation: true }).weeks;
  assert.equal(base.length, 14);
  assert.equal(base[8].sessions[0].steps.filter(step => step.effort === 'threshold').length, 2);
  assert.equal(base[13].sessions[2].durationSeconds, 95 * 60);
});

test('the four-day opener preserves main-lift doses and returns to the written exercises in week five', () => {
  const signatures = id => catalogue.previewProgramme(id).weeks.map(week =>
    week.sessions.flatMap(s => s.groups ?? []).filter(g => g.kind === 'lift')
      .map(g => [g.openingVariationFor ?? g.exerciseId, g.sets, g.reps,
        week.week <= 4 ? null : g.referencePercent, g.rpe].join('/')).sort());
  assert.deepEqual(signatures('powerlifting-three-day'), signatures('powerlifting-four-day'));
});

test('opening variations use the available equipment and replace only named secondary slots for four weeks', () => {
  const baseline = catalogue.previewProgramme('powerlifting-four-day');
  const weaknesses = { squat: 'torso', bench: 'middle', deadlift: 'start' };
  const equipment = ['safety-squat-bar', 'bench-safeties', 'deficit-platform'];
  const options = { weaknesses, equipment, referenceKg: { 'competition-squat': 140, 'safety-bar-squat': 120 } };
  const plan = catalogue.previewProgramme('powerlifting-four-day', options);
  assert.deepEqual(plan.openingVariations.map(item => item.exerciseId),
    ['safety-bar-squat', 'pin-press', 'deficit-deadlift']);
  for (const [i, week] of plan.weeks.entries()) {
    if (i >= 4) {
      const other = baseline.weeks[i];
      assert.deepEqual(week.sessions.map(s => (s.groups ?? []).map(g => g.exerciseId)),
        other.sessions.map(s => (s.groups ?? []).map(g => g.exerciseId)));
      assert.ok(week.sessions.every(s => (s.groups ?? []).every(g => !g.openingVariationFor)));
      continue;
    }
    const groups = week.sessions.flatMap(s => s.groups);
    assert.equal(groups.filter(g => g.openingVariationFor).length, 3);
    assert.equal(week.sessions[0].groups[0].exerciseId, 'competition-squat');
    assert.ok(groups.filter(g => g.openingVariationFor).every(g => g.referencePercent === null && g.suggestedWeightKg === null));
  }
  const withoutKit = catalogue.previewProgramme('powerlifting-four-day', { weaknesses });
  assert.deepEqual(withoutKit.openingVariations.map(item => item.exerciseId),
    ['paused-squat', 'close-grip-bench', 'paused-deadlift']);
  assert.ok(withoutKit.openingVariations.every(item => item.missingKit));
  const front = catalogue.previewProgramme('powerlifting-four-day', { weaknesses, comfortableFrontRack: true });
  assert.equal(front.openingVariations[0].exerciseId, 'front-squat');
  assert.deepEqual(baseline.openingVariations.map(item => item.exerciseId), ['paused-squat', 'paused-bench', 'paused-deadlift']);
  assert.equal(catalogue.previewProgramme('powerlifting-three-day').openingVariations, undefined);
  assert.throws(() => catalogue.previewProgramme('powerlifting-four-day', { weaknesses: { bench: 'custom' } }), /listed bench/);
});

test('distance plans reconcile against the reviewed weekly totals', () => {
  const totals = id => catalogue.previewProgramme(id).weeks.map(week =>
    week.sessions.reduce((total, session) => total + session.distanceMetres, 0));
  const km = values => values.map(n => Math.round(n * 1000));
  assert.deepEqual(totals('10k-three-run'), km([22, 24, 27, 21, 29, 21]));
  assert.deepEqual(totals('half-marathon'), km([28, 30, 32, 28, 34, 36, 38, 32, 40, 43, 32, 36.6]));
  assert.deepEqual(totals('marathon-distance'),
    km([30, 32, 34, 30, 36, 38, 40, 34, 42, 44, 46, 38, 48, 50, 52, 43, 54, 56, 58, 47, 60, 47, 36, 56.195]));
  const timed = catalogue.previewProgramme('marathon-timed').weeks;
  assert.equal(timed[20].sessions[3].durationSeconds, 200 * 60);
  assert.equal(timed[23].sessions[3].distanceMetres, 42195);
});
