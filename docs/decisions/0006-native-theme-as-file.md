# 0006: Native theme delivered as a file

- **Status:** Accepted
- **Date:** 2026-10-28

## Context
Uniwind needs per-theme variables nested as `@layer theme { :root { @variant light { … } @variant dark { … } } }`.

## Decision
The native `init` item ships the theme as a `registry:file` (`vinui-theme.css` next to `global.css`: at the project root, or in `src/` for src-layout apps), generated from `@vinui/tailwind`, and adds `@import "./vinui-theme.css"` to `global.css` through the `css` field.

## Consequences
- The shadcn CLI's `css` / `cssVars` writers can't produce that nesting. Three shapes were tested, and all left the tokens unset.
- Token *values* still come from the single source in `@vinui/tailwind`. Only the shape is native-specific, and the registry build generates it.
- **Corrected 2026-10-29:** the file's target was `~/vinui-theme.css`, which is always the project root. In a src-layout app (Expo Router's SDK 58 template, `src/global.css`) the `@import "./vinui-theme.css"` then didn't resolve. The target is now `vinui-theme.css` (no `~/`), which the CLI places under `src/` in those apps. Verified in both templates.
