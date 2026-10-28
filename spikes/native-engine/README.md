# Native engine harness

Renders vinui's **live** CSS with a React Native styling engine and records the resolved style of every case. It backs [ADR 0005](../../docs/decisions/0005-native-styling-engine.md).

## Inputs
All inputs are read fresh on every run:
- **Theme:** `packages/tailwind/src/theme.css`, shaped by the same engine layer the registry ships (`packages/registry/src/engines/uniwind.ts`).
- **Component CSS:** `packages/tailwind/src/components/*.css`.
- **Cases:** token utilities, every shipped `@utility`, and the `btn` / `btn-label` × variant / size combos from `packages/core`.

## How it runs
For each platform, the harness:
1. Creates (once) an Expo app under `.work/<engine>-<version>/` (gitignored).
2. Runs the app in Expo Go: iOS on the iPhone 17 Pro simulator, Android on the `vinui_api36` emulator (API 36, Expo 58's target).
3. Logs each case's style in three phases: `light` (manual), `dark` (manual), and `system` (the device is set to dark).

## Run it
```bash
pnpm spike:native-engine                       # Uniwind (pinned version), iOS + Android, diff vs baseline
pnpm spike:native-engine --platform ios        # one platform
pnpm spike:native-engine --update-baseline     # record a new baseline (after an intended change)
pnpm spike:native-engine --engine nativewind5 --version 5.0.0   # compare another engine
```
- **Exit code:** non-zero when a run differs from `baseline/<engine>.<platform>.json`, and every difference is printed.
- **Baselines** are committed; the current ones come from Uniwind 1.13.0.

## Not part of normal flows
`spikes/` is outside the pnpm workspace: no builds, typechecks or `pnpm test`.

**Needs:**
- Xcode with an `iPhone 17 Pro` simulator,
- an Android SDK with a `vinui_api36` AVD (`system-images;android-36;google_apis;arm64-v8a`).

## Uniwind upgrade checklist (one commit)
1. Bump `UNIWIND_VERSION` in `packages/registry/src/engines/uniwind.ts` (the native `init` pin).
2. Run `pnpm spike:native-engine --version <new>`. Review every difference; if they're intended, re-run with `--update-baseline`.
3. Update the tested version in the native install docs and the repo's own Uniwind dependency.
