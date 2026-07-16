# Code Overview

- Path: `ctx/docs/code/overview.md`
- Changed: `20260716`

## Code Structure

`web/` contains the package-owned desktop entry document, module bootstrap, relative-scope manifest and service worker, stylesheet, and icon. `src/` remains reserved for future TeqFW modules addressed through the `Alarisa_Desk_` namespace. The module imports the shared `@flancer32/alarisa-comm` browser authentication client from the host-assigned `/_assets/comm/auth.js` URL.

## Engineering Constraints

- use ESM and `.mjs` for TeqFW implementation modules;
- keep namespace aliases synchronized with `types.d.ts`;
- depend on shared communication through `@flancer32/alarisa-comm` when concrete contracts exist;
- do not invent browser behavior or server contracts in source code.
- never read, copy, or persist the `HttpOnly` Principal session credential.

## Browser Documentation

The current scoped PWA shell, passkey authentication, enrollment entry, session restoration, and explicit lock are recorded in `browser/browser-app.md`. The fuller workspace, navigation, widget, asset, and responsive model remains deferred until accepted behavior exists.
