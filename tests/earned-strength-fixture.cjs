const catalogue = require('../src/programme-catalogue.js');
const native = require('../src/native-catalogue.js');
const training = require('../src/catalogue-training.js');
const registry = require('../src/exercise-registry.js');
const gym = require('../src/gym-equipment.js');
const {fullInventory} = require('./equipment-fixtures.cjs');

const copy = value => JSON.parse(JSON.stringify(value));
function programme(id, reference = 160, start = '2026-11-16', planId = 'fictional-plan') {
  const plan = {id: planId, start, snapshot: catalogue.previewProgramme(id, {
    referenceKg: {'competition-bench': reference, 'competition-squat': 140, 'competition-deadlift': 170},
  })};
  const result = native.buildProgramme([plan], null, {
    training, registry, gym, inventory: fullInventory(), equipment: [], now: start + 'T09:00:00Z',
  });
  return {plan, result};
}

function completed(state, session, date, transform = ex => ex) {
  const ex = session.ex.map(item => transform(copy(item)));
  const row = {id: session.id, week: session.week, date, name: session.name, component: 'strength',
    plannedSets: ex.reduce((sum, item) => sum + item[1], 0),
    completedSets: ex.reduce((sum, item) => sum + item[1], 0),
    prescription: {ex, runs: []}};
  state.completedWorkouts.push(row);
  for (const item of ex) {
    for (let set = 1; set <= item[1]; set++) {
      state.sets.push({date, sessionId: row.id, week: row.week, exercise: item[0], set,
        reps: item[2], weight: item[3] || 20, rpe: item[4], target: item[4],
        exerciseId: item[5].exerciseId, loadType: item[5].loadType, doseUnit: item[5].doseUnit});
    }
  }
  return row;
}

function fixture(id = 'powerlifting-four-day', kind = 'peak', {futureRace = false} = {}) {
  const base = programme(id);
  let target;
  if (kind === 'peak') {
    target = base.result.weeks[9].sessions.find(row => row.ex.some(ex =>
      ex[5].exerciseId === 'competition-bench' && ex[1] === 1 && ex[2] === 1));
  } else {
    const volume = programme('general-strength', 157.5, '2027-01-11', 'fictional-volume');
    Object.assign(base, volume);
    target = base.result.weeks[0].sessions.find(row => row.ex.some(ex =>
      ex[5].exerciseId === 'competition-bench' && ex[1] === 3 && ex[2] === 5));
  }
  const running = {id: 'fictional-running', start: futureRace ? training.addDays(base.plan.start, (target.week - 1) * 7) : base.plan.start,
    snapshot: catalogue.previewProgramme('10k-two-run', {recent10kSeconds: 3900})};
  base.result = native.buildProgramme([base.plan, running], null, {
    training, registry, gym, inventory: fullInventory(), equipment: [], now: base.plan.start + 'T09:00:00Z',
  });
  const state = {onboardingComplete: true, customRoadmap: base.result.config,
    reviewedProgramme: base.result, activeSchedule: base.result.weeks[target.week - 1].sessions,
    activeCustomWeek: target.week, completedWorkouts: [], sets: [], runs: [], checkins: [],
    equipmentInventory: fullInventory(), decisions: [], overrides: {}};
  const runDate = training.addDays(base.plan.start, -2) + 'T10:00:00Z';
  state.runs.push({sessionId: 'fictional-prior-run', date: runDate, week: 1, km: 3, min: 20});
  state.completedWorkouts.push({id: 'fictional-prior-run', date: runDate, week: 1, component: 'run',
    completedRun: true, name: 'Prior fictional easy run', prescription: {ex: [], runs: [{distanceKm: 3}]}});
  if (kind === 'peak') {
    for (const [week, actual] of [[7, 142.5], [9, 145]]) {
      const session = base.result.weeks[week - 1].sessions.find(row => row.ex.some(ex =>
        ex[5].exerciseId === 'competition-bench' && ex[1] === 1 && ex[2] === 1));
      const row = completed(state, session, session.scheduledDate + 'T10:00:00Z');
      for (const set of state.sets.filter(set => set.sessionId === row.id &&
        set.exerciseId === 'competition-bench' && set.reps === 1)) set.weight = actual;
    }
  } else {
    for (const [i, reference, weight] of [[0, 152.5, 112.5], [1, 157.5, 115], [2, 157.5, 117.5]]) {
      const old = programme('general-strength', reference, training.addDays('2027-01-11', -21 + i * 7), 'prior-volume-' + i);
      const session = old.result.weeks[0].sessions.find(row => row.ex.some(ex =>
        ex[5].exerciseId === 'competition-bench' && ex[1] === 3 && ex[2] === 5));
      const row = completed(state, session, session.scheduledDate + 'T10:00:00Z');
      for (const set of state.sets.filter(set => set.sessionId === row.id &&
        set.exerciseId === 'competition-bench')) set.weight = weight;
    }
  }
  const index = target.ex.findIndex(ex => ex[5].exerciseId === 'competition-bench' &&
    ex[1] === (kind === 'peak' ? 1 : 3) && ex[2] === (kind === 'peak' ? 1 : 5));
  const now = target.scheduledDate + 'T11:00:00Z';
  const live = {...copy(target), sourceProgrammeWeek: target.week, started: now, entries: {}, notes: ''};
  return {state, live, index, now, plan: base.plan};
}
module.exports = {fixture, programme, completed};
