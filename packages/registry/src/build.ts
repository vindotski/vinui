import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"
import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { type CssObject, parseCss, toCssObject, toCssVars } from "./css.ts"

const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const root = resolve(pkgDir, "../..")
const tailwindSrc = join(root, "packages/tailwind/src")
const cacheDir = join(pkgDir, ".cache")
const outDir = join(root, "apps/docs/public/r")

const THEME_ITEM = "theme"
const NAMESPACE = "@vinui"

const targets = [
  { name: "react", cli: "shadcn", pkg: join(root, "packages/react") },
  { name: "vue", cli: "shadcn-vue", pkg: join(root, "packages/vue") },
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

const theme = await buildThemeItem()
await mkdir(cacheDir, { recursive: true })

for (const target of targets) {
  const source = JSON.parse(
    await readFile(join(target.pkg, "registry.json"), "utf8"),
  ) as Registry
  const registry: Registry = {
    ...source,
    items: [theme, ...(await Promise.all(source.items.map(withComponentCss)))],
  }

  const manifest = join(cacheDir, `${target.name}.registry.json`)
  const output = join(outDir, target.name)
  await writeFile(manifest, `${JSON.stringify(registry, null, 2)}\n`)
  await rm(output, { recursive: true, force: true })

  console.log(`\n▸ ${target.name}`)
  execFileSync(
    "pnpm",
    ["exec", target.cli, "build", manifest, "--cwd", target.pkg, "--output", output],
    { cwd: pkgDir, stdio: "inherit" },
  )
}
