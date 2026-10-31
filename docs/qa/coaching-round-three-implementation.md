# Coaching refinements: same-five replay

The reviewed fixes are implemented in shared rules and applied to new proposals. The same five fictional athletes were replayed without changing their inputs. The original failing review and initial metrics remain intact.

## What changed in the prescriptions

| Case | Before | After |
|---|---|---|
| K: marathon taper | No work-pace running for three taper weeks; deadlift 2 x 3 at 120 kg, RPE 7.5, three days before racing | 4, 3 and 1.2 km current-fitness pace reminders within reduced running volume; final Thursday deadlift 1 x 3 at 85 kg, RPE 5.5 |
| M: bench-only meet | Supporting squat/deadlift progressed into heavier specificity doubles | Supporting lifts retain two maintenance triples, while the final bench single remains 142.5 kg at RPE 9 |
| N: half then powerlifting | Squat 2 x 3 at 125 kg, RPE 7.5, the day after the half | No next-day squat; later recovery-week deadlift 1 x 3 at 105 kg, RPE 5.5. Later heavy sessions remain conditional on actual recovery review |
| O: completed-performance probe | Repeated stronger observed sets left the new proposal unchanged | Eligible repeated evidence produces a bounded, attributable proposal calibration; no automatic edit to the approved plan |
| L: unsupported marathon | Eight-week plan from 18 km/week remained blocked | Remains blocked; the engine does not force progression to satisfy the requested date |

K retains its 97.23 km peak and 32 km long run. Normalising the supplied recent marathon date changes its opening week to a provisional easy return. A dated normal-recovery report can resolve that context; the date alone does not prove the athlete remains fatigued. Long-run observations are now retained and consequential: changing 24-hour recovery to 96 hours affects both prescription and review, and changing 145-minute duration to 220 minutes affects the time-bounded rehearsal.

## Review and verification

The 18 prescription-level criteria were frozen before examining corrected output. The audit file SHA256 remains `a135f8d493eb52483e4cfa94673627929ba3cc045608de32810aed16558c704c`, and fixture SHA256 remains `fa52f05b76055696b73ef402339deb17e010c43879203fc837458e1bb415169c`.

- Before: 8/18 criteria passed; 10 were blocked. After: 18/18 pass.
- The earlier 13 profiles retain all 112 passing code criteria, including the original three comparisons. Six earlier athlete-information/recovery conditions remain explicit. Actual before/after dose comparison also confirms that peak running volume and longest runs are unchanged across those thirteen profiles; smaller taper reminders alter some work-pace week counts.
- 252 software tests pass, including tests that deliberately tamper with feasible labels and prescribed doses to ensure the audit rejects wrong coaching.
- Raw saved-policy generation is exactly unchanged across 18 profiles and 275 weeks, compared with archived pre-refinement code.
- All 11 browser regression scripts pass, including new-programme onboarding, approval/history retention, personal Garmin linking, and service-worker update/offline retention of an unfinished workout. The fresh-athlete activation failure found during verification was fixed and retained as a regression test.

Priya's prescription review in `coaching-round-three-retest-priya-review.md` accepts the scoped candidate changes with conditions retained. Passing software criteria is not unconditional athlete approval, a physiological recovery detector or a forecast of results.

## Deliberately retained limits

O's visit distribution has not been rewritten. Combining several main lifts in a shorter visit remains a future optimisation opportunity; the current calendar passes its inclusive timing model. Two visits need not force three separate heavy/volume/speed days. The engine still requires athlete judgement and review of completed work.

Saved programmes without the new refinement marker keep their prior behaviour. The actual app's new-programme boundary supplies recorded evidence for calibration. No live programme, logs or onboarding state were changed by this work, and nothing was deployed.

Run `npm test`, `npm run test:coaching:depth` and `npm run test:coaching:rounds`. Raw CI captures retain every generated prescription and code hash. `coaching-round-three-retest-metrics.json` and the before/after gate files preserve compact review evidence alongside the original baseline.
