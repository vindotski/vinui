import postcss, { type ChildNode, type Container } from "postcss"

/** The shadcn registry `css` shape: selectors / at-rules → declarations or nested blocks. */
export interface CssObject {
  [key: string]: string | CssObject
}

/** Converts a CSS tree into the registry `css` object (bodiless at-rules become `{}`). */
export function toCssObject(nodes: ChildNode[]): CssObject {
  const out: CssObject = {}

  for (const node of nodes) {
    if (node.type === "decl") {
      out[node.prop] = node.important ? `${node.value} !important` : node.value
    } else if (node.type === "rule" || node.type === "atrule") {
      const key =
        node.type === "rule"
          ? node.selector
          : `@${node.name}${node.params ? ` ${node.params}` : ""}`
      const body = node.nodes ? toCssObject(node.nodes) : {}
      const existing = out[key]
      out[key] = typeof existing === "object" ? { ...existing, ...body } : body
    }
  }

  return out
}

export function parseCss(source: string, from: string) {
  return postcss.parse(source, { from })
}

/** Declarations of a block as cssVars entries (leading `--` stripped). */
export function toCssVars(container: Container) {
  const vars: Record<string, string> = {}
  container.each((node) => {
    if (node.type === "decl" && node.prop.startsWith("--")) {
      vars[node.prop.slice(2)] = node.value
    }
  })
  return vars
}
