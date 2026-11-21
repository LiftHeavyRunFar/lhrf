# No-import draft boundary review

Current tested QA source: **51c193d10474d8beac8a9dceaf5e636c7995dc9d**. This extends the retained ab35fc7a packet and reuses 6dc8b83b / #204 / #209 results. The original 34 archived files and their manifest are unchanged.

The supported review module now creates deeply frozen, explicitly `reviewOnly` / `no-import` plans. Both `stage` and `commit` refuse before touching storage or locks, even with a valid review or serialised claims of approval. It exports no raw-adapter write bypass. Historical positive import/restore remains isolated in the frozen #204 test fixture; that is not a current import path or a deployed policy.

A new focused test **failed before the fix**: after preparing a plan, its capture list and writer/freeze metadata could be removed and staging still proceeded. The old implementation checked captured bytes, but the altered plan could omit those checks. The first failed assertion was staging; the test did not reach its commit case. At exact 51c193d1, **3 new no-import tests and 2 affected regressions passed**, no failures. Both staging and commit now refuse, with all synthetic storage bytes and all 34 retained packet-file hashes unchanged.

Read [review.json](review.json) for exact source digests, eight disposition groups, the verified pre-fix failure, current results and limits. [No-import log](no-import-verification.txt) and [affected regression log](affected-regressions.txt) are from a clean checkout of that exact commit. Other completed cases were omitted by test-name filtering; the earlier nine local checks and browser SIGKILL/legacy results are reused rather than claimed as new runs. No new CI or browser pass is claimed.

| Retained variants | Review disposition |
| --- | --- |
| Writer A / C, and B in a different week; distinct D run | Deterministic proposal only: identical occurrence once; different weeks and distinct run retained. No import. |
| 100 kg / 105 kg for the same occurrence | Human choice needed. Keep both; no last-write-wins or checksum-based selection. |
| Local / durable disagreement | Human choice needed. Keep both variants and historical observations; no automatic preference for local/latest. |
| Live draft, pending run, replacement lock/transaction | Archived unresolved. No dropping or resuming companions. Require writer-specific completion/recovery evidence. |
| Sunday versus prior training-day settings | Explicit human intent needed. No settings or prescription change. |
| Intact / deliberately corrupted checksum container | Integrity refusal. Keep both; use a separately verified source, never repair a checksum merely to permit import. |
| Freeze-writer capture | Reviewable bytes do not prove a complete writer census or enforceable freeze. No import. |

## Remaining inputs and next action

The pack is ready for review. No further test cycle is scheduled or needed for this bounded task. A future decision to enable any import requires complete writer accounting, every capture and acknowledged receipt, explicit resolution of each disputed edit, proven recovery, an enforceable freeze/boundary and separate approval of the exact implementation. A `frozen: true` flag or a synthetic roster does not supply that real-world evidence. Alternatively, a separate-origin no-import real-use design needs its own explicit owner/release approval; this document does not grant it.

No new client can retire or fence every already-loaded legacy writer. The supported QA entrypoints stay closed regardless. Ancillary/draft restoration is unapproved. Hosted UI authentication remains blocked and was not retried; physical crash acceptance remains deferred and Mark's completed Pixel retest is not reopened. Human coaching approval and any new build/installation/release decision remain separate. Both hosted copies and all real records are unchanged. £0.
