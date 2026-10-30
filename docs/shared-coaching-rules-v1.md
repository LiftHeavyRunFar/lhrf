# Shared coaching rules v1

This release promotes the reusable lessons from the November programme corrections into the default new-programme path. It does not automatically change existing approved prescriptions.

## Creation and approval boundary

`LHRFCoach.prepareNewProgramme` is the canonical, pure proposal factory. First-run onboarding, advanced programme proposals, and the separate coaching-preview page call it. `buildNewProgramme` and `previewNewProgramme` expose the same defaults for other callers. `buildProgramme` and existing saved configs remain compatible, so legacy replay and approved programmes keep their historical output.

New configs persist `coachingRulesVersion: 1`, the capacity-aware scheduling policy and current running-library/pace defaults. The factory removes programme-specific bench flags and previous approval identity rather than copying the November peak to another athlete. Experience must be provided in onboarding; unknown experience follows the bounded entry path with a warning. Fresh automatic onboarding also clears inherited manual/fixed splits and personal light-lift constraints, using the newly selected schedule and goal instead. Explicit API light-lift and variation constraints remain respected.

Approval is separate: `approveProgrammeConfig` assigns independent programme/session identity and an approval timestamp. Preview does not modify the saved programme or logs. Replacement approval archives the old programme, schedule and decision context, while retaining all historical records. New session IDs cannot accidentally inherit old completion ticks. Carry-forward load decisions for this policy must be dated after its approval; stale decisions from another programme do not stack into it.

## General rules

- Roles follow actual scheduled frequency: one exposure combines strength and supporting volume; two separate volume and strength; three separate volume, strength and speed/technique; additional exposures use bounded technique work. A heavy role does not mean an all-out attempt.
- Near a dated strength event, experienced athletes practise competition singles without waiting for a generic phase label. In longer preparations, earlier work develops repetitions and capacity. Undated blocks do not acquire a competition peak simply because the horizon ends.
- Effort limits depend on experience, priority and preparation distance. The general advanced default tops out at RPE 8.5, intermediate at 8, and a running-priority dated-strength plan at 7.5. Beginner/returning/unknown-experience and maintenance plans do not inherit advanced near-max singles. Mark's explicitly approved RPE-9 peak remains his saved policy, not the universal default.
- Load estimates use reps/effort heuristics as starting suggestions, not guaranteed RPE conversions. Actual effort governs the load; logged top sets still recalculate bounded back-offs. Uncalibrated variations never borrow a competition-lift load.
- Final heavy practice is chosen from the athlete's actual days and the lift: preferred windows are bench 4–7 days (target 6), squat 6–10 (target 8), and deadlift 7–12 (target 10). A suitable earlier exposure up to 14 days is reported for review when availability prevents the preferred window. Insufficient preparation produces a warning rather than an inserted last-minute max or an extra training day.
- Final heavy practice can fall in the event week and replace an ordinary volume/speed exposure. Other demanding work within three days beforehand becomes technique. Later exposures are light; final heavy and final light dates are distinct where availability permits. The final two days and first two post-event days do not gain additional strength work. The following days use easy recovery; undated development can resume afterwards.
- Non-event lifts are light during competition week. Supporting work is reduced or omitted near the final heavy practice. Existing running and scheduling constraints remain in force.
- Bench support menus differ by role, respect preferences, remain stable within a block, and rotate across blocks. Higher frequencies and running priority reduce supporting volume. Lower-lift support menus also differ across exposures. Optional extras remain below required work and do not duplicate required arm work. Protected beginner and maintenance doses retain their bounded accessory path.

These are coaching heuristics and default review decisions, not proof of optimal individual peaking. The earlier primary-source taper review and evidence links in `bench-exposure-policy.md` explain the basis and limitations of lift-specific tapering. No new profile is assigned Mark's exact four-single progression automatically.

## Verification

`tests/general-coaching-rules.test.cjs` exercises:

- 96 new synthetic profiles and 1,008 programme weeks, replayed twice: four horizons, frequencies 1–4, three experience levels and two priorities.
- 63 calendar combinations across three lifts, three preparation horizons and every event weekday, plus a UK daylight-saving Monday-event regression.
- 52-week and undated development, early practice in short blocks, recovery weeks, exclusions, maintenance, unknown loads, locked variations, impossible schedules and preference-aware support selection.
- Canonical proposal/approval defaults, separate completion identity, stale load-decision isolation and protection against personal-programme migrations.
- A golden hash replay of every week of the currently approved November peak, captured from the pre-release engine. Its output stays byte-identical.

The browser gate starts with an existing approved athlete, previews a new advanced plan without changing approval or history, approves it explicitly, verifies distinct exposure roles and fresh IDs, checks the previous programme archive and retained logs, and reloads the stored policy. Existing beginner/running-priority onboarding and legacy PWA-upgrade/offline tests remain in CI.

The core remains offline JavaScript. There is no model training, cloud-dependent reasoning or automatic modification of approved programmes. Learning here means versioned reusable rules, shared default wiring and regression protection, with explicit athlete approval when replacing a saved plan.
