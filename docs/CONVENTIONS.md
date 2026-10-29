# vinui conventions

Short, actionable rules. The reasons are in [decisions/](decisions/README.md); a rule links to its ADR where one exists.
**Any change to a convention updates this file in the same commit.**

## Scope and references

- **Component set:** Headless UI v2's list. **API:** the shadcn references ([0001](decisions/0001-shadcn-style-api.md)).

  | Platform | Reference | Primitives | Styling |
  |---|---|---|---|
  | React | shadcn/ui | Radix (`radix-ui`) | Tailwind 4 |
  | Vue | shadcn-vue | Reka UI | Tailwind 4 |
  | React Native | React Native Reusables (Uniwind flavour) | rn-primitives | Uniwind ([0005](decisions/0005-native-styling-engine.md)) |

- Before building a component, read the current source of its reference on every platform. Third-party-backed parts use whatever the matching reference uses.

## API

- **Match the references:** part names, prop names and values, `asChild` / `as-child`, `data-state`, and `data-slot` on every part.
- **The shared contract** across frameworks is the prop *values* (variant / size unions from `packages/core`) and the produced *classes*. Where the references differ, each framework follows its own reference and the difference goes in the cross-framework table in [decisions/README.md](decisions/README.md).
- **Framework idioms only where unavoidable:**
  - Vue: `v-model`, slots, emits, `class`.
  - Native: `onPress` only, with no `onClick` alias.
- **Union rule:** where the native reference and the web style differ, accept both. For example, native Button takes `<Button>Save</Button>` and `<Button><Text>Save</Text></Button>`.
- **`buttonVariants` (and future variant helpers) mirror cva exactly:**
  - `class` **or** `className`, any `ClassValue`,
  - appended with `clsx`, with no tailwind-merge inside.
  - `cn()` merges at the component level ([0004](decisions/0004-cva-exact-button-variants.md)).
- **Pass-through props** (`open`, `onOpenChange`, `modal`, …) aren't re-documented; link to the primitive's docs.

### vinui additions
Anything the references don't have. Each one is marked with a "vinui addition" badge in the docs.

- Vue Button sets `data-variant` / `data-size` to `"default"` when they're omitted.
- Native Button auto-wraps string / number children in `Text`.
- Native `@vinui/engine`: missing-Uniwind detection.
- Native `@vinui/theme-root`: `<ThemeRoot>` (the base layer) and `useNavigationTheme()`.
- The `:active` pressed tint on web Button.

## Styling

- **`@vinui/tailwind` is the single styling source.** Components apply its `@utility` classes; they don't inline long utility strings.
- **Token names match shadcn's** (`--primary`, `--radius`, …). Only the values are vinui's.
- **Variant and size classes only set component custom properties** (`--btn-*`); the base class reads them.
- **The default variant / size needs no class** (a bare `btn`). Every other value is `<base>-<value>`.
- **Use longhands** (`border-width` / `-style` / `-color`, etc.), not shorthands React Native drops.
- **State hook:** `data-state` (`[data-state="open"]`). No `data-open` / `data-closed`.
- **Overlays:** `*-panel` = the look; `*-content` = the look (`@apply <x>-panel`) + web positioning. Native uses `*-panel` inside a centred overlay with padding and a max width.
- **Animations:** our own `@keyframes`, keyed on `data-state` (Presence waits for animations, not transitions). Honour `prefers-reduced-motion`. Native (devices and web) uses Reanimated with `ReduceMotion.System`.
- **One press-feedback mechanism:** the `:active` style. Motion work must replace or build on it, never stack another one on top.
- **Dark mode on web:** `@custom-variant dark (&:is(.dark *))`, shadcn's exact string.
- **Native has no CSS inheritance:**
  - Text styles go on the `Text` itself: Button passes `btn-label` + the variant / size classes through `TextClassContext`, and Dialog titles set `text-foreground`.
  - A parent's text classes **replace** a child's defaults; don't stack them. Custom utilities lose to single-property utilities in Tailwind's order, and tailwind-merge can't resolve them.
  - **Only React Native core components take `className`.** Third-party components (`react-native-safe-area-context`'s `SafeAreaView`, …) need a core `View` behind them or `withUniwind`.
  - **The base layer is `<ThemeRoot>`**; colours needed in JavaScript come from the tokens via the engine layer, never a JS copy ([0007](decisions/0007-native-base-layer.md)).
  - Pseudo-classes React Native lacks (`:disabled`, `:hover`) get an explicit prop-driven class or are skipped on devices. On react-native-web the shared CSS applies them.
- **Native on web (react-native-web, [0008](decisions/0008-native-web-support.md)):**
  - Web-only styling goes in the class string with Uniwind's `web:` variant (`web:mx-auto`), never `Platform.select`.
  - Shared CSS may carry a rule only web needs (e.g. `.btn:hover .btn-label`) when native ignores it. Check the native harness baselines and the web class snapshot.
  - Positioning: native-on-web is for Expo universal apps; web-only apps use vinui React.

## Registry and dependencies

- **Item names are the same on every platform**, under `/r/<platform>/{name}.json`. Platform-only items are marked as such in the docs (native: `text`, `icon`, `engine`, `theme-root`).
- **Components import `cn` from `"cn"`** and never ship a `lib/utils.ts` ([0004](decisions/0004-cva-exact-button-variants.md)).
- **Items declare every npm package they import** (e.g. `clsx`). Never rely on something arriving indirectly.
- **Native icons are imported per icon** (`lucide-react-native/icons/x`): Metro doesn't tree-shake the root export.
- **Expo-managed native modules** (Reanimated, Worklets, Screens, SVG, Status Bar, System UI; for web: react-native-web, react-dom, `@expo/metro-runtime`) are **setup prerequisites**, installed with `npx expo install`. Native items don't list them: the shadcn CLI would install their latest versions, not SDK-matched ones.
- **Setup prerequisites (Uniwind, Tailwind) are pinned in `init` and the install docs, never on component items.**
- **Pin exact versions** of engines and primitives in the repo.
- **pnpm's minimum release age is respected.** Pin the newest version past the window; don't add exclusions. Add a `minimumReleaseAgeExclude` only when a specific fix is needed, with a comment naming that fix.
- **Engine-specific code lives in a marked engine layer** (header comment `Engine layer: Uniwind`):
  - native `icon.tsx` and `lib/vinui-engine.ts`,
  - `packages/registry/src/engines/uniwind.ts`,
  - one docs setup partial.
- **Engine upgrades are one commit:** harness baselines, `init` pin, docs' tested version, repo version.

## Testing (required for every component)

- **Type parity:** each platform's unions equal `packages/core`'s in **both directions** (`expectTypeOf().toEqualTypeOf()`). Vue unions come from `index.ts`, never from `.vue` files.
- **Class matrix:**
  - Every variant × size, **including omitted props**.
  - **One shared snapshot** (React's), with the other platforms compared by plain `toEqual`.
  - Plus explicit expectations per platform (defaults, one variant, one size), and the extra-class cases.
- **Stale-docs guard:** every prop in core's metadata exists on each listed platform, under that platform's name.
- **Behaviour specs on every platform:**
  - Playwright for web (docs + playgrounds, dev and production), including native on react-native-web (`native-web-*` targets).
  - Jest + Testing Library for native.
  - The same scenario list on every platform.
- **Behaviour specs query controls by role** (`getByRole("button", { name })`), not just by label or text. Simulated presses can bubble to a parent handler and hide a broken control.
- **Fault injection** when adding a new kind of test: break the code on purpose once and confirm the test fails.
- **Fresh-app checks** after registry changes: install with **no prompts** on every supported setup (vinui `init` and stock `init`, per platform).

## Docs

- **Component pages:** preview, install (same `@vinui/<name>`, per-tab CLI, package-manager switcher), usage per framework, API reference from core metadata, platform notes.
- **Every command is copy-paste runnable**, with no placeholders.
- **Install pages are verified** by running their own extracted snippets in a fresh app.

## Commits

- **Conventional Commits.**
- **Scopes:**
  - component names (`button`, `dialog`) for a component's API, style or behaviour,
  - infrastructure scopes (`registry`, `cli`, `docs`, `tokens`, `build`, `ci`),
  - no scope for repo-wide changes,
  - **no framework scopes** (`react`, `vue`): name the framework in the subject or body instead.
- **No `!` / `BREAKING CHANGE` before the first release.**
