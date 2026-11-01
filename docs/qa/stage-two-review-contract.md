# Stage 2 independent coaching review — frozen before generation

Engine under review: Stage 1 commit `78c4ba291097c8be757a0de8ad46cee65e859f24` on `investigate/taylor-visit-allocation`, based on PR #107. The Stage 1 entry checks passed: Taylor has 120-minute Tuesday/Saturday windows for each 63.5-minute first-week estimate. A final heavy squat 11 days out, followed by light technique four days out and sharply reduced volume, is a defensible taper option with an explicit timing review condition. No extra exposure is needed simply to satisfy a preferred numerical window.

Fixture: `tests/fixtures/stage-two-new-athletes.json`. SHA256: `5a0e83d10a5aab146db43ad2d7170be0cd2ff97888de412a809161099a4e190a`. Profiles P–T were authored from scratch before any new prescription was generated. No source facts, goals or constraints will be changed in response to disappointing output. Seed 2026103104 identifies this deliberate contrasting design; it is not population sampling. Clock 31 October 2026; programme start 2 November 2026.

## Review criteria

1. Capture every week and every native exercise, set, rep, suggested load, RPE and running step. Require deterministic generation, canonical parity and unchanged input/history. These engineering checks do not establish coaching quality.
2. Assess the final fitted calendar, not pre-allocation budgets. Check visit counts, repeat-lift spacing, supplied whole-visit time, mixed/separate permission, unknown-load labels, exact event dates and activation blockers across the entire horizon. A correctly blocked impossible request is a safeguard, not a failed test. A blocked calendar can still reveal an avoidable allocator failure if an existing valid counterfactual fits.
3. Assess progression and consolidation from actual doses: meaningful development, reduced recovery/taper weeks, appropriate novice entry, competition-lift specificity and distinct purposes when multiple lift exposures are requested. No athlete is required to have three separate heavy/volume/speed days with only two visits. Equal or different coaching choices are not automatically defects.
4. Running work must use supplied current performance or honestly unknown pace. Goals are aspirations. Check actual supporting volume, long-run duration relative to supplied recovery, purpose of quality work, event-rhythm rehearsal, taper and race-specific preparation. Do not impose a universal long-run-distance or mileage-share cutoff as a pass criterion.
5. Assess interference, hard lower-body and run placement, quality of priority protection and post-event recovery. For ordered goals, inspect the weeks before, during and after each event and the actual recovery/priority/frequency handover. Merely showing two event dates is insufficient.
6. Recovery facts must influence the proposal or produce a clear review block. In T, current effort overshoots, short sleep and 96-hour long-run recovery must not silently clear in future weeks. Inspect both running and lifting. Counterfactual probes may isolate mechanisms but cannot replace or repair the original capture.
7. Judge individualisation against all facts for each athlete. Explicit per-lift frequencies are athlete requests; unknown readiness or a training-paced observation must not become invented clearance or a race performance. Instructions should explain effort overshoot, missed work, recovery review and relevant event preparation.

## Athlete-specific emphasis

- P / Leila: established four-run 10K preparation; two maintenance lifting visits should support running, fit mixed-visit budgets and reduce around the race.
- Q / Hugo: deadlift priority and two requested exposures per lift in three lifting visits; reasonable lower-body spacing, complementary roles and meet preparation while health runs remain subordinate.
- R / Sofia: returning novice, no valid race baseline, first Saturday 5K outside ordinary availability with explicit event permission. Conservative entry, no fabricated max/pace, fitting 60-minute mixed visits, appropriate race-day handling and recovery.
- S / Idris: strength meet first, then half marathon. Ten-day provisional recovery and a genuine transition from two health runs/three strength visits to four runs/two maintenance visits. Review the actual endurance support and preparation, not a performance forecast.
- T / Keiko: established mileage and an 18-week marathon horizon, but unresolved lower-body fatigue, poor sleep and slow long-run recovery. Preserve normal bench support, bound affected lower lifting and running stress, and require evidence before escalation. Faster aspiration must not dictate pace.

## Severity and decision rules

Critical: output presents materially incomplete or constraint-violating work as unconditionally executable, bypasses a required readiness block, or mutates saved athlete data. High: repeatable shared planning/intake failure undermines a stated goal, recovery constraint, event preparation or feasible schedule. Moderate: materially weak individualisation or avoidable dose/placement without an immediate false-feasibility claim. Low: explanatory/usability limitation. Conditional: genuine missing readiness or input evidence. Acceptable difference: a coherent coaching alternative with explicit tradeoffs.

All shortcomings will be reported even if software regressions pass. No engine fixes will be made in Stage 2 to raise the score. Existing benchmark fixtures may appear in ordinary regression/golden-output tests; no new original-three programme comparison or coaching assessment will be started.
