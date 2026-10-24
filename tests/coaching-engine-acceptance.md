# Manual acceptance fixtures (convert to automated executable tests with new engine)

| Fixture | Goal | Weeks | Priority | Expected outcome | Failure example |
|---|---|---:|---|---|---|
| A | General strength, no event | 12 | Strength | Controlled benchmark in final week | Highest intensity at week 9 with no final assessment |
| B | General hybrid, no event | 20 | Balanced | Strength and running progress scorecard | Competition taper despite no competition |
| C | Full powerlifting meet | 20 | Strength | Meet-specific performance | No specificity or no event-week sessions |
| D | 10K PB + lifting | 12 | Running | 10K race or benchmark | Hard leg training collides with race |
| E | Bench meet + 10K following day | 6 | Bench | Explicit dual-event trade-offs | Two incompatible hard sessions before events |
| F | No event, unknown max | 8 | Strength | RPE-calibrated progress | Fabricated absolute loading |

For each fixture, assert: a selected framework; explicit rationale; an end outcome; a workload budget; phase transitions; session/chart agreement; no data migration; and a human-reviewable week-by-week summary.

The existing generator does NOT yet pass this suite. These are acceptance criteria for the replacement, not a claim of test success.
