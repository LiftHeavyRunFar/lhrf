# LHRF beta decision

Fictional rehearsal only. #168, recruitment and release stay gated. The owner’s existing Pixel practice pass is separate.

| Option | Rehearsal | Trade-off |
| --- | --- | --- |
| Migrate legacy workout history | A cooperative census found writer A on the test origin but missed writer B in another browser profile. B replied inside its own profile while offline and still held its fictional edit when it reconnected. The operator stopped before creating a capture receipt, stage or destination. Earlier #204 runs recovered both verified conflicting archives separately and reproduced loss of an uncaptured write within a single profile. | Keeps old history only if every included writer is positively accounted for, all intended edits are captured and reconciled, and the source can be kept idle. The installed v1.40.6 clients offer no verified cross-profile roster, acknowledged final export or enforceable stop. |
| Fresh start on a separate origin, with no import | In one synthetic browser profile the beta source opened with blank history, set up a three-day plan and saved and reloaded a workout. It issued no cross-origin request. The legacy keys, including a fictional pending run and settings, were unchanged until an explicit legacy save. That save left beta bytes unchanged. A second path on the legacy origin saw the same keys. | Beta begins with empty history and no legacy plan, draft or settings. Old records stay available in the old app. Athletes set up again and maintain separate histories. There is no later merge promise. The separate origin avoids migration's need to enumerate writers and does not fix concurrent saves within either origin. |

## What evidence is still needed

- **Migration.** Obtain a verified roster of every relevant device, profile and tab. Each writer must acknowledge its final state, supply an exact export of history and unresolved drafts, and be demonstrably unable to write after the freeze. A blank tab list, a reply from known tabs or a single current export cannot account for disconnected or unknown clients. Keep both versions when a capture conflicts. A capture made after an overwrite cannot recover the earlier bytes. [Operator rehearsal](beta-cutover-recovery.md).
- **Fresh start.** The rehearsal used the unmodified product source pinned to the owner-practice build at `131062847d7b0a14d558a12d262939b7a198c6de`, a routed Chromium origin and normal onboarding and logging. Service workers were disabled for this case. The test did not exercise manual backup import or connection actions. A hosted candidate would need verified access and isolation, a clear empty-history message, an explicit no-import boundary, and device acceptance. Use existing policy for independent coaching review and five-profile acceptance. [Release evidence](https://github.com/LiftHeavyRunFar/lhrf/pull/202).

## Decision for Mark

Choose whether to pursue a separate-origin, no-import beta once its remaining gates pass, or hold beta until legacy history can be migrated safely. The first option has the shorter verified path and asks users to start with a blank programme and history. Approval of the direction is separate from approval to host, recruit, use real data or release.

## Reproduce

Use the focused #204 workflow. It checks out pinned v1.40.6 and the candidate source into separate fixture folders, runs `node tests/beta-cutover.browser.cjs`, and reports the census and blank-start outcomes. Confirm the exact workflow head and read the two case results. No network requests in these exercises reach a live app.
