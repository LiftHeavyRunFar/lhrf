# Shared coaching engine — current architecture and verification

The earlier inspection found separate live, prototype and preview-review implementations. This draft consolidates the active paths around `src/coach-engine.js`.

## One active coaching implementation

- `index.html` delegates programme generation, phase/block rules, variation/accessory selection, running prescriptions, hybrid workload analysis, top-set/back-off load calculations, progression carry-forward and weekly coaching reviews to the shared engine.
- `coaching-preview.html` loads that same engine and `src/coach-adapters.js`. Its separate RPE-trend, recovery and load-recommendation algorithms have been removed. Programme and feedback decisions now come from the shared engine.
- The seven athlete bots directly call `coach-engine.js`. They no longer exercise a separate v2 implementation as a stand-in for live behaviour.
- The Plan chart's phase label derives from generated session data. This removes a separate display-phase assumption when an event occurs before the end of the saved horizon.
- Phase eligibility for approved progression uses the same shared predicate in the app and trial handoff.

`coach-adapters.js` translates field names, log formats and rendering shapes. It does not implement another set of training thresholds or prescriptions. Storage, UI rendering and explicit acceptance remain in the app. Real programme records and isolated trial logs intentionally retain their existing separate storage keys.

The old `*-v2.js` modules are historical prototype comparison code. Neither active page nor the athlete bots loads them. Existing unit regressions for them remain, but their passing results must not be presented as validation of the active engine. See `src/README.md` for the canonical entry point.

## Preserve behaviour before redesigning programmes

This is an extraction of the existing live coaching rules, not a rollout of new templates. A parity fixture records the pre-extraction outputs at source revision `7fa1977132f212997ca29fbda73b9b3e551f58a8`:

- 28 week prescriptions across the seven profiles match exactly.
- Three on-target/strong/fatigued review decisions match exactly.
- Input athlete state is unchanged by generation and pending reviews.
- Preview native sessions are identical to sessions returned directly by the engine for the same profile and clock.
- No startup migration, data reset, programme replacement or onboarding restart is added.

This draft incorporates the Today fixes from PR #82 and is built on the bot/audit work in PR #83. It should be reviewed as their consolidation, rather than deploying the older independent drafts after it.

## Validation

- 31 Node tests pass, including shared-engine parity, wiring, the canonical athlete suite and retained historical prototype tests.
- All five tabs, touch-swiped calendar and complete strength/run workout flow pass in mobile Chromium, including reload/resume, completion marking and feedback.
- Preview generation → complete live trial → isolated saved log → shared coaching review passes. The original programme and onboarding records are unchanged.
- A real service-worker test upgrades the previous PWA through its Update now button, then reloads offline. The new shared module, programme, onboarding and active workout survive the update and offline reload.
- The preview date validation and run-only trial handoff were also corrected while verifying the shared path.

Browser tests use synthetic records, not the user's device-local data. Physical Android/Garmin behaviour and real-world coaching efficacy are not certified.

## Opt-in candidate policy and current athlete results

The private review build selects `coachingPolicy: review-v1`. Existing programmes without that flag keep their original prescriptions; there is no automatic migration or activation.

The candidate implements the requested bench top-set-first preference, caps explicitly light squat/deadlift work at RPE 5.5, and retains planned recovery in longer blocks. Short event preparations use a compressed development/specificity sequence rather than imposing several tiny blocks. Recovery weeks also reduce interval repetitions and omit optional isolation work. Later weeks beyond an event return through a recovery week instead of remaining in taper indefinitely.

The current candidate suite covers 42 trajectories / 468 synthetic weeks, with 11,835 invariant checks and zero regression failures. Three wider coaching requirements remain blocked: training experience, maintenance-strength policy, and resolution of restricted-day capacity. The candidate is for programme review, not certified training efficacy.

40 Node tests pass, including candidate rules, phase boundaries across 4–52-week horizons, event/settings preservation and the unchanged legacy parity cases. The private review copy also passed a complete browser walkthrough of all five tabs, preview/Start/readiness, required-set logging, feedback and completion marking.

The reference bot now explicitly requests the 10K goal rather than inheriting fitness maintenance. Historical parity fixture inputs are frozen in the fixture JSON, so changing a future bot profile cannot silently change the baseline inputs being compared.

`build-review.cjs` produces the hosted review snapshot from the existing app and the same shared module. It uses a separate origin and namespaced test storage, preloads the November goals and fixed split, and skips onboarding. The revised copy starts Tuesday 27 October with five calendar weeks through 29 November, empty logs, and a provisional 20 km/week baseline at the lower end of the reported range. A one-time namespaced reset discards only the previous review entries; subsequent new-block logs survive reload. Unknown squat/deadlift loads remain unknown. Generated files are deployment output, not a separately maintained coaching implementation.

The acceptance job remains red for the three wider requirements. The compact report is in `docs/athlete-test-summary.json`; full traces are retained by CI. Your live programme, real logs and onboarding have not been changed.

## Repeatable checks

```sh
npm test
npm run test:athletes
npm run test:athletes:json
node tests/today-flow.browser.cjs
node tests/shared-preview.browser.cjs
LHRF_PREVIOUS_ROOT=/path/to/previous-checkout node tests/shared-update.browser.cjs
```

The browser tests require Playwright/Chromium, with optional `PLAYWRIGHT_MODULE` and `CHROMIUM_EXECUTABLE` overrides. The GitHub workflow installs a pinned browser-test dependency and runs the three suites automatically. It tests the upgrade from the pre-extraction Today-fix revision `58bbb0ba3603a36b40cbe1587b9d388e474a57c6`.

`test:athletes` returns 1 while coaching acceptance is blocked, even though regression tests pass. `readyForLiveUse` remains false; a candidate programme still needs athlete review.

The historical first inspection is retained in `docs/coaching-engine-audit-v2-prototype.md`. Its implementation/status statements apply only to that earlier prototype branch.

## Review feedback, 25 October

The athlete rejected the early deload in short event preparation. For dated preparations of eight weeks or fewer, phase changes no longer force a scheduled deload. Post-event recovery remains. Recovery-led changes still require athlete approval. The bot gate explicitly accepts this short-preparation rationale; longer blocks continue to require recovery transitions.

The opt-in `easy-one-quality-10k` running template keeps one controlled session and all other distance conversational (Zone 2 by effort, without invented heart-rate boundaries). Actual generated mileage, including warm-up, jog recoveries and easy distance, now matches weekly targets to rounding. Four training weeks build approximately 19.9, 20.65, 21.45 and 21.95 km, with at least 80% easy distance. The fifth week contains 6.5 km easy preparation plus the separate 10K event; race distance is not labelled easy or included in the preparation-volume reduction. Tuesday and Saturday remain the only running days.

Guide: British Heart Foundation / Full Potential 10K beginner template, https://www.bhf.org.uk/-/media/files/how-you-can-help/events/events-rebranded-training-plans/10k-run-beginners.pdf . Its easy running, controlled threshold work and reduced event week inform the structure. This is an original adaptation for two running days and bench competition the day before the race, not a copied full plan or a claim of template validation. The 3.5% weekly baseline increment is a configurable programme choice, not a universal safety rule.

This revision passed 40 Node tests and the 42-trajectory bot replay (zero regression failures; three wider blocked gates retained). Connected-browser checks cover all five tabs, preview before Start/readiness, top/back-off logging, combined run, feedback, completion and reload. Local automated browser/PWA reruns could not launch because Chromium was absent and its download failed; CI runs remain the repeatable verification route. The hosted review omits service workers by design.

## Broader-athlete candidate, 25 October

`review-v2` is the next explicit programme policy, used for new onboarding and new standalone previews. Legacy programmes and the approved five-week `review-v1` retain their policy. A frozen five-week fixture checks every approved week's complete prescription byte-for-byte. There is no migration or forced onboarding.

The current three acceptance gaps are resolved in this candidate:

- Beginner and returning strength profiles use fewer initial sets, bounded effort, main-lift practice and RPE-led unknown loads. Experience is now required in new-athlete setup. Intermediate and advanced athletes keep the existing progression path; advanced status alone does not award extra load.
- Running priority without a strength event defaults to strength maintenance; an explicit objective can override it. Maintenance has a distinct reduced-volume, stable-load prescription, limited accessories and no automatic strength acceleration or carry-forward uplift. Recovery and symptoms are still reviewed. A simultaneous strength event with explicit maintenance is flagged for review.
- Availability, active-day limits, daily component capacity, duplicate lifts/runs, double permissions and protected long-run days are hard scheduling constraints. Every omitted requested component has an ID and reason. Fixed work is never moved silently. Both onboarding and Plan approval reject an infeasible schedule. The allocator is deterministic and greedy: it reports unresolved work rather than claiming to find every possible feasible arrangement.

A further state-isolation bug was fixed: generation now passes the candidate configuration explicitly into phase/block/accessory functions instead of borrowing the saved programme's policy during previews.

Verification: 49 Node tests, including 240 goal/experience/horizon combinations (2, 5, 12, 20 and 52 weeks), exclusions, exact event dates and post-event recovery. The 42 behavioural trajectories / 468 weeks now pass 9,994 checks with zero regressions and zero blocked acceptance gates. The count is lower because beginner/maintenance policies deliberately prescribe fewer components; no scenario was removed. The programme matrix is separate from the scripted feedback replay. New browser coverage exercises required experience, beginner running-priority onboarding, exclusions, approval, reload and all five tabs. CI also runs the existing complete workout, isolated trial, upgrade and offline preservation suites.

Passing these checks establishes software behaviour against defined cases, not long-term training efficacy. Remaining product work includes deeper goal-specific running templates, richer performance-based progression for beginner straight sets, session-duration constraints, and longitudinal real-athlete validation. The current allocator can report a conflict for an arrangement that a global optimiser could solve. These limitations are not relabelled as ready for unrestricted live use.

Evidence reviewed: ACSM resistance-training progression guidance (https://pubmed.ncbi.nlm.nih.gov/19204579/ and the updated position stand https://pubmed.ncbi.nlm.nih.gov/41843416/), plus the maintenance-dose review https://pubmed.ncbi.nlm.nih.gov/33629972/ . The exact set/RPE limits here are explicit conservative app-policy choices; these papers do not validate this combined coaching algorithm.
