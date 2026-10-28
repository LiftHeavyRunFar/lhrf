# Workout history and weekly review

Progress now opens with a dated workout history, date range and strength/running filters. Entries show completed sets, target RPE where recorded, notes, feedback and linked run summaries/splits. New completed sessions save a prescription snapshot; older records explicitly state when the original prescription is unavailable rather than reconstructing it from today's programme.

The weekly check-in records fatigue, leg soreness, discomfort and context notes separately from daily readiness. Its Garmin button reuses the existing private import/review flow. Saving an import review records its timestamp and available coverage, including when there are no new runs. It does not mark workouts complete or change prescriptions.

The new read-only assessment consumes these records and re-renders after import:

- Four athlete-confirmed comparable easy runs within 14 days: compare the latest two with the previous two. At least 5% slower minutes/km with mean HR within 5 bpm flags a review, not a diagnosis or automatic reduction.
- Two sessions rated harder/low energy within seven days, high weekly fatigue/soreness or reported discomfort flag recovery review.
- Two run ratings at RPE 8+ within 14 days prompt a check against intended session intensity.
- Missing weekly recovery, effort ratings and insufficient comparable runs are explicit limitations. One unusual HR reading does not trigger a change.

The athlete confirms similar terrain, conditions and reliable HR for each easy run before it enters HR comparisons. No HR zones or threshold are inferred. These conservative heuristic thresholds are review flags, not validated physiological boundaries. Context notes remain available to interpret them.

All resulting suggestions are read-only discussion prompts. The existing coach proposal/approval flow remains in place; no programme or event-week changes are applied by this feature. Priority bench work is protected in suggestions and optional accessories are considered first. This release does not automatically accelerate progression from favourable HR data.

Data is stored in the existing browser-local training record and included in its existing JSON backup. The service worker caches the new module. No Garmin service or credential changes.
