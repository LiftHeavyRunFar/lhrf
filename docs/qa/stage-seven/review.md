# Stage 7 — flexible availability and realistic visit estimates

Base: `5d27f31`; dedicated branch: `develop/flexible-session-time-stage-seven`.

**Missing ordinary minutes no longer block a new otherwise eligible programme. Genuine hard limits and all earlier coaching safeguards remain. The real-athlete proposal is time-feasible, but not activated or physiologically cleared.**

## Root cause

`fitSessions()` rejected ordinary days before estimation unless a positive whole-visit cap existed. `Number(null)` became zero, so “unknown” behaved like “not enough time”. A second engine fallback blocked every proposal without a visit-constraints object. Intake also required a number for every day, and UI defaults silently supplied specific limits rather than asking whether there was a limit.

The old strength formula assigned six warm-up minutes per main movement and a fixed per-set work/rest allowance. It did not distinguish the progressive approaches and longer recovery for near-max singles. A final single plus one back-off could consequently total just 14.5 minutes. It also gave a single precise number instead of showing uncertainty.

## General implementation

- New V2 proposals receive `sessionTimeVersion: 1`. Saved configs without the marker retain their original output; explicit version zero supports reproducible historical review. No migration, active-programme refresh or athlete-data import is performed.
- Known days with unspecified/null minutes are flexible, with estimated durations and a review note rather than an availability blocker. Typical duration is a soft preference. A supplied positive per-day limit remains a hard whole-visit constraint. Invalid numbers are rejected. Mixed/separate permissions and the real minimum gap between separate visits remain required.
- The existing first-run route offers an optional typical duration, “varies / no fixed limit”, or “prefer not to specify”. Hard caps are optional advanced details, blank by default. Existing athletes do not repeat onboarding. The isolated coaching-preview route also permits blank ordinary limits. Older unversioned intake callers retain their original validation contract; both current UI routes opt into the new intake contract.
- `classifySession()` assigns **essential**, **supporting** or **optional** by this session’s metadata/purpose. A row can be essential pulling work, supporting volume or discretionary work in different sessions. Main stimuli, specific practice and important running sessions default to essential; accessories default to supporting; explicitly discretionary extras are optional. Explicit session-purpose metadata overrides exercise-name inference.
- Duration output separates essential, baseline including support, and total including optional work. General preparation, movement-specific progressive warm-ups, intensity-appropriate rests, work execution, equipment changes and mixed transitions are included. Heavy near-max practice models up to six progressive approaches. Running uses its complete prescribed duration, including interval recovery and warm-up/cool-down once, plus preparation. Separate visits have independent budgets and no fictitious combined transition.
- Estimates use ranges. The conservative upper bound is used when confirming a hard cap. When only the upper bound exceeds a cap, the output says essential work **may exceed** it; when the lower bound also exceeds it, it says **cannot fit**. Neither case is falsely cleared. Unknown essential running dose/pace remains a legitimate blocker.
- Optional work is omitted before support is reduced. Essential groups, back-offs, run repetitions, recovery steps, loads and effort ceilings are not silently cut or rushed. A remaining conflict is reported. A short independent run window does not trigger unrelated cuts to a fitting separate strength visit.
- The live preview shows priorities and duration ranges, and permits a shorter-session review **before starting**. An impossible limit cannot be accepted. Explicit acceptance creates a session-specific proposal; the approved schedule/config remains unchanged. On completing that future workout, both original and adapted prescriptions are retained with actual logged sets/runs. Removed work is never automatically stacked onto another day. Repeated dated time adaptations generate review advice requiring athlete approval, not an automatic plan change.
- Optional sets are excluded from baseline planned stress/adherence and remain skippable. Actual completed optional sets are included in completed stress; the existing real-log fatigue and recovery analysis also continues to include them. Stress summaries are heuristic work indicators, not physiological readiness scores.
- Cache version is prepared for a future approved release. Nothing is deployed, published or activated by this commit.

## Frozen comparison — do not confuse test success with programme clearance

Complete latest-policy programmes, all changed exercise/run groups and before/after time flags are in `regressions/`. All nine frozen input/history files are unchanged. All **149 weeks** are rerun. All nine **saved-policy** programmes reproduce exactly. Latest proposals preserve every calendar day, main-lift load, reps, RPE, exposure role and actual-date recovery marker. Supporting dose and some main-set counts differ: the new policy does not repeat the old fitter’s silent trimming of main back-offs/straight sets or important running distance. Those retained doses must fit or remain flagged.

| Profile | Earlier blocked weeks | Latest blocked weeks | Coaching assessment |
|---|---:|---:|---|
| O1 — powerlifting then marathon | 0 | 12 | Weekly stress spread and competition exposures retained. Mixed visits need hard-window review under full estimates. |
| O2 — marathon priority | 0 | 13 | Recovery, running priority and taper retained. Some combined strength/running visits cannot confidently be cleared under the supplied limits. |
| O3 — first powerlifting meet | 0 | 0 | Complete preparation remains time-feasible after support adjustments. |
| P — Leila | 0 | 12 | Maintenance purpose and running preparation retained; mixed-visit time risks are now visible. |
| Q — Hugo | 0 | 9 | Strength progression and distribution retained; some lifting windows require review rather than rushing heavy work. |
| R — Sofia | 8 | 8 | Still blocked without adequate running evidence; no pace/duration invented. |
| S — Idris | 0 | 11 | Actual-date recovery intervals retained; separate genuine time conflicts need review. |
| T — Keiko | 1 | 18 | Affected squat/deadlift remain bounded by fatigue. The 250-minute event still fails the 240-minute hard window. Additional ordinary mixed-visit conflicts are exposed. |
| Taylor | 0 | 0 | Tuesday/Saturday lifting distribution and protected health running retained. Full estimates fit the supplied longer visits. |

These new flags are **not waived** and are not all claims of definite impossibility: ranges can straddle a genuine cap. They identify programmes requiring a time/priority decision before approval. The scheduling model does not yet search a new whole-week calendar using the final duration ranges; it protects the established recovery distribution and flags conflicts after support adjustment. This is a remaining limitation, not a reason to inflate windows, delete essential work or weaken acceptance.

## Validation

- **302 software tests pass**, including **13 new Stage 7 tests** covering unknown/flexible/soft time, hard short limits, mixed and separate visits, heavy singles, priorities, optional actual-vs-planned stress, shortening, repeated rechecks, immutable inputs, historical preservation and latest-policy safeguards across all nine athletes.
- **9,994 simulation checks**, 42 trajectories / 468 weeks: no software failures or coaching gaps in that simulator’s scope. This is not clearance of the newly flagged hard-window cases above.
- **13 distinct browser suites** pass, including Android-style touch/viewport testing of blank-duration onboarding, impossible limits, explicit shorter-session review and live handoff, preserved approved storage, original application flows and PWA updates. Affected suites are rerun after UI changes. There is no physical Android Chrome device certification.
- All **12 Stage 3 correction gates** replay successfully under their frozen duration policy. Latest-policy tests independently verify retained hard event limits, fatigue intensity, partial-week recovery and missing-evidence restrictions.
- Four historical unit suites and two historical browser suites explicitly replay `sessionTimeVersion: 0` where their assertions compare old exact doses/time-feasibility. **No assertion, threshold, frozen fact or expected baseline is removed or relaxed.** The historical browser harness opens the now-optional advanced time panel before entering its unchanged caps. Latest-policy Node/browser generation and new time flags are tested separately; old green time assertions are not presented as latest-policy clearance.

See `regression-results.json`, `regressions/comparison.json` and the synthetic mobile screenshot. Source hashes distinguish capture revisions. Original Stage 1–6 evidence remains untouched.

## Real-athlete proposal (private output outside Git)

The original backup and Stage 6 review options are reused without additional readiness, experience, availability or performance facts. The only execution enrichment remains the athlete’s earlier confirmed paused lift. Every prescribed weight, set, rep, run distance, pace, interval and training day is numerically identical to the Stage 6 native proposal. All four ordinary time gates now pass without supplied minute windows. The old manual draft is not used to author prescriptions.

A separate PDF contains all dated native sessions and Rowan’s assessment. JSON contains the unedited engine output. Comparison/validation artifacts record unchanged backup bytes, deterministic generation and original-versus-new prescriptions. These private files and the original backup are not committed.

**Recommendation:** ready for controlled proposal review. Do not require precise ordinary session minutes as a prerequisite. Real-athlete activation still requires explicit approval and a current recovery/pain review, context about the lifting break, conditional running decisions after the marathon and a separate post-bench-meet decision before the 10K. Time-feasible is not a claim of physiological readiness. Do not import native programme JSON as a backup or overwrite an existing athlete.

## Reproduce

`node --test --test-isolation=none tests/*.test.cjs`

`node scripts/retest-stage-seven.cjs <synthetic-output-directory>`

`node scripts/test-athletes.cjs --json`

`node tests/flexible-session-time.browser.cjs` with Playwright/Chromium configured; existing browser suites also run in CI.

Private only: `node scripts/review-athlete-programme.cjs BACKUP SAME_STAGE_6_OPTIONS SEPARATE_OUTPUT_DIRECTORY`. This runner is read-only with respect to the source backup and app; it never installs a programme.
