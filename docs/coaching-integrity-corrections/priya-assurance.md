# Priya's independent assurance: prescription and evidence integrity

Baseline: PR #128, `cc8eef90b628269758bfdcb9b383aee8c41e2895`. Review date: 7 November 2026. I reviewed the actual engine changes, activation/review callbacks, synthetic tests, final README, engineering report and before/after proof independently. I added `tests/coaching-integrity-assurance.test.cjs`; its fifteen controls pass. The three-file focused suite below covers the integrity corrections and preserved characterizations; full-suite results are recorded in the PR. The proof's corrected-source hash matches the reviewed engine. No private athlete/device records, activation, merge or deployment were used.

**Decision: the corrected behavior is suitable for review as an IA01/IA02 integrity fix. It is not evidence that the training policy is physiologically optimal or safe for every athlete.** Recovery policy, ordinary generation, progression factors and coaching-policy choices remain separately reviewable. Full repository checks and CI are recorded in the PR.

## Challenges that changed the correction

| Independent challenge | Reproduced failure and verified result |
| --- | --- |
| Legacy threshold labels were not explicit `role:'work'` | The initial draft shortened a threshold repetition while retaining `workMinutes:20` and claiming all work was preserved. Canonical threshold labels now become work on a copy before fitting. Both a feasible reduction and an impossible cut retain every work/recovery distance and pace; the original prescription is retained. |
| Numeric timing and the actual Garmin pace target could conflict | A 10 km step with `paceSeconds:360` but text `9:00–9:10/km` initially became an apparent 55-minute run whose exported target implied over eighty minutes. Numeric/text contradictions now defer the adjustment. A contradictory easy-run header pace also defers; a quality header is compared with work targets rather than its deliberately slower warm-up. |
| A time-only quality run could silently become easy | The reused fitter's unknown-distance branch assumes easy running. A 20-minute work/10-minute recovery prescription initially became 27 minutes easy, retaining stale work metadata. The correction now defers this unsupported timed-quality shape. Legitimate timed easy running remains supported and distance remains unknown. |
| A partial frozen calendar could make old evidence look current | With only weeks 1–3 saved, November tops initially earned extra progression in late December, because omitted weeks counted as no due visits. Current-calendar due witnesses now prevent that inference without regenerating past doses or imposing a universal age cutoff. |
| Source-week labels could disguise forty-eight-hour catch-up work | Three old weekly prescriptions completed on 25/26/27 November initially looked recurrent. Actual completion dates must now span a preserved planned recurrence. One-day-delayed genuine weekly visits remain a passing positive control. |
| Strict execution requirements could block ordinary registered lifting | Requiring every optional `execution` field would exclude PR #128 C's standard registered squat. The final check requires credible registered identity/setup/load/dose and matches execution when supplied. My actual C-generated squat control progresses without inventing an execution subtype. Genuinely untyped source and recorded setup remain insufficient for extra progression. |
| Failed/optional/warm-up rows or contradictory purpose could appear comparable | Controls reject boolean flags, role/category aliases, unreliable/approximate effort, explicit purpose conflicts, different setup/execution, and inconsistent prescribed reps/target. Both typed reviewed snapshots and the actual completed-prescription log shape remain usable positive controls. |

## What the controls establish

For IA01, an approved easy run actually shortens its distance steps and coherent duration bounds. Decoded FIT distances match the revised executable prescription. Quality reductions retain all work/recovery repetitions and paces, trimming available easy support first. Protected long runs and event sessions remain exact. Impossible, contradictory or unsupported adjustments retain the original work with an explicit `not-applied` reason. The actual activation callback refuses such a result before confirmation or live-state writes, preventing a partially adjusted week from silently replacing the active one.

Frozen reviewed-programme selection follows a different existing path and does not call the adjustment helper. The final review callback therefore refuses a **new accepted running-duration reduction** for a frozen programme before writing a decision, override or other state, and explains that a separate reviewed replacement is required. My extracted-callback control verifies an exact no-op for the entire stored state, no save/populate/refresh calls and no false approval message. It also verifies that ordinary mutable-programme approval and frozen-programme rejection retain their existing decision-recording flows, with original RPE, history, frozen prescriptions and Garmin associations unchanged. This is a fail-closed boundary, not an overlay or an implementation of running reductions inside frozen snapshots. Previously recorded approvals are not rewritten; their existence does not establish that a frozen prescription changed.

Existing visit estimates and final weekly intensity checks are recalculated from the actual adjusted sessions. The twenty/thirty-percent distance guard is retained as an existing product rule, not validated as a universal intensity distribution. If preserving all quality conflicts with that guard or the accepted duration, review is required; the fix does not silently remove repetitions to manufacture feasibility. A factor of one remains a no-op, short runs are not lengthened, and repeated application is idempotent.

For IA02, three distinct completed visits need preserved comparable purpose and source identity, actual dates and the current programme's due context. Duplicate, stale, future, dense, unlinked or wrongly attributed rows cannot create an extra increase. A missing recorded execution field may use credible preserved prescription context; an explicit contradictory execution cannot. Past purpose is not reconstructed from a new engine replay. Taper/event, maintenance, recovery concerns, completed targets, previous proposals and approval safeguards remain effective.

The optional increase remains a proposal. Its wording now describes repeated comparable performance and explicitly disclaims proof of physiological adaptation. Invalid evidence is not erased or relabelled. Missing provenance declines the extra suggestion with an explanation; it does not remove normal planned progression, RPE-led execution, historical context or the athlete's ability to request review.

## Preservation and recovery comparisons

The A/B/C full forward prescriptions match the PR #128 JSON artifact exactly at the serialization boundary. Original RPE, completed prescriptions and synthetic Garmin activity associations remain unchanged; historical FIT work still exports its original distance. Rejected/missing approval is an exact no-op. Reconstructing the original synthetic baseline after withdrawing its decision restores that baseline without rewriting completed work. The pure integrity helper is not the application replacement/rollback transaction; that existing transaction has separate controls in the November review branch.

I also compared twenty-four complete recovery blocks against the original PR #128 engine loaded independently: A/B/C across fast, slow, uncertain, worsening and partial recovery, including paired structured-evidence controls. Every block matched exactly and inputs remained unchanged. These are the fictional inputs in the separate recovery-proposal PR; they are not claims of clinical recovery or evidence that the modest-running-base A should attempt a marathon. IA03/IA04 remain characterized defects, not silently corrected recovery policy in this branch.

## Remaining limits and explicit tradeoffs

- The recurrence test is an evidence-validity choice, not a research-established minimum adaptation period. It can conservatively decline a plausible compressed reschedule, such as three weekly visits completed on 10/16/22 November rather than 8/15/22, because no pair spans its original recurrence. Baseline progression and human review remain available. Do not describe this as proving that the athlete failed to adapt.
- A minimum of three comparable visits, the existing 2.5% option, effort comparisons, intensity ceiling and fitter minima remain product defaults. This correction does not validate their coaching efficacy or create a new universal 7/14/42-day window. Ordinary material changes still need the broader objective/adherence/recovery review and athlete approval described in PR #128.
- Conservative deferral can inconvenience a legitimate reduction or older log. The explanation must remain visible and actionable. It must not silently restore provoking training, clear symptoms or make a history entry disappear. Immediate injury/safety response remains separate from normal trend review.
- Frozen programmes, completed history and activity associations must remain protected in future changes. The tests use synthetic stored associations and offline FIT bytes, not access to a Garmin account or device. No owner November dose is inferred here.

Reproduce the focused checks with:

```sh
node --test tests/coaching-integrity-assurance.test.cjs tests/coaching-integrity.test.cjs tests/independent-coaching-audit.test.cjs
```

The initial drafts did fail meaningful counterexamples, and the final controls retain legitimate positive cases. Passing these software checks supports the stated integrity repair; it does not endorse every unchanged coaching rule or authorise production activation.
