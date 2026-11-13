# 0001: vinui is a shadcn style with one API across frameworks

- **Status:** Accepted (React Native dropped for now by [0011](0011-drop-react-native-for-now.md); Svelte added by [0009](0009-svelte-on-bits-ui.md))
- **Date:** 2026-10-28

## Context
vinui wants shadcn's copy-into-your-project workflow, a distinct look, and the same component API on React, Vue and React Native.

## Decision
- vinui is a **shadcn style**, installed *instead of* shadcn's look, distributed through its own shadcn-compatible registry (`shadcn add @vinui/<item>`).
- **Compatibility is promised at the API level, not visually.** It uses shadcn's file paths, part names, prop names and values, and token names.
- **Component set:** Headless UI v2's list. **API:** shadcn/ui (React), shadcn-vue (Vue) and React Native Reusables (native). Where the references differ, each framework follows its own reference. The shared contract is prop values and produced classes.

## Consequences
- shadcn call sites work unchanged when a vinui component replaces shadcn's.
- shadcn themes and components vinui doesn't have yet inherit our tokens.
- Mixing shadcn's and vinui's version of the same component in one app isn't supported.
- vinui's identity comes only from token values and component CSS.
