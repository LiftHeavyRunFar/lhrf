# 5 November lower-body investigation — Phase A / policy review required

Baseline: production main `776df9c21d2e96ca506e4e40d27988565d03efbf` (tree `f44d8d1af90d1eb5ec278abb59274956abf19730`). No application code, prescriptions, programme activation, athlete storage or Garmin data changed. Only this report, synthetic fixture and characterisation tests are proposed.

## Findings and confidence

**Confirmed in production code:** an unresolved post-marathon rule can produce exactly the reported 2 × 3 at 100 kg / 102.5 kg, RPE 6, and remove all accessories before time/equipment filtering. Separately, the comparable-workout matcher is tied to programme week numbers and rejects week 1 outright; a Stage 8 week reset can hide a preserved 29 October session.

**Not established for the owner's device:** which saved configuration, snapshot, metadata, creation date, baselines, overrides, recovery reports or historical row identities were actually present. The supplied four set values do not include those fields. No live athlete profile or backup was accessed. An exact numerical reproduction is not unique proof of the owner's generating branch. The original frozen package may have been created before some of the 29 October sets were recorded.

To finish attribution without uploading private records, Ella/owner should confirm only the affected saved rows' metadata: `policy`, `baseline`, `trainingRole`, `eventDate`, `eventGoal`, `eventRecoveryReview`, `recentMarathonRecovery`, any `loadAnchor`/`calibrationReason`, and whether they came from `activeSchedule`, `reviewedProgramme.originalNative` or an approved override. Also confirm replacement/start dates and whether a dated recovery clearance was already in that reviewed configuration. These are diagnostic questions, not permission to increase loads or rewrite storage.

## Loading trace

Relevant production code: `src/coach-engine.js` → `generatedSessions`, `runningStrengthSupport`, `equipmentFinish`, `ensureKnownLiftLoads`; `src/running-preparation.js` → `recoveryContext`; `index.html` → frozen `generatedSessions`/`effectiveSession` wrappers.

| Evidence supplied for 29 October | Legacy main-baseline fallback eligibility |
| --- | --- |
| Squat 100 × 3 @5 | Excluded from `loggedMax`: RPE below 6 |
| Squat 110 × 3 @3 | Excluded from `loggedMax`: RPE below 6 |
| Deadlift 140 × 3 @6 | Eligible: `140 × (1 + (3 + 10 - 6)/30) = 172.6667 kg` estimated max |
| Deadlift 140 × 3 @7 | Eligible: `140 × (1 + (3 + 10 - 7)/30) = 168 kg` estimated max |

That fallback uses the last 12 eligible same-named sets and the upper middle estimate when there are two: 172.6667 kg. However, a positive saved `c.baselines[lift]` wins first, then a positive reported lift profile, then this historical fallback. Thus records can be available yet contribute **nothing** to the selected load. This legacy filter does not itself apply the dated/role/failed-set safeguards used by newer calibration paths; broadening its evidence rules casually would be unsafe.

New-proposal strength calibration is a different path: it normally requires at least two distinct recent lift days, excludes back-offs/variations and unsuitable evidence, and does not reinterpret very low-RPE practice as a tested maximum. Four sets from one day do not satisfy a two-day calibration requirement. Equipment policy adds exact variant/venue, role, load type, dose unit, reps and validity checks: missing historical identity does not authorise borrowing a load for a newly confirmed setup. With an eligible exact-setup anchor, `equipmentFinish` selects the latest matching row and takes the **minimum of its recorded load and the positive proposed load**. A separate typed synthetic reproduction finds squat 110 kg and deadlift 140 kg anchors from 29 October, yet still delivers 100 / 102.5 because the provisional recovery dose is lower. Availability of history therefore does not imply it sets the working load. These protections must remain.

### Exact synthetic reproduction (not the owner's assumed configuration)

The fixture explicitly sets refinement policy v1, session time v1 with no hard cap, intermediate experience, a fictional 18 October marathon, no dated clearance, and synthetic baselines Squat 166.6667 kg / Deadlift 170 kg. The requested session date is 5 November, 18 days after that marathon.

1. `runningStrengthSupport` is enabled by `coachingRefinementVersion >= 1`.
2. The marathon remains within its 21-day post-event window. No valid dated normal report or dedicated resolved marathon report clears it.
3. Days 15–21 select `lateReturn`: two triples, RPE 6, 60% baseline, `reducedSupport: true`, `policy: endurance-support-v1`.
4. Squat: `round(166.6667 × .60 / 2.5) × 2.5 = 100 kg`.
5. Deadlift: `round(170 × .60 / 2.5) × 2.5 = 102.5 kg`.

Replacing the four historical weights with double their values leaves both doses unchanged because the explicit baselines win. Removing both saved/profile baselines gives squat 0 kg (no eligible ≥6 RPE anchor) while deadlift still rounds from 172.6667 × .60 to 102.5 kg. **The same deadlift result can arise from different evidence sources.**

An active earlier-fortnight marathon rule has a different signature: 2 × 2 at RPE 5.5 with `recentMarathonRecovery`. Ordinary legacy `lightLifts` likewise uses a different effort signature. Do not label the reported RPE-6 triples as generic maintenance without checking their metadata.

A valid synthetic normal recovery report dated 4 November removes the late-return branch during *new draft generation* and restores ordinary strength/support selections. This is a branch-isolation experiment, **not a recommended replacement or weight increase**. It does not modify any saved snapshot. The event-selection window also expires after day 21 for a freshly generated draft, even though the cue warns that elapsed time alone is not recovery clearance. Frozen sessions do not recompute that cutoff. This policy/message distinction needs explicit review. Absence of a dated report is being treated as unresolved recovery here; comfortable training or a weekly low-fatigue entry does not necessarily populate the configuration field that this generator reads.

## Full volume pipeline

The read-only test instruments a copy of engine source in memory; production files are untouched.

| Stage | Unresolved synthetic recovery case |
| --- | --- |
| Original support pool | Squat: Bulgarian split squat, seated leg curl, weighted plank. Deadlift: back extension, lat pulldown, side plank. Intended roles: single-leg/quad support, hamstring/posterior chain, upper back, trunk |
| Main exposure selection | Endurance-support override supplies two triples per main lift, RPE 6 |
| Recovery/support policy | `exposure.reducedSupport` empties both accessory lists before they are appended to the session |
| Before time fitting | Only squat and deadlift remain: four working sets total |
| Time fitting | No hard time cap, no shorter-session request, no time-adaptation removal; the same two exercises remain |
| Equipment | Equipment policy is disabled in this isolation case; nothing is removed for availability |
| Final delivery | Squat 2 × 3 at 100; deadlift 2 × 3 at 102.5; RPE 6 |

With a dated recovery clearance, a new unconstrained draft includes four supporting exercises; the ordinary exposure policy retains two from each support pool. Again, this is not an approved prescription.

For the actual device, inspect `timeAdaptation.originalPrescription`, `changes`, `timeBudget`, `equipmentLimitations`, `loadAnchor`, and original reviewed snapshot to distinguish deliberate omission from filtering. A short delivered session alone cannot reveal which stage removed work.

## Stage 8 and historical comparison

Stage 8 preserves sets/runs and their evidence anchors, archives the old programme, creates distinct replacement session identities, and can preserve protected dates with their original source weeks. It intentionally freezes reviewed sessions. The app reads these snapshots instead of regenerating them from later logs. A provisional recovery dose can therefore remain in the saved programme even after calendar time passes or a new log is added; this is snapshot immutability, not proof that the engine is currently recomputing a restriction.

The matcher in `src/mobile-ux.js`:

- returns `null` for live source/programme week ≤1;
- otherwise demands exactly previous numeric week;
- additionally demands same day, exact ID or exact name;
- tests the first nonoptional exercise, with strict role/load-type/variant matches when those exist.

A replacement can restart at week 1 while 29 October remains historical week 1 with a different ID/name. Progress history groups records independently and still shows the session. No records need be missing. A change from straight maintenance work to a top-set/recovery role can add another rejection. The current matcher also lacks an explicit session-purpose compatibility model; simply relaxing all checks would introduce misleading comparisons.

Proposed focused UI correction for a later phase: date-bounded recent per-exercise references independent of programme week numbering; preserve exact historical values and dates; compare known equipment/variation and purpose; distinguish historical reference with unknown context from a confirmed comparable session. Show each main lift's last relevant actual sets inline beside today's sets/reps/target RPE, never as an automatic load prescription. Reject materially different executions, failed/warm-up records and future records. The current collapsed session-level reference is not sufficient for this requirement.

## Coaching assessment and policy boundary

Four light working sets total (two per lower-body lift) can be a deliberate temporary recovery/technique dose during a bench peak. That does **not** establish sufficient ongoing maintenance stimulus for this athlete. Squat 100 × 3 @5 supports the fact that 100 was previously easy; 110 @3 is low-effort practice, not a reliable near-max calibration. Deadlift 140 × 3 @6/7 makes 102.5 conspicuously conservative for the same reps unless the recovery restriction is still warranted. Current recovery, complete weekly work, technique and the reviewed objective are needed before changing the dose. No increase is authorised by these tests.

Other reductions are real product policies, not all bugs:

- injury/repeated overshoot and explicit recovery evidence can bound affected work and suppress support;
- taper and maintenance objectives reduce selected volume deliberately;
- flexible-time fitting removes optional then supporting work under an actual hard cap; preferences/missing optional minutes alone do not justify trimming in that version;
- older hard-window fitting can also reduce back-off volume and certain running-priority straight sets;
- shorter-session adaptation requires explicit acceptance and keeps its original prescription;
- missing/inconsistent experience/baselines can block a new proposal or produce RPE-guided unconfirmed loads;
- no direct incomplete-session → automatic future-load reduction was found in this pipeline; normal review recommendations and approved adjustments are separate. Incomplete/adherence review should use planned-versus-completed work, not fabricated completion.

Changing all normal adjustments to weekly-only review, removing required-support time fitting, changing recovery-clearance semantics or making frozen programmes adapt to new evidence would be **substantial coaching-policy changes**. Those conflict with currently versioned, tested behaviours. Per the brief's stop rule, Phase B is paused for Ella/Rowan review. Do not clear recovery flags or regenerate November to make the output look stronger.

Proposed review decisions: define explicit, dated recovery clearance and its relationship to frozen snapshots; treat low-RPE work as contextual practice rather than a maximum; preserve complete goal-driven required work, with hard-cap conflicts disclosed and deliberate shorter-session acceptance; use weekly adherence/performance/recovery for normal adjustment proposals, retaining immediate injury/meaningful fatigue intervention. Any approved change needs a new-policy regression matrix and must not opt the active November snapshot in implicitly.

## Garmin/UI follow-up (not implemented in this investigation)

Existing private import works; no integration redesign is needed. Follow-up should move Sync into a relevant run preview, capture the navigation origin only for that import transaction, return after a successful committed save (not cancel/error), and read actual linked activity plus prescription through existing associations for completed previews. Preserve timestamps, IDs, dedupe and links; no workout-export work. Keep these UI changes separate from coaching policy and validate offline/replacement/history integrity.

## Evidence, limitations and integration route

`tests/lower-body-investigation.test.cjs` and its fictional fixture reproduce exact loads, baseline precedence, unavailable low-RPE fallback, recovery counterfactuals, immutable frozen reads, numeric-week matching failure, exact-equipment anchor capping, and support-removal stage. The PR records final CI results and exact SHA. Existing full coaching, mobile, Garmin, PWA and Stage 8 regression jobs run unchanged.

This is an investigation PR, not a coaching fix or release candidate. It cannot certify the owner's exact baseline, actual marathon date/clearance, source snapshot or physiological maintenance needs without the diagnostic facts above. Known matching/UI issues remain unfixed pending the requested review boundary. No before/after active programme or private records were generated, activated or uploaded.

Ella/Rowan should review this report and agree the policy scope before Phase B. A later UI-only PR can address safe historical references and Garmin navigation; a separate versioned coaching PR should carry any approved policy change. Keep the existing November programme and storage intact. No merge or deployment is requested by this investigation.
