# Testing Overview

- Path: `ctx/docs/code/testing.md`
- Changed: `20260716`

## Test Boundary

`npm test` verifies that the manifest, service worker, and browser references remain relative to the host-assigned desktop scope and cannot claim mobile, API, or hook routes. Package metadata checks, ADSM validation, and TeqFW validation for future source modules remain required.
