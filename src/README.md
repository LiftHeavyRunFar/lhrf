# Coaching source of truth

`coach-engine.js` is the canonical coaching entry. The app, programme preview, workload/recovery review, live load calculations and athlete test bots must call it. Its version-two policy delegates pure visit fitting to `coach-constraints.js` and running preparation to `running-preparation.js`; views must not implement replacement coaching rules.

`coach-adapters.js` translates profile fields, persisted trial log records and rendering shapes. Keep programme and feedback decisions in the engine.

New version-two proposals carry `visitAllocationVersion: 1`: strength-first health-running calendars consider lifting-window capacity without treating an easy health run as race-quality work or imposing endurance long-run leg protection. Existing saved configs without this marker retain their allocation. Explicit fixed splits still take precedence. Inclusive session fitting and event/recovery checks remain mandatory.

New version-two proposals also carry `coachingSafeguardsVersion: 1`. Event-day `minutes` is a hard whole-event availability window including `logisticsMinutes`; `hardLimitMinutes` is a race-duration cutoff excluding logistics. `preferredFinishMinutes` and the existing `runningGoalSeconds` are aspirations, never substitutes for current-fitness estimates or overrides for hard limits. A strength event with a finite cap needs an explicit `estimatedMinutes`; unlimited confirmed strength events retain an unknown duration. Canonical intake preserves and validates these distinct fields.

This safeguards policy applies unresolved affected-lift fatigue to maintenance as well as progression, including explicit current lower/all-body recovery reports. It retains bounded strength practice, removes low-value support and preserves unaffected lifts and already lighter recovery work. Ordered-goal recovery intervals are enforced on each session's actual date; the interval is active while `0 < daysAfterEvent < recoveryDays`. Subsequent harder preparation still requires actual recovery review. Saved configs without the marker retain their previous complete output; there is no policy migration or storage write.

The older `*-v2.js` files are historical, isolated prototype comparison code. They are retained only for existing historical regression tests. They are not loaded by `index.html`, `coaching-preview.html` or the current athlete simulator. The wiring test rejects reintroducing their script imports into either page.

To change coaching behaviour, add a canonical-engine regression/acceptance case, change the shared implementation and replay the athletes. Do not reintroduce inline coaching thresholds in a view or implement a separate generator for previews.

Policies are stored on each programme: legacy/unversioned, approved `review-v1`, and broader-athlete candidate `review-v2`. New onboarding/standalone previews select `review-v2`; existing records retain their policy. Never switch a saved programme's policy as part of an app update. `customPlan().feasible` describes scheduling feasibility, not training efficacy; omitted components are returned in `unscheduled` and must block activation.
