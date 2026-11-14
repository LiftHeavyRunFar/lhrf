/* Fixed, reviewed LHRF programme catalogue. Pure and usable offline. */
(function (root) {
  'use strict';

  const REVISION = 'phase-one-frequency-2026-11-10-v2';
  const exercises = {
    SQ: 'competition-squat',
    BP: 'competition-bench',
    DL: 'competition-deadlift',
    PB: 'paused-bench',
    PD: 'paused-deadlift',
    CB: 'close-grip-bench',
    OH: 'overhead-press',
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

  function strengthGroups(cell) {
    return cell.split(', ').map(group => {
      const match = /^([A-Z]{2}) (\d+)x(\d+)\/(\d+|-)\/(\d+(?:\.\d+)?)$/.exec(group);
      if (!match || !exercises[match[1]]) throw new Error('Invalid catalogue lift group: ' + group);
      const [, lift, sets, reps, percent, effort] = match;
      const rpe = Number(effort);
      const rpeIsCap = rpe === 6 || (sets === '1' && reps === '1') || lift === 'PB' || lift === 'PD';
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

  const variationEquipment = [
    { id: 'safety-squat-bar', label: 'Safety squat bar' },
    { id: 'bench-safeties', label: 'Rack safeties suitable for a bench pin press' },
    { id: 'deficit-platform', label: 'Stable low deficit platform' },
    { id: 'low-pull-blocks', label: 'Low pulling blocks' },
  ];
  const variationDrills = {
    'paused-squat': 'Hold tension through a two-second pause at depth, then stand without a second dip.',
    'tempo-squat': 'Take about three seconds down and stand with normal intent.',
    'safety-bar-squat': 'Keep your torso and upper-back position repeatable through the rep.',
    'front-squat': 'Use a comfortable front rack and keep an upright, repeatable position.',
    'paused-bench': 'Hold a steady two-count pause at the chest before pressing.',
    'spoto-press': 'Pause just above the chest before reversing.',
    'close-grip-bench': 'Use a modestly narrower grip and a controlled full range.',
    'pin-press': 'Set the safeties at the repeatable sticking height and start from a dead stop.',
    'paused-deadlift': 'Pause one count just off the floor and reset each rep.',
    'deficit-deadlift': 'Use a small stable deficit and keep your usual stance, bracing and bar proximity.',
    'below-knee-paused-deadlift': 'Pause below the knee for one count while keeping the bar close.',
    'low-block-pull': 'Use low blocks and practise a smooth finish from a sound position.',
  };
  const variationSlots = {
    squat: {
      slotId: 'C', original: exercises.SQ,
      options: {
        unsure: { label: 'No repeatable issue yet', drill: 'paused-squat', reason: 'Practise holding tension and depth.' },
        depth: { label: 'Lose tension at the bottom', drill: 'paused-squat', reason: 'Practise staying tight at depth.' },
        descent: { label: 'Shift or lose balance on the way down', drill: 'tempo-squat', reason: 'Practise controlling the descent and balance.' },
        torso: { label: 'Torso folds as I stand', drill: 'safety-bar-squat', requires: 'safety-squat-bar',
          alternative: { drill: 'front-squat', requires: 'comfortable-front-rack' }, fallback: 'paused-squat',
          reason: 'Practise holding torso position out of the bottom.' },
      },
    },
    bench: {
      slotId: 'C', original: exercises.PB,
      options: {
        unsure: { label: 'No repeatable issue yet', drill: 'paused-bench', reason: 'Practise a stable touch and repeatable press.' },
        chest: { label: 'Lose tension at the chest or just above it', drill: 'spoto-press', reason: 'Practise controlling the bar just above the chest.' },
        middle: { label: 'Stall at the same height above the chest', drill: 'pin-press', requires: 'bench-safeties',
          fallback: 'close-grip-bench', reason: 'Practise producing force through the later part of the press.' },
        lockout: { label: 'Struggle to finish the press', drill: 'close-grip-bench', reason: 'Give elbow extension more emphasis.' },
      },
    },
    deadlift: {
      slotId: 'A', original: exercises.PD,
      options: {
        unsure: { label: 'No repeatable issue yet', drill: 'paused-deadlift', reason: 'Practise keeping your start position under load.' },
        floor: { label: 'Lose position as the bar leaves the floor', drill: 'paused-deadlift', reason: 'Practise keeping your start position under load.' },
        start: { label: 'Slow off the floor despite a steady start position', drill: 'deficit-deadlift', requires: 'deficit-platform',
          fallback: 'paused-deadlift', reason: 'Practise producing force early in the pull.' },
        knee: { label: 'Bar drifts or I lose position below the knee', drill: 'below-knee-paused-deadlift', reason: 'Practise keeping the bar close through the transition.' },
        lockout: { label: 'Struggle to lock out after a clean pull past the knee', drill: 'low-block-pull', requires: 'low-pull-blocks',
          fallback: 'below-knee-paused-deadlift', reason: 'Practise finishing from a sound position.' },
      },
    },
  };

  function powerliftingVariationSetup() {
    return {
      weaknesses: Object.entries(variationSlots).map(([lift, { options }]) => ({
        lift, choices: Object.entries(options).map(([id, option]) => ({ id, label: option.label })),
      })),
      equipment: variationEquipment.map(item => ({ ...item })),
    };
  }

  function prescribeOpeningVariations(weeks, weaknesses, equipment, comfortableFrontRack) {
    const available = new Set(equipment);
    if (comfortableFrontRack) available.add('comfortable-front-rack');
    return Object.entries(variationSlots).map(([lift, { slotId, original, options }]) => {
      const answer = weaknesses[lift] ?? 'unsure';
      const choice = Object.hasOwn(options, answer) ? options[answer] : null;
      if (!choice) throw new RangeError('Choose a listed ' + lift + ' weakness.');
      const kitAvailable = !choice.requires || available.has(choice.requires);
      const exerciseId = kitAvailable ? choice.drill :
        choice.alternative && available.has(choice.alternative.requires) ? choice.alternative.drill : choice.fallback;
      const missingKit = kitAvailable ? null : variationEquipment.find(item => item.id === choice.requires).label;
      for (const week of weeks.slice(0, 4)) {
        const group = week.sessions.find(session => session.id === slotId).groups.find(item => item.exerciseId === original);
        Object.assign(group, { exerciseId, technique: variationDrills[exerciseId], referencePercent: null,
          openingVariationFor: original });
      }
      return { lift, exerciseId, reason: choice.reason, missingKit };
    });
  }

  function powerliftingWeeks() {
    return powerlifting.map((cells, index) => {
      const week = index + 1;
      const sessions = cells.map((cell, column) => {
        const slot = slots[column];
        return {
          ...slot, kind: 'strength',
          groups: [...strengthGroups(cell), ...accessoryGroups(week, slot.id)],
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

  const strengthTables = {
    'general-strength': [
      ['SQ 3x5/72/7, BP 3x5/72/7', 'DL 3x5/72/7, OH 3x8/-/7', 'BP 3x6/68/7, SQ 3x6/65/7'],
      ['SQ 4x5/74/7, BP 4x5/74/7', 'DL 3x5/74/7, OH 3x8/-/7', 'BP 3x6/70/7, SQ 3x6/68/7'],
      ['SQ 4x5/76/8, BP 4x5/76/8', 'DL 4x4/77/8, OH 3x8/-/7', 'BP 4x5/73/7, SQ 3x5/72/7'],
      ['SQ 2x5/64/6, BP 2x5/64/6', 'DL 2x4/65/6, OH 2x6/-/6', 'BP 2x5/62/6, SQ 2x5/62/6'],
      ['SQ 4x4/78/7, BP 4x4/78/7', 'DL 4x4/78/7, OH 3x6/-/7', 'BP 4x5/74/7, SQ 3x5/73/7'],
      ['SQ 4x3/83/8, BP 4x3/83/8', 'DL 4x3/82/8, OH 3x6/-/7', 'BP 4x4/77/7, SQ 3x4/76/7'],
      ['SQ 4x2/86/8, BP 4x2/86/8', 'DL 3x2/86/8, OH 2x6/-/7', 'BP 3x3/80/7, SQ 3x3/79/7'],
      ['SQ 2x2/68/6, BP 2x2/68/6', 'DL 2x2/68/6, OH 2x5/-/6', 'SQ 1x5/-/7, BP 1x5/-/7, DL 1x5/-/7'],
    ],
    'powerlifting-three-day': [
      ['SQ 4x5/72/7, BP 3x6/70/7', 'DL 3x5/73/7, PB 3x5/-/7', 'SQ 3x5/66/6, BP 3x5/73/7, PD 2x4/-/6'],
      ['SQ 4x5/74/7, BP 4x6/71/7', 'DL 4x4/76/7, PB 3x5/-/7', 'SQ 3x5/69/7, BP 4x5/74/7, PD 2x4/-/6'],
      ['SQ 4x5/76/8, BP 4x5/74/7', 'DL 4x4/78/8, PB 3x5/-/7', 'SQ 3x5/71/7, BP 4x5/76/8, PD 2x4/-/6'],
      ['SQ 2x4/65/6, BP 2x5/65/6', 'DL 2x3/67/6, PB 2x4/-/6', 'SQ 2x4/63/6, BP 2x4/65/6, PD 1x4/-/6'],
      ['SQ 4x4/78/7, BP 4x5/75/7', 'DL 4x3/80/7, PB 3x4/-/7', 'SQ 3x4/72/7, BP 4x4/78/7, PD 2x3/-/6'],
      ['SQ 4x3/82/8, BP 4x4/78/7', 'DL 4x3/82/8, PB 3x4/-/7', 'SQ 3x4/74/7, BP 4x3/82/8, PD 2x3/-/6'],
      ['SQ 1x1/88/8, SQ 3x3/81/8, BP 4x4/79/8', 'DL 1x1/88/8, DL 3x3/81/8, PB 3x3/-/7', 'SQ 3x3/76/7, BP 1x1/88/8, BP 3x3/81/8, PD 2x3/-/6'],
      ['SQ 2x3/69/6, BP 2x4/68/6', 'DL 2x3/69/6, PB 2x3/-/6', 'SQ 2x3/66/6, BP 2x3/68/6, PD 1x3/-/6'],
      ['SQ 1x1/89/8, SQ 3x3/82/8, BP 3x4/78/7', 'DL 1x1/89/8, DL 3x2/83/8, BP 3x3/74/7', 'SQ 3x3/75/7, BP 1x1/89/8, BP 3x3/82/8, DL 2x2/70/6'],
      ['SQ 1x1/91/8.5, SQ 3x2/84/8, BP 3x3/79/7', 'DL 1x1/91/8.5, DL 2x2/84/8, BP 3x3/76/7', 'SQ 2x2/77/7, BP 1x1/91/8.5, BP 3x2/84/8, DL 2x2/68/6'],
      ['SQ 1x1/90/8, SQ 2x2/78/7, BP 2x3/73/7', 'DL 1x1/89/8, DL 1x2/76/7, BP 2x2/72/6', 'SQ 2x2/67/6, BP 1x1/90/8, BP 2x2/74/7'],
      ['SQ 2x2/65/6, BP 2x2/65/6, DL 2x1/67/6', 'BP 2x1/62/6'],
    ],
    'bench-specialisation': [
      ['BP 4x5/75/7', 'CB 4x8/-/7', 'PB 4x4/-/6'],
      ['BP 4x5/77/8', 'CB 5x7/-/7', 'PB 4x4/-/7'],
      ['BP 5x4/80/8', 'CB 5x6/-/8', 'PB 4x4/-/7'],
      ['BP 2x4/66/6', 'CB 2x6/-/6', 'PB 2x3/-/6'],
      ['BP 1x1/86/7.5, BP 4x4/79/8', 'CB 4x6/-/7', 'PB 4x3/-/7'],
      ['BP 1x1/88/8, BP 4x3/82/8', 'BP 4x5/75/7', 'PB 4x3/-/7'],
      ['BP 1x1/90/8, BP 4x3/83/8', 'BP 4x4/78/7', 'BP 4x3/76/7'],
      ['BP 1x1/92/8.5, BP 3x2/85/8', 'BP 3x4/75/7', 'BP 3x2/78/7'],
      ['BP 1x1/90/8, BP 2x2/78/7', 'BP 3x3/72/6', 'BP 2x2/68/6'],
      ['BP 1x1/86/7.5, BP 1x2/65/6', 'BP 2x1/62/6'],
    ],
    'deadlift-specialisation': [
      ['DL 4x4/75/7', 'SQ 3x5/-/7, BP 3x6/-/7', 'PD 3x4/-/6'],
      ['DL 4x4/77/7', 'SQ 3x5/-/7, BP 3x6/-/7', 'PD 4x4/-/7'],
      ['DL 5x3/81/8', 'SQ 3x5/-/7, BP 3x6/-/7', 'PD 4x3/-/7'],
      ['DL 2x3/66/6', 'SQ 2x4/-/6, BP 2x5/-/6', 'PD 2x3/-/6'],
      ['DL 1x1/86/7.5, DL 4x3/80/8', 'SQ 3x4/-/7, BP 3x5/-/7', 'PD 3x4/-/7'],
      ['DL 1x1/88/8, DL 4x2/84/8', 'SQ 3x4/-/7, BP 3x5/-/7', 'PD 3x3/-/7'],
      ['DL 1x1/90/8, DL 4x2/85/8', 'SQ 2x4/-/7, BP 3x5/-/7', 'DL 3x3/75/7'],
      ['DL 1x1/92/8.5, DL 3x2/83/8', 'SQ 2x3/-/6, BP 2x5/-/7', 'DL 2x2/74/6'],
      ['DL 1x1/89/8, DL 2x2/76/7', 'SQ 2x3/-/6, BP 2x4/-/6', 'DL 2x2/65/6'],
      ['DL 2x1/65/6', 'BP 2x4/-/6'],
    ],
  };
  const strengthSupport = {
    'general-strength': [
      [['chest-supported-row', 3, 10], ['split-squat', 2, 8]],
      [['lat-pulldown', 3, 10], ['plank', 2, 30]],
      [['romanian-deadlift', 2, 8], ['chest-supported-row', 2, 12]],
    ],
    'powerlifting-three-day': [
      [['chest-supported-row', 3, 10], ['split-squat', 2, 8]],
      [['lat-pulldown', 2, 10], ['leg-curl', 2, 12]],
      [['triceps-pushdown', 2, 12], ['cable-crunch', 2, 12]],
    ],
    'bench-specialisation': [
      [['chest-supported-row', 3, 10], ['triceps-pushdown', 3, 12]],
      [['competition-squat', 2, 5], ['lat-pulldown', 3, 10]],
      [['competition-deadlift', 2, 4], ['rear-delt-dumbbell-fly', 2, 15]],
    ],
    'deadlift-specialisation': [
      [['leg-curl', 2, 12], ['cable-crunch', 2, 12]],
      [['chest-supported-row', 3, 10]],
      [['competition-bench', 3, 6], ['split-squat', 2, 8]],
    ],
  };
  const strengthTitles = {
    'general-strength': ['Squat and bench', 'Deadlift and press', 'Bench and squat'],
    'powerlifting-three-day': ['Squat and bench', 'Deadlift and bench', 'Squat, bench and pull'],
    'bench-specialisation': ['Competition bench', 'Volume bench', 'Technique bench'],
    'deadlift-specialisation': ['Main deadlift', 'Squat and bench', 'Secondary pull'],
  };

  function effortGroup(exerciseId, sets, reps, rpe, kind = 'accessory') {
    return {
      exerciseId, sets, reps, rpe, kind, referencePercent: null,
      rpeMode: rpe === 6 && kind === 'accessory' ? 'cap' : 'final-set-target',
      perSide: exerciseId === 'split-squat',
      doseUnit: exerciseId === 'plank' ? 'seconds' : 'reps',
    };
  }

  function supportFor(id, week, day) {
    let groups = strengthSupport[id][day].map(([exercise, sets, reps]) => effortGroup(exercise, sets, reps, 7));
    if (id === 'general-strength' && week === 8) return [];
    if (id === 'powerlifting-three-day' && week >= 9) {
      if (week >= 11) return [];
      groups = groups.filter(g => ['chest-supported-row', 'lat-pulldown', 'triceps-pushdown'].includes(g.exerciseId))
        .map(g => ({ ...g, sets: 2 }));
    }
    if (id === 'bench-specialisation' && week >= 8) {
      if (week === 10) return [];
      if (week === 9) return day === 0 ? [effortGroup('chest-supported-row', 2, 10, 7)] : [];
      groups = groups.filter(g => g.exerciseId !== 'rear-delt-dumbbell-fly').map(g =>
        g.exerciseId.startsWith('competition-')
          ? { ...g, sets: 1, rpe: 6, rpeMode: 'cap' } : { ...g, sets: 2 });
    }
    if (id === 'deadlift-specialisation' && week >= 8) {
      if (week === 8 && day === 2) return [effortGroup('competition-bench', 2, 6, 6)];
      if (week === 8 && day === 1) return [effortGroup('chest-supported-row', 2, 10, 7)];
      if (week === 9 && day === 1) return [effortGroup('chest-supported-row', 2, 10, 6)];
      return [];
    }
    const unload = week === 4 || (id === 'powerlifting-three-day' && week === 8);
    return unload ? groups.map(g => ({ ...g, sets: 1, rpe: 6, rpeMode: 'cap' })) : groups;
  }

  function writtenStrengthWeeks(id) {
    const focus = id === 'bench-specialisation' ? [exercises.BP] :
      id === 'deadlift-specialisation' ? [exercises.DL] : [exercises.SQ, exercises.BP, exercises.DL];
    return strengthTables[id].map((cells, index) => {
      const week = index + 1;
      const sessions = cells.map((cell, i) => {
        const slot = slots[i].id;
        const benchmark = id === 'general-strength' && week === 8 && i === 2;
        return {
          id: slot, day: slots[i].day, kind: 'strength',
          title: benchmark ? 'Strength benchmark' : strengthTitles[id][i],
          note: benchmark ? 'Default is five reps at RPE 7 per lift. Experienced lifters may choose a mock meet or test one priority lift.' : undefined,
          groups: [...strengthGroups(cell, week, slot, id), ...supportFor(id, week, i)],
        };
      });
      if (cells.length === 2) sessions.push({
        id: 'meet', day: 5, kind: 'event', title: 'Meet or mock', exerciseIds: focus,
      });
      return { week, sessions };
    });
  }

  function liftingFoundation({ continuation = false } = {}) {
    const progress = [[2, 8, 8, 6, 6], [2, 10, 8, 8, 6], [3, 8, 10, 8, 6],
      [3, 8, 10, 8, 7], [3, 10, 10, 10, 7], [3, 8, 8, 8, 7]];
    const weeks = progress.map(([sets, reps, hingeReps, singleLegReps, rpe], i) => {
      const groups = (ids, extra, extraReps) => {
        const result = [...ids.map(id => effortGroup(id, sets, reps, rpe, 'lift')),
          effortGroup(extra, 2, extraReps, rpe)];
        if (i === 0 || i === 3) for (const group of result) group.rpeMin = rpe - 1;
        return result;
      };
      return { week: i + 1, sessions: [
        { id: 'A', day: 0, kind: 'strength', title: 'Squat, press and row',
          groups: groups(['goblet-squat', 'dumbbell-bench-press', 'chest-supported-row'], 'dumbbell-romanian-deadlift', hingeReps) },
        { id: 'B', day: 3, kind: 'strength', title: 'Hinge, press and pulldown',
          groups: groups(['dumbbell-deadlift', 'dumbbell-overhead-press', 'lat-pulldown'], 'split-squat', singleLegReps) },
      ] };
    });
    if (continuation) {
      for (const [index, squatSets, supportSets, effort] of [[0, 2, 1, 6], [1, 2, 2, 6], [2, 3, 2, 7]]) {
        const base = structuredClone(weeks[5].sessions);
        base[1].day = 2;
        const practice = [
          effortGroup(exercises.SQ, squatSets, 6, effort, 'lift'),
          effortGroup(exercises.BP, squatSets, 6, effort, 'lift'),
          effortGroup('romanian-deadlift', supportSets, 8, effort),
          effortGroup('chest-supported-row', supportSets, 10, effort),
        ];
        if (index === 2) for (const group of practice) group.rpeMin = 6;
        weeks.push({ week: index + 7, sessions: [...base, {
          id: 'C', day: 4, kind: 'strength', title: 'Third-day practice', groups: practice,
        }] });
      }
    }
    return weeks;
  }

  const easyRun = (id, day, metres, title = 'Easy run') =>
    runSession(id, day, title, [{ role: 'work', effort: 'easy', distanceMetres: metres }]);

  function qualityRun(day, metres, count, distanceMetres, effort, recoveryMetres) {
    const steps = [{ role: 'warm-up', effort: 'easy', distanceMetres: 1500 }];
    for (let i = 0; i < count; i += 1) {
      if (i > 0) steps.push({ role: 'recovery', effort: 'easy', distanceMetres: recoveryMetres });
      steps.push({ role: 'work', effort, distanceMetres });
    }
    const coolDown = metres - 1500 - count * distanceMetres - (count - 1) * recoveryMetres;
    if (coolDown <= 0) throw new Error('Quality workout must include a positive cool-down.');
    steps.push({ role: 'cool-down', effort: 'easy', distanceMetres: coolDown });
    return runSession('quality', day, 'Quality run', steps);
  }

  function raceRun(distanceMetres, warmUp, coolDown, effort, title) {
    const steps = [{ role: 'race', effort, distanceMetres }];
    if (warmUp) steps.unshift({ role: 'warm-up', effort: 'easy', distanceMetres: warmUp });
    if (coolDown) steps.push({ role: 'cool-down', effort: 'easy', distanceMetres: coolDown });
    return runSession('race', 6, title, steps);
  }

  // Quality total, repetition count and distance, effort, jog, easy distances and long-run distance.
  const threeRun10k = [
    [7000, 3, 1000, 'threshold', 400, 6000, 9000],
    [8000, 4, 1000, '10k', 400, 6000, 10000],
    [9000, 5, 1000, '10k', 300, 7000, 11000],
    [7000, 4, 600, '10k', 300, 5000, 9000],
    [10000, 3, 2000, '10k', 500, 7000, 12000],
    [5000, 2, 1000, '10k', 300, 4000, 0],
  ];
  const halfMarathon = [
    [7000, 3, 1000, 'threshold', 400, 6000, 4000, 11000],
    [8000, 3, 1200, 'threshold', 400, 6000, 4000, 12000],
    [8000, 2, 2000, 'threshold', 500, 7000, 4000, 13000],
    [7000, 4, 600, 'threshold', 300, 6000, 4000, 11000],
    [9000, 3, 1500, 'threshold', 400, 7000, 4000, 14000],
    [9000, 2, 2500, 'half', 500, 8000, 4000, 15000],
    [10000, 3, 2000, 'half', 500, 8000, 4000, 16000],
    [8000, 2, 1500, 'half', 400, 7000, 4000, 13000],
    [10000, 2, 3000, 'half', 500, 8000, 5000, 17000],
    [11000, 3, 2500, 'half', 500, 9000, 5000, 18000],
    [8000, 2, 1500, 'half', 400, 7000, 4000, 13000],
    [6000, 2, 800, 'half', 300, 5000, 3000, 0],
  ];

  function distanceWeeks(isHalf) {
    const rows = isHalf ? halfMarathon : threeRun10k;
    return rows.map(([total, count, rep, effort, recovery, thu, sat, sun], index) => {
      const sessions = [qualityRun(1, total, count, rep, effort, recovery), easyRun('easy', 3, thu)];
      if (isHalf) sessions.push(easyRun('short', 5, sat, 'Short easy run'));
      const longer = isHalf ? sun : sat;
      sessions.push(longer ? easyRun('long', isHalf ? 6 : 5, longer, 'Easy long run') :
        isHalf ? raceRun(21100, 1000, 500, 'half', 'Half marathon') : raceRun(10000, 1500, 500, '10k', 'Measured 10K race or test'));
      return { week: index + 1, sessions };
    });
  }

  // Tue km, Thu km, Sat km, Sun km, Sun minutes, Thu work count and metres, recovery metres, strides.
  // Week 8 follows its four written sessions (34 km). The Phase One summary column says 33.
  const marathon = [
    [6,8,4,12,85], [7,8,4,13,90], [7,9,4,14,95,0,0,0,4], [6,8,4,12,85],
    [7,9,5,15,105,0,0,0,5], [8,9,5,16,110,2,2000,500], [8,10,5,17,115,2,2500,500], [7,8,5,14,100],
    [8,11,5,18,120,3,2000,500], [9,11,5,19,125,2,3000,500], [9,12,5,20,135,2,3500,500], [8,9,5,16,110],
    [9,12,5,22,145,3,2500,500], [9,12,5,24,155,2,4000,500], [10,12,5,25,165,1,8000,0], [8,10,5,20,130],
    [10,13,5,26,170,3,3000,500], [10,13,5,28,180,2,4500,500], [10,13,5,30,190,1,9000,0], [9,9,5,24,150],
    [10,13,5,32,200,2,4000,500], [8,11,4,24,150,2,2500,500], [7,8,4,17,115,2,1500,400], [5,6,3,0,0,2,1000,300],
  ];
  function marathonWeeks(timed) {
    return marathon.map(([tue, thu, sat, sunday, minutes, count, rep, recovery, strides], index) => {
      const quality = count ? qualityRun(3, thu * 1000, count, rep, 'marathon', recovery) :
        easyRun('midweek', 3, thu * 1000, strides ? 'Easy run with strides' : 'Easy run');
      if (strides) {
        // Strides are inside the fixed distance, with their placement constrained by the plan.
        quality.note = strides + ' × 20-second relaxed strides after at least 1.5 km and before the final easy kilometre. Walk or jog 60 seconds between strides.';
        quality.includedStrides = { count: strides, workSeconds: 20, recoverySeconds: 60 };
      }
      const long = !sunday ? raceRun(42195, 0, 0, 'marathon', 'Marathon') :
        timed ? timedRun('long', 6, 'Timed easy long run', [{ role: 'work', effort: 'easy', durationSeconds: minutes * 60 }]) :
          easyRun('long', 6, sunday * 1000, 'Easy long run');
      return { week: index + 1, sessions: [
        easyRun('easy', 1, tue * 1000), quality, easyRun('short', 5, sat * 1000, 'Short easy run'), long,
      ] };
    });
  }

  function timedRun(id, day, title, steps) {
    return { id, day, title, kind: 'run', steps,
      durationSeconds: steps.reduce((total, step) => total + step.durationSeconds, 0) };
  }

  // Conservative time-based template, not a prediction of distance or race readiness.
  // The second outing in week 24 is the actual event, not an added training run.
  const twoRunMarathonMinutes = [
    [40,75], [40,80], [45,85], [40,70], [45,90], [45,95],
    [45,100], [40,80], [45,105], [45,110], [50,115], [40,90],
    [50,120], [50,125], [50,130], [45,100], [50,135], [55,140],
    [55,145], [45,110], [55,150], [45,115], [40,85], [25,0],
  ];
  const twoRunMarathon16Minutes = [
    [45,100], [45,105], [50,110], [40,90],
    [50,115], [50,120], [50,125], [45,100],
    [50,130], [55,135], [55,140], [45,110],
    [55,150], [45,115], [40,85], [25,0],
  ];
  function twoRunMarathonWeeks(rows = twoRunMarathonMinutes) {
    return rows.map(([short, long], index) => {
      const easy = timedRun('easy', 1, 'Conversational easy run',
        [{ role: 'work', effort: 'easy', durationSeconds: short * 60 }]);
      const longer = long ? timedRun('long', 6, 'Conversational long run',
        [{ role: 'work', effort: 'easy', durationSeconds: long * 60 }]) :
        raceRun(42195, 0, 0, 'marathon', 'Marathon');
      return { week: index + 1, sessions: [easy, longer] };
    });
  }

  function runningBase({ continuation = false } = {}) {
    const rows = [[25,25,30], [25,30,35], [30,30,40], [25,30,35],
      [30,35,45], [35,35,50], [35,40,55], [35,40,60]];
    if (continuation) rows.push([35,45,65], [40,45,70], [40,50,75], [35,45,65], [45,50,80], [45,55,85]);
    return rows.map((row, index) => ({
      week: index + 1,
      sessions: row.map((minutes, i) => {
        const threshold = i === 0 && [8, 10, 12].includes(index);
        const step = (role, effort, min) => ({ role, effort, durationSeconds: min * 60 });
        const work = threshold ? [
          step('work', 'easy', minutes - 10), step('work', 'threshold', 3), step('recovery', 'easy', 2),
          step('work', 'threshold', 3), step('work', 'easy', 2),
        ] : [step('work', 'easy', minutes)];
        return timedRun(['easy-1', 'easy-2', 'long'][i], [1, 3, 5][i],
          threshold ? 'Easy run with introductory threshold' : i === 2 ? 'Easy long run' : 'Easy run', [
            step('warm-up', 'walk', 5), ...work, step('cool-down', 'walk', 5),
          ]);
      }),
    }));
  }

  const entries = [
    { id: 'lifting-foundation', title: 'Lifting Foundation', discipline: 'strength',
      sessionsPerWeek: 2, durationWeeks: 6, continuationWeeks: 3, build: liftingFoundation,
      entry: 'Beginner or returning lifter. Comfortable basic movement patterns, two spaced sessions, dumbbells, a stable bench and cable or bands.' },
    { id: 'general-strength', title: 'General Strength', discipline: 'strength',
      sessionsPerWeek: 3, durationWeeks: 8, build: () => writtenStrengthWeeks('general-strength'),
      entry: 'Recent three-day lifting practice and a comparable weekly dose of roughly 26–32 work sets across the main patterns and accessories.' },
    { id: 'powerlifting-three-day', title: 'Powerlifting · three days', discipline: 'strength',
      sessionsPerWeek: 3, durationWeeks: 12, build: () => writtenStrengthWeeks('powerlifting-three-day'),
      entry: 'Experienced with all three competition lifts and controlled singles. Week one has 21 main lift sets plus accessories.' },
    { id: 'powerlifting-four-day', title: 'Powerlifting · four days', discipline: 'strength',
      sessionsPerWeek: 4, durationWeeks: 12, build: powerliftingWeeks,
      entry: 'Recent practice of all three competition lifts and controlled RPE 7–8 singles. Compare recent training with week one: seven squat, nine bench and five deadlift sets, plus accessories.' },
    { id: 'bench-specialisation', title: 'Bench Specialisation', discipline: 'strength',
      sessionsPerWeek: 3, durationWeeks: 10, build: () => writtenStrengthWeeks('bench-specialisation'),
      entry: 'Regular bencher with six months of practice, at least two exposures and roughly 10–13 weekly sets, plus lower-lift maintenance.' },
    { id: 'deadlift-specialisation', title: 'Deadlift Specialisation', discipline: 'strength',
      sessionsPerWeek: 3, durationWeeks: 10, build: () => writtenStrengthWeeks('deadlift-specialisation'),
      entry: 'Six months of barbell work, two hinge exposures and about 7–9 pull or hinge sets per week. Comfortable controlled singles.' },
    { id: 'running-base', title: 'Running Base', discipline: 'running',
      sessionsPerWeek: 3, durationWeeks: 8, continuationWeeks: 6, build: runningBase,
      entry: 'After Couch to 5K or similar. Three runs a week for two weeks and a recent comfortable 30-minute continuous run.' },
    { id: '10k-two-run', title: '10K · two runs', discipline: 'running',
      sessionsPerWeek: 2, durationWeeks: 6, build: runningWeeks,
      entry: 'For established runners prioritising lifting. Recent weeks usually include two runs and 16–22 km, a 9 km easy outing, and controlled faster work or a hard 5K.' },
    { id: '10k-three-run', title: '10K · three runs', discipline: 'running',
      sessionsPerWeek: 3, durationWeeks: 6, build: () => distanceWeeks(false),
      entry: 'Three weekly runs, typical 22–30 km, a recent 9 km easy outing and controlled faster work or a hard 5K.' },
    { id: 'half-marathon', title: 'Half Marathon', discipline: 'running',
      sessionsPerWeek: 4, durationWeeks: 12, build: () => distanceWeeks(true),
      entry: 'Four weekly runs and 27–35 km over the past four to six weeks, a recent 11 km easy run and controlled faster work.' },
    { id: 'marathon-distance', title: 'Marathon · distance long runs', discipline: 'running',
      sessionsPerWeek: 4, durationWeeks: 24, build: () => marathonWeeks(false),
      entry: 'Four weekly runs and 30–38 km for six weeks, with a recent 12 km easy outing. Check available long-run time and race cutoffs.' },
    { id: 'marathon-timed', title: 'Marathon · timed long runs', discipline: 'running',
      sessionsPerWeek: 4, durationWeeks: 24, build: () => marathonWeeks(true),
      entry: 'Four weekly runs and 30–38 km for six weeks, with a recent 85-minute easy outing. At 9:00/km, the 200-minute peak covers about 22 km. Check race cutoffs and likely time on feet.' },
    { id: 'marathon-two-run', title: 'Marathon · two runs', discipline: 'running',
      sessionsPerWeek: 2, durationWeeks: 24, build: () => twoRunMarathonWeeks(),
      entry: 'For established runners: two runs weekly for the last 4–6 weeks, including separate comfortable 40-minute and 75-minute easy outings and a normal next-day response. Two runs can limit preparation and performance compared with more frequent running; a finish is not guaranteed. These times are a template, not a required pace or distance. If your base is lower or unknown, build a sustainable base and consider delaying the event or reviewing with a qualified coach; Running Base needs three weekly days. Space your two runs where practical, consider hard lower-body lifting and practise fuelling. Check race cutoffs and recovery. Choose the first week and event day to fit your event: dates are not automatically aligned. The installed workout screen currently requires actual distance and duration even for timed runs; Garmin workout export for timed steps is not supported.' },
    { id: 'marathon-two-run-16', title: 'Marathon · two runs · 16 weeks', discipline: 'running',
      sessionsPerWeek: 2, durationWeeks: 16, build: () => twoRunMarathonWeeks(twoRunMarathon16Minutes),
      entry: 'For established, currently recovered runners: two runs weekly over the last 4–6 weeks, including separate comfortable 45-minute and 100-minute easy outings with a normal next-day response. These entry times are coaching assumptions, not safety thresholds; the app does not assess readiness. If your base or recovery is lower or unknown, do not jump to these durations: build a sustainable base and discuss your event timing with a qualified coach; consider a later event. A recent marathon needs recovery first. Two runs limit preparation and may limit performance; finishing safely is not guaranteed. At 9 minutes/km the 150-minute peak covers about 16.7 km; check time on feet, fuelling and event cutoff, and review the gap to race distance. Space runs where practical; place hard lower-body lifting away from the long run, or consider lighter lower-body maintenance while retaining your chosen strength priorities. Do not make up missed sessions. The displayed race date is the template date, not automatic event alignment. Actual distance and duration are required to save timed runs; Garmin export of timed steps is unsupported.' },
  ];

  function listProgrammes() {
    return entries.map(({ build, ...summary }) => summary);
  }

  function previewProgramme(id, {
    referenceKg = {}, loadIncrementKg = 2.5, recent10kSeconds = null, recentHalfSeconds = null,
    recentMarathonSeconds = null, continuation = false, weaknesses = {}, equipment = [], comfortableFrontRack = false,
  } = {}) {
    const entry = entries.find(item => item.id === id);
    if (!entry) throw new RangeError('Unknown catalogue programme: ' + id);
    if (!Number.isFinite(loadIncrementKg) || loadIncrementKg <= 0) {
      throw new RangeError('The load increment must be positive.');
    }
    const weeks = entry.build({ continuation });
    const openingVariations = id === 'powerlifting-four-day'
      ? prescribeOpeningVariations(weeks, weaknesses, equipment, comfortableFrontRack) : null;
    const paceReferences = { '10k': [recent10kSeconds, 10], half: [recentHalfSeconds, 21.1], marathon: [recentMarathonSeconds, 42.195] };
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
          const [seconds, distance] = paceReferences[step.effort] ?? [];
          step.paceSecondsPerKm = Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds / distance) : null;
        }
      }
    }
    return { ...listProgrammes().find(item => item.id === id), revision: REVISION, durationWeeks: weeks.length,
      weeks, ...(openingVariations ? { openingVariations } : {}) };
  }

  const api = Object.freeze({ listProgrammes, previewProgramme, powerliftingVariationSetup });
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LHRFProgrammeCatalogue = api;
})(typeof globalThis === 'object' ? globalThis : this);
