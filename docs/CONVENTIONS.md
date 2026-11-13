# vinui conventions

Short, actionable rules. The reasons are in [decisions/](decisions/README.md); a rule links to its ADR where one exists.
**Any change to a convention updates this file in the same commit.**

## Scope and references

- **Component set:** Headless UI v2's list. **API:** the shadcn references ([0001](decisions/0001-shadcn-style-api.md)).

  | Platform | Reference | Primitives | Styling |
  |---|---|---|---|
  | React | shadcn/ui | Radix (`radix-ui`) | Tailwind 4 |
  | Vue | shadcn-vue | Reka UI | Tailwind 4 |
  | Svelte | shadcn-svelte | Bits UI | Tailwind 4 ([0009](decisions/0009-svelte-on-bits-ui.md)) |

- **Scope:** React, Vue and Svelte. The MVP (Button, Dialog, Select) was declared on 2026-11-13 ([0010](decisions/0010-mvp-scope-web-first.md)). **React Native is out for now** and will be reintroduced later ([0011](decisions/0011-drop-react-native-for-now.md)); don't add native code until then.
- **Stay on the Radix family**; React Aria is not a vinui primitive. Apps may use both side by side ([0010](decisions/0010-mvp-scope-web-first.md)).
- Before building a component, read the current source of its reference on every platform. Third-party-backed parts use whatever the matching reference uses.

## API

- **Match the references:** part names, prop names and values, `asChild` / `as-child`, `data-state`, and `data-slot` on every part.
- **The shared contract** across frameworks is the prop *values* (variant / size unions from `packages/core`) and the produced *classes*. Where the references differ, each framework follows its own reference and the difference goes in the cross-framework table in [decisions/README.md](decisions/README.md).
- **Framework idioms only where unavoidable:**
  - Vue: `v-model`, slots, emits, `class`.
  - Svelte: the `child` snippet (in place of `asChild`), `bind:`, `class`, plain event props (`onclick`).
- **`buttonVariants` (and future variant helpers) mirror cva exactly:**
  - `class` **or** `className`, any `ClassValue`,
  - appended with `clsx`, with no tailwind-merge inside.
  - `cn()` merges at the component level ([0004](decisions/0004-cva-exact-button-variants.md)).
- **Pass-through props** (`open`, `onOpenChange`, `modal`, …) aren't re-documented; link to the primitive's docs.

### vinui additions
Anything the references don't have. Each one is marked with a "vinui addition" badge in the docs.

- Vue Button sets `data-variant` / `data-size` to `"default"` when they're omitted.
- The `:active` pressed tint on web Button.

## Styling

- **`@vinui/tailwind` is the single styling source.** Components apply its `@utility` classes; they don't inline long utility strings.
- **Token names match shadcn's** (`--primary`, `--radius`, …). Only the values are vinui's.
- **Variant and size classes only set component custom properties** (`--btn-*`); the base class reads them.
- **The default variant / size needs no class** (a bare `btn`). Every other value is `<base>-<value>`.
- **Use longhands** (`border-width` / `-style` / `-color`, etc.), so variants can override one part. (They're also what React Native needs when it returns.)
- **State hook:** `data-state` (`[data-state="open"]`). No `data-open` / `data-closed`.
- **Overlays:** `*-panel` = the look; `*-content` = the look (`@apply <x>-panel`) + web positioning. Keep the split: React Native will build on `*-panel` again ([0011](decisions/0011-drop-react-native-for-now.md)).
- **Animations:** our own `@keyframes`, keyed on `data-state` (Presence waits for animations, not transitions). Honour `prefers-reduced-motion`.
- **One press-feedback mechanism:** the `:active` style. Motion work must replace or build on it, never stack another one on top.
- **Dark mode on web:** `@custom-variant dark (&:is(.dark *))`, shadcn's exact string.

## Registry and dependencies

- **Item names are the same on every platform**, under `/r/<platform>/{name}.json`.
- **Components import `cn` from `"cn"`** and never ship a `lib/utils.ts` ([0004](decisions/0004-cva-exact-button-variants.md)).
  - Svelte follows shadcn-svelte instead: `cn` (and `WithElementRef`) from `$lib/utils.js`, the `utils` that `shadcn-svelte init` installs. Items don't list `utils` ([0009](decisions/0009-svelte-on-bits-ui.md)).
- **Svelte items** ([0009](decisions/0009-svelte-on-bits-ui.md)):
  - Sources live in `packages/svelte/src/lib/registry/ui/<name>/` and import `$lib/utils.js` / `$lib/registry/ui/…`, so `registry build` can turn them into alias placeholders.
  - Dependencies on other vinui items are written `@vinui/<name>` in `registry.json`; the build makes them `./<name>.json`. Never a bare name: it would resolve to shadcn-svelte's own item.
  - Packages go in `devDependencies`, as in shadcn-svelte.
  - Install commands are `shadcn-svelte add <url>/r/svelte/<name>.json --yes --overwrite` (no prompts without `--overwrite`).
- **Items declare every npm package they import** (e.g. `clsx`). Never rely on something arriving indirectly.
- **Setup prerequisites (Tailwind, `tw-animate-css` on Vue) belong in `init` and the install docs, never on component items.**
- **Pin exact versions** of primitives in the repo.
- **pnpm's minimum release age is respected.** Pin the newest version past the window; don't add exclusions. Add a `minimumReleaseAgeExclude` only when a specific fix is needed, with a comment naming that fix.

## Testing (required for every component)

- **Type parity:** each platform's unions equal `packages/core`'s in **both directions** (`expectTypeOf().toEqualTypeOf()`). Vue unions come from `index.ts`, never from `.vue` files.
- **Class matrix:**
  - Every variant × size, **including omitted props**.
  - **One shared snapshot** (React's), with the other platforms compared by plain `toEqual`.
  - Plus explicit expectations per platform (defaults, one variant, one size), and the extra-class cases.
- **Stale-docs guard:** every prop in core's metadata exists on each listed platform, under that platform's name.
- **Behaviour specs on every platform:**
  - Playwright (docs + playgrounds, dev and production).
  - The same scenario list on every platform.
- **Behaviour specs query controls by role** (`getByRole("button", { name })`), not just by label or text. Simulated presses can bubble to a parent handler and hide a broken control.
- **Fault injection** when adding a new kind of test: break the code on purpose once and confirm the test fails.
- **Fresh-app checks** after registry changes: install with **no prompts** on every supported setup (vinui `init` and stock `init`, per platform).

## Docs

- **Component pages:** preview, install (same `@vinui/<name>`, per-tab CLI, package-manager switcher), usage per framework, API reference from core metadata, platform notes.
  - Tabs: React, Vue, Svelte. Svelte installs use `svelteAdd()` (`apps/docs/src/lib/registry.ts`) for the item URL and flags, and Svelte snippets import from `#lib/…` (SvelteKit 3).
  - Demos for the docs live in `apps/docs/src/components/` (`React*.tsx`, `Vue*.vue`, `Svelte*.svelte`) and match the playgrounds' scenarios.
- **Every command is copy-paste runnable**, with no placeholders, and goes through the package-manager switcher (`<PmCommand>` / `<InstallCommand>`, built by `apps/docs/src/lib/pm.ts`); never a bare `npm …` code block.
- **Multi-part components** get one API table per part that has vinui props.
- **Install pages are verified** by running their own extracted snippets in a fresh app.

## Commits

- **Conventional Commits.**
- **Scopes:**
  - component names (`button`, `dialog`) for a component's API, style or behaviour,
  - infrastructure scopes (`registry`, `cli`, `docs`, `tokens`, `build`, `ci`),
  - no scope for repo-wide changes,
  - **no framework scopes** (`react`, `vue`, `svelte`): name the framework in the subject or body instead.
- **No `!` / `BREAKING CHANGE` before the first release.**
