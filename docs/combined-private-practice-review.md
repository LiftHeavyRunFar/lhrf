# Combined private-practice candidate

## Recovery matrix · 21 November 2026

Runtime identity is #208 `60a89595e1ad3d3a16c152d9dd9069c6bac9cfae`, build `1.40.6-owner-60a89595e1ad`, artifact 14415288569, ZIP SHA-256 `f502a3b618495ded50fe053f037f298c6b39a6d7f8794ad07b3019126f538849`. All 43 runtime-file digests remain mandatory before testing. The QA branch changes test and evidence files only.

The 21 November daily-operations run was complete before this extension. Reuse its exact graceful-restart evidence at QA head `aff9ca3c8e1e42ec8261d5790e8b1bc9b52ccb42`, focused run 44884193392. Both jobs passed without skips. Wider run 44884193327 passed all four jobs with six conditional production-upgrade/Android steps skipped.

| Condition | Evidence and disposition |
| --- | --- |
| Offline tab close/reopen, five fictional configurations | Passed at `e49bfb75`, run 44496454365. Reuse existing result. |
| Balanced athlete completes strength and running offline | Passed at `ffdb3e14`, run 44705617790. Reuse existing result. |
| Graceful persistent Chromium shutdown and offline relaunch | Passed at `aff9ca3c`, run 44884193392. Reuse existing result. The strength draft survived a whole-browser relaunch, followed by both-discipline completion. |
| Abrupt SIGKILL with unfinished strength | New bounded case in the existing test. Its current result, exact QA revision and CI log are recorded in #209. Require a verified killed main PID, same persistent profile, offline mode before app navigation, service-worker control, exact main/draft readback, one completion and preservation after offline reload/reconnect. |
| Abrupt SIGKILL with logged run awaiting workout completion | New bounded case with the same requirements. The run is logged while the workout remains unfinished. Both new cases execute independently and a failure in either fails acceptance. |
| Local abrupt-browser execution | The execution workspace rejected an AF_UNIX socket with `PermissionError: [Errno 1] Operation not permitted`. Hosted CI is the available browser route. This socket check supplies no crash-recovery pass. |
| Kill during a storage operation, writes never acknowledged, power loss or OS/disk-buffer loss | Untested. SIGKILL follows observable saved main/draft state without a deliberate flush or graceful close. It cannot establish durability under physical power loss. |
| Android process eviction, installed-app crash, device storage loss, physical downgrade or clean-profile device restore | Untested by this extension. The completed owner Pixel result retains its recorded scope. |
| Competing already-loaded/offline legacy writers | #204 still reproduces an unseen overwrite. Separate captured-history restoration passed. Missing captures, receipts or unresolved offline edits block migration. This extension does not protect those writers. |
| Qualified human coaching and release approval | Remain separate, with human findings pending in the existing coaching packet. |

The abrupt test discovers only the Chromium main process with its exact disposable user-data directory and requires that its parent is this test runner. It sends SIGKILL to that main process and its discovered descendants, waits for context disconnection and verifies the main PID exited before relaunch. It never requests a graceful close or storage flush before termination. Each case uses a separate fictional disk profile and only the isolated localhost runtime. The original prescriptions and app runtime are unchanged. A failed identity check or unverifiable termination supplies no pass.

The private practice installation of this exact #208 package was separately approved and recorded on 20 November in #208, Sites v4. The older installation section below is the retained pre-publication plan. This test authorises no hosting/installation change. Future build-specific approval, physical acceptance and human-review gates remain explicit. Migration and recruitment remain gated.


This isolated draft combines #207 f478ad7dac6c401eddedf30facba47d8107f21fc and #206 9c641909a461a78f4f7ddb636adf4eb187fc7dbc, including #205 practice-only connection guards. Both parents remain draft. No catalogue prescriptions, dates, reference maxes, fatigue policy, storage schema or production build are changed by this integration.

## Exact verification

The meet-entry workflow builds the exact pull-request head. Existing source and package browser checks cover both lifting templates, off-schedule meet review, cancel/accept, active-workout rejection, failed saves, retained running and completed history. Earned-bench browser acceptance now also exercises a failed reversal and retry, and then saves a later catalogue race in the same fictional profile for each powerlifting template. It verifies original and adjusted workout audit fields, earlier workouts and sets, reviewed strength/running plans, and a non-empty disconnected Garmin sentinel after reload. The shifted fictional running start is test-only and is not coaching advice. Node protection tests retain their original fixture dates.

All progression audit assertions concern durable completed-workout fields. There is no new original-versus-adjusted History comparison screen. Existing reviewed race occurrences are retained, including older easy-run classifications; the race fix applies to newly generated occurrences only. No real Garmin connection is exercised. Chromium mobile emulation is separate from physical Pixel acceptance. Independent AI QA is separate from independent qualified human coaching review.

## Installation and rollback gate

No hosting or installation is authorised by this draft. Retain the exact candidate artifact, SHA-256, source revision and CI job/skip evidence before requesting one owner-only practice update approval. The current hosted owner build remains 131062847d7b0a14d558a12d262939b7a198c6de on the existing separate private origin.

Keep the verified current version 3 archive from run 43764603868 artifact 14181991476 (SHA-256 c63c7dac71ef021702e41e6120d468405d26267cd9964c781d9341c685019000) and saved Sites version appgprj_6af977c3c0f08191a187fd8c40326bc7~appgver_65dfd4be597c8191922050c3d61478da. Before any approved update, verify that archive still downloads and matches; otherwise stop. Save fictional practice history and any active draft without clearing storage. Finish or explicitly retain active work before updating. If rollback is needed, preserve raw current main/live/pending records separately, restore only the prior static assets on the same private origin, keep storage intact, and verify exact fictional record IDs and values after reload. Do not replay an old state over newer records or claim rollback recovers uncaptured legacy writes. Stop on an unresolved draft or record mismatch. This plan is not a claim of a newly executed hosted downgrade.

Owner-only access, direct signed-out asset denials, exact hosted bytes, updater, existing-history retention and offline reopen must be reverified after a separately approved update. #168 real-data migration and recruitment stay gated; #170 remains off and #195 separate. Physical new-feature acceptance, independent human coaching review and real-use/release approval remain open.


## Candidate evidence follow-up · 19 November 2026

The five offline recovery passes in #206 run 44486053180 used source 8bb45c04e1875d9e1d076089904ddd62db5aebb8 and artifact 14510975933. They do not establish the same five journeys on this candidate. #208 remains source 60a89595e1ad3d3a16c152d9dd9069c6bac9cfae, build 1.40.6-owner-60a89595e1ad, retained artifact 14415288569 from run 44279141619, ZIP SHA-256 f502a3b618495ded50fe053f037f298c6b39a6d7f8794ad07b3019126f538849 (43 files).

This QA-only follow-up retains all 43 per-file SHA-256 digests from the independently downloaded archive in tests/fixtures/owner-practice-60a89595.sha256.json and reuses the five-profile recovery logic from #206. The existing CI builds this QA branch with the unchanged candidate runtime. The harness normalises only its new full/short build identity to #208's identity, then requires every runtime byte to match the original package manifest before serving a temporary copy on disposable localhost origins. A source or package mismatch refuses the test. Existing standalone/native scenarios already passed in the exact #208 CI and are reused. The local launch failed before navigation with Chromium socket creation denied. Use this QA draft's PR evidence for the five candidate-specific results, exact test revision and run link. A passing result requires all five named case lines after the runtime digest checks. An incomplete or failed job supplies no recovery acceptance. No runtime or workflow changes are part of this follow-up.

### Migration release checklist

- [ ] Every legacy writer is accounted for by device, browser profile, origin and loaded window, including offline or suspended clients. A missing or unverified writer or raw capture blocks migration.
- [ ] Each writer's raw history, unfinished workout, pending run and available transaction state are captured separately before another stale write can replace them. An unresolved offline edit, active draft or unavailable capture blocks migration.
- [ ] Every capture has an acknowledged receipt with writer, origin, build, capture time and zone, occurrence IDs, record counts and SHA-256. A missing receipt, unavailable file, checksum mismatch or failed exact readback blocks migration.
- [ ] Conflicting variants and omitted edits are resolved explicitly from separately retained captures. Keep both variants outside the active store and verify a clean-profile restore. An unresolved variant or unproven recovery blocks migration. Never replay an older snapshot over newer legacy or beta records.
- [ ] The freeze or alternative no-import boundary has explicit owner approval and is enforceable for the intended setup. Neither a quiet event stream, a closed visible tab nor an import lock proves every already-loaded writer is retired.

Reuse #204 c2598cfaa95f0b5182fd53be8c61ed0cc8c49b61 / run 43877934035: a marker visible before the check rejected writer B, while the controlled after-read case still overwrote writer A. A's separately captured archive restored byte for byte, SHA-256 2e27c7c09e43f83cdfeba539464d8532cdc8a2ece9eae8b8dd93de519772c126. Reuse #204 1d049059ac1af47c5b89a124c05f1b78c40541b7 / run 43934232085 for missing receipt/capture/checksum and conflicting-set refusals, and 96c9c6a02a1b9686095418cd8358ea3dd64ac52a / run 43942006055 for the incomplete writer census. The app cannot enumerate or fence every old offline client. Captured-history recovery does not recover an unseen overwritten edit. #168 migration and recruitment remain blocked.

### Coaching and physical acceptance

The existing [LHRF-202 Coaching Review Packet](https://chatgpt.com/library?file_id=libfile_fde3_f-98fc12348e708191b77fe776ffa999f4_6bf6d89e8d408191b9f451a004cfc625&account_id=personal) requires a candidate-specific addendum for the implemented bench decisions and new race-role classification. Human findings remain pending. The completed owner Pixel result on 13106284 retains its original scope. Physical acceptance of #208's new features, physical downgrade/return and clean-profile device restore remain separate. Mark's exact-build installation approval remains reserved.
