# Combined mobile UX release candidate — issue 115

Prepared for Ella, Chief of Staff. Review candidate only: no merge or deployment is authorised.

Production baseline: `49433e748dd1090c205e954e915a4490cb820a56` (latest main when integration began).
Integration branch: `release/mobile-ux-115-rc`.
The exact published candidate SHA and all protected-file SHA-256 values are recorded in the CI artifact's `combined-integrity.json` and in the integration PR.

## Integration record

The isolated branch merges the final phase snapshots in this order:

1. #116: `01f68f0340565239b22fe924a50187afa719a2db` — Settings, equipment, recovery.
2. #117: `437e21817bdbb9e84ac233e10dd94d2bf639922f` — Today, previews, active workout reference.
3. #118: `5fd565b930c117737c8f011b9af9fcb8283fc9f8` — Progress and recorded runs.

One overlapping listener required a deliberate resolution. Phase 3 supplies `openRecovery` and an explicit Progress recovery route. Its removal of the old document-wide `progressReviewBtn` click interceptor is retained, while keeping the restored-workout reference from Phase 2. Otherwise, the integrated application files are byte-identical to the completed Phase 3 snapshot, which already contains the earlier improvements. No styling or prescription is regenerated. A combined browser regression ensures coaching actions remain in Progress rather than being intercepted as recovery navigation.

## Thirteen-item acceptance checklist

| # | Improvement | Automated/browser evidence |
|---|---|---|
| 1 | Seven compact Settings destinations, technical controls disclosed on demand | `mobile-ux.browser`, combined before/after Settings |
| 2 | Grouped equipment, specialist expansion, tri-state confirmation and later editing | equipment browser/offline gate, onboarding, eligibility regressions |
| 3 | Final-component weekly check-in, late/imported completion, persistent deferral and reopening | mobile UX and combined late-completion browser scenarios |
| 4 | Programme management in Settings, explicit preview/approval, Stage 8 fingerprint/backup/rollback retained | programme replacement mobile and Node suites |
| 5 | Train focuses on the active workout; quiet route to Today when empty | Today workflow and mobile workout suites |
| 6 | Preview background lock, independent real touch scroll, focus containment, Escape and scroll restore | mobile workout real CDP touch and keyboard assertions |
| 7 | One duration estimate, optional differences only when meaningful, shorter-session approval intact | flexible session time mobile and Node suites |
| 8 | Inline previous-week actual sets/reps/load/RPE/notes, read-only and present on resume | comparable-workout unit/mobile and combined offline resume |
| 9 | Swipe carousel, no prominent arrows, labelled pagination and keyboard alternatives | Today touch swipe, keyboard/Home/End tests |
| 10 | Upcoming sessions share the weekly card language | Today workflow, mobile screenshots and shared card styles |
| 11 | Concise exercise dose/load/RPE/cue, full rationale available by expansion | bench exposure and mobile workout previews |
| 12 | Your Progress and training totals precede history | mobile Progress and combined before/after screenshots |
| 13 | Rounded distances, clock time/pace, honest segments/totals, prescribed-vs-actual and comparable explanation | run presentation Node, Garmin/local imports, mobile Progress preservation |

All checked rows describe implementation and test coverage, not a substitute for physical Android acceptance. CI results for the exact candidate are authoritative in the integration PR.

## Combined regression gates

- Full Node suite; athlete coaching acceptance; coaching replay safety and depth.
- Entire existing browser/PWA job, including all tabs, onboarding, actual logging/resume, synthetic Garmin API/file import, invalid/duplicate data and exact history retention.
- Stage 8 verified replacement, read-back backup, interrupted transaction, idempotence and rollback retaining newly recorded work.
- All three mobile UX suites, including real touch scroll/swipe, keyboard and raw precision preservation.
- Additional production-main → candidate update via the existing Update now flow on the same origin, then offline reload. The fixture represents an already-installed production week with its existing revision markers. Exact stored November programme, prescriptions, original RPE, Garmin activity IDs/associations, equipment, onboarding settings and active workout entries/notes must remain unchanged. No manual JSON import or activation is used.
- Separate synthetic device scenario: a late Garmin completion finishes programme week 2; no early prompt, persistent Later, discoverable check-in, original athlete fields/history retained and no duplicate prompt after submission.
- SHA-256 comparison of 14 protected production files. The programme package, coaching engine, exercise eligibility, replacement/rollback, backup, local parser and connection/export logic must remain byte-identical to production main. The UI-only Garmin formatting changes are validated by import/linking/history tests.

Only synthetic athletes and ephemeral browser contexts are used. Source PRs remain open.

## Evidence and remaining limitations

CI retains `mobile-ux-115-evidence`, including committed phase images, `combined-before-{settings,today,progress}.png`, `combined-after-{settings,today,progress}.png`, Progress/run/reference images, this report and the candidate integrity manifest.

Physical Android/TalkBack verification remains required: small-screen spacing with system font scaling, browser/address-bar and keyboard behaviour, back gestures, focus announcements, and installing/updating the existing PWA on the owner's normal origin. Real Garmin connectivity was not exercised; synthetic payload/file, activity association and offline import behaviour are tested. Legacy Garmin summaries without segment boundaries remain explicitly non-additive; ambiguous prior-week history shows an honest empty state.

## Safe merge and deployment recommendation

1. Ella and the owner review the exact integration SHA, combined CI and synthetic screenshots. Complete physical Android/TalkBack checks before approval. Stop if any significant regression or unresolved conflict remains.
2. Recheck that production main and the three source heads still match the pinned references. If main has changed, update this isolated branch and rerun the complete combined gates before approval.
3. Preserve a normal, verified pre-release device backup as a precaution; do not clear site data, regenerate a programme, rerun onboarding or require a JSON restore. Confirm no active workout is at risk during update acceptance.
4. After explicit approval, merge only the integrated release PR into main. Keep #116–#118 open until verification and approval are complete; retire them as superseded after the integrated merge rather than merging their cumulative changes again.
5. Deploy through the existing production mechanism to the same origin. Keep the previous production commit available. The PWA uses the existing explicit Update now flow and retains application storage; avoid forcing updates during active training.
6. On the owner's Android device, reopen normally and verify the active November week/prescriptions, original strength RPE, Garmin IDs/links, confirmed equipment, workout resume and offline reopening. No onboarding or manual import should be needed.
7. If the UI release fails, revert the deployed application commit through the normal production path while preserving local storage. This UI release requires no data rollback; use Stage 8 only for an intentional programme rollback under its existing verification/approval protections.

This document recommends the procedure; it does not authorise or execute any merge or deployment.
