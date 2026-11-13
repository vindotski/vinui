# Decisions

The **why** behind vinui's rules. The rules themselves live in [../CONVENTIONS.md](../CONVENTIONS.md).

- **Big decisions** get a numbered ADR. Each has a status and a date; superseded ADRs stay, linked to their replacement.
- **Smaller decisions, cross-framework differences and tooling quirks** go in the running log below.
- Add new rows at the end of their section.

## ADRs

| # | Decision | Status |
|---|---|---|
| [0001](0001-shadcn-style-api.md) | vinui is a shadcn style with one API across frameworks | Accepted |
| [0002](0002-react-on-base-ui.md) | React components on Base UI | Superseded by 0003 |
| [0003](0003-radix-family.md) | The Radix family across frameworks | Accepted |
| [0004](0004-cva-exact-button-variants.md) | cva-exact `buttonVariants`, `cn` from "cn", explicit `clsx` | Accepted |
| [0005](0005-native-styling-engine.md) | Native styling engine: Uniwind | Accepted |
| [0006](0006-native-theme-as-file.md) | Native theme delivered as a file | Accepted |
| [0007](0007-native-base-layer.md) | Native base layer: ThemeRoot | Accepted |
| [0008](0008-native-web-support.md) | vinui native supports react-native-web (Expo universal apps) | Accepted |
| [0009](0009-svelte-on-bits-ui.md) | Svelte on Bits UI, referencing shadcn-svelte | Accepted |
| [0010](0010-mvp-scope-web-first.md) | MVP of three components on every platform, then web first | Accepted |

---

## Running log

### Distribution and registry
| **Expo-managed native modules (Reanimated, Worklets, Screens, SVG) are setup prerequisites**, installed with `npx expo install`; native items don't list them | **Corrected, same day.** The shadcn CLI runs `npx expo install -- <deps>` in Expo apps, but everything after `--` goes to the package manager, so it installs the *latest* versions, not SDK-matched ones. That produced Worklets 0.13.1 against Expo 58's expected 0.13.0, a JS/native mismatch in Expo Go. A plain `npx expo install <pkgs>` is SDK-aware. | 2026-10-28 |
| The native theme item and the native `init` ship a generated `vinui-theme.css` (`packages/native/.generated/`, gitignored) | The shadcn CLI reads registry files from disk; the engine layer generates the file at build time. | 2026-10-28 |
| Repo dependencies respect pnpm's release age by pinning the newest version past the window (Expo 58.0.16, jest-expo 58.0.11, Screens 4.30.0, Lucide 1.60.0, RN 0.88.0), not by excluding | The first install auto-added ~40 exclusions for versions published that day. `@expo/metro-config@58.0.18` is pinned in `packages/native`, so Uniwind's `*` peer matches Expo's own. `unrs-resolver`'s build script is denied (prebuilt). | 2026-10-28 |

| Decision | Reason / trade-off | Date |
|---|---|---|
| Registry paths `/r/react/{name}.json`, `/r/vue/{name}.json`, `/r/native/{name}.json`, with the **same item names** on every platform | One `@vinui/<name>` everywhere; `@vinui` points at the framework's path. Targets stay data-driven so a second native engine flavour could be added. | 2026-10-28 |
| The registry URL lives in one constant, `REGISTRY_URL` (`packages/registry/src/config.ts`), set via `VINUI_REGISTRY_URL` | The docs and the build share it; deploy only sets the env var. | 2026-10-28 |
| One **`init` item** (`registry:base`, `extends: "none"`) per framework: sets `@vinui` in `components.json`, installs shadcn's `utils` and the vinui theme | No shadcn theme, Geist font, tw-animate-css, lucide or cva. **Vue must use `init --preset <url>`**: without `--preset`, shadcn-vue asks questions and ignores the config. | 2026-10-28 |
| Native items are named the same as web. `text`, `icon` and `engine` are native-only items. | — | 2026-10-28 |
| **Setup prerequisites** (Uniwind) are pinned in `init` and the install docs, never on component items | The CLI runs `npm install <dep>`, so a pinned dependency on an item would downgrade a user's newer version. | 2026-10-28 |
| Stock `shadcn init` with a web preset fails in Expo (`ERESOLVE`); native users use vinui's native `init` | — | 2026-10-28 |
| Svelte items at `/r/svelte/{name}.json`, same names; **no vinui `init` item**. Setup is stock `shadcn-svelte init --preset <style>`, then `shadcn-svelte add <url>/r/svelte/<item>.json --yes --overwrite`; the `theme` item comes with the first component | shadcn-svelte has no `registries` map, no `extends: "none"`, and `init --preset` takes a style name or a preset code, not a URL ([0009](0009-svelte-on-bits-ui.md)). | 2026-11-13 |
| Svelte registry dependencies on vinui items are **relative** (`./button.json`); the build rewrites `@vinui/<name>` for that target | shadcn-svelte resolves `./` and `../` against the URL of the item that lists them, so the items don't depend on `VINUI_REGISTRY_URL`. A bare name (`button`) would resolve to **shadcn-svelte's own** item. | 2026-11-13 |
| Svelte items don't list `utils`; they rely on the `utils` that `shadcn-svelte init` installs (`cn` + `WithElementRef` types), and import `cn` from `$lib/utils.js` | That's what shadcn-svelte's own items do. Listing `utils` made `add` ask "overwrite all existing files?" in every initialized project. | 2026-11-13 |
| Svelte `add` needs `--yes --overwrite` for no prompts | `--yes` skips the confirmation, but the CLI asks "Updates to your … .css are required … Continue?" for any item with CSS unless `--overwrite` is set. With `--overwrite`, existing component files of the same name are replaced too. | 2026-11-13 |
| Svelte items put packages in `devDependencies` (`bits-ui`, `@internationalized/date`, `clsx`) | shadcn-svelte's convention: SvelteKit bundles everything. | 2026-11-13 |

### API
| Native Button keeps shadcn's `asChild` (via `@rn-primitives/slot`) | RNR's Button has no `asChild`. API parity follows shadcn, so this is a vinui addition relative to RNR. | 2026-10-28 |
| Native `Text` is a subset of RNR's: `TextClassContext` + `asChild`, without RNR's typography variants (h1, p, lead, …) | Web has no Text component, so typography variants wait for a shared design. | 2026-10-28 |
| Native disabled Button adds `opacity-50`; `DialogTitle` adds `text-foreground`; the Dialog close button uses `aria-label="Close"` | React Native has no `:disabled` pseudo-class and no text inheritance. `aria-label` is announced by VoiceOver / TalkBack and queryable in tests (RNR uses an `sr-only` Text). | 2026-10-28 |
| Native Dialog layout: overlay `absolute inset-0 items-center justify-center bg-black/50 p-4`, panel `dialog-panel w-full max-w-lg`, Reanimated fades, `FullWindowOverlay` on iOS | Follows RNR's structure with vinui's panel classes; the padding and max width keep the panel off the screen edges and stop it stretching on tablets. | 2026-10-28 |
| Native engine check uses Uniwind's **public** `useResolveClassNames("bg-background")`: an empty result means Uniwind isn't configured or vinui's theme isn't loaded | **Corrected, same day.** The first signal, `globalThis.__uniwindThemes__`, exists only in Uniwind's type declarations and is never set, so it was a false positive in a correctly configured app. Verified on a device: configured → no warning; Metro plugin removed → exactly one warning. | 2026-10-28 |
| The engine check judges **1 s after mount**, on the latest resolved value, not on the first render | **Corrected, 2026-10-29.** On web, Uniwind resolves classes from the loaded stylesheet and re-resolves when it arrives; under Expo Router in development the CSS arrives after the first render, so the first-render check warned in a correctly configured app. Verified in Expo's Router template on web: configured → silent; Metro plugin removed → one warning. The delay doesn't change native, where resolution is synchronous. | 2026-10-29 |
| Native `Text` applies its defaults (`text-foreground text-base`) only when no parent class context is set | Found on a device: Tailwind sorts single-property utilities after multi-property ones like `btn-label`, and tailwind-merge doesn't know custom utilities, so the defaults overrode button label colours and sizes. A Jest regression spec now checks the label's classes. | 2026-10-28 |

| Decision | Reason / trade-off | Date |
|---|---|---|
| Button `variant`: default, secondary, outline, ghost, destructive, link. `size`: default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg. | shadcn call sites work unchanged; the earlier `primary` / `md` names were renamed. | 2026-10-28 |
| `data-slot` on every part; Button sets `data-variant` / `data-size` | Matches the current references. | 2026-10-28 |
| `DialogFooter` has `showCloseButton`, so Dialog depends on Button | Matches the current references. | 2026-10-28 |
| `DialogScrollContent` (shadcn-vue only) is skipped in every framework for now | Keeps one API. | 2026-10-28 |
| Native: `onPress` only (no `onClick` alias); `asChild` via `@rn-primitives/slot` | React Native idioms where unavoidable. | 2026-10-28 |
| Native Button auto-wraps string / number children in `Text`; `<Text>` children also work | The union rule: accept both the native and the web style. A vinui addition. | 2026-10-28 |
| Native `@vinui/engine` (`lib/vinui-engine.ts`): missing Uniwind fails the bundle; installed-but-unconfigured gives one `__DEV__` warning (silenced in tests, `disableEngineCheck()` to opt out) | Without it, components would render unstyled with no error. A vinui addition. Unit-tested; the real-app failure modes are verified with the fresh-app checks. | 2026-10-28 |
| Native `<ThemeRoot>` and `useNavigationTheme()` (`@vinui/theme-root`), with `portalHost` / `statusBar` opt-outs | Native has no `body` base layer ([0007](0007-native-base-layer.md)). A vinui addition. | 2026-10-28 |
| Native `<Button asChild>` needs a **box child** (`Pressable`, or anything that renders a `View`). For links, put the router's link around the Button: `<Link href asChild><Button>…</Button></Link>` | On web the `btn` classes turn an `<a>` into a centring flex box. A React Native `Text` is a leaf and can't centre its own glyphs (iOS has no `textAlignVertical`), so a bare `Text` child shows its label at the top. A `lineHeight` hack would tie labels to fixed heights. The `Link asChild` nesting is the Expo Router / RNR idiom. | 2026-10-28 |
| Prop metadata: `addition` lists the **platforms** where something is a vinui addition (e.g. Button `asChild` is standard in shadcn/ui and shadcn-vue, an addition vs RNR); `type` shows a type when there are no fixed `values` | One prop can be standard on one platform and an addition on another. | 2026-10-29 |
| Svelte Button follows shadcn-svelte: `href` renders an `<a>` (disabled links lose `href` and leave the tab order); no child snippet | shadcn-svelte's Button has no composition API. Elsewhere composition is Bits UI's `child` snippet, e.g. `<Dialog.Trigger>{#snippet child({ props })}<Button {...props}>…`. | 2026-11-13 |
| Svelte Button takes every core size (`xs`, `icon-xs` included) and sets `data-variant` / `data-size` | The shared contract is core's unions and classes; shadcn-svelte's Button lacks `xs` / `icon-xs` and the data attributes. | 2026-11-13 |
| Svelte `DialogFooter` has `showCloseButton` (**vinui addition**); the close icon is inline SVG | Parity with React and Vue; shadcn-svelte has neither (it uses `@lucide/svelte`). | 2026-11-13 |
| Svelte unions and `buttonVariants` live in `button/index.ts` (shadcn-svelte keeps them in `button.svelte`'s module script) | Type tests stay off `.svelte` files, as with Vue. | 2026-11-13 |
| Select (React) follows shadcn/ui's new-york-v4 Select on Radix: the same ten parts, `SelectTrigger size="sm" | "default"` (with `data-size`), `SelectContent position` defaulting to `"item-aligned"`; icons are inline SVG, like Dialog's close icon | radix-vega has the same API, only icon placeholders and classes differ. Exports a `SelectTriggerSize` type (shadcn writes the union inline) for the parity tests. | 2026-11-13 |

### Styling

| Decision | Reason / trade-off | Date |
|---|---|---|
| `@vinui/tailwind` (tokens + `@utility` component classes) is the single styling source | Frameworks apply classes, so the look can't drift. | 2026-10-28 |
| Variants and sizes only set `--btn-*` custom properties | No property conflicts; plain utilities still win. | 2026-10-28 |
| A bare `btn` = default variant + default size; others are `btn-<value>` | Avoids a `btn-default` collision between variant and size. | 2026-10-28 |
| Sizes keep vinui's scale (28 / 32 / 36 / 40 px); only the names match shadcn | Part of vinui's look. | 2026-10-28 |
| Dialog animations use our own `@keyframes`, not tw-animate-css | Radix / Reka Presence waits for animations, not transitions. | 2026-10-28 |
| `@custom-variant dark (&:is(.dark *))`, shadcn's exact string | The CLI dedupes it instead of adding a second one. | 2026-10-28 |
| `border` written as longhands | React Native drops the shorthand. **Verified identical on web:** a rule-by-rule compiled-CSS comparison shows `.btn` unchanged, and the browser specs assert computed `border-top-width` / `-style` / `-color` on `outline` (input colour) and on the default (transparent) in both frameworks. | 2026-10-28 |
| A `btn-label` utility for native button text | React Native text doesn't inherit colour. Unused on web, which is fine (shadcn's web Button doesn't wrap its text). | 2026-10-28 |
| `:active` pressed tint on `btn`, built from tokens, dark-mode aware | A deliberate design change on web too (shadcn's web Button has none). **One press-feedback mechanism:** future Motion must replace or build on it, not stack on it. | 2026-10-28 |
| Overlays: `*-panel` = the look; `*-content` = the look + web positioning (`dialog-content` composes `dialog-panel` via `@apply`) | Native has no `position: fixed` / `calc(100%…)`. Native centres the panel with overlay padding and a max width. Applies to Popover, Sheet, Select and DropdownMenu too. **Verified on web:** the compiled `.dialog-content` declarations are unchanged, and the dialog specs assert the panel's background, border, padding, radius and shadow. `display: grid` stays in `*-content` (React Native is flex-only). | 2026-10-28 |
| Web-only styling uses Uniwind's `web:` variant in class strings, not `Platform.select`; shared CSS may carry rules only web needs (e.g. `.btn:hover .btn-label`) when native ignores them, checked against the native harness baselines | Keeps web-only styling visible next to the shared classes ([0008](0008-native-web-support.md)). | 2026-10-28 |
| Native components import icons per icon (`lucide-react-native/icons/x`) | Metro doesn't tree-shake the root export: +203 KB gzipped on web, and native bundles grow too. | 2026-10-28 |
| New theme tokens `--popover` / `--popover-foreground` (shadcn's names and neutral values) | Select's list is a popover surface; Popover and DropdownMenu will reuse them. | 2026-11-13 |
| Select classes: `select-trigger` (+ `select-trigger-sm` sets `--select-trigger-h`), `select-panel` (the list's look) / `select-content` (+ web positioning and animation), `select-viewport`, `select-item`, `select-item-indicator`, `select-label`, `select-separator`, `select-scroll-button` | Same split as Dialog (`*-panel` = look, `*-content` = look + web positioning). The web rules read Radix, Reka and Bits UI size variables in one fallback chain, items highlight on `:focus` (Radix) or `[data-highlighted]` (Reka / Bits UI), and the popper offset keys on `data-side`, which only popper mode sets. | 2026-11-13 |
| `select.css` repeats the zoom keyframes from `dialog.css` | Each registry item carries its own CSS, so Select must work without Dialog. Identical `@keyframes` merge harmlessly. A shared motion file is for the motion step. | 2026-11-13 |

### Testing
| Native Jest: Uniwind, Reanimated and `FullWindowOverlay` are stubbed; the Worklets Jest resolver is used; Lucide is mapped to its CJS build; Testing Library 14's `render` / `fireEvent` are awaited | The specs check props, classes and accessibility, not pixels (those are covered by the engine harness and devices). | 2026-10-28 |
| Native specs query controls **by role**, not just by label | Testing Library's `press` bubbles to the nearest `onPress` (the overlay, which also closes), so a label-only query passed with a broken close button. Found by fault injection. | 2026-10-28 |
| Parity tests load native `buttonVariants` in Node with `react-native` / `@rn-primitives/slot` / `uniwind` stubs | Class logic only; rendering is covered by Jest and devices. | 2026-10-28 |

| Decision | Reason / trade-off | Date |
|---|---|---|
| `packages/core` is repo-only (`as const` value arrays, derived unions, prop metadata); never shipped | Copied components stay self-contained; parity is enforced by in-repo tests. | 2026-10-28 |
| Type tests check two-way equality (`toEqualTypeOf`); Vue unions are imported from `index.ts`, never `.vue` | A subset union must fail; keeps `vue-tsc` out of the type tests. | 2026-10-28 |
| Class matrix includes omitted props; **one shared snapshot** + plain `toEqual` across frameworks + explicit expectations per framework | `vitest -u` can't hide drift; explicit expectations catch "both wrong the same way". | 2026-10-28 |
| Fault injection proves the tests catch drift | One finding: `cn()` keeps exact duplicates, so only the conflict case catches a cn-for-clsx swap. | 2026-10-28 |
| Browser specs run against the docs and playgrounds in dev **and** production | Dev-only bugs (Fast Refresh in Vue SFCs, hydration mismatches) exist. | 2026-10-28 |
| Native engine harness (`spikes/native-engine/`): live `@vinui/tailwind` input, per-platform golden baselines, an explicit script (`pnpm spike:native-engine`), outside workspace builds | Upgrade checks are a diff against the baseline. The baselines from Uniwind 1.13.0 are identical on iOS and Android, and a rerun reproduces them exactly. | 2026-10-28 |
| Native behaviour specs: Jest + `@testing-library/react-native` | Device e2e is a later step. | 2026-10-28 |
| Native web specs: `native-web-dev` / `native-web-prod` targets on the playground's web build; `native-web-parity.spec.ts` compares computed styles (as sRGB pixels) with the React demo on the docs; `dialog.spec.ts` shares its scenarios, with native-specific structure / animation expectations | One look across React and native web; Radix underneath makes behaviour specs shareable. | 2026-10-28 |
| Docs component pages: one site-wide framework choice and package manager, stored in `localStorage` (guarded) and applied on `<html>` before paint, so CSS shows the matching panels without a flash. `docs-components.spec.ts` covers it, including blocked storage (production only) | A Vue user picks Vue once; pages work without storage. | 2026-10-29 |
| Docs API reference for multi-part components: one table per part that has vinui props (Dialog: `DialogContent`, `DialogFooter`), each under an `h4`; parts that only pass through (`Dialog`, `DialogTrigger`, …) get a link to the primitive's docs instead | Same rule as Button: only document what vinui defines or changes; shadcn does the same. | 2026-10-29 |
| Every command on the docs (install pages included) has the package-manager switcher, built by `apps/docs/src/lib/pm.ts` (`dlx`, `exec`, `add`, `create`, `run`) | One place translates npm → pnpm / yarn / bun, so commands stay consistent. | 2026-10-29 |
| Component pages show a live **"React Native (web)"** iframe above the device screenshots, loaded only when the React Native tab is shown ([0008](0008-native-web-support.md)) | Honest about what it is (react-native-web, not a device), costs nothing for React / Vue readers, and the screenshots stay the reference for devices. | 2026-10-29 |
| The preview export is cached by a hash of the playground's inputs (source, installed components, CSS, config, `pnpm-lock.yaml`) | `expo export` takes tens of seconds; docs builds only pay for it when native demos change. | 2026-10-29 |
| Svelte stale-docs guard reads the keys each component destructures from `$props()` with `svelte/compiler`'s `parse` | Svelte 5 props have no runtime list (Vue's compiled `props` has one). The helper has its own test. | 2026-11-13 |
| SvelteKit playground targets wait for `body[data-hydrated]` (set in `+layout.svelte`'s `onMount`) before acting | SvelteKit server-renders; in dev, clicks before hydration did nothing and every dialog spec failed. Vite's React and Vue playgrounds render on the client only. | 2026-11-13 |
| The Svelte fresh-app check runs the CLIs in a pseudo-terminal (`expect`) that answers only the prompts we allow and fails on any other | clack prompts need a TTY. They draw text with cursor escapes between characters, so the script matches on de-escaped text. | 2026-11-13 |
| Docs: a **Svelte** tab between Vue and React Native on every component page; Svelte installs show the item's URL (`svelteAdd()` in `apps/docs/src/lib/registry.ts`), `shadcn-svelte@latest`, and `--yes --overwrite` | shadcn-svelte has no namespace ([0009](0009-svelte-on-bits-ui.md)). The home page's side-by-side demo has a Svelte column, and the docs targets compare Svelte's buttons with React's. | 2026-11-13 |
| Svelte docs snippets import from `#lib/…` | SvelteKit 3 removed `$lib`: importing it throws `module_removed_lib`. `sv create` sets up `#lib` subpath imports. The install page says SvelteKit 2 projects use `$lib`. | 2026-11-13 |
| **The Svelte install page is verified by running its own snippets** (npm tab, parsed from the built page) in an empty folder: `sv create` → `shadcn-svelte init` (its one "Continue?" answered) → `add` with no prompts → the page snippet → `check` and `build` clean → a browser smoke test (styled buttons, Dialog open / animation / close, dark palette, no console errors). Also checked: an existing shadcn-svelte button is replaced without a prompt; vinui's token values replace the project's (`--primary`) while tokens vinui doesn't define stay (`--card`); re-running `add` appends the nested `@variant` / `@media` rules again (4 → 8), as the page warns | Same standard as the other install pages. npx's own "Ok to proceed?" (first run of an uncached package) is answered by the script; it isn't a vinui or shadcn-svelte prompt. | 2026-11-13 |
| Select specs find the open trigger by `data-slot`, not by role; positions are measured after the content's animations finish; keyboard steps assert after each key | Radix aria-hides everything outside the open list, trigger included. Mid zoom-in, the scaled list starts ~4px higher than its final spot. Two quick ArrowDowns right after opening lost one press. | 2026-11-13 |

### Native platform setup
| The native theme file's target is `vinui-theme.css` (no `~/`), so it lands next to `global.css` in src-layout apps too | `~/` always means the project root; in Expo Router's template (`src/global.css`) the `@import "./vinui-theme.css"` didn't resolve ([0006](0006-native-theme-as-file.md)). | 2026-10-29 |
| Install docs pin Uniwind and Tailwind with `-E` (`npm install -E uniwind@1.13.0 tailwindcss@4.3.3`) | The tested versions, without a `^` range that a later install would float. | 2026-10-29 |
| Expo Router snippets import `ThemeProvider` / `DarkTheme` / `DefaultTheme` from `expo-router` | Expo SDK 58's template re-exports them there and doesn't list `@react-navigation/native` as a direct dependency. | 2026-10-29 |
| **The React Native install page is verified by running its own snippets** (npm tab, read from the rendered page) in a fresh blank-TypeScript app, and its Expo Router section in Expo's default template: no prompts, typecheck clean after the first bundle, `expo export` for iOS / Android / web, web smoke test in light and dark | Same standard as the web install pages. pnpm / yarn / bun commands are translations of the npm ones, not separately run. | 2026-10-29 |

| Decision | Reason / trade-off | Date |
|---|---|---|
| Manual setup steps: `metro.config.js` (`withUniwindConfig`), the `global.css` imports, `<PortalHost />`, `"userInterfaceStyle": "automatic"` | The CLI can't safely patch the app root or the metro config. The Expo template's `"light"` blocks system dark mode. | 2026-10-28 |
| Native TypeScript 6.0.3 | The Expo 58 template's version. | 2026-10-28 |
| Android checks and docs screenshots use a stable API 36 emulator (Expo 58 / RN 0.88 `targetSdk`); a newer beta image is used occasionally for forward-compatibility | Consistent screenshots. A `minSdk` (24) emulator is a later step. | 2026-10-28 |
| Third-party components (e.g. `react-native-safe-area-context`'s `SafeAreaView`) don't take `className`; put a core `View` (or `ThemeRoot`) behind them, or wrap them with `withUniwind` | Uniwind maps `className` only on React Native core components ([0007](0007-native-base-layer.md)). | 2026-10-28 |
| `expo-status-bar` and `expo-system-ui` are setup prerequisites (`npx expo install`), used by ThemeRoot | Expo-managed, like Reanimated. | 2026-10-28 |
| react-native-web prerequisites: `npx expo install react-native-web react-dom @expo/metro-runtime` | Expo-managed, like Reanimated ([0008](0008-native-web-support.md)). | 2026-10-28 |
| **New Expo app setup order** (verified in a fresh `create-expo-app` app, iOS / Android / web, no prompts): `npx expo install` the prerequisites → `npm install uniwind@1.13.0 tailwindcss@4.3.3` → `global.css`, `metro.config.js`, `userInterfaceStyle`, the `@/*` alias, `declare module "*.css"` → `shadcn init <native init>` → `shadcn add` → the first Metro start generates `uniwind-types.d.ts` (until then `className` doesn't typecheck) | `shadcn init` validates Tailwind **before** reading vinui's item, so the init's own `uniwind` / `tailwindcss` pins can't bootstrap a new app. They stay, to pin versions on re-init. | 2026-10-29 |
| **Existing projects (e.g. RNR) don't run vinui's `init`**: add the `@vinui` line to `components.json`, then `shadcn add @vinui/theme`, then `shadcn add @vinui/<items> --overwrite` | `init` stops at "components.json already exists, overwrite?", and overwriting would replace the project's aliases. Without `--overwrite`, `add` asks per clashing file (`text`, `icon`, `button`, `dialog`, `native-only-animated-view`). With it, RNR's files are replaced by vinui's, byte-identical to a fresh install. | 2026-10-29 |
| Failure messages (verified): Uniwind missing → the bundle fails with `Unable to resolve "uniwind" from "lib/vinui-engine.ts"`. Installed but not configured → exactly one dev warning `[vinui] Uniwind isn't configured…`, components unstyled, and the string is absent from production bundles | The troubleshooting docs quote these exactly. | 2026-10-29 |
| Native-only items (`text`, `icon`, `engine`, `theme-root`) in a web project: the CLI says "The item at …/r/react/text.json was not found" | Accurate but unexplained. The docs mark platform-only items with a badge and a note; no empty web stand-in items. | 2026-10-29 |
| **Docs native screenshots** come from the playground's **release builds** (no Expo Go overlay) on iPhone 17 Pro and `vinui_api36`, with a fixed status bar (`xcrun simctl status_bar … override --time 9:41`, Android System UI demo mode at 9:41). Files are `apps/docs/src/assets/native/{platform}-{theme}-{component}-{state}.png`. The playground's `?dialog=open` link opens the Dialog where taps aren't scriptable (iOS) | Consistent, reproducible previews; the link also serves the docs' web preview routes. | 2026-10-29 |

---

## Cross-framework differences (intentional)

| Area | React (shadcn/ui) | Vue (shadcn-vue) | Svelte (shadcn-svelte) | React Native (RNR) |
|---|---|---|---|---|
| Primitives | Radix | Reka UI | Bits UI | rn-primitives |
| Composition | `asChild` | `as-child` (+ `as`) | `child` snippet (`{#snippet child({ props })}`) | `asChild` |
| Class prop | `className` | `class` | `class` | `className` |
| Button `data-variant` / `data-size` | always set | set to `"default"` when omitted (**vinui addition**; shadcn-vue omits them) | always set (**vinui addition**; shadcn-svelte omits them) | n/a (no data attributes) |
| `buttonVariants` in Button | `cn(buttonVariants({ variant, size, className }))` | `cn(buttonVariants({ variant, size }), props.class)` | `cn(buttonVariants({ variant, size }), className)`; clsx, not shadcn-svelte's `tailwind-variants` | `cn(buttonVariants({ variant, size, className }), disabled && "opacity-50")`; label via `buttonTextVariants` |
| Button text | inherits colour | inherits colour | inherits colour | `Text` + `btn-label`; strings auto-wrapped (**vinui addition**) |
| Events | `onClick` | `@click` | `onclick` | `onPress` |
| Dialog positioning | `dialog-content` | `dialog-content` | `dialog-content` | `dialog-panel w-full max-w-lg` in a padded, centred overlay |
| `DialogScrollContent` | — | in shadcn-vue, skipped | — | — |
| Hover styles | yes | yes | yes | devices: none (`:active` only); **react-native-web: yes**, from the shared CSS (changed 2026-10-28, [0008](0008-native-web-support.md)) |
| Dialog close icon | inline SVG | inline SVG | inline SVG (shadcn-svelte: `@lucide/svelte`) | lucide `X` via `Icon` (per-icon import) |
| Animations | CSS `@keyframes` | CSS `@keyframes` | CSS `@keyframes` (Bits UI waits for the exit animation) | Reanimated (devices and react-native-web) |
| Web support | — | — | — | react-native-web, for Expo universal apps ([0008](0008-native-web-support.md)) |
| Theme via `init` | `cssVars` + `css` | `cssVars` + `css`; shadcn-vue also adds an Inter `@import` and `@lucide/vue`, and needs `tw-animate-css` | no vinui `init`: stock `shadcn-svelte init`, then the `theme` item (`cssVars` + `css`) comes with the first component | `vinui-theme.css` file + `@import` |
| Dark mode | `.dark` class | `.dark` class | `.dark` class | Uniwind themes (`Uniwind.setTheme`, follows the system) |
| Missing-setup detection | — | — | — | `@vinui/engine` (**vinui addition**) |
| Base layer (page background) | CSS `body` rule | CSS `body` rule | CSS `body` rule | `<ThemeRoot>` (**vinui addition**) |
| Button `asChild` | yes | `as-child` | no; `href` renders an `<a>` (as in shadcn-svelte) | yes (**vinui addition** vs RNR) |
| Text component | — | — | — | `Text` + `TextClassContext` (subset of RNR's) |
| Dialog title colour | inherits | inherits | inherits | explicit `text-foreground` |

## Tooling quirks we work around

- **shadcn-vue:**
  - It mis-resolves file paths when all files share only a `src/` root, so registry sources have no `src/` folder.
  - Its `add` inserts `@import "tw-animate-css"` whenever an item brings `cssVars`, so the Vue `init` installs `tw-animate-css`.
- **Both CLIs:**
  - Re-adding an item duplicates nested `@media` / `@variant` blocks inside `@utility`. Delete the component's `@utility` blocks before updating.
  - The `css` writer flattens nested rules ([0006](0006-native-theme-as-file.md)).
- **shadcn CLI (native):** `add` drops a file's leading comment block, so the `Engine layer: Uniwind` header survives in the repo but not in users' copies.
- **Expo CLI:** `CI=1 expo start` turns off Metro's file watching ("reloads are disabled"), so devices keep the old bundle.
- **Expo SDK 58's default (Router) template** has one TypeScript error of its own (`src/components/app-tabs.web.tsx`), unrelated to vinui.
- **Metro** doesn't tree-shake `lucide-react-native`'s root export; vinui uses per-icon imports.
- **`uniwind/vite`** only covers styling (it also switches Vite's CSS transformer to lightningcss). Running React Native inside Vite / Astro additionally needs `.web.*` resolution, a JSX loader for `@rn-primitives` (it ships untranspiled JSX), CommonJS handling for Reanimated, and SSR that never loads `react-native`. The docs embed the Expo web export instead.
- **Registry build:** PostCSS keeps `!important` as a separate flag; the converter re-attaches it.
- **Astro (docs):**
  - plugin-vue injects React Fast Refresh calls into Vue SFC scripts in dev, so the docs stub `$RefreshSig$` / `$RefreshReg$` for SSR.
  - `slot` goes on `<Fragment>`, not on islands (avoids a hydration mismatch).
  - HTML compression drops line-break whitespace before inline elements, so keep text and inline tags on one line.
  - `astro dev` / `astro preview` move to the background when run by AI agents; test servers pass `--ignore-lock`.
  - The dev toolbar reads `localStorage` without a guard and throws when storage is blocked, so the blocked-storage spec runs on production builds only.
  - `astro check` type-checks everything the tsconfig includes, `public/` too; the docs exclude `public/native-preview` (the Expo export ran it out of memory).
  - A module that exports a function named `then` hangs SSR: the module namespace becomes a thenable, so awaiting the dynamic import never resolves. `lib/pm.ts` uses `followedBy`.
- **TypeScript 7** has no JS API, so `vue-tsc`, `astro check`, the Vue SFC compiler and the tests package use TS 6.0.3.
- **pnpm 12:**
  - It blocks very new releases (minimum release age).
  - Build scripts need an explicit allow or deny (`@parcel/watcher` is denied).
  - The registry is built once before the browser specs, because concurrent builds race on the output folder.

- **shadcn-svelte 1.8.1:**
  - `registry build` reads item `files` paths from the process cwd, ignoring `--cwd`, and requires `files` on every item; the build passes absolute paths and `files: []` for the theme (they don't appear in the output).
  - Sources import `$lib/utils` and `$lib/registry/ui/…`; `registry build` turns them into `$UTILS$` / `$UI$` placeholders, and `add` writes the project's own aliases (SvelteKit 3's template uses `#lib`).
  - `init` has no `--yes`: even with every alias flag it asks "Continue?" once before updating the stylesheet. That's stock shadcn-svelte, before any vinui item.
- **SvelteKit 3** templates use subpath imports (`#lib`, `#lib/*` in `package.json`) instead of `$lib`; its config lives in `vite.config.ts`. `bits-ui`'s dependency `runed` still declares a `@sveltejs/kit ^2` peer (a warning only).

- **Astro + Svelte (docs):**
  - `@astrojs/svelte` is pinned to **9.1.2**: 9.1.3+ require `vite ^8.3.6`. That adds a second Vite to the repo (which pins 8.3.5), and with it a newer rolldown, whose wasm binding brings `@emnapi/runtime@2.0.0-beta`. pnpm then reuses that beta as `@astrojs/check`'s peer, and `astro check` crashes (`this.bridge.deleteEnv is not a function`). When adding packages, restore the committed lockfile first if re-resolution moves unrelated versions.
  - Dev SSR needs `ssr.noExternal: ["bits-ui", "runed", "svelte-toolbelt"]`: `@vinui/svelte` is a workspace link, so the integration doesn't detect that those packages ship `.svelte` / `.svelte.js` files ("Unknown file extension .svelte", then `rune_outside_svelte`). Production builds were fine without it.

## Open / deferred

- Registry deploy (host, domain, `VINUI_REGISTRY_URL`).
- vinui's own visual identity (palette, radius, typography, motion).
- React Aria coexistence in the apps: check overlays (focus trap, outside click) when a vinui and a React Aria overlay are open together ([0010](0010-mvp-scope-web-first.md)).
- Combobox API divergence (shadcn/ui Popover + Command vs shadcn-vue Reka Combobox): resolve before building it.
- Native: global icon interop, device e2e, a `minSdk` emulator.
- CI: none yet. When it exists, run the native engine harness on PRs that change the Uniwind version (needs a macOS runner).
- `DialogScrollContent`.
- Android release build (2026-10-28): once, right after the first `expo run:android --variant release` launch, the app didn't follow the system switching to dark (night mode on, app stayed light). It wasn't reproducible: cold start, fresh install, after opening a Dialog, and after tapping "system" all followed correctly. Watch for it in the hands-on pass.
- Move `@astrojs/svelte` past 9.1.2 when the repo moves to Vite ≥ 8.3.6.
- Bump Uniwind from 1.13.0 once newer releases pass the release-age policy, using the upgrade checklist in [0005](0005-native-styling-engine.md).
