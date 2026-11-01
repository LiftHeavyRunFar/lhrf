# P — Leila: Established 10K runner with two maintenance lifting visits

**Synthetic native output / coaching review copy / not an activated programme.**

Acceptable candidate, subject to normal recovery checks.

All 12 weeks are expanded below. Raw `P.json` preserves every native field and provenance without rounding; displays below round distances to three decimals. Suggested loads require warm-up calibration; an uncalibrated value is not a zero-kg prescription. No session has been hand-corrected.

Frozen input SHA256: `5a0e83d10a5aab146db43ad2d7170be0cd2ff97888de412a809161099a4e190a`. Captured commit: `988d74120d63b0abb5c070afa1cb6bd91f4d81ae`; engine-source hashes are in the raw capture.

## Athlete facts

```json
{
  "id": "P",
  "name": "Leila",
  "label": "Established 10K runner with two maintenance lifting visits",
  "priority": "Running",
  "training_age": "advanced",
  "goals": [
    {
      "sport": "running",
      "distance_km": 10,
      "date": "2027-01-24"
    }
  ],
  "strength": {
    "observations": {
      "Squat": {
        "kg": 105,
        "reps": 1,
        "tested_single": true
      },
      "Bench": {
        "kg": 62.5,
        "reps": 1,
        "tested_single": true
      },
      "Deadlift": {
        "kg": 135,
        "reps": 1,
        "tested_single": true
      }
    },
    "requested_exposures_per_week": {
      "squat": 1,
      "bench": 2,
      "deadlift": 1
    }
  },
  "running": {
    "recent_result": {
      "distance_km": 10,
      "seconds": 2600,
      "effort": "performance",
      "date": "2026-10-24"
    },
    "weekly_km_history": [
      32,
      34,
      33,
      35,
      34,
      36
    ],
    "long_run": {
      "km": 12,
      "minutes": 72,
      "recovery_hours": 24
    },
    "requested_runs_per_week": 4
  },
  "availability": {
    "strengthVisits": 2,
    "minutes": {
      "Mon": 70,
      "Tue": 75,
      "Thu": 80,
      "Fri": 60,
      "Sun": 110
    },
    "combinedDays": [
      "Mon",
      "Thu"
    ],
    "separateDays": [],
    "separateMinutes": {},
    "minimumGapHours": 0,
    "eventDays": {
      "2027-01-24": {
        "confirmed": true,
        "minutes": 240
      }
    }
  },
  "health_context": "Fictional, pain-free, no illness or medical rehabilitation. Future adaptation and event results are unknown.",
  "training_history": "Seven years running, three years lifting; four-run rhythm already established. Target is a well-paced 10K, not an invented new PB."
}
```

## Full horizon

| Week | Priority | Running phase | Training km (race excluded) | Calendar feasible |
|---|---|---|---|---|
| 1 | Running | Aerobic foundation | 35 | True |
| 2 | Running | Aerobic foundation | 36.05 | True |
| 3 | Running | Aerobic foundation | 37.15 | True |
| 4 | Running | Aerobic foundation | 30.45 | True |
| 5 | Running | Development | 38.25 | True |
| 6 | Running | Development | 39.4 | True |
| 7 | Running | Development | 40.55 | True |
| 8 | Running | Development | 33.25 | True |
| 9 | Running | Development | 41.8 | True |
| 10 | Running | Development | 43.05 | True |
| 11 | Running | Development | 43.636 | True |
| 12 | Running | Taper / event | 9.95 | True |

## Week 1 — Foundation

Priority: Running. Running phase: Aerobic foundation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-11-02 / Mon — Squat + Bench

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Support the main goal without unnecessary fatigue.

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
      "capMinutes": 70
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
| Squat | 2 × 3 | 82.5 | 7.5 | straight / maintenance |
| Seated leg curl | 1 × 12 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 50 | 7.5 | straight / maintenance |
| Triceps pushdown | 1 × 12 | uncalibrated | 6 |  /  |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Seated leg curl (12–14 reps): Block 1: Hamstring hypertrophy. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Triceps pushdown (12–14 reps): Block 1: Triceps capacity. Choose initial load by RPE; aim to add reps before weight.

### 2026-11-03 / Tue — Controlled threshold repeats

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

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

Role: quality-run; distance: 7.65 km; duration: 41 min; RPE: 7; pace: 4:20/km to 4:30/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Warm-up",
    "role": "easy",
    "distanceKm": 1.9,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Threshold interval 1 of 4",
    "role": "work",
    "distanceKm": 0.9,
    "pace": "4:20/km to 4:30/km",
    "paceSeconds": 264.8336165940605,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.25,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Threshold interval 2 of 4",
    "role": "work",
    "distanceKm": 0.9,
    "pace": "4:20/km to 4:30/km",
    "paceSeconds": 264.8336165940605,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.25,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Threshold interval 3 of 4",
    "role": "work",
    "distanceKm": 0.9,
    "pace": "4:20/km to 4:30/km",
    "paceSeconds": 264.8336165940605,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.25,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Threshold interval 4 of 4",
    "role": "work",
    "distanceKm": 0.8999999999999999,
    "pace": "4:20/km to 4:30/km",
    "paceSeconds": 264.8336165940605,
    "intensity": "threshold"
  },
  {
    "label": "Cool-down",
    "role": "easy",
    "distanceKm": 1.4,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 36, "max": 41}`.

1900 m warm-up + 900 m threshold interval 1 of 4 + 250 m easy recovery + 900 m threshold interval 2 of 4 + 250 m easy recovery + 900 m threshold interval 3 of 4 + 250 m easy recovery + 900 m threshold interval 4 of 4 + 1400 m cool-down

Accumulate controlled sustained work at estimated current threshold. Work and recovery distances stay within the approved session budget. Short repetitions are controlled, not sprints.

Accumulate controlled sustained work at estimated current threshold.

hybridNotes:

- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-11-05 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 77,
  "runMinutes": 47,
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
      "totalMinutes": 76.5,
      "capMinutes": 80
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
| Deadlift | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Lat pulldown | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 50 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 7.65 km; duration: 47 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.65,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 40, "max": 47}`.

7650 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lat pulldown (10–12 reps): Block 1: Upper-back support. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-11-06 / Fri — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

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
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.7 km; duration: 47 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.7,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 40, "max": 47}`.

7700 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-11-08 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 73,
  "runMinutes": 73,
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
      "totalMinutes": 73,
      "capMinutes": 110
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 12 km; duration: 73 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 12,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 62, "max": 73}`.

12000 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

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


## Week 2 — Foundation

Priority: Running. Running phase: Aerobic foundation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-11-09 / Mon — Squat + Bench

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Support the main goal without unnecessary fatigue.

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
      "capMinutes": 70
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
| Squat | 2 × 3 | 82.5 | 7.5 | straight / maintenance |
| Seated leg curl | 1 × 12 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 50 | 7.5 | straight / maintenance |
| Triceps pushdown | 1 × 12 | uncalibrated | 6 |  /  |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Seated leg curl (12–14 reps): Block 1: Hamstring hypertrophy. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Triceps pushdown (12–14 reps): Block 1: Triceps capacity. Choose initial load by RPE; aim to add reps before weight.

### 2026-11-10 / Tue — Pyramid intervals

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

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
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Pyramid intervals

Role: quality-run; distance: 7.75 km; duration: 41 min; RPE: 7; pace: 4:04/km to 4:25/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Warm-up",
    "role": "easy",
    "distanceKm": 1.95,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Pyramid interval 1 of 5",
    "role": "work",
    "distanceKm": 0.5214285714285715,
    "pace": "4:04/km to 4:14/km",
    "paceSeconds": 249.40867102456872,
    "intensity": "mixed-controlled"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.1875,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Pyramid interval 2 of 5",
    "role": "work",
    "distanceKm": 0.7821428571428571,
    "pace": "4:10/km to 4:20/km",
    "paceSeconds": 254.70433551228436,
    "intensity": "mixed-controlled"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.1875,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Pyramid interval 3 of 5",
    "role": "work",
    "distanceKm": 1.042857142857143,
    "pace": "4:15/km to 4:25/km",
    "paceSeconds": 260,
    "intensity": "mixed-controlled"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.1875,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Pyramid interval 4 of 5",
    "role": "work",
    "distanceKm": 0.7821428571428571,
    "pace": "4:10/km to 4:20/km",
    "paceSeconds": 254.70433551228436,
    "intensity": "mixed-controlled"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.1875,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Pyramid interval 5 of 5",
    "role": "work",
    "distanceKm": 0.5214285714285714,
    "pace": "4:04/km to 4:14/km",
    "paceSeconds": 249.40867102456872,
    "intensity": "mixed-controlled"
  },
  {
    "label": "Cool-down",
    "role": "easy",
    "distanceKm": 1.4,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 36, "max": 41}`.

1950 m warm-up + 521 m pyramid interval 1 of 5 + 188 m easy recovery + 782 m pyramid interval 2 of 5 + 188 m easy recovery + 1043 m pyramid interval 3 of 5 + 188 m easy recovery + 782 m pyramid interval 4 of 5 + 188 m easy recovery + 521 m pyramid interval 5 of 5 + 1400 m cool-down

Progress through short, medium and longer efforts, then return; controlled changes of pace. Work and recovery distances stay within the approved session budget. Short repetitions are controlled, not sprints.

Progress through short, medium and longer efforts, then return; controlled changes of pace.

hybridNotes:

- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-11-12 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 78,
  "runMinutes": 48,
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
      "totalMinutes": 77.5,
      "capMinutes": 80
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
| Deadlift | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Lat pulldown | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 50 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 7.75 km; duration: 48 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.75,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 40, "max": 48}`.

7750 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lat pulldown (10–12 reps): Block 1: Upper-back support. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-11-13 / Fri — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 48,
  "runMinutes": 48,
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
      "totalMinutes": 48,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.75 km; duration: 48 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.75,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 40, "max": 48}`.

7750 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-11-15 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 78,
  "runMinutes": 78,
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
      "totalMinutes": 78,
      "capMinutes": 110
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 12.8 km; duration: 78 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 12.8,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 66, "max": 78}`.

12800 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

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


## Week 3 — Foundation

Priority: Running. Running phase: Aerobic foundation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-11-16 / Mon — Squat + Bench

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Support the main goal without unnecessary fatigue.

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
      "capMinutes": 70
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
| Squat | 2 × 3 | 82.5 | 7.5 | straight / maintenance |
| Seated leg curl | 1 × 12 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 50 | 7.5 | straight / maintenance |
| Triceps pushdown | 1 × 12 | uncalibrated | 6 |  /  |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Seated leg curl (12–14 reps): Block 1: Hamstring hypertrophy. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Triceps pushdown (12–14 reps): Block 1: Triceps capacity. Choose initial load by RPE; aim to add reps before weight.

### 2026-11-17 / Tue — Race-pace repeats

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

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

Role: quality-run; distance: 7.85 km; duration: 41 min; RPE: 7; pace: 4:15/km to 4:25/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Warm-up",
    "role": "easy",
    "distanceKm": 1.95,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Race-pace interval 1 of 4",
    "role": "work",
    "distanceKm": 0.9375,
    "pace": "4:15/km to 4:25/km",
    "paceSeconds": 260,
    "intensity": "race-pace"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.25,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Race-pace interval 2 of 4",
    "role": "work",
    "distanceKm": 0.9375,
    "pace": "4:15/km to 4:25/km",
    "paceSeconds": 260,
    "intensity": "race-pace"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.25,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Race-pace interval 3 of 4",
    "role": "work",
    "distanceKm": 0.9375,
    "pace": "4:15/km to 4:25/km",
    "paceSeconds": 260,
    "intensity": "race-pace"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.25,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Race-pace interval 4 of 4",
    "role": "work",
    "distanceKm": 0.9375,
    "pace": "4:15/km to 4:25/km",
    "paceSeconds": 260,
    "intensity": "race-pace"
  },
  {
    "label": "Cool-down",
    "role": "easy",
    "distanceKm": 1.4,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 37, "max": 41}`.

1950 m warm-up + 938 m race-pace interval 1 of 4 + 250 m easy recovery + 938 m race-pace interval 2 of 4 + 250 m easy recovery + 938 m race-pace interval 3 of 4 + 250 m easy recovery + 938 m race-pace interval 4 of 4 + 1400 m cool-down

Practise event rhythm supported by current performance. Work and recovery distances stay within the approved session budget. Short repetitions are controlled, not sprints.

Practise event rhythm supported by current performance.

hybridNotes:

- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-11-19 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 78,
  "runMinutes": 48,
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
      "totalMinutes": 77.5,
      "capMinutes": 80
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
| Deadlift | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Lat pulldown | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 50 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 7.85 km; duration: 48 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.85,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

7850 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lat pulldown (10–12 reps): Block 1: Upper-back support. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-11-20 / Fri — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 48,
  "runMinutes": 48,
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
      "totalMinutes": 48,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.85 km; duration: 48 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.85,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

7850 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-11-22 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 83,
  "runMinutes": 83,
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
      "totalMinutes": 83,
      "capMinutes": 110
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 13.6 km; duration: 83 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 13.6,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 70, "max": 83}`.

13600 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

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


## Week 4 — Foundation

Priority: Running. Running phase: Aerobic foundation. Calendar feasible: **True**. Review required: **False**. Feasibility describes scheduling, not athlete readiness.

### 2026-11-23 / Mon — Squat + Bench

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Support the main goal without unnecessary fatigue.

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
      "capMinutes": 70
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
| Squat | 2 × 3 | 82.5 | 7.5 | straight / maintenance |
| Seated leg curl | 1 × 12 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 50 | 7.5 | straight / maintenance |
| Triceps pushdown | 1 × 12 | uncalibrated | 6 |  /  |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Seated leg curl (12–14 reps): Block 1: Hamstring hypertrophy. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Triceps pushdown (12–14 reps): Block 1: Triceps capacity. Choose initial load by RPE; aim to add reps before weight.

### 2026-11-24 / Tue — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

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

Role: easy-run; distance: 6.3 km; duration: 39 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.3,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 33, "max": 39}`.

6300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Running recovery week: reduced running volume.

### 2026-11-26 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 69,
  "runMinutes": 39,
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
      "totalMinutes": 68.5,
      "capMinutes": 80
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
| Deadlift | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Lat pulldown | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 50 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 6.3 km; duration: 39 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.3,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 33, "max": 39}`.

6300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lat pulldown (10–12 reps): Block 1: Upper-back support. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Running recovery week: reduced running volume.

### 2026-11-27 / Fri — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

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
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 6.3 km; duration: 39 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.3,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 33, "max": 39}`.

6300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Running recovery week: reduced running volume.

### 2026-11-29 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

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
      "capMinutes": 110
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 11.55 km; duration: 71 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 11.55,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 60, "max": 71}`.

11550 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Running recovery week: reduced running volume.

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


## Week 5 — Foundation

Priority: Running. Running phase: Development. Calendar feasible: **True**. Review required: **False**. Feasibility describes scheduling, not athlete readiness.

### 2026-11-30 / Mon — Squat + Bench

Strength maintenance: reduced volume without planned load escalation. Reduced volume separates Foundation from Development. Build repeatable technique and capacity. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 24,
  "runMinutes": 0,
  "strengthMinutes": 24,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 5,
    "support": 5,
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
      "capMinutes": 70
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
| Squat | 1 × 3 | 82.5 | 6 | straight / maintenance |
| Seated leg curl | 1 × 12 | uncalibrated | 6 |  /  |
| Bench | 1 × 3 | 50 | 6 | straight / maintenance |
| Triceps pushdown | 1 × 12 | uncalibrated | 6 |  /  |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Seated leg curl (12–14 reps): Block 1: Hamstring hypertrophy. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Triceps pushdown (12–14 reps): Block 1: Triceps capacity. Choose initial load by RPE; aim to add reps before weight.

### 2026-12-01 / Tue — Ascending ladder intervals

Strength maintenance: reduced volume without planned load escalation. Reduced volume separates Foundation from Development. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 42,
  "runMinutes": 42,
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
      "totalMinutes": 42,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Ascending ladder intervals

Role: quality-run; distance: 7.95 km; duration: 42 min; RPE: 7; pace: 4:04/km to 4:25/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Warm-up",
    "role": "easy",
    "distanceKm": 2,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Ascending ladder interval 1 of 4",
    "role": "work",
    "distanceKm": 0.5142857142857143,
    "pace": "4:04/km to 4:14/km",
    "paceSeconds": 249.40867102456872,
    "intensity": "mixed-controlled"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.3,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Ascending ladder interval 2 of 4",
    "role": "work",
    "distanceKm": 0.7714285714285715,
    "pace": "4:08/km to 4:18/km",
    "paceSeconds": 252.93911401637914,
    "intensity": "mixed-controlled"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.3,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Ascending ladder interval 3 of 4",
    "role": "work",
    "distanceKm": 1.0285714285714287,
    "pace": "4:11/km to 4:21/km",
    "paceSeconds": 256.46955700818955,
    "intensity": "mixed-controlled"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.29999999999999993,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Ascending ladder interval 4 of 4",
    "role": "work",
    "distanceKm": 1.2857142857142856,
    "pace": "4:15/km to 4:25/km",
    "paceSeconds": 260,
    "intensity": "mixed-controlled"
  },
  {
    "label": "Cool-down",
    "role": "easy",
    "distanceKm": 1.45,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 37, "max": 42}`.

2000 m warm-up + 514 m ascending ladder interval 1 of 4 + 300 m easy recovery + 771 m ascending ladder interval 2 of 4 + 300 m easy recovery + 1029 m ascending ladder interval 3 of 4 + 300 m easy recovery + 1286 m ascending ladder interval 4 of 4 + 1450 m cool-down

Extend repetition duration while settling towards event pace. Work and recovery distances stay within the approved session budget. Short repetitions are controlled, not sprints.

Extend repetition duration while settling towards event pace.

### 2026-12-03 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Reduced volume separates Foundation from Development. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 74,
  "runMinutes": 49,
  "strengthMinutes": 21.5,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 5,
    "support": 2.5,
    "setup": 2,
    "total": 21.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 73.5,
      "capMinutes": 80
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
| Deadlift | 1 × 3 | 105 | 6 | straight / maintenance |
| Lat pulldown | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 1 × 3 | 50 | 6 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 7.95 km; duration: 49 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.95,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 41, "max": 49}`.

7950 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lat pulldown (10–12 reps): Block 1: Upper-back support. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2026-12-04 / Fri — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Reduced volume separates Foundation from Development. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 49,
  "runMinutes": 49,
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
      "totalMinutes": 49,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.95 km; duration: 49 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.95,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 41, "max": 49}`.

7950 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

### 2026-12-06 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Reduced volume separates Foundation from Development. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 88,
  "runMinutes": 88,
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
      "totalMinutes": 88,
      "capMinutes": 110
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 14.4 km; duration: 88 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 14.4,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 74, "max": 88}`.

14400 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

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

Priority: Running. Running phase: Development. Calendar feasible: **True**. Review required: **False**. Feasibility describes scheduling, not athlete readiness.

### 2026-12-07 / Mon — Squat + Bench

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
      "capMinutes": 70
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
| Squat | 2 × 3 | 82.5 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 50 | 7.5 | straight / maintenance |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2026-12-08 / Tue — Descending ladder intervals

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
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Descending ladder intervals

Role: quality-run; distance: 8.15 km; duration: 43 min; RPE: 7; pace: 4:04/km to 4:25/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Warm-up",
    "role": "easy",
    "distanceKm": 2,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Descending ladder interval 1 of 4",
    "role": "work",
    "distanceKm": 1.3571428571428572,
    "pace": "4:15/km to 4:25/km",
    "paceSeconds": 260,
    "intensity": "mixed-controlled"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.3,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Descending ladder interval 2 of 4",
    "role": "work",
    "distanceKm": 1.0857142857142856,
    "pace": "4:11/km to 4:21/km",
    "paceSeconds": 256.46955700818955,
    "intensity": "mixed-controlled"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.3,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Descending ladder interval 3 of 4",
    "role": "work",
    "distanceKm": 0.8142857142857142,
    "pace": "4:08/km to 4:18/km",
    "paceSeconds": 252.93911401637914,
    "intensity": "mixed-controlled"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.29999999999999993,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Descending ladder interval 4 of 4",
    "role": "work",
    "distanceKm": 0.5428571428571427,
    "pace": "4:04/km to 4:14/km",
    "paceSeconds": 249.40867102456872,
    "intensity": "mixed-controlled"
  },
  {
    "label": "Cool-down",
    "role": "easy",
    "distanceKm": 1.45,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 38, "max": 43}`.

2000 m warm-up + 1357 m descending ladder interval 1 of 4 + 300 m easy recovery + 1086 m descending ladder interval 2 of 4 + 300 m easy recovery + 814 m descending ladder interval 3 of 4 + 300 m easy recovery + 543 m descending ladder interval 4 of 4 + 1450 m cool-down

Shorten repetitions with controlled faster running towards the finish. Work and recovery distances stay within the approved session budget. Short repetitions are controlled, not sprints.

Shorten repetitions with controlled faster running towards the finish.

### 2026-12-10 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 77,
  "runMinutes": 50,
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
      "totalMinutes": 77,
      "capMinutes": 80
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
| Deadlift | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 50 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 8.15 km; duration: 50 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 8.15,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 42, "max": 50}`.

8150 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2026-12-11 / Fri — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 50,
  "runMinutes": 50,
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
      "totalMinutes": 50,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 8.15 km; duration: 50 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 8.15,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 42, "max": 50}`.

8150 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

### 2026-12-13 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 91,
  "runMinutes": 91,
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
      "totalMinutes": 91,
      "capMinutes": 110
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 14.95 km; duration: 91 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 14.95,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 77, "max": 91}`.

14950 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

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

Priority: Running. Running phase: Development. Calendar feasible: **True**. Review required: **False**. Feasibility describes scheduling, not athlete readiness.

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
      "capMinutes": 70
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
| Squat | 2 × 3 | 82.5 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 50 | 7.5 | straight / maintenance |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2026-12-15 / Tue — Controlled threshold repeats

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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

Role: quality-run; distance: 8.4 km; duration: 45 min; RPE: 7; pace: 4:20/km to 4:30/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Warm-up",
    "role": "easy",
    "distanceKm": 2,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Threshold interval 1 of 4",
    "role": "work",
    "distanceKm": 1,
    "pace": "4:20/km to 4:30/km",
    "paceSeconds": 264.8336165940605,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.3,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Threshold interval 2 of 4",
    "role": "work",
    "distanceKm": 1,
    "pace": "4:20/km to 4:30/km",
    "paceSeconds": 264.8336165940605,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.3,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Threshold interval 3 of 4",
    "role": "work",
    "distanceKm": 1,
    "pace": "4:20/km to 4:30/km",
    "paceSeconds": 264.8336165940605,
    "intensity": "threshold"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.29999999999999993,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Threshold interval 4 of 4",
    "role": "work",
    "distanceKm": 1,
    "pace": "4:20/km to 4:30/km",
    "paceSeconds": 264.8336165940605,
    "intensity": "threshold"
  },
  {
    "label": "Cool-down",
    "role": "easy",
    "distanceKm": 1.5,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 40, "max": 45}`.

2000 m warm-up + 1000 m threshold interval 1 of 4 + 300 m easy recovery + 1000 m threshold interval 2 of 4 + 300 m easy recovery + 1000 m threshold interval 3 of 4 + 300 m easy recovery + 1000 m threshold interval 4 of 4 + 1500 m cool-down

Accumulate controlled sustained work at estimated current threshold. Work and recovery distances stay within the approved session budget. Short repetitions are controlled, not sprints.

Accumulate controlled sustained work at estimated current threshold.

### 2026-12-17 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 78,
  "runMinutes": 51,
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
      "totalMinutes": 78,
      "capMinutes": 80
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
| Deadlift | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 50 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 8.4 km; duration: 51 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 8.4,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 43, "max": 51}`.

8400 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2026-12-18 / Fri — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 51,
  "runMinutes": 51,
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
      "totalMinutes": 51,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 8.35 km; duration: 51 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 8.35,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 43, "max": 51}`.

8350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

### 2026-12-20 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 94,
  "runMinutes": 94,
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
      "totalMinutes": 94,
      "capMinutes": 110
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 15.4 km; duration: 94 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 15.4,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 79, "max": 94}`.

15400 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

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


## Week 8 — Development

Priority: Running. Running phase: Development. Calendar feasible: **True**. Review required: **False**. Feasibility describes scheduling, not athlete readiness.

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
      "capMinutes": 70
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
| Squat | 2 × 3 | 82.5 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 50 | 7.5 | straight / maintenance |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2026-12-22 / Tue — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 42,
  "runMinutes": 42,
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
      "totalMinutes": 42,
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

Role: easy-run; distance: 6.9 km; duration: 42 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.9,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 36, "max": 42}`.

6900 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Running recovery week: reduced running volume.

### 2026-12-24 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 69,
  "runMinutes": 42,
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
      "totalMinutes": 69,
      "capMinutes": 80
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
| Deadlift | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 50 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 6.9 km; duration: 42 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.9,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 36, "max": 42}`.

6900 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Running recovery week: reduced running volume.

### 2026-12-25 / Fri — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 42,
  "runMinutes": 42,
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
      "totalMinutes": 42,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 6.85 km; duration: 42 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.85,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 36, "max": 42}`.

6850 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Running recovery week: reduced running volume.

### 2026-12-27 / Sun — Long aerobic run

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
      "capMinutes": 110
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 12.6 km; duration: 77 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 12.6,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 65, "max": 77}`.

12600 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Running recovery week: reduced running volume.

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


## Week 9 — Development

Priority: Running. Running phase: Development. Calendar feasible: **True**. Review required: **False**. Feasibility describes scheduling, not athlete readiness.

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
      "capMinutes": 70
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
| Squat | 2 × 3 | 82.5 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 50 | 7.5 | straight / maintenance |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2026-12-29 / Tue — Race-pace repeats

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 46,
  "runMinutes": 46,
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
      "totalMinutes": 46,
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

Role: quality-run; distance: 8.65 km; duration: 46 min; RPE: 7; pace: 4:15/km to 4:25/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Warm-up",
    "role": "easy",
    "distanceKm": 2,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Race-pace interval 1 of 4",
    "role": "work",
    "distanceKm": 1,
    "pace": "4:15/km to 4:25/km",
    "paceSeconds": 260,
    "intensity": "race-pace"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.3,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Race-pace interval 2 of 4",
    "role": "work",
    "distanceKm": 1,
    "pace": "4:15/km to 4:25/km",
    "paceSeconds": 260,
    "intensity": "race-pace"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.3,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Race-pace interval 3 of 4",
    "role": "work",
    "distanceKm": 1,
    "pace": "4:15/km to 4:25/km",
    "paceSeconds": 260,
    "intensity": "race-pace"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.29999999999999993,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Race-pace interval 4 of 4",
    "role": "work",
    "distanceKm": 1,
    "pace": "4:15/km to 4:25/km",
    "paceSeconds": 260,
    "intensity": "race-pace"
  },
  {
    "label": "Easy aerobic running",
    "role": "easy",
    "distanceKm": 0.25,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Cool-down",
    "role": "easy",
    "distanceKm": 1.5,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 41, "max": 46}`.

2000 m warm-up + 1000 m race-pace interval 1 of 4 + 300 m easy recovery + 1000 m race-pace interval 2 of 4 + 300 m easy recovery + 1000 m race-pace interval 3 of 4 + 300 m easy recovery + 1000 m race-pace interval 4 of 4 + 250 m easy aerobic running + 1500 m cool-down

Practise event rhythm supported by current performance. Work and recovery distances stay within the approved session budget. Short repetitions are controlled, not sprints.

Practise event rhythm supported by current performance.

### 2026-12-31 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 80,
  "runMinutes": 53,
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
      "totalMinutes": 80,
      "capMinutes": 80
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
| Deadlift | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 50 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 8.65 km; duration: 53 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 8.65,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 45, "max": 53}`.

8650 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2027-01-01 / Fri — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 53,
  "runMinutes": 53,
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
      "totalMinutes": 53,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 8.65 km; duration: 53 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 8.65,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 45, "max": 53}`.

8650 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

### 2027-01-03 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 97,
  "runMinutes": 97,
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
      "totalMinutes": 97,
      "capMinutes": 110
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 15.85 km; duration: 97 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 15.85,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 82, "max": 97}`.

15850 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

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


## Week 10 — Development

Priority: Running. Running phase: Development. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

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
      "capMinutes": 70
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
| Squat | 1 × 3 | 82.5 | 6 | straight / maintenance |
| Bench | 1 × 3 | 50 | 6 | straight / maintenance |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2027-01-05 / Tue — Race-pace repeats

Strength maintenance: reduced volume without planned load escalation. Planned recovery within the training block. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 48,
  "runMinutes": 48,
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
      "totalMinutes": 48,
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

Role: quality-run; distance: 9 km; duration: 48 min; RPE: 7; pace: 4:15/km to 4:25/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Warm-up",
    "role": "easy",
    "distanceKm": 2,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Race-pace interval 1 of 4",
    "role": "work",
    "distanceKm": 1,
    "pace": "4:15/km to 4:25/km",
    "paceSeconds": 260,
    "intensity": "race-pace"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.3,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Race-pace interval 2 of 4",
    "role": "work",
    "distanceKm": 1,
    "pace": "4:15/km to 4:25/km",
    "paceSeconds": 260,
    "intensity": "race-pace"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.3,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Race-pace interval 3 of 4",
    "role": "work",
    "distanceKm": 1,
    "pace": "4:15/km to 4:25/km",
    "paceSeconds": 260,
    "intensity": "race-pace"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.29999999999999993,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Race-pace interval 4 of 4",
    "role": "work",
    "distanceKm": 1,
    "pace": "4:15/km to 4:25/km",
    "paceSeconds": 260,
    "intensity": "race-pace"
  },
  {
    "label": "Easy aerobic running",
    "role": "easy",
    "distanceKm": 0.6,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Cool-down",
    "role": "easy",
    "distanceKm": 1.5,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 43, "max": 48}`.

2000 m warm-up + 1000 m race-pace interval 1 of 4 + 300 m easy recovery + 1000 m race-pace interval 2 of 4 + 300 m easy recovery + 1000 m race-pace interval 3 of 4 + 300 m easy recovery + 1000 m race-pace interval 4 of 4 + 600 m easy aerobic running + 1500 m cool-down

Practise event rhythm supported by current performance. Work and recovery distances stay within the approved session budget. Short repetitions are controlled, not sprints.

Practise event rhythm supported by current performance.

hybridNotes:

- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2027-01-07 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Planned recovery within the training block. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 77,
  "runMinutes": 55,
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
      "totalMinutes": 77,
      "capMinutes": 80
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
| Deadlift | 1 × 3 | 105 | 6 | straight / maintenance |
| Bench | 1 × 3 | 50 | 6 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 9 km; duration: 55 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 9,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

9000 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2027-01-08 / Fri — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Planned recovery within the training block. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 55,
  "runMinutes": 55,
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
      "totalMinutes": 55,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 9.05 km; duration: 55 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 9.05,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

9050 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2027-01-10 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Planned recovery within the training block. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 98,
  "runMinutes": 98,
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
      "totalMinutes": 98,
      "capMinutes": 110
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 16 km; duration: 98 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 16,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 82, "max": 98}`.

16000 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

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


## Week 11 — Development

Priority: Running. Running phase: Development. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

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
      "capMinutes": 70
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
| Squat | 2 × 3 | 82.5 | 7.5 | straight / maintenance |
| Lying leg curl | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 50 | 7.5 | straight / maintenance |
| Cable fly | 1 × 12 | uncalibrated | 6 |  /  |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lying leg curl (10–12 reps): Block 3: Hamstring maintenance. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

### 2027-01-12 / Tue — Race-pace repeats

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 51,
  "runMinutes": 51,
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
      "totalMinutes": 51,
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

Role: quality-run; distance: 9.45 km; duration: 51 min; RPE: 7; pace: 4:15/km to 4:25/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Warm-up",
    "role": "easy",
    "distanceKm": 2,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Race-pace interval 1 of 4",
    "role": "work",
    "distanceKm": 1,
    "pace": "4:15/km to 4:25/km",
    "paceSeconds": 260,
    "intensity": "race-pace"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.3,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Race-pace interval 2 of 4",
    "role": "work",
    "distanceKm": 1,
    "pace": "4:15/km to 4:25/km",
    "paceSeconds": 260,
    "intensity": "race-pace"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.3,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Race-pace interval 3 of 4",
    "role": "work",
    "distanceKm": 1,
    "pace": "4:15/km to 4:25/km",
    "paceSeconds": 260,
    "intensity": "race-pace"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.29999999999999993,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Race-pace interval 4 of 4",
    "role": "work",
    "distanceKm": 1,
    "pace": "4:15/km to 4:25/km",
    "paceSeconds": 260,
    "intensity": "race-pace"
  },
  {
    "label": "Easy aerobic running",
    "role": "easy",
    "distanceKm": 1.05,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Cool-down",
    "role": "easy",
    "distanceKm": 1.5,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 45, "max": 51}`.

2000 m warm-up + 1000 m race-pace interval 1 of 4 + 300 m easy recovery + 1000 m race-pace interval 2 of 4 + 300 m easy recovery + 1000 m race-pace interval 3 of 4 + 300 m easy recovery + 1000 m race-pace interval 4 of 4 + 1050 m easy aerobic running + 1500 m cool-down

Practise event rhythm supported by current performance. Work and recovery distances stay within the approved session budget. Short repetitions are controlled, not sprints.

Practise event rhythm supported by current performance.

hybridNotes:

- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2027-01-14 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 80,
  "runMinutes": 53,
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
      "totalMinutes": 80,
      "capMinutes": 80
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Reduced supporting work: Cable fly one set",
    "Shortened supporting easy running by 0.71 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 50 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 8.736 km; duration: 53 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 8.736,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 45, "max": 53}`.

8736 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 0.714 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

hybridNotes:

- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2027-01-15 / Fri — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 9.45 km; duration: 58 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 9.45,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 49, "max": 58}`.

9450 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2027-01-17 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 98,
  "runMinutes": 98,
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
      "totalMinutes": 98,
      "capMinutes": 110
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 16 km; duration: 98 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 16,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 82, "max": 98}`.

16000 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

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


## Week 12 — Development

Priority: Running. Running phase: Taper / event. Calendar feasible: **True**. Review required: **False**. Feasibility describes scheduling, not athlete readiness.

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
      "capMinutes": 70
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
| Squat | 2 × 3 | 82.5 | 7.5 | straight / maintenance |
| Lying leg curl | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 50 | 7.5 | straight / maintenance |
| Cable fly | 1 × 12 | uncalibrated | 6 |  /  |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lying leg curl (10–12 reps): Block 3: Hamstring maintenance. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

### 2027-01-19 / Tue — Taper race-rhythm reminder

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 15,
  "runMinutes": 15,
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
      "totalMinutes": 15,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Taper race-rhythm reminder

Role: quality-run; distance: 2.6 km; duration: 15 min; RPE: 7; pace: 4:15/km to 4:25/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Warm-up",
    "role": "easy",
    "distanceKm": 0.8,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Current-fitness race rhythm 1 of 2",
    "role": "work",
    "distanceKm": 0.25,
    "paceSeconds": 260,
    "pace": "4:15/km to 4:25/km"
  },
  {
    "label": "Easy recovery",
    "role": "recovery",
    "distanceKm": 0.2,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Current-fitness race rhythm 2 of 2",
    "role": "work",
    "distanceKm": 0.25,
    "paceSeconds": 260,
    "pace": "4:15/km to 4:25/km"
  },
  {
    "label": "Easy aerobic running",
    "role": "easy",
    "distanceKm": 0.6,
    "pace": "5:07/km to 6:04/km"
  },
  {
    "label": "Cool-down",
    "role": "easy",
    "distanceKm": 0.5,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 13, "max": 15}`.

800 m warm-up + 250 m current-fitness race rhythm 1 of 2 + 200 m easy recovery + 250 m current-fitness race rhythm 2 of 2 + 600 m easy aerobic running + 500 m cool-down

A short current-fitness pace reminder inside reduced easy volume; finish fresh, with no extra repetitions or faster goal-pace testing.

hybridNotes:

- Running event taper: reduced running volume.

### 2027-01-21 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 59,
  "runMinutes": 29,
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
      "totalMinutes": 58.5,
      "capMinutes": 80
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
| Deadlift | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 50 | 7.5 | straight / maintenance |
| Cable fly | 1 × 12 | uncalibrated | 6 |  /  |

#### Easy aerobic run

Role: easy-run; distance: 4.75 km; duration: 29 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 4.75,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 25, "max": 29}`.

4750 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

hybridNotes:

- Running event taper: reduced running volume.

### 2027-01-22 / Fri — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 16,
  "runMinutes": 16,
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
      "totalMinutes": 16,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 2.6 km; duration: 16 min; RPE: 3.5; pace: 5:07/km to 6:04/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 2.6,
    "pace": "5:07/km to 6:04/km"
  }
]
```

Duration range: `{"min": 14, "max": 16}`.

2600 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Running event taper: reduced running volume.

### 2027-01-24 / Sunday — Running event

Competition replaces scheduled training.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 44,
  "event": true,
  "confirmed": true,
  "includesWarmups": false,
  "includesRest": false,
  "includesTransitions": false
}
```

Event permission: `{"confirmed": true, "explicit": true, "estimatedMinutes": 44, "logisticsMinutes": null}`

#### 10 km race

Role: race; distance: 10 km; duration: 44 min; RPE: unknown; pace: 4:15/km to 4:25/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Race distance",
    "distanceKm": 10,
    "pace": "4:15/km to 4:25/km"
  }
]
```

Duration range: `{"min": 43, "max": 44}`.

Race distance is separate from taper training. Pace is an estimate from the current PB, not a promised race outcome.

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
