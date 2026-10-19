# CPS-DB Apps Script

This container-bound Apps Script receives one completed Unity session per row in the `Results` tab of spreadsheet `1fi7VUnYyXRohA6jlrFwCaoA0w9RvS3AIjYzJb9nriWk`.

## Install and verify

1. Open `CPS-DB` and choose Extensions → Apps Script.
2. Replace `Code.gs` with the version in this folder and use `appsscript.json` as the manifest.
3. Run `runContractSelfTests`. It must finish without an exception and does not write to the Sheet.
4. Run `setupResultsSheet` once and authorize access to the spreadsheet.
5. Verify the `Results` header, filter, frozen first row, column widths, formats, and the three subtle color groups.

## Deploy

Create a Web app deployment that executes as the spreadsheet owner and allows access to `Anyone`. Record the resulting `/exec` URL here after deployment. The endpoint is intentionally public and unauthenticated for the classroom demo; anyone who knows the URL can submit junk rows.

Deployment URL: https://script.google.com/macros/s/AKfycbzBmXK-7_5x4EEBYNKbSOan61djhXDhBI_CD7mElk2EdohlfHCJwU34wO4pV1ckKdUXsQ/exec

After changing `Code.gs`, create a new deployment version or edit the existing deployment to use the new version.

Successful requests return either:

```json
{"ok":true,"status":"created"}
```

or:

```json
{"ok":true,"status":"duplicate"}
```

Invalid requests return `{"ok":false,"status":"error","message":"..."}` without adding a row.
