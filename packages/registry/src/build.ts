import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"
import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { REGISTRY_URL } from "./config.ts"
import { type CssObject, parseCss, toCssObject, toCssVars } from "./css.ts"
import { UNIWIND_VERSION, uniwindTheme } from "./engines/uniwind.ts"

const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const root = resolve(pkgDir, "../..")
const tailwindSrc = join(root, "packages/tailwind/src")
const cacheDir = join(pkgDir, ".cache")
const outDir = join(root, "apps/docs/public/r")

const THEME_ITEM = "theme"
const INIT_ITEM = "init"
const NAMESPACE = "@vinui"

/**
 * Registry targets. `theme` picks how tokens are delivered: web CLIs write
 * `cssVars`; the native engine needs a nested theme file (ADR 0006).
 */
const targets = [
  { name: "react", cli: "shadcn", pkg: join(root, "packages/react"), theme: "css-vars" },
  { name: "vue", cli: "shadcn-vue", pkg: join(root, "packages/vue"), theme: "css-vars" },
  { name: "native", cli: "shadcn", pkg: join(root, "packages/native"), theme: "uniwind-file" },
] as const

type Target = (typeof targets)[number]

/** Native theme file name, written next to global.css in the user's project. */
const NATIVE_THEME_FILE = "vinui-theme.css"

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
  if (target === "native") {
    return {
      name: INIT_ITEM,
      type: "registry:base",
      extends: "none",
      title: "vinui",
      description: "Initialize an Expo app with the vinui style (Uniwind).",
      config: {
        registries: { [NAMESPACE]: `${REGISTRY_URL}/${target}/{name}.json` },
      },
      registryDependencies: ["utils"],
      // Setup prerequisites are pinned here, never on component items (docs/CONVENTIONS.md).
      dependencies: [`uniwind@${UNIWIND_VERSION}`, "tailwindcss@4.3.3"],
      files: theme.files,
      css: theme.css,
    }
  }
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

/**
 * Native `theme` item: the Uniwind-shaped theme as a file at the project root,
 * plus an `@import` of it in global.css (the CLI can't write the nesting itself).
 */
async function buildNativeThemeItem(target: Target): Promise<RegistryItem> {
  const generated = join(target.pkg, ".generated", NATIVE_THEME_FILE)
  await mkdir(dirname(generated), { recursive: true })
  await writeFile(generated, await uniwindTheme(join(tailwindSrc, "theme.css")))
  return {
    name: THEME_ITEM,
    type: "registry:item",
    title: "Theme",
    description: "vinui design tokens (colors, radius) for Uniwind, light and dark.",
    files: [{ path: `.generated/${NATIVE_THEME_FILE}`, type: "registry:file", target: `~/${NATIVE_THEME_FILE}` }],
    css: { [`@import "./${NATIVE_THEME_FILE}"`]: {} },
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

const webTheme = await buildThemeItem()
await mkdir(cacheDir, { recursive: true })

for (const target of targets) {
  const theme = target.theme === "uniwind-file" ? await buildNativeThemeItem(target) : webTheme
  const source = JSON.parse(
    await readFile(join(target.pkg, "registry.json"), "utf8"),
  ) as Registry
  const registry: Registry = {
    ...source,
    items: [
      buildInitItem(theme, target.name),
      theme,
      ...(await Promise.all(source.items.map(withComponentCss))),
    ],
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
