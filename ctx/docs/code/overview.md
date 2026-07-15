# Code Overview

- Path: `ctx/docs/code/overview.md`
- Changed: `20260715`

## Code Structure

`src/` is reserved for TeqFW ECMAScript modules addressed through the `Alarisa_Desk_` namespace. No functional modules are created by the initial scaffold.

## Engineering Constraints

- use ESM and `.mjs` for TeqFW implementation modules;
- keep namespace aliases synchronized with `types.d.ts`;
- depend on shared communication through `@flancer32/alarisa-comm` when concrete contracts exist;
- do not invent browser behavior or server contracts in source code.

## Browser Documentation

The current browser boundary is recorded in `browser/browser-app.md`. The fuller page, layout, navigation, widget, state, asset, and responsive model remains deferred until accepted behavior exists.
