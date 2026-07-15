# AI Introduction

- Path: `ctx/docs/ai-intro.md`
- Changed: `20260715`

## Purpose

Orient agents to `@flancer32/alarisa-desk`, the desktop browser/PWA composition package for Alarisa.

## Project Type

This is an ESM-only TeqFW npm package in the `desk` area. It is intended to compose desktop-oriented browser presentation, navigation, and workspaces for Principal–Double interaction.

## Boundaries

Shared communication contracts belong to `@flancer32/alarisa-comm`. Server authority and durable state belong outside this client package. Concrete pages, layouts, widgets, and browser state remain undeclared until upstream product decisions justify them.

## Technology Base

Node.js 20 or newer, ECMAScript modules, npm, and the `Alarisa_Desk_` TeqFW namespace.

## Reading Angle

Read `product/overview.md`, then `architecture/overview.md`, `environment/overview.md`, and `code/overview.md`.
