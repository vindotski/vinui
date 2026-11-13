# 0005: Native styling engine: Uniwind

- **Status:** Superseded by [0011](0011-drop-react-native-for-now.md) (React Native dropped for now; kept as the starting point when it returns)
- **Date:** 2026-10-28

## Context
- Native must share the single Tailwind 4 token system and, ideally, the component classes in `@vinui/tailwind`.
- NativeWind 4 is Tailwind 3. NativeWind 5 (Tailwind 4) is only a release candidate.
- Uniwind is stable on Tailwind 4, and React Native Reusables ships a Uniwind flavour.

## What was tested
Both engines were tested in Expo SDK 58 apps, in Expo Go on iOS 26.5 and Android, plus `expo export` for both platforms. A className probe logged the resolved styles. The checks:
- **Tokens:** `@theme` / CSS variables, oklch, `--radius` maths, dark mode (system + manual).
- **Component classes:** `btn*` with `var()` fallbacks and the dialog classes.
- **Icons**, **Expo Go**, **export**, **maintenance**.

## Results
- **Uniwind 1.13.1 passed everything.**
  - oklch → hex; radius maths (`rounded-md` 8, `rounded-lg` 10).
  - Dark mode works both via `Uniwind.setTheme("system")` and manually.
  - `btn` sizes are 28 / 32 / 36 / 40, with per-variant `--btn-*` variables.
  - Icons work via `withUniwind`.
- **NativeWind 5.0.0-rc.0 failed our CSS.**
  - Everything is scaled ×0.875 (1rem = 14px).
  - `rounded-md` is empty (the radius `calc` fails).
  - Wrong `var()` fallbacks give every `btn` a visible border.
  - Dark mode is inconsistent: component variables stay light, and the manual toggle doesn't re-resolve.
  - The X icon is invisible.
- **Changes our CSS needed for native class reuse:**
  - `border` longhands, because React Native drops the shorthand.
  - A `btn-label` utility, because text doesn't inherit colour.
  - A `*-panel` split, because native has no `position: fixed` / `calc(100%…)`.

## Decision
- Use **Uniwind**, pinned to an exact version (1.13.0). It is a **setup prerequisite**: the native `init` and the install docs pin it, and component items don't list it.
- vinui native requires Uniwind; NativeWind 4 projects must migrate.
- Uniwind-specific code lives in a marked engine layer:
  - native `icon.tsx` and `lib/vinui-engine.ts`,
  - the registry's `engines/uniwind.ts`,
  - one docs setup partial.

## Consequences
- Native shares the web class snapshot.
- **Risk:** Uniwind is young (2025-07) and mostly maintained by two people, though very active (38 releases/year, ~5-day issue turnaround).
- **Upgrade checklist (one commit):**
  - re-run the engine harness and update its baselines,
  - bump the `init` pin,
  - update the docs' tested version,
  - update the repo's own Uniwind version.
- Re-run the same checks when NativeWind 5 is stable.
## Harness
- [`spikes/native-engine/`](../../spikes/native-engine/README.md) re-runs these checks against the **live** `@vinui/tailwind` CSS and diffs against committed per-platform baselines:

  ```bash
  pnpm spike:native-engine                                         # pinned Uniwind, iOS + Android, diff vs baseline
  pnpm spike:native-engine --engine nativewind5 --version <stable>  # re-compare NativeWind when it's stable
  ```
- **Baselines** (`baseline/uniwind.{ios,android}.json`) were recorded on Uniwind **1.13.0**: 53 cases × light / dark / system. iOS and Android resolved identically.
- **1.13.0 re-verified:** it gave the same values as the 1.13.1 spike, so no `minimumReleaseAgeExclude` is needed.
