# Architecture Overview

- Path: `ctx/docs/architecture/overview.md`
- Changed: `20260715`

## Purpose

Define the initial architectural boundary of the desktop application package.

## Architectural Style

The package is the composition root of a desktop browser/PWA modular monolith. It may aggregate coherent `desk` packages and use `comm` contracts without taking ownership of shared communication semantics.

## Major Boundaries

- browser presentation and desktop interaction remain inside the package;
- shared communication belongs to `@flancer32/alarisa-comm`;
- server-specific implementation and authority must not enter the package;
- concrete browser structure remains deferred until product documentation defines it.

## Product Dependency

Architecture must refine `product/` and must not invent desktop interaction behavior downstream.
