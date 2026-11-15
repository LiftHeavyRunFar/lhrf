# #168 cutover and recovery runbook

**Scope** · Fictional rehearsal on an isolated origin. The real-data gate is closed. This procedure builds on the staged import and archive restore in draft #203. The Pixel package and the hosted owner practice have separate test procedures.

## Cutover decision

1. List every legacy writer by device, browser profile, origin and app window, including offline or suspended copies. Log its last expected edit, whether it has been retrieved, the capture digest and workout IDs. A missing or unverified copy blocks cutover. A “no open tabs” screenshot, a quiet storage event stream or a matching snapshot does not establish a complete writer list. An already loaded v1.40.6 process does not use the beta import lock.
2. Stop new entries while reconciling. Bring each known copy online individually. Preserve any draft or pending run before closing or reloading that copy. If a copy cannot be observed or its work cannot be recovered, keep the gate closed. Record “unresolved” even if the latest legacy snapshot looks complete.
3. Compare each captured history with the last verified common snapshot. Match by programme occurrence and week, using sets, runs, dates and notes to disambiguate. Retain separate variants when they disagree. For the fictional distinct-ID case, compare the full adjusted snapshot with both captures and confirm every other field is identical. Never use a timestamp, latest snapshot or workout ID alone to choose a record.
4. Only in a rehearsal whose harness can account for every writer, verify the idle source, stage the reviewed bytes and verify source and stage again immediately before import. If anything arrives late, stop and preserve both. A final comparison detects a visible change. It cannot fence a surviving legacy writer or recover an unobserved overwrite.

## What to preserve at a stop

| Evidence | Keep |
| --- | --- |
| Raw histories | The last known-good legacy export, each writer’s captured snapshot, current legacy history, staged snapshot and current beta history if present. Keep each in a separate file. |
| Unfinished work | The original workout draft, pending-run record, and programme replacement journal and lock state where present. Capture only through an authorised diagnostic or export; leave an unresolved item in place if capture is unavailable. |
| Handoff log | Origin, build, device and profile, observed offline/online status, local time with zone, operator, exact error, workout/occurrence IDs, record counts per type and SHA-256 of each file. Include captures of UI errors only as supporting evidence. |

Leave original keys and browser profiles untouched. Copy raw bytes to safe storage outside the browser. Label files by source and sequence even if their timestamps or IDs match. Read them back and verify counts and digests. Keep original bytes separate from any annotated or reconciled copy.

## Recover after interruption or dispute

| Where it stopped | Operator action |
| --- | --- |
| Before commit, stage present, beta absent | Confirm which keys exist in the authorised diagnostic. Resume only if the whole writer ledger is still accounted for, the source bytes still match the saved stage, and the source is idle. The #203 retry is safe under these tested conditions. |
| Before commit, late or disputed edit | Halt without overwriting the stage. Export both staged and current legacy bytes, plus any other captures. Open them in separate isolated review profiles or as files. Resolve explicitly using the capture log. If either edit is missing, keep the case open. Test a newly approved snapshot in a fresh isolated profile. |
| Commit may have succeeded, beta present | Treat the destination as already committed. Save independent legacy and beta archives and verify digests and IDs. Never replay the legacy import over beta. Stop writers before any rehearsal rollback. Verify the legacy view and beta recovery separately. |
| Beta profile lost after a verified archive | Restore the saved ordinary beta archive with its independently recorded checksum into a clean synthetic profile. Compare exact bytes, IDs and counts, then reload. Duplicate, invalid and conflicting destinations fail closed. This route does not restore an in-progress workout, pending run, competition store or programme transaction. Preserve and review those separately. |

For a disputed shared occurrence, retain both source files and a record of the specific differences. A future authorised recovery decision must name the variant or explicitly reconciled record, the evidence used, the reviewer and the destination. Do not import either variant into an existing history simply to see it. An edit overwritten before any capture is unknown. Record it as unrecoverable from the available evidence.

**Release decision still open** · The app has no verified way to retire all installed v1.40.6 writers or enumerate offline copies. A future real-data migration needs an enforceable cutover or an explicitly approved alternative for setups with no legacy import. Pending device and release approvals remain separate. [#168](https://github.com/LiftHeavyRunFar/lhrf/issues/168) · [#203 staged rehearsal](https://github.com/LiftHeavyRunFar/lhrf/pull/203)
