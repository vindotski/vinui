# 0010: MVP of three components on every platform, then web first

- **Status:** Accepted (replaces the "Switch…Select on every platform" order of work)
- **Date:** 2026-11-13

## Context
vinui is going to be adopted in three apps: Vinskiano, Sokobanko and TagTape. Building every component on every platform delays that. A small set that is proven on every platform tests the cross-framework design, without paying the native cost for each component.

## Decision
- **The MVP is Button, Dialog and Select, on React, Vue, Svelte and React Native.** Each comes with registry items, tests, playgrounds and a docs page.
  - Select is the third component because it is the most useful for the apps. It also covers positioned overlays, typeahead and a native picker, which later components reuse.
- **After the MVP, new work is web-only** (React, Vue, Svelte) until vinui is integrated into the three apps.
  - Native stays at the MVP set. It stays maintained (tests, engine upgrades), but gets no new components.
- **vinui stays on the Radix family. It doesn't move to React Aria**, even though the apps use React Aria.
  - React Aria exists only for React, and its API differs from shadcn's (`isDisabled`, `onPress`, `isSelected`, render props, `data-selected`).
  - Adopting it would break the single API ([0001](0001-shadcn-style-api.md)) and the parity tests.

## Consequences
- The order of work is: Svelte Button and Dialog, then Svelte docs, then Select on all four platforms, then an MVP check (fresh apps, devices).
- **In the apps, vinui and React Aria live side by side.** vinui replaces React Aria pieces as it covers them. React Aria stays for what vinui won't have soon, such as date and time pickers and i18n-heavy parts.
  - The look stays consistent because both use the `@vinui/tailwind` tokens.
  - vinui's component classes key off `data-state`, so they don't style React Aria components. That's accepted, not worked around.
- **Watch item:** a Radix overlay and a React Aria overlay open at the same time (e.g. a React Aria popover inside a vinui Dialog) can fight over focus trapping and outside clicks. Check this during integration and log the findings.
- Native-only open items (device e2e, a `minSdk` emulator, global icon interop) wait until after the integration.
