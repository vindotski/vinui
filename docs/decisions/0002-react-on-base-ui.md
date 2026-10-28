# 0002: React components on Base UI

- **Status:** Superseded by [0003](0003-radix-family.md)
- **Date:** 2026-10-28

## Context
The first React components (Button, Dialog) needed headless primitives, and shadcn supports Base UI styles.

## Decision
Build the React components on `@base-ui/react`.

## Consequences
- Base UI's `className` can be a function of state, and shadcn's `cn` silently drops functions, so vinui typed `className` as a string only.
- Base UI sets `data-open` / `data-closed` while Reka sets `data-state`, so the CSS needed both selectors.
- Replaced by the Radix family before any release.
