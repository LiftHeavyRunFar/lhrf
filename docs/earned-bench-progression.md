# Earned bench progression

This draft implements Mark's request for an earned RPE 9 peak single and reviewable weight increases. The app evaluates the normal structured workout after Start and readiness. The original programme, reference maxes, easier weeks, event dates and other workouts stay stored as written. The athlete can keep the planned work.

## Behaviour

- In the three- and four-day powerlifting templates, the week 10 competition-bench single can offer one 2.5 kg total-bar increase and raise the effort ceiling from 8.5 to 9. The two latest comparable single exposures must be completed above their original suggestions, at RPE 8 or below, without rising effort or falling load. The taper must still follow that session chronologically.
- Competition-bench and paused-bench working sets can offer a one-session 2.5 kg increase after three completed comparable exposures above their written suggestions. Set count, reps, prescribed effort, lift identity and units must match. The increase is bounded by the most recent demonstrated working weight. Older records without known IDs, units, effort, full prescription or complete sets stay unknown.
- The history window is 42 calendar days, using distinct London training dates. Two single exposures, three working sessions, a fixed 2.5 kg increment and the window are starting product rules derived from the worked proposals and conservative implementation choices. They are not established scientific thresholds.
- Before accepting, the athlete confirms comparable setup and technique, reliable effort records, current recovery, normal warm-ups and availability of a 2.5 kg total-bar increment. Known symptoms or negative session feedback hold the suggestion. Pain and illness require their own review.
- A choice lives in the existing workout draft and applies to that session on its scheduled date. Reload and offline resume retain the original and adjusted prescriptions, evidence and approval. Failed saves leave the original intact. Before logging any sets for that exercise, the athlete can use the original prescription. A completed workout retains both prescriptions and the recorded actual sets.
- Unexplained missing or incomplete work supplies no fatigue signal. This feature does not run a fatigue intervention or update future reference maxes. It changes no set counts, reps or dates.

## Coverage and limits

The first implementation covers bench. Squat and deadlift peak changes still need separate coaching decisions, as the original proposal specified. Accessories, easier weeks, final taper weeks, events, benchmarks, running, shortened workouts and ambiguous taper calendars retain their original prescriptions. Prescriptions without a positive suggested load also retain their original RPE guidance.

Stored history from a different setup can look numerically similar. The review therefore shows the evidence dates and requires athlete confirmation of comparability. Programme-specific clinical readiness cannot be established by these checks. Human coaching acceptance and release approval remain separate.

This implementation uses the existing live workout store and its save path. It inherits the unresolved stale-client storage limitation in #168. Real-data migration and public release remain gated.
