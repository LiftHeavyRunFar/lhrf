# Ella: coaching depth review — round three

The next five athletes produced 56 weeks of native prescriptions. This review deliberately holds the engine unchanged. Four calendars fit, and one appropriately remains blocked; none of those facts constitutes coaching approval. Priya and Rowan independently inspected actual sessions and found shared-rule shortcomings.

## Frozen profiles and outcomes

| ID | Fictional athlete | Starting point and request | Coaching judgement |
|---|---|---|---|
| K | Casey | 2:50 marathon, 75 km/week, five runs; marathon in 14 weeks, background strength | Substantial preparation capacity: peak actual 97.23 km/week and 32 km long run. Hold for coordinated taper and recent-race recovery review. |
| L | Avery | 18 km/week, recent 60-minute 10K; first marathon in eight weeks, 4:00 aspiration | Correctly blocked throughout. Training peaks at only 20.55 km/week and an 8.2 km long run; this is not an accepted marathon programme. |
| M | Morgan | Experienced bench-only competitor; eight weeks, lower-body maintenance and health runs | Bench heavy/volume/speed roles are present. The input model cannot independently retain lower-body maintenance while progressing bench. |
| N | Jamie | 1:44 half marathon, 36 km/week; half race followed four weeks later by powerlifting | Hold: running recovery and lifting recovery disagree. Next-day squat is 2 x 3 at 125 kg, RPE 7.5. |
| O | Taylor | Strength first, two weekly lifting visits; 16-week meet preparation, health running | Review needed: exercise allocation and repeated provisional loads are weakly responsive to actual performance. No requirement to force three separate lifting days. |

The fictional physiological facts deliberately exercise different rules. Seed 2026103103 randomises names only; this is not a random sample of real athletes. Frequencies, visit limits and goal-stage contracts are declared inputs. This round does not prove that the app autonomously chooses the best frequencies from a goal description.

## Shared-engine work, in priority order

1. **Coordinate every event across both sports.** The half-marathon in N should influence lower-body lifting before and after the race. Week 5 reduces lifting to one set at RPE 6, but race week restores two sets at RPE 7.5. Week 7 running is Recovery with zero runs while Monday resumes normal squat/bench maintenance. Future acceptance must inspect actual lift dose around endurance races, not only running phase names or a dated goal handover.
2. **Make recovery facts consequential and consistent.** Changing K's reported long-run recovery from 24 to 96 hours leaves every session and warning identical. Changing the same 28 km long run from 145 to 220 minutes also leaves sessions identical. Separately, repeating its already known 18 October marathon date in `runningHistory.recentMarathonDate` changes first-week running from 75 to 44.283 km. One factual race should have consistent interpretation across pace and recovery, with an explicit way to record actual recovery. The answer is not a mandatory calendar-based restriction regardless of athlete evidence.
3. **Improve taper composition.** K has zero work-role running in weeks 12–14 but retains 2 x 3 at RPE 7.5 for background lifting. Thursday before the marathon still contains deadlift 120 kg and bench 62.5 kg. Review smaller running pace reminders and a deliberate reduction of support-lifting fatigue. These observations do not prove that three-week tapers, one quality day per week, or all lifting near races are wrong.
4. **Reconcile starting baselines with completed evidence when proposing a programme.** O's new programme remains identical after adding two recent stronger same-lift observations per lift. Static onboarding baselines win. A proposal should explain conflicting evidence and suggest reviewed calibration rather than silently ignore it or automatically overwrite an approved programme. Live effort-based adjustment and weekly review are separate paths and are not disproved by this generation probe.
5. **Represent objectives per lift.** M needs bench progression with squat/deadlift maintenance. The current global strength mode cannot express that combination. It consequently assigns squat/deadlift RPE 8 development and heavier specificity doubles. This is an input/model gap, not the failure to respect an existing supported maintenance flag.
6. **Review limited-frequency allocation and progression.** O packs squat/deadlift/bench into the 60-minute Thursday while the 120-minute Saturday contains bench variation work. A calendar that fits the internal timing model need not be the best distribution of training. Keep volume/heavy/speed principles adaptable to two visits, rather than forcing three sessions or requiring all roles every week. Repeated loads can be purposeful; progression should nevertheless explain what completed evidence triggers the next change.

## Evidence and research boundary

Primary observational research associates marathon supporting volume and long-run exposure with performance. It does not establish a universal minimum that certifies readiness, nor prove that more mileage is always preferable: [Fokkema et al., 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7496388/).

A primary half-marathon recovery study measured changes in lower-limb strength over the first 48 hours: [Wang et al., 2025](https://pubmed.ncbi.nlm.nih.gov/40186759/). This supports treating post-race lifting as a recovery decision; its group findings cannot supply an exact recovery date for every athlete.

The observational marathon taper analysis supports examining progressive reductions in load: [Smyth and Lawlor, 2021](https://pubmed.ncbi.nlm.nih.gov/34651125/). It does not establish that every runner requires the same taper duration or pace-reminder dose. The criticism above is the engine's blanket loss of all quality work combined with unchanged strength support, not the mere existence of a three-week taper.

These are coaching judgements and next-development criteria, not forecasts of injury, recovery or finishing times.

## Reproduce and verify

Run `node scripts/test-five-scenarios.cjs --fixture tests/fixtures/five-scenario-round-three-inputs.json --output output/round-three-native` to regenerate every native session. Then run `node scripts/inspect-coaching-round-three.cjs` to reproduce per-week doses and controlled probes in `coaching-round-three-metrics.json`. The native runner checks repeatability, session parity and input/history immutability. Fixture SHA256 is `fa52f05b76055696b73ef402339deb17e010c43879203fc837458e1bb415169c`.

No engine prescriptions were edited to improve this round's verdict. No approved programme was activated or changed, and no live deployment occurred. Earlier passing automated criteria remain bounded by what they tested; this review exposes additional criteria the next implementation must satisfy.
