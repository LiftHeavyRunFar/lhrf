# Priya's independent challenge

Prepared by Priya, Quality & Data Lead, for Ella, Chief of Staff, 7 November 2026. Audited source: `0ae327bdb9dfe11e189ff4a9b066d1406bc48f07`. This review independently inspected canonical code, reproduced counterexamples, ran the investigation tests, read Rowan's actual evidence-review draft and challenged the owner-programme and synthetic-fixture interpretations. It is not another vote based on existing LHRF documentation.

**The strongest findings are inconsistent prescription state and invalid evidence eligibility, rather than proof that all LHRF programmes fail.** The engine can retain useful heavy practice, respect a faster goal without pretending it is current fitness, and leave approved work unchanged after feedback. Those positive findings do not resolve the recovery contradictions, stale/future progression evidence or incomplete application of an accepted running adjustment.

## What I challenged in the coaching standard

I read [Rowan's evidence review](evidence-review.md), including all eleven topic sections and the access limitations. I separately opened the original indexed abstracts for ACSM 2026 [E1], Robinson 2024 [E5], Moesgaard 2022 [E7] and Schumann 2022 [E18]. Their reported numerical results matched the draft. I did not independently perform a new systematic review or fully reappraise every source.

| Claim or tempting correction | Independent judgment | Consequence for this audit |
| --- | --- | --- |
| Every serious strength programme needs a fixed number of weekly sets at ≥80% 1RM | Reject the universal count. E1/E2 support a heavier-load advantage for maximal strength, largely in populations unlike an advanced bench competitor; they do not establish a mandatory weekly exposure count. | Count actual heavy practice, but classify an exact minimum as a coaching decision. Do not introduce forced maximal singles for beginners. |
| Fewer than ten bench sets proves undertraining | Reject. E1's approximately ten-set finding concerns hypertrophy; indirect sets and low-effort speed sets have different meanings. | The owner peak's 14 main sets include light speed work. Neither fourteen nor eight non-speed sets establishes individual adequacy without execution and response. |
| Static suggested kilograms proves progressive overload is absent | Reject. RPE-guided execution can increase actual load at constant relative effort. | Confirm the novice evidence-routing gap and narrow progression options; do not call all static suggestions an inevitable failure to adapt. The synthetic B replay deliberately demonstrates actual improvement despite conservative suggestions. |
| Low RPE is ineffective, or the RIR meta-regression prescribes an exact RPE optimum | Reject. E5 uses reconstructed RIR, exploratory models and modest fit; a null strength slope is not proof all loads, volumes and efforts are equivalent. | Low effort can serve recovery, familiarisation, technique or power. Persistent low-dose development warrants review, not an invented RPE floor. |
| Periodisation is mandatory, or fixed deloads should be removed because one cessation trial was unfavorable | Reject both. E7's effects are small; its trained undulating-versus-linear subgroup is imprecise (ES 0.61, CI 0.00–1.22). E9 tested complete cessation, not every reduced-volume deload. | Investigate overlapping four-/five-week reductions and their consequences. Do not replace one universal calendar with another. |
| Exact 80/20 mileage proves optimal endurance programming | Reject. E14/E15 do not show universal polarized superiority for time trials, and physiological time in zones is not prescribed work-distance share. | The audit's work-kilometre fraction is a workload description, not proof of physiological zone distribution. No automatic second quality day or elite-mileage transplant follows. |
| Concurrent training causes no interference, or every hard-run/lower-lift overlap requires a reduction | Reject both. E18 maximal-strength CI −0.20 to 0.09 still permits a small average deficit, and individual high-volume/elite responses remain uncertain. Conversely, overlap alone does not demonstrate harmful fatigue. | Check athlete priorities, accustomed workload, symptoms and objective execution. Preserve productive lower-body work unless the actual case supports changing it. |
| A speed day needs velocity hardware | Reject. Fast intent, quality and fatigue rules can be useful without a transducer; measured velocity and intended speed must remain distinct. | Do not call a light load a verified power stimulus, or add instrumentation as a prerequisite to useful coaching. |
| A six-day final-heavy bench interval is established by research | Reject. E12 describes self-reported taper practices; E11 is a review of sparse direct evidence. | A six-day interval can be a defensible individual choice, but it is not a validated universal optimum. A 95% starting suggestion may overshoot its intended effort. |
| A normal report after a marathon proves heavy loading is safe | Reject. E20's nonsignificant muscle-damage-marker differences are not a safety equivalence/noninferiority test and did not test heavy lifting. | The fast-recovery defect concerns contradictory treatment of a credible resolution, not proof the athlete should immediately squat heavily. A staged reassessment remains necessary. |
| A 2–4-week evidence window is a biological law | Reject. E22 supports monitoring value, not that exact threshold. | Retain the requested window as a governance default with early intervention for injury, significant safety concerns or an obviously failing prescription. |

Rowan's final draft incorporates these distinctions. Two limits remain explicit: Jamnick [E17] does not validate the engine's particular 1.06 race-conversion exponent or one-hour threshold estimate; those formulas require model-specific validation before claiming individual accuracy. Also, an umbrella review's large participant count is not a count of unique independent replications. The draft correctly states review overlap, ACSM's October 2024 search limit and the trained-athlete generalisation problem.

## Confirmed implementation concerns, independently reproduced

Severity here concerns the demonstrated failure, not an asserted injury. **High/P1** means prescription integrity can be materially wrong after approval. **Medium/P2** means a reproducible evidence or dose-policy contradiction with plausible training consequences and existing mitigating safeguards. These ratings do not establish real-world frequency.

| Finding | Severity and confirmed behavior | Scope and necessary limit |
| --- | --- | --- |
| An accepted duration reduction does not reduce the executable run | High/P1. `applyApprovedHybridRunning` changes a 60-minute easy run to 54 minutes while retaining 10 km, 10 km of steps at 5:30–6:00/km, and 55–60-minute duration bounds. | Approved-adjustment application defect, not initial programme generation. Actual exported/performed work may remain unreduced; the audit does not claim an injury occurred. |
| Stale and future top sets can justify current progression | Medium/P2. Three top sets dated January 2020, or January 2027, each produce `status:'progress'` at the fixed 7 November 2026 clock. The summary calls them “recent.” | `reviewSessions` does not enforce current/recent/programme evidence eligibility. The output is still optional and approval-gated; it is not a silent load increase. |
| “Multiple weeks” can mean only 48 hours | Medium/P2, part of temporal eligibility. Top sets on 4, 5 and 6 November pass the epoch-week-bin test and propose +2.5%. | Three different dates are better than three sets from one workout, but two epoch bins do not establish 2–4 weeks of adaptation evidence. The appropriate elapsed interval remains a policy decision. |
| Cleared marathon recovery is overridden for lifting | Medium/P2. The fast scenario resolves recovery before the block: running returns to aerobic foundation, but all surviving main lifting within fourteen days is forced to 2 × 2 at RPE 5.5. | `runningStrengthSupport` respects resolution; the later unconditional marathon pass in `generatedSessions` does not. This can unnecessarily suppress useful training; it does not prove heavy work is already safe. |
| Persistent lower-body recovery is interpreted differently across sports | Medium/P2. In the slow scenario the same lower-body report still bounds squat/deadlift at RPE 6–6.5, while quality running resumes once the marathon timer expires. | `generalStrengthRecovery` interprets `recoveryContext.status:'lower'`; running's `lowerFatigue` principally reads `recoveryEvidence`. A feasible C variant with marathon 11 October and report 6 November yields 28 → 28.85 → 29.70 km plus twenty quality minutes in each of the first three weeks despite bounded lifting. This is a state-meaning contradiction, not proof the precise running dose is clinically unsafe. |

The novice review-coverage limitation is **IA-05, an evidence-supported improvement**, rather than a confirmed failure to produce overload: B logs improving completed main-lift sets for eight weeks while `reviewSessions()` remains zero. The engine can still show “on-track” from effort matching, and the athlete can increase actual load using RPE. A future policy should consider novice work without treating every easy familiarisation session as a reason to accelerate.

The final source cross-check narrows IA-04's reach: `coach-intake.js:40-45` accepts context independently, whereas the normal onboarding UI supplies matching `recoveryEvidence` as well (`index.html:1448-1462`). Running does honour that matching evidence. The independent reproduction establishes inconsistent context-only routing, not that every UI report misses the guard. No actual owner or production frequency is established.

Source loci: [approved running application](../../src/coach-engine.js#L1540), [top-set evidence eligibility](../../src/coach-engine.js#L1573), [epoch-week comparison](../../src/coach-engine.js#L1649), [unconditional marathon clipping](../../src/coach-engine.js#L1489), [strength recovery interpretation](../../src/coach-engine.js#L1092), and [running fatigue interpretation](../../src/running-preparation.js#L201). The first five table rows correspond to IA-01–04; the two temporal cases share IA-02.

Reproduce the primary findings with:

```sh
node --test tests/independent-coaching-audit.test.cjs
node scripts/independent-coaching-audit.cjs
```

I independently ran the eleven investigation tests successfully, including the subsequently added failed/warm-up/optional-row eligibility case. The tests intentionally assert current problematic behavior; they must be revised when the corresponding defect is corrected. They are not coaching acceptance criteria. Fixtures, complete prescriptions, completed synthetic records, review clocks and unchanged-state checks are retained in [three-athlete-evidence.json](three-athlete-evidence.json). The temporal and duration cases are self-contained in the test file. Source hashes bind the replay to the audited modules.

## Reactive adaptation: a counterexample to workload-only diagnosis

The engine already has meaningful stability protections: review is read-only; isolated difficult feedback does not rewrite the plan; symptoms lead to review; strength acceleration requires several designated top-set exposures; approved interventions have follow-up checks; maintenance and taper phases restrict progression. A claim that it automatically rebuilds programmes after every bad workout would be false.

However, its hybrid branch can call an unchanged, accustomed load “fatigue” without poor recovery or performance. The following independent counterexample creates four identical weeks: two 8 km runs at RPE 8 and two days of 3 × 5 squats at 100 kg/RPE 8 each week, with no negative feedback. It is a counterexample to the decision logic, not a recommended training split:

```js
const coach = require('./src/coach-engine');
const now = () => Date.parse('2026-11-07T12:00:00Z');
const data = {
  activeCustomWeek: 2,
  customRoadmap: {weeks:12, coachingPolicy:'review-v2', coachingRulesVersion:2},
  activeSchedule: [{id:'future', ex:[], runs:[]}],
  sets:[], runs:[], checkins:[], sessionFeedback:[], decisions:[]
};
const ago = days => new Date(now()-days*86400000).toISOString();
for (let week=0; week<4; week++) {
  for (const offset of [1,4]) data.runs.push({
    date:ago(week*7+offset), km:8, min:40, rpe:8, type:'quality'
  });
  for (const offset of [2,5]) for (let set=0; set<3; set++) data.sets.push({
    date:ago(week*7+offset), exercise:'Squat', weight:100, reps:5,
    rpe:8, target:8, role:'straight'
  });
}
const engine = coach.createEngine({data, now});
console.log(engine.hybridAthleteBaseline());
console.log(engine.hybridRecoverySignals());
console.log(engine.reviewDecision());
```

The historical/current baseline is 16 km and lower-load score 3,000. The rolling ten-day window counts three hard runs and three lower-body days, with `strained:false`. The result is `status:'fatigue'` and a proposed 10% non-long-running-duration cut, solely because hard running overlaps demanding lower-body work ([workload eligibility](../../src/coach-engine.js#L879), [factor selection](../../src/coach-engine.js#L880)). Approval prevents automatic application, and the workload might still deserve discussion; the problem is that this evidence alone does not establish harmful interference or the correct intervention. I classify the need for richer context and a less presumptive explanation as **IA-08, an evidence-supported improvement**, not a confirmed diagnosis of overtraining.

Similarly, four-week running reductions and five-week strength reductions can create frequent low-stress weeks. Their coexistence is confirmed; calling every such week wasted would overstate the evidence. The smallest correction should evaluate actual delivered stimulus and fatigue, rather than simply deleting both safeguards.

## Where undertraining and excessive-load risks differ

- **Undertraining risks:** recovery rules suppressing training after a credible resolution; an unresolved temporary light-lift preference persisting indefinitely; novice improvement not reaching the review path; repeated low-dose/static suggestions without a stated development review; and tight time windows removing useful work. Each requires examination of the actual final calendar, not a requested volume graph.
- **Excessive-load risks:** normal quality returning despite persistent relevant recovery concerns; invalid dated evidence supporting progression; an approved reduction leaving the executable dose unchanged; abrupt restoration of work after removing a restriction; or adding heavy/plyometric work to a novice simply because group research favored it.
- **Not demonstrated:** clinical overtraining syndrome, an injury caused by LHRF, a missed personal best caused by the engine, or physiological success in the synthetic athletes. Replays test conditional logic; their completion and reported adaptation are supplied fictional outcomes.

## Challenge to the owner-programme attribution

I inspected the checked-in November configuration, the pure owner-policy replay and [current-programme assessment](current-programme-assessment.md). The explicit `lightLifts:['squat','deadlift']`, unknown lower-body baselines and saved `review-v1` policy are sufficient to explain the checked-in light dose. There is no recent-marathon date in that configuration. It would be incorrect to attribute this saved programme to the separate new-policy fourteen-/twenty-one-day rules.

The hypothetical documented revision markers give a plausible bench-peak pattern, not certification of the owner's actual current programme or readiness. The 5K is a reported reference encoded in a refresh path, not a newly observed device performance. The exact installed snapshot, revisions, protected reviewed prescriptions, active schedule, decisions, overrides and completed evidence remain necessary for attribution. An earlier unmerged investigation PR is prior analysis, not an independent physiological record or evidence that its proposed code is live.

My challenge led to more precise wording: preserve the live plan under this audit's boundary, but do not turn that preservation into an unsupported coaching endorsement. Removing the light flag in a synthetic copy demonstrates causality, not a safe late-block correction. A step from RPE-5.5 triples to full RPE-8 lower work before adjacent bench/10K events needs an individual rationale and review.

## Risks introduced by the proposed corrections

| Proposed direction | Risk to evaluate before implementation | Smallest defensible investigation |
| --- | --- | --- |
| Replace arbitrary date filtering with evidence eligibility | A rigid short cutoff may discard the only valid competition result or long-term trend; programme identity alone may exclude useful cross-block evidence. | Distinguish recent readiness evidence, historical ability and contextual failures; retain dates and reasons rather than erase records. |
| Resolve recovery contradictions | A binary “normal” report may prematurely clear impact, systemic or lift-specific fatigue; indefinite restrictions can undertrain fast recoverers. | One coherent state meaning with dated evidence, affected activities, staged return and reassessment. Test fast, slow, partial and recurrent recovery. |
| Learn from novice straight sets | Familiarisation, technique gains and misunderstood RPE can masquerade as adaptation; rapid automatic increases may overshoot tolerance. | Validate comparable completed working sets and actual outcomes, propose bounded changes, retain athlete approval. |
| Make a running reduction internally consistent | Scaling every interval/distance may destroy the intended stimulus, warm-up or recovery; always protecting the long run may retain the most fatiguing session. | Show the exact changed steps and totals, preserve purpose deliberately, recheck time/quality distribution, and select the intervention from the athlete's priority and problem. |
| Increase heavy exposure, volume or running mileage | A general research advantage can become excessive load, interfere with key sessions or worsen adherence. | Use goal-specific, minimal dose changes and actual athlete response; do not import an entire alternative template. |
| Stabilise changes over 2–4 weeks | An inflexible delay can prolong a clearly failing prescription or ignore injury. | Treat the interval as a review default; retain immediate safety action, execution autonomy and explicit rationale for earlier review. |

I also reviewed the consolidated [defect register](defect-register.md) and [correction roadmap](correction-roadmap.md). Their separation of four confirmed defects from IA-05–08 development/review improvements is justified; the novice coverage gap is confirmed behavior but does not establish inevitable failed adaptation. Prioritising coherent accepted prescriptions and valid evidence before larger dose-policy changes is proportionate. The higher-risk roadmap does not establish that every proposed increase or restructuring should be implemented.

The proposed constitution correctly separates execution within an agreed prescription from a material programme change, requires rationale and approval for normal changes, and labels its review window as a governance choice. It should be evaluated with both useful-dose positive controls and counterexamples before any policy release. Passing these investigation tests establishes reproducibility and honest limits; it does not establish the engine's long-term coaching efficacy.
