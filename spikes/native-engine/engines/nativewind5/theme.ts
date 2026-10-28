// Engine layer: NativeWind 5 (harness only). NativeWind rejects `.dark` selectors on
// native, so dark tokens go in a prefers-color-scheme media query.
import { readFile } from "node:fs/promises"

import { parseCss, toCssVars } from "../../../../packages/registry/src/css.ts"

export async function theme(themeFile: string) {
  const ast = parseCss(await readFile(themeFile, "utf8"), themeFile)
  const pick = (sel: string) => {
    for (const n of ast.nodes) if (n.type === "rule" && n.selector === sel) return toCssVars(n)
    return {}
  }
  let inline: Record<string, string> = {}
  for (const n of ast.nodes) if (n.type === "atrule" && n.name === "theme") inline = toCssVars(n)
  const block = (v: Record<string, string>, i: string) =>
    Object.entries(v).map(([k, x]) => `${i}--${k}: ${x};`).join("\n")
  return `:root {\n${block(pick(":root"), "  ")}\n}\n\n@media (prefers-color-scheme: dark) {\n  :root {\n${block(pick(".dark"), "    ")}\n  }\n}\n\n@theme inline {\n${block(inline, "  ")}\n}\n`
}
