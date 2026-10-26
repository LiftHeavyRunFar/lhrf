# Running coach review — 26 October 2026

## What the independent review found

The earlier tests proved deterministic output and app integration. They did not sufficiently challenge whether the prescription suited the athlete. The reported 5.5 km cooldown escaped because weekly mileage was being filled through the cooldown, and the original test contract rewarded matching that total.

Three delegated review tasks examined coaching, athlete-profile acceptance and app integration. The subsequent review was interrupted by a usage limit before final browser validation. This report records the completed work after resuming; it is not a claim of continuous overnight execution.

Reproduced defects included minimum quality sessions exceeding low weekly baselines, fixed cooldown distance taking too long for slower athletes, overly concentrated long runs at high mileage/low frequency, quality work in race weeks, absent race distance, and post-race training without a review gate. UI review also found a separate timer prescription, lost run detail in trial handoffs, and fabricated/incorrect trial log fields.

## Changes

- Explicit `runningGuidanceVersion:3` for newly proposed programmes; saved version-2 programmes retain their prescriptions. Frozen hashes from the deployed November block verify all five weeks remain identical.
- Fit quality work, warm-up, recoveries and cooldown inside the athlete's session budget. Missing or low baselines receive provisional easy-only running. At most one quality session and at most 20% hard distance are checked against actual training after calendar placement.
- Time-derived short cooldowns; goal-specific distance and slow-pace duration caps. Unmet weekly volume is explained rather than hidden in filler distance.
- Exact race dates, explicit race distance/pace, no quality in race week, no long run immediately before half/marathon events, and post-event readiness gates. Training distance, race distance and total distance are reported separately.
- Reject invalid dates, malformed baselines and unsupported goals. A PB never establishes sufficient running volume or race readiness.
- Timer, copied Garmin steps and preview use the selected canonical run. Trial handoffs preserve its complete steps and pace. Actual logs retain distance/time and notes without inventing reported running RPE.
- Empty legacy event placeholders cannot start an unfinishable workout. Existing completed sessions, history and onboarding are preserved.

## Acceptance tests

`tests/running-athlete-bots.test.cjs` independently challenges 100 baseline/goal/frequency combinations, 300 build-week cases, 12 near/distant race calendars, slow runners, unknown baselines, invalid inputs, partial weeks and post-marathon timing. Positive controls require suitable athletes to receive usable quality sessions; passing by blocking everyone is not accepted. The archived first Tuesday prescription reproduces the actual oversized cooldown before checking the corrected policy.

Additional browser tests exercise preview → live run → timer/export parity → actual log, trial running, event placeholders, missing-PB handling, all five tabs and the complete combined workout flow. CI results are authoritative; a local Node pass does not substitute for browser validation.

## Limits and review decisions

These are conservative software acceptance guards, not clinical thresholds or proof of coaching efficacy. Initial defaults such as a 12 km/90-minute 10K long-session ceiling, minimum recent mileage for quality and a 20% hard-distance ceiling are explicit product policies, not universal scientific laws. Long-distance event preparation with inadequate frequency/baseline is blocked for individual review. Recent longest-run history, terrain, illness, personal recovery and longitudinal outcome validation remain incomplete. No faster easy-pace proposal is inferred merely because a new log omits RPE.

## Primary guidance consulted

- Boston Athletic Association, 10K Level One: progressive structured sessions, short warm-ups/cooldowns and distinct race-week work. https://www.baa.org/sites/default/files/2018-07/B.A.A.%2010K%20Level%20One%20Training.pdf
- England Athletics, returning to running: rebuild at lower intensity/duration rather than assume past capacity remains current. https://www.englandathletics.org/news/the-perfect-way-to-return-to-running/

These sources informed the review; neither validates this app's numeric policies or replaces athlete-specific coaching.


## Version 4 correction: undated base building and progression

New onboarding and new standalone proposals opt into runningGuidanceVersion 4. Saved version 2/3 programmes retain their prescriptions. This is not an automatic upgrade of the athlete's approved November block.

Undated half/marathon goals are base-building blocks, not dated race preparation. Low-frequency marathon base building can be proposed with explicit limits and a suggestion to consider a third easy run; the schedule is never silently changed. Low-mileage/two-run dated marathon preparation remains blocked, and short dated marathon preparation needs individual review. Missing longest-run history prevents a claim of race readiness.

Version 4 builds from previous peaks with explicit consolidation every fourth week. Provisional build rates are 2% for general fitness, 2.5% with strength priority, 4% for longer-distance goals, and 3.5% otherwise, compounded on build weeks and capped at 1.6 times baseline. Consolidation is 90% of the current build budget. These are configurable product defaults, not scientifically validated individual prescriptions or injury guarantees. Missing baselines do not receive automatic volume growth. Dated taper reductions are based on the pre-taper build rather than the initial baseline.

Half/marathon ordinary-session limits allow up to 90 minutes, while existing long-session duration caps remain. Two-run allocation is balanced rather than overloading the long run. Quality-session spare budget stays in an explicitly named easy segment, not an oversized cooldown. Any material unallocated budget (over 0.15 km) is reported; onboarding also flags later-week limits so a flat preview cannot conceal capacity constraints. Limits may still mean a runner needs more suitable frequency or individual review; the engine does not force mileage to make the chart look ambitious.

Regression coverage includes the reported undated 15 km/two-run/eight-week scenario, consolidation versus race taper, continuation above prior peaks, a 120-profile matrix over 12 weeks, dated short-horizon review, budget/quality constraints, saved-policy preservation and end-to-end onboarding. Source guidance supports distinguishing preparation from short race-readiness promises, not the numeric defaults: London Marathon provides 16-week race plans; Boston Athletic Association Level One uses four running days and a separate preparation phase.
