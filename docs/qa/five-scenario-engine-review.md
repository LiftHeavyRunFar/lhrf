# Priya — five-scenario coaching-engine review

**Verdict: none of these five baseline outputs is a complete programme ready to hand to an athlete. All five are correctly marked `feasible: false` by the engine.** This is useful evidence of gaps, not evidence that the engine approved them.

These fictional profiles were executed against the actual shared engine at local commit `d366ffdf5e11d50e11e424eaf32fc248ccf9eb47`, with clock fixed to 30 October 2026, programme start 2 November 2026 and seed 1570806085. The runner uses `buildNewProgramme → prepareNewProgramme → buildProgramme → createEngine.describeWeek → generatedSessions`. The browser app delegates to the same core; this was a local core test, not a browser activation or deployed-build verification. No live athlete records were read or changed.

Raw, unedited outputs: `docs/qa/five-scenario-engine-baseline/A.json` through `E.json`. Input/source/mapping: `tests/fixtures/five-scenario-engine-inputs.json`. Replay: `node scripts/test-five-scenarios.cjs`.

## First-week result

| Case | Requested runs | Scheduled runs | Actual training km / baseline | Strength visits | Engine verdict |
|---|---:|---:|---:|---:|---|
| A: three-day 10K | 3 | 1 | 10.8 / 25 | 2 | Blocked: two runs unplaced |
| B: first half | 3 | 2 | 13.5 / 18 | 3, instead of requested 2 | Blocked: one run unplaced |
| C: 5K then powerlifting | 3 | 1 | 12 / 28 | 4, versus current 3 | Blocked: two runs unplaced |
| D: fatigued meet preparation | 2 | 1 | 9.6 / 34 | 3 | Blocked: one run unplaced |
| E: ambitious half | 3 | 2 | 18 / 24 | 3, instead of requested 2 | Blocked: one run unplaced |

The raw output and audit both count actual scheduled work, not a pre-scheduling mileage budget. The retained long run is 100% of actual first-week running in A/C/D and 66.7% in B/E. Those percentages diagnose missing supporting runs; they are not universal injury cutoffs.

## Case verdicts

| Case | Coaching verdict | Keep | Rebuild first |
|---|---|---|---|
| A | Blocked; not a three-run 10K programme | Stable maintenance lifting and explicit unplaced work | Fit the three runs around genuinely time-bounded strength visits |
| B | Blocked; the requested two-lift/three-run week is absent | Rep-based starting evidence and no forced maximal test | Strength-visit grouping, final-calendar endurance support and race-day time permission |
| C | Blocked; two goals are dated but their priority handover is absent | Both events appear on their actual dates | Running-first race preparation, post-5K handover and coordinated meet recovery |
| D | Blocked; supplied fatigue context does not drive the proposal | Meaningful competition practice and dated final exposures | Ingest recovery evidence and gate lower-body loading; remove the automatic post-meet long run |
| E | Blocked; target pacing is handled better than the calendar | Unsupported 1:45 target is flagged; pace remains tied to current evidence | Restore three runs/two strength visits with real time budgets |

## What passed

- All five runs are deterministic at the fixed clock, preserve supplied config/history and match direct canonical generated sessions. Review is read-only.
- Unschedulable work is returned explicitly and feasibility is false. The app's existing approval handler refuses an infeasible plan. These partial outputs must retain that blocked status in reports and exports.
- Running-focused strength maintenance is a distinct, reduced and stable dose in A/E rather than a strength-building block under a different label.
- B retains the original weight and rep counts; no tested 1RM was fabricated to start it. The engine derives provisional loads from its rep estimator.
- E warns that the 1:45 request is faster than current evidence. Its work paces and steps are identical with and without that target; goal metadata changes, not the prescribed pace. First-week quality is 5:41–5:51/km, not the requested half-marathon pace of approximately 4:59/km. This is a real safeguard.
- D preserves competition-lift practice with differentiated bench roles and selects final heavy sessions from the actual schedule: squat Wednesday 18 November, deadlift Friday 20 November, bench Monday 23 November. It does not impose a named weekday the athlete cannot train on.

## Blockers and required rebuild

### 1. The scheduler models lift components, not complete visits

**Severity: blocker for all five.** Default capacity is two components per day, where squat and bench each consume a component. A has squat+bench Tuesday, bench+deadlift Thursday and only its long run Sunday. Both weekday runs are left out. B/E have three strength visits and two runs, despite the requested two visits and three runs. C has four strength visits and no weekday running.

The source profiles specify strength visits, not every lift frequency. Rowan supplied explicit per-lift frequency assumptions to use the existing API, and kept the default component cap. These results therefore test those declared mappings. They do **not** prove the athlete's underlying goals are impossible. Raising a component cap without assessing time would only hide the gap.

**Required change:** make strength visits, lift exposures, mixed visits and separate visits distinct scheduling concepts. Protect the chosen sport priority when resolving capacity; propose an explained frequency/dose tradeoff or return a concrete conflict. Recalculate running adequacy after scheduling. Do not turn an incomplete calendar into a PDF labelled an executable programme.

### 2. Inclusive time budgets cannot be verified

**Severity: blocker for all five.** There is no native input for each whole-visit minute cap, lifting warm-ups/rest, transitions, or the minimum six-hour gap between C's two Tuesday visits. A `doubleDays` flag permits mixed components; it does not establish AM/PM scheduling or visit duration. Run minutes alone do not prove the entire workout fits.

**Required change:** accept the athlete's actual visit windows and combined/separate permissions; estimate the complete visit, disclose assumptions and trim low-value supporting work or block when it cannot fit. C needs two separately timed Tuesday visits, each <=75 minutes, rather than a single aggregate allowance.

### 3. C has no dated priority handover

**Severity: blocker.** The engine holds `priority: Running`, `hybridFocus: running`, `runs: 3` and `strengthMode: progression` for all 18 weeks. Weeks 7/8 reduce running provisionally after the 5K, but there is no switch to the requested two easy runs and strength-first preparation. After recovery, the running budget resumes growth; it reaches a requested 43.791 km in the March meet week, even though only 12 km is scheduled. The final strength single ceiling remains 7.5 because the old running-first setting still applies.

The 5K race week has four strength visits, including Thursday squat top triple plus two back-off triples, and no preparatory runs other than the race. This does not express a running-first 5K peak.

**Required change:** support ordered dated goals, an explicit recovery/reassessment gate and a new priority/frequency contract after the first event. Preserve athlete approval. Test the actual weeks before, during and after each event rather than only checking both event dates appear.

### 4. D's fatigue evidence does not reach a usable initial decision

**Severity: blocker.** The two dated squat work sets were passed with their genuine reported-work-set role. Source sleep hours, recovery duration, mileage history and untimestamped deadlift/bench facts were preserved, not converted into invented readiness scores, timestamps or designated top sets. The current input contract cannot fully ingest that evidence.

With the representable history, first-week generation is byte-identical to the no-history counterfactual. The weekly review reports zero designated main-lift exposures and gives a generic evidence-building response. The plan still starts Monday with squat 157.5×5 plus 3×5 at 147.5 and Wednesday with a 182.5 kg squat single plus 3×3 at 160. It contains 54 non-optional work sets across the three lifting visits. This is not an explicit recovery-led response to the profile.

The reduction from 34 km baseline to 9.6 scheduled kilometres is caused by generic run limits and an unplaced run. It must not be credited as an intelligent fatigue intervention.

**Required change:** ingest structured baseline/trend evidence without manufacturing log semantics; distinguish uncertainty from normal readiness. Feed current recovery evidence into new proposals or block the proposal for review. Preserve normal bench practice while reducing low-value lower-body stress and re-escalate conditionally. Do not silently alter an already approved schedule.

### 5. The day after a powerlifting meet is still an ordinary long run

**Severity: major in C/D.** C prescribes 12 km/75 minutes on Sunday 7 March, immediately after its Saturday meet. D prescribes 9.6 km/60 minutes on Sunday 29 November, immediately after its Saturday meet. Strength work has post-event logic, but running does not receive a coordinated strength-event recovery gate.

**Required change:** coordinate recovery across both sports. Make the immediate post-meet running decision conditional on actual recovery instead of preserving an ordinary long run automatically. Cover both strength-first and initially running-first dual-event configs.

### 6. Event availability is not a first-class constraint

**Severity: major.** B's half-marathon event is estimated at 135 minutes, beyond its Sunday 130-minute window, before considering event logistics. That extension is unconfirmed. C's Saturday powerlifting meet is inserted although Saturday event-day availability is unconfirmed. D explicitly permits its Saturday meet without a time cap; that event must not be incorrectly rejected using a weekday training limit.

**Required change:** separately capture event-day permission, duration/logistics flexibility and any event cutoff. Block unresolved participation assumptions; do not treat event insertion as consent.

## Other coaching shortcomings

- **Major:** B's supplied baseline-set RPE is not used by `estimatedMax`, and paused bench is mapped to the native `Bench` baseline. The engine retains reps but cannot claim effort-aware or variation-specific calibration from that mapping. Keep estimates visibly provisional and require warm-up calibration.
- **Major:** B/E's missing third run materially changes endurance support. Any long-run-share, intensity and weekly-volume decisions must use the final calendar, including actual removed sessions, rather than the requested frequency.
- **Major for a standalone handover:** native output does not supply a complete missed-session rule, explicit effort-overshoot adjustment, practical fuelling rehearsal and escalation/check-in instructions. Earlier manually written notes cannot be credited to the engine. These need to be generated or attached by a shared, versioned coaching policy.
- **Minor:** E's first-week full-object target-sensitivity comparison is false because `paceBasis` metadata records the aspiration. The separate prescription-only comparison is true. A test must distinguish meaningful prescription changes from legitimate metadata differences.

## Review order

1. Fix the visit/constraint contract and athlete-priority scheduling; keep incomplete plans blocked.
2. Add ordered goals and coordinated recovery across event boundaries.
3. Integrate structured fatigue/recovery evidence into proposal readiness, preserving approved plans and logs.
4. Add event-day gates and complete runnable handover instructions.
5. Rerun these same frozen profiles, compare before/after calendars and loads, then add new random profiles. Priya should review raw changed outputs before any passing verdict or live rollout.

The baseline exercise is reproducible. It does not predict end results, establish injury risk, demonstrate real-world efficacy or certify that the currently deployed app contains this exact local commit.

## Executable acceptance result

`node scripts/audit-five-scenarios.cjs` reruns the native inputs and writes `docs/qa/five-scenario-engine-baseline/coaching-gates.json`. The baseline has 34 gates: 23 blocked, 11 passing; all five cases remain blocked. This command deliberately exits 1 while any case is blocked. Five evaluator unit tests use deliberately malformed synthetic captures to check rejection of missing work, unsupported constraints and tampered feasibility labels, plus controlled positive evidence and a pace safeguard. They do not require the real engine to retain its current defects. A green capture/unit-test run therefore does not mean the coaching gate passed.

The inclusive-time gate requires explicit proof that warm-ups, rest and transitions fit the source windows. The handover gate requires observable week-level priority and post-recovery run frequency. These are acceptance contracts to implement, not claims that those fields already exist in the engine.
