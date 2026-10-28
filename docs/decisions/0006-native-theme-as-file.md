# 0006: Native theme delivered as a file

- **Status:** Accepted
- **Date:** 2026-10-28

## Context
Uniwind needs per-theme variables nested as `@layer theme { :root { @variant light { … } @variant dark { … } } }`.

## Decision
The native `init` item ships the theme as a `registry:file` (`vinui-theme.css` at the project root), generated from `@vinui/tailwind`, and adds `@import "./vinui-theme.css"` to `global.css` through the `css` field.

## Consequences
- The shadcn CLI's `css` / `cssVars` writers can't produce that nesting. Three shapes were tested, and all left the tokens unset.
- Token *values* still come from the single source in `@vinui/tailwind`. Only the shape is native-specific, and the registry build generates it.
