import { defineConfig } from "@playwright/test"

import type { TargetOptions } from "./specs/fixtures.ts"

/**
 * Browser specs run against every app, in dev and production builds.
 * Astro commands get --ignore-lock: it keeps `astro dev`/`astro preview` in the
 * foreground (both auto-background under AI agents), so Playwright can stop them.
 * The registry is built once by `test:e2e` before this runs; servers call astro
 * directly so two registry builds never race on the same output folder.
 * Set PLAYWRIGHT_CHROMIUM_EXECUTABLE to reuse an installed Chromium; otherwise
 * run `pnpm exec playwright install chromium` once.
 */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined

const targets: { name: string; port: number; command: string; options: TargetOptions }[] = [
  {
    name: "docs-dev",
    port: 4321,
    command: "pnpm --filter docs exec astro dev --port 4321 --ignore-lock",
    options: { layout: "docs", frameworks: ["react", "vue"] },
  },
  {
    name: "docs-prod",
    port: 4322,
    command: "pnpm --filter docs exec astro build && pnpm --filter docs exec astro preview --port 4322 --ignore-lock",
    options: { layout: "docs", frameworks: ["react", "vue"] },
  },
  {
    name: "react-dev",
    port: 4501,
    command: "pnpm --filter playground-react dev --port 4501 --strictPort",
    options: { layout: "playground", frameworks: ["react"] },
  },
  {
    name: "react-prod",
    port: 4401,
    command: "pnpm --filter playground-react build && pnpm --filter playground-react exec vite preview --port 4401 --strictPort",
    options: { layout: "playground", frameworks: ["react"] },
  },
  {
    name: "vue-dev",
    port: 4502,
    command: "pnpm --filter playground-vue dev --port 4502 --strictPort",
    options: { layout: "playground", frameworks: ["vue"] },
  },
  {
    name: "vue-prod",
    port: 4402,
    command: "pnpm --filter playground-vue build && pnpm --filter playground-vue exec vite preview --port 4402 --strictPort",
    options: { layout: "playground", frameworks: ["vue"] },
  },
  // vinui native on react-native-web (Expo universal apps).
  {
    name: "native-web-dev",
    port: 4601,
    command: "pnpm --filter playground-native exec expo start --web --port 4601",
    options: { layout: "playground", frameworks: ["native"] },
  },
  {
    name: "native-web-prod",
    port: 4602,
    command:
      "pnpm --filter playground-native exec expo export --platform web && pnpm --filter playground-native exec expo serve --port 4602",
    options: { layout: "playground", frameworks: ["native"] },
  },
]

export default defineConfig<TargetOptions>({
  testDir: "./specs",
  fullyParallel: true,
  reporter: "list",
  use: {
    launchOptions: { executablePath },
  },
  projects: targets.map((t) => ({
    name: t.name,
    use: { baseURL: `http://localhost:${t.port}`, ...t.options },
  })),
  webServer: targets.map((t) => ({
    command: t.command,
    url: `http://localhost:${t.port}`,
    cwd: "..",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  })),
})
