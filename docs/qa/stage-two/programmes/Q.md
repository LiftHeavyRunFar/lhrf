# Q — Hugo: Deadlift-priority lifter with two exposures per main lift

**Synthetic native output / coaching review copy / not an activated programme.**

Acceptable strength-first candidate; squat-first meet-order practice is a defensible coaching choice.

All 10 weeks are expanded below. Raw `Q.json` preserves every native field and provenance without rounding; displays below round distances to three decimals. Suggested loads require warm-up calibration; an uncalibrated value is not a zero-kg prescription. No session has been hand-corrected.

Frozen input SHA256: `5a0e83d10a5aab146db43ad2d7170be0cd2ff97888de412a809161099a4e190a`. Captured commit: `988d74120d63b0abb5c070afa1cb6bd91f4d81ae`; engine-source hashes are in the raw capture.

## Athlete facts

```json
{
  "id": "Q",
  "name": "Hugo",
  "label": "Deadlift-priority lifter with two exposures per main lift",
  "priority": "Deadlift",
  "training_age": "intermediate",
  "goals": [
    {
      "sport": "strength",
      "date": "2027-01-09"
    }
  ],
  "strength": {
    "observations": {
      "Squat": {
        "kg": 170,
        "reps": 1,
        "tested_single": true
      },
      "Bench": {
        "kg": 110,
        "reps": 1,
        "tested_single": true
      },
      "Deadlift": {
        "kg": 215,
        "reps": 1,
        "tested_single": true
      }
    },
    "requested_exposures_per_week": {
      "squat": 2,
      "bench": 2,
      "deadlift": 2
    }
  },
  "running": {
    "recent_result": {
      "distance_km": 5,
      "seconds": 1590,
      "effort": "performance",
      "date": "2026-10-24"
    },
    "weekly_km_history": [
      10,
      12,
      11,
      12,
      10,
      12
    ],
    "long_run": {
      "km": 6,
      "minutes": 40,
      "recovery_hours": 36
    },
    "requested_runs_per_week": 2
  },
  "availability": {
    "strengthVisits": 3,
    "minutes": {
      "Mon": 90,
      "Wed": 80,
      "Fri": 100,
      "Sun": 45
    },
    "combinedDays": [
      "Wed"
    ],
    "separateDays": [],
    "separateMinutes": {},
    "minimumGapHours": 0,
    "eventDays": {
      "2027-01-09": {
        "confirmed": true,
        "minutes": null
      }
    }
  },
  "health_context": "Fictional, pain-free, no illness or medical rehabilitation. Future adaptation and event results are unknown.",
  "training_history": "Five years lifting, two meets, established two-run health routine. Deadlift is the main performance goal; no running race requested.",
  "recovery_constraints": "No current fatigue. Prefers at least one non-lifting day between lower-body visits; supplied Mon/Wed/Fri availability represents that constraint."
}
```

## Full horizon

| Week | Priority | Running phase | Training km (race excluded) | Calendar feasible |
|---|---|---|---|---|
| 1 | Deadlift | Aerobic foundation | 12 | True |
| 2 | Deadlift | Aerobic foundation | 12 | True |
| 3 | Deadlift | Aerobic foundation | 12 | True |
| 4 | Deadlift | Aerobic foundation | 10.2 | True |
| 5 | Deadlift | Development | 12 | True |
| 6 | Deadlift | Development | 12 | True |
| 7 | Deadlift | Development | 12 | True |
| 8 | Deadlift | Development | 10.75 | True |
| 9 | Deadlift | Development | 12 | True |
| 10 | Deadlift | Development | 2.1 | True |

## Week 1 — Development

Priority: Deadlift. Running phase: Aerobic foundation. Calendar feasible: **True**. Review required: **False**. Feasibility describes scheduling, not athlete readiness.

### 2026-11-02 / Mon — Squat + Deadlift + Bench

Progress productive workload with manageable effort. Deadlift gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 81,
  "runMinutes": 0,
  "strengthMinutes": 81,
  "transitionMinutes": 0,
  "components": {
    "warmups": 18,
    "workAndRest": 27,
    "support": 34,
    "setup": 2,
    "total": 81
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 81,
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
| Squat | 1 × 3 | 147.5 | 8 | top / heavy |
| Squat | 2 × 3 | 137.5 | 7 | backoff / heavy |
| Bulgarian split squat | 2 × 10 | uncalibrated | 7 |  /  |
| Seated leg curl | 2 × 12 | uncalibrated | 7 |  /  |
| Deadlift | 1 × 3 | 185 | 8 | top / heavy |
| Deadlift | 2 × 3 | 172.5 | 7 | backoff / heavy |
| Back extension | 2 × 12 | uncalibrated | 7 |  /  |
| Lat pulldown | 2 × 10 | uncalibrated | 7 |  /  |
| Bench | 1 × 3 | 95 | 8 | top / heavy |
| Bench | 2 × 3 | 87.5 | 7 | backoff / heavy |
| Triceps pushdown | 2 × 10 | uncalibrated | 7 | accessory /  |
| Reverse pec deck | 2 × 12 | uncalibrated | 7 | accessory /  |
| Cable biceps curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Dumbbell lateral raise (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Strength exposure: demanding main work followed by a smaller volume dose. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Bulgarian split squat (10–12 reps): Block 1: Single-leg quad development. Choose initial load by RPE; aim to add reps before weight.
- Seated leg curl (12–14 reps): Block 1: Hamstring hypertrophy. Choose initial load by RPE; aim to add reps before weight.
- Strength exposure: demanding main work followed by a smaller volume dose. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Back extension (12–14 reps): Block 1: Posterior-chain capacity. Choose initial load by RPE; aim to add reps before weight.
- Lat pulldown (10–12 reps): Block 1: Upper-back support. Choose initial load by RPE; aim to add reps before weight.
- Strength exposure: demanding main work followed by a smaller volume dose. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Triceps pushdown (10–12 reps): Triceps support without another heavy press. Keep this movement through the block; work within 10–12 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Reverse pec deck (12–15 reps): Rear-delt development. Keep this movement through the block; work within 12–15 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.

### 2026-11-04 / Wed — Deadlift + Easy aerobic run

Progress productive workload with manageable effort. Deadlift gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 78,
  "runMinutes": 48,
  "strengthMinutes": 26.5,
  "transitionMinutes": 3,
  "components": {
    "warmups": 6,
    "workAndRest": 10,
    "support": 8.5,
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
| Paused deadlift | 1 × 5 | uncalibrated | 8 | top / volume |
| Paused deadlift | 2 × 5 | uncalibrated | 7 | backoff / volume |
| Hip thrust | 2 × 10 | uncalibrated | 7 |  /  |
| Seated cable row | 2 × 10 | uncalibrated | 7 |  /  |

#### Easy aerobic run

Role: easy-run; distance: 6.2 km; duration: 48 min; RPE: 3.5; pace: 6:31/km to 7:44/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.2,
    "pace": "6:31/km to 7:44/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

6200 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Volume exposure: build repeatable work without turning it into a max day. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts. Calibrate this variation from its own history or warm-ups; never borrow the competition-lift load.
- Paused deadlift: Improve position and tension through the pull. First exposure: discover working load through warm-ups at target RPE.
- Hip thrust (10–12 reps): Block 2: Hip extension strength. Choose initial load by RPE; aim to add reps before weight.
- Seated cable row (10–12 reps): Block 2: Upper-back strength. Choose initial load by RPE; aim to add reps before weight.

### 2026-11-06 / Fri — Squat + Bench

Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 66,
  "runMinutes": 0,
  "strengthMinutes": 65.5,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 20,
    "support": 31.5,
    "setup": 2,
    "total": 65.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 65.5,
      "capMinutes": 100
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
| Safety-bar squat | 1 × 5 | uncalibrated | 8 | top / volume |
| Safety-bar squat | 2 × 5 | uncalibrated | 7 | backoff / volume |
| Leg press | 2 × 10 | uncalibrated | 7 |  /  |
| Romanian deadlift | 2 × 8 | uncalibrated | 7 |  /  |
| Close-grip bench | 1 × 5 | uncalibrated | 8 | top / volume |
| Close-grip bench | 2 × 5 | uncalibrated | 7 | backoff / volume |
| Incline dumbbell press | 2 × 8 | uncalibrated | 7 | accessory /  |
| Chest-supported row | 3 × 10 | uncalibrated | 7 | accessory /  |
| Dumbbell lateral raise | 2 × 12 | uncalibrated | 7 | accessory /  |
| Cable biceps curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Rope triceps pushdown (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Volume exposure: build repeatable work without turning it into a max day. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts. Calibrate this variation from its own history or warm-ups; never borrow the competition-lift load.
- Safety-bar squat: Build quad and upper-back strength while practising upright bracing. First exposure: discover working load through warm-ups at target RPE.
- Leg press (10–12 reps): Block 2: Additional quad volume. Choose initial load by RPE; aim to add reps before weight.
- Romanian deadlift (8–10 reps): Block 2: Posterior-chain strength. Choose initial load by RPE; aim to add reps before weight.
- Volume exposure: build repeatable work without turning it into a max day. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts. Calibrate this variation from its own history or warm-ups; never borrow the competition-lift load.
- Close-grip bench: Build triceps contribution and pressing strength. First exposure: discover working load through warm-ups at target RPE.
- Incline dumbbell press (8–10 reps): Incline pressing support. Keep this movement through the block; work within 8–10 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Chest-supported row (10–12 reps): Supported horizontal pulling. Keep this movement through the block; work within 10–12 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Dumbbell lateral raise (12–15 reps): Lateral shoulder development. Keep this movement through the block; work within 12–15 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.

### 2026-11-08 / Sun — Easy aerobic run

Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

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
      "capMinutes": 45
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 5.8 km; duration: 45 min; RPE: 3.5; pace: 6:31/km to 7:44/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 5.8,
    "pace": "6:31/km to 7:44/km"
  }
]
```

Duration range: `{"min": 38, "max": 45}`.

5800 m easy run

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


## Week 2 — Development

Priority: Deadlift. Running phase: Aerobic foundation. Calendar feasible: **True**. Review required: **False**. Feasibility describes scheduling, not athlete readiness.

### 2026-11-09 / Mon — Squat + Deadlift + Bench

Progress productive workload with manageable effort. Deadlift gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 81,
  "runMinutes": 0,
  "strengthMinutes": 81,
  "transitionMinutes": 0,
  "components": {
    "warmups": 18,
    "workAndRest": 27,
    "support": 34,
    "setup": 2,
    "total": 81
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 81,
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
| Squat | 1 × 3 | 147.5 | 8 | top / heavy |
| Squat | 2 × 3 | 137.5 | 7 | backoff / heavy |
| Bulgarian split squat | 2 × 10 | uncalibrated | 7 |  /  |
| Seated leg curl | 2 × 12 | uncalibrated | 7 |  /  |
| Deadlift | 1 × 3 | 185 | 8 | top / heavy |
| Deadlift | 2 × 3 | 172.5 | 7 | backoff / heavy |
| Back extension | 2 × 12 | uncalibrated | 7 |  /  |
| Lat pulldown | 2 × 10 | uncalibrated | 7 |  /  |
| Bench | 1 × 3 | 95 | 8 | top / heavy |
| Bench | 2 × 3 | 87.5 | 7 | backoff / heavy |
| Triceps pushdown | 2 × 10 | uncalibrated | 7 | accessory /  |
| Reverse pec deck | 2 × 12 | uncalibrated | 7 | accessory /  |
| Cable biceps curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Dumbbell lateral raise (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Strength exposure: demanding main work followed by a smaller volume dose. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Bulgarian split squat (10–12 reps): Block 1: Single-leg quad development. Choose initial load by RPE; aim to add reps before weight.
- Seated leg curl (12–14 reps): Block 1: Hamstring hypertrophy. Choose initial load by RPE; aim to add reps before weight.
- Strength exposure: demanding main work followed by a smaller volume dose. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Back extension (12–14 reps): Block 1: Posterior-chain capacity. Choose initial load by RPE; aim to add reps before weight.
- Lat pulldown (10–12 reps): Block 1: Upper-back support. Choose initial load by RPE; aim to add reps before weight.
- Strength exposure: demanding main work followed by a smaller volume dose. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Triceps pushdown (10–12 reps): Triceps support without another heavy press. Keep this movement through the block; work within 10–12 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Reverse pec deck (12–15 reps): Rear-delt development. Keep this movement through the block; work within 12–15 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.

### 2026-11-11 / Wed — Deadlift + Easy aerobic run

Progress productive workload with manageable effort. Deadlift gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 78,
  "runMinutes": 48,
  "strengthMinutes": 26.5,
  "transitionMinutes": 3,
  "components": {
    "warmups": 6,
    "workAndRest": 10,
    "support": 8.5,
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
| Paused deadlift | 1 × 5 | uncalibrated | 8 | top / volume |
| Paused deadlift | 2 × 5 | uncalibrated | 7 | backoff / volume |
| Hip thrust | 2 × 10 | uncalibrated | 7 |  /  |
| Seated cable row | 2 × 10 | uncalibrated | 7 |  /  |

#### Easy aerobic run

Role: easy-run; distance: 6.2 km; duration: 48 min; RPE: 3.5; pace: 6:31/km to 7:44/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.2,
    "pace": "6:31/km to 7:44/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

6200 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Volume exposure: build repeatable work without turning it into a max day. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts. Calibrate this variation from its own history or warm-ups; never borrow the competition-lift load.
- Paused deadlift: Improve position and tension through the pull. First exposure: discover working load through warm-ups at target RPE.
- Hip thrust (10–12 reps): Block 2: Hip extension strength. Choose initial load by RPE; aim to add reps before weight.
- Seated cable row (10–12 reps): Block 2: Upper-back strength. Choose initial load by RPE; aim to add reps before weight.

### 2026-11-13 / Fri — Squat + Bench

Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 66,
  "runMinutes": 0,
  "strengthMinutes": 65.5,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 20,
    "support": 31.5,
    "setup": 2,
    "total": 65.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 65.5,
      "capMinutes": 100
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
| Safety-bar squat | 1 × 5 | uncalibrated | 8 | top / volume |
| Safety-bar squat | 2 × 5 | uncalibrated | 7 | backoff / volume |
| Leg press | 2 × 10 | uncalibrated | 7 |  /  |
| Romanian deadlift | 2 × 8 | uncalibrated | 7 |  /  |
| Close-grip bench | 1 × 5 | uncalibrated | 8 | top / volume |
| Close-grip bench | 2 × 5 | uncalibrated | 7 | backoff / volume |
| Incline dumbbell press | 2 × 8 | uncalibrated | 7 | accessory /  |
| Chest-supported row | 3 × 10 | uncalibrated | 7 | accessory /  |
| Dumbbell lateral raise | 2 × 12 | uncalibrated | 7 | accessory /  |
| Cable biceps curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Rope triceps pushdown (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Volume exposure: build repeatable work without turning it into a max day. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts. Calibrate this variation from its own history or warm-ups; never borrow the competition-lift load.
- Safety-bar squat: Build quad and upper-back strength while practising upright bracing. First exposure: discover working load through warm-ups at target RPE.
- Leg press (10–12 reps): Block 2: Additional quad volume. Choose initial load by RPE; aim to add reps before weight.
- Romanian deadlift (8–10 reps): Block 2: Posterior-chain strength. Choose initial load by RPE; aim to add reps before weight.
- Volume exposure: build repeatable work without turning it into a max day. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts. Calibrate this variation from its own history or warm-ups; never borrow the competition-lift load.
- Close-grip bench: Build triceps contribution and pressing strength. First exposure: discover working load through warm-ups at target RPE.
- Incline dumbbell press (8–10 reps): Incline pressing support. Keep this movement through the block; work within 8–10 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Chest-supported row (10–12 reps): Supported horizontal pulling. Keep this movement through the block; work within 10–12 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Dumbbell lateral raise (12–15 reps): Lateral shoulder development. Keep this movement through the block; work within 12–15 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.

### 2026-11-15 / Sun — Easy aerobic run

Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

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
      "capMinutes": 45
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 5.8 km; duration: 45 min; RPE: 3.5; pace: 6:31/km to 7:44/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 5.8,
    "pace": "6:31/km to 7:44/km"
  }
]
```

Duration range: `{"min": 38, "max": 45}`.

5800 m easy run

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


## Week 3 — Development

Priority: Deadlift. Running phase: Aerobic foundation. Calendar feasible: **True**. Review required: **False**. Feasibility describes scheduling, not athlete readiness.

### 2026-11-16 / Mon — Squat + Deadlift + Bench

Progress productive workload with manageable effort. Deadlift gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 81,
  "runMinutes": 0,
  "strengthMinutes": 81,
  "transitionMinutes": 0,
  "components": {
    "warmups": 18,
    "workAndRest": 27,
    "support": 34,
    "setup": 2,
    "total": 81
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 81,
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
| Squat | 1 × 3 | 147.5 | 8 | top / heavy |
| Squat | 2 × 3 | 137.5 | 7 | backoff / heavy |
| Bulgarian split squat | 2 × 10 | uncalibrated | 7 |  /  |
| Seated leg curl | 2 × 12 | uncalibrated | 7 |  /  |
| Deadlift | 1 × 3 | 185 | 8 | top / heavy |
| Deadlift | 2 × 3 | 172.5 | 7 | backoff / heavy |
| Back extension | 2 × 12 | uncalibrated | 7 |  /  |
| Lat pulldown | 2 × 10 | uncalibrated | 7 |  /  |
| Bench | 1 × 3 | 95 | 8 | top / heavy |
| Bench | 2 × 3 | 87.5 | 7 | backoff / heavy |
| Triceps pushdown | 2 × 10 | uncalibrated | 7 | accessory /  |
| Reverse pec deck | 2 × 12 | uncalibrated | 7 | accessory /  |
| Cable biceps curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Dumbbell lateral raise (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Strength exposure: demanding main work followed by a smaller volume dose. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Bulgarian split squat (10–12 reps): Block 1: Single-leg quad development. Choose initial load by RPE; aim to add reps before weight.
- Seated leg curl (12–14 reps): Block 1: Hamstring hypertrophy. Choose initial load by RPE; aim to add reps before weight.
- Strength exposure: demanding main work followed by a smaller volume dose. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Back extension (12–14 reps): Block 1: Posterior-chain capacity. Choose initial load by RPE; aim to add reps before weight.
- Lat pulldown (10–12 reps): Block 1: Upper-back support. Choose initial load by RPE; aim to add reps before weight.
- Strength exposure: demanding main work followed by a smaller volume dose. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Triceps pushdown (10–12 reps): Triceps support without another heavy press. Keep this movement through the block; work within 10–12 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Reverse pec deck (12–15 reps): Rear-delt development. Keep this movement through the block; work within 12–15 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.

### 2026-11-18 / Wed — Deadlift + Easy aerobic run

Progress productive workload with manageable effort. Deadlift gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 78,
  "runMinutes": 48,
  "strengthMinutes": 26.5,
  "transitionMinutes": 3,
  "components": {
    "warmups": 6,
    "workAndRest": 10,
    "support": 8.5,
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
| Paused deadlift | 1 × 5 | uncalibrated | 8 | top / volume |
| Paused deadlift | 2 × 5 | uncalibrated | 7 | backoff / volume |
| Hip thrust | 2 × 10 | uncalibrated | 7 |  /  |
| Seated cable row | 2 × 10 | uncalibrated | 7 |  /  |

#### Easy aerobic run

Role: easy-run; distance: 6.2 km; duration: 48 min; RPE: 3.5; pace: 6:31/km to 7:44/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.2,
    "pace": "6:31/km to 7:44/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

6200 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Volume exposure: build repeatable work without turning it into a max day. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts. Calibrate this variation from its own history or warm-ups; never borrow the competition-lift load.
- Paused deadlift: Improve position and tension through the pull. First exposure: discover working load through warm-ups at target RPE.
- Hip thrust (10–12 reps): Block 2: Hip extension strength. Choose initial load by RPE; aim to add reps before weight.
- Seated cable row (10–12 reps): Block 2: Upper-back strength. Choose initial load by RPE; aim to add reps before weight.

### 2026-11-20 / Fri — Squat + Bench

Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 66,
  "runMinutes": 0,
  "strengthMinutes": 65.5,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 20,
    "support": 31.5,
    "setup": 2,
    "total": 65.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 65.5,
      "capMinutes": 100
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
| Safety-bar squat | 1 × 5 | uncalibrated | 8 | top / volume |
| Safety-bar squat | 2 × 5 | uncalibrated | 7 | backoff / volume |
| Leg press | 2 × 10 | uncalibrated | 7 |  /  |
| Romanian deadlift | 2 × 8 | uncalibrated | 7 |  /  |
| Close-grip bench | 1 × 5 | uncalibrated | 8 | top / volume |
| Close-grip bench | 2 × 5 | uncalibrated | 7 | backoff / volume |
| Incline dumbbell press | 2 × 8 | uncalibrated | 7 | accessory /  |
| Chest-supported row | 3 × 10 | uncalibrated | 7 | accessory /  |
| Dumbbell lateral raise | 2 × 12 | uncalibrated | 7 | accessory /  |
| Cable biceps curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Rope triceps pushdown (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Volume exposure: build repeatable work without turning it into a max day. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts. Calibrate this variation from its own history or warm-ups; never borrow the competition-lift load.
- Safety-bar squat: Build quad and upper-back strength while practising upright bracing. First exposure: discover working load through warm-ups at target RPE.
- Leg press (10–12 reps): Block 2: Additional quad volume. Choose initial load by RPE; aim to add reps before weight.
- Romanian deadlift (8–10 reps): Block 2: Posterior-chain strength. Choose initial load by RPE; aim to add reps before weight.
- Volume exposure: build repeatable work without turning it into a max day. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts. Calibrate this variation from its own history or warm-ups; never borrow the competition-lift load.
- Close-grip bench: Build triceps contribution and pressing strength. First exposure: discover working load through warm-ups at target RPE.
- Incline dumbbell press (8–10 reps): Incline pressing support. Keep this movement through the block; work within 8–10 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Chest-supported row (10–12 reps): Supported horizontal pulling. Keep this movement through the block; work within 10–12 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Dumbbell lateral raise (12–15 reps): Lateral shoulder development. Keep this movement through the block; work within 12–15 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.

### 2026-11-22 / Sun — Easy aerobic run

Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

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
      "capMinutes": 45
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 5.8 km; duration: 45 min; RPE: 3.5; pace: 6:31/km to 7:44/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 5.8,
    "pace": "6:31/km to 7:44/km"
  }
]
```

Duration range: `{"min": 38, "max": 45}`.

5800 m easy run

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


## Week 4 — Development

Priority: Deadlift. Running phase: Aerobic foundation. Calendar feasible: **True**. Review required: **False**. Feasibility describes scheduling, not athlete readiness.

### 2026-11-23 / Mon — Squat + Deadlift + Bench

Progress productive workload with manageable effort. Deadlift gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 81,
  "runMinutes": 0,
  "strengthMinutes": 81,
  "transitionMinutes": 0,
  "components": {
    "warmups": 18,
    "workAndRest": 27,
    "support": 34,
    "setup": 2,
    "total": 81
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 81,
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
| Squat | 1 × 3 | 147.5 | 8 | top / heavy |
| Squat | 2 × 3 | 137.5 | 7 | backoff / heavy |
| Bulgarian split squat | 2 × 10 | uncalibrated | 7 |  /  |
| Seated leg curl | 2 × 12 | uncalibrated | 7 |  /  |
| Deadlift | 1 × 3 | 185 | 8 | top / heavy |
| Deadlift | 2 × 3 | 172.5 | 7 | backoff / heavy |
| Back extension | 2 × 12 | uncalibrated | 7 |  /  |
| Lat pulldown | 2 × 10 | uncalibrated | 7 |  /  |
| Bench | 1 × 3 | 95 | 8 | top / heavy |
| Bench | 2 × 3 | 87.5 | 7 | backoff / heavy |
| Triceps pushdown | 2 × 10 | uncalibrated | 7 | accessory /  |
| Reverse pec deck | 2 × 12 | uncalibrated | 7 | accessory /  |
| Cable biceps curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Dumbbell lateral raise (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Strength exposure: demanding main work followed by a smaller volume dose. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Bulgarian split squat (10–12 reps): Block 1: Single-leg quad development. Choose initial load by RPE; aim to add reps before weight.
- Seated leg curl (12–14 reps): Block 1: Hamstring hypertrophy. Choose initial load by RPE; aim to add reps before weight.
- Strength exposure: demanding main work followed by a smaller volume dose. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Back extension (12–14 reps): Block 1: Posterior-chain capacity. Choose initial load by RPE; aim to add reps before weight.
- Lat pulldown (10–12 reps): Block 1: Upper-back support. Choose initial load by RPE; aim to add reps before weight.
- Strength exposure: demanding main work followed by a smaller volume dose. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Triceps pushdown (10–12 reps): Triceps support without another heavy press. Keep this movement through the block; work within 10–12 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Reverse pec deck (12–15 reps): Rear-delt development. Keep this movement through the block; work within 12–15 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.

### 2026-11-25 / Wed — Deadlift + Easy aerobic run

Progress productive workload with manageable effort. Deadlift gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 70,
  "runMinutes": 40,
  "strengthMinutes": 26.5,
  "transitionMinutes": 3,
  "components": {
    "warmups": 6,
    "workAndRest": 10,
    "support": 8.5,
    "setup": 2,
    "total": 26.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 69.5,
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
| Deadlift | 1 × 5 | 175 | 8 | top / volume |
| Deadlift | 2 × 5 | 162.5 | 7 | backoff / volume |
| Hip thrust | 2 × 10 | uncalibrated | 7 |  /  |
| Seated cable row | 2 × 10 | uncalibrated | 7 |  /  |

#### Easy aerobic run

Role: easy-run; distance: 5.1 km; duration: 40 min; RPE: 3.5; pace: 6:31/km to 7:44/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 5.1,
    "pace": "6:31/km to 7:44/km"
  }
]
```

Duration range: `{"min": 34, "max": 40}`.

5100 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Volume exposure: build repeatable work without turning it into a max day. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Hip thrust (10–12 reps): Block 2: Hip extension strength. Choose initial load by RPE; aim to add reps before weight.
- Seated cable row (10–12 reps): Block 2: Upper-back strength. Choose initial load by RPE; aim to add reps before weight.

hybridNotes:

- Running recovery week: reduced running volume.

### 2026-11-27 / Fri — Squat + Bench

Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 66,
  "runMinutes": 0,
  "strengthMinutes": 65.5,
  "transitionMinutes": 0,
  "components": {
    "warmups": 12,
    "workAndRest": 20,
    "support": 31.5,
    "setup": 2,
    "total": 65.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 65.5,
      "capMinutes": 100
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
| Squat | 1 × 5 | 137.5 | 8 | top / volume |
| Squat | 2 × 5 | 127.5 | 7 | backoff / volume |
| Leg press | 2 × 10 | uncalibrated | 7 |  /  |
| Romanian deadlift | 2 × 8 | uncalibrated | 7 |  /  |
| Bench | 1 × 5 | 90 | 8 | top / volume |
| Bench | 2 × 5 | 82.5 | 7 | backoff / volume |
| Incline dumbbell press | 2 × 8 | uncalibrated | 7 | accessory /  |
| Chest-supported row | 3 × 10 | uncalibrated | 7 | accessory /  |
| Dumbbell lateral raise | 2 × 12 | uncalibrated | 7 | accessory /  |
| Cable biceps curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Rope triceps pushdown (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Volume exposure: build repeatable work without turning it into a max day. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Leg press (10–12 reps): Block 2: Additional quad volume. Choose initial load by RPE; aim to add reps before weight.
- Romanian deadlift (8–10 reps): Block 2: Posterior-chain strength. Choose initial load by RPE; aim to add reps before weight.
- Volume exposure: build repeatable work without turning it into a max day. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Incline dumbbell press (8–10 reps): Incline pressing support. Keep this movement through the block; work within 8–10 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Chest-supported row (10–12 reps): Supported horizontal pulling. Keep this movement through the block; work within 10–12 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Dumbbell lateral raise (12–15 reps): Lateral shoulder development. Keep this movement through the block; work within 12–15 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.

### 2026-11-29 / Sun — Easy aerobic run

Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

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
      "capMinutes": 45
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 5.1 km; duration: 40 min; RPE: 3.5; pace: 6:31/km to 7:44/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 5.1,
    "pace": "6:31/km to 7:44/km"
  }
]
```

Duration range: `{"min": 34, "max": 40}`.

5100 m easy run

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


## Week 5 — Development

Priority: Deadlift. Running phase: Development. Calendar feasible: **True**. Review required: **False**. Feasibility describes scheduling, not athlete readiness.

### 2026-11-30 / Mon — Squat + Deadlift + Bench

Reduced volume separates Development from Specificity. Progress productive workload with manageable effort. Deadlift gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 35,
  "runMinutes": 0,
  "strengthMinutes": 35,
  "transitionMinutes": 0,
  "components": {
    "warmups": 18,
    "workAndRest": 15,
    "support": 0,
    "setup": 2,
    "total": 35
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
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

| Exercise | Sets × reps | Suggested kg | Target RPE | Role / intent |
|---|---|---|---|---|
| Squat | 2 × 2 | 102.5 | 5.5 | straight / technique |
| Deadlift | 2 × 2 | 130 | 5.5 | straight / technique |
| Bench | 2 × 2 | 65 | 5.5 | straight / technique |

variationNotes:

- Consolidation: reduce work and practise technique. Resume progression from completed performance, not an automatic load jump.
- Consolidation: reduce work and practise technique. Resume progression from completed performance, not an automatic load jump.
- Consolidation: reduce work and practise technique. Resume progression from completed performance, not an automatic load jump.

### 2026-12-02 / Wed — Deadlift + Easy aerobic run

Reduced volume separates Development from Specificity. Progress productive workload with manageable effort. Deadlift gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 64,
  "runMinutes": 48,
  "strengthMinutes": 13,
  "transitionMinutes": 3,
  "components": {
    "warmups": 6,
    "workAndRest": 5,
    "support": 0,
    "setup": 2,
    "total": 13
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 64,
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
| Deadlift | 2 × 2 | 130 | 5.5 | straight / technique |

#### Easy aerobic run

Role: easy-run; distance: 6.2 km; duration: 48 min; RPE: 3.5; pace: 6:31/km to 7:44/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.2,
    "pace": "6:31/km to 7:44/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

6200 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Consolidation: reduce work and practise technique. Resume progression from completed performance, not an automatic load jump.

### 2026-12-04 / Fri — Squat + Bench

Reduced volume separates Development from Specificity. Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

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
      "capMinutes": 100
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
| Squat | 2 × 2 | 102.5 | 5.5 | straight / technique |
| Bench | 2 × 2 | 65 | 5.5 | straight / technique |

variationNotes:

- Consolidation: reduce work and practise technique. Resume progression from completed performance, not an automatic load jump.
- Consolidation: reduce work and practise technique. Resume progression from completed performance, not an automatic load jump.

### 2026-12-06 / Sun — Easy aerobic run

Reduced volume separates Development from Specificity. Progress productive workload with manageable effort. Support the main goal without unnecessary fatigue.

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
      "capMinutes": 45
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 5.8 km; duration: 45 min; RPE: 3.5; pace: 6:31/km to 7:44/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 5.8,
    "pace": "6:31/km to 7:44/km"
  }
]
```

Duration range: `{"min": 38, "max": 45}`.

5800 m easy run

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


## Week 6 — Specificity

Priority: Deadlift. Running phase: Development. Calendar feasible: **True**. Review required: **False**. Feasibility describes scheduling, not athlete readiness.

### 2026-12-07 / Mon — Squat + Deadlift + Bench

Practise event-specific effort while managing fatigue. Deadlift gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 84,
  "runMinutes": 0,
  "strengthMinutes": 83.5,
  "transitionMinutes": 0,
  "components": {
    "warmups": 18,
    "workAndRest": 27,
    "support": 36.5,
    "setup": 2,
    "total": 83.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 83.5,
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
| Squat | 1 × 1 | 157.5 | 8 | top / heavy |
| Squat | 2 × 3 | 137.5 | 7 | backoff / heavy |
| Leg press | 2 × 10 | uncalibrated | 7 |  /  |
| Romanian deadlift | 1 × 8 | uncalibrated | 7 |  /  |
| Deadlift | 1 × 1 | 197.5 | 8 | top / heavy |
| Deadlift | 2 × 3 | 172.5 | 7 | backoff / heavy |
| Hip thrust | 1 × 10 | uncalibrated | 7 |  /  |
| Seated cable row | 2 × 10 | uncalibrated | 7 |  /  |
| Bench | 1 × 1 | 102.5 | 8 | top / heavy |
| Bench | 2 × 3 | 90 | 7 | backoff / heavy |
| Neutral-grip lat pulldown | 3 × 8 | uncalibrated | 7 | accessory /  |
| Overhead triceps extension | 2 × 10 | uncalibrated | 7 | accessory /  |
| Rear-delt dumbbell fly | 2 × 12 | uncalibrated | 7 | accessory /  |
| Hammer curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Dumbbell lateral raise (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Heavy competition single; practise setup, pause and commands. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Leg press (10–12 reps): Block 2: Additional quad volume. Choose initial load by RPE; aim to add reps before weight.
- Romanian deadlift (8–10 reps): Block 2: Posterior-chain strength. Choose initial load by RPE; aim to add reps before weight.
- Heavy competition single; practise setup, pause and commands. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Hip thrust (10–12 reps): Block 2: Hip extension strength. Choose initial load by RPE; aim to add reps before weight.
- Seated cable row (10–12 reps): Block 2: Upper-back strength. Choose initial load by RPE; aim to add reps before weight.
- Heavy competition single; practise setup, pause and commands. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Neutral-grip lat pulldown (8–10 reps): Vertical pulling and upper-back support. Keep this movement through the block; work within 8–10 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Overhead triceps extension (10–12 reps): Triceps support without another heavy press. Keep this movement through the block; work within 10–12 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Rear-delt dumbbell fly (12–15 reps): Rear-delt development. Keep this movement through the block; work within 12–15 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.

### 2026-12-09 / Wed — Deadlift + Easy aerobic run

Practise event-specific effort while managing fatigue. Deadlift gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 73,
  "runMinutes": 48,
  "strengthMinutes": 22,
  "transitionMinutes": 3,
  "components": {
    "warmups": 6,
    "workAndRest": 9,
    "support": 5,
    "setup": 2,
    "total": 22
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 73,
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
| Deadlift | 1 × 5 | 172.5 | 7.5 | top / volume |
| Deadlift | 2 × 5 | 160 | 7 | backoff / volume |
| Back extension | 1 × 10 | uncalibrated | 7 |  /  |
| Chest-supported row | 1 × 10 | uncalibrated | 7 |  /  |

#### Easy aerobic run

Role: easy-run; distance: 6.2 km; duration: 48 min; RPE: 3.5; pace: 6:31/km to 7:44/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.2,
    "pace": "6:31/km to 7:44/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

6200 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Volume exposure: build repeatable work without turning it into a max day. RPE 7.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Back extension (10–12 reps): Block 3: Posterior-chain maintenance. Choose initial load by RPE; aim to add reps before weight.
- Chest-supported row (10–12 reps): Block 3: Upper-back maintenance. Choose initial load by RPE; aim to add reps before weight.

### 2026-12-11 / Fri — Squat + Bench

Practise event-specific effort while managing fatigue. Support the main goal without unnecessary fatigue.

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
      "capMinutes": 100
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
| Squat | 1 × 5 | 135 | 7.5 | top / volume |
| Squat | 2 × 5 | 125 | 7 | backoff / volume |
| Reverse lunge | 1 × 8 | uncalibrated | 7 |  /  |
| Lying leg curl | 1 × 10 | uncalibrated | 7 |  /  |
| Bench | 1 × 5 | 87.5 | 7.5 | top / volume |
| Bench | 2 × 5 | 80 | 7 | backoff / volume |
| Low-incline dumbbell press | 2 × 8 | uncalibrated | 7 | accessory /  |
| One-arm dumbbell row | 3 × 10 | uncalibrated | 7 | accessory /  |
| Cable lateral raise | 2 × 12 | uncalibrated | 7 | accessory /  |
| Hammer curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Overhead cable triceps extension (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Volume exposure: build repeatable work without turning it into a max day. RPE 7.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Reverse lunge (8–10 reps): Block 3: Single-leg stability. Choose initial load by RPE; aim to add reps before weight.
- Lying leg curl (10–12 reps): Block 3: Hamstring maintenance. Choose initial load by RPE; aim to add reps before weight.
- Volume exposure: build repeatable work without turning it into a max day. RPE 7.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Low-incline dumbbell press (8–10 reps): Incline pressing support. Keep this movement through the block; work within 8–10 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- One-arm dumbbell row (10–12 reps): Supported horizontal pulling. Keep this movement through the block; work within 10–12 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Cable lateral raise (12–15 reps): Lateral shoulder development. Keep this movement through the block; work within 12–15 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.

### 2026-12-13 / Sun — Easy aerobic run

Practise event-specific effort while managing fatigue. Support the main goal without unnecessary fatigue.

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
      "capMinutes": 45
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 5.8 km; duration: 45 min; RPE: 3.5; pace: 6:31/km to 7:44/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 5.8,
    "pace": "6:31/km to 7:44/km"
  }
]
```

Duration range: `{"min": 38, "max": 45}`.

5800 m easy run

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


## Week 7 — Specificity

Priority: Deadlift. Running phase: Development. Calendar feasible: **True**. Review required: **False**. Feasibility describes scheduling, not athlete readiness.

### 2026-12-14 / Mon — Squat + Deadlift + Bench

Practise event-specific effort while managing fatigue. Deadlift gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 84,
  "runMinutes": 0,
  "strengthMinutes": 83.5,
  "transitionMinutes": 0,
  "components": {
    "warmups": 18,
    "workAndRest": 27,
    "support": 36.5,
    "setup": 2,
    "total": 83.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 83.5,
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
| Squat | 1 × 1 | 157.5 | 8 | top / heavy |
| Squat | 2 × 3 | 137.5 | 7 | backoff / heavy |
| Leg press | 2 × 10 | uncalibrated | 7 |  /  |
| Romanian deadlift | 1 × 8 | uncalibrated | 7 |  /  |
| Deadlift | 1 × 1 | 197.5 | 8 | top / heavy |
| Deadlift | 2 × 3 | 172.5 | 7 | backoff / heavy |
| Hip thrust | 1 × 10 | uncalibrated | 7 |  /  |
| Seated cable row | 2 × 10 | uncalibrated | 7 |  /  |
| Bench | 1 × 1 | 102.5 | 8 | top / heavy |
| Bench | 2 × 3 | 90 | 7 | backoff / heavy |
| Neutral-grip lat pulldown | 3 × 8 | uncalibrated | 7 | accessory /  |
| Overhead triceps extension | 2 × 10 | uncalibrated | 7 | accessory /  |
| Rear-delt dumbbell fly | 2 × 12 | uncalibrated | 7 | accessory /  |
| Hammer curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Dumbbell lateral raise (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Heavy competition single; practise setup, pause and commands. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Leg press (10–12 reps): Block 2: Additional quad volume. Choose initial load by RPE; aim to add reps before weight.
- Romanian deadlift (8–10 reps): Block 2: Posterior-chain strength. Choose initial load by RPE; aim to add reps before weight.
- Heavy competition single; practise setup, pause and commands. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Hip thrust (10–12 reps): Block 2: Hip extension strength. Choose initial load by RPE; aim to add reps before weight.
- Seated cable row (10–12 reps): Block 2: Upper-back strength. Choose initial load by RPE; aim to add reps before weight.
- Heavy competition single; practise setup, pause and commands. RPE 8 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Neutral-grip lat pulldown (8–10 reps): Vertical pulling and upper-back support. Keep this movement through the block; work within 8–10 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Overhead triceps extension (10–12 reps): Triceps support without another heavy press. Keep this movement through the block; work within 10–12 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Rear-delt dumbbell fly (12–15 reps): Rear-delt development. Keep this movement through the block; work within 12–15 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.

### 2026-12-16 / Wed — Deadlift + Easy aerobic run

Practise event-specific effort while managing fatigue. Deadlift gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 73,
  "runMinutes": 48,
  "strengthMinutes": 22,
  "transitionMinutes": 3,
  "components": {
    "warmups": 6,
    "workAndRest": 9,
    "support": 5,
    "setup": 2,
    "total": 22
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 73,
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
| Deadlift | 1 × 5 | 172.5 | 7.5 | top / volume |
| Deadlift | 2 × 5 | 160 | 7 | backoff / volume |
| Back extension | 1 × 10 | uncalibrated | 7 |  /  |
| Chest-supported row | 1 × 10 | uncalibrated | 7 |  /  |

#### Easy aerobic run

Role: easy-run; distance: 6.2 km; duration: 48 min; RPE: 3.5; pace: 6:31/km to 7:44/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.2,
    "pace": "6:31/km to 7:44/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

6200 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Volume exposure: build repeatable work without turning it into a max day. RPE 7.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Back extension (10–12 reps): Block 3: Posterior-chain maintenance. Choose initial load by RPE; aim to add reps before weight.
- Chest-supported row (10–12 reps): Block 3: Upper-back maintenance. Choose initial load by RPE; aim to add reps before weight.

### 2026-12-18 / Fri — Squat + Bench

Practise event-specific effort while managing fatigue. Support the main goal without unnecessary fatigue.

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
      "capMinutes": 100
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
| Squat | 1 × 5 | 135 | 7.5 | top / volume |
| Squat | 2 × 5 | 125 | 7 | backoff / volume |
| Reverse lunge | 1 × 8 | uncalibrated | 7 |  /  |
| Lying leg curl | 1 × 10 | uncalibrated | 7 |  /  |
| Bench | 1 × 5 | 87.5 | 7.5 | top / volume |
| Bench | 2 × 5 | 80 | 7 | backoff / volume |
| Low-incline dumbbell press | 2 × 8 | uncalibrated | 7 | accessory /  |
| One-arm dumbbell row | 3 × 10 | uncalibrated | 7 | accessory /  |
| Cable lateral raise | 2 × 12 | uncalibrated | 7 | accessory /  |
| Hammer curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Overhead cable triceps extension (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Volume exposure: build repeatable work without turning it into a max day. RPE 7.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Reverse lunge (8–10 reps): Block 3: Single-leg stability. Choose initial load by RPE; aim to add reps before weight.
- Lying leg curl (10–12 reps): Block 3: Hamstring maintenance. Choose initial load by RPE; aim to add reps before weight.
- Volume exposure: build repeatable work without turning it into a max day. RPE 7.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Low-incline dumbbell press (8–10 reps): Incline pressing support. Keep this movement through the block; work within 8–10 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- One-arm dumbbell row (10–12 reps): Supported horizontal pulling. Keep this movement through the block; work within 10–12 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Cable lateral raise (12–15 reps): Lateral shoulder development. Keep this movement through the block; work within 12–15 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.

### 2026-12-20 / Sun — Easy aerobic run

Practise event-specific effort while managing fatigue. Support the main goal without unnecessary fatigue.

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
      "capMinutes": 45
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 5.8 km; duration: 45 min; RPE: 3.5; pace: 6:31/km to 7:44/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 5.8,
    "pace": "6:31/km to 7:44/km"
  }
]
```

Duration range: `{"min": 38, "max": 45}`.

5800 m easy run

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


## Week 8 — Specificity

Priority: Deadlift. Running phase: Development. Calendar feasible: **True**. Review required: **False**. Feasibility describes scheduling, not athlete readiness.

### 2026-12-21 / Mon — Squat + Deadlift + Bench

Practise event-specific effort while managing fatigue. Deadlift gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 84,
  "runMinutes": 0,
  "strengthMinutes": 83.5,
  "transitionMinutes": 0,
  "components": {
    "warmups": 18,
    "workAndRest": 27,
    "support": 36.5,
    "setup": 2,
    "total": 83.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 83.5,
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
| Squat | 1 × 1 | 160 | 8.5 | top / heavy |
| Squat | 2 × 3 | 140 | 7 | backoff / heavy |
| Leg press | 2 × 10 | uncalibrated | 7 |  /  |
| Romanian deadlift | 1 × 8 | uncalibrated | 7 |  /  |
| Deadlift | 1 × 1 | 202.5 | 8.5 | top / heavy |
| Deadlift | 2 × 3 | 177.5 | 7 | backoff / heavy |
| Hip thrust | 1 × 10 | uncalibrated | 7 |  /  |
| Seated cable row | 2 × 10 | uncalibrated | 7 |  /  |
| Bench | 1 × 1 | 102.5 | 8.5 | top / heavy |
| Bench | 2 × 3 | 90 | 7 | backoff / heavy |
| Neutral-grip lat pulldown | 3 × 8 | uncalibrated | 7 | accessory /  |
| Overhead triceps extension | 2 × 10 | uncalibrated | 7 | accessory /  |
| Rear-delt dumbbell fly | 2 × 12 | uncalibrated | 7 | accessory /  |
| Hammer curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Dumbbell lateral raise (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Heavy competition single; practise setup, pause and commands. RPE 8.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Leg press (10–12 reps): Block 2: Additional quad volume. Choose initial load by RPE; aim to add reps before weight.
- Romanian deadlift (8–10 reps): Block 2: Posterior-chain strength. Choose initial load by RPE; aim to add reps before weight.
- Heavy competition single; practise setup, pause and commands. RPE 8.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Hip thrust (10–12 reps): Block 2: Hip extension strength. Choose initial load by RPE; aim to add reps before weight.
- Seated cable row (10–12 reps): Block 2: Upper-back strength. Choose initial load by RPE; aim to add reps before weight.
- Heavy competition single; practise setup, pause and commands. RPE 8.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Neutral-grip lat pulldown (8–10 reps): Vertical pulling and upper-back support. Keep this movement through the block; work within 8–10 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Overhead triceps extension (10–12 reps): Triceps support without another heavy press. Keep this movement through the block; work within 10–12 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Rear-delt dumbbell fly (12–15 reps): Rear-delt development. Keep this movement through the block; work within 12–15 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.

### 2026-12-23 / Wed — Deadlift + Easy aerobic run

Practise event-specific effort while managing fatigue. Deadlift gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 67,
  "runMinutes": 42,
  "strengthMinutes": 22,
  "transitionMinutes": 3,
  "components": {
    "warmups": 6,
    "workAndRest": 9,
    "support": 5,
    "setup": 2,
    "total": 22
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 67,
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
| Deadlift | 1 × 5 | 172.5 | 7.5 | top / volume |
| Deadlift | 2 × 5 | 160 | 7 | backoff / volume |
| Back extension | 1 × 10 | uncalibrated | 7 |  /  |
| Chest-supported row | 1 × 10 | uncalibrated | 7 |  /  |

#### Easy aerobic run

Role: easy-run; distance: 5.4 km; duration: 42 min; RPE: 3.5; pace: 6:31/km to 7:44/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 5.4,
    "pace": "6:31/km to 7:44/km"
  }
]
```

Duration range: `{"min": 36, "max": 42}`.

5400 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Volume exposure: build repeatable work without turning it into a max day. RPE 7.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Back extension (10–12 reps): Block 3: Posterior-chain maintenance. Choose initial load by RPE; aim to add reps before weight.
- Chest-supported row (10–12 reps): Block 3: Upper-back maintenance. Choose initial load by RPE; aim to add reps before weight.

hybridNotes:

- Running recovery week: reduced running volume.

### 2026-12-25 / Fri — Squat + Bench

Practise event-specific effort while managing fatigue. Support the main goal without unnecessary fatigue.

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
      "capMinutes": 100
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
| Squat | 1 × 5 | 135 | 7.5 | top / volume |
| Squat | 2 × 5 | 125 | 7 | backoff / volume |
| Reverse lunge | 1 × 8 | uncalibrated | 7 |  /  |
| Lying leg curl | 1 × 10 | uncalibrated | 7 |  /  |
| Bench | 1 × 5 | 87.5 | 7.5 | top / volume |
| Bench | 2 × 5 | 80 | 7 | backoff / volume |
| Low-incline dumbbell press | 2 × 8 | uncalibrated | 7 | accessory /  |
| One-arm dumbbell row | 3 × 10 | uncalibrated | 7 | accessory /  |
| Cable lateral raise | 2 × 12 | uncalibrated | 7 | accessory /  |
| Hammer curl (optional) | 2 × 12 | uncalibrated | 7 | optional /  |
| Overhead cable triceps extension (optional) | 2 × 12 | uncalibrated | 7 | optional /  |

variationNotes:

- Volume exposure: build repeatable work without turning it into a max day. RPE 7.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Reverse lunge (8–10 reps): Block 3: Single-leg stability. Choose initial load by RPE; aim to add reps before weight.
- Lying leg curl (10–12 reps): Block 3: Hamstring maintenance. Choose initial load by RPE; aim to add reps before weight.
- Volume exposure: build repeatable work without turning it into a max day. RPE 7.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Low-incline dumbbell press (8–10 reps): Incline pressing support. Keep this movement through the block; work within 8–10 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- One-arm dumbbell row (10–12 reps): Supported horizontal pulling. Keep this movement through the block; work within 10–12 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.
- Cable lateral raise (12–15 reps): Lateral shoulder development. Keep this movement through the block; work within 12–15 reps at the target RPE. Choose the first working load by RPE; no load is borrowed from bench or another variation.

### 2026-12-27 / Sun — Easy aerobic run

Practise event-specific effort while managing fatigue. Support the main goal without unnecessary fatigue.

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
      "capMinutes": 45
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 5.35 km; duration: 42 min; RPE: 3.5; pace: 6:31/km to 7:44/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 5.35,
    "pace": "6:31/km to 7:44/km"
  }
]
```

Duration range: `{"min": 35, "max": 42}`.

5350 m easy run

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


## Week 9 — Specificity

Priority: Deadlift. Running phase: Development. Calendar feasible: **True**. Review required: **False**. Feasibility describes scheduling, not athlete readiness.

### 2026-12-28 / Mon — Squat + Deadlift + Bench

Practise event-specific effort while managing fatigue. Deadlift gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 38,
  "runMinutes": 0,
  "strengthMinutes": 38,
  "transitionMinutes": 0,
  "components": {
    "warmups": 18,
    "workAndRest": 18,
    "support": 0,
    "setup": 2,
    "total": 38
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 38,
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
| Squat | 1 × 1 | 160 | 8.5 | top / heavy |
| Squat | 1 × 3 | 140 | 7 | backoff / heavy |
| Deadlift | 2 × 2 | 130 | 5.5 | straight / technique |
| Bench | 1 × 1 | 102.5 | 8.5 | top / heavy |
| Bench | 1 × 3 | 90 | 7 | backoff / heavy |

variationNotes:

- Heavy competition single; practise setup, pause and commands. RPE 8.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Easy technique between key exposures; protect the final heavy practice and event.
- Heavy competition single; practise setup, pause and commands. RPE 8.5 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.

### 2026-12-30 / Wed — Deadlift + Easy aerobic run

Practise event-specific effort while managing fatigue. Deadlift gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 66,
  "runMinutes": 48,
  "strengthMinutes": 14.5,
  "transitionMinutes": 3,
  "components": {
    "warmups": 6,
    "workAndRest": 6.5,
    "support": 0,
    "setup": 2,
    "total": 14.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 65.5,
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
| Deadlift | 1 × 1 | 205 | 9 | top / heavy |
| Deadlift | 1 × 2 | 177.5 | 6 | backoff / heavy |

#### Easy aerobic run

Role: easy-run; distance: 6.2 km; duration: 48 min; RPE: 3.5; pace: 6:31/km to 7:44/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 6.2,
    "pace": "6:31/km to 7:44/km"
  }
]
```

Duration range: `{"min": 41, "max": 48}`.

6200 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Final heavy command practice selected from your real schedule. RPE 9 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.

### 2027-01-01 / Fri — Squat + Bench

Practise event-specific effort while managing fatigue. Support the main goal without unnecessary fatigue.

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
      "capMinutes": 100
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
| Squat | 1 × 1 | 162.5 | 9 | top / heavy |
| Squat | 1 × 2 | 140 | 6 | backoff / heavy |
| Bench | 2 × 2 | 65 | 5.5 | straight / technique |

variationNotes:

- Final heavy command practice selected from your real schedule. RPE 9 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.
- Easy technique between key exposures; protect the final heavy practice and event.

### 2027-01-03 / Sun — Easy aerobic run

Practise event-specific effort while managing fatigue. Support the main goal without unnecessary fatigue.

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
      "capMinutes": 45
    }
  ],
  "separate": false,
  "minimumGapHours": null,
  "feasible": true,
  "estimateBasis": "Main-lift warm-ups 6 min per movement; work/rest 2.5\u20133 min per main set, 4 min at RPE 8+ (speed 1.5); supporting sets 1.75 min plus equipment change; setup 2 min; mixed transition 3 min. Running upper duration includes prescribed warm-up and recovery steps."
}
```

#### Easy aerobic run

Role: easy-run; distance: 5.8 km; duration: 45 min; RPE: 3.5; pace: 6:31/km to 7:44/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 5.8,
    "pace": "6:31/km to 7:44/km"
  }
]
```

Duration range: `{"min": 38, "max": 45}`.

5800 m easy run

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


## Week 10 — Taper / event

Priority: Deadlift. Running phase: Development. Calendar feasible: **True**. Review required: **True**. Feasibility describes scheduling, not athlete readiness.

Engine warnings:

- Strength competition week: short easy running only; the day after the meet requires a separate recovery decision.

### 2027-01-04 / Mon — Squat + Deadlift + Bench

Reduce workload to arrive fresher for the event. Deadlift gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 37,
  "runMinutes": 0,
  "strengthMinutes": 36.5,
  "transitionMinutes": 0,
  "components": {
    "warmups": 18,
    "workAndRest": 16.5,
    "support": 0,
    "setup": 2,
    "total": 36.5
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "strength",
      "totalMinutes": 36.5,
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
| Squat | 2 × 2 | 102.5 | 5.5 | straight / technique |
| Deadlift | 2 × 2 | 130 | 5.5 | straight / technique |
| Bench | 1 × 1 | 105 | 9 | top / heavy |
| Bench | 1 × 2 | 90 | 6 | backoff / heavy |

variationNotes:

- Easy technique between key exposures; protect the final heavy practice and event.
- Easy technique between key exposures; protect the final heavy practice and event.
- Final heavy command practice selected from your real schedule. RPE 9 governs the load: warm up, adjust the suggestion to the day, and log actual effort. If the first work set is at least one RPE above target, lower subsequent load 2.5–5%; if effort remains high, omit the last back-off and report the overshoot. No failed reps or extra max attempts.

### 2027-01-06 / Wed — Deadlift + Easy aerobic run

Reduce workload to arrive fresher for the event. Deadlift gets priority for progression and recovery.

Native time budget (estimated, not measured):

```json
{
  "totalMinutes": 33,
  "runMinutes": 17,
  "strengthMinutes": 13,
  "transitionMinutes": 3,
  "components": {
    "warmups": 6,
    "workAndRest": 5,
    "support": 0,
    "setup": 2,
    "total": 13
  },
  "includesWarmups": true,
  "includesRest": true,
  "includesTransitions": true,
  "visits": [
    {
      "kind": "combined",
      "totalMinutes": 33,
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
| Deadlift | 2 × 2 | 130 | 5.5 | straight / technique |

#### Easy aerobic run

Role: easy-run; distance: 2.1 km; duration: 17 min; RPE: 3.5; pace: 6:31/km to 7:44/km.

Every prescribed step (native fields):

```json
[
  {
    "label": "Easy run",
    "role": "easy",
    "distanceKm": 2.1,
    "pace": "6:31/km to 7:44/km"
  }
]
```

Duration range: `{"min": 14, "max": 17}`.

2100 m easy run

Build aerobic support at conversational effort; adjust to conditions and recovery.

variationNotes:

- Easy technique between key exposures; protect the final heavy practice and event.

hybridNotes:

- Strength competition week: short easy running only; the day after the meet requires a separate recovery decision.

### 2027-01-09 / Saturday — Strength competition

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
