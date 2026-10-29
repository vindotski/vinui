/**
 * Builds the docs' "React Native (web)" previews: the native playground's Expo web
 * export, served from public/native-preview/. Cached: it only re-exports when the
 * playground's inputs (source, installed components, CSS, config, lockfile) change.
 */
import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../../../", import.meta.url))
const app = join(root, "apps/playground-native")
const out = join(root, "apps/docs/public/native-preview")
const cacheKey = join(out, ".cache-key")
const BASE_URL = "/native-preview"

const inputs = [
  ...["App.tsx", "docs-preview.tsx", "index.ts", "global.css", "vinui-theme.css", "components", "lib"],
  ...["app.json", "app.config.js", "metro.config.js", "package.json"],
].map((path) => join(app, path))
inputs.push(join(root, "pnpm-lock.yaml"))

const files = (path: string): string[] =>
  statSync(path).isDirectory() ? readdirSync(path).sort().flatMap((name) => files(join(path, name))) : [path]

const hash = createHash("sha256").update(BASE_URL)
for (const file of inputs.flatMap(files)) hash.update(relative(root, file)).update(readFileSync(file))
const key = hash.digest("hex")

if (existsSync(cacheKey) && readFileSync(cacheKey, "utf8") === key) {
  console.log("native preview: up to date")
} else {
  console.log("native preview: exporting the native playground for web…")
  rmSync(out, { recursive: true, force: true })
  execFileSync("pnpm", ["exec", "expo", "export", "--platform", "web", "--output-dir", out], {
    cwd: app,
    stdio: "inherit",
    env: { ...process.env, EXPO_BASE_URL: BASE_URL },
  })
  writeFileSync(cacheKey, key)
}
