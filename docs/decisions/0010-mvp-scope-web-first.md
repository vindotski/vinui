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

## MVP check (2026-11-13)
What was verified, at the commits that finish Select and its docs:
- **Fresh apps, every platform.** Each install page's "New project" section was run verbatim (commands and files, in page order) in an empty directory, with stdin closed and a timeout, so any prompt fails the run. Then `@vinui/select` was added with the same CLI, and the Select page's usage snippet was dropped in.
  - React (Vite) and Vue (Vite): no prompts; `tsc -b` / `vue-tsc -b` and `vite build` pass.
  - Svelte (SvelteKit 3): only shadcn-svelte's own `init` "Continue?", as the page says; `svelte-check` and `vite build` pass.
  - React Native (Expo): no prompts; `tsc` passes and `expo export` bundles iOS, Android and web.
- **Simulator and emulator** (release builds, iPhone 17 Pro and API 36): Button, Dialog and Select render and work in light and dark; Dialog closes with Cancel and with Android back; Select opens below the trigger, chooses, shows its check, and closes by tapping outside. One bug was found and fixed (the small native trigger clipped its text).
- **Automated suites:** parity (types, classes, documented props), native Jest, Playwright on the docs site, the three web playgrounds and react-native-web, in development and production builds; the native engine harness on iOS and Android.
- **Corrected during the check:** the React and Vue install pages now pass `--no-interactive` to create-vite (it asks about a linter otherwise), and the component pages link to every platform's setup.

**Still open: the hands-on pass on physical devices.** When it's done, the MVP is declared here and native moves to "maintained, no new components".
