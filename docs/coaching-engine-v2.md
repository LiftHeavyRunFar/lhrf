# LHRF outcome-first coaching engine — v0.1

Status: development specification, NOT active programme logic. Existing app and saved data remain unchanged.

## Contract

1. Intake defines a goal, priority, duration, constraints, baseline and confidence.
2. Every finite programme selects an explicit outcome: event performance, a controlled strength benchmark, a running benchmark, or a hybrid scorecard. An indefinite maintenance programme uses periodic reviews, not a forced peak.
3. Framework selection uses goal and training history, not an arbitrary programme length. Strength and running templates are individually coherent before hybrid coordination.
4. The hybrid coordinator reserves recovery capacity, protects priority sessions, and resolves conflicting stress before publishing the plan.
5. The progression planner connects the current baseline to the selected outcome. Planned deloads manage fatigue; they do not silently terminate progression three weeks early.
6. At a phase transition, changing exercise type, top-set intensity, sets or reps requires a total-workload check. A new heavy top set must be accounted for when calculating back-offs.
7. The final assessment is proportionate to the goal and athlete preference. Never require an unrequested maximal attempt.
8. Coach interventions are triggered by sufficient performance/recovery evidence; good trends can warrant progression, bad trends can warrant restraint. Significant changes require athlete approval.
9. Charts, labels and session prescriptions must derive from the same plan object, not separate phase formulas.
10. Missing logs do not imply fatigue or progress. Report uncertainty instead of manufacturing evidence.

## Acceptance scenarios

- 12-week undated strength: a final controlled strength benchmark; no unmotivated early intensity apex; deload followed by a clear outcome.
- 20-week undated hybrid: sustainable progression and end-of-cycle assessment, no compulsory competition taper.
- 20-week full powerlifting meet: specificity and fatigue management towards meet day for all three lifts.
- 12-week 10K goal with maintenance lifting: race-specific running progression with strength maintenance.
- Two events one day apart: explicit precedence, compatible taper and recovery trade-offs.
- Short or atypical durations: meaningful phases and no hard-coded 20-week special-case dependence.
- Unknown baseline: RPE discovery prescription rather than invented weights.
- No events and no fixed end date: periodic benchmarks, not forced taper.

## Rollout gates

A. Define and test framework selector and outcome contract in isolated modules.
B. Implement progression planner and hybrid workload budgeting; run fixture tests.
C. Render previews using the new plan object behind an opt-in flag.
D. Compare old/new output on scenarios; review failures before default rollout.
E. Migrate generator only after acceptance checks; preserve onboarding, saved plans, logs, and rollback path.

## Initial invariants

- No event-specific phase without a matching event.
- Fixed-length plan must have a stated end-of-cycle outcome.
- Phase transitions must explicitly account for top sets and back-offs.
- Planned peak/benchmark must not precede final programme week without an explained subsequent phase.
- A recovery week must have an identifiable purpose and follow-on progression.
- The app must never delete or reset stored user data during an engine update.
