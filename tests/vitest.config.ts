import { fileURLToPath } from "node:url"

import { svelte } from "@sveltejs/vite-plugin-svelte"
import vue from "@vitejs/plugin-vue"
import type { Plugin } from "vite"
import { defineConfig } from "vitest/config"

const packageRoots = [
  fileURLToPath(new URL("../packages/react/", import.meta.url)),
  fileURLToPath(new URL("../packages/vue/", import.meta.url)),
  fileURLToPath(new URL("../packages/svelte/", import.meta.url)),
]

const svelteLib = fileURLToPath(new URL("../packages/svelte/src/lib/", import.meta.url))

/**
 * Registry sources import `@/…` (React / Vue) or `$lib/…` (Svelte) the way
 * they will in a user's app; resolve per package.
 */
function registryAlias(): Plugin {
  return {
    name: "vinui:registry-alias",
    enforce: "pre",
    async resolveId(source, importer, options) {
      if (!importer) return null
      if (source.startsWith("$lib/")) {
        return this.resolve(svelteLib + source.slice(5), importer, { ...options, skipSelf: true })
      }
      if (!source.startsWith("@/")) return null
      const root = packageRoots.find((dir) => importer.startsWith(dir))
      if (!root) return null
      return this.resolve(root + source.slice(2), importer, { ...options, skipSelf: true })
    },
  }
}

export default defineConfig({
  plugins: [registryAlias(), vue(), svelte()],
  resolve: {
    dedupe: ["react", "react-dom", "vue", "svelte"],
  },
  test: {
    include: ["parity/**/*.test.{ts,tsx}"],
    // Bits UI ships .svelte files; bundle it (and its Svelte deps) instead of importing it from Node.
    server: { deps: { inline: ["bits-ui", "runed", "svelte-toolbelt"] } },
    typecheck: {
      include: ["parity/**/*.test-d.ts"],
      tsconfig: "./tsconfig.json",
    },
  },
})
