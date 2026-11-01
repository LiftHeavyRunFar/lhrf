# Stage 6 — experience evidence and competition preparation

**The missing-experience calibration failure is corrected at the native new-proposal boundary. The development change is validated; a real-athlete replacement still needs confirmed availability and readiness before activation.** No approved programme or athlete store is migrated. Private athlete output is kept outside this repository.

Base: `f22f6ad`, branch `develop/experience-calibration-stage-six`. Earlier stage evidence and frozen inputs are retained. This stage does not merge, deploy, publish or activate anything.

## Root cause

1. `beginnerPolicy()` treated every missing/unrecognised experience field as beginner/returning status. A recent demonstrated performance did not affect that branch. The resulting fixed low-percentage six-repetition entry could replace useful competition preparation.
2. Proposal calibration pooled all same-exercise rows, including numerous fatigued back-offs, and selected a same-day median. That could displace the actual top set/single. Its historical-baseline floor could also prevent sufficient downward calibration after detraining.
3. The advanced app builder invoked proposal preparation without its training records. The canonical adapter already forwarded supplied options, and the structured setup path passed data, but this builder path could omit the evidence needed for calibration.
4. In the previous private review, input mapping replaced saved reported mileage with one low observed post-marathon week. That was not proof of habitual capacity. Independently, the newer running policy required three weekly runs for ordinary quality work, excluding a purposeful bounded dose in a two-run short-race block.

## General correction

- New proposals opt into `strengthEvidenceVersion: 1` and `runningEvidenceVersion: 1`. Saved configs without those markers retain complete earlier output. Existing policy versions and athlete-reported experience are not silently rewritten.
- Calibration is lift-specific and date-bounded. It prefers main top sets, excludes back-offs, warm-ups, failed/unfinished work, optional/accessory work and unrelated variations, and requires distinct recent training days. Competition aliases require explicit execution confirmation. Repeated rows on one day do not become longitudinal evidence.
- Consistent reliable observations produce an RPE-derived **loading reference**, not a tested maximum, competition forecast or inferred training tenure. Explicit main-set evidence can supersede a stale historical baseline. Less-specific legacy observations retain the existing bounded upward calibration. The old maximum is not used as a lower floor after reliable evidence shows reduced capacity.
- Missing experience remains missing. Supported lifts receive specific work; unsupported lifts do not inherit that status. Explicit novice/returning selections remain conservative. Near-max competition singles with missing experience require representative single/competition-execution evidence, rather than rep sets alone. Contradictory or inadequate evidence blocks approval and withholds trustworthy kg instead of silently supplying beginner loads from an old maximum. The late-taper load fallback is also prevented from restoring those unconfirmed kg.
- A recent low-effort practice observation can anchor a light/maintenance dose when the exercise/load was actually performed. It does not establish a maximum or experience level, and is not transferred to variations.
- Existing approved bench volume/heavy/speed intent is translated into a validated generic `strengthExposureRoles` map. Other calendars retain their existing order. The final-heavy date still comes from the canonical real-availability calendar; no athlete-specific date or load exception is introduced.
- Competition-supported singles carry a conditional earned range with small equipment-sized increments and an explicit prior-performance/technique/warm-up rule. Calendar progression does not assert that future strength improved. A final range is permission for review, not a promised result or a mandatory weight. RPE ceilings, missed-rep avoidance and overshoot reductions govern actual loading.
- Near competition, evidence-supported peak accessories are limited in dose/effort, optional fatigue is omitted, and starting weights are reconciled with exact-exercise rep/effort observations. The first representative work set is not displaced by a fatigued heavier last set. No accessory increase is scheduled merely because fewer sets are prescribed; unavailable equipment increments must be rounded down and checked through warm-ups.
- Reported habitual running input and observed recovery-week mileage remain distinct. A versioned return observation can cap a provisional staged return after a recent marathon, without replacing the normal-capacity field or claiming recovery. Longer history and actual recovery remain review conditions.
- Two-run 5K/10K blocks can include bounded current-fitness race-rhythm practice after the initial recovery phase. The existing final-calendar intensity budget, warm-up/recovery steps, fatigue guards and visit fitting remain. A conditional quality session becomes easy work when actual recovery is not confirmed.
- An optional reported personal-best objective distinguishes PB improvement from a faster stretch aspiration. The native race strategy can offer a broader PB-first pacing band; hard event windows still check its conservative duration. Unknown fitness does not acquire invented pace. A race immediately after a strength competition carries an explicit separate recovery decision; calendar permission is not physiological clearance.
- The app builder now passes `{data}` into the canonical proposal boundary. The shell cache is versioned for an eventual approved update. No update or new-proposal path silently activates a replacement.

## Validation and coaching comparison

`regressions/O1.json`–`O3.json`, `P.json`–`T.json` and `Taylor.json` contain all **149 newly captured athlete-weeks**. Their complete exercise/running prescriptions and days are exactly equal to the Stage 5 baselines, as are saved-policy reproductions and blocked-week identities. All original facts are unchanged. O1/O3 retain the improved M/W/F distribution with zero adjacent hard-lower pairs; Taylor retains feasible longer visits; Leila/Hugo remain appropriate; Sofia remains blocked; Idris retains dated partial-week recovery; Keiko retains the actual hard-time conflict and fatigue response.

Ten new tests cover more than one favourable strength profile: differing absolute loads and historical references; explicit novice/returning status; missing experience; partial evidence across lifts; only rep evidence; typed/untyped sets; back-off/variation contamination; stale/future/failed/duplicate/missing-effort observations; contradictions; stable saved policies; short-race return observations; PB strategies and hard windows; native browser-global parity. A new mobile application-browser test verifies actual builder evidence mapping and unchanged approved storage.

The existing app-wiring assertion is **strengthened** to require `prepareNewProgramme(c,{data})`, replacing its old one-argument-call pattern. Its canonical-boundary/read-only acceptance condition is retained. No coaching threshold, frozen athlete input, saved-programme baseline or acceptance gate is relaxed.

Final results are recorded in `regression-results.json`: full software suite, unchanged earlier coaching rounds, Stage 3 safeguards, athlete simulations and browser/PWA suites. Tests establish these code behaviours, not competition readiness or physiological efficacy. The private real-athlete output contains native prescriptions only; its provenance explicitly records that no post-generation prescription edits were made.

## Private real-athlete review and remaining conditions

The read-only review runner accepts the original backup, separate explicitly supplied review options, and an output directory. It enriches a copy only with an athlete-confirmed execution fact that must match an already logged performance. It preserves original programme/athlete identities in the backup, generates a new proposal with no active namespace, compares against saved-policy output and leaves the uploaded bytes unchanged. It performs no storage/network mutation. Do not commit the real backup or private generated files.

The real profile now produces purposeful paused bench volume, heavy work, speed/commands, earned progression ranges, a six-day final-heavy taper and explicit conditional 10K preparation. Its missing experience is not filled with a fictitious intermediate/advanced category. Its historical maximum is not treated as current truth. A low recovery week is not called normal capacity. Suggested future kg and pace remain prescriptions, not observed results.

All four real weeks remain blocked by unknown whole-visit minute windows. Present pain, sleep, fatigue, post-marathon recovery and the scope of the lifting break have not been supplied. Event logistics/cutoffs and the post-meet 10K decision still need confirmation. These gaps cannot be filled with benchmark-athlete availability or a synthetic readiness score. Native numerical output is available for review, but **controlled activation is not yet recommended for this specific athlete**.

Remaining model weaknesses: RPE is subjective, two main-set days are limited evidence, execution/units/role labels must be trustworthy, and the return/loading curves are coaching heuristics. Earned ranges cannot certify the athlete will reach their upper bound. Explicit novice/returning classification still deserves context when it conflicts with current evidence. The new policy freezes calibration at proposal creation; future reinterpretation requires review and approval, rather than a silent policy migration.

## Reproduce

- `node --test --test-isolation=none tests/*.test.cjs`
- `node scripts/retest-stage-six.cjs <scratch-output>`
- `node scripts/retest-stage-three.cjs <scratch-output>`
- Existing A–E/F–J acceptance and K–O depth runners; `node scripts/test-athletes.cjs --json`.
- `node tests/experience-calibration.browser.cjs` and existing browser/PWA suites.
- Private only: `node scripts/review-athlete-programme.cjs BACKUP OPTIONS_JSON OUTPUT_DIRECTORY`. Options explicitly supply the remaining dates/horizon, reported PB and any execution confirmation. Missing daily caps remain unknown and block feasibility. Never use the native programme JSON as a replacement training-data backup.

**Ready for controlled review of the corrected engine, subject to athlete-specific gates. No real-athlete activation, merge, deployment or publication is authorised by these test results.**
