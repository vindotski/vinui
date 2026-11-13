import { REGISTRY_URL } from "@vinui/registry/config"

/**
 * shadcn-svelte has no `@vinui` namespace (ADR 0009), so Svelte commands use each
 * item's URL, with `--yes --overwrite`: without `--overwrite` the CLI asks before
 * updating the stylesheet.
 */
export const svelteAdd = (...items: string[]) =>
  `add ${items.map((item) => `${REGISTRY_URL}/svelte/${item}.json`).join(" ")} --yes --overwrite`
