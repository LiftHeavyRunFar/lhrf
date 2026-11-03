# Issue 115 mobile UX verification

Synthetic athlete data only. Baseline: production main 49433e7. No programme package, athlete store, coaching prescriptions or Garmin payload is rewritten by this work. Review each phase in order; no merge or deployment is authorised.

## Phase 1 — navigation, settings and onboarding

Items 1–4: seven compact Settings categories; programme editor and verified replacement/rollback moved into Programme management; common equipment checkboxes and expandable specialist inventory; explicit available/unavailable/unknown states; original setup eligibility checks retained. Existing onboarding detection and storage key unchanged. Weekly recovery questions remain in the original coaching data path, now accessible from Today and Progress, with a completion banner for all scheduled workout components (including imported completion records), persistent Later/Dismiss and a check-in history.

Validation: 376 production Node tests passed; new weekly completion test passed. Chromium 390×844 touch context verified seven categories, editor relocation, equipment persistence, programme/history equality and no repeated onboarding. Before/phase1 screenshots use synthetic records.

Limitations: Android device testing is still needed. Equipment changes can intentionally block affected workouts until eligibility is reviewed; this existing safety behaviour is retained. Weekly banners remain until answered or explicitly deferred/dismissed; they do not interrupt the workout feedback dialog.
