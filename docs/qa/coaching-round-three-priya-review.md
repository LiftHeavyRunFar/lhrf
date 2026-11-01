# Priya — third-round coaching review

The engine has improved, but this new round is **not ready for coaching sign-off**. The running build can produce substantial support mileage and repeated event-pace work, and the short-preparation marathon is correctly blocked. More demanding cases expose gaps in recovery coordination, tapering, per-lift intent and recalibration. Software feasibility is not coaching approval.

## Method and frozen inputs

Five new fictional profiles K–O were frozen before any prescription was generated. Fixture: `tests/fixtures/five-scenario-round-three-inputs.json`; SHA256 `fa52f05b76055696b73ef402339deb17e010c43879203fc837458e1bb415169c`; fixed clock 2026-10-31 and start 2026-11-02. Seed 2026103103 randomises names only. Coherent physiological and goal contrasts were deliberately selected; this is not random population sampling.

All sessions come from the unchanged canonical engine via `scripts/test-five-scenarios.cjs`. No hand-authored workouts, engine fixes, account activation or publishing occurred. The generator checks determinism, native session parity and input/history immutability; all five generated successfully. No claim is made that the old five-profile acceptance criteria independently approve these new prescriptions.

Reproduce:

```sh
node scripts/test-five-scenarios.cjs --fixture tests/fixtures/five-scenario-round-three-inputs.json --output /tmp/lhrf-round-three
node scripts/inspect-coaching-round-three.cjs
```

The initial full captures are retained in the working capture directory `engine-rounds/round-three-initial/` outside the repository. The fixture and inspection script reproduce them; compact inspection evidence is retained in `docs/qa/coaching-round-three-metrics.json`. These are static proposed calendars, not longitudinal athlete simulations.

| Athlete | Supplied goal and starting point | Actual engine output | Priya verdict |
|---|---|---|---|
| K — Casey | 2:50 marathon result, 75 km/week history, five runs, two maintenance lifts; marathon in 14 weeks | Peak actual training 97.23 km/week; longest 32 km; nine weeks with work-pace segments, including 12 km marathon-pace rehearsals | Good aerobic support and specificity before taper; reject unchanged final three weeks pending taper/recovery changes |
| L — Avery | First marathon in eight weeks; 18 km/week, recent 60-minute 10K, 10 km long run; four-hour aspiration | Peak actual training 20.55 km/week; longest 8.2 km; all weeks blocked for short marathon preparation; faster aspiration does not set training pace | Correct safeguard, not a usable marathon programme or a promised four-hour outcome |
| M — Morgan | Bench-only meet in eight weeks; bench 150 kg, squat 185 kg, deadlift 220 kg; explicitly maintain lower body | Three distinct bench exposures; final 142.5 kg single at RPE 9; lower-body work still follows demanding global progression | Bench specificity works; per-lift maintenance intent cannot currently be represented adequately |
| N — Jamie | Half marathon in six weeks, then powerlifting four weeks later; 36 km/week, recent 1:44 half; seven-day declared recovery interval | Running peaks 39.3 km/week, then zero in recovery week; lower lifting unchanged the day after the half; all-lift heavy singles at RPE 8.5 on day eight | Reject automatic recovery-to-peak transition; recovery coordination is incomplete |
| O — Taylor | Powerlifting in 16 weeks, two strength visits, two health runs; 150/100/190 kg tested maxes | Two strength visits and easy health runs; three main lifts packed into the 60-minute Thursday while Saturday has bench alone | Basic dose and peak are recognisable; improve distribution and actual-performance recalibration |

## Findings requiring engine work

### 1. High — endurance recovery facts do not reliably change the prescription

K's known 28 km long run took 145 minutes and recovered within 24 hours. Changing reported recovery to 84 hours produces identical sessions and identical review gates. L's 36-hour recovery changed to 84 hours does the same. Changing those observed long-run durations to 300 minutes also changes neither sessions nor review gates. Root's independent probes corroborate this with different values.

The parser retaining a fact is not evidence that the coach uses it. The running module reads the recent long-run distance, but not its duration or recovery hours. History-based progression and long-run support therefore do not yet respond to two of the important facts the intake requests. This does not establish that every slower recovery needs a fixed numerical reduction; it establishes that a material difference currently has no effect or explicit review consequence.

Root also found that K's dated completed marathon result does not trigger the same first-week recovery response as repeating the same date in the dedicated `recentMarathonDate` field. The current result date is 15 days before the programme starts. Recovery interpretation should be consistent across equivalent source facts rather than depend on duplicate entry.

### 2. High — the running-first taper does not coordinate both sports

K's running taper weeks 12–14 contain **zero prescribed work-pace metres**, compared with 12 km of marathon-pace work in week 11. Training distance falls to 64.13, 51.13 and 20.7 km before the race, but intensity rehearsal disappears for the full three-week taper. The main-lift maintenance work does not taper with it: squat and deadlift each remain two sets of three at RPE 7.5, bench four sets of three across two visits, with the same suggested kilograms as earlier weeks. Deadlift 120 kg for 2×3 at RPE 7.5 remains on Thursday, three days before Sunday's marathon.

A three-week volume taper is not itself an error, and a single weekly quality session is not automatically insufficient. The concern is the combination of total removal of run intensity and no clear change to potentially fatiguing background lifting. The engine should select a small, appropriate retained pace dose and coordinate lower-body strength volume/effort with the primary event, rather than applying separate templates.

### 3. High — recovery after the half marathon is applied to running but not lifting

N's week-seven running is correctly removed and a recovery review is shown. However, Monday 14 December is the day after the half marathon and still prescribes squat 2×3 at 125 kg, RPE 7.5, plus bench 2×3 at 82.5 kg, RPE 7.5. Thursday retains deadlift 2×3 at 147.5 kg, RPE 7.5. These are the same main-lift doses as before the race.

On Monday 21 December, eight days after the half, the dated handover changes to squat 150 kg, bench 97.5 kg and deadlift 177.5 kg singles, all at RPE 8.5, plus back-offs. The recovery-required flag is then false. A recovered athlete might tolerate heavy work eight days later; the problem is treating the calendar interval as sufficient evidence without completed return-to-training information. Generic instructions saying future blocks are conditional do not replace an explicit handover reassessment.

### 4. High — the contract cannot express different strength intentions by lift

M clearly asks to peak bench while maintaining squat and deadlift. The current contract has a global `strengthMode`; choosing progression for the bench consequently keeps squat and deadlift on demanding global phase work. Weeks 1–5 include squat 160 kg×3 at RPE 8 plus 2×3 at 150 kg, and deadlift 190 kg×3 at RPE 8 plus 2×3 at 177.5 kg. Weeks 6–7 raise the top sets to 165 and 195 kg doubles at RPE 8.

This is **not** evidence that the engine ignores a supported per-lift maintenance field: that field does not exist. The lower-body intent is preserved in source facts and cannot faithfully map to the current configuration. Event specificity is partly correct: only bench gets the near-max competition singles, and supporting lifts become light in event week. The fix should extend the shared goal contract, not manually rewrite M's calendar.

### 5. Medium — visit allocation and progression are still too rigid

O's Thursday contains squat, deadlift and bench main work, followed by reduced support, estimated at 60 minutes against a 60-minute window. Saturday's 120-minute window contains only bench volume plus accessories. Tuesday's separate run uses a 120-minute window. The engine fits the selected arrangement by stripping support instead of exploring a better distribution of the main lifts and available windows.

O receives the exact same main-lift top/back-off dose across weeks 1–4, then another repeated dose across weeks 6–9. Repeating block doses is not inherently wrong when RPE governs actual effort. However, root's new-proposal counterfactual supplied repeated improved same-lift performance and still produced the identical programme. Saved baseline/profile values take precedence over those logs. This finding is limited to new-proposal generation; it does not prove the separate review/approval or in-session autoregulation paths never adapt.

Two visits cannot deliver three separate heavy, volume and speed days for every lift. O should not fail merely for lacking a separate speed day. The coaching decision should combine or rotate useful qualities within the actual frequency, explain the priority, and distribute recovery sensibly.

## What should be retained

- K has actual supporting mileage rather than a long run resting on a tiny weekly base. The 32 km runs and repeated current-fitness marathon pace show meaningful capacity under the supplied history; neither metric guarantees marathon readiness.
- L is blocked rather than accelerated to meet an unsupported date or goal pace. The marathon race placeholder is not approval to race.
- M's bench has genuinely different heavy, volume and speed prescriptions, competition specificity near the meet, a final heavy single inside the last week and substantially reduced bench sets approaching competition.
- N represents the actual priority handover rather than leaving running priority unchanged forever. The shortcomings are in the recovery gate and transition dose.
- Accessories vary by block and bench role. Uncalibrated variations show no borrowed kilogram suggestion and contain calibration instructions; that is appropriate, not missing load data to fabricate.
- O's health running stays easy. There is no need to turn it into another performance goal.

## Recommended next iteration

1. Unify recovery evidence across completed races, long-run duration/recovery and post-event lifting; require explicit reassessment at the handover.
2. Coordinate the running-first taper across both sports and preserve an appropriate small dose of event rhythm.
3. Add per-lift progression/maintenance intent to the canonical contract and its intake translation.
4. Recalibrate proposals from eligible completed performances with provenance, while retaining approved-plan boundaries.
5. Explore alternative visit allocations before stripping support from an overloaded day.

Keep these exact profiles and captures unchanged as the failing baseline. Implement shared rules, replay the same five, inspect the actual changed doses, and only then compare earlier profiles for regressions. No new performance outcomes should be promised from this review.
