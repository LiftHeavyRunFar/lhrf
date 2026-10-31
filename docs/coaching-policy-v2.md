# Coaching policy v2: reviewed candidate

This policy implements the shared coaching changes exercised by the frozen five athletes, a new seeded five, and the original three hypothetical profiles. All prescriptions come through the canonical engine. No programme is hand-stitched in the scenario runner.

## What changes

- A strength visit groups several lift exposures. Whole-visit time includes warm-ups, sets, rest, setup and transitions. Combined and separate visits have different permissions and budgets.
- Optional work, support and excess back-off volume are adjusted before main exposures. Running-first beginner straight sets can reduce to two per lift. Easy running can be shortened with actual distances and quality share recalculated. Essential work that cannot fit remains blocked.
- Ordered goals resolve inside generation. The first event, recovery interval and subsequent priority/frequency/maintenance contract are represented separately.
- Strength-first experienced athletes receive distinct heavy, volume and speed exposures where frequency permits. Peak rehearsals can reach RPE 9; effort governs suggested loads. Unresolved fatigue preserves bounded affected-lift work, without replacing normal unaffected bench practice.
- Running includes current-fitness race-pace rehearsals, progressive aerobic support, specific preparation and taper. Unsupported goal times do not set training paces. Marathon long runs depend on weekly support, duration, history and time windows; no universal 26 km ceiling is imposed.
- Recent marathon recovery affects lifting as well as running. Immediate post-meet running is removed. Unknown running pace can use an explicitly timed health dose rather than a fabricated distance.

The progression rates, time estimates, effort ceilings and review points are adjustable product heuristics. They are not validated injury thresholds or performance forecasts. Fresh web literature verification was unavailable during this implementation; no new paper verification is claimed.

## Reproduce

`npm test` runs software regression checks. `npm run test:coaching:rounds` enters all profiles automatically and enforces the sequence: frozen five, fresh five, then original three. It stops when a stage has blocked coaching-code gates. Raw inputs, outputs, exact code hashes and audit results are retained in `docs/qa/coaching-rounds-current/` and uploaded by CI.

Code-gate success is separate from athlete readiness. Specific event permission, recovery reassessment, unknown history and comparison assumptions remain conditional. The standalone `test:scenarios:acceptance` command continues to return nonzero for those input reviews.

## Activation boundary

New proposals explicitly select `coachingRulesVersion: 2` and supply the structured visit/history/ordered-goal contract. Existing approved records retain their saved version. Current onboarding remains version one; this candidate has not been published or made the default. A production rollout still needs the intake/UI contract and end-to-end browser/device validation. No approved programme, logs, onboarding or live data was read or changed by these tests.

The browser and Node paths share the same modules. `running-workouts.js`, `running-preparation.js` and `coach-constraints.js` load before `coach-engine.js`; offline shell assets include them. Browser-global VM parity is tested. Full Playwright UI checks could not launch locally because the browser binary is absent; they remain configured in GitHub CI.
