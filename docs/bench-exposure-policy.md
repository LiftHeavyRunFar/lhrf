# Bench exposure policy v1 — approved 29 October 2026

Mark authorised implementation of the reviewed volume / heavy / speed proposal for the November bench competition. This is an opt-in coaching policy (`benchExposureVersion: 1`), initially enabled only for his installed `november-2026` programme with the 28 November event. Existing unrelated programmes retain their output. It requires three weekly bench exposures and excludes beginner, maintenance and light-bench prescriptions.

The first exposure is controlled volume, the second a competition-paused single and back-offs, and the third fast paused doubles with a speed/technique stop rule. All three retain the competition movement. This borrows distinct effort methods from conjugate training without introducing weekly maximum attempts, uncalibrated variations or bands/chains during a short competition preparation.

For the current 160 kg baseline, Friday singles are initially suggested at 140, 142.5, 145 and 147.5 kg across the four loading weeks, capped at RPE 7.5–8. These are starting suggestions, not mandatory weights or guaranteed RPEs. Actual single performance recalculates back-offs with bounded reductions. Volume falls towards the competition. The final heavy Friday is 20 November, eight days before the meet; Sunday is light technique. Competition week uses easy technique early in the week and no bench training in the final two days. Existing competition events remain intact.

Roles are selected separately from generic phase labels; actual event distance controls short preparation, while longer preparations retain planned recovery weeks. This policy does not claim that a dedicated speed exposure is superior for every athlete. Further profiles or different bench frequencies require separate validation and approval.

The migration archives replaced prescriptions, changes only future unfinished bench days, preserves running and lower-body sessions, identifiers, onboarding, logs, completions, decisions and overrides, and protects live or partially logged strength work. Active drafts and overridden sessions retain their approved prescriptions. A later reload can update a draft that was discarded without logging. Repeated loads are idempotent. A separately edited day combining bench with lower-body lifting is preserved for review. Future weeks are generated under the approved policy.

Validation: `npm test`, `npm run test:athletes`, and `tests/bench-exposure.browser.cjs` (included in CI). Targeted unit coverage includes 4–52 week horizons, early heavy practice, role separation, taper, lower/run parity, load feedback, approval scope, repeat-safe migration and active/completed session protection. The browser regression rehearses Friday at 05:55 with synthetic local data, preview, readiness, single logging and restored draft. No real athlete data is transmitted by the policy or tests. The engine remains plain offline JavaScript.

Background references: https://www.westside-barbell.com/pages/conjugate-method and https://pmc.ncbi.nlm.nih.gov/articles/PMC7552788/ . These support the effort-method distinction and taper rationale; exact prescriptions above are coaching choices, not claims of an experimentally proven optimum.


## Follow-up: complete and distinct supporting work

After reviewing the live release, Mark requested a full Sunday workout and more engaging accessories across the three bench days. `benchAccessoryVersion: 1` adds a separate support library without changing the approved main bench prescriptions:

| Exposure | Required support in the first block |
| --- | --- |
| Volume | Incline dumbbell press 2×8–10; chest-supported row 3×10–12; dumbbell lateral raise 2×12–15 |
| Heavy | Lat pulldown 3×8–10; triceps pushdown 2×10–12; reverse pec deck 2×12–15 |
| Speed / technique | Seated dumbbell shoulder press 2×8–10; seated cable row 3×10–12; face pull 2×12–15 |

Initial target is RPE 7. Unknown accessory weights are left for selection by effort; no competition-bench load or another exercise's history is used as a substitute. Exact exercise history supports double progression within the rep range. Alternatives serve the same training purpose, respect avoid/unavailable/prefer settings, stay stable through each five-week block, and rotate in later blocks. There are two optional extras per normal loading session where allowed exercises are available, with no duplicate required triceps or lateral-raise family. Optional work remains after required work and does not affect completion.

Supporting volume falls near competition: RPE 6.5 within 14 days, RPE 6 within ten days, reduced sets and no supplementary presses within ten days; no support work in the final five days or competition-week taper. Recovery weeks use reduced support rather than normal loading volume. This is purposeful variety across sessions and blocks, not weekly random exercise selection.

The targeted installed-programme revision is `2026-10-29-bench-accessories-v1`. Existing bench-role main sets are copied exactly, including approved progressed loads; running, lower-body sessions and all logs remain intact. As before, completed, partially logged, overridden and active workouts are protected. The browser test now upgrades from the just-published bench-only Sunday, previews all three Sunday support exercises, verifies the saved heavy single is unchanged, and tests live logging/reload.
