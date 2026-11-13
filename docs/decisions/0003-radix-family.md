# 0003: The Radix family across frameworks

- **Status:** Accepted (supersedes [0002](0002-react-on-base-ui.md); extended by [0009](0009-svelte-on-bits-ui.md) with Bits UI for Svelte)
- **Date:** 2026-10-28

## Context
One API across React, Vue and React Native is easiest when the primitives share anatomy. Most shadcn code assumes Radix.

## Decision
- Primitives: **Radix** (`radix-ui`, React), **Reka UI** (Vue), **rn-primitives** (React Native).
- `asChild` (`as-child` in Vue) is the composition API, and `data-state` is the single state hook.

## Consequences
- React vinui requires a **Radix-based shadcn project** (`radix-*` or `new-york` style). In `base-*` projects the shadcn CLI rewrites `asChild` → `render` in installed files, which breaks Radix components.
- Radix's development pace is a known risk.
- React `className` is a plain string again.
