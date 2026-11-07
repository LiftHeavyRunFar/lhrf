# App update 1.34.0 — coaching integrity

The owner explicitly requested publishing the app update on 7 November 2026, superseding the earlier no-merge/deployment instruction for this tested integrity release. Recovery-policy proposals and the pending November replacement remain excluded.

Runtime changes are the IA01/IA02 corrections and two narrow approval/activation guards from the reviewed integrity commit, plus a service-worker cache version bump to deliver the update through the existing Update now flow. No new programme installation, regeneration, recovery-policy change, history migration, RPE edit or Garmin-association change is introduced.

Before publication, a real same-origin browser test upgrades production `0ae327bdb9dfe11e189ff4a9b066d1406bc48f07` to this candidate using fictional reviewed November-shaped state, historical sets, original RPE, linked Garmin rows and an active workout draft. The complete main-state and draft storage remain byte-identical through Update now and offline reload. The test also runs the corrected executable-distance calculation online and offline, proving the new engine is loaded. This test is included in CI alongside the full existing suite.

The source-bound engine before/after proof remains valid because the app-update preparation changes no engine code. The prior full unit result is 475/475; release CI reruns it. Exact source SHA, final CI and GitHub Pages publication result are recorded in PR #131.

GitHub Pages publishes `main` at https://liftheavyrunfar.github.io/lhrf/. The prior production SHA is retained above for a code-only rollback if needed; do not restore an old athlete backup or alter device storage as part of a code rollback. Existing installed apps retain the normal update prompt, avoiding a forced reload during a workout.
