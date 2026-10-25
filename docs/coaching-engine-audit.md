# Shared coaching engine — current architecture and verification

The earlier inspection found separate live, prototype and preview-review implementations. This draft consolidates the active paths around `src/coach-engine.js`.

## One active coaching implementation

- `index.html` delegates programme generation, phase/block rules, variation/accessory selection, running prescriptions, hybrid workload analysis, top-set/back-off load calculations, progression carry-forward and weekly coaching reviews to the shared engine.
- `coaching-preview.html` loads that same engine and `src/coach-adapters.js`. Its separate RPE-trend, recovery and load-recommendation algorithms have been removed. Programme and feedback decisions now come from the shared engine.
- The seven athlete bots directly call `coach-engine.js`. They no longer exercise a separate v2 implementation as a stand-in for live behaviour.
- The Plan chart's phase label derives from generated session data. This removes a separate display-phase assumption when an event occurs before the end of the saved horizon.
- Phase eligibility for approved progression uses the same shared predicate in the app and trial handoff.

`coach-adapters.js` translates field names, log formats and rendering shapes. It does not implement another set of training thresholds or prescriptions. Storage, UI rendering and explicit acceptance remain in the app. Real programme records and isolated trial logs intentionally retain their existing separate storage keys.

The old `*-v2.js` modules are historical prototype comparison code. Neither active page nor the athlete bots loads them. Existing unit regressions for them remain, but their passing results must not be presented as validation of the active engine. See `src/README.md` for the canonical entry point.

## Preserve behaviour before redesigning programmes

This is an extraction of the existing live coaching rules, not a rollout of new templates. A parity fixture records the pre-extraction outputs at source revision `7fa1977132f212997ca29fbda73b9b3e551f58a8`:

- 28 week prescriptions across the seven profiles match exactly.
- Three on-target/strong/fatigued review decisions match exactly.
- Input athlete state is unchanged by generation and pending reviews.
- Preview native sessions are identical to sessions returned directly by the engine for the same profile and clock.
- No startup migration, data reset, programme replacement or onboarding restart is added.

This draft incorporates the Today fixes from PR #82 and is built on the bot/audit work in PR #83. It should be reviewed as their consolidation, rather than deploying the older independent drafts after it.

## Validation

- 31 Node tests pass, including shared-engine parity, wiring, the canonical athlete suite and retained historical prototype tests.
- All five tabs, touch-swiped calendar and complete strength/run workout flow pass in mobile Chromium, including reload/resume, completion marking and feedback.
- Preview generation → complete live trial → isolated saved log → shared coaching review passes. The original programme and onboarding records are unchanged.
- A real service-worker test upgrades the previous PWA through its Update now button, then reloads offline. The new shared module, programme, onboarding and active workout survive the update and offline reload.
- The preview date validation and run-only trial handoff were also corrected while verifying the shared path.

Browser tests use synthetic records, not the user's device-local data. Physical Android/Garmin behaviour and real-world coaching efficacy are not certified.

## Opt-in candidate policy and current athlete results

The private review build selects `coachingPolicy: review-v1`. Existing programmes without that flag keep their original prescriptions; there is no automatic migration or activation.

The candidate implements the requested bench top-set-first preference, caps explicitly light squat/deadlift work at RPE 5.5, and puts recovery before loading-phase changes. Short event preparations use a compressed development/specificity sequence rather than imposing several tiny blocks. Recovery weeks also reduce interval repetitions and omit optional isolation work. Later weeks beyond an event return through a recovery week instead of remaining in taper indefinitely.

The current candidate suite covers 42 trajectories / 468 synthetic weeks, with 11,790 invariant checks and zero regression failures. Three wider coaching requirements remain blocked: training experience, maintenance-strength policy, and resolution of restricted-day capacity. The candidate is for programme review, not certified training efficacy.

38 Node tests pass, including candidate rules, phase boundaries across 4–52-week horizons, event/settings preservation and the unchanged legacy parity cases. The private review copy also passed a complete browser walkthrough of all five tabs, preview/Start/readiness, required-set logging, feedback and completion marking.

The reference bot now explicitly requests the 10K goal rather than inheriting fitness maintenance. Historical parity fixture inputs are frozen in the fixture JSON, so changing a future bot profile cannot silently change the baseline inputs being compared.

`build-review.cjs` produces the hosted review snapshot from the existing app and the same shared module. It uses a separate origin and namespaced test storage, preloads the November goals and fixed split, and skips onboarding. Its 25 km/week baseline is labelled as a review assumption within the reported 20–30 km/week range. Unknown squat/deadlift loads remain unknown. Generated files are deployment output, not a separately maintained coaching implementation.

The acceptance job remains red for the three wider requirements. The compact report is in `docs/athlete-test-summary.json`; full traces are retained by CI. Your live programme, real logs and onboarding have not been changed.

## Repeatable checks

```sh
npm test
npm run test:athletes
npm run test:athletes:json
node tests/today-flow.browser.cjs
node tests/shared-preview.browser.cjs
LHRF_PREVIOUS_ROOT=/path/to/previous-checkout node tests/shared-update.browser.cjs
```

The browser tests require Playwright/Chromium, with optional `PLAYWRIGHT_MODULE` and `CHROMIUM_EXECUTABLE` overrides. The GitHub workflow installs a pinned browser-test dependency and runs the three suites automatically. It tests the upgrade from the pre-extraction Today-fix revision `58bbb0ba3603a36b40cbe1587b9d388e474a57c6`.

`test:athletes` returns 1 while coaching acceptance is blocked, even though regression tests pass. `readyForLiveUse` remains false; a candidate programme still needs athlete review.

The historical first inspection is retained in `docs/coaching-engine-audit-v2-prototype.md`. Its implementation/status statements apply only to that earlier prototype branch.
