# 0009: Svelte on Bits UI, referencing shadcn-svelte

- **Status:** Accepted (extends [0003](0003-radix-family.md))
- **Date:** 2026-11-13

## Context
vinui is going into apps that use Svelte / SvelteKit. Each platform needs a shadcn port to reference, so vinui keeps one shadcn API. For Svelte that port is **shadcn-svelte**, built on **Bits UI**.

Bits UI follows the same anatomy as the rest of the Radix family: the same part names (`Dialog.Root`, `Dialog.Trigger`, `Dialog.Content`, …) and `data-state` for state. Svelte 5 differs in how components are put together:
- Composition uses a `child` snippet, not `asChild`.
- Two-way binding uses `bind:open` / `bind:value`.
- Events are plain props (`onclick`).

**What the shadcn-svelte CLI supports** (shadcn-svelte 1.8.1, from its live docs and its published `registry-item.json` schema, 2026-11-13). The docs call the registry feature *experimental*.
- `shadcn-svelte add <url>` installs an item from any registry.
- Item types include `registry:base`, which has a `config` field. **There's no `extends` field.**
- `registryDependencies` take shadcn-svelte item names, **or URLs for other registries**. Neither the docs nor the schema mention a `registries` map in `components.json`, or namespaced names (`@vinui/button`).
- `init` takes `--preset <preset>`. It isn't documented whether a preset can be a URL.

**Verified while building it** (same day, in a fresh SvelteKit 3 app):
- The CLI has no `registries` map. But a `./name.json` registry dependency resolves against the URL of the item that lists it, and a bare name resolves to shadcn-svelte's own item.
- `init --preset` takes a style name (`vega`, …) or a preset code from shadcn-svelte.com/create, not a URL. `init` has no `--yes`.

## Decision
- **Svelte is the fourth platform:** reference shadcn-svelte, primitives Bits UI, styling Tailwind 4 with the shared `@vinui/tailwind` classes.
- shadcn-svelte's idioms only where unavoidable: the `child` snippet, `bind:`, `class`, and plain event props.
- **Same item names** at `/r/svelte/{name}.json`.
- **The registry build rewrites `@vinui/<name>` dependencies to relative `./<name>.json` for the Svelte target.** React and Vue keep `@vinui/...` (native did too, until [0011](0011-drop-react-native-for-now.md)).
- **No vinui `init` item for Svelte.** Setup is stock `shadcn-svelte init --preset <style>`, then `shadcn-svelte add <url>/r/svelte/<item>.json --yes --overwrite`. The `theme` item comes with the first component.
- Svelte items rely on the `utils` that `init` installs and import `cn` from it, as shadcn-svelte's own items do.

## Consequences
- The parity tests, class matrix, stale-docs guard and Playwright specs gain a Svelte target. Svelte unions live in `index.ts`, like Vue's, so the tests don't compile `.svelte` files.
- Because the dependencies are relative, the Svelte items don't depend on `VINUI_REGISTRY_URL`. Users still type the full item URL, since there's no namespace.
- shadcn-svelte's stylesheet update is a vinui-free prompt during `init`. vinui's `add` stays prompt-free only with `--overwrite`, which also replaces existing component files of the same name.
- The docs (Astro) add the `@astrojs/svelte` integration for live Svelte previews, and a Svelte tab on every component page.
- Bits UI's release pace and the experimental registry are known risks. The install docs use `shadcn-svelte@latest`, like the other CLIs, and name the tested version (1.8.1).
