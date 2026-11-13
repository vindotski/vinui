/**
 * Stale-docs guard (Svelte): documented props exist on the components. Svelte 5
 * props have no runtime list, so read the names each component destructures
 * from `$props()` with Svelte's own parser.
 */
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { buttonProps, dialogContentProps, dialogFooterProps, selectTriggerProps, type PropDoc } from "@vinui/core"
import { parse } from "svelte/compiler"
import { describe, expect, test } from "vitest"

const ui = (file: string) => fileURLToPath(new URL(`../../packages/svelte/src/lib/registry/ui/${file}`, import.meta.url))

type Node = { type: string; [key: string]: unknown }

/** Keys of `let { a, b: c, ...rest } = $props()` in the instance script. */
function declaredProps(source: string): string[] {
  const ast = parse(source, { modern: true }) as unknown as { instance?: { content: Node } }
  const names: string[] = []
  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return
    const n = node as Node
    if (n.type === "VariableDeclarator") {
      const init = n.init as Node | undefined
      const callee = init?.type === "CallExpression" ? (init.callee as Node) : undefined
      const id = n.id as Node
      if (callee?.type === "Identifier" && callee.name === "$props" && id.type === "ObjectPattern") {
        for (const prop of id.properties as Node[]) {
          const key = prop.key as Node | undefined
          if (prop.type === "Property" && key?.type === "Identifier") names.push(key.name as string)
        }
      }
    }
    for (const value of Object.values(n)) {
      if (Array.isArray(value)) value.forEach(visit)
      else if (value && typeof value === "object") visit(value)
    }
  }
  visit(ast.instance?.content)
  return names
}

function svelteNames(meta: readonly PropDoc[]) {
  return meta.filter((p) => p.platforms.includes("svelte")).map((p) => p.names?.svelte ?? p.name)
}

describe.each([
  ["Button", "button/button.svelte", buttonProps],
  ["DialogContent", "dialog/dialog-content.svelte", dialogContentProps],
  ["DialogFooter", "dialog/dialog-footer.svelte", dialogFooterProps],
  ["SelectTrigger", "select/select-trigger.svelte", selectTriggerProps],
] as const)("Svelte %s", (_name, file, meta) => {
  test("declares every documented prop", () => {
    const declared = declaredProps(readFileSync(ui(file), "utf8"))
    expect(declared).toEqual(expect.arrayContaining(svelteNames(meta)))
  })
})

test("the helper itself reads $props() keys", () => {
  const source = `<script lang="ts">let { a, b: c, d = 1, ...rest } = $props()</script>`
  expect(declaredProps(source)).toEqual(["a", "b", "d"])
})
