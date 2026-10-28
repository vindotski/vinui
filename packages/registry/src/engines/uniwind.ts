/**
 * Engine layer: Uniwind.
 *
 * Shapes @vinui/tailwind's theme for Uniwind, which needs per-theme variables
 * nested as `@layer theme { :root { @variant light { … } @variant dark { … } } }`.
 * The shadcn CLI can't write that nesting via `css`/`cssVars`, so the native
 * init ships the result as a file (docs/decisions/0006-native-theme-as-file.md).
 */
import { readFile } from "node:fs/promises"

import { parseCss, toCssVars } from "../css.ts"

export const UNIWIND_VERSION = "1.13.0"

/** theme.css (`:root`, `.dark`, `@theme inline`) → Uniwind theme CSS. */
export async function uniwindTheme(themeFile: string) {
  const ast = parseCss(await readFile(themeFile, "utf8"), themeFile)
  let light: Record<string, string> = {}
  let dark: Record<string, string> = {}
  let inline: Record<string, string> = {}

  for (const node of ast.nodes) {
    if (node.type === "rule" && node.selector === ":root") light = toCssVars(node)
    else if (node.type === "rule" && node.selector === ".dark") dark = toCssVars(node)
    else if (node.type === "atrule" && node.name === "theme") inline = toCssVars(node)
  }

  // Uniwind requires every theme to define the same variables; dark inherits
  // anything only :root sets (e.g. --radius).
  dark = { ...light, ...dark }
  const block = (vars: Record<string, string>, indent: string) =>
    Object.entries(vars)
      .map(([name, value]) => `${indent}--${name}: ${value};`)
      .join("\n")

  return `/* Generated from @vinui/tailwind (theme.css) for Uniwind. Do not edit. */
@layer theme {
  :root {
    @variant light {
${block(light, "      ")}
    }
    @variant dark {
${block(dark, "      ")}
    }
  }
}

@theme inline {
${block(inline, "  ")}
}
`
}
