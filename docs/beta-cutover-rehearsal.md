# Synthetic workout history cutover rehearsal

This draft starts from #180 at `239fe5f38878023e45c6dd3d855ed958d7633ff1`. That run proved two unobserved offline legacy writers can lose the first edit. The current prototype is loaded only by browser tests. It imports one snapshot of the ordinary training record into a separate versioned browser store. Old pages continue to write the legacy key and their draft keys. Beta saves do not reread the legacy value after import. The beta namespace also escapes the legacy app reset, which removes keys beginning with `lhrf`.

## Precondition for a future cutover

- Account for every old writer with outstanding work. Reconnect, complete or explicitly preserve its work, review any competing histories manually, and close all old copies before choosing the snapshot. If an offline copy cannot be accounted for, the source is not known to be complete. A storage read cannot prove every old client is idle or prove which edits were already overwritten.
- Keep an operator ledger of each known legacy copy and its outstanding edits. Record the backup digest and workout IDs for each captured copy, then verify each edit is represented once in the candidate snapshot. Halt on a missing copy, missing edit, or unresolved disagreement about a record. Comparing the current legacy key to an earlier copy cannot substitute for checking the ledger.
- Require an idle source on the browser being cut over. No active strength or running draft, pending run, or unfinished programme replacement. Export, verify and keep a separately stored legacy backup before staging. The prototype imports the ordinary main history only. It does not migrate the competition store or auxiliary keys. Approval would be required for any real-data migration.
- Use one beta workout writer. New beta tabs still use whole-record saves. This design does not solve two beta tabs racing one another. The import itself requires browser Web Locks and serializes overlapping attempts. Legacy clients do not participate in that lock.

## Staging and verification

1. Record the source revision and snapshot. Stage only from reviewed, validated source data. Leave the original legacy keys in place.
2. Check that the legacy history still matches the staged bytes and that there is still no draft or unfinished programme change. Commit with one write to the empty beta history key. If a comparison or a write fails, stop and preserve both source and stage for review.
3. Read back the imported records before opening a beta writer. Save one synthetic workout, reload, and compare the workout count and identifiers. Retrying import with an existing beta history must leave the beta bytes untouched, even when the old key holds a different snapshot.
4. If a late legacy edit survives on the old key, save it separately for manual review. Never replace the beta history with a late legacy snapshot. A legacy edit overwritten before observation cannot be recovered by this design.

## Rollback

- Before commit, discard only the uncommitted stage after confirming the beta history key is absent and saving any staged evidence. The original app and keys can still be used.
- After commit, stop beta writes and read back separate legacy and beta backups before any rollback. Check each backup's digest, workout count, and IDs. Reopening the old app exposes only its own surviving history. Verify that the new workout is still accessible in the beta view and its verified backup. Export or manually reconcile any beta work in a separately authorised process. Do not write the beta snapshot over the legacy key, or delete either history to force a retry.
- Selective storage removal, browser-wide data clearing, actual device crashes, and same-version writer conflicts remain outside the guarantee. #168 remains a release gate.

The browser rehearsal uses an isolated origin, the pinned v1.40.6 client, and fictional files written to a temporary test directory. Its operator ledger can account for every copy because the test creates all of them. It captures each legacy snapshot before another writer can overwrite it, manually combines two distinct workout records after checking the other fields agree, and halts when a known edit is absent or a native workout is active. The interrupted step closes and reopens the importer after staging. Rollback reopens the old app and separately verifies beta re-entry. It does not exercise a user-facing recovery tool, an installed-app downgrade, or a restore from backups after browser data loss.
