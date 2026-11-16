# #168 cutover and recovery runbook

**Scope** · Fictional rehearsal on an isolated origin. The real-data gate is closed. This procedure builds on the staged import and archive restore in draft #203. The Pixel package and the hosted owner practice have separate test procedures.

## Cutover decision

1. List every legacy writer by device, browser profile, origin and app window, including offline or suspended copies. Log its last expected edit, whether it has been retrieved, the capture digest and workout IDs. A missing or unverified copy blocks cutover. A “no open tabs” screenshot, a quiet storage event stream or a matching snapshot does not establish a complete writer list. An already loaded v1.40.6 process does not use the beta import lock.
2. Stop new entries while reconciling. Bring each known copy online individually. Preserve any draft or pending run before closing or reloading that copy. If a copy cannot be observed or its work cannot be recovered, keep the gate closed. Record “unresolved” even if the latest legacy snapshot looks complete.
3. Compare each captured history with the last verified common snapshot. Match by programme occurrence and week, using sets, runs, dates and notes to disambiguate. Retain separate variants when they disagree. For the fictional distinct-ID case, compare the full adjusted snapshot with both captures and confirm every other field is identical. Never use a timestamp, latest snapshot or workout ID alone to choose a record.
4. Only in a rehearsal whose harness can account for every writer, verify the idle source, stage the reviewed bytes and verify source and stage again immediately before import. If anything arrives late, stop and preserve both. A final comparison detects a visible change. It cannot fence a surviving legacy writer or recover an unobserved overwrite.

## Checklist for the isolated rehearsal

- [ ] In a disposable Chromium context, load the pinned v1.40.6 client and establish the full fictional writer roster (A and B). Record the test revision and run. Use the control page and two preloaded legacy tabs on the test origin.
- [ ] Capture each writer's raw history in a different file before the other writer saves. Keep its SHA-256 and the receipt that connects the writer to that file. Verify the file's checksum, workout IDs and record counts before relying on it. Retain the files outside the active store.
- [ ] Run the three cases below with the existing focused GitHub workflow, or run `node tests/beta-cutover.browser.cjs` after the workflow's pinned checkout and Playwright setup. Inspect the tested head and the case-specific log lines.
- [ ] Compare original legacy bytes, staged bytes, destination state and both archives at each refusal. Read back each restore in its own clean context. Record the disposition and both digests. Leave the real-data gate closed.

| Case | Expected evidence |
| --- | --- |
| Both writers accounted for, distinct workouts | Both archive receipts verify. Compare the complete proposed history against the two captures and common snapshot, then stage and import once across reload. Expect `tue`, `sun`, `gate-legacy-a` and `gate-legacy-b` in the destination. |
| One capture unavailable | Withhold A's file from the reviewer while the harness retains the original as evidence. Stage and commit both refuse. A missing receipt, checksum mismatch and an omitted edit also refuse. Legacy bytes and both retained files stay exact, with no stage or beta destination. A genuinely uncaptured edit cannot be recovered. |
| Same occurrence, conflicting capture contents | Both files name `gate-shared-workout` in week 1 and have identical completion rows. The associated set is 100 kg in one file and 105 kg in the other. Both operations refuse. Restore each verified file separately and compare its original bytes, including its set. Repeat the refusal and verify legacy and both files are unchanged. |

The test gate accepts only the rehearsed append-only fixture. It checks the complete records behind each occurrence and refuses a conflicting variant or any proposal that drops a verified addition. It has no role in the installed app or release approval.

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
