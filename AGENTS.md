# Repository Guidelines

## Project Structure & Module Organization

This repository is a Google Apps Script web app for collecting school data:

- `index.html`: complete frontend, including HTML, CSS, and client-side JavaScript.
- `Code.gs`: backend functions for rendering, duplicate checks, saves, exports, and spreadsheet setup.
- `config.gs`: configuration helpers and Script Properties access.
- `appsscript.json`: runtime, timezone, logging, and web app settings.
- `SPEC.md`: product behavior and data model reference.
- `.clasp.json` and `.claspignore`: Apps Script project link and push allowlist.

There is no separate test, asset, or build directory.

## Build, Test, and Development Commands

- `clasp push` uploads `Code.gs`, `config.gs`, `index.html`, and `appsscript.json` to Apps Script.
- `clasp deployments` lists deployed web app versions and deployment IDs.
- `clasp deploy --deploymentId <id> --description "..."` redeploys while keeping the public URL.
- `python3 -m http.server 4173` previews `index.html` locally. Apps Script APIs such as `google.script.run` only work after deployment.

There is no package install or build step.

## Environment Switching (Production vs Testing)

This project uses **separate Apps Script projects** for production and testing, each with its own Spreadsheet ID stored in Script Properties. This ensures test data never touches the production sheet.

### File Layout

- `.clasp.prod.json` — clasp config pointing to the **production** Apps Script project
- `.clasp.test.json` — clasp config pointing to the **testing** Apps Script project
- `.clasp.json` — the active clasp config (git-ignored; swapped by the script below)
- `scripts/switch-env.sh` — switches environments and optionally pushes/deploys

### Switching Environments

```bash
# Switch only (updates .clasp.json)
sh scripts/switch-env.sh prod
sh scripts/switch-env.sh test

# Switch and push to Apps Script
sh scripts/switch-env.sh prod --push-only
sh scripts/switch-env.sh test --push-only

# Switch, push, and deploy
sh scripts/switch-env.sh prod --deploy
sh scripts/switch-env.sh test --deploy --deploy-desc "Testing v2"
```

### Initial Setup for a New Testing Environment

1. Create a new Google Sheet for test data.
2. Create a new Apps Script project:
   ```bash
   mkdir /tmp/school-data-test && cd /tmp/school-data-test
   clasp create --title "School Data App - Testing"
   ```
3. Copy the `scriptId` from `/tmp/school-data-test/.clasp.json` into `.clasp.test.json` in this repo.
4. Push the code to the testing project: `sh scripts/switch-env.sh test --push-only`
5. In the Apps Script editor for the testing project, run `initializeScriptProperties('<YOUR_TEST_SPREADSHEET_ID>', '<adminPassword>')` once to set Script Properties.
6. Run `initializeSheets()` once in the testing project to create sheet headers.
7. Deploy the testing project: `clasp deploy --description "Testing deployment"` — this gives you a separate testing URL.

### Security Note

`config.gs` no longer contains a hardcoded Spreadsheet ID. If `SPREADSHEET_ID` Script Property is missing, `getConfig()` will throw an error with setup instructions. Each environment must have its own `SPREADSHEET_ID` set via `initializeScriptProperties()`.

## Coding Style & Naming Conventions

Use two-space indentation. Keep code ASCII unless Thai UI copy is required.

- Functions use `camelCase`, for example `saveFormData` and `calculateStudentTotal`.
- DOM IDs use descriptive camelCase, for example `schoolName` and `totalStaffDisplay`.
- Sheet and config constants should stay centralized in `config.gs`.

Prefer small, direct functions. Keep frontend behavior in `index.html` unless intentionally split again.

## Testing Guidelines

No automated test framework is configured. Before pushing, manually verify:

- Required field validation and phone validation.
- Staff and student totals update correctly.
- Extra staff rows add, remove, validate, and save.
- Duplicate-school update flow.
- Excel download password flow.
- Mobile layout at narrow widths, especially staff and student tables.

For backend changes, test in Apps Script because local preview cannot run server calls.

## Commit & Pull Request Guidelines

The current history uses concise prefixed commits such as `Fix: ...` and `Initial: ...`. Continue with short imperative messages:

- `Fix: improve mobile staff table layout`
- `Update: add submitted schools search spacing`

Pull requests should include a summary, affected files, manual test notes, and screenshots for UI changes. Link related issues or deployment notes when applicable.

## Security & Configuration Tips

Do not hard-code spreadsheet IDs, passwords, or secrets. Use Apps Script Properties through `config.gs`. Keep `appsscript.json` access settings intentional because the web app allows anonymous access.
