# Pages

- Path: `ctx/docs/code/browser/pages.md`
- Changed: `20260716`

## Purpose

Record accepted desktop browser pages and routes.

## Page Index

| Page | Package-relative route | Purpose |
| --- | --- | --- |
| Desktop channel entry | `./` | Restore or establish the fixed Principal session, show the connected shell, and provide explicit lock without presenting an undeclared workspace. |

## Access And Visibility

Static entry delivery is public. Principal content is visible only after session restoration, enrollment, or passkey authentication; no account or Principal selection exists.

## Page-Specific Notes

The page links to host `/` for explicit channel reselection. Do not infer a chat page, dashboard, workspace, or Signal/Discussion route from this shell.
