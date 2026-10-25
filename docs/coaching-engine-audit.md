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

## Current athlete results

Seven profiles × six behaviours = **42 trajectories / 468 simulated weeks**, now through the actual shared engine. The latest report records **12,329 invariant checks**, zero regression failures and **seven blocked coaching requirements**:

1. Recovery/rationale at all phase transitions.
2. Bench top-set-first preference in foundation work.
3. Explicitly light squat/deadlift constraints.
4. Experience-aware prescriptions.
5. A distinct maintenance-strength policy for running priority.
6. Resolution of per-day component capacity, beyond generic scheduling warnings.
7. Post-event recovery/progression when the saved horizon continues beyond the event. The bots exposed later weeks remaining in a strength-event taper.

Some old prototype failures, such as losing dated running structure or failing to generate a protected long-run role, are absent in the existing live generator. This is why the old prototype counts cannot be substituted for results from the actual engine. Consolidation has not established the correctness of every event-week prescription.

The acceptance job deliberately remains red while these requirements are blocked. Extraction parity proves behaviour preservation, not programme quality. The compact snapshot is in `docs/athlete-test-summary.json`; full per-week traces are retained by CI.

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
