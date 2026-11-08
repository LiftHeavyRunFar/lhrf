# Remaining November: native review artifact

**8 November 2026, 00:00 UTC review clock. Recommendation: do not replace the owner's programme with this artifact.** It is a fresh, blocked diagnostic produced by the corrected general engine after Rowan's coaching checks and Priya's extended independent gate passed. It is not an approved programme, a reconstructed saved calendar or a replacement package.

[The wrapper](owner-native-proposal.json) contains the complete native output, raw diagnostic inputs, exact source hashes and blockers. Runtime source is `d6249615c32fcd1617cd7152f22773a0d892e431`; native SHA-256 is `b0271842a49e31187b08ac43c3ec204d62b7e56b61ccb4a05fab9c516cdfaafa`. Generation reproduces exactly without changing inputs. All four weeks are blocked. Package verification rejects the wrapper; no package creation, activation, history change or deployment was performed.

## What is known

The sanitized #132 summary supplies 1 November's completed bench 6×2 at 100 kg, original RPE 2 and a separately confirmed approximate RPE 5; 5 November's squat 2×3 at 120 kg/RPE 6 and deadlift 2×3 at 140 kg/RPE 7.5; the saved lower prescriptions of 100/102.5 kg at RPE 6 with marathon-return metadata; and 8 November's confirmed future speed prescription, 5×2 at 77.5 kg/ceiling 5.5. The original six RPE-2 bench rows remain unchanged. The approximate review is separate and establishes neither a maximum nor measured velocity.

The complete source calendar, native identities, exercise setup/execution, current recovery, next-day lower response, recent heavy bench and actual running data are unavailable. The diagnostic uses an assumed Tue/Thu/Fri/Sun strength pattern, generic ordinal bench roles, synthetic equipment/time feasibility parameters, maintenance/light lower goals and **zero requested training runs because actual running inputs are absent**. Zero runs does not mean the owner does not run. Training age remains unconfirmed rather than invented. No fictional running PB or target time from another athlete remains in the input.

The event's assumed 100-minute window/30-minute logistics and visit windows are modeling parameters, not owner-confirmed constraints. A missing event-duration estimate adds a final-week feasibility block; it is not evidence that the owner cannot finish within a real time limit. The principal block throughout is missing relevant bench experience/performance identity.

## Actual output and comparison

`Uncalibrated` below means native kg=0: no valid numeric suggestion, not zero-load training. These dates are the new diagnostic calendar, **not attributed saved owner sessions**. Only the 8 November before row is confirmed; the 5 November lower rows are past evidence, not a before prescription for 12 November.

| Date | Corrected native main work | Comparison and judgment |
|---|---|---|
| 8 Nov | Speed bench 2×2, uncalibrated, ceiling 5.5 | Confirmed saved: 5×2 at 77.5 kg. #132 manual: conditional 5×2 with 95 kg cap, ceiling 5.5. The partial-week speed purpose is now preserved, but the smaller uncalibrated draft does not establish a better dose or justify replacing the known row. |
| 10, 13 Nov | Bench 2×6, uncalibrated, ceiling 6 | Saved rows unknown. These are provisional calibration rows, not a demonstrated coherent competition peak or evidence that the owner is a novice. |
| 12 Nov | Squat 2×3, uncalibrated, ceiling 6; deadlift 2×3, uncalibrated, ceiling 6.5 | #132 manual caps: 115/130 kg at ceiling 6.5, conditional on current tolerance and source set count. Neither manual cap is established as safe or optimal by the summary. The native output cannot compare exact kilograms without setup/current-response evidence. |
| 15 Nov | Speed bench 2×2, uncalibrated, ceiling 5.5 | Manual candidate conditionally repeats up to five doubles at 95 kg, preserving any source taper reduction. Actual before row remains unknown; no exact owner delta is available. |
| 17, 20 Nov | Bench 3×6, uncalibrated, ceiling 6 | No heavy singles are invented from approximate speed effort. These placeholders do not establish sufficient specific heavy/volume preparation for the owner. |
| 19 Nov | Same bounded lower triples as 12 Nov | Manual candidate allows a repeat only after dated response; no automatic restoration or load increase is justified. |
| 22, 24 Nov | Technique bench 2×3, uncalibrated, ceiling 5.5 | A light final period is visible, but no saved final-heavy date/load or recent heavy performance is available to establish the owner's actual taper coherence. |
| 28 Nov | Bench competition event retained | Attempts and readiness remain unknown; no invented attempts. |
| 29 Nov | 10K event retained; pace/duration unconfirmed | No training mileage or pace is invented. Adjacent-event recovery review remains required. No guaranteed participation, pace or result. |

The complete wrapper also retains generated supporting work and warnings. No generated lift slot appears on 26–27 November; this does not prove the owner's saved days are rest. The first week contains only Sunday 8 November, followed by three complete calendar weeks. Source IDs are new diagnostic IDs and cannot be bound to the owner's saved sessions without the full source.

## Verdict and next requirements

The general corrections improve evidence use and preserve uncertainty, but this incomplete-input native output is **not demonstrably better than the active programme or the conditional manual candidate**. In particular, it cannot supply a complete useful bench peak from untyped speed practice and missing current heavy evidence. A blocked draft is not an instruction to abandon familiar training, perform its uncalibrated rows, add volume or chase an effort ceiling. Nor does the general engine validate #132's coach-selected 95/115/130 kg caps.

A source-bound review requires the full read-only native/saved snapshot, effective overrides and protected/completed-session context; exact source/session identities and trusted digest; relevant execution/equipment confirmation; dated current and subsequent recovery; recent heavy/volume bench evidence; and actual running history/performance if running prescriptions are requested. Compare the complete native calendar against that source before approving any exact replacement. Preserve original RPE, completed sessions and Garmin associations, and use the existing approval/backup/rollback transaction route only after a complete reviewed package and athlete approval exist.

Reproduce the artifact after the general gate with:

```sh
node scripts/compare-runtime-coaching.cjs --out /tmp/runtime-comparison.json --full-out /tmp/runtime-comparison-native.json --owner-out /tmp/owner-native-proposal.json
```

The wrapper is deliberately a different schema from an installable reviewed replacement. No live programme or athlete record was accessed or changed.
