# Google Sheets result upload verification

Date: 2026-10-20

## Verified

- Apps Script contract self-tests pass.
- Live endpoint returns `created` for a new session, `duplicate` for the same `sessionId`, and `ok:false` when `sessionId` is missing.
- The labeled Apps Script test row was removed after confirmation; the 29-column header and formatting remain.
- Unity payload EditMode tests pass 3/3, including Unicode names and `null` unavailable force values.
- Unity uploader PlayMode tests pass 4/4 for one-shot submission, duplicate suppression, empty endpoint, Pause-to-menu, and unsubscribe behavior.
- GameplayRig authoring test passes 1/1 with exactly one uploader wired to the shared controller and the deployed HTTPS `/exec` endpoint.
- Full EditMode suite passes 131/131.
- Full PlayMode suite completes 89/91 with graphics enabled. The two failures are pre-existing `LocalDemoAudioTests` volume expectations (`0.2`/`0.1`) that conflict with current global values (`0.7`/`0.99`); the Sheets-focused tests pass.

## Pending

- Complete a real round from Boot in Unity Editor and verify one matching Sheet row appears without delaying Results.
- Pause and return to Main Menu and verify no row appears.
- Verify an invalid endpoint only logs a warning while Results/Restart/Main Menu remain usable.
- Complete a WebGL release build and browser round. Two build attempts were externally interrupted during the long Bee backend step; no new build was delivered and the existing `Builds/WebGL/index.html` remains dated 2026-10-17.
- Remove only the labeled Editor/WebGL verification rows after explicit confirmation.

## Deployment

Endpoint: `https://script.google.com/macros/s/AKfycbzBmXK-7_5x4EEBYNKbSOan61djhXDhBI_CD7mElk2EdohlfHCJwU34wO4pV1ckKdUXsQ/exec`

The endpoint is public and unauthenticated. Clearing the `endpoint` field on `GameplayRig` disables result uploads without changing code.
