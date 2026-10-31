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

New-programme setup now translates structured visit, running-history, recovery and ordered-goal inputs through `coach-intake.js` into `coachingRulesVersion: 2`. Preview and explicit approval validate the full programme horizon, including future events. Existing approved records retain their saved version; opening a preview does not activate or rewrite them. Approval archives the previous programme and retains training history. Legacy advanced fields cannot silently replace a version-two handover: they route the athlete through structured programme review.

The optional version-two standalone preview uses the same adapter and keeps trial data separate from approved app storage. The browser and Node paths share canonical modules, and the offline shell includes the adapter. Genuine Chromium checks cover intake, approval, history retention, time-only runs, and PWA updating with an unfinished workout. These are synthetic browser contexts, not live athlete accounts or hardware delivery tests.

This integration is saved for review and has not been deployed. No live approved programme or athlete logs were changed.
