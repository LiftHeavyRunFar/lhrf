# S — Idris: Powerlifting meet followed by a first dedicated half-marathon block

**Synthetic native output / coaching review copy / not an activated programme.**

NOT APPROVED: hard lifting returns inside the stated recovery interval.

All 16 weeks are expanded below. Raw `S.json` preserves every native field and provenance without rounding; displays below round distances to three decimals. Suggested loads require warm-up calibration; an uncalibrated value is not a zero-kg prescription. No session has been hand-corrected.

Frozen input SHA256: `5a0e83d10a5aab146db43ad2d7170be0cd2ff97888de412a809161099a4e190a`. Captured commit: `988d74120d63b0abb5c070afa1cb6bd91f4d81ae`; engine-source hashes are in the raw capture.

## Athlete facts

```json
{
  "id": "S",
  "name": "Idris",
  "label": "Powerlifting meet followed by a first dedicated half-marathon block",
  "priority": "Squat",
  "training_age": "advanced",
  "goals": [
    {
      "sport": "strength",
      "date": "2026-11-28"
    },
    {
      "sport": "running",
      "distance_km": 21.0975,
      "date": "2027-02-21"
    }
  ],
  "strength": {
    "observations": {
      "Squat": {
        "kg": 195,
        "reps": 1,
        "tested_single": true
      },
      "Bench": {
        "kg": 125,
        "reps": 1,
        "tested_single": true
      },
      "Deadlift": {
        "kg": 230,
        "reps": 1,
        "tested_single": true
      }
    },
    "requested_exposures_per_week": {
      "squat": 2,
      "bench": 3,
      "deadlift": 1
    }
  },
  "running": {
    "recent_result": {
      "distance_km": 10,
      "seconds": 2760,
      "effort": "performance",
      "date": "2026-10-24"
    },
    "weekly_km_history": [
      21,
      23,
      22,
      24,
      23,
      24
    ],
    "long_run": {
      "km": 9,
      "minutes": 60,
      "recovery_hours": 36
    },
    "requested_runs_per_week": 2
  },
  "availability": {
    "strengthVisits": 3,
    "minutes": {
      "Mon": 95,
      "Tue": 75,
      "Wed": 90,
      "Fri": 90,
      "Sat": 130,
      "Sun": 150
    },
    "combinedDays": [
      "Mon",
      "Fri"
    ],
    "separateDays": [],
    "separateMinutes": {},
    "minimumGapHours": 0,
    "eventDays": {
      "2026-11-28": {
        "confirmed": true,
        "minutes": null
      },
      "2027-02-21": {
        "confirmed": true,
        "minutes": 240
      }
    }
  },
  "health_context": "Fictional, pain-free, no illness or medical rehabilitation. Future adaptation and event results are unknown.",
  "training_history": "Eight years lifting with four meets, two years running; recent mileage supports continued easy running through meet preparation.",
  "ordered_goals": [
    {
      "sport": "strength",
      "date": "2026-11-28",
      "priority": "Squat",
      "hybridFocus": "strength",
      "runs": 2,
      "bench": 3,
      "squat": 2,
      "deadlift": 1,
      "strengthVisits": 3,
      "strengthMode": "progression",
      "runGoal": "fitness",
      "recoveryDays": 10
    },
    {
      "sport": "running",
      "date": "2027-02-21",
      "priority": "Running",
      "hybridFocus": "running",
      "runs": 4,
      "bench": 2,
      "squat": 1,
      "deadlift": 1,
      "strengthVisits": 2,
      "strengthMode": "maintenance",
      "runGoal": "half",
      "recoveryDays": 7
    }
  ],
  "recovery_constraints": "Ten-day provisional recovery interval after the meet. Confirm actual recovery before approving the running-focused build; neither event promises a PB."
}
```

## Full horizon

| Week | Priority | Running phase | Training km (race excluded) | Calendar feasible |
|---|---|---|---|---|
| 1 | Squat | Aerobic foundation | 20.658 | True |
| 2 | Squat | Aerobic foundation | 21.458 | True |
| 3 | Squat | Aerobic foundation | 22.258 | True |
| 4 | Squat | Aerobic foundation | 4.2 | True |
| 5 | Squat | Aerobic foundation | 12 | True |
| 6 | Squat | Aerobic foundation | 23.858 | True |
| 7 | Running | Aerobic foundation | 27.65 | True |
| 8 | Running | Specific preparation | 22.65 | True |
| 9 | Running | Specific preparation | 28.9 | True |
| 10 | Running | Specific preparation | 30.2 | True |
| 11 | Running | Specific preparation | 31.55 | True |
| 12 | Running | Specific preparation | 25.85 | True |
| 13 | Running | Specific preparation | 32.95 | True |
| 14 | Running | Specific preparation | 34.45 | True |
| 15 | Running | Taper / event | 18.15 | True |
| 16 | Running | Taper / event | 7.85 | True |

## Week 1 — Specificity

Priority: Squat. Running phase: Aerobic foundation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Maintain an easy aerobic base for the later half while strength has priority. Race-specific running starts after the dated handover and recovery review.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Visit windows reduce actual running from 24.00 to 20.66 km. Review endurance adequacy before approving this block; removed kilometres are not automatically made up.

### 2026-11-02 / Mon — Squat + Bench

Practise event-specific effort while managing fatigue. Squat gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 60,
  "runMinutes": 0,
  "strengthMinutes": 60,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 18,
    "support": 28,
    "setup": 2,
    "total": 60
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 60,
      "capMinutes": 95
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 1 × 1 | 180 | 8 | top / heavy |
| Squat | 2 × 3 | 157.5 | 7 | backoff / heavy |
| Bulgarian split squat | 1 × 10 | uncalibrated | 7 |  /  |
| Seated leg curl | 1 × 12 | uncalibrated | 7 |  /  |
| Bench | 1 × 1 | 115 | 8 | top / heavy |
| Bench | 2 × 3 | 100 | 7 | backoff / heavy |
| Lat pulldown | 3 × 8 | uncalibrated | 7 | accessory /  |
| Triceps pushdown | 2 × 10 | uncalibrated | 7 | accessory /  |
| Reverse pec deck | 2 × 12 | uncalibrated | 7 | accessory /  |
| Cable biceps curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Dumbbell lateral raise (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Heavy competition single; practise setup, pause and commands. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Bulgarian split squat (10–12 reps): Block 1: Single-leg quad development. Choose initial load by RPE; aim to add reps before weight.
- Seated leg curl (12–14 reps): Block 1: Hamstring hypertrophy. Choose initial load by RPE; aim to add reps before weight.
- Heavy competition single; practise setup, pause and commands. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Lat pulldown (8–10 reps): Vertical pulling and upper-back support. Keep this movement through the block; work within 8–10 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Triceps pushdown (10–12 reps): Triceps support without another heavy press. Keep this movement through the block; work within 10–12 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Reverse pec deck (12–15 reps): Rear-delt development. Keep this movement through the block; work within 12–15 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.

### 2026-11-03 / Tue — Easy aerobic run

Practise event-specific effort while managing fatigue. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 75,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Shortened supporting easy running by 3.34 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

#### Easy aerobic run

Role: easy-run; distance: 11.658 km; duration: 75 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 11.658,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 64, "max": 75}`.

11658 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 3.342 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

hybridNotes:

- Maintain an easy aerobic base for the later half while strength has priority. Race-specific running starts after the dated handover and recovery review.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2026-11-04 / Wed — Squat + Bench

Practise event-specific effort while managing fatigue. Squat gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 62,
  "runMinutes": 0,
  "strengthMinutes": 61.75,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 18,
    "support": 29.75,
    "setup": 2,
    "total": 61.75
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 61.75,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 1 × 5 | 155 | 7.5 | top / volume |
| Squat | 2 × 5 | 145 | 7 | backoff / volume |
| Leg press | 2 × 10 | uncalibrated | 7 |  /  |
| Romanian deadlift | 1 × 8 | uncalibrated | 7 |  /  |
| Bench | 1 × 5 | 100 | 7.5 | top / volume |
| Bench | 2 × 5 | 92.5 | 7 | backoff / volume |
| Incline dumbbell press | 2 × 8 | uncalibrated | 7 | accessory /  |
| Chest-supported row | 3 × 10 | uncalibrated | 7 | accessory /  |
| Dumbbell lateral raise | 2 × 12 | uncalibrated | 7 | accessory /  |
| Cable biceps curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Rope triceps pushdown (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Volume exposure: build repeatable work without turning it into a max day. RPE 7.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Leg press (10–12 reps): Block 2: Additional quad volume. Choose initial load by RPE; aim to add reps before weight.
- Romanian deadlift (8–10 reps): Block 2: Posterior-chain strength. Choose initial load by RPE; aim to add reps before weight.
- Volume exposure: build repeatable work without turning it into a max day. RPE 7.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Incline dumbbell press (8–10 reps): Incline pressing support. Keep this movement through the block; work within 8–10 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Chest-supported row (10–12 reps): Supported horizontal pulling. Keep this movement through the block; work within 10–12 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Dumbbell lateral raise (12–15 reps): Lateral shoulder development. Keep this movement through the block; work within 12–15 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.

### 2026-11-07 / Sat — Deadlift + Bench

Practise event-specific effort while managing fatigue. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 61,
  "runMinutes": 0,
  "strengthMinutes": 60.25,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 16.5,
    "support": 29.75,
    "setup": 2,
    "total": 60.25
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 60.25,
      "capMinutes": 130
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 1 × 1 | 215 | 8.5 | top / heavy |
| Deadlift | 2 × 3 | 187.5 | 7 | backoff / heavy |
| Back extension | 1 × 12 | uncalibrated | 7 |  /  |
| Lat pulldown | 2 × 10 | uncalibrated | 7 |  /  |
| Bench | 5 × 2 | 62.5 | 5.5 | straight / speed |
| Seated dumbbell shoulder press | 2 × 8 | uncalibrated | 7 | accessory /  |
| Seated cable row | 3 × 10 | uncalibrated | 7 | accessory /  |
| Face pull | 2 × 12 | uncalibrated | 7 | accessory /  |
| Cable biceps curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Rope triceps pushdown (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Heavy competition single; practise setup, pause and commands. RPE 8.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Back extension (12–14 reps): Block 1: Posterior-chain capacity. Choose initial load by RPE; aim to add reps before weight.
- Lat pulldown (10–12 reps): Block 1: Upper-back support. Choose initial load by RPE; aim to add reps before weight.
- Speed / technique: competition setup and commands, then accelerate every double. Use 60–90 seconds between sets; extend rest if needed for quality. Load is a starting suggestion, not a speed test. Stop the set or reduce load when speed or position deteriorates; no grinders.
- Seated dumbbell shoulder press (8–10 reps): Controlled shoulder pressing. Keep this movement through the block; work within 8–10 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Seated cable row (10–12 reps): Horizontal pulling with a different setup. Keep this movement through the block; work within 10–12 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Face pull (12–15 reps): Rear-shoulder and scapular control. Keep this movement through the block; work within 12–15 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.

### 2026-11-08 / Sun — Long aerobic run

Practise event-specific effort while managing fatigue. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 58,
  "runMinutes": 58,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 58,
      "capMinutes": 150
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 9 km; duration: 58 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 9,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 49, "max": 58}`.

9000 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Maintain an easy aerobic base for the later half while strength has priority. Race-specific running starts after the dated handover and recovery review.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### Native coaching instructions

```json
{
  "missedSession": "Skip or move one session only if the next key session and recovery still fit. Do not stack missed quality, heavy work or long runs. After two missed sessions, illness or a week away, review the next block.",
  "liftingEffort": "Warm up to the prescribed effort. RPE governs the suggested kg. If effort overshoots by a point, reduce 2.5–5% and reassess; if still excessive, omit remaining back-offs. Heavy singles are skill practice, not forced maximal attempts.",
  "speedWork": "Accelerate with stable technique. Reduce load or stop when speed or position deteriorates. An easy speed day is not permission to turn it into a heavy day.",
  "athleteJudgement": "Report sustained fatigue, sleep disruption, pain, illness or altered movement. End the provoking work when needed. One difficult session is a reason to adjust that session, not an automatic full deload.",
  "review": "Review completed work every four weeks and after events. Later blocks are conditional on observed recovery and performance; no race result or lifting total is guaranteed."
}
```


## Week 2 — Specificity

Priority: Squat. Running phase: Aerobic foundation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Maintain an easy aerobic base for the later half while strength has priority. Race-specific running starts after the dated handover and recovery review.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Visit windows reduce actual running from 24.45 to 21.46 km. Review endurance adequacy before approving this block; removed kilometres are not automatically made up.

### 2026-11-09 / Mon — Squat + Bench

Practise event-specific effort while managing fatigue. Squat gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 60,
  "runMinutes": 0,
  "strengthMinutes": 60,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 18,
    "support": 28,
    "setup": 2,
    "total": 60
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 60,
      "capMinutes": 95
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 1 × 1 | 182.5 | 8.5 | top / heavy |
| Squat | 2 × 3 | 160 | 7 | backoff / heavy |
| Bulgarian split squat | 1 × 10 | uncalibrated | 7 |  /  |
| Seated leg curl | 1 × 12 | uncalibrated | 7 |  /  |
| Bench | 1 × 1 | 117.5 | 8.5 | top / heavy |
| Bench | 2 × 3 | 100 | 7 | backoff / heavy |
| Lat pulldown | 3 × 8 | uncalibrated | 7 | accessory /  |
| Triceps pushdown | 2 × 10 | uncalibrated | 7 | accessory /  |
| Reverse pec deck | 2 × 12 | uncalibrated | 7 | accessory /  |
| Cable biceps curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Dumbbell lateral raise (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Heavy competition single; practise setup, pause and commands. RPE 8.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Bulgarian split squat (10–12 reps): Block 1: Single-leg quad development. Choose initial load by RPE; aim to add reps before weight.
- Seated leg curl (12–14 reps): Block 1: Hamstring hypertrophy. Choose initial load by RPE; aim to add reps before weight.
- Heavy competition single; practise setup, pause and commands. RPE 8.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Lat pulldown (8–10 reps): Vertical pulling and upper-back support. Keep this movement through the block; work within 8–10 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Triceps pushdown (10–12 reps): Triceps support without another heavy press. Keep this movement through the block; work within 10–12 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Reverse pec deck (12–15 reps): Rear-delt development. Keep this movement through the block; work within 12–15 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.

### 2026-11-10 / Tue — Easy aerobic run

Practise event-specific effort while managing fatigue. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 75,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Shortened supporting easy running by 2.99 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

#### Easy aerobic run

Role: easy-run; distance: 11.658 km; duration: 75 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 11.658,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 64, "max": 75}`.

11658 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 2.992 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

hybridNotes:

- Maintain an easy aerobic base for the later half while strength has priority. Race-specific running starts after the dated handover and recovery review.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2026-11-11 / Wed — Squat + Bench

Practise event-specific effort while managing fatigue. Squat gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 62,
  "runMinutes": 0,
  "strengthMinutes": 61.75,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 18,
    "support": 29.75,
    "setup": 2,
    "total": 61.75
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 61.75,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 1 × 5 | 155 | 7.5 | top / volume |
| Squat | 2 × 5 | 145 | 7 | backoff / volume |
| Leg press | 2 × 10 | uncalibrated | 7 |  /  |
| Romanian deadlift | 1 × 8 | uncalibrated | 7 |  /  |
| Bench | 1 × 5 | 100 | 7.5 | top / volume |
| Bench | 2 × 5 | 92.5 | 7 | backoff / volume |
| Incline dumbbell press | 2 × 8 | uncalibrated | 7 | accessory /  |
| Chest-supported row | 3 × 10 | uncalibrated | 7 | accessory /  |
| Dumbbell lateral raise | 2 × 12 | uncalibrated | 7 | accessory /  |
| Cable biceps curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Rope triceps pushdown (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Volume exposure: build repeatable work without turning it into a max day. RPE 7.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Leg press (10–12 reps): Block 2: Additional quad volume. Choose initial load by RPE; aim to add reps before weight.
- Romanian deadlift (8–10 reps): Block 2: Posterior-chain strength. Choose initial load by RPE; aim to add reps before weight.
- Volume exposure: build repeatable work without turning it into a max day. RPE 7.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Incline dumbbell press (8–10 reps): Incline pressing support. Keep this movement through the block; work within 8–10 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Chest-supported row (10–12 reps): Supported horizontal pulling. Keep this movement through the block; work within 10–12 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Dumbbell lateral raise (12–15 reps): Lateral shoulder development. Keep this movement through the block; work within 12–15 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.

### 2026-11-14 / Sat — Deadlift + Bench

Practise event-specific effort while managing fatigue. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 25,
  "runMinutes": 0,
  "strengthMinutes": 25,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 11,
    "support": 0,
    "setup": 2,
    "total": 25
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 25,
      "capMinutes": 130
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 1 × 1 | 215 | 8.5 | top / heavy |
| Deadlift | 1 × 3 | 187.5 | 7 | backoff / heavy |
| Bench | 3 × 2 | 70 | 5.5 | straight / speed |

variationNotes:

- Heavy competition single; practise setup, pause and commands. RPE 8.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Speed / technique: competition setup and commands, then accelerate every double. Use 60–90 seconds between sets; extend rest if needed for quality. Load is a starting suggestion, not a speed test. Stop the set or reduce load when speed or position deteriorates; no grinders.

### 2026-11-15 / Sun — Long aerobic run

Practise event-specific effort while managing fatigue. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 64,
  "runMinutes": 64,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 64,
      "capMinutes": 150
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 9.8 km; duration: 64 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 9.8,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 54, "max": 64}`.

9800 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Maintain an easy aerobic base for the later half while strength has priority. Race-specific running starts after the dated handover and recovery review.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### Native coaching instructions

```json
{
  "missedSession": "Skip or move one session only if the next key session and recovery still fit. Do not stack missed quality, heavy work or long runs. After two missed sessions, illness or a week away, review the next block.",
  "liftingEffort": "Warm up to the prescribed effort. RPE governs the suggested kg. If effort overshoots by a point, reduce 2.5–5% and reassess; if still excessive, omit remaining back-offs. Heavy singles are skill practice, not forced maximal attempts.",
  "speedWork": "Accelerate with stable technique. Reduce load or stop when speed or position deteriorates. An easy speed day is not permission to turn it into a heavy day.",
  "athleteJudgement": "Report sustained fatigue, sleep disruption, pain, illness or altered movement. End the provoking work when needed. One difficult session is a reason to adjust that session, not an automatic full deload.",
  "review": "Review completed work every four weeks and after events. Later blocks are conditional on observed recovery and performance; no race result or lifting total is guaranteed."
}
```


## Week 3 — Specificity

Priority: Squat. Running phase: Aerobic foundation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Maintain an easy aerobic base for the later half while strength has priority. Race-specific running starts after the dated handover and recovery review.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Visit windows reduce actual running from 24.85 to 22.26 km. Review endurance adequacy before approving this block; removed kilometres are not automatically made up.

### 2026-11-16 / Mon — Squat + Bench

Practise event-specific effort while managing fatigue. Squat gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 26,
  "runMinutes": 0,
  "strengthMinutes": 25.5,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 11.5,
    "support": 0,
    "setup": 2,
    "total": 25.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 25.5,
      "capMinutes": 95
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 2 × 2 | 117.5 | 5.5 | straight / technique |
| Bench | 1 × 1 | 117.5 | 8.5 | top / heavy |
| Bench | 1 × 3 | 100 | 7 | backoff / heavy |

variationNotes:

- Easy technique between key exposures; protect the final heavy practice and event.
- Heavy competition single; practise setup, pause and commands. RPE 8.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.

### 2026-11-17 / Tue — Easy aerobic run

Practise event-specific effort while managing fatigue. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 75,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Shortened supporting easy running by 2.59 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

#### Easy aerobic run

Role: easy-run; distance: 11.658 km; duration: 75 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 11.658,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 64, "max": 75}`.

11658 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 2.592 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

hybridNotes:

- Maintain an easy aerobic base for the later half while strength has priority. Race-specific running starts after the dated handover and recovery review.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2026-11-18 / Wed — Squat + Bench

Practise event-specific effort while managing fatigue. Squat gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 26,
  "runMinutes": 0,
  "strengthMinutes": 25.5,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 11.5,
    "support": 0,
    "setup": 2,
    "total": 25.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 25.5,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 1 × 1 | 185 | 9 | top / heavy |
| Squat | 1 × 2 | 160 | 6 | backoff / heavy |
| Bench | 2 × 2 | 75 | 5.5 | straight / technique |

variationNotes:

- Final heavy command practice selected from your real schedule. RPE 9 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Easy technique between key exposures; protect the final heavy practice and event.

### 2026-11-21 / Sat — Deadlift + Bench

Practise event-specific effort while managing fatigue. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 27,
  "runMinutes": 0,
  "strengthMinutes": 27,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 13,
    "support": 0,
    "setup": 2,
    "total": 27
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 27,
      "capMinutes": 130
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 1 × 1 | 220 | 9 | top / heavy |
| Deadlift | 1 × 2 | 190 | 6 | backoff / heavy |
| Bench | 1 × 1 | 120 | 9 | top / heavy |
| Bench | 1 × 2 | 102.5 | 6 | backoff / heavy |

variationNotes:

- Final heavy command practice selected from your real schedule. RPE 9 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Final heavy command practice selected from your real schedule. RPE 9 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.

### 2026-11-22 / Sun — Long aerobic run

Practise event-specific effort while managing fatigue. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 69,
  "runMinutes": 69,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 69,
      "capMinutes": 150
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 10.6 km; duration: 69 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 10.6,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 58, "max": 69}`.

10600 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Maintain an easy aerobic base for the later half while strength has priority. Race-specific running starts after the dated handover and recovery review.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### Native coaching instructions

```json
{
  "missedSession": "Skip or move one session only if the next key session and recovery still fit. Do not stack missed quality, heavy work or long runs. After two missed sessions, illness or a week away, review the next block.",
  "liftingEffort": "Warm up to the prescribed effort. RPE governs the suggested kg. If effort overshoots by a point, reduce 2.5–5% and reassess; if still excessive, omit remaining back-offs. Heavy singles are skill practice, not forced maximal attempts.",
  "speedWork": "Accelerate with stable technique. Reduce load or stop when speed or position deteriorates. An easy speed day is not permission to turn it into a heavy day.",
  "athleteJudgement": "Report sustained fatigue, sleep disruption, pain, illness or altered movement. End the provoking work when needed. One difficult session is a reason to adjust that session, not an automatic full deload.",
  "review": "Review completed work every four weeks and after events. Later blocks are conditional on observed recovery and performance; no race result or lifting total is guaranteed."
}
```


## Week 4 — Taper / event

Priority: Squat. Running phase: Aerobic foundation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Strength competition week: short easy running only; the day after the meet requires a separate recovery decision.
- Maintain an easy aerobic base for the later half while strength has priority. Race-specific running starts after the dated handover and recovery review.

### 2026-11-23 / Mon — Squat + Bench

Reduce workload to arrive fresher for the event. Squat gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 24,
  "runMinutes": 0,
  "strengthMinutes": 24,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 10,
    "support": 0,
    "setup": 2,
    "total": 24
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 24,
      "capMinutes": 95
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 2 × 2 | 117.5 | 5.5 | straight / technique |
| Bench | 2 × 2 | 75 | 5.5 | straight / technique |

variationNotes:

- Easy technique between key exposures; protect the final heavy practice and event.
- Easy technique between key exposures; protect the final heavy practice and event.

### 2026-11-24 / Tue — Easy aerobic run

Reduce workload to arrive fresher for the event. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 28,
  "runMinutes": 28,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 28,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 4.2 km; duration: 28 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 4.2,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 23, "max": 28}`.

4200 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Strength competition week: short easy running only; the day after the meet requires a separate recovery decision.
- Maintain an easy aerobic base for the later half while strength has priority. Race-specific running starts after the dated handover and recovery review.
- Running recovery week: reduced running volume.

### 2026-11-25 / Wed — Squat + Bench

Reduce workload to arrive fresher for the event. Squat gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 24,
  "runMinutes": 0,
  "strengthMinutes": 24,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 10,
    "support": 0,
    "setup": 2,
    "total": 24
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 24,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 2 × 2 | 117.5 | 5.5 | straight / technique |
| Bench | 2 × 2 | 75 | 5.5 | straight / technique |

variationNotes:

- Easy technique between key exposures; protect the final heavy practice and event.
- Easy technique between key exposures; protect the final heavy practice and event.

### 2026-11-28 / Saturday — Strength competition

Competition replaces scheduled training.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": null,
  "event": true,
  "confirmed": true,
  "includesWarmups": false,
  "includesRest": false,
  "includesTransitions": false
}
```

Event permission: `{"confirmed": true, "explicit": true, "estimatedMinutes": null, "logisticsMinutes": null}`

### Native coaching instructions

```json
{
  "missedSession": "Skip or move one session only if the next key session and recovery still fit. Do not stack missed quality, heavy work or long runs. After two missed sessions, illness or a week away, review the next block.",
  "liftingEffort": "Warm up to the prescribed effort. RPE governs the suggested kg. If effort overshoots by a point, reduce 2.5–5% and reassess; if still excessive, omit remaining back-offs. Heavy singles are skill practice, not forced maximal attempts.",
  "speedWork": "Accelerate with stable technique. Reduce load or stop when speed or position deteriorates. An easy speed day is not permission to turn it into a heavy day.",
  "athleteJudgement": "Report sustained fatigue, sleep disruption, pain, illness or altered movement. End the provoking work when needed. One difficult session is a reason to adjust that session, not an automatic full deload.",
  "review": "Review completed work every four weeks and after events. Later blocks are conditional on observed recovery and performance; no race result or lifting total is guaranteed."
}
```


## Week 5 — Development

Priority: Squat. Running phase: Aerobic foundation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- After the strength meet: provisional reduced easy running, with no long run until recovery is confirmed before the endurance-priority handover.
- Maintain an easy aerobic base for the later half while strength has priority. Race-specific running starts after the dated handover and recovery review.

### 2026-12-01 / Tue — Easy aerobic run

Reduce load after the event; review recovery before starting the next phase. Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 39,
  "runMinutes": 39,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 39,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 6 km; duration: 39 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 33, "max": 39}`.

6000 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- After the strength meet: provisional reduced easy running, with no long run until recovery is confirmed before the endurance-priority handover.
- Maintain an easy aerobic base for the later half while strength has priority. Race-specific running starts after the dated handover and recovery review.

### 2026-12-02 / Wed — Squat + Bench

Reduce load after the event; review recovery before starting the next phase. Progress productive workload with manageable effort. Squat gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 24,
  "runMinutes": 0,
  "strengthMinutes": 24,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 10,
    "support": 0,
    "setup": 2,
    "total": 24
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 24,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Safety-bar squat | 2 × 2 | uncalibrated | 5.5 | straight / technique |
| Close-grip bench | 2 × 2 | uncalibrated | 5.5 | straight / technique |

variationNotes:

- Post-event recovery: easy technique only; restore loading after reviewing actual recovery.
- Safety-bar squat: Build quad and upper-back strength while practising upright bracing. First exposure: discover working load through warm-ups at target RPE.
- Post-event recovery: easy technique only; restore loading after reviewing actual recovery.
- Close-grip bench: Build triceps contribution and pressing strength. First exposure: discover working load through warm-ups at target RPE.

### 2026-12-05 / Sat — Deadlift + Bench

Reduce load after the event; review recovery before starting the next phase. Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 24,
  "runMinutes": 0,
  "strengthMinutes": 24,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 10,
    "support": 0,
    "setup": 2,
    "total": 24
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 24,
      "capMinutes": 130
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 2 | 137.5 | 5.5 | straight / technique |
| Bench | 2 × 2 | 75 | 5.5 | straight / technique |

variationNotes:

- Post-event recovery: easy technique only; restore loading after reviewing actual recovery.
- Post-event recovery: easy technique only; restore loading after reviewing actual recovery.

### 2026-12-06 / Sun — Easy aerobic run

Reduce load after the event; review recovery before starting the next phase. Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 39,
  "runMinutes": 39,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 39,
      "capMinutes": 150
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 6 km; duration: 39 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 33, "max": 39}`.

6000 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- After the strength meet: provisional reduced easy running, with no long run until recovery is confirmed before the endurance-priority handover.
- Maintain an easy aerobic base for the later half while strength has priority. Race-specific running starts after the dated handover and recovery review.

### Native coaching instructions

```json
{
  "missedSession": "Skip or move one session only if the next key session and recovery still fit. Do not stack missed quality, heavy work or long runs. After two missed sessions, illness or a week away, review the next block.",
  "liftingEffort": "Warm up to the prescribed effort. RPE governs the suggested kg. If effort overshoots by a point, reduce 2.5–5% and reassess; if still excessive, omit remaining back-offs. Heavy singles are skill practice, not forced maximal attempts.",
  "speedWork": "Accelerate with stable technique. Reduce load or stop when speed or position deteriorates. An easy speed day is not permission to turn it into a heavy day.",
  "athleteJudgement": "Report sustained fatigue, sleep disruption, pain, illness or altered movement. End the provoking work when needed. One difficult session is a reason to adjust that session, not an automatic full deload.",
  "review": "Review completed work every four weeks and after events. Later blocks are conditional on observed recovery and performance; no race result or lifting total is guaranteed."
}
```


## Week 6 — Development

Priority: Squat. Running phase: Aerobic foundation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Maintain an easy aerobic base for the later half while strength has priority. Race-specific running starts after the dated handover and recovery review.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-12-07 / Mon — Squat + Bench

Progress productive workload with manageable effort. Squat gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 49,
  "runMinutes": 0,
  "strengthMinutes": 49,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 18,
    "support": 17,
    "setup": 2,
    "total": 49
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 49,
      "capMinutes": 95
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 1 × 3 | 167.5 | 8 | top / heavy |
| Squat | 2 × 3 | 155 | 7 | backoff / heavy |
| Leg press | 2 × 10 | uncalibrated | 7 |  /  |
| Romanian deadlift | 2 × 8 | uncalibrated | 7 |  /  |
| Bench | 1 × 3 | 107.5 | 8 | top / heavy |
| Bench | 2 × 3 | 100 | 7 | backoff / heavy |
| Hammer curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Overhead cable triceps extension (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Strength exposure: demanding main work followed by a smaller volume dose. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Leg press (10–12 reps): Block 2: Additional quad volume. Choose initial load by RPE; aim to add reps before weight.
- Romanian deadlift (8–10 reps): Block 2: Posterior-chain strength. Choose initial load by RPE; aim to add reps before weight.
- Strength exposure: demanding main work followed by a smaller volume dose. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.

### 2026-12-08 / Tue — Easy aerobic run

Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 75,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Shortened supporting easy running by 1.94 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

#### Easy aerobic run

Role: easy-run; distance: 11.658 km; duration: 75 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 11.658,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 64, "max": 75}`.

11658 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 1.942 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

hybridNotes:

- Maintain an easy aerobic base for the later half while strength has priority. Race-specific running starts after the dated handover and recovery review.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2026-12-09 / Wed — Squat + Bench

Progress productive workload with manageable effort. Squat gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 51,
  "runMinutes": 0,
  "strengthMinutes": 51,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 20,
    "support": 17,
    "setup": 2,
    "total": 51
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 51,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Front squat | 1 × 5 | uncalibrated | 8 | top / volume |
| Front squat | 2 × 5 | uncalibrated | 7 | backoff / volume |
| Reverse lunge | 2 × 8 | uncalibrated | 7 |  /  |
| Lying leg curl | 2 × 10 | uncalibrated | 7 |  /  |
| Spoto press | 1 × 5 | uncalibrated | 8 | top / volume |
| Spoto press | 2 × 5 | uncalibrated | 7 | backoff / volume |
| Hammer curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Overhead cable triceps extension (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Volume exposure: build repeatable work without turning it into a max day. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts. Calibrate this variation from its own history or warm-ups; never borrow the competition-lift load.
- Front squat: Challenge quad strength and upright positioning. First exposure: discover working load through warm-ups at target RPE.
- Reverse lunge (8–10 reps): Block 3: Single-leg stability. Choose initial load by RPE; aim to add reps before weight.
- Lying leg curl (10–12 reps): Block 3: Hamstring maintenance. Choose initial load by RPE; aim to add reps before weight.
- Volume exposure: build repeatable work without turning it into a max day. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts. Calibrate this variation from its own history or warm-ups; never borrow the competition-lift load.
- Spoto press: Practise tightness and control near the chest. First exposure: discover working load through warm-ups at target RPE.

### 2026-12-12 / Sat — Deadlift + Bench

Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 48,
  "runMinutes": 0,
  "strengthMinutes": 47.5,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 16.5,
    "support": 17,
    "setup": 2,
    "total": 47.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 47.5,
      "capMinutes": 130
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 1 × 3 | 197.5 | 8 | top / strength |
| Deadlift | 2 × 3 | 185 | 7 | backoff / strength |
| Hip thrust | 2 × 10 | uncalibrated | 7 |  /  |
| Seated cable row | 2 × 10 | uncalibrated | 7 |  /  |
| Bench | 5 × 2 | 75 | 5.5 | straight / speed |
| Hammer curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Overhead cable triceps extension (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Strength exposure: demanding main work followed by a smaller volume dose. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Hip thrust (10–12 reps): Block 2: Hip extension strength. Choose initial load by RPE; aim to add reps before weight.
- Seated cable row (10–12 reps): Block 2: Upper-back strength. Choose initial load by RPE; aim to add reps before weight.
- Speed / technique: repeatable positions, then accelerate every double. Use 60–90 seconds between sets; extend rest if needed for quality. Load is a starting suggestion, not a speed test. Stop the set or reduce load when speed or position deteriorates; no grinders.

### 2026-12-13 / Sun — Long aerobic run

Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 79,
  "runMinutes": 79,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 79,
      "capMinutes": 150
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 12.2 km; duration: 79 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 12.2,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 67, "max": 79}`.

12200 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Maintain an easy aerobic base for the later half while strength has priority. Race-specific running starts after the dated handover and recovery review.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### Native coaching instructions

```json
{
  "missedSession": "Skip or move one session only if the next key session and recovery still fit. Do not stack missed quality, heavy work or long runs. After two missed sessions, illness or a week away, review the next block.",
  "liftingEffort": "Warm up to the prescribed effort. RPE governs the suggested kg. If effort overshoots by a point, reduce 2.5–5% and reassess; if still excessive, omit remaining back-offs. Heavy singles are skill practice, not forced maximal attempts.",
  "speedWork": "Accelerate with stable technique. Reduce load or stop when speed or position deteriorates. An easy speed day is not permission to turn it into a heavy day.",
  "athleteJudgement": "Report sustained fatigue, sleep disruption, pain, illness or altered movement. End the provoking work when needed. One difficult session is a reason to adjust that session, not an automatic full deload.",
  "review": "Review completed work every four weeks and after events. Later blocks are conditional on observed recovery and performance; no race result or lifting total is guaranteed."
}
```


## Week 7 — Development

Priority: Running. Running phase: Aerobic foundation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Post-race / post-event handover review: confirm actual recovery and completed training before accepting the next heavy or specific block. Elapsed recovery days alone do not establish readiness.

### 2026-12-14 / Mon — Squat + Bench

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 24,
  "runMinutes": 0,
  "strengthMinutes": 24,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 10,
    "support": 0,
    "setup": 2,
    "total": 24
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 24,
      "capMinutes": 95
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 2 × 3 | 152.5 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 97.5 | 7.5 | straight / maintenance |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2026-12-15 / Tue — Controlled threshold repeats

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 32,
  "runMinutes": 32,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 32,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Controlled threshold repeats

Role: quality-run; distance: 5.7 km; duration: 32 min; RPE: 7; pace: 4:35/km to 4:45/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Warm-up",
    "role": "easy",
    "distanceKm": 1.45,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Threshold interval 1 of 4",
    "role": "work",
    "distanceKm": 0.65,
    "pace": "4:35/km to 4:45/km",
    "paceSeconds": 280.18235738367343,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.20000000000000004,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Threshold interval 2 of 4",
    "role": "work",
    "distanceKm": 0.65,
    "pace": "4:35/km to 4:45/km",
    "paceSeconds": 280.18235738367343,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.20000000000000004,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Threshold interval 3 of 4",
    "role": "work",
    "distanceKm": 0.65,
    "pace": "4:35/km to 4:45/km",
    "paceSeconds": 280.18235738367343,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.2,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Threshold interval 4 of 4",
    "role": "work",
    "distanceKm": 0.6499999999999999,
    "pace": "4:35/km to 4:45/km",
    "paceSeconds": 280.18235738367343,
    "intensity": "threshold"
  },
  {
    "label": "Cool-down",
    "role": "easy",
    "distanceKm": 1.05,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 29, "max": 32}`.

1450 m warm-up + 650 m threshold interval 1 of 4 + 200 m easy recovery + 650 m threshold interval 2 of 4 + 200 m easy recovery + 650 m threshold interval 3 of 4 + 200 m easy recovery + 650 m threshold interval 4 of 4 + 1050 m cool-down

Accumulate controlled sustained work at estimated current threshold. Work and recovery distances stay within the approved session budget. Short repetitions are controlled, not sprints.

Accumulate controlled sustained work at estimated current threshold.

### 2026-12-16 / Wed — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 37,
  "runMinutes": 37,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 37,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 5.7 km; duration: 37 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 5.7,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 31, "max": 37}`.

5700 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

### 2026-12-18 / Fri — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 65,
  "runMinutes": 38,
  "strengthMinutes": 24,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 10,
    "support": 0,
    "setup": 2,
    "total": 24
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 65,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 180 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 97.5 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 5.75 km; duration: 38 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 5.75,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 32, "max": 38}`.

5750 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2026-12-20 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 68,
  "runMinutes": 68,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 68,
      "capMinutes": 150
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 10.5 km; duration: 68 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 10.5,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 57, "max": 68}`.

10500 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

### Native coaching instructions

```json
{
  "handoverRecovery": {
    "eventDate": "2026-11-28",
    "sport": "strength",
    "conditional": true,
    "note": "The dated handover is provisional. Confirm actual event recovery and completed training before accepting the next heavy or specific block; elapsed days alone do not clear fatigue."
  },
  "missedSession": "Skip or move one session only if the next key session and recovery still fit. Do not stack missed quality, heavy work or long runs. After two missed sessions, illness or a week away, review the next block.",
  "liftingEffort": "Warm up to the prescribed effort. RPE governs the suggested kg. If effort overshoots by a point, reduce 2.5–5% and reassess; if still excessive, omit remaining back-offs. Heavy singles are skill practice, not forced maximal attempts.",
  "speedWork": "Accelerate with stable technique. Reduce load or stop when speed or position deteriorates. An easy speed day is not permission to turn it into a heavy day.",
  "athleteJudgement": "Report sustained fatigue, sleep disruption, pain, illness or altered movement. End the provoking work when needed. One difficult session is a reason to adjust that session, not an automatic full deload.",
  "review": "Review completed work every four weeks and after events. Later blocks are conditional on observed recovery and performance; no race result or lifting total is guaranteed."
}
```


## Week 8 — Development

Priority: Running. Running phase: Specific preparation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Post-race / post-event handover review: confirm actual recovery and completed training before accepting the next heavy or specific block. Elapsed recovery days alone do not establish readiness.

### 2026-12-21 / Mon — Squat + Bench

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 24,
  "runMinutes": 0,
  "strengthMinutes": 24,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 10,
    "support": 0,
    "setup": 2,
    "total": 24
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 24,
      "capMinutes": 95
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 2 × 3 | 152.5 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 97.5 | 7.5 | straight / maintenance |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2026-12-22 / Tue — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 31,
  "runMinutes": 31,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 31,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 4.7 km; duration: 31 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 4.7,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 26, "max": 31}`.

4700 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Running recovery week: reduced running volume.

### 2026-12-23 / Wed — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 31,
  "runMinutes": 31,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 31,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 4.7 km; duration: 31 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 4.7,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 26, "max": 31}`.

4700 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Running recovery week: reduced running volume.

### 2026-12-25 / Fri — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 57,
  "runMinutes": 30,
  "strengthMinutes": 24,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 10,
    "support": 0,
    "setup": 2,
    "total": 24
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 57,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 180 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 97.5 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 4.65 km; duration: 30 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 4.65,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 26, "max": 30}`.

4650 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Running recovery week: reduced running volume.

### 2026-12-27 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 56,
  "runMinutes": 56,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 56,
      "capMinutes": 150
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 8.6 km; duration: 56 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 8.6,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 47, "max": 56}`.

8600 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Running recovery week: reduced running volume.

### Native coaching instructions

```json
{
  "handoverRecovery": {
    "eventDate": "2026-11-28",
    "sport": "strength",
    "conditional": true,
    "note": "The dated handover is provisional. Confirm actual event recovery and completed training before accepting the next heavy or specific block; elapsed days alone do not clear fatigue."
  },
  "missedSession": "Skip or move one session only if the next key session and recovery still fit. Do not stack missed quality, heavy work or long runs. After two missed sessions, illness or a week away, review the next block.",
  "liftingEffort": "Warm up to the prescribed effort. RPE governs the suggested kg. If effort overshoots by a point, reduce 2.5–5% and reassess; if still excessive, omit remaining back-offs. Heavy singles are skill practice, not forced maximal attempts.",
  "speedWork": "Accelerate with stable technique. Reduce load or stop when speed or position deteriorates. An easy speed day is not permission to turn it into a heavy day.",
  "athleteJudgement": "Report sustained fatigue, sleep disruption, pain, illness or altered movement. End the provoking work when needed. One difficult session is a reason to adjust that session, not an automatic full deload.",
  "review": "Review completed work every four weeks and after events. Later blocks are conditional on observed recovery and performance; no race result or lifting total is guaranteed."
}
```


## Week 9 — Development

Priority: Running. Running phase: Specific preparation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Post-race / post-event handover review: confirm actual recovery and completed training before accepting the next heavy or specific block. Elapsed recovery days alone do not establish readiness.

### 2026-12-28 / Mon — Squat + Bench

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 24,
  "runMinutes": 0,
  "strengthMinutes": 24,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 10,
    "support": 0,
    "setup": 2,
    "total": 24
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 24,
      "capMinutes": 95
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 2 × 3 | 152.5 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 97.5 | 7.5 | straight / maintenance |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2026-12-29 / Tue — Race-pace repeats

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 34,
  "runMinutes": 34,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 34,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Race-pace repeats

Role: quality-run; distance: 6 km; duration: 34 min; RPE: 7; pace: 4:44/km to 4:54/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Warm-up",
    "role": "easy",
    "distanceKm": 1.5,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Race-pace interval 1 of 3",
    "role": "work",
    "distanceKm": 1,
    "pace": "4:44/km to 4:54/km",
    "paceSeconds": 288.6442708258857,
    "intensity": "race-pace"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.2,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Race-pace interval 2 of 3",
    "role": "work",
    "distanceKm": 1,
    "pace": "4:44/km to 4:54/km",
    "paceSeconds": 288.6442708258857,
    "intensity": "race-pace"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.2,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Race-pace interval 3 of 3",
    "role": "work",
    "distanceKm": 1,
    "pace": "4:44/km to 4:54/km",
    "paceSeconds": 288.6442708258857,
    "intensity": "race-pace"
  },
  {
    "label": "Cool-down",
    "role": "easy",
    "distanceKm": 1.1,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 31, "max": 34}`.

1500 m warm-up + 1000 m race-pace interval 1 of 3 + 200 m easy recovery + 1000 m race-pace interval 2 of 3 + 200 m easy recovery + 1000 m race-pace interval 3 of 3 + 1100 m cool-down

Practise event rhythm supported by current performance. Work and recovery distances stay within the approved session budget. Short repetitions are controlled, not sprints.

Practise event rhythm supported by current performance.

### 2026-12-30 / Wed — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 39,
  "runMinutes": 39,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 39,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 6 km; duration: 39 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 33, "max": 39}`.

6000 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

### 2027-01-01 / Fri — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 66,
  "runMinutes": 39,
  "strengthMinutes": 24,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 10,
    "support": 0,
    "setup": 2,
    "total": 24
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 66,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 180 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 97.5 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 5.95 km; duration: 39 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 5.95,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 33, "max": 39}`.

5950 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2027-01-03 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 71,
  "runMinutes": 71,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 71,
      "capMinutes": 150
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 10.95 km; duration: 71 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 10.95,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 60, "max": 71}`.

10950 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

### Native coaching instructions

```json
{
  "handoverRecovery": {
    "eventDate": "2026-11-28",
    "sport": "strength",
    "conditional": true,
    "note": "The dated handover is provisional. Confirm actual event recovery and completed training before accepting the next heavy or specific block; elapsed days alone do not clear fatigue."
  },
  "missedSession": "Skip or move one session only if the next key session and recovery still fit. Do not stack missed quality, heavy work or long runs. After two missed sessions, illness or a week away, review the next block.",
  "liftingEffort": "Warm up to the prescribed effort. RPE governs the suggested kg. If effort overshoots by a point, reduce 2.5–5% and reassess; if still excessive, omit remaining back-offs. Heavy singles are skill practice, not forced maximal attempts.",
  "speedWork": "Accelerate with stable technique. Reduce load or stop when speed or position deteriorates. An easy speed day is not permission to turn it into a heavy day.",
  "athleteJudgement": "Report sustained fatigue, sleep disruption, pain, illness or altered movement. End the provoking work when needed. One difficult session is a reason to adjust that session, not an automatic full deload.",
  "review": "Review completed work every four weeks and after events. Later blocks are conditional on observed recovery and performance; no race result or lifting total is guaranteed."
}
```


## Week 10 — Development

Priority: Running. Running phase: Specific preparation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Post-race / post-event handover review: confirm actual recovery and completed training before accepting the next heavy or specific block. Elapsed recovery days alone do not establish readiness.

### 2027-01-04 / Mon — Squat + Bench

Strength maintenance: reduced volume without planned load escalation. Planned recovery within the training block. Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 19,
  "runMinutes": 0,
  "strengthMinutes": 19,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 5,
    "support": 0,
    "setup": 2,
    "total": 19
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 19,
      "capMinutes": 95
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 1 × 3 | 152.5 | 6 | straight / maintenance |
| Bench | 1 × 3 | 97.5 | 6 | straight / maintenance |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2027-01-05 / Tue — Controlled threshold repeats

Strength maintenance: reduced volume without planned load escalation. Planned recovery within the training block. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 35,
  "runMinutes": 35,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 35,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Controlled threshold repeats

Role: quality-run; distance: 6.25 km; duration: 35 min; RPE: 7; pace: 4:35/km to 4:45/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Warm-up",
    "role": "easy",
    "distanceKm": 1.55,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Threshold interval 1 of 4",
    "role": "work",
    "distanceKm": 0.7375,
    "pace": "4:35/km to 4:45/km",
    "paceSeconds": 280.18235738367343,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.20000000000000004,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Threshold interval 2 of 4",
    "role": "work",
    "distanceKm": 0.7375,
    "pace": "4:35/km to 4:45/km",
    "paceSeconds": 280.18235738367343,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.20000000000000004,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Threshold interval 3 of 4",
    "role": "work",
    "distanceKm": 0.7375,
    "pace": "4:35/km to 4:45/km",
    "paceSeconds": 280.18235738367343,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.2,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Threshold interval 4 of 4",
    "role": "work",
    "distanceKm": 0.7374999999999998,
    "pace": "4:35/km to 4:45/km",
    "paceSeconds": 280.18235738367343,
    "intensity": "threshold"
  },
  {
    "label": "Cool-down",
    "role": "easy",
    "distanceKm": 1.15,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 31, "max": 35}`.

1550 m warm-up + 738 m threshold interval 1 of 4 + 200 m easy recovery + 738 m threshold interval 2 of 4 + 200 m easy recovery + 738 m threshold interval 3 of 4 + 200 m easy recovery + 737 m threshold interval 4 of 4 + 1150 m cool-down

Accumulate controlled sustained work at estimated current threshold. Work and recovery distances stay within the approved session budget. Short repetitions are controlled, not sprints.

Accumulate controlled sustained work at estimated current threshold.

### 2027-01-06 / Wed — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Planned recovery within the training block. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 41,
  "runMinutes": 41,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 41,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 6.25 km; duration: 41 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.25,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 34, "max": 41}`.

6250 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

### 2027-01-08 / Fri — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Planned recovery within the training block. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 63,
  "runMinutes": 41,
  "strengthMinutes": 19,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 5,
    "support": 0,
    "setup": 2,
    "total": 19
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 63,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 1 × 3 | 180 | 6 | straight / maintenance |
| Bench | 1 × 3 | 97.5 | 6 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 6.25 km; duration: 41 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.25,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 34, "max": 41}`.

6250 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2027-01-10 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Planned recovery within the training block. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 74,
  "runMinutes": 74,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 74,
      "capMinutes": 150
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 11.45 km; duration: 74 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 11.45,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 63, "max": 74}`.

11450 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

### Native coaching instructions

```json
{
  "handoverRecovery": {
    "eventDate": "2026-11-28",
    "sport": "strength",
    "conditional": true,
    "note": "The dated handover is provisional. Confirm actual event recovery and completed training before accepting the next heavy or specific block; elapsed days alone do not clear fatigue."
  },
  "missedSession": "Skip or move one session only if the next key session and recovery still fit. Do not stack missed quality, heavy work or long runs. After two missed sessions, illness or a week away, review the next block.",
  "liftingEffort": "Warm up to the prescribed effort. RPE governs the suggested kg. If effort overshoots by a point, reduce 2.5–5% and reassess; if still excessive, omit remaining back-offs. Heavy singles are skill practice, not forced maximal attempts.",
  "speedWork": "Accelerate with stable technique. Reduce load or stop when speed or position deteriorates. An easy speed day is not permission to turn it into a heavy day.",
  "athleteJudgement": "Report sustained fatigue, sleep disruption, pain, illness or altered movement. End the provoking work when needed. One difficult session is a reason to adjust that session, not an automatic full deload.",
  "review": "Review completed work every four weeks and after events. Later blocks are conditional on observed recovery and performance; no race result or lifting total is guaranteed."
}
```


## Week 11 — Development

Priority: Running. Running phase: Specific preparation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Post-race / post-event handover review: confirm actual recovery and completed training before accepting the next heavy or specific block. Elapsed recovery days alone do not establish readiness.

### 2027-01-11 / Mon — Squat + Bench

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 29,
  "runMinutes": 0,
  "strengthMinutes": 29,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 10,
    "support": 5,
    "setup": 2,
    "total": 29
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 29,
      "capMinutes": 95
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 2 × 3 | 152.5 | 7.5 | straight / maintenance |
| Lying leg curl | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 97.5 | 7.5 | straight / maintenance |
| Cable fly | 1 × 12 | uncalibrated | 6 |  /  |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lying leg curl (10–12 reps): Block 3: Hamstring maintenance. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

### 2027-01-12 / Tue — Controlled threshold repeats

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 37,
  "runMinutes": 37,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 37,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Controlled threshold repeats

Role: quality-run; distance: 6.55 km; duration: 37 min; RPE: 7; pace: 4:35/km to 4:45/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Warm-up",
    "role": "easy",
    "distanceKm": 1.65,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Threshold interval 1 of 4",
    "role": "work",
    "distanceKm": 0.7375,
    "pace": "4:35/km to 4:45/km",
    "paceSeconds": 280.18235738367343,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.25,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Threshold interval 2 of 4",
    "role": "work",
    "distanceKm": 0.7375,
    "pace": "4:35/km to 4:45/km",
    "paceSeconds": 280.18235738367343,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.25,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Threshold interval 3 of 4",
    "role": "work",
    "distanceKm": 0.7375,
    "pace": "4:35/km to 4:45/km",
    "paceSeconds": 280.18235738367343,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.25,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Threshold interval 4 of 4",
    "role": "work",
    "distanceKm": 0.7374999999999998,
    "pace": "4:35/km to 4:45/km",
    "paceSeconds": 280.18235738367343,
    "intensity": "threshold"
  },
  {
    "label": "Cool-down",
    "role": "easy",
    "distanceKm": 1.2,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 33, "max": 37}`.

1650 m warm-up + 738 m threshold interval 1 of 4 + 250 m easy recovery + 738 m threshold interval 2 of 4 + 250 m easy recovery + 738 m threshold interval 3 of 4 + 250 m easy recovery + 737 m threshold interval 4 of 4 + 1200 m cool-down

Accumulate controlled sustained work at estimated current threshold. Work and recovery distances stay within the approved session budget. Short repetitions are controlled, not sprints.

Accumulate controlled sustained work at estimated current threshold.

### 2027-01-13 / Wed — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 43,
  "runMinutes": 43,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 43,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 6.55 km; duration: 43 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.55,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 36, "max": 43}`.

6550 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

### 2027-01-15 / Fri — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 72,
  "runMinutes": 42,
  "strengthMinutes": 26.5,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 10,
    "support": 2.5,
    "setup": 2,
    "total": 26.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 71.5,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 180 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 97.5 | 7.5 | straight / maintenance |
| Cable fly | 1 × 12 | uncalibrated | 6 |  /  |

#### Easy aerobic run

Role: easy-run; distance: 6.5 km; duration: 42 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.5,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 36, "max": 42}`.

6500 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

### 2027-01-17 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 77,
  "runMinutes": 77,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 77,
      "capMinutes": 150
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 11.95 km; duration: 77 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 11.95,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 65, "max": 77}`.

11950 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

### Native coaching instructions

```json
{
  "handoverRecovery": {
    "eventDate": "2026-11-28",
    "sport": "strength",
    "conditional": true,
    "note": "The dated handover is provisional. Confirm actual event recovery and completed training before accepting the next heavy or specific block; elapsed days alone do not clear fatigue."
  },
  "missedSession": "Skip or move one session only if the next key session and recovery still fit. Do not stack missed quality, heavy work or long runs. After two missed sessions, illness or a week away, review the next block.",
  "liftingEffort": "Warm up to the prescribed effort. RPE governs the suggested kg. If effort overshoots by a point, reduce 2.5–5% and reassess; if still excessive, omit remaining back-offs. Heavy singles are skill practice, not forced maximal attempts.",
  "speedWork": "Accelerate with stable technique. Reduce load or stop when speed or position deteriorates. An easy speed day is not permission to turn it into a heavy day.",
  "athleteJudgement": "Report sustained fatigue, sleep disruption, pain, illness or altered movement. End the provoking work when needed. One difficult session is a reason to adjust that session, not an automatic full deload.",
  "review": "Review completed work every four weeks and after events. Later blocks are conditional on observed recovery and performance; no race result or lifting total is guaranteed."
}
```


## Week 12 — Development

Priority: Running. Running phase: Specific preparation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Post-race / post-event handover review: confirm actual recovery and completed training before accepting the next heavy or specific block. Elapsed recovery days alone do not establish readiness.
- Half-marathon preparation review: long-running exposure remains modest. Review a completion-led run/walk strategy, recovery and supporting mileage before approving the final specific block.

### 2027-01-18 / Mon — Squat + Bench

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 29,
  "runMinutes": 0,
  "strengthMinutes": 29,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 10,
    "support": 5,
    "setup": 2,
    "total": 29
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 29,
      "capMinutes": 95
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 2 × 3 | 152.5 | 7.5 | straight / maintenance |
| Lying leg curl | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 97.5 | 7.5 | straight / maintenance |
| Cable fly | 1 × 12 | uncalibrated | 6 |  /  |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lying leg curl (10–12 reps): Block 3: Hamstring maintenance. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

### 2027-01-19 / Tue — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 35,
  "runMinutes": 35,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 35,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 5.35 km; duration: 35 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 5.35,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 30, "max": 35}`.

5350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Half-marathon preparation review: long-running exposure remains modest. Review a completion-led run/walk strategy, recovery and supporting mileage before approving the final specific block.
- Running recovery week: reduced running volume.

### 2027-01-20 / Wed — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 35,
  "runMinutes": 35,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 35,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 5.35 km; duration: 35 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 5.35,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 30, "max": 35}`.

5350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Half-marathon preparation review: long-running exposure remains modest. Review a completion-led run/walk strategy, recovery and supporting mileage before approving the final specific block.
- Running recovery week: reduced running volume.

### 2027-01-22 / Fri — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 65,
  "runMinutes": 35,
  "strengthMinutes": 26.5,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 10,
    "support": 2.5,
    "setup": 2,
    "total": 26.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 64.5,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 180 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 97.5 | 7.5 | straight / maintenance |
| Cable fly | 1 × 12 | uncalibrated | 6 |  /  |

#### Easy aerobic run

Role: easy-run; distance: 5.35 km; duration: 35 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 5.35,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 30, "max": 35}`.

5350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

hybridNotes:

- Half-marathon preparation review: long-running exposure remains modest. Review a completion-led run/walk strategy, recovery and supporting mileage before approving the final specific block.
- Running recovery week: reduced running volume.

### 2027-01-24 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 64,
  "runMinutes": 64,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 64,
      "capMinutes": 150
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 9.8 km; duration: 64 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 9.8,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 54, "max": 64}`.

9800 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Half-marathon preparation review: long-running exposure remains modest. Review a completion-led run/walk strategy, recovery and supporting mileage before approving the final specific block.
- Running recovery week: reduced running volume.

### Native coaching instructions

```json
{
  "handoverRecovery": {
    "eventDate": "2026-11-28",
    "sport": "strength",
    "conditional": true,
    "note": "The dated handover is provisional. Confirm actual event recovery and completed training before accepting the next heavy or specific block; elapsed days alone do not clear fatigue."
  },
  "missedSession": "Skip or move one session only if the next key session and recovery still fit. Do not stack missed quality, heavy work or long runs. After two missed sessions, illness or a week away, review the next block.",
  "liftingEffort": "Warm up to the prescribed effort. RPE governs the suggested kg. If effort overshoots by a point, reduce 2.5–5% and reassess; if still excessive, omit remaining back-offs. Heavy singles are skill practice, not forced maximal attempts.",
  "speedWork": "Accelerate with stable technique. Reduce load or stop when speed or position deteriorates. An easy speed day is not permission to turn it into a heavy day.",
  "athleteJudgement": "Report sustained fatigue, sleep disruption, pain, illness or altered movement. End the provoking work when needed. One difficult session is a reason to adjust that session, not an automatic full deload.",
  "review": "Review completed work every four weeks and after events. Later blocks are conditional on observed recovery and performance; no race result or lifting total is guaranteed."
}
```


## Week 13 — Development

Priority: Running. Running phase: Specific preparation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Post-race / post-event handover review: confirm actual recovery and completed training before accepting the next heavy or specific block. Elapsed recovery days alone do not establish readiness.
- Half-marathon preparation review: long-running exposure remains modest. Review a completion-led run/walk strategy, recovery and supporting mileage before approving the final specific block.

### 2027-01-25 / Mon — Squat + Bench

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 29,
  "runMinutes": 0,
  "strengthMinutes": 29,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 10,
    "support": 5,
    "setup": 2,
    "total": 29
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 29,
      "capMinutes": 95
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 2 × 3 | 152.5 | 7.5 | straight / maintenance |
| Lying leg curl | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 97.5 | 7.5 | straight / maintenance |
| Cable fly | 1 × 12 | uncalibrated | 6 |  /  |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lying leg curl (10–12 reps): Block 3: Hamstring maintenance. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

### 2027-01-26 / Tue — Controlled threshold repeats

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 38,
  "runMinutes": 38,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 38,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Controlled threshold repeats

Role: quality-run; distance: 6.8 km; duration: 38 min; RPE: 7; pace: 4:35/km to 4:45/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Warm-up",
    "role": "easy",
    "distanceKm": 1.7,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Threshold interval 1 of 4",
    "role": "work",
    "distanceKm": 0.7875,
    "pace": "4:35/km to 4:45/km",
    "paceSeconds": 280.18235738367343,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.25,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Threshold interval 2 of 4",
    "role": "work",
    "distanceKm": 0.7875,
    "pace": "4:35/km to 4:45/km",
    "paceSeconds": 280.18235738367343,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.25,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Threshold interval 3 of 4",
    "role": "work",
    "distanceKm": 0.7875,
    "pace": "4:35/km to 4:45/km",
    "paceSeconds": 280.18235738367343,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.25,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Threshold interval 4 of 4",
    "role": "work",
    "distanceKm": 0.7875000000000001,
    "pace": "4:35/km to 4:45/km",
    "paceSeconds": 280.18235738367343,
    "intensity": "threshold"
  },
  {
    "label": "Cool-down",
    "role": "easy",
    "distanceKm": 1.2,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 34, "max": 38}`.

1700 m warm-up + 788 m threshold interval 1 of 4 + 250 m easy recovery + 788 m threshold interval 2 of 4 + 250 m easy recovery + 788 m threshold interval 3 of 4 + 250 m easy recovery + 788 m threshold interval 4 of 4 + 1200 m cool-down

Accumulate controlled sustained work at estimated current threshold. Work and recovery distances stay within the approved session budget. Short repetitions are controlled, not sprints.

Accumulate controlled sustained work at estimated current threshold.

hybridNotes:

- Half-marathon preparation review: long-running exposure remains modest. Review a completion-led run/walk strategy, recovery and supporting mileage before approving the final specific block.

### 2027-01-27 / Wed — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 44,
  "runMinutes": 44,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 44,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 6.8 km; duration: 44 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.8,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 37, "max": 44}`.

6800 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Half-marathon preparation review: long-running exposure remains modest. Review a completion-led run/walk strategy, recovery and supporting mileage before approving the final specific block.

### 2027-01-29 / Fri — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 45,
  "strengthMinutes": 26.5,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 10,
    "support": 2.5,
    "setup": 2,
    "total": 26.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 74.5,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 180 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 97.5 | 7.5 | straight / maintenance |
| Cable fly | 1 × 12 | uncalibrated | 6 |  /  |

#### Easy aerobic run

Role: easy-run; distance: 6.85 km; duration: 45 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.85,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 38, "max": 45}`.

6850 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

hybridNotes:

- Half-marathon preparation review: long-running exposure remains modest. Review a completion-led run/walk strategy, recovery and supporting mileage before approving the final specific block.

### 2027-01-31 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 81,
  "runMinutes": 81,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 81,
      "capMinutes": 150
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 12.5 km; duration: 81 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 12.5,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 68, "max": 81}`.

12500 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Half-marathon preparation review: long-running exposure remains modest. Review a completion-led run/walk strategy, recovery and supporting mileage before approving the final specific block.

### Native coaching instructions

```json
{
  "handoverRecovery": {
    "eventDate": "2026-11-28",
    "sport": "strength",
    "conditional": true,
    "note": "The dated handover is provisional. Confirm actual event recovery and completed training before accepting the next heavy or specific block; elapsed days alone do not clear fatigue."
  },
  "missedSession": "Skip or move one session only if the next key session and recovery still fit. Do not stack missed quality, heavy work or long runs. After two missed sessions, illness or a week away, review the next block.",
  "liftingEffort": "Warm up to the prescribed effort. RPE governs the suggested kg. If effort overshoots by a point, reduce 2.5–5% and reassess; if still excessive, omit remaining back-offs. Heavy singles are skill practice, not forced maximal attempts.",
  "speedWork": "Accelerate with stable technique. Reduce load or stop when speed or position deteriorates. An easy speed day is not permission to turn it into a heavy day.",
  "athleteJudgement": "Report sustained fatigue, sleep disruption, pain, illness or altered movement. End the provoking work when needed. One difficult session is a reason to adjust that session, not an automatic full deload.",
  "review": "Review completed work every four weeks and after events. Later blocks are conditional on observed recovery and performance; no race result or lifting total is guaranteed."
}
```


## Week 14 — Development

Priority: Running. Running phase: Specific preparation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Post-race / post-event handover review: confirm actual recovery and completed training before accepting the next heavy or specific block. Elapsed recovery days alone do not establish readiness.
- Half-marathon preparation review: long-running exposure remains modest. Review a completion-led run/walk strategy, recovery and supporting mileage before approving the final specific block.

### 2027-02-01 / Mon — Squat + Bench

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 29,
  "runMinutes": 0,
  "strengthMinutes": 29,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 10,
    "support": 5,
    "setup": 2,
    "total": 29
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 29,
      "capMinutes": 95
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 2 × 3 | 152.5 | 7.5 | straight / maintenance |
| Lying leg curl | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 97.5 | 7.5 | straight / maintenance |
| Cable fly | 1 × 12 | uncalibrated | 6 |  /  |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lying leg curl (10–12 reps): Block 3: Hamstring maintenance. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

### 2027-02-02 / Tue — Controlled threshold repeats

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 40,
  "runMinutes": 40,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 40,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Controlled threshold repeats

Role: quality-run; distance: 7.15 km; duration: 40 min; RPE: 7; pace: 4:35/km to 4:45/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Warm-up",
    "role": "easy",
    "distanceKm": 1.8,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Threshold interval 1 of 4",
    "role": "work",
    "distanceKm": 0.825,
    "pace": "4:35/km to 4:45/km",
    "paceSeconds": 280.18235738367343,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.25,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Threshold interval 2 of 4",
    "role": "work",
    "distanceKm": 0.825,
    "pace": "4:35/km to 4:45/km",
    "paceSeconds": 280.18235738367343,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.25,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Threshold interval 3 of 4",
    "role": "work",
    "distanceKm": 0.825,
    "pace": "4:35/km to 4:45/km",
    "paceSeconds": 280.18235738367343,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.25,
    "pace": "5:26/km to 6:26/km"
  },
  {
    "label": "Threshold interval 4 of 4",
    "role": "work",
    "distanceKm": 0.8250000000000002,
    "pace": "4:35/km to 4:45/km",
    "paceSeconds": 280.18235738367343,
    "intensity": "threshold"
  },
  {
    "label": "Cool-down",
    "role": "easy",
    "distanceKm": 1.3,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 36, "max": 40}`.

1800 m warm-up + 825 m threshold interval 1 of 4 + 250 m easy recovery + 825 m threshold interval 2 of 4 + 250 m easy recovery + 825 m threshold interval 3 of 4 + 250 m easy recovery + 825 m threshold interval 4 of 4 + 1300 m cool-down

Accumulate controlled sustained work at estimated current threshold. Work and recovery distances stay within the approved session budget. Short repetitions are controlled, not sprints.

Accumulate controlled sustained work at estimated current threshold.

hybridNotes:

- Half-marathon preparation review: long-running exposure remains modest. Review a completion-led run/walk strategy, recovery and supporting mileage before approving the final specific block.

### 2027-02-03 / Wed — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 47,
  "runMinutes": 47,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 47,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.15 km; duration: 47 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.15,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 39, "max": 47}`.

7150 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Half-marathon preparation review: long-running exposure remains modest. Review a completion-led run/walk strategy, recovery and supporting mileage before approving the final specific block.

### 2027-02-05 / Fri — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 76,
  "runMinutes": 46,
  "strengthMinutes": 26.5,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 10,
    "support": 2.5,
    "setup": 2,
    "total": 26.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 75.5,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 180 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 97.5 | 7.5 | straight / maintenance |
| Cable fly | 1 × 12 | uncalibrated | 6 |  /  |

#### Easy aerobic run

Role: easy-run; distance: 7.1 km; duration: 46 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.1,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 39, "max": 46}`.

7100 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

hybridNotes:

- Half-marathon preparation review: long-running exposure remains modest. Review a completion-led run/walk strategy, recovery and supporting mileage before approving the final specific block.

### 2027-02-07 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 85,
  "runMinutes": 85,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 85,
      "capMinutes": 150
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 13.05 km; duration: 85 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 13.05,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 71, "max": 85}`.

13050 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Half-marathon preparation review: long-running exposure remains modest. Review a completion-led run/walk strategy, recovery and supporting mileage before approving the final specific block.

### Native coaching instructions

```json
{
  "handoverRecovery": {
    "eventDate": "2026-11-28",
    "sport": "strength",
    "conditional": true,
    "note": "The dated handover is provisional. Confirm actual event recovery and completed training before accepting the next heavy or specific block; elapsed days alone do not clear fatigue."
  },
  "missedSession": "Skip or move one session only if the next key session and recovery still fit. Do not stack missed quality, heavy work or long runs. After two missed sessions, illness or a week away, review the next block.",
  "liftingEffort": "Warm up to the prescribed effort. RPE governs the suggested kg. If effort overshoots by a point, reduce 2.5–5% and reassess; if still excessive, omit remaining back-offs. Heavy singles are skill practice, not forced maximal attempts.",
  "speedWork": "Accelerate with stable technique. Reduce load or stop when speed or position deteriorates. An easy speed day is not permission to turn it into a heavy day.",
  "athleteJudgement": "Report sustained fatigue, sleep disruption, pain, illness or altered movement. End the provoking work when needed. One difficult session is a reason to adjust that session, not an automatic full deload.",
  "review": "Review completed work every four weeks and after events. Later blocks are conditional on observed recovery and performance; no race result or lifting total is guaranteed."
}
```


## Week 15 — Development

Priority: Running. Running phase: Taper / event. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Post-race / post-event handover review: confirm actual recovery and completed training before accepting the next heavy or specific block. Elapsed recovery days alone do not establish readiness.

### 2027-02-08 / Mon — Squat + Bench

Strength maintenance: reduced volume without planned load escalation. Planned recovery within the training block. Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 19,
  "runMinutes": 0,
  "strengthMinutes": 19,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 5,
    "support": 0,
    "setup": 2,
    "total": 19
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 19,
      "capMinutes": 95
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 1 × 3 | 107.5 | 5.5 | straight / technique |
| Bench | 1 × 3 | 82.5 | 6 | straight / technique |

variationNotes:

- Background strength reduced for the half taper. Preserve the race preparation; no block-phase rebound in support volume.
- Background strength reduced for the half taper. Preserve the race preparation; no block-phase rebound in support volume.

### 2027-02-09 / Tue — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Planned recovery within the training block. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 25,
  "runMinutes": 25,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 25,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 3.75 km; duration: 25 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 3.75,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 21, "max": 25}`.

3750 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Running event taper: reduced running volume.

### 2027-02-10 / Wed — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Planned recovery within the training block. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 45,
  "runMinutes": 45,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 45,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 6.85 km; duration: 45 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.85,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 38, "max": 45}`.

6850 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Running event taper: reduced running volume.

### 2027-02-12 / Fri — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Planned recovery within the training block. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 47,
  "runMinutes": 25,
  "strengthMinutes": 19,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 5,
    "support": 0,
    "setup": 2,
    "total": 19
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 47,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 1 × 3 | 127.5 | 5.5 | straight / technique |
| Bench | 1 × 3 | 82.5 | 6 | straight / technique |

#### Easy aerobic run

Role: easy-run; distance: 3.75 km; duration: 25 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 3.75,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 21, "max": 25}`.

3750 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Background strength reduced for the half taper. Preserve the race preparation; no block-phase rebound in support volume.
- Background strength reduced for the half taper. Preserve the race preparation; no block-phase rebound in support volume.

hybridNotes:

- Running event taper: reduced running volume.

### 2027-02-14 / Sun — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Planned recovery within the training block. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 25,
  "runMinutes": 25,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 25,
      "capMinutes": 150
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 3.8 km; duration: 25 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 3.8,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 21, "max": 25}`.

3800 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Running event taper: reduced running volume.

### Native coaching instructions

```json
{
  "handoverRecovery": {
    "eventDate": "2026-11-28",
    "sport": "strength",
    "conditional": true,
    "note": "The dated handover is provisional. Confirm actual event recovery and completed training before accepting the next heavy or specific block; elapsed days alone do not clear fatigue."
  },
  "missedSession": "Skip or move one session only if the next key session and recovery still fit. Do not stack missed quality, heavy work or long runs. After two missed sessions, illness or a week away, review the next block.",
  "liftingEffort": "Warm up to the prescribed effort. RPE governs the suggested kg. If effort overshoots by a point, reduce 2.5–5% and reassess; if still excessive, omit remaining back-offs. Heavy singles are skill practice, not forced maximal attempts.",
  "speedWork": "Accelerate with stable technique. Reduce load or stop when speed or position deteriorates. An easy speed day is not permission to turn it into a heavy day.",
  "athleteJudgement": "Report sustained fatigue, sleep disruption, pain, illness or altered movement. End the provoking work when needed. One difficult session is a reason to adjust that session, not an automatic full deload.",
  "review": "Review completed work every four weeks and after events. Later blocks are conditional on observed recovery and performance; no race result or lifting total is guaranteed."
}
```


## Week 16 — Development

Priority: Running. Running phase: Taper / event. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Post-race / post-event handover review: confirm actual recovery and completed training before accepting the next heavy or specific block. Elapsed recovery days alone do not establish readiness.

### 2027-02-15 / Mon — Squat + Bench

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 19,
  "runMinutes": 0,
  "strengthMinutes": 19,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 5,
    "support": 0,
    "setup": 2,
    "total": 19
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 19,
      "capMinutes": 95
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 1 × 3 | 107.5 | 5.5 | straight / technique |
| Bench | 1 × 3 | 82.5 | 6 | straight / technique |

variationNotes:

- Background strength reduced for the half taper. Preserve the race preparation; no block-phase rebound in support volume.
- Background strength reduced for the half taper. Preserve the race preparation; no block-phase rebound in support volume.

### 2027-02-16 / Tue — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 14,
  "runMinutes": 14,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 14,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 2.05 km; duration: 14 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 2.05,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 12, "max": 14}`.

2050 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Running event taper: reduced running volume.

### 2027-02-17 / Wed — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 25,
  "runMinutes": 25,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 25,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 3.75 km; duration: 25 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 3.75,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 21, "max": 25}`.

3750 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Running event taper: reduced running volume.

### 2027-02-19 / Fri — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 14,
  "runMinutes": 14,
  "strengthMinutes": 0,
  "transitionMinutes": 0,
  "components": {
    "warmups": 0,
    "workAndRest": 0,
    "support": 0,
    "setup": 0,
    "total": 0
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "run",
      "totalMinutes": 14,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 2.05 km; duration: 14 min; RPE: 3.5; pace: 5:26/km to 6:26/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 2.05,
    "pace": "5:26/km to 6:26/km"
  }
]
```

Duration range: `{"min": 12, "max": 14}`.

2050 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Running event taper: reduced running volume.

### 2027-02-21 / Sunday — Running event

Competition replaces scheduled training.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 103,
  "event": true,
  "confirmed": true,
  "includesWarmups": false,
  "includesRest": false,
  "includesTransitions": false
}
```

Event permission: `{"confirmed": true, "explicit": true, "estimatedMinutes": 103, "logisticsMinutes": null}`

#### 21.1 km race

Role: race; distance: 21.098 km; duration: 103 min; RPE: unknown; pace: 4:44/km to 4:54/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Race distance",
    "distanceKm": 21.0975,
    "pace": "4:44/km to 4:54/km"
  }
]
```

Duration range: `{"min": 100, "max": 103}`.

Race distance is separate from taper training. Pace is an estimate from the current PB, not a promised race outcome.

### Native coaching instructions

```json
{
  "handoverRecovery": {
    "eventDate": "2026-11-28",
    "sport": "strength",
    "conditional": true,
    "note": "The dated handover is provisional. Confirm actual event recovery and completed training before accepting the next heavy or specific block; elapsed days alone do not clear fatigue."
  },
  "missedSession": "Skip or move one session only if the next key session and recovery still fit. Do not stack missed quality, heavy work or long runs. After two missed sessions, illness or a week away, review the next block.",
  "liftingEffort": "Warm up to the prescribed effort. RPE governs the suggested kg. If effort overshoots by a point, reduce 2.5–5% and reassess; if still excessive, omit remaining back-offs. Heavy singles are skill practice, not forced maximal attempts.",
  "speedWork": "Accelerate with stable technique. Reduce load or stop when speed or position deteriorates. An easy speed day is not permission to turn it into a heavy day.",
  "athleteJudgement": "Report sustained fatigue, sleep disruption, pain, illness or altered movement. End the provoking work when needed. One difficult session is a reason to adjust that session, not an automatic full deload.",
  "review": "Review completed work every four weeks and after events. Later blocks are conditional on observed recovery and performance; no race result or lifting total is guaranteed."
}
```
