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
  assert.deepEqual(catalogue.listProgrammes().map(entry => entry.id), ['powerlifting-four-day', '10k-two-run']);
  const preview = catalogue.previewProgramme('10k-two-run');
  preview.weeks[0].sessions[0].steps[0].distanceMetres = 1;
  assert.equal(catalogue.previewProgramme('10k-two-run').weeks[0].sessions[0].steps[0].distanceMetres, 1500);
  assert.throws(() => catalogue.previewProgramme('missing'), RangeError);
  assert.throws(() => catalogue.previewProgramme('powerlifting-four-day', { loadIncrementKg: 0 }), RangeError);
});
