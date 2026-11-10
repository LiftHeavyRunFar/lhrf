/* Isolated catalogue enrolment, calendar and training logs. */
(function (root) {
  'use strict';

  function empty() {
    return { schema: 1, revision: 0, plans: [], occurrences: [], logs: {}, drafts: {} };
  }

  function parseDate(day) {
    if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error('Choose a valid date.');
    const value = new Date(day + 'T00:00:00Z');
    if (!Number.isFinite(+value) || value.toISOString().slice(0, 10) !== day) throw new Error('Choose a valid date.');
    return value;
  }

  function addDays(day, count) {
    const value = parseDate(day);
    value.setUTCDate(value.getUTCDate() + count);
    return value.toISOString().slice(0, 10);
  }

  function makeOccurrences(plan, monday, planId) {
    if (parseDate(monday).getUTCDay() !== 1) throw new Error('Choose a Monday for week one.');
    return plan.weeks.flatMap(week => week.sessions.map(session => ({
      id: [planId, week.week, session.id].join('/'),
      planId, week: week.week, sessionId: session.id,
      date: addDays(monday, (week.week - 1) * 7 + session.day),
      status: 'planned',
    })));
  }

  function sessionFor(state, occurrence) {
    const plan = state.plans.find(item => item.id === occurrence.planId);
    const session = plan?.snapshot.weeks[occurrence.week - 1]?.sessions.find(item => item.id === occurrence.sessionId);
    if (!session) throw new Error('The original prescription is unavailable.');
    return { plan, session };
  }

  function enrol(state, snapshot, monday, id, placements = {}) {
    if (state.plans.some(plan => plan.id === id || (plan.snapshot.id === snapshot.id && plan.start === monday))) {
      throw new Error('That programme is already on the calendar for this start date.');
    }
    const occurrences = makeOccurrences(snapshot, monday, id).map(item => {
      const placed = placements[item.week + '/' + item.sessionId];
      if (!placed) return item;
      parseDate(placed);
      return { ...item, date: placed };
    });
    return {
      ...state,
      plans: [...state.plans, { id, start: monday, snapshot: structuredClone(snapshot) }],
      occurrences: [...state.occurrences, ...occurrences],
    };
  }

  function changeOccurrence(state, id, change) {
    const current = state.occurrences.find(item => item.id === id);
    if (!current || current.status === 'logged') throw new Error('Choose a workout that has not been logged.');
    return { ...state, occurrences: state.occurrences.map(item => item.id === id ? { ...item, ...change } : item) };
  }

  function move(state, id, date) {
    parseDate(date);
    return changeOccurrence(state, id, { date });
  }

  function skip(state, id, skipped = true) {
    return changeOccurrence(state, id, { status: skipped ? 'skipped' : 'planned' });
  }

  function repeat(state, sourceId, newId, date) {
    parseDate(date);
    const source = state.occurrences.find(item => item.id === sourceId);
    if (!source || state.occurrences.some(item => item.id === newId)) throw new Error('Choose a workout to repeat.');
    const occurrence = { ...source, id: newId, date, status: 'planned' };
    return { ...state, occurrences: [...state.occurrences, occurrence] };
  }

  function saveDraft(state, id, draft) {
    const item = state.occurrences.find(occurrence => occurrence.id === id);
    if (item?.status !== 'planned') throw new Error('Restore this workout before editing it.');
    return { ...state, drafts: { ...state.drafts, [id]: structuredClone(draft) } };
  }

  function parseOptional(value) {
    return value === '' || value === null || value === undefined ? null : Number(value);
  }

  function saveWorkout(state, id, draft, now) {
    const item = state.occurrences.find(occurrence => occurrence.id === id);
    if (item?.status !== 'planned') throw new Error('Only an open workout can be logged.');
    const { session } = sessionFor(state, item);
    const note = String(draft.note || '').slice(0, 2000);
    let result;
    if (session.kind === 'run') {
      const km = parseOptional(draft.km);
      const min = parseOptional(draft.min);
      if ((km !== null && (!Number.isFinite(km) || km <= 0)) || !Number.isFinite(min) || min <= 0) {
        throw new Error('Enter a positive duration and a distance if you have one.');
      }
      const activity = draft.activity ? structuredClone(draft.activity) : null;
      if (activity && Object.values(state.logs).some(log => log.activity?.sourceFileHash === activity.sourceFileHash)) {
        throw new Error('That Garmin activity file has already been logged.');
      }
      result = { km, min, activity, partial: draft.partial === true };
    } else {
      const groups = session.groups ?? session.exerciseIds.map(exerciseId => ({ exerciseId, sets: 1, doseUnit: 'reps' }));
      const sets = groups.flatMap((group, groupIndex) => {
        const rows = draft.groups?.[groupIndex] ?? [];
        return Array.from({ length: group.sets }, (_, setIndex) => {
          const row = rows[setIndex] ?? {};
          const weightKg = parseOptional(row.weightKg);
          const dose = parseOptional(row.dose);
          const rpe = parseOptional(row.rpe);
          if (weightKg === null && dose === null && rpe === null) return null;
          if (weightKg !== null && (!Number.isFinite(weightKg) || weightKg < 0) ||
              !Number.isInteger(dose) || dose <= 0 ||
              rpe !== null && (!Number.isFinite(rpe) || rpe < 1 || rpe > 10)) {
            throw new Error('Enter positive whole reps or seconds for each logged set, and valid weight and RPE if supplied.');
          }
          return { exerciseId: group.exerciseId, groupIndex, setIndex, weightKg, dose, rpe,
            doseUnit: group.doseUnit ?? 'reps' };
        }).filter(Boolean);
      });
      if (!sets.length) throw new Error('Enter at least one actual set.');
      result = { sets, partial: sets.length < groups.reduce((sum, group) => sum + group.sets, 0) };
    }
    const marked = changeOccurrence(state, id, { status: 'logged' });
    const drafts = { ...state.drafts };
    delete drafts[id];
    return { ...marked, drafts, logs: { ...state.logs, [id]: { ...result, note, loggedAt: now } } };
  }

  function lowerBody(session) {
    return session.kind === 'strength' && session.groups.some(group =>
      /squat|deadlift/.test(group.exerciseId) && group.rpe >= 7);
  }

  function demandingRun(session) {
    return session.kind === 'run' && (session.id === 'long' || session.id === 'race' ||
      session.steps.some(step => step.effort === 'threshold' || step.effort === '10k' ||
        step.effort === 'half' || step.effort === 'marathon'));
  }

  function calendar(state) {
    return state.occurrences.map(item => ({ ...item, ...sessionFor(state, item) }))
      .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  }

  function conflicts(state, selectedId) {
    const ordered = calendar(state).filter(item => item.status === 'planned');
    const result = [];
    for (let i = 0; i < ordered.length; i += 1) {
      const first = ordered[i];
      for (let j = i + 1; j < ordered.length; j += 1) {
        const next = ordered[j];
        if (next.date > addDays(first.date, 1)) break;
        if (selectedId && first.planId !== selectedId && next.planId !== selectedId) continue;
        if (first.planId === next.planId) continue;
        if (lowerBody(first.session) && demandingRun(next.session) ||
            lowerBody(next.session) && demandingRun(first.session)) result.push([first, next]);
      }
    }
    return result;
  }

  const api = { empty, parseDate, addDays, makeOccurrences, enrol, move, skip, repeat, saveDraft, saveWorkout, calendar, conflicts };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LHRFCatalogueTraining = api;
})(globalThis);
