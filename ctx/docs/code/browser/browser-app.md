# Desktop Browser Application

- Path: `ctx/docs/code/browser/browser-app.md`
- Changed: `20260716`

## Purpose

Define the implemented desktop PWA shell without inventing the future workspace interface.

## Accepted Scope

The package owns an installable desktop PWA shell published by the host at `/desk/`. Its manifest, service worker, stylesheet, and icon use relative paths so the worker remains confined to that assigned scope. The shell checks the opaque server session, uses the public shared `comm` WebAuthn client when authentication is required, accepts administrator enrollment URLs, and exposes explicit Alarisa logout/lock. The session cookie is not JavaScript-readable.

The connected state means the one fixed Principal has a valid credential-bound server session. A valid long-lived desktop session restores automatically; tab switching does not lock the application. Static delivery remains public and does not itself establish the connected state.

## Deferred Model

Credential-management UI, workspace pages, Signals, Discussions, navigation, widgets, Web Components, persistent sensitive browser state, and responsive workspace behavior remain deferred. The connected-channel shell must not imply that those capabilities already exist.
