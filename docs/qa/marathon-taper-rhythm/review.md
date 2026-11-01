# Marathon taper race rhythm correction

Local candidate on `fix/marathon-taper-race-rhythm`, based on production commit `2511fe2a53270d3b88c34359c588462f789acb4f`. No production, publishing or programme activation action is included.

## Root cause and scope

The existing taper reminder required `h.base >= 25 && longReference >= 16` for marathon preparation. The original runner and hybrid have current marathon performances and reported baseline mileage, but no verified recent long run. The shared endurance-readiness requirement therefore excluded short taper practice throughout their three-week tapers.

New proposals opt into `marathonTaperRhythmVersion: 1`. A representative current marathon performance can establish familiar rhythm without verified long-run history. The existing route using current pace plus established endurance evidence remains available. Current-performance validation, the existing 25 km/week entry baseline, running frequency, long-run recovery/duration exclusions, lower-body fatigue, strength-event and post-marathon restrictions remain in place. Missing or stale pace never becomes aspirational goal pace.

The new exposure reuses the existing bounded two-repetition reminder builder and replaces easy metres. It retains warm-up, 200 m easy recovery, cool-down and the existing declining work ceilings of 4/3/1.5 km. The short practice has RPE 5 and explicitly requires session-time confirmation of comfortable easy running and recovery. It does not certify future readiness.

Current symptom/discomfort and repeated low-recovery signals are frozen from existing reports when a new proposal is created. Later projected sessions never establish recovery or completed practice. A single poor check-in is not enough to suppress practice. Saved rendering does not ingest new evidence; existing live recovery review remains necessary before training.

Every unsuccessful new-policy marathon-taper attempt reports its reason in warnings; ordinary attempts also expose structured `taperRaceRhythm` reasons. Zero prescribed running visits have an explicit warning. No half-marathon policy or broader running progression redesign is included.

## Rowan assessment of actual taper sessions

All dates are preserved fixture dates. Before is an actual replay of production 2511fe2a, not a reconstructed original-engine output. Both sides use byte-identical original-three inputs and the fixed 30 October 2026 clock. Weekly totals exclude the marathon race itself.

| Athlete and date | Session distance before and after | Before | After marathon-pace work | Weekly km before and after | Estimated session minutes before to after |
|---|---:|---|---|---:|---:|
| Hybrid 13 April 2027 | 9.15 km | Entirely easy at 8:02–9:32/km | 2 × 1.70 km at 7:20–7:30/km | 42.95 | 88 → 81 |
| Hybrid 20 April 2027 | 6.75 km | Entirely easy at 8:02–9:32/km | 2 × 0.925 km at 7:20–7:30/km | 31.50 | 65 → 61 |
| Hybrid 27 April 2027 | 3.70 km | Entirely easy at 8:02–9:32/km | 2 × 0.325 km at 7:20–7:30/km | 13.55 | 36 → 34 |
| Runner 9 February 2027 | 11.20 km | Entirely easy at 4:35–5:27/km | 2 × 2.00 km at 4:10–4:20/km | 52.40 | 62 → 57 |
| Runner 16 February 2027 | 8.20 km | Entirely easy at 4:35–5:27/km | 2 × 1.15 km at 4:10–4:20/km | 38.45 | 45 → 43 |
| Runner 23 February 2027 | 4.50 km | Entirely easy at 4:35–5:27/km | 2 × 0.40 km at 4:10–4:20/km | 16.50 | 25 → 24 |

All remaining metres stay easy. These small exposures preserve event rhythm while retaining the existing mileage taper and reduced lifting. Faster metres increase intensity relative to the previous easy session even though estimated duration decreases; unchanged distance is not proof of unchanged physiological stress. The work declines towards race day and remains conditional on actual recovery. No improved marathon result is claimed.

The first-time powerlifter has no marathon objective. All 26 weeks, including the final strength taper, remain exactly unchanged. Health running retains conversational timed prescriptions and unknown distance. No race pace is introduced.

## Priya regression assessment

Nine focused tests cover original runner and hybrid eligibility without long-run history; identical weekly distances and lifting; unchanged non-taper sessions; current pace versus faster aspirations; fatigue; symptom/discomfort evidence; repeated versus isolated poor recovery; long-run recovery/duration restrictions; post-event and strength-event restrictions; missing/stale/future performance; insufficient familiarity; tiny/absent visits; explicit fatigue clearance; future reports; browser/Node parity; old saved programmes and new saved evidence snapshots.

The comparison script separately checks exact mapped input equality, deterministic generation, all weekly training distances, every lifting prescription, every non-taper session, saved production-plan reproduction and the entire health-running athlete. All pass across 69 athlete-weeks. Three historical reconstructed programmes reproduce exactly without modifying their fixture bytes. The fixture SHA-256 remains `576ebbb21cd3b8158832d709f1e17c4af3c873d5cfd707ac8ca3a293e30df723`.

The historical weekly-stress test now explicitly replays its old taper policy for its archived Stage 1–6 equality assertion; it no longer treats an intentional new-proposal taper change as historical churn. Its saved-programme and latest-policy browser checks remain intact. No historical fixture or output was rewritten.

The full standard suite reports 62 passing and 7 failing test files, versus 61 passing and the same 7 failures on untouched production. Direct baseline inspection identifies `spawnSync`/`execFileSync` EPERM restrictions in these seven files: coaching-depth-gates, coaching-replay-safety, five-scenario-engine, programme-replacement, review-reset, reviewed-evidence-cli and stage-two-validation. The suite is not claimed fully green. Run it again in an executor permitting child processes before integration. The six direct weekly-stress tests pass, including frozen saved-output preservation.

## Reproduction and integration

Use an untouched checkout of production as the baseline:

```sh
node tests/marathon-taper-rhythm.test.cjs
node tests/weekly-stress-scheduling.test.cjs
npm test
node scripts/compare-marathon-taper.cjs /path/to/2511fe2a-checkout /path/to/separate-evidence-directory
```

The comparison writes full before/after JSON, complete taper sessions, source hashes and validation results. It uses no network, activation or browser storage.

Review this single candidate commit against 2511fe2a. Cherry-pick onto the intended integration branch only after checking intervening changes and obtaining a clean full-suite result in a suitable executor. Integration and deployment remain separate user-authorised actions; no merge or push is part of this change. Existing saved programmes remain on their stored version, so this does not silently alter an athlete's active programme.

## Remaining limitations

The original scenarios still contain declared assumptions about mileage, recency and availability. A programme generated months ahead remains conditional on updated performance and recovery evidence. Missing long-run history still limits endorsement of the marathon build itself, even when short rhythm practice is reasonable. An athlete with only a shorter-distance result and no existing endurance evidence stays ineligible; adding a broader completed-workout evidence model is outside this correction.

Rowan and Priya are assessment lenses, not separate human sign-offs. No broader running-engine redesign was necessary.
