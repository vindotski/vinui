# 0007: Native base layer: ThemeRoot

- **Status:** Accepted
- **Date:** 2026-10-28

## Context
On web, the theme's base layer (`body { bg-background text-foreground }`) paints the page. Native has no `body`.
- On phones, dark mode switched the components while the page stayed white.
- The playground's root was `react-native-safe-area-context`'s `SafeAreaView`. Uniwind ignores `className` on components that aren't React Native core components, so `bg-background` was silently dropped.
- Every app also needs a status bar that matches the theme, a native root colour that matches it (behind transitions and rotations), and a `<PortalHost />`. Each is easy to get subtly wrong.

## Decision
- **A native-only item, `@vinui/theme-root`** (a vinui addition), provides `<ThemeRoot>`, wrapped around the app once. It renders:
  - a `bg-background flex-1` view,
  - an `expo-status-bar` `StatusBar` following the resolved vinui theme, so a manual `Uniwind.setTheme()` drives it too,
  - `expo-system-ui`'s root background, set from the `background` token,
  - `<PortalHost />`.
- **Union rule:** `portalHost={false}` / `statusBar={false}` for apps (e.g. RNR setups) that already render their own. This is a prop rather than detection: rn-primitives has no public "host mounted" signal, and two hosts with the same name show every portal twice (a spec pins this).
- **`useNavigationTheme()`** builds React Navigation's colours from the tokens instead of a hardcoded `NAV_THEME`. It's optional, doesn't import React Navigation, and leaves out unresolved tokens so React Navigation's defaults stay.
- **Colours reach JavaScript from the same CSS:** via Uniwind's `useCSSVariable`, wrapped in the engine layer (`useThemeColors`, `useVinuiColorScheme` in `lib/vinui-engine.ts`). No JS copy of the tokens exists.

## Consequences
- Checked on devices (Uniwind 1.13.0):
  - `useCSSVariable` returns hex (`#rrggbbaa` with alpha) on the first render, under `--color-<token>` (and `--<token>`), and re-renders on a theme change.
  - React Native's `processColor` accepts it, so no oklch conversion is needed.
- `expo-status-bar` and `expo-system-ui` become setup prerequisites (`npx expo install`).
- The CLI can't edit a user's app root or `_layout.tsx`, so placing ThemeRoot is a documented setup step, checked in the fresh-app check.
