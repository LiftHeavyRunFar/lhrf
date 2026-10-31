# Coaching source of truth

`coach-engine.js` is the canonical coaching entry. The app, programme preview, workload/recovery review, live load calculations and athlete test bots must call it. Its version-two policy delegates pure visit fitting to `coach-constraints.js` and running preparation to `running-preparation.js`; views must not implement replacement coaching rules.

`coach-adapters.js` translates profile fields, persisted trial log records and rendering shapes. Keep programme and feedback decisions in the engine.

New version-two proposals carry `visitAllocationVersion: 1`: strength-first health-running calendars consider lifting-window capacity without treating an easy health run as race-quality work or imposing endurance long-run leg protection. Existing saved configs without this marker retain their allocation. Explicit fixed splits still take precedence. Inclusive session fitting and event/recovery checks remain mandatory.

The older `*-v2.js` files are historical, isolated prototype comparison code. They are retained only for existing historical regression tests. They are not loaded by `index.html`, `coaching-preview.html` or the current athlete simulator. The wiring test rejects reintroducing their script imports into either page.

To change coaching behaviour, add a canonical-engine regression/acceptance case, change the shared implementation and replay the athletes. Do not reintroduce inline coaching thresholds in a view or implement a separate generator for previews.

Policies are stored on each programme: legacy/unversioned, approved `review-v1`, and broader-athlete candidate `review-v2`. New onboarding/standalone previews select `review-v2`; existing records retain their policy. Never switch a saved programme's policy as part of an app update. `customPlan().feasible` describes scheduling feasibility, not training efficacy; omitted components are returned in `unscheduled` and must block activation.
