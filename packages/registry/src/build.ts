import { execFileSync } from "node:child_process"
import { existsSync, readdirSync } from "node:fs"
import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { REGISTRY_URL } from "./config.ts"
import { type CssObject, parseCss, toCssObject, toCssVars } from "./css.ts"

const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const root = resolve(pkgDir, "../..")
const tailwindSrc = join(root, "packages/tailwind/src")
const cacheDir = join(pkgDir, ".cache")
const outDir = join(root, "apps/docs/public/r")

const THEME_ITEM = "theme"
const INIT_ITEM = "init"
const NAMESPACE = "@vinui"

/**
 * Registry targets. Tokens go out as `cssVars` (the `theme` item).
 * `deps: "relative"` writes items in shadcn-svelte's shape (`forShadcnSvelte`):
 * it has no `registries` map, so `@vinui/<name>` becomes `./<name>.json` (ADR 0009). shadcn-svelte has no
 * `extends: "none"` base either, so its target has no `init` item.
 */
const targets = [
  { name: "react", cli: ["shadcn", "build"], pkg: join(root, "packages/react"), deps: "namespace", init: true },
  { name: "vue", cli: ["shadcn-vue", "build"], pkg: join(root, "packages/vue"), deps: "namespace", init: true },
  { name: "svelte", cli: ["shadcn-svelte", "registry", "build"], pkg: join(root, "packages/svelte"), deps: "relative", init: false },
] as const

interface RegistryItem {
  name: string
  type: string
  registryDependencies?: string[]
  cssVars?: Record<string, Record<string, string>>
  css?: CssObject
  [key: string]: unknown
}

interface Registry {
  items: RegistryItem[]
  [key: string]: unknown
}

/** theme.css → `theme` item: :root / .dark / @theme inline become cssVars, the rest goes to css. */
async function buildThemeItem(): Promise<RegistryItem> {
  const file = join(tailwindSrc, "theme.css")
  const ast = parseCss(await readFile(file, "utf8"), file)
  const cssVars: Record<string, Record<string, string>> = {}
  const rest: typeof ast.nodes = []

  for (const node of ast.nodes) {
    if (node.type === "rule" && node.selector === ":root") {
      cssVars.light = toCssVars(node)
    } else if (node.type === "rule" && node.selector === ".dark") {
      cssVars.dark = toCssVars(node)
    } else if (node.type === "atrule" && node.name === "theme") {
      cssVars.theme = toCssVars(node)
    } else {
      rest.push(node)
    }
  }

  return {
    name: THEME_ITEM,
    type: "registry:theme",
    title: "Theme",
    description: "vinui design tokens (colors, radius) and dark variant.",
    cssVars,
    css: toCssObject(rest),
  }
}

/**
 * `init` item for `shadcn init <url>` / `shadcn-vue init <url>`: a registry:base
 * that skips shadcn's own style (`extends: "none"`), registers the @vinui
 * namespace in components.json, and carries the theme inline (the namespace
 * does not resolve yet while init is running).
 */
function buildInitItem(theme: RegistryItem, target: string): RegistryItem {
  return {
    name: INIT_ITEM,
    type: "registry:base",
    extends: "none",
    title: "vinui",
    description: "Initialize a project with the vinui style.",
    config: {
      registries: { [NAMESPACE]: `${REGISTRY_URL}/${target}/{name}.json` },
    },
    registryDependencies: ["utils"],
    // shadcn-vue's `add` inserts `@import "tw-animate-css"` whenever an item
    // brings cssVars (our theme does), so the package must already be installed.
    ...(target === "vue" && { dependencies: ["tw-animate-css"] }),
    cssVars: theme.cssVars,
    css: theme.css,
  }
}

/** Attaches packages/tailwind/src/components/<name>.css to the matching ui item. */
async function withComponentCss(item: RegistryItem): Promise<RegistryItem> {
  const file = join(tailwindSrc, "components", `${item.name}.css`)
  if (item.type !== "registry:ui" || !existsSync(file)) return item

  const ast = parseCss(await readFile(file, "utf8"), file)
  const themeDep = `${NAMESPACE}/${THEME_ITEM}`
  const deps = item.registryDependencies ?? []

  return {
    ...item,
    registryDependencies: deps.includes(themeDep) ? deps : [themeDep, ...deps],
    css: toCssObject(ast.nodes),
  }
}

/**
 * shadcn-svelte's shape of an item:
 * - `@vinui/<name>` → `./<name>.json`, resolved by the CLI next to the item that lists it;
 * - `files` on every item (the theme has none), with absolute paths: its
 *   `registry build` reads them from the process cwd, ignoring `--cwd`.
 */
function forShadcnSvelte(item: RegistryItem, pkg: string): RegistryItem {
  const files = (item.files as { path: string }[] | undefined) ?? []
  return {
    ...item,
    files: files.map((file) => ({ ...file, path: join(pkg, file.path) })),
    registryDependencies: (item.registryDependencies ?? []).map((dep) =>
      dep.startsWith(`${NAMESPACE}/`) ? `./${dep.slice(NAMESPACE.length + 1)}.json` : dep,
    ),
  }
}

/**
 * Output that older builds left in apps/docs/public and nothing regenerates: registry
 * folders of retired targets (`r/native`), and the React Native preview (ADR 0011).
 * Both are gitignored, so a pull doesn't remove them, and Astro would keep serving
 * them. `docs` dev and build run this build first.
 */
async function removeRetiredOutput() {
  const current = new Set<string>(targets.map((target) => target.name))
  const stale = existsSync(outDir) ? readdirSync(outDir).filter((dir) => !current.has(dir)) : []
  for (const dir of stale) await rm(join(outDir, dir), { recursive: true, force: true })
  await rm(join(outDir, "../native-preview"), { recursive: true, force: true })
  if (stale.length) console.log(`Removed retired registry output: ${stale.join(", ")}`)
}

await removeRetiredOutput()
const theme = await buildThemeItem()
await mkdir(cacheDir, { recursive: true })

for (const target of targets) {
  const source = JSON.parse(
    await readFile(join(target.pkg, "registry.json"), "utf8"),
  ) as Registry
  const items = [
    ...(target.init ? [buildInitItem(theme, target.name)] : []),
    theme,
    ...(await Promise.all(source.items.map(withComponentCss))),
  ]
  const registry: Registry = {
    ...source,
    items: target.deps === "relative" ? items.map((item) => forShadcnSvelte(item, target.pkg)) : items,
  }

  const manifest = join(cacheDir, `${target.name}.registry.json`)
  const output = join(outDir, target.name)
  await writeFile(manifest, `${JSON.stringify(registry, null, 2)}\n`)
  await rm(output, { recursive: true, force: true })

  console.log(`\n▸ ${target.name}`)
  execFileSync(
    "pnpm",
    ["exec", ...target.cli, manifest, "--cwd", target.pkg, "--output", output],
    { cwd: pkgDir, stdio: "inherit" },
  )
}
