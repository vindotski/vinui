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

## Decision
- **Svelte is the fourth platform:** reference shadcn-svelte, primitives Bits UI, styling Tailwind 4 with the shared `@vinui/tailwind` classes.
- shadcn-svelte's idioms only where unavoidable: the `child` snippet, `bind:`, `class`, and plain event props.
- **Same item names** at `/r/svelte/{name}.json`.
- **The registry build rewrites registry dependencies to absolute URLs for the Svelte target**, unless step 2 shows that shadcn-svelte resolves namespaced names. React, Vue and native keep `@vinui/...`.
- The Svelte `init` uses `registry:base` if `init --preset <url>` works. If it doesn't, the install docs fall back to stock `shadcn-svelte init`, followed by `add <url>/r/svelte/init.json`.

## Consequences
- The parity tests, class matrix, stale-docs guard and Playwright specs gain a Svelte target. Svelte unions live in `index.ts`, like Vue's, so the tests don't compile `.svelte` files.
- The Svelte target ties into the paused registry-deploy decision. Absolute dependency URLs depend on `VINUI_REGISTRY_URL`.
- The docs (Astro) add the `@astrojs/svelte` integration for live Svelte previews.
- Bits UI's release pace and the experimental registry are known risks. The CLI version used is pinned in the install docs.
