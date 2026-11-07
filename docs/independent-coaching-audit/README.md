# LHRF — independent coaching-engine investigation

**To Ella, Chief of Staff.** Audit date: 7 November 2026, Europe/London. Audited source: `0ae327bdb9dfe11e189ff4a9b066d1406bc48f07`. Rowan evaluated the coaching evidence; Alex traced and tested the implementation; Priya independently challenged both the evidence and findings. This branch contains findings, synthetic fixtures, an offline replay and characterization tests only.

**Verdict: the engine has defensible training components and useful approval/preservation safeguards, but cannot yet be endorsed as a consistently effective, progressive coach across the three needs tested.** Four implementation defects are reproduced: an approved running reduction leaves contradictory executable work; stale/future and briefly clustered evidence can support progression; resolved marathon recovery can be overridden for strength; a supported context-only lower-body recovery report can be ignored by running after a time window. Separate coaching gaps concern novice review coverage, progression rationale, fixed quality dose and overlap-driven reduction proposals. Synthetic tests establish behaviour; they do not establish physiological efficacy or actual athlete harm.

The owner's active November programme cannot be reconstructed from the checked-in configuration alone. That configuration explicitly makes squat/deadlift light. Previously approved bench/running revisions and later frozen reviewed replacements create distinct provenance paths. No private device records were accessed. The documented bench-peak pattern is plausible, but its suitability and the reason for any current restriction require the exact saved snapshot and current athlete evidence.

## Deliverables

| Requested deliverable | Report |
|---|---|
| 1. Evidence review | [Coaching standard, 22 verified references, confidence and research limits](evidence-review.md) |
| 2. Engine audit | [Actual decision chain and implementation versus principles](engine-audit.md) |
| 3. Three-athlete report | [Critical evaluations, simulated feedback and recovery scenarios](three-athlete-report.md); [all 32 athlete-weeks of session prescriptions](generated-programmes.md); [full machine evidence](three-athlete-evidence.json) |
| 4. Defect register | [Four confirmed defects, four evidence-supported improvements, unresolved decisions and reproductions](defect-register.md) |
| 5. Correction roadmap | [Smallest justified actions grouped by policy risk](correction-roadmap.md) |
| 6. Current programme | [Known facts, conditional policy replay, uncertainties and alternatives](current-programme-assessment.md); [read-only repository replay](owner-policy-replay.json) |
| 7. Coaching constitution | [Stable progression, feedback, review and athlete approval rules](coaching-constitution.md) |
| Priya's independent challenge | [Disagreements, evidence checks, severity and correction risks](independent-challenge.md) |

## Challenge design and interpretation

| Athlete | Declared need and complete block | Principal observations |
|---|---|---|
| A | Advanced strength-priority hybrid, 155 kg declared bench maximum, 18 km/week; bench competition week 5, 10K week 6; 8 weeks | Distinct heavy/volume/speed; final heavy bench five days out; major running cuts around competing goals. One difficult day does not change the approved plan. |
| B | Experienced 40-minute 10K runner, 48 km/week, novice lifting with explicit strength-development goal; 12 weeks | Running preview reaches 60.8 km; quality work remains 4 km in normal weeks. Novice straight-set improvement is absent from positive top-set review; effort-based progression remains possible. |
| C | Intermediate general hybrid, 28 km/week, no imminent competition; 12 weeks | Plausible easy-plus-quality running; concentrated main lifting and repeated Development prescriptions. Repeated fatigue creates a proposal, not an automatic rewrite. |

Each fixture uses confirmed fictional equipment and explicit complete visit windows. Exact-setup unknown kg remains calibration, not zero training. Fast/slow marathon sensitivities test both sides of the recovery policy. Forward generation, advancing-clock replay and an immutable app snapshot are different behaviours: B's unchanged running result ages beyond a product cutoff during replay, so later quality can be withheld even though it appeared in the initial preview. Normal changes remain subject to approval. See the detailed reports for tradeoffs and positive controls.

## Reproduction and validation

From the repository root, using Node **24.19.0** (the pinned unit-test runtime):

```sh
node --test tests/independent-coaching-audit.test.cjs
node scripts/independent-coaching-audit.cjs
node docs/independent-coaching-audit/reproduce-owner-policy.cjs
npm test
node scripts/test-athletes.cjs --json
node scripts/replay-coaching-rounds.cjs --safety --output /tmp/lhrf-independent-audit-safety
node scripts/replay-coaching-depth.cjs /tmp/lhrf-independent-audit-depth
```

The synthetic script writes only this audit's generated Markdown/JSON. The owner-policy script prints a summary of repository-policy hypotheses using empty synthetic history; it does not write an installable programme or call install/refresh/approval/new-programme APIs. Tests asserting defective outcomes are characterization evidence, not desired coaching standards; change them with a future correction. Source SHA-256 hashes, exact synthetic inputs and clocks are embedded in the evidence artifacts.

Local results (machine-readable [verification record](verification.json)):

| Check | Result and practical limit |
|---|---|
| Untouched baseline unit suite | 430 passed, 0 failed |
| Investigation unit suite | 441 passed, 0 failed, including 11 new characterization/positive-control tests |
| Existing athlete bots | 7 profiles, 42 trajectories, 468 simulated weeks, 9,994 checks; 0 regression failures; report explicitly says `readyForLiveUse:false` |
| Existing replay safety | Passed all three stages; overall programme-feasibility gates remain blocked and are reported, not waived |
| Existing depth checks | 18/18 criteria passed |
| New runtime or production policy changes | None; no existing tracked file changed |

The existing CI workflow also runs browser/PWA and preservation checks on the draft PR. [All four jobs passed on the investigation-code commit `a1c83d4`](https://github.com/LiftHeavyRunFar/lhrf/actions/runs/42397650447), including browser/PWA upgrades and history preservation. A subsequent report-only clarification narrows the context-only recovery finding; it changes no executable code or tests. Local engine tests are not presented as a new device inspection, browser activation, clinical safety test or proof of long-term training effectiveness.

## Boundary and next decision

No production coaching changes, live programme regeneration/activation, athlete-history edits, merge, deployment or engine replacement. No existing application, saved programme, acceptance fixture or workflow is changed. The new replay is an offline investigation tool; it is not imported into the app.

Review the register and constitution before commissioning a small, versioned correction. Prioritise prescription integrity and valid evidence, then resolve recovery consistency and stable review, then assess goal-specific dose choices. Do not infer that every suggested increase or restriction removal is safe for every athlete, and do not automatically apply these recommendations to November.
