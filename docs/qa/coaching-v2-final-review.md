# Priya: coaching fixes and sequential athlete review

The shared candidate engine has made legitimate progress. The previous baseline left all five programmes incomplete. The revised engine was replayed against the same source facts, reviewed independently, then tested against five newly randomised athletes. Only after correcting and replaying the new round was it compared with the original three scenarios.

Version 2 is now connected to structured new-programme setup in the review branch; the standalone trial keeps an explicit opt-in. See `coaching-intake-v2-review.md` for the subsequent app/browser integration review. This work does not upgrade an existing approved programme, clear fatigue, confirm unknown athlete facts or deploy the app.

## Results

| Round | Native scenarios | Executable checks | Code failures | Conditional cases |
|---|---:|---:|---:|---:|
| Frozen five | 5 | 44 | 0 | 3 |
| Fresh five | 5 | 42 | 0 | 0 |
| Original three | 3 | 26 | 0 | 3 |

The original recorded baseline had 23 blocked checks out of 34. The current acceptance set is broader, so its larger denominator is not a like-for-like score. Each original requirement was replayed; additional checks cover event rhythm, distinct strength roles, inclusive visits and actual priority handovers.

A conditional case has a working engineering response with a remaining athlete decision or evidence gap. It is not an athlete-ready approval. Passing the checks does not predict race times, competition totals or recovery.

## What changed in actual output

- All requested first-week run and strength-visit frequencies now appear in the frozen five. Earlier plans lost supporting runs behind component limits. Multiple lift exposures are grouped into actual strength visits.
- Inclusive budgets count warm-ups, work/rest and transitions. Separate Tuesday visits in C are checked independently, with the promised recovery gap. The full horizon is checked; final fitted mileage is used for running summaries.
- C switches from running-first preparation to strength-first preparation after the 5K and a recovery gate. Two easy runs replace the prior three-run contract. Running is coordinated with meet recovery; the automatic day-after-meet long run is gone.
- D responds to the actual fatigue evidence. The hard reported squat 160 kg x 5 at RPE 9 anchors a provisional 155 kg x 3 at RPE 6.5, with one easier back-off and reduced lower-body support. Normal bench practice remains. Unresolved fatigue is not cleared merely because another week has elapsed.
- Three-exposure strength calendars have distinct heavy, volume and speed doses. Recovered experienced lifters rehearse heavy singles toward RPE 8, 8.5 and 9. RPE governs suggested kilograms; overshoots prompt an adjustment rather than a forced maximum. Lower-frequency maintenance work remains tailored to the main sport.
- Race-rhythm work uses current performance. Faster aspirations do not drive training paces. Running foundation, development, specific preparation and taper labels are now exposed separately from the strength phase.

## The fresh five found a new defect

Fresh athlete H had only 60 minutes for a combined beginner lifting and 5K session. A fixed reserve underestimated two sets of six reps, so later weeks still ran over time after the first fix. Priya rejected that output. The engine now accounts for the actual beginner dose, reduces supporting straight-set volume to a retained two-set minimum when running has priority, and calibrates quality work within the remaining time. The repeat replay passes the full calendar; the original failing capture is retained.

The fresh marathon case I builds from an established 54 km baseline to the actual peak shown below, with repeated current-fitness marathon-rhythm work. This demonstrates preparation capacity under supplied history and availability, not a generic promise for every marathon runner.

| Fresh case | Goal | Peak actual training km/week | Longest run | Event-rhythm rehearsals |
|---|---|---:|---:|---:|
| F | Half marathon with a negotiable faster target | 38.05 | 20 km | 3 |
| G | Powerlifting first, then a dedicated 10K block | 39.00 | 14.8 km | 4 |
| H | First organised 5K with developing lifting skills | 14.67 | 5.75 km | 4 |
| I | Marathon build with an established aerobic base | 71.89 | 32 km | 8 |
| J | Experienced powerlifter prioritising bench with health running | 12.00 | No long run; easy running only | 0 |

## Comparison with the original three

The historical PDFs were manual handouts, not prior native-engine output. Their current Library contents were read in full and all 69 weekly summaries extracted. The comparison preserves that provenance difference. Original user facts are retained separately from all planning assumptions.

| Original scenario | Historical handout | Updated native engine | Priya judgement |
|---|---|---|---|
| Powerlifting then marathon | Peak 60 km/week; longest 30 km; marathon effort first explicit in weeks 24–25. | Peak 54.73 km/week; longest 25.15 km/240 min; 7 marathon-rhythm weeks; dated goal handover. | More explicit priority, recovery and pace rehearsal. Endurance readiness and the source assumptions still require review; a fitting calendar is insufficient. |
| Marathon priority | Peak 66 km/week; longest 32 km; 8 km marathon-pace finishes chiefly weeks 9 and 12. | Peak 68.61 km/week; longest 31.45 km; 8 marathon-rhythm weeks; recent-marathon first-week primary lifting RPE 5.5. | Broader specific rehearsal and coordinated early recovery. Confirm actual history and visit windows; the 45 km baseline is a comparison assumption. |
| First powerlifting meet | Speed bench 50 kg across most of 25 weeks; unknown rep-set effort and no tested 1RM. | Distinct heavy/volume/speed work; suggested speed bench 45–55 kg; health runs 20 min with pace/distance left unknown. | Improved role variety and effort-led calibration. Competition inexperience is not proof of lifting inexperience; training age remains a declared comparison assumption. |

The slower strength-to-marathon case reaches 25.15 km at the four-hour comparison window. That is still a demanding duration and requires an explicit check of actual pace, fuelling, recovery and whether the assumed window is realistic. The engine retains long-run-history and handover reassessment rather than certifying marathon readiness from that calendar.

For the marathon-priority case, four running days and two maintenance visits remain inherited comparison assumptions. The 2:59 result does not establish the athlete’s habitual mileage or preferred frequency; confirm those before selecting an individual programme.

The second historical PDF spans 17 weeks, although the initial user described four months. The comparison reuses that exact dated handout horizon rather than silently changing it to 16 weeks.

## Decisions still required

- B: confirm enough event-day time for the half marathon; its ordinary Sunday window is 130 minutes. The engine keeps this specific participation question blocked.
- C: confirm Saturday powerlifting meet availability. It is not assumed from the usual weekday calendar.
- D: reassess recovery before restoring affected lower-body loading. A bounded proposal is not evidence that fatigue has resolved.
- Original three: actual recent mileage, longest-run duration/recovery, training availability and (where relevant) lifting experience/rep-set effort were not supplied. The 30 km and 40–50 km histories came from explicit old-PDF assumptions. No six-week trend was manufactured to make the engine pass.
- For a constrained slow marathon build, review the actual long-run duration and supporting mileage together. Neither a fixed long-run distance nor a passing calendar establishes marathon readiness.

## Verification boundary

The runner calls the native proposal initializer and canonical generator, compares every session with a separate native instance, checks repeatability at a fixed clock and checks input/history immutability. Raw outputs include hashes for the actual fixture, runner, evaluator and shared coaching modules. The evaluator tests controlled incomplete cases and tampered feasibility labels; it does not require the real engine to preserve a defect.

Coaching acceptance retains conditional source-input reviews and deliberately returns a nonzero result when they remain. The work is ready for review of the candidate implementation. Athlete-specific approval and live rollout are separate decisions.
