# UI States

- Path: `ctx/docs/code/browser/ui-states.md`
- Changed: `20260716`

## Purpose

Record visible browser-side states after pages and widgets are accepted.

## Common States

- `checking session` — public shell loaded and asks the server for safe session status;
- `authentication required` — no valid session exists and the passkey action is available;
- `enrollment required` — an administrator URL is present and the device can register its passkey;
- `authenticating` — browser WebAuthn verification is active;
- `connected` — the fixed Principal has a valid server session;
- `locked` — explicit logout revoked the session and hid Principal content;
- `unavailable` — server session verification cannot complete.

## Page-Level States

The desktop entry never renders connected state solely because static delivery succeeded. It restores connected state only from valid session status or successful WebAuthn verification.

## Widget-Level States

The passkey/enrollment action and explicit lock action expose disabled state while their operation is active.

## State Transitions

Checking session transitions to connected, authentication required, enrollment required, or unavailable. Successful WebAuthn transitions to connected. Explicit lock transitions to locked without a tab-switch lock transition.
