# Running coaching engine: evidence review and implementation priorities

Reviewed: 27 October 2026. Owner: Rowan, Hybrid Coaching Lead. Scope: the running prescription, athlete inputs, calendar placement and feedback rules in the shared offline coach. This records the baseline inspected before today's catalogue work; the release notes and tests must establish which recommendations actually shipped.

## Assessment

The engine has useful safeguards, but its pre-review running repertoire and fitness model are too narrow to describe it as a comprehensive running coach. Adding more named workouts helps engagement only if the selector understands the purpose, athlete suitability and recovery cost of each. A catalogue without those decisions would disguise the underlying problem.

The highest-priority defects are the single-result baseline, lack of event-specific progression and hard-work accounting inferred from text labels. An experienced running-focused athlete should not receive the same short threshold session indefinitely with an increasing mileage chart around it.

## What exists in the inspected baseline

- The live app shares `src/coach-engine.js` with preview and synthetic athlete checks. Offline operation is preserved.
- `runningAssessment` version 4 distinguishes dated race preparation from undated base building, creates provisional easy running with incomplete baseline information, fits sessions within distance/duration budgets and exposes unallocated mileage.
- It generates at most one quality session: repeated equal-distance threshold intervals, plus easy and long runs. The older approved November policy separately generates its equal-distance threshold template.
- Taper, recovery weeks, exact event dates and provisional post-event return are represented. Existing saved policies are deliberately versioned rather than silently rewritten.
- Current-fitness pace is extrapolated from one `runProfile` result. Threshold version 2 estimates one-hour race-equivalent pace; that is an approximation, not a measured threshold.
- Readiness/recovery reviews and limited progression proposals exist. Approval remains necessary for material changes to an approved programme.
- The canonical step representation already supports different lap distances and paces in the tracker/export path. That does not mean the coaching selector already knows how to prescribe those structures.

## Findings and required changes

| Priority | Finding and evidence | Required behaviour |
|---|---|---|
| P0 | `runProfile` holds one distance/time and a broad recency category. It cannot distinguish a training run from a maximal race, retain a precise result date or reconcile a faster recent 5K with an older 10K. | Retain multiple dated performances with distance, elapsed time, race/time-trial/training intent, surface, measurement method and context. Select a representative recent benchmark and explain the choice. Do not simply select the fastest projection. |
| P0 | Hard-work distance, duration estimation and repacing use `/Threshold interval/` label matching in multiple paths. Renaming work to “Pyramid” can bypass budgets or apply easy pace to work time. | Give every step semantic metadata, such as work/recovery/warm-up/cool-down and pace domain. Account for load from metadata with an explicit legacy fallback. Labels must be presentation only. |
| P0 | The recent 28:20 outdoor 5K and 65-minute 10K during marathon preparation were treated conversationally as competing “PBs”, while the engine only saw 65 minutes. The latter's effort remains unconfirmed. | A recent outdoor 5K is relevant evidence. Record its date/conditions and whether it was maximal; label the marathon-prep 10K accurately. Do not automatically overwrite the athlete's approved plan or assert that 59 minutes is assured. |
| P1 | The quality generator uses the same threshold family across 5K, 10K, half and marathon goals. Running priority primarily changes workload policy, not workout breadth. | Introduce explicit workout families and event/phase eligibility. A 5K build, 10K build, half-marathon build and marathon build must differ in purpose and progression, not just long-run limits. |
| P1 | `runningGoalSeconds` is retained as provenance in threshold repacing, but is not used to create goal-pace exposure. Work repetitions grow without a deliberate bridge towards target-race rhythm. | Separate current-fitness pace, aspirational goal pace and approved race strategy. Introduce controlled goal-pace exposure when baseline evidence supports it; make excessive goal gaps visible and reviewable. |
| P1 | The pre-review catalogue has no pyramid/inverted pyramid, fartlek, strides or sustained tempo generator. | Add purpose-tagged variants. Select among comparable stimuli for engagement, while preserving repeated benchmark sessions to measure progress. Variety must not silently add more hard running. |
| P1 | Quality is universally suppressed in taper in the newer acceptance policy. | State that this is a conservative product rule. A later reviewed taper policy may retain small, familiar faster efforts while reducing work, depending on event, experience and adjacent strength competition. No automatic new speed stimulus in race week. |
| P1 | Pace estimates are fixed until the athlete changes a baseline or approves limited proposals. The feedback module relies heavily on three comparable reported-effort entries, while treadmill work is estimated from manual speed. | Track planned versus completed work laps, actual recovery, interruptions, conditions and a brief difficulty/completion review. Never infer adaptation from missing effort or manual distance alone. Propose recalibration with confidence and supporting evidence. |
| P1 | A generic 20% hard-distance ceiling and one-quality-session limit serve as acceptance guards across profiles. They are not personalised physiology. | Keep conservative defaults for entry/hybrid cases, but distinguish distance-based load from time at intensity. Experienced running-focused profiles require a separately reviewed policy, suitable frequency, recovery and longitudinal evidence before a second quality stimulus is considered. |
| P2 | Longest recent run, consistency, available session duration, hills/terrain familiarity, injury interruptions and intensity experience are missing or incomplete. | Gather these progressively, not in one enormous onboarding form. Ask only information that changes the next prescription. Unknown values reduce confidence and prompt targeted questions. |
| P2 | Fixed session distance caps can flatten training for capable runners. A synthetic 50 km/week, five-run 10K profile with 45-minute 10K was limited to 50 km in weeks 6 and 11 despite higher requested budgets; threshold work remained about 15 minutes. | Explain capacity constraints and distinguish deliberate maintenance from a capped build. Review duration/frequency constraints before increasing volume. Do not force mileage or claim the chart's requested growth was delivered. |

## Minimum useful workout knowledge base

Each entry needs: stable ID/version, training purpose, eligible event/phase/experience, work domain, recovery type, dose bounds, prerequisites, progression/regression options, terrain constraints, hybrid conflicts, rationale and source provenance.

| Family | Purpose | Selection and limits |
|---|---|---|
| Easy / recovery | Aerobic support and recovery | Conversational effort; keep recovery and ordinary easy runs distinct. Pace is contextual, not a compulsory minimum speed. |
| Long easy | Endurance and time on feet | Derive from recent longest-run evidence, total training and time availability. Retain Mark's Saturday easy preference. |
| Threshold repetitions | Accumulate controlled sustained work | Progress duration/volume or recovery with evidence, rather than always asking for faster pace. |
| Sustained tempo | Develop uninterrupted controlled effort | Requires suitable experience and session budget; not a mandatory alternative for a returning novice. |
| Race-pace repetitions | Learn event rhythm and test feasibility | Bound target pace by credible evidence. Completion of short repeats does not prove race readiness. |
| Pyramid / inverted pyramid | Vary repetition lengths within a defined stimulus | Can be constant-domain or mixed-domain; explicitly declare which. Shorter does not automatically mean sprinting. Inverted versions must fit their own total work, not inherit the first pyramid's budget. |
| Fartlek / timed ladders | Flexible time-based controlled changes | Useful when distance measurement is poor. Define effort and recovery explicitly; do not attach false pace precision to hills. |
| Strides | Short controlled technique/leg-speed exposure | Familiarisation and full recovery; distinct from VO2-oriented intervals and all-out sprinting. |
| Hills | Event-specific strength/technique and effort work | Requires terrain choice, familiarity and recovery accounting. Outdoor pace must not be copied blindly onto inclines. |
| Progression / specific long work | Later event-specific development | Advanced and optional; do not turn an athlete's protected easy long run into a second hard session through a novelty rotation. |

For today's first release, adding pyramids and inverted pyramids should be a bounded extension of the existing controlled-work policy. Do not advertise the entire table as implemented unless its generators, selector and acceptance tests exist.

## Selection and progression contract

1. Establish the purpose of the week from event timing, current training, priority and recovery.
2. Choose only eligible session families, then check calendar spacing against hard running, long running and lower-body lifting.
3. Fit the complete session: preparation, work, all recoveries and finish. Evaluate both distance and duration. Never hide spare distance inside a huge cooldown.
4. Prefer purposeful variation within comparable load. Do not alternate every variable at once. Preserve periodic familiar sessions so adaptation can be assessed.
5. Publish a short reason: why this workout, what determines its pace, and what should change if it is too demanding.
6. Use completed-session evidence to propose one material progression at a time. Preserve the approved schedule until acceptance; never rewrite completed history.
7. Review taper and adjacent competitions as a combined calendar. Mark's 28 November bench competition remains higher priority than the 29 November 10K attempt.

## Priya's acceptance criteria

The existing tests already cover many malformed/low-volume/date-boundary cases. They now also need independently calculated work totals and positive controls for useful coaching, so blocking all intensity cannot count as success.

- Baseline provenance: a recent maximal 5K can be used; a training 10K must not silently displace it. Stale, contradictory, unmeasured and treadmill-only results reduce confidence or prompt review.
- Catalogue shape: both pyramid directions actually change lengths as declared; warm-up/cool-down exist, recoveries appear between efforts, and reversing a shape cannot inflate work unnoticed.
- Label independence: changing a display label cannot change intensity accounting, estimated duration or pace assignment.
- Load accounting: work and recovery totals independently match canonical steps; estimated time uses each lap's pace, including mixed-domain work. Budget checks run again after calendar replacement and race placement.
- Engagement: eligible multiweek plans show meaningful family variation, while easy days stay easy and benchmark sessions remain repeatable.
- Specificity: suitable running-focused 5K and 10K profiles receive appropriate race-rhythm exposure; impossible goals and missing baselines do not inherit target pace automatically.
- Calendar stress: constrained availability, doubles, adjacent lower-body work, shifted races, partial weeks, taper and post-race states either fit the policy or expose a precise review reason.
- Integration: preview, live tracker, Garmin export and actual log preserve the same steps, units and work/recovery semantics.
- Preservation: legacy approved programme hashes, completed workouts, onboarding and live logs remain intact. Recalibration is proposed, not silently activated.

Synthetic tests demonstrate software invariants and policy coverage. They cannot establish injury risk, physiological benefit or race readiness. Robustness also requires real-athlete usability, outcome follow-up and specialist review of advanced running policies.

## Primary coaching sources consulted

These sources support principles and workout families; their example prescriptions are not copied into a generic app as universally appropriate doses. Numeric product guards remain product choices unless separately supported and validated.

1. McMillan Running, **Training Plan Guide**: distinguishes endurance, stamina, speed and leg-speed work; describes race-pace practice, controlled execution and hard/easy scheduling. https://www.mcmillanrunning.com/training-plan-guide/
2. McMillan Running official support, **Fun Workout Alternatives**, updated 4 June 2025: illustrates both ladder directions, different efforts by repetition duration and swaps within a training purpose. Its more demanding examples require appropriate experience. https://mcmillan.helpscoutdocs.com/article/97-fun-workout-alternatives
3. McMillan Running, **The McMillan Method Six Step Training System**: uses representative recent performance, equivalent-event estimates and event/athlete evaluation to inform a plan. Such estimates are not guarantees. https://www.mcmillanrunning.com/mcmillans-six-step-training-system/
4. Boston Athletic Association, **10K Training**: shows progressive event-pace sessions within a wider schedule and distinct taper prescriptions. It supplies examples, not validation of LHRF's precise pace formulas, volume caps or an individual's readiness. https://www.baa.org/races/boston-10k/info-for-athletes/b-a-a-10k-training/

## Briefing position

We can substantiate the deficiencies and deliver an initial tested catalogue extension today. We cannot honestly claim a comprehensive advanced running coach after adding several templates. The next substantive milestone is a transparent baseline model and phase/event-aware selector, followed by logged-performance recalibration and deeper event-specific policies. Status must distinguish code shipped, software checks passed, and coaching capabilities still under review.

## Delivered in the first implementation, 27 October

- Pure offline catalogue in `src/running-workouts.js`: threshold repeats, race-pace repeats, both pyramid directions, ascending and descending ladders. Each has an explicit purpose, pace domain, event eligibility and primary coaching reference.
- New-programme policy `runningWorkoutVersion:1`: familiar repeats first; controlled variation for 5K/10K; half/marathon limited to threshold or event-pace repeats; final pre-event build favours race rhythm. Recovery/taper guards remain in force. Selection is deterministic and calendar-based, not yet learned from athlete outcomes.
- Variants redistribute existing work and recovery distances. They do not add work or inflate weekly distance. Tiny budgets defer variants, rather than creating negligible repetitions/recoveries. This preserves an existing conservative dose; it is not validation that the dose suits every advanced runner.
- Semantic `role:'work'` drives intensity accounting; explicit roles override names, with a legacy fallback for historical records. Each lap's pace drives mixed-session duration. A library session is not subsequently overwritten by old threshold repacing.
- Current-fitness event equivalents inform specific work. An aspirational goal cannot make work faster than the baseline estimate. An attainable slower goal can guide race-pace repeats. This is a transparent first rule, not a complete goal-readiness assessment.
- Programme inputs now record optional result date, performance versus ordinary training, outdoor/treadmill context and target event time. Ordinary training is not accepted as a performance benchmark under the new policy; stale results defer quality; impossible/future dates block approval; treadmill provenance raises a calibration review note. Multiple-result storage/reconciliation is still outstanding.
- New onboarding enables the library. Existing athletes can preview it under Plan → Edit programme & settings → Use varied running sessions, then use the existing approval flow. Current schedules, live entries, logs and onboarding are not automatically replaced. Mark's individual approved programme and baseline are not silently changed.
- Priya's local suite passes 112 tests, including 15 new library/engine tests and100 profile configurations across12 weeks. Local browser interaction verified the opt-in controls and an actual running-focused week-two pyramid preview with distinct lap lengths and pace bands.

Remaining milestones: reconcile multiple dated results; propose performance-based pace/dose changes from repeated comparable sessions; improve event-specific long-work progressions and advanced volume/frequency policies; validate specialist training decisions beyond software invariants. These are explicit limitations, not capabilities claimed for this release.
