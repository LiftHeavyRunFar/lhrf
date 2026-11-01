# Priya — unchanged five-athlete retest

**Legitimate coaching progress is demonstrated. The scoped changes pass review as a candidate implementation, with athlete-specific conditions retained.** This is not unconditional approval to perform every future session. L's unsupported marathon remains blocked, and N's post-race peak remains conditional on actual recovery and completed training.

The same K–O inputs were replayed through the canonical engine. Fixture SHA256 is still `fa52f05b76055696b73ef402339deb17e010c43879203fc837458e1bb415169c`. The original failing review is preserved in `coaching-round-three-priya-review.md`; it has not been rewritten to make the before/after comparison disappear.

Review source: full native prescriptions in `coaching-rounds-current/round-three/K.json` through `O.json`, their `prescription-metrics.json`, and direct inspection of the shared generation changes. The new acceptance report contains 18 passing criteria; that software result supports, but does not replace, the prescription review below. No real athlete records or approved programme were activated or changed.

## Actual prescription changes

| Profile | Before | Revised output | Review |
|---|---|---|---|
| K: established marathon runner | Last three running weeks had no work-pace metres; background deadlift stayed 2×3 at 120 kg, RPE 7.5, three days before marathon | Taper work is now 4 km, 3 km and 1.2 km at current-fitness race rhythm. Final two weeks reduce lower lifting to one triple at RPE 5.5; Thursday deadlift is 85 kg. Bench becomes one triple at RPE 6 per exposure. | Corrects the principal taper mismatch while keeping the demanding specific block. |
| L: short first-marathon preparation | Eight-week marathon from 18 km/week was correctly blocked, but the blocked projection still contained quality work | Every week remains blocked; no work-pace metres are prescribed in the blocked running projection | Correct safeguard retained. This is not an adequate race programme merely because the engine can display a calendar. |
| M: bench-only competition | Squat/deadlift followed global progression toward RPE 8 doubles despite lower-body maintenance intent | Non-competing lifts default to maintenance: squat 2×3 at 145 kg, RPE 7.5; deadlift 2×3 at 172.5 kg, RPE 7.5, rather than heavier progressing triples/doubles. Event-week support is light. | The contract now separates the bench objective from supporting lifts. Heavy bench practice is retained. |
| N: half marathon then powerlifting | Squat 2×3 at 125 kg, RPE 7.5, the day after the half; unchanged deadlift later that recovery week | Next-day squat is removed; bench is one triple at 67.5 kg, RPE 6. Thursday deadlift is one triple at 105 kg, RPE 5.5. Running remains absent that week. | Recovery is now coordinated across sports. Future heavy work explicitly requires a handover review. |
| O: two-visit strength athlete | Completed same-lift improvements did not influence a newly requested programme | Two eligible repeated observations per lift now produce a bounded calibration proposal with evidence, dates and approval requirement | Addresses the static-baseline gap at the new-proposal boundary; does not silently modify a saved programme. |

### K: taper and endurance support

The peak actual training week remains 97.23 km and the longest training run remains 32 km. The specific phase still includes 12 km marathon-pace doses, whereas the taper reminders are much smaller. They replace easy metres inside the reduced week rather than adding another full quality session. Pace is tied to the supplied current performance, not the faster 2:45 aspiration.

The final three training volumes remain approximately 64.13, 51.13 and 20.7 km before the race itself. Background strength is reduced in the final fortnight; it is not incorrectly reported as reduced throughout all three taper weeks. The Thursday deadlift three days before the race is now a small light technique dose, not the previous unchanged maintenance workload. A real runner can still elect to omit it if fatigue or soreness warrants that decision.

The dated 18 October marathon now produces the same recovery interpretation whether supplied as the existing performance result or duplicated in the separate marathon-date field. The first week is consequently a provisional 44.28 km easy return rather than 75 km with quality. This does not claim the athlete is necessarily unrecovered 15 days after racing: a valid dated normal-recovery report can resolve that context. The unchanged fixture supplies no such dated report, so the provisional response is appropriate.

### M: maintain supporting lifts without weakening the bench peak

The revised programme retains genuinely different bench workloads. Week six still contains a 140 kg single at RPE 8.5, volume work and speed doubles. The final heavy bench is still 142.5 kg at RPE 9 on Monday of meet week, with light Wednesday practice. The support change has not accidentally converted the main competition goal to maintenance.

Per-lift intent is now represented in `strengthModes`, with non-competing lifts defaulting to maintenance for a single-lift event and explicit objectives able to override that default. Maintenance is not synonymous with negligible effort: two triples at RPE 7.5 can be a reasonable retained stimulus. The key change is that the programme no longer forces those supporting lifts through an unrelated progressive peak.

### N: recovery improved, later heavy sessions remain conditional

Race-week lower lifting is reduced too, so a coincident strength-block transition does not restore a full maintenance dose immediately before the half marathon. The recovery week then removes next-day lower lifting and bounds later work.

The calendar still proposes RPE 8.5 singles on 21 December, eight days after the half, and later final-heavy practices. These loads are not newly proven ready. The post-event handover now carries an explicit review instruction through subsequent weeks: confirm actual event recovery and completed training before accepting the next heavy or specific block; elapsed days alone do not establish readiness. This is an improvement in the proposal contract, not an implemented physiological recovery detector. Keep that distinction visible when presenting future weeks.

### O: evidence now changes a new proposal

The unchanged O fixture contains no completed history, so its initial prescriptions rightly remain unchanged. The independent counterfactual adds squat 135×5, bench 90×5 and deadlift 170×5 at RPE 7 on two distinct completed dates. Previously this produced the identical programme. It now raises proposed baselines by a bounded 5%, from 150/100/190 kg to 157.5/105/199.5 kg, retaining the observed estimates separately. First-week suggested top sets consequently change from squat 120 to 125 kg, bench 80 to 85 kg and deadlift 152.5 to 160 kg at the same target effort.

This is bounded proposal calibration using eligible evidence; the observed estimates are not treated as tested maxes. It requires approval and does not claim that in-session adjustment, weekly review and a newly requested programme are the same operation.

## Observation and preservation checks

Changing long-run recovery from 24 to 96 hours now changes both sessions and review warnings. The full reported 96 hours is retained, quality is withheld and long-run extension is bounded pending review. Changing observed duration from 145 to 220 minutes also changes output and review context. These are product review rules, not validated injury thresholds.

The refinement marker is applied at the explicit new-programme boundary. Existing saved version-two records without it retain their prior interpretation. Running-module verification compared all 56 unchanged K–O weekly assessments without the marker against the previous committed module: the complete JSON outputs were identical. Root regression testing covers the wider proposal/approval boundary separately.

## Remaining limits and verdict

- O's visit allocation was not redesigned: three main lifts still share the short Thursday while Saturday has more capacity. That remains an optimisation opportunity, not a claim that the current arrangement cannot be performed.
- Two strength visits cannot provide three separate heavy, volume and speed days for every lift. Heavy work plus back-offs and a second volume exposure can still reflect useful training qualities; lack of a separate speed day alone is not grounds to reject O.
- Future race results, completed mileage, recovered readiness and lifting progress are unknown. L remains unsuitable for the requested dated marathon, and N requires the post-event check before its planned peak is accepted.
- These captures do not test real watch delivery, athlete adherence, injury outcomes or competition results.

**Retest verdict:** the originally identified shared recovery, taper, per-lift-intent and proposal-calibration gaps have been materially addressed without hand-editing these five programmes. Retain these exact profiles and acceptance checks for regression coverage. Further engine development should focus on better visit allocation and evidence-led follow-up rather than claiming every planning choice is now settled.
