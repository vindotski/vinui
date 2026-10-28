import { fileURLToPath } from "node:url"

import vue from "@vitejs/plugin-vue"
import type { Plugin } from "vite"
import { defineConfig } from "vitest/config"

const packageRoots = [
  fileURLToPath(new URL("../packages/react/", import.meta.url)),
  fileURLToPath(new URL("../packages/vue/", import.meta.url)),
  fileURLToPath(new URL("../packages/native/", import.meta.url)),
]
const stub = (file: string) => fileURLToPath(new URL(`./stubs/${file}`, import.meta.url))

/** Registry sources import `@/…` the way they will in a user's app; resolve per package. */
function registryAlias(): Plugin {
  return {
    name: "vinui:registry-alias",
    enforce: "pre",
    async resolveId(source, importer, options) {
      if (!source.startsWith("@/") || !importer) return null
      const root = packageRoots.find((dir) => importer.startsWith(dir))
      if (!root) return null
      return this.resolve(root + source.slice(2), importer, { ...options, skipSelf: true })
    },
  }
}

export default defineConfig({
  plugins: [registryAlias(), vue()],
  resolve: {
    dedupe: ["react", "react-dom", "vue"],
    // Native components load in Node for class-logic tests only.
    alias: {
      "react-native": stub("react-native.ts"),
      "@rn-primitives/slot": stub("empty.ts"),
      uniwind: stub("empty.ts"),
    },
  },
  test: {
    include: ["parity/**/*.test.{ts,tsx}"],
    typecheck: {
      include: ["parity/**/*.test-d.ts"],
      tsconfig: "./tsconfig.json",
    },
  },
})
