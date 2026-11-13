# 0011: React Native dropped for now

- **Status:** Accepted (supersedes [0005](0005-native-styling-engine.md), [0006](0006-native-theme-as-file.md), [0007](0007-native-base-layer.md) and [0008](0008-native-web-support.md); amends [0010](0010-mvp-scope-web-first.md))
- **Date:** 2026-11-13

## Context
The MVP shipped Button, Dialog and Select on React, Vue, Svelte and React Native ([0010](0010-mvp-scope-web-first.md)). The next goal is integrating vinui into Vinskiano, Sokobanko and TagTape, which are web apps.

Under 0010, native was to stay "maintained, no new components". In practice that still cost every change:
- the native Jest suite;
- the react-native-web Playwright targets;
- device screenshots on iOS and Android;
- the Uniwind engine layer and its harness;
- the extra docs tab;
- Expo and Uniwind upgrades.

That's too much drag while all the work ahead is web.

## Decision
- **React Native is removed from the repo for now.** vinui ships React, Vue and Svelte.
- **It will be reintroduced later**, once the web integration is done and native is needed again.
- Removed:
  - `packages/native`, `apps/playground-native`, `spikes/native-engine`;
  - the registry's native target and its Uniwind engine layer;
  - the native-only prop metadata (`portalHost`; `asChild` as a native addition);
  - the `btn-label` utility (native only);
  - the native test targets;
  - the React Native docs (install page, tabs, live preview, screenshots).
- **Kept:** the overlay rule `*-panel` = the look and `*-content` = the look + web positioning. Web's `*-content` classes compose the panels, and the split is what native will build on again.

## Consequences
- **To bring native back, start from:**
  - ADRs [0005](0005-native-styling-engine.md)–[0008](0008-native-web-support.md) (engine, theme file, ThemeRoot, react-native-web), now marked superseded;
  - the running log's native rows, kept as history;
  - the MVP check in [0010](0010-mvp-scope-web-first.md);
  - the code at the last commit that had it, `10fee94` (branch `claude/three-components-requirements-8d93ef`). It includes Button, Dialog and Select, their Jest specs, the native web parity spec, the engine harness with iOS and Android baselines, and the release-build screenshot setup.
- Bringing it back gets a new ADR, and re-checks against the then-current RN Reusables, rn-primitives and Uniwind rather than restoring old versions as they were.
- The parity tests, Playwright targets, docs tabs and `Platform` union cover three platforms.
