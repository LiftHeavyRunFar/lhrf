# Stage 8 release candidate

Branch: `release/stage-eight-rc`. Application source: `19aa1bc`. This candidate adds review evidence only; runtime code is identical to the committed Stage 8 implementation.

## Verified baseline and scope

Production, as confirmed by the athlete: `https://liftheavyrunfar.github.io/lhrf/`, GitHub Pages publishing `main` from `/ (root)`, successful deployment workflow #147 at `d8a5c9d`.

Local ancestry confirms production is the exact merge base: zero production-only commits and fourteen runtime-lineage commits. The RC adds one evidence-only commit. There is no divergent production source to reconcile. No merge, push, PR publication, deployment or programme activation was performed to prepare this candidate.

Required lineage is intact: Stage 5 `f22f6ad`, Stage 6 `5d27f31`, Stage 7 `233f09e`, Stage 8 `19aa1bc`, including their earlier dependencies and frozen evidence. Preserve this ancestry: the strict regression check executes the `233f09e` reference engine from Git. Do not release only the Stage 8 cherry-pick or discard required reference history.

Included runtime changes are the validated coaching intake/constraints/running preparation, scheduling and recovery safeguards, experience calibration, flexible duration estimates, and exact reviewed-programme replacement with a verified fresh backup, complete dated preview, protected recorded/partial visits, explicit consent, archival, stable new identity, interruption handling, repeat safety and log-preserving rollback. The conditional post-meet running decision remains.

Production's Garmin integration is retained. Its bridge service, authentication flow, Intervals/watch export and existing programme files are unchanged. The planned-run selector reads reviewed snapshots and preserves original week identities for protected sessions. Settings export uses the read-only training backup module and preserves recorded Garmin values. Private athlete backups, reviewed programme packages and fingerprints remain outside Git.

Excluded: the separate completed-workout/modal redesign branch (`cae23d0`) and wholesale export-UI branch (`612e323`), plus any new experiments. The backup module needed by Stage 8 is deliberately included. Existing isolated coaching-preview code is retained with its validated intake changes; no old prototype replaces the canonical engine or supplies prescriptions. There is no new unrelated visual redesign.

## Targeted release checks

Results are in `release-candidate-results.json`. No full software or browser suite was rerun.

- 74 targeted software tests: replacement/rollback, backups, Garmin records and planned links, experience calibration, flexible duration, Stage 3 safeguards and weekly stress distribution. Includes strict full-object native comparison with the original Stage 7 generator for all nine profiles / 149 weeks and verification of their frozen stored captures.
- Three focused existing browser suites: programme replacement, Garmin import and PWA update.
- Additional direct update test from an exact `d8a5c9d` source snapshot: Update now and offline reload retain synthetic programme/onboarding data and an open workout.
- Additional mobile Settings export smoke test under `/lhrf/`: a real JSON download retains profile/programme/history/raw Garmin fields and leaves stored data byte-identical.
- All 24 PWA shell entries exist. Runtime files are unchanged from `19aa1bc`. Production's bridge/watch/programme assets remain unchanged.

These are local Chromium/mobile-emulation checks with synthetic data. No real Garmin-account request or physical Android Chrome session was exercised.

## Physical Android smoke checklist — release gate

Use an isolated candidate test origin and disposable synthetic athlete/package from the existing test setup. Do not use the athlete's production storage or activate the real package. Keep test dates valid for the synthetic programme; real activation is not allowed before its start date.

1. Open the candidate in Android Chrome at its `/lhrf/` path. Check Today, Train, Plan, Progress and Settings; verify the synthetic history remains visible and no onboarding reset occurs.
2. Settings → Export training data JSON. Save and open the downloaded file in Files/Downloads. Verify profile, programme, sets, Garmin activity IDs/HR/splits, check-ins and completions.
3. Settings → Replace a reviewed programme. Select the synthetic reviewed package, paste its independently supplied fingerprint, then Preview replacement. Inspect every date, loads, sets/reps and run steps; recorded/partial visits must be marked protected.
4. Confirm activation is disabled until the fresh pre-activation backup is downloaded, selected again and byte-verified, and the consent checkbox is selected. A failed repeat download must invalidate earlier verification.
5. On the disposable athlete only, explicitly confirm replacement. Verify the new identity and exact prescriptions in Today/Train/Plan; Progress must retain the old records. Reload and reselect the package: it must not reinstall or duplicate sessions.
6. Start a partial synthetic workout: replacement/rollback must be blocked without altering the draft. Finish the test workout. Add a synthetic recorded run, then Preview rollback, download/verify a fresh backup and confirm. The new set/run must remain, with their recorded visit protected.
7. Check Update now from the baseline test installation, then close/reopen and reload offline. Preserve the saved athlete, programme, history and unfinished workout. Do not clear site data or uninstall to force an update.
8. Check the conditional race preview: an early/different-date start is refused; in the dated test setup, declining post-meet recovery consent must not start a run or invent a completed activity.

## Decision and smallest remaining release sequence

The candidate is ready for review and physical Android testing; no substantial unexpected integration work was needed. Hold deployment approval until that device checklist passes and the reviewer accepts the included lineage and documented protected-visit behaviour. Capacity/conflict flags retained from Stage 7 are not waived by this release.

1. Review this branch against the confirmed production baseline. Recheck `main` immediately before release; if it moved, reconcile only actual new differences and rerun affected checks.
2. Complete the physical Android test in isolation. Keep personal programme/backup files out of the public repository.
3. Obtain explicit deployment approval **before merging to `main`**. Pages is configured to publish that branch/root, so merging can itself trigger production publication. Preserve the required reference ancestry; do not substitute an unreviewed file copy or partial cherry-pick.
4. After approved publication, verify the Pages deployed SHA, the same production origin and PWA Update now. Do not clear Android storage, create a new athlete or restart onboarding.
5. Programme activation is a separate approval. On the actual phone, finish live/pending work, close other LHRF tabs, import the private reviewed package/fingerprint, review the current-device differences, make and read-back-verify a fresh backup, then confirm only after that approval. Use Preview rollback, not full backup restore, to retain subsequently recorded training.

No deployment or activation is authorised by preparing this candidate.
