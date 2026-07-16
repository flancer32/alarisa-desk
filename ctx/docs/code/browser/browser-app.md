# Desktop Browser Application

- Path: `ctx/docs/code/browser/browser-app.md`
- Changed: `20260716`

## Purpose

Define the implemented desktop PWA shell without inventing the future workspace interface.

## Accepted Scope

The package owns an installable desktop PWA shell published by the host at `/desk/`. Its manifest, service worker, stylesheet, and icon use relative paths so the worker remains confined to that assigned scope. The entry shows that the desktop channel is connected and links back to the host-owned manual channel choice.

## Deferred Model

Workspace pages, Signals, Discussions, navigation, widgets, Web Components, persistent browser state, and responsive workspace behavior remain deferred. The connected-channel shell must not imply that those capabilities already exist.
