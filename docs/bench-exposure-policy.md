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


## Approved peak revision — 30 October 2026

Mark explicitly requested implementation of the reviewed peak while retaining his last two logged sessions. `benchPeakVersion: 2` is enabled only for the approved November programme via `refreshApprovedBenchPeak`. Previous programme policies retain their original output.

| Heavy exposure | Effort ceiling | Initial suggestion from the saved 160 kg baseline |
| --- | --- | --- |
| Friday 30 October | RPE 8 | 147.5 kg × 1 |
| Friday 6 November | RPE 8.5 | 150 kg × 1 |
| Friday 13 November | RPE 8.5 | 150 kg × 1 |
| Sunday 22 November | Up to RPE 9 | 152.5 kg × 1 |

Friday 20 November is 2×2 light paused technique at RPE 5.5, with no supporting work. The final heavy Sunday has the single plus one easy double at RPE 6 and no accessories; it replaces speed work rather than adding a fifth heavy session. Tuesday 24 November retains the already-approved light technique dose. No Friday bench is added immediately before competition.

Single starting fractions of .922, .939 and .955, and volume-set fractions of .786/.811/.837 for 5/4/3 reps at target 7, are provisional coaching load estimates, not exact or individually validated RPE conversions. Load is selected against actual warm-up and set effort; a lower actual RPE does not require another attempt just to reach the ceiling. Logged top-set performance still recalculates bounded back-offs. Weekly bench repetitions and back-off sets fall towards competition. Old adaptive-percentage uplifts do not stack onto the newly approved peak.

The migration archives old remaining bench prescriptions and superseded future bench overrides. It preserves every set/run record, completion and recorded prescription, onboarding, prior programme archives, feedback and decisions. Completed and partially logged sessions (including legacy bench records without IDs) and live drafts are not replaced; past sessions and unrelated overrides are retained. Running and lower-body training are unchanged. It is repeat-safe, including when earlier startup migrations run first, and it leaves session IDs intact.

Evidence for a last heavy bench inside seven days comes from the primary survey of 364 raw powerlifters (https://pubmed.ncbi.nlm.nih.gov/34846328/). The small trial comparing two and four cessation days supports lift-specific tapering but does not prove that an RPE-9 single six days out is universally optimal (https://pubmed.ncbi.nlm.nih.gov/37639652/). The exact four-exposure sequence above is the reviewed coaching choice. Individual load selection follows the effort-based approach described by the original RTS coach, not a claim that chart percentages guarantee effort: https://store.reactivetrainingsystems.com/blogs/default-blog-1/how-to-use-rpe-in-your-training-correctly .

Validation includes the revised browser upgrade/logging test, exact heavy-exposure dates and effort ceilings, no heavy Friday/Sunday stacking, unchanged final Tuesday, falling volume, preservation of two completed sessions, legacy and active-draft protection, override archiving and repeat-safe startup. All policy and migration logic remains offline JavaScript.
