# Output 2 — proposed correction, not an activated programme

Proposed review version: **`november-review-v1`**, status **pending attribution and coaching review**. No real owner package, prescription delta or load increase has been prepared. The [pending manifest](pending-review.json) is intentionally rejected by the existing native-programme importer. It is not an approval or an installable replacement.

## Smallest justified improvement now

If attribution shows a temporary restriction lacking a current rationale or review point, make explicit **why it exists, which activities it affects, what current evidence supports it, and when it will be reconsidered**. This first improvement changes the quality of the decision; it does not establish that the dose should increase. Attribute the actual saved row before discussing a correction.

| Current evidence state | Proposed action for review | Rationale / risk |
|---|---|---|
| Exact snapshot unavailable | Export and inspect; keep prescription changes empty | Avoid changing the wrong frozen/overridden programme |
| Light flag remains a deliberate bench-priority/technique preference, athlete recovering well | Confirm its purpose and a review point; no mandatory dose change | Low effort may be appropriate during a peak; do not mistake preference for unresolved marathon fatigue |
| Unresolved fatigue, symptoms or poor tolerance | Review affected activities immediately; retain or reduce provoking work as appropriate | No timer or old comfortable set clears current readiness; unaffected work need not all disappear |
| Recovery is supported by current comfortable activity and comparable lifting, and the athlete wants lower-strength retention | Consider **one bounded familiar replacement exposure in the existing lower session**, preserving frequency and initially avoiding added sets; choose effort/load only after actual warm-ups and coaching review | Removing the light flag alone can restore the full RPE-8 template and accessories; that is too large and not the intended correction |
| No clear problem beyond an easy Sunday | Preserve the distinct speed/technique purpose; compare actual execution with last week | No additional weight or maximum attempt is earned merely because the session feels easy |

The conditional lower-session option is a **coaching proposal**, not an implemented rule or exact prescription. We do not assign new kg/RPE/sets without the source snapshot, present tolerance and agreed objective. One comfortable session is informative but not enough to infer normal full-volume readiness. Review the following-day response and a subsequent comparable session before another material increase. Near 28 November, avoid a late step change in fatigue.

## Before / after boundaries

- **Bench:** preserve the exact approved remaining heavy/volume/speed/technique rows and dates unless objective/recovery evidence justifies a specific separately reviewed change. In the documented hypothesis, 8 November remains 6 × 2 at the existing light ceiling; this is not claimed as the owner's exact active session.
- **Lower body:** before = the exact attributed saved prescription, presently unavailable; after = unchanged until the identified restriction and current evidence are reviewed. A potential bounded return replaces existing work rather than adding a second leg workout or restoring all suppressed accessories.
- **Running, events and Garmin:** preserve prescriptions, activity IDs, associations and original records. A next-day 10K decision remains conditional on actual meet recovery; do not silently speed up runs to compensate for lower-body restrictions.
- **History and drafts:** every completed/partly logged/current date, original RPE and protected draft is preserved. A future proposal must not rename movement histories or rewrite a past prescription.

## Approval-gated versioned route

Use the **existing** `lhrf-reviewed-replacement-v1` package and `reviewedSnapshotVersion:1` route. Add `november-review-v1` to the human review's version/context and record the exact source backup hash, source programme digest, reviewed native SHA-256 and source-code SHA. This adds review provenance, not a new runtime recovery policy.

1. Obtain the read-only backup and a complete, trustworthy saved/native calendar. If only an active week exists, obtain the missing approved calendar; do not generate it from later logs and label it original.
2. Ella/Rowan review attribution, current performance/recovery and the **exact future dated before/after**. Agree the smallest change and its expected benefit, risks and follow-up. Recovery policy changes remain in their separate proposal PR.
3. Prepare a complete native proposal from the attributed saved snapshot, editing only the explicitly reviewed future dose. Validate the whole horizon, equipment and actual time constraints. Do not replace a fingerprint manually after editing or approve unknown feasibility flags merely to make it importable.
4. Package outside Git using the existing `scripts/package-reviewed-programme.cjs` and explicit `reviewedCommit`, `expectedNativeSha256`, and `approvalContext`. Its source binding and original-record hashes must verify. A package is still a proposal; never call app commit/storage from a CLI.
5. On the device, the existing preview shows every dated change and protects today/completed/partly logged dates. Activation requires an independently supplied fingerprint, a fresh downloaded and byte-verified backup, unchanged source state, no live/pending workout, and explicit athlete consent. **Do not perform activation in this task.**

## Rollback plan and limits

Before any later activation, retain the independently verified original backup plus source/fingerprint/proposal hashes. The existing replacement transaction archives the full previous calendar/context. If a future approved trial worsens tolerance or mismatches the reviewed intent, use **Preview rollback**, review its dated effect, obtain a fresh verified backup and explicit consent. Rollback restores eligible future programme context while retaining new sets, original RPE, Garmin rows/links and any newly protected dates; it must not delete training performed after replacement. It cannot undo physiological fatigue already incurred.

If attribution is incomplete, evidence changes during review, a draft is active, the package no longer matches the source, or a substantial coaching-policy decision is unresolved, **leave the current programme unchanged and return for review**. Preserving the live plan under the task's boundary is not an endorsement to perform provoking work; the athlete remains free to stop unsafe execution immediately.
