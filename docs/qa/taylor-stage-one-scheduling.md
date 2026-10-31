# Taylor scheduling investigation — Stage 1

Base: PR #107, `test/five-scenario-engine-review`, commit `ec13dc5121170c2c22bda5a024bdd4df3acd3d84`. Local implementation branch: `investigate/taylor-visit-allocation`. No merge, deployment, publication, real-athlete activation or data migration. Stage 2 has not begun.

## Finding

Taylor's frozen O profile requests squat priority, one squat, two bench and one deadlift exposure, two strength visits and two easy health runs. Available windows are Tuesday 120, Thursday 60, Saturday 120 and Sunday 60 minutes; mixed visits are not permitted.

Three main lifts in one visit are not inherently a coaching failure, and the original programme does not exceed its own duration estimate. But it repeatedly puts Thursday at 59.5–59.75 minutes after removing supporting work while Saturday uses about 40 of 120 minutes. This leaves almost no estimated time margin and unnecessarily concentrates squat and deadlift fatigue. The actual duration remains individual; the estimate is not a guarantee of fitting a real gym visit.

The allocation score ignores unequal minute windows. It also favours an early-week run as though it were quality work and penalises lower lifting before Sunday's second run as though that were a demanding endurance long run. Taylor actually receives easy health running. Those priorities are inappropriate here. A correction is justified as a scheduling-quality improvement, not proof that the old programme is impossible or unsafe.

## Minimal policy change and resulting programme

Only newly requested version-two proposals receive `visitAllocationVersion: 1`. For strength-first fitness/health running, calendar scoring accounts for lifting-window capacity and removes race-quality placement and endurance long-run adjacency penalties. It retains the requested Sunday run placement, explicit fixed splits, repeat-lift separation, dose-fitting, event checks and recovery rules. Other running goals retain their existing protection.

Taylor's ordinary weeks now use Tuesday squat + bench and Saturday deadlift + bench, with easy runs Thursday/Sunday. The first week estimates 63.5 minutes in each 120-minute lifting window; no time-driven supporting-volume cuts are needed across the 16-week horizon. All original run prescriptions, distances and paces remain identical; only their day changes. Requested lift frequencies remain intact in normal training weeks. The change restores originally generated support rather than increasing main-lift intensity or inventing additional exposures.

The lower sessions are four and three calendar days apart across successive weeks, instead of both lower lifts sharing Thursday. Saturday deadlift precedes a short easy Sunday health run, not a race-specific long run; actual soreness or effort overshoot still warrants using the existing recovery/adjustment instructions. This is a reasonable proposal, not a readiness guarantee.

The new calendar also changes the taper: final heavy squat is Tuesday 9 February, 11 days before the Saturday 20 February meet; deadlift and bench are Saturday 13 February, seven days out. The engine explicitly warns that squat is earlier than its preferred window. That earlier squat rehearsal is defensible with one weekly squat exposure, subsequent light technique and recovery, but remains an athlete-specific review tradeoff. No hidden last-minute exposure or frequency increase was added. Meet-day permission remains confirmed and the day-after-meet run remains omitted.

## Validation

- Unchanged PR #107 baseline: 252/252 software tests pass.
- Candidate: 256/256 software tests pass, including four new scheduling/preservation regressions.
- Existing ordered 13-profile replay: 112/112 criteria pass; six existing athlete-information/readiness conditions remain explicit. These are already-existing profiles, not Stage 2 athletes.
- Existing K–O depth replay: 18/18 criteria pass.
- Existing athlete simulations: 9,994 checks across 468 weeks; zero regression failures or coaching gaps.
- Exact complete-output hashes for 18 saved approved synthetic programmes across 275 weeks match PR #107, including calendars, loads, warnings and identities. Input/history immutability is checked. Existing legacy and approved-November golden regressions also pass in the full suite.
- Unequal-window counterfactual selects the longer visits when Tuesday/Thursday caps are exchanged. Explicit manual/fixed splits and actual endurance long-run protection remain unchanged.

Commands: `node --test --test-isolation=none tests/*.test.cjs`; `node scripts/replay-coaching-rounds.cjs --output <scratch-directory>`; `node scripts/replay-coaching-depth.cjs <scratch-directory>`; `node scripts/test-athletes.cjs --json`. Runtime: Node 24.19.0. Tests needed execution outside the restricted process sandbox because its Node synchronous subprocess calls returned EPERM, including on the unchanged baseline. Browser automation was not rerun; no UI or storage code changed, and the full suite includes browser-global/canonical-module parity checks.

Git shell fetching was unavailable because the proxy was unreachable. The exact PR commit, trees and blobs were restored through the read-only GitHub connector into an isolated local repository, verifying Git object hashes. The restored base tree is `21860e7d0d73f216c4bc306f9008dc6018d7dccf`; repository connectivity checks pass. The original checkout remains untouched.

## Stage 2 decision

Five-new-athlete validation can proceed on this candidate branch, retaining Taylor as a regression and explicitly carrying the squat-timing review condition. Passing this stage does not approve a real athlete's programme or authorise rollout. No new athlete generation was performed for Stage 2.
