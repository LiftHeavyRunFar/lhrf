# Engineering review and replacement blockers

Alex, App Engineer, reporting to Ella. Review date: **7 November 2026, Europe/London**. Runtime baseline: `0ae327bdb9dfe11e189ff4a9b066d1406bc48f07`. This branch adds reports, a non-installable manifest and synthetic tests. Every previously tracked file remains unchanged.

## What the evidence can establish

The owner supplied a limited sanitized summary of the actual 7 November backup. It is evidence for the listed prescriptions, completions and metadata. It is not the backup bytes, a full native calendar, athlete identity or a recoverable device snapshot. The summary contains no exact owner session IDs, effective overrides, full future heavy/volume/support/run rows, live/pending state, or dated current symptoms/next-day observations. No record IDs, hashes, recovery reports or unreported completions have been invented.

Only the **8 November speed bench before row** supports an exact numeric before/after comparison. [Rowan's ledger](coaching-proposal.md#exactness-and-approval-blocker) lists all later repository-template opportunities for review without claiming those owner sessions exist. The proposed 95/115/130 kg starting caps are human coaching choices, not a recovery policy implementation or automatic engine progression. The 15 November speed repeat and final-heavy effort discussion also remain conditional targets; the latter has no invented date or kg.

The new confirmed 77.5 kg supersedes #130's repository-only 87.5 kg Sunday hypothesis for the owner's 8 November dose. The lower metadata also supersedes a light-flag-only attribution. Earlier audit reports remain historical evidence and are not rewritten.

## Precise packaging blocker

A safe owner-native package would require all of the following, privately outside Git:

1. Original backup bytes/export context and SHA-256; matching athlete identity/programme digest; exact active schedule and approved overrides; source reviewed/native weeks or another trustworthy preserved complete calendar. Missing weeks must not be regenerated from current logs and labelled original.
2. Whole-date protected context: completed and partly logged workouts, original sets/RPE, run components, Garmin associations, source week/session identity, active/pending drafts, archive and current equipment/time constraints.
3. Dated current task-specific recovery and recent bench/running response, including the 6 November bench response and the following-day lower response. Actual performance cannot be replaced with invented pain-free observations. New review evidence must be appended without editing original RPE.
4. An exact complete future diff and feasible native candidate with every support/run component reviewed, then Ella/Rowan sign-off, Priya's independent challenge and athlete agreement to that concrete version. Feasibility flags may not be set true merely to satisfy validation.

These inputs are absent. Therefore no owner-native programme, package fingerprint, source digest or backup hash is generated. `review-manifest.json` deliberately uses a different schema, has null provenance fields, `replacementReady:false` and `activated:false`. Tests show that `validateProgramme` and `createPackage` reject it. It cannot stand in for `lhrf-shared-programme-v1` or `lhrf-reviewed-replacement-v1`.

## Existing replacement route and identity

Use the existing mechanism after a later source-complete review; this task changes none of it:

- `src/programme-replacement.js`: `createPackage` binds complete native prescriptions to the source programme, athlete identity and original set/run anchors; `verifyPackage` verifies the independent fingerprint and source. Original evidence edits invalidate that binding. A new genuine log may require a new coaching review even when the anchor check permits it.
- `createReplacement` previews a future-only calendar and preserves today/past/logged/partly logged dates. **It creates a distinct stable replacement ID**. The original programme identity, calendar, decisions, overrides and reviewed context remain archived; historical session IDs and source-week identity remain attached to protected work. Identity preservation means preserving lineage and history, not reusing the original active ID for different prescriptions.
- `scripts/package-reviewed-programme.cjs` is the existing offline packaging CLI. Use it only on privately stored complete native/source files with the reviewed source-code SHA, exact expected native SHA-256 and explicit approval context. Verify the native bytes and a complete before/after independently. The CLI does not itself provide coaching approval or proof of physiological suitability. Do not run it on the sanitized summary or store its owner outputs in Git.
- The later device workflow verifies the package fingerprint, shows the current-day dated preview, requires a fresh downloaded and byte-verified backup plus explicit athlete consent, rejects changed state/live drafts, and journals an atomic write. No storage commit is called by the new dry run.
- Rollback restores eligible future archived context through its own preview/backup/consent flow. It keeps subsequent logs, completed prescriptions and Garmin links, including newly protected dates. Rollback cannot remove fatigue already incurred.

No activation or deployment occurs in this task, even if a later reviewer accepts these reports. A source change, new symptoms, newly logged session or different review date requires a fresh comparison. If 8 November has become today/past before eventual activation, preserve it through the existing date protection rather than backdating a package.

## Dependency and integration review

| Workstream and exact reviewed head | Dependency and integration implication |
| --- | --- |
| #128 `cc8eef90b628269758bfdcb9b383aee8c41e2895` | Based on main; adds audit evidence, fixtures and characterization tests. Its tests document defects and are not desired acceptance behavior |
| #129 `34803cf9afaad3dbfce48e9c639be97be81098f1` | Based on #128; semantic recovery proposal and 24 scenario captures only. Does not implement R1–R10 or resolve IA03/IA04 |
| #130 `13ffd1570527c16dcfbdf9ce7ccc98f2c0d4b39c` | Based on #128; read-only attribution inspector and a pending manifest. Its earlier missing-evidence caveats are partly superseded by the new summary. No original owner-native calendar is supplied |
| #131 `7e2f2725e27447506613abcdf14bb4f11724e8f0` | Based on #128; edits engine/approval callbacks and the audit/shared-coach assertions for IA01/IA02. Importing #128's old test assertions after this correction could regress expectations. Existing frozen reviewed snapshots deliberately bypass running-duration adjustment; unsupported new approvals are refused, so use a separately reviewed replacement |
| This proposal | Based directly on main; consumes pinned evidence and runs sibling tests in isolated scratch archives. It imports/merges none of the four heads and changes no runtime. Green CI here cannot certify their combined integration |

#129/#130 have separate added paths relative to #128, while #131 intentionally changes an audit test already added by #128 and existing app/engine tests. A clean textual merge would not establish semantic integration. Any later integration must choose the dependency order, retain corrected IA01/IA02 expectations, rerun the full suite plus A/B/C and all 24 recovery blocks, check the inspector against actual saved shapes, and repeat frozen-package/backup/consent/history/Garmin/browser safeguards. Recovery characterization passes must not be advertised as fixed behavior. **This review grants no merge permission for #128–#131.**

## Validation

The new tests use fictional data only. They show that the incomplete review is rejected and that a single future edit to a complete fictional source uses the existing packaging/preview/rollback mechanism. They independently assert original RPE 2 and approximate review 5 coexist, protected prescriptions and Garmin rows remain exact, original identity is archived, event prescriptions remain unchanged, tampering/stale-source changes are rejected, and rollback retains later completed work. That fictional speed slot is **13 November**, not the owner's 8 November record; it proves the route, not an owner-calendar reconstruction or a training outcome.

| Check | Result |
| --- | --- |
| Untouched main full unit suite, Node 24.19.0 | 430/430 passed |
| Proposal full unit suite | 432/432 passed, including 2 new fail-closed/preservation tests |
| Existing athlete bots | 42 trajectories / 468 simulated weeks / 9,994 checks; zero failures; `readyForLiveUse:false` remains |
| Replay safety / depth | All three safety stages pass; depth 18/18; existing programme-feasibility failures remain reported |
| Priya's independent sibling checks | 91/91 focused checks; 24 complete recovery blocks hash-identical across main/#128/#131; see independent assurance |
| Local browser | No app/UI change. Existing browser/PWA/history/Garmin/replacement coverage runs in the unchanged PR CI workflow; final CI result is recorded on the draft PR |

Reproduce from the repository root:

```sh
npm test
node scripts/test-athletes.cjs --json
node scripts/replay-coaching-rounds.cjs --safety --output /tmp/lhrf-november-safety
node scripts/replay-coaching-depth.cjs /tmp/lhrf-november-depth
```

Scratch logs and isolated sibling archives stay under `/workspace/work/november/`, outside Git. There is no private backup in the checkout. Only the explicitly supplied sanitized facts and fictional fixtures are committed. No existing QA evidence is rewritten.
