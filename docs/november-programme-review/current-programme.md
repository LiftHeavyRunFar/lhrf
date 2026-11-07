# Output 1 — current programme and provenance

**Actually prescribed on the owner's device: not yet established.** No current backup, `activeSchedule`, reviewed native package or private training/device record was supplied or located. The offline inspector can establish the saved prescriptions when an export is available; it refuses to invent missing weeks. A missing saved row is not automatically a rest day.

## Confirmed repository facts

`programmes/november-2026.json` specifies bench priority, bench competition 28 November and 10K 29 November, a 160 kg declared bench reference, three requested bench exposures, one squat and one deadlift, two runs, and `lightLifts:['squat','deadlift']`. Squat/deadlift reference loads are unknown. In that policy path the light flags cause 2 × 3 at RPE 5.5, dropping to 1 × 3 in event week; unknown kg means select load through warm-ups. This is deliberate light practice, not evidence of a missing exercise or an automatic long-term maintenance optimum.

The saved configuration has **no recent marathon date or recovery resolution**. Therefore a current marathon restriction cannot be attributed to that file. Conversely, a later reviewed replacement may have different recovery metadata and dose. `reviewedProgramme.weeks` is deliberately immutable: new logs do not automatically update it. The app may also hold protected sessions, approved overrides and a live draft. These must be inspected before assigning a cause.

The older [draft PR #124](https://github.com/LiftHeavyRunFar/lhrf/pull/124), exact report commit `86fc018584ff13502b90fe8d33174889398824db`, describes a **synthetic** 18-days-post-marathon path delivering 2 × 3 at RPE 6 with `policy:'endurance-support-v1'`. The first-fortnight clip instead has `recentMarathonRecovery` and 2 × 2 at RPE 5.5. The ordinary light flag has `light:true`. These signatures help attribution; matching a number does not uniquely establish the device's branch or continued recovery need.

## Completed lower-body evidence

The following values were **reported in the earlier PR #124 investigation**, not read from original owner records in this task:

| Reported 29 October set | What it can suggest | What it cannot establish |
|---|---|---|
| Squat 100 × 3 @5; 110 × 3 @3 | These were described as easy practice | A reliable current maximum, precise safe next load or present recovery |
| Deadlift 140 × 3 @6 and @7 | A reported completed task at moderate self-rated effort | Pain-free/next-day tolerance, current readiness or equivalence of setup/execution |

No 5–7 November completed lower session, 6 November bench result, 1 November Sunday completion, current symptoms, sleep/recovery trend or Garmin record has been verified. Do not turn the reported 140 kg triples into an automatic prescribed increase. Original RPE must stay unchanged, including very low RPE and uncertain context; context-only records need not become load anchors.

The export/inspector retains the original dated rows and separates failed/unsuitable/future entries from eligible completed lower-body context. It preserves identity, role and exact setup where present and uses existing purpose-aware historical-reference logic. It does not convert a historical reference into a load recommendation.

## Tomorrow versus last Sunday: conditional repository hypothesis

The PR #128 **documented revision-marker hypothesis**, not the owner snapshot, yields:

| Work | Sunday 1 November | Sunday 8 November |
|---|---|---|
| Competition bench speed/technique | 6 × 2, 87.5 kg starting suggestion, RPE ceiling 5.5 | Same dose and ceiling |
| Seated dumbbell shoulder press | 2 × 8 at RPE 7, load by effort | Same |
| Seated cable row | 3 × 10 at RPE 7, load by effort | Same |
| Face pull | 2 × 12 at RPE 7, load by effort | Same |
| Optional cable biceps curl / rope triceps pushdown | 2 × 12 each at RPE 7 | Same, optional |

The repeated Sunday main dose has a distinct purpose: fast, clean paused practice after the heavy exposure. It is not a failed progression merely because kg repeats. End or reduce work when speed/technique deteriorates; an easy speed session does not authorise more heavy attempts. Unknown accessory loads remain unknown.

In the same hypothesis, Friday 30 October is 147.5 × 1 at ceiling 8 with back-offs, while Friday 6 November is 150 × 1 at ceiling 8.5 with back-offs. These are **prescribed model outputs, not claimed completions**. Tomorrow's suitability depends on the actual saved dose, Friday's completion/effort, Saturday running, soreness and current readiness. The raw checked-in configuration without revised markers can yield an empty Sunday in early weeks; that contrast itself shows why the installed revision matters.

## Remaining preparation

The documented peak keeps volume/heavy/speed roles, lowers main bench repetitions 42→42→33→16→4 across five calendar weeks, makes 20 November light technique and uses a final 152.5 kg suggested single at ceiling 9 on Sunday 22 November, six days before the meet. Tuesday 24 November is light; no Friday bench is added before the competition. This is a plausible pattern, not proof of an individually optimal six-day taper or a recommendation to chase RPE 9.

Keep current competition priorities visible: the next-day 10K is conditional on post-meet recovery, logistics and sleep, not guaranteed readiness. This review establishes no reason to add missed work, extra maximum attempts, unfamiliar lower-body exercises or a sudden restoration of full leg volume. A restriction should have a reason and review point, but removing it requires current evidence and a separately approved future prescription.

## Minimum attribution packet

The existing backup captures `customRoadmap`, active week/schedule, matching reviewed snapshot and `originalNative`, approval/policy markers, recovery evidence, original sets/runs/completions, decisions/overrides, equipment identities, programme archives and allowlisted device drafts. Record export time and app/source version if visible. Retain the original file and its SHA-256. A report should distinguish raw saved, effective approved overrides, protected historical sessions and unresolved component overrides. See [export-and-review](export-and-review.md).
