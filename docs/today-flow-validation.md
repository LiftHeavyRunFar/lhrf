# Today and workout flow validation

Scope: repair the existing live `index.html`; no app rebuild, storage migration, onboarding reset or coaching-engine changes. The data and active-workout storage keys remain unchanged. The service-worker shell version is bumped so an eventual deployment offers the normal update prompt.

## Root causes

- Invalid quotes in two inline scripts prevented the calendar/navigation migration and live logger from initialising.
- The old UI migration addressed Today children by position, moving the weekly calendar into an unrelated disclosure. It also replaced five tabs with four.
- Upcoming calculated the next occurrence of a weekday, rolling completed or past active-week prescriptions into fictitious future sessions.
- Completion detection relied on performing a workout on its scheduled day; it now uses session ID plus active programme week, preserving rescheduled completions.
- Arrow navigation could let intermediate smooth-scroll positions overwrite its intended day.

## Passed

Mobile Chromium, 390 × 844, touch emulation, Europe/London, synthetic athlete data in an isolated browser context:

- All five navigation tabs activate the correct screen; Choose workout returns to Today.
- Weekly calendar remains in Today; arrow controls and a real series of touch move events scroll the rail and update the selected day.
- Completed workouts remain visible and marked, including a workout performed on another day and an early-completed future workout.
- Upcoming excludes past dates, today and completed sessions; it uses dates in the active programme week and does not silently generate or activate another week.
- Selecting a workout opens a preview without changing athlete data or starting a workout. Completed previews cannot accidentally start duplicate sessions.
- Start opens Train and readiness. Train without an active workout hides readiness.
- Top-set logging recalculates back-offs; logging persists across reload.
- Combined strength/run validation, all prescribed strength sets, run recording, notes, finishing, feedback saving and feedback skipping work.
- Run-only workout finishes and immediately disappears from Upcoming while remaining marked in the calendar.
- Onboarding, programme, old sets, old completions and unrelated settings remain intact after navigation, previews, workout completion and reload.
- Sunday 25 October and Monday 26 October 2026 (UK daylight-saving boundary) do not roll old sessions forward.
- All live inline scripts compile. Existing hybrid approval test passes.

Run the browser suite with Node 20+ and Playwright/Chromium installed:

```sh
node tests/today-flow.browser.cjs
```

Optional `PLAYWRIGHT_MODULE` and `CHROMIUM_EXECUTABLE` select externally installed test dependencies; no app runtime dependencies are added.

## Existing failures confirmed on unchanged main

`npm test` on base commit `7fa1977132f212997ca29fbda73b9b3e551f58a8` passes 18/20 test files. The same two failures remain after this change (19/21 pass with the new syntax regression test):

- `tests/hybrid-v2.test.cjs`: `output.strengthStress < week.strengthStress` assertion.
- `tests/preview-page-v2.test.cjs`: expected copy `Recording a session does not yet change the programme.` is absent.

These concern the isolated coaching prototype, which is unchanged by this fix.

## Not completed

- Physical Android/Garmin testing and the installed Android PWA were not accessible.
- The user's actual device-local athlete data was not accessible; preservation was tested with synthetic existing records and unchanged storage keys.
- Deployment and installed service-worker upgrade/offline checks were not performed. This is a review branch; no merge or live publication.
