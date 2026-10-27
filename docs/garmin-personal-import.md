# Personal Garmin run import

This is a personal, owner-private integration. Garmin's Personal API is separate from its business developer programme and is not a shared commercial integration.

## Flow

Settings → Import recent Garmin runs opens the private connection service in a separate window. The owner signs in through Sites when required and enters their Garmin Personal API key there. The service exchanges that key for Garmin's **plain-text JWT** and reads running activities from the last 14 days. Up to 20 recent runs and their available split summaries are returned. No Garmin password is collected.

The connection window sends only validated run summaries to the exact LHRF origin, using an unpredictable one-use state value. LHRF checks origin, source window and state before presenting a review. Saving is explicit. Stable Garmin activity IDs prevent repeat imports. Possible manual matches default to skip; an explicit link enriches that entry and preserves its previous contents in `importOriginal`.

Only `data.runs` is changed. Strength entries, active workout drafts, programme configuration, overrides and completion records are preserved. A run import does not complete the bench part of a combined workout.

## Data and limits

Retained: source activity ID, original UTC start, distance, recorded timer duration, separate elapsed/moving durations when present, calculated average pace, recorded average/max heart rate, and available split summaries. Missing HR remains null. No lactate threshold or recovery readiness is inferred from one imported run.

This release does not import second-by-second HR curves, daily wellness, sleep or HRV. It is an explicit foreground import, not a background sync. The private connection is intended for the Site owner only; friends cannot use the owner's service or key.

## Security and hosting

Private service: https://lhrf-garmin-import.equalmelon128.chatgpt.site
Sites project: `appgprj_6ae113ebe258819186036e0ee477f6fb`

The service source is mirrored at `services/garmin-bridge/worker.mjs`; authoritative deployed source uses its separate Sites git repository. API requests require Sites visitor identity and an exact same-origin JSON POST. Upstream hosts and paths are fixed; redirects are rejected. Responses are not cached. The worker does not persist keys, tokens or runs or log them. Remember is optional, off by default, and stores the key only in the private service's browser storage, outside LHRF training backups. Forget removes that remembered key; Garmin revocation is done in Garmin Connect.

If initial private-site sign-in loses the opener window, return to LHRF and reopen the import after signing in. The service must fail closed when there is no valid LHRF opener. Never add keys to URL parameters, source, environment files, telemetry, chat or GitHub.

## Validation

`npm test` covers import validation, repeat protection, explicit manual matching, history preservation and private-service guards. Browser CI exercises the cross-origin popup handoff against a mocked service, review, HR display, repeat imports and unchanged programme state. The service token/summary/split tests use synthetic responses and never use personal credentials.

Authenticated downloads from the owner's real Garmin account remain an end-to-end setup test. Passing fixture tests or successful deployment is not proof of live Garmin data access.

Official references:
- https://developer.garmin.com/gc-developer-program/personal/personal-faq/
- https://developer.garmin.com/gc-developer-program/personal/swagger-docs/
- https://github.com/garmin/connect-personal-api-python
