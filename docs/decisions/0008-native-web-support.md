# 0008: vinui native supports react-native-web (Expo universal apps)

- **Status:** Superseded by [0011](0011-drop-react-native-for-now.md) (React Native dropped for now; kept as the starting point when it returns)
- **Date:** 2026-10-28

## Context
Expo apps often ship iOS, Android **and** web from one codebase, and React Native Reusables supports web. A spike ran the real `packages/native` code in Expo web (dev and production) and measured it against vinui React.
- **Button:** identical to vinui React. That covers every variant at rest, hover and press, in light and dark; every size and icon size; the focus ring; and the disabled state.
  - Uniwind emits real CSS on web, so the shared `btn` classes and their pseudo-classes apply.
  - React Native Web renders `Pressable` as a `<button>`.
- **Dialog:** `@rn-primitives/dialog`'s web build wraps **Radix**, so accessibility and behaviour match vinui React. That covers the name and description, the focus trap and return, Escape, outside click and close buttons.
- **Theming:** `Uniwind.setTheme` toggles `.light` / `.dark` on `<html>` and follows the OS in `system` mode. ThemeRoot paints the page; `expo-system-ui` and `expo-status-bar` are safe on web.

## Decision
- **Supported:** vinui native on react-native-web, for **Expo universal apps**. Web-only apps use vinui React, which is lighter and doesn't need React Native.
- **Prerequisites:** `npx expo install react-native-web react-dom @expo/metro-runtime`.
- **Web-only styling uses Uniwind's `web:` variant** in class strings (not `Platform.select`), so it stays visible next to the shared classes.
  - The Dialog uses `web:items-stretch` / `web:mx-auto`, because Radix wraps the panel in its own element.
- **Shared CSS covers what only web needs, when native ignores it.** Example: `.btn:hover .btn-label` gives native's label `Text` React's hover colour (ghost / outline).

## Consequences
- **A fourth test target:** Playwright runs against the playground's web build (`native-web-dev`, `native-web-prod`).
  - `native-web-parity.spec.ts` compares every button's computed styles with the React demo on the docs.
  - `dialog.spec.ts` runs the same scenarios, with native-specific expectations for structure and animation.
- **Animations:** native web uses Reanimated (React web uses CSS keyframes). For the future motion step, Reanimated motion on native covers native web too.
- **Bundle (production, gzipped JS, Uniwind 1.13.0 / Expo 58):**

  | | Total | Adds |
  |---|---|---|
  | Empty Expo web app | 103 KB | |
  | + Uniwind | 139 KB | 36 KB |
  | + Reanimated (setup prerequisite) | 297 KB | 158 KB |
  | + vinui Button, Dialog, ThemeRoot | 376 KB | ≈79 KB (incl. Radix Dialog, rn-primitives, react-native-svg) |

- **Found by the bundle measurement:** importing from the `lucide-react-native` root bundles every icon under Metro (+203 KB on web; native bundles too). vinui components use per-icon imports (`lucide-react-native/icons/x`).
- **Docs preview:** Astro islands would need a hand-built React Native toolchain inside Vite. So the docs embed the playground's Expo web export in an iframe, labelled "React Native (web)", next to the device screenshots. Built 2026-10-29:
  - `apps/docs/scripts/native-preview.ts` exports the playground with `EXPO_BASE_URL=/native-preview` (read by `app.config.js`) into `apps/docs/public/native-preview/`, and skips the export when a hash of the playground's inputs is unchanged.
  - `?demo=<name>` renders one demo (`apps/playground-native/docs-preview.tsx`), mirroring the docs' React demo.
  - The frame gets its `src` only when the React Native tab is shown. It sizes itself to the demo's height (`vinui:preview-size`) and follows the docs' theme (`?theme=` for the first paint, then `vinui:theme` messages, plus a `vinui:preview-ready` handshake for changes made while it loads). Messages are same-origin only.
