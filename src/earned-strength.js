/* Explicit, single-workout bench decisions. Catalogue snapshots remain immutable. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LHRFEarnedStrength = factory();
})(globalThis, function () {
  'use strict';

  const POLICY = 'bench-earned-single-session-v1';
  // Owner-approved starting policy. These are review rules, not scientific thresholds.
  const HISTORY_DAYS = 42;
  const DAY = 86400000;
  const clone = value => JSON.parse(JSON.stringify(value));
  const identity = exercise => exercise?.[5]?.exerciseId;
  const stamp = row => row.id + '|' + row.date + '|' + row.week;
  const positive = value => typeof value === 'number' && Number.isFinite(value) && value > 0;

  function localDay(now) {
    return new Date(now).toLocaleDateString('en-CA', {timeZone: 'Europe/London'});
  }

  function locate(state, live) {
    for (const plan of state.customRoadmap?.cataloguePlans || []) {
      for (const week of plan.snapshot.weeks) {
        for (const source of week.sessions) {
          if (live.catalogueOccurrenceId === plan.id + '-w' + week.week + '-' + source.id) {
            return {plan, week: week.week, source};
          }
        }
      }
    }
    return null;
  }

  function symptomHold(state, now) {
    const today = localDay(now);
    const feedback = (state.sessionFeedback || []).filter(row => localDay(row.date) === today);
    if (feedback.some(row => row.discomfort === 'yes' || row.pain === true || row.illness === true ||
        row.energy === 'low' || row.difficulty === 'harder')) return true;
    return (state.checkins || []).filter(row => localDay(row.date) === today)
      .some(row => String(row.symptoms || '').trim() || row.pain === true || row.illness === true);
  }

  function exposures(state, live, exercise, now) {
    const id = identity(exercise);
    const cutoff = Date.parse(live.started || now);
    const seen = new Set();
    const rows = (state.completedWorkouts || []).filter(row => {
      const time = Date.parse(row.date);
      const key = stamp(row);
      if (!Number.isFinite(time) || time >= cutoff || time < cutoff - HISTORY_DAYS * DAY || seen.has(key)) return false;
      seen.add(key);
      return (row.prescription?.ex || []).some(ex => identity(ex) === id);
    }).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    return rows.map(row => {
      const prescribed = row.prescription.ex.filter(ex => identity(ex) === id);
      const sets = (state.sets || []).filter(set =>
        set.sessionId === row.id && set.date === row.date && Number(set.week || 1) === Number(row.week || 1) &&
        set.exerciseId === id);
      const feedback = (state.sessionFeedback || []).filter(item =>
        item.sessionId === row.id && localDay(item.date) === localDay(row.date));
      return {row, prescribed, sets, feedback};
    });
  }

  function comparable(exposure, exercise, count, reps, target) {
    const {row, prescribed, sets, feedback} = exposure;
    if (row.timeAdaptation || !Number.isInteger(row.completedSets) || !Number.isInteger(row.plannedSets) ||
        row.completedSets < row.plannedSets ||
        prescribed.length !== 1 || prescribed[0][1] !== count || prescribed[0][2] !== reps ||
        prescribed[0][4] !== target || sets.length !== count) return false;
    const meta = exercise[5] || {};
    if (prescribed[0][5]?.loadType !== meta.loadType ||
        prescribed[0][5]?.doseUnit !== meta.doseUnit ||
        meta.variantId && prescribed[0][5]?.variantId !== meta.variantId) return false;
    if (feedback.some(item => item.discomfort === 'yes' || item.pain === true || item.illness === true ||
        item.difficulty === 'harder' || item.energy === 'low')) return false;
    const numbers = new Set();
    return sets.every(set => {
      if (numbers.has(set.set)) return false;
      numbers.add(set.set);
      return Number.isInteger(set.set) && set.set >= 1 && set.set <= count &&
        set.reps === reps && positive(set.weight) && positive(set.rpe) && set.rpe <= target &&
        set.rpeReliable !== false && !set.evidenceReview?.rpe?.approximate &&
        !set.failed && !set.techniqueFailed && !set.warmup && !set.optional && set.completed !== false &&
        set.loadType === meta.loadType && set.doseUnit === meta.doseUnit &&
        (!meta.variantId || set.variantId === meta.variantId);
    });
  }

  function assess(state, live, index, now = new Date().toISOString()) {
    const exercise = live.ex?.[index];
    const context = locate(state, live);
    const currentDay = localDay(now);
    if (!context || !exercise || !positive(exercise[3]) || !positive(exercise[4]) ||
        live.scheduledDate !== currentDay || localDay(live.started) !== currentDay ||
        live.timeAdaptation || live.runs?.length || live.eventDate || symptomHold(state, now)) return null;
    if (Object.keys(live.entries || {}).some(key => key.startsWith(index + '_'))) return null;
    const meta = exercise[5] || {};
    if (!['competition-bench', 'paused-bench'].includes(identity(exercise)) ||
        meta.loadType !== 'external-kg' || meta.doseUnit !== 'reps' ||
        meta.optional || meta.role !== 'straight') return null;
    if ((state.completedWorkouts || []).some(row => row.id === live.id &&
        Number(row.week || 1) === Number(live.sourceProgrammeWeek || 1))) return null;
    const {plan, week, source} = context;
    // Easier weeks, taper, event and benchmark sessions never receive this review.
    if (week === 4 || week === 8 || week >= plan.snapshot.durationWeeks - 1 ||
        source.kind !== 'strength' || source.id === 'meet' || /benchmark/i.test(source.title)) return null;
    const taperIds = new Set(plan.snapshot.weeks.filter(item => item.week >= plan.snapshot.durationWeeks - 1)
      .flatMap(item => item.sessions.map(row => plan.id + '-w' + item.week + '-' + row.id)));
    const taperDates = (state.reviewedProgramme?.weeks || []).flatMap(item => item.sessions)
      .filter(row => taperIds.has(row.catalogueOccurrenceId)).map(row => row.scheduledDate);
    if (!taperDates.length || taperDates.some(date => !date || date <= live.scheduledDate)) return null;
    const original = live.originalPrescription?.ex?.[index] || exercise;
    if (!positive(original[3]) || original[3] !== exercise[3] || original[4] !== exercise[4]) return null;

    let kind, history, newRpe;
    const candidates = exposures(state, live, exercise, now);
    const peak = ['powerlifting-three-day', 'powerlifting-four-day'].includes(plan.snapshot.id) &&
      week === 10 && identity(exercise) === 'competition-bench' &&
      exercise[1] === 1 && exercise[2] === 1 && exercise[4] === 8.5;
    if (peak) {
      // Use the two latest single exposures; back-off rows in the same session
      // are retained in the evidence but never counted as separate exposures.
      history = candidates.filter(item => item.prescribed.some(ex => ex[1] === 1 && ex[2] === 1)).slice(0, 2);
      const validSingle = item => {
        const single = item.prescribed.filter(ex => ex[1] === 1 && ex[2] === 1);
        const logged = item.sets.filter(set => set.reps === 1);
        return comparable({...item, prescribed: single, sets: logged}, exercise, 1, 1, 8);
      };
      if (history.length !== 2 || !history.every(validSingle)) return null;
      history = history.map(item => ({...item, working: item.sets.filter(set => set.reps === 1)}));
      kind = 'peak-single';
      newRpe = 9;
    } else {
      if (!Number.isInteger(exercise[1]) || exercise[1] < 2 || exercise[2] < 2 || exercise[4] > 8) return null;
      history = candidates.filter(item => item.prescribed.some(ex =>
        ex[1] === exercise[1] && ex[2] === exercise[2] && ex[4] === exercise[4])).slice(0, 3);
      if (history.length !== 3 ||
          !history.every(item => comparable(item, exercise, exercise[1], exercise[2], exercise[4]))) return null;
      history = history.map(item => ({...item, working: item.sets}));
      if (!history.every(item => positive(item.prescribed[0][3]) &&
          item.working.every(set => set.weight > item.prescribed[0][3]))) return null;
      kind = 'working-load';
      newRpe = exercise[4];
    }
    const weights = history.map(item => Math.min(...item.working.map(set => set.weight))).reverse();
    const efforts = history.map(item => Math.max(...item.working.map(set => set.rpe))).reverse();
    if (new Set(history.map(item => localDay(item.row.date))).size !== history.length) return null;
    if (weights.some((weight, i) => i > 0 && weight < weights[i - 1]) ||
        efforts.some((rpe, i) => i > 0 && rpe > efforts[i - 1])) return null;
    // One standard total-barbell increment, bounded by the latest successful load.
    const nextWeight = original[3] + 2.5;
    const ceiling = kind === 'peak-single' ? weights.at(-1) + 2.5 : weights.at(-1);
    if (nextWeight > ceiling || (kind === 'peak-single' && !history.every(item =>
      item.working[0].weight > item.prescribed.find(ex => ex[2] === 1)[3]))) return null;
    const evidence = history.map(({row, sets, feedback}) => ({
      record: stamp(row), date: row.date, originalRecord: clone(row), sets: clone(sets), feedback: clone(feedback),
    }));
    const adjustedMeta = clone(meta);
    if (kind === 'peak-single') adjustedMeta.cue = String(adjustedMeta.cue || '')
      .replace('Cap effort at RPE 8.5.', 'Cap effort at RPE 9.');
    return {policy: POLICY, kind, sessionId: live.id, occurrenceId: live.catalogueOccurrenceId,
      planId: plan.id, exerciseIndex: index, exerciseId: identity(exercise), date: currentDay,
      original: clone(original), adjusted: [exercise[0], exercise[1], exercise[2], nextWeight, newRpe, adjustedMeta],
      evidence};
  }

  function approve(state, live, proposal, confirmations, now = new Date().toISOString()) {
    if (!confirmations?.comparable || !confirmations?.recovered || !confirmations?.warmups ||
        !confirmations?.increment) throw Error('Confirm comparable work, recovery, warm-ups and a 2.5 kg total-bar increase.');
    const fresh = assess(state, live, proposal.exerciseIndex, now);
    if (!fresh || JSON.stringify(fresh) !== JSON.stringify(proposal)) {
      throw Error('Training or the proposal changed. Reopen the review.');
    }
    const next = clone(live);
    next.originalPrescription ||= {ex: clone(live.ex), runs: clone(live.runs || [])};
    const decision = {...clone(fresh), confirmations: clone(confirmations), approvedAt: now};
    next.ex[proposal.exerciseIndex] = clone(proposal.adjusted);
    next.ex[proposal.exerciseIndex][5].earnedStrengthDecision = decision;
    next.strengthProgressionDecisions = [...(next.strengthProgressionDecisions || []), decision];
    return next;
  }

  function revert(live, index) {
    if (Object.keys(live.entries || {}).some(key => key.startsWith(index + '_'))) {
      throw Error('Recorded sets must retain their reviewed prescription.');
    }
    const decision = live.ex?.[index]?.[5]?.earnedStrengthDecision;
    if (!decision) return clone(live);
    const next = clone(live);
    next.ex[index] = clone(decision.original);
    next.strengthProgressionDecisions = (next.strengthProgressionDecisions || [])
      .filter(item => item.exerciseIndex !== index);
    return next;
  }

  function mount({state, live, index, anchor, update, now}) {
    const exercise = live.ex[index];
    const accepted = exercise[5]?.earnedStrengthDecision;
    const proposal = accepted || assess(state, live, index, now);
    if (!proposal) return;
    const details = document.createElement('details');
    details.className = 'exercise-notes';
    details.dataset.earnedStrength = String(index);
    const summary = document.createElement('summary');
    summary.textContent = accepted ? 'Bench change approved for this workout' : 'Review bench progression';
    details.append(summary);
    const text = document.createElement('p');
    text.textContent = proposal.original[3] + ' → ' + proposal.adjusted[3] + ' kg · ' +
      proposal.original[1] + ' × ' + proposal.original[2] + ' · ' +
      (proposal.kind === 'peak-single' ? 'RPE cap 8.5 → 9' : 'RPE ' + proposal.original[4]);
    details.append(text);
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    details.append(status);
    const button = (label, action) => {
      const element = document.createElement('button');
      element.type = 'button';
      element.className = 'secondary';
      element.textContent = label;
      element.onclick = () => { try { action(); } catch (error) { status.textContent = error.message; } };
      details.append(element);
      return element;
    };
    if (accepted) {
      status.textContent = accepted.date === localDay(now)
        ? 'Use the RPE cap and reduce the weight if needed.'
        : 'This approval has expired. Use the original prescription before recording new sets.';
      if (!Object.keys(live.entries || {}).some(key => key.startsWith(index + '_'))) {
        button('Use original prescription', () => update(revert(live, index)));
      }
    } else {
      const dates = document.createElement('p');
      dates.className = 'muted small';
      dates.textContent = 'Based on completed work on ' + proposal.evidence.map(row => localDay(row.date)).join(', ') + '.';
      details.append(dates);
      const confirmations = {};
      const accept = button('Accept for this workout', () =>
        update(approve(state, live, proposal, confirmations, new Date().toISOString())));
      accept.disabled = true;
      for (const [key, label] of [
        ['comparable', 'These sessions used the same setup and technique; the logged effort was reliable.'],
        ['recovered', 'I feel recovered, with no pain, illness or unusual fatigue.'],
        ['warmups', 'Today’s warm-ups felt normal.'],
        ['increment', 'I can add 2.5 kg to the total barbell load.'],
      ]) {
        const wrapper = document.createElement('label');
        wrapper.style.display = 'block';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.style.width = 'auto';
        input.onchange = () => {
          confirmations[key] = input.checked;
          accept.disabled = Object.values(confirmations).filter(Boolean).length !== 4;
        };
        wrapper.append(input, ' ' + label);
        details.insertBefore(wrapper, accept);
      }
      button('Keep planned work', () => { details.open = false; });
    }
    anchor.before(details);
  }

  return {POLICY, assess, approve, revert, mount, localDay};
});
