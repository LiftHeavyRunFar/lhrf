# Android acceptance corrections — release candidate

Baseline: production `e92e843e72482ecaf754672c5eac1aba733ea50b` (merged #119).
Branch: `fix/android-equipment-and-ux`. No merge, deployment or programme activation is authorised.

## Workout-start correction

Ordinary commercial gym equipment and the named standard execution conventions are now available by default. Legacy missing/unknown ordinary flags are interpreted through a derived policy; opening the app does not rewrite the inventory, prescriptions, workouts, RPE, Garmin records or athlete settings. The synthetic 3 November November-block bench prescription passes the start audit unchanged.

Exactly fourteen specialist checkboxes are shown in Settings and onboarding: SSB; trap/hex bar; Swiss/football bar; cambered bar; deadlift bar; resistance bands; chains; Slingshot/bench assistance; belt squat; reverse hyper; GHD; Nordic station; block-pull blocks; landmine. Unchecked/unknown specialist equipment is unavailable. Existing explicit selections and old aliases are preserved. Venue identifiers are retained internally for historical load identity but removed from normal controls.

A genuine, previously explicit ordinary-equipment absence is still respected. An intentional reset is available in Advanced recovery after confirmation, without changing specialist flags or venue identity. Ambiguous legacy execution remains guarded and can be reviewed explicitly in recovery. Load identity, dose units, venue-change recalibration and the exercise eligibility audit remain in place.

The extra availability flags do not add new movements or new band/chain loading algorithms to the existing exercise library. Unsupported movements stay unregistered and cannot be prescribed merely because a checkbox is selected.

## UX corrections

- Five Settings destinations: Programme management, Gym equipment, Garmin and connected services, Data and backups, Advanced settings.
- Programme management has Review current programme (read only; saved goals/schedule/prescriptions) and Start a new programme (existing onboarding with saved answers prefilled). Unknown experience/current recovery is still asked rather than invented.
- Existing-athlete preview uses an isolated in-memory copy. Changing or cancelling a proposal does not overwrite the current programme, history or stored answers. A feasible replacement uses the existing native programme builder and Stage 8 package/preview/verified-backup/explicit-consent/commit flow. No new generation or storage architecture is introduced.
- Manual JSON/fingerprint/rollback controls are under Advanced recovery. Imported packets still require their independent fingerprint. Owner-generated proposals compute their fingerprint through the existing package API, then still require dated review, downloaded/read-back backup verification and explicit approval.
- Blocking coaching gates remain enforced. Normal safety notices are brief; complete reasons remain under Coach’s notes. Some goal/schedule combinations can remain infeasible and must be revised; they are never forced through approval. The existing Stage 8 schema must accept a proposal before it can be applied.
- Garmin has one primary Import Garmin runs action; file imports and connection tools are under Advanced. Credentials, import logic and activity associations are unchanged.
- One Download backup action; Restore from backup label; concise storage guidance. Clear training data is in Advanced recovery and requires explicit confirmation. Backup/replacement/rollback modules are unchanged.
- Small visible dots with accessible targets/labels; upcoming cards are compact, horizontally swipeable and keyboard navigable, without arrow buttons.
- Compact strength doses and running distance/pace/interval summary; one visible estimated-duration line. Full instructions, intervals and shorter-session controls remain available in details. Existing background lock, internal touch scrolling, focus containment, Escape and scroll restoration are retained.

## Verification

Local policy, parsing/history and syntax checks pass. The PR records the exact published SHA and final complete CI results. CI reruns the complete Node/coaching/mobile/Garmin/backup/rollback/PWA regressions and adds `android-corrections.browser.cjs` against the pinned production shell. It reproduces the equipment blocker, updates the same synthetic device, starts the original bench workout without a programme change, verifies all 14 choices and five destinations, previews/cancels a prefilled proposal, checks Garmin/backup disclosure, swipes upcoming cards and reopens offline with exact main-state preservation.

`mobile-ux-115-evidence` retains Android-width `android-before-*.png`, `android-after-*.png`, the existing mobile evidence and this report. All athlete data and browser storage in tests are fictional. No live Garmin calls or athlete storage access is performed.

The coaching engine, active November package, saved histories, calibration algorithms, Garmin parser/connection code and Stage 8 transaction/backup/rollback engine are not rewritten. The approved equipment eligibility default is the deliberate policy change; specialist and explicit-absence safeguards remain tested.

## Remaining checks and release route

Physical owner-device/TalkBack/font scaling/address-bar/on-screen-keyboard/back-gesture checks remain necessary. A mixed cached page missing the new policy helper remains readable and fails closed until the update completes. Legacy snapshots that already stripped required exercises cannot be repaired by silently changing prescriptions; they need deliberate programme review. Standard absence overrides require explicit recovery confirmation. Unsupported specialist movement variants remain unavailable in the library.

Ella and owner should review the exact SHA, CI, screenshots and unchanged November prescriptions, then approve the normal same-origin production release. Verify whether merging main auto-publishes before approving a merge. Keep a verified backup as a precaution; do not clear site data, rerun onboarding, regenerate November or require a JSON import. Accept the PWA update between workouts and confirm bench start, original RPE, Garmin links, equipment choices and offline reopening. Keep the previous application commit for a code-only rollback that preserves local storage. Do not merge or deploy this draft without approval.
