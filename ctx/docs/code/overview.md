# Code Overview

- Path: `ctx/docs/code/overview.md`
- Changed: `20260716`

## Code Structure

`web/` contains the package-owned desktop entry document, relative-scope manifest and service worker, stylesheet, and icon. `src/` remains reserved for future TeqFW modules addressed through the `Alarisa_Desk_` namespace.

## Engineering Constraints

- use ESM and `.mjs` for TeqFW implementation modules;
- keep namespace aliases synchronized with `types.d.ts`;
- depend on shared communication through `@flancer32/alarisa-comm` when concrete contracts exist;
- do not invent browser behavior or server contracts in source code.

## Browser Documentation

The current scoped PWA shell is recorded in `browser/browser-app.md`. The fuller workspace, navigation, widget, state, asset, and responsive model remains deferred until accepted behavior exists.
