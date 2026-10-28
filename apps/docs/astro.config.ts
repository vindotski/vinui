import { fileURLToPath } from "node:url"

import react from "@astrojs/react"
import vue from "@astrojs/vue"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import type { Plugin } from "vite"

const packageSrc = {
  react: fileURLToPath(new URL("../../packages/react/src/", import.meta.url)),
  vue: fileURLToPath(new URL("../../packages/vue/src/", import.meta.url)),
}

/**
 * Registry sources import `@/lib/utils` the way they will inside a user's app.
 * Resolve `@/` to the src dir of whichever package the import comes from.
 */
function registryAlias(): Plugin {
  return {
    name: "vinui:registry-alias",
    enforce: "pre",
    async resolveId(source, importer, options) {
      if (!source.startsWith("@/") || !importer) return null
      const src = Object.values(packageSrc).find((dir) => importer.startsWith(dir))
      if (!src) return null
      return this.resolve(src + source.slice(2), importer, { ...options, skipSelf: true })
    },
  }
}

export default defineConfig({
  integrations: [react(), vue()],
  vite: {
    plugins: [registryAlias(), tailwindcss()],
    resolve: {
      dedupe: ["react", "react-dom", "vue"],
    },
  },
})
