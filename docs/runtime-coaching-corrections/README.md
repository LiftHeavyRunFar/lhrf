# Runtime coaching corrections

This work changes the canonical executable engine, rather than patching an athlete's approved programme. The comparison baseline is production `b59a720b39ff9d62412007467b16f7cf2f32a291` (1.34.0, including IA-01/02). Inputs are the independently reviewed audit [#128](https://github.com/LiftHeavyRunFar/lhrf/pull/128), recovery proposal [#129](https://github.com/LiftHeavyRunFar/lhrf/pull/129), attribution [#130](https://github.com/LiftHeavyRunFar/lhrf/pull/130) and integrity corrections [#131](https://github.com/LiftHeavyRunFar/lhrf/pull/131). The limited sanitized owner summary and manually reviewed candidate in [#132](https://github.com/LiftHeavyRunFar/lhrf/pull/132) supply diagnostic evidence, not production loading targets.

## Executable boundary

`prepareNewProgramme` selects the corrected policy for new version-two proposals. `coachingRuntimeVersion:1` and a dated, frozen evidence packet record that choice. Saved configurations without the marker retain their policy; displaying a programme does not learn from new logs, clear recovery, regenerate it or replace a frozen reviewed week. Approval must preserve what was reviewed. Existing transaction, protection, backup and rollback code remains in charge of any later replacement.

The new `src/coaching-evidence.js` is a small shared interpreter used by strength and running; it is not a replacement programme engine. Exact exercise/setup, purpose, reps, effort, chronology and uncertainty govern evidence use. A familiar working load is a starting suggestion subject to the effort ceiling, not a tested maximum or guaranteed future RPE. Approximate speed effort is practice context and cannot establish maximum strength, velocity or competition readiness. The original rows are never rewritten.

One dated recovery interpretation replaces conflicting strength/running rules in the new policy. Easy running, quality, longer running, individual lifting and heavy lifting have different evidence. Expiry does not clear an unresolved concern. An old event alone is context for review, rather than a permanent restriction. Task tolerance and restoration of weekly dose remain separate decisions. Worsening or provoking symptoms require stopping that work and prompt review; a percentage reduction cannot establish safety.

Completed marathon dates are normalised across the dated performance profile, recent-race records and explicit history fields. Repeating the same fact in another supported field cannot change executable work. Partial starting weeks also retain each surviving slot's original purpose; removing earlier dates does not relabel a Sunday speed slot as the first volume slot.

Running retains the IA-01 executable scaling correction. The new policy removes the blanket six-km-per-run general-fitness cap when a familiar running base is available. A provisional post-marathon ceiling no longer compounds because future week numbers advance. A single tolerated short run cannot restore the pre-event running week. Duration constraints and the actual final calendar still govern feasibility; removed distance is never automatically made up. Overlap alone is a monitoring signal, rather than proof that concurrent training warrants a cut.

## Evidence and policy limits

The coaching foundation remains the [verified evidence review](../independent-coaching-audit/evidence-review.md), particularly strength specificity and effort (E1–E5), tapering (E10–E12), concurrent training (E18–E19) and recovery/monitoring (E20–E22). None of those sources validates an exact kilogram choice, fixed readiness date, universal safe progression percentage or physiological readiness score.

Existing RPE curves, planning evidence horizons, load rounding, progression fractions, intensity budgets and provisional return fractions remain visible product conventions. This targeted correction does not claim they are optimal for every athlete. Planned future increases remain conditional on completed work and recovery. Execution adjustments can happen within a session; recurring objective performance, adherence and recovery patterns guide normal review, commonly over approximately 2–4 weeks. Athlete approval is still required for material programme changes. No automatic regeneration is introduced.

## Independent evaluation and reproducibility

- [Pre-output coaching criteria](coaching-criteria.md) and the amendment/hash ledger in `pre-output-criteria.json` define the challenge before corrected output capture.
- [Priya's assurance](priya-assurance.md) challenges the implementation independently, including negative controls and preservation.
- `scripts/compare-runtime-coaching.cjs` extracts all baseline dependencies from the immutable production commit. Old and corrected engines receive identical raw inputs and a fixed clock. Input purity and determinism are asserted. The compact report retains input/output/source hashes; complete native before/after blocks are retained as CI artifacts.
- The owner comparison is explicitly limited. There is no complete private backup, attributed future calendar, current running evidence or dated current recovery in the supplied extract. Generated diagnostic rows must never be labelled the saved programme.

Reproduce without writing athlete state:

```sh
npm test
node scripts/compare-runtime-coaching.cjs --out /tmp/runtime-comparison.json --full-out /tmp/runtime-comparison-native.json
node scripts/test-athletes.cjs --json
node scripts/replay-coaching-rounds.cjs --safety --legacy-policy --output /tmp/runtime-safety
node scripts/replay-coaching-depth.cjs /tmp/runtime-depth --legacy-policy
```

The last two commands explicitly replay immutable production `b59a720` as **legacy preservation evidence**. Their historical assertions include assumptions rejected by this correction, such as a mandatory RPE-8.5-plus single without observed single experience and a future marathon build without new recovery evidence. They are not the quality standard for the corrected engine. Their provenance records the selected source commit/hashes. Current runtime quality is checked by the new adversarial tests, identical-input comparison and independent coaching reviews; existing saved-policy hashes still run against the current renderer. Omitting `--legacy-policy` retains the current-engine diagnostic route and can report unmet old assumptions without making an athlete programme approved.

The November proposal is generated only after the general comparison and independent review. It is a proposal for review, never an active replacement. Final validation results, exact source SHAs, limitations and the deployment recommendation are recorded with the investigation PR.
