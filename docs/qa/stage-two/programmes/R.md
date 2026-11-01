# R — Sofia: Returning novice preparing a first organised 5K

**Synthetic native output / coaching review copy / not an activated programme.**

BLOCKED DRAFT: running performance/duration is unconfirmed. Not an executable race programme.

All 8 weeks are expanded below. Raw `R.json` preserves every native field and provenance without rounding; displays below round distances to three decimals. Suggested loads require warm-up calibration; an uncalibrated value is not a zero-kg prescription. No session has been hand-corrected.

Frozen input SHA256: `5a0e83d10a5aab146db43ad2d7170be0cd2ff97888de412a809161099a4e190a`. Captured commit: `988d74120d63b0abb5c070afa1cb6bd91f4d81ae`; engine-source hashes are in the raw capture.

## Athlete facts

```json
{
  "id": "R",
  "name": "Sofia",
  "label": "Returning novice preparing a first organised 5K",
  "priority": "Running",
  "training_age": "returning",
  "goals": [
    {
      "sport": "running",
      "distance_km": 5,
      "date": "2026-12-26"
    }
  ],
  "strength": {
    "observations": {
      "Squat": {
        "kg": 40,
        "reps": 5,
        "tested_single": false
      },
      "Bench": {
        "kg": 25,
        "reps": 5,
        "tested_single": false
      },
      "Deadlift": {
        "kg": 55,
        "reps": 5,
        "tested_single": false
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
      "distance_km": 3,
      "seconds": 1380,
      "effort": "training",
      "date": "2026-10-24"
    },
    "weekly_km_history": [
      5,
      6,
      6,
      7,
      7,
      8
    ],
    "long_run": {
      "km": 4,
      "minutes": 35,
      "recovery_hours": 48
    },
    "requested_runs_per_week": 3
  },
  "availability": {
    "strengthVisits": 2,
    "minutes": {
      "Tue": 60,
      "Thu": 60,
      "Sun": 90
    },
    "combinedDays": [
      "Tue",
      "Thu"
    ],
    "separateDays": [],
    "separateMinutes": {},
    "minimumGapHours": 0,
    "eventDays": {
      "2026-12-26": {
        "confirmed": true,
        "minutes": 90,
        "logisticsMinutes": 20
      }
    }
  },
  "health_context": "Fictional, pain-free, no illness or medical rehabilitation. Future adaptation and event results are unknown.",
  "training_history": "Nine-month break, six weeks of consistent easy return; no previous organised race. Rep sets were submaximal observations, not max tests.",
  "recovery_constraints": "Recent longest run took 48 hours for normal leg recovery. Current movement and ordinary activity normal. No inferred race fitness from the training-paced 3 km."
}
```

## Full horizon

| Week | Priority | Running phase | Training km (race excluded) | Calendar feasible |
|---|---|---|---|---|
| 1 | Running | Aerobic foundation | 7 | False |
| 2 | Running | Aerobic foundation | 7.2 | False |
| 3 | Running | Aerobic foundation | 7.45 | False |
| 4 | Running | Aerobic foundation | 6.1 | False |
| 5 | Running | Development | 7.65 | False |
| 6 | Running | Development | 7.9 | False |
| 7 | Running | Development | 8.1 | False |
| 8 | Running | Taper / event | 1.55 | False |

## Week 1 — Foundation

Priority: Running. Running phase: Aerobic foundation. Calendar feasible: **False**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- You have 7 weekly activities across 3 available days. Several double-session days would be required.
- Enter a valid running PB and recent weekly distance.
- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
- Tue does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Thu does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Sun does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.

Activation blockers:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
- Tue does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Thu does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Sun does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.

### 2026-11-03 / Tue — Squat + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 34,
  "runMinutes": 0,
  "strengthMinutes": 31,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 12,
    "support": 5,
    "setup": 2,
    "total": 31
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 34,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 2 × 6 | 27.5 | 6 | straight / maintenance |
| Seated leg curl | 1 × 12 | uncalibrated | 6 |  /  |
| Bench | 2 × 6 | 17.5 | 6 | straight / maintenance |
| Triceps pushdown | 1 × 12 | uncalibrated | 6 |  /  |

#### Easy aerobic run

Role: easy-run; distance: 2.2 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 2.2,
    "pace": "Conversational easy effort"
  }
]
```

2200 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Seated leg curl (12–14 reps): Block 1: Hamstring hypertrophy. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Triceps pushdown (12–14 reps): Block 1: Triceps capacity. Choose initial load by RPE; aim to add reps before weight.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.

### 2026-11-05 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 32,
  "runMinutes": 0,
  "strengthMinutes": 28.5,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 12,
    "support": 2.5,
    "setup": 2,
    "total": 28.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 31.5,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 6 | 37.5 | 6 | straight / maintenance |
| Lat pulldown | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 2 × 6 | 17.5 | 6 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 2.15 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 2.15,
    "pace": "Conversational easy effort"
  }
]
```

2150 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lat pulldown (10–12 reps): Block 1: Upper-back support. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.

### 2026-11-08 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 0,
  "runMinutes": 0,
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
      "totalMinutes": 0,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 2.65 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 2.65,
    "pace": "Conversational easy effort"
  }
]
```

2650 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.

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

Priority: Running. Running phase: Aerobic foundation. Calendar feasible: **False**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- You have 7 weekly activities across 3 available days. Several double-session days would be required.
- Enter a valid running PB and recent weekly distance.
- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
- Tue does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Thu does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Sun does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.

Activation blockers:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
- Tue does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Thu does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Sun does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.

### 2026-11-10 / Tue — Squat + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 34,
  "runMinutes": 0,
  "strengthMinutes": 31,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 12,
    "support": 5,
    "setup": 2,
    "total": 31
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 34,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 2 × 6 | 27.5 | 6 | straight / maintenance |
| Seated leg curl | 1 × 12 | uncalibrated | 6 |  /  |
| Bench | 2 × 6 | 17.5 | 6 | straight / maintenance |
| Triceps pushdown | 1 × 12 | uncalibrated | 6 |  /  |

#### Easy aerobic run

Role: easy-run; distance: 2.25 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 2.25,
    "pace": "Conversational easy effort"
  }
]
```

2250 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Seated leg curl (12–14 reps): Block 1: Hamstring hypertrophy. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Triceps pushdown (12–14 reps): Block 1: Triceps capacity. Choose initial load by RPE; aim to add reps before weight.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.

### 2026-11-12 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 32,
  "runMinutes": 0,
  "strengthMinutes": 28.5,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 12,
    "support": 2.5,
    "setup": 2,
    "total": 28.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 31.5,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 2 × 6 | 37.5 | 6 | straight / maintenance |
| Lat pulldown | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 2 × 6 | 17.5 | 6 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 2.25 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 2.25,
    "pace": "Conversational easy effort"
  }
]
```

2250 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lat pulldown (10–12 reps): Block 1: Upper-back support. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.

### 2026-11-15 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 0,
  "runMinutes": 0,
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
      "totalMinutes": 0,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 2.7 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 2.7,
    "pace": "Conversational easy effort"
  }
]
```

2700 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.

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

Priority: Running. Running phase: Aerobic foundation. Calendar feasible: **False**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- You have 7 weekly activities across 3 available days. Several double-session days would be required.
- Enter a valid running PB and recent weekly distance.
- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
- Tue does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Thu does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Sun does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.

Activation blockers:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
- Tue does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Thu does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Sun does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.

### 2026-11-17 / Tue — Squat + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 40,
  "runMinutes": 0,
  "strengthMinutes": 37,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 18,
    "support": 5,
    "setup": 2,
    "total": 37
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 40,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 3 × 6 | 30 | 7 | straight / maintenance |
| Seated leg curl | 1 × 12 | uncalibrated | 6 |  /  |
| Bench | 3 × 6 | 17.5 | 7 | straight / maintenance |
| Triceps pushdown | 1 × 12 | uncalibrated | 6 |  /  |

#### Easy aerobic run

Role: easy-run; distance: 2.35 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 2.35,
    "pace": "Conversational easy effort"
  }
]
```

2350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Seated leg curl (12–14 reps): Block 1: Hamstring hypertrophy. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Triceps pushdown (12–14 reps): Block 1: Triceps capacity. Choose initial load by RPE; aim to add reps before weight.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.

### 2026-11-19 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 38,
  "runMinutes": 0,
  "strengthMinutes": 34.5,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 18,
    "support": 2.5,
    "setup": 2,
    "total": 34.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 37.5,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 3 × 6 | 40 | 7 | straight / maintenance |
| Lat pulldown | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 3 × 6 | 17.5 | 7 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 2.3 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 2.3,
    "pace": "Conversational easy effort"
  }
]
```

2300 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lat pulldown (10–12 reps): Block 1: Upper-back support. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.

### 2026-11-22 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 0,
  "runMinutes": 0,
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
      "totalMinutes": 0,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 2.8 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 2.8,
    "pace": "Conversational easy effort"
  }
]
```

2800 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.

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

Priority: Running. Running phase: Aerobic foundation. Calendar feasible: **False**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- You have 7 weekly activities across 3 available days. Several double-session days would be required.
- Enter a valid running PB and recent weekly distance.
- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
- Tue does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Thu does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Sun does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.

Activation blockers:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
- Tue does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Thu does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Sun does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.

### 2026-11-24 / Tue — Squat + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 40,
  "runMinutes": 0,
  "strengthMinutes": 37,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 18,
    "support": 5,
    "setup": 2,
    "total": 37
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 40,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 3 × 6 | 30 | 7 | straight / maintenance |
| Seated leg curl | 1 × 12 | uncalibrated | 6 |  /  |
| Bench | 3 × 6 | 17.5 | 7 | straight / maintenance |
| Triceps pushdown | 1 × 12 | uncalibrated | 6 |  /  |

#### Easy aerobic run

Role: easy-run; distance: 1.9 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 1.9,
    "pace": "Conversational easy effort"
  }
]
```

1900 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Seated leg curl (12–14 reps): Block 1: Hamstring hypertrophy. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Triceps pushdown (12–14 reps): Block 1: Triceps capacity. Choose initial load by RPE; aim to add reps before weight.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
- Running recovery week: reduced running volume.

### 2026-11-26 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 38,
  "runMinutes": 0,
  "strengthMinutes": 34.5,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 18,
    "support": 2.5,
    "setup": 2,
    "total": 34.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 37.5,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 3 × 6 | 40 | 7 | straight / maintenance |
| Lat pulldown | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 3 × 6 | 17.5 | 7 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 1.9 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 1.9,
    "pace": "Conversational easy effort"
  }
]
```

1900 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lat pulldown (10–12 reps): Block 1: Upper-back support. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
- Running recovery week: reduced running volume.

### 2026-11-29 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 0,
  "runMinutes": 0,
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
      "totalMinutes": 0,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 2.3 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 2.3,
    "pace": "Conversational easy effort"
  }
]
```

2300 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
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

Priority: Running. Running phase: Development. Calendar feasible: **False**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- You have 7 weekly activities across 3 available days. Several double-session days would be required.
- Enter a valid running PB and recent weekly distance.
- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
- Tue does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Thu does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Sun does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.

Activation blockers:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
- Tue does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Thu does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Sun does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.

### 2026-12-01 / Tue — Squat + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Reduced volume separates Foundation from Development. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 28,
  "runMinutes": 0,
  "strengthMinutes": 25,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 6,
    "support": 5,
    "setup": 2,
    "total": 25
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 28,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 1 × 6 | 30 | 6 | straight / maintenance |
| Seated leg curl | 1 × 12 | uncalibrated | 6 |  /  |
| Bench | 1 × 6 | 17.5 | 6 | straight / maintenance |
| Triceps pushdown | 1 × 12 | uncalibrated | 6 |  /  |

#### Easy aerobic run

Role: easy-run; distance: 2.4 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 2.4,
    "pace": "Conversational easy effort"
  }
]
```

2400 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Seated leg curl (12–14 reps): Block 1: Hamstring hypertrophy. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.
- Triceps pushdown (12–14 reps): Block 1: Triceps capacity. Choose initial load by RPE; aim to add reps before weight.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.

### 2026-12-03 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Reduced volume separates Foundation from Development. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 26,
  "runMinutes": 0,
  "strengthMinutes": 22.5,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 6,
    "support": 2.5,
    "setup": 2,
    "total": 22.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 25.5,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 1 × 6 | 40 | 6 | straight / maintenance |
| Lat pulldown | 1 × 10 | uncalibrated | 6 |  /  |
| Bench | 1 × 6 | 17.5 | 6 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 2.35 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 2.35,
    "pace": "Conversational easy effort"
  }
]
```

2350 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Lat pulldown (10–12 reps): Block 1: Upper-back support. Choose initial load by RPE; aim to add reps before weight.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.

### 2026-12-06 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Reduced volume separates Foundation from Development. Build repeatable technique and capacity. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 0,
  "runMinutes": 0,
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
      "totalMinutes": 0,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 2.9 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 2.9,
    "pace": "Conversational easy effort"
  }
]
```

2900 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.

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

Priority: Running. Running phase: Development. Calendar feasible: **False**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- You have 7 weekly activities across 3 available days. Several double-session days would be required.
- Enter a valid running PB and recent weekly distance.
- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
- Tue does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Thu does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Sun does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.

Activation blockers:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
- Tue does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Thu does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Sun does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.

### 2026-12-08 / Tue — Squat + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 35,
  "runMinutes": 0,
  "strengthMinutes": 32,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 18,
    "support": 0,
    "setup": 2,
    "total": 32
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 35,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 3 × 6 | 30 | 7 | straight / maintenance |
| Bench | 3 × 6 | 17.5 | 7 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 2.45 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 2.45,
    "pace": "Conversational easy effort"
  }
]
```

2450 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.

### 2026-12-10 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 35,
  "runMinutes": 0,
  "strengthMinutes": 32,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 18,
    "support": 0,
    "setup": 2,
    "total": 32
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 35,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 3 × 6 | 40 | 7 | straight / maintenance |
| Bench | 3 × 6 | 17.5 | 7 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 2.45 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 2.45,
    "pace": "Conversational easy effort"
  }
]
```

2450 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.

### 2026-12-13 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 0,
  "runMinutes": 0,
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
      "totalMinutes": 0,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 3 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 3,
    "pace": "Conversational easy effort"
  }
]
```

3000 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.

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

Priority: Running. Running phase: Development. Calendar feasible: **False**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- You have 7 weekly activities across 3 available days. Several double-session days would be required.
- Enter a valid running PB and recent weekly distance.
- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
- Tue does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Thu does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Sun does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.

Activation blockers:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
- Tue does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Thu does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Sun does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.

### 2026-12-15 / Tue — Squat + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 35,
  "runMinutes": 0,
  "strengthMinutes": 32,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 18,
    "support": 0,
    "setup": 2,
    "total": 32
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 35,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 3 × 6 | 30 | 7 | straight / maintenance |
| Bench | 3 × 6 | 17.5 | 7 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 2.55 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 2.55,
    "pace": "Conversational easy effort"
  }
]
```

2550 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.

### 2026-12-17 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 35,
  "runMinutes": 0,
  "strengthMinutes": 32,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 18,
    "support": 0,
    "setup": 2,
    "total": 32
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 35,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 3 × 6 | 40 | 7 | straight / maintenance |
| Bench | 3 × 6 | 17.5 | 7 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 2.5 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 2.5,
    "pace": "Conversational easy effort"
  }
]
```

2500 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.

### 2026-12-20 / Sun — Long aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 0,
  "runMinutes": 0,
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
      "totalMinutes": 0,
      "capMinutes": 90
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Long aerobic run

Role: long-run; distance: 3.05 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Long easy run",
    "role": "easy",
    "distanceKm": 3.05,
    "pace": "Conversational easy effort"
  }
]
```

3050 m long easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.

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

Priority: Running. Running phase: Taper / event. Calendar feasible: **False**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- You have 7 weekly activities across 3 available days. Several double-session days would be required.
- Enter a valid running PB and recent weekly distance.
- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
- Tue does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Thu does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.

Activation blockers:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
- Tue does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.
- Thu does not fit its inclusive visit window because running duration is unknown. Review dose or availability; do not rush rest or omit main work.

### 2026-12-22 / Tue — Squat + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 35,
  "runMinutes": 0,
  "strengthMinutes": 32,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 18,
    "support": 0,
    "setup": 2,
    "total": 32
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 35,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 3 × 6 | 30 | 7 | straight / maintenance |
| Bench | 3 × 6 | 17.5 | 7 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 0.7 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 0.7,
    "pace": "Conversational easy effort"
  }
]
```

700 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
- Running event taper: reduced running volume.

### 2026-12-24 / Thu — Deadlift + Bench + Easy aerobic run

Strength maintenance: reduced volume without planned load escalation. Progress productive workload with manageable effort. Running is the protected priority.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 35,
  "runMinutes": 0,
  "strengthMinutes": 32,
  "transitionMinutes": 3,
  "components": {
    "warmups": 12,
    "workAndRest": 18,
    "support": 0,
    "setup": 2,
    "total": 32
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 35,
      "capMinutes": 60
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": false,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Deadlift | 3 × 6 | 40 | 7 | straight / maintenance |
| Bench | 3 × 6 | 17.5 | 7 | straight / maintenance |

#### Easy aerobic run

Role: easy-run; distance: 0.85 km; duration: unknown min; RPE: 3.5; pace: Conversational easy effort; confirm a recent race baseline.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 0.85,
    "pace": "Conversational easy effort"
  }
]
```

850 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Maintain strength with reduced volume; no scheduled strength load escalation.
- Maintain strength with reduced volume; no scheduled strength load escalation.

hybridNotes:

- Confirm recent weekly mileage and a representative current running performance before approving dated race preparation.
- Running event taper: reduced running volume.

### 2026-12-26 / Saturday — Running event

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

Event permission: `{"confirmed": true, "explicit": true, "estimatedMinutes": null, "logisticsMinutes": 20}`

#### 5 km race

Role: race; distance: 5 km; duration: unknown min; RPE: unknown; pace: Confirm a recent running PB to set race pace.

Every prescribed step (native fields):

```json
[
  {
    "label": "Race distance",
    "distanceKm": 5,
    "pace": "Confirm a recent running PB to set race pace"
  }
]
```

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
