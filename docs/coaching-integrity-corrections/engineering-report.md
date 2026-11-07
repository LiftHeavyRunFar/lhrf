# IA01 and IA02 engineering report

The correction makes an approved running reduction executable and makes additional strength progression depend on valid evidence from the athlete's actual recurring plan. Ordinary A/B/C generated prescriptions remain identical to PR128. No recovery or training-dose policy is replaced.

Baseline: `cc8eef90b628269758bfdcb9b383aee8c41e2895` (investigation PR128). [Before/after proof](before-after-proof.json) records synthetic inputs and outputs from that baseline and the corrected engine, with the corrected engine's SHA256. Baseline code was compiled at its normal source path using unchanged local dependencies. The original audit fixtures and generated outputs remain historical evidence.

## IA01: the accepted dose and the executable workout agree

Previously `applyApprovedHybridRunning` multiplied `run.minutes`, leaving distance, steps and duration bounds unchanged. In the original 60-minute, 10 km example, accepting 10% less running displayed 54 minutes while still prescribing/exporting 10 km and retaining 55–60 minute bounds.

Now the helper validates the existing executable description, then uses the existing `fitRunToMinutes` fitter on a copy. It updates distance, step distances, whole-run duration bounds, minutes and structure together. Existing session time estimates, visit estimates and planned-stress summaries are recomputed. The same example now contains 9 km, 54 minutes and 50–54 minute bounds at unchanged 5:30–6:00/km targets. Garmin FIT decoding independently confirms the adjusted step distance.

The accepted decision key and a versioned application result are stored on the future run. Successful results include the exact original prescription and actual duration. Reapplying the same decision is an exact no-op. Withdrawing the synthetic approval and rebuilding from the unchanged saved baseline reproduces the original; this does not undo or rewrite completed training.

### Preserve purpose, otherwise decline to apply

- Work repetitions, work distances, recoveries and pace targets are immutable. Unambiguous legacy `Threshold interval` labels are recognized on the working copy, matching the canonical engine's existing hard-step convention.
- Ordinary easy padding is removed before warm-up/cool-down running. Existing fitter minima are reused (including its 1 km warm-up, 0.5 km cool-down and 15-minute easy defaults). These are existing planning conventions, not newly validated physiological safety limits.
- Long runs, race/event runs, event sessions and already completed run components are protected. A completed strength-only component does not imply that an uncompleted run is completed.
- A timed run with unknown distance can remain timed and unknown when its easy prescription is supported. Unsupported timed quality/recovery structure is deferred; it cannot silently become an easy run.
- Missing/contradictory pace, distance or timing information is deferred. In particular, numeric `paceSeconds` must agree with the step text used by FIT export, under the existing rounded ±5-second convention. A numeric overall pace summary must agree with the work-target bounds, or with the easy bounds for an all-easy workout. A vague effort-only summary is not converted into invented pace data.
- Existing whole-minute rounding and minimum duration may leave no representable reduction; this is reported explicitly, and short runs are never increased to 15 minutes.
- After fitting, the existing final weekly work-distance ceiling is checked again (20%, or the existing 30% marathon-pace exception). Removing easy running can increase the prescribed work-distance fraction. If the ceiling is crossed, cuts are restored and the adjustment is deferred. No quality workout is silently cancelled or rewritten to make the percentage pass.

Deferred cases keep the original executable workout and record `hybridAdjustment.status: "not-applied"`, requested minutes and a reason. Session warnings and the array's constraint result are blocked. The actual app wrapper displays the reason and throws before new-week activation can request confirmation or save a replacement. The existing active programme and completed history remain untouched. An original workout retained for review is not clinical clearance to perform it when recovery is concerning.

An approved duration reduction can therefore be impossible without a separately reviewed quality-dose change. This correction makes that conflict visible; it does not authorize a different quality dose.

### Totals and preservation boundaries

`runningWeekSummary(config, week, adjustedSessions)` sums the adjusted calendar, so training/race/total kilometres match the executable steps. It intentionally retains `requestedKm` as the pre-adjustment planning target. Time-cap adjustments remain time-cap evidence; the separate hybrid adjustment is not relabelled as a time constraint.

The helper consumes a sessions array. It does not rewrite a saved whole-programme artifact or historical `runningSummary`, completed prescription, raw set/run record, imported Garmin association or decision. Callers summarizing a modified future calendar must pass that calendar to `runningWeekSummary`; the default argument describes newly generated baseline sessions. The app's activation paths that invoke the helper receive the adjusted sessions themselves. Reviewed-programme selection continues to read its frozen reviewed snapshot and does not silently regenerate it.

There is a pre-existing application boundary: when `reviewedProgramme` exists, `activateCustomWeek` delegates to `LHRFSelectReviewedWeek`, which selects frozen sessions without calling this adjustment helper. `applyWeeklyReview` now refuses a new accepted running-duration decision on that unsupported route before changing overrides, decisions or storage. It says: “This reviewed plan needs a separate replacement review before changing running. Current programme unchanged.” The existing rejection flow and ordinary mutable-plan approval flow remain available. Existing older approvals and history are not retroactively edited; their generic re-activation instruction is not proof that a frozen prescription changed.

This correction covers the helper, its actual activation callers and unsupported-consumer approval handling. It does not add an adjustment overlay to reviewed snapshots. A future integration needs a consistent reviewed/effective prescription display and a separately approved stored-programme transaction.

## IA02: valid evidence, actual comparable opportunities

The baseline could propose extra progression from three tops dated years ago or in the future. Its epoch-week bins also allowed 48 hours of logs to appear multiweek. It did not establish that the rows belonged to the current programme, intended exercise setup, dose or recurring visit.

The repaired route adds evidence validity and provenance checks before the existing extra-progression criteria:

1. Exclude invalid/future dates and rows before the current programme's dated start/approval. Reject explicit programme mismatch, failed/skipped/uncompleted/technically failed rows, warm-up/optional aliases, unreliable or approximate RPE and invalid load/reps/effort fields. Source rows are retained unchanged in history.
2. Group duplicate linked rows by exercise, actual local calendar date and visit identity. A renamed copy or repeated row cannot create another completed exposure. Only a designated top set can establish this route.
3. Match each exposure to a preserved reviewed-programme prescription or an actual completed-workout prescription. Never regenerate historical exercise purpose to manufacture evidence. The programme needs a dated calendar and a current activated week consistent with that calendar.
4. Require comparable registered exercise/variant, load type, dose unit, intended purpose, reps and target effort. Compare execution metadata when supplied; a known source execution may provide the intended context omitted by the current app's logged-set shape. Standard registered Squat, Bench and Deadlift identities remain valid when their canonical metadata has no optional execution subtype. Genuinely untyped source and log records cannot establish an exact setup by matching two missing values.
5. Match source visit identity and source week to the row. A different completion day requires preserved completed-workout evidence for that actual completion; arbitrary reassignment of week labels does not count.
6. Require at least three distinct comparable completed visits, with at least one same-purpose planned practice recurring across the actual plan cycle. Actual completion dates must span a recurrence interval supplied by the plan's dated day/week contract. Three source-week labels completed together do not establish recurrence. Calendar-day resolution avoids making a small time-of-day difference invalidate a weekly repeat.
7. Require evidence for the latest due comparable opportunity. Both provenance routes add current/previous due-calendar witnesses where the saved source does not already cover that practice, so an old partial snapshot cannot imply that no later work was due. Current saved scheduled dates are respected; the active template supplies a calendar witness, not an invented historical dose. A current-day visit is not treated as completed merely because that day has begun.

Missing provenance, unknown setup, missed recent opportunities or inconsistent cadence decline additional progression and explain the evidence gap. They do not delete past context, change the active schedule, stop ordinary planned progression or prevent the athlete choosing an effort-compatible load at prescribed RPE. Explicit completion evidence supports legitimate delayed sessions; compressed make-up sessions remain insufficient for this claim.

This conservative contract can also decline a plausible compressed reschedule when no actual pair spans its planned recurrence. That is an evidence limitation for the extra suggestion, not a finding that the athlete failed to adapt. Baseline progression and human review remain available.

### This is not a new adaptation policy

There is no new universal 7-, 14-, 28- or 42-day eligibility window. Recurrence comes from the stored plan calendar. The existing three-exposure guard, ≤6-rep comparison, effort margins, trend calculation and optional 2.5% suggestion remain product heuristics, not research-proven adaptation thresholds. Passing the integrity checks does not demonstrate physiological adaptation or justify a universal review interval. The progress proposal now says so explicitly and includes its dated source evidence.

Maintenance, deload/taper, completed-target, duplicate-decision and recent-approved-progression safeguards remain. Pain/symptom and hybrid recovery branches remain ahead of extra-performance progression; missing top-set provenance does not block immediate recovery review. No feedback frequency, recovery duration or automatic training-dose rule is changed.

### Legacy compatibility tradeoff

Many legacy logs do not contain a stable visit link and preserved typed prescription. These now remain context rather than supporting an extra automatic load proposal. No storage migration or forced backfill is introduced. Positive controls use the exact current app log/completed-prescription shape, including its omission of logged execution, and actual C generated registered main-lift metadata.

The 28 original generated-prescription hashes still pass unchanged. Of the three historical review fixtures, the fatigue decision remains hash-identical. The old on-target and strong fixtures lack trustworthy current-calendar provenance and now continue ordinary planned progression with an evidence explanation. Their historical hashes and inputs were not rewritten. Tests explicitly assert this narrower behavioral change.

## Reproducible checks

Run from the repository root:

```sh
npm test
node scripts/test-athletes.cjs --json
npm run test:coaching:safety -- --output /tmp/lhrf-integrity-safety
npm run test:coaching:depth -- /tmp/lhrf-integrity-depth
```

On this correction:

| Check | Result |
| --- | --- |
| Full repository unit suite | 475/475 passed |
| Existing synthetic athlete suite | 42 trajectories, 468 weeks, 9,994 checks; zero failures or coaching gaps |
| Existing replay safety | Completed all three stages; `engineSafetyPassed: true` |
| Existing replay feasibility | `coachingCodeGatesPassed: false`, existing blocked feasibility gates remain visible |
| Existing coaching-depth replay | 18/18 gates passed |
| Exact A/B/C generated blocks | All serialized prescriptions equal the PR128 historical evidence |
| Historical generated-prescription parity | 28/28 hashes unchanged |

The replay safety result establishes its software fail-closed contract, not that all replay programmes are feasible or safe for a particular athlete. Synthetic test outcomes are not an efficacy study. No private device records were accessed.

Targeted controls are in `tests/coaching-integrity.test.cjs`, `tests/coaching-integrity-assurance.test.cjs`, the corrected IA01/IA02 assertions in `tests/independent-coaching-audit.test.cjs`, and the deliberately separated legacy review assertions in `tests/shared-coach.test.cjs`. Logs and replay captures were written outside the repository under `/workspace/work/coaching-corrections/integrity/`; no historical QA outputs were overwritten.

## Scope and remaining decisions

Runtime edits are limited to the canonical engine's approved-adjustment/review paths, the app's small activation guard, and its refusal to record an unsupported frozen-plan running approval. Existing generation, recovery policies, dose thresholds, event preparation, equipment policy, approval requirements and rollback mechanisms are preserved. No source data or saved programme is modified by the tests.

IA03/IA04 recovery consistency and broader stability/novice review coverage remain separate work. Changing quality dose when an accepted duration reduction is infeasible, choosing a future coaching review cadence, validating progression margins, or migrating historical provenance would require a separate justified decision. This change makes no claim to resolve them.
