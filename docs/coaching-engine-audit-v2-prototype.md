# Coaching engine inspection and athlete test bots

This branch develops and tests the isolated coaching v2 prototype. It does not change `index.html`, `sw.js`, real athlete records, onboarding, the active programme or the Today-screen draft PR #82.

## What the inspection found

There are currently three coaching paths:

1. The live app's inline generator and weekly review in `index.html`.
2. Pure v2 planning, prescription, scheduling and feedback modules in `src/`.
3. The preview page's own inline log comparison and approved-load-override logic in `coaching-preview.html`.

The new bots exercise path 2. A small mobile-browser smoke check also confirms path 3 still renders undated and adjacent-event previews without console errors. The paths are not yet one shared engine; success here must not be described as validation of the current live app's coaching.

## Coaching contract carried forward

- Joint strength/running planning, with an explicit precedence when goals conflict.
- Athlete-defined schedules, combined lower-body sessions, permitted doubles and a protected long-run day.
- Suggested strength loads with RPE targets, bench top sets before back-offs, actionable running paces and durations.
- Purposeful variations across blocks and recovery between phase changes, rather than arbitrary fixed-length programmes.
- Ambitious, evidence-supported progression; proportionate fatigue proposals, trimming lower-value accessories before considering a deload.
- No inference of fatigue or progress from missing logs. No automatic application of proposed programme changes.
- Athlete approval of programmes and meaningful changes. Existing athlete data and onboarding survive engine updates.

These are the existing requirements, not newly chosen prescriptions.

## Repeatable test athletes

| Profile | Horizon | Main challenge |
| --- | ---: | --- |
| Bench-first adjacent events | 6 weeks | 160 kg bench reference, 65-minute 10K reference, fixed Tue/Thu/Fri/Sat/Sun split, bench priority, light lower-body work, events on 28/29 November 2026 |
| Beginner hybrid | 8 weeks | Unknown strength loads, no usable pace baseline, appropriate entry point |
| Experienced powerlifter | 20 weeks | Squat priority, supporting runs, variation and block transitions |
| Running-focused athlete | 12 weeks | 10K event with maintenance lifting |
| Restricted schedule | 8 weeks | Three available days, maximum two components per day, fixed long run |
| Fatigue-prone test athlete | 12 weeks | Repeated effort overshoot and recovery feedback |
| Rapidly improving test athlete | 12 weeks | Positive trends, optional progression and guard conditions |

Every profile replays six behaviours: on target, consistently easier effort, accumulated fatigue, missed sessions caused by scheduling, variable effort and reported pain. The pain case deliberately includes easier sets so that progression suppression is actually challenged. A separate regression checks that a changed schedule cannot silently move a fixed session.

All inputs are synthetic. The reference athlete is a test fixture inspired by the requirements, not a copy of actual athlete logs or a statement of current readiness. Scripted RPE is a behavioural test stimulus, not a physiological prediction.

## Results after first corrections

- 7 profiles × 6 behaviours = **42 trajectories**, **468 simulated athlete-weeks**.
- **8,940 behavioural/invariant checks**, no regression failures.
- **26 automated Node tests pass**, including the new simulator and targeted regressions.
- **8 coaching acceptance gaps remain blocked**. The dedicated acceptance command deliberately exits with status 1 while these remain.
- Mobile preview smoke check passes for undated and adjacent-event generation, pace display, provisional status and browser errors.

The counts describe software checks, not evidence of training efficacy.

## Corrections made in the isolated prototype

- Explicitly incomplete or changed-repetition top sets cannot produce a next-load increase. Incomplete strength entries are excluded from trend comparisons. Missing completion stays unknown.
- Positive progression proposals are suppressed during recovery, realisation, assessment and event phases, or when pain/unusual discomfort or systemic fatigue is explicitly reported. This uses supplied context; it does not assume readiness.
- Load rounding cannot reverse the intended change direction at very small loads.
- Dated programmes retain their structured running workouts, paces and recovery-week flag.
- A quality-session fallback to easy running now uses an easy type, effort and pace together.
- The weekly review includes the existing running-progression signal and applies hybrid recovery guards to it.
- Exceeding an explicit daily capacity produces a structured capacity conflict and review requirement; a plan with that conflict cannot pass the all-sessions-scheduled check. The scheduler has not silently changed the user's available days.

Two inherited test failures were also resolved honestly:

- The hybrid test incorrectly expected pending proposals to mutate prescriptions. It now asserts that proposals remain separate and both sports' prescriptions stay unchanged, matching the approval contract.
- The preview copy test expected an obsolete claim that recording never changes a programme. The page and test now state the accurate distinction: recording alone applies nothing; load overrides require approval.

## Remaining programme acceptance gates

| Gate | Observed behaviour | Required before acceptance |
| --- | --- | --- |
| Phase transition recovery | Foundation/development/intensification can change without a recovery transition | Coherent block boundaries and a reviewable recovery rationale |
| Fixed long-run role | With two runs, Saturday can receive an ordinary easy prescription despite requesting a long run | Preserve both the fixed day and the intended training role |
| Bench top-set preference | Foundation bench work has no top set | Honour the selected top-set-first prescription style |
| Light lower-body work | The reference profile receives RPE 8 squat/deadlift top sets | Represent the explicit light-work constraint |
| Event week | Ordinary sessions are withheld; only event entries are scheduled | Sport-specific, reviewable taper/event-week training and adjacent-goal precedence |
| Training experience | Beginner/advanced input does not affect the prescription | Experience-aware entry and progression policy |
| Lift variation | No programmed variation is represented | Purposeful exercise selection across blocks |
| Maintenance lifting | Running-priority maintenance and progressive-strength templates are identical | A distinct maintenance policy that supports the running goal |

The bots detect these gaps but do not invent new programme policies to make the tests pass. Programme examples should be reviewed by the athlete after a candidate implementation, rather than asking them to execute each test.

## Running and automation

```sh
npm test
npm run test:athletes
npm run test:athletes:json
```

The second and third commands currently return 1 because coaching gates are blocked. The JSON command still emits the full reproducible report, including weekly signals/proposals for all trajectories. `docs/athlete-test-summary.json` is the compact snapshot for this branch.

The existing GitHub Actions workflow now runs the regression suite and a separate athlete-coaching acceptance job on relevant PR/main changes, or manual dispatch. It retains `synthetic-athlete-report` as an artifact even when gates are blocked. It is intentionally possible for regression tests to pass while coaching acceptance stays red. No background ChatGPT task or live coaching agent is installed.

## Limits and next development priority

The harness verifies that pending proposals do not change prescriptions. It does not implement or certify an accepted-proposal-to-next-week regeneration path. It does not exercise device-local logs, Garmin import, offline/PWA upgrades, live readiness presentation, or the live app's inline coaching. Those need integration tests once there is a shared engine contract.

The next candidate should model session roles and lift constraints explicitly (primary bench, light lower body, quality run, protected long run), then build coherent block/recovery policies around those roles. That addresses several linked failures before adding more surface features. Candidate programmes remain subject to athlete review; nothing in this branch activates or publishes a programme.
