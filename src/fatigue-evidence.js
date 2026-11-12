/* Explicit optional athlete observations. No diagnosis, detection or prescription changes. */
(function (root) {
  'use strict';
  const reasons = new Set(['fatigue', 'pain', 'illness', 'time', 'logistics', 'other']);
  const tri = new Set(['yes', 'no', 'unknown']);
  const triValue = (value, name) => {
    if (value == null || value === '') return 'unknown';
    if (!tri.has(value)) throw new TypeError('Invalid ' + name);
    return value;
  };
  function create(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('Evidence is required');
    if (!['strength', 'running'].includes(input.discipline)) throw new TypeError('Invalid discipline');
    if (typeof input.sessionId !== 'string' || !input.sessionId.trim()) throw new TypeError('Session identifier is required');
    if (typeof input.recordedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(input.recordedAt) || !Number.isFinite(Date.parse(input.recordedAt)) || new Date(input.recordedAt).toISOString() !== input.recordedAt.replace(/Z$/, input.recordedAt.includes('.') ? 'Z' : '.000Z')) throw new TypeError('Valid UTC recording time is required');
    const reason = input.interruptionReason == null || input.interruptionReason === '' ? null : input.interruptionReason;
    if (reason !== null && !reasons.has(reason)) throw new TypeError('Invalid interruption reason');
    let effort = null;
    if (input.runEffort !== null && input.runEffort !== undefined && input.runEffort !== '') {
      if (input.discipline !== 'running' || typeof input.runEffort !== 'number' || !Number.isFinite(input.runEffort) || input.runEffort < 1 || input.runEffort > 10) throw new TypeError('Invalid running effort');
      effort = input.runEffort;
    }
    return {
      schemaVersion: 1,
      discipline: input.discipline,
      sessionId: input.sessionId,
      recordedAt: input.recordedAt,
      interruptionReason: reason,
      unusualFatigue: triValue(input.unusualFatigue, 'fatigue response'),
      painOrDiscomfort: triValue(input.painOrDiscomfort, 'pain response'),
      illness: triValue(input.illness, 'illness response'),
      comparableConditions: triValue(input.comparableConditions, 'conditions response'),
      reliableMeasurement: triValue(input.reliableMeasurement, 'measurement response'),
      runEffort: effort,
    };
  }
  function append(state, input) {
    if (!state || typeof state !== 'object' || Array.isArray(state)) throw new TypeError('Invalid state');
    if (state.fatigueEvidence !== undefined && !Array.isArray(state.fatigueEvidence)) throw new TypeError('Invalid existing evidence');
    const observation = create(input);
    return { ...state, fatigueEvidence: [...(state.fatigueEvidence || []), observation] };
  }
  function signals(observation) {
    // Absence and negative answers remain distinct; a reason is corroboration, not performance evidence.
    return {
      fatigueSupporting: observation?.interruptionReason === 'fatigue' || observation?.unusualFatigue === 'yes',
      safetyConcern: observation?.painOrDiscomfort === 'yes' || observation?.illness === 'yes' || observation?.interruptionReason === 'pain' || observation?.interruptionReason === 'illness',
      explicitRunningContext: observation?.discipline === 'running' && observation?.comparableConditions === 'yes' && observation?.reliableMeasurement === 'yes' && typeof observation?.runEffort === 'number',
    };
  }
  const api = { create, append, signals };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LHRFFatigueEvidence = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
