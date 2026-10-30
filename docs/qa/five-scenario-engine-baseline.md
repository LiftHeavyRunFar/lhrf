# Five-scenario native coaching-engine baseline

The five fictional athletes are supplied by Priya's preserved scenario fixture. Rowan's runner enters those facts automatically, calls the actual shared LHRF engine, and saves its returned prescriptions unchanged. This is a baseline for independent criticism, not a hand-written replacement programme or an endorsement to train from a blocked draft.

## Reproduce

```sh
npm run test:scenarios
node --test tests/five-scenario-engine.test.cjs tests/shared-coach.test.cjs
npm run test:scenarios:acceptance
```

The capture command returns zero when all five captures complete. **Zero is not a coaching-quality pass.** The saved `programme.weeks[].feasible`, warnings and unscheduled work remain visible; every case in this baseline has blocked weeks. Automated harness checks establish faithful execution, deterministic output and no mutation, not physiological effectiveness.

The independent acceptance command exits nonzero while coaching requirements remain blocked. CI runs it and retains the exact raw outputs and gate report even on failure. This baseline intentionally fails coaching acceptance: 23 of 34 requirements are blocked across five cases. Normal regression tests verify execution and evaluator correctness separately.

Readable review copies can be rendered with `python3 scripts/render-scenario-programmes.py` (requires ReportLab). They expand the first four weeks, event weeks and C's handover weeks and show a whole-horizon calendar summary. Every raw session remains in the JSON; PDFs do not substitute manual coaching fixes. Render the review with `python3 scripts/render-scenario-programmes.py review docs/qa/five-scenario-engine-review.md output/pdf/Priya-five-scenario-engine-review.pdf`. Generated output is ignored by Git.

Fixture: `tests/fixtures/five-scenario-engine-inputs.json`.

Generated evidence: `docs/qa/five-scenario-engine-baseline/{A,B,C,D,E}.json` plus `summary.json`. These can be regenerated rather than checked in. Each case file contains the complete source athlete, native mapped config, historical input, mapping decisions, unsupported facts, raw programme, unmodified review decision, diagnostic comparisons and provenance. SHA-256 hashes identify the fixture, runner and all three source modules; local Git HEAD is recorded separately and is not labelled a deployed-main commit.

## Production path

`buildNewProgramme` calls the same `prepareNewProgramme` policy initializer used by `index.html` onboarding, then `buildProgramme` calls canonical `createEngine.describeWeek` / `generatedSessions`. The runner also compares every returned week's sessions with a separate native engine instance, and requires exact equality. Existing shared-engine parity tests check the browser's delegation to that module. No browser activation, localStorage write, live athlete account, network call or deployment occurs.

## Facts versus mappings

All input facts, including availability caps and complete six-week histories, are preserved verbatim. They are not all representable by today's engine.

- Weekly distance maps to the latest completed week's scalar baseline. Full history is retained, not turned into invented individual activity logs.
- Native `liftProfiles` preserve weight and repetitions. `estimatedMax` is called exactly as the UI does to populate `baselines`. For B these are estimates from non-maximal rep sets, never purported tested 1RMs. The baseline sets' reported RPE is retained in source, because the estimator has no RPE parameter.
- The source specifies strength visits more often than per-lift frequencies. Explicit test assumptions are A/B/E: squat1, bench2, deadlift1; C/D: squat2, bench3, deadlift1. These are assumptions Rowan must review, not extra user-supplied facts. No prescribed exercises, loads, days or sessions are hand-authored to mask failures.
- `doubleDays` represents permission for mixed components. The native contract cannot distinguish a combined visit from separated AM/PM visits, enforce a six-hour gap, enforce day-specific minute budgets or request a separate number of strength visits. The default component capacity is left unchanged.
- C is entered as running-first for the full horizon with both event dates. There is no native dated priority/frequency handover field; the runner does not manually stitch two plans and present that as engine capability.
- D's two dated squat observations are loaded into historical data. They are not labelled designated top sets or given invented prescribed RPEs. Untimestamped deadlift/bench facts, sleep hours and travel stay in source; no dates or 1–5 readiness scores are invented. The resulting `observe` review and unchanged first-week generation expose the intake gap rather than prove the recovery signal is harmless.

## Diagnostic comparisons

D compares first-week generated sessions with and without its supplied dated history. E compares target-present and target-absent runs in two ways: complete JSON, and prescription-only JSON excluding `paceBasis` explanatory metadata. The latter still compares actual pace, steps, distances and effort. Different goal metadata must not be misreported as different training paces.

## Boundary

No coaching rule was changed in this baseline exercise. No approved programme or log was read, replaced or migrated. Priya's separate review records actual shortcomings and defines what should change before rerunning these same cases.
