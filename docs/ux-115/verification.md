# Issue 115 mobile UX verification

Synthetic athlete data only. Baseline: production main 49433e7. No programme package, athlete store, coaching prescriptions or Garmin payload is rewritten by this work. Review each phase in order; no merge or deployment is authorised.

## Phase 1 — navigation, settings and onboarding

Items 1–4: seven compact Settings categories; programme editor and verified replacement/rollback moved into Programme management; common equipment checkboxes and expandable specialist inventory; explicit available/unavailable/unknown states; original setup eligibility checks retained. Existing onboarding detection and storage key unchanged. Weekly recovery questions remain in the original coaching data path, now accessible from Today and Progress, with a completion banner for all scheduled workout components (including imported completion records), persistent Later/Dismiss and a check-in history.

Validation: 376 production Node tests passed; new weekly completion test passed. Chromium 390×844 touch context verified seven categories, editor relocation, equipment persistence, programme/history equality and no repeated onboarding. Before/phase1 screenshots use synthetic records.

Limitations: Android device testing is still needed. Equipment changes can intentionally block affected workouts until eligibility is reviewed; this existing safety behaviour is retained. Weekly banners remain until answered or explicitly deferred/dismissed; they do not interrupt the workout feedback dialog.

## Phase 2 — Today and workout experience

Items 5–11: focused empty Train state with a quiet Today link; preview body scroll lock/restore, independent touch scrolling, inert background, focus containment and Escape; single duration estimate with optional differences only when ranges differ; actual prior-programme-week session reference, matched by day/session and main exercise role/load convention, without writing current inputs; swipe rail plus keyboard arrows/Home/End and labelled pagination buttons; consistent upcoming card design; concise exercise dose/load/RPE/cue with optional rationale.

Validation: all 378 Node tests passed. Chromium mobile suites passed: Today workflow (including real CDP touch swipe and UK DST boundaries), shorter-session preview/approval, weekly prompt/imported-completion/deferral/recovery coaching path, immutable prior-week reference and reload, modal focus/Escape/scroll restoration, equipment persistence, verified Stage 8 replacement/backup/read-back/interrupted activation/rollback preserving new training. Settings screenshot review also caught and corrected local Garmin import placement; backup restore controls now live with Data and recovery.

Limitations: prior-week references require an identifiable prior programme week, matching session/day and actual recorded work; ambiguous legacy records show an honest empty state. Browser emulation does not replace physical Android/TalkBack verification. No live Garmin credentials or athlete data were used.

## Phase 3 — Progress and recorded runs

Items 12–13: keep Your Progress/training totals above history; compare saved prescribed distance/time/pace with actual recorded work, show meaningful differences, use 2-decimal distances and clock times, explain comparable easy-run selection, retain source/timing details. FIT/TCX laps are labelled segments; whole-activity and explicitly cumulative entries are labelled separately. Legacy Garmin summaries without segment metadata remain explicitly non-additive and unconfirmed. No inferred splits or source data rewriting.

Local validation: 46 targeted formatting/history/Garmin import/linking/local-file/backup/equipment tests passed; expanded touch and Progress browser tests are wired into PR CI with synthetic screenshots retained as artifacts. The last full suite before this phase passed 378 tests. Fresh local Chromium launches and shell GitHub calls are blocked by the command sandbox without another permission prompt, so remaining browser validation runs in GitHub Actions through the connected GitHub app. Existing browser tests have been updated for the disclosed Settings/weekly-recovery destinations and clock formatting.

Final acceptance still requires the owner's physical Android/TalkBack review and PR CI results. No deployment, live athlete-store access or live Garmin call is part of these checks. All screenshots and fixtures are synthetic.
