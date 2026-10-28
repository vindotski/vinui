/** Stale-docs guard (Vue, runtime): documented props exist on the compiled components. */
import { buttonProps, dialogContentProps, dialogFooterProps, type PropDoc } from "@vinui/core"
import { Button } from "@vinui/vue/ui/button"
import { DialogContent, DialogFooter } from "@vinui/vue/ui/dialog"
import { describe, expect, test } from "vitest"

function vueNames(meta: readonly PropDoc[]) {
  return meta.filter((p) => p.platforms.includes("vue")).map((p) => p.names?.vue ?? p.name)
}

describe.each([
  ["Button", Button, buttonProps],
  ["DialogContent", DialogContent, dialogContentProps],
  ["DialogFooter", DialogFooter, dialogFooterProps],
] as const)("Vue %s", (_name, component, meta) => {
  test("declares every documented prop", () => {
    const declared = Object.keys((component as { props?: Record<string, unknown> }).props ?? {})
    expect(declared).toEqual(expect.arrayContaining(vueNames(meta)))
  })
})
