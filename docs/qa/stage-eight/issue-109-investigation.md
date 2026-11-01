# Issue #109: Stage 8 CI investigation

Reviewed issue #109 and PR #108's release-hold findings at RC f996053d7cf7d5e76a7385064e79efb05b9a9702. Work is isolated on `fix/stage-eight-ci-109`. No application generation code, frozen inputs, expected hashes, safety limits or athlete permissions changed.

## Saved-programme fingerprint

Reproduced the reported failure on Node 22. The first changed field is athlete N, fixture `five-scenario-round-three-inputs`, `weeks[0].sessions[1].runs[0].steps[1].paceSeconds`:

- Recorded runtime Node 24.19.0: `286.702821172838`.
- CI Node 22: `286.70282117283796`.

V8's floating-point power calculations differ in their last bits. Later differences also include `paceBasis.shortPaceSeconds`. Human-readable pace and training intent are unchanged, but JSON serialization fingerprints the exact numbers.

Generated all 18 saved programmes from the fixture's actual PR #107 source commit `ec13dc5121170c2c22bda5a024bdd4df3acd3d84` and from the RC, independently on both runtimes. Full serialized outputs are byte-identical between those commits on each runtime. All 18 frozen hashes across 275 weeks pass on Node 24.19.0. Thus this is a CI/runtime mismatch, not a Stage 8 saved-output regression. The Stage 1 review already records Node 24.19.0 as the baseline runtime.

Minimal correction: pin the main test job to Node 24.19.0. Do not round saved prescriptions or replace frozen hashes. This restores the recorded verification environment; it does not claim that floating-point JSON is portable across all JavaScript engines.

## Five-scenario replay

The reported 5 blocked cases and 10 blocked gates reproduce. Each case fails `complete-calendar` and `inclusive-visit-minute-contract` under the latest Stage 7 inclusive duration estimates. These are real conservative hard-limit conflicts, not grounds to reduce warm-ups/rests or clear athlete readiness.

| Case | Blocked weeks | First blocked week | Specific evidence |
| --- | ---: | ---: | --- |
| A | 9 | 1 | Tue essential range 78–104 min and Thu 82–111 min exceed 75-minute windows even at their lower bounds. |
| B | 20 | 1 | Training visit upper estimates exceed hard caps; event separately estimates 135 min against 130 min, with unconfirmed event permission. |
| C | 8 | 8 | Later training visits exceed hard caps; event permission remains athlete input. |
| D | 3 | 1 | Wed essential work may exceed its hard limit; recovery evidence is not athlete clearance. |
| E | 11 | 1 | Thu essential work cannot fit its hard limit. |

There is also an evaluator schema regression: Stage 7 separate visits carry `rangeMinutes`, while the audit checked only the legacy `totalMinutes`. C has seven separate visits with ranges. The audit now accepts valid inclusive ranges using their upper bound, keeps the recovery gap and existing caps, rejects malformed/over-cap ranges, and takes the larger bound if both representations exist. This removes a false reason for rejecting those separate visits; C's genuine later conflicts still keep its overall gate blocked. No acceptance threshold is weakened.

The event-time gate correctly credits explicit fail-closed behavior while retaining the unresolved permission/time issues for athlete review. It does not authorize B's event. No general exception for blocked training visits has been added.

## Validation and remaining hold

- Node 22 targeted scheduling suite before correction: 3 pass, 1 fingerprint failure, exact reported hashes reproduced.
- Node 24.19.0 `npm test` after correction: 323 pass, 0 fail, 0 skipped, including all saved hashes and range-proof regression assertions.
- `node scripts/replay-coaching-rounds.cjs --output <scratch>`: exit 1; frozen-five remains 5 blocked, 10/44 gates blocked; subsequent stages intentionally not executed.
- `node scripts/replay-coaching-depth.cjs <scratch>`: 18/18 criteria pass, athleteApproval false.
- Full saved-output comparison against PR #107: identical on each runtime independently.
- `git diff --check`: clean.

Stop here: clearing the remaining replay requires a separately scoped scheduling/feasibility review or genuine athlete changes to availability/priorities, beyond this minimal CI/evaluator correction. No scheduler redesign, merge, deployment or programme activation was performed. Release hold remains. Changes are local; no branch push or GitHub comment was made.
