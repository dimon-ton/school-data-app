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
