# Running-engine quality review — 27 October 2026

## Scope

The requested review covers running-focused athletes as well as bench-priority hybrids. Its purpose is to test whether an expanded workout repertoire conserves the athlete's workload, has meaningful progression and exposes unsupported assumptions. Variety alone does not make a prescription good coaching.

These are synthetic software acceptance checks. Passing them does not establish race readiness, physiological effectiveness, injury prevention or coaching competence across all runners. CI browser results, where available, are a separate integration check; local Node tests are not represented as browser validation.

## Existing evidence and gaps

The prior running suite already challenged unknown and low mileage, 1–5 runs/week, 5K through marathon goals, slow runners, invalid data, partial calendar weeks, exact race dates, post-race recovery, oversized cooldowns, distance budgets and long-run concentration. The version-4 matrix spans 120 profiles across 12 weeks. Those bounds are explicit product policies, not universal training laws.

The code review found a specific hazard for this change: several accounting paths identified hard running by the text `Threshold interval`. A pyramid could therefore escape work-distance and duration calculations if only its label changed. The new acceptance suite measures work by semantic `role: work`, independent of the displayed name.

The engine still accepts a single running performance profile rather than reconciling several results. This release adds the result date, performance versus ordinary training classification, and outdoor/treadmill context. An ordinary training result no longer establishes numerical race fitness under the new policy; invalid/future dates block approval, results over eight weeks old defer quality, and treadmill results carry a calibration/context warning. Mark's recent outdoor 28:20 5K versus his 65-minute marathon-preparation run illustrates the practical need. Terrain, weather, several simultaneous results and baseline uncertainty are not yet reconciled.

The broad-policy engine also applies a predominantly easy, at-most-one-quality-session rule. It can be an explicit starting policy for a hybrid athlete; it is not a claim to cover every experienced running specialist's needs. Longest recent run, injury/illness history, course demands, heart-rate context and longitudinal validation remain limited or absent.

## New independent acceptance contract

`tests/running-library.test.cjs` checks:

- All six families have stable identities and a stated coaching purpose.
- Threshold repeats, race-pace repeats, pyramid, inverted pyramid, ascending ladder and descending ladder conserve the complete prescription's total distance, work distance and recovery distance. Warm-up/cooldown targets remain intact.
- The pyramid's distances rise then fall; inverted pyramids fall then rise; ladders follow their named direction. Shorter repetitions have faster targets where mixed paces are intended.
- Malformed pace inputs and unknown families cannot produce a superficially valid prescription.
- An unsupported aggressive goal cannot make baseline-derived race pace faster. An achievable slower target may be used for race-specific practice.
- A 100-profile, 12-week matrix checks actual allocated training distance, semantic work-distance share, no extra quality sessions, consolidation, valid paces, reconciled lap totals and input immutability. Positive controls ensure the suite cannot pass by removing every quality workout.
- Exact event dates and easy-only event weeks remain intact for 5K, 10K, half-marathon and marathon cases.
- Creating varied sessions cannot alter saved legacy programme generation through shared module state.

The tests intentionally distinguish actual training distance from planned budgets and race distance. Those are different quantities.

## Results

Observed local result: `npm test` passed **112/112 tests**, including **15 new running-library acceptance tests**. The new matrix exercises 100 profile combinations across 12 weeks; its per-case invariants include actual budget, semantic work share, quality frequency, lap totals and input immutability. The suitable 30 km/week, three-run 10K positive control delivers all six families across 12 weeks, with consolidation weeks remaining easy. Half/marathon cases avoid mixed-speed pyramids.

Additional tests confirm that a dated, recent outdoor 28:20 5K produces an approximate 59:04 10K equivalent and permits 6:00/km race-specific practice; an ordinary 65-minute training run produces no numerical race pace. Impossible/future dates block approval, stale results defer quality and treadmill context is visible.

QA reproduced two defects during implementation: asymmetric pyramid legs caused by accumulating metre-rounding remainder, and inherited stale total-time estimates when an easy segment lacked numerical pace. Both were corrected and have regression coverage. No browser/CI pass is claimed by this local result.

## Follow-up tests required beyond this release

1. Baseline selection: reconcile multiple dated results and conflicting distances, account for route/conditions and quantify performance uncertainty. Single-result date, effort and treadmill-context guards are now covered; they are not full evidence reconciliation.
2. Session progression: a successful isolated pyramid must not be treated as proof of continuous 10K ability. Add outcome-driven progression and explicit constraints on work duration and recoveries.
3. Running specialisation: validate more than one training philosophy across multiple frequencies and experience levels, while preserving athlete-approved hybrid trade-offs.
4. Field validation: collect athlete outcomes and coaching review before describing the engine as validated. Synthetic profile volume cannot substitute for that evidence.
