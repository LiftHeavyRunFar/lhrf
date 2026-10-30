# Reviewed Garmin activity links

The private Garmin activity import can explicitly associate a recorded run with an approved planned run within seven calendar days. The optional selector keeps extra runs unlinked by default; nearby sessions are ordered by date proximity. The athlete chooses the prescription, rather than inferring workout quality from distance alone.

A confirmed association stores the actual activity timestamp and Garmin evidence separately from the planned date, week, run component and prescription snapshot. It creates a run-only completion; strength on the same day remains unfinished. Programme prescriptions and training decisions are not changed.

Settings → Import runs from Garmin → Link a previously imported run supports linking, changing and removing importer-owned associations without re-fetching. Unlinking preserves the actual activity and removes only completion records owned by that imported activity. Existing manually logged sessions remain protected. When enriching an existing LHRF log, its original session association is retained.

Matching is limited to the current approved programme. Completed/claimed sessions are excluded. Save revalidates availability and calendar identity against current state, and applies the batch on a clone before one storage commit. Duplicate Garmin activity IDs cannot add another run. Planned linking is blocked while a live workout is open.

Regression coverage includes early/same-day/late runs, adjacent weeks, local midnight and UK daylight saving, repeated imports, batch collisions, stale programme dates, manual-log enrichment, unlink/relink, programme preservation and the actual browser import/approval/reload flow. This feature records completion; it does not automatically judge compliance with pace targets or change subsequent coaching.
