# Safe read-only export and private inspection

The exact active November programme is unavailable in this workspace. The following uses functionality already in the app; no deployment or new device code is needed.

## On the owner's current device

1. Open the existing LHRF app on the usual origin/device. Select **Settings → Data and backups → Download backup**. If the older layout is shown, the same action is labelled **Export training data**. Do not choose Restore, Start a new programme, programme replacement, clear data or reset equipment.
2. Save `lhrf-training-backup-YYYY-MM-DD.json` privately and retain the original file. Download is read-only: `src/training-backup.js` clones state, reads only allowlisted draft/history keys, excludes structured connection credentials, and writes no app storage. It preserves original sets/RPE, runs/Garmin associations, reviewed snapshots, overrides and programme archives. This is not a raw device/health-record export.
3. If a live workout/pending run is present, the backup can preserve its allowlisted draft for review; do not discard it or trigger replacement. Inspect any export warnings. Record the approximate export time and visible app/source version if available.

The file still contains private training/profile/free-text information. Keep it outside Git and public links; credential filtering is not a guarantee that free-text notes contain no sensitive content. No automatic upload is part of this workflow. For attribution, an owner may share only the needed saved prescription/recovery/provenance fields through an agreed private channel; they need not expose unrelated health or connection data.

## Offline inspection

The new script reads an existing file and produces a private report, not an installable programme:

```sh
node scripts/inspect-november-programme.cjs \
  /private/location/lhrf-training-backup-2026-11-07.json \
  2026-11-07T18:00:00Z \
  /private/location/november-review
```

Substitute real paths and the intended explicit timestamp/offset; the example is not a claim that a backup exists. The output directory must be outside every Git checkout. The script creates `november-attribution.json` with mode 0600 in a directory created with mode 0700, refuses to overwrite an existing report, and asserts that source bytes remain unchanged. Keep the original file read-only. Re-running needs a new output directory.

The report contains exact saved rows, source SHA-256/export time, source policy/snapshot coverage, lower-body mechanism metadata, tomorrow's saved session and the same weekday's saved/recorded evidence from the previous week (Sunday 1 November for this 7 November review), prior-calendar-week sets/runs, current recovery fields and relevant original RPE. It computes existing base-ID exercise overrides without accepting a new decision; component overrides are exposed separately and flagged for actual live-component review. It uses purpose-aware recorded references, never generated historical purpose. Future/undated observations are excluded from current-performance interpretation but remain unchanged in the source.

**No generation, installation, activation, recovery clearance or history write occurs.** Missing weeks/sessions remain unknown, not fabricated rest days. A conflicting active/frozen row is reported rather than overwritten. An inspector report cannot pass `validateProgramme` or be imported as a replacement. It always leaves `replacementReady:false` and an empty prescription delta: a separate individual review is necessary.

For a later justified proposal, follow [the existing approval/rollback route](proposed-correction.md). Do not use `review-athlete-programme.cjs` merely to obtain the current plan: it generates a new proposal and is not attribution of a saved snapshot.
