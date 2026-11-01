# T — Keiko: Marathon preparation under persistent lower-body fatigue

**Synthetic native output / coaching review copy / not an activated programme.**

NOT APPROVED: affected maintenance lifting does not respond to fatigue; estimated race time exceeds the explicit event allowance.

All 18 weeks are expanded below. Raw `T.json` preserves every native field and provenance without rounding; displays below round distances to three decimals. Suggested loads require warm-up calibration; an uncalibrated value is not a zero-kg prescription. No session has been hand-corrected.

Frozen input SHA256: `5a0e83d10a5aab146db43ad2d7170be0cd2ff97888de412a809161099a4e190a`. Captured commit: `988d74120d63b0abb5c070afa1cb6bd91f4d81ae`; engine-source hashes are in the raw capture.

## Athlete facts

```json
{
  "id": "T",
  "name": "Keiko",
  "label": "Marathon preparation under persistent lower-body fatigue",
  "priority": "Running",
  "training_age": "intermediate",
  "goals": [
    {
      "sport": "running",
      "distance_km": 42.195,
      "date": "2027-03-07"
    }
  ],
  "strength": {
    "observations": {
      "Squat": {
        "kg": 135,
        "reps": 1,
        "tested_single": true
      },
      "Bench": {
        "kg": 90,
        "reps": 1,
        "tested_single": true
      },
      "Deadlift": {
        "kg": 165,
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
      "distance_km": 21.0975,
      "seconds": 7080,
      "effort": "performance",
      "date": "2026-10-24"
    },
    "weekly_km_history": [
      40,
      42,
      44,
      43,
      45,
      46
    ],
    "long_run": {
      "km": 20,
      "minutes": 128,
      "recovery_hours": 96
    },
    "requested_runs_per_week": 4
  },
  "availability": {
    "strengthVisits": 2,
    "minutes": {
      "Mon": 75,
      "Tue": 90,
      "Thu": 75,
      "Sat": 105,
      "Sun": 190
    },
    "combinedDays": [
      "Mon",
      "Thu"
    ],
    "separateDays": [],
    "separateMinutes": {},
    "minimumGapHours": 0,
    "eventDays": {
      "2027-03-07": {
        "confirmed": true,
        "minutes": 240
      }
    }
  },
  "health_context": "Fictional, pain-free, no illness or medical rehabilitation. Future adaptation and event results are unknown.",
  "training_history": "Four years running, two completed half marathons, three years lifting. A 3:45 marathon aspiration is negotiable and must not set current-fitness paces.",
  "recovery_constraints": {
    "status": "accumulating-fatigue",
    "affectedLifts": [
      "Squat",
      "Deadlift"
    ],
    "baselineRpe": 7,
    "recentRpe": 9,
    "repeatCount": 2,
    "sleepHours": 5.5,
    "usualSleepHours": 7.5,
    "observedAt": "2026-10-29",
    "lifts": [
      {
        "lift": "Squat",
        "weight": 100,
        "reps": 5,
        "rpe": 9,
        "baselineRpe": 7,
        "repeatCount": 2
      },
      {
        "lift": "Deadlift",
        "weight": 125,
        "reps": 5,
        "rpe": 9,
        "baselineRpe": 7,
        "repeatCount": 2
      }
    ]
  },
  "long_run_context": "Normal leg recovery after the recent 20 km took 96 hours. Shift work has cut sleep from usual 7.5 to 5.5 hours; no pain, illness or dated recovery clearance."
}
```

## Full horizon

| Week | Priority | Running phase | Training km (race excluded) | Calendar feasible |
|---|---|---|---|---|
| 1 | Running | Aerobic foundation | 28.364 | True |
| 2 | Running | Aerobic foundation | 28.364 | True |
| 3 | Running | Aerobic foundation | 28.364 | True |
| 4 | Running | Aerobic foundation | 28.364 | True |
| 5 | Running | Development | 29.032 | True |
| 6 | Running | Development | 28.364 | True |
| 7 | Running | Development | 28.364 | True |
| 8 | Running | Specific preparation | 28.364 | True |
| 9 | Running | Specific preparation | 28.364 | True |
| 10 | Running | Specific preparation | 29.032 | True |
| 11 | Running | Specific preparation | 28.364 | True |
| 12 | Running | Specific preparation | 28.364 | True |
| 13 | Running | Specific preparation | 28.364 | True |
| 14 | Running | Specific preparation | 28.364 | True |
| 15 | Running | Specific preparation | 29.032 | True |
| 16 | Running | Taper / event | 28.364 | True |
| 17 | Running | Taper / event | 29.032 | True |
| 18 | Running | Taper / event | 10.95 | True |

## Week 1 — Foundation

Priority: Running. Running phase: Aerobic foundation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
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
      "capMinutes": 75
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
| Squat | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Seated leg curl | 1 × 12 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |
| Triceps pushdown | 1 × 12 | uncalibrated | 6 |  /  |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Seated leg curl (12–14 reps): Block 1: Hamstring hypertrophy. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Triceps pushdown (12–14 reps): Block 1: Triceps capacity. Choose initial load by RPE; aim to add reps before weight.

### 2026-11-03 / Tue — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

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

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-11-05 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 48,
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
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Reduced supporting work: Lat pulldown one set",
    "Shortened supporting easy running by 0.89 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 127.5 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 6.414 km; duration: 48 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.414,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

6414 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 0.886 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lat pulldown (10–12 reps): Block 1: Upper-back support. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2026-11-07 / Sat — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

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
      "capMinutes": 105
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-11-08 / Sun — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

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
      "capMinutes": 190
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.35 km; duration: 56 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.35,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 56}`.

7350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
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

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
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
      "capMinutes": 75
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
| Squat | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Seated leg curl | 1 × 12 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |
| Triceps pushdown | 1 × 12 | uncalibrated | 6 |  /  |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Seated leg curl (12–14 reps): Block 1: Hamstring hypertrophy. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Triceps pushdown (12–14 reps): Block 1: Triceps capacity. Choose initial load by RPE; aim to add reps before weight.

### 2026-11-10 / Tue — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

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

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-11-12 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 48,
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
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Reduced supporting work: Lat pulldown one set",
    "Shortened supporting easy running by 0.89 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 127.5 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 6.414 km; duration: 48 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.414,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

6414 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 0.886 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lat pulldown (10–12 reps): Block 1: Upper-back support. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2026-11-14 / Sat — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

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
      "capMinutes": 105
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-11-15 / Sun — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

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
      "capMinutes": 190
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.35 km; duration: 56 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.35,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 56}`.

7350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
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

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
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
      "capMinutes": 75
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
| Squat | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Seated leg curl | 1 × 12 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |
| Triceps pushdown | 1 × 12 | uncalibrated | 6 |  /  |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Seated leg curl (12–14 reps): Block 1: Hamstring hypertrophy. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Triceps pushdown (12–14 reps): Block 1: Triceps capacity. Choose initial load by RPE; aim to add reps before weight.

### 2026-11-17 / Tue — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

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

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-11-19 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 48,
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
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Reduced supporting work: Lat pulldown one set",
    "Shortened supporting easy running by 0.89 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 127.5 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 6.414 km; duration: 48 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.414,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

6414 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 0.886 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lat pulldown (10–12 reps): Block 1: Upper-back support. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2026-11-21 / Sat — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

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
      "capMinutes": 105
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-11-22 / Sun — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

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
      "capMinutes": 190
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.35 km; duration: 56 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.35,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 56}`.

7350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
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

Priority: Running. Running phase: Aerobic foundation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

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
      "capMinutes": 75
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
| Squat | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Seated leg curl | 1 × 12 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |
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

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Running recovery week: reduced running volume.

### 2026-11-26 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 48,
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
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Reduced supporting work: Lat pulldown one set",
    "Shortened supporting easy running by 0.89 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 127.5 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 6.414 km; duration: 48 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.414,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

6414 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 0.886 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lat pulldown (10–12 reps): Block 1: Upper-back support. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Running recovery week: reduced running volume.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2026-11-28 / Sat — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

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
      "capMinutes": 105
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Running recovery week: reduced running volume.

### 2026-11-29 / Sun — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

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
      "capMinutes": 190
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.35 km; duration: 56 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.35,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 56}`.

7350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
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

Priority: Running. Running phase: Development. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

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
      "capMinutes": 75
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
| Squat | 1 × 3 | 105 | 6 | straight / maintenance |
| Seated leg curl | 1 × 12 | uncalibrated | 6 |  /  |
| Bench | 1 × 3 | 70 | 6 | straight / maintenance |
| Triceps pushdown | 1 × 12 | uncalibrated | 6 |  /  |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Seated leg curl (12–14 reps): Block 1: Hamstring hypertrophy. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Triceps pushdown (12–14 reps): Block 1: Triceps capacity. Choose initial load by RPE; aim to add reps before weight.

### 2026-12-01 / Tue — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Reduced volume separates Foundation from Development. Build repeatable technique and capacity. Running is the protected priority.

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

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-12-03 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Reduced volume separates Foundation from Development. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 53,
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
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Reduced supporting work: Lat pulldown one set",
    "Shortened supporting easy running by 0.22 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 1 × 3 | 127.5 | 6 | straight / maintenance |
| Bench | 1 × 3 | 70 | 6 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 7.082 km; duration: 53 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.082,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 45, "max": 53}`.

7082 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 0.218 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lat pulldown (10–12 reps): Block 1: Upper-back support. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2026-12-05 / Sat — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Reduced volume separates Foundation from Development. Build repeatable technique and capacity. Running is the protected priority.

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
      "capMinutes": 105
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-12-06 / Sun — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Reduced volume separates Foundation from Development. Build repeatable technique and capacity. Running is the protected priority.

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
      "capMinutes": 190
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.35 km; duration: 56 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.35,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 56}`.

7350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
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


## Week 6 — Development

Priority: Running. Running phase: Development. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

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
      "capMinutes": 75
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
| Squat | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2026-12-08 / Tue — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-12-10 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 48,
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
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Shortened supporting easy running by 0.89 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 127.5 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 6.414 km; duration: 48 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.414,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

6414 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 0.886 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2026-12-12 / Sat — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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
      "capMinutes": 105
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-12-13 / Sun — Easy aerobic run

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
      "capMinutes": 190
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.35 km; duration: 56 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.35,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 56}`.

7350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
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

Priority: Running. Running phase: Development. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

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
      "capMinutes": 75
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
| Squat | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2026-12-15 / Tue — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-12-17 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 48,
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
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Shortened supporting easy running by 0.89 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 127.5 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 6.414 km; duration: 48 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.414,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

6414 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 0.886 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2026-12-19 / Sat — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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
      "capMinutes": 105
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2026-12-20 / Sun — Easy aerobic run

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
      "capMinutes": 190
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.35 km; duration: 56 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.35,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 56}`.

7350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
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


## Week 8 — Development

Priority: Running. Running phase: Specific preparation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

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
      "capMinutes": 75
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
| Squat | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2026-12-22 / Tue — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Running recovery week: reduced running volume.

### 2026-12-24 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 48,
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
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Shortened supporting easy running by 0.89 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 127.5 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 6.414 km; duration: 48 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.414,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

6414 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 0.886 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Running recovery week: reduced running volume.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2026-12-26 / Sat — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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
      "capMinutes": 105
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Running recovery week: reduced running volume.

### 2026-12-27 / Sun — Easy aerobic run

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
      "capMinutes": 190
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.35 km; duration: 56 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.35,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 56}`.

7350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
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

Priority: Running. Running phase: Specific preparation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

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
      "capMinutes": 75
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
| Squat | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2026-12-29 / Tue — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

### 2026-12-31 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 48,
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
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Shortened supporting easy running by 0.89 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 127.5 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 6.414 km; duration: 48 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.414,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

6414 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 0.886 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2027-01-02 / Sat — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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
      "capMinutes": 105
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

### 2027-01-03 / Sun — Easy aerobic run

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
      "capMinutes": 190
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.35 km; duration: 56 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.35,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 56}`.

7350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

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

Priority: Running. Running phase: Specific preparation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

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
      "capMinutes": 75
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
| Squat | 1 × 3 | 105 | 6 | straight / maintenance |
| Bench | 1 × 3 | 70 | 6 | straight / maintenance |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

### 2027-01-05 / Tue — Easy aerobic run

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

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

### 2027-01-07 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Planned recovery within the training block. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 53,
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
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Shortened supporting easy running by 0.22 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 1 × 3 | 127.5 | 6 | straight / maintenance |
| Bench | 1 × 3 | 70 | 6 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 7.082 km; duration: 53 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.082,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 45, "max": 53}`.

7082 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 0.218 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2027-01-09 / Sat — Easy aerobic run

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
      "capMinutes": 105
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

### 2027-01-10 / Sun — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Planned recovery within the training block. Progress productive workload with manageable effort. Running is the protected priority.

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
      "capMinutes": 190
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.35 km; duration: 56 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.35,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 56}`.

7350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

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

Priority: Running. Running phase: Specific preparation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

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
      "capMinutes": 75
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
| Squat | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Lying leg curl | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |
| Cable fly | 1 × 12 | uncalibrated | 6 |  /  |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lying leg curl (10–12 reps): Block 3: Hamstring maintenance. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

### 2027-01-12 / Tue — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

### 2027-01-14 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 48,
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
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Reduced supporting work: Cable fly one set",
    "Shortened supporting easy running by 0.89 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 127.5 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 6.414 km; duration: 48 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.414,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

6414 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 0.886 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2027-01-16 / Sat — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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
      "capMinutes": 105
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

### 2027-01-17 / Sun — Easy aerobic run

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
      "capMinutes": 190
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.35 km; duration: 56 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.35,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 56}`.

7350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

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

Priority: Running. Running phase: Specific preparation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

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
      "capMinutes": 75
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
| Squat | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Lying leg curl | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |
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

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Running recovery week: reduced running volume.

### 2027-01-21 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 48,
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
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Reduced supporting work: Cable fly one set",
    "Shortened supporting easy running by 0.89 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 127.5 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 6.414 km; duration: 48 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.414,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

6414 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 0.886 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Running recovery week: reduced running volume.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2027-01-23 / Sat — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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
      "capMinutes": 105
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Running recovery week: reduced running volume.

### 2027-01-24 / Sun — Easy aerobic run

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
      "capMinutes": 190
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.35 km; duration: 56 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.35,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 56}`.

7350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
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


## Week 13 — Development

Priority: Running. Running phase: Specific preparation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

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
      "capMinutes": 75
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
| Squat | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Lying leg curl | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |
| Cable fly | 1 × 12 | uncalibrated | 6 |  /  |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lying leg curl (10–12 reps): Block 3: Hamstring maintenance. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

### 2027-01-26 / Tue — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

### 2027-01-28 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 48,
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
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Reduced supporting work: Cable fly one set",
    "Shortened supporting easy running by 0.89 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 127.5 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 6.414 km; duration: 48 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.414,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

6414 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 0.886 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2027-01-30 / Sat — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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
      "capMinutes": 105
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

### 2027-01-31 / Sun — Easy aerobic run

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
      "capMinutes": 190
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.35 km; duration: 56 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.35,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 56}`.

7350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

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


## Week 14 — Development

Priority: Running. Running phase: Specific preparation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

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
      "capMinutes": 75
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
| Squat | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Lying leg curl | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |
| Cable fly | 1 × 12 | uncalibrated | 6 |  /  |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lying leg curl (10–12 reps): Block 3: Hamstring maintenance. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

### 2027-02-02 / Tue — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

### 2027-02-04 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 48,
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
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Reduced supporting work: Cable fly one set",
    "Shortened supporting easy running by 0.89 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 127.5 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 6.414 km; duration: 48 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.414,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

6414 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 0.886 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2027-02-06 / Sat — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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
      "capMinutes": 105
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

### 2027-02-07 / Sun — Easy aerobic run

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
      "capMinutes": 190
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.35 km; duration: 56 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.35,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 56}`.

7350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

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


## Week 15 — Development

Priority: Running. Running phase: Specific preparation. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

### 2027-02-08 / Mon — Squat + Bench

Strength maintenance: reduced volume without planned load escalation. Planned recovery within the training block. Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

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
      "capMinutes": 75
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
| Squat | 1 × 3 | 105 | 6 | straight / maintenance |
| Lying leg curl | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 1 × 3 | 70 | 6 | straight / maintenance |
| Cable fly | 1 × 12 | uncalibrated | 6 |  /  |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lying leg curl (10–12 reps): Block 3: Hamstring maintenance. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

### 2027-02-09 / Tue — Easy aerobic run

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

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

### 2027-02-11 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Planned recovery within the training block. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 53,
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
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Reduced supporting work: Cable fly one set",
    "Shortened supporting easy running by 0.22 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 1 × 3 | 127.5 | 6 | straight / maintenance |
| Bench | 1 × 3 | 70 | 6 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 7.082 km; duration: 53 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.082,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 45, "max": 53}`.

7082 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 0.218 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Cable fly (12–14 reps): Block 3: Chest maintenance. Choose initial load by RPE; aim to add reps before weight.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2027-02-13 / Sat — Easy aerobic run

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
      "capMinutes": 105
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

### 2027-02-14 / Sun — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Planned recovery within the training block. Progress productive workload with manageable effort. Running is the protected priority.

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
      "capMinutes": 190
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.35 km; duration: 56 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.35,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 56}`.

7350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Marathon endurance review: this specific block is not yet supported by substantial weekly mileage and long-run capacity. Review a completion-led run/walk approach, more suitable availability or the race date.

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


## Week 16 — Development

Priority: Running. Running phase: Taper / event. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2027-02-15 / Mon — Squat + Bench

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
      "capMinutes": 75
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
| Squat | 2 × 3 | 105 | 7.5 | straight / maintenance |
| Leg extension | 1 × 12 | uncalibrated | 6 |  /  |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |
| Lat pulldown | 1 × 10 | uncalibrated | 6 |  /  |

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Leg extension (12–14 reps): Block 4: Low-skill quad support. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lat pulldown (10–12 reps): Block 4: Low-fatigue upper-back support. Choose initial load by RPE; aim to add reps before weight.

### 2027-02-16 / Tue — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Running event taper: reduced running volume.

### 2027-02-18 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 48,
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
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Reduced supporting work: Lat pulldown one set",
    "Shortened supporting easy running by 0.89 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 3 | 127.5 | 7.5 | straight / maintenance |
| Bench | 2 × 3 | 70 | 7.5 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 6.414 km; duration: 48 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.414,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

6414 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 0.886 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lat pulldown (10–12 reps): Block 4: Low-fatigue back maintenance. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Running event taper: reduced running volume.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2027-02-20 / Sat — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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
      "capMinutes": 105
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Running event taper: reduced running volume.

### 2027-02-21 / Sun — Easy aerobic run

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
      "capMinutes": 190
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.35 km; duration: 56 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.35,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 56}`.

7350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Running event taper: reduced running volume.

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


## Week 17 — Development

Priority: Running. Running phase: Taper / event. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2027-02-22 / Mon — Squat + Bench

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
      "capMinutes": 75
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
| Squat | 1 × 3 | 75 | 5.5 | straight / technique |
| Bench | 1 × 3 | 57.5 | 6 | straight / technique |

variationNotes:

- Background strength reduced for the marathon taper. Preserve the race preparation; no block-phase rebound in support volume.
- Background strength reduced for the marathon taper. Preserve the race preparation; no block-phase rebound in support volume.

### 2027-02-23 / Tue — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Running event taper: reduced running volume.

### 2027-02-25 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 75,
  "runMinutes": 53,
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
      "totalMinutes": 75,
      "capMinutes": 75
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps.",
  "adjustments": [
    "Shortened supporting easy running by 0.22 km to fit the visit; work repetitions and recovery steps retained."
  ]
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 1 × 3 | 90 | 5.5 | straight / technique |
| Bench | 1 × 3 | 57.5 | 6 | straight / technique |

#### Easy aerobic run

Role: easy-run; distance: 7.082 km; duration: 53 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.082,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 45, "max": 53}`.

7082 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

Visit time limit: 0.218 km of easy running removed. Actual weekly volume must be reviewed from the final calendar; do not add it to the long run automatically.

variationNotes:

- Background strength reduced for the marathon taper. Preserve the race preparation; no block-phase rebound in support volume.
- Background strength reduced for the marathon taper. Preserve the race preparation; no block-phase rebound in support volume.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Running event taper: reduced running volume.
- Easy running shortened to fit the whole-visit time budget; all quality intervals and recoveries retained.
- Visit fit: supporting volume or easy running adjusted; designated main exposures and full rest periods retained.

### 2027-02-27 / Sat — Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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
      "capMinutes": 105
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.3 km; duration: 55 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.3,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 55}`.

7300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Running event taper: reduced running volume.

### 2027-02-28 / Sun — Easy aerobic run

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
      "capMinutes": 190
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 7.35 km; duration: 56 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 7.35,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 47, "max": 56}`.

7350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Running event taper: reduced running volume.

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


## Week 18 — Development

Priority: Running. Running phase: Taper / event. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.

### 2027-03-01 / Mon — Squat + Bench

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
      "capMinutes": 75
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
| Squat | 1 × 3 | 75 | 5.5 | straight / technique |
| Bench | 1 × 3 | 57.5 | 6 | straight / technique |

variationNotes:

- Background strength reduced for the marathon taper. Preserve the race preparation; no block-phase rebound in support volume.
- Background strength reduced for the marathon taper. Preserve the race preparation; no block-phase rebound in support volume.

### 2027-03-02 / Tue — Easy aerobic run

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

Role: easy-run; distance: 5.5 km; duration: 42 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 5.5,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 35, "max": 42}`.

5500 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Running event taper: reduced running volume.

### 2027-03-04 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

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
      "capMinutes": 75
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
| Deadlift | 1 × 3 | 90 | 5.5 | straight / technique |
| Bench | 1 × 3 | 57.5 | 6 | straight / technique |

#### Easy aerobic run

Role: easy-run; distance: 5.45 km; duration: 41 min; RPE: 3.5; pace: 6:19/km to 7:29/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 5.45,
    "pace": "6:19/km to 7:29/km"
  }
]
```

Duration range: `{"min": 35, "max": 41}`.

5450 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Background strength reduced for the marathon taper. Preserve the race preparation; no block-phase rebound in support volume.
- Background strength reduced for the marathon taper. Preserve the race preparation; no block-phase rebound in support volume.

hybridNotes:

- Lower-body fatigue remains unresolved: keep running easy with a reduced dose, and confirm recovery before restoring normal running volume. The week number does not clear this evidence.
- The recent long run required 96 hours of recovery. Review whether that dose is repeatable before extending it or adding quality; the observation remains unresolved rather than being cleared by the week number.
- Goal pace is faster than the current performance estimate. Quality uses current fitness; reassess after comparable training or a recent race.
- Long-run duration/history limits redistribute distance into supporting runs. Confirm those visits fit; do not silently add distance to the long run.
- Running event taper: reduced running volume.

### 2027-03-07 / Sunday — Running event

Competition replaces scheduled training.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 250,
  "event": true,
  "confirmed": true,
  "includesWarmups": false,
  "includesRest": false,
  "includesTransitions": false
}
```

Event permission: `{"confirmed": true, "explicit": true, "estimatedMinutes": 250, "logisticsMinutes": null}`

#### 42.2 km race

Role: race; distance: 42.195 km; duration: 250 min; RPE: unknown; pace: 5:45/km to 5:55/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Race distance",
    "distanceKm": 42.195,
    "pace": "5:45/km to 5:55/km"
  }
]
```

Duration range: `{"min": 243, "max": 250}`.

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
