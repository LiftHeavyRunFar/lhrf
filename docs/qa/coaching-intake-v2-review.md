# Priya: version-two intake integration review

The version-two programme path was exercised through the actual app in a mobile-sized Chromium browser. Tests used disposable synthetic browser contexts, the real intake controls and canonical generation. They did not activate a real athlete account or send a workout to an external service.

## Passing evidence

- `tests/coach-intake.test.cjs`: seven unit checks pass for immutable input translation, valid and invalid visit/history facts, separate-visit budgets and gaps, explicit event permission, dated handover validation, raw recovery observations and sleep/context retention without fabricated check-in scores, plus rejection of same-day strength and running events pending individual timing review.
- `tests/coaching-intake-v2.browser.cjs`: a stored version-one programme remains unchanged while A's three-day proposal is previewed. Explicit approval archives the old programme/schedule, keeps sets, runs, check-ins, decisions, feedback and completions, activates version two with independent IDs, and survives reload.
- The same browser test rejects B's future half-marathon participation outside the supplied 130-minute window. The first week fits; approval nevertheless stays disabled because the full horizon is checked. Supplying an explicit 150-minute event allowance permits approval without mutating history during the interim previews.
- C's actual intake creates the running-first then strength-first handover. Week eight has the new priority and two easy runs. Its Tuesday budgets are independently bounded to 75 minutes with a six-hour gap. Unconfirmed Saturday meet availability blocks approval until explicitly confirmed.
- O3's unknown running baseline stays a time-based health dose. Preview shows 20 minutes, the real timer contains a 1,200-second time-only step, and watch upload is disabled instead of inventing distance or pace. An actual 2.4 km / 20-minute run is logged and completed without rewriting the approved programme or earlier strength records.
- Updated `tests/general-coaching.browser.cjs` passes the existing-athlete new-programme flow with version two, distinct heavy/volume/speed roles and preserved prior state.
- Updated `tests/onboarding-athletes.browser.cjs` passes beginner onboarding, all five app tabs, reload persistence and the undated two-run marathon base-building case. The first partial week contains only sessions on or after its Sunday start.

## Regression interpretation

The Sunday-start test checks actual weekday placement rather than forbidding any bench exercise: a bench session on the starting Sunday is valid. The bench-role test includes primary competition-lift variations, because a volume exposure need not literally be named `Bench`. Neither adjustment waives the underlying calendar or heavy/volume/speed requirement.

Browser execution used the CI-pinned Playwright 1.56.1 runtime with its real headless Chromium binary. The new intake test blocks service workers to isolate intake and approval behavior; offline/PWA-upgrade validation is a separate parent-owned check. Hardware delivery and real-user performance are outside this review.

## Additional integration verification

- Standalone version-two preview covers explicit event permission, saved prescription context despite later form edits, reload persistence, and unchanged approved storage.
- PWA update/offline checks pass with the saved programme and unfinished workout intact. Existing today-flow, running-flow, release and shared-preview checks also pass.
- The full software suite passes 232 tests. The ordered coaching replay completes all 13 profiles with 112/112 code criteria satisfied. Six cases retain explicit athlete-information or readiness conditions; they are not unconditional athlete approvals.

Final browser regression: all 11 browser scripts pass, including Garmin import/link/unlink and approved bench exposure. The Garmin date-label assertion accepts the optional locale comma while still requiring both exact completion and planned dates. PWA validation includes an actual update followed by offline reload. This verification does not publish or replace a real athlete programme.
