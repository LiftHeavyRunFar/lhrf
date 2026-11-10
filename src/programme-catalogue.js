/* Fixed, reviewed LHRF programme catalogue. Pure and usable offline. */
(function (root) {
  'use strict';

  const REVISION = 'phase-one-frequency-2026-11-10';
  const exercises = {
    SQ: 'competition-squat',
    BP: 'competition-bench',
    DL: 'competition-deadlift',
    PB: 'paused-bench',
    PD: 'paused-deadlift',
  };
  // Day offsets are zero-based from the programme week's Monday.
  const slots = [
    { id: 'A', day: 0, title: 'Squat and support' },
    { id: 'B', day: 2, title: 'Bench volume' },
    { id: 'C', day: 4, title: 'Deadlift and support' },
    { id: 'D', day: 6, title: 'Main bench' },
  ];

  // One row per week and one column per visit. Each group names the lift
  // and gives sets × reps / percentage of reference / RPE. "-" means effort only.
  const powerlifting = [
    ['SQ 4x5/72/7, PD 2x4/-/6', 'BP 3x6/70/7', 'DL 3x5/73/7, SQ 3x5/66/6, PB 3x5/-/7', 'BP 3x5/73/7'],
    ['SQ 4x5/74/7, PD 2x4/-/6', 'BP 4x6/71/7', 'DL 4x4/76/7, SQ 3x5/69/7, PB 3x5/-/7', 'BP 4x5/74/7'],
    ['SQ 4x5/76/8, PD 2x4/-/6', 'BP 4x5/74/7', 'DL 4x4/78/8, SQ 3x5/71/7, PB 3x5/-/7', 'BP 4x5/76/8'],
    ['SQ 2x4/65/6, PD 1x4/-/6', 'BP 2x5/65/6', 'DL 2x3/67/6, SQ 2x4/63/6, PB 2x4/-/6', 'BP 2x4/65/6'],
    ['SQ 4x4/78/7, PD 2x3/-/6', 'BP 4x5/75/7', 'DL 4x3/80/7, SQ 3x4/72/7, PB 3x4/-/7', 'BP 4x4/78/7'],
    ['SQ 4x3/82/8, PD 2x3/-/6', 'BP 4x4/78/7', 'DL 4x3/82/8, SQ 3x4/74/7, PB 3x4/-/7', 'BP 4x3/82/8'],
    ['SQ 1x1/88/8, SQ 3x3/81/8, PD 2x3/-/6', 'BP 4x4/79/8', 'DL 1x1/88/8, DL 3x3/81/8, SQ 3x3/76/7, PB 3x3/-/7', 'BP 1x1/88/8, BP 3x3/81/8'],
    ['SQ 2x3/69/6, PD 1x3/-/6', 'BP 2x4/68/6', 'DL 2x3/69/6, SQ 2x3/66/6, PB 2x3/-/6', 'BP 2x3/68/6'],
    ['SQ 1x1/89/8, SQ 3x3/82/8, DL 2x2/70/6', 'BP 3x4/78/7', 'DL 1x1/89/8, DL 3x2/83/8, SQ 3x3/75/7, BP 3x3/74/7', 'BP 1x1/89/8, BP 3x3/82/8'],
    ['SQ 1x1/91/8.5, SQ 3x2/84/8, DL 2x2/68/6', 'BP 3x3/79/7', 'DL 1x1/91/8.5, DL 2x2/84/8, SQ 2x2/77/7, BP 3x3/76/7', 'BP 1x1/91/8.5, BP 3x2/84/8'],
    ['SQ 1x1/90/8, SQ 2x2/78/7, BP 2x2/72/6', 'BP 2x3/73/7', 'DL 1x1/89/8, DL 1x2/76/7, SQ 2x2/67/6', 'BP 1x1/90/8, BP 2x2/74/7'],
    ['SQ 2x2/65/6, BP 2x2/65/6, DL 2x1/67/6', 'BP 2x1/62/6'],
  ];
  const accessories = [
    { slot: 'A', exerciseId: 'split-squat', sets: 2, reps: 8, perSide: true, purpose: 'Unilateral knee and hip work' },
    { slot: 'A', exerciseId: 'cable-crunch', sets: 2, reps: 12, purpose: 'Loaded trunk flexion' },
    { slot: 'B', exerciseId: 'chest-supported-row', sets: 3, reps: 10, lateSets: 2, purpose: 'Horizontal pulling and upper-back volume' },
    { slot: 'B', exerciseId: 'triceps-pushdown', sets: 2, reps: 12, lateSets: 2, purpose: 'Direct elbow extension' },
    { slot: 'C', exerciseId: 'leg-curl', sets: 2, reps: 12, purpose: 'Knee flexion' },
    { slot: 'D', exerciseId: 'lat-pulldown', sets: 2, reps: 10, lateSets: 2, purpose: 'Vertical pulling volume' },
  ];

  // metres for warm-up, repetitions, recovery between reps, and cool-down
  const running = [
    { repeats: 3, work: 1000, effort: 'threshold', recovery: 400, coolDown: 1700, long: 9000 },
    { repeats: 4, work: 1000, effort: '10k', recovery: 400, coolDown: 1300, long: 10000 },
    { repeats: 3, work: 1500, effort: '10k', recovery: 400, coolDown: 1700, long: 11000 },
    { repeats: 4, work: 600, effort: '10k', recovery: 300, coolDown: 1700, long: 9000 },
    { repeats: 2, work: 2500, effort: '10k', recovery: 500, coolDown: 2000, long: 11000 },
    { repeats: 2, work: 1000, effort: '10k', recovery: 300, coolDown: 1200 },
  ];

  function strengthGroups(cell, week, slot) {
    return cell.split(', ').map(group => {
      const match = /^([A-Z]{2}) (\d+)x(\d+)\/(\d+|-)\/(\d+(?:\.\d+)?)$/.exec(group);
      if (!match || !exercises[match[1]]) throw new Error('Invalid catalogue lift group: ' + group);
      const [, lift, sets, reps, percent, effort] = match;
      const rpe = Number(effort);
      const secondary = (slot === 'A' && (lift === 'PD' || lift === 'DL' || lift === 'BP')) ||
        (slot === 'C' && lift !== 'DL');
      const rpeIsCap = week === 4 || week === 8 || week === 12 ||
        (sets === '1' && reps === '1') || lift === 'PB' || lift === 'PD' || (secondary && rpe === 6);
      const technique = lift === 'PB' ? 'Hold a two-count pause at the chest' :
        lift === 'PD' ? 'Pause one count just off the floor and reset each rep' : undefined;
      return {
        exerciseId: exercises[lift], kind: 'lift', sets: Number(sets), reps: Number(reps),
        referencePercent: percent === '-' ? null : Number(percent), rpe,
        rpeMode: rpeIsCap ? 'cap' : 'final-set-target', technique,
      };
    });
  }

  function accessoryGroups(week, slot) {
    const unload = week === 4 || week === 8;
    const result = [];
    if (week >= 11) return result;
    for (const item of accessories) {
      if (item.slot !== slot || (week >= 9 && !item.lateSets)) continue;
      result.push({
        exerciseId: item.exerciseId, kind: 'accessory', purpose: item.purpose,
        sets: unload ? 1 : week >= 9 ? item.lateSets : item.sets,
        reps: item.reps, perSide: item.perSide === true,
        referencePercent: null, rpe: unload ? 6 : 7,
        rpeMode: unload ? 'cap' : 'final-set-target',
      });
    }
    return result;
  }

  function powerliftingWeeks() {
    return powerlifting.map((cells, index) => {
      const week = index + 1;
      const sessions = cells.map((cell, column) => {
        const slot = slots[column];
        return {
          ...slot, kind: 'strength',
          groups: [...strengthGroups(cell, week, slot.id), ...accessoryGroups(week, slot.id)],
        };
      });
      if (week === 12) {
        sessions.push({ id: 'meet', day: 5, kind: 'event', title: 'Powerlifting meet or mock',
          exerciseIds: [exercises.SQ, exercises.BP, exercises.DL] });
      }
      return { week, sessions };
    });
  }

  function runSession(id, day, title, steps) {
    return {
      id, day, title, kind: 'run',
      distanceMetres: steps.reduce((total, step) => total + step.distanceMetres, 0),
      steps,
    };
  }

  function runningWeeks() {
    return running.map((dose, index) => {
      const steps = [{ role: 'warm-up', effort: 'easy', distanceMetres: 1500 }];
      for (let rep = 0; rep < dose.repeats; rep += 1) {
        if (rep > 0) steps.push({ role: 'recovery', effort: 'easy', distanceMetres: dose.recovery });
        steps.push({ role: 'work', effort: dose.effort, distanceMetres: dose.work });
      }
      steps.push({ role: 'cool-down', effort: 'easy', distanceMetres: dose.coolDown });
      const longer = dose.long
        ? runSession('long', 5, 'Easy long run', [{ role: 'work', effort: 'easy', distanceMetres: dose.long }])
        : runSession('race', 6, 'Measured 10K race or test', [
          { role: 'warm-up', effort: 'easy', distanceMetres: 1500 },
          { role: 'race', effort: 'race', distanceMetres: 10000 },
          { role: 'cool-down', effort: 'easy', distanceMetres: 500 },
        ]);
      return { week: index + 1, sessions: [runSession('quality', 2, 'Quality run', steps), longer] };
    });
  }

  const entries = [
    { id: 'powerlifting-four-day', title: 'Four-day powerlifting', discipline: 'strength',
      sessionsPerWeek: 4, durationWeeks: 12,
      entry: 'Recent practice of all three competition lifts and controlled RPE 7–8 singles. Compare recent training with week one: seven squat, nine bench and five deadlift sets, plus accessories.',
      build: powerliftingWeeks },
    { id: '10k-two-run', title: 'Two-run 10K sharpening', discipline: 'running',
      sessionsPerWeek: 2, durationWeeks: 6,
      entry: 'For established runners prioritising lifting. Recent weeks usually include two runs and 16–22 km, a 9 km easy outing, and controlled faster work or a hard 5K.',
      build: runningWeeks },
  ];

  function listProgrammes() {
    return entries.map(({ build, ...summary }) => summary);
  }

  function previewProgramme(id, { referenceKg = {}, loadIncrementKg = 2.5, recent10kSeconds = null } = {}) {
    const entry = entries.find(item => item.id === id);
    if (!entry) throw new RangeError('Unknown catalogue programme: ' + id);
    if (!Number.isFinite(loadIncrementKg) || loadIncrementKg <= 0) {
      throw new RangeError('The load increment must be positive.');
    }
    const weeks = entry.build();
    for (const { sessions } of weeks) {
      for (const session of sessions) {
        for (const group of session.groups ?? []) {
          const reference = referenceKg[group.exerciseId];
          group.suggestedWeightKg = null;
          if (group.referencePercent === null || !Number.isFinite(reference) || reference <= 0) continue;
          const increments = reference * group.referencePercent / (100 * loadIncrementKg);
          const whole = Math.floor(increments);
          // Ties round down, including normal floating-point noise on a half step.
          const rounded = increments - whole > 0.5 + Number.EPSILON * increments ? whole + 1 : whole;
          group.suggestedWeightKg = rounded > 0 ? Number((rounded * loadIncrementKg).toFixed(8)) : null;
        }
        for (const step of session.steps ?? []) {
          step.paceSecondsPerKm = step.effort === '10k' && Number.isFinite(recent10kSeconds) &&
            recent10kSeconds > 0 ? Math.round(recent10kSeconds / 10) : null;
        }
      }
    }
    return { ...listProgrammes().find(item => item.id === id), revision: REVISION, weeks };
  }

  const api = Object.freeze({ listProgrammes, previewProgramme });
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LHRFProgrammeCatalogue = api;
})(typeof globalThis === 'object' ? globalThis : this);
