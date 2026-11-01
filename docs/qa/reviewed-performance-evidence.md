# Reviewed performance evidence investigation

Local investigation only. No production, storage, activation or saved-programme migration changes. The real diagnostic case and backup remain outside this repository; tests use synthetic athletes.

## Findings

Speed prescriptions use a percentage wave anchored to a corroborated main-lift reference. A recent light straight-set session can establish practice evidence but does not calibrate speed work. Restarting a proposal restarts the wave. This may underuse relevant practice, but RPE alone does not measure velocity or justify heavier speed work.

Unconfirmed competition execution imposes a conservative single-effort ceiling. Confirming a representative paused single can remove that ceiling without inventing training age. Repeated suggestions at the same effort are intentional; conditional earned increments already exist and are not automatic progression. The final heavy date and taper remain governed by the actual calendar.

Before this correction, a reviewer had to supply an edited in-memory dataset to express an RPE correction; the engine did not retain its origin or uncertainty. A narrow proposal-only `performanceReviews` option now validates exact original selectors/values, retains an audit trail, and never changes source rows. Retrospectively approximate RPE is allowed as light-practice context but excluded from maximum calibration. A null reviewed RPE explicitly excludes unreliable effort rather than inventing a replacement. Failed, optional, warm-up and technically failed rows cannot anchor practice.

Reviewed same-purpose speed practice is exposed beside the percentage suggestion with an explicit calibration limitation. It does not silently change kg, claim measured velocity or override fatigue constraints. Explicit re-review discards stale corroboration while retaining the original reference for identical evidence, avoiding compounded legacy increase caps. Saved programme rendering never invokes review ingestion.

## API

Only explicit new-proposal callers provide the review option. It is not inferred from free-text notes or automatically applied by the production UI.

```js
adapters.buildNewProgramme(config, {
  data: originalData,
  now,
  performanceReviews: [{
    kind: 'rpe',
    match: {exercise: 'Bench', date: '2026-11-01T09:00:00Z',
      weight: 60, reps: 2, role: 'straight'},
    original: 2, value: 5, approximate: true,
    purpose: 'speed', source: 'athlete-confirmation'
  }]
});
```

Selectors must match original records exactly; `set` can narrow a review to one row. An execution review uses `kind: 'execution'`, the original execution (null when absent), and an explicitly confirmed value. No review can manufacture a missing performance. The original six sets remain six sets on one date, not six independent calibration days.

## Coaching assessment using Rowan criteria

Competition-specific practice, effort ceilings, purposeful support work and tapering are retained. Approximate low-effort practice does not become a maximum forecast; a historical maximum is not a loading floor. No hardcoded athlete weights are added. Short race-rhythm work can maintain specificity in a bench-priority two-run block, but it does not guarantee a PB. Current recovery does not clear future post-meet readiness; event and recovery restrictions remain explicit.

## Regression assessment using Priya criteria

Tests cover multiple absolute strength levels, absent experience, novice status, unresolved fatigue, corrupt selectors, wrong original values, missing/future records, duplicate reviews, unreliable/approximate effort, exercise isolation, failed/warm-up/optional work, stale corroboration, non-compounding reviews, frozen saved outputs, and browser-global/Node parity. Private checks additionally compare reviewed real-case prescriptions with the released engine given the same explicitly confirmed evidence, verify deterministic generation and source bytes, and exercise preservation in a pure in-memory replacement preview.

Rowan and Priya are assessment criteria here; no separate human review is claimed. Full software and frozen scenario/depth checks are required before integration. This API correction does not supply a validated speed-to-load model, new bar-velocity evidence, race PB evidence, or a production correction UI.
