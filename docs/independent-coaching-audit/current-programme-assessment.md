# Owner's November programme: repository evidence, not a device inspection

Prepared for Ella, Chief of Staff, 7 November 2026 (Europe/London). Source baseline `0ae327bdb9dfe11e189ff4a9b066d1406bc48f07`.

**The documented revised bench-peak pattern is plausible as a short, effort-governed preparation. The lower-body dose is intentionally very light in the checked-in configuration; its continued suitability cannot be established without current recovery and strength evidence. The reported 5K supports faster pace estimates than the original 65-minute 10K, but neither result has been independently verified here.** No live programme, history, activation or device store was opened or changed.

## What can be attributed

`programmes/november-2026.json` is a five-calendar-week configuration starting Tuesday 27 October, with a 160 kg bench baseline, three requested bench exposures, one squat and one deadlift exposure, two runs, a bench competition on 28 November and a 10K on 29 November. It uses `review-v1`, `topSetFirst:true`, `lightLifts:['squat','deadlift']`, lower-body baselines of zero, a 65-minute 10K and a reported 20 km/week running base. It is not a frozen complete prescription or the device's `activeSchedule`.

`src/programme-install.js:60-84` contains a previously approved, programme-scoped running refresh: a reported outdoor 5K of 28:20 replaces the single running reference, with `resultDate:null`, `effort:'performance'`, a 60-minute 10K aspiration and workout-library version 1. Lines 89-118 add the distinct bench roles/accessories. Lines 120-146 add bench peak version 2 and the final-heavy target six days out. These code paths are evidence of intended revision behaviour, not proof of device installation or of the performances. Historical approval strings are not new approval for this audit to run a migration.

The replay in [owner-policy-replay.json](owner-policy-replay.json), reproduced with `node docs/independent-coaching-audit/reproduce-owner-policy.cjs`, compares (a) the checked-in configuration and (b) the documented revision-marker hypothesis. It uses empty synthetic history and never calls install, refresh, approval, storage or new-programme APIs. Source SHA-256 hashes and assumptions are embedded. Dates before 7 November are model output, **not claimed completed sessions**. Source input and synthetic state are asserted unchanged.

Actual attribution needs an owner-authorised export containing the exact `customRoadmap`, policy/revision/equipment markers, `activeSchedule`, week, overrides, approved decisions, completed prescriptions, sets/runs with identities and original dates, recovery evidence, and relevant programme/migration archives; app/source version and export time; any protected live draft. Keep private exports outside this repository. A screenshot or a base configuration alone cannot establish why a protected or overridden prescription appeared. A dated report of current symptoms, normal activity, recent sessions and goals is also needed for coaching interpretation. Garmin, watch, heart-rate, sleep and other private device records were unavailable; none are inferred.

There is an additional active-programme boundary: `src/programme-replacement.js:36-40,59` and `index.html:619-626` read an approved `reviewedProgramme` snapshot when present. Later performance or recovery entries do not automatically regenerate those frozen sessions. This is deliberate preservation, not evidence of a newly recalculated recovery restriction. If the owner installed a reviewed replacement, neither replay hypothesis here identifies its prescriptions. Obtain `reviewedProgramme.weeks` and `originalNative` plus source digest and approval context in that case.

The existing [draft November investigation, PR #124](https://github.com/LiftHeavyRunFar/lhrf/pull/124), reviewed at commit `86fc018584ff13502b90fe8d33174889398824db`, reports an earlier **synthetic** reproduction of 2 × 3 at RPE 6, 18 days after a fictional marathon, via `endurance-support-v1`. That is a different signature from the light-flag RPE-5.5 triples here, and from the first-fortnight RPE-5.5 doubles. Its report explicitly lacks the owner snapshot. It is useful prior forensic context, not private-record verification or proof of present causation. Its historical UI-reference findings are not assumed current after subsequent history changes on main. Other open coaching PRs are not included in this baseline and were not merged.

## Why lower-body work is limited

Confirmed mechanism: in `coach-engine.js:1261,1318-1320`, the saved light-lift flag bypasses normal heavy/top-set progression and gives squat and deadlift each **2 × 3 at RPE 5.5**, falling to 1 × 3 in event week. Zero kg denotes an unknown working load to select through warm-ups, not a prescription to lift zero or an absent exercise. The flag remains through this entire saved block; the owner configuration has no recent-marathon date or dated recovery resolution.

A controlled causality probe changes only this flag on a synthetic copy. It restores top sets and back-offs in weeks 1–4, demonstrating that the flag is sufficient to explain the limitation. That output is deliberately **not** a recommended alternative: it jumps straight to RPE-8 lower-body work, lacks verified lower-body capacity and may impose avoidable fatigue before bench/10K events.

Unresolved attribution: whether the original light flag was chosen for marathon recovery, preference, bench priority, time, or a combination. Older documentation mentions light lower-body work, but is not proof that the owner remains fatigued. A temporary recovery intent stored as an indefinite preference can outlive its rationale; that warrants review, not automatic deletion. The separate confirmed new-policy marathon contradictions in the defect register are not evidence that those rules produced this `review-v1` schedule.

Evidence-supported alternative for discussion: if recovery is satisfactory and retaining/developing lower strength remains a goal, agree a modest, non-fatiguing dose with meaningful effort and a review date; choose initial load from actual comfortable sets. If fatigue remains, continue or further reduce affected work and review its cause. Close to 28 November, avoid a sudden volume restoration, unfamiliar exercise, or near-max lower-body test. Maintenance evidence supports reducing volume while retaining sufficient stimulus; it does not establish that RPE-5.5 triples maintain this athlete's strength indefinitely, nor that one universal maintenance dose exists.

## Bench volume, intensity and remaining preparation

The documented-marker replay gives the following **main bench** dose, excluding supplementary exercises. Light speed doubles are counted as prescribed sets but are not equivalent to hard volume sets.

| Calendar week | Main sets / repetitions | Heavy exposure | Interpretation |
|---|---:|---|---|
| 27 Oct–1 Nov (partial opening week) | 14 / 42 | 30 Oct: 147.5 × 1, RPE ceiling 8 | Controlled volume plus heavy practice and 6 × 2 speed/technique |
| 2–8 Nov | 14 / 42 | 6 Nov: 150 × 1, ceiling 8.5 | Volume main work 1 × 5 + 3 × 5; speed remains light |
| 9–15 Nov | 13 / 33 | 13 Nov: 150 × 1, ceiling 8.5 | Volume shifts to fours; heavy back-offs reduce |
| 16–22 Nov | 7 / 16 | 22 Nov: 152.5 × 1, ceiling 9 | Friday 20 Nov becomes 2 × 2 at RPE 5.5; Sunday replaces speed, with only one easy double after the single |
| 23–29 Nov | 2 / 4 | None before 28 Nov meet | Tuesday 24 Nov light doubles; no Friday bench; event retained |

At the stored 160 kg reference these singles are about 92.2%, 93.8%, 93.8% and 95.3%. They are starting suggestions; exact RPE cannot be guaranteed from a percentage. Actual warm-ups and reported effort must govern. There are eight non-speed main sets in week 2, seven in week 3, five in week 4 and two light technique sets in event week; supplementary pressing contributes additional stress and must be considered separately. Merely reporting 14 sets would overstate the hard-set dose.

The pattern preserves competition movement, increases exposure to heavier singles and removes volume/support near the meet. That is defensible. The exact RPE-9 single six days out is a coaching choice, not a result established by a powerlifting survey or a small cessation trial. Alternatives include a lower ceiling or an earlier final heavy exposure if fatigue, technique, past taper response or soreness warrant. An athlete who reports a comfortable single should not repeat attempts to reach the ceiling. Do not accelerate because the chart average falls during a taper: the app's repetition-weighted average and peak top-set intensity measure different things (`index.html:382-396`).

The remaining dated exposures above are provisional until compared with the actual saved prescriptions and completed training. An observed failure at 150 kg, inaccurate 160 kg reference, accumulating discomfort, missed weeks or a protected override could materially change this assessment. Conversely, no evidence here justifies a wholesale replacement of the existing peak.

## Running paces, mileage and adjacent events

| Reference hypothesis | Estimated 10K | Easy band | Estimated threshold band |
|---|---|---|---|
| Checked-in 65-minute 10K | 65:00 (6:30/km) | 7:40–9:06/km | 6:23–6:33/km |
| Documented reported 28:20 5K | about 59:04 (5:54/km) | 6:58–8:16/km | 5:50–6:00/km |

These are calculations from `runningPaces`/`repaceThresholdRun` (`coach-engine.js:290-303`), using a fixed 1.06 distance-extrapolation exponent and a one-hour-race-equivalent threshold estimate. They are not measured lactate/ventilatory thresholds. The 60-minute goal is 6:00/km, slightly slower than the 5K-derived prediction; documented race-pace repeats use 5:55–6:05/km. Thus the revised pace is internally consistent with that *reported* 5K, while the old reference yields substantially slower estimates. A marathon-training 10K need not represent race capacity; effort and date need confirmation before ranking results. Terrain, heat, measurement and the following-day race also matter. Easy pace is an advisory range, not a compulsory minimum speed.

Actual replayed preparation distances under both saved-policy hypotheses are **15.65, 16.15, 17.45, 17.70 and 6.50 km**, plus the separate final 10K event. Older documentation's approximately 20–22 km summaries do not match this baseline's replay; use the generated sessions. In the documented-marker replay, controlled work is approximately 14, 14, 19 and 19 minutes in the four loading weeks. The Saturday long easy run is 9.5, 10, 10.25 and 10.5 km. Two runs/week is a meaningful constraint for a stronger 10K build, but may fit a bench-priority compromise; it does not prove that more running is immediately tolerable or desired.

The 21 November 10.5 km easy run precedes the final heavy bench on 22 November. That is not automatically harmful to upper-body performance, but time on feet and individual fatigue response deserve review. The bench meet and next-day 10K remain separate events. A bench-only meet does not have the same lower-body cost as a full powerlifting meet, yet whole-day travel, sleep and effort can still affect the 10K. Agree which outcome has priority, and make the 29 November effort conditional on actual post-meet recovery. No predicted race result is guaranteed.

## Decisions supported now

1. Obtain exact snapshot/provenance before attributing a displayed or saved session to a rule.
2. Review the ongoing purpose of light lower-body work against current evidence; avoid a late abrupt loading increase.
3. No evidence here supports replacing the documented peak. Compare the actual snapshot and performance before proposing a specific change; approve any change explicitly.
4. Confirm the reported 5K's intent/date/conditions and the actual installed running revision; keep pace effort-governed.
5. Treat adjacent-event readiness as a fresh athlete decision. This audit made no live changes.
