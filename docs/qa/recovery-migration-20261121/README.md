# Synthetic recovery / migration evidence packet

Exact tested QA revision: `6dc8b83b7428df54aa70808ab1292118ee46c39c`. Application recovery package: `85d267c334e6ec7b5f6fac49747bd60316d7a0f9`, artifact 14702265911. This packet changes neither runtime nor hosted copy.

Read [evidence.json](evidence.json) for source digests, every capture's raw-file SHA-256, receipt filename, counts, occurrence identities and each disposition. [verification.txt](verification.txt) records 9 local Node passes, no failures/skips, on the exact committed QA source. Read [the matrix](../../combined-private-practice-review.md#recoverymigration-review-packet--21-november-2026) for reused browser evidence and limits.

## Files for review

- `writer-A` through `writer-D`: four constructed fictional captures and receipts. A and D use the durable-recovery JSON shape; B and C use explicit raw-key captures. A and C deliberately overlap. The reviewed history retains the same strength session ID in weeks 1 and 2, one run and the original history.
- `reconciled-history.json`: exact main-history archive after the one-time dry-run import. SHA-256 `1bccadff03532ae04035b8445dd155105bdfac9f639b8df7686de39cb03654c0`.
- `unresolved-sidecar*`: local and durable variants plus an identical retained raw copy. Import is refused; both variants remain readable.
- `conflict-100` and `conflict-105`: identical completed occurrence identity but conflicting set weights. Each main history restored separately for comparison; no combined migration.
- `unfinished-0` through `unfinished-3`: live draft, pending run, replacement lock and transaction markers. All held. Their full raw values stay in the files.
- `settings-variant`: a main-state settings change outside the bounded append-only reconciliation. Held for explicit review.
- `freeze-writer`: ancillary key changes reproduce the old QA boundary gap. The new review-only wrapper refuses changed, added or removed keys, including a change queued while acquiring the import lock.
- `checksum-sidecar` and `corrupt-sidecar`: valid source and intentionally corrupted durable checksum. The corrupt copy is retained and rejected; receipt inconsistency and a capture file changed after review are also refused.

All names, values, origins and receipt times are fictional. Receipt clock `2026-11-21T13:00:00Z` is a fixture, not an execution timestamp or claim of a real complete writer census. No network calls, host sign-in, actual athlete records or product migration are used by these tests.

## Boundaries

The frozen #204 adapter is QA-only and unwired. Its clean-profile restore covers complete **main history**, including main settings and unknown fields; separate ancillary keys and unfinished drafts are archived, not applied or resumed. The new wrapper validates the operator evidence and full key inventory under the cooperative import lock. It cannot retrofit an already-loaded legacy client or stop an uncooperative writer racing after a read. Existing missing-capture, missing-receipt, unresolved-edit and unenforceable-freeze migration/recruitment gates remain closed.

This is local synthetic storage-model QA. Previous exact-build Chromium results are reused separately. Hosted UI authentication remains blocked and was not retried. Physical Android crash acceptance is deferred without reopening Mark's completed Pixel retest. Qualified human coaching, new build and release approval remain reserved.
