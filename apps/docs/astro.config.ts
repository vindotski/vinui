import { fileURLToPath } from "node:url"

import react from "@astrojs/react"
import svelte from "@astrojs/svelte"
import vue from "@astrojs/vue"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import type { Plugin } from "vite"

const packageRoots = {
  react: fileURLToPath(new URL("../../packages/react/", import.meta.url)),
  vue: fileURLToPath(new URL("../../packages/vue/", import.meta.url)),
}

const svelteLib = fileURLToPath(new URL("../../packages/svelte/src/lib/", import.meta.url))

/**
 * Registry sources import `@/lib/utils` (React, Vue) or `$lib/utils.js` (Svelte)
 * the way they will inside a user's app. Resolve them inside their own package.
 */
function registryAlias(): Plugin {
  return {
    name: "vinui:registry-alias",
    enforce: "pre",
    async resolveId(source, importer, options) {
      if (!importer) return null
      if (source.startsWith("$lib/") && importer.startsWith(svelteLib)) {
        return this.resolve(svelteLib + source.slice(5), importer, { ...options, skipSelf: true })
      }
      if (!source.startsWith("@/")) return null
      const root = Object.values(packageRoots).find((dir) => importer.startsWith(dir))
      if (!root) return null
      return this.resolve(root + source.slice(2), importer, { ...options, skipSelf: true })
    },
  }
}

/**
 * In dev, @vitejs/plugin-vue compiles `<script lang="ts">` with Vite's full
 * `oxc` config, including plugin-react's `jsx.refresh`, so Vue components that
 * call `use*()` get React Fast Refresh calls. The browser has the refresh
 * runtime; SSR does not, so give the server no-op stand-ins.
 */
const refreshGlobals = globalThis as {
  $RefreshReg$?: () => void
  $RefreshSig$?: () => <T>(type: T) => T
}
refreshGlobals.$RefreshReg$ ??= () => {}
refreshGlobals.$RefreshSig$ ??= () => (type) => type

export default defineConfig({
  integrations: [react(), vue(), svelte()],
  vite: {
    plugins: [registryAlias(), tailwindcss()],
    resolve: {
      dedupe: ["react", "react-dom", "vue", "svelte"],
    },
    // @vinui/svelte is a workspace link, so the Svelte integration doesn't see that its
    // bits-ui and its helpers ship .svelte / .svelte.js files; without this, dev SSR loads
    // them as plain Node modules.
    ssr: {
      noExternal: ["bits-ui", "runed", "svelte-toolbelt"],
    },
  },
})
