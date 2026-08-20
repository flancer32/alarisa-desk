---
name: alarisa-desk-world-picture
description: Use when hosting, integrating, or operating @flancer32/alarisa-desk's authenticated desktop World Picture viewer; not for editing, graph-canvas, YAML, or State ownership.
---

# Alarisa Desk World Picture Viewer

Use this package as static desktop PWA content mounted by the Alarisa host at `/desk/`.
It presents the authenticated current World Picture as a file-like primary-parent tree.

## Host Requirements

- Publish the package's `web/` assets under `/desk/` without changing their relative asset paths or worker scope.
- Provide the public shared authentication asset at `/_assets/comm/auth.js`.
- Protect the same-origin World Picture reads with the existing opaque HttpOnly Principal session:
  - `GET /api/v1/world-picture/tree`
  - `GET /api/v1/world-picture/tree?focus=<positive State id>`
  - `GET /api/v1/world-picture/node/<positive State id>`
- Do not add a desk-specific server handler, database access, State DI component, or another browser DTO.

## User-visible Behavior

After session restoration or successful passkey authentication, the viewer loads the complete primary-parent tree with branches collapsed. Its independent transient states are the explored root, expanded branches, and selected inspector Object. The Principal selects to inspect, explicitly expands/collapses child visibility, uses Open or double-click to drill down, uses the breadcrumb to return to an ancestor or the complete World Picture, follows labelled cross-links without moving hierarchy context, and explicitly locks Alarisa.

The State DTO has no display-name field, but its typed Components and Properties let the viewer derive a human label.
For each Case, the viewer presents its `title` as the primary label; type and stable id are secondary metadata.
If a projection is incomplete, it preserves a stable explicit fallback rather than inventing a name.
Relations other than `case-parent` are cross-links; they never move an Object in the hierarchy. The inspector groups them primarily by relation type and provides an object-to-relation-types view for repeated targets.

## Security And Caching

The browser sends the opaque same-origin cookie implicitly and never reads or persists it.
World Picture data is transient page memory only.
Do not cache `/api/` reads in the service worker or persist them in Web Storage, IndexedDB, or URL fragments.
A `401` hides protected content and returns to authentication.
A `404` identifies an absent/stale target without corrupting the current view.
Network and `503` failures clear rendered protected data and offer retry without rendering server error bodies.

## Limits

This package implements a read-only desktop tree projection.
It does not implement editing, graph-canvas visualization, YAML import/export, revision/history browsing, or browser-owned World Model state.

## Consumer Check

Verify the installed package's `web/` files, its published `skills/` directory, the host static mount, and the current `@flancer32/alarisa-comm` World Picture contract before integration.
The host owns agent-skill discovery; it may mount this installed skill in its own catalog with a relative symlink, but this package never auto-links or changes host configuration.
